Victor.prototype.scale = function(scalar) {
	this.x *= scalar;
	this.y *= scalar;
	return this;
}

Victor.prototype.scaleX = function(scalar) {
	this.x *= scalar;
	return this;
}

Victor.prototype.scaleY = function(scalar) {
	this.y *= scalar;
	return this;
}