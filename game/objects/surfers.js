(function() {
	
	// define usefull constant (NB: use positive numeric for perf reason)
	const LEFT = 1;
	const CENTER = 0;
	const RIGHT = 2;

	function Surfer(params) {

		this.Container_constructor();
		this.init(params);
	}

	var prototype = createjs.extend(Surfer, createjs.Container);
	//add EventDispatcher
	createjs.EventDispatcher.initialize(prototype);
	//public static properties
	prototype.gravity = new Victor(0,7);
	prototype.hitbox_proportion = 25;
	prototype.hitboard_proportion = 5;
	prototype.origin_height = 80;
	prototype.height = 80;

	//init 
	prototype.init = function(params) {

		this.wave = params.wave;
		this.spot = params.spot;
		this.config = cloneObject(this.spot.config.surfers);
		this.x = params.x;
		this.y = params.y;

		this.type = 'player';

		this.location;
		this.locations = [];
		this.trailpoints = [];
		this.spatterpoints = [];
		this.collisions = [];
		this.tweens = [];
		this.trailsize = 1;
		this.trailcoef = 3.2;
		this.real_height = 1.5;
		this.velocity = new Victor();
		this.velocities = [];
		this.pumped = [];
		this.timer = null;
		this.speed = 0;
		this.angle;
		this.angles = [];
		this.status = 'wait';		
		this.tubing = false;
		this.tubeTime = 0;
		this.tubeMinimumTime = 1000;
		this.tubeDepths = [];
		this.riding = false;
		this.falling = false;
		this.surfing = false;
		this.automove = false;
		this.auto_silhouette = true;
		this.ollie_cooldown = 1000;
		this.trailsize_origin = this.trailsize;
		this.color_spatter_num = 0;
		this.fall_reason = null;
		this.point_under = null;
		this.aerial_start_point = null;
		this.aerial_end_point = null;
		this.aerial_end_point_width = null;
		this.aerial_particles_emitter = null;
		this.control_velocities = {x:1,y:1};
		this.time_scale = (TIME_SCALE) ? TIME_SCALE : 1;

		this.skills = USER.get().skills;
		this.disturbance = 0;
		this.disturbance_max = 20;

		this.hitbox = new createjs.Shape();
		this.hitbox_radius = 1;
		this.hitbox.graphics.beginFill('red').drawCircle(0,0,this.hitbox_radius);
		this.hitbox.alpha = 0;
		this.addChild(this.hitbox);

		this.hitboard = new createjs.Shape();	
		this.hitboard_radius = 1;
		this.hitboard.graphics.beginFill('red').drawCircle(0,0,this.hitboard_radius);	
		this.hitboard.alpha = 0;
		this.addChild(this.hitboard);

		const sprite_splash = new createjs.SpriteSheet({
			images: [queue.getResult('surfer_splash')],
			frames: {width:200, height:150, regX: 100, regY: 75},
			framerate: 1,
			animations: {
				hide: 1,
				splash: [1,12,false],
			}
		});
		this.splash_anim = new createjs.Sprite(sprite_splash);
		this.splash_anim.y = -20;
		this.splash_anim.x = 0;
		this.splash_anim.alpha = 0.4;	
		this.splash_anim.gotoAndStop(0);	
		this.addChild(this.splash_anim);

		this.particles_cont = new createjs.Container();
		this.addChild(this.particles_cont);

		this.silhouette_cont = new createjs.Container();
		this.addChild(this.silhouette_cont);

		this.silhouette = new createjs.Container();
		this.silhouette.addChild(new createjs.Bitmap(queue.getResult('surfer_E')));
		this.silhouette_cont.addChild(this.silhouette);
		this.silhouette_width = this.silhouette.getChildAt(0).image.width;
		this.silhouette_height = this.silhouette.getChildAt(0).image.height;
		this.silhouette.alpha = 0;

		this.lifebar = new createjs.Shape();
		this.lifebar.graphics.clear().beginStroke('grey').setStrokeStyle(3).moveTo(0,0).lineTo(50,0);
		this.lifebar.alpha = 0;
		this.lifebar_cont = new createjs.Container();
		this.lifebar_cont.y = 25;
		this.lifebar_cont.x = -25;
		this.lifebar_cont.addChild(this.lifebar);
		this.addChild(this.lifebar_cont);

		this.debug_cont = new createjs.Container();
		this.debug_cont.alpha = 0;
		this.addChild(this.debug_cont);

		this.trail_shape = new createjs.Shape();
		this.trail_splash = new createjs.Shape();
		this.trail_cont = new createjs.Container();
		this.trail_cont.y =  11; //align trail to board
		this.trail_cont.addChild(this.trail_shape, this.trail_splash);
		this.wave.trails_cont.addChild(this.trail_cont);

		this.spatter_shape_inner = new createjs.Shape();
		this.spatter_shape_outer = new createjs.Shape();
		this.spatter_ramp_shape = new createjs.Shape();
		this.spatter_cont = new createjs.Container();
		this.spatter_cont.addChild(this.spatter_ramp_shape,this.spatter_shape_outer,this.spatter_shape_inner);
		this.wave.spatters_cont.addChild(this.spatter_cont);

		this.weapon_cont = new createjs.Container();
		this.addChild(this.weapon_cont);
		this.saber_length = 80;
		this.saber_color = 'green';
		this.saber_angle = 0;
		this.saber_start = new createjs.Shape();
		this.saber_start.graphics.beginStroke('white').drawCircle(0,0,20);
		this.saber_start.x = -30;
		this.saber_start.y = -15;
		this.saber_middle = new createjs.Shape();
		this.saber_middle.graphics.beginStroke('white').drawCircle(0,0,15);
		this.saber_end = new createjs.Shape();
		this.saber_end.graphics.beginStroke('white').drawCircle(0,0,10);
		this.saber_trail = this.saber_end.clone();		
		this.weapon_points = [this.saber_start,this.saber_middle,this.saber_end,this.saber_trail];
		this.debug_cont.addChild(this.saber_start, this.saber_middle, this.saber_end, this.saber_trail);

		this.virtualMouse = new createjs.Shape();
		this.virtualMouse.graphics.beginFill('pink').drawCircle(0,0,3);
		this.spot.debug_cont.addChild(this.virtualMouse);
		this.virtualMouse.x = this.x + this.wave.x;
		this.virtualMouse.y = this.wave.y - this.wave.params.height + this.y;
		this.virtualMouse.alpha = 0;

		//NO MORE USED
		//this.addEventListener('tick',proxy(this.tick,this));
		
		this.initEventsListener();

		this.resize();


	}

	//public methods


	prototype.tick = function() {

		this.move();
		this.stock();
		this.checkFall();
		this.drawTrails();
		this.drawWeapon();
		this.drawDebug();
	}

	prototype.continuousMovement = function() {

		this.move();
		this.stock();
		this.checkFall();
		this.drawTrails();
		this.drawWeapon();
		this.drawDebug();

		this.timer = new Timer(proxy(this.continuousMovement,this), this.wave.params.breaking.x_speed);
	}


	prototype.initEventsListener = function() {

		//add new click event to jump ollie
		stage.on('click',function(event) {
			//this.ollie();
			this.lightSaberStrike();
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

		this.on('aerial_start',function(event) {
			var ev = new createjs.Event('surfer_aerial_start');
			ev.tricks = event.tricks;
			stage.dispatchEvent(ev);
		},this);

		this.on('aerial_end',function(event) {
			var ev = new createjs.Event('surfer_aerial_end');
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
			//init fall
			this.fall('hit obstacle');
		},this);

		this.on('photo_bonus_hitted', function(event) {
			console.log('photo bonus');
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
		this.location = new Victor(x,y);
		this.locations.push(this.location);

		this.auto_silhouette = false;

		const speed = 0.1 + this.getSkill('takeoff');
		const takeoff = new createjs.SpriteSheet({
			images: [queue.getResult('surfer_takeoff')],
			frames: {width:80, height:80},
			animations: {
				takeoff: [0,4,false,speed],
			}
		});

		const animation = new createjs.Sprite(takeoff,'takeoff');
		this.silhouette.removeAllChildren();
		this.silhouette.addChild(animation);
		this.silhouette.alpha = 1;


		const event = new createjs.Event("take_off");
			event.wave = this.wave;
			event.surfer = this;
			this.dispatchEvent(event);

		// set velocities to zero
		this.control_velocities.x = 0;
		this.control_velocities.y = 0;
		// calc time from skill
		const default_time = 2000;
		const time = default_time * (1 - this.getSkill('takeoff')/2);
		// tween it slowly to normal config
		createjs.Tween.get(this.control_velocities)
			.to({ y: 0.5 }, time / 2)
			.call(proxy(function(){ this.auto_silhouette = true;},this))
			.to({ x: 1 }, time / 2)
			.set({ y: 1 })
			.call(proxy(this.endTakeOff,this));

		//init timer refresh
		this.timer = new Timer(proxy(this.continuousMovement,this), this.wave.params.breaking.x_speed);

		return this;
	}

	prototype.getSkill = function(comp) {
		
		if(this.skills[comp] === undefined) {
			console.error(comp + " is not a skill competence...");
			return 1;
		}
		return this.skills[comp];
	}

	prototype.endTakeOff = function() {

		this.auto_silhouette = true;
		this.riding = true;

		const ev = new createjs.Event("take_off_ended");
		ev.wave = this.wave;
		ev.surfer = this;
		this.dispatchEvent(ev);
	}

	prototype.setWave = function(wave) {

		this.wave = wave;
		return this;
	}

	prototype.switchAutomove = function() {

		this.automove = !this.automove;
	}

	prototype.setTimeScale = function(scale) {
		this.time_scale = scale;
		this.tweens.map(t => t.timeScale = scale);
		if(this.aerial_particles_emitter) this.aerial_particles_emitter.setTimeScale(scale);
	}

	prototype.getSurferProportion = function() {

		var c = (this.real_height / this.wave.params.real_height) * (this.wave.params.height / (this.silhouette_height));
		return c;
	}

	prototype.resize = function() {

		var y_persperctive = this.wave.getResizeCoef();

		this.scale = y_persperctive * this.getSurferProportion();
		this.height = this.origin_height*this.scale;

		this.silhouette.scaleX = this.scale;
		this.silhouette.scaleY = this.scale;
		this.silhouette.x = (- this.silhouette_width/2) * this.scale;		
		this.silhouette.y = (- this.silhouette_height/2) * this.scale;	
		
		this.hitbox.scaleX = this.hitbox.scaleY = this.hitbox_radius = this.scale * this.hitbox_proportion;
		this.hitbox.x = 0;
		this.hitbox.y = (- this.silhouette_height/6) * this.scale;
		this.hitboard.scaleX = this.hitboard.scaleY = this.hitboard_radius = this.scale * this.hitboard_proportion;

	}

	prototype.getVanishPoint = function() {

		return this.wave.getVanishPoint();
	}

	prototype.getVanishVector = function() {

		return new Victor(this.wave.getVanishPoint().x, this.wave.getVanishPoint().y);
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
			const x1 = this.wave.shoulder_left.x;
			const y1 = this.wave.shoulder_left.y;
			const x2 = this.wave.shoulder_left.x - this.wave.params.shoulder.left.marge - this.wave.params.shoulder.left.width;
			const y2 = this.wave.params.height;
			const r = intersection(x1,y1,x2,y2,this.x,this.y,this.x,-500); //get the intersection between the shoulder line and a vertical top line above the surfer
			if(r === null) {
				console.log(' --above left shoulder');
				return true;
			}
		}

		//check near right shoulder 
		if(this.x > this.wave.shoulder_right.x) {
			const x1 = this.wave.shoulder_right.x;
			const y1 = this.wave.shoulder_right.y;
			const x2 = this.wave.shoulder_right.x + this.wave.params.shoulder.right.marge + this.wave.params.shoulder.right.width;
			const y2 = this.wave.params.height;
			const r = intersection(x1,y1,x2,y2,this.x,this.y,this.x,-500); //get the intersection between the shoulder line and a vertical top line above the surfer
			if(r === null) {
				console.log(' --above right shoulder');
				return true;
			}
		}

		return false;
	}

	prototype.isOllieing = function() {

		if(this.ollieing === true) return true;
		return false;
	}

	prototype.pause = function() {

		this.timer.pause();

		this.particles_cont.children.map(p => p.pause());
	}

	prototype.resume = function() {

		this.timer.resume();

		this.particles_cont.children.map(p => p.resume());
	}

	prototype.move = function() {			

		this.getAngle();

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
		if(this.time_scale === 1) {
			this.x = this.location.x;
			this.y = this.location.y;		
		} else {
			createjs.Tween.get(this).to({x: this.location.x, y: this.location.y}, this.wave.params.breaking.x_speed);
		}
		
		//set silhouette
		this.setSurferSilhouette();	
	}

	prototype.moveOnOllie = function() {

		//add gravity to ollie initial vector
		this.ollie_vector.add(this.gravity);
		//add initial 
		this.location.add(this.ollie_vector);		
	}

	prototype.ollie = function() {

		//check cooldown
		if(this.ollieing === true) return;
		this.ollieing = true;		
		
		this.ollie_impluse = new Victor(0,-30);
		this.ollie_vector = this.velocity.clone().add(this.ollie_impluse);		

		this.saveTrailSize();
		this.trailsize = 0;
		this.auto_silhouette = false;
	
		window.setTimeout(proxy(this.endOllie,this),350);

	}

	prototype.endOllie = function() {

		this.ollieing = false;
		this.auto_silhouette = true;

		this.ollieParticles();

		this.resetTrailSize();
		this.saveTrailSize();		
		if(this.trailsize_variated === true) return;
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

	prototype.getMousePoint = function(n = 0) {

		if(this.automove === true) {
			return this.spot.debug_cont.localToLocal(this.virtualMouse.x, this.virtualMouse.y, this.wave.foreground_cont);
		}

		var mouse = window.getMousePoint(n);
		return this.wave.foreground_cont.globalToLocal(mouse.x,mouse.y);
	}

	prototype.findLipPointUnder = function() {

		//if there is no lip point at the moment
		if(this.wave.allpoints == null || this.wave.allpoints.length == 0) return null;

		//find point where surfer is bellow
		for(let i=0,len=this.wave.allpoints.length; i<len; ++i) {
			let point = this.wave.allpoints[i];
			if( get2dDistance(this.x,0,point.x,0) <= point.breaking_width >> 1) {
				return this.point_under = point;
			}
		}

		// if there is no point return the most LEFT or RIGHT
		if( this.wave.isLEFT()) {
			const peak = this.wave.findTheLeftPeak();
			const i = 0;
		}
		else {
			const peak = this.wave.findTheRightPeak();
			const i = peak.points.length-1;
		}

		if(typeof(peak) == 'undefined') {
			return null;
		}
		
		return peak.points[i];
	}


	prototype.moveOnWave = function() {

		//return this.moveFromLerp();
		return this.moveFromVelocities();
		// return this.moveFromLerp();
		// return this.moveOnWaveOLD();
	}

	prototype.moveFromVelocities = function() {
		
		// get which lip point surfer is under
		const point_under = this.findLipPointUnder();		

		let breaking_width = 5;
		let breaking_idx = 0;
		let distance_idx = 0;
		if(point_under) {
			breaking_width = point_under.breaking_width;
			breaking_idx = point_under.breaking_idx;
			distance_idx = 1 - (get2dDistance(this.x, 0, point_under.x, 0) / 500);
		}

		// get horizontal velocity from lip position
		let vX = breaking_width * ( 0.5 + breaking_idx ) * distance_idx;

		// get mouse position
		const mouse = this.getMousePoint(0);

		// get vertical velocity from mouse position
		let vY = ( mouse.y - this.y ) / 10;

		// adapt horizontal velocity to mouse direction
		const direction = ( this.x - mouse.x < 0)? 1 : -1;
		vX = vX * direction;
		
		// set initial velocity
		let velocity = new Victor(vX,vY);

		// calcul distance between surfer and mouse
		let distance = this.location.absDistanceX(mouse);
		const distanceMax = 400;
		const distanceMin = 20;
		if(distance >= distanceMax) distance = distanceMax;
		if(distance <= distanceMin) distance = distanceMin;
		const distanceIdx = ( distance ) / ( distanceMax - distanceMin );

		// scale with mouse distance
		velocity.scale(distanceIdx);

		// scale with user skill ( from x1 to x1.5)
		const skill_idx = 1 + (this.getSkill('speed') / 2); 
		velocity.scale(skill_idx);

		// surfer have more speed where on top of the segment ( from x1 to x2 )
		const y_coef = 1 + 1 - ( this.y / this.wave.config.height );
		velocity.scale(y_coef);

		// surfer get more speed when angled to the bottom ( from x1 to x1.5)
		let angle_coef = (this.angle_rad > 0 )? 1 + (this.angle_rad / Math.PI/2)/2 : 1;
		velocity.scale(angle_coef);

		// scale with wave config surfer's velocity coef (from x0 to ...)
		velocity.scaleX(this.config.velocities.x);
		velocity.scaleY(this.config.velocities.y);

		// scale with controls coef (from x0 to x1)
		velocity.scaleX(this.control_velocities.x);
		velocity.scaleY(this.control_velocities.y);

		// add pump-pump to velocity
		velocity = this.addPumpedInertia(velocity);
		
		// set global velocity
		this.velocity = velocity.clone();

		// apply velocity to position
		this.location.add(velocity);

		//sightly up and down random movement
		//this.addMoveZigZag();

		//surfer can't go bellow the wave
		if( this.location.y > this.wave.params.height) {
			this.location.y = this.wave.params.height;
		}

	}

	prototype.isGoingHorizontal = function(angle) {
		
		const del = 20; // 20° tolerance
		if( this.direction === LEFT && ( angle > 180 - del/2 || angle < - 180 + del/2 )) return true;
		if( this.direction === RIGHT && ( angle < del/2 && angle > - del/2 )) return true;
		return false;
	}

	prototype.addPumpedInertia = function(velocity) {
		
		
		// if going horizontal for 15 frame , reset pumped stock
		if( this.isGoingHorizontal(this.angle) ) {
			let countHorizontal = 0;
			for(let i=0,len=60; i<len; ++i) {
				if( this.angles[i] && this.isGoingHorizontal(this.angles[i]) ) countHorizontal++;
				else break;
			}
			if(countHorizontal >= 15) {
				this.pumped = [];
			}
			return velocity;
		}		
		
		// if angle toward bottom, stock inertia in array
		if(this.angle_rad > 0) {
			this.pumped.push(velocity.clone());
		}
		// if angle upward, apply inertia
		else {
			if(this.pumped.length === 0) return velocity;
			const pump = this.pumped.pop();
			pump.scale(0.3);
			velocity.addX(pump);
			velocity.subtractY(pump);
		}

		return velocity;

	}

	/** NOT IN USE  */
	prototype.moveFromLerp = function() {		

		//interpolation to mouse
		var mouse = this.getMousePoint(0);
		this.location.mix(mouse,0.24);

		//interpolation to vanish
		var vanish = this.getVanishPoint();
		this.location.mix(vanish,0.05);

		//sightly up and down random movement
		this.addMoveZigZag();

		//sufer cant go bellow the wave
		if( this.location.y > this.wave.params.height) {
			this.location.y = this.wave.params.height;
		}

	}

	prototype.addMoveZigZag = function() {

		if(!this.zigzag) this.zigzag = new Variation({min:4, max:8, time: 200});
		this.location.y = this.location.y + ( 4 - this.zigzag);

	}

	prototype.moveOnAir = function() {

		// add initial velocity
		this.location.add(this.velocity);
		// get gravity
		const gravity = this.gravity.clone();
		// calcul skill aerial
		const antigrav = gravity.clone().scale(this.getSkill('aerial')/2);
		// compensate gravity with user skill aerial
		gravity.subtract(antigrav);
		// apply gravity to location
		this.location.add(gravity);
		// calcul new velocity
		this.velocity = this.locations[0].clone().subtract(this.locations[1]);		

		//if surfer jump above this line, follow him and move screen
		if(this.isPlayer()) {
			const line = -this.wave.y * 1/4;
			if(this.y < line) {			
				const diff = -(this.y - line);
				//make paralax effect
				this.spot.frontground.y = diff * 1.5;
				this.spot.sea_cont.y = diff;
				this.spot.background.y = diff / 5;
			} else {
				this.spot.frontground.y = 0;
				this.spot.sea_cont.y = 0;
				this.spot.background.y = 0;
			}			
		}


	}

	prototype.stock = function() {

		// stock locations		
		this.locations.unshift(this.location.clone());
		this.locations = this.locations.slice(0,60);
		
		// create point object
		var point = {
			location: this.location.clone(),
			size: this.trailsize,
			angle : this.angle,
			angle_rad : this.angle_rad	
		}

		// add point to trails array
		this.trailpoints.unshift(point);
		this.trailpoints = this.trailpoints.slice(0,50);

		// add point to spatters array
		if(point.location.y < 0) {
			this.spatterpoints.unshift(point);
			this.spatterpoints = this.spatterpoints.slice(0,50);
		}

		// stock velocities
		this.velocities.unshift(this.velocity.clone());
		this.velocities = this.velocities.slice(0,50);

		// stock speed
		this.speed = this.locations[0].distance(this.locations[1]);

		// stock angle
		this.angles.unshift(this.angle);
		this.angles = this.angles.slice(0,50);

		// set direction
		this.direction = (this.locations[0].x - this.locations[1].x < 0) ? LEFT : RIGHT;

	}

	prototype.initAerial = function() {

		// cancel if already on air
		if(this.status=='aerial') return;
		// set current status
		this.status = 'aerial';
		// hide trail
		this.saveTrailSize();
		this.trailsize = 0;
		// particles
		this.initAerialParticles();	
		//test
		this.initImagePersistance();
		// ???
		this.velocity.magnitude(1);
		// slow things down
		window.switchSlowMo(0.8,1000);
		// tricks		
		this.initTricks();
		// save aerial position
		this.aerial_start_point = this.location.clone();
		// fade out spatter ramp
		const tween = createjs.Tween.get(this.spatter_ramp_shape).to({alpha: 0}, 1000, createjs.Ease.quartIn);
		// stock tween and remove it at the end
		this.addTween(tween);
		tween.call(proxy(this.removeTween, this, [tween]));

	}

	prototype.addTween = function(tween) {

		this.tweens.push(tween);
	}

	prototype.removeTween = function(tween) {

		this.tweens.splice(this.tweens.indexOf(tween),1);
	}

	prototype.removeAllTweens = function() {

		this.tweens.map(function(t) { if( t != null) t.paused = true; } );
		createjs.Tween.removeTweens(this);
		this.tweens = null;
	}

	prototype.selfRemove = function() {

		this.removeAllTweens();
		this.timer.clear();
		this.removeAllEventListeners('tick');
		this.removeAllChildren();

	}

	prototype.initTricks = function() {

		var ev = new createjs.Event("aerial_start");

		//var impulse = this.velocity.magnitude();
		var impulse = 1;

		if(impulse > 55) {

			ev.tricks = 'Double Backflip';
			this.initDoubleBackflip();
		}
		else if(impulse > 40) {

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
		const tween = createjs.Tween.get(this.silhouette_cont)
			.to({rotation:360 * this.wave.direction},1000)
			.set({rotation: 0})
			.call(proxy(this.tricksEnded,this))
			;

		this.addTween(tween);
		tween.call(proxy(this.removeTween, this, [tween]));
	}

	prototype.initDoubleBackflip = function() {

		this.tricked = true;
		const tween = createjs.Tween.get(this.silhouette_cont)
			.to({rotation:720 * this.wave.direction},1500)
			.set({rotation:0})
			.call(proxy(this.tricksEnded,this))
			;
		this.addTween(tween);
		tween.call(proxy(this.removeTween, this, [tween]));
	}

	prototype.tricksEnded = function() {

		this.tricked = false;
	}

	prototype.initImagePersistance = function() {

		this.imagePersistanceTimer = window.setInterval(proxy(this.drawPersistedImage,this), 200);
	}

	prototype.stopImagePersistance = function() {

		if(this.imagePersistanceTimer) {
			this.silhouette_cont.uncache();
			window.clearInterval(this.imagePersistanceTimer);
		}
	}

	prototype.drawPersistedImage = function() {

		this.silhouette_cont.cache(-100,-100,200,200);
		let image = new createjs.Bitmap(this.silhouette_cont.cacheCanvas);
		image.scaleX = this.scale;
		image.scaleY = this.scale;
		image.x = this.x + (- this.silhouette_width) * this.scale;		
		image.y = this.y + (- this.silhouette_height) * this.scale - 50;	
		image.alpha = 0.5;

		this.wave.surfers_cont.addChild(image);

		createjs.Tween.get(image).to({ alpha: 0}, 500).call(proxy(this.removePersistedImage,this,[image]));
	}

	prototype.removePersistedImage = function(image) {

		this.wave.surfers_cont.removeChild(image);
	}

	prototype.initAerialParticles = function() {

		this.aerialParticles();
	}

	prototype.stopAerialParticles = function() {

		this.particles_cont.removeChild(this.aerial_particles_emitter);
		this.aerial_particles_emitter.clear();
		this.aerial_particles_emitter = null;
	}

	prototype.aerialParticles = function() {

		const surfer = this;
		this.aerial_particles_emitter = new ParticleEmitter({
			x: 0, // + this.wave.params.breaking_width*3*(-1*this.wave.direction),
			y: 0,
			density: 5,
			duration: 0,
			frequency: 50,
			angle: this.angle_rad + Math.PI,
			spread: Math.PI / 10,
			magnitude: this.speed,
			magnitudemax: this.speed*2,
			color: '#FFF',
			size: 1,
			sizemax: 2,
			fader: 0.4,
			fadermax: 0.5,
			scaler: 0.1,
			forces: [vec2.fromValues(this.gravity.x,this.gravity.y * 0.1)],
			shapes: [
				{shape:'circle',percentage:50,fill:'#FFF'},
				{shape:'circle',percentage:50,stroke:1,strokeColor:'#FFF'},
				],
			onEmit: function(emitter) { emitter.params.angle = surfer.angle_rad + Math.PI },
		});
		
		this.particles_cont.addChild(this.aerial_particles_emitter);
	}

	prototype.initRide = function() {

		//end of an Aerial
		if(this.status === 'aerial') {

			this.endAerial();		
			this.dispatchEvent('aerial_end');
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


	prototype.endAerial = function() {

		//if a tricks is not ended, surfer fall
		if(this.tricked === true) {
			//init fall
			this.fall('bad landing aerial');
			//throw event			
			this.dispatchEvent('fall_tricks')
		}

		//remove aerial particles
		this.stopAerialParticles();

		//init landing particles
		this.endAerialParticles();

		this.stopImagePersistance();

		// remove spatter 
		this.clearSpatter();

		// remove slow motion
		window.switchSlowMo(1,1000);

		// update aerial end point
		this.aerial_end_point = this.location.clone();
		this.trail_splash._width = 200;
		this.trail_splash.alpha = 1;
		this.trail_splash.x = this.aerial_end_point.x;
		this.trail_splash.y = 0;
		createjs.Tween.get(this.trail_splash).to({ _width: this.trail_splash._width/2}, 700, createjs.Ease.quartIn).to({ alpha: 0, y: -20}, 1000);

		// landiing slowly
		const default_time = 2000;
		const time = default_time * (1 - this.getSkill('aerial'));
		// tween it slowly to normal config
		const tween = createjs.Tween.get(this.control_velocities)
			.to({ x: 0.1, y: 0.1 }, time / 2)			
			.to({ x: 1, y: 1 }, time / 2)						
			;	
		

		//handle trail size
		this.resetTrailSize();	
		this.trailpoints[0].location.y = -120;
		this.trailpoints[0].size = this.trailsize*10;
		Variation.prototype.applyOnce(this,'trailsize',{
					min: this.trailsize*10,
					max: this.trailsize,
					time: 1000,
					loops: 1,
					slope: 'up',
					callback: proxy(this.resetTrailSize,this),
				});


		//for player only
		if(this.isPlayer() === true) {
			//play sound
			let sound = createjs.Sound.play("bravo");  // play using id.  Could also use full sourcepath or event.src.     
			sound.volume = 0.1;			
		}
	}

	prototype.endAerialParticles = function() {

		const surfer = this;
		this.aerial_particles_emitter = new ParticleEmitter({
			x: 0,
			y: 0,
			density: 30,		
			angle: - Math.PI / 2,
			spread: Math.PI / 2,
			magnitude: this.speed,
			magnitudemax: this.speed*2,
			color: '#FFF',
			size: 1,
			sizemax: 6,
			fader: 0.2,
			fadermax: 0.4,
			scaler: 0.2,
			forces: [vec2.fromValues(this.gravity.x,this.gravity.y * 0.5)],
			shapes: [
				{shape:'circle',percentage:50,fill:'#FFF'},
				],
		});
		
		this.particles_cont.addChild(this.aerial_particles_emitter);
	}



	prototype.isFalling = function() {
		if(this.falling === true) return true;
	}

	prototype.fall = function(reason) {

		if(this.falling === true) return;
		this.falling = true;

		this.fall_reason = reason;
		console.log('fall because: ', reason);

		var e = new createjs.Event('fall');
			e.surfer = this;
			e.reason = reason;
			this.dispatchEvent(e);

		//this.showFallPlouf();
		//this.ploufinterval = window.setInterval(proxy(this.showFallPlouf,this),200);

		createjs.Tween.get(this.silhouette_cont)
		.to({rotation:360*this.wave.direction*-1,alpha:0,scaleX:0.4,scaleY:0.4},1000)
		.to({rotation:0,alpha:1,scaleX:1,scaleY:1},0)
		.wait(1000)
		.call(proxy(this.fallFinished,this));
		;

		this.splash_anim.gotoAndPlay('splash');
	
	}

	prototype.fallFinished = function() {

		window.clearInterval(this.ploufinterval);

		var e = new createjs.Event('fallen');
			e.surfer = this;
			this.dispatchEvent(e);

		if(!TEST) {
			//remove surfer movement
			this.removeAllEventListeners('tick');
			this.timer.clear();			
			this.timer = null;			
		}	
	}

	prototype.fallWithInertia = function() 
	{
		this.velocity.scale(0.5);	
				
		this.location.add(this.velocity);
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
		this.wave.surfers_cont.addChild(plouf);

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
		for(var i=0; i < 30; ++i) {
			var particule = emitter.emitParticle();
			this.wave.particles_cont.addChild(particule);
			this.wave.particles.push(particule);
		}
		*/
	}

	prototype.checkFall = function() {

		if(TEST === 1) return;

		if(this.wave === undefined) return;

		if(this.falling) return;

		//check trajectory
		this.checkTrajectory();

		//new method for checking fall point
		var points = this.wave.getAllPeaksPoints();

		var j = points.length;
		while(j--) {		
			var point = points[j];	
			
			//check all top fall points
			if(point.topfallscale > 1 && this.hitBody(point.x, 0, point.topfallscale)) {
				this.disturbance ++;
				this.showFallVeil(this.disturbance/this.disturbance_max*100);
				if(this.disturbance < this.disturbance_max) return;
				this.fall('hit top lip');
				this.dispatchEvent('fall_top');
				return;
			}

			//check only splashed points
			if(point.splashed) {
				if(this.hitBody(point.x, point.splash_y, point.bottomfallscale)) {		
					this.disturbance ++;
					this.showFallVeil(this.disturbance/this.disturbance_max*100);
					if(this.disturbance < this.disturbance_max) return;			
					this.fall('hit bottom splash');
					this.dispatchEvent('fall_bottom');
					return;
				}
			} 			
		}

		//reset disturbance
		this.disturbance = 0;
		this.hideFallVeil();


		//does surfer hits tube point
		if(this.isTubing()) {
			//surfer is in da tube
			this.tubeIn(); 		
		}
		else {
			//surfer is out da tube
			this.tubeOut(); 
		}

		//does surfer shots something
		this.checkWeaponHits();

		//does surfer hits obstacles
		this.checkHitObstacles();

		//does surfer hits other serfrs
		this.checkHitSurfers();		

		//dispatch normal event
		this.dispatchEvent('surfing');

	}

	prototype.showFallVeil = function(percent)
	{
		if(this.isPlayer() == true) {
			this.spot.showOverlayVeil(percent);
		}
	}

	prototype.hideFallVeil = function()
	{
		if(this.isPlayer() == true) {
			this.spot.hideOverlayVeil();
		}
	}

	prototype.isTubing = function() {

		const points = this.wave.getAllPeaksPoints();
		const waveHeight = this.wave.params.height;
		const tubePoints = [];
		let i = points.length;
		while(i--) {	
			var point = points[i];		
			if(point.splashed && this.hitBody(point.x, waveHeight>>1, point.tubescale)) {
				//stock the current deep of the tube 			
				this.tubeDepths.push(point.tubedeep);
				//yes we are tubing !							
				return true;
			} 		
		}
		return false;
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

		//make sure triggring only when getting out of the tube
		if(this.tubing === false) {
			return;
		}

		//get the deep of the tube
		this.lastTubeDeep = this.tubeDepths.reduce((max,deep) => {
			return (deep > max) ?  deep : max;
		},0);

		console.log('tube deep = ', this.lastTubeDeep);

		//empty the tube
		this.tubeDepths = [];

		this.dispatchEvent('tube_out');
		this.tubing = false;
		this.tubeTime = 0;
	}

	prototype.checkTrajectory = function() {

		if(this.angles[5] === undefined) return;

		var delta = Math.abs(this.angle - this.angles[5])%360;
		var diff = (delta > 180)? 360 - delta : delta;
		var allowed = 120 + 60*this.getSkill('agility');
			
		if(diff > allowed) {
			//init fall
			this.fall('bad trajectory');
			//throw event			
			this.dispatchEvent('fall_edge')
		}
	}

	prototype.hit = function(zone, x, y, radius) {

		if(zone == 'board') return this.hitBoard(x,y,radius);
		if(zone == 'body') return this.hitBody(x,y,radius);
		if(zone == 'weapon') return this.hitWeapon(x,y,radius);
		if(zone == 'none') return null;
		return console.error("La zone de hit n'existe pas");
	}

	prototype.hitBody = function(x,y,radius) {
				
		const minDistance = radius + this.hitbox_radius;
		const xDist = x - this.x - this.hitbox.x;
		const yDist = y - this.y - this.hitbox.y;
		const distance = Math.sqrt(xDist*xDist + yDist*yDist);

		if (distance < minDistance) {
			return true;
		}
		return false;
	}

	prototype.hitBoard = function(x,y,radius) {

		const minDistance = radius + this.hitboard.graphics.command.radius;
		const xDist = x - this.x - this.hitboard.x;
		const yDist = y - this.y - this.hitboard.y;
		const distance = Math.sqrt(xDist*xDist + yDist*yDist);

		if(distance < minDistance) {
			return true;
		}
		return false;
	}

	prototype.hitWeapon = function(x,y,radius) {

		for(let i=0,len=this.weapon_points.length-1; i<len; i++) {
			const point = this.weapon_points[i];
			const minDistance = radius + point.graphics.command.radius;
			const xDist = x - this.x - point.x;
			const yDist = y - this.y - point.y;
			const distance = Math.sqrt(xDist*xDist + yDist*yDist);

			if(distance < minDistance) {
				return true;
			}
		}

		return false;
	}

	prototype.checkHitSurfers = function() {

		const len = this.wave.surfers.length;

		if(len <= 1) return;

		for(let j=0; j<len; ++j) {

			let surfer = this.wave.surfers[j];

			if(this == surfer) continue;
			if(surfer.isOllieing()) continue;

			if(this.hitBoard(surfer.x,surfer.y,surfer.hitbox_radius)) {
				
				if( ! this.hasCollision(surfer)) {
					this.hitSurfer(surfer);
				}
			}
		}		
	}

	prototype.hitSurfer = function(surfer) {

		this.addCollision(surfer);

		// get force
		let own = this.getSkill('force');
		let his = surfer.getSkill('force');

		// add velocities
		let total = this.velocity.length() + surfer.velocity.length();
		own += this.velocity.length() / total;
		his += surfer.velocity.length() / total;

		// take dammage if his total bigger than me
		if(his > own) {
			// calcul dammage
			let dmg = his - own;
			// update lifebar
			this.updateLifebar(dmg);
			// if lifebar <= zero , fall & dispatch event
			let lifebarZero = this.lifebar.scaleX - dmg <= 0;
			if(lifebarZero) {

				this.fall('collision');

				const ev = new createjs.Event('surfer_kill');
					ev.player = this.spot.surfer;
					ev.killer = surfer;
					ev.killed = this;
					stage.dispatchEvent(ev);
			}
		}

	}

	prototype.updateLifebar = function(q) {

		this.lifebar.alpha = 1;
		createjs.Tween.get(this.lifebar,{override: true}).to({scaleX: this.lifebar.scaleX - q}, 500).wait(600).to({alpha:0},300);

	}

	prototype.hasCollision = function(obj) {

		return this.collisions.indexOf(obj) >= 0;
	}

	prototype.addCollision = function(obj) {

		this.collisions.push(obj);
		setTimeout(proxy(this.removeCollision,this,[obj]), 2000);
	}

	prototype.removeCollision = function(obj) {

		this.collisions.splice(this.collisions.indexOf(obj),1);
	}

	prototype.checkHitObstacles = function() {

		//no hit when surfer is ollying
		if(this.isOllieing() === true) return;

		//test all waves obstacles
		for(var i=0,l=this.wave.obstacles.length;i<l;++i) {
			var obstacle = this.wave.obstacles[i];

			if(obstacle.hitBonus(this)) {
				//launch event
				var ev = new createjs.Event(obstacle.config.name+'_bonus_hitted');
				ev.obj = obstacle;
				this.dispatchEvent(ev);
			}

			if(obstacle.hitMalus(this)) {
				//launch event
				var ev = new createjs.Event(obstacle.config.name+'_malus_hitted');
				ev.obj = obstacle;
				this.dispatchEvent(ev);
			}
		}
	}

	prototype.checkWeaponHits = function() {

		for(let i=0,len = this.wave.obstacles.length; i<len; i++) {
			let obstacle = this.wave.obstacles[i];

			//destroy obstacle by shoting their body
			if(obstacle.bodies.length !== 0) {
				for(let i=0,len=obstacle.bodies.length-1; i<=len; i++) {
					let body = obstacle.bodies[i];
					if(this.hit('weapon', body.x, body.y, body.graphics.command.radius)) {
						console.log('body shoted');
					}
				}
			}
			
			//cancel malus by shoting at it
			if(obstacle.maluses.length !== 0) {
				for(let i=0,len=obstacle.maluses.length-1; i<=len; i++) {
					let malus = obstacle.maluses[i];
					let pt = malus.localToLocal(0,0,this.wave.foreground_cont);
					if(malus.shotable) {
						if(this.hit('weapon', pt.x, pt.y, malus.graphics.command.radius)) {
							console.log('malus shoted');
							malus.onShoted();
							break;
						}
					}
				}
			}
		}
	}


	prototype.drawTrails = function() {

		this.drawTrail();
		this.drawSpatter();

	}

	prototype.drawTrail = function() {

		const nb = this.trailpoints.length - 1;
		const points = [];
		//const xs = [];


		//if(this.isBot()) continue;
		const suction = this.wave.params.suction.clone();

		//update points with the suction vector
		for (let i = 0; i <= nb; ++i) {
			//apply vector suction
			let trail = this.trailpoints[i];
			trail.location.add(suction);
			//create xy Point
			let x = trail.location.x + 5;
			let y = trail.location.y;
			let point = new createjs.Point(x,y);
			point.size = trail.size;
			point.angle = trail.angle_rad;
			points.push(point);
			//save all x values
			//xs.push(point.x);
		}

		//get minimum x and maximum x a the trail
		//const xmin = Math.min.apply(null,xs) - 100;
		//const xmax = Math.max.apply(null,xs) + 100;


		//draw shape of the trail
		this.trail_shape.graphics.clear();
		this.trail_shape.graphics.beginFill("rgba(255,255,255,0.3)");
		//this.trail_shape.graphics.beginRadialGradientFill(["rgba(255,255,255,1)","rgba(255,255,255,0)"], [0,1], this.x, this.y, 0, this.x, this.y, 600 );
		for(let i=0; i<=nb; ++i) {
			let point = points[i];
			let size = i*points[i].size + this.trailcoef*points[i].size;
			let x = size * Math.cos(point.angle + Math.PI/2) + point.x;
			let y = size * Math.sin(point.angle + Math.PI/2) + point.y;
			this.trail_shape.graphics.lineTo(x,y);	

		}
		for(let i=nb; i>=0; --i) {
			let point = points[i];
			let size = i*points[i].size + this.trailcoef*points[i].size;
			let x = size * Math.cos(point.angle + Math.PI + Math.PI/2) + point.x;
			let y = size * Math.sin(point.angle + Math.PI + Math.PI/2) + point.y;
			this.trail_shape.graphics.lineTo(x,y);
		}	
		this.trail_shape.graphics.closePath();		

		// draw landing aerial splash
		/*this.trail_splash.graphics.clear();
		if(this.trail_splash._width) {
			this.trail_splash.graphics.beginFill("rgba(255,255,255,0.5");
			this.trail_splash.graphics.drawCircle(0, 0, this.trail_splash._width/2);
		}
		*/
		

		this.trail_cont.mask = this.wave.shape_mask;
		//this.trail_cont.cache(xmin,0,xmax-xmin,this.wave.params.height);
		this.trail_cont.alpha = this.alpha;

	}

	prototype.drawSpatter = function() {
	
		if(this.spatterpoints.length === 0) return;

		if(this.status !== 'aerial') return;

		const points = this.spatterpoints;
		const nb     = points.length-1;

		const actual = points[0].location;
		const start  = this.aerial_start_point;
		start.y      = 0;

		this.color_spatter_num += 10;
		const inner = 'rgba(255,255,255,0.6)'; //createjs.Graphics.getHSL(this.color_spatter_num, 100, 50);
		const outer = 'rgba(255,255,255,0.3)'; //createjs.Graphics.getHSL(this.color_spatter_num, 100, 50, 0.3);
		const alpha = 'rgba(255,255,255,0)'; //createjs.Graphics.getHSL(this.color_spatter_num, 100, 50, 0.3);

		this.spatter_shape_inner.graphics.clear();
		this.spatter_shape_outer.graphics.clear();
		this.spatter_shape_inner.graphics.beginLinearGradientFill([inner,alpha],[0,0.9], actual.x, actual.y, start.x, start.y);
		this.spatter_shape_outer.graphics.beginLinearGradientFill([outer,alpha],[0,0.9], actual.x, actual.y, start.x, start.y);

		const thick_min = 2;
		const thick_max = 20;
		const outerwidth = (this.wave.direction === LEFT)? 5 : -5;

		for(let i=0; i<nb; ++i) {
			let p1 = points[i],
				p2 = points[i+1],
				z1 = thick_min + i * (thick_max - thick_min) / nb,
				z2 = thick_min + (i+1) * (thick_max - thick_min) / nb,
				x1 = z1 * Math.cos(p1.angle_rad + Math.PI/2) + p1.location.x,
				y1 = z1 * Math.sin(p1.angle_rad + Math.PI/2) + p1.location.y,
				x2 = z2 * Math.cos(p2.angle_rad + Math.PI/2) + p2.location.x,
				y2 = z2 * Math.sin(p2.angle_rad + Math.PI/2) + p2.location.y,
				xc = ( x1 + x2 ) >> 1,
				yc = ( y1 + y2 ) >> 1
				;
			this.spatter_shape_inner.graphics.quadraticCurveTo(x1,y1,xc,yc);	
			this.spatter_shape_outer.graphics.quadraticCurveTo(x1,y1 - outerwidth,xc,yc - outerwidth);	

		}
		for(let i=nb; i>0; --i) {
			let p1 = points[i],
				p2 = points[i-1],
				z1 = thick_max - (nb-i-1) * (thick_max - thick_min) / nb,
				z2 = thick_max - (nb-i) * (thick_max - thick_min) / nb,
				x1 = z1 * Math.cos(p1.angle_rad + Math.PI + Math.PI/2) + p1.location.x,
				y1 = z1 * Math.sin(p1.angle_rad + Math.PI + Math.PI/2) + p1.location.y
				x2 = z2 * Math.cos(p2.angle_rad + Math.PI + Math.PI/2) + p2.location.x,
				y2 = z2 * Math.sin(p2.angle_rad + Math.PI + Math.PI/2) + p2.location.y,
				xc = ( x1 + x2 ) >> 1,
				yc = ( y1 + y2 ) >> 1
			;
			this.spatter_shape_inner.graphics.quadraticCurveTo(x1,y1,xc,yc);
			this.spatter_shape_outer.graphics.quadraticCurveTo(x1,y1 + outerwidth,xc,yc + outerwidth);	
		}	

		/*
		this.spatter_shape_inner.graphics.clear();
		this.spatter_shape_outer.graphics.clear();
		this.spatter_shape_inner.graphics.beginLinearGradientStroke([color1,'rgba(255,255,255,0)'], [0, 1],this.x,this.y,start.x,start.y).setStrokeStyle(thick*2/5,'round');
		this.spatter_shape_outer.graphics.beginLinearGradientStroke([color2,'rgba(255,255,255,0)'], [0, 1],this.x,this.y,start.x,start.y).setStrokeStyle(thick,'round');

		for(let i=0,len=points.length; i<len-1; ++i) {

			let p1 = points[i],
				p2 = points[i+1],
				x1 = p1.location.x,
				x2 = p2.location.x,
				y1 = p1.location.y,
				y2 = p2.location.y,
				xc = ( x1 + x2 ) >> 1,
				yc = ( y1 + y2 ) >> 1
				;

			this.spatter_shape_inner.graphics.quadraticCurveTo(x1,y1,xc,yc);
			this.spatter_shape_outer.graphics.quadraticCurveTo(x1,y1,xc,yc);
			
		}
		*/	

		//draw ramp

		
		const width = 200;
		const height = actual.y - start.y;
		const ch = height * 0.2;
		const cw = width/10;

		if(actual.y < -150  || get1dDistance(actual.x,start.x) > 100 ) return;
		this.spatter_ramp_shape.graphics.clear();
		this.spatter_ramp_shape.graphics.beginFill('#FFF');
		this.spatter_ramp_shape.graphics.moveTo(start.x - width/2,start.y)
										.lineTo(start.x + width/2,start.y)
										.quadraticCurveTo(start.x + cw, ch, actual.x, actual.y)
										.quadraticCurveTo(start.x - cw, ch, start.x - width/2, start.y)
										;

	}

	prototype.clearSpatter = function() {

		createjs.Tween.get(this.spatter_cont).to({ alpha: 0}, 800).call(proxy(function() {
			this.spatterpoints = [];
			this.spatter_shape_outer.graphics.clear();
			this.spatter_shape_inner.graphics.clear();
			this.spatter_ramp_shape.graphics.clear();
			this.spatter_ramp_shape.alpha = 1;		
			this.spatter_cont.alpha = 1;	
			this.color_spatter_num = 0;
		},this));
	}

	prototype.drawWeapon = function() {

		if(!this.spot.isRun) return;
		this.drawLightSaber();
	}

	prototype.drawLightSaber = function() {

		this.weapon_cont.removeAllChildren();

		let length = this.saber_length;
		let angle = this.angle_rad + this.saber_angle;

		this.saber_middle.x = this.saber_start.x + length/2 * Math.cos(angle);
		this.saber_middle.y = this.saber_start.y + length/2 * Math.sin(angle);

		this.saber_trail.x = this.saber_end.x;
		this.saber_trail.y = this.saber_end.y;

		this.saber_end.x = this.saber_start.x + length * Math.cos(angle);
		this.saber_end.y = this.saber_start.y + length * Math.sin(angle);

		let saber = new createjs.Shape();
		saber.graphics.beginStroke(this.saber_color).setStrokeStyle(5)
								.moveTo(this.saber_start.x,this.saber_start.y).lineTo(this.saber_end.x,this.saber_end.y)
								.beginStroke('white').setStrokeStyle(2)
								.moveTo(this.saber_start.x,this.saber_start.y).lineTo(this.saber_end.x,this.saber_end.y)
								;		

		var blurFilter = new createjs.BlurFilter(5, 5, 1);
		saber.filters = [blurFilter];
		var bounds = blurFilter.getBounds();
		saber.cache(this.saber_start.x - length, this.saber_start.y - length, length*2, length*2);

		let trail = new createjs.Shape();
		trail.graphics.beginFill(this.saber_color)
								.moveTo(this.saber_start.x, this.saber_start.y)
								.lineTo(this.saber_end.x, this.saber_end.y)
								.lineTo(this.saber_trail.x, this.saber_trail.y)
								.closePath();
		trail.alpha = 0.3;

		this.weapon_cont.addChild(saber, trail);

	}

	prototype.lightSaberStrike = function() {

		let amp = Math.PI/3;
		let time = 300;
		createjs.Tween.get(this).to({saber_angle: amp},time*2/5).to({saber_angle:-amp},time*2/5).to({saber_angle: 0},time*1/5);
	}

	prototype.drawDebug = function() {
		
		this.hitboard.alpha = 0;	
		this.hitbox.alpha = 0;
		this.virtualMouse.alpha = 0;

		this.debug_cont.alpha = 0;

		

		// for(let i=0, len=this.trailpoints.length; i < len ; ++i) {
		// 	let point = this.trailpoints[i];
		// 	let circle = new createjs.Shape();
		// 	circle.graphics.beginFill('black').drawCircle(0,0,5);
		// 	circle.x = point.location.x;
		// 	circle.y = point.location.y;

		// 	this.wave.debug_cont.addChild(circle);
		// }

		if(DEBUG === 0) return;

		this.hitbox.alpha = 0.2;		
		this.hitboard.alpha = 0.8;	
		this.virtualMouse.alpha = 0.5;
		this.debug_cont.alpha = 1;

	}

	prototype.getAngle = function() {

		if(this.locations[1] === undefined) return this.angle = 270;
		this.angle_rad = Math.atan2(this.locations[0].y - this.locations[1].y,this.locations[0].x - this.locations[1].x);
		this.angle = Math.degrees(this.angle_rad);	
		
		return this.angle;
	}

	prototype.setSurferSilhouette = function() {	
		
		if(this.auto_silhouette === false) return;

		this.getAngle();
		this.silhouette.removeChildAt(0);
		this.silhouette.addChild(this.getAngledSilhouette());			

	}

	prototype.getAngledSilhouette = function() {
		//dont touch
		//unless you want to rewrite all bitmap condition......
		if(this.locations[0] === undefined || this.locations[1] === undefined) return new createjs.Bitmap(queue.getResult('surfer_S'));		
		var rad = Math.atan2(this.locations[1].x-this.locations[0].x,this.locations[1].y-this.locations[0].y);
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