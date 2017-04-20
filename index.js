"use strict";
var EventEmitter = require( "events" ),
	later = require( "later" ),
	moment = require( "moment" ),
	websockets = require( "websockets" ),
	Devices = require( "./bin/lib/Devices" ),
	Zones = require( "./bin/lib/Zones" ),
	devices = Devices(),
	zones = Zones( devices ),
	influx = require( "./bin/lib/influxdbHandler" );

function logger( msg ) {
	console.log( moment( moment.now() )
		.format( "L HH:mm:ss:SSS" ) + " " + JSON.stringify( msg ) );
}
// we need to register listeners here...
zones.list()
	.forEach( ( z ) => {
		zones.zone[ z ].things.list()
			.forEach( ( t ) => {
				// let devType = zones.zone[ z ].things[ t ].deviceType;

				if ( !( zones.zone[ z ].things[ t ] instanceof EventEmitter ) ) {
					logger( "ERROR: " + zones.zone[ z ].things[ t ] );
					logger( "== DETAIL: thing = " + t );
					logger( "== DETAIL: zone = " + z );
				} else {

					zones.zone[ z ].things[ t ].on( "init", ( msg ) => {
						logger( t + " init: " );
						logger( msg );
					} );
					zones.zone[ z ].things[ t ].on( "state", ( msg ) => {
						let data = influx(
							`${t},uuid=${zones.zone[z].things[t].deviceID},zone=${zones.zone[z].zoneName},zoneID=${z}" val=${msg.state}` );
						if ( data ) { console.log( data ); }
					} );
					zones.zone[ z ].things[ t ].on( "status", ( msg ) => {
						logger( t + " status: " );
						logger( msg );
					} );
					zones.zone[ z ].things[ t ].on( "read", ( msg ) => {
						// {"celsius":"22.7","fahrenheit":"72.9","humidity":"38.5"}
						// "fan,uuid=nice_fan,zone=bloom_tent value=" + fspd;
						if ( msg ) {
							let data = influx(
								`${zones.zone[z].things[t].meta.outputs.celsius.metric},uuid=${zones.zone[z].things[t].deviceID},zone=${zones.zone[z].zoneName},zoneID=${z},unit="${zones.zone[z].things[t].meta.outputs.celsius.unit}" val=${msg.celsius}\n` +
								`${zones.zone[z].things[t].meta.outputs.humidity.metric},uuid=${zones.zone[z].things[t].deviceID},zone=${zones.zone[z].zoneName},zoneID=${z},unit="${zones.zone[z].things[t].meta.outputs.humidity.metric}" val=${msg.humidity}`
							);
							if ( data ) { console.log( data ); }
						}
					} );
				}
			} );
	} );
// we should initialize zone devices with an init() method. need querry working.
zones.list()
	.forEach( ( z ) => {
		Object.keys( zones.zone[ z ].things )
			.forEach( ( t ) => {
				let devType = zones.zone[ z ].things[ t ].deviceType;
				if ( zones.zone[ z ].things[ t ][ devType ] ) {
					zones.zone[ z ].things[ t ][ devType ].init();
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
		// logger( `Completed startup for zone: ${zones.zone[z].zoneName}.` );
		// logger( `Schedule(s) ${zones.zone[ z ].schedules.listRunning().join(", ")} have been started.` );
	} );
