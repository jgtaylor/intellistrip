"use strict";
/* eslint no-unused-vars: "off", no-console: "off" */
//var db = require("./bin/lib/influxdbHandler");
var later = require( "later" ),
	moment = require( "moment" ),
	websockets = require( "websockets" ),
	Devices = require( "./bin/lib/Devices" ),
	Zones = require( "./bin/lib/Zones" ),
	devices = Devices(),
	zones = Zones( devices );

// we need to register listeners here...
zones.list()
	.forEach( ( z ) => {
		Object.keys( zones.zone[ z ].things )
			.forEach( ( t ) => {
				if ( zones.zone[ z ].things[ t ].button ) {
					zones.zone[ z ].things[ t ].on( "init", ( msg ) => {
						console.log( `${t} init: ${msg}` );
					} );
					zones.zone[ z ].things[ t ].on( "state", ( msg ) => {
						console.log( `${t} state: ${msg}` );
					} );
					zones.zone[ z ].things[ t ].on( "status", ( msg ) => {
						console.log( `${t} status: ${msg}` );
					} );
				}
			} );
	} );
// we should initialize zone devices with an init() method.
zones.list()
	.forEach( ( z ) => {
		Object.keys( zones.zone[ z ].things )
			.forEach( ( t ) => {
				if ( Object.keys( zones.zone[ z ].things[ t ].button )
					.includes( "init" ) ) {
					zones.zone[ z ].things[ t ].button.init();
				}
			} );
	} );
// start schedules
zones.list()
	.forEach( ( z ) => {
		zones.zone[ z ].schedules.list()
			.forEach( ( sched ) => {
				zones.zone[ z ].schedules.run( sched );
			} );
		// we will start our monitors here, when monitors are here :-)
		console.log( `Completed startup for zone: ${zones.zone[z].zoneName}.\nSchedules, ${zones.zone[ z ].schedules.listRunning().join(", ")} have been started.` );
	} );



// get the logical layout
//var zones = Zones(); // NOT WHAT I WANT, but i don't know what i want :-(
//zones[0].lights.on.schedule()
//zones[0].lights.off.schedule()
//zones[0].pumpX.on.schedule()
//zones[0].monitor("temp")
//zones[0].monitor("humidity")
//zones[0].monitor("lights")
//zones[0].monitor("water")
