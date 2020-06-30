var express = require("express");
var bodyParser = require("body-parser");
var events = require('events');
var eventEmitter = new events.EventEmitter();
var app = express();
var ngrok = require('ngrok');
var enxVoice = require("./libs/enxVoiceLib");
var config = require("./config");
var utils = require('./utils/utils');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

var voice_id = '';
var url = '';
var server = app.listen(config.port, () => {
    console.log("Server running on port " + config.port);
    (async function() {
    try {
        url = await ngrok.connect(
                              {proto : 'http',
                               addr : config.port});
        console.log('ngrok tunnel set up:', url);
    } catch(error) {
        console.log("Error happened while trying to connect via ngrock " + JSON.stringify(error));
        shutdown();
    }
    url = url+'/events';
    enxVoice.init(config.app_id, config.app_key);
    enxVoice.initiatecall({to:config.to, from:config.from, app_name:config.app_name, event_url:url
                      }, function(retcode, response) {
      if(retcode === true) {
            eventEmitter.on('voicestateevent', voiceeventhandler);
            let msg = JSON.parse(response);
            voice_id = msg.voice_id; 
            console.log("[" + voice_id+"] Successfully initiated call to " + config.to);
      } else {
            console.log("Making an outbound call to " + config.to + "falied, error response: " + JSON.stringify(response));
      }
    });
})(); 
});

app.post("/events", (req, res, next) => {
  enxVoice.decryptpacket(req, function(response) {
    if(response !== null) {
      eventEmitter.emit('voicestateevent', response);
    } else {
      console.error("["+voice_id+"] Not able to decrypt the message");
    }
    res.statusCode = 200;
    res.send();
    res.end();
  });
});


var voiceeventhandler = function(voiceevent) {
  if(voiceevent.state !== undefined) {
    if(voiceevent.state === 'connected') {
      console.log("["+voice_id+"] call is established with " + config.to);
    } if (voiceevent.state == 'disconnected') {
      console.log ("["+voice_id+"] call disconnected");
      shutdown();
    }
  } if(voiceevent.state === 'bridged') {
    console.log("["+voice_id+"] forwarded call to " + config.forward + " answered.");
    setTimeout(disconnectcall, 5000);
  } if(voiceevent.playstate && voiceevent.playstate === 'playfinished') {
    if(voiceevent.prompt_ref === 'welcome-prompt') {
      console.log("["+voice_id+"] welcome-prompt, play finished !!!");
      console.log("["+voice_id+"] forwarding call to " + config.forward);
      let connect = {voice_id:voice_id, from:config.from, to:config.forward};
      enxVoice.forwardcall(connect, function(ret, response) {
        let msg = JSON.parse(response);
        if(msg.status === 'failed') {
          console.log("["+voice_id+"] call forward to " + config.forward + " failed");
          disconnectcall();
        }
      });
    } else {
      let playtext = {voice_id:voice_id, text:config.text, language:'en-IN',voice:'female', prompt_ref:'welcome-prompt'};
      enxVoice.playprompts(playtext, function(ret, response) {
        let msg = JSON.parse(response);
        if(msg.status === 'failed') {
          console.log("["+voice_id+"] play prompt failed failed");
          disconnectcall();
        }
      });
    }
  }
};

var disconnectcall = function() {
  enxVoice.hangupcall({voice_id:voice_id}, function(ret, response) {
    console.log("["+voice_id+"]  Disconnecting the call ");
  });
}

var shutdown = function() {
    server.close(() => {
        console.error('Shutting down the server');
        process.exit(0);
    });
    setTimeout(() => {
        process.exit(1);
    }, 10000);
};
