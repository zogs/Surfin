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
		breaking_xspeed: 50,
		breaking_yspeed: 1200,
		breaking_width: 20,
		breaking_center: 1000,
		suction: vec2.fromValues(-5,-5),
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
		}
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

	//set config
	this.config = params;
	this.params = (JSON.parse(JSON.stringify(this.config))); //clone object
	//set properties
	this.y = params.y;	
	this.origin_height = params.height;
	this.width = params.width;
	this.origin_width = params.width;
	this.surfers = [];
	this.obstacles = [];
	this.breaking_points = [];
	this.breaking_peaks = [];
	this.breakpoints = [];
	this.tube_points = [];
	this.bottom_fall_points = [];
	this.top_fall_points = [];
	this.particles = [];
	this.bottom_fall_scale = 1;
	this.top_fall_scale = 0.2;
	this.debug_alpha = 0;
	this.shaking_force = 1.2;
	this.direction = 0;

	//this.direction = 0;
	this.breaked = false;
	this.status = '';
	this.paused = false;
	
	//wave cont
	this.cont = new createjs.Container();
	this.cont.x = params.x;
	this.addChild(this.cont);	

	//wave background
	this.background_cont = new createjs.Container();
	this.cont.addChild(this.background_cont);
	this.background = new createjs.Shape();
	this.background.graphics.beginLinearGradientFill(['#0b2648','#0d528c'],[0,1],0,0,0,this.params.height).drawRect(0,0,STAGEWIDTH,this.params.height);	
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
		this.on('click',this.onTakeoffClick);	

		//Ticker
		this.addEventListener('tick',proxy(this.tick,this));

		this.initWave(STAGEWIDTH/2);
		
		this.resize();

}


prototype.resize = function() {

	var horizon = SPOT.getHorizon();
	var peak = SPOT.getPeak();

	if(this.y > peak ) {

		if(this.breaked == false) {
			this.initBreak(Math.random()*500+250);			
		}		

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

		//early return
		//return;
	}

	//calcul the proportion	
	var coef = (this.y  - horizon) / (peak - horizon);
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
	//resize background

	this.drawBackground(h);
	//resize surfer if	
	if(this.surfer != undefined) {

		this.surfer.resize();
	}
	

	

}

prototype.initWave = function(center) {

	if(this.breaked == true) return;

	//set wave breaking center
	this.params.breaking_center = center;

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

	this.addPeak(center,200);
	//this.addPeak(1100,100);

	//init timer continuous breaking
	this.breaking();

	//continuous breaking
	var _this = this;
	this.breakingInterval = setInterval(function() { _this.breaking(); }, _this.params.breaking_xspeed, this);

	//init points cleaner
	this.initCleanOffScreenPoints();
}


prototype.onTakeoffClick = function(evt) {

	var wave = evt.currentTarget;
	var x = evt.stageX;	

	wave.initBreak(x);
	wave.addSurfer(x);

	wave.surfed = true;
	wave.played = true;

	var e = new createjs.Event("player_take_off");
		e.wave = this;
		e.surfer = this.surfer;
		stage.dispatchEvent(e);

	//remove click event
	evt.remove();
	//add new click event to jump ollie
	this.on('click',proxy(this.surfer.ollie,this.surfer));
}

prototype.tick = function() {

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
		tube.graphics.beginFill('green').drawCircle(0,0,this.params.height/2);
		tube.x = point.x;
		tube.y = this.params.height >> 1; // divide by 2
		this.tube_points.unshift(tube);
		this.tube_points_cont.addChild(tube);
	
	createjs.Tween.get(tube)
		.to({},1000,createjs.quartIn)
		.call(proxy(this.removeTubeDebugPoint,this))		
		;
}


prototype.addTopFallPoint = function(x) {

	var point = new createjs.Shape();
		point.graphics.beginFill('red').drawCircle(0,0,1);
		//slightly move the points to free lip's shoulder
		var d = this.params.breaking_width*10;
		if(this.direction == 0) point.x = x;
		if(this.direction == 1) point.x = x + d;
		if(this.direction == -1) point.x = x - d;

		this.top_fall_points.unshift(point);
		this.top_points_cont.addChild(point);

	var scale = this.params.height * this.top_fall_scale;

	createjs.Tween.get(point)
		.to({scaleX:scale,scaleY:scale},2000,createjs.quartIn)
		.call(proxy(this.removeTopDebugPoint,this))		
		;
}

prototype.addBottomFallPoint = function(pt) {

	var point = new createjs.Shape();
		point.graphics.beginFill('red').drawCircle(0,0,1);
		point.y = this.params.height;
		point.x = pt.x;

		this.bottom_fall_points.unshift(point);
		this.bottom_points_cont.addChild(point);

	var scale = this.params.height * this.bottom_fall_scale;

	createjs.Tween.get(point)
		.to({scaleX:scale,scaleY:scale},2000,createjs.quartIn)
		.call(proxy(this.removeBottomDebugPoint,this))
		;
}

prototype.removeTubeDebugPoint = function() {
	this.tube_points_cont.removeChildAt(0);	
	this.tube_points.splice(-1,1);
}
prototype.removeTopDebugPoint = function() {
	this.top_points_cont.removeChildAt(0);	
	this.top_fall_points.splice(-1,1);
}
prototype.removeBottomDebugPoint = function() {
	this.bottom_points_cont.removeChildAt(0);	
	this.bottom_fall_points.splice(-1,1);
}

prototype.drawBackground = function() {
					
	this.background.scaleY = this.params.height / this.origin_height;		
}


prototype.addSurfer = function(x) {

	prototype.surfer = new Surfer();
	prototype.surfer.setWave(this).takeOff(x,0);
	this.surfer_cont.addChild(this.surfer);
	this.surfers.push(prototype.surfer);
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

	//return if wave is paused
	if(this.paused == true) return;
	
	//merging colliding peaks
	for(var i=0,len=this.breakpoints.length; i<len; i++) {
		if(len==1) break;
		var first = this.breakpoints[i];		
		var second = this.breakpoints[i+1];
		if(second === undefined) break;

		if(first[first.length-1].x >= ( second[0].x - this.params.breaking_width)) {
			first.splice(first.length-1,1);
			var merged = first.concat(second);
			this.breakpoints[i] = merged;
			this.breakpoints.splice(i+1,1);
		}
	}

	//add breakings points to existing peak
	for(var i=0,len=this.breakpoints.length; i<len; i++) {

		var peak = this.breakpoints[i];

		//add left point
		var x = peak[0].x - this.params.breaking_width;
		var point = this.createBreakingPoint({x:x, color:'red'});
		peak.unshift(point);
		this.updateLeftShoulder(x);

		//add right point		
		var x = peak[peak.length-1].x + this.params.breaking_width;
		var point = this.createBreakingPoint({x:x, color:'red'});
		peak.push(point);
		this.updateLeftShoulder(x);


		this.breakpoints[i] = peak;

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

	this.breakpoints.push(points);
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

	this.breakpoints.unshift(points);
}

prototype.createBreakingPoint = function(params) {

	var params = params === undefined ? {} : params;
	var delay = params.delay === undefined ? this.params.breaking_xspeed : params.delay;
	var color = params.color === undefined ? 'red' : params.color;
	var x = params.x === undefined ? 0 : params.x;
	
	var point = new createjs.Container();
	point.x = x;
	var shape = new createjs.Shape();
	shape.graphics.beginFill(color).drawCircle(0,0,5);
	point.addChild(shape);

	this.debug_cont.addChild(point);

	createjs.Tween.get(point)
			.wait(delay)
			.to(
				{y:this.params.height},
				this.params.breaking_yspeed + Math.random()*50,
				//createjs.Ease.getPowIn(5)
				createjs.Ease.quartIn
				)
			.call(proxy(this.splashPointReached,this,[point]));


	
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
	}

}


prototype.initSplashPoint = function(point) {

	var splash = new createjs.Shape();
		splash.graphics.beginFill('black').drawCircle(0,0,5);
		point.splash = splash;
		point.addChild(splash);

	var bounce = this.params.height + (Math.random()*this.params.height /3);

	var tween = createjs.Tween.get(splash)
		.to({y: -bounce},1000)
		.call(proxy(this.updateVanishPoints,this,[point.x]))
		.to({y:-bounce/2},2500,createjs.Ease.easeOutSine)
		;
	tween.addEventListener('change',proxy(this.splashParticles,this,[point]));
}

prototype.splashParticles = function(point) {

	if(Math.random()*10 >= 4) return;

	var emitter = new ParticleEmitter({
			position: vec2.fromValues(point.x + point.splash.x,point.y + point.splash.y),
			angle: - Math.PI /2,
			spread: Math.PI / 2,
			magnitude: this.params.height/10,
			color: '#FFF',
			size: 1,
			sizemax: 4,
			fade: 0.1,
			fademax: 0.3,
			scaler: 0.1
		});

		var particule = emitter.emitParticle();
		this.particles_cont.addChild(particule);
		this.particles.push(particule);	

}

prototype.addBlockBreaking = function(width) {

	window.setTimeout(proxy(this.initBlockBreaking, this),this.params.breaking_xspeed);
}

prototype.initBlockBreaking = function(width) {

	if(typeof(width)==='undefined') width = 300;
	if(this.direction==0) return;
	if(this.direction==1){
		while( width > 0 ) {
			var x = this.breaking_points[0].x - this.params.breaking_width;
			var point = this.createBreakingPoint({x:x, color:'green'});
			this.breaking_points.unshift(point);
			width = width - this.params.breaking_width;
		}		
	}
	if(this.direction==-1){
		while( width > 0) {
			var x = this.breaking_points[this.breaking_points.length-1].x + this.params.breaking_width;	
			var point = this.createBreakingPoint({x:x, color:'green'});
			this.breaking_points.push(point);
			width = width - this.params.breaking_width;
		}
	}
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
	if(this.direction == 1) this.params.suction = vec2.fromValues(this.params.suction[0]*-1,this.params.suction[1]);	
	
}

prototype.moveWave = function() {

	if(this.surfer == undefined) return;
	if(this.breaked == false) return;
	if(this.surfer.riding == false) return;

	//var coef = 1 - ((100*this.y/SPOT.peak_point) / 100);	
	var surfer_pos = this.cont.localToGlobal(this.surfer.x,0);
	var delta = (STAGEWIDTH>>1) - surfer_pos.x;
	if(this.direction == 1) delta += 200;
	if(this.direction == -1) delta += -200;
	
	this.cont.x += delta/this.params.breaking_width;

	
}

prototype.oldmoveWave = function() {
	if(this.breaked == false) return;
	if(this.direction == 0) return;
	if(this.direction == 1) {
		//get vanish point x
		var pt = this.cont.localToGlobal(this.vanish_left.x,0);
		//calcul lateral movement from y position
		var coef = ( 100*this.y/ SPOT.peak_point) / 100;
		var xwidth = this.params.breaking_width * 1/coef;
		//move wave normally when well positioned
		if(pt.x >= (STAGEWIDTH-100)) this.cont.x += xwidth;
		//else move quicker
		else this.cont.x += xwidth *2;
	}
	if(this.direction == -1) {
		//get vanish point x
		var pt = this.cont.localToGlobal(this.vanish_right.x,0);
		//calcul lateral movement from y position
		var coef = ( 100*this.y/ SPOT.peak_point) / 100;
		var xwidth = this.params.breaking_width * 1/coef;
		//move wave normally when well positioned
		if(pt.x <= 100) this.cont.x -= xwidth;
		//else move quicker
		else this.cont.x -= xwidth*2;			
	}

}

prototype.clearAllIntervals = function() {

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

	var offset = this.width >> 1; //divice by 2

	var points = [];
	for(var i = 0, len = this.breakpoints.length; i < len; i++) {
		var point = this.breakpoints[i];
		var x = this.lip_cont.localToGlobal(point.x,point.y).x;
		//remove point if offscreen on the left
		if( x < (- offset) || x > (this.width + offset) ) {
			this.lip_cont.removeChild(point);
			continue;
		} 
		points[points.length] = point; 
	}
	this.breakpoints = points;

}

prototype.drawSplash = function () {

	if(this.breaked == false) return;

	var shape = new createjs.Shape();
	var k = shape.graphics;
	

	//get peaks
	var peaks = [];
	for(var i=0, len=this.breakpoints.length; i<len; i++) {
		peaks[peaks.length] = this.breakpoints[i];
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

		k.moveTo(points[0].x - this.params.breaking_points, this.params.height);
		k.beginFill('#FFF').beginStroke('rgba(0,0,0,0.2').setStrokeStyle(1);
		k.lineTo(points[0].x,points[0].y);

		for(var i=1,len=points.length; i<len - 2; i++) {
			var xc = ( points[i].x + points[i+1].x) >> 1; // divide by 2
			var yc = ( points[i].y + points[i].splash.y + points[i+1].y + points[i+1].splash.y) >> 1; // divide by 2
			k.quadraticCurveTo(points[i].x,points[i].y + points[i].splash.y,xc,yc);
		}
		
		k.lineTo(points[points.length-1].x + this.params.breaking_width, this.params.height);
		k.beginFill(null).beginStroke(null).setStrokeStyle(1);
	}


	this.splash_cont.removeAllChildren();
	this.splash_cont.addChild(shape);

}

prototype.drawLip = function() {

	//return if not breked yet
	if(this.breaked == false) return;

	var shape = new createjs.Shape();
	var k = shape.graphics;
	//shape.alpha = 0.5;

	//get peaks
	var peaks = [];
	for(var i=0, len=this.breakpoints.length; i<len; i++) {
		peaks[peaks.length] = this.breakpoints[i];
	}

	//draw a lip for each peak
	for(var j=0, ln=peaks.length; j<ln; j++) {
		
		var points = peaks[j];

		for(var i=0, len=points.length; i<len - 2; i++) {

			k.beginFill('rgba(255,255,255,0.5)').beginStroke('rgba(0,0,0,0.3').setStrokeStyle(1);
			k.moveTo(points[0].x,0);
			for(var i=1,len=points.length; i<len -2; i++){
					var xc = ( points[i].x + points[i+1].x) >> 1; // divide by 2
					var yc = ( points[i].y + points[i+1].y) >> 1; // divide by 2
					k.quadraticCurveTo(points[i].x,points[i].y,xc,yc);
			}
			//faire passer par l'avant dernier point
			k.quadraticCurveTo(points[i].x,points[i].y,points[i+1].x,points[i+1].y);		
			//le dernier point
			k.lineTo(points[len-1].x,0);
		}
		
	}

	k.closePath();

	var thickness = shape.clone(true);
	thickness.y = -10;

	this.lip.removeAllChildren();
	this.lip.addChild(shape);
	this.lip.addChild(thickness);

	this.lip.mask = this.shape_mask;
}

prototype.addBreakingPeak = function(width,distance) {
	
	if(this.direction==1) {
		var peak = this.breakpoints[0];
		var x = peak[0].x - distance;
		this.addLeftPeak(x, width);
	}
	if(this.direction==-1) {
		var peak = this.breakpoints[this.breakpoints.length - 1];
		var x = peak[peak.length-1].x + distance;	
		this.addRightPeak(x, width);
	}

}

prototype.addObstacle = function() {

	var x = 0, y = this.params.height;	
	if(this.direction == -1) {
		var x = this.cont.x*-1 + this.width;
	}
	if(this.direction == 1) {
		var x = - this.cont.x;
	}


	var obs = new Photograf({		
		wave: this
	});
	
	this.obstacles.push(obs);
	this.obstacle_cont.addChild(obs);
}

prototype.removeObstacle = function(obs) {

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
		shoulder.graphics.beginFill('yellow').drawCircle(0,0,30);
		this.shoulder_cont.addChild(shoulder);
		this.shoulder_left = shoulder;
	}

	//do not update when breaking have not reached the shoulder
	if(x > this.shoulder_left.x) return;

	this.shoulder_left.x = x;
}

prototype.updateRightShoulder = function(x) {

	if(this.shoulder_right == undefined) {
		var shoulder = new createjs.Shape();
		shoulder.graphics.beginFill('yellow').drawCircle(0,0,30);
		this.shoulder_cont.addChild(shoulder);
		this.shoulder_right = shoulder;
	}

	//do not update when breaking have not reached the shoulder
	if(x < this.shoulder_right.x) return;

	this.shoulder_right.x = x;
}


prototype.initVanishPoints = function(x) {

	var vanish = new createjs.Shape();
	vanish.graphics.beginFill('green').drawCircle(0,0,10);
	vanish.x = x - 1;	
	this.vanishs_cont.addChild(vanish);
	this.vanish_left = vanish;

	var vanish = new createjs.Shape();
	vanish.graphics.beginFill('green').drawCircle(0,0,10);
	vanish.x = x + 1;	
	this.vanishs_cont.addChild(vanish);
	this.vanish_right = vanish;

}
prototype.updateVanishPoints = function(x) {	

	if(this.direction == 1) {
		var point = this.vanish_left;
		if(x > point.x) return;
		return point.x = x;		
	}
	if(this.direction == -1) {
		var point = this.vanish_right;
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

//<-- end methods


//assign wave to window's scope & promote overriden container's methods from Wave object, allow them to be call by 'Container_methodName()'
window.Wave = createjs.promote(Wave,'Container');

}());