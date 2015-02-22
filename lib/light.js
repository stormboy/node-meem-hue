/**
 * An individual hue light
 */

var meem = require('meem');
var util = require('util');
var tinycolor = require("./tinycolor");

var TRACE = true;


var HueLight = module.exports = function HueLight(def) {
	meem.Meem.call(this, def, this._getProperties(), this._getFacets());
	
	var self = this;
	
	this.state = def.state;
	
	this.hueBus = def.subsystemBus;
	this.hueBus.on(this.getContentValue("id"), function(status) {
		self._handleHueState(status.state);
		
		if (typeof status.reachable !== 'undefined') {
			// TODO send appropriate lifecycle event. if not reachable then "missing"
			//self.emit("lifecycle", "loaded");
		}
		
		// handle other status parameters
		/*
		if (status.name) {
			self.setPropertyValue("name", status.name);
		}
		if (status.model) {
			self.setPropertyValue("model", status.model);
		}
		if (status.swversion) {
			self.setPropertyValue("swversion", status.swversion);
		}
		*/
	});
};

util.inherits(HueLight, meem.Meem);

HueLight.prototype._getProperties = function(config) {
	var properties = {
		name: {
			description: "name of device",
			type: String,
			"default": "Hue light"
		},
		type: {
			description: "type of device",
			type: String,
			"default": "Extended color light",
			editable: false
		},
		modelid: {
			description: "model ID",
			type: String,
			editable: false
		},
		swversion: {
			description: "version of device firmware",
			type: String,
			editable: false
		}
	};
	return properties;
};

/**
 * Define the facets for this Meem.
 */
HueLight.prototype._getFacets = function() {
	var self = this;

	var handleBinaryIn = function(message) {
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

	var handleLinearIn = function(message) {
		var value = Math.round(255.0*(message.value/100.0));
		if (self.state.bri != value) {			// send state change to Hue light
			var deviceId = self.getContentValue("id");
			var state = {
				bri: value
			};
			self.hueBus.sendMessage(deviceId, state);
		}
	};
	var handleLinearOutRequest = function(request) {
		request.respond({
			value: 100.0 * (self.state.bri / 255.0),		// percentage
			unit: "%"
		});
	};

	var handleColorIn = function(message) {
		//{ r: , g: , b};
		var color = tinycolor(message.value);
		
		//if (self.state.bri != value) {			// send state change to Hue light
			var hsv = color.toHsv();
			var deviceId = self.getContentValue("id");
			var state = {
				hue: Math.round(hsv.h*65535/360),		// 0..65535
				sat: Math.round(hsv.s*255),		// 0..255
				bri: Math.round(hsv.v*255)		// 0..255
			};
			console.log("state: " + JSON.stringify(state));
			self.hueBus.sendMessage(deviceId, state);
		//}
	};
	var handleColorOutRequest = function(request) {
		var hsv = {
			h: self.state.hue*360/65535,
			s: self.state.sat/255,
			v: self.state.bri/255
		};
		var color = tinycolor(hsv);
		var rgb = color.toRgb();
		request.respond({
			value: {r: rgb.r, g: rgb.g, b: rgb.b},		// percentage
			unit: "rgb"
		});
	};

	var facets = {
		binaryIn: {
			type: "org.meemplex.Binary", 
			direction: meem.Direction.IN, 
			description: "To turn light on and off",
			handleMessage: handleBinaryIn
		},
		binaryOut: {
			type: "org.meemplex.Binary", 
			direction: meem.Direction.OUT, 
			description: "To give on-off state of light",
			handleContentRequest: handleBinaryOutRequest
		},
		
		linearIn: {
			type: "org.meemplex.Linear", 
			direction: meem.Direction.IN, 
			description: "To control light level",
			handleMessage: handleLinearIn
		},
		linearOut: {
			type: "org.meemplex.Linear", 
			direction: meem.Direction.OUT, 
			description: "To deliver state of light level",
			handleContentRequest: handleLinearOutRequest
		},
		
		colorIn: {
			type: "org.meemplex.Color", 
			direction: meem.Direction.IN, 
			description: "To control light color",
			handleMessage: handleColorIn
		},
		colorOut: {
			type: "org.meemplex.Color", 
			direction: meem.Direction.OUT, 
			description: "To deliver state of light color",
			handleContentRequest: handleColorOutRequest
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
	
	var hasStateChanged = false;
	
	if (this.state.on != state.on) {
		hasStateChanged = true;
	}
	if (this.state.bri != state.bri) {
		hasStateChanged = true;
	}
	if (this.state.hue != state.hue) {
		hasStateChanged = true;
	}
	if (this.state.sat != state.sat) {
		hasStateChanged = true;
	}

	if (hasStateChanged) {
		this.state.on = state.on;
		this.state.bri = state.bri;
		this.state.hue = state.hue;
		this.state.sat = state.sat;
	
		// send value to output facet
		this.sendMessage("binaryOut", {
			value: this.state.on
		});
		this.sendMessage("linearOut", {
			value: 100.0 * (this.state.bri/255.0),
			unit: "%"
		});
		
		var hsv = {
			h: this.state.hue*360/65535,
			s: this.state.sat/255,
			v: this.state.bri/255
		};
		var rgb = tinycolor(hsv).toRgb();
		this.sendMessage("colorOut", {
			value: {r: rgb.r, g: rgb.g, b: rgb.b},		// percentage
			unit: "rgb"
		});

		// TODO send other state variable changes
	}
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