(function() {


// create new class
function Wave(params) {

	this.Container_constructor();

	var params = extend({},params);

	this.init(params.spot, params.config);
}

//extend it
var prototype = createjs.extend(Wave, createjs.Container);

//add EventDispatcher
createjs.EventDispatcher.initialize(prototype);

//public property
prototype.surfer = undefined;


//public methods
prototype.init = function(spot, config) {

	//set spot
	this.spot = spot;
	//set config
	this.config = cloneObject(config);
	this.params = cloneObject(config);
	//set properties
	this.y = config.y;
	this.config.height *= rY;
	this.config.width *= rX;
	this.origin_height = this.config.height;
	this.origin_width = this.config.width;
	this.surfer = null;
	this.surfers = [];
	this.obstacles = [];
	this.peaks = [];
	this.splashs = [];
	this.allpoints = [];
	this.particles = [];
	this.peak_count = 0;
	this.quaking_force = 1.2;
	this.direction = CENTER;
	this.movingX = 0;
	this.comingPercent = 0;
	this.resizePercent = 0;
	this.time_scale = (TIME_SCALE) ? TIME_SCALE : 1;
	this.boundaries = {};
	this.mouseChildren = false;

	//initiale suction force with no x value, later suction will be defined when direction is setted
	this.suction = this.getSuction();

	this.breaked = false;
	this.splashed = false;
	this.played = false;
	this.surfed = false;
	this.status = '';
	this.paused = false;
	this.cleaned = false;
	this.automove = false;
	this.beached = false;

	//timers
	this.breaking_timer = false;
	this.cleaning_timer = false;
	this.obstacle_timer = false;
	this.obstaclefly_timer = false;
	this.breaking_peak_left_timer = false;
	this.breaking_peak_right_timer = false;
	this.breaking_block_left_timer = false;
	this.breaking_block_right_timer = false;

	//on-wave static score container
	this.score_cont = new createjs.Container();
	this.addChild(this.score_cont);
		//score text cont
		this.score_text_cont = new createjs.Container();
		this.score_cont.addChild(this.score_text_cont);

		//create a mask
		this.score_text_cont_mask = new createjs.Shape();
		this.score_text_cont_mask.graphics.beginFill('red').drawRect(0,0,STAGEWIDTH,STAGEHEIGHT);
		this.score_text_cont_mask.x = 0;
		this.score_text_cont_mask.y =  -this.config.height - STAGEHEIGHT;

		//apply mask
		this.score_text_cont.mask = this.score_text_cont_mask;

		//particles cont
		this.score_particles_cont = new createjs.Container();
		this.score_cont.addChild(this.score_particles_cont);

	//wave cont
	this.cont = new createjs.Container();
	this.cont.x = config.x;
	this.addChild(this.cont);

	//spatter cont
	this.spatters_cont = new createjs.Container();
	this.cont.addChild(this.spatters_cont);

	//wave background
	this.background_cont = new createjs.Container();
	this.cont.addChild(this.background_cont);

	// weapon cont
	this.weapon_cont = new createjs.Container();
	this.addChild(this.weapon_cont);

	// wave foreground
	this.foreground_cont = new createjs.Container();
	this.cont.addChild(this.foreground_cont);

		//particule cont
		this.particles_cont = new createjs.Container();
		this.foreground_cont.addChild(this.particles_cont);
		//surfer trails cont
		this.trails_cont = new createjs.Container();
		this.foreground_cont.addChild(this.trails_cont);
		//lipback cont
		this.lipcap_cont = new createjs.Container();
		this.foreground_cont.addChild(this.lipcap_cont);
		//obstacle cont
		this.obstacle_cont = new createjs.Container();
		this.foreground_cont.addChild(this.obstacle_cont);
		//surfer cont
		this.surfers_cont = new createjs.Container();
		this.foreground_cont.addChild(this.surfers_cont);
		//lib cont
		this.lip_cont = new createjs.Container();
		this.foreground_cont.addChild(this.lip_cont);
		//splash cont
		this.foam_cont = new createjs.Container();
		this.foreground_cont.addChild(this.foam_cont);
		//splash particles cont
		this.splash_cont = new createjs.Container();
		this.foreground_cont.addChild(this.splash_cont);
		//debug
		this.debug_cont = new createjs.Container();
		this.foreground_cont.addChild(this.debug_cont);

			//points of the wave
			this.debug_points_cont = new createjs.Container();
			this.debug_cont.addChild(this.debug_points_cont);
			//vanish points container
			this.vanishs_cont = new createjs.Container();
			this.debug_cont.addChild(this.vanishs_cont);
			//shoulder points containr
			this.shoulder_cont = new createjs.Container();
			this.debug_cont.addChild(this.shoulder_cont);



		//Shapes
		this.splash_shape = new createjs.Shape();
		this.splash_shape.mouseEnabled = false;
		this.splash_gfx = this.splash_shape.graphics;
		this.foam_cont.addChild(this.splash_shape);

		this.lip_thickness = new createjs.Shape();
		this.lip_shadow = new createjs.Shape();
		this.lip_cap = new createjs.Shape();
		this.lip_spray = new createjs.Shape();
		this.lip_surface = new createjs.Shape();
		this.lip_ripples = new createjs.Container();
		this.lip_cont.addChild(this.lip_thickness, this.lip_shadow, this.lip_surface, this.lip_ripples, this.lip_spray);
		this.lipcap_cont.addChild(this.lip_cap);

		this.background = new createjs.Container();
		this.background_gradient = new createjs.Shape();
		this.background_ripples = new createjs.Container();
		this.background_shadow = new createjs.Shape();
		this.background.addChild(this.background_gradient,this.background_ripples);
		this.background_cont.addChild(this.background,this.background_shadow);

		this.initRipples();


		//draw shape mask beetween the two shoulder
		this.shape_mask = new createjs.Shape();

		//Ticker
		this.ticker = this.on('tick', this.tick, this);

		this.initWave(STAGEWIDTH/2);

		this.resize();

}

prototype.tick = function(ev) {

	if(this.paused) return;

	if(this.breaked) {

		this.continuousBreaking();
		this.drawLip();
		this.drawSplash();
		this.moveWave();
		this.drawMask();
	}

	this.animateRipples();

	this.drawDebug();

}


prototype.mergeCollidingPeaks = function() {

	//merging peaks
	for(var i=0,len=this.peaks.length; i<len; ++i) {
		if(len === 1) break;
		let first = this.peaks[i];
		let second = this.peaks[i+1];
		if(second === undefined) break;

		if( first.points.length !== 0 && second.points.length !==0 &&
			first.boundaries[RIGHT] >= second.boundaries[LEFT] - this.params.breaking.unroll.width) {

			//remove last point to make a nice visual merge
			first.points.splice(first.points.length-1,1);
			//concat all points
			let merged = first.points.concat(second.points);
			//set the main peak as the older one
			let main = (first.id < second.id)? first : second;
			let dump = (first.id > second.id)? first : second;
			//merge lip points
			main.points = merged;
			//empty useless peak
			dump.points = [];
			//delete merged peak
			this.peaks.splice(this.peaks.indexOf(dump),1);
		}

	}

	//merge splash
	for(var i=0,len=this.splashs.length; i<len; ++i) {

		if(len === 1) break;
		let first = this.splashs[i];
		let second = this.splashs[i+1];
		if(second === undefined) break;

		if( first.points.length !==0 && second.points.length !==0 &&
			first.boundaries[RIGHT] >= second.boundaries[LEFT] - this.params.breaking.unroll.width) {

			first.points.splice(first.points.length-1,1);
			var merged = first.points.concat(second.points);
			//sort all the points from left to right (because order is not garantied)
			merged.sort((a,b) => a.x < b.x ? -1 : 1);
			var main = (first.id < second.id)? first : second;
			merged.map((p) => p.peak = main);
			var dump = (first.id > second.id)? first : second;
			main.points = merged;
			dump.points = [];
			//delete merged splash
			this.splashs.splice(this.splashs.indexOf(dump),1);
		}

	}



}

prototype.continuousBreaking = function() {

	// cancel if wave is paused or not breaked yet
	if(this.paused === true || this.breaked === false) return;

	// add breaking points for each peaks
	for(let i=0,len=this.peaks.length; i<len; ++i) {

		const peak = this.peaks[i];

		//do NOT add points if there is no point to start
		if(peak.points.length === 0) continue;

		// add left point
		let lx = peak.points[0].x - this.params.breaking.unroll.width;
		const left = this.createLipPoint({x:lx, direction: LEFT, peak: peak});
		peak.points.unshift(left);
		// add right point
		let rx = peak.points[peak.points.length-1].x + this.params.breaking.unroll.width;
		const right = this.createLipPoint({x:rx, direction: RIGHT, peak: peak});
		peak.points.push(right);

		//[rewrite plz] update shoulder
		this.updateLeftShoulder(lx);
		this.updateRightShoulder(rx);

		//update peak boundaries
		peak.boundaries[LEFT] = lx;
		peak.boundaries[RIGHT] = rx;
	}

	// merge colliding peaks
	this.mergeCollidingPeaks();

}

prototype.addPeak = function(center, width) {

	//update count
	this.peak_count++;

	//create peak
	const peak = {
		id : this.peak_count,
		center : center,
		width : width,
		points : [],
		boundaries : { LEFT: center, RIGHT: center },
	}
	//create points of the lip
	const points = this.createPeakPoints(peak);
	//add points to the peak
	peak.points = points;

	//create corresponding splash peak
	const splash = {
		id : this.peak_count,
		center : center,
		points : [],
		boundaries : {}
	}

	//if there is no peak yet, simply add it to the list and return
	if(this.peaks.length === 0) {
		this.peaks.push(peak);
		this.splashs.push(splash);
	}
	else {
		//if peak is on the left side of the wave, prepend it
		if(center <= this.peaks[0].center) {
			this.peaks.unshift(peak);
			this.splashs.unshift(splash);
		}
		else {
			this.peaks.push(peak);
			this.splashs.push(splash);
		}
	}



}

prototype.createPeakPoints = function(peak) {

	const points = [];

	// add center point
	let point = this.createLipPoint({x:peak.center, direction: CENTER, delay: 0, peak: peak});
	points.push(point);

	//add left points
	let width = peak.width /2;
	while( width > 0) {
		point = this.createLipPoint({x: points[0].x - this.params.breaking.unroll.width, direction: LEFT, peak: peak});
		points.unshift(point);
		width = width - this.params.breaking.unroll.width;
	}

	// add right points
	width = peak.width /2;
	while( width > 0) {
		point = this.createLipPoint({x: points[points.length-1].x + this.params.breaking.unroll.width, direction: RIGHT, peak: peak});
		points.push(point);
		width = width - this.params.breaking.unroll.width;
	}

	return points;

}

prototype.createLipPoint = function(params) {

	params = params === undefined ? {} : params;
	const delay = params.delay === undefined ? this.config.lip.cap.lifetime : this.config.lip.cap.lifetime + params.delay;
	const direction = params.direction ? params.direction : RIGHT;
	const x = params.x === undefined ? 0 : params.x;
	const width = (this.direction === LEFT)? this.params.breaking.unroll.width : this.params.breaking.unroll.width;
	const peak = params.peak === undefined ? null : params.peak;
	const breaking_y = (this.params.breaking.splash_h_percent < 100)? this.params.height * this.params.breaking.splash_h_percent/100 : this.params.height;
	const bounce_y = (this.isPlayed())? breaking_y + Math.random() * breaking_y / 3 : breaking_y + Math.random() * breaking_y / 4;
	const ease_y = (this.config.breaking.y_ease) ? this.config.breaking.y_ease : 'quartIn';

	// lip point
	const point = {
		//initial property of the lip's point
		x : x,
		y : 0,
		peak : peak,
		direction : direction,
		breaking : false,
		breaking_width : parseInt(width),
		breaking_percent : 0,
		topfallscale : 0,
		topfallscaleMax : (this.params.top_fall_scale * this.params.height),
		splashed : false,
		splash_y : false,
		bounce_y : breaking_y,
		bottomfallscale : 0,
		bottomfallscaleMax : (this.params.bottom_fall_scale * this.params.height),
		tubescale : this.params.height / 4,
		tubescaleMax : this.params.height / 2,
		tubedeep : 0,
		tubedeepMax : 1,
		cap : null,
		tweens: []
	};

	// stock points in a array
	this.allpoints.push(point);

	// cap point
	const cap = new createjs.Point();
	point.cap = cap;

	// spray point
	const spray = new createjs.Point();
	point.spray = spray;

	// main point movement
	const t1 = createjs.Tween.get(point, { timeScale: this.time_scale })
		//delay
		.wait(delay)
		//break
		.set({breaking: true})
		//fall
		.to({y: breaking_y, breaking_percent: 100, topfallscale: point.topfallscaleMax},this.params.breaking.y_speed + Math.random()*50,createjs.Ease[ease_y])
		//splash
		.set({breaking: false, splashed: true})
		.call(proxy(this.splashPointReached,this,[point]))
		//bounce
		.to({bounce_y: breaking_y - bounce_y, bottomfallscale: point.bottomfallscaleMax, tubescale: point.tubescaleMax, tubedeep: point.tubedeepMax},1000)
		.call(proxy(this.updateVanishPoints,this,[point]))
		//fade
		.to({bounce_y: breaking_y - bounce_y/2},2500,createjs.Ease.bounceOut)
	;

	// cap point movement
	const t2 = createjs.Tween.get(cap, { timeScale: this.time_scale })
		.to({y: - this.config.lip.cap.height + Math.random()*5}, this.config.lip.cap.lifetime + this.config.lip.cap.width/2, createjs.Ease.sineIn)
		.to({y:0},this.config.lip.cap.width/2,createjs.Ease.quartInOut)
		;

	// spray point movement
	const t3 = createjs.Tween.get(spray, { timeScale: this.time_scale})
		.to({y: - this.params.height * 1/4 + Math.random()*10}, 1000, createjs.Ease.quadOut)
		.to({y: - this.params.height * 1/5 + Math.random()*10}, 3000)
		;

	point.tweens.push(t1);
	point.tweens.push(t2);
	point.tweens.push(t3);

	return point;
}



prototype.addPointToSplash = function(point,splash) {

	const points = splash.points;

	// no splashed point yet, just append it
	if(points.length === 0) {
		return points.push(point);
	}

	//if point is going left, prepent it
	if(point.direction === LEFT) {
		//hack to maintain order in splashed points ( ...as n could be splashed before n-1)
		for(let i=0,len=points.length; i<len; ++i) {
			if(point.x < points[i].x) return points.splice(i,0,point); //early return
		}
	}
	//if point is going left, append it
	if(point.direction === RIGHT) {
		//hack to maintain order in splashed points ( ...as n could be splashed before n-1)
		for(let i=points.length-1; i>=0; i--) {
			if(point.x > points[i].x) return points.splice(i+1,0,point);
		}
	}
}


prototype.splashPointReached = function(point) {


	//it is possible that point is reached but wave has been deleted. Just return in that case
	if(!this.splashs) return;

	//save splash height
	point.splash_y = point.y;

	//get corresponding splash
	const splash = this.splashs.find((splash) => splash.id === point.peak.id);

	//it is possible that ONE point have no more corresponding splash after merging (dont know exactly why). Just return in that case
	if(!splash) return;

	//add point as splashed to peak
	this.addPointToSplash(point,splash);

	//update splash boudaries
	splash.boundaries[point.direction] = point.x;

	//update wave boudaries
	this.boundaries[point.direction] = point.x;

	//if first splash point already reached, dont go further
	if(this.splashed) return;
	this.splashed = true;

	if(this.isPlayed()) {
		// set direction (LEFT or RIGHT) from surfer position relative to the break center
		this.setDirection();
		// init screen quaking pertubation
		this.startQuaking();
		// display control for mobile
		this.spot.controls.set();
		// init obstacles timers
		this.initObstaclesInterval();
	}

}

prototype.getX = function() {
	return this.x + this.cont.x;
}
prototype.getY = function() {
	return this.y;
}
prototype.addScore = function(score) {
	this.score_cont.addChild(score);
}

prototype.coming = function() {
	//when it pass the beach line
	if(this.beached === false && this.y > this.spot.planet.lines.beach) {
		this.beached = true;
		//dispatch event that wave reach the beach
		if(this.played === false) {
			var e = new createjs.Event("non_played_wave");
			e.wave = this;
			this.spot.dispatchEvent(e);
		}
		return;
	}
	// break the wave when it reach the break line
	if(this.breaked === false && this.y > this.spot.planet.lines.break) {
			this.initBreak(STAGEWIDTH/2);
	}
	// stop resizing wave when peak line is reached
	if(this.y >= this.spot.planet.lines.peak) {
		//if wave is played, send event to freeze the spot
		if(this.played === true) {
			var e = new createjs.Event("played_wave");
			e.wave = this;
			this.spot.dispatchEvent(e);
		}
	}

	// resize it
	this.resize();

}

prototype.getBreakCoef = function() {
	return (this.y  - this.spot.planet.lines.horizon) / ( this.spot.planet.lines.break - this.spot.planet.lines.horizon);
}

prototype.getResizeCoef = function() {
	return (this.y  - this.spot.planet.lines.horizon) / ( this.spot.planet.lines.peak - this.spot.planet.lines.horizon);
}

prototype.scaleToFit = function(pixel_height, meter_height) {
	return ((meter_height * this.config.height) / this.config.real_height) / pixel_height;
}

prototype.resize = function() {
	//calcul the proportion
	const coef = this.getResizeCoef();
	//calcul wave height
	let h = this.config.height * coef;
	if(h > this.config.height) {
		h = this.config.height;
	}
	//set new height
	this.params.height = h;
	this.cont.y = - h;
	//resize width
	//if not breaked
	if(this.breaked === false) {
		//calcul wave width
		let w = this.origin_width * coef
		if(this.origin_width===0) w = STAGEWIDTH;
		//set new shoulders position
		this.shoulder_left.x = STAGEWIDTH/2 - w/2;
		this.shoulder_right.x = STAGEWIDTH/2 + w/2;
		//set new shoulders proportion
		this.params.shoulder.width = this.config.shoulder.width * coef;
		this.params.shoulder.inner = this.config.shoulder.inner * coef;
		this.params.shoulder.outer = this.config.shoulder.outer * coef;
		this.params.shoulder.marge = this.config.shoulder.marge * coef;
	}

	//resize surfer
	for(let i=0,len=this.surfers.length;i<len;++i) {
		this.surfers[i].resize();
	}
	//draw background
	this.drawBackground();
	//progressive alpha background
	this.background.alpha = coef + 0.2;
	this.background_shadow.alpha = 1 - (coef+0.2);
	//resize background
	this.resizeBackground(h);
	//draw shpa
	this.drawMask();

	this.resizePercent = coef * 100;
	this.breakPercent = this.getBreakCoef() * 100;

}

prototype.initWave = function(center) {
	//init the vanish points
	this.initVanishPoints(center);
	//add first breaking points
	this.updateLeftShoulder(STAGEWIDTH/2 - this.config.width/2);
	this.updateRightShoulder(STAGEWIDTH/2 + this.config.width/2);
}

prototype.initBreak = function(center) {
	//set status of the wave
	this.status = 'run';
	this.breaked = true;
	//set wave breaking center
	this.params.breaking_center = center;
	// add the breaking peak
	this.addPeak(center,this.config.breaking.width);
	//init points cleaner
	this.initCleanOffscreenPoints();
	//init intervals
	this.initBreakedIntervals();
	//fix to ajust witdh to the entire screen
	createjs.Tween.get(this.params.shoulder).to({marge: 600}, 1000);
}

prototype.initBreakedIntervals = function() {
		this.initBreakingIntervals();
		this.initVariablePameters();
}

prototype.initBreakingIntervals = function() {
	//Breaking block interval
	if(this.config.breaking.unroll.block_interval !== 0) {
		this.initBreakingBlockLeftInterval();
	}
	if(this.config.breaking.unroll.block_interval !== 0) {
		this.initBreakingBlockRightInterval();
	}
}

prototype.initObstaclesInterval = function() {
	//float obstacles
	if(this.config.obstacles.float.interval !== 0) {
		this.initFloatObstaclesInterval();
	}
	//fly obstacles
	if(this.config.obstacles.fly.interval !== 0) {
		this.initFlyObstaclesInterval();
	}
}

prototype.removeObstaclesInterval = function() {
	if(this.obstacle_timer instanceof Timer) this.obstacle_timer.clear();
	if(this.obstaclefly_timer instanceof Timer) this.obstaclefly_timer.clear();
}

prototype.initVariablePameters = function() {

	if(this.config.breaking.unroll.width_interval !== 0) {
		if(this.params.breaking.unroll.width instanceof Variation) this.params.breaking.unroll.width.destroy();
		this.params.breaking.unroll.width = new Variation({
			min: this.config.breaking.unroll.width,
			max: this.config.breaking.unroll.width_max,
			time: this.config.breaking.unroll.width_interval,
			wait: this.config.breaking.unroll.width_pause,
			slope: 'both',
			loops : true,
			ease: createjs.Tween.cubicInOut,
		})
	}
	if(this.config.breaking.unroll.width_interval !== 0) {
		if(this.params.breaking.unroll.width instanceof Variation) this.params.breaking.unroll.width.destroy();
		this.params.breaking.unroll.width = new Variation({
			min: this.config.breaking.unroll.width,
			max: this.config.breaking.unroll.width_max,
			time: this.config.breaking.unroll.width_interval,
			wait: this.config.breaking.unroll.width_pause,
			slope: 'both',
			loops : true,
			ease: createjs.Tween.cubicInOut,
		})
	}
}

prototype.playerTakeOff = function(surfer) {
	this.surfed = true;
	this.played = true;
	this.surfer = surfer;
	this.player = surfer;

	this.addSurfer(surfer);

	if(this.spot.runing === false) this.initBreak(surfer.x);

}

prototype.startQuaking = function() {
	this.quaking = true;
	this.quake();
}

prototype.stopQuaking = function() {
	this.quaking = false;
}

prototype.quake = function() {

	if(this.quaking===false) return;
	if(this.surfer===null) return;

	var dist = get2dDistance(this.surfer.x,this.surfer.y,this.getVanishPoint().x,this.getVanishPoint().y);
	var amplitude = (STAGEWIDTH*1/3)/dist*this.quaking_force;
	if(amplitude < 1) amplitude = 0;

	this.quake_x = Math.floor(Math.random()*amplitude*2 - amplitude);
	this.quake_y = Math.floor(Math.random()*amplitude*2 - amplitude);

	createjs.Tween.get(window.spot_cont)
		.to({x:this.quake_x,y:this.quake_y},50)
		.call(proxy(this.unquake,this));
}

prototype.unquake = function() {

	createjs.Tween.get(window.spot_cont)
		.to({x:this.quake_x,y:this.quake_y},50)
		.call(proxy(this.quake,this));
}

prototype.resizeBackground = function() {

	this.background_cont.scaleY = this.params.height / this.origin_height;
}


prototype.addTestSurfer = function(x) {

	var surfer = new Surfer({x:x,y:0,wave:this,spot:this.spot});
	surfer.takeOff(x,0);
	this.surfer = surfer;
	this.surfers_cont.addChild(surfer);
	this.surfers.push(surfer);
}

prototype.addSurfer = function(surfer) {

	surfer.takeOff(surfer.x,surfer.y);
	this.surfers_cont.addChild(surfer);
	this.surfers.push(surfer);
}

prototype.addSurferBot = function(bot) {

	bot.takeOff(bot.x,bot.y);
	this.surfers_cont.addChild(bot);
	this.surfers.push(bot);
	this.spot.dispatchEvent('bot_takeoff');
}

prototype.addTestSurferBot = function(surfer) {

	var bot = new SurferBot({
		wave:this,
		spot:this.spot,
		direction: this.direction,
	});

	let x;
	if(this.direction === LEFT) {
		x = this.shoulder_left.x + (Math.random()*600 - 300);
	} else {
		x = this.shoulder_right.x + (Math.random()*600 - 300);
	}

	bot.takeOff( x, this.params.height*1/3 );
	this.surfers_cont.addChild(bot);
	this.surfers.push(bot);

}

prototype.breakAndFollow = function(direction = LEFT) {

	this.initBreak(STAGEWIDTH/2);
	this.direction = direction;
	this.automove = direction;

	return this;
}

prototype.getSurfer = function() {

	return this.surfer;
}

prototype.getSurfers = function() {

	return this.surfers;
}

prototype.pause = function() {

	this.status = 'paused';
	this.paused = true;
	this.surfers.map(s => s.pause());
	this.getTimers().map(t => t.pause());
}

prototype.resume = function() {
	this.status = 'run';
	this.paused = false;
	this.surfers.map(s => s.resume());
	this.getTimers().map(t => t.resume());
}

prototype.remove = function() {

	this.removeAllChildren();
	this.removeAllEventListeners();
}

prototype.getTimers = function() {

	const timers = [];
	if(this.breaking_timer instanceof Timer) timers.push(this.breaking_timer);
	if(this.cleaning_timer instanceof Timer) timers.push(this.cleaning_timer);
	if(this.obstacle_timer instanceof Timer) timers.push(this.obstacle_timer);
	if(this.obstaclefly_timer instanceof Timer) timers.push(this.obstaclefly_timer);
	if(this.breaking_peak_left_timer instanceof Timer) timers.push(this.breaking_peak_left_timer);
	if(this.breaking_peak_right_timer instanceof Timer) timers.push(this.breaking_peak_right_timer);
	if(this.breaking_block_left_timer instanceof Timer) timers.push(this.breaking_block_left_timer);
	if(this.breaking_block_right_timer instanceof Timer) timers.push(this.breaking_block_right_timer);
	if(this.cleaning_timer instanceof Interval) timers.push(this.cleaning_timer);

	return timers;
}

prototype.initBreakingBlockLeftInterval = function() {
	var t = this.config.breaking.unroll.block_interval + Math.random()*(this.config.breaking.unroll.block_interval_max - this.config.breaking.unroll.block_interval);
	var w = this.config.breaking.unroll.block_width + Math.random()*(this.config.breaking.unroll.block_width_max - this.config.breaking.unroll.block_width);
	if(this.breaking_block_left_timer instanceof Timer) this.breaking_block_left_timer.clear();
	this.breaking_block_left_timer = new Timer(proxy(this.continueBreakingBlockLeftInterval,this),t);
}

prototype.continueBreakingBlockLeftInterval = function() {
	if(this.config == null) return;
	var t = this.config.breaking.unroll.block_interval + Math.random()*(this.config.breaking.unroll.block_interval_max - this.config.breaking.unroll.block_interval);
	var w = this.config.breaking.unroll.block_width + Math.random()*(this.config.breaking.unroll.block_width_max - this.config.breaking.unroll.block_width);
	this.initBlockBreakingLeft(w);
	if(this.isRIGHT()) return;
	this.breaking_block_left_timer = new Timer(proxy(this.continueBreakingBlockLeftInterval,this),t);
}

prototype.initBreakingBlockRightInterval = function() {
	var t = this.config.breaking.unroll.block_interval + Math.random()*(this.config.breaking.unroll.block_interval_max - this.config.breaking.unroll.block_interval);
	var w = this.config.breaking.unroll.block_width + Math.random()*(this.config.breaking.unroll.block_width_max - this.config.breaking.unroll.block_width);
	this.breaking_block_right_timer = new Timer(proxy(this.continueBreakingBlockRightInterval,this),t);
}

prototype.continueBreakingBlockRightInterval = function() {
	if(this.config == null) return;
	var t = this.config.breaking.unroll.block_interval + Math.random()*(this.config.breaking.unroll.block_interval_max - this.config.breaking.unroll.block_interval);
	var w = this.config.breaking.unroll.block_width + Math.random()*(this.config.breaking.unroll.block_width_max - this.config.breaking.unroll.block_width);
	this.initBlockBreakingRight(w);
	if(this.isLEFT()) return;
	this.breaking_block_right_timer = new Timer(proxy(this.continueBreakingBlockRightInterval,this),t);
}


prototype.addBlockBreaking = function(width) {

	this.initBlockBreaking(width);
}

prototype.initBlockBreaking = function(width) {

	if(width===undefined) width = 300;

	if(this.direction === CENTER) return;
	if(this.direction === LEFT){
		this.initBlockBreakingLeft(width);
	}
	if(this.direction === RIGHT){
		this.initBlockBreakingRight(width);
	}
}

prototype.initBlockBreakingLeft = function(width) {

	if(this.breaked === false) return;

	var peak = this.findTheLeftPeak();
	while( width > 0 ) {
		var x = peak.points[0].x - this.params.breaking.unroll.width;
		var point = this.createLipPoint({x:x, direction: LEFT, peak: peak});
		peak.points.unshift(point);
		width = width - this.params.breaking.unroll.width;
	}
}

prototype.initBlockBreakingRight = function(width) {
	if(this.breaked === false) return;

	var peak = this.findTheRightPeak();
	while( width > 0) {
		var x = peak.points[peak.points.length-1].x + this.params.breaking.unroll.width;
		var point = this.createLipPoint({x:x, direction: RIGHT, peak: peak});
		peak.points.push(point);
		width = width - this.params.breaking.unroll.width;
	}
}

prototype.findTheLeftPeak = function() {
	for(let i=0,len=this.peaks.length; i<len; ++i) {
		if(this.peaks[i].points.length !== 0) return this.peaks[i];
	}
	console.log('no left peak');
}

prototype.findTheRightPeak = function() {
	for(let i=this.peaks.length-1; i>=0; i--) {
		if(this.peaks[i].points.length !== 0) return this.peaks[i];
	}
		console.log('no right peak');
}

prototype.findTheLeftSplash = function() {
	for(let i=0,len=this.splashs.length; i<len; ++i) {
		if(this.splashs[i].points.length !== 0) return this.splashs[i];
	}
}

prototype.findTheRightSplash = function() {
	for(let i=this.splashs.length-1; i>=0; i--) {
		if(this.splashs[i].points.length !== 0) return this.splashs[i];
	}
}

prototype.initBreakingPeakRightInterval = function() {

	var t = this.config.breaking.unroll.peak_interval + Math.random()*(this.config.breaking.unroll.peak_interval_max - this.config.breaking.unroll.peak_interval);
	var w = this.config.breaking.unroll.peak_width + Math.random()*(this.config.breaking.unroll.peak_width_max - this.config.breaking.unroll.peak_width);

	this.breaking_peak_right_timer = new Timer(proxy(this.continueBreakingPeakRightInterval,this),t);

}

prototype.continueBreakingPeakRightInterval = function() {

	if(this.config == null) return;
	var t = this.config.breaking.unroll.peak_interval + Math.random()*(this.config.breaking.unroll.peak_interval_max - this.config.breaking.unroll.peak_interval);
	var w = this.config.breaking.unroll.peak_width + Math.random()*(this.config.breaking.unroll.peak_width_max - this.config.breaking.unroll.peak_width);

	this.initBreakingPeakRight(w);

	this.breaking_peak_right_timer = new Timer(proxy(this.continueBreakingPeakRightInterval,this),t);
}

prototype.initBreakingPeakLeftInterval = function() {

	var t = this.config.breaking.unroll.peak_interval + Math.random()*(this.config.breaking.unroll.peak_interval_max - this.config.breaking.unroll.peak_interval);
	var w = this.config.breaking.unroll.peak_width + Math.random()*(this.config.breaking.unroll.peak_width_max - this.config.breaking.unroll.peak_width);

	this.breaking_peak_left_timer = new Timer(proxy(this.continueBreakingPeakLeftInterval,this),t);

}

prototype.continueBreakingPeakLeftInterval = function() {

	if(this.config == null) return;
	var t = this.config.breaking.unroll.peak_interval + Math.random()*(this.config.breaking.unroll.peak_interval_max - this.config.breaking.unroll.peak_interval);
	var w = this.config.breaking.unroll.peak_width + Math.random()*(this.config.breaking.unroll.peak_width_max - this.config.breaking.unroll.peak_width);

	this.initBreakingPeakLeft(w);

	this.breaking_peak_left_timer = new Timer(proxy(this.continueBreakingPeakLeftInterval,this),t);
}


prototype.addBreakingPeak = function(width,distance) {

	//this.addBreakingPeakWarning();

	//window.setTimeout(proxy(this.addBreakingPeakToLip,this,[width,distance]),2000);

	this.addBreakingPeakToLip(width,distance);
}

prototype.addBreakingPeakWarning = function() {

	var text = new createjs.Text('Watch out !','bold '.Math.floor(40*rY)+'px BubblegumSansRegular','#FFF'); //BubblegumSansRegular BoogalooRegular albaregular
		text.alpha = 0.8;
		var b = text.getBounds();
		if(this.direction === CENTER) return;
		if(this.direction === LEFT) text.x = 0 + b.width/2;
		if(this.direction === RIGHT) text.x = STAGEWIDTH - b.width;
		text.y = -this.spot.wave.params.height/2;
		var y = - this.spot.wave.params.height - b.height;
		text.regX = b.width/2;
		text.regY = b.height/2;

		this.score_text_cont.addChild(text);

		this.startBlinking(text);

		createjs.Tween.get(text)
		.to({y: y}, 800, createjs.Ease.elasticOut)
		.wait(1000)
		.set({sliding:true,alpha:1})
		.call(proxy(this.stopBlinking,this,[text]));
}


prototype.startBlinking = function(object) {

	createjs.Tween.get(object,{loop:true}).to({alpha:1}).wait(50).to({alpha:0}).wait(50);
}

prototype.stopBlinking = function(object) {

	createjs.Tween.get(object,{override:true}).to({alpha:1});
}

prototype.addBreakingPeakToLip = function(width,distance) {

	if(this.direction === LEFT) {
		var peak = this.findTheLeftPeak();
		var x = peak.points[0].x - distance;
		this.addPeak(x, width);
	}
	if(this.direction === RIGHT) {
		var peak = this.findTheRightPeak();
		var x = peak.points[peak.points.length-1].x + distance;
		this.addPeak(x, width);
	}
}

prototype.setDirection = function() {

	//if no surfers, wave is staying straight
	if(this.surfers.length === 0) return this.direction = CENTER;
	//else set direction
	if(this.surfer) {
		if(this.surfer.x > this.params.breaking_center) {
			this.direction = RIGHT;
		}	else {
			this.direction = LEFT;
		}
	}	else {
		var surfer = this.surfers[0];
		if(surfer.x > this.params.breaking_center) {
			this.direction = RIGHT;
		}
		else {
			this.direction = LEFT;
		}
	}
	// recalcul suction either LEFT or RIGHT
	this.suction = this.getSuction();
}

prototype.getSuction = function() {
	if(this.direction === 0) return new Victor(0, - this.config.suction.y);
	if(this.direction === LEFT) return new Victor(this.params.suction.x*-1,- this.params.suction.y);
	if(this.direction === RIGHT) return new Victor(this.params.suction.x,- this.params.suction.y);
}

prototype.moveWave = function() {

	if(this.breaked === false) return;
	if(this.automove !== false) return this.moveWaveAuto();
	if(this.direction === CENTER) return;
	if(this.surfer === undefined) return;
	if(this.surfer.riding === false) return;

	// get absolute surfer x position on the screen
	let surfer_pos = this.cont.localToGlobal(this.surfer.x,0);

	// horizontal position the which the wave will be translate to a side of the screen
	let delta = (STAGEWIDTH/2) - surfer_pos.x;

	if(this.direction === LEFT) {
		delta += STAGEWIDTH / 2;
		this.movingX = delta/this.params.breaking.unroll.width;
	}
	if(this.direction === RIGHT) {
		delta += -STAGEWIDTH / 2.5;
		this.movingX = delta/this.params.breaking.unroll.width;
	}

	this.movingX *= this.time_scale;

	this.cont.x += this.movingX;
}

prototype.moveWaveAuto = function() {

	let direction = this.automove;

	if(typeof this.boundaries[direction] === 'undefined') return;

	let boundarie = this.boundaries[direction];

	let x = -(boundarie - STAGEWIDTH*2/3);

	createjs.Tween.get(this.cont).to({x: x}, 100);
}

prototype.oldmoveWave = function() {
	if(this.breaked === false) return;
	if(this.direction === CENTER) return;
	if(this.direction === LEFT) {
		//get vanish point x
		var pt = this.cont.localToGlobal(this.vanish_left.x,0);
		//calcul lateral movement from y position
		var coef = ( 100*this.y/ this.spot.planet.lines.peak) / 100;
		var xwidth = this.params.breaking.unroll.width * 1/coef;
		//move wave normally when well positioned
		if(pt.x >= (STAGEWIDTH-100)) this.cont.x += xwidth;
		//else move quicker
		else this.cont.x += xwidth *2;
	}
	if(this.direction === RIGHT) {
		//get vanish point x
		var pt = this.cont.localToGlobal(this.vanish_right.x,0);
		//calcul lateral movement from y position
		var coef = ( 100*this.y/ this.spot.planet.lines.peak) / 100;
		var xwidth = this.params.breaking.unroll.width * 1/coef;
		//move wave normally when well positioned
		if(pt.x <= 100) this.cont.x -= xwidth;
		//else move quicker
		else this.cont.x -= xwidth*2;
	}

}

prototype.removeSurfer = function(surfer) {
	this.surfers.splice(this.surfers.indexOf(surfer),1);
	this.surfers_cont.removeChild(surfer);
	surfer.selfRemove();
}

prototype.selfRemove = function() {
	this.allpoints.map(p => createjs.Tween.removeTweens(p));
	this.getTimers().map(function(t) {
	 t.clear();
	});
	this.off('tick', this.ticker);
	this.surfers.map(s => this.removeSurfer(s));
	this.cont.removeAllChildren();
	this.removeAllChildren();
	this.stopQuaking();
	this.obstacles = [];
	this.allpoints = [];
	this.particles = [];
	this.surfers = [];
	this.splashs = [];
	this.peaks = [];
	this.cont = null;
	this.config = null;
	this.params = null;
	return;

}

prototype.initCleanOffscreenPoints = function() {
	this.cleaning_timer = new Interval(proxy(this.cleanOffscreenPoints,this),1000);
}

prototype.cleanOffscreenPoints = function() {

	if(this.direction === LEFT) {
		let peak = this.findTheRightPeak();
		//LIP
		//find on-screen lip points
		let points = this.getLEFTOnOffScreenPoints(peak.points);
		// set on-screen points to the peak
		peak.points = points.onscreen;
		// delete offscreens points
		this.deleteOffscreenPoints(points.offscreen);
		//SPLASH
		//(same things as above)
		let splash = this.findTheLeftSplash();
		if(splash === undefined) return;
		points = this.getLEFTOnOffScreenPoints(splash.points);
		splash.points = points.onscreen;
		this.deleteOffscreenPoints(points.offscreen);

	}

	if(this.direction === RIGHT) {
		let peak = this.findTheLeftPeak();
		//find on-screen lip points
		let points = this.getRIGHTOnOffScreenPoints(peak.points);
		// set on-screen points to the peak
		peak.points = points.onscreen;
		// delete offscreens points
		this.deleteOffscreenPoints(points.offscreen);
		//SPLASH
		//(same things as above)
		let splash = this.findTheRightSplash();
		if(splash === undefined) return;
		points = this.getRIGHTOnOffScreenPoints(splash.points);
		splash.points = points.onscreen;
		this.deleteOffscreenPoints(points.offscreen);
	}

}

prototype.getLEFTOnOffScreenPoints = function(points) {

	const onscreens = [], offscreens = [], offset = 50;

	for(let i=0, len=points.length; i<len; ++i) {
		let point = points[i];
		// calcul global position of the point
		let x = this.lip_cont.localToGlobal(point.x,point.y).x;
		// if point is onscreen, stock it
		if( x < STAGEWIDTH + offset) {
			onscreens.push(point);
		} else {
			offscreens.push(point);
		}
	}

	return { onscreen : onscreens, offscreen: offscreens }
}

prototype.getRIGHTOnOffScreenPoints = function(points) {

	const onscreens = [], offscreens = [], offset = 50;

	for(let i=0, len=points.length; i<len; ++i) {
		let point = points[i];
		// calcul global position of the point
		let x = this.lip_cont.localToGlobal(point.x,point.y).x;
		// if point is onscreen, stock it
		if( x > - offset) {
			onscreens.push(point);
		} else {
			offscreens.push(point);
		}
	}

	return { onscreen : onscreens, offscreen: offscreens };
}

prototype.deleteOffscreenPoints = function(points) {
	// remove off screen points from the stock array
	let i = points.length;
	while(i>=0) {
		const index = this.allpoints.indexOf(points[i]);
		if(index !== -1) this.allpoints.splice(index,1);
		--i;
	}
}


prototype.initFloatObstaclesInterval = function() {

	var t = this.config.obstacles.float.interval + Math.random()*(this.config.obstacles.float.interval_max - this.config.obstacles.float.interval);
	this.obstacle_timer = new Timer(proxy(this.continueFloatObstaclesInterval,this),t);
	setTimeout(proxy(this.addRandomFloatObstacle, this), 1000);
}
prototype.continueFloatObstaclesInterval = function() {

	var t = this.config.obstacles.float.interval + Math.random()*(this.config.obstacles.float.interval_max - this.config.obstacles.float.interval);
	this.addRandomFloatObstacle();
	this.obstacle_timer = new Timer(proxy(this.continueFloatObstaclesInterval,this),t);
}

prototype.initFlyObstaclesInterval = function() {

	var time = this.config.obstacles.fly.interval + Math.random()*(this.config.obstacles.fly.interval_max - this.config.obstacles.fly.interval);
	this.obstaclefly_timer = new Timer(proxy(this.continueFlyObstaclesInterval,this),time);
	setTimeout(proxy(this.addRandomFlyObstacle, this), 1000);
}
prototype.continueFlyObstaclesInterval = function() {

	var time = this.config.obstacles.fly.interval + Math.random()*(this.config.obstacles.fly.interval_max - this.config.obstacles.fly.interval);
	this.addRandomFlyObstacle();
	this.obstaclefly_timer = new Timer(proxy(this.continueFlyObstaclesInterval,this),time);
}

prototype.addRandomFloatObstacle = function() {
	if(this.breaked === false) return;
	if(this.isPlayed() === false) return;
	var rand = Math.ceil(Math.random()*100);
	var perc = 0;
	for(let name in this.config.obstacles.float.objects) {
		var perc = perc + this.config.obstacles.float.objects[name].percentage;
		if(rand <= perc) {
			if(name === 'stars') this.addRandomStarline();
			/* add others if needed */
			else {
				let id = name.charAt(0).toUpperCase() + name.slice(1);
				if(typeof window[id] !== 'undefined') {
					return this.addObstacle(id);
				} else {
					console.error("Obstacle named '"+id+"' does not exist.");
				}
			}
			return;
		}
	}
}
prototype.addRandomFlyObstacle = function() {
	if(this.breaked === false) return;
	if(this.isPlayed() === false) return;
	var rand = Math.ceil(Math.random()*100);
	var perc = 0;
	for(let name in this.config.obstacles.fly.objects) {
		var perc = perc + this.config.obstacles.fly.objects[name].percentage;
		if(rand <= perc) {
			if(name === 'prize') this.addFlyingPrize();
			else {
				let id = name.charAt(0).toUpperCase() + name.slice(1);
				if(typeof window[id] !== 'undefined') {
					return this.addObstacle(id);
				} else {
					console.error("Obstacle named '"+id+"' does not exist.");
				}
			}
			return;
		}
	}
}


prototype.addObstacle = function(id) {
	if(typeof id === undefined) var obs = new Obstacle({wave: this, spot: this.spot, direction: this.direction});
	else var obs = new window[id]({wave: this, spot: this.spot, direction: this.direction});
	this.obstacles.push(obs);
	this.obstacle_cont.addChild(obs);
}

prototype.addFlyingPrize = function() {
	var obs = new FlyingPrize({wave: this, spot: this.spot, direction: this.direction, value: 1000*Math.ceil(Math.random()*5)});
	this.addObstacle(obs);
}

prototype.addRotatingStar = function() {
	var obs = new RotatingStar({wave: this, spot: this.spot, direction: this.direction});
	this.addObstacle(obs);
	return obs;
}

prototype.addStarline = function(length = 5, spaceX = 80, amplitude = 100, scale = 0.5) {

	let first = this.addRotatingStar();
	let fx = first.x;
	let fy = this.params.height - Math.random()*this.params.height*2;
	first.setXY(fx, fy);
	let othersX = [];
	let othersY = [];
	let theta = 0;
	for(let i=1; i<=length-1; i++) {
		theta += scale;
		let dx = (this.direction === LEFT)? -i * spaceX : i*spaceX;
		let x = first.x + dx;
		let y = first.y + Math.sin(theta) * amplitude;
		othersX.push(x);
		othersY.push(y);
	}

	let dy = 0;
	let maxY = Math.max(...othersY);
	if(maxY > this.params.height ) dy = maxY - this.params.height;

	first.setXY(first.x, first.y - dy);
	for(let i=0; i<=othersX.length-1; i++) {
		let star = this.addRotatingStar();
		star.setXY(othersX[i], othersY[i] - dy);
	}
}

prototype.addRandomStarline = function() {

	let length = Math.ceil(Math.random()*12) + 4;
	let spaceX = 100 + Math.random()*100;
	let amplitude = 50 + Math.random()*(this.params.height/2);
	let scale = Math.random();
	//this.addStarline(length, spreadX, spreadY, scale);
	this.addStarline(length, 80, amplitude, scale);
}

prototype.removeObstacle = function(obs) {
	this.obstacles.splice(this.obstacles.indexOf(obs),1);
	this.obstacle_cont.removeChild(obs);
}

prototype.drawLip = function() {

	//return if not breked yet
	if(this.breaked === false) return;

	//shape.alpha = 0.5;
	this.lip_thickness.graphics.clear().beginFill(hexToRgbA('#FFF',0.5));
	this.lip_shadow.graphics.clear().beginLinearGradientFill(["rgba(0,0,0,0.1)","rgba(0,0,0,0)"], [0, 1], 0, 0, 0, this.params.height);
	this.lip_cap.graphics.clear().beginFill(hexToRgbA('#FFF',0.5));
	this.lip_spray.graphics.clear().beginLinearGradientFill(["rgba(255,255,255,0.15)","rgba(255,255,255,0)"], [0, 1], 0, this.params.height, 0, -this.params.height/2);
	this.lip_surface.graphics.clear().beginLinearGradientFill([this.spot.planet.colors.lip.top,this.spot.planet.colors.lip.bottom],[0,1], 0, this.params.height / 10, 0, this.params.height);


	//init
	var point1x = 0;

	//for each peak
	for(let j=0, ln=this.peaks.length; j<ln; j++) {

		let points = this.peaks[j].points;

		//do NOT draw when there are no lip points
		if(points.length === 0) continue;

		if(j==1) point1x = points[0].x;

		//draw from the first point of the lip
		this.lip_thickness.graphics.moveTo(points[0].x,0);
		this.lip_surface.graphics.moveTo(points[0].x,0);
		this.lip_shadow.graphics.moveTo(points[0].x,0);

		if(points[0].cap) {
			this.lip_cap.graphics.moveTo(points[0].x,0);
			this.lip_spray.graphics.moveTo(points[0].x, 0);
		}

		//LOW PERF
		if(PERF==0) {
			for(let i=1,len=points.length; i<len -2; ++i){
				let pt = points[i],
					x = pt.x,
					y = (pt.splashed)? this.params.height : pt.y,
					thk = this.params.lip.thickness,
					yt = (pt.y - thk < 0)? 0 : pt.y - thk;

				//draw shape line through all points of the lip
				this.lip_thickness.graphics.lineTo(x,y);
				this.lip_surface.graphics.lineTo(x,yt);

				//draw cap
				if(pt.cap) this.lip_cap.graphics.lineTo(pt.x, pt.y + pt.cap.y);

				//draw spray
				if(pt.spray) this.lip_spray.graphics.lineTo(pt.x, pt.spray.y);

			}
		}
		//HIGH PERF
		else {
			for(var i=1,len=points.length; i<len-2; ++i){

				//Draw lip
				let p1 = points[i],
					p2 = points[i+1]
					x1 = p1.x,
					x2 = p2.x,
					y1 = (p1.splashed)? p1.splash_y : p1.y,
					y2 = (p2.splashed)? p2.splash_y : p2.y,
					xc = ( x1 + x2 ) >> 1,
					yc = ( y1 + y2 ) >> 1,
					thk = this.params.lip.thickness,
					y1t = (y1 - thk < 0)? 0 : y1 - thk,
					yct = (yc - thk < 0)? 0 : yc - thk
					//y1t = (y1 >= this.params.height - thk)? this.params.height : y1t,
					//yct = (yc >= this.params.height - thk)? this.params.height : yct

					;

				this.lip_thickness.graphics.quadraticCurveTo(x1,y1,xc,yc);
				this.lip_surface.graphics.quadraticCurveTo(x1,y1t,xc,yct);
				this.lip_shadow.graphics.quadraticCurveTo(x1,y1*10,xc,yc*10);

				//draw cap
				if(p1.cap) this.lip_cap.graphics.lineTo(p1.x,p1.cap.y);

				//draw spray
				if(p1.spray) this.lip_spray.graphics.lineTo(p1.x, p1.spray.y);

			}
		}
		//faire passer par l'avant dernier point
		this.lip_thickness.graphics.quadraticCurveTo(points[i].x,points[i].y,points[i+1].x,points[i+1].y);
		this.lip_surface.graphics.quadraticCurveTo(points[i].x,points[i].y,points[i+1].x,points[i+1].y);
		this.lip_shadow.graphics.quadraticCurveTo(points[i].x,points[i].y,points[i+1].x,points[i+1].y);
		if(points[i].cap) this.lip_cap.graphics.lineTo(points[i].x,points[i].cap.y);

		//le dernier point
		this.lip_thickness.graphics.lineTo(points[len-1].x,0);
		this.lip_surface.graphics.lineTo(points[len-1].x,0);
		this.lip_shadow.graphics.lineTo(points[len-1].x,0);
		if(points[len-1].cap) this.lip_cap.graphics.lineTo(points[len-1].x,0);

	}

	// parse the point backward
	for(let j=this.peaks.length-1, ln=0; j>=ln; j--) {

		let points = this.peaks[j].points;

		//do NOT draw when there are no lip points
		if(points.length === 0) continue;

		//LOW PERF
		if(PERF==0) {
			for(let i=points.lenght-1, len=0; i>=len; --i){
				let pt = points[i];

				//draw spray
				if(pt.spray) this.lip_spray.graphics.lineTo(pt.x, pt.y);

			}
		}
		//HIGH PERF
		else {
			for(let i=points.length-1,len=0; i>=len; --i){

				//Draw lip
				let p1 = points[i];

				//draw spray
				if(p1.spray) this.lip_spray.graphics.lineTo(p1.x, p1.y);

			}
		}

	}

	// apply mask to ripple bitmap
	this.lip_ripples.x = -this.getX() + STAGEWIDTH/2;
	this.lip_ripples.visible = true;


}


prototype.drawSplash = function () {

	if(this.breaked === false) return;

	this.splash_gfx.clear();

	for(let j=0,ln=this.splashs.length; j<ln; j++) {

		points = this.splashs[j].points;

		if(points.length === 0) continue;

		//var color = createjs.Graphics.getHSL(Math.random()*360,100,50);
		this.splash_gfx.beginLinearGradientFill([this.spot.planet.colors.splash.top,this.spot.planet.colors.splash.bottom],[0,1], 0, this.params.height / 10, 0, this.params.height).beginStroke('rgba(0,0,0,0.2').setStrokeStyle(1);
		this.splash_gfx.moveTo(points[0].x, points[0].splash_y);
		//this.splash_gfx.moveTo(points[0].x - this.params.breaking.unroll.width, points[0].splash_y);
		//this.splash_gfx.lineTo(points[0].x,points[0].splash_y);

		if(PERF==0) {
			for(let i=1,len=points.length; i<len - 2; ++i) {
				this.splash_gfx.lineTo(points[i].x,points[i].bounce_y);
			}
			for(let i=points.length-1; i > 1; i--) {
				if(points[i].splash_y < this.params.height - 1) {
					points[i].splash_y += (this.params.height - points[i].splash_y) * 0.1;
				}
				this.splash_gfx.lineTo(points[i].x,points[i].splash_y);
			}
		}
		else {

			//draw the upper splash
			for(let i=1,len=points.length; i<len - 2; ++i) {
				let xc = ( points[i].x + points[i+1].x) >> 1; // divide by 2
				let yc = ( points[i].bounce_y + points[i+1].bounce_y) >> 1; // divide by 2
				this.splash_gfx.quadraticCurveTo(points[i].x,points[i].bounce_y,xc,yc);
			}

			//close by drawing to bottom splash
			for(let i=points.length-1; i > 1; i--) {
				//move down the points that arent yet at the bottom
				if(points[i].splash_y < this.params.height - 1) {
					points[i].splash_y += (this.params.height - points[i].splash_y) * this.params.breaking.splash_h_ease;
				}
				let xc = (points[i].x + points[i-1].x) >> 1;
				let yc = (points[i].splash_y + points[i-1].splash_y) >> 1;
				this.splash_gfx.quadraticCurveTo(points[i].x,points[i].splash_y,xc,yc);
			}
		}

		this.splash_gfx.closePath();

	}


}


prototype.drawMask = function() {

	//get shoulders positions
	const left = this.shoulder_left;
	const right = this.shoulder_right;

	//minor shoulder variations
	//if(this.breaked === true && this.params.shoulder.slope === null) this.params.shoulder.slope = new Variation({min:-50,max:50});
	//if(this.breaked === true && this.params.shoulder.slope === null) this.params.shoulder.slope = new Variation({min:-50,max:50});

	//draw the shape of the wave
	this.shape_mask.graphics
		.clear()
		.beginFill('#FFFFFF')
		.moveTo(left.x - this.params.shoulder.width - this.params.shoulder.marge, this.params.height)
		.bezierCurveTo(left.x - this.params.shoulder.width + this.params.shoulder.outer - this.params.shoulder.marge, this.params.height + this.params.shoulder.slope,left.x - this.params.shoulder.inner - this.params.shoulder.marge,0,left.x - this.params.shoulder.marge,0)
		.lineTo(right.x + this.params.shoulder.marge,0)
		.bezierCurveTo(right.x + this.params.shoulder.inner + this.params.shoulder.marge,0,right.x + this.params.shoulder.width + this.params.shoulder.marge - this.params.shoulder.outer,this.params.height + this.params.shoulder.slope,right.x + this.params.shoulder.width + this.params.shoulder.marge ,this.params.height)
		.closePath()
		;

	//ajust position of the background image
	this.background_cont.x = - this.cont.x;
		//use the shape to mask the background image
	this.background_cont.mask = this.shape_mask;

}

prototype.drawDebug = function() {

	if(DEBUG == false) return;

	this.debug_points_cont.removeAllChildren();

	var points = this.allpoints;
	for(let j=0, ln=points.length; j<ln; j++) {

		let point = points[j];

		//DRAW LIP POINTS
		const lip = new createjs.Shape();
		let color = 'black';
		if(this.surfer) {
			if(point.breaking_percent / this.surfer.aerial_takeoff_limit > 1) color = 'black';
			else if(point.breaking_percent / this.surfer.aerial_takeoff_limit >= 0.50) color = 'darkgreen';
			else if(point.breaking_percent / this.surfer.aerial_takeoff_limit >= 0.10) color = 'lightgreen';
			else color = 'darkgreen';
			if(this.surfer.point_under && this.surfer.point_under.x === point.x) color = 'red';

		}
		lip.graphics.beginFill(color).drawCircle(0,0,4);
		lip.alpha = 0.8;
		lip.x = point.x;
		lip.y = point.y;
		this.debug_points_cont.addChild(lip);

		//DRAW CAP POINTS
		const cap = new createjs.Shape();
		cap.graphics.beginFill('grey').drawCircle(0,0,2);
		cap.alpha = 1;
		cap.x = point.x;
		cap.y = point.cap.y;
		this.debug_points_cont.addChild(cap);

		//DRAW TOP FALL POINTS
		const top = new createjs.Shape();
		top.graphics.beginFill('red').drawCircle(0,0,1);
		top.alpha = 0.2;
		top.x = point.x;
		top.y = 0;
		top.scaleX = top.scaleY = point.topfallscale;
		this.debug_points_cont.addChild(top);

		//DRAW BOTTOM FALL POINTS
		if(point.splashed === true) {

			const spla = new createjs.Shape();
			let color = 'blue';

			/*if(point.direction=='left') color = 'aqua';
			if(point.direction=='right') color = 'purple';*/
			if(point.peak.id === 1) color = 'aqua';
			if(point.peak.id === 2) color = 'purple';

			spla.graphics.beginFill(color).drawCircle(0,0,3);
			spla.alpha = 0.8;
			spla.x = point.x;
			spla.y = point.bounce_y;
			this.debug_points_cont.addChild(spla);

			const bot = new createjs.Shape();
			bot.graphics.beginFill('red').drawCircle(0,0,1);
			bot.alpha = 0.1;
			bot.x = point.x;
			bot.y = point.splash_y;
			bot.scaleX = bot.scaleY = point.bottomfallscale;
			this.debug_points_cont.addChild(bot);

			const tube = new createjs.Shape();
			tube.graphics.beginFill('green').drawCircle(0,0,1);
			tube.alpha = 0.1;
			tube.x = point.x;
			tube.y = this.params.height/2;
			tube.scaleX = tube.scaleY = point.tubescale;
			this.debug_points_cont.addChild(tube);
		}

	}


	//DRAW SHOULDER POINTS
	const shouldleft = new createjs.Shape();
	shouldleft.x = this.shoulder_left.x;
	shouldleft.y = this.shoulder_left.y;
	shouldleft.graphics.beginFill('yellow').drawCircle(0,0,7);
	this.debug_points_cont.addChild(shouldleft);

	const shouldright = new createjs.Shape();
	shouldright.x = this.shoulder_right.x;
	shouldright.y = this.shoulder_right.y;
	shouldright.graphics.beginFill('yellow').drawCircle(0,0,7);
	this.debug_points_cont.addChild(shouldright);

	//DRAW VANISH POINTS
	const vanishleft = new createjs.Shape();
	vanishleft.x = this.vanish_left.x;
	vanishleft.y = this.vanish_left.y;
	vanishleft.graphics.beginFill('black').drawCircle(0,0,7);
	this.debug_points_cont.addChild(vanishleft);

	const vanishright = new createjs.Shape();
	vanishright.x = this.vanish_right.x;
	vanishright.y = this.vanish_right.y;
	vanishright.graphics.beginFill('black').drawCircle(0,0,7);
	this.debug_points_cont.addChild(vanishright);
}

prototype.drawBackground = function() {

	const colors = this.spot.planet.colors.wave;
	const height = this.params.height;
	if(!height) return;
	this.background_gradient.graphics.clear();
	for(let i=0,ln=colors.length-1;i<ln;++i) {
		if(colors[i+1] === undefined) break;
		let color1 = colors[i];
		let color2 = colors[i+1];
		let y1 = parseInt(height * color1[2] / 100);
		let y2 = parseInt(height * color2[2] / 100);

		this.background_gradient.graphics
			.beginLinearGradientFill([color1[0],color2[0]],[0+color1[1],1-color2[1]],0,y1,0,y2)
			.drawRect(0,y1,STAGEWIDTH*2,y2);
	}

	//shadow gradient background
	this.background_shadow.graphics.clear()
		.beginLinearGradientFill(['rgba(0,0,0,0.4)','rgba(0,0,0,0)'],[0,1],0,0,0, height)
		.drawRect(0,0,STAGEWIDTH*2, height);
}

prototype.initRipples = function() {

	this.initBackgroundRipples();
	this.initFrontgroundRipples();
}

prototype.initFrontgroundRipples = function() {

	const ripple1 = new createjs.Bitmap(QUEUE.getResult('lip_ripple'));
	const width = ripple1.image.width;
	const height = ripple1.image.height;
	ripple1.regX = width/2;
	ripple1.regY = height/2;
	ripple1.scaleY = 1;
	ripple1.x = 0;
	this.lip_ripples.addChild(ripple1);
	this.lip_ripples.ripple1 = ripple1;

	const ripple2 = ripple1.clone();
	ripple2.x = width;
	this.lip_ripples.addChild(ripple2);
	this.lip_ripples.ripple2 = ripple2;

	this.lip_ripples.ripple_width = width;
	this.lip_ripples.alpha = 0.3;
	this.lip_ripples.y = height/2;
	this.lip_ripples.mask = this.lip_surface;
	this.lip_ripples.visible = false;
}

prototype.initBackgroundRipples = function() {

	this.background_ripples.alpha = 0.1;

	this.background_ripple1 = new createjs.Bitmap(QUEUE.getResult('wave_ripple'));

	var height = this.background_ripple1.image.height;
	this.background_scale = this.params.height / height;

	this.background_ripple1.scaleY = this.background_scale;

	this.background_ripple2 = this.background_ripple1.clone();
	this.background_ripple2.x = 0;
	this.background_ripple2.scaleY = this.background_scale;
	this.background_ripple2.y = this.background_ripple1.image.height * this.background_scale;

	this.background_ripple3 = this.background_ripple1.clone();
	this.background_ripple3.x = this.background_ripple1.image.width;
	this.background_ripple3.scaleY = this.background_scale;
	this.background_ripple3.y = 0;

	this.background_ripple4 = this.background_ripple1.clone();
	this.background_ripple4.x = this.background_ripple4.image.width;
	this.background_ripple4.scaleY = this.background_scale;
	this.background_ripple4.y = this.background_ripple4.image.height * this.background_scale;

	this.background_ripples.addChild(this.background_ripple1, this.background_ripple2, this.background_ripple3, this.background_ripple4);
}

prototype.animateRipples = function() {

	this.animateBackgroundRipples();
	this.animateFrontgroundRipples();
}

prototype.animateFrontgroundRipples = function() {

	if(PERF <= 1) return;
	if(false === SPOT.runing && false === this.isPlayed()) return;

	const ripple1 = this.lip_ripples.ripple1;
	const ripple2 = this.lip_ripples.ripple2;
	const width = this.lip_ripples.ripple_width;

	ripple1.x += this.movingX;
	ripple2.x += this.movingX;

	if(this.direction === LEFT) {
			if(ripple1.x >= STAGEWIDTH) {
				ripple1.x = ripple2.x - width;
			}
			if(ripple2.x >= STAGEWIDTH) {
				ripple2.x = ripple1.x - width;
			}
		}

		if(this.direction === RIGHT) {
			if(ripple1.x <= -STAGEWIDTH) {
				ripple1.x = ripple2.x + width;
			}
			if(ripple2.x <= -STAGEWIDTH) {
				ripple2.x = ripple1.x + width;
			}
		}
}

prototype.animateBackgroundRipples = function() {

	if(PERF <= 1) return;

	if(SPOT.runing === false && this.isPlayed() === false) return;

	const ripple1 = this.background_ripple1;
	const ripple2 = this.background_ripple2;
	const ripple3 = this.background_ripple3;
	const ripple4 = this.background_ripple4;
	const width  = ripple1.image.width;
	const height = ripple1.image.height * this.background_scale;
	const coef = this.getResizeCoef();

	ripple1.y += this.suction.y * coef;
	ripple2.y += this.suction.y * coef;
	ripple3.y += this.suction.y * coef;
	ripple4.y += this.suction.y * coef;

	if(ripple1.y <= - height) ripple1.y = ripple2.y + height;
	if(ripple2.y <= - height) ripple2.y = ripple1.y + height;
	if(ripple3.y <= - height) ripple3.y = ripple4.y + height;
	if(ripple4.y <= - height) ripple4.y = ripple3.y + height;

	ripple1.x += this.movingX;
	ripple2.x += this.movingX;
	ripple3.x += this.movingX;
	ripple4.x += this.movingX;

	if(this.direction === LEFT) {
		if(ripple1.x >= STAGEWIDTH) {
			ripple1.x = ripple3.x - width;
		}
		if(ripple2.x >= STAGEWIDTH) {
			ripple2.x = ripple4.x - width;
		}
		if(ripple3.x >= STAGEWIDTH) {
			ripple3.x = ripple1.x - width;
		}
		if(ripple4.x >= STAGEWIDTH) {
			ripple4.x = ripple2.x - width;
		}
	}

	if(this.direction === RIGHT) {
		if(ripple1.x <= -STAGEWIDTH) {
			ripple1.x = ripple3.x + width;
		}
		if(ripple2.x <= -STAGEWIDTH) {
			ripple2.x = ripple4.x + width;
		}
		if(ripple3.x <= -STAGEWIDTH) {
			ripple3.x = ripple1.x + width;
		}
		if(ripple4.x <= -STAGEWIDTH) {
			ripple4.x = ripple2.x + width;
		}
	}

}

prototype.updateLeftShoulder = function(x) {

	if(this.shoulder_left === undefined) {
		this.shoulder_left = new createjs.Container();
		const mouse_cont = new createjs.Container();
		this.shoulder_left.addChild(mouse_cont);
		this.shoulder_left.mouse_cont = mouse_cont;
		this.shoulder_cont.addChild(this.shoulder_left);
	}

	//do not update when breaking have not reached the shoulder
	if(x > this.shoulder_left.x) return;

	this.shoulder_left.x = x;
}

prototype.updateRightShoulder = function(x) {

	if(this.shoulder_right === undefined) {
		this.shoulder_right = new createjs.Container();
		const mouse_cont = new createjs.Container();
		this.shoulder_right.addChild(mouse_cont);
		this.shoulder_right.mouse_cont = mouse_cont;
		this.shoulder_cont.addChild(this.shoulder_right);
	}

	//do not update when breaking have not reached the shoulder
	if(x < this.shoulder_right.x) return;

	this.shoulder_right.x = x;

}

prototype.initVanishPoints = function(x) {

	var vanish = new createjs.Point(x-1,0);
	this.vanish_left = vanish;

	var vanish = new createjs.Point(x+1,0);
	this.vanish_right = vanish;

}
prototype.updateVanishPoints = function(pt) {

	if(this.direction === LEFT) {
		var point = this.vanish_left;
		if( pt.x > point.x) return;
		return point.x = pt.x;
	}
	if(this.direction === RIGHT) {
		var point = this.vanish_right;
		if( pt.x < point.x ) return;
		return point.x = pt.x;
	}
}
prototype.getLeftVanishPoint = function() {
	return this.vanish_left;
}
prototype.getRightVanishPoint = function() {
	return this.vanish_right;
}
prototype.getVanishPoint = function() {
	if(this.direction === LEFT) return this.vanish_left;
	if(this.direction === RIGHT) return this.vanish_right;
	return this.vanish_left;
}
prototype.isPlayed = function() {
	return this.played || false;
}
prototype.isSurfed = function() {
	return this.surfed || false;
}
prototype.isLEFT = function() {
	return (this.direction === LEFT)? true : false;
}
prototype.isRIGHT = function() {
	return (this.direction === RIGHT)? true : false;
}
prototype.isCENTER = function() {
	return (this.direction === CENTER)? true : false;
}
prototype.setTimeScale = function(scale) {
	this.time_scale = scale;
	this.suction = this.suction.clone().scale(scale);
	this.allpoints.map(p => p.tweens.map(t => t.timeScale = scale));
	this.surfers.map(s => s.setTimeScale(scale));
}
prototype.updateConfig = function(config) {

	this.config = extend(this.config,config);
	this.params = extend(this.params,config);

	//recalcul suction
	this.suction = this.getSuction();

	//reset intervals
	this.initBreakedIntervals();

}

//<-- end methods


//assign wave to window's scope & promote overriden container's methods from Wave object, allow them to be call by 'Container_methodName()'
window.Wave = createjs.promote(Wave,'Container');

}());