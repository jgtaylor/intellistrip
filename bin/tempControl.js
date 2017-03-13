#!/usr/bin/nodejs
// get config
// start monitoring, start responses
var b = require("bonescript"),
	dht = require("beaglebone-dht"),
	sensor = dht.sensor("DHT22"),
	later = require("later"),
	dhtPin = "P9_23",
	fanPWM = "P8_13",
	fanFreq = 10000,
	fspd = 0.0,
	mq = require("mqtt"),
	mc = mq.connect("mqtt://automation.local"),
	moment = require("moment"),
	powerPins = ["P8_7", "P8_8", "P8_9", "P8_10", "P8_11", "P8_12", "P8_14", "P8_16"],
	light1 = powerPins[1],
	floor = 0.3,
	ceiling = 1,
	http = require("http"),
	options = {
		hostname: "automation.local",
		port: 8086,
		path: "/write?db=environ",
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		}
	},
	req = function() {
		return http.request(options, function(res) {
//            console.log('Status: ' + res.statusCode);
//            console.log('Headers: ' + JSON.stringify(res.headers));
			res.setEncoding("utf8");
			res.on("data", function(body) {
				console.log("Body: " + body);
			});
		});
	};



function startup() {
	console.log(new Date + " INIT: Startup");
	b.pinMode(fanPWM, b.ANALOG_OUT, 4);
	for (var X in powerPins) {
		b.pinMode(powerPins[X], b.OUTPUT);
	}
	var fanPower = powerPins[6];
	b.digitalWrite(fanPower, b.HIGH);
	getDHT();

}


function fanspeed(nfspd) {
    // stupid way of doing it... fuck it.
	if (nfspd > ceiling) {
		nfspd = ceiling;
	}
	if (fspd !== nfspd) {
		if (nfspd < floor) {
			fspd = floor;
		} else {
			fspd = nfspd;
		}
		b.analogWrite(fanPWM, fspd, fanFreq); // setup PWM (hopefully)
		mc.publish("/zones/1/fanspeed", fspd.toString(), function() {
			console.log(new Date + "MQTT publish - fan: " + fspd);
		});
		var msg = "fan,uuid=nice_fan,zone=bloom_tent value=" + fspd;
		var hReq = req();
		hReq.on("error", function(e) { console.log(e);});
		hReq.write(msg);
		hReq.end();
	}
}

function getDHT() {
	var countMax = 10;
	var count = 0;
	var curCount = count;
	while (!(current = dht.read(dhtPin)) && count !== countMax) {
		count++;
	}
	if (current !== undefined) {
		var threshold = {
			"lower": 20.0,
			"upper": 30.0
		};
		mc.publish("/zones/1/temp", current.celsius,
            function() {
	console.log(new Date + "MQTT publish - temp: " + current.celsius);
});
		mc.publish("/zones/1/rh", current.humidity,
            function() {
	console.log(new Date + "MQTT publish - humidity: " + current.humidity);
});
		var nfspd = Number((0.01 * (threshold.upper - threshold.lower) * (current.celsius - threshold.lower)).toFixed(2));
		var msg = "temp,uuid=fake,zone=bloom_tent value=" + current.celsius + "\nhumidity,uuid=fake_humidty,zone=bloom_temp value=" + current.humidity;
		var hReq = req();
		hReq.on("error", function(e) { console.log(e);});
		hReq.write(msg);
		hReq.end();
		fanspeed(nfspd);
	}
}

function lightsOn(powerPin) {
	b.getPinMode(powerPin, function(x) {
		if (x.direction !== b.OUTPUT) {
			b.pinMode(powerPin, b.OUTPUT);
		}
		if (x.value !== b.HIGH) {
			b.digitalWrite(powerPin, b.HIGH);
		}
		ceiling = 0.99;
	});
}

function lightsOff(powerPin) {
	var pinStatus = b.getPinMode(powerPin, function(x) {
		if (pinStatus.direction !== b.OUTPUT) {
			b.pinMode(powerPin, b.OUTPUT);
		}
		if (x.value !== b.LOW) {
			b.digitalWrite(powerPin, b.LOW);
		}
		ceiling = 0.50;
	});
}

mc.on("error", function(error) {
	console.log("cannot connect to automation.local: " + error + " >>");
});
startup();
// LIGHTS ON AND OFF
// the schedules should become configuration variables, of some sort.
var schedLightsOn = later.parse.recur().on(7).hour(),
	TschedLightsOn = later.setInterval(function() {
		lightsOn(light1);
		console.log("Scheduled lights on: " + new Date());
		var msg = "light,uuid=SPYDR_1200,zone=bloom_tent value=1";
		var hReq = req();
		hReq.on("error", function(e) { console.log(e);});
		hReq.write(msg);
		hReq.end();
	}, schedLightsOn); // run every day at 19 (7pm) [ UTC, not CET ]
var schedLightsOff = later.parse.recur().on(19).hour(),
	TschedLightsOff = later.setInterval(function() {
		lightsOff(light1);
		console.log("Scheduled lights off:" + new Date());
		var msg = "light,uuid=SPYDR_1200,zone=bloom_tent value=0";
		var hReq = req();
		hReq.on("error", function(e) { console.log(e);});
		hReq.write(msg);
		hReq.end();
	}, schedLightsOff); // run every day at 7 (7am)

// READ DHT Temp/Humid
var sched2Min = later.parse.recur().every(1).minute(),
	monRun = later.setInterval(getDHT, sched2Min);
// turn on or off depending on when we start up, where we are in the schedule.

if (moment(moment.now).isBetween(later.schedule(schedLightsOn).prev(), later.schedule(schedLightsOff).next())) {
	lightsOn(light1);
	console.log("Turning lights on.");
} else {
	lightsOff(light1);
	console.log("Turning lights off.");
}

/*
var afterOff = moment().isAfter(later.schedule(schedLightsOff).prev()),
    sameDay = moment().isSame(later.schedule(schedLightsOn).next(), 'd');
if (afterOff && sameDay) {
    lightsOff(light1);
    console.log("Turning lights on.");
} else {
    lightsOn(light1);
    console.log("Turning lights off.");
}
*/
