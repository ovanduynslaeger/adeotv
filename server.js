//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//
var http = require('http');
var path = require('path');

var async = require('async');
var socketio = require('socket.io');
var express = require('express');
var tvs = require('./back/models/tv');
var medias = require('./back/models/media');
var kodi = require('./back/controllers/kodi_ctrl');
var model = require('./back/controllers/model_ctrl');
var bodyParser  = require('body-parser');
var UPLOAD_DIR= process.env.UPLOAD_DIR;

//
// ## SimpleServer `SimpleServer(obj)`
//
// Creates a new instance of SimpleServer with the following options:
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
//
var app = express();

    app.configure(function(){
      app.set('views', __dirname + '/front/views');
      app.set('view engine', 'jade');
      app.set('view options', { layout: false });
      app.use(express.bodyParser( { keepExtensions: true, uploadDir: UPLOAD_DIR } ));
      //app.use(bodyParser.urlencoded({ extended: false }));
      //app.use(bodyParser.json());
    });

app.use(express.static(path.resolve(__dirname, 'front')));

var server = http.createServer(app);
    
require('./config/route')(app);


server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Listening at", addr.address + ":" + addr.port);
});
//var messages = [];
var sockets = [];


var io = socketio.listen(server);

// Quand on client se connecte, on le note dans la console
io.on('connection', function (socket) {
    /* messages.forEach(function (data) {
      socket.emit('message', data);
    });
    */
    sockets.push(socket);

    socket.on('disconnect', function () {
      sockets.splice(sockets.indexOf(socket), 1);
      //updateRoster();
    });


    socket.on('tvallstatus', function () {
      console.log("on tvallstatus socket");
      tvs.findAll(function(err,data) {
        
        for (var i = 0; i < data.length; i++) {
              var atv = {
                id: data[i].id,
                ip: data[i].network
              }
              console.log(atv);
              model.updateTVStatus(atv, function(ret) {
                socket.emit("returnstatus", ret);
              } );
        }
      })
    });

    socket.on('tvstatus', function (data) {
      var atv = {
        id: data.id,
        ip: data.ip
      }
      model.updateTVStatus(atv, function(ret) {
        console.log(">>>> "+JSON.stringify(ret));
        socket.emit("returnstatus", ret);
      } );
    })

    socket.on('reboot', function (data) {
      kodi.reboot(data.ip,function (result) {
      	  console.log("reboot");
      });
    })

    socket.on('mute', function (data) {
      var atv = {
        id: data.id,
        ip: data.ip
      }
      kodi.setMute(data.ip,true,function (result) {
        model.updateTVStatus(atv, function(ret) {
          console.log(">>>> "+JSON.stringify(ret));
          socket.emit("returnstatus", ret);
        } );
      });
    })


    socket.on('tvplay', function (data) {
      console.log("on tvplay socket for tv "+data.id+" "+data.ip);
      kodi.playPlaylist(data.ip,function (result) {
	    console.log("result for tvplay = "+result);
          var ret = {
            id: data.id,
            status: "lecture"
          }
          if (result != "OK") {
             ret.status=result;
          }
          tvs.setStatus(data.id,ret.status);
          socket.emit("returnstatus", ret);
      })
    });

    socket.on('tvstop', function (data) {
      console.log("on tvstop socket for tv "+data.id + " "+data.ip);
      kodi.stopPlaylist(data.ip,function (result) {
  	  console.log("result for tvstop = "+result);
          var ret = {
            id: data.id,
            status: "on"
          }
          if (result != "OK") {
             ret.status=result;
          }
          tvs.setStatus(data.id,ret.status);
          socket.emit("returnstatus", ret);
      })
    });


    socket.on('removemedia', function (data) {
      console.log("remove media " + data.id);
      medias.remove(data.media,function(status) { 
         console.log(data);
          socket.emit("returnremove", data);
      })
    });

  });
  
  
  
/* Private function */  
