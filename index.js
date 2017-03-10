//var db = require("./bin/lib/influxdbHandler");
const later = require( 'later' ),
	moment = require( 'moment' ),
	websockets = require( 'websockets' ),
	bone = require( 'bonescript' ),
	Devices = require( './bin/lib/Devices' ),
	Event = require( 'events' ),
	Zones = require("./bin/lib/Zones");

// get the devices available
var devices = Devices();
var zones = Zones();

console.log(zones);

// get the logical layout
//var zones = Zones(); // NOT WHAT I WANT, but i don't know what i want :-(
//zones[0].lights.on.schedule()
//zones[0].lights.off.schedule()
//zones[0].pumpX.on.schedule()
//zones[0].monitor("temp")
//zones[0].monitor("humidity")
//zones[0].monitor("lights")
//zones[0].monitor("water")
