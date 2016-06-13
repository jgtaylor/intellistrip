#!/usr/bin/nodejs

var b = require('bonescript'),
	dht = require('beaglebone-dht'),
	sensor = dht.sensor('DHT22'),
	later = require('later'),
	dhtPin = 'P9_23',
	fanPWM = 'P8_13',
	fanPower = 'P8_14',
	fanFreq = 10000,
	fspd = 0.0,
	mq = require('mqtt'),
	mc = mq.connect("mqtt://automation.local");

function startup() {
	console.log(new Date+" INIT: Startup");
	b.pinMode(fanPower, b.OUTPUT);
	b.digitalWrite(fanPower, b.HIGH);
	b.pinMode(fanPWM, b.ANALOG_OUT, 4);
	getDHT();
}


function fanspeed(nfspd) {
	var floor = 0.1;
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
	while ( ! ( current = dht.read(dhtPin) ) && count !== countMax ) {
		count++;
		console.error('Failed reading DHT sensor @ dhtPin. Trying '+countMax-count+' times.');
	}
	if ( current !== undefined ) { 
		console.log(new Date+JSON.stringify(current));
		if (current.error === undefined ) { 
		var threshold = { 'lower': 20.0, 'upper': 29.9 };
		mc.publish("/zones/1/temp", current.celsius.toFixed(1), function(){ console.log(new Date+"MQTT publish - temp: "+current.celsius.toFixed(1))});
		mc.publish("/zones/1/rh", current.humidity.toFixed(1), function(){ console.log(new Date+"MQTT publish - humidity: "+current.humidity.toFixed(1))});
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
	b.digitalWrite(powerPin, b.LOW);
}

mc.on("error", function(error) { console.log("cannot connect to automation.local: "+error+" >>")});
startup();
// LIGHTS ON AND OFF
var schedLightsOn = later.parse.recur().on(22).hour(),
	TschedLightsOn = later.setInterval(function() { lightsOn('P8_8'); }, schedLightsOn); // run every day at 22 (10pm)
var schedLightsOff = later.parse.recur().on(10).hour(),
	TschedLightsOff = later.setInterval(function() { lightsOff('P8_8'); }, schedLightsOff); // run every day at 10 (10am)

// READ DHT Temp/Humid
var sched2Min = later.parse.recur().every(2).minute(),
	monRun = later.setInterval(getDHT, sched2Min);
