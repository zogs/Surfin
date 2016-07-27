(function() {

//create new class
function Wave(params) {

	this.Container_constructor();

	var defaults = {
		x: 0,
		y: 0,
		height: 100,
		width: 1500,
		peak_width: 200,
		breaking_yspeed: 1200,
		breaking_width_left: 20,
		breaking_width_right: 10,
		paddling_effort: 1,
		bottom_fall_scale: 1,
		top_fall_scale: 0.2,
		breaking_block_left_interval: 0,
		breaking_block_left_interval_max: 0,
		breaking_block_left_width:0,
		breaking_block_left_width_max:0,
		breaking_block_right_interval:0,
		breaking_block_right_interval_max:0,
		breaking_block_right_width:0,
		breaking_block_right_width_max:0,
		suction_x: 5,
		suction_y: 3,
		color_top: '#0b2648',
		color_bot: '#0d528c',
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
	this.width = this.config.width;
	this.origin_width = this.config.width;
	this.surfers = [];
	this.obstacles = [];
	this.breaking_points = [];
	this.breaking_peaks = [];
	this.peakpoints = [];
	this.tube_points = [];
	this.bottom_fall_points = [];
	this.top_fall_points = [];
	this.particles = [];
	this.debug_alpha = 0.1;
	this.shaking_force = 1.2;
	this.direction = 0;
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
	this.background = new createjs.Shape();
	this.background.graphics.beginLinearGradientFill([this.config.color_top,this.config.color_bot],[0,1],0,0,0,this.params.height).drawRect(0,0,STAGEWIDTH,this.params.height);	
	this.background_cont.addChild(this.background);	



	this.foreground_cont = new createjs.Container();
	this.cont.addChild(this.foreground_cont);
	
		//particule cont
		this.particles_cont = new createjs.Container();
		this.foreground_cont.addChild(this.particles_cont);
		//surfer trails cont
		this.trail_cont = new createjs.Container();
		this.foreground_cont.addChild(this.trail_cont);	
		//spatter cont
		this.spatter_cont = new createjs.Container();
		this.foreground_cont.addChild(this.spatter_cont);		
		//surfer cont
		this.surfer_cont = new createjs.Container();
		this.foreground_cont.addChild(this.surfer_cont);
		//obstacle cont
		this.obstacle_cont = new createjs.Container();
		this.foreground_cont.addChild(this.obstacle_cont);
		//lib cont
		this.lip = new createjs.Container();
		this.foreground_cont.addChild(this.lip);
		//splash cont
		this.froth_cont = new createjs.Container();
		this.foreground_cont.addChild(this.froth_cont);
		//splash particles cont
		this.splash_cont = new createjs.Container();
		this.foreground_cont.addChild(this.splash_cont);
		//debug
		this.debug_cont = new createjs.Container();
		this.debug_cont.alpha = this.debug_alpha;
		this.foreground_cont.addChild(this.debug_cont);
			//lip of the wave
			this.lip_cont = new createjs.Container();
			this.debug_cont.addChild(this.lip_cont);
			//tube points
			this.tube_points_cont = new createjs.Container();
			this.debug_cont.addChild(this.tube_points_cont);
			//top wave points
			this.top_points_cont = new createjs.Container();
			this.debug_cont.addChild(this.top_points_cont);
			//bottom wave points
			this.bottom_points_cont = new createjs.Container();
			this.debug_cont.addChild(this.bottom_points_cont);
			//vanish points container
			this.vanishs_cont = new createjs.Container();
			this.debug_cont.addChild(this.vanishs_cont);
			//shoulder points containr
			this.shoulder_cont = new createjs.Container();
			this.debug_cont.addChild(this.shoulder_cont);

		//clicking the wave
		//this.on('click',this.onTakeoffClick);	

		//Ticker
		this.addEventListener('tick',proxy(this.tick,this));		

		this.initWave(STAGEWIDTH/2);
		
		this.resize();

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
		if(this.played == true) {
			var e = new createjs.Event("played_wave_on_spot");
			e.wave = this;
			stage.dispatchEvent(e);			
		}
		else {
			var e = new createjs.Event("non_played_wave_on_spot");
			e.wave = this;
			//stage.dispatchEvent(e);		
		}

		this.alpha -= 0.01;

		return;
	}

	if(this.y > this.spot.getPeak()) {

		if(this.breaked == false) {
			this.initBreak(STAGEWIDTH/2);			
		}	
	
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
	var w = this.origin_width * coef;
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
	for(var i=0,len=this.surfers.length;i<len;i++) {
		this.surfers[i].resize();
	}

	//resize lip
	/*if(this.breaked == true) {
		for(var i=0,len=this.peakpoints[0].length;i<len;i++) {
			if(this.peakpoints[0][i].splashed != undefined) {
				this.peakpoints[0][i].y = this.params.height;
			}
		}		
	}*/
	//resize background
	this.drawBackground(h);	

}

prototype.initWave = function(center) {

	if(this.breaked == true) return;

	//init the vanish points
	this.initVanishPoints(center);

	//add first breaking points
	this.updateLeftShoulder(STAGEWIDTH/2 - this.width/2);
	this.updateRightShoulder(STAGEWIDTH/2 + this.width/2);

}

prototype.initBreak = function(center) {		

	if(this.breaked == true) return;

	//set status of the wave
	this.status = 'run';
	this.breaked = true;

	//set wave breaking center
	this.params.breaking_center = center;

	this.addPeak(center,200);
	//this.addPeak(1100,100);

	//init timer continuous breaking
	this.breaking();

	//init points cleaner
	this.initCleanOffScreenPoints();

	//init intervals
	this.initBreakedIntervals();
}

prototype.initBreakedIntervals = function() {

	//Breaking block interval
	if(this.config.breaking_block_left_interval !== 0) {

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

prototype.tick = function() {

	this.breaking();
	this.drawLip();
	this.drawSplash();
	this.moveWave();
	this.drawBkg();
	this.moveParticles();
		
}

prototype.moveParticles = function() {

	if(this.particles.length == 0) return;

	var particles = [];
	for(var i=0, len=this.particles.length; i < len; i++) {
		var particle = this.particles[i];

		//gravity
		particle.applyForce(vec2.fromValues(0,1));
		//wind
		particle.applyForce(vec2.fromValues(1*this.direction,0));
		//move
		particle.move();

		if(particle.alpha<=0 || particle.y + 20 >= this.params.height) {
			this.particles_cont.removeChild(particle);
			continue;			
		}

		particles[particles.length] = particle;				
	}

	this.particles = particles;
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
	var amplitude = this.width/2/dist*this.shaking_force;
	if(amplitude<1) amplitude = 0;
	
	this.shake_x = Math.floor(Math.random()*amplitude*2 - amplitude);
	this.shake_y = Math.floor(Math.random()*amplitude*2 - amplitude);
	createjs.Tween.get(this.lip)
		.to({x:this.lip.x+this.shake_x,y:this.lip.y+this.shake_y},50)
		.call(proxy(this.unshake,this));
}

prototype.unshake = function() {

	createjs.Tween.get(this.lip)
		.to({x:this.lip.x-this.shake_x,y:this.lip.y-this.shake_y},50)
		.call(proxy(this.shake,this));
}


prototype.addTubePoint = function(point) {

	var tube = new createjs.Shape();
		tube.graphics.beginFill('green').drawCircle(0,0,this.params.height>>1);
		tube.size = this.params.height>>1;
		tube.x = point.x;
		tube.y = this.params.height >> 1; // divide by 2
		this.tube_points.unshift(tube);
		
		if(DEBUG) this.tube_points_cont.addChild(tube);
	
	createjs.Tween.get(tube)
		.to({},1000,createjs.quartIn)
		.call(proxy(this.removeTubeDebugPoint,this,[point]))		
		;
}


prototype.addTopFallPoint = function(pt) {

	var point = new createjs.Shape();
		point.graphics.beginFill('red').drawCircle(0,0,1);
		point.size = 0;
		if(this.direction == 0) point.x = pt.x;
		//slightly move the points to free lip's shoulder
		if(this.direction == 1) point.x = pt.x + this.params.breaking_width_left*10;
		if(this.direction == -1) point.x = pt.x - this.params.breaking_width_right*10;

		this.top_fall_points.unshift(point);
		
		if(DEBUG) this.top_points_cont.addChild(point);

	var scale = this.params.height * this.params.top_fall_scale;

	createjs.Tween.get(point)
		.to({scaleX:scale,scaleY:scale,size:scale},2000,createjs.quartIn)
		.call(proxy(this.removeTopDebugPoint,this,[point]))		
		;
}

prototype.addBottomFallPoint = function(pt) {

	var point = new createjs.Shape();
		point.graphics.beginFill('red').drawCircle(0,0,1);
		point.y = this.params.height;
		point.x = pt.x;
		point.size = 0;

		this.bottom_fall_points.unshift(point);
		
		if(DEBUG) this.bottom_points_cont.addChild(point);

	var scale = this.params.height * this.params.bottom_fall_scale;

	createjs.Tween.get(point)
		.to({scaleX:scale,scaleY:scale,size:scale},1800,createjs.quartIn)
		.call(proxy(this.removeBottomDebugPoint,this,[point]))
		;
}

prototype.removeTubeDebugPoint = function(point) {
	this.tube_points_cont.removeChild(point);	
	this.tube_points.splice(-1,1);
}
prototype.removeTopDebugPoint = function(point) {
	this.top_points_cont.removeChild(point);	
	this.top_fall_points.splice(-1,1);
}
prototype.removeBottomDebugPoint = function(point) {
	this.bottom_points_cont.removeChild(point);	
	this.bottom_fall_points.splice(-1,1);
}

prototype.drawBackground = function() {
					
	this.background.scaleY = this.params.height / this.origin_height;		
}


prototype.addTestSurfer = function(x) {

	var surfer = new Surfer({x:x,y:0,wave:this,spot:this.spot});
	surfer.takeOff(x,0);
	this.surfer = surfer;
	this.surfer_cont.addChild(surfer);
	this.surfers.push(surfer);
}

prototype.addSurfer = function(surfer) {

	surfer.takeOff(surfer.x,surfer.y);
	this.surfer_cont.addChild(this.surfer);
	this.surfers.push(surfer);
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


prototype.breaking = function() {

	//cancel if wave is paused
	if(this.paused === true) return;

	//cancel if wave is not breaked
	if(this.breaked === false) return;
	
	//merging colliding peaks
	for(var i=0,len=this.peakpoints.length; i<len; i++) {
		if(len==1) break;
		var first = this.peakpoints[i];		
		var second = this.peakpoints[i+1];
		if(second === undefined) break;

		if(first[first.length-1].x >= ( second[0].x - this.params.breaking_width_left)) {
			first.splice(first.length-1,1);
			var merged = first.concat(second);
			this.peakpoints[i] = merged;
			this.peakpoints.splice(i+1,1);
		}
	}

	//add breakings points to existing peak
	for(var i=0,len=this.peakpoints.length; i<len; i++) {

		var peak = this.peakpoints[i];

		//add left point
		var x = peak[0].x - this.params.breaking_width_left;
		var point = this.createBreakingPoint({x:x, color:'red'});
		peak.unshift(point);
		this.addTopFallPoint(point);
		this.updateLeftShoulder(x);		

		//add right point		
		var x = peak[peak.length-1].x + this.params.breaking_width_right;
		var point = this.createBreakingPoint({x:x, color:'red'});
		peak.push(point);
		this.addTopFallPoint(point);
		this.updateRightShoulder(x);


		this.peakpoints[i] = peak;

	}

}

prototype.addPeak = function(center,width) {

	var points = [];
	var point = this.createBreakingPoint({x:center, color:'red',delay:0});
	points.push(point);
	var point = this.createBreakingPoint({x:center + width/2});
	points.push(point);
	var point = this.createBreakingPoint({x:center - width/2});
	points.unshift(point);

	this.peakpoints.push(points);
}

prototype.addRightPeak = function(center,width) {

	this.addPeak(center,width);
}

prototype.addLeftPeak = function(center,width) {

	var points = [];
	var point = this.createBreakingPoint({x:center, color:'red',delay:0});
	points.push(point);
	var point = this.createBreakingPoint({x:center + width/2});
	points.push(point);
	var point = this.createBreakingPoint({x:center - width/2});
	points.unshift(point);

	this.peakpoints.unshift(points);
}

prototype.createBreakingPoint = function(params) {

	var params = params === undefined ? {} : params;
	var delay = params.delay === undefined ? 0 : params.delay;
	var color = params.color === undefined ? 'white' : params.color;
	var x = params.x === undefined ? 0 : params.x;
	
	var point = new createjs.Container();
	point.x = x;
	var shape = new createjs.Shape();
	shape.graphics.beginFill(color).drawCircle(0,0,5);
	
	point.addChild(shape);

	if(DEBUG) this.debug_cont.addChild(point);

	
	var tween = createjs.Tween.get(point)
			.wait(delay)
			.to(
				{y:this.params.height},
				this.params.breaking_yspeed + Math.random()*50,
				//createjs.Ease.getPowIn(5)
				createjs.Ease.quartIn
				)
			.call(proxy(this.splashPointReached,this,[point]));

	point.tween = tween;
	
	return point;
}

prototype.splashPointReached = function(point) {

	point.splashed = true;

	//draw splash
	this.initSplashPoint(point);

	//draw fall shape
	this.addBottomFallPoint(point);

	//draw tube points
	this.addTubePoint(point);
	
	//set direction
	if(this.direction==0) {
		this.setDirection();
		//this.startShaking();
		
		//init breaked intervals
		if(this.isPlayed) {
			this.initPlayedIntervals();
		}

	}

}


prototype.initSplashPoint = function(point) {

	var splash = new createjs.Container();
	splash.x = point.x;
	splash.y = point.y;
	point.splash = splash;		
	this.splash_cont.addChild(splash);

	if(DEBUG) {
		var circle = new createjs.Shape();
			circle.graphics.beginFill('black').drawCircle(0,0,5);
			splash.addChild(circle);			
	}

	var bounce;
	if(this.isPlayed()) bounce = (this.params.height + (Math.random()*this.params.height/3));
	else bounce = (this.params.height + Math.random()*this.params.height/4);

	var tween = createjs.Tween.get(splash)
		.to({y: splash.y - bounce},1000)
		.call(proxy(this.updateVanishPoints,this,[point.x]))
		.to({y: splash.y -bounce/2},2500,createjs.Ease.easeOutSine)

	//tween.addEventListener('change',proxy(this.splashParticles,this,[point]));
	//
	//
	if(this.isPlayed()) {
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
		splash.addChild(emitter);		
	}
}

prototype.initBreakingBlockLeftInterval = function() {

	var t = this.config.breaking_block_left_interval + Math.random()*(this.config.breaking_block_left_interval_max - this.config.breaking_block_left_interval);
	var w = this.config.breaking_block_left_width + Math.random()*(this.config.breaking_block_left_width_max - this.config.breaking_block_left_width);

	window.setTimeout(proxy(this.continueBreakingBlockLeftInterval,this),t);
}

prototype.continueBreakingBlockLeftInterval = function() {

	var t = this.config.breaking_block_left_interval + Math.random()*(this.config.breaking_block_left_interval_max - this.config.breaking_block_left_interval);
	var w = this.config.breaking_block_left_width + Math.random()*(this.config.breaking_block_left_width_max - this.config.breaking_block_left_width);

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

	if(this.direction==0) return;
	if(this.direction==1){
		this.initBlockBreakingRight(width);
	}
	if(this.direction==-1){
		this.initBlockBreakingLeft(width);
	}
}

prototype.initBlockBreakingLeft = function(width) {
	if(this.breaked == false) return;

	var peak = this.peakpoints[0];
	while( width > 0 ) {
		var x = peak[0].x - this.params.breaking_width_left;
		var point = this.createBreakingPoint({x:x, color:'green'});
		peak.unshift(point);
		width = width - this.params.breaking_width_left;
	}		
	this.peakpoints[0] = peak;
}

prototype.initBlockBreakingRight = function(width) {
	if(this.breaked == false) return;

	var peak = this.peakpoints[this.peakpoints.length-1];
	while( width > 0) {
		var x = peak[peak.length-1].x + this.params.breaking_width_right;	
		var point = this.createBreakingPoint({x:x, color:'green'});
		peak.push(point);
		width = width - this.params.breaking_width_right;
	}
	this.peakpoints[this.peakpoints.length-1] = peak;
}

prototype.setDirection = function() {

	//if no surfers, wave is staying straight
	if(this.surfers.length == 0) return this.direction = 0;

	//else set direction
	if(this.surfer.x > this.params.breaking_center) {
		this.direction = -1;	
		//console.log('Wave is a right !');
	} 
	else {
		this.direction = 1;
		//console.log('Wave is a left !');
	}

	//invert suction direction for left waves
	if(this.direction === 1) this.params.suction = vec2.fromValues(this.params.suction_x*-1,- this.params.suction_y);	
	if(this.direction === -1) this.params.suction = vec2.fromValues(this.params.suction_x,- this.params.suction_y);	
	
}

prototype.moveWave = function() {

	if(this.surfer == undefined) return;
	if(this.breaked == false) return;
	if(this.surfer.riding == false) return;
	if(this.direction === 0) return;

	//var coef = 1 - ((100*this.y/SPOT.peak_point) / 100);	
	var surfer_pos = this.cont.localToGlobal(this.surfer.x,0);
	var delta = (STAGEWIDTH>>1) - surfer_pos.x;

	if(this.direction == 1) {
		delta += 200;
		this.movingX = delta/this.params.breaking_width_left;
	}
	if(this.direction == -1) {
		delta += -200;
		this.movingX = delta/this.params.breaking_width_right;
	}

	this.cont.x += this.movingX;	
}

prototype.oldmoveWave = function() {
	if(this.breaked == false) return;
	if(this.direction == 0) return;
	if(this.direction == 1) {
		//get vanish point x
		var pt = this.cont.localToGlobal(this.vanish_left.x,0);
		//calcul lateral movement from y position
		var coef = ( 100*this.y/ this.spot.getPeak()) / 100;
		var xwidth = this.params.breaking_width_left * 1/coef;
		//move wave normally when well positioned
		if(pt.x >= (STAGEWIDTH-100)) this.cont.x += xwidth;
		//else move quicker
		else this.cont.x += xwidth *2;
	}
	if(this.direction == -1) {
		//get vanish point x
		var pt = this.cont.localToGlobal(this.vanish_right.x,0);
		//calcul lateral movement from y position
		var coef = ( 100*this.y/ this.spot.getPeak()) / 100;
		var xwidth = this.params.breaking_width_right * 1/coef;
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

prototype.initCleanOffScreenPoints = function() {

	this.clearnerInterval = window.setInterval(proxy(this.cleanOffScreenPoints,this),1000);
}

prototype.cleanOffScreenPoints = function() {

	
	var offset = STAGEWIDTH >> 1; //divice by 2
	var peak = [];

	//remove when wave is a right
	if(this.direction === 1) {
		var points = this.peakpoints[this.peakpoints.length-1];
		for(var i=0,len=points.length; i<len; i++) {
			var point = points[i];
			var x = this.lip_cont.localToGlobal(point.x,point.y).x;
			if(x > this.width + offset) {
				this.splash_cont.removeChild(point.splash);
				this.lip_cont.removeChild(point);
				points[i] = point = null;
				this.cleanedRight = true;
				continue;
			}
			peak[peak.length] = point;
		}
		this.peakpoints[this.peakpoints.length-1] = peak;
	}

	//remove when wave is a left
	if(this.direction === -1) {
		var points = this.peakpoints[0];
		for(var i=0,len=points.length; i<len; i++) {
			var point = points[i];
			var x = this.lip_cont.localToGlobal(point.x,point.y).x;
			if(x < -offset) {
				this.splash_cont.removeChild(point.splash);
				this.lip_cont.removeChild(point);
				points[i] = point = null;
				this.cleanedLeft = true;
				continue;
			}
			peak[peak.length] = point;
		}
		this.peakpoints[0] = peak;
	}

}

prototype.drawSplash = function () {

	if(this.breaked == false) return;

	var shape = new createjs.Shape();
	shape.mouseEnabled = false;
	var k = shape.graphics;
	

	//get peaks
	var peaks = [];
	for(var i=0, len=this.peakpoints.length; i<len; i++) {
		peaks[peaks.length] = this.peakpoints[i];
	}
	//get only splashed point
	for(var j=0, ln=peaks.length; j<ln; j++) {

		var peak = peaks[j];
		var splashed = [];
		for(var i=0, len = peak.length; i<len; i++) {
			if(peak[i].splashed === true) {
				splashed[splashed.length] = peak[i];
			}
		}
		peaks[j] = splashed;
	}

	for(var j=0, ln=peaks.length; j<ln; j++) {

		points = peaks[j];


		if(points.length==0) continue;

		k.moveTo(points[0].splash.x - this.params.breaking_width_left, points[0].y);
		k.beginFill('#FFF').beginStroke('rgba(0,0,0,0.2').setStrokeStyle(1);
		k.lineTo(points[0].splash.x,points[0].y);

		for(var i=1,len=points.length; i<len - 2; i++) {
			var xc = ( points[i].splash.x + points[i+1].splash.x) >> 1; // divide by 2
			var yc = ( points[i].splash.y + points[i+1].splash.y) >> 1; // divide by 2
			k.quadraticCurveTo(points[i].splash.x,points[i].splash.y,xc,yc);
		}
		
		k.lineTo(points[len-1].splash.x, points[len-1].y);

		if(this.cleanedRight && this.direction===1) k.lineTo(points[len-1].splash.x,this.params.height);
		if(this.cleanedLeft && this.direction===-1) k.lineTo(points[0].splash.x,this.params.height);
	}


	this.froth_cont.removeAllChildren();
	this.froth_cont.addChild(shape);

}

prototype.drawLip = function() {

	//return if not breked yet
	if(this.breaked == false) return;

	var shape = new createjs.Shape();
	shape.mouseEnabled = false;
	shape.graphics.beginFill('rgba(255,255,255,0.5)').beginStroke('rgba(0,0,0,0.3').setStrokeStyle(1);
	var shadow = new createjs.Shape();
	shadow.mouseEnabled = false;
	shadow.graphics.beginLinearGradientFill(["rgba(0,0,0,0.2)","rgba(0,0,0,0)"], [0, 1], 0, 0, 0, this.params.height);
	//shape.alpha = 0.5;

	//get peaks
	var peaks = [];
	for(var i=0, len=this.peakpoints.length; i<len; i++) {
		peaks[peaks.length] = this.peakpoints[i];
	}

	//for each peak
	for(var j=0, ln=peaks.length; j<ln; j++) {
		
		var points = peaks[j];
		var lastSplashed = null, firstSplashed = null;

		//draw a lip 		
		shape.graphics.moveTo(points[0].x,0);
		for(var i=1,len=points.length; i<len -2; i++){
				var xc = ( points[i].x + points[i+1].x) >> 1; // divide by 2
				var yc = ( points[i].y + points[i+1].y) >> 1; // divide by 2
				shape.graphics.quadraticCurveTo(points[i].x,points[i].y,xc,yc);

				//save first and last spashed point for later use
				if(!firstSplashed && points[i].splashed) {
					firstSplashed = points[i];
				}
				if(!lastSplashed && points[len-2-i].splashed) {
					lastSplashed = points[len-1];
				}
		}

		//faire passer par l'avant dernier point
		shape.graphics.quadraticCurveTo(points[i].x,points[i].y,points[i+1].x,points[i+1].y);		
		//le dernier point
		shape.graphics.lineTo(points[len-1].x,0);

		//draw a shadow
		if(firstSplashed && lastSplashed) {
			shadow.graphics.moveTo(points[0].x,points[0].y);
			shadow.graphics.bezierCurveTo((firstSplashed.x+points[0].x)/2,0,(firstSplashed.x+points[0].x)/2,this.params.height,firstSplashed.x,firstSplashed.y)
			shadow.graphics.lineTo(lastSplashed.x,lastSplashed.y);
			shadow.graphics.bezierCurveTo((lastSplashed.x+points[len-1].x)/2,this.params.height,(lastSplashed.x+points[len-1].x)/2,0,points[len-1].x,points[len-1].y)
			shadow.graphics.lineTo(points[0].x,points[0].y);			
		}
		
	}

	shape.graphics.closePath();
	shadow.graphics.closePath();

	//copy lip to make an effect of thickness
	var thickness = shape.clone(true);
	thickness.y = -10;

	this.lip.removeAllChildren();
	this.lip.addChild(shadow);
	this.lip.addChild(shape);
	this.lip.addChild(thickness);

	this.lip.mask = this.shape_mask;
}

prototype.addBreakingPeak = function(width,distance) {
	
	if(this.direction==1) {
		var peak = this.peakpoints[0];
		var x = peak[0].x - distance;
		this.addLeftPeak(x, width);
	}
	if(this.direction==-1) {
		var peak = this.peakpoints[this.peakpoints.length - 1];
		var x = peak[peak.length-1].x + distance;	
		this.addRightPeak(x, width);
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
	if(this.breaked == false) return;
	var rand = Math.ceil(Math.random()*100);
	var pc = 0;
	for(var obs in this.config.obstacles) {
		var pc = pc + this.config.obstacles[obs].percentage;
		if(rand <= pc) {
			if(obs == 'paddler') this.addPaddler();
			else if(obs == 'photograph') this.addPhotograph();
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
	if(this.breaked == false) return;
	if(obs == undefined) var obs = new Obstacle({wave: this});	
	this.obstacles.push(obs);
	this.obstacle_cont.addChild(obs);
}

prototype.removeObstacle = function(obs) {
	obs.removeListeners();
	this.obstacles.splice(this.obstacles.indexOf(obs),1);
	this.obstacle_cont.removeChild(obs);
}

prototype.drawBkg = function() {

	//get shoulders positions
	var left = this.shoulder_left;
	var right = this.shoulder_right;
	
	//minor shoulder variations
	if(this.breaked == true && this.params.shoulder.left.slope == null) this.params.shoulder.left.slope = new Variation({min:-50,max:50});
	if(this.breaked == true && this.params.shoulder.right.slope == null) this.params.shoulder.right.slope = new Variation({min:-50,max:50});

	//draw shape mask beetween the two shoulder
	this.shape_mask = new createjs.Shape();
	this.shape_mask.graphics
		.beginFill('#FFFFFF')
		.moveTo(left.x - this.params.shoulder.left.width - this.params.shoulder.left.marge, this.params.height)
		.bezierCurveTo(left.x - this.params.shoulder.left.width + this.params.shoulder.left.outer - this.params.shoulder.left.marge, this.params.height + this.params.shoulder.left.slope,left.x - this.params.shoulder.left.inner - this.params.shoulder.left.marge,0,left.x - this.params.shoulder.left.marge,0)
		.lineTo(right.x + this.params.shoulder.right.marge,0)
		.bezierCurveTo(right.x + this.params.shoulder.right.inner + this.params.shoulder.right.marge,0,right.x + this.params.shoulder.right.width + this.params.shoulder.right.marge - this.params.shoulder.right.outer,this.params.height + this.params.shoulder.right.slope,right.x + this.params.shoulder.right.width + this.params.shoulder.right.marge ,this.params.height)		
		;

	//ajust position of the background image
	this.background.x = - this.cont.x,
	//use the shape to mask the background image
	this.background.mask = this.shape_mask;
		
}

prototype.updateLeftShoulder = function(x) {

	if(this.shoulder_left == undefined) {
		var shoulder = new createjs.Shape();
		shoulder.graphics.beginFill('yellow').drawCircle(0,0,10);
		shoulder.alpha = 0;
		this.shoulder_cont.addChild(shoulder);
		this.shoulder_left = shoulder;
	}

	//do not update when breaking have not reached the shoulder
	if(x > this.shoulder_left.x) return;

	this.shoulder_left.x = x;

	if(DEBUG) this.shoulder_left.alpha = 1;
}

prototype.updateRightShoulder = function(x) {

	if(this.shoulder_right == undefined) {
		var shoulder = new createjs.Shape();
		shoulder.graphics.beginFill('yellow').drawCircle(0,0,10);
		shoulder.alpha = 0;
		this.shoulder_cont.addChild(shoulder);
		this.shoulder_right = shoulder;
	}

	//do not update when breaking have not reached the shoulder
	if(x < this.shoulder_right.x) return;

	this.shoulder_right.x = x;

	if(DEBUG) this.shoulder_right.alpha = 1;
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
prototype.updateVanishPoints = function(x) {	

	if(this.direction == 1) {
		var point = this.vanish_left;
		if(DEBUG) point.alpha = 1;
		if(x > point.x) return;
		return point.x = x;		
	}
	if(this.direction == -1) {
		var point = this.vanish_right;
		if(DEBUG) point.alpha = 1;
		if( x < point.x ) return;
		return point.x = x;		
	}
}
prototype.getLeftVanishPoint = function() {
	return this.vanish_left;
}
prototype.getRightVanishPoint = function() {
	return this.vanish_right;
}
prototype.getVanishPoint = function() {
	if(this.direction == 1) return this.vanish_left;
	if(this.direction == -1) return this.vanish_right;
	return this.vanish_left;
}
prototype.isPlayed = function() {
	return this.played || false;
}
prototype.isSurfed = function() {
	return this.surfed || false;
}
//<-- end methods


//assign wave to window's scope & promote overriden container's methods from Wave object, allow them to be call by 'Container_methodName()'
window.Wave = createjs.promote(Wave,'Container');

}());