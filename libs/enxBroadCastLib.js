const http = require('http');
var app_id = null, app_key = null, app_name = null;
var voice_url = 'localhost';
var base_url = '/voice/v1/broadcast';
var call_url = '/voice/v1/call'
var crypto = require('crypto');

exports.init = function(appid, appkey) {
  app_id = appid;
  app_key = appkey;
}


/* initiates a call.
* @params {from: enxphone number, to: terminating number}
*/
exports.initiatecall = function(params, callback){
    console.log("initiateCall Params " + JSON.stringify(params));
    if(params.broadcast_numbers_json === undefined ){ 
        callback(false, "broadcast  numbers is undefined");
        return;
    }
    if(params.from === undefined ){
        callback(false, "From number is undefined");
        return;
    }
    if(params.event_url === undefined ){
        callback(false, "WebHook URL is undefined");
        return;
    }

    var data = {
        "applicationName": params.app_name,
        "broadcastnumbersjson": params.broadcast_numbers_json,
        "from": params.from,
        "event_url": params.event_url,
        "callhandler_url":params.callHandler_url,
        "call_param": {
            "intervalBetweenRetries":params.IntervalBetweenRetries,
            "numberOfRetries":params.NumberOfRetries
        }
    };
    if(params.owner_ref != undefined) 
      data['owner_ref'] = params.owner_ref;

    var postData = JSON.stringify(data);
    makeVoiceAPICall(base_url, 'POST', postData, function(response){
      callback(true, response)
    });
};


exports.initatecall_playprompt = function(params, callback){
    var action = {};
    if(params.to === undefined ){ 
        callback(false, "To number is undefined");
        return;
    }
    if(params.from === undefined ){
        callback(false, "From number is undefined");
        return;
    }
    if(params.event_url === undefined ){
        callback(false, "WebHook URL is undefined");
        return;
    }
    if(params.prompt_name !== undefined){
        action["play"] = {};
        action.play["prompt_name"] = params.prompt_name;
    } else {
        callback(false, "prompt_name is undefined");  
    }

    
    var data = {
        "name": app_name,
        "to": params.to,
        "from": params.from,
        "action_on_connect": action,
        "event_url": params.event_url
    };
    
    if(params.owner_ref != undefined) 
      data['owner_ref'] = params.owner_ref;

    var postData = JSON.stringify(data);
    makeVoiceAPICall(base_url, 'POST', postData, function(response){
      callback(true, response)
    });
};


exports.initatecall_playtext = function(params, callback){
    var action = {};
    if(params.to === undefined ){ 
        callback(false, "To number is undefined");
        return;
    }
    if(params.from === undefined ){
        callback(false, "From number is undefined");
        return;
    }
    if(params.event_url === undefined ){
        callback(false, "WebHook URL is undefined");
        return;
    }

    if(params.text !== undefined) {
        action["play"] = {};
        action.play["text"] = params.text;
        if(params.voice !== undefined)
            action.play["voice"] = params.voice;
        else
            callback(false, "voice parameter is undefined");
        if(params.language !== undefined)
            action.play["language"] = params.language;
        else
            callback(false, "language parameter is undefined");
            return;
    } else {
        callback(false, "text is undefined");
        return;  
    }

    
    var data = {
        "name": app_name,
        "to": params.to,
        "from": params.from,
        "action_on_connect": action,
        "event_url": params.event_url
    };
    if(params.owner_ref != undefined) 
      data['owner_ref'] = params.owner_ref;

    var postData = JSON.stringify(data);
    makeVoiceAPICall(base_url, 'POST', postData, function(response){
      callback(true, response)
    });
};



exports.playvoicemenu = function(params, callback){
    console.log("LIB playvoicemenu " + JSON.stringify(params));
    var action = {};
    if(params.voice_id === undefined)
        callback(false, "voice_id is undefined");
    action["voice_id"] = params.voice_id;
    action["play"] = {};
    action.play["dtmf"] = true;
    action.play["interrupt"] = false;

    if(params.text !== undefined){
        action.play["text"] = params.text;
        if(params.voice !== undefined)
            action.play["voice"] = params.voice;
        else
            callback(false, "voice parameter is undefined");
        if(params.language !== undefined)
            action.play["language"] = params.language;
        else
            callback(false, "language parameter is undefined");
        if(params.prompt_ref != undefined) 
          action.play['prompt_ref'] = params.prompt_ref;
    } else if(params.prompt_name !== undefined){
        action.play["prompt_name"] = params.prompt_name;
        if(params.prompt_ref != undefined) 
          action.play['prompt_ref'] = params.prompt_ref;
    } else {
        callback(false, "prompt_name/text is undefined");  
    }

    var postData = JSON.stringify(action);
    console.log("playvoicemenu Data " + postData);
    var path = base_url + '/' + params.broadcast_id;
    makeVoiceAPICall(path, 'POST', postData, function(response){
      callback(true, response);
    }); 
};

exports.playprompts = function(params, callback){

    var action = {};
    
    if(params.voice_id === undefined)
        callback(false, "voice_id is undefined");
    action["voice_id"] = params.voice_id;
    action.play = {};
    if(params.text !== undefined) {
        action.play["text"] = params.text;
        if(params.voice !== undefined)
            action.play["voice"] = params.voice;
        else
            callback(false, "voice parameter is undefined");
        if(params.language !== undefined)
            action.play["language"] = params.language;
        else
            callback(false, "language parameter is undefined");
        if(params.prompt_ref != undefined) 
          action.play['prompt_ref'] = params.prompt_ref;
    } else if(params.prompt_name !== undefined){
        action.play["prompt_name"] = params.prompt_name;
        if(params.prompt_ref != undefined) 
          action.play['prompt_ref'] = params.prompt_ref;
    } else {
        callback(false, "prompt_name/text is undefined");  
    }
    

    var postData = JSON.stringify(action);
    var path = base_url + '/' + params.broadcast_id;;
    makeVoiceAPICall(path, 'POST', postData, function(response){
      callback(true, response);
    }); 
};

exports.forwardcall = function(params, callback){

    if(params.voice_id === undefined)
        callback(false, "voice_id is undefined");

    if(params.to === undefined)
        callback(false, "connect_num is undefined");

    if(params.from === undefined)
        callback(false, "from number is undefined in config");
  
    let connectCommand = JSON.stringify({
	"voice_id":params.voice_id,
        "connect":{
            "from": params.from,
            "to": params.to
        }
    });

    var path = base_url + '/' + params.broadcast_id;;
    makeVoiceAPICall(path, 'POST', connectCommand, function(response){
        callback(true, response);
    }); 
};

exports.hangupcall = function(params, callback){

    if(params.voice_id === undefined)
        callback(false, "voice_id is undefined")

    var path = call_url + '/' + params.voice_id;
    makeVoiceAPICall(path, 'DELETE', undefined, function(response){
        callback(true, response);
    });
};

exports.startrecord = function(params, callback) {
    if(params.voice_id === undefined)
        callback(false, "voice_id is undefined");
    let options = {};
    options["record"] = {};
    options.record["start"] = true;
    if(params.recording_name !== undefined)
        options.record["recording_name"] = params.recording_name;

    var recordCommand = JSON.stringify(options);
    var path = base_url + '/' + params.voice_id;
    makeVoiceAPICall(path, 'POST', recordCommand, function(response){
        callback(true, response);
    });
};


exports.stoprecord = function(params, callback) {
    if(params.voice_id === undefined)
        callback(false, "voice_id is undefined");
    let options = {};
    options["record"] = {};
    options.record["stop"] = true;
    var recordCommand = JSON.stringify(options);
    var path = base_url + '/' + params.voice_id;
    makeVoiceAPICall(path, 'POST', recordCommand, function(response){
        callback(true, response);
    });
};

var makeVoiceAPICall = function(voice_path, method, postData, callback){
    let options = {
        host:voice_url,
        port: 8098,
        path: voice_path,
        method: method,
        headers: {
            'Authorization': 'Basic ' + new Buffer.from(app_id + ':' + app_key).toString('base64'),
            'Content-Type': 'application/json',
        }
    };

    if(postData !== undefined)
        options.headers['Content-Length'] = postData.length;
        let req = http.request(options, function(res) {
        var body = "";
        res.on('data', function(data) {
            body += data;
        });
        res.on('end', function() {
            callback(body);
        });
        res.on('error', function(e) {
            console.error("Got error: " + e.message);
        });
    });
    if(postData !== undefined)
        req.write(postData);
    req.end();
};

exports.decryptpacket = function(req, callback) {
   try {
    if(req.body) {
      var key = crypto.createDecipher(req.headers['x-algoritm'], app_id);
      var decryptedData = key.update(req.body['encrypted_data'], req.headers['x-format'], req.headers['x-encoding']);
      decryptedData += key.final(req.headers['x-encoding']);
      let voice_event = JSON.parse(decryptedData);
      callback(voice_event);
    } else
      callback(null);
  } catch (e) {
    console.log('failed in decrypting the payload ' + e);
    callback(null);
  }
};
