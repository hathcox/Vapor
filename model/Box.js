function Box(boxName, money) {
	this.alias = boxName;
	this.serviceList = new Array();
	this.money = money;
	this.hacked = false;
}

Box.prototype.installService = function(service) {
	//Confirm its a valid service
	this.serviceList.push(service);
};

Box.prototype.exploit = function(exploit) {
	//Iterate over every running service and attempt to root it
	for(var index =0; index < this.serviceList.length; index++) {
		if(this.serviceList[index].isExploitable(exploit)) {
			//Push the return back down to the client
			//Exploit succedded
			this.hacked = true;
			return true;
		}
	}
	//Failed
	return false;
};

Box.prototype.removeService = function(service) {
	//confirm its a valid service
	
	//If we have that service in our list
	if(this.serviceList.indexOf(service) != -1) {
		//Remove that item
		this.serviceList.remove(this.serviceList.indexOf(service));
		return true;
	}
	//not found!
	return false;
};

Box.prototype.toString = function() {
	return this.alias;
}

exports.Box = Box;
