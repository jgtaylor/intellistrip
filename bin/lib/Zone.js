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
            devices.list().filter( (e) => {
                console.log("Dev id: "+e+" != "+zoneConfig[key]);
                if (zoneConfig[key] === e ) {
                    zone[key] = devices.dev[e];
                } else {
                    zone[key] = zoneConfig[key];
                }
            });
		});
	return zone;
}
