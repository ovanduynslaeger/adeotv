var request = require('request');
var KODI_USER= process.env.KODI_USER;
var KODI_PASSWORD= process.env.KODI_PASSWORD;
var KODI_PASSWORD= process.env.KODI_PASSWORD;
var KODI_PORT= process.env.KODI_PORT;
var LOCAL_DIR= process.env.LOCAL_DIR;
var timeout=2000;


/*
try {
    // the synchronous code that we want to catch thrown errors on
    var err = new Error('example')
    throw err
} catch (err) {
    // handle the error safely
    console.log(err)
}
*/



// PING
exports.ping = function(ip,cb) {
    var url = buildUrl(ip,'{ "jsonrpc": "2.0", "method": "JSONRPC.Ping", "id": 1 }');
    request({
      uri: url,
      method: "GET",
      timeout: 2000,
      followRedirect: true,
      maxRedirects: 10
    }, function(error, response, body) {
        if (error) {
          cb("off");
        } else {
           isPlaying(ip,function(result) {
               if (result==1) {
                   cb("lecture");
               } else {
                   cb("on");
               }
           });
        }
    });
};


// Get PlayList files
exports.getPlayListItems = function (ip,cb) {
    console.log("on getPlayListItems");
    var url = buildUrl(ip,'{ "jsonrpc": "2.0", "method": "PlayList.getItems", "params": { "playlistid" : 1,"properties":["file"]}, "id": 1 }');
    request({
      uri: url,
      method: "GET",
      timeout: 2000,
      followRedirect: true,
      maxRedirects: 10
    }, function(error, response, body) {
        if (error) {
           //cb(error.code);
           cb([]);
        } else {
            //OK
	    var bd=JSON.parse(body);
            var result=[];
	    if (bd.result.items!=null) {
            for (var i=0; i<bd.result.items.length; i++) {
                var item=bd.result.items[i].file;
                var slash = item.lastIndexOf("/")+1;
                result[i]=item.substring(slash,item.length);
            }
		}
            cb(result);
        }
    });
}

// Get PlayList files
exports.addItemPlaylist = function (ip,items,cb) {
    console.log("on addItemPlaylist");
    //http://192.168.0.16:9080/jsonrpc?request={ " jsonrpc" : " 2.0" , " id" :1," method" : " Playlist.Add" , " params" : {" playlistid"  : 1," item"  : [{" file" :" smb://DNS-325/Volume_1/movie/_Action/Backdraft/Backdraft.1991.720p.HDDVD.x264.5.1French.mkv" },{" file" :" smb://DNS-325/Volume_1/movie/_Action/Backdraft/Backdraft.1991.720p.HDDVD.x264.5.1French.mkv" }]}}
    var content = "";
    for (var i=0; i<items.length; i++) {
        if (i>0) content = content+","
        content = content + '{"file":"'+ LOCAL_DIR + items[i] + '"}';
    }

    var url = buildUrl(ip,'{ "jsonrpc" : "2.0" , "id" :1,"method" : "Playlist.Add" , "params" : {"playlistid"  : 1,"item"  : ['+content+']}}');
    request({
      uri: url,
      method: "GET",
      timeout: 2000,
      followRedirect: true,
      maxRedirects: 10
    }, function(error, response, body) {
        if (error) {
           cb(error.code);
           //cb([]);
        } else {
           //OK 
	   var bd=JSON.parse(body);
           cb(bd.result);
        }
    });
}

// PLAY
exports.playPlaylist = function (ip,cb) {
    var url = buildUrl(ip,'{ "jsonrpc": "2.0", "id":1,"method": "Player.Open", "params": {"item" : {"playlistid" : 1},"options":{"repeat":"all"}}}');
    request({
      uri: url,
      method: "GET",
      timeout: timeout,
      followRedirect: true,
      maxRedirects: 10
    }, function(error, response, body) {
        if (error) {
           cb(error.code);
        } else {
           //OK 
	  var bd=JSON.parse(body);
          cb(bd.result);
        }
    });
}

exports.clearPlaylist = function (ip,cb) {
    var url = buildUrl(ip,'{"jsonrpc":"2.0","id":"1","method":"Playlist.Clear","params":{"playlistid":1}}');
    request({
      uri: url,
      method: "GET",
      timeout: timeout,
      followRedirect: true,
      maxRedirects: 10
    }, function(error, response, body) {
        if (error) {
           cb(error.code);
        } else {
           //OK 
	   var bd=JSON.parse(body);
           cb(bd.result);
        }
    });
}


// STOP
exports.stopPlaylist = function (ip,cb) {
    var url = buildUrl(ip,'{"jsonrpc":"2.0","id":"1","method":"Player.Stop","params":{"playerid":1}}');
    request({
      uri: url,
      method: "GET",
      timeout: timeout,
      followRedirect: true,
      maxRedirects: 10
    }, function(error, response, body) {
        if (error) {
           cb(error.code);
        } else {
           //OK 
	   var bd=JSON.parse(body);
           console.log("result ="+bd.result);
           cb(bd.result);
        }
    });
}

// isPlaying
function isPlaying(ip,cb) {
    var url = buildUrl(ip,'{"jsonrpc":"2.0","id":"1","method":"Player.GetActivePlayers"}');
    request({
      uri: url,
      method: "GET",
      timeout: timeout,
      followRedirect: true,
      maxRedirects: 10
    }, function(error, response, body) {
        if (error) {
           cb(error.code);
        } else {
           //body={"id":1,"jsonrpc":"2.0","result":[{"playerid":1,"type":"video"}]};
           //{"id":1,"jsonrpc":"2.0","result":[]}
    	   var bd=JSON.parse(body);
    	   if (bd.result) {
                  cb(bd.result.length);
    	   } else {
      	      cb(0);
     	   }
        }
    });
}

exports.isMuted = function(ip,cb) {
    //{"id":1,"jsonrpc":"2.0","result":{"muted":false}}
    var url = buildUrl(ip,'{"jsonrpc": "2.0", "method": "Application.GetProperties", "params": {"properties": ["muted"]}, "id": 1}');
    request({
      uri: url,
      method: "GET",
      timeout: timeout,
      followRedirect: true,
      maxRedirects: 10
    }, function(error, response, body) {
        if (error) {
           //console.log(error.code);
           //cb(error.code);
           cb('undefined');
           //cb('on');
        } else {
           //body={"id":1,"jsonrpc":"2.0","result":[{"playerid":1,"type":"video"}]};
           //{"id":1,"jsonrpc":"2.0","result":[]}
    	   var bd=JSON.parse(body);
    	   if (bd.result) {
              if (bd.result.muted)
               cb('on');
              else
               cb('off');
    	   } else {
      	      cb('off');
     	   }
        }
    });
}


exports.setMute = function(ip,value,cb) {
    var url = buildUrl(ip,'{"jsonrpc": "2.0", "method": "Application.SetMute", "params": {"mute": '+value+'}, "id": 1}');
    request({
      uri: url,
      method: "GET",
      timeout: timeout,
      followRedirect: true,
      maxRedirects: 10
    }, function(error, response, body) {
        if (error) {
           cb(error.code);
        } else {
           //body={"id":1,"jsonrpc":"2.0","result":[{"playerid":1,"type":"video"}]};
           //{"id":1,"jsonrpc":"2.0","result":[]}
    	   var bd=JSON.parse(body);
    	   if (bd.result) {
              cb(bd.result);
    	   } else {
      	      cb(value);
     	   }
        }
    });
}

//Play one file
exports.playOneFile = function (ip,file,cb) {
    var url = buildUrl(ip,'{"jsonrpc":"2.0","id":"1","method":"Player.Open","params":{"item":{"file":"'+file+'"}}}');
    request({
      uri: url,
      method: "GET",
      timeout: timeout,
      followRedirect: true,
      maxRedirects: 10
    }, function(error, response, body) {
        if (error) {
           cb(error.code);
        } else {
           //OK 
	   var bd=JSON.parse(body);
           console.log("result ="+bd.result);
           cb(bd.result);
        }
    });
}

exports.reboot = function (ip,cb) {
    var url = buildUrl(ip,'{"jsonrpc":"2.0","id":"1","method":"System.Reboot"}');
    request({
      uri: url,
      method: "GET",
      timeout: timeout,
      followRedirect: true,
      maxRedirects: 10
    }, function(error, response, body) {
        if (error) {
           cb(error.code);
        } else {
           //OK 
    	   var bd=JSON.parse(body);
           console.log("result ="+bd.result);
           cb(bd.result);
        }
    });
}


// Private
function buildUrl(ip,param) {
   var url="";
   if (KODI_USER != "")
       url = 'http://'+KODI_USER+":"+KODI_PASSWORD+"@"+ip+':'+KODI_PORT+'/jsonrpc?request='+param;
   else
       url = 'http://'+ip+'/jsonrpc?request='+param;
   console.log(url);
}