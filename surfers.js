(function() {
	
	function Surfer(params) {

		this.Container_constructor();
		this.init(params);
	}

	var prototype = createjs.extend(Surfer, createjs.Container);
	//add EventDispatcher
	createjs.EventDispatcher.initialize(prototype);
	//public static properties
	prototype.gravity = vec2.fromValues(0,2);
	prototype.hitbox_proportion = 25;
	prototype.origin_height = 80;
	prototype.height = 80;

	//init 
	prototype.init = function(params) {

		this.wave = params.wave;
		this.spot = params.spot;
		this.params = params;
		this.x = params.x;
		this.y = params.y;

		this.type = 'player';

		this.location = [this.x,this.y];
		this.locations = [this.location];
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
		this.tubeTime = 0;
		this.tubeMinimumTime = 1000;
		this.riding = false;
		this.falling = false;
		this.surfing = false;
		this.automove = true;
		this.autoSilhouette = true;
		this.ollie_cooldown = 1000;
		this.trailsize_origin = this.trailsize;
		this.fall_reason = null;

		this.skill = USER.get().skill;

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
		this.silhouette.alpha = 0;

		this.particles_cont = new createjs.Container();
		this.addChild(this.particles_cont);

		this.debug_cont = new createjs.Container();
		this.addChild(this.debug_cont);

		this.trail_shape = new createjs.Shape();
		this.trail_cont = new createjs.Container();
		this.trail_cont.addChild(this.trail_shape);
		this.wave.trails_cont.addChild(this.trail_cont);

		this.addEventListener('tick',proxy(this.tick,this));
		
		this.initEventsListener();

		this.resize();


	}

	//public methods

	prototype.tick = function() {

		if(PAUSED) return;
		this.updateLocation();
		this.move();
		this.stock();
		this.testFall();
		this.drawDebug();

	}


	prototype.initEventsListener = function() {

		//add new click event to jump ollie
		stage.on('click',function(event) {
			this.ollie();
		},this);

		//custom events
		
		this.on('take_off',function(event) {
			var ev = new createjs.Event('surfer_take_off');
			stage.dispatchEvent(ev);
		},this);

		this.on('take_off_ended',function(event) {
			var ev = new createjs.Event('surfer_take_off_ended');
			stage.dispatchEvent(ev);
		},this);

		this.on('arial_start',function(event) {
			var ev = new createjs.Event('surfer_arial_start');
			ev.tricks = event.tricks;
			stage.dispatchEvent(ev);
		},this);


		this.on('arial_end',function(event) {
			var ev = new createjs.Event('surfer_arial_end');
			stage.dispatchEvent(ev);
		},this);

		this.on('fall',function(event) {	
			if(this.isPlayer()) stage.dispatchEvent('player_fall');
		},this,true);

		this.on('fallen',function(event) {	
			if(this.isPlayer()) stage.dispatchEvent('player_fallen');
		},this,true);

		this.on('fall_bottom',function(event) {	
			stage.dispatchEvent('surfer_fall_bottom');
			window.setTimeout(proxy(this.initEventsListener,this),2000);
		},this,true);

		this.on('fall_top',function(event) {	
			stage.dispatchEvent('surfer_fall_top');
			window.setTimeout(proxy(this.initEventsListener,this),2000);
		},this,true);

		this.on('fall_edge',function(event) {
			stage.dispatchEvent('surfer_fall_edge');
			window.setTimeout(proxy(this.initEventsListener,this),2000);
		},this,true);

		this.on('fall_obstacle',function(event) {
			stage.dispatchEvent('surfer_fall_obstacle');
			window.setTimeout(proxy(this.initEventsListener,this),2000);
		},this,true);

		this.on('fall_tricks',function(event) {	
			stage.dispatchEvent('fall_tricks');
			window.setTimeout(proxy(this.initEventsListener,this),2000);
		},this,true);

		this.on('tube_in',function(event) {
			stage.dispatchEvent('surfer_tube_in');
		});

		this.on('tube_out',function(event) {
			stage.dispatchEvent('surfer_tube_out');
		});

		this.on('paddler_bonus_hitted', function(event) {
			stage.dispatchEvent('paddler_malus_hitted');
		},this);

		this.on('paddler_malus_hitted', function(event) {
			//save reason
			this.fall_reason = 'fall_obstacle';
			//init fall
			this.fall();
		},this);

		this.on('photo_bonus_hitted', function(event) {
			stage.dispatchEvent('photo_bonus_hitted');
		},this);

		this.on('photo_malus_hitted', function(event) {
			stage.dispatchEvent('photo_malus_hitted');
		},this);

		this.on('multiplier_bonus_hitted', function(event) {			
			var ev = new createjs.Event('multiplier_bonus_hitted');
			ev.multiplier = event.obj.multiplier;
			stage.dispatchEvent(ev);
		},this);

		this.on('surfing',function(event) {

			stage.dispatchEvent('surfer_surfing');
		});
	}

	prototype.takeOff = function(x,y) {

		this.x = x;
		this.y = y;	

		this.automove = true;
		this.surfing = true;


		var takeoff = new createjs.SpriteSheet({
		    images: [queue.getResult('surfer_takeoff')],
		    frames: {width:80, height:80},
		    animations: {	        
		        takeoff: [0,4,false,0.9],	        
		    }
		});

		var animation = new createjs.Sprite(takeoff,'takeoff');	

		this.silhouette.removeChildAt(0);
		this.silhouette.addChild(animation);
		this.silhouette.alpha = 1;

		var tween = createjs.Tween.get(this);
			tween.to({ y: this.y + this.wave.params.height*1/3 },1000,createjs.Ease.quartOut);
			tween.addEventListener('change',proxy(this.updateLocation,this));
			tween.call(proxy(this.endTakeOff,this));
			;		


		var event = new createjs.Event("take_off");
		event.wave = this.wave;
		event.surfer = this;
		this.dispatchEvent(event);
		
		return this;
	}

	prototype.updateLocation = function(e) {

		this.location = vec2.fromValues(this.x,this.y);
		this.locations.push(this.location);
	}

	prototype.endTakeOff = function() {

		this.automove = false;
		this.riding = true;

		var ev = new createjs.Event("take_off_ended");
		ev.wave = this.wave;
		ev.surfer = this;
		this.dispatchEvent(ev);
	}

	prototype.setWave = function(wave) {

		this.wave = wave;
		return this;
	}

	prototype.getSurferProportion = function() {

		var c = (1 / this.wave.params.real_height) * (this.wave.params.height / (this.silhouette_height/2));
		return c;
	}

	prototype.resize = function() {

		var y_persperctive = (this.wave.y - this.spot.getHorizon()) / (this.spot.getPeak() - this.spot.getHorizon());

		this.scale = y_persperctive * this.getSurferProportion();

		this.height = this.origin_height*this.scale;

		this.silhouette.scaleX = this.scale;
		this.silhouette.scaleY = this.scale;
		this.silhouette.x = (- this.silhouette_width/2) * this.scale;		
		this.silhouette.y = (- this.silhouette_height/2) * this.scale;	
		
		this.hitbox.scaleX = this.hitbox.scaleY = this.hitbox_radius = this.scale * this.hitbox_proportion;	
		this.hitbox.x = 0;
		this.hitbox.y = (- this.silhouette_height/6) * this.scale;

	}

	prototype.getVanishPoint = function() {

		return this.wave.getVanishPoint();
	}

	prototype.getVanishVector = function() {

		return vec2.fromValues(this.wave.getVanishPoint().x,this.wave.getVanishPoint().y);
	}

	prototype.isPlayer = function() {
		if(this.type=='player') return true;
		return false;
	}

	prototype.isBot = function() {
		if(this.type=='bot') return true;
		return false;
	}

	prototype.isOnWave = function() {

		if(this.y >= 0) return true;
		return false;
	}

	prototype.isOnAir = function() {

		if(this.y < 0) return true;

		//check near left shoulder 
		if(this.x < this.wave.shoulder_left.x) {
			var x1 = this.wave.shoulder_left.x;
			var y1 = this.wave.shoulder_left.y;
			var x2 = this.wave.shoulder_left.x - this.wave.params.shoulder.left.marge - this.wave.params.shoulder.left.width;
			var y2 = this.wave.params.height;
			var r = intersection(x1,y1,x2,y2,this.x,this.y,this.x,-500); //get the intersection between the shoulder line and a vertical top line above the surfer
			if(r === null) return true;
		}

		//check near right shoulder 
		if(this.x > this.wave.shoulder_right.x) {
			var x1 = this.wave.shoulder_right.x;
			var y1 = this.wave.shoulder_right.y;
			var x2 = this.wave.shoulder_right.x + this.wave.params.shoulder.right.marge + this.wave.params.shoulder.right.width;
			var y2 = this.wave.params.height;
			var r = intersection(x1,y1,x2,y2,this.x,this.y,this.x,-500); //get the intersection between the shoulder line and a vertical top line above the surfer
			if(r === null) return true;
		}

		return false;
	}

	prototype.isOllieing = function() {

		if(this.ollieing == true) return true;
		return false;
	}

	prototype.move = function() {		
		if(this.automove == true) return;		

		if( this.isOnAir() ) {	

			this.initAerial();
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
		
		//set silhouette
		this.setSurferSilhouette();	
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

	prototype.endOllie = function() {
		this.ollieing = false;
		this.autoSilhouette = true;

		this.ollieParticles();

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
					callback: proxy(function(){ this.resetTrailSize(); },this)
				});
	}

	prototype.ollieParticles = function() {

		//emit particle
		var emitter = new ParticleEmitter({
			x: this.x,
			y: this.y,
			density: 10,
			angle: Math.PI /2,
			spread: Math.PI,
			magnitude: this.speed/2,
			magnitudemax: this.speed,
			color: '#FFF',
			size: 2,
			sizemax: 8,
			fader: 0.1,
			fadermax: 0.3,
			rotate: 5,
			rotatemax: -5,
			callback: proxy(function(emitter){ this.wave.particles_cont.removeChild(emitter); emitter = null;},this)
		});

		this.wave.particles_cont.addChild(emitter);

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

	prototype.getMousePoint = function(n) {

		var mouse = window.getMousePoint(n);
		mouse = this.wave.foreground_cont.globalToLocal(mouse.x,mouse.y);
		return mouse;
	}

	prototype.moveOnWave = function() {		

		//interpolation to mouse
		var mouse = this.getMousePoint(0);
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

		//sightly up and down random movement
		this.moveZigZag();

		//sufer cant go bellow the wave
		if(this.location[1] > this.wave.params.height) {
			this.location[1] = this.wave.params.height;
		}

	}

	prototype.moveZigZag = function() {

		if(!this.zigzag) this.zigzag = new Variation({min:4, max:8, time: 200});
		this.location[1] = this.location[1] + ( 4 - this.zigzag);
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
		var point = {
			location: this.location,
			size: this.trailsize	
		}
		//add point to trail points array
		this.trailpoints.unshift(point);
		this.trailpoints = this.trailpoints.slice(0,50);

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

	prototype.initAerial = function() {

		//if already on air
		if(this.status=='arial') return;
		//set current status
		this.status = 'arial';
		//hide trail
		this.saveTrailSize();
		this.trailsize = 0;
		//particles
		this.initAerialParticles();	
		//tricks		
		this.initTricks();

	}

	prototype.initTricks = function() {

		var ev = new createjs.Event("arial_start");

		var impulse = vec2.length(this.velocity);

		if(impulse > 35) {

			ev.tricks = 'Double Backflip';
			this.initDoubleBackflip();
		}
		else if(impulse > 30) {

			ev.tricks = 'Backflip';
			this.initBackflip();
		}
		else {

			ev.tricks = 'Aerial';
		}
		this.dispatchEvent(ev);
	}

	prototype.initBackflip = function() {

		this.tricked = true;
		createjs.Tween.get(this.silhouette_cont)
			.to({rotation:360 * this.wave.direction},1000)
			.call(proxy(this.endBackflip,this))
			;
	}

	prototype.initDoubleBackflip = function() {

		this.tricked = true;
		createjs.Tween.get(this.silhouette_cont)
			.to({rotation:720 * this.wave.direction},1500)
			.call(proxy(this.endBackflip,this))
			;
	}

	prototype.endBackflip = function() {

		this.rotation = 0;
		this.tricked = false;
	}

	prototype.initAerialParticles = function() {

		this.timeoutArialParticles = window.setInterval(proxy(this.aerialParticles,this),50);
	}

	prototype.stopAerialParticles = function() {

		if(this.timeoutArialParticles) {
			window.clearInterval(this.timeoutArialParticles);
			this.timeoutArialParticles = null;
		}
	}

	prototype.aerialParticles = function() {
		
		//emit particle
		var emitter = new ParticleEmitter({
			x: 0, // + this.wave.params.breaking_width*3*(-1*this.wave.direction),
			y: 0,
			density: 2,
			angle: this.angle_rad + Math.PI,
			spread: Math.PI / 8,
			magnitude: this.speed,
			magnitudemax: this.speed*2,
			color: '#FFF',
			size: 2,
			sizemax: 5,
			fader: 0.2,
			fadermax: 0.5,
			scaler: 0.1,
			forces: [this.gravity],
			shapes: [
				{shape:'circle',percentage:50,fill:'#FFF'},
				{shape:'circle',percentage:50,stroke:1,strokeColor:'#FFF'},
				],
			callback: proxy(this.removeAerialParticles,this)
		});
		
		this.particles_cont.addChild(emitter);
	}

	prototype.removeAerialParticles = function(emitter) {

		this.wave.particles_cont.removeChild(emitter);
	}

	prototype.initRide = function() {

		//end of an arial
		if(this.status == 'arial') {

			this.endArial();		
			this.dispatchEvent('arial_end');
		}

		//set status
		this.status = 'ride';

	}

	prototype.saveTrailSize = function() {
		if(this.trailsize instanceof Variation) return;
		this.trailsize_origin = this.trailsize;
		return this;
	}
	prototype.resetTrailSize = function() {
		this.trailsize_variated = false;
		return this.trailsize = this.trailsize_origin;
	}


	prototype.endArial = function() {

		//if a tricks is not ended, surfer fall
		if(this.tricked == true) {
			//init fall
			this.fall();
			//throw event			
			this.dispatchEvent('fall_tricks')
			//save reason
			this.fall_reason = 'fall_tricks';
		}

		//remove aerial particles
		this.stopAerialParticles();

		//handle trail size
		this.resetTrailSize();	
		Variation.prototype.applyOnce(this,'trailsize',{
					min: this.trailsize*7,
					max: this.trailsize,
					time: 500,
					loops: 1,
					slope: 'up',
					callback: proxy(this.resetTrailSize,this),
				});
	}

	prototype.hit = function(point,radius) {
		
		
		var minDistance = radius + this.hitbox_radius;
		var xDist = point.x - this.x - this.hitbox.x;
		var yDist = point.y - this.y - this.hitbox.y;
		//console.log(xDist+' '+yDist);
		var distance = Math.sqrt(xDist*xDist + yDist*yDist);

		if (distance < minDistance) {
			return true;
		}
		return false;
	}

	prototype.hitStage = function(circle,radius) {

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
			if(this.hit(point,point.size)) {			
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

		var e = new createjs.Event('fall');
			e.surfer = this;
		this.dispatchEvent(e);

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

		var e = new createjs.Event('fallen');
			e.surfer = this;
		this.dispatchEvent(e);


		if(!TEST) {
			//remove surfer movement
			this.removeAllEventListeners('tick');
			
		}

		
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

		this.fallParticles();

	}

	prototype.fallParticles = function() {

		//emit particle
		/*var emitter = new ParticleEmitter({
			position: vec2.fromValues(this.x,this.y),
			angle: Math.PI /2,
			spread: Math.PI,
			magnitude: 20,
			color: '#FFF',
			size: 1,
			sizemax: 5,
			fade: 0.1,
			fademax: 0.3,
			rotate: 5,
			rotatemax: -5,
			scaler: 0.1

		});
		for(var i=0; i < 30; i++) {
			var particule = emitter.emitParticle();
			this.wave.particles_cont.addChild(particule);
			this.wave.particles.push(particule);
		}
		*/
	}

	prototype.testFall = function() {

		if(this.wave == undefined) return;


		//check trajectory
		this.checkTrajectory();

		//does surfer hits top points	
		var j = this.wave.top_fall_points.length;
		while(j--) {		
			var point = this.wave.top_fall_points[j];	
			//if point is not breaking yet, quit and continue
			if(point.breaking === true) continue;
			//check hit 
			if(this.hit(point,point.size)) {
				//init fall
				this.fall();			
				//throw event
				this.dispatchEvent('fall_top');
				//save reason
				this.fall_reason = 'fall_top';
				break;
			} 			
		}
		
		//does surfer hits bottom points	
		var i = this.wave.bottom_fall_points.length;	
		while(i--){
			var point = this.wave.bottom_fall_points[i];			
			//check hit 
			if(this.hit(point,point.size)) {	
				//init fall
				this.fall();						
				//throw event
				this.dispatchEvent('fall_bottom');
				//save reason
				this.fall_reason = 'fall_bottom';
				break;
			} 			
		}

		//does surfer hits tube point
		if(this.isTubing()) {
			//surfer is in da tube
			this.tubeIn(); 		
		}
		else {
			//surfer is out da tube
			this.tubeOut(); 
		}

		//does surfer hits obstacles
		this.hitObstacles();



		//dispatch normal event
		this.dispatchEvent('surfing');

	}

	prototype.tubeIn = function() {

		if(this.tubing === false) {

			this.tubeTime += createjs.Ticker.interval;
			//the surfer must stay a minimum time in the tube to dispatch event
			if(this.tubeTime < this.tubeMinimumTime) return;

			this.tubing = true;
			this.dispatchEvent('tube_in');	
		}
	}

	prototype.tubeOut = function() {

		if(this.tubing === true) {
			this.dispatchEvent('tube_out');
		}

		this.tubing = false;
		this.tubeTime = 0;
	}

	prototype.checkTrajectory = function() {

		if(this.angles[5] == undefined) return;

		var delta = Math.abs(this.angle - this.angles[5])%360;
		var diff = (delta > 180)? 360 - delta : delta;
		var allowed = 120 + 60*this.skill.agility;
			
		if(diff > allowed) {
			//init fall
			this.fall();
			//throw event			
			this.dispatchEvent('fall_edge')
			//save reason
			this.fall_reason = 'fall_edge'
		}
	}

	prototype.hitObstacles = function() {

		//no hit when surfer is ollying
		if(this.isOllieing() == true) return;

		//test all waves obstacles
		for(var i=0,l=this.wave.obstacles.length;i<l;i++) {
			var obstacle = this.wave.obstacles[i];

			if(obstacle.hitBonus(this)) {
				//launch obstacle method
				obstacle.bonusHitted();
				//launch event
				var ev = new createjs.Event(obstacle.config.name+'_bonus_hitted');
				ev.obj = obstacle;
				this.dispatchEvent(ev);
			}
			if(obstacle.hitMalus(this)) {
				//launch obstacle method
				obstacle.malusHitted();
				//launch event
				var ev = new createjs.Event(obstacle.config.name+'_malus_hitted');
				ev.obj = obstacle;
				this.dispatchEvent(ev);
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

		var nb = this.trailpoints.length - 1;
		var points = [];
		var xs = [];

		//if(this.isBot()) continue;

		//update points with the suction vector
		for (var i = 0; i <= nb; i++) {
			//apply vector suction
			var trail = this.trailpoints[i];
			vec2.add(trail.location,trail.location,this.wave.params.suction);	
			//create xy Point
			var x = trail.location[0] + 5;
			var y = trail.location[1];
			var point = new createjs.Point(x,y);
			point.size = trail.size;
			points.push(point);
			//save all x values
			xs.push(point.x);
		}


		//get minimum x and maximum x a the trail
		var xmin = Math.min.apply(null,xs) - 100;
		var xmax = Math.max.apply(null,xs) + 100;

		this.trail_shape.graphics.clear();
		this.trail_shape.graphics.beginFill('white');

		for(var i=0; i<=nb; i++) {
			var size = i*points[i].size + this.trailcoef*points[i].size;
			this.trail_shape.graphics.lineTo(points[i].x - size/2,points[i].y - size/2);	
		}
		for(var i=nb; i>=0; i--) {
			var size = i*points[i].size + this.trailcoef*points[i].size;
			this.trail_shape.graphics.lineTo(points[i].x + size/2,points[i].y + size/2);
		}	
		this.trail_shape.graphics.closePath();	
	
/*
		for(var i = 0; i <= nb - 1; i++) {

				var trail_size = i*points[i].size+this.trailcoef*points[i].size;

				if(trail_size==0) continue;

				this.trail_shape.graphics
				.setStrokeStyle(trail_size,'round','round').beginStroke('white')
				.moveTo(points[i].x,points[i].y)
				.lineTo(points[i+1].x,points[i+1].y)
				;
		}
*/

		this.trail_cont.mask = this.wave.shape_mask;
		//this.trail_cont.cache(xmin,0,xmax-xmin,this.wave.params.height);
		this.trail_cont.alpha = 0.4;

	}

	prototype.drawSpatter = function() {
		/*
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
		*/
	}

	prototype.drawDebug = function() {
		
		if(!DEBUG) return;

		this.hitbox.alpha = 0.5;


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
		var mouse = this.globalToLocal(MOUSE_X,MOUSE_Y);
		var loc = this.localToLocal(0,0,this);
		vec2.sub(vec,vec2.fromValues(mouse.x,mouse.y),vec2.fromValues(loc.x,loc.y));	
		vec2.scale(vec,vec,0.4);
		//draw mouse vector
		var mvector = new createjs.Shape();
		mvector.graphics.setStrokeStyle(1).beginStroke('green').moveTo(0,0).lineTo(vec[0],vec[1]);
		this.debug_cont.addChild(mvector);
	}

	prototype.getAngle = function() {

		if(this.locations[1] == undefined) return this.angle = 160;
		this.angle_rad = Math.atan2(this.locations[0][1]-this.locations[1][1],this.locations[0][0]-this.locations[1][0]);
		this.angle = Math.degrees(this.angle_rad);
		this.direction = this.angle;		
		
		return this.angle;
	}

	prototype.setSurferSilhouette = function() {	
		
		if(this.autoSilhouette==false) return;

		this.getAngle();
		this.silhouette.removeChildAt(0);
		this.silhouette.addChild(this.getAngledSilhouette());			

	}

	prototype.getAngledSilhouette = function() {
		//dont touch
		//unless you want to rewrite all bitmap condition......
		var rad = Math.atan2(this.locations[1][0]-this.locations[0][0],this.locations[1][1]-this.locations[0][1]);
		var deg = -1*Math.degrees(rad);
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





//=============================
// SURFER BOT
//=============================

(function() {

	function SurferBot(config) {

		this.Surfer_constructor(config);
		this.initBot(config);
	}

	var prototype = createjs.extend(SurferBot, Surfer);

	prototype.initEventsListener = function() {
		//override and clear parent function

		//on bot fall
		this.on('fallen',function(event) {	
			console.log('fallen '+ this.fall_reason);
			this.removeBot();
		},this,true);
	}

	prototype.initBot = function(config) {

		this.type = 'bot';
		this.config = config;
		this.initVirtualMouse();
		this.addEventListener('tick',proxy(this.tickBot,this));
	}

	prototype.initVirtualMouse = function() {

		this.virtualMouse = new createjs.Shape();
		this.virtualMouse.graphics.beginFill(createjs.Graphics.getHSL(Math.random()*360, 100, 50)).drawCircle(0,0,20);
		this.virtualMouse.y = 0;
		var xd = Math.random()*(STAGEWIDTH/4);
		if(this.config.direction == 'left') {
			this.virtualMouse.x -= xd;
			this.wave.shoulder_left.mouse_cont.addChild(this.virtualMouse);
		}
		if(this.config.direction == 'right') {
			this.virtualMouse.x += xd;
			this.wave.shoulder_right.mouse_cont.addChild(this.virtualMouse);
		}
		//this.spot.debug_cont.addChild(this.virtualMouse);

		this.initMouseResting();
	}

	prototype.removeVirtualMouse = function() {
	
		createjs.Tween.removeTweens(this.virtualMouse);
		if(this.config.direction == 'left') {
			this.wave.shoulder_left.mouse_cont.removeChild(this.virtualMouse);
		}
		if(this.config.direction == 'right') {
			this.wave.shoulder_right.mouse_cont.removeChild(this.virtualMouse);
		}
		this.virtualMouse = null;
	}

	prototype.initMouseMove = function() {

		this.initMouseMoveX();
		this.initMouseMoveY();
	}

	prototype.initMouseMoveY = function() {
	
		var time = 500 + Math.random()*500;
		createjs.Tween.get(this.virtualMouse)
			.to({y: this.wave.params.height }, time, createjs.Ease.sineInOut)
			.to({y: 0 }, time, createjs.Ease.sineInOut)
			.call(proxy(this.initMouseMoveY,this))
			;
	}

	prototype.initMouseMoveX = function() {
	
		if(this.wave.direction == 1) var dx = Math.random()*(STAGEWIDTH/4);
		if(this.wave.direction == -1) var dx = -Math.random()*(STAGEWIDTH/4);
		createjs.Tween.get(this.virtualMouse)
			.to({x: this.virtualMouse.x + dx}, 3000)
			.to({x: this.virtualMouse.x}, 2000)
			.call(proxy(this.initMouseMoveX,this))
			;

	}

	prototype.initMouseResting = function() {
		
		createjs.Tween.get(this.virtualMouse,{override:true})
			.to({y: this.wave.y}, 500)
			.to({y: this.wave.params.height}, 1500)
			.wait(1000)
			.call(proxy(this.initMouseMove,this))
			;
	}

	prototype.initMouseJumping = function(now) {
		console.log('initMouseJumping')
		if(now !== false) createjs.Tween.get(this.virtualMouse,{override:true}).to({y: this.wave.y - Math.random()*(STAGEHEIGHT/2)}, 500).call(proxy(this.initMouseResting,this));

		this.jumpTimeout = window.setTimeout(proxy(this.initMouseJumping,this),Math.random()*10000 + 2000);
	}

	prototype.removeJumping = function() {

		window.clearTimeout(this.jumpTimeout);
	}

	prototype.tickBot = function() {

		this.synchronizeWithWaveMovement();

	}

	prototype.synchronizeWithWaveMovement = function() {

		//this.x += -this.wave.movingX;
	}

	prototype.getMousePoint = function(n) {

		//get the virtual mouse coordinate
		var mouse = this.virtualMouse.localToLocal(0,0,this.wave.cont);
console.log(mouse);
		return mouse;
	}

	prototype.removeBot = function() {

		//remove bot element
		this.removeJumping();
		this.removeVirtualMouse();
		//remove bot from within the wave
		this.wave.removeBot(this);
	}

	window.SurferBot = createjs.promote(SurferBot, 'Surfer');

}());