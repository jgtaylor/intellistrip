const EventEmitter = require( "events" );

function guid() {
	return s4() + s4() + "-" + s4() + "-" + s4() + "-" +
		s4() + "-" + s4() + s4() + s4();
}

function s4() {
	return Math.floor( ( 1 + Math.random() ) * 0x10000 )
		.toString( 16 )
		.substring( 1 );
}

module.exports = ( devConfig ) => {
	const device = new EventEmitter();
	if ( !devConfig.deviceID ) {
		device.deviceID = guid();
	}
	// only needed during development.
	switch ( devConfig.deviceType ) {
	case "button":
		{
			/*
			hack:
			expose deviceCmds[] as methods (on, off, toggle, status, init). leave
			it around for serialization.
			wrap this in a platform object that returns button.
			*/
			let pin = devConfig.devicePin;
			device.btnCmds.on = () => {
				// check for bonescript stuff...?
				return b.digitalWrite( pin, b.HIGH );
			};
			device.btnCmds.off = () => {
				return b.digitalWrite( pin, b.LOW );
			};
			device.btnCmds.toggle = () => {
				let currentState = b.digitalRead( pin, ( e, d ) => {
					if ( d === b.LOW ) {
						return b.digitalWrite( pin, b.HIGH )
					} else {
						return b.digitalWrite( pin, b.LOW );
					}
				} );
			};
			device.btnCmds.status = () => {
				b.digitalRead( pin, ( e, d ) {
					if ( e ) return e;
					if ( d ) return d;
				} );
			};
			device.btnCmds.init = () => {
				return b.pinMode( pin, b.OUTPUT );
			};
			return device;

			break;
		}
	case "dimmer":
		{
			/*
			define device method for dimmer, init/up/down/increment/set/get, etc.
			also a native implementation on the platform so no modules needed.

			this depends on what the underlying hardware is: if there's no PWM chip,
			there's no /sys/class/pwm available. However, if there's an LCD attached,
			then it's likely there's a PWM output for the LCD brightness :-)
			*/
			break;
		}
	case "virtual":
		{
			/*
			there should be some module loaded, or defined somehow. the module should
			use a standard api - so, something like: cmds: ["x", "y"], describe the
			return, and probably other stuff as well. if it's i2c or spi, the commands
			should be described so that a device.read() is backed by something like:
			read: i2cObject.sendCmd('0x43'), or whatever the i2c command is.
			*/
			break;
		}
	default:
		{
			break;
		}
	}
	Object.keys( devConfig )
		.forEach( ( key ) => {
			device[ key ] = devConfig[ key ];
		} );
	//return Object.freeze(device);
	return device;
};
