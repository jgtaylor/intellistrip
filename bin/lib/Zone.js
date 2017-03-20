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
		listRunning: () => {
			return Object.keys( zone.schedules.timers );
		},
		list: () => {
			return Object.keys( zone.schedules )
				.filter( ( val ) => {
					if ( ( val == "timers" ) || ( val == "listRunning" ) || ( val == "list" ) || ( val == "run" ) || ( val == "stop" ) ) {
						return false;
					}
					return val;
				} );
		},
		run: ( name ) => {
			if ( zone.schedules.list()
				.includes( name ) ) {
				zone.schedules.timers[ name ] = {};
				zone.schedules[ name ].referingTo.forEach( ( thing ) => {
					zone.schedules.timers[ name ][ thing ] = {};
					Object.keys( zone.schedules[ name ] )
						.forEach( ( schedName ) => {
							if ( schedName !== "referingTo" ) {
								let sched = zone.schedules[ name ][ schedName ];
								zone.schedules.timers[ name ][ thing ][ schedName ] = later.setInterval( () => {
									let dType = zone.things[ thing ].deviceType;
									zone.things[ thing ][ dType ][ schedName ]();
								}, sched );
							}
						} );

				} );
			} else {
				return false;
			}
		},
		stop: ( name ) => {
			Object.keys( zone.schedules.timers[ name ] )
				.forEach( ( thing ) => {
					Object.keys( zone.schedules.timers[ name ][ thing ] )
						.forEach( ( schedName ) => {
							zone.schedules.timers[ name ][ thing ][ schedName ].clear();
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
			switch ( a ) {
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
						Object.keys( zoneConfig.schedules[ b ] )
							.forEach( ( c ) => {
								// c = "on", "off"
								if ( c !== "referingTo" ) {
									zoneConfig.schedules[ b ].referingTo.forEach( ( obj ) => {
										let dType = zone.things[ obj ].deviceType;
										if ( isValidMethod( zone.things[ obj ][ dType ][ c ] ) ) {
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
