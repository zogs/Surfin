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
		this.trailsize = 1.3;
		this.trailcoef = 1.5;
		this.velocity = vec2.create();
		this.velocities = [];
		this.speed = 0;
		this.status = 'wait';
		this.hitbox_radius = null;
		this.tubing = false;
		this.riding = false;
		this.automove = false;

		this.hitbox = new createjs.Shape();
		this.hitbox.graphics.beginFill('red').drawCircle(0,0,1);
		this.hitbox.alpha = 0;
		this.addChild(this.hitbox);

		var z = new createjs.Shape();
		z.graphics.beginFill('red').drawCircle(0,0,3);		
		this.addChild(z);



		this.silhouette_cont = new createjs.Container();
		this.addChild(this.silhouette_cont);

		this.silhouette = new createjs.Container();
		this.silhouette.addChild(new createjs.Bitmap(queue.getResult('surfer_E')));
		this.silhouette_cont.addChild(this.silhouette);
		this.silhouette_width = this.silhouette.getChildAt(0).image.width;
		this.silhouette_height = this.silhouette.getChildAt(0).image.height;

		this.debug_cont = new createjs.Container();
		this.addChild(this.debug_cont);


		this.addEventListener('tick',proxy(this.tick,this));
		
		this.initEventsListener();


	}

	//public methods

	prototype.tick = function() {

		this.move();
		this.stock();
		this.testFall();
		this.drawTrails();
		this.drawDebug();
	}

	prototype.stock = function() {
		
		//stock locations		
		this.locations.unshift(vec2.clone(this.location));
		this.locations = this.locations.slice(0,60);

		//stock trails locations
		var point = vec2.clone(this.location);
		point.size = this.trailsize;
		this.trailpoints.unshift(point);
		this.trailpoints = this.trailpoints.slice(0,60);
		
		//stock velocities
		vec2.sub(this.velocity,this.locations[0],this.locations[1]);	
		this.velocities.unshift(vec2.clone(this.velocity));
		this.velocities = this.velocities.slice(0,50);

		//stock speed
		this.speed = vec2.dist(this.locations[0],this.locations[1]);	

	}

	prototype.initEventsListener = function() {

		this.on('fall_bottom',function(event) {	
			this.status = 'fall';		
			stage.dispatchEvent('surfer_fall_bottom');
			window.setTimeout(proxy(this.initEventsListener,this),2000);
		},this,true);

		this.on('fall_top',function(event) {
			this.status = 'fall';			
			stage.dispatchEvent('surfer_fall_top');
			window.setTimeout(proxy(this.initEventsListener,this),2000);
		},this,true);

		this.on('tube_in',function(event) {
			this.tubing = true;
			stage.dispatchEvent('surfer_tube_in');
		});

		this.on('tube_out',function(event) {
			this.tubing = false;
			stage.dispatchEvent('surfer_tube_out');
		});

		this.on('surfing',function(event) {

			stage.dispatchEvent('surfer_surfing');
		});

	}

	prototype.takeOff = function(x,y) {

		this.x = x;
		this.y = y;	
		this.updateLocation();

		this.automove = true;


		var takeoff = new createjs.SpriteSheet({
		    images: [queue.getResult('surfer_takeoff')],
		    frames: {width:80, height:80},
		    framerate: 1,
		    animations: {	        
		        takeoff: [0,4,false,0.3],	        
		    }
		});

		var animation = new createjs.Sprite(takeoff,'takeoff');	

		this.silhouette.removeChildAt(0);
		this.silhouette.addChild(animation);

		var tween = createjs.Tween.get(this);
			tween.to({ y: this.wave.height*1/3 },1000,createjs.Tween.quartOut);
			tween.call(proxy(this.endTakeOff,this));
			tween.addEventListener('change',proxy(this.updateLocation,this));
			;		
		
		return this;
	}

	prototype.updateLocation = function(e) {

		this.location = vec2.fromValues(this.x,this.y);
		this.locations.push(vec2.fromValues(this.x,this.y));
	}

	prototype.endTakeOff = function() {

		this.automove = false;
		this.riding = true;

		stage.dispatchEvent("surfer_take_off");
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


	prototype.getVanishPoint = function() {

		return this.wave.getVanishPoint();
	}

	prototype.getVanishVector = function() {

		return vec2.fromValues(this.wave.getVanishPoint().x,this.wave.getVanishPoint().y);
	}

	prototype.isOnWave = function() {

		if(this.y >= 0) return true;
		return false;
	}

	prototype.isOnAir = function() {

		if(this.y < 0) return true;
		return false;
	}


	prototype.move = function() {		

		if(this.automove == true) return;		

		if( this.isOnAir() ) {	

			this.initArial();
			this.moveOnAir();
		}
		else {

			this.initRide();
			this.moveOnWave();		
		}	

		//set this position
		this.x = this.location[0];
		this.y = this.location[1];	

		//set surfer direction angle
		this.setAngle();
		//set surfer silhouette
		this.setSilhouette();

	}

	prototype.moveOnWaveOLD = function() {

		//calcul mouse vector
		var mouse = this.globalToLocal(MOUSE.x,MOUSE.y);
		var loc = this.localToLocal(0,0,this);
		var vec = new vec2.create();
		vec2.sub(vec,vec2.fromValues(mouse.x,mouse.y),vec2.fromValues(loc.x,loc.y));	
		vec2.scale(vec,vec,0.8);
		//add it to current position
		vec2.add(this.location,this.location,vec);


		//calcul vanish vector		
		vec2.sub(vec, this.getVanishVector(),this.location);			
		res = this.localToLocal(vec[0],vec[1],this);
		vec2.scale(vec,vec2.fromValues(res.x,res.y),0.4);
		//add it to current position
		vec2.add(this.location,this.location,vec);
		

		//sufer can't go bellow the wave
		if(this.location[1] > this.wave.height) {
			this.location[1] = this.wave.height;
		}

	}

	prototype.moveOnWave = function() {		

		//interpolation to mouse
		var mouse = _getMousePoint(0);
		var mouse = this.wave.cont.globalToLocal(mouse.x,mouse.y);
		vec2.lerp(this.location,this.location,vec2.fromValues(mouse.x,mouse.y),0.24);

		//interpolation to vanish
		var vanish = this.getVanishPoint();
		vec2.lerp(this.location,this.location,vec2.fromValues(vanish.x,vanish.y),0.05);

		//sufer can go bellow the wave
		if(this.location[1] > this.wave.height) {
			this.location[1] = this.wave.height;
		}

	}

	prototype.moveOnAir = function() {

		//add initial velocity
		vec2.add(this.location,this.location,this.velocity);
		//add gravity
		vec2.add(this.location,this.location,this.gravity);		
	}

	prototype.initArial = function() {

		//if already on air
		if(this.status=='arial') return;
		//set current status
		this.status = 'arial';
		//set score
		stage.dispatchEvent("surfer_arial_start");
	}

	prototype.testTrail = function() {
	
		this.trailsize_origin = this.trailsize;
		this.trailsize = new Variation({
						min: this.trailsize,
						max: this.trailsize*10,
						time: 500,
						loops: 1,
						call: proxy(this.endArial,this)
					});
	}

	prototype.initRide = function() {

		//end of an arial
		if(this.status == 'arial') {

			stage.dispatchEvent('surfer_arial_end');

			this.trailsize_origin = this.trailsize;
			this.trailsize = new Variation({
						min: this.trailsize*15,
						max: this.trailsize,
						time: 500,
						loops: 1,
						slope: 'up',
						call: proxy(this.endArial,this)
					});
				
			
		}

		//set status
		this.status = 'ride';

	}

	prototype.updateArialLanding = function() {

		this.updateLocation();

	}

	prototype.endArial = function() {

		this.trailsize = this.trailsize_origin;

	}

	prototype.hit = function(circle,radius) {

		var pt = circle.localToLocal(0,0,this);

		var minDistance = radius + this.hitbox_radius;
		var xDist = pt.x - this.hitbox.x;
		var yDist = pt.y - this.hitbox.y;
		//console.log(xDist+' '+yDist);
		var distance = Math.sqrt(xDist*xDist + yDist*yDist);

		if (distance < minDistance) {
			return true;
		}
		return false;
	}

	prototype.isTubing = function() {

		var i = this.wave.tube_points.length;
		while(i--) {	
			var point = this.wave.tube_points[i];			
			if(this.hit(point,point.scaleX)) {			
				return true;			
			} 		
		}
		return false;
	}


	prototype.testFall = function() {

		if(this.wave == undefined) return;

		//does surfer hits top points	
		var j = this.wave.top_fall_points.length;
		while(j--) {		
			var point = this.wave.top_fall_points[j];			
			//check hit 
			if(this.hit(point,point.scaleX)) {			
				//throw event
				this.dispatchEvent('fall_top');
				break;
			} 			
		}

		//does surfer hits bottom points	
		var i = this.wave.bottom_fall_points.length;	
		while(i--){
			var point = this.wave.bottom_fall_points[i];			
			//check hit 
			if(this.hit(point,point.scaleY)) {							
				//throw event
				console.log('too low =========='+point.scaleX);
				this.dispatchEvent('fall_bottom');
				break;
			} 			
		}
		//maintain a raisonable count of fall points
		this.wave.bottom_fall_points = this.wave.bottom_fall_points.slice(0,50);
		//don't remove this line !! or surfer will iremidiabely fall and you will not know why...
		


		//does surfer hits tube point
		if(this.isTubing()) {
			//throw event tube in
			if(this.tubing == false) this.dispatchEvent('tube_in');			
		}
		else {
			//trhow event tube out
			if(this.tubing == true) this.dispatchEvent('tube_out');
		}		


		//dispatch normal event
		this.dispatchEvent('surfing');

	}

	prototype.drawTrails = function() {

		if(this.isOnAir()) {
			this.drawSpatter();
		}
		
		this.drawTrail();
		
	}

	prototype.drawTrail = function() {

		//if surfer is not on the wave, dont do anything
		if(this.wave == undefined) return;

		//begin by clearing all trails
		this.wave.trail_cont.removeAllChildren();
		
		var nb = this.trailpoints.length - 1;
		var trailpoints = this.trailpoints.slice(0);
		var points = [];
		var xs = [];

		//if no trails points, return early
		if(nb <= 0) return;

		//update points with the suction vector
		for (var i = 0; i <= nb; i++) {
			//apply vector suction
			var pos = this.trailpoints[i];
			vec2.add(pos,pos,this.wave.suction);
			//create xy Point
			var point = new createjs.Point(pos[0]+40,pos[1]);
			point.size = pos.size;
			points.push(point);
			//save all x for futur use
			xs.push(point.x);
		}


		//get minimum x and maximum x a the trail
		var xmin = Math.min.apply(null,xs) - 100;
		var xmax = Math.max.apply(null,xs) + 100;

		//draw trail
		var trail = new createjs.Shape();
		var subtrail = new createjs.Shape();	


		for(var i = 0; i <= nb - 1; i++) {
				trail.graphics
				.setStrokeStyle(1 + i*this.trailcoef*points[i].size,'round','round').beginStroke('#FFF')
				.moveTo(points[i].x,points[i].y)
				.lineTo(points[i+1].x,points[i+1].y)
				;

				subtrail.graphics
				.setStrokeStyle(1 + i*this.trailcoef/5*points[i].size,'butt').beginStroke('rgba(0,0,0,0.1')
				.moveTo(points[i].x,points[i].y)
				.lineTo(points[i+1].x,points[i+1].y)
		}
		
		//create linear gradient mask
		// var box = new createjs.Shape();
		 // 		box.x = xmin;
		 // 		box.graphics.beginLinearGradientFill(["#000000", "rgba(0, 0, 0, 0)"], [0, 1], 0, 0, _stageWidth, 0);
		 // 		box.graphics.moveTo(0,0);
		 // 		box.graphics.drawRect(0, 0, _stageWidth, wave.height);
		 // 		box.cache(0, 0, _stageWidth, wave.height);
		 // 	trail.filters = [
		 // 		new createjs.AlphaMaskFilter(box.cacheCanvas) 		
		 // 	];
	 	//cache the shape 	
		trail.cache(xmin,0,xmax-xmin,this.wave.height);
		//subtrail.cache(xmin,0,xmax-xmin,this.height);
		trail.alpha = 0.3;
		//subtrail.alpha = 0.1;
	 	
		//trail mask		
		var masker = new createjs.Shape();
		masker.graphics.beginFill('red').drawRect(points[0].x - _stageWidth, 0, _stageWidth*2, 200);
		//apply mask
		trail.mask = masker;
		subtrail.mask = masker;

		//add trail
		this.wave.trail_cont.addChild(trail);
		this.wave.trail_cont.addChild(subtrail);
		
	}

	prototype.drawSpatter = function() {

		var graphics = new createjs.Graphics()
					.beginFill(createjs.Graphics.getRGB(255, 255, 255))
					.drawCircle(0, 0, 6)
					;	 
		
		var spatter = new createjs.Shape(graphics)
		spatter.x = this.x;
		spatter.y = this.y;
		spatter.alpha = 0.6;
		

		var dx = Math.random(100)*(Math.round(Math.random())*2 - 1);

		createjs.Tween.get(spatter)
			.to({	
				scaleX: 0.1,scaleY:0.1,alpha: 0
			},500);

		this.wave.spatter_cont.addChild(spatter);
		
	}

	prototype.drawDebug = function() {
		return;
		this.debug_cont.removeAllChildren();


		var pt = findPointFromAngle(0,0,this.direction,this.speed*3);
		var angle = new createjs.Shape();	
		angle.graphics.setStrokeStyle(1).beginStroke('red').moveTo(0,0).lineTo(pt.x,pt.y);
		this.debug_cont.addChild(angle);

		
		//calcul suction vector
		var vec = new vec2.create();
		vec2.sub(vec, this.getVanishVector(),this.location);			
		res = this.localToLocal(vec[0],vec[1],this);
		vec2.scale(vec,vec2.fromValues(res.x,res.y),0.4);
		//draw section vector
		var suction = new createjs.Shape();
		suction.graphics.setStrokeStyle(1).beginStroke('pink').moveTo(0,0).lineTo(vec[0],vec[1]);
		this.debug_cont.addChild(suction);

		//calcul mouse vector
		var vec = new vec2.create();
		var mouse = this.globalToLocal(MOUSE.x,MOUSE.y);
		var loc = this.localToLocal(0,0,this);
		vec2.sub(vec,vec2.fromValues(mouse.x,mouse.y),vec2.fromValues(loc.x,loc.y));	
		vec2.scale(vec,vec,0.4);
		//draw mouse vector
		var mvector = new createjs.Shape();
		mvector.graphics.setStrokeStyle(1).beginStroke('green').moveTo(0,0).lineTo(vec[0],vec[1]);
		this.debug_cont.addChild(mvector);
	}

	prototype.setAngle = function() {

		if(this.locations[1] == undefined) return this.angle = 160;
		var a = Math.atan2(this.locations[1][0]-this.locations[0][0],this.locations[1][1]-this.locations[0][1]);
		this.angle = a*(180/Math.PI);
		this.direction = -(this.angle+90);
		return this.angle;
	}

	prototype.setSilhouette = function() {	
		
		this.silhouette.removeChildAt(0);
		this.silhouette.addChild(this.getAngledSilhouette());
	}

	prototype.getAngledSilhouette = function() {
		var deg = this.angle;
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