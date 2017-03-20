"use strict";
//var db = require("./bin/lib/influxdbHandler");
var later = require( "later" ),
	moment = require( "moment" ),
	websockets = require( "websockets" ),
	Devices = require( "./bin/lib/Devices" ),
	Zones = require("./bin/lib/Zones"),
	devices = Devices(),
	zones = Zones(devices);

// start schedules
zones.list().forEach( (z) => {
	z.schedules.list().forEach(( sched ) => {
		z.schedules.run(sched);
	});
});

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
