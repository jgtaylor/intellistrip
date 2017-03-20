"use strict";
/* eslint no-console: "off", no-unused-vars: "off" */
/* this is a module, it should return an array of devices */
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
	let pin = devConfig.devicePin;
	switch ( devConfig.deviceType ) {
	case "button":
		{
			/*
			hack:
			expose deviceCmds[] as methods (on, off, toggle, status, init). leave
			it around for serialization.
			wrap this in a platform object that returns button.
			*/
			device.button = {
				on: () => {
					if ( digitalWrite( pin, HIGH ) ) {
						device.emit( "state", {
							state: HIGH
						} );
						return true;
					}
					return false;
				},
				off: () => {
					if ( digitalWrite( pin, LOW ) ) {
						device.emit( "state", {
							state: LOW
						} );
						return true;
					}
					return false;
				},
				toggle: () => {
					let currentState = digitalRead( pin, ( d ) => {
						if ( d === LOW ) {
							if ( digitalWrite( pin, HIGH ) ) {
								device.emit( "state", {
									state: HIGH
								} );
								return true;
							}
							return false;
						} else {
							if ( digitalWrite( pin, LOW ) ) {
								device.emit( "state", {
									state: LOW
								} );
								return true;
							}
							return false;
						}
					} );
				},
				read: () => {
					return digitalRead( pin );
				},
				status: () => {
					let status = getPinMode( pin )
						.gpio;
					device.emit( "status", status );
					return status;
				},
				init: () => {
					if ( pinMode( pin, OUTPUT ) ) {
						device.emit( "init", getPinMode( pin )
							.gpio );
						return true;
					}
					return false;
				}
			};
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
			device.dimmer = {
				init: () => {
					return;
				},
				set: ( value, freq ) => {
					if ( freq ) {
						return analogWrite( pin, value, freq );
					} else {
						return analogWrite(pin, value, 2000);
					}
				},
				get: (pin) => {
					return getPinMode(pin).pwm;
				}
			};
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
