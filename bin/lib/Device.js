const EventEmitter = require("events");
function guid() {
	return s4() + s4() + "-" + s4() + "-" + s4() + "-" +
		s4() + "-" + s4() + s4() + s4();

}

function s4() {
	return Math.floor((1 + Math.random()) * 0x10000)
		.toString(16)
		.substring(1);

}

module.exports = (devConfig) => {
	let device = new EventEmitter();
	if (!devConfig.deviceID) {
		device.deviceID = guid();
	}
	// only needed during development.
	switch (devConfig.deviceType) {
	case "button": {
		/*
		define a device method, like, on/off/toggle, init,  - it's a native
		implementation (/sys/class/gpio/gpioXX/...), so no modules are
		needed, however, each platform might need to be supported, unless
		only gpio numbering is used. (e.g. RasPi has GPIO/WiringPI pin numbering,
		and beaglebone black has GPIO and header pin reference [P8_01]. the
		C.H.I.P will have another, etc. Of course, what would be really cool,
		would be an IO map for ARM i/o memory in Linux, but that may be asking
		alot. However, that would enable DMA from javascript/python/(god save
		us, even shell)

		On MCU systems where there's enough memory to easily run Espruino, this may
		runnable directly. check board support, or pay for new board support.

		in the mean time, i'll reference GPIOs & PWMs via /sys/class/[gpio|pwm].
		*/

		break;
	}
	case "dimmer": {
		/*
		define device method for dimmer, init/up/down/increment/set/get, etc.
		also a native implementation on the platform so no modules needed.

		this depends on what the underlying hardware is: if there's no PWM chip,
		there's no /sys/class/pwm available. However, if there's an LCD attached,
		then it's likely there's a PWM output for the LCD brightness :-)
		*/
		break;
	}
	case "virtual": {
		/*
		there should be some module loaded, or defined somehow. the module should
		use a standard api - so, something like: cmds: ["x", "y"], describe the
		return, and probably other stuff as well. if it's i2c or spi, the commands
		should be described so that a device.read() is backed by something like:
		read: i2cObject.sendCmd('0x43'), or whatever the i2c command is.
		*/
		break;
	}
	default: {
		break;
	}
	}
	Object.keys(devConfig).forEach((key) => {
		device[key] = devConfig[key];
	});
	return device;
};
