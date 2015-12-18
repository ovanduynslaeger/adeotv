var UPLOAD_DIR= process.env.UPLOAD_DIR;
var fs = require('fs');

exports.findAll = function (cb) {
    console.log("Find All Medias");
    var path = UPLOAD_DIR;
    fs.readdir(path, function(err, items) {
        console.log(items);
        cb(err,items);
    });
};

exports.remove = function(media,cb) {
    console.log("Removing media " + UPLOAD_DIR+media);
    fs.unlink(UPLOAD_DIR+media,function(err,result) {
          cb(result);
    });

}