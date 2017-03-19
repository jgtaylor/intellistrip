"use strict";
/* eslint no-console: "off", no-unused-vars: "off" */
/* this is a module, it should return an array of devices */
const EventEmitter = require( "events" ),
	later = require( "later" );

function guid() {
	return s4() + s4() + "-" + s4() + "-" + s4() + "-" +
		s4() + "-" + s4() + s4() + s4();
}

function s4() {
	return Math.floor( ( 1 + Math.random() ) * 0x10000 )
		.toString( 16 )
		.substring( 1 );
}

function camelCase( str ) {
	return str.charAt( 0 )
		.toUpperCase() + str.slice( 1 );
}

function isValidMethod( fn ) {
	return typeof fn === "function";
}

module.exports = ( devices, zoneConfig ) => {
	let zone = new EventEmitter();
	if ( !zoneConfig.zoneID ) {
		zoneConfig.zoneID = guid();
	}
	Object.keys( zoneConfig )
		.forEach( ( a ) => {
			// use devices.query(zoneConfig[key]) to find it and load it.
			// once devices.query() works.
			if ( devices.list()
				.includes( zoneConfig[ a ] ) ) {
				zone[ a ] = devices.dev[ zoneConfig[ a ] ];
			}
			switch ( a ) {
			case "schedules":
				{
					if ( !zone.schedules ) {
						zone.schedules = {
							timers: []
						};
					}
						// times is an object of schedules.
					Object.keys( zoneConfig.schedules )
						.forEach( ( b ) => {
							// zones.zone['uuid'].schedules.light || ...
							//zone.schedules[el].
							// build a schedule from the key.key ...
							// el = light/fogger/pump, etc.
							let me = zoneConfig.schedules[ b ];
							zone.schedules[ b ] = {};
							Object.keys( me )
								.forEach( ( c ) => {
									// c = "on", "off"
									if ( c !== "referingTo" ) {
										// TODO: check that the keys are names for the device methods. - another day.
										// can only work on buttons at this point :-(
										me.referingTo.forEach( ( obj ) => {
											let dev = devices.dev[ zoneConfig[ a ][ obj ] ];
											if ( isValidMethod( dev.button[ c ] ) || isValidMethod(
													dev.dimmer[ c ] || isValidMethod( dev.virtual[ c ] ) ) ) {
												zone.schedules[ b ][ c ] = later.schedule( me[ c ] );
											}
										} );

									}
								} );
							// now we create methods for dealing with the schedules.
							zone.schedules.start = ( sched, refMethod ) => {
								if ( zone.schedules.timers instanceof Array ) {
									zone.schedules.timers.push(  later.setInterval( refMethod, sched ) );
								}
							};
						} ); // end forEach(b)
					break;
				}
			}
			zone[ a ] = zoneConfig[ a ];
		} );
	return zone;
};
