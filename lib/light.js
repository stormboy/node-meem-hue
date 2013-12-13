/**
 * An individual hue light
 */

var meem = require('meem');
var util = require('util');

var TRACE = true;


var HueLight = module.exports = function HueLight(def) {
	meem.Meem.call(this, def, this._getProperties(), this._getFacets());
	
	var self = this;
	
	this.state = def.state;
	
	this.hueBus = def.subsystemBus;
	this.hueBus.on(this.getContentValue("id"), function(status) {
		self._handleHueState(status.state);
		// TODO handle other status parameters
	});
};

util.inherits(HueLight, meem.Meem);

HueLight.prototype._getProperties = function(config) {
	var properties = {
		type: {
			description: "type of device",
			type: String,
			value: "Extended color light",
			editable: false
		},
		name: {
			description: "name of device",
			type: String,
			value: "Hue light"
		},
		modelid: {
			description: "model ID",
			type: String,
			value: null
		},
		swversion: {
			description: "version of device firmware",
			type: String,
			value: null
		},
	};
	return properties;
};

/**
 * Define the facets for this Meem.
 */
HueLight.prototype._getFacets = function() {
	var self = this;

	var handleBinaryIn = function(message) {
		// if (TRACE) {
			// console.log("HueLight: receive message: " + JSON.stringify(message));
		// }

		if (self.state.on != message.value) {
			// send state change to Hue light
			if (TRACE) {
				console.log("HueLight: sending value to hue light: " + JSON.stringify(message));
			}
			var deviceId = self.getContentValue("id");
			var state = {
				on: message.value
			};
			self.hueBus.sendMessage(deviceId, state);
		}
	};

	var handleBinaryOutRequest = function(request) {
		request.respond({
			value: self.state.on
		});
	};

	var facets = {
		binaryIn: {
			type: "org.meemplex.Binary", 
			direction: meem.Direction.IN, 
			description: "a description for the input",
			handleMessage: handleBinaryIn
		},
		binaryOut: {
			type: "org.meemplex.Binary", 
			direction: meem.Direction.OUT, 
			description: "a description for the output",
			handleContentRequest: handleBinaryOutRequest
		}
	};

	return facets;
};


/*
"state": {
        "on": true,
        "bri": 254,
        "hue": 14922,
        "sat": 144,
        "xy": [
          0.4595,
          0.4105
        ],
        "ct": 369,
        "alert": "none",
        "effect": "none",
        "colormode": "ct",
        "reachable": false
      },
      "type": "Extended color light",
      "name": "Kitchen Bench",
      "modelid": "LCT001",
      "swversion": "65003148",
      "pointsymbol": {
        "1": "none",
        "2": "none",
        "3": "none",
        "4": "none",
        "5": "none",
        "6": "none",
        "7": "none",
        "8": "none"
      }
 */
/**
 * Handle state received from Hue device
 */
HueLight.prototype._handleHueState = function(state) {
	if (TRACE) {
		console.log("HueLight: got hue state from device: " + JSON.stringify(state));
	}

	// TODO check which values have changed so as to determine which facets to send messages to.
	
	if (this.state.on != state.on) {
		// binary changed
		//onHasChanged = true;
	}

	this.state.on = state.on;

	// 	TODO check if (onHasChanged)
	// send value to output facet
	var outFacet = this.getFacet("binaryOut");
	outFacet.handleMessage({
		value: this.state.on
	});
};


/*
 Light state from the Hue Bridge:
{
      "state": {
        "on": true,
        "bri": 254,
        "hue": 14922,
        "sat": 144,
        "xy": [
          0.4595,
          0.4105
        ],
        "ct": 369,
        "alert": "none",
        "effect": "none",
        "colormode": "ct",
        "reachable": false
      },
      "type": "Extended color light",
      "name": "Kitchen Sink R",
      "modelid": "LCT001",
      "swversion": "65003148",
      "pointsymbol": {
        "1": "none",
        "2": "none",
        "3": "none",
        "4": "none",
        "5": "none",
        "6": "none",
        "7": "none",
        "8": "none"
      }
    }
 */