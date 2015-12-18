///////////////////////////////////////////
//              Routes                   //
///////////////////////////////////////////

/////// ADD ALL YOUR ROUTES HERE  /////////
var KODI_USER= process.env.KODI_USER;
var KODI_PASSWORD= process.env.KODI_PASSWORD;

var ui_ctrl = require('../back/controllers/ui_ctrl')

module.exports = function (app) {
	
	var auth = require('http-auth');
	
	var basic = auth.basic({
	        realm: "TerradeoTV Realm."
	    }, function (username, password, callback) { // Custom authentication method.
	        callback (username === KODI_USER && password === KODI_PASSWORD);
	    }
	);

	app.get('/', auth.connect(basic), ui_ctrl.index);

	app.get('/tvs', auth.connect(basic), ui_ctrl.tvs);

	app.post('/play', auth.connect(basic), ui_ctrl.media);

	app.get('/medias', auth.connect(basic), ui_ctrl.upload);

	app.get('/playlist/:id', auth.connect(basic), ui_ctrl.playlist);

	app.post('/playlist', auth.connect(basic), ui_ctrl.updatePlaylist);
	
	app.post('/medias', auth.connect(basic), ui_ctrl.upload);

};