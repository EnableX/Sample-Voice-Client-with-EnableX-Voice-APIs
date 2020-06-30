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
    eventEmitter.emit('voicestateevent', req.body);
    res.statusCode = 200;
    res.send();
    res.end();
});

let voice_id = '';
let retrycount = 0;
var voiceeventhandler = function(voiceevent) {
  if(voiceevent.state !== undefined) {
    if(voiceevent.state === 'incomingcall') {
      voice_id = voiceevent.voice_id;
      console.log("["+voice_id+"] Received incoming call from " + voiceevent.from);
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


