"use strict";
/* eslint no-console: "off", no-unused-vars: "off" */
/* this is a module, it should return an array of devices */
const fs = require( "fs" ),
	EventEmitter = require( "events" ),
	Zone = require( "./Zone" );

module.exports = ( devices, config ) => {
	let zones = new EventEmitter();

	zones.add = ( zoneConfig ) => {
		// should look like { zoneID: "xxxx", deviceType: enum:[button, dimmer, virtual]}
		let zone = Zone(devices, zoneConfig);
		let zoneID = zoneConfig.zoneID;
		if ( !zones.zone[ zoneID ] ) {
			zones.zone[ zoneID ] = zone;
			zones.emit( "added", zone );
			return zones;
		} else {
			zones.emit( "error", new Error( "zone: " + zone.zoneID +
				" already exists." ) );
			return zones;
		}
	};

	zones.list = () => {
		return Object.keys( zones.zone );
	};

	zones.query = ( search ) => {
		//should match a key or a value.
		Object.keys( zones.zone )
			.forEach( ( obj, idx, o ) => {
				let p = zones.zone[ obj ];
				Object.keys( p )
					.forEach( ( el, i, a ) => {
						if ( el === search ) {
							return p;
						}
						if ( p.el === search ) {
							return p;
						}
					} );
			} );
	};

	zones.save = () => {
		let zonesJSON = [];
		Object.keys( zones.zone )
			.forEach( ( el ) => {
				let j = {};
				Object.keys( zones.zone[ el ] )
					.forEach( ( k ) => {
						switch ( k ) {
						case "domain":
							{
								break;
							}
						case "_events":
							{
								break;
							}
						case "_eventsCount":
							{
								break;
							}
						case "_maxListeners":
							{
								break;
							}
						default:
							{
								j[ k ] = zones.zone[ el ][ k ];
								break;
							}
						}
					} );
				zonesJSON.push( j );
			} );
		fs.writeFileSync( "zones.json", JSON.stringify( zonesJSON, null, 2 ), {
			encoding: "utf-8",
			mode: 0o644
		} );
		zones.emit( "saved", zonesJSON );
	};

	zones.remove = ( zoneID ) => {
		if ( !zones.zone[ zoneID ] ) {
			//nothing to do
			return zones;
		}
		delete zones.zone[ zoneID ];
		zones.emit( "removed", zoneID );
		return zones;
	};

	function init() {
		let configData = JSON.parse( fs.readFileSync( "zones.json", "utf-8" ) );
		if ( configData instanceof Array ) {
			configData.forEach( ( zoneConfig ) => {
				zones.add( zoneConfig );
			} );
			return zones;
		}
		return zones;
	}

	if ( !config ) {
		init();
	}
	//return Object.freeze(devices);
	return zones;
};
