//var db = require("./bin/lib/influxdbHandler");
const later = require( 'later' ),
	moment = require( 'moment' ),
	websockets = require( 'websockets' ),
	bone = require( 'bonescript' ),
	Devices = require( './bin/lib/Devices' ),
	Event = require( 'events' );

// get the devices available
var devices = Devices();
console.log(devices);


// the zone should be an object w/ add/del device methods, schedule, etc.
// the key thing should point to a device from devices.dev[deviceID].
var z = [
	{
		zoneID: 1,
		zoneName: "babys",
		lampA: devices.dev["635c943a-6b8a-7b22-32e1-1a397411c2c6"],
		lampB: devices.dev["1157249c-3713-f1e7-7a66-b666d3307061"],
		fogger: devices.dev["229fb8cd-dba7-9dd3-3f8f-544609b3fbdb"],
		tempHum: devices.dev["715b8504-9ead-6c3c-3fce-313662441d64"]
	},
	{
		zoneID: 2,
		zoneName: "mommys",
		lampA: devices.dev["dee8d3ff-995e-f968-514c-9caff255bea3"],
		fanA: devices.dev["f1c522b1-dd66-e2d8-2e84-5e920f40bce4"],
		fanExhaust: devices.dev["73807a3a-179e-b1bf-2f22-4c8eb80d98b2"],
		tempHum: ""
	}
];

// now to get schedules going. clever would be better, but fuck it.
z[0].lampOnSchedule = later.parse.recur().on(13).hour(); //every day at 13 UTC
z[0].lampOffSchedule = later.parse.recur().on(7).hour(); //every day at 07 UTC



// get the logical layout
//var zones = Zones(); // NOT WHAT I WANT, but i don't know what i want :-(
//zones[0].lights.on.schedule()
//zones[0].lights.off.schedule()
//zones[0].pumpX.on.schedule()
//zones[0].monitor("temp")
//zones[0].monitor("humidity")
//zones[0].monitor("lights")
//zones[0].monitor("water")
