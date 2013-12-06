var meem = require('meem');
var hue = require("node-hue-api");
var util = require('util');

var TRACE = false;


var HueDiscovery = module.exports = function HueDiscovery(def) {
	meem.Meem.call(this, def, {}, {});
	this.isSubsystem = true;
};

util.inherits(HueDiscovery, meem.Meem);

HueDiscovery.prototype.discover = function() { 
	var self = this;
	var handleBridges = function(bridges) {
		self._handleBridges(bridges);
	};
	var handleError = function(err) {
		console.log("HueDiscovery: locate error: " + err);
		console.error(err);
	};
	hue.locateBridges().then(handleBridges).fail(handleError).done();
};

HueDiscovery.prototype.search = function() { 
	var self = this;
	var handleBridges = function(bridges) {
		self._handleBridges(bridges);
	};
	var handleError = function(err) {
		console.log("HueDiscovery: search error: " + err);
		console.error(err);
	};
	var timeout = 10000;	// 10 seconds
	hue.searchForBridges(timeout).then(handleBridges).done();
};

HueDiscovery.prototype._handleBridges = function(bridges) { 
	if (TRACE) {
		console.log("HueDiscovery: Hue Bridges Found: " + JSON.stringify(bridges));
	}
	this.emit("discovered", bridges);

	for (var i=0; i<bridges.length; i++) {
		var desc = bridges[i];
		var meemDef = {
			id: "hue_" + desc.id,
			type: "net.sugarcoding.hue.HueBridge",
			//persistent: false,
			content: {
				id: desc.id,
				ip: desc.ipaddress,
				key: "08a902b95915cdd9b75547cb50892dc4"
			}
		};
		
		//console.log("HueDiscovery: creating HueBridge meem");
		// var bridge = new HueBridge(meemDef);
		this.emit("createMeem", meemDef, function(err, meem) {
			if (err) {
				console.log("HueDiscovery: error creating HueBridge meem: " + err);
				return;
			}
			if (TRACE) {
				console.log("HueDiscovery: created HueBridge meem: " + meem);
			}
		});
	}
};

