Variation = function(min,max,time,wait,delay) {
	this.initialization(min,max,time,wait,delay);
}

Variation.prototype = new createjs.Container();

Variation.prototype.initialization = function(min,max,time,wait,delay) {

	if(typeof(min)==='undefined') min = 0;
	if(typeof(max)==='undefined') max = 1;
	if(typeof(time)==='undefined') time = 1000;
	if(typeof(wait)==='undefined') wait = 0;
	if(typeof(delay)==='undefined') delay = 0;

	this.min = min;
	this.max = max;
	this.time = time;
	this.wait = wait;
	this.delay = delay;
	this.stop = false;

	//intial value
	this.x = min;
	//start vairation
	this.startVariation();

}
Variation.prototype.startVariation = function() {

	if(this.stop === true) return;

	createjs.Tween.get(this)
			.to({x:this.max},Math.random()*this.time)
			.wait(Math.random()*this.wait)
			.to({x:this.min},Math.random()*this.time)
			.call(this.startVariation);
}
Variation.prototype.toString = function() {
	return this.x;
}
Variation.prototype.valueOf = function() {
	return this.x;
}

/* setters */
Variation.prototype.stop = function() {
	this.stop = true;
	return this;
}
Variation.prototype.start = function() {
	this.stop = false;
	this.startVariation();
	return this;
}
Variation.prototype.setMin = function(min) {
	this.min = min;
	return this;
}
Variation.prototype.setMax = function(max) {
	this.max = max;
	return this;
}
Variation.prototype.setTime = function(time) {
	this.time = time;
	return this;
}
Variation.prototype.setWait = function(wait) {
	this.wait = wait;
	return this;
}
Variation.prototype.setDelay = function(delay) {
	this.delay = delay;
	return this;
}