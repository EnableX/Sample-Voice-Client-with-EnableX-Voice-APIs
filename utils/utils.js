var config = require("../config");
var enxVoice = require("../libs/enxVoiceLib");


exports.playtimeoutprompts = function(voice_id, callback) {
    let timeout = {voice_id:voice_id, text:config.timeout, language:'en-IN',voice:'female', prompt_ref:'timeout'};
    enxVoice.playprompts(timeout, function(ret, response) {
    if(ret === true) {
        let msg = JSON.parse(response);
        if(msg.status === "failed") {
            console.error("["+voice_id+"] Failed to play prompt");
            callback(false);
            return;
        }
    } else {
        console.error("["+voice_id+"] Failed to play prompt");
        callback(false);
        return;
    }
    callback(true);
    });
}


exports.playvoicemenu = function(voice_id, callback) {
    let menu = {voice_id:voice_id, text:config.voicemenu, language:config.language,voice:config.voice, prompt_ref:'voice_menu'};
    enxVoice.playvoicemenu(menu, function(ret, response) {
    if(ret === true) {
        let msg = JSON.parse(response);
        if(msg.status === "failed") {
            console.error("["+voice_id+"] Failed to play voice menu");
            callback(false);
            return;
        }
    } else {
        console.error("["+voice_id+"] Failed to play voice menu");
        callback(false);
        return;
    }
    callback(true);
    });
}


exports.playmaxretryreached = function(voice_id, callback) {
    let maxretry  = {voice_id:voice_id, text:config.maxretriesreached, language:'en-IN',voice:'female', 
                  prompt_ref:'maxretryreach'};
    enxVoice.playprompts(maxretry, function(ret, response) {
    let msg = JSON.parse(response);
    if(msg.status === "failed") {
        console.error("["+voice_id+"] Failed to play voice menu");
        callback(false);
        return;
    }
    callback(true);
    });
}



exports.forwardcall = function(voice_id, callback) {
    let connect = {voice_id:voice_id, from:config.from, to:config.forward};
    enxVoice.forwardcall(connect, function(ret, response) {
    let msg = JSON.parse(response);
    if(ret === false || msg.status === "failed") {
        console.error("["+voice_id+"] Failed to play voice menu");
        callback(false);
        return;
    }
    callback(true);
    });
};


exports.playprompts = function(voice_id, callback) {
    let playtext = {voice_id:voice_id, text:config.text, language:'en-IN',voice:'female', prompt_ref:'welcome-prompt'};
    enxVoice.playprompts(playtext, function(ret, response) {
    let msg = JSON.parse(response);
    if(ret === false || msg.status === "failed") {
        console.error("["+voice_id+"] Failed to play voice menu");
        callback(false);
        return;
    }
    callback(true);
    });
}
