Variation = function(config) {


	config = config || {};
	this.min = config.min || 1;
	this.max = config.max || 100;
	this.time = config.time || 1000;
	this.wait = config.wait || 0;
	this.delay = config.delay || 0;
	this.loops = config.loops || null;
	this.call = config.call || null;
	this.slope = config.slope || 'both';	
	this.stop = config.stop || false;
	this.loop = 0;


	this.x = this.min;

	this.beginVariation();


	
}

Variation.prototype.beginVariation = function() {

	if(this.stop === true) return;

	var tween = createjs.Tween.get(this);
	if(this.slope == 'both' || this.slope == 'up') tween.to({x:this.max},this.time);
	if(this.wait != 0) tween.wait(Math.random()*this.wait);
	if(this.slope == 'both' || this.slope == 'down') tween.to({x:this.min},this.time);
	if(this.call != null) tween.call(proxy(this.restartVariation,this));

}

Variation.prototype.restartVariation = function() {

	this.loop++;
	if(this.loops == null) return this.beginVariation();
	if(this.loop < this.loops) return this.beginVariation();
	if(this.loop == this.loops && this.call != null) this.call();			
	return this.stop = true;
	
}

/* getters */
Variation.prototype.toString = function() {
	return this.x;
}
Variation.prototype.valueOf = function() {
	return this.x;
}

/* setters */
Variation.prototype.setStop = function() {
	this.stop = true;
	return this;
}
Variation.prototype.restart = function() {
	this.stop = false;
	this.beginVariation();
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
Variation.prototype.setLoops = function(loops) {
	this.loops = loops;
	return this;
}
Variation.prototype.setCall = function(call) {
	this.call = call;
	return this;
}
Variation.prototype.setSlope = function(slope) {
	this.slope = slope;
	return this;
}