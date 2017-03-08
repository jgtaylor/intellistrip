//var db = require("./bin/lib/influxdbHandler");
const later = require( 'later' ),
	moment = require( 'moment' ),
	websockets = require( 'websockets' ),
	bone = require( 'bonescript' ),
	Devices = require( './bin/lib/Devices' ),
	Event = require( 'events' );

// get the devices available
Devices.on("added", (msg) => {
	console.log("added: "+msg.deviceID);
});

var devices = Devices();
console.log(devices);

// get the logical layout
//var zones = Zones(); // NOT WHAT I WANT, but i don't know what i want :-(
//zones[0].lights.on.schedule()
//zones[0].lights.off.schedule()
//zones[0].pumpX.on.schedule()
//zones[0].monitor("temp")
//zones[0].monitor("humidity")
//zones[0].monitor("lights")
//zones[0].monitor("water")
