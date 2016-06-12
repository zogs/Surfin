Variation = function(config) {


	config = config || {};
	this.min = config.min != undefined ? config.min : 1;
	this.max = config.max != undefined ? config.max : 100;
	this.time = config.time != undefined ? config.time : 1000;
	this.wait = config.wait != undefined ? config.wait : 0;
	this.delay = config.delay != undefined ? config.delay : 0;
	this.loops = config.loops != undefined ? config.loops : null;
	this.call = config.call != undefined ? config.call : null;
	this.callback = config.callback != undefined ? config.callback : null;
	this.slope = config.slope != undefined ? config.slope : 'both';	
	this.stop = config.stop != undefined ? config.stop : false;
	this.override = config.override != undefined ? config.override : true;
	this.loop = 0;

	//check if 
	this.min = (this.min instanceof Variation)? this.min.valueOf() : this.min;
	this.max = (this.max instanceof Variation)? this.max.valueOf() : this.max;

	
	this.beginVariation();	
}

Variation.prototype.beginVariation = function() {
	
	if(this.stop === true) return;
	this.w = this.min;
	var tween = createjs.Tween.get(this, {override: this.override});
	if(this.slope == 'both' || this.slope == 'up') tween.to({w:this.max},this.time);
	if(this.wait != 0) tween.wait(Math.random()*this.wait);
	if(this.slope == 'both' || this.slope == 'down') tween.to({w:this.min},this.time);
	tween.call(proxy(this.restartVariation,this));
	tween.on('change',proxy(this.onchange,this));

}

Variation.prototype.restartVariation = function() {

	this.loop++;
	if(this.loops === false) return;
	if(this.loops === true || this.loops === null) return this.beginVariation();
	if(this.loop < this.loops) return this.beginVariation();
	if(this.loop == this.loops && this.callback != null) this.callback();			
	return this.stop = true;
	
}


Variation.prototype.applyOnce = function (obj,prop,config) {

	if(obj[prop] instanceof Variation) return;

	return obj[prop] = new Variation(config);
}
/* getters */
Variation.prototype.toString = function() {
	return this.w;
}
Variation.prototype.valueOf = function() {
	return this.w;
}
Variation.prototype.onchange = function() {

	//call register function on every frame
	if(this.call != null) this.call();

	//debuging
	//console.log(this.w);
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
Variation.prototype.setCallback = function(call) {
	this.callback = call;
	return this;
}
Variation.prototype.setSlope = function(slope) {
	this.slope = slope;
	return this;
}