function Network(networkName, boxList) {
	this.alias = networkName;
	this.boxList = boxList;
}

Network.prototype.addBox = function(box) {
	//Confirm that it is a box
	if(box) {
		this.boxList.push(box);
	}
};

Network.prototype.toString = function() {
	return this.alias;
}

exports.Network = Network;