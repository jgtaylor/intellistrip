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
	zone.things = {
		add: ( name, deviceUUID ) => {
			// thing is an object { thingName: device-uuid }
			if ( deviceUUID ) {
				if ( devices.list()
					.includes( deviceUUID ) ) {
					zone.things[ name ] = devices.dev[ deviceUUID ];
				}
			} else {
				zone.things[ name ] = 0;
			}
			return zone.emit( "added", name );
		},
		remove: ( name ) => {
			return delete zone.things[ name ];
		},
		list: () => {
			return Object.keys( zone.things );
		}
	};
	zone.schedules = {
		timers: {},
		run: ( name ) => {
			zone.schedules.timers[ name ] = {};
			zone.schedules[ name ].referingTo.forEach( ( thing ) => {
				zone.schedules.timers[ name ][ thing ] = {};
				Object.keys( zone.schedules[ name ] )
					.forEach( ( schedName ) => {
						zone.schedules.timers[ name ][ thing ][ schedName ] = later.setInterval( zone.things[ thing ].button[ schedName ](), zone.schedules[ name ][ schedName ] );
					} );

			} );
		},
		stop: ( name ) => {
			Object.keys( zone.schedules.timers[ name ] )
				.forEach( ( thing ) => {
					Object.keys( zone.schedules.timers[ name ][ thing ] )
						.forEach( ( schedName ) => {
							later.clearInterval( zone.schedules.timers[ name ][ thing ][ schedName ] );
							delete zone.schedules.timers[ name ][ thing ][ schedName ];
						} );
					delete zone.schedules.timers[ name ][ thing ];
				} );
			delete zone.schedules.timers[ name ];
		}
	};
	zone.monitors = {};
	// use devices.query(zoneConfig[key]) to find it and load it.
	// once devices.query() works.
	Object.keys( zoneConfig )
		.forEach( ( a ) => {
			switch (a) {
			case "things":
				{
					Object.keys( zoneConfig.things )
					.forEach( ( a ) => {
						if ( devices.list()
							.includes( zoneConfig.things[ a ] ) ) {
							zone.things[ a ] = devices.dev[ zoneConfig.things[ a ] ];
						}
					} );
					break;
				}
			case "schedules":
				{
					Object.keys( zoneConfig.schedules )
					.forEach( ( b ) => {
						zone.schedules[ b ] = {};
						Object.keys( zoneConfig.schedules[b] )
							.forEach( ( c ) => {
								// c = "on", "off"
								if ( c !== "referingTo" ) {
									// TODO: check that the keys are names for the device methods. - another day.
									// can only work on buttons at this point :-(
									zoneConfig.schedules[b].referingTo.forEach( ( obj ) => {
										if ( isValidMethod( zone.things[ obj ].button[ c ] ) || isValidMethod(
												zone.things[ obj ].dimmer[ c ] || isValidMethod( zone.things[ obj ].virtual[ c ] ) ) ) {
											// zone.schedules[ b ][ c ] = later.schedule( zoneConfig.schedules[ b ][ c ] );
											zone.schedules[ b ][ c ] = zoneConfig.schedules[ b ][ c ];
										}
									} );

								}
							} );
						zone.schedules[ b ].referingTo = zoneConfig.schedules[ b ].referingTo;
					} ); // end forEach(b)
					break;
				}
			default:
				{
					zone[ a ] = zoneConfig[ a ];
				}
			}
		} );
	return zone;
};
