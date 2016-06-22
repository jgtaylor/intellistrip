#!/usr/bin/nodejs

var b = require('bonescript'),
	dht = require('beaglebone-dht'),
	sensor = dht.sensor('DHT22'),
	later = require('later'),
	dhtPin = 'P9_23',
	fanPWM = 'P8_13',
	fanFreq = 10000,
	fspd = 0.0,
	mq = require('mqtt'),
	mc = mq.connect("mqtt://automation.local"),
	moment = require('moment'),
	powerPins = [ 'P8_7', 'P8_8', 'P8_9', 'P8_10', 'P8_11', 'P8_12', 'P8_14', 'P8_16' ];

function startup() {
	console.log(new Date+" INIT: Startup");
	b.pinMode(fanPWM, b.ANALOG_OUT, 4);
	for ( var X in powerPins ) {
		console.log("DEBUG: X="+powerPins[X]);
		b.pinMode(powerPins[X], b.OUTPUT);
	}
	var fanPower = powerPins[6];
	b.digitalWrite(fanPower, b.HIGH);
	getDHT();

};


function fanspeed(nfspd) {
	var floor = 0.1, ceiling = 0.8;
	// stupid way of doing it... fuck it.
	if (nfspd > ceiling) {
		nfspd = ceiling;
	}
	if ( fspd !== nfspd ) { 
		if ( nfspd < floor ) {
			fspd = floor;
		} else {
			fspd = nfspd;
		}
		b.analogWrite( fanPWM, fspd, fanFreq ); // setup PWM (hopefully)
		mc.publish("/zones/1/fanspeed", fspd.toString(), function() {console.log(new Date+"MQTT publish - fan: "+fspd)});
	}
}

function getDHT() {
	var countMax = 5;
	var count = 0;
	var curCount = count;
	while ( ! ( current = dht.read(dhtPin) ) && count !== countMax ) {
		count++;
		console.error(new Date + 'Failed reading DHT sensor @ dhtPin. Try # ' + count );
	}
	if ( current !== undefined ) { 
		console.log(new Date + JSON.stringify(current));
		if (current.error === undefined ) { 
		var threshold = { 'lower': 20.0, 'upper': 29.9 };
		mc.publish("/zones/1/temp", current.celsius.toFixed(1),
			function(){ console.log(new Date+"MQTT publish - temp: "+current.celsius.toFixed(1))});
		mc.publish("/zones/1/rh", current.humidity.toFixed(1),
			function(){ console.log(new Date+"MQTT publish - humidity: "+current.humidity.toFixed(1))});
		var nfspd = Number((0.01*(threshold.upper - threshold.lower)*(current.celsius - threshold.lower)).toFixed(2));
		fanspeed(nfspd);
		}
	}
}

function lightsOn(powerPin) {
	var pinStatus = b.getPinMode(powerPin, function(x) { return x });
	if (pinStatus.direction !== b.OUTPUT) {
		b.pinMode(powerPin, b.OUTPUT);
	}
	b.digitalWrite(powerPin, b.HIGH);
}
function lightsOff(powerPin) {
	var pinStatus = b.getPinMode(powerPin, function(x) { return x });
	if (pinStatus.direction !== b.OUTPUT) {
		b.pinMode(powerPin, b.OUTPUT);
	}
	b.digitalWrite(powerPin, b.LOW);
}

mc.on("error", function(error) { console.log("cannot connect to automation.local: "+error+" >>")});
startup();
// LIGHTS ON AND OFF
// the schedules should become configuration variables, of some sort.
var schedLightsOn = later.parse.recur().on(20).hour(), 
	TschedLightsOn = later.setInterval(function() { lightsOn('P8_8'); }, schedLightsOn); // run every day at 22 (10pm)
var schedLightsOff = later.parse.recur().on(08).hour(),
	TschedLightsOff = later.setInterval(function() { lightsOff('P8_8'); }, schedLightsOff); // run every day at 10 (10am)

// READ DHT Temp/Humid
var sched2Min = later.parse.recur().every(2).minute(),
	monRun = later.setInterval(getDHT, sched2Min);
// turn on or off depending on where it starts up...
if (moment().isBetween(later.schedule(schedLightsOff).prev(), later.schedule(schedLightsOn).next()) ) {
	lightsOff('P8_8');
} else {
	lightsOn('P8_8');
}
