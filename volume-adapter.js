const Jaxcore = require('jaxcore');

class VolumeAdapter extends Jaxcore.Adapter {
	static getDefaultState() {
		return {
			didKnobSpin: false,
			isRewinding: false,
			isFastForwarding: false,
			fastForwardTime: 0,
			rewindTime: 0
		};
	}
	
	constructor(store, config, theme, devices, services) {
		super(store, config, theme, devices, services);
		const {spin} = devices;
		const {keyboard, volume} = services;
		spin.rainbow(2);
		spin.scale(volume.state.volumePercent, theme.low, theme.high, theme.middle);
		
		this.addEvents(volume, {
			volume: function (volumePercent, volume) {
				this.log('desktop started vol=', volumePercent, volume);
				spin.scale(volumePercent, theme.low, theme.high, theme.middle);
			},
			muted: function (muted) {
				this.log('muted', muted);
				if (muted) {
					spin.scale(volume.state.volumePercent, theme.tertiary, theme.tertiary, theme.middle);
				}
				else {
					spin.scale(volume.state.volumePercent, theme.low, theme.high, theme.middle);
				}
			}
		});
		
		this.addEvents(spin, {
			spin: function (diff, spinTime) {
				if (this.state.disabled) {
					this.log('ADAPTER DISABLED ------- spin', diff);
					return;
				}
				
				this.log('spin rotate', diff);
				
				
				if (spin.state.knobPushed) {
					if (!volume.state.muted) {
						this.setState({didKnobSpin: true});
						let posDiff = spin.state.spinPosition - this.state.knobPushPosition;
						if (posDiff === 0) {
							this.stopFastForward();
							this.stopRewind();
						}
						else if (posDiff > 0) {
							this.startFastForward();
						}
						else if (posDiff < 0) {
							this.startRewind();
						}
					}
				}
				else if (spin.state.buttonPushed) {
				
				}
				else {
					if (volume.state.muted) {
						if (volume.state.volumePercent < 0.04) {
							volume.changeVolume(diff, spinTime);
						}
						else {
							spin.scale(volume.state.volumePercent, theme.tertiary, theme.tertiary, theme.middle);
						}
					}
					else {
						// console.log('diff', diff);
						// let bdiff = spin.buffer(diff, 1, 2);
						// volume.changeVolume(bdiff, spinTime);
						volume.changeVolume(diff, spinTime);
					}
				}
			},
			knob: function (pushed) {
				if (this.state.disabled) {
					this.log('ADAPTER DISABLED ------- knob', pushed);
					return;
				}
				
				if (pushed && spin.state.knobPushed) {
					this.setState({didBothPush: true});
					return;
				}
				
				this.log('knob', pushed);
				if (pushed) {
					this.setState({didKnobSpin: false});
					this.setState({knobPushPosition: spin.state.spinPosition});
				}
				else {
					if (this.state.didBothPush) {
						this.setState({didBothPush: false});
						return;
					}
					
					if (this.state.didKnobSpin) {
						this.stopRewind();
						this.stopFastForward();
					}
					else {
						this.log('knob toggleMuted', pushed);
						volume.toggleMuted();
					}
				}
			},
			button: function (pushed) {
				if (this.state.disabled) {
					this.log('ADAPTER DISABLED ------- button', pushed);
					return;
				}
				
				if (pushed && spin.state.knobPushed) {
					this.setState({didBothPush: true});
					return;
				}
				
				this.log('button', pushed);
				if (!pushed) {
					if (this.state.didBothPush) {
						this.setState({didBothPush: false});
						return;
					}
					// this.log('keypress play');
					keyboard.keyPress('audio_play');
					spin.flash(theme.secondary);
				}
			}
		});
	}
	
	startRewind() {
		if (this.state.isFastForwarding) {
			this.stopFastForward();
		}
		if (!this.state.isRewinding) {
			this.setState({isRewinding: true});
			this.setState({rewindTime: new Date().getTime()});
			this.log('audio_prev', 'down');
			this.services.keyboard.keyToggle('audio_prev', 'down');
			this.devices.spin.orbit(-1, 150, this.theme.low, this.theme.low);
			this.rewindInterval = setInterval(() => {
				let time = (new Date().getTime() - this.state.rewindTime) / 1000;
				if (time < 5) {
					this.devices.spin.orbit(-1, (150 - time * 25), this.theme.low, this.theme.low);
				}
			}, 1000);
		}
	}
	
	stopRewind() {
		if (this.state.isRewinding) {
			this.setState({isRewinding: false});
			this.services.keyboard.keyToggle('audio_prev', 'up');
			clearInterval(this.rewindInterval);
			this.devices.spin.lightsOff();
		}
	}
	
	startFastForward() {
		if (this.state.isRewinding) {
			this.stopRewind();
		}
		if (!this.state.isFastForwarding) {
			this.setState({isFastForwarding: true});
			this.setState({fastForwardTime: new Date().getTime()});
			this.services.keyboard.keyToggle('audio_next', 'down');
			this.devices.spin.orbit(1, 150, this.theme.high, this.theme.high);
			this.fastForwardInterval = setInterval(() => {
				let time = (new Date().getTime() - this.state.fastForwardTime) / 1000;
				if (time < 5) {
					this.devices.spin.orbit(1, (150 - time * 25), this.theme.high, this.theme.high);
				}
			}, 1000);
		}
	}
	
	stopFastForward() {
		if (this.state.isFastForwarding) {
			this.setState({isFastForwarding: false});
			this.services.keyboard.keyToggle('audio_next', 'up');
			clearInterval(this.fastForwardInterval);
			this.devices.spin.lightsOff();
		}
	}
	
	// static getServicesConfig(adapterConfig) {
	// 	return {
	// 		keyboard: true,
	// 		volume: true
	// 	};
	// }
}

module.exports = VolumeAdapter;