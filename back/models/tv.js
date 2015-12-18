var DATA_DIR= process.env.DATA_DIR;
var jsonTvs = "";
var fs = require("fs");

exports.findAll = function (cb) {

    if (jsonTvs == "") {
        console.log("Find All Tvs");
        var json = JSON.parse(fs.readFileSync(DATA_DIR+"/tv.json", "UTF-8"));
        jsonTvs=json;
        console.log(json);
    }
    cb(null,jsonTvs);

};


exports.setStatus = function(id,status) {
    var found = jsonTvs.filter(function(item) { return item.id === id; });
    found[0].status=status;
}

exports.setSound = function(id,muted) {
    var found = jsonTvs.filter(function(item) { return item.id === id; });
    found[0].sound=muted;
}


exports.setStatusByIp = function(ip,status) {
    var found = jsonTvs.filter(function(item) { return item.network === ip; });
    found[0].status=status;
}

exports.setPlaylistByIp = function(ip,playlist) {
    var found = jsonTvs.filter(function(item) { return item.network === ip; });
    found[0].playlist=playlist;
}

exports.setPlaylist = function(id,playlist) {
    var found = jsonTvs.filter(function(item) { return item.id === id; });
    found[0].playlist=playlist;
}

exports.getIp = function(id) {
    var found = jsonTvs.filter(function(item) { return item.id === id; });
    return found[0].network;
}

exports.getTv = function(id) {
    var found = jsonTvs.filter(function(item) { return item.id === id; });
    return found[0];
}
