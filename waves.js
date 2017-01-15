(function() {

// define usefull constant (NB: use positive numeric for perf reason)
const LEFT = 1;
const CENTER = 0;
const RIGHT = 2;

// create new class
function Wave(params) {

	this.Container_constructor();

	var defaults = {
		x: 0,
		y: 0,
		height: 100,
		width: 1500,
		real_height: 4,
		peak_width: 200,
		breaking: {
			yspeed: 1200,
			left: {
				width: 20,
				width_max: 30,				
				width_interval: 3000,
				width_pause: 1000,
			},
			right: {
				width: 10,
				width_max: 25,
				width_interval: 3000,
				width_pause: 1000,
			}
		},
		paddling_effort: 1,
		bottom_fall_scale: 1,
		top_fall_scale: 0.2,
		suction_x: 5,
		suction_y: 3,
		shoulder : {
			left : {
				width: 1000,
				inner: 300,
				outer: 300,
				marge: 50,
				slope: 0
			},
			right : {
				width: 1000,
				inner: 300,
				outer: 300,
				marge: 50,
				slope: 0
			}
		},
	};
	var params = extend(defaults,params);	

	this.init(params);
}

//extend it
var prototype = createjs.extend(Wave, createjs.Container);

//add EventDispatcher
createjs.EventDispatcher.initialize(prototype);

//public property
prototype.surfer = undefined;


//public methods
prototype.init = function(params) {

	//set spot
	this.spot = params.spot;
	params.spot = null; //remove it to avoid recursive object
	//set config
	this.config = params;
	this.params = cloneObject(params); //clone object
	//set properties
	this.y = params.y;	
	this.origin_height = this.config.height;
	this.origin_width = this.config.width;
	this.surfers = [];
	this.obstacles = [];
	this.peaks = [];
	this.splashs = [];
	this.allpoints = [];
	this.particles = [];
	this.peak_count = 0;
	this.shaking_force = 1.2;
	this.direction = CENTER;
	this.movingX = 0;

	//initiale suction force with no x value, later suction will be defined when direction is setted
	this.params.suction = vec2.fromValues(0, - this.params.suction_y);		
	
	this.breaked = false;
	this.played = false;
	this.surfed = false;
	this.status = '';
	this.paused = false;
	this.cleaned = false;
	
	//on-wave static score container
	this.score_cont = new createjs.Container();
	this.addChild(this.score_cont);
		//text cont
		this.score_text_cont = new createjs.Container();
		this.score_cont.addChild(this.score_text_cont);
		//particles cont
		this.score_particles_cont = new createjs.Container();
		this.score_cont.addChild(this.score_particles_cont);	

	//wave cont
	this.cont = new createjs.Container();
	this.cont.x = params.x;
	this.addChild(this.cont);	

	//wave background
	this.background_cont = new createjs.Container();
	this.cont.addChild(this.background_cont);


	this.foreground_cont = new createjs.Container();
	this.cont.addChild(this.foreground_cont);
	
		//particule cont
		this.particles_cont = new createjs.Container();
		this.foreground_cont.addChild(this.particles_cont);
		//surfer trails cont
		this.trails_cont = new createjs.Container();
		this.foreground_cont.addChild(this.trails_cont);	
		//spatter cont
		this.spatter_cont = new createjs.Container();
		this.foreground_cont.addChild(this.spatter_cont);	
		//lipback cont
		this.lipcap_cont = new createjs.Container();
		this.foreground_cont.addChild(this.lipcap_cont);
		//surfer cont
		this.surfers_cont = new createjs.Container();
		this.foreground_cont.addChild(this.surfers_cont);
		//obstacle cont
		this.obstacle_cont = new createjs.Container();
		this.foreground_cont.addChild(this.obstacle_cont);
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

		this.lip_shape = new createjs.Shape();
		this.lip_shadow = new createjs.Shape();
		this.lip_cap = new createjs.Shape();
		this.lip_thick = new createjs.Shape();
		this.lip_cont.addChild(this.lip_shape,this.lip_shadow,this.lip_thick);
		this.lipcap_cont.addChild(this.lip_cap);

		this.background = new createjs.Container();
		this.background_gradient = new createjs.Shape();
		this.background_riddles = new createjs.Container();
		this.background_shadow = new createjs.Shape();
		this.background.addChild(this.background_gradient,this.background_riddles);
		this.background_cont.addChild(this.background,this.background_shadow);

		this.background_riddle1 = new createjs.Bitmap(queue.getResult('wave_riddle'));
		this.background_riddles.alpha = 0.1;
		this.background_riddles.addChild(this.background_riddle1);



		//draw shape mask beetween the two shoulder
		this.shape_mask = new createjs.Shape();


		//clicking the wave
		//this.on('click',this.onTakeoffClick);	

		//Ticker
		this.addEventListener('tick',proxy(this.tick,this));		

		this.initWave(STAGEWIDTH/2);
		
		this.resize();

}

prototype.getAllPeaksPoints = function() {

	//get peaks
	const points = [];
	for(let i=0, len=this.peaks.length; i<len; ++i) {
		for(let j=0, ln=this.peaks[i].points.length; j<ln; j++) {
			points.push(this.peaks[i].points[j]);
		}
	}
	return points;
}


prototype.tick = function(ev) {
	if(PAUSED) return;	

	if(this.breaked) {

		this.continousBreaking();
		this.mergeCollidingPeaks();
		this.drawLip();
		this.drawSplash();
		this.moveWave();
		this.drawMask();	
		this.animateBackground();
	}

	if(DEBUG) {
		this.drawDebug();		
	}
		
}

prototype.mergeCollidingPeaks = function() {

	//merging peaks
	for(var i=0,len=this.peaks.length; i<len; ++i) {
		if(len === 1) break;
		let first = this.peaks[i];
		let second = this.peaks[i+1];
		if(second === undefined) break;

		if( first.points.length !== 0 && second.points.length !==0 &&
			first.right_x >= second.left_x - this.params.breaking.left.width) {

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
			first.boundaries.right >= second.boundaries.left - this.params.breaking.left.width) {

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

prototype.continousBreaking = function() {

	// cancel if wave is paused or not breaked yet
	if(this.paused === true || this.breaked === false) return;

	// add breaking points for each peaks
	for(let i=0,len=this.peaks.length; i<len; ++i) {

		const peak = this.peaks[i];

		//do NOT add points if there is no point to start
		if(peak.points.length === 0) continue;
		
		// add left point
		let lx = peak.points[0].x - this.params.breaking.left.width;
		const left = this.createLipPoint({x:lx, direction: LEFT, peak: peak});
		peak.points.unshift(left);
		// add right point
		let rx = peak.points[peak.points.length-1].x + this.params.breaking.right.width;
		const right = this.createLipPoint({x:rx, direction: RIGHT, peak: peak});
		peak.points.push(right);

		//[rewrite plz] update shoulder
		this.updateLeftShoulder(lx);
		this.updateRightShoulder(rx);

		//update peak boundaries
		peak.left_x = lx;
		peak.right_x = rx;
	}
	
}

prototype.addPeak = function(center, width) {

	//update count
	this.peak_count++;

	//create peak
	const peak = {
		id : this.peak_count,
		center : center,
		width : width,
		left_x : center,
		right_x : center,
		points : [],
	}
	//create points of the lip
	const points = this.createPeakPoints(peak);
	//add points to the peak
	peak.points = points;

	//create splash
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

	var middle = this.createLipPoint({x:peak.center, direction: CENTER, delay: 0, peak: peak});
	var right = this.createLipPoint({x:peak.center + peak.width/2, direction: RIGHT, peak: peak});
	var left = this.createLipPoint({x:peak.center - peak.width/2, direction: LEFT, peak: peak});
	var points = [left,middle,right];

	return points;
}

prototype.createLipPoint = function(params) {

	params = params === undefined ? {} : params;
	const delay = params.delay === undefined ? this.config.lip.cap.lifetime : this.config.lip.cap.lifetime + params.delay;
	const direction = params.direction ? params.direction : RIGHT;
	const x = params.x === undefined ? 0 : params.x;
	const width = (this.direction === LEFT)? this.params.breaking.left.width : this.params.breaking.right.width;
	const peak = params.peak === undefined ? null : params.peak;
	const breaking_y = (this.params.breaking.splash_h_percent <= 100)? this.params.height * this.params.breaking.splash_h_percent/100 : this.params.height;
	const bounce_y = (this.isPlayed())? breaking_y + Math.random() * breaking_y / 3 : breaking_y + Math.random() * breaking_y / 4;

	// lip point
	const point = {
		//initial property of the lip's point
		x : x,
		y : 0,
		peak : peak,
		direction : direction,
		breaking : false,
		breaking_width : width,
		breaking_idx : 0,
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
	};

	// stock points in a array
	this.allpoints.push(point);

	// cap point
	const cap = new createjs.Point();
	point.cap = cap;

	createjs.Tween.get(point)
		//delay
		.wait(delay)
		//break
		.set({breaking: true})
		//fall
		.to({y: breaking_y, breaking_idx: 1, topfallscale: point.topfallscaleMax},this.params.breaking.yspeed + Math.random()*50,createjs.Ease.quartIn)
		//splash
		.set({breaking: false, splashed: true})
		.call(proxy(this.splashPointReached,this,[point]))
		//bounce
		.to({bounce_y: breaking_y - bounce_y, bottomfallscale: point.bottomfallscaleMax, tubescale: point.tubescaleMax, tubedeep: point.tubedeepMax},1000)
		.call(proxy(this.updateVanishPoints,this,[point]))
		//fade
		.to({bounce_y: breaking_y - bounce_y/2},2500,createjs.Ease.bounceOut)
	;

	createjs.Tween.get(cap)		
		.to({y: - this.config.lip.cap.height + Math.random()*5}, this.config.lip.cap.lifetime + this.config.lip.cap.width/2, createjs.Ease.sineIn)
		.to({y:0},this.config.lip.cap.width/2,createjs.Ease.quartInOut)
		;

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

	//save splash height
	point.splash_y = point.y;

	//get corresponding splash
	const splash = this.splashs.find((splash) => splash.id === point.peak.id);

	//it is possible that ONE point have no more corresponding splash after merging (dont know exactly why). Just return in that case
	if(splash === undefined) return;

	//add point as splashed to peak
	this.addPointToSplash(point,splash);

	//update splash boudaries
	splash.boundaries[point.direction] = point.x;

	//set direction
	if(this.direction===0) {
		this.setDirection();
		//this.startShaking();
		

		//init breaked intervals
		if(this.isPlayed) {
			this.initPlayedIntervals();
		}
	} 

	//add particle
	if(PERF > 10) {

		var emitter = new ParticleEmitter({
				x: 0,
				y: 0,
				duration: 1000,
				frequency: 100,
				angle: - Math.PI /2,
				spread: Math.PI / 2,
				magnitude: this.params.height/10,
				color: '#FFF',
				size: 1,
				sizemax: 5,
				fader: 0.2,
				fadermax: 0.3,
				scaler: 0.05,
				forces: [vec2.fromValues(0,1)],
				shapes: [
					{shape:'circle',percentage:50,fill:'#FFF'},
					{shape:'circle',percentage:50,stroke:1,strokeColor:'#FFF'}
				]
		});
		point.addChild(emitter);		
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

	if(this.y > this.spot.getBeach() ) {
		//if wave is played, send event to freeze the spot
		if(this.played === true) {
			var e = new createjs.Event("played_wave_on_spot");
			e.wave = this;
			stage.dispatchEvent(e);			
		}
		else {
			var e = new createjs.Event("non_played_wave_on_spot");
			e.wave = this;
			//stage.dispatchEvent(e);		
		}

		this.alpha -= 0.05;

		return;
	}

	if(this.y > this.spot.getBreak()) {

		if(this.breaked === false) {
			this.initBreak(STAGEWIDTH/2);			
		}	
	}	

	if(this.y >= this.spot.getPeak()) {

		return;
	}

	this.resize();

}

prototype.getResizeCoef = function() {

	return (this.y  - this.spot.getHorizon()) / ( this.spot.getPeak() - this.spot.getHorizon());
}

prototype.resize = function() {

	//calcul the proportion	
	var coef = this.getResizeCoef();

	//calcul wave height	
	var h = this.config.height * coef;
	//set new height
	this.params.height = h;
	this.cont.y = - h;
	//calcul wave width
	var w = this.origin_width * coef
	if(this.origin_width===0) w = STAGEWIDTH;
	//set new shoulders position
	this.shoulder_left.x = STAGEWIDTH/2 - w/2;
	this.shoulder_right.x = STAGEWIDTH/2 + w/2;
	//set new shoulders proportion
	this.params.shoulder.left.width = this.config.shoulder.left.width * coef;
	this.params.shoulder.left.inner = this.config.shoulder.left.inner * coef;
	this.params.shoulder.left.outer = this.config.shoulder.left.outer * coef;
	this.params.shoulder.left.marge = this.config.shoulder.left.marge * coef;
	this.params.shoulder.right.width = this.config.shoulder.right.width * coef;
	this.params.shoulder.right.inner = this.config.shoulder.right.inner * coef;
	this.params.shoulder.right.outer = this.config.shoulder.right.outer * coef;
	this.params.shoulder.right.marge = this.config.shoulder.right.marge * coef;

	//resize surfer
	for(var i=0,len=this.surfers.length;i<len;++i) {
		this.surfers[i].resize();
	}

	//resize lip
	/*if(this.breaked === true) {
		for(var i=0,len=this.peakpoints[0].length;i<len;++i) {
			if(this.peakpoints[0][i].splashed != undefined) {
				this.peakpoints[0][i].y = this.params.height;
			}
		}		
	}*/

	//draw background
	this.drawBackground();

	//progressive alpha background
	this.background.alpha = coef;
	this.background_shadow.alpha = 1 - coef;

	//resize background
	this.resizeBackground(h);	

	//draw shpa
	this.drawMask();

}

prototype.initWave = function(center) {

	if(this.breaked === true) return;

	//init the vanish points
	this.initVanishPoints(center);

	//add first breaking points
	this.updateLeftShoulder(STAGEWIDTH/2 - this.config.width/2);
	this.updateRightShoulder(STAGEWIDTH/2 + this.config.width/2);

}

prototype.initBreak = function(center) {		

	if(this.breaked === true) return;

	//set status of the wave
	this.status = 'run';
	this.breaked = true;

	//set wave breaking center
	this.params.breaking_center = center;

	this.addPeak(center,200);
	//this.addPeak(1100,100);

	//init points cleaner
	this.initCleanOffscreenPoints();

	//init intervals
	this.initBreakedIntervals();

	//init variables
	this.initVariablePameters();
}

prototype.initBreakedIntervals = function() {

	//Breaking block interval
	if(this.config.breaking.left.block_interval !== 0) {

		this.initBreakingBlockLeftInterval();
	}
	if(this.config.breaking_block_right_interval !== 0) {

		this.initBreakingBlockRightInterval();
	}
}

prototype.initPlayedIntervals = function() {

	//Obstacles interval
	if(this.config.obstacles_interval !== 0) {
		
		this.initObstaclesInterval();
	}
}

prototype.initVariablePameters = function() {

	if(this.config.breaking.left.width_max !=0) {
		this.params.breaking.left.width = new Variation({
			min: this.config.breaking.left.width,
			max: this.config.breaking.left.width_max,
			time: this.config.breaking.left.width_interval,
			wait: this.config.breaking.left.width_pause,
			slope: 'both',
			loops : true,
			ease: createjs.Tween.cubicInOut,
		})
	}
	if(this.config.breaking.right.width !=0) {
		this.params.breaking.right.width = new Variation({
			min: this.config.breaking.right.width,
			max: this.config.breaking.right.width,
			time: this.config.breaking.right.width_interval,
			wait: this.config.breaking.right.width_pause,
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

	this.addSurfer(surfer);

	this.initBreak(surfer.x);

	//throw event
	var e = new createjs.Event("player_take_off");
		e.wave = this;
		e.surfer = this.surfer;
		stage.dispatchEvent(e);

	
}

prototype.onTakeoffClick = function(evt) {

	var wave = evt.currentTarget;
	var x = evt.stageX;

	wave.surfed = true;
	wave.played = true;

	wave.initBreak(x);

	wave.addTestSurfer(x);

	//throw event
	var e = new createjs.Event("player_take_off");
		e.wave = this;
		e.surfer = this.surfer;
		stage.dispatchEvent(e);

	//remove click event
	evt.remove();
}


prototype.startShaking = function() {

	this.shaking = true;
	this.shake();

}

prototype.stopShaking = function() {

	this.shaking = false;
}

prototype.shake = function() {

	if(this.shaking==false) return;
	if(this.surfer==null) return;

	var dist = get2dDistance(this.surfer.x,this.surfer.y,this.getVanishPoint().x,this.getVanishPoint().y);
	var amplitude = this.params.width/2/dist*this.shaking_force;
	if(amplitude<1) amplitude = 0;
	
	this.shake_x = Math.floor(Math.random()*amplitude*2 - amplitude);
	this.shake_y = Math.floor(Math.random()*amplitude*2 - amplitude);
	createjs.Tween.get(this.lip)
		.to({x:this.lip_cont.x+this.shake_x,y:this.lip_cont.y+this.shake_y},50)
		.call(proxy(this.unshake,this));
}

prototype.unshake = function() {

	createjs.Tween.get(this.lip)
		.to({x:this.lip_cont.x-this.shake_x,y:this.lip_cont.y-this.shake_y},50)
		.call(proxy(this.shake,this));
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
	this.surfers_cont.addChild(this.surfer);
	this.surfers.push(surfer);
}

prototype.addSurferBot = function(bot) {

	bot.takeOff(bot.x,bot.y);
	this.surfers_cont.addChild(bot);
	this.surfers.unshift(bot);
	stage.dispatchEvent('bot_take_off');

}

prototype.addTestSurferBot = function(surfer) {

	if(this.direction === LEFT) {
		var direction = LEFT;
		var takeoffX = this.shoulder_left.x - this.params.shoulder.left.marge;
	} else {
		var direction = RIGHT;
		var takeoffX = this.shoulder_right.x + this.params.shoulder.right.marge;
	}

	var bot = new SurferBot({
		wave:this,
		spot:this.spot,
		direction: direction
	});


	bot.takeOff( takeoffX, this.params.height*1/3);
	this.surfers_cont.addChild(bot);
	this.surfers.unshift(bot);
	console.log(this.surfers);
}

prototype.removeBot = function(bot) {

	this.surfers_cont.removeChild(bot);
	this.surfers.splice(this.surfers.indexOf(bot),1);
	console.log(this.surfers);
}

prototype.getSurfer = function() {

	return this.surfer;
}

prototype.pause = function() {

	if(this.status != 'paused') {
		this.status = 'paused';
		this.paused = true;
		createjs.Ticker.setPaused(true);		
	} else {
		this.status = 'run';
		this.paused = false;
		createjs.Ticker.setPaused(false);
	}
}



prototype.initBreakingBlockLeftInterval = function() {

	var t = this.config.breaking.left.block_interval + Math.random()*(this.config.breaking.left.block_interval_max - this.config.breaking.left.block_interval);
	var w = this.config.breaking.left.block_width + Math.random()*(this.config.breaking.left.block_width_max - this.config.breaking.left.block_width);

	window.setTimeout(proxy(this.continueBreakingBlockLeftInterval,this),t);
}

prototype.continueBreakingBlockLeftInterval = function() {

	var t = this.config.breaking.left.block_interval + Math.random()*(this.config.breaking.left.block_interval_max - this.config.breaking.left.block_interval);
	var w = this.config.breaking.left.block_width + Math.random()*(this.config.breaking.left.block_width_max - this.config.breaking.left.block_width);

	this.initBlockBreakingLeft(w);

	window.setTimeout(proxy(this.continueBreakingBlockLeftInterval,this),t);
}

prototype.initBreakingBlockRightInterval = function() {

	var t = this.config.breaking_block_right_interval + Math.random()*(this.config.breaking_block_right_interval_max - this.config.breaking_block_right_interval);
	var w = this.config.breaking_block_right_width + Math.random()*(this.config.breaking_block_right_width_max - this.config.breaking_block_right_width);

	window.setTimeout(proxy(this.continueBreakingBlockRightInterval,this),t);
}

prototype.continueBreakingBlockRightInterval = function() {

	var t = this.config.breaking_block_right_interval + Math.random()*(this.config.breaking_block_right_interval_max - this.config.breaking_block_right_interval);
	var w = this.config.breakgin_block_right_width + Math.random()*(this.config.breaking_block_right_width_max - this.config.breaking_block_right_width);

	this.initBlockBreakingRight(w);

	window.setTimeout(proxy(this.continueBreakingBlockRightInterval,this),t);
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

prototype.findTheLeftPeak = function() {
	for(let i=0,len=this.peaks.length; i<len; ++i) {
		if(this.peaks[i].points.length !== 0) return this.peaks[i];
	}
}

prototype.findTheRightPeak = function() {
	for(let i=this.peaks.length-1; i>=0; i--) {
		if(this.peaks[i].points.length !== 0) return this.peaks[i];
	}
}

prototype.findEmptyLeftPeak = function() {
	for(let i=0,len=this.peaks.length; i<len; ++i) {
		if(this.peaks[i].points.length === 0) return this.peaks[i];
	}
}

prototype.findEmptyRightPeak = function() {
	for(let i=this.peaks.length-1; i>=0; i--) {
		if(this.peaks[i].points.length === 0) return this.peaks[i];
	}
}

prototype.initBlockBreakingLeft = function(width) {
	if(this.breaked === false) return;

	var peak = this.findTheLeftPeak();
	while( width > 0 ) {
		var x = peak.points[0].x - this.params.breaking.left.width;
		var point = this.createLipPoint({x:x, direction: LEFT, peak: peak});
		peak.points.unshift(point);
		width = width - this.params.breaking.left.width;
	}		
}

prototype.initBlockBreakingRight = function(width) {
	if(this.breaked === false) return;

	var peak = this.findTheRightPeak();
	while( width > 0) {
		var x = peak.points[peak.points.length-1].x + this.params.breaking.right.width;	
		var point = this.createLipPoint({x:x, direction: RIGHT, peak: peak});
		peak.points.push(point);
		width = width - this.params.breaking.right.width;
	}
}

prototype.addBreakingPeak = function(width,distance) {
	
	//this.addBreakingPeakWarning();

	//window.setTimeout(proxy(this.addBreakingPeakToLip,this,[width,distance]),2000);

	this.addBreakingPeakToLip(width,distance);
}

prototype.addBreakingPeakWarning = function() {

	var text = new createjs.Text('Watch out !','bold 40px BubblegumSansRegular','#FFF'); //BubblegumSansRegular BoogalooRegular albaregular
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
			//console.log('Wave is a right !');
		} 
		else {
			this.direction = LEFT;
			//console.log('Wave is a left !');
		}
	}
	else {
		var surfer = this.surfers[0];
		if(surfer.x > this.params.breaking_center) {
			this.direction = RIGHT;	
			//console.log('Wave is a right !');
		} 
		else {
			this.direction = LEFT;
			//console.log('Wave is a left !');
		}
	}

	//invert suction direction for left waves
	if(this.direction === LEFT) this.params.suction = vec2.fromValues(this.params.suction_x*-1,- this.params.suction_y);	
	if(this.direction === RIGHT) this.params.suction = vec2.fromValues(this.params.suction_x,- this.params.suction_y);	
	
}

prototype.moveWave = function() {

	if(this.surfer === undefined) return;
	if(this.breaked === false) return;
	if(this.surfer.riding === false) return;
	if(this.direction === CENTER) return;

	//var coef = 1 - ((100*this.y/SPOT.peak_point) / 100);	
	var surfer_pos = this.cont.localToGlobal(this.surfer.x,0);
	var delta = (STAGEWIDTH>>1) - surfer_pos.x;

	if(this.direction === LEFT) {
		delta += 200;
		this.movingX = delta/this.params.breaking.left.width;
	}
	if(this.direction === RIGHT) {
		delta += -200;
		this.movingX = delta/this.params.breaking.right.width;
	}

	this.cont.x += this.movingX;	
}

prototype.oldmoveWave = function() {
	if(this.breaked === false) return;
	if(this.direction === CENTER) return;
	if(this.direction === LEFT) {
		//get vanish point x
		var pt = this.cont.localToGlobal(this.vanish_left.x,0);
		//calcul lateral movement from y position
		var coef = ( 100*this.y/ this.spot.getPeak()) / 100;
		var xwidth = this.params.breaking.left.width * 1/coef;
		//move wave normally when well positioned
		if(pt.x >= (STAGEWIDTH-100)) this.cont.x += xwidth;
		//else move quicker
		else this.cont.x += xwidth *2;
	}
	if(this.direction === RIGHT) {
		//get vanish point x
		var pt = this.cont.localToGlobal(this.vanish_right.x,0);
		//calcul lateral movement from y position
		var coef = ( 100*this.y/ this.spot.getPeak()) / 100;
		var xwidth = this.params.breaking.right.width * 1/coef;
		//move wave normally when well positioned
		if(pt.x <= 100) this.cont.x -= xwidth;
		//else move quicker
		else this.cont.x -= xwidth*2;			
	}

}

prototype.clearWave = function() {

	this.cont.removeAllChildren();
	this.cont = null;
	window.clearInterval(this.clearnerInterval);
	window.clearInterval(this.breakingInterval);
	window.clearInterval(this.breakingPeaksInterval);
	this.removeAllEventListeners('tick');
	return;

}

prototype.initCleanOffscreenPoints = function() {

	this.clearnerInterval = window.setInterval(proxy(this.cleanOffscreenPoints,this),1000);
}

prototype.findOnscreenPoints = function(points, removeOffscreen = true) {

	const offset = STAGEWIDTH / 4;
	const onscreens = [];
	const offscreens = [];

	if(this.direction === LEFT) {
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
	}

	if(this.direction === RIGHT) {
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
	}

	// remove off screen points from the stock array
	if( removeOffscreen === true) {
		let i = offscreens.length;
		while(i>=0) {
			const index = this.allpoints.indexOf(offscreens[i]);
			if(index !== -1) this.allpoints.splice(index,1);			
			--i;
		}
	}
	
	return onscreens;
}

prototype.cleanOffscreenPoints = function() {

	if(PAUSED) return;

	if(this.direction === LEFT) {
		let peak = this.findTheRightPeak();

		//find on-screen lip points
		let points = peak.points;
		let onscreens_points = this.findOnscreenPoints(points);
		// set on-screen points to the peak
		peak.points = onscreens_points;

		//find on-screen splash points
		let splashed = peak.splashed;
		let splashed_onscreen = this.findOnscreenPoints(points);
		// set on-screen points to the peak
		peak.splashed = splashed_onscreen;
	}

	if(this.direction === RIGHT) {
		let peak = this.findTheLeftPeak();

		//find on-screen lip points
		let points = peak.points;
		let onscreens_points = this.findOnscreenPoints(points);
		// set on-screen points to the peak
		peak.points = onscreens_points;

		//find on-screen splash points
		let splashed = peak.splashed;
		let splashed_onscreen = this.findOnscreenPoints(points);
		// set on-screen points to the peak
		peak.splashed = splashed_onscreen;
	}
}


prototype.initObstaclesInterval = function() {

	var t = this.config.obstacles_interval + Math.random()*(this.config.obstacles_interval_max - this.config.obstacles_interval);

	window.setTimeout(proxy(this.continueObstaclesInterval,this),t);
	
}

prototype.continueObstaclesInterval = function() {

	var t = this.config.obstacles_interval + Math.random()*(this.config.obstacles_interval_max - this.config.obstacles_interval);

	this.addRandomObstacle();

	window.setTimeout(proxy(this.initObstaclesInterval,this),t);
	
}
prototype.addRandomObstacle = function() {
	if(this.breaked === false) return;
	var rand = Math.ceil(Math.random()*100);
	var pc = 0;
	for(var obs in this.config.obstacles) {
		var pc = pc + this.config.obstacles[obs].percentage;
		if(rand <= pc) {
			if(obs === 'paddler') this.addPaddler();
			else if(obs === 'photograph') this.addPhotograph();
			else this.addPaddler();
			return;
		}
	}
}

prototype.addPaddler = function() {
	var obs = new Obstacle({wave:this});
	return this.addObstacle(obs);
}

prototype.addPhotograph = function() {
	var obs = new Photograf({wave:this});
	return this.addObstacle(obs);
}

prototype.addObstacle = function(obs) {
	if(this.breaked === false) return;
	if(obs === undefined) var obs = new Obstacle({wave: this});	
	this.obstacles.push(obs);
	this.obstacle_cont.addChild(obs);
}

prototype.addFlyingObstacle = function() {
	if(this.breaked === false) return;
	var obs = new FlyingMultiplier({wave: this, multiplier: Math.ceil(Math.random()*5)})
	this.obstacles.push(obs);
	this.obstacle_cont.addChild(obs);
}

prototype.removeObstacle = function(obs) {
	obs.removeListeners();
	this.obstacles.splice(this.obstacles.indexOf(obs),1);
	this.obstacle_cont.removeChild(obs);
}


prototype.drawLip = function() {

	//return if not breked yet
	if(this.breaked === false) return;

	//shape.alpha = 0.5;
	this.lip_shape.graphics.clear().beginFill('rgba(255,255,255,0.5)');
	this.lip_shadow.graphics.clear().beginLinearGradientFill(["rgba(0,0,0,0.1)","rgba(0,0,0,0)"], [0, 1], 0, 0, 0, this.params.height);
	this.lip_cap.graphics.clear().beginFill('rgba(255,255,255,0.5');
	this.lip_thick.graphics.clear().beginLinearGradientFill([this.params.colors[0][0],'rgba(81,231,255,0.1'],[0,0.5], 0, 0, 0, this.params.height);


	//for each peak
	for(var j=0, ln=this.peaks.length; j<ln; j++) {		

		var points = this.peaks[j].points;
		var lastSplashed = null, firstSplashed = null;

		//do NOT draw when there are no lip points
		if(points.length === 0) continue;

		//draw from the first point of the lip	
		this.lip_shape.graphics.moveTo(points[0].x,0);
		this.lip_thick.graphics.moveTo(points[0].x,0);
		this.lip_shadow.graphics.moveTo(points[0].x,0);

		if(points[0].cap) this.lip_cap.graphics.moveTo(points[0].x,0);

		//LOW PERF
		if(PERF==0) {
			for(var i=1,len=points.length; i<len -2; ++i){
				var pt = points[i],
					x = pt.x,
					y = (pt.splashed)? this.params.height : pt.y,
					thk = this.params.lip.thickness,
					yt = (pt.y - thk < 0)? 0 : pt.y - thk;			

				//draw shape line through all points of the lip
				this.lip_shape.graphics.lineTo(x,y);
				this.lip_thick.graphics.lineTo(x,yt);


				//save first and last splashed point for later use
				if(!firstSplashed && points[i].splashed) { firstSplashed = points[i];}
				if(!lastSplashed && points[len-2-i].splashed) { lastSplashed = points[len-1];}

				//draw cap
				if(pt.cap) this.lip_cap.graphics.lineTo(pt.x,pt.cap.y);

			}
		}
		//HIGH PERF
		else {		
			for(var i=1,len=points.length; i<len-2; ++i){

				//Draw lip
				var p1 = points[i],
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
				
				this.lip_shape.graphics.quadraticCurveTo(x1,y1,xc,yc);
				this.lip_thick.graphics.quadraticCurveTo(x1,y1t,xc,yct);
				this.lip_shadow.graphics.quadraticCurveTo(x1,y1*10,xc,yc*10);

				//save first and last spashed point for later use
				if(!firstSplashed && points[i].splashed) { firstSplashed = points[i];}
				if(!lastSplashed && points[len-2-i].splashed) {lastSplashed = points[len-1];}

				//draw cap
				if(p1.cap) this.lip_cap.graphics.lineTo(p1.x,p1.cap.y);

			}
		}
		//faire passer par l'avant dernier point
		this.lip_shape.graphics.quadraticCurveTo(points[i].x,points[i].y,points[i+1].x,points[i+1].y);	
		this.lip_thick.graphics.quadraticCurveTo(points[i].x,points[i].y,points[i+1].x,points[i+1].y);	
		this.lip_shadow.graphics.quadraticCurveTo(points[i].x,points[i].y,points[i+1].x,points[i+1].y);	


		if(points[i].cap) this.lip_cap.graphics.lineTo(points[i].x,points[i].cap.y);	
		//le dernier point
		this.lip_shape.graphics.lineTo(points[len-1].x,0);
		if(points[len-1].cap) this.lip_cap.graphics.lineTo(points[len-1].x,points[len-1].cap.y);
		
	}

	this.lip_shape.graphics.closePath();
	this.lip_shadow.graphics.closePath();
	this.lip_cap.graphics.closePath();
	this.lip_thick.graphics.closePath();

}


prototype.drawSplash = function () {
	
	if(this.breaked === false) return;


	this.splash_gfx.clear();

	for(let j=0,ln=this.splashs.length; j<ln; j++) {

		points = this.splashs[j].points;

		if(points.length === 0) continue;

		//var color = createjs.Graphics.getHSL(Math.random()*360,100,50);
		this.splash_gfx.beginFill('#FFF').beginStroke('rgba(0,0,0,0.2').setStrokeStyle(1);
		this.splash_gfx.moveTo(points[0].x, points[0].splash_y);
		//this.splash_gfx.moveTo(points[0].x - this.params.breaking.left.width, points[0].splash_y);
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
	var left = this.shoulder_left;
	var right = this.shoulder_right;
	
	//minor shoulder variations
	if(this.breaked === true && this.params.shoulder.left.slope === null) this.params.shoulder.left.slope = new Variation({min:-50,max:50});
	if(this.breaked === true && this.params.shoulder.right.slope === null) this.params.shoulder.right.slope = new Variation({min:-50,max:50});

	//draw the shape of the wave
	this.shape_mask.graphics
		.clear()
		.beginFill('#FFFFFF')
		.moveTo(left.x - this.params.shoulder.left.width - this.params.shoulder.left.marge, this.params.height)
		.bezierCurveTo(left.x - this.params.shoulder.left.width + this.params.shoulder.left.outer - this.params.shoulder.left.marge, this.params.height + this.params.shoulder.left.slope,left.x - this.params.shoulder.left.inner - this.params.shoulder.left.marge,0,left.x - this.params.shoulder.left.marge,0)
		.lineTo(right.x + this.params.shoulder.right.marge,0)
		.bezierCurveTo(right.x + this.params.shoulder.right.inner + this.params.shoulder.right.marge,0,right.x + this.params.shoulder.right.width + this.params.shoulder.right.marge - this.params.shoulder.right.outer,this.params.height + this.params.shoulder.right.slope,right.x + this.params.shoulder.right.width + this.params.shoulder.right.marge ,this.params.height)		
		.closePath()
		;

	//ajust position of the background image
	this.background_cont.x = - this.cont.x;
		//use the shape to mask the background image
	this.background_cont.mask = this.shape_mask;
		
}

prototype.drawDebug = function() {
return;
	var points = this.getAllPeaksPoints();
	//get only splashed point
	this.debug_points_cont.removeAllChildren();
	for(let j=0, ln=points.length; j<ln; j++) {
			
		let point = points[j];

		//DRAW LIP POINTS
		const lip = new createjs.Shape();
		let color = 'black';
		if(this.surfer.point_under.x === point.x) color = 'red';
		lip.graphics.beginFill(color).drawCircle(0,0,3);
		lip.alpha = 0.8;
		lip.x = point.x;
		lip.y = point.y;
		this.debug_points_cont.addChild(lip);

		//DRAW CAP POINTS
		const cap = new createjs.Shape();
		cap.graphics.beginFill('black').drawCircle(0,0,2);
		cap.alpha = 1;
		cap.x = point.x;
		cap.y = point.cap.y;
		this.debug_points_cont.addChild(cap);		

		//DRAW TOP FALL POINTS
		const top = new createjs.Shape();
		top.graphics.beginFill('red').drawCircle(0,0,1);
		top.alpha = 0.1;
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

}

prototype.drawBackground = function() {

	const colors = this.config.colors;
	this.background_gradient.graphics.clear();
	for(let i=0,ln=colors.length-1;i<ln;++i) {
		if(colors[i+1] === undefined) break;
		let color1 = colors[i];		
		let color2 = colors[i+1];		
		let y1 = this.params.height * color1[2] / 100;
		let y2 = this.params.height * color2[2] / 100;

		this.background_gradient.graphics
			.beginLinearGradientFill([color1[0],color2[0]],[0+color1[1],1-color2[1]],0,y1,0,y2)
			.drawRect(0,y1,STAGEWIDTH*2,y2);	
	}
	
	//shadow gradient background
	this.background_shadow.graphics.clear()
		.beginLinearGradientFill(['rgba(0,0,0,0.4)','rgba(0,0,0,0)'],[0,1],0,0,0,this.params.height)
		.drawRect(0,0,STAGEWIDTH*2,this.params.height);
}

prototype.initAnimateBackground = function() {

	this.background_riddle2 = new createjs.Bitmap(queue.getResult('wave_riddle'));
	this.background_riddle2.x = 0;
	this.background_riddle2.y = this.background_riddle1.image.height;
	this.background_riddle3 = new createjs.Bitmap(queue.getResult('wave_riddle'));
	this.background_riddle3.x = this.background_riddle1.image.width;
	this.background_riddle3.y = 0;
	this.background_riddle4 = new createjs.Bitmap(queue.getResult('wave_riddle'));
	this.background_riddle4.x = this.background_riddle4.image.width;
	this.background_riddle4.y = this.background_riddle4.image.height;

	this.background_riddles.addChild(this.background_riddle2,this.background_riddle3,this.background_riddle4);
}

prototype.animateBackground = function() {

	if(this.breaked === false) return;

	if(PERF === 0) return;
	
	//create all sub riddles if not created yet
	if(this.background_riddles.numChildren < 4) this.initAnimateBackground();

	const riddle1 = this.background_riddle1;
	const riddle2 = this.background_riddle2;
	const riddle3 = this.background_riddle3;
	const riddle4 = this.background_riddle4;
	const width  = riddle1.image.width;
	const height = riddle1.image.height;

	riddle1.y -= 4;
	riddle2.y -= 4;
	riddle3.y -= 4;
	riddle4.y -= 4;

	if(riddle1.y <= - riddle1.image.height) riddle1.y = riddle2.y + height;
	if(riddle2.y <= - riddle2.image.height) riddle2.y = riddle1.y + height;
	if(riddle3.y <= - riddle3.image.height) riddle3.y = riddle4.y + height;
	if(riddle4.y <= - riddle4.image.height) riddle4.y = riddle3.y + height;

	riddle1.x += this.movingX;
	riddle2.x += this.movingX;
	riddle3.x += this.movingX;
	riddle4.x += this.movingX;

	if(this.direction === LEFT) {
		if(riddle1.x >= STAGEWIDTH) {
			riddle1.x = riddle3.x - width;
		}
		if(riddle2.x >= STAGEWIDTH) {
			riddle2.x = riddle4.x - width;
		}
		if(riddle3.x >= STAGEWIDTH) {
			riddle3.x = riddle1.x - width;
		}
		if(riddle4.x >= STAGEWIDTH) {
			riddle4.x = riddle2.x - width;
		}
	}

	if(this.direction === RIGHT) {
		if(riddle1.x <= -STAGEWIDTH) {
			riddle1.x = riddle3.x + width;
		}
		if(riddle2.x <= -STAGEWIDTH) {
			riddle2.x = riddle4.x + width;
		}
		if(riddle3.x <= -STAGEWIDTH) {
			riddle3.x = riddle1.x + width;
		}
		if(riddle4.x <= -STAGEWIDTH) {
			riddle4.x = riddle2.x + width;
		}
	}

}

prototype.updateLeftShoulder = function(x) {

	if(this.shoulder_left === undefined) {
		this.shoulder_left = new createjs.Container();
		this.shoulder_left.alpha = 0;
		var point = new createjs.Shape();
		point.graphics.beginFill('yellow').drawCircle(0,0,10);
		this.shoulder_left.addChild(point);
		var mouse_cont = new createjs.Container();
		this.shoulder_left.addChild(mouse_cont);
		this.shoulder_left.mouse_cont = mouse_cont;
		this.shoulder_cont.addChild(this.shoulder_left);
		var shoulder = new createjs.Shape();
	}

	//do not update when breaking have not reached the shoulder
	if(x > this.shoulder_left.x) return;

	this.shoulder_left.x = x;

	if(DEBUG) this.shoulder_left.alpha = 0.2;
}

prototype.updateRightShoulder = function(x) {

	if(this.shoulder_right === undefined) {
		this.shoulder_right = new createjs.Container();
		this.shoulder_right.alpha = 0;
		var point = new createjs.Shape();
		point.graphics.beginFill('yellow').drawCircle(0,0,10);
		this.shoulder_right.addChild(point);
		var mouse_cont = new createjs.Container();
		this.shoulder_right.addChild(mouse_cont);
		this.shoulder_right.mouse_cont = mouse_cont;
		this.shoulder_cont.addChild(this.shoulder_right);
	}

	//do not update when breaking have not reached the shoulder
	if(x < this.shoulder_right.x) return;

	this.shoulder_right.x = x;

	if(DEBUG) this.shoulder_right.alpha = 0.2;
}

prototype.initVanishPoints = function(x) {

	var vanish = new createjs.Shape();
	vanish.graphics.beginFill('green').drawCircle(0,0,50);
	vanish.alpha = 0;
	vanish.x = x - 1;	
	this.vanishs_cont.addChild(vanish);
	this.vanish_left = vanish;

	var vanish = new createjs.Shape();
	vanish.graphics.beginFill('green').drawCircle(0,0,50);
	vanish.alpha = 0;
	vanish.x = x + 1;	
	this.vanishs_cont.addChild(vanish);
	this.vanish_right = vanish;

}
prototype.updateVanishPoints = function(pt) {	

	if(this.direction === LEFT) {
		var point = this.vanish_left;
		if(DEBUG) point.alpha = 0.2;
		if( pt.x > point.x) return;
		return point.x = pt.x;		
	}
	if(this.direction === RIGHT) {
		var point = this.vanish_right;
		if(DEBUG) point.alpha = 0.2;
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




//<-- end methods


//assign wave to window's scope & promote overriden container's methods from Wave object, allow them to be call by 'Container_methodName()'
window.Wave = createjs.promote(Wave,'Container');

}());