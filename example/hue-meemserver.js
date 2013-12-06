var HueDiscovery = require("../lib/discovery");
var HueBridge = require("../lib/bridge");

var meem = require("meem");
// var meem = require("../../node-meem/");
var config = require("./config");
var hue = require("../");

config.namespaces = {
	"org.meemplex.core" : meem.meems.core,
	"org.meemplex.demo" : meem.meems.demo,
	"net.sugarcoding.hue": hue,
	//"net.sugarcoding.hue": require("meem-hue"),
	//"net.sugarcoding.upnp": require("meem-upnp"),
	//"net.sugarcoding.nest": require("meem-nest"),
	//"net.sugarcoding.avr": require("meem-avr"),
	//"net.sugarcoding.zbee": require("meem-zbee"),
	//"net.sugarcoding.datalog": require("meem-datalog"),
	//"net.sugarcoding.raven": require("meem-raven"),
};

var meemServer = new meem.MeemServer(config);
meemServer.start();

var handleDiscoveryMeem = function(discoveryMeem) {
	discoveryMeem.on("discovered", function(bridges) {
		console.log("--- got bridges: " + JSON.stringify(bridges));
	});
	discoveryMeem.discover();
};


var meemId = "MyHueDiscoverer";
var meemDef = {
	id: meemId,
	type: "net.sugarcoding.hue.HueDiscovery",
	//persistent: false,
	content: {
	}
};

meemServer.locateMeem(meemId, function(err, meem) {
	if (meem) {
		console.log("--- located hue discovery meem");
		handleDiscoveryMeem(meem);
	}
	else {
		console.log("--- hue discovery meem not found, create one");
		meemServer.addMeem(meemDef, function(err, discoveryMeem) {
			if (err) {
				console.log("--- problem while creating discovery meem: " + err);
				//return;
			}
			if (!discoveryMeem) {
				console.log("--- no discovery meem found");
				return;
			}
			console.log("--- HueDiscoverer created");
			handleDiscoveryMeem(discoveryMeem);
		});
	}
});
