(function() {
	
	function Surfer(wave) {

		this.Container_constructor();
		this.init(wave);
	}

	var prototype = createjs.extend(Surfer, createjs.Container);
	//add EventDispatcher
	createjs.EventDispatcher.initialize(prototype);
	//public static properties
	prototype.gravity = vec2.fromValues(0,2);
	prototype.silhouette_proportion = 0.04;
	prototype.hitbox_proportion = 0.9;
	prototype.isBot = false;
	prototype.origin_height = 80;
	prototype.height = 80;

	//init 
	prototype.init = function(wave) {

		this.wave = wave;

		this.location = null;
		this.locations = [];
		this.trailpoints = [];
		this.velocity = vec2.create();
		this.velocities = [];
		this.speed = 0;
		this.status;
		this.hitbox_radius = null;
		this.tube = false;

		this.hitbox = new createjs.Shape();
		this.hitbox.graphics.beginFill('red').drawCircle(0,0,1);
		this.addChild(this.hitbox);

		this.silhouette_cont = new createjs.Container();
		this.addChild(this.silhouette_cont);

		this.silhouette = new createjs.Container();
		this.silhouette.addChild(new createjs.Bitmap(queue.getResult('surfer_E')));
		this.silhouette_cont.addChild(this.silhouette);
		this.silhouette_width = this.silhouette.getChildAt(0).image.width;
		this.silhouette_height = this.silhouette.getChildAt(0).image.height;


		this.addEventListener('tick',proxy(this.tick,this));
		
		this.initEventsListener();
	}

	//public methods

	prototype.tick = function() {

		this.move();
	}

	prototype.initEventsListener = function() {

		this.on('fall_bottom',function(event) {	
			this.status = 'fall';		
			stage.dispatchEvent('surfer_fall_bottom');
		});

		this.on('fall_top',function(event) {
			this.status = 'fall';			
			stage.dispatchEvent('surfer_fall_top');
		});

		this.on('tube_in',function(event) {
			this.tube = true;
			stage.dispatchEvent('surfer_tube_in');
		});

		this.on('tube_out',function(event) {
			this.tube = false;
			stage.dispatchEvent('surfer_tube_out');
		});

		this.on('surfing',function(event) {

			stage.dispatchEvent('surfer_surfing');
		});

	}

	prototype.takeOff = function(x,y) {

		this.location = vec2.fromValues(x,y);
		this.locations.push(vec2.fromValues(x,y));
		stage.dispatchEvent("surfer_take_off");
		return this;
	}

	prototype.setWave = function(wave) {

		this.wave = wave;
		this.resize();
		return this;
	}

	prototype.resize = function() {

		var coef = (this.wave.y / _stageWidth * 100) * this.silhouette_proportion;

		this.silhouette.scaleX = coef;
		this.silhouette.scaleY = coef;

		this.height = this.origin_height*coef;

		this.silhouette.x = (- this.silhouette_width/2) * coef;		
		this.silhouette.y = (- this.silhouette_height/2) * coef;	

		this.hitbox.scaleX = this.hitbox.scaleY = this.hitbox_radius = (this.wave.y / _stageWidth * 100) * this.hitbox_proportion;	
		this.hitbox.x = 0;
		this.hitbox.y = (- this.silhouette_height/6) * coef;

	}

	prototype.hit = function(circle,radius) {

		var pt = circle.localToLocal(0,0,this);
		var minDistance = radius + this.hitbox_radius;
		var xDist = pt.x - this.hitbox.x;
		var yDist = pt.y - this.hitbox.y;
		var distance = Math.sqrt(xDist*xDist + yDist*yDist);

		if (distance < minDistance) {
			return true;
		}
		return false;
	}

	prototype.setBot = function() {

		this.isBot = true;

	}

	prototype.getVanishPoint = function() {

		return this.wave.getVanishPoint();
	}

	prototype.isOnWave = function() {

		if(this.y >= 0) return true;
		return false;
	}

	prototype.isOnAir = function() {

		if(this.y < 0) return true;
		return false;
	}

	prototype.moveOnWave = function() {

		//if bot auto move
		if(this.isBot) return moveBot();
		
		//if it is an end of an arial
		if(this.status == 'arial') stage.dispatchEvent('surfer_arial_end');

		//set status
		this.status = 'ride';

		//interpolation to mouse
		var mouse = _getMousePoint(0);
		var mouse = this.wave.cont.globalToLocal(mouse.x,mouse.y);
		vec2.lerp(this.location,this.location,vec2.fromValues(mouse.x,mouse.y),0.14);

		//interpolation to vanish
		var vanish = this.getVanishPoint();
		vec2.lerp(this.location,this.location,vec2.fromValues(vanish.x,vanish.y),0.05);

		//check surfer stay on the wave
		if(this.location[1] > this.wave.height) {
			this.location[1] = this.wave.height;
		}
	}

	prototype.moveBot = function() {


	}

	prototype.moveOnAir = function() {

		//add initial velocity
		vec2.add(this.location,this.location,this.velocity);
		//add gravity
		vec2.add(this.location,this.location,this.gravity);
		//call wave spatter
		this.wave.drawSpatter();		
	}

	prototype.startArial = function() {

		//if already on air
		if(this.status=='arial') return;
		//set current status
		this.status = 'arial';

		//set score
		stage.dispatchEvent("surfer_arial_start");
	}

	prototype.move = function() {

		if( this.isOnAir() ) {	

			this.startArial();
			this.moveOnAir();
		}
		else {


			this.moveOnWave();		
		}

		//set this position
		this.x = this.location[0];
		this.y = this.location[1];
		
		//set surfer silhouette
		this.setSilhouette();
		//stock locations		
		this.locations.unshift(vec2.clone(this.location));
		this.locations = this.locations.slice(0,60);

		//stock trails locations
		this.trailpoints.unshift(vec2.clone(this.location));
		this.trailpoints = this.trailpoints.slice(0,60);
		
		//stock velocities
		vec2.sub(this.velocity,this.locations[0],this.locations[1]);	
		this.velocities.unshift(vec2.clone(this.velocity));
		this.velocities = this.velocities.slice(0,50);

		//stock speed
		this.speed = vec2.dist(this.locations[0],this.locations[1]);	

	}

	prototype.setSilhouette = function() {	

		if(this.locations[1] == undefined) return this.getAngledSilhouette(160);
		var a = Math.atan2(this.locations[1][0]-this.locations[0][0],this.locations[1][1]-this.locations[0][1]);
		var deg = a*(180/Math.PI);
		this.silhouette.removeChildAt(0);
		this.silhouette.addChild(this.getAngledSilhouette(deg));
	}

	prototype.getAngledSilhouette = function(deg) {

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

	//assign Surfer to window's scope & promote
	window.Surfer = createjs.promote(Surfer, "Container");
}());