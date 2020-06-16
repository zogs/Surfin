(function() {

	// define usefull constant (NB: use positive numeric for perf reason)
	const LEFT = 1;
	const CENTER = 0;
	const RIGHT = 2;

	function Surfer(params) {

		this.Container_constructor();

		let defaults = {
			type: 'player',
			img: 'astrosurfer',
		}

		params = Object.assign({}, defaults, params);

		this.init(params);
	}

	var prototype = createjs.extend(Surfer, createjs.Container);
	//add EventDispatcher
	createjs.EventDispatcher.initialize(prototype);
	//public static properties
	prototype.gravity = new Victor(0,7);
	prototype.hitbox_proportion = 70;
	prototype.hitboard_proportion = 30;

	//init
	prototype.init = function(params) {

		this.wave = params.wave;
		this.spot = params.spot;
		this.config = Object.assign({}, this.spot.config.surfers, params);
		this.x = params.x;
		this.y = params.y;

		this.location;
		this.locations = [];
		this.pathpoints = [];
		this.trailpoints = [];
		this.spatterpoints = [];
		this.collisions = [];
		this.tweens = [];
		this.timers = [];
		this.trailsize = 1;
		this.trailcoef = 3.2;
		this.config.meter_height = 1.2;
		this.config.pixel_height = 160*rY; //average pixel height of character
		this.velocity = new Victor();
		this.velocities = [];
		this.pumped = [];
		this.time = 0;
		this.speed = 0;
		this.angle = 90;
		this.angle_rad = Math.PI/2;
		this.angles = [];
		this.bearing = 'S';
		this.status = 'wait';
		this.paused = false;
		this.tubing = false;
		this.tubeTime = 0;
		this.tubeMinimumTime = 1000;
		this.tubeDepths = [];
		this.riding = false;
		this.falling = false;
		this.fallen = false;
		this.surfing = false;
		this.automove = false;
		this.boosting = false;
		this.ollie_cooldown = 1000;
		this.auto_silhouette = true;
		this.distanceMinToMouse = CURRENTX/2+100;
		this.distanceMoyToMouse = CURRENTX/2+125;
		this.distanceMaxToMouse = CURRENTX/2+150;
		this.trailsize_origin = this.trailsize;
		this.color_spatter_num = 0;
		this.fall_reason = null;
		this.point_under = null;
		this.aerial_takeoff_limit = 10;
		this.aerial_quality_takeoff = 0;
		this.aerial_quality_landing = 0;
		this.aerial_start_point = null;
		this.aerial_end_point = null;
		this.aerial_end_point_width = null;
		this.aerial_particles_emitter = null;
		this.control_velocities = new Victor(1,1);
		this.time_scale = (TIME_SCALE) ? TIME_SCALE : 1;
		this.imagePersistanceTimer = null;
		this.mouseChildren = false;

		this.skills = params.skills || USER.skills;
		this.disturbance = 0;
		this.disturbance_max = 20;



		this.trail_water_shape = new createjs.Shape();
		this.wave.trails_cont.addChild(this.trail_water_shape);

		this.trails_path_cont = new createjs.Container();
		this.wave.trails_cont.addChild(this.trails_path_cont);

		this.spatter_shape_inner = new createjs.Shape();
		this.spatter_shape_outer = new createjs.Shape();
		this.spatter_ramp_shape = new createjs.Shape();
		this.spatter_cont = new createjs.Container();
		this.spatter_cont.addChild(this.spatter_ramp_shape,this.spatter_shape_outer,this.spatter_shape_inner);
		this.wave.spatters_cont.addChild(this.spatter_cont);

		this.particles_cont = new createjs.Container();
		this.addChild(this.particles_cont);

		this.silhouette_cont = new createjs.Container();
		this.addChild(this.silhouette_cont);
		this.initSilhouette();

		this.splash_cont = new createjs.Container();
		this.addChild(this.splash_cont);
		this.initSplash();

		this.hitbox = new createjs.Shape();
		this.hitbox.graphics.beginFill('orange').drawCircle(0,0,1);
		this.hitbox.alpha = 0;
		this.hitbox_radius = 1;
		this.addChild(this.hitbox);

		this.hitboard = new createjs.Shape();
		this.hitboard.graphics.beginFill('pink').drawCircle(0,0,1);
		this.hitboard.alpha = 0;
		this.hitboard_radius = 1;
		this.addChild(this.hitboard);

		this.lifebar = new createjs.Shape();
		this.lifebar.graphics.clear().beginStroke('rgba(255,255,255,0.5)').setStrokeStyle(5).moveTo(0,0).lineTo(100,0);
		this.lifebar.alpha = 0;
		this.lifebar_cont = new createjs.Container();
		this.lifebar_cont.x = -50*rX;
		this.lifebar_cont.y = 80*rY;
		this.lifebar_cont.addChild(this.lifebar);
		this.addChild(this.lifebar_cont);

		this.debug_cont = new createjs.Container();
		this.debug_cont.alpha = 0;
		this.addChild(this.debug_cont);

		this.weapons = {};
		this.weapon_cont = new createjs.Container();
		this.addChild(this.weapon_cont);


		this.virtualMouse = new createjs.Shape();
		this.virtualMouse.graphics.beginFill('pink').drawCircle(0,0,3);
		this.spot.debug_cont.addChild(this.virtualMouse);
		this.virtualMouse.x = this.x + this.wave.x;
		this.virtualMouse.y = this.wave.y - this.wave.params.height + this.y;
		this.virtualMouse.alpha = 0;

		this.ticker = this.on('tick', this.tick, this);

		this.initEventsListener();

		this.resize();

		this.weapons.shield = new Shield({color: this.spot.planet.colors.wave[1][0], scale: this.config.actualScale });
		this.weapon_cont.addChild(this.weapons.shield);

		this.weapons.hadoken = new Hadoken({direction: this.wave.direction, surfer: this, ball_container: this.wave.weapon_cont, scale: this.config.actualScale});
		this.weapon_cont.addChild(this.weapons.hadoken);
	}

	//public methods


	prototype.tick = function() {

		if(this.paused) return;

		this.getAngle();
		this.detectAboveLipPoint();
		this.move();
		this.stock();
		this.checkFall();
		this.drawTrails();
		this.drawDebug();
	}

	prototype.initEventsListener = function() {

		//custom events

		this.on('takeoff',function(event) {
			if(this.isPlayer()) {
				var ev = new createjs.Event('player_takeoff');
				ev.surfer = event.surfer;
				ev.wave = event.wave;
				ev.quality = event.quality;
				this.spot.dispatchEvent(ev);
			}
		},this);


		this.on('takeoff_ended',function(event) {
			if(this.isPlayer()) {
				var ev = new createjs.Event('player_takeoff_ended');
				ev.surfer = event.surfer;
				ev.wave = event.wave;
				ev.quality = event.quality;
				this.spot.dispatchEvent(ev);
			}
		},this);

		this.on('aerial_start',function(event) {
			var ev = new createjs.Event('surfer_aerial_start');
			ev.trick = event.trick;
			this.spot.dispatchEvent(ev);
		},this);

		this.on('aerial_end',function(event) {
			var ev = new createjs.Event('surfer_aerial_end');
			ev.trick = event.trick;
			this.spot.dispatchEvent(ev);
		},this);

		this.on('fall',function(event) {
			if(this.isPlayer()) {
				var ev = new createjs.Event('player_fall');
				ev.reason = event.reason;
				ev.surfer = event.surfer;
				this.spot.dispatchEvent(ev);
			}
		},this);

		this.on('fallen',function(event) {
			if(this.isPlayer()) this.spot.dispatchEvent('player_fallen');
		},this,true);

		this.spot.on('malus_hitted', function(event) {
			this.hitMalus(event.object);
		},this);

		this.on('surfing',function(event) {
			this.spot.dispatchEvent('surfer_surfing');
		});
		this.on('tube_in', function(event) {
			if(this.isPlayer()) this.spot.dispatchEvent('surfer_tube_in');
		})
		this.on('tube_out', function(event) {
			if(this.isPlayer()) this.spot.dispatchEvent('surfer_tube_out');
		})
		this.on('bonus_hitted', function(event) {
			if(this.isPlayer()) {
				let ev = new createjs.Event('bonus_hitted')
				ev.object = event.object;
				this.spot.dispatchEvent(ev);
			}
		})
		this.on('malus_hitted', function(event) {
			if(this.isPlayer()) {
				let ev = new createjs.Event('malus_hitted')
				ev.object = event.object;
				this.spot.dispatchEvent(ev);
			}
		})
	}


	prototype.takeOff = function(x,y) {

		this.x = x;
		this.y = y;
		this.location = new Victor(x,y);
		this.locations.push(this.location);

		this.auto_silhouette = false;
		this.silhouette.gotoAndPlay('takeoff');

		// set velocities to zero
		this.control_velocities.x = 0;
		this.control_velocities.y = 0;
		// calc time from skill
		const default_time = 1500;
		const time = default_time * (1 - this.getSkill('takeoff')/2);
		// tween it slowly to normal config
		createjs.Tween.get(this.control_velocities)
			.to({ y: 1 }, time / 2)
			.call(proxy(function(){
				if(this.falling === true) return;
				this.auto_silhouette = true;
			},this))
			.to({ x: 1 }, time / 2)
			.set({ y: 1 })
			.call(proxy(function() {
				if(this.falling === true) return;
				this.endTakeOff();
			}, this));

		// align trail with the board contact with the water
		this.trail_water_shape.y = 0;
		createjs.Tween.get(this.trail_water_shape).to({y : 50 * this.config.actualScale}, 2000, createjs.Ease.quartIn);

		// dispatch takeoff event
		const event = new createjs.Event("takeoff");
			event.wave = this.wave;
			event.surfer = this;
			this.dispatchEvent(event);

		return this;
	}

	prototype.endTakeOff = function() {

		this.auto_silhouette = true;
		this.riding = true;

		const point = this.point_under;
		const quality = (point === null)? 0 : point.breaking_percent;

		const ev = new createjs.Event("takeoff_ended");
		ev.wave = this.wave;
		ev.surfer = this;
		ev.quality = quality;
		this.dispatchEvent(ev);

	}

	prototype.getSkill = function(comp) {

		if(this.skills[comp] === undefined) {
			console.error(comp + " is not a skill competence...");
			return 1;
		}
		return this.skills[comp];
	}

	prototype.setWave = function(wave) {

		this.wave = wave;
		return this;
	}

	prototype.setConfig = function(config) {
		this.config = config;
		return this;
	}

	prototype.updateConfig = function(config) {
		this.config = config;
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

	prototype.addTimer = function(timer) {
		this.timers.push(timer);
	}

	prototype.removeTimer = function(timer) {
		this.timers.splice(this.timers.indexOf(timer), 1);
	}

	prototype.getSurferProportion = function() {

		var c = (this.real_height / this.wave.params.real_height);
		return c;
	}

	prototype.resize = function() {

		let scale = this.wave.scaleToFit(this.config.pixel_height, this.config.meter_height);
		scale *= this.wave.getResizeCoef();

		this.height = this.config.pixel_height * scale;
		this.config.actualScale = scale;

		this.silhouette_cont.scaleX = scale;
		this.silhouette_cont.scaleY = scale;
		this.silhouette_cont.regX = this.silhouette_width/2;
		this.silhouette_cont.regY = this.silhouette_height/2;

		this.hitbox.scale = this.hitbox_radius = scale * this.hitbox_proportion;
		this.hitboard.scale = this.hitboard_radius = scale * this.hitboard_proportion;
		this.hitboard.y = this.silhouette_height/4 * scale;

	}

	prototype.getVanishPoint = function() {

		return this.wave.getVanishPoint();
	}

	prototype.getVanishVector = function() {

		return new Victor(this.wave.getVanishPoint().x, this.wave.getVanishPoint().y);
	}

	prototype.isPlayer = function() {
		if(this.config.type=='player') return true;
		return false;
	}

	prototype.isBot = function() {
		if(this.config.type=='bot') return true;
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
			const x2 = this.wave.shoulder_left.x - this.wave.params.shoulder.marge - this.wave.params.shoulder.width;
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
			const x2 = this.wave.shoulder_right.x + this.wave.params.shoulder.marge + this.wave.params.shoulder.width;
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
		this.paused = true;
		this.particles_cont.children.map(p => p.pause());
		this.timers.map(t => t.pause());
	}

	prototype.resume = function() {

		this.paused = false;
		this.particles_cont.children.map(p => p.resume());
		this.timers.map(t => t.resume());
	}

	prototype.move = function() {

		this.getAngle();

		if(this.isFallen()) {
			//do nothing
		}
		else if(this.isFalling()) {

			this.slowUntilStop();
		}
		else if(this.isOllieing()) {

			this.moveOnOllie();
		}
		else if(this.isOnAir()) {

			this.initAerial();
			this.moveOnAir();
		}
		else {
			this.initRide();
			this.moveOnWave();
		}

		/*
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
		*/

		//set this position
		if(this.time_scale === 1) {
			this.x = this.location.x;
			this.y = this.location.y;
		} else {
			createjs.Tween.get(this).to({x: this.location.x, y: this.location.y}, 30);
		}

		//set silhouette
		this.setSurferSilhouette();

	}

	prototype.initRide = function() {

		//end of an Aerial
		if(this.status === 'aerial') {
			this.endAerial();
		}
		//set status
		this.status = 'ride';
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

	prototype.detectAboveLipPoint = function() {

		//if there is no lip point at the moment
		if(this.wave.allpoints == null || this.wave.allpoints.length == 0) return null;

		//find point where surfer is bellow
		for(let i=0,len=this.wave.allpoints.length; i<len; ++i) {
			let point = this.wave.allpoints[i];
			//console.log(get2dDistance(this.x,0,point.x,0), point.breaking_width*2);
			if( get2dDistance(this.x,0,point.x,0) <= point.breaking_width*2) {
				return this.point_under = point;
			}
		}

		// if there is no point return the most LEFT or RIGHT
		let peak = null, pindex = null;
		if( this.wave.isLEFT()) {
			peak = this.wave.findTheLeftPeak();
			return peak.points[0];
		}
		else {
			peak = this.wave.findTheRightPeak();
			return peak.points[peak.points.length-1];
		}
	}


	prototype.moveOnWave = function() {

		//return this.moveFromLerp();
		return this.moveFromVelocities();
		// return this.moveFromLerp();
		// return this.moveOnWaveOLD();
	}
	/*
		Move surfer from mouse position, breakpoint point and various influencing parameters
		( this is overcomplicated, should be simplified or rewrited)
	 */
	prototype.moveFromVelocities = function() {

		// get which lip point surfer is under
		const point_under = this.point_under;

		let breaking_width = 5;
		let breaking_percent = 0;
		let distance_idx = 0;
		if(point_under) {
			breaking_width = point_under.breaking_width;
			breaking_percent = point_under.breaking_percent;
			distance_idx = 1 - (get2dDistance(this.x, 0, point_under.x, 0) / 500);
		}

		// get horizontal velocity from lip position
		let vX = breaking_width * ( 0.5 + breaking_percent/100 ) * distance_idx;

		// add a bit of speed
		vX *= 2;

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
		const distanceMax = this.distanceMaxToMouse;
		const distanceMin = this.distanceMinToMouse;
		const distanceMoy = this.distanceMoyToMouse;
		if(distance >= distanceMax) distance = distanceMax;
		const distanceIdx = (distance / distanceMoy) * (distance / distanceMin);

		// scale with mouse distance
		velocity.scale(distanceIdx);

		// scale with user skill ( from x1 to x2)
		const skill_idx = 1 + (this.getSkill('speed'));
		velocity.scale(skill_idx);

		// surfer have more speed where on top of the segment ( from x1 to x2 )
		//const y_coef = 1 + 1 - ( this.y / this.wave.config.height );
		//velocity.scale(y_coef);

		// surfer get more speed when angled to the bottom ( from x1 to x1.5)
		//let angle_coef = (this.angle_rad > 0)? 1 + (this.angle_rad / Math.PI/2)/2 : 1;
		//velocity.scale(angle_coef);

		// scale with wave config surfer's velocity coef (from x0 to ...)
		//velocity.scaleX(this.config.velocities.x);
		//velocity.scaleY(this.config.velocities.y);

		// scale with controls coef (from x0 to x1)
		velocity.scaleX(this.control_velocities.x);
		velocity.scaleY(this.control_velocities.y);

		// add pump-pump to velocity
		//velocity = this.addPumpedInertia(velocity);

		// set global velocity
		this.velocity = velocity.clone();

//console.log(velocity.x, point_under);
		// apply velocity to position
		this.location.add(velocity);

		//sightly up and down random movement
		//this.addMoveZigZag();

		//surfer can't go bellow the wave
		if( this.location.y > this.wave.params.height - this.height/4) {
			this.location.y = this.wave.params.height - this.height/4;
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
		this.pathpoints.unshift(point);
		this.pathpoints = this.pathpoints.slice(0,100);

		// add point to spatters array
		if(point.location.y > 0) {
			this.trailpoints.unshift(point);
			this.trailpoints = this.trailpoints.slice(0,100);
		} else {
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

		// fall if done too soon
		if(this.point_under.breaking_percent === null || this.point_under.breaking_percent < 0) {
			return this.fall('aerial too late');
		}
		if(this.point_under.breaking_percent > this.aerial_takeoff_limit) {
			return this.fall('aerial too soon');
		}
		this.aerial_quality_takeoff = this.point_under.breaking_percent / this.aerial_takeoff_limit;

		// set current status
		this.status = 'aerial';
		// enable trails
		//this.rainbow = true;
		// hide trail
		this.saveTrailSize();
		this.trailsize = 0;
		// particles
		this.initAerialParticles();
		// persistance
		//this.initImagePersistance(30);
		// ???
		this.velocity.magnitude(1);
		// slow things down
		//window.switchSlowMo(0.8,1000);
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
		this.tweens = [];
	}

	prototype.selfRemove = function() {
		this.removeAllChildren();
		this.selfRemoveListeners();
		this.weapons.hadoken.selfRemove();
		this.weapons.shield.selfRemove();
	}

	prototype.selfRemoveListeners = function() {
		this.removeAllTweens();
		this.off('tick', this.ticker);
	}

	prototype.initTricks = function() {

		var ev = new createjs.Event("aerial_start");

		var impulse = this.velocity.magnitude();

		if(impulse > 70) {

			ev.trick = {
				name : 'Double Backflip',
				score : 2000,
			};

			this.initDoubleBackflip();
		}
		else if(impulse > 50) {

			ev.trick = {
				name : 'Backflip',
				score: 1000,
			}

			this.initBackflip();
		}
		else {

			ev.trick = {
				name : 'Aerial',
				score: 500,
			}
		}

		this.dispatchEvent(ev);

		this.lastTrick = ev.trick;
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

	prototype.initImagePersistance = function(frequency) {

			if(this.imagePersistanceTimer === null) {
				this.imagePersistanceTimer = new Interval(proxy(this.drawPersistedImage,this), frequency);
				this.addTimer(this.imagePersistanceTimer);
			} else {
				this.stopImagePersistance();
			}
	}

	prototype.stopImagePersistance = function() {
		if(this.imagePersistanceTimer) {
			this.imagePersistanceTimer.clear();
			this.imagePersistanceTimer = null;
			this.silhouette_cont.uncache();
			this.removeTimer(this.imagePersistanceTimer);
		}
	}

	prototype.drawPersistedImage = function() {

		let w = 300*rX;
		let h = 300*rY;
		this.silhouette_cont.filters = [ new createjs.ColorFilter(Math.random()*0.8+0.2,Math.random()*0.8+0.2,Math.random()*0.8+0.2,1,0,0,0,0) ];
		this.silhouette_cont.cache(-w,-h,w*2,h*2);
		w = this.silhouette_cont.cacheCanvas.width;
		h = this.silhouette_cont.cacheCanvas.height;
		let image = new createjs.Bitmap(this.silhouette_cont.cacheCanvas);
		image.filters = [ new createjs.ColorFilter(0,0,0,1, Math.random()*255,Math.random()*255,Math.random()*255,0) ];
		image.cache(0, 0, w, h);
		image.scaleX = this.silhouette_cont.scaleX;
		image.scaleY = this.silhouette_cont.scaleY;
		image.regX = w/2;
		image.regY = h/2;
		image.x = this.x - 120;
		image.y = this.y - 110;
		image.alpha = 1;

		let index = this.wave.surfers_cont.getChildIndex(this);
		this.wave.surfers_cont.addChildAt(image, index);

		let lifespan = 800;
		createjs.Tween.get(image).to({ alpha: 0}, lifespan).call(proxy(this.removePersistedImage,this,[image]));
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
		}

		var event = new createjs.Event("aerial_end");
		let trick = this.lastTrick;
		trick.landing_angle = this.angle;
		trick.quality_takeoff = this.aerial_quality_takeoff;
		event.trick = trick;
		this.dispatchEvent(event);

		//remove aerial particles
		this.stopAerialParticles();

		//init landing particles
		this.endAerialParticles();

		//this.stopImagePersistance();

		// remove spatter
		this.clearSpatter();

		// remove trails
		if(this.rainbow) this.rainbow = false;

		// remove slow motion
		window.switchSlowMo(1,1000);

		// landiing slowly
		/*const default_time = 2000;
		const time = default_time * (1 - this.getSkill('aerial'));
		// tween it slowly to normal config
		const tween = createjs.Tween.get(this.control_velocities)
			.to({ x: 0.1, y: 0.1 }, time / 2)
			.to({ x: 1, y: 1 }, time / 2)
			;
		*/

		//handle trail size
		this.resetTrailSize();
		this.trailpoints[0].size = this.trailsize*6;
		this.trailpoints.splice(1, 200);
		Variation.prototype.applyOnce(this,'trailsize',{
					min: this.trailsize*6,
					max: this.trailsize,
					time: 2000,
					loops: 1,
					slope: 'up',
					callback: proxy(this.resetTrailSize,this),
				});


		//for player only
		if(this.isPlayer() === true) {

			if(this.aerial_quality_takeoff > 50) {
				//play sound
				let sound = createjs.Sound.play("bravo");  // play using id.  Could also use full sourcepath or event.src.
				sound.volume = 0.1;

			}
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

	prototype.isFallen = function() {
		if(this.fallen === true) return true;
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

		this.auto_silhouette = false;
		this.silhouette.gotoAndPlay('fall');
		setTimeout(() => {
				this.splash.gotoAndPlay('splash');
				this.splash.on('animationend', (ev) => {
					this.fallFinished();
				})
		},500);

		if(this.isPlayer()) {
	    createjs.Sound.play("gasp");
			setTimeout(function() {
	    	createjs.Sound.play("plouf");
			},600);
		}
	}

	prototype.fallFinished = function() {

		this.fallen = true;

		var e = new createjs.Event('fallen');
		e.surfer = this;
		this.dispatchEvent(e);

		if(this.isPlayer()) {
			window.Stage.removeAllEventListeners('stagemousedown');
			window.Stage.removeAllEventListeners('stagemouseup');
		}
	}

	prototype.slowUntilStop = function()
	{
			this.velocity.scale(0.8);
			this.location.add(this.velocity);
			if(this.y < 0) {
				this.location.add(this.gravity.clone());
			}
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
		var points = this.wave.allpoints;

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

		const points = this.wave.allpoints;
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

		this.tubeTime += createjs.Ticker.interval;
		if(this.tubing === false) {

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

		//get the deepest of the tube
		this.tubeDeep = this.tubeDepths.reduce((max,deep) => {
			return (deep > max) ?  deep : max;
		},0);


		//dispath event
		let event = new createjs.Event('tube_out');
		event.tubeTime = this.tubeTime;
		event.tubeDeep = this.tubeDeep;
		this.dispatchEvent(event);

		//empty the tube
		this.tubeDepths = [];
		this.tubing = false;
		this.tubeTime = 0;
	}

	prototype.checkTrajectory = function() {

		/*
		if(this.angles[5] === undefined) return;

		var delta = Math.abs(this.angle - this.angles[5])%360;
		var diff = (delta > 180)? 360 - delta : delta;
		var allowed = 120 + 60*this.getSkill('agility');

		if(diff > allowed) {
			//init fall
			this.fall('bad trajectory');
		}
		*/
	}

	prototype.hit = function(zone, x, y, radius) {

		if(zone === 'board') return this.hitBoard(x,y,radius);
		if(zone === 'body') return this.hitBody(x,y,radius);
		if(zone === 'weapon') return this.hitWeapon(x,y,radius);
		if(zone === 'none') return null;
		return console.error("La zone de hit n'existe pas");
	}

	prototype.hitBody = function(x,y,radius) {

		const minDistance = radius + this.hitbox_radius;
		const xDist = x - (this.x + this.hitbox.x);
		const yDist = y - (this.y + this.hitbox.y);
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
		for(let i=0,len=this.weapons.hadoken.fireballs.length; i<len; ++i) {
			let ball = this.weapons.hadoken.fireballs[i];
			if(ball.impacted === true) continue;
			let ballCoord = ball.localToGlobal(0,0);
			let objCoord = this.wave.obstacle_cont.localToGlobal(x,y);
			let minDistance = radius + ball.conf.radius;
			let xDist = objCoord.x - ballCoord.x;
			let yDist = objCoord.y - ballCoord.y;
			let distance = Math.sqrt(xDist*xDist + yDist*yDist);
			if(distance < minDistance) {
				return ball;
			}
		}

		return false;
	}

	prototype.hitMalus = function(obj) {

		if(this.weapons.shield.isActive) return;

		if(obj.config.name == 'paddler') return this.fall('hit paddler');
		if(obj.config.name == 'photo') return this.fall('hit photographe');
		if(obj.config.name == 'bomb') return this.fall('hit bomb');
		if(obj.config.name == 'jeese') return this.fall('hit by jeese');
		if(obj.config.name == 'guldo') return this.fall('hit by guldo');
		if(obj.config.name == 'reacum') return this.fall('hit by reacum');
		if(obj.config.name == 'paddletrooper') return this.fall('hit by paddletrooper');
		if(obj.config.name == 'banshee') return this.fall('hit by banshee');
		if(obj.config.name == 'stingbat') return this.fall('hit by stingbat');
		if(obj.config.name == 'toruk') return this.fall('hit by toruk');
		if(obj.config.name == 'arachnid') return this.fall('hit by arachnid');
		if(obj.config.name == 'seafish') return this.fall('hit by seafish');
		if(obj.config.name == 'stormsurfer') return ;//this.fall('hit by stormsurfer');
		console.log('Malus hitted with no handling : ', obj);
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
			let lifeAtZero = this.lifebar.scaleX - dmg <= 0;
			if(lifeAtZero) {

				this.fall('collision');

				const ev = new createjs.Event('kill');
					ev.player = this.spot.surfer;
					ev.killer = surfer;
					ev.killed = this;
					ev.target = 'surfer';
					ev.weapon = 'body';
					this.spot.dispatchEvent(ev);
			}
		}

	}

	prototype.shotSurfer = function(surfer) {

		this.addCollision(surfer);

		//let force = this.getSkill('force');
		let force = 1; //force of (1) make instant kill !
		let dmg = force;

		surfer.updateLifebar(dmg);

		let surferAtZero = surfer.lifebar.scaleX - dmg <= 0;
		if(surferAtZero) {

			surfer.fall('shoted');

			const ev = new createjs.Event('kill');
			ev.player = this.spot.surfer;
			ev.killer = this;
			ev.killed = surfer;
			ev.target = 'surfer';
			ev.weapon = 'saber';
			this.spot.dispatchEvent(ev);
		}

	}

	prototype.updateLifebar = function(q) {

		let scaleX = this.lifebar.scaleX - q;
		if(scaleX < 0) scaleX = 0;

		this.lifebar.alpha = 1;
		createjs.Tween.get(this.lifebar,{override: true}).to({scaleX: scaleX}, 500).wait(600).to({alpha:0},300);

	}

	prototype.hasCollision = function(obj) {

		return this.collisions.indexOf(obj) >= 0;
	}

	prototype.addCollision = function(obj) {

		this.collisions.push(obj);
		setTimeout(proxy(this.removeCollision,this,[obj]), 250);
	}

	prototype.removeCollision = function(obj) {

		this.collisions.splice(this.collisions.indexOf(obj),1);
	}

	prototype.checkHitObstacles = function() {

		//no hit when surfer is ollying [no actual use for now]
		if(this.isOllieing() === true) return;


		//test all obstacles
		for(var i=0,l=this.wave.obstacles.length;i<l;++i) {
			var obstacle = this.wave.obstacles[i];

			if(obstacle.hitBonus(this)) {
				//launch event
				var ev = new createjs.Event('bonus_hitted'); // we need to recreate event as we re-dispatch it
				ev.object = obstacle;
				this.dispatchEvent(ev);
			}

			if(obstacle.hitMalus(this)) {
				//launch event
				var ev = new createjs.Event('malus_hitted'); // we need to recreate event as we re-dispatch it
				ev.object = obstacle;
				this.dispatchEvent(ev);
			}
		}
	}

	prototype.checkWeaponHits = function() {

		// destroy obstacles
		for(let i=0,len = this.wave.obstacles.length; i<len; i++) {
			const obstacle = this.wave.obstacles[i];

			if(obstacle.active && obstacle.shotable !== null) {
				const zones = (Array.isArray(obstacle.shotable))? obstacle.shotable : [obstacle.shotable];
				for(let j=0,ln=zones.length; j<ln; ++j) {
					const zone = zones[j]
					const hitted = this.hit('weapon', obstacle.x, obstacle.y, zone.graphics.command.radius);
					if(hitted) {
						obstacle.shooted(hitted)
					}
				}
			}
		}
	}

	prototype.startBoost = function() {
		if(this.boosting === true) return;
		this.boosting = true;
		this.control_velocities.scale(2);
		this.trails_path_cont.alpha = 0;
		createjs.Tween.get(this.trails_path_cont).to({alpha: 1}, 200);
	}

	prototype.endBoost = function() {
		if(this.boosting === false) return;
		this.control_velocities.scale(0.5);
		createjs.Tween.get(this.trails_path_cont).to({alpha: 0}, 200)
			.call(proxy(function() { this.boosting = false }, this))
	}

	prototype.shieldToggle = function() {
		this.weapons.shield.toggle();
	}

	prototype.hadokenFire = function() {
		this.weapons.hadoken.fire(this.wave.direction);
	}

	prototype.drawTrails = function() {

		this.drawWaterTrail();
		this.drawAerialTrail();

		if(this.boosting === true) {
			this.trails_path_cont.removeAllChildren();
			this.drawPathTrail(["rgba(255,255,255,0.8)","rgba(255,255,255,0)"], 100 * this.config.actualScale, 0, 200, "butt");
		}

		if(this.rainbow === true) {
			this.trails_path_cont.removeAllChildren();
			this.drawPathTrail(["rgba(255,0,0,0.8)","rgba(255,0,0,0)"], 15, -50 * this.config.actualScale, 400);
			this.drawPathTrail(["rgba(255,127,0,0.8)","rgba(255,127,0,0)"], 15, -35 * this.config.actualScale, 400);
			this.drawPathTrail(["rgba(255,255,0,0.8)","rgba(255,255,0,0)"], 15, -20 * this.config.actualScale, 400);
			this.drawPathTrail(["rgba(0,255,0,0.8)","rgba(0,255,0,0)"], 15, -5 * this.config.actualScale, 400);
			this.drawPathTrail(["rgba(0,0,255,0.8)","rgba(0,0,255,0)"], 15, 10 * this.config.actualScale, 400);
			this.drawPathTrail(["rgba(75,0,130,0.8)","rgba(75,0,130,0)"], 15, 25 * this.config.actualScale, 400);
			this.drawPathTrail(["rgba(148,0,211,0.8)","rgba(148,0,211,0)"], 15, 40 * this.config.actualScale, 400);
		}
	}

	prototype.drawWaterTrail = function() {

		const nb = this.trailpoints.length - 1;
		const points = [];
		//const xs = [];


		//if(this.isBot()) continue;
		const suction = this.wave.suction.clone();

		//update points with the suction vector
		for (let i = 0; i <= nb; ++i) {
			//apply vector suction
			let trail = this.trailpoints[i];
			//create xy Point
			let x = trail.location.x + 5;
			let y = trail.location.y;
			let point = new Victor(x,y);
			point.add(suction);
			point.size = trail.size;
			point.angle = trail.angle_rad;
			if(point.angle === 0) point.angle = Math.PI/2; //dont touch
			points.push(point);
			//save all x values
			//xs.push(point.x);
		}

		//get minimum x and maximum x a the trail
		//const xmin = Math.min.apply(null,xs) - 100;
		//const xmax = Math.max.apply(null,xs) + 100;

		//draw top shape of the trail
		this.trail_water_shape.graphics.clear();
		this.trail_water_shape.graphics.beginRadialGradientFill(["rgba(255,255,255,1)","rgba(0,0,0,0.2)"], [0,1], this.x, this.y, 0, this.x, this.y, 180 );
		for(let i=0; i<nb; ++i) {
			let point = points[i];
			var size = i*points[i].size + this.trailcoef*points[i].size;
			let x = point.x + size * Math.cos(point.angle + Math.PI/2);
			let y = point.y + size * Math.sin(point.angle + Math.PI/2);
			this.trail_water_shape.graphics.lineTo(x,y);
		}

		// draw end round section
		let last = points[points.length-1];
		let x = last.x;
		let y = last.y;
		this.trail_water_shape.graphics.bezierCurveTo(x-size,y-size,x+size,y-size,x+size,y);

		////draw bottom shape of the trail
		for(let i=nb; i>0; --i) {
			let point = points[i];
			let size = i*points[i].size + this.trailcoef*points[i].size;
			let x = point.x + size * Math.cos(point.angle + Math.PI + Math.PI/2);
			let y = point.y + size * Math.sin(point.angle + Math.PI + Math.PI/2);
			this.trail_water_shape.graphics.lineTo(x,y);
		}

		this.trail_water_shape.graphics.closePath();

		//frame the trail inside the wave rectangle
		this.trail_water_shape.mask = this.wave.shape_mask;
		this.trail_water_shape.alpha = this.alpha;

		// align trail with the board contact with the water
		let dx = 0;
		if(this.wave.direction === LEFT) dx = 25;
		if(this.wave.direction === RIGHT) dx = -25;
		this.trail_water_shape.x = dx;

	}


	prototype.drawPathTrail = function(colors, size, yo =0, length = 200, caps = 'round') {

		const trail = new createjs.Shape();
		const nb = this.pathpoints.length - 1;
		const points = [];

		//update points with the suction vector
		for (let i = 0; i <= nb; ++i) {
			//apply vector suction
			let trail = this.pathpoints[i];
			//create xy Point
			let x = trail.location.x + 5;
			let y = trail.location.y;
			let point = new createjs.Point(x,y);
			points.push(point);
		}

		//draw shape of the trail
		trail.graphics.setStrokeStyle(size,caps).beginRadialGradientStroke(colors, [0,1], this.x, this.y, 0, this.x, this.y, length);

		for(let i=0; i<nb; ++i) {
			let point = points[i];
			let x = point.x ;
			let y = point.y;
			trail.graphics.lineTo(x,y);
		}

		if(this.wave.direction === LEFT) trail.x = 5;
		if(this.wave.direction === RIGHT) trail.x = -20;

		trail.y = yo;

		this.trails_path_cont.addChild(trail);
	}

	prototype.drawAerialTrail = function() {

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

	prototype.drawDebug = function() {

		// hide if no debug
		if(DEBUG === 0) {
			this.hitbox.alpha = 0;
			this.hitboard.alpha = 0;
			this.virtualMouse.alpha = 0;
			this.debug_cont.alpha = 0;
			return;
		}

		//apply opacity
		this.hitbox.alpha = 0.5;
		this.hitboard.alpha = 0.5;
		this.virtualMouse.alpha = 0.5;
		this.debug_cont.alpha = 1;

		// clear all debug
		this.debug_cont.removeAllChildren();

		//add saber debug
		this.debug_cont.addChild(this.saber_start, this.saber_middle, this.saber_end, this.saber_trail);


		//add move debug
		let line = new createjs.Shape();
		let mouse = this.getMousePoint(0);
		let distance = this.location.absDistanceX(mouse);
		let end = new createjs.Point(mouse.x - this.x, mouse.y - this.y);

		let moy = new createjs.Shape();
		moy.graphics.beginFill('lightblue').drawCircle(0,0,5);
		let angle = calculAngle(0,0, end.x, end.y);
		let pt = findPointFromAngle(0,0,angle,this.distanceMoyToMouse);
		moy.x = pt.x;
		moy.y = pt.y;
		this.debug_cont.addChild(moy);

		let max = new createjs.Shape();
		max.graphics.beginFill('lightgreen').drawCircle(0,0,5);
		angle = calculAngle(0,0, end.x, end.y);
		pt = findPointFromAngle(0,0,angle,this.distanceMaxToMouse);
		max.x = pt.x;
		max.y = pt.y;
		this.debug_cont.addChild(max);

		let min = new createjs.Shape();
		min.graphics.beginFill('green').drawCircle(0,0,5);
		angle = calculAngle(0,0, end.x, end.y);
		pt = findPointFromAngle(0,0,angle,this.distanceMinToMouse);
		min.x = pt.x;
		min.y = pt.y;
		this.debug_cont.addChild(min);

		let color = 'green';
		if(distance <= this.distanceMaxToMouse) color = 'green';
		if(distance <= this.distanceMoyToMouse) color = 'orange';
		if(distance <= this.distanceMinToMouse) color = 'red';

		line.graphics.beginStroke(color).setStrokeStyle(1).moveTo(0,0).lineTo(end.x, end.y);
		this.debug_cont.addChild(line);

	}

	prototype.getAngle = function() {

		if(this.locations[1] === undefined) {
			this.angle_rad = Math.PI/2;
			this.angle = 90;
			return;
		}

		if(Math.sqrt(this.velocity.x*this.velocity.x) == 0) return;

		this.angle_rad = Math.atan2(this.locations[0].y - this.locations[1].y,this.locations[0].x - this.locations[1].x);
		this.angle = Math.degrees(this.angle_rad);

		return this.angle;
	}

	prototype.initSilhouette = function() {

		let sprite = new createjs.SpriteSheet({
			images: [queue.getResult(this.config.img)],
			frames: {width: parseInt(256*rX), height: parseInt(256*rY)},
			framerate: 5,
			animations: {
				S: 0,
				SE: 1,
				SEE: 2,
				SEEE: 3,
				SEEEE: 4,
				E: 5,
				EN: 6,
				ENN: 7,
				ENNN: 8,
				ENNNN: 9,
				N: 10,
				NW: 11,
				NWW: 12,
				NWWW: 13,
				NWWWW: 14,
				W: 15,
				WS: 16,
				WSS: 17,
				WSSS: 18,
				WSSSS: 19,
				takeoff: [20,23, false],
				fall: [24,31, false, 2]
			}
		});

		this.silhouette = new createjs.Sprite(sprite,'S');
		this.silhouette_width = 256*rX;
		this.silhouette_height = 256*rY;
		this.silhouette_cont.addChild(this.silhouette);
	}

	prototype.initSplash = function() {

		let sprite = new createjs.SpriteSheet({
			images: [queue.getResult('surfer_splash')],
			frames: {width:parseInt(200*rX), height:parseInt(150*rY), regX: parseInt(100*rX), regY: parseInt(75*rY)},
			framerate: 20,
			animations: {
				hide: 1,
				splash: [1,12,false],
			}
		});
		this.splash = new createjs.Sprite(sprite);
		this.splash.y = 0*rY;
		this.splash.x = 0;
		this.splash.alpha = 0.4;
		this.splash.gotoAndStop(0);
		this.addChild(this.splash);
	}


	prototype.setSurferSilhouette = function() {

		if(this.auto_silhouette === false) return;

		if(this.locations[0] === undefined || this.locations[1] === undefined) return this.silhouette.gotoAndStop('S');

		var rad = Math.atan2(this.locations[1].x-this.locations[0].x,this.locations[1].y-this.locations[0].y);
		var deg = -1*Math.degrees(rad);

		this.bearing = this.getSurferBearing(deg);

		if(this.locations[0].isEqualTo(this.locations[1])) {
			if(this.wave.direction === LEFT) return this.silhouette.gotoAndStop('W');
			if(this.wave.direction === RIGHT) return this.silhouette.gotoAndStop('E');
		}
		return this.silhouette.gotoAndStop(this.bearing);

	}

	prototype.getSurferBearing = function(degree) {

		if(degree>170) return 'S';
		if(degree>160) return 'SE';
		if(degree>140) return 'SEE';
		if(degree>120) return 'SEEE';
		if(degree>100) return 'SEEEE';
		if(degree>75) return 'E';
		if(degree>60) return 'EN';
		if(degree>40) return 'ENN';
		if(degree>20) return 'ENNN';
		if(degree>10) return 'ENNNN';
		if(degree>-10) return 'N';
		if(degree>-20) return 'NW';
		if(degree>-40) return 'NWW';
		if(degree>-60) return 'NWWW';
		if(degree>-75) return 'NWWWW';
		if(degree>-100) return 'W';
		if(degree>-120) return 'WS';
		if(degree>-140) return 'WSS';
		if(degree>-160) return 'WSSS';
		if(degree>-170) return 'WSSSS';
		if(degree<=-170) return 'S';
		if(degree<10) return 'N';

	}

	//assign Surfer to window's scope & promote
	window.Surfer = createjs.promote(Surfer, "Container");
}());