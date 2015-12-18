var TVs = require('../models/tv');
var Medias = require('../models/media');
var kodi = require('./kodi_ctrl');
var async = require('async');

exports.getTVs =function(cb) {
    findTVs(cb);
}

exports.getMedias =function(cb) {
    findMedias(cb);
}


/*
exports.getPlaylists =function(cb) {

    console.log("getPlaylists");
    TVs.findPlaylists(function (err, playlists) {
        if (err) {
            console.log("ERROR in getPlaylists");
            cb(null);
        }
       cb(playlists);
    });
    
}
*/

exports.getDatas=function (cb) {
    var datas = {};
    async.parallel([
        //Load tvs
        function(callback) {
            findTVs(function (tvs) {
                datas.tvs=tvs;
                refreshAllTvStatus(tvs,function() {
                    callback();
                });
            });
        },
        //Load medias
        function(callback) {
            findMedias(function (medias) {
                datas.medias=medias;
                callback();
            });
        }
    ], function(err) { 
        console.log("return datas");
        cb(datas);
    });
}

exports.updateTVStatus=function(data,cb) {
    refreshStatus(data,cb);
}

function refreshStatus(data,cb) {
   var ret = {
      id: data.id,
      sound: '',
      status: ''
   }
   async.parallel([
          function(callback) {
            kodi.ping(data.ip,function(status) { 
                TVs.setStatus(data.id,status);
                ret.status = status;
                console.log("on ping "+status);
                callback();
            });
          },
          function(callback) {
              kodi.isMuted(data.ip,function(muted) { 
                TVs.setSound(data.id,muted);
                ret.sound=muted;
                console.log("on isMuted "+muted);
                callback();
            });
          }
      ], function(err) { 
          if (err) console.log(err);
          //if (socket) socket.emit("returnstatus", ret);
          console.log("refreshStatus "+JSON.stringify(ret))
          cb(ret);
      });
}

function refreshAllTvStatus(tvs,cb) {
 for (var i = 0; i < tvs.length; i++) {
      var atv = {
        id: tvs[i].id,
        ip: tvs[i].network
      }
      refreshStatus(atv, function(ret) {
         console.log("returnstatus "+ ret);
      } );
 }
 cb();
}


function findTVs(cb) {
    console.log("on getTVs");
    TVs.findAll(function (err, tvs) {
        if (err) {
            console.log("ERROR in getTVs");
            cb(null);
        } else {
            cb(tvs);
        }
    });
}

function findMedias(cb) {
    console.log("on getMedias");
    Medias.findAll(function (err, medias) {
        if (err) {
            console.log("ERROR in getMedias");
            cb(null);
        } else {
            cb(medias);
        }
    });
    
}
