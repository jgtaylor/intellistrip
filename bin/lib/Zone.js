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

module.exports = ( devices, zoneConfig ) => {
    let zone = new EventEmitter();
	if ( !zoneConfig.zoneID ) {
		zoneConfig.zoneID = guid();
	}
	// for now, just access a fixed global, devices
	Object.keys( zoneConfig )
		.forEach( ( key ) => {
			// use devices.query(zoneConfig[key]) to find it and load it.
			// once devices.query() works.
			if ( devices[ zoneConfig[ key ] ] ) {
				zone[ key ] = devices[ zoneConfig[ key ] ];
			} else {
				zone[ key ] = zoneConfig[ key ];
			}
		} );
	return zone;
}
