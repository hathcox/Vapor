var Network = require('./Network.js').Network;
var Box = require('./Box.js').Box;
var Exploit = require('./Exploit.js').Exploit;
var Service = require('./Service.js').Service;

function Vapor() {
	//List of all Networks
	this.networkList = new Array();
	//List of all Exploits
	this.exploitList = new Array();
	
	//Currently owned Networks
	this.currentNetworks = new Array();
	//Currently owned Exploits
	this.currentExploits = new Array();

	//Current network
	this.currentConnection = null;
	//Current money
	this.money = 0;
	
	//Build our Vapor instance
	this.build();
}

Vapor.prototype.build = function() {
	//Set up all the networks and exploits  
	console.log('building...');  
	//Connect to the default network
	//Test build
	var testExploit = new Exploit("testExploit");
	var localhostExploit = new Exploit("localhost");
	var unhackable = new Exploit("Unobtainium");
	
	var localHostBox = new Box("127.0.0.1",100);
	localHostBox.installService(new Service("Local Host RPC v 2.4", [localhostExploit]));
	var anotherBox = new Box("192.168.1.116", 1000);
	anotherBox.installService(new Service("Totaly Secure Service", [testExploit]));
	
	var secretBox = new Box("secret", 9001);
	secretBox.installService(new Service("Http", []));
	
	var testNetwork = new Network("test", [localHostBox, anotherBox]);
	var adminNetwork = new Network("admin", [secretBox]);
	
	this.networkList = [testNetwork,adminNetwork];
	this.exploitList = [testExploit, localhostExploit];

	this.currentNetworks = this.networkList;
	this.currentExploits = this.exploitList;
	
	//Set default connection
	this.currentConnection = this.currentNetworks[0];

	//Give the boxes services
};


// for the [networks] command
Vapor.prototype.networks = function() {
	return this.currentNetworks;
};

//for the [scan] command when a IP is supplied

Vapor.prototype.scanBox = function(boxName) {
	//Confirm that a box object was supplied
	if(boxName) {
		//If that box is in our current network
		for ( var index = 0; index < this.currentConnection.boxList.length; index++) {
			if( boxName == this.currentConnection.boxList[index].alias) {
				return this.currentConnection.boxList[index].serviceList;
			}
			
		}
	}
};

//for the [scan] command when a network name is supplied
Vapor.prototype.scanNetwork = function(network) {
	//Confirm that it is a network object	
	if(network) {
		//If that network is accessable
		for ( var index = 0; index < this.currentNetworks.length; index++) {
			if( network == this.currentNetworks[index].alias) {
				return this.currentNetworks[index].boxList;
			}
			
		}
	}
};

//for the [hack box.alias exploit] command
Vapor.prototype.hackBox = function(boxName, exploitName) {
	//Confirm that it is a valid box object and a valid exploit object
	if(boxName && exploitName) {
		var box, exploitObject;
		//Grab the box and exploit
		for ( var index = 0; index < this.currentConnection.boxList.length; index++) {
			if( boxName == this.currentConnection.boxList[index].alias) {
				box = this.currentConnection.boxList[index];
			}
			
		}
		for (var index = 0; index < this.currentExploits.length; index++) {
			if(exploitName == this.currentExploits[index].alias) {
				exploitObject = this.currentExploits[index];
			}
		}
		//If we found the box and the exploit
		if(box && exploitObject) {
			//If we havent already been hacked
			if(!box.hacked) {
				console.log("inside!");
				if(box.exploit(exploitObject)) {
					//Add money and remove the boxes money
					this.money += box.money;
					box.money = 0;
					return true;
				}
				//That exploit didn't work
				else {
					return false;	
				}
			} else {
				return false;
			}
		}
	}
};

//for the [exploits] command
Vapor.prototype.exploits = function() {
	return this.currentExploits;
};

//for the [connect network.alias] command
Vapor.prototype.connect = function(network) {
	//If the network is a valid network
	if(network) {
		for ( var index = 0; index < this.currentNetworks.length; index++) {
			if(network == this.currentNetworks[index].alias) {
				this.currentConnection = this.currentNetworks[index];
				return true;
			}
			
		}
	}
	return false;
};

exports.Vapor = Vapor;

exports.Box = Box;
//BACK END SPECIFIC COMMANDS
