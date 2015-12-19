Wave = function(height)
{
	this.peak_width = 100;
	this.breaking_xspeed = 50; //new Variation(50,50,3000,1000);
	this.breaking_yspeed = 1500; //new Variation(2000,2150,1500,500);
	this.breaking_width = new Variation(10,15,3000,1000);	
	this.breaking_points = [];
	this.breaking_center = 1000;
	this.breaking_peaks = [];
	this.direction = 0;
	this.status = '';
	this.yheight = height;
	this.width = STAGEWIDTH;
	//raw ref
	wave = this;
	//wave background
	this.background_cont = new createjs.Container();
	this.addChild(this.background_cont);
	this.drawBackground(height);
	

	//surfers
	this.surfers = [];
	this.surfer = undefined;
	this.surfersOnWave = false;

	//wave vector
	this.suction = vec2.fromValues(-5,-5);
	
	//wave cont
	this.cont = new createjs.Container();
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
		//vanish points container
		this.vanishs_cont = new createjs.Container();
		this.cont.addChild(this.vanishs_cont);

		//Stop by clicking the wave
		this.on('click',function(e){

			if(this.status == '') {
				var x = e.stageX;
				this.initBreak(x);
			}
			else if(this.status == 'run') {
				this.stopBreaking();
			} else if(this.status == 'stop') {
				this.continueBreaking();
			}
		});
		
}

Wave.prototype = new createjs.Container();


Wave.prototype.initSwell = function() {

	var final_height = wave.yheight;

	wave.y = 100;
	wave.height = 0;

	createjs.Tween.get(wave)
		.to({
			y: 300,
			height: final_height,
		}, 
		5000)
		.call(function() { wave.initBreak(750); })
		.addEventListener('change',function(e){
			console.log(wave.height);
			wave.resize(wave.height);
		})
		;
}

Wave.prototype.resize = function(size) {

	this.yheight = size;

	this.drawBackground(size);
}

Wave.prototype.drawBackground = function(size) {

	this.background_cont.removeAllChildren();	
	var background = new createjs.Shape();	
	background.graphics.beginLinearGradientFill(['#0b2648','#0d528c'],[0,1],0,0,0,size).drawRect(0,0,STAGEWIDTH,size);
	this.background_cont.addChild(background);	

}

Wave.prototype.tick = function() {

	wave.drawLip();
	wave.moveWave();
	wave.drawTrails();
}


/* methods */
Wave.prototype.initBreak = function(center) {	
	
	//set wave breaking center
	this.breaking_center = center;
	//add first breaking points
	this.addInitBreakingPoint(center);	
	this.addLeftBreakingPoint(center - this.peak_width/2);
	this.addRightBreakingPoint(center + this.peak_width/2);

	//set status of the wave
	wave.status = 'run';

	//set the vanish points
	this.initVanishPoints(center);

	//get surfer
	/*this.surfer = new Surfer();
	this.surfer_cont.addChild(this.surfer);
	surfer.setWave(this).takeOff(center,0);
*/
	//set surfer are on wave
	// this.surfersOnWave = true;

	//init timer continuous breaking and lip drawing	
	setTimeout(function() { 
		wave.breaking();
		createjs.Ticker.addEventListener('tick',wave.tick); 
	}, wave.breaking_xspeed, wave); //hack setTimeout to work with POO
	

}

Wave.prototype.breaking = function() {
	
	//calcul and add left breaking point
	var x = this.breaking_points[0].x - this.breaking_width;
	this.addLeftBreakingPoint(x);

	//calcul and add right breaking point
	var x = this.breaking_points[this.breaking_points.length-1].x + this.breaking_width;	
	this.addRightBreakingPoint(x);
	
	//continuous breaking
	wave.breakingTimer = setTimeout(function() { wave.breaking(); }, wave.breaking_xspeed, wave);
}


Wave.prototype.addBlockBreaking = function(width) {

	if(typeof(width)==='undefined') width = 300;
	if(wave.direction==0) return;
	if(wave.direction==1){
		while( width > 0 ) {
			var x = this.breaking_points[0].x - this.breaking_width;
			var point = this.createBreakingPoint('green');
			point.x = x;
			this.lip_points.addChild(point);
			this.breaking_points.unshift(point);
			width = width - this.breaking_width;
		}		
	}
	if(wave.direction==-1){
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

Wave.prototype.continueBreaking = function() {

	console.log('continueBreaking');
	wave.status = 'run';
	createjs.Ticker.setPaused(false);
	wave.breaking();
}
Wave.prototype.stopBreaking = function() {

	console.log('stopBreaking');
	wave.status = 'stop';
	clearTimeout(wave.breakingTimer);
	createjs.Ticker.setPaused(true);
	
}

Wave.prototype.addInitBreakingPoint = function(x) {

	var point = this.createBreakingPoint('red',0);
	point.x = x;
	this.lip_points.addChild(point);
	this.breaking_points.push(point);
}

Wave.prototype.addRightBreakingPoint = function(x) {

	var point = this.createBreakingPoint();
	point.x = x;
	this.lip_points.addChild(point);
	this.breaking_points.push(point);
}

Wave.prototype.addLeftBreakingPoint = function(x) {

	var point = this.createBreakingPoint();
	point.x = x;
	this.lip_points.addChild(point);
	this.breaking_points.unshift(point);
}


Wave.prototype.createBreakingPoint = function(color,delay) {

	delay = typeof(delay) === 'undefined' ? delay = this.breaking_xspeed : delay;
	color = typeof(color) === 'undefined' ? color = 'red' : color;

	var point = new createjs.Container();
	var shape = new createjs.Shape();
	shape.graphics.beginFill(color).drawCircle(0,0,5);
	//point.addChild(shape);
	
	createjs.Tween.get(point)
			.wait(delay)
			.to(
				{y:this.yheight},
				this.breaking_yspeed+Math.random()*50,
				createjs.Ease.getPowIn(5)
				)
			.call(this.splashPointReached);


	return point;
}

Wave.prototype.splashPointReached = function(obj) {

	if(wave.direction=='') wave.setDirection();

	var point = obj.target;
	var splash = new createjs.Shape();
		splash.graphics.beginFill('#EEEEEE').drawCircle(0,0,2);
		splash.alpha = 0.7;
		point.addChild(splash);

	var mask = new createjs.Shape();
		mask.graphics.beginFill('#FFF').drawRect(-wave.width/4,-wave.yheight,wave.width/2,wave.yheight);
		splash.mask = mask;

	var scale = wave.yheight;
		scale = scale*0.40 +Math.random()*10;

	createjs.Tween.get(splash)
		.to({scaleX:scale,scaleY:scale},1000)
		.call(function(){ wave.updateVanishPoints(point.x); })
		.to({scaleX:scale-scale*0.2,scaleY:scale-scale*0.2},2500,createjs.Ease.easeOutSine)
		;
}

Wave.prototype.setDirection = function() {

	if(wave.surfers.length == 0) return wave.direction = 0;

	//set direction
	if(wave.surfer.x > wave.breaking_center) {
		wave.direction = -1;	
		console.log('Wave is a right !');
	} 
	else {
		wave.direction = 1;
		console.log('Wave is a left !');
	}

	//add suction direction for left waves
	if(wave.direction == 1) wave.suction = vec2.fromValues(wave.suction[0]*-1,wave.suction[1]);	


	//init points cleaner
	wave.initCleanOffScreenPoints();
}

Wave.prototype.moveWave = function() {
	
	if(wave.direction === 0) return;
	if(wave.direction === 1) {
		//get vanish point x
		var pt = wave.cont.localToGlobal(wave.getLeftVanishPoint().x,0);
		//if wave not positionned
		if(pt.x >= (STAGEWIDTH-100)) wave.cont.x += wave.breaking_width;
		//else move normaly
		else wave.cont.x += wave.breaking_width*1.5;
	}
	if(wave.direction === -1) {
		//get vanish point x
		var pt = wave.cont.localToGlobal(wave.getRightVanishPoint().x,0);
		//if wave not positionned
		if(pt.x <= 100) wave.cont.x -= wave.breaking_width;
		//else move normaly
		else wave.cont.x -= wave.breaking_width*1.5;			
	}

}

Wave.prototype.initCleanOffScreenPoints = function() {

	wave.offscrenCleaner = window.setInterval(wave.cleanOffScreenPoints,1000);
}

Wave.prototype.cleanOffScreenPoints = function() {

	var n = wave.breaking_points.length;
	for(var i = 0; i < n; i++) {
		var point = wave.breaking_points[i];
		var x = wave.lip_points.localToGlobal(point.x,point.y).x;
		//remove point if offscreen on the left
		if( x < (-wave.width/2) ) {
			wave.breaking_points.slice(0,1);
			wave.lip_points.removeChild(point);
		} 
		//remove point if offscreen on the right
		if( x > (wave.width*1.5) ) {
			wave.breaking_points.slice(wave.breaking_points.length - 1, 1);
			wave.lip_points.removeChild(point);
		}

	}
}


Wave.prototype.drawLip = function() {

	var shape = new createjs.Shape();
	//shape.alpha = 0.5;

	//draw main lip
	var length = wave.breaking_points.length;
	var points = wave.breaking_points;
	var k = shape.graphics.clear().beginFill('rgba(255,255,255,0.5)').beginStroke('#FFF').setStrokeStyle(3);
	k.moveTo(points[0].x,points[0].y);
	for( i=1; i<points.length -2; i++){
			var xc = ( points[i].x + points[i+1].x) / 2;
			var yc = ( points[i].y + points[i+1].y) / 2;
			k.quadraticCurveTo(points[i].x,points[i].y,xc,yc);
	}
	//faire passer par l'avant dernier point
	k.quadraticCurveTo(points[i].x,points[i].y,points[i+1].x,points[i+1].y);		
	//le dernier point
	//k.lineTo(points[0].x,points[0].y);


	//draw extra peaks if exist
	if(wave.breaking_peaks.length>0) {
		var length = wave.breaking_peaks.length;
		var points = wave.breaking_peaks;
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

Wave.prototype.addBreakingPeak = function(width,distance) {

	var point = this.createBreakingPoint('pink',0);
	if(wave.direction==1) point.x = this.breaking_points[0].x - distance;
	if(wave.direction==-1) point.x = this.breaking_points[this.breaking_points.length - 1].x + distance;	
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

	wave.breakingPeaksTimer = setInterval(function() { wave.breakingPeaks(); }, wave.breaking_xspeed * 2, wave);
}


Wave.prototype.breakingPeaks = function() {
	
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
	if(wave.direction==-1 && this.breaking_peaks[0].x <= this.breaking_points[this.breaking_points.length - 1].x + wave.breaking_width*2)
	{		
		//merge points
		this.breaking_points = this.breaking_points.concat(this.breaking_peaks);
		//clear peak points
		this.breaking_peaks = [];
		//stop breaking the peak
		return clearInterval(wave.breakingPeaksTimer);
	}
	//for left waves
	if(wave.direction==1 && this.breaking_peaks[this.breaking_peaks.length - 1].x > this.breaking_points[0].x - wave.breaking_width*2)
	{		
		//merge points
		this.breaking_points = this.breaking_peaks.concat(this.breaking_points);
		//clear peak points
		this.breaking_peaks = [];
		//stop breaking the peak
		return clearInterval(wave.breakingPeaksTimer);
	}
	
}

Wave.prototype.drawSpatter = function() {

	var graphics = new createjs.Graphics()
				.beginFill(createjs.Graphics.getRGB(255, 255, 255))
				.drawCircle(0, 0, 1)
				;
 
	
	for(var i = 1; i<= 50; i++) {
		var spatter = new createjs.Shape(graphics)
		spatter.x = wave.surfer.x;
		spatter.y = wave.surfer.y;
		

		var dx = Math.random(100)*(Math.round(Math.random())*2 - 1);

		createjs.Tween.get(spatter)
			.to({				
				alpha: 0
			},500);

		wave.spatter_cont.addChild(spatter);

	}
}


Wave.prototype.drawTrails = function() {

	//if no surfer on wave, dont do anything
	if(wave.surfersOnWave==false) return;

	//begin by clearing all trails
	wave.trail_debug.removeAllChildren();
	wave.trail_cont.removeAllChildren();
	
	//var
	var surfer = wave.surfer;
	var nb = surfer.trailpoints.length - 1;
	var trailpoints = surfer.trailpoints.slice(0);
	var points = [];
	var xs = [];

	//update points with the suction vector
	for (var i = 0; i <= nb; i++) {
		//apply vector suction
		var pos = surfer.trailpoints[i];
		vec2.add(pos,pos,wave.suction);
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
	 // 		box.graphics.beginLinearGradientFill(["#000000", "rgba(0, 0, 0, 0)"], [0, 1], 0, 0, STAGEWIDTH, 0);
	 // 		box.graphics.moveTo(0,0);
	 // 		box.graphics.drawRect(0, 0, STAGEWIDTH, wave.yheight);
	 // 		box.cache(0, 0, STAGEWIDTH, wave.yheight);
	 // 	trail.filters = [
	 // 		new createjs.AlphaMaskFilter(box.cacheCanvas) 		
	 // 	];
 	//cache the shape 	
	trail.cache(xmin,0,xmax-xmin,wave.yheight);
	//subtrail.cache(xmin,0,xmax-xmin,wave.yheight);
	trail.alpha = 0.3;
	//subtrail.alpha = 0.1;
 	
	//trail mask		
	var masker = new createjs.Shape();
	masker.graphics.beginFill('red').drawRect(points[0].x - STAGEWIDTH, 0, STAGEWIDTH*2, 200);
	//apply mask
	trail.mask = masker;
	subtrail.mask = masker;

	//add trail
	wave.trail_cont.addChild(trail);
	wave.trail_cont.addChild(subtrail);
	
}

Wave.prototype.initVanishPoints = function(x) {

	var vanish = new createjs.Shape();
	vanish.graphics.beginFill('green').drawCircle(0,0,10);
	vanish.x = x - 1;
	this.vanishs_cont.addChild(vanish);

	var vanish = new createjs.Shape();
	vanish.graphics.beginFill('green').drawCircle(0,0,10);
	vanish.x = x + 1;
	this.vanishs_cont.addChild(vanish);
}
Wave.prototype.updateVanishPoints = function(x) {
	
	var point;
	if(wave.direction == 1) {
		var point = this.vanishs_cont.getChildAt(0);
		if(x > point.x) return;
		return point.x = x;		
	}
	if(wave.direction == -1) {
		var point = this.vanishs_cont.getChildAt(1);
		if( x < point.x ) return;
		return point.x = x;		
	}
}
Wave.prototype.getLeftVanishPoint = function() {
	return this.vanishs_cont.getChildAt(0);
}
Wave.prototype.getRightVanishPoint = function() {
	return this.vanishs_cont.getChildAt(1);
}
Wave.prototype.getVanishPoint = function() {
	if(wave.direction == 1) return this.getLeftVanishPoint();
	if(wave.direction == -1) return this.getRightVanishPoint();
	return this.getLeftVanishPoint();
}
Wave.prototype.getClosestVanishPoint = function(x) {
	var dl = get1dDistance(x,this.getLeftVanishPoint().x);
	var dr = get1dDistance(x,this.getRightVanishPoint().x);
	if( dr <= dl ) return this.getRightVanishPoint();
	else return this.getLeftVanishPoint();
}
