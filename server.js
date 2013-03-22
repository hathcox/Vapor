// var http = require('http'), io = require('socket.io'), sys = require('sys'), express = require('express');
var stringExtention = require('./extensions');
var vapor = require('./model/Vapor.js');
var cookies = require('cookies');


// var port = 80;
// var currentClient;

var userList = {};

// var server = express.createServer();
// server.use(express.static(__dirname + '/public'));
// server.use(express.errorHandler({
// 	showStack : true,
// 	dumpExceptions : true
// }));
 var express = require('express');
 var app = express();
 var http = require('http');
 var server = http.createServer(app);
 var io = require('socket.io').listen(server);


server.listen(80);
 console.log("server started");

app.use("/", express.static(__dirname + '/public'));

 app.get('/',function(req,res){
     res.sendfile(__dirname + '/public/index.html');
 });

// server.listen(port);

// var socket = io.listen(server);
var lastMessage;
var messages = [];

io.sockets.on('connection', function(client) {
	var connected = true;

	userList[client.id] = new vapor.Vapor();
	
	client.on('message', function(m) {
		console.log('Message received: ' + m);
		parseMessage(m, client);
	});
	client.on('disconnect', function() {
		connected = false;
	});

	var tick = function() {
		if (!connected) {
			return;
		}
		client.send(messages);
		findLeader(client);
		setTimeout(tick, 1000);
	};

	tick();
});

function findLeader(client) {
	var leader = "None";
	var highestMoney = 0;
	for ( var user in userList) {
		if (userList[user].money > highestMoney) {
			highestMoney = userList[user].money;
			leader = user;
		}
	}
	if (leader != "None") {
		client.emit('leader', "Leader: [" + leader + "] Money: ["
				+ userList[leader].money + "]");
	} else {
		client.emit('leader', "Leader: [None] Money: [0]");
	}
}

function parseMessage(m, client) {
	// If we didn't recieve null
	if (m != '') {
		if (m.startsWith('chat ')) {
			// Deal with massive strings here
			m = client.id + " :: "
					+ m.substring('chat '.length, Math.min(m.length, 50));
			lastMessage = m;
			messages.push(m);
		}

		else if (m.startsWith('calc ')) {
			m = m.substring('calc '.length, m.length);
			try {
				client.emit('gameInfo', eval(m));
			} catch (err) {
				client.emit('gameInfo', err.toString());
			}
		}

		else if (m.startsWith('scan ')) {
			// Deal with massive strings here
			m = m.substring('scan '.length, m.length);

			var serviceList = userList[client.id].scanBox(m);
			var boxList = userList[client.id].scanNetwork(m);

			if (serviceList != undefined) {
				var returnString = "";
				for ( var index = 0; index < serviceList.length; index++) {
					returnString += "<div id=\"info\">--" + serviceList[index]
							+ "</div>";

				}
				client.emit('gameInfo', "Services: " + returnString);
			} else if (boxList != undefined) {
				var returnString = "";
				for ( var index = 0; index < boxList.length; index++) {
					returnString += "<div id=\"info\">--" + boxList[index]
							+ "</div>";

				}
				client.emit('gameInfo', "Boxes: " + returnString);
			} else {
				client.emit('gameInfo', "Unknown Scan Target!");
			}
		}

		else if (m.startsWith('hack ')) {
			// Deal with massive strings here
			m = m.substring('hack '.length, m.length);
			mArray = m.split(" ");
			// If they likely entered a valid command
			if (mArray.length == 2) {
				var boxName = mArray[0];
				var exploitName = mArray[1];
				// Attempt to hack the box with that exploit
				if (userList[client.id].hackBox(boxName, exploitName) == true) {
					client.emit('gameInfo',
							"Started reverse handler on localhost:4444");
					client.emit('gameInfo', 'Trying target ' + boxName + '...');
					client.emit('gameInfo', 'Binding to ' + guidGenerator()
							+ ':ncacn_ip_tcp:' + boxName + '[135]')
					client.emit('sleep', '2000');
					client.emit('gameInfo', "Exploit [" + exploitName
							+ "] successfully hacked [" + boxName + "] !");
				} else if (userList[client.id].hackBox(boxName, exploitName) == false) {
					client.emit('gameInfo',
							"Started reverse handler on localhost:4444");
					client.emit('gameInfo', 'Trying target ' + boxName + '...');
					client.emit('sleep', '2000');
					client.emit('gameInfo', "Exploit [" + exploitName
							+ "] failed to hack [" + boxName + "]");
				} else {
					client.emit('gameInfo', "Invalid Exploit or Box");
				}
			} else {
				client
						.emit('gameInfo',
								"Invalid Formatting of [hack] command!");
			}
		}

		else if (m.startsWith('connect ')) {
			// Deal with massive strings here
			m = m.substring('connect '.length, m.length);
			if (userList[client.id].connect(m)) {
				client.emit('gameInfo', "Atempting to Connect...");
				client.emit('sleep', '1000');
				client.emit('gameInfo', "Succesfully Connected to: "
						+ userList[client.id].currentConnection);
			} else {
				client.emit('sleep', '1000');
				client.emit('gameInfo', "Connection Timeout!");
			}

		}

		else if (m == 'networks') {
			var networks = userList[client.id].networks();
			var returnString = "Networks: ";
			for ( var int = 0; int < networks.length; int++) {
				returnString += "<div id=\"info\">--" + networks[int].alias
						+ "</div>";
			}
			client.emit('gameInfo', returnString);
		}

		else if (m == 'ifconfig') {

			client.emit('gameInfo', "eth0 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "
					+ "Link encap: Ethernet &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "
					+ "HWaddr: de:ad:be:ee:ee:ff<div id=\"info\"> &nbsp;&nbsp;"
					+ "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
					+ "&nbsp;&nbsp; inet addr: &nbsp;"
					+ userList[client.id].currentConnection
					+ " &nbsp;&nbsp;&nbsp;&nbsp; Mask: 255.255.255.0 </div>");
		}

		else if (m == 'exploits') {
			var exploits = userList[client.id].exploits();
			var returnString = "Exploits: ";
			for ( var int = 0; int < exploits.length; int++) {
				returnString += "<div id=\"info\">--" + exploits[int].alias
						+ "</div>";
			}
			client.emit('gameInfo', returnString);
		}

		else if (m == 'money') {
			client.emit('gameInfo', "Money: " + userList[client.id].money);
		} else if (m == 'clear') {
			client.emit('gameInfo', "clear");
		}

		else if (m == 'starwars') {
			client.emit('starwars', '!');
		}

		else if (m == 'help' || m == 'Help') {
			client
					.emit(
							'gameInfo',
							"Valid Commands:<div id=\"info\"> [clear] [networks] [exploits] [scan $network/$box] [calc $expression]</div> <div id=\"info\"> [ifconfig] [connect $network] [hack $box $exploit]");
		} else {
			client
					.emit(
							'gameInfo',
							m
									+ ": command not found<div id=\"info\">Try [help] to get a list of commands</div>")
		}
	}
};

function guidGenerator() {
	var S4 = function() {
		return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
	};
	return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4());
}

function sleep(miliseconds) {
	var startTime = new Date().getTime();
	while (startTime + miliseconds > new Date().getTime())
		;
	return;
}
