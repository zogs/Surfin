(function() {

//create new class
function Wave(height) {

	this.Container_constructor();
	this.init(height);
}

//extend it
var prototype = createjs.extend(Wave, createjs.Container);

//add EventDispatcher
createjs.EventDispatcher.initialize(prototype);

//public property
prototype.peak_width = 200;
prototype.breaking_xspeed = 50; //new Variation(50,50,3000,1000);
prototype.breaking_yspeed = 1500; //new Variation(2000,2150,1500,500);
prototype.breaking_width = new Variation(13,20,3000,1000);	
prototype.breaking_center = 1000;
prototype.direction = 0;
prototype.height = 100;
prototype.width = 1500;
prototype.suction = vec2.fromValues(-5,-5);
prototype.surfer = undefined;

//public methods
prototype.init = function(height) {

	//set properties
	this.height = height;
	this.origin_height = height;
	this.width = _stageWidth;
	this.surfers = [];
	this.breaking_points = [];
	this.breaking_peaks = [];
	this.bottom_fall_points = [];
	this.top_fall_points = [];
	this.bottom_fall_scale = 2;
	this.top_fall_scale = 0.4;
	this.tube_points = [];
	this.debug_points_alpha = 0.1;

	//this.direction = 0;
	this.breaked = false;
	this.status = '';
	this.paused = false;

	//wave background
	this.background_cont = new createjs.Container();
	this.addChild(this.background_cont);
	this.background = new createjs.Shape();	
	this.background.graphics.beginLinearGradientFill(['#0b2648','#0d528c'],[0,1],0,0,0,this.height).drawRect(0,0,_stageWidth,this.height);	
	this.background_cont.addChild(this.background);	
	this.background_cont.y = - this.height;
	
	
	//wave cont
	this.cont = new createjs.Container();
	this.cont.y = - this.height;
	this.addChild(this.cont);	
		//surfer trails cont
		this.trail_debug = new createjs.Container();
		this.cont.addChild(this.trail_debug);
		this.trail_cont = new createjs.Container();
		this.cont.addChild(this.trail_cont);	
		//surfer cont
		this.surfer_cont = new createjs.Container();
		this.cont.addChild(this.surfer_cont);
		//spatter cont
		this.spatter_cont = new createjs.Container();
		this.cont.addChild(this.spatter_cont);		
		//lip of the wave
		this.lip_points = new createjs.Container();
		this.cont.addChild(this.lip_points);
		this.lip = new createjs.Container();
		this.cont.addChild(this.lip);
		//splash
		this.splash_cont = new createjs.Container();
		this.cont.addChild(this.splash_cont);
		//fall 
		this.fall_cont = new createjs.Container();
		this.cont.addChild(this.fall_cont);
		//vanish points container
		this.vanishs_cont = new createjs.Container();
		this.cont.addChild(this.vanishs_cont);

		//clicking the wave
		this.on('click',function(e){

			var wave = e.currentTarget;
			var x = e.stageX;			
			wave.initBreak(x);
			wave.addSurfer(x);
			SPOT.setRidingWave(wave);
			SPOT.stopNextWaves();
			
			
		});	

		//Ticker
		this.addEventListener('tick',proxy(this.tick,this));


}

prototype.tick = function() {

	this.drawLip();
	this.moveWave();
	this.drawTrails();
	this.testFall();
}

prototype.testFall = function() {

	if(this.surfer == undefined) return;
	
	//remove all child
	this.fall_cont.removeAllChildren();

	//test bottom points
	if(this.bottom_fall_points.length != 0) {
		//for each
		for(var i = 0; i <=  this.bottom_fall_points.length - 1; i++) {
			var point = this.bottom_fall_points[i];
			//add point
			this.fall_cont.addChild(point);
			//check hit 
			if(this.surfer.hit(point,point.scaleX)) {							
				//throw event
				this.surfer.dispatchEvent('fall_bottom');
				break;
			} 			
		}
		//maintain a raisonable count of fall points
		this.bottom_fall_points = this.bottom_fall_points.slice(0,50);
	}

	//test top points
	if(this.top_fall_points.length != 0) {
		//for each
		for(var i = 0; i <= this.top_fall_points.length - 1; i++) {
			var point = this.top_fall_points[i];			
			//add point
			this.fall_cont.addChild(point);
			//check hit 
			if(this.surfer.hit(point,point.scaleX)) {			
				//throw event
				this.surfer.dispatchEvent('fall_top');
				break;
			} 			
		}
		//maintain a raisonable count of fall points
		this.top_fall_points = this.top_fall_points.slice(0,50);
	}

	//test tube point
	if(this.tube_points.length != 0) {		
		//test if surfing is in the tube
		if(this.isSurferTubing(this.surfer)) {
			//throw event tube in
			if(this.surfer.tube == false) this.surfer.dispatchEvent('tube_in');			
		}
		else {
			//trhow event tube out
			if(this.surfer.tube == true) this.surfer.dispatchEvent('tube_out');
		}		
		//maintain a raisonable count of fall points
		this.tube_points = this.tube_points.slice(0,30);
	}

	//dispatch normal event
	this.surfer.dispatchEvent('surfing');

}

prototype.isSurferTubing = function(surfer) {

	for(var i = 0; i <= this.tube_points.length - 1; i++) {
		var point = this.tube_points[i];			
		//add point
		this.fall_cont.addChild(point);
		//check hit 
		if(surfer.hit(point,point.scaleX)) {			
			return true;			
		} 		
	}
	return false;
}

prototype.addTubePoint = function(point) {

	var tube = new createjs.Shape();
		tube.graphics.beginFill('green').drawCircle(0,0,this.height/2);
		tube.x = point.x;
		tube.y = this.height / 2;
		tube.alpha = this.debug_points_alpha;
		this.tube_points.unshift(tube);
	
}


prototype.addTopFallPoint = function(x) {

	var fall = new createjs.Shape();
		fall.graphics.beginFill('red').drawCircle(0,0,1);
		//slightly move the points to free lip's shoulder
		var d = this.breaking_width*10;
		if(this.direction == 0) fall.x = x;
		if(this.direction == 1) fall.x = x + d;
		if(this.direction == -1) fall.x = x - d;

		fall.alpha = this.debug_points_alpha;
		this.top_fall_points.unshift(fall);

	var scale = this.height * this.top_fall_scale;

	createjs.Tween.get(fall)
		.to({scaleX:scale,scaleY:scale},4000,createjs.quartIn)		
		;
}

prototype.addBottomFallPoint = function(point) {

	var fall = new createjs.Shape();
		fall.graphics.beginFill('red').drawCircle(0,0,1);
		fall.y = this.height;
		fall.x = point.x;
		fall.alpha = this.debug_points_alpha;
		this.bottom_fall_points.unshift(fall);

	var scale = this.height * this.bottom_fall_scale;

	createjs.Tween.get(fall)
		.to({scaleX:scale,scaleY:scale},4000,createjs.quartIn)
		;
}

prototype.resize = function(size) {

	this.height = size;
	this.drawBackground(size);
}

prototype.drawBackground = function() {
					
	this.background.scaleY = this.height / this.origin_height;		
}

prototype.initBreak = function(center) {		

	if(this.breaked == true) return;
	//set wave breaking center
	this.breaking_center = center;
	//add first breaking points
	this.addInitBreakingPoint(center);	
	this.addLeftBreakingPoint(center - this.peak_width/2);
	this.addRightBreakingPoint(center + this.peak_width/2);

	//set status of the wave
	this.status = 'run';
	this.breaked = true;

	//set the vanish points
	this.initVanishPoints(center);

	//init timer continuous breaking
	this.breaking();
}

prototype.swellProgress = function(horizon,peak) {
		
	//calcul wave height (cross-product!!)	
	var h = (this.origin_height * (this.y - this.origin_height - horizon)) / ( peak - horizon );
	//resize wave if full height is not reached yet
	if(h < this.origin_height) this.resize(h);	

	//break wave when full height is reached
	if(h >= this.origin_height) {
		if(this.breaked == false) {
			this.initBreak(Math.random()*500+250);			
		}		
	}

	//resize surfer if	
	if(this.surfer != undefined) {

		this.surfer.resize();
	}

}

prototype.addSurfer = function(x) {

	prototype.surfer = new Surfer();
	prototype.surfer.setWave(this).takeOff(x,0);
	this.surfer_cont.addChild(this.surfer);
	this.surfers.push(prototype.surfer);
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

	//calcul and add left breaking point
	if(this.direction == 1 || this.direction == 0) {
		var x = this.breaking_points[0].x - this.breaking_width;
		this.addLeftBreakingPoint(x);
		//draw fall point
		this.addTopFallPoint(x);
		
	}

	//calcul and add right breaking point
	if(this.direction == -1 || this.direction == 0 ) {
		var x = this.breaking_points[this.breaking_points.length-1].x + this.breaking_width;	
		this.addRightBreakingPoint(x);
		//draw fall point
		this.addTopFallPoint(x);	
	}

	
	//continuous breaking
	var _this = this;
	this.breakingTimer = setTimeout(function() { _this.breaking(); }, _this.breaking_xspeed, this);
}

prototype.addInitBreakingPoint = function(x) {

	var point = this.createBreakingPoint('red',0);
	point.x = x;
	this.lip_points.addChild(point);
	this.breaking_points.push(point);
}

prototype.addRightBreakingPoint = function(x) {

	var point = this.createBreakingPoint();
	point.x = x;
	this.lip_points.addChild(point);
	this.breaking_points.push(point);
}

prototype.addLeftBreakingPoint = function(x) {

	var point = this.createBreakingPoint();
	point.x = x;
	this.lip_points.addChild(point);
	this.breaking_points.unshift(point);
}

prototype.createBreakingPoint = function(color,delay) {

	delay = typeof(delay) === 'undefined' ? delay = this.breaking_xspeed : delay;
	color = typeof(color) === 'undefined' ? color = 'red' : color;

	var point = new createjs.Container();	
	var shape = new createjs.Shape();
	shape.graphics.beginFill(color).drawCircle(0,0,5);
	//point.addChild(shape);

	createjs.Tween.get(point)
			.wait(delay)
			.to(
				{y:this.height},
				this.breaking_yspeed+Math.random()*50,
				//createjs.Ease.getPowIn(5)
				createjs.Ease.quartIn
				)
			.call(proxy(this.splashPointReached,this));


	
	return point;
}

prototype.splashPointReached = function(obj) {
	
	//get point
	var point = obj.target;
	point.y = this.height;

	//draw splash
	this.drawSplashPoint(point);

	//draw fall shape
	this.addBottomFallPoint(point);

	//draw tube points
	this.addTubePoint(point);

	//set direction
	if(this.direction==0) this.setDirection();

}


prototype.drawSplashPoint = function(point) {

	var splash = new createjs.Shape();
		splash.graphics.beginFill('#EEEEEE').drawCircle(0,0,2);
		if(this.direction==0) splash.alpha = 0.8;
		else splash.alpha = 0.5;
		point.addChild(splash);

	var mask = new createjs.Shape();
		mask.graphics.beginFill('#FFF').drawRect(-this.width/4,-this.height,this.width/2,this.height);
		splash.mask = mask;

	var scale = this.height*0.40 +Math.random()*10;

	createjs.Tween.get(splash)
		.to({scaleX:scale,scaleY:scale},1000)
		.call(proxy(this.updateVanishPoints,this,[point.x]))
		.to({scaleX:scale-scale*0.2,scaleY:scale-scale*0.2},2500,createjs.Ease.easeOutSine)
		;

}

prototype.addBlockBreaking = function(width) {

	if(typeof(width)==='undefined') width = 300;
	if(this.direction==0) return;
	if(this.direction==1){
		while( width > 0 ) {
			var x = this.breaking_points[0].x - this.breaking_width;
			var point = this.createBreakingPoint('green');
			point.x = x;
			this.lip_points.addChild(point);
			this.breaking_points.unshift(point);
			width = width - this.breaking_width;
		}		
	}
	if(this.direction==-1){
		while( width > 0) {
			var x = this.breaking_points[this.breaking_points.length-1].x + this.breaking_width;	
			var point = this.createBreakingPoint('green');
			point.x = x;
			this.lip_points.addChild(point);
			this.breaking_points.push(point);
			width = width - this.breaking_width;
		}
	}
}

prototype.setDirection = function() {

	//if no surfers, wave is staying straight
	if(this.surfers.length == 0) return prototype.direction = 0;

	//else set direction
	if(this.surfer.x > this.breaking_center) {
		prototype.direction = -1;	
		console.log('Wave is a right !');
	} 
	else {
		prototype.direction = 1;
		console.log('Wave is a left !');
	}

	//invert suction direction for left waves
	if(prototype.direction == 1) this.suction = vec2.fromValues(this.suction[0]*-1,this.suction[1]);	

	//init points cleaner
	this.initCleanOffScreenPoints();	
}

prototype.moveWave = function() {

	if(this.surfer == undefined) return;
	if(this.breaked == false) return;
	if(this.surfer.riding == false) return;

	//var coef = 1 - ((100*this.y/SPOT.peak_point) / 100);	
	var surfer_pos = this.cont.localToGlobal(this.surfer.x,0);
	var delta = _stageWidth/2 - surfer_pos.x;
	if(this.direction == 1) delta += 100;
	if(this.direction == -1) delta += -100;
	
	this.cont.x += delta/this.breaking_width;

	
}

prototype.oldmoveWave = function() {
	if(this.breaked == false) return;
	if(this.direction == 0) return;
	if(this.direction == 1) {
		//get vanish point x
		var pt = this.cont.localToGlobal(this.vanish_left.x,0);
		//calcul lateral movement from y position
		var coef = ( 100*this.y/ SPOT.peak_point) / 100;
		var xwidth = this.breaking_width * 1/coef;
		//move wave normally when well positioned
		if(pt.x >= (_stageWidth-100)) this.cont.x += xwidth;
		//else move quicker
		else this.cont.x += xwidth *2;
	}
	if(this.direction == -1) {
		//get vanish point x
		var pt = this.cont.localToGlobal(this.vanish_right.x,0);
		//calcul lateral movement from y position
		var coef = ( 100*this.y/ SPOT.peak_point) / 100;
		var xwidth = this.breaking_width * 1/coef;
		//move wave normally when well positioned
		if(pt.x <= 100) this.cont.x -= xwidth;
		//else move quicker
		else this.cont.x -= xwidth*2;			
	}

}

prototype.initCleanOffScreenPoints = function() {

	this.offscrenCleaner = window.setInterval(proxy(this.cleanOffScreenPoints,this),1000);
}

prototype.cleanOffScreenPoints = function() {

	var n = this.breaking_points.length;
	for(var i = 0; i < n; i++) {
		var point = this.breaking_points[i];
		var x = this.lip_points.localToGlobal(point.x,point.y).x;
		//remove point if offscreen on the left
		if( x < (-this.width/2) ) {
			this.breaking_points.slice(0,1);
			this.lip_points.removeChild(point);
		} 
		//remove point if offscreen on the right
		if( x > (this.width*1.5) ) {
			this.breaking_points.slice(this.breaking_points.length - 1, 1);
			this.lip_points.removeChild(point);
		}

	}
}

prototype.drawLip = function() {

	//return if not breked yet
	if(this.breaked == false) return;

	var shape = new createjs.Shape();
	//shape.alpha = 0.5;

	//draw main lip
	var length = this.breaking_points.length;
	var points = this.breaking_points;
	var k = shape.graphics.clear().beginFill('rgba(255,255,255,0.5)').beginStroke('#FFF').setStrokeStyle(3);
	k.moveTo(points[0].x,0);
	for( i=1; i<points.length -2; i++){
			var xc = ( points[i].x + points[i+1].x) / 2;
			var yc = ( points[i].y + points[i+1].y) / 2;
			k.quadraticCurveTo(points[i].x,points[i].y,xc,yc);
	}
	//faire passer par l'avant dernier point
	k.quadraticCurveTo(points[i].x,points[i].y,points[i+1].x,points[i+1].y);		
	//le dernier point
	k.lineTo(points[points.length-1].x,0);


	//draw extra peaks if exist
	if(this.breaking_peaks.length>0) {
		var length = this.breaking_peaks.length;
		var points = this.breaking_peaks;
		k.moveTo(points[0].x,points[0].y);
		for( var i=1; i<points.length - 2; i++) {
			var xc = ( points[i].x + points[i+1].x) / 2;
			var yc = ( points[i].y + points[i+1].y) / 2;
			k.quadraticCurveTo(points[i].x,points[i].y,xc,yc);
		}
		//k.quadraticCurveTo(points[i].x,points[i].y,points[i+1].x,points[i+1].y);
		k.lineTo(points[0].x,points[0].y);

	}

	this.lip.removeChildAt(0);
	this.lip.addChild(shape);
}

prototype.addBreakingPeak = function(width,distance) {

	var point = this.createBreakingPoint('pink',0);
	if(this.direction==1) point.x = this.breaking_points[0].x - distance;
	if(this.direction==-1) point.x = this.breaking_points[this.breaking_points.length - 1].x + distance;	
	this.breaking_peaks.push(point);
	this.lip_points.addChild(point);

	var point = this.createBreakingPoint('pink');
	point.x = this.breaking_peaks[0].x + width / 2;
	this.breaking_peaks.push(point);
	this.lip_points.addChild(point);

	var point = this.createBreakingPoint('pink');
	point.x = this.breaking_peaks[0].x - width / 2;
	this.breaking_peaks.unshift(point);
	this.lip_points.addChild(point);

	this.breakingPeaksTimer = setInterval(proxy(this.breakingPeaks,this), this.breaking_xspeed * 2);
}

prototype.breakingPeaks = function() {
	
	//calcul and add left breaking point
	var x = this.breaking_peaks[0].x - this.breaking_width;
	var point = this.createBreakingPoint('pink');
	point.x = x;
	this.breaking_peaks.unshift(point);
	this.lip_points.addChild(point);	

	//calcul and add right breaking point
	var x = this.breaking_peaks[this.breaking_peaks.length-1].x + this.breaking_width;	
	var point = this.createBreakingPoint('pink');
	point.x = x;
	this.breaking_peaks.push(point);
	this.lip_points.addChild(point);	

	//when the two lips joins
	//for right waves
	if(this.direction==-1 && this.breaking_peaks[0].x <= this.breaking_points[this.breaking_points.length - 1].x + this.breaking_width*2)
	{		
		//merge points
		this.breaking_points = this.breaking_points.concat(this.breaking_peaks);
		//clear peak points
		this.breaking_peaks = [];
		//stop breaking the peak
		return clearInterval(this.breakingPeaksTimer);
	}
	//for left waves
	if(this.direction==1 && this.breaking_peaks[this.breaking_peaks.length - 1].x > this.breaking_points[0].x - this.breaking_width*2)
	{		
		//merge points
		this.breaking_points = this.breaking_peaks.concat(this.breaking_points);
		//clear peak points
		this.breaking_peaks = [];
		//stop breaking the peak
		return clearInterval(this.breakingPeaksTimer);
	}
	
}

prototype.drawSpatter = function() {

	var graphics = new createjs.Graphics()
				.beginFill(createjs.Graphics.getRGB(255, 255, 255))
				.drawCircle(0, 0, 1)
				;
 
	
	for(var i = 1; i<= 50; i++) {
		var spatter = new createjs.Shape(graphics)
		spatter.x = this.surfer.x;
		spatter.y = this.surfer.y;
		

		var dx = Math.random(100)*(Math.round(Math.random())*2 - 1);

		createjs.Tween.get(spatter)
			.to({				
				alpha: 0
			},500);

		this.spatter_cont.addChild(spatter);

	}
}

prototype.drawTrails = function() {

	//if no surfer on wave, dont do anything
	if(this.surfers.length==0) return;

	//begin by clearing all trails
	this.trail_debug.removeAllChildren();
	this.trail_cont.removeAllChildren();
	
	//var
	var surfer = this.surfer;
	//console.log(surfer);
	var nb = surfer.trailpoints.length - 1;
	var trailpoints = surfer.trailpoints.slice(0);
	var points = [];
	var xs = [];

	//if no trails points, return early
	if(nb <= 0) return;

	//update points with the suction vector
	for (var i = 0; i <= nb; i++) {
		//apply vector suction
		var pos = surfer.trailpoints[i];
		vec2.add(pos,pos,this.suction);
		//create xy Point
		var point = new createjs.Point(pos[0]+40,pos[1]);
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

	/* trail fade 
	for(var i = 0; i <= nb - 1; i++) {
		//calcul color
		var color1 = 'rgba(255,255,255,'+(1-(1/nb)*i)+')';
		var color2 = 'rgba(255,255,255,'+(1-(1/nb)*(i+1))+')';
		//trace trail		
		k
			.setStrokeStyle(1 + i*1.2,'butt','bevel',100).beginLinearGradientStroke([color1,color2],[1,1],points[i].x,points[i].y,points[i+1].x,points[i+1].y)
			.moveTo(points[i].x,points[i].y)
			.lineTo(points[i+1].x,points[i+1].y)
			//.endStroke()
			;

	}*/


	for(var i = 0; i <= nb - 1; i++) {
			trail.graphics
			.setStrokeStyle(1 + i*1.2,'round','round').beginStroke('#FFF')
			.moveTo(points[i].x,points[i].y)
			.lineTo(points[i+1].x,points[i+1].y)
			;

			subtrail.graphics
			.setStrokeStyle(1 + i*0.2,'butt').beginStroke('rgba(0,0,0,0.1')
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
	trail.cache(xmin,0,xmax-xmin,this.height);
	//subtrail.cache(xmin,0,xmax-xmin,this.height);
	trail.alpha = 0.3;
	//subtrail.alpha = 0.1;
 	
	//trail mask		
	var masker = new createjs.Shape();
	masker.graphics.beginFill('red').drawRect(points[0].x - _stageWidth, 0, _stageWidth*2, 200);
	//apply mask
	trail.mask = masker;
	subtrail.mask = masker;

	//
	this.trail_cont.y =+10;

	//add trail
	this.trail_cont.addChild(trail);
	this.trail_cont.addChild(subtrail);
	
}

prototype.initVanishPoints = function(x) {

	var vanish = new createjs.Shape();
	vanish.graphics.beginFill('green').drawCircle(0,0,10);
	vanish.x = x - 1;
	vanish.alpha = this.debug_points_alpha;
	this.vanishs_cont.addChild(vanish);
	this.vanish_left = vanish;

	var vanish = new createjs.Shape();
	vanish.graphics.beginFill('green').drawCircle(0,0,10);
	vanish.x = x + 1;
	vanish.alpha = this.debug_points_alpha;
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