const Jaxcore = require('jaxcore');


var audioDevice;
if (process.platform === "win32") audioDevice = require('./lib/windows');
if (process.platform === "darwin") audioDevice = require('./lib/darwin');
if (process.platform === "linux") audioDevice = require('./lib/linux');

const schema = {
	id: {
		type: 'string',
		defaultValue: 'volume'
	},
	connected: {
		type: 'boolean',
		defaultValue: false
	},
	muted: {
		type: 'boolean',
		defaultValue: false
	},
	volume: {
		type: 'integer',
		defaultValue: 0,
		minimum: 'minVolume',
		maximum: 'maxVolume'
	},
	volumePercent: {
		type: 'float',
		defaultValue: 0
	},
	minVolume: {
		type: 'integer',
		defaultValue: 0,
		maximumValue: 100,
		minimumValue: 0
	},
	maxVolume: {
		type: 'integer',
		defaultValue: 100,
		maximumValue: 100,
		minimumValue: 0
	},
	volumeIncrement: {
		type: 'integer',
		defaultValue: 1
	}
};

var volumeInstance = null;

class VolumeService extends Jaxcore.Service {
	
	constructor(defaults, store) {
		super(schema, store, defaults);
		// this.createStore('Volume Store', true);
		this.log = Jaxcore.createLogger('Volume');
		this.log('created');
		
		audioDevice.init();
		
		// this.id = this.state.id;
		// this.setStates(, defaults);
	}
	
	connect() {
		// this.lastSetVolume = new Date();
		this.getVolume(() => {
			this.log('systemaudio: volume', this.state.volume);
			this.getMuted(() => {
				this.log('systemaudio: muted', this.state.muted);
				
				this.startMonitor();
				this.setState({
					connected: true
				});
				this.log('systemaudio: connected');
				this.emit('connect');
			});
		});
	}
	
	disconnect() {
		this.log('disconnecting...');
		this.stopMonitor();
		this.setState({
			connected: false
		});
		this.emit('disconnect');
	}
	
	startMonitor() {
		this.readInterval = 500;
		
		this.stopMonitor();
		
		this.monitor = setInterval(() => {
			if (this.lastSetVolume && new Date().getTime() - this.lastSetVolume.getTime() < this.readInterval) {
				this.log('ignore 1');
				return;
			}
			this.getVolume((volume, volumePercent) => {
				// this.log('monitor volume', volume);
				// if (this.lastSetVolume && new Date().getTime() - this.lastSetVolume.getTime() < this.readInterval*2) {
				// 	// ignore
				// 	this.log('ignore 2');
				// 	return;
				// }
				//
				// this._setVolume(volume);
				
				// if (!this.lastSetVolume) {
				//
				// 	return;
				// }
				//
				// var diff = Math.abs(this.state.volume - volume);
				// if (diff > 100) {
				// 	this.log('volume was changed externally', volume);
				// 	this._setVolume(volume);
				// }
			});
			this.getMuted();
		}, this.readInterval);
	}
	
	stopMonitor() {
		console.log('stop monitor');
		clearInterval(this.monitor);
	}
	
	setMinVolume(v) {
		this.setState({
			minVolume: v
		});
	}
	
	setMaxVolume(v) {
		this.setState({
			maxVolume: v
		});
	}
	
	_getVolume(callback) {
		audioDevice.getVolume(callback);
	}
	
	getVolume(callback) {
		this._getVolume((volume) => {
			if (!this.lastVolumeTime || new Date().getTime() - this.lastVolumeTime > 500) {
				if (volume !== this.state.volume) {
					this._setVolume(volume);
				}
			}
			if (callback) callback(this.state.volume, this.state.volumePercent);
		});
	}
	
	_setVolume(volume) {
		var volumePercent = volume / 100;
		this.setState({
			volumePercent: volumePercent,
			volume: volume
		});
		this.log('_setVolume', this.state.volume, this.state.volumePercent);
		if (!this.state.muted) {
			this.emit('volume', this.state.volumePercent, this.state.volume);
		}
	}
	
	setVolume(volume) {
		if (volume < this.state.minVolume) volume = this.state.minVolume;
		if (volume > this.state.maxVolume) volume = this.state.maxVolume;
		
		if (volume !== this.state.volume) {
			this.lastVolumeTime = new Date().getTime();
			this._setVolume(volume);
			this._writeVolume();
		}
	}
	
	_writeVolume() {
		if (this.isSettingVolume) {
			this.log('already isSettingVolume');
			return;
		}
		
		this.isSettingVolume = true;
		var volume = this.state.volume;
		this.log('_writeVolume', volume);
		this.isSettingVolume = true;
		
		
		
		audioDevice.setVolume(volume, () => {
			this.isSettingVolume = false;
			
			// this.log('wroteVolume ' + volume + ' _volumeQueued = ' + this.state.volume, stdout.toString());
			
			if (volume !== this.state.volume) {
				this.log('_writeVolume and wroteVolume do NOT MATCH');
				this._writeVolume();
			}
			this.lastSetVolume = new Date();
		});
	}
	
	changeVolume(diff) {
		// if (diff > 0) VolumeService.volumeUp();
		// else VolumeService.volumeDown();
		
		this.log('changing volume ...', this.state.volume, diff);
		var v = this.state.volume + diff;
		this.setVolume(v);
	}
	
	volumeUp() {
		this.changeVolume(this.state.volumeIncrement);
	}
	
	volumeDown() {
		this.changeVolume(-this.state.volumeIncrement);
	}
	
	getMuted(callback) {
		audioDevice.getMuted(muted => {
			if (this.lastVolumeTime && new Date().getTime() - this.lastVolumeTime > 500) {
				this._muteChanged(muted);
				if (callback) callback(muted);
			}
			else if (callback) callback(this.state.muted);
		});
	}
	
	_muteChanged(muted) {
		if (muted !== this.state.muted) {
			this.setState({
				muted: muted
			});
			this.emit('muted', this.state.muted);
		}
	}
	
	setMuted(muted) {
		muted = !!muted;
		audioDevice.setMuted(muted, () => {
			this._muteChanged(muted);
		});
	}
	
	toggleMuted() {
		this.setMuted(!this.state.muted);
	}
	
	destroy() {
		this.disconnect();
		volumeInstance = null;
	}
	
	static id() {
		return 'volume';
	};
	
	static getOrCreateInstance(serviceStore, serviceId, serviceConfig, callback) {
		if (!volumeInstance) {
			volumeInstance = new VolumeService(serviceConfig, serviceStore);
		}
		callback(null, volumeInstance);
	}
}

module.exports = VolumeService;

