"use strict";
/* eslint no-console: "off", no-unused-vars: "off" */
/* this is a module, it should return an array of devices */
const fs = require("fs"),
	EventEmitter = require("events"),
	Device = require("./device.js");

module.exports = (config) => {
	const devices = new EventEmitter();
	devices.dev = {};

	devices.add = (devConfig) => {
        // should look like { deviceID: "xxxx", deviceType: enum:[button, dimmer, virtual]}
		const device = Device(devConfig);
		let devID = device.deviceID;
		if (!devices.dev[devID]) {
			devices.dev[devID] = device;
			devices.emit("added", device);
			return devices;
		} else {
			devices.emit("error", new Error("device: " + device.deviceID + " already exists."));
			return devices;
		}
	};

	devices.list = () => {
		return Object.keys(devices.dev);
	};

	devices.query = (search) => {
		return devices.dev.find((el) => {
			let searchKey = Object.keys(search),
				searchValue = search[searchKey];
			if (el.searchKey) {
				if (el.searchKey === searchValue) {
					return el;
				}
			}
		});
	};

	devices.save = () => {
		let devJSON = [];
		Object.keys(devices.dev).forEach((el) => {
			let j = {};
			Object.keys(devices.dev[el]).forEach((k) => {
				switch (k) {
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
						j[k] = devices.dev[el][k];
						break;
					}
				}
			});
			devJSON.push(j);
		});
		fs.writeFileSync("devices.json", JSON.stringify(devJSON, null, 4), {
			encoding: "utf-8",
			mode: 0o644
		});
		devices.emit("saved", devJSON);
	};

	devices.remove = (deviceID) => {
		if (!devices.dev[deviceID]) {
            //nothing to do
			return devices;
		}
		delete devices.dev[deviceID];
		devices.emit("removed", deviceID);
		return devices;
	};
	devices.on("added", (msg) => {
		console.log("added: " + JSON.stringify(msg, null, 2));
	});
	devices.on("removed", (msg) => {
		console.log(`removed: ${msg}`);
	});

	function init() {
		let configData = JSON.parse(fs.readFileSync("devices.json", "utf-8"));
		if (configData instanceof Array) {
			configData.forEach((devConfig) => {
				devices.add(devConfig);
			});
			return devices;
		}
		return devices;
	}

	if (!config) {
		init();
	}
	return Object.freeze(devices);
};
