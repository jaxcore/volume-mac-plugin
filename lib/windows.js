const speaker = require('win-audio').speaker;
speaker.polling(200);

module.exports = {
	getVolume: function(callback) {
		callback(speaker.get());
	},
	
	setVolume: function(volume, callback) {
		speaker.set(volume);
		callback();
	},
	
	getMuted: function(callback) {
		callback(speaker.isMuted());
	},
	
	setMuted: function(muted, callback) {
		if (muted) speaker.mute();
		else speaker.unmute();
		callback();
	}
};

// var audio = require('win-audio').speaker;


/*
audio.polling(200);

audio.events.on('change', (volume) => {
  console.log("old %d%% -> new %d%%", volume.old, volume.new);
});

audio.events.on('toggle', (status) => {
  console.log("muted: %s -> %s", status.old, status.new);
});

audio.unmute();

setTimeout(function() {
    audio.set(40);
},2000);


setTimeout(function() {
    audio.increase(20);
},4000);


setTimeout(function() {
    audio.decrease(10);
},6000);


setTimeout(function() {
    audio.mute();
},8000);

*/

//
//
// var EventEmitter = require('events');
// var net = require("net");
// var {createLogger} = require('jaxcore');
// var log = createLogger('Desktop');
// var Client = plugin.Client;
//
// var windowsAudio = require('win-audio');
//
// var desktopInterface = require('./interface.js')(log);
//
// var desktopState = {};
//
// function DesktopService() {
// 	this.constructor();
// 	this.setStore(desktopState, true);
// 	this.bindInterface(desktopInterface);
// 	this._onVolumeChange = this.onVolumeChange.bind(this);
// 	this._onToggleMute = this.onToggleMute.bind(this);
// }
//
// DesktopService.prototype = new Client();
// DesktopService.prototype.constructor = Client;
//
// DesktopService.prototype.connect = function (callback) {
// 	this.audioDevice = windowsAudio.speaker;
//
// 	this.audioDevice.events.on('change', this._onVolumeChange);
// 	this.audioDevice.events.on('toggle', this._onToggleMute);
// 	var volume = this.audioDevice.get();
// 	this.parsers.volume(volume);
// 	var muted = this.audioDevice.isMuted();
// 	this.parsers.muted(muted);
// 	this.audioDevice.polling(this.state.audioPolling || 200);
//
// 	//log('audio connected');
// 	//this.audioDevice.get
//
// 	this.emit('connect', this);
//
// 	if (callback) {
// 		callback(this);
// 	}
// };
// DesktopService.prototype.disconnect = function () {
// 	this.audioDevice.events.removeEventListener('change', this._onVolumeChange);
// 	this.audioDevice.events.removeEventListener('toggle', this._onToggleMute);
// 	this.emit('disconnect');
// };
//
// DesktopService.prototype.onVolumeChange = function (status) {
// 	var volume = status.new;
// 	this.parsers.volume(volume);
// };
//
// DesktopService.prototype.onToggleMute = function (status) {
// 	var muted = status.new===1;
// 	this.parsers.muted(muted);
// };
//
// module.exports = new DesktopService();
