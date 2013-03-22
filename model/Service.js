function Service(serviceName, exploitList) {
	this.alias = serviceName;
	this.exploitList = exploitList;
}

Service.prototype.isExploitable = function(exploit) {
	//If it's a valid exploit
	if(exploit) {
		//If we are vulnrable to that exploit
		for ( var index = 0; index < this.exploitList.length; index++) {
			
			if(exploit.alias == this.exploitList[index].alias) {
				return true;
			}
		}
		return false
	}
};

Service.prototype.toString = function() {
	return this.alias;
}

exports.Service = Service;