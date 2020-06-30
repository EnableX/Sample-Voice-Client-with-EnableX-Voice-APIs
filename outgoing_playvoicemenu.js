var express = require("express");
var bodyParser = require("body-parser");
var events = require('events');
var eventEmitter = new events.EventEmitter();
var app = express();
var ngrok = require('ngrok');
var enxVoice = require("./libs/enxVoiceLib");
var config = require("./config");
var utils = require("./utils/utils");
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
        console.error("Error happened while trying to connect via ngrock " + JSON.stringify(error));
        shutdown();
    }
    url = url+'/events';

  enxVoice.init(config.app_id, config.app_key);
  enxVoice.initiatecall({to:config.to, from:config.from, app_name:config.app_name, event_url:url
                      }, function(retcode, response) {
    if(retcode === true) {
        let msg = JSON.parse(response);
        if(msg.status === "failed") {
            console.error("Failed to make outbound call error: "  + response);
            shutdown();
        } else {
            eventEmitter.on('voicestateevent', voiceeventhandler);
            console.log("["+msg.voice_id+"] Successfully initiated call to " + config.to);
            voice_id = msg.voice_id;
        }
    } else {
        console.error("Making an outbound call to " + config.to + "falied, error response: " + JSON.stringify(response));
    }});
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

let retrycount = 0;
var voiceeventhandler = function(voiceevent) {
  if(voiceevent.state !== undefined) {
    if(voiceevent.state === 'connected') {
      console.log("["+voice_id+"] call is established with " + config.to);
    } if (voiceevent.state == 'disconnected') {
      console.log ("["+voice_id+"] call disconnected");
      shutdown();
    }
  } else if(voiceevent.playstate && voiceevent.playstate === 'playfinished') {
    if(voiceevent.prompt_ref === "timeout") {
        if(retrycount === 3) {
            console.log ("["+voice_id+"] playing the max retry reached!!!");
            utils.playmaxretryreached(voice_id, function(ret) {
                if(ret === false) {
                    console.error("["+voice_id+"] Failed to play prompt");
                    disconnectcall();
                    shutdown();
                }
            });
        } else {
            retrycount++;
            console.log ("["+voice_id+"] Playing voice menu again");
            utils.playvoicemenu(voice_id, function(ret) {
            if(ret === false) {
                console.error("["+voice_id+"] Failed to play prompt");
                shutdown();
            }
            });
        }
      } else if(voiceevent.prompt_ref ==='maxretryrech') {
          disconnectcall();
          shutdown();
      }else {
        console.log ("["+voice_id+"] Playing voice menu");
        retrycount++;
        utils.playvoicemenu(voice_id, function(ret) {
        if(ret === false) {
            console.error("["+voice_id+"] Failed to play prompt");
            shutdown();
          }
        });
      }
  } else if(voiceevent.playstate === 'digitcollected' && voiceevent.prompt_ref === 'voice_menu') {
    console.log ("["+voice_id+"] voice menu digit collected, disconnecting the call");
    disconnectcall(); 

  } else if(voiceevent.playstate === 'menutimeout' && voiceevent.prompt_ref === 'voice_menu') {
    console.log ("["+voice_id+"] Playing menu timeout prompt");
    utils.playtimeoutprompts(voice_id, function(ret) {
        if(ret === false) {
            console.error("["+voice_id+"] Failed to play prompt");
            shutdown();
        }
    });
  } else if(voiceevent.playstate && voiceevent.playstate === 'initiated') {
    console.log ("["+voice_id+"] Play initiated, [play_id] " + voiceevent.play_id);
  } else {
    console.log ("["+voice_id+"] Unknown event received");
  }
}
  
var disconnectcall = function() {
    enxVoice.hangupcall({voice_id:voice_id}, function(ret, response) {
        console.log("Disconnecting the call " + voice_id);
  });
};


var shutdown = function() {
    server.close(() => {
        console.error('Shutting down the server');
        process.exit(0);
    });
    setTimeout(() => {
        process.exit(1);
    }, 10000);
};
