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
		this.trailcoef = 4.2;
		this.velocity = vec2.create();
		this.velocities = [];
		this.speed = 0;
		this.angle;
		this.angles = [];
		this.status = 'wait';
		this.hitbox_radius = null;
		this.tubing = false;
		this.riding = false;
		this.falling = false;
		this.automove = false;
		this.autoSilhouette = true;
		this.ollie_cooldown = 1000;
		this.trailsize_origin = this.trailsize;

		this.skill = {
			speed: 1,
			aerial: 1,
			agility: 0.8,
		}

		this.hitbox = new createjs.Shape();
		this.hitbox.graphics.beginFill('red').drawCircle(0,0,1);
		this.hitbox.alpha = 0;
		this.addChild(this.hitbox);

		this.hitboard = new createjs.Shape();
		this.hitboard.graphics.beginFill('red').drawCircle(0,0,3);		
		this.addChild(this.hitboard);



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


	prototype.initEventsListener = function() {

		this.on('fall_bottom',function(event) {	
			this.fall();		
			this.status = 'fall';
			stage.dispatchEvent('surfer_fall_bottom');
			window.setTimeout(proxy(this.initEventsListener,this),2000);
		},this,true);

		this.on('fall_top',function(event) {
			this.fall();			
			this.status = 'fall';
			stage.dispatchEvent('surfer_fall_top');
			window.setTimeout(proxy(this.initEventsListener,this),2000);
		},this,true);

		this.on('fall_edge',function(event) {
			this.fall();			
			this.status = 'fall';
			stage.dispatchEvent('surfer_fall_edge');
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
		}),
		this.on('fall',function(event) {
			
			stage.dispatchEvent('surfer_fall');
		})
		this.on('fallen',function(event) {
			
			stage.dispatchEvent('surfer_fallen');
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

		this.scale = (this.wave.y / STAGEWIDTH * 100) * this.silhouette_proportion;

		this.silhouette.scaleX = this.scale;
		this.silhouette.scaleY = this.scale;

		this.height = this.origin_height*this.scale;

		this.silhouette.x = (- this.silhouette_width/2) * this.scale;		
		this.silhouette.y = (- this.silhouette_height/2) * this.scale;	

		this.hitbox.scaleX = this.hitbox.scaleY = this.hitbox_radius = (this.wave.y / STAGEWIDTH * 100) * this.hitbox_proportion;	
		this.hitbox.x = 0;
		this.hitbox.y = (- this.silhouette_height/6) * this.scale;

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

	prototype.isOllieing = function() {

		if(this.ollieing == true) return true;
		return false;
	}


	prototype.move = function() {		

		if(this.automove == true) return;		

		if( this.isOnAir() ) {	

			this.initArial();
			this.moveOnAir();
		}
		else if( this.isOllieing() ) {

			this.moveOnOllie();
		}
		else if( this.isFalling() ) {

			this.fallWithInertia();
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


	prototype.moveOnOllie = function() {

		//add gravity to ollie initial vector
		vec2.add(this.ollie_vector,this.ollie_vector,this.gravity);		
		//add initial 
		vec2.add(this.location,this.location,this.ollie_vector);

		
	}

	prototype.ollie = function() {

		//check cooldown
		if(this.ollieing == true) return;
		this.ollieing = true;		
		
		this.ollie_height = vec2.fromValues(0,-13);
		this.ollie_vector = vec2.create();
		vec2.add(this.ollie_vector,this.velocity,this.ollie_height);	

		this.saveTrailSize();
		this.trailsize = 0;
		this.autoSilhouette = false;
	
		//console.log('ollie');
		window.setTimeout(proxy(this.endOllie,this),500);

	}

	prototype.saveTrailSize = function() {
		if(isNumeric(this.trailsize)) this.trailsize_origin = this.trailsize;
		//console.log(this.trailsize);
		return this;
	}
	prototype.resetTrailSize = function() {
		//console.log(this.trailsize_origin);
		this.trailsize_variated = false;
		return this.trailsize = this.trailsize_origin;
	}

	prototype.endOllie = function() {
		this.ollieing = false;
		this.autoSilhouette = true;
		this.resetTrailSize();

		this.saveTrailSize();
		
		if(this.trailsize_variated == true) return;

		this.trailsize_variated = true;
		this.trailsize = new Variation({
					min: this.trailsize*5,
					max: this.trailsize,
					time: 500,
					loops: 1,
					slope: 'up',
					call: proxy(function(){ this.resetTrailSize(); },this)
				});
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

		//apply skill limit
		var speed = new vec2.create();
		vec2.sub(speed,this.location,this.locations[0]);
		var limit = 0.5 + this.skill.speed/2;
		vec2.scale(speed,speed,limit);
		vec2.add(this.location,this.locations[0],speed);		

		//sufer cant go bellow the wave
		if(this.location[1] > this.wave.height) {
			this.location[1] = this.wave.height;
		}

	}

	prototype.moveOnAir = function() {

		//add initial velocity
		vec2.add(this.location,this.location,this.velocity);
		//apply skill limit
		var gravity = vec2.create();
		vec2.scale(gravity,this.gravity,2-this.skill.aerial);
		//add gravity
		vec2.add(this.location,this.location,gravity);	

	}


	prototype.stock = function() {
		
		//stock locations		
		this.locations.unshift(vec2.clone(this.location));
		this.locations = this.locations.slice(0,60);

		//stock trails locations
		var point = vec2.clone(this.location);
		//set trail size to point
		point.size = this.trailsize;
		//add point to trail points array
		this.trailpoints.unshift(point);
		this.trailpoints = this.trailpoints.slice(0,60);
		
		//stock velocities
		vec2.sub(this.velocity,this.locations[0],this.locations[1]);	
		this.velocities.unshift(vec2.clone(this.velocity));
		this.velocities = this.velocities.slice(0,50);

		//stock speed
		this.speed = vec2.dist(this.locations[0],this.locations[1]);	

		//stock angle
		this.angles.unshift(this.angle);
		this.angles = this.angles.slice(0,50);


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
		console.log('testTrail');
		this.saveTrailSize();
		this.trailsize = new Variation({
						min: this.trailsize,
						max: 0,
						time: 500,
						loops: 1,
						call: proxy(this.resetTrailSize(),this)
					});
	}

	prototype.initRide = function() {

		//end of an arial
		if(this.status == 'arial') {

			this.endArial();		
			stage.dispatchEvent('surfer_arial_end');

		}

		//set status
		this.status = 'ride';

	}

	prototype.endArial = function() {
		

		this.saveTrailSize();
		this.trailsize = new Variation({
					min: this.trailsize*7,
					max: this.trailsize,
					time: 500,
					loops: 1,
					slope: 'up',
					call: proxy(this.resetTrailSize,this)
				});
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

	prototype.hitSurf = function(circle,radius) {

		var pt = circle.localToLocal(0,0,this);
		var minDistance = radius + this.hitboard.graphics.command.radius;
		var xDist = pt.x - this.hitboard.x;
		var yDist = pt.y - this.hitboard.y;
		var distance = Math.sqrt(xDist*xDist + yDist*yDist);

		if(distance < minDistance) {
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


	prototype.isFalling = function() {
		if(this.falling === true) return true;
	}

	prototype.fall = function() {

		if(this.falling == true) return;

		this.falling = true;

		this.dispatchEvent('fall');

		this.showFallPlouf();
		this.ploufinterval = window.setInterval(proxy(this.showFallPlouf,this),200);

		createjs.Tween.get(this.silhouette_cont)
		.to({rotation:360*this.wave.direction*-1,alpha:0,scaleX:0.4,scaleY:0.4},1000)
		.to({rotation:0,alpha:1,scaleX:1,scaleY:1},0)
		;
	
	}

	prototype.fallFinished = function() {

		this.falling = false;

		window.clearInterval(this.ploufinterval);

		this.dispatchEvent("fallen");
		
	}

	prototype.fallWithInertia = function() 
	{
		vec2.scale(this.velocity,this.velocity,0.8);
		
		if(vec2.sqrLen(this.velocity) < 1) {
			this.fallFinished();
		}
		vec2.add(this.location,this.location,this.velocity);
	}

	prototype.showFallPlouf = function() {

		var plouf = new createjs.Container();
		var img = new createjs.Bitmap(queue.getResult('wash'));
		img.x = -40;
		img.y = -20;

		plouf.addChild(img);

		plouf.x = this.x + 50*this.wave.direction*-1;
		plouf.y = this.y;
		plouf.scaleX = plouf.scaleY = this.scale;
		plouf.rotation = Math.random(10)*(Math.random(2)-1);
		this.wave.surfer_cont.addChild(plouf);

		var c = this.scale*3;
		createjs.Tween.get(plouf)
		.to({scaleX:c, scaleY:c, alpha:0, y:plouf.y-50},600)
		;

	}

	prototype.testFall = function() {

		if(this.wave == undefined) return;


		//check trajectory
		this.checkTrajectory();

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

		//does surfer hits obstacles
		this.hitObstacles();



		//dispatch normal event
		this.dispatchEvent('surfing');

	}

	prototype.checkTrajectory = function() {

		if(this.angles[5] == undefined) return;

		var delta = Math.abs(this.angle - this.angles[5])%360;
		var diff = (delta > 180)? 360 - delta : delta;
		var allowed = 120 + 60*this.skill.agility;
			
		if(diff > allowed) {			
			this.dispatchEvent('fall_edge')
		}
	}

	prototype.hitObstacles = function() {

		//no hit when surfer is ollying
		if(this.isOllieing() == true) return;

		//test all waves obstacles
		for(var i=0,l=this.wave.obstacles.length;i<l;i++) {
			var obstacle = this.wave.obstacles[i];

			if(obstacle.hitBonus(this)) {

			}
			if(obstacle.hitMalus(this)) {
				this.fall();
			}
		}
	}

	prototype.drawTrails = function() {

		//draw spatter when surfer is on air
		if(this.isOnAir()) {
			this.drawSpatter();
		}

		//dont show trail when surfer is ollieing
		if(this.isOllieing()) {

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
			var point = new createjs.Point(pos[0],pos[1]+5);
			point.size = pos.size;
			points.push(point);
			//save all x values
			xs.push(point.x);
		}


		//get minimum x and maximum x a the trail
		var xmin = Math.min.apply(null,xs) - 100;
		var xmax = Math.max.apply(null,xs) + 100;

		//draw trail
		var trail = new createjs.Shape();
		var subtrail = new createjs.Shape();	


		for(var i = 0; i <= nb - 1; i++) {

				var xc = ( points[i].x + points[i+1].x) >> 1; // divide by 2
				var yc = ( points[i].y + points[i+1].y) >> 1; // divide by 2

				var trail_size = i*points[i].size+this.trailcoef*points[i].size;

				if(trail_size==0) continue;

				trail.graphics
				.setStrokeStyle(trail_size,'round','round').beginStroke('#FFF')
				.moveTo(points[i].x,points[i].y)
				.quadraticCurveTo(xc,yc,points[i+1].x,points[i+1].y)
				;

				subtrail.graphics
				.setStrokeStyle(trail_size/5,'butt').beginStroke('rgba(0,0,0,0.1')
				.moveTo(points[i].x,points[i].y)
				.lineTo(points[i+1].x,points[i+1].y)
		}
		
		//create linear gradient mask
		// var box = new createjs.Shape();
		 // 		box.x = xmin;
		 // 		box.graphics.beginLinearGradientFill(["#000000", "rgba(0, 0, 0, 0)"], [0, 1], 0, 0, STAGEWIDTH, 0);
		 // 		box.graphics.moveTo(0,0);
		 // 		box.graphics.drawRect(0, 0, STAGEWIDTH, wave.height);
		 // 		box.cache(0, 0, STAGEWIDTH, wave.height);
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
		masker.graphics.beginFill('red').drawRect(points[0].x - STAGEWIDTH, 0, STAGEWIDTH*2, 200);
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
		
		if(this.autoSilhouette==false) return;
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