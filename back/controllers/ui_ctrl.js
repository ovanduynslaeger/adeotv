var UPLOAD_DIR= process.env.UPLOAD_DIR;
var LOCAL_DIR= process.env.LOCAL_DIR;
var model = require('./model_ctrl');
var kodi = require('./kodi_ctrl');
var tv = require('../models/tv');
var async = require('async');

exports.index = function (req, res) {
    var cb = function (datas) {
        res.render('index.jade', {
            title : 'Ecrans'
            ,description: 'Home'
            ,author: 'Olivier Vanduynslaeger'
            ,tvs: datas.tvs
            ,medias: datas.medias
        });
    };
    model.getDatas(cb);
}


exports.playlist = function (req, res) {
    var atv = tv.getTv(req.params.id);
    var cb = function (medias) {
        res.render('playlist.jade', {
            title : 'Playlist'
            ,description: 'Home'
            ,author: 'Olivier Vanduynslaeger'
            ,medias: medias
            ,tvid: req.params.id
    	    ,tv: atv
        });
    };
    model.getMedias(cb);
}

exports.tvs = function (req, res) {
    var cb = function (tvs) {
        res.render('tvs.jade', {
                title: "TVs",
                tvs: tvs
        })
    };
    model.getTVs(cb);
};


exports.updatePlaylist = function (req, res) {
    if (req.body.cancel!=null) {
        res.redirect("/");
    } else {
        var id=req.body.tvid;
        var ip = tv.getIp(id);
        kodi.clearPlaylist(ip,function(result) { 
            if (req.body.selTo != null) {
                kodi.addItemPlaylist(ip,req.body.selTo,function() { 
                    tv.setPlaylist(id,req.body.selTo);
                    res.redirect("/"); 
                });
            } else res.redirect("/");
        });
    }
}

exports.upload = function (req, res) {

    var cb = function (medias) {
        var fs = require('fs');
        //console.log("file="+req.files.mediaFile);
        
        if (req.files.mediaFile != null) {
            console.log("fs");
            console.log(JSON.stringify(req.files.mediaFile));
            var newPath = UPLOAD_DIR+req.files.mediaFile.name;
            console.log(newPath);
            fs.rename(req.files.mediaFile.path, newPath, function (err, data) {
              res.redirect("back");
            });
        } else {
            console.log("not fs");
            res.render('medias.jade', {
                    title: 'Medias',
                    medias: medias
            })
        }
    };
    model.getMedias(cb);
};



exports.media = function (req, res) {

    var ips=req.body.ips;
    var file=LOCAL_DIR + req.body.file;

    if (ips != null) {
        for (var i=0; i<ips.length; i++) {
            if (req.body.playone!=null) {
                playone(ips[i],file,null);
            }
            if (req.body.play!=null) {
                play(ips[i],null);
            }
            if (req.body.stop!=null) {
                stop(ips[i],null);
            }
            if (req.body.status!=null) {
                kodi.ping(ips[i],function (result) {tv.setStatusByIp(ips[i],result);});
            }
        }
        res.redirect("back");
    }
};


function playone(ip,file,cb) {
    console.log("on playone " + file);
    kodi.playOneFile(ip,file,function (result) {
        if (result == "OK") {
          tv.setStatusByIp(ip,"lecture");
        } else {
          tv.setStatusByIp(ip,result);
        }
        if(cb!=null) cb(result);
    })
}


function play(ip,cb) {
    console.log("on play");
    kodi.playPlaylist(ip,function (result) {
        if (result == "OK") {
          tv.setStatusByIp(ip,"lecture");
        } else {
          tv.setStatusByIp(ip,result);
        }
    
        if(cb!=null) cb(result);
    })
}

function stop(ip,cb) {
    kodi.stopPlaylist(ip,function (result) {
        console.log(result);
        if (result == "OK") {
          tv.setStatusByIp(ip,"on");
        } else {
          tv.setStatusByIp(ip,result);
        }
        if(cb!=null) cb(result);
    })
}
