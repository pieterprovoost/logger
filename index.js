var serialport = require("serialport");
var SerialPort = serialport.SerialPort;
var wsserver = require("ws").Server;
var http = require("http");
var express = require("express");

var apiport = 80;
var wsport = 8081;

var ports = {};

// api

var app = express();

app.use(express.static(__dirname + "/static"));
app.get("/ports", function(req, res, next) {
	serialport.list(function(error, ports) {
		res.send(ports);
	});
});

app.listen(apiport);
console.log("api running on port " + apiport);

// websocket

var wss = new wsserver({ port: wsport });
console.log("websocket running on port " + wsport);

wss.on("connection", function(client) {

	var path = client.upgradeReq.url;

	if (ports.hasOwnProperty(path)) {

		ports[path].connections.push(client);

	} else {

		ports[path] = {
			connections: [ client ]
		};

		var serialPort = new SerialPort(path, {
			baudrate: 9600,
			parser: serialport.parsers.readline("\n")
		});

		serialPort.on("open", function () {
			serialPort.on("data", function(data) {
				for (c in ports[path].connections) {
					ports[path].connections[c].send(data);
				}
			});
		});

	}

	client.on("close", function() {
		var position = ports[path].connections.indexOf(client);
		ports[path].connections.splice(position, 1);
	});

});
