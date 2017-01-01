(function() {

//create new class
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
	this.origin_width = this.config.width;
	this.surfers = [];
	this.obstacles = [];
	this.breaking_points = [];
	this.lip_points = [];
	this.lip_cap_points = [];
	this.breaking_peaks = [];
	this.peakpoints = [];
	this.particles = [];
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
		this.surfer_cont = new createjs.Container();
		this.foreground_cont.addChild(this.surfer_cont);
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
			//lip of the wave
			this.debug_lip_cont = new createjs.Container();
			this.debug_cont.addChild(this.debug_lip_cont);
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

prototype.drawBackground = function() {

	const colors = this.config.colors;
	this.background_gradient.graphics.clear();
	for(let i=0,ln=colors.length-1;i<ln;i++) {
		if(colors[i+1] == undefined) break;
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

	if(this.breaked == false) return;

	if(PERF == 0) return;
	
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

	if(this.direction == 1) {
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

	if(this.direction == -1) {
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

		this.alpha -= 0.05;

		return;
	}

	if(this.y > this.spot.getBreak()) {

		if(this.breaked == false) {
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

	//draw background
	this.drawBackground();

	//progressive alpha background
	this.background.alpha = coef;
	this.background_shadow.alpha = 1 - coef;




	//resize background
	this.resizeBackground(h);	

	//draw shpa
	this.drawShape();

}

prototype.initWave = function(center) {

	if(this.breaked == true) return;

	//init the vanish points
	this.initVanishPoints(center);

	//add first breaking points
	this.updateLeftShoulder(STAGEWIDTH/2 - this.config.width/2);
	this.updateRightShoulder(STAGEWIDTH/2 + this.config.width/2);

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

prototype.tick = function(ev) {
	if(PAUSED) return;	

	if(this.breaked) {

		this.breaking();
		this.drawLip();
		this.drawSplash();
		this.moveWave();
		this.drawShape();	
		this.animateBackground();
	}

	if(DEBUG) {
		this.drawDebug();		
	}
		
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
	this.surfer_cont.addChild(surfer);
	this.surfers.push(surfer);
}

prototype.addSurfer = function(surfer) {

	surfer.takeOff(surfer.x,surfer.y);
	this.surfer_cont.addChild(this.surfer);
	this.surfers.push(surfer);
}

prototype.addSurferBot = function(bot) {

	bot.takeOff(bot.x,bot.y);
	this.surfer_cont.addChild(bot);
	this.surfers.unshift(bot);
	stage.dispatchEvent('bot_take_off');

}

prototype.addTestSurferBot = function(surfer) {

	if(this.direction == 1) {
		var direction = 'left';
		var takeoffX = this.shoulder_left.x - this.params.shoulder.left.marge;
	} else {
		var direction = 'right';
		var takeoffX = this.shoulder_right.x + this.params.shoulder.right.marge;
	}

	var bot = new SurferBot({
		wave:this,
		spot:this.spot,
		direction: direction
	});


	bot.takeOff( takeoffX, this.params.height*1/3);
	this.surfer_cont.addChild(bot);
	this.surfers.unshift(bot);
	console.log(this.surfers);
}

prototype.removeBot = function(bot) {

	this.surfer_cont.removeChild(bot);
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

		if(first[first.length-1].x >= ( second[0].x - this.params.breaking.left.width)) {
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
		var x = peak[0].x - this.params.breaking.left.width;
		var point = this.createLipPoint({x:x, color:'red',direction:'left'});
		peak.unshift(point);		
		this.updateLeftShoulder(x);		

		//add right point		
		var x = peak[peak.length-1].x + this.params.breaking.right.width;
		var point = this.createLipPoint({x:x, color:'red', direction:'right'});
		peak.push(point);
		this.updateRightShoulder(x);


		this.peakpoints[i] = peak;

	}

}

prototype.addPeak = function(center,width) {

	var points = [];
	var point = this.createLipPoint({x:center, color:'red',delay:0});
	points.push(point);
	var point = this.createLipPoint({x:center + width/2, direction:'right'});
	points.push(point);
	var point = this.createLipPoint({x:center - width/2, direction:'left'});
	points.unshift(point);

	this.peakpoints.push(points);
}

prototype.addRightPeak = function(center,width) {

	this.addPeak(center,width);
}

prototype.addLeftPeak = function(center,width) {

	var points = [];
	var point = this.createLipPoint({x:center, color:'red',delay:0});
	points.push(point);
	var point = this.createLipPoint({x:center + width/2, direction:'right'});
	points.push(point);
	var point = this.createLipPoint({x:center - width/2, direction:'left'});
	points.unshift(point);

	this.peakpoints.unshift(points);
}

prototype.createLipPoint = function(params) {

	var params = params === undefined ? {} : params;
	var delay = params.delay === undefined ? this.config.lip.cap.lifetime : this.config.lip.cap.lifetime + params.delay;
	var color = params.color === undefined ? 'white' : params.color;
	var direction = params.direction ? params.direction : null;
	var x = params.x === undefined ? 0 : params.x;
	var bounce = (this.isPlayed())? this.params.height + Math.random() * this.params.height / 3 : this.params.height + Math.random() * this.params.height / 4;


	const point = new createjs.Point();
	point.x = x;

	//initial property of the lip's point
	point.direction = direction;
	point.breaking = false;
	point.topfallscale = 0;
	point.topfallscaleMax = (this.params.top_fall_scale * this.params.height);
	point.splashed = false;
	point.bounce_y = this.params.height;
	point.bottomfallscale = 0;
	point.bottomfallscaleMax = (this.params.bottom_fall_scale * this.params.height);
	point.tubescale = this.params.height / 4;
	point.tubescaleMax = this.params.height / 2;
	point.tubedeep = 0;
	point.tubedeepMax = 1;

	const cap = new createjs.Point();
	point.cap = cap;

	createjs.Tween.get(point)
		//delay
		.wait(delay)
		//break
		.set({breaking: true})
		//fall
		.to({y:this.config.height, topfallscale: point.topfallscaleMax},this.params.breaking.yspeed + Math.random()*50,createjs.Ease.quartIn)
		//splash
		.set({breaking: false, splashed: true})
		.call(proxy(this.splashPointReached,this,[point]))
		//bounce
		.to({bounce_y: this.params.height - bounce, bottomfallscale: point.bottomfallscaleMax, tubescale: point.tubescaleMax, tubedeep: point.tubedeepMax},1000)
		.call(proxy(this.updateVanishPoints,this,[point]))
		//fade
		.to({bounce_y: this.params.height -bounce/2},2500,createjs.Ease.bounceOut)
	;

	createjs.Tween.get(cap)		
		.to({y: - this.config.lip.cap.height + Math.random()*5}, this.config.lip.cap.lifetime + this.config.lip.cap.width/2, createjs.Ease.sineIn)
		.to({y:0},this.config.lip.cap.width/2,createjs.Ease.quartInOut)
		;

	return point;
}


prototype.splashPointReached = function(point) {

	

	//save splash height
	point.splash_y = point.y;

	//set direction
	if(this.direction==0) {
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

	if(this.direction==0) return;
	if(this.direction==1){
		this.initBlockBreakingLeft(width);
	}
	if(this.direction==-1){
		this.initBlockBreakingRight(width);
	}
}

prototype.initBlockBreakingLeft = function(width) {
	if(this.breaked == false) return;

	var peak = this.peakpoints[0];
	while( width > 0 ) {
		var x = peak[0].x - this.params.breaking.left.width;
		var point = this.createLipPoint({x:x, color:'green', direction:'left'});
		peak.unshift(point);
		width = width - this.params.breaking.left.width;
	}		
	this.peakpoints[0] = peak;
}

prototype.initBlockBreakingRight = function(width) {
	if(this.breaked == false) return;

	var peak = this.peakpoints[this.peakpoints.length-1];
	while( width > 0) {
		var x = peak[peak.length-1].x + this.params.breaking.right.width;	
		var point = this.createLipPoint({x:x, color:'green', direction:'right'});
		peak.push(point);
		width = width - this.params.breaking.right.width;
	}
	this.peakpoints[this.peakpoints.length-1] = peak;
}

prototype.addBreakingPeak = function(width,distance) {
	
	this.addBreakingPeakWarning();

	window.setTimeout(proxy(this.addBreakingPeakToLip,this,[width,distance]),2000);

}

prototype.addBreakingPeakWarning = function() {

	var text = new createjs.Text('Watch out !','bold 40px BubblegumSansRegular','#FFF'); //BubblegumSansRegular BoogalooRegular albaregular
		text.alpha = 0.8;
		var b = text.getBounds();
		if(this.direction === 1) text.x = 0 + b.width/2;
		if(this.direction === -1) text.x = STAGEWIDTH - b.width;
		if(this.direction === 0) return;
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

prototype.setDirection = function() {

	//if no surfers, wave is staying straight
	if(this.surfers.length == 0) return this.direction = 0;

	//else set direction
	if(this.surfer) {
		if(this.surfer.x > this.params.breaking_center) {
			this.direction = -1;	
			//console.log('Wave is a right !');
		} 
		else {
			this.direction = 1;
			//console.log('Wave is a left !');
		}
	}
	else {
		var surfer = this.surfers[0];
		if(surfer.x > this.params.breaking_center) {
			this.direction = -1;	
			//console.log('Wave is a right !');
		} 
		else {
			this.direction = 1;
			//console.log('Wave is a left !');
		}
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
		this.movingX = delta/this.params.breaking.left.width;
	}
	if(this.direction == -1) {
		delta += -200;
		this.movingX = delta/this.params.breaking.right.width;
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
		var xwidth = this.params.breaking.left.width * 1/coef;
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
			if(x > STAGEWIDTH + offset) {
				this.splash_cont.removeChild(point);
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
				this.splash_cont.removeChild(point);
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

	this.splash_gfx.clear();

	for(var j=0, ln=peaks.length; j<ln; j++) {

		points = peaks[j];

		if(points.length==0) continue;

		//var color = createjs.Graphics.getHSL(Math.random()*360,100,50);
		this.splash_gfx.beginFill('#FFF').beginStroke('rgba(0,0,0,0.2').setStrokeStyle(1);
		this.splash_gfx.moveTo(points[0].x, this.params.height);
		//this.splash_gfx.moveTo(points[0].x - this.params.breaking.left.width, points[0].splash_y);
		//this.splash_gfx.lineTo(points[0].x,points[0].splash_y);

		if(PERF==0) {
			console.log('lol')
			for(var i=1,len=points.length; i<len - 2; i++) {
				this.splash_gfx.lineTo(points[i].x,points[i].bounce_y);
			}
			//close in straigh line
			this.splash_gfx.lineTo(points[len-1].x, this.params.height);
			if(this.cleanedRight && this.direction===1) this.splash_gfx.lineTo(points[len-1].x,this.params.height);
			if(this.cleanedLeft && this.direction===-1) this.splash_gfx.lineTo(points[0].x,this.params.height);
		}
		else {
			for(var i=1,len=points.length; i<len - 2; i++) {
				var xc = ( points[i].x + points[i+1].x) >> 1; // divide by 2
				var yc = ( points[i].bounce_y + points[i+1].bounce_y) >> 1; // divide by 2
				this.splash_gfx.quadraticCurveTo(points[i].x,points[i].bounce_y,xc,yc);
			}

			//close in straigh line
			this.splash_gfx.lineTo(points[len-1].x, this.params.height);
			if(this.cleanedRight && this.direction===1) this.splash_gfx.lineTo(points[len-1].x,this.params.height);
			if(this.cleanedLeft && this.direction===-1) this.splash_gfx.lineTo(points[0].x,this.params.height);
		}		

		//for(let i=points.length-1; i>=0; i--) {
		//	this.splash_gfx.lineTo(points[i].x,points[i].y);
		//}
//
		//this.splash_gfx.closePath();
	}




}



prototype.drawLip = function() {

	//return if not breked yet
	if(this.breaked == false) return;

	//shape.alpha = 0.5;
	this.lip_shape.graphics.clear().beginFill('rgba(255,255,255,0.5)');
	this.lip_shadow.graphics.clear().beginLinearGradientFill(["rgba(0,0,0,0.1)","rgba(0,0,0,0)"], [0, 1], 0, 0, 0, this.params.height);
	this.lip_cap.graphics.clear().beginFill('rgba(255,255,255,0.5');
	this.lip_thick.graphics.clear().beginFill('rgba(255,255,255,0.5)');

	//get peaks
	var peaks = [];
	for(var i=0, len=this.peakpoints.length; i<len; i++) {
		peaks[peaks.length] = this.peakpoints[i];
	}

	//for each peak
	for(var j=0, ln=peaks.length; j<ln; j++) {
		
		var points = peaks[j];
		var lastSplashed = null, firstSplashed = null;

		//draw from the first point of the lip	
		this.lip_shape.graphics.moveTo(points[0].x,0);
		this.lip_thick.graphics.moveTo(points[0].x,0);
		this.lip_shadow.graphics.moveTo(points[0].x,0);

		if(points[0].cap) this.lip_cap.graphics.moveTo(points[0].x,0);

		//LOW PERF
		if(PERF==0) {
			for(var i=1,len=points.length; i<len -2; i++){
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
			for(var i=1,len=points.length; i<len-2; i++){

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

prototype.addFlyingObstacle = function() {
	if(this.breaked == false) return;
	var obs = new FlyingMultiplier({wave: this, multiplier: Math.ceil(Math.random()*5)})
	this.obstacles.push(obs);
	this.obstacle_cont.addChild(obs);
}

prototype.removeObstacle = function(obs) {
	obs.removeListeners();
	this.obstacles.splice(this.obstacles.indexOf(obs),1);
	this.obstacle_cont.removeChild(obs);
}





prototype.drawShape = function() {

	//get shoulders positions
	var left = this.shoulder_left;
	var right = this.shoulder_right;
	
	//minor shoulder variations
	if(this.breaked == true && this.params.shoulder.left.slope == null) this.params.shoulder.left.slope = new Variation({min:-50,max:50});
	if(this.breaked == true && this.params.shoulder.right.slope == null) this.params.shoulder.right.slope = new Variation({min:-50,max:50});

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

prototype.updateLeftShoulder = function(x) {

	if(this.shoulder_left == undefined) {
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

	if(DEBUG) this.shoulder_left.alpha = 1;
}

prototype.updateRightShoulder = function(x) {

	if(this.shoulder_right == undefined) {
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
prototype.updateVanishPoints = function(pt) {	

	if(this.direction == 1) {
		var point = this.vanish_left;
		if(DEBUG) point.alpha = 1;
		if( pt.x > point.x) return;
		return point.x = pt.x;		
	}
	if(this.direction == -1) {
		var point = this.vanish_right;
		if(DEBUG) point.alpha = 1;
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

prototype.getAllPeaksPoints = function() {

	//get peaks
	const points = [];
	for(let i=0, len=this.peakpoints.length; i<len; i++) {
		for(let j=0, ln=this.peakpoints[i].length; j<ln; j++) {
			points.push(this.peakpoints[i][j]);
		}
	}
	return points;
}

prototype.drawDebug = function() {


	var points = this.getAllPeaksPoints();
	//get only splashed point
	this.debug_points_cont.removeAllChildren();
	for(let j=0, ln=points.length; j<ln; j++) {
			
		let point = points[j];

		//DRAW LIP POINTS
		const lip = new createjs.Shape();
		lip.graphics.beginFill('black').drawCircle(0,0,3);
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
		if(point.splashed == true) {
			
			const bot = new createjs.Shape();
			bot.graphics.beginFill('red').drawCircle(0,0,1);
			bot.alpha = 0.1;
			bot.x = point.x;
			bot.y = this.params.height;
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


//<-- end methods


//assign wave to window's scope & promote overriden container's methods from Wave object, allow them to be call by 'Container_methodName()'
window.Wave = createjs.promote(Wave,'Container');

}());