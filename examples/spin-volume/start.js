const Jaxcore = require('jaxcore');
const jaxcore = new Jaxcore();

jaxcore.addPlugin(require('jaxcore-spin'));
jaxcore.addPlugin(require('jaxcore-desktop-plugin'));
jaxcore.addPlugin(require('../../')); // jaxcore-volume-mac-plugin

jaxcore.defineService('Volume', 'volume', {});

jaxcore.defineAdapter('Spin Volume', {
	adapterType: 'spin-volume',
	deviceType: 'spin',
	serviceProfiles: [
		'Volume'
	]
});

jaxcore.on('spin-connected', function(spin) {
	console.log('connected', spin.id);

	jaxcore.connectAdapter(spin, 'Spin Volume');
});

jaxcore.startDevice('spin');
