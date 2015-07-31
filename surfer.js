Surfer = function(x,y) {
	this.initialization();
}
Surfer.prototype = new createjs.Container();


Surfer.prototype.initialization = function() {
	
	this.wave;

	this.silhouette = new createjs.Container();
	this.silhouette.x = this.silhouette.y = -40;
	this.silhouette.scaleX = 1.5;
	this.silhouette.addChild(new createjs.Bitmap(queue.getResult('surfer_E')));
	this.addChild(this.silhouette);

	this.debug_cont = new createjs.Container();
	this.addChild(this.debug_cont);

	this.location = null;
	this.locations = [];
	this.trailpoints = [];
	this.velocity = vec2.create();
	this.velocities = [];
	this.speed = 0;
	this.gravity = vec2.fromValues(0,1);
	this.status;	

	surfer = this;
	
	this.addEventListener('tick',this.tick);
}

Surfer.prototype.takeOff = function(x,y) {

	this.location = vec2.fromValues(x,y);
	return this;
}

Surfer.prototype.setWave = function(wave) {

	this.wave = wave;
	return this;
}

Surfer.prototype.tick = function() {

	surfer.move();

}

Surfer.prototype.getVanishPoint = function() {

	return surfer.wave.getClosestVanishPoint(surfer.x);
}

Surfer.prototype.isOnWave = function() {
	if(surfer.y >= 0) return true;
	return false;
}
Surfer.prototype.moveOnWave = function() {

	//set status
	surfer.status = 'ride';

	//interpolation to mouse
	var mouse = _getMousePoint(0);
	var mouse = surfer.wave.cont.globalToLocal(mouse.x,mouse.y);
	vec2.lerp(surfer.location,surfer.location,vec2.fromValues(mouse.x,mouse.y),0.1);

	//interpolation to vanish
	var vanish = surfer.getVanishPoint();
	//vanish = surfer.wave.cont.globalToLocal(vanish.x,vanish.y);
	vec2.lerp(surfer.location,surfer.location,vec2.fromValues(vanish.x,vanish.y),0.05);
}

Surfer.prototype.isOnAir = function() {
	if(surfer.y < 0) return true;
	return false;
}
Surfer.prototype.moveOnAir = function() {

	//add initial velocity
	vec2.add(surfer.location,surfer.location,surfer.velocity);
	//add gravity
	vec2.add(surfer.location,surfer.location,surfer.gravity);
}

Surfer.prototype.startArial = function() {

	//call wave spatter
	surfer.wave.drawSpatter();
	
	//if already on air
	if(surfer.status=='arial') return;


	//set current status
	surfer.status = 'arial';
}

Surfer.prototype.move = function() {

	if( surfer.isOnAir() ) {	

		surfer.startArial();
		surfer.moveOnAir();
	}
	else {


		surfer.moveOnWave();		
	}

	//set surfer position
	surfer.x = surfer.location[0];
	surfer.y = surfer.location[1];
	
	//set surfer silhouette
	surfer.setSilhouette();

	//stock locations		
	surfer.locations.unshift(vec2.clone(surfer.location));
	surfer.locations = surfer.locations.slice(0,60);

	//stock trails locations
	surfer.trailpoints.unshift(vec2.clone(surfer.location));
	surfer.trailpoints = surfer.trailpoints.slice(0,60);

	//stock velocities
	vec2.sub(surfer.velocity,surfer.locations[0],surfer.locations[1]);	
	surfer.velocities.unshift(vec2.clone(surfer.velocity));
	surfer.velocities = surfer.velocities.slice(0,50);

	//stock speed
	surfer.speed = vec2.dist(surfer.locations[0],surfer.locations[1]);	

}


Surfer.prototype.setSilhouette = function() {	

	if(surfer.locations[1] == undefined) return this.getAngledSilhouette(160);
	var a = Math.atan2(surfer.locations[1][0]-surfer.locations[0][0],surfer.locations[1][1]-surfer.locations[0][1]);
	var deg = a*(180/Math.PI);
	this.silhouette.removeChildAt(0);
	this.silhouette.addChild(this.getAngledSilhouette(deg));
}

Surfer.prototype.getAngledSilhouette = function(deg) {

	// if(deg<=22.5&&deg>-22.5) return new createjs.Bitmap(queue.getResult('surfer_N'));
	// if(deg>22.5&&deg<=67.5) return new createjs.Bitmap(queue.getResult('surfer_NW'));
	// if(deg>67.5&&deg<=112.5) return new createjs.Bitmap(queue.getResult('surfer_W'));
	// if(deg>112.5&&deg<=157.5) return new createjs.Bitmap(queue.getResult('surfer_SW'));
	// if(deg>157.5||deg<=-157.5) return new createjs.Bitmap(queue.getResult('surfer_S'));
	// if(deg>-157.5&&deg<=-112.5) return new createjs.Bitmap(queue.getResult('surfer_SE'));
	// if(deg>-112.5&&deg<=-67.5) return new createjs.Bitmap(queue.getResult('surfer_E'));
	// if(deg>-67.5&&deg<=-22.5) return new createjs.Bitmap(queue.getResult('surfer_NE'));
	deg = deg*-1;
	if(deg>170) return new createjs.Bitmap(queue.getResult('surfer_S'));
	if(deg>160) return new createjs.Bitmap(queue.getResult('surfer_SE'));
	if(deg>140) return new createjs.Bitmap(queue.getResult('surfer_ES'));
	if(deg>120) return new createjs.Bitmap(queue.getResult('surfer_EES'));
	if(deg>100) return new createjs.Bitmap(queue.getResult('surfer_EEES'));
	if(deg>75) return new createjs.Bitmap(queue.getResult('surfer_E'));
	if(deg>60) return new createjs.Bitmap(queue.getResult('surfer_EEEN'));
	if(deg>40) return new createjs.Bitmap(queue.getResult('surfer_EEN'));
	if(deg>20) return new createjs.Bitmap(queue.getResult('surfer_EN'));
	if(deg>10) return new createjs.Bitmap(queue.getResult('surfer_NE'));
	if(deg>-10) return new createjs.Bitmap(queue.getResult('surfer_N'));
	if(deg>-20) return new createjs.Bitmap(queue.getResult('surfer_NW'));
	if(deg>-40) return new createjs.Bitmap(queue.getResult('surfer_NWW'));
	if(deg>-60) return new createjs.Bitmap(queue.getResult('surfer_WNN'));
	if(deg>-75) return new createjs.Bitmap(queue.getResult('surfer_WN'));
	if(deg>-100) return new createjs.Bitmap(queue.getResult('surfer_W'));
	if(deg>-120) return new createjs.Bitmap(queue.getResult('surfer_WS'));
	if(deg>-140) return new createjs.Bitmap(queue.getResult('surfer_WSS'));
	if(deg>-160) return new createjs.Bitmap(queue.getResult('surfer_SW'));
	if(deg>-170) return new createjs.Bitmap(queue.getResult('surfer_SSW'));
	if(deg<=-170) return new createjs.Bitmap(queue.getResult('surfer_S'));
	if(deg<10) return new createjs.Bitmap(queue.getResult('surfer_N'));

}


