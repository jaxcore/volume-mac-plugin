var child_process = require('child_process');

module.exports = {
	init: function() {
	},
	
	getVolume: function(callback) {
		child_process.execFile('/usr/bin/osascript', ['-e', 'get volume settings'], (error, stdout, stderr) => {
			if (error) {
				throw error;
			}
			var data = stdout.toString();
			var m = data.match(/output volume:(\d+),/);
			if (m) {
				var volume = parseInt(m[1]);
				callback(volume);
			}
			else {
				this.log('_getVolume error, no volume');
				callback();
			}
			
		});
	},
	
	setVolume: function(volume, callback) {
		child_process.execFile('/usr/bin/osascript', ['-e', 'set volume output volume ' + volume.toString()], (error, stdout, stderr) => {
			// console.log('wroteVolume ' + volume + ' _volumeQueued = ' + this.state.volume, stdout.toString());
			callback();
		});
	},
	
	getMuted: function(callback) {
		child_process.execFile('/usr/bin/osascript', ['-e', 'output muted of (get volume settings)'], (error, stdout, stderr) => {
			var data = stdout.toString().trim();
			
			var muted = null;
			if (data === 'true') {
				muted = true;
			}
			else if (data === 'false') {
				muted = false;
			}
			else {
				this.log('getMuted error: [[' + data + ']]');
				return;
			}
			callback(muted);
		});
	},
	
	setMuted: function(muted, callback) {
		child_process.execFile('/usr/bin/osascript', ['-e', 'set volume output muted ' + (muted ? 'true' : 'false')], (error, stdout, stderr) => {
			callback();
		});
	}
};