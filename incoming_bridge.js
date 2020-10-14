var express = require("express");
var bodyParser = require("body-parser");
var crypto = require('crypto');
var events = require('events');
var eventEmitter = new events.EventEmitter();
var app = express();
var enxVoice = require("./libs/enxVoiceLib");
var config = require("./config");
var utils = require("./utils/utils");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

var server = app.listen(config.port, () => {
    console.log("Server running on port " + config.port);
    enxVoice.init(config.app_id, config.app_key);
    eventEmitter.on('voicestateevent', voiceeventhandler);
});


app.post("/event", (req, res, next) => {
  enxVoice.decryptpacket(req, function(response) {
      if(response !== null) {
        eventEmitter.emit('voicestateevent', response);
      } else {
        console.error("["+voice_id+"] Not able to parse the message");
      }
      res.statusCode = 200;
      res.send();
      res.end();
  });
});

let voice_id = '';
let retrycount = 0;
var voiceeventhandler = function(voiceevent) {
  if(voiceevent.state) { 
    if(voiceevent.state === 'incomingcall') {
      voice_id = voiceevent.voice_id;
      console.log("["+voice_id+"] Received incoming call from " + voiceevent.from);
    } else if(voiceevent.state === 'bridged') {
      console.log("["+voice_id+"] forwarded call to " + config.forward + " answered.");
      setTimeout(disconnectcall, 5000);
    } else if(voiceevent.state === 'disconnected') {
      console.log ("["+voice_id+"] call disconnected");
      shutdown();
    }
  } if(voiceevent.playstate && voiceevent.playstate === 'playfinished') {
    if(voiceevent.prompt_ref === 'welcome-prompt') {
      console.log("["+voice_id+"] forwarding call to " + config.forward);
      utils.forwardcall(voice_id, function(ret) {
        if(ret === false) {
          console.log("["+voice_id+"] call forward to " + config.forward + " failed");
          disconnectcall();
          shutdown();
        }
      });
    } else {
      utils.playprompts(voice_id, function(ret) {
        if(ret === false) {
          console.log("["+voice_id+"] play prompt failed failed");
          disconnectcall();
        }
      });
    }
  }
};

var disconnectcall = function() {
  enxVoice.hangupcall({voice_id:voice_id}, function(ret, response) {
    console.log("Disconnecting the call " + voice_id);
    shutdown(); 
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


