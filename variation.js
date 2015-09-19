Variation = function(min,max,time,wait,delay,cycles,callback,loop) {
	return this.initialization(min,max,time,wait,delay,cycles,callback,loop);
}

Variation.prototype = new createjs.Container();

Variation.prototype.initialization = function(min,max,time,wait,delay,cycles,callback,loop) {
	
	if(typeof(min)==='undefined' || min === null) min = 0;
	if(typeof(max)==='undefined' || max === null) max = 1;
	if(typeof(time)==='undefined' || time === null) time = 1000;
	if(typeof(wait)==='undefined' || wait === null) wait = 0;
	if(typeof(delay)==='undefined' || delay === null) delay = 0;
	if(typeof(cycles)==='undefined' || cycles === null) cycles = null;
	if(typeof(delay)==='undefined' || callback === null) callback = function() {};
	if(typeof(loop)==='undefined' || loop === null) loop = null;


	this.min = min;
	this.max = max;
	this.time = time;
	this.wait = wait;
	this.delay = delay;
	this.stop = false;
	this.cycles = cycles;
	this.cycle = 0;
	this.callback = callback;
	this.loop = loop;

	//intial value
	this.x = min;
	//start vairation
	this.beginVariation();

	return this;

}
Variation.prototype.beginVariation = function() {

	if(this.stop === true) return;

	var tween = createjs.Tween.get(this);
	tween.to({x:this.max},this.time);
	tween.wait(Math.random()*this.wait);
	if(this.loop == true) tween.to({x:this.min},this.time);
	tween.call(proxy(this.restartVariation,this));

}
Variation.prototype.restartVariation = function() {

	this.cycle++;

	if(this.cycles == null) return this.beginVariation();

	if(this.cycle < this.cycles) return this.beginVariation();

	if(this.cycle == this.cycles) return this.callback();
		
	return this.stop();
	
}

/* getters */
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
Variation.prototype.restart = function() {
	this.stop = false;
	this.startVariation();
	return this;
}
Variation.prototype.min = function(min) {
	this.min = min;
	return this;
}
Variation.prototype.max = function(max) {
	this.max = max;
	return this;
}
Variation.prototype.time = function(time) {
	this.time = time;
	return this;
}
Variation.prototype.wait = function(wait) {
	this.wait = wait;
	return this;
}
Variation.prototype.delay = function(delay) {
	this.delay = delay;
	return this;
}
Variation.prototype.cycles = function(nb) {
	this.cycles = nb;
	return this;
}
Variation.prototype.callback = function(fn) {
	this.callback = fn;
	return this;
}
Variation.prototype.loop = function(bool) {
	this.loop = bool;
	return this;
}