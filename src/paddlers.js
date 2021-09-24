	(function() {

	function Paddler(params) {

		params.img = params.img || 'astropaddler';

		this.Container_constructor();
		this.init(params);
	}

	var prototype = createjs.extend(Paddler, createjs.Container);
	//add EventDispatcher
	createjs.EventDispatcher.initialize(prototype);
	//public static properties

	//init
	prototype.init = function(params) {

		this.x = params.x;
		this.y = params.y;
		this.spot = params.spot;
		this.config = params;

		this.paddling_force = 0;
		this.paddling_progress = 0;
		this.config.pixel_height = 60*rY; //average pixel height of character
		this.config.meter_height = 1;
		this.lifttotal = 0;
		this.isPlayer = true;
		this.isPaddling = false;
		this.isDucking = false;
		this.currentWave = null;

		this.skill = {
			speed: 1, //0 to 1
			aerial: 1, //0 to 1
			agility: 0.8, //0 to 1
			paddling: 1,
		}

    this.overlay_cont = new createjs.Container();
		this.addChild(this.overlay_cont);

		this.silhouette_cont = new createjs.Container();
		this.addChild(this.silhouette_cont);
		this.initPaddler();

		this.debug_cont = new createjs.Container();
		this.addChild(this.debug_cont);

		this.hitbox = new createjs.Shape();
		this.hitbox.graphics.beginFill('orange').drawCircle(0,0,1);
		this.hitbox.alpha = 0;
		this.hitbox_radius = 1;
		this.addChild(this.hitbox);


		this.initListeners();
	}

	prototype.initListeners = function() {

		this.ticker = this.on("tick", this.tick, this);
		this.click_listener = window.Stage.on('click',proxy(this.movePaddler,this),this);
	}

	prototype.tick = function() {
		if(PAUSED) return;
		this.checkCurrentWave();
		this.applyWaveLift();
		this.ajustVisibility();
		this.drawDebug();
	}

	prototype.initPaddler = function() {

		var paddler_sheet = new createjs.SpriteSheet({
		    images: [QUEUE.getResult(this.config.img)],
		    frames: {width:parseInt(300*rX), height:parseInt(150*rY), regX: parseInt(150*rX), regY: parseInt(75*rY)},
		    animations: {
		    	wait: 0,
		    	waitright: 1,
		    	waitleft: 6,
	        left: {
	            frames: [7,8,7,8,7,8],
	            next: "waitleft",
	            speed: 0.3
	        },
	        right: {
	        	frames: [2,3,2,3,2,3],
	        	next: "waitright",
	        	speed: 0.3
	        },
	        up: {
	        	frames: [9,10,9,10,9,10],
	        	next: "wait",
	        	speed: 0.3
	        },
	        down: {
	        	frames: [4,5,4,5,4,5],
	        	next: "wait",
	        	speed: 0.3
	        },
	        duck: {
	        	frames: [11,12,13,14],
	        	next: 'wait',
	        	speed: 0.6
	        }
		    }
		});
		this.silhouette = new createjs.Sprite(paddler_sheet, "waitright");
		this.silhouette_cont.addChild(this.silhouette);

	}

	prototype.setPaddlerSilhouette = function(direction) {

		if(direction == 'down') {
			this.silhouette.gotoAndPlay("down");
		}
		if(direction == 'left') {
			this.silhouette.gotoAndPlay("left");
		}
		if(direction == 'up') {
			this.silhouette.gotoAndPlay("up");
		}
		if(direction == 'right') {
			this.silhouette.gotoAndPlay("right");
		}
	}

	prototype.getPaddlingDirection = function(angle) {
		if(angle >= 45 && angle < 135) {
			return 'down';
		}
		if(angle >= 135 && angle < 225) {
			return 'left';
		}
		if(angle >= 225 && angle < 315) {
			return 'up';
		}
		if(angle >=315 || angle < 45) {
			return 'right';
		}
	}

	prototype.getScaleByPosition = function() {

		if(this.config.fixedsize) return this.config.fixedsize;
		return (this.y - this.spot.planet.lines.horizon) / (this.spot.planet.lines.peak - this.spot.planet.lines.horizon);
	}

	/*prototype.getScaleByWaveSize = function() {

		return (this.spot.config.waves.height / this.config.pixel_height) * (this.spot.config.waves.real_height / this.config.meter_height)
	}*/

	prototype.resize = function() {

		if(this.config.noresize) return;

		let wave = this.spot.getWaveBehindPaddler(this);
		let scale = wave.scaleToFit(this.config.pixel_height, this.config.meter_height);
		scale *= this.getScaleByPosition();

		this.silhouette.scaleX = scale;
		this.silhouette.scaleY = scale;
		this.hitbox.scale = this.hitbox_radius = scale * 50;

	}

	prototype.movePaddler = function(evt) {

		let x = evt.stageX;
		let y = evt.stageY;
		let t = 1000;

		//calcul angle
		let angle = calculAngle(this.x,this.y,x,y);
		//get direction
		let direction = this.getPaddlingDirection(angle);
		//do nothing on move up
		//if(direction == 'up') return;
		//set silhouette accordingly
		this.setPaddlerSilhouette(direction);
		//restrict angle according to the direction
		if(direction == 'down') angle = 90; // down
		if(direction == 'left') angle = 180; // left
		if(direction == 'up') angle = 270; // up
		if(direction == 'right') angle = 360; // right

		//power of paddling
		let power = this.skill.paddling * 100;
		//perspective ajustment
		if(direction == 'up') power = power/2;
		if(direction == 'down') power = power/3;

		//if a previous paddling is 50% progressed, add a extra power
		this.paddling_force = this.paddling_force + this.skill.paddling + this.paddling_progress/100;
		t -= (t*(this.paddling_progress)/100)*1/2;
		createjs.Tween.get(this, {override:true}).to({paddling_progress: 100}, t, createjs.Tween.quartOut).addEventListener('change', proxy(this.updatePaddlingProgress,this, [direction]));

		//throw event
		let e = new createjs.Event("paddler_paddling");
		e.paddler = this;
		e.wave = evt.wave || this.currentWave;
		e.direction = direction;
		e.force = this.paddling_force;
		this.spot.dispatchEvent(e);

		// move paddler only horizontaly
		if(direction == 'left' || direction == 'right') {
			//calcul the arrival point
			let point = findPointFromAngle(this.x, this.y, angle, power);
			//move the paddler
			createjs.Tween.get(this).to({ y:point.y, x:point.x}, t, createjs.Tween.quartOut);
		}


	}

	prototype.endMoving = function() {
		this.isPaddling = false;
		this.paddling_force = 0;
		this.paddling_progress = 0;
		this.silhouette.gotoAndPlay("wait");
	}

	prototype.updatePaddlingProgress = function(direction) {
		this.isPaddling = true;
		//this.silhouette.gotoAndPlay(direction);
		//resize paddler
		//this.resize();
		if(this.paddling_progress === 100) {
			this.endMoving();
		}
	}

	prototype.liftup = function(y) {
		if(this.config.nolift) return;

		this.y = this.y - y;
		this.lifttotal += y;
		this.liftamount = y;
	}

	prototype.liftdown = function(wave) {
		if(this.config.nolift) return;

		this.y = this.y + this.lifttotal;
		this.lifttotal = 0;
		this.liftamount = 0;
	}

	prototype.applyWaveLift = function() {
		let wave = this.spot.getWaveBehindPaddler(this);
		if(!wave) return;
		if(this.y < wave.y && this.y > wave.y - wave.params.height) {
			//lift paddler when on the wave
  		this.liftup(1);
    }
	}

	prototype.ajustVisibility = function() {

		let wave = this.spot.getWaveBeforePaddler(this);
		if(!wave) return this.alpha = 1;
		if(wave.alpha <= 0) {
			return this.alpha = 1;
		}
		else if(this.y < wave.y - wave.params.height + this.hitbox_radius*1/3) {
			return this.alpha = 1;
		}
		else {
			return this.alpha = 0;
		}
	}

	prototype.setCurrentWave = function(wave) {
		this.currentWave = wave;
	}

	prototype.checkCurrentWave = function() {
		let wave = this.spot.getWaveBehindPaddler(this);
		if(!wave) return;
		if(this.y < wave.y && this.y > wave.y - wave.params.height) {
				if(wave !== this.currentWave) this.setCurrentWave(wave);
    }
	}

	prototype.duckWave = function(wave) {
		//console.log(this.id, 'duckWave', wave.id)
		if(this.isDucking === true) return;
		this.isDucking = true;
		this.silhouette.stop();
		this.silhouette.gotoAndPlay("duck");
		this.silhouette.on('animationend', (ev) => {
			if(ev.name == 'duck') {
				this.swapWithWave(wave);
				this.liftdown(wave);
				this.isDucking = false;
				ev.remove();
			}
		})
	}

	prototype.swapWithWave = function(wave) {

		let cont = this.spot.sea_cont;
		// get paddlers in the display stack between this and the wave
		let paddlers = [];
		for(let i=cont.getChildIndex(wave),ln=cont.getChildIndex(this); i<ln; i++) {
			let obj = cont.getChildAt(i);
			if(obj instanceof Paddler || obj instanceof PaddlerBot) {
				paddlers.push(obj);
			}
		}
		// swap me and the wave
		cont.swapChildren(this, wave);
		// swap the other paddlers (in fact only the closest to the wave)
		if(paddlers.length > 0) cont.swapChildren(wave, paddlers[0])

	}

  prototype.showTapAnim = function() {

    let x = 0;
    let y = 80;

    var touchcircle = new createjs.Shape();
    touchcircle.graphics.beginFill('rgba(255,255,255,0.5)').drawCircle(0,0,1);
    touchcircle.x = x;
    touchcircle.y = y;
    touchcircle.alpha = 0;
    touchcircle.ox = touchcircle.x;
    touchcircle.oy = touchcircle.y;
    this.overlay_cont.addChild(touchcircle);

    var touchicon = new createjs.Bitmap(QUEUE.getResult('touchicon'));
    touchicon.regX = 35;
    touchicon.regY = 16;
    touchicon.scale = 0.7;
    touchicon.x = touchcircle.x;
    touchicon.y = touchcircle.y;
    touchicon.alpha = 0;
    touchicon.ox = touchicon.x;
    touchicon.oy = touchicon.y;
    touchicon.os = touchicon.scale;
    this.overlay_cont.addChild(touchicon);

    createjs.Tween.get(touchicon, {onComplete: proxy(this.touchAnimTapTwice, this)}).to({alpha:1}, 1000);
    createjs.Tween.get(touchcircle, {onComplete: proxy(this.touchAnimTapTwice, this)}).to({alpha:1}, 1000);
  }

  prototype.touchAnimTapTwice = function(ev) {
    let target = ev.target.target;
    if(target instanceof createjs.Bitmap) {
      createjs.Tween.get(target, {onComplete: proxy(this.touchAnimDrag, this)}).to({scale: target.os - 0.1, y: target.y -5},200).to({scale: target.os, y: target.y + 5},200).to({scale: target.os - 0.1, y: target.y -5},200).to({scale: target.os, y: target.y + 5},200).to({scale: target.os - 0.1, y: target.y + 5},200);
    }
    if(target instanceof createjs.Shape) {
      createjs.Tween.get(target, {onComplete: proxy(this.touchAnimDrag, this)}).wait(200).to({scale: 80, alpha:0},200).to({scale: 1, alpha:1}, 0).wait(200).to({scale: 80, alpha:0},200).to({scale: 1, alpha:0},0).to({scale: 40, alpha:0.5}, 200);
    }
  }

  prototype.touchAnimDrag = function(ev) {
    let target = ev.target.target;
    createjs.Tween.get(target, {onComplete: proxy(this.relaunchTouchAnim, this)}).to({x: target.x - 400}, 1000, createjs.Ease.quartInOut);
    createjs.Tween.get(target).to({y: target.y + 20}, 1000, createjs.Ease.sineInOut);
  }

  prototype.relaunchTouchAnim = function(ev) {
    let target = ev.target.target;
    createjs.Tween.get(target, {onComplete: proxy(this.touchAnimTapTwice, this)}).to(500).set({x: target.ox, y:target.oy, scale:1});
  }

	prototype.getX = function() {
		return this.x;
	}

	prototype.getY = function() {
		return this.y;
	}

	prototype.remove = function() {

		this.removeAllChildren();
		this.removeAllListeners();
		this.removeAllEventListeners();
	}

	prototype.clearPaddler = function() {

		this.removeAllListeners();
		this.removeAllChildren();
	}

	prototype.removeAllListeners = function() {

		this.off('tick', this.ticker);
		window.Stage.off('click',this.click_listener);
	}

	prototype.drawDebug = function() {

		if(DEBUG === 0) {
			this.hitbox.alpha = 0;
			return;
		}

		this.hitbox.alpha = 0.5;

		var center = new createjs.Shape();
		center.graphics.beginFill('red').drawCircle(0,0,3);
		this.debug_cont.addChild(center);

	}

	//assign Surfer to window's scope & promote
	window.Paddler = createjs.promote(Paddler, "Container");
}());


//======================
// PADDLER BOT
//======================
(function() {

	function PaddlerBot(config) {

		config.img = config.img || 'paddler';

		this.Paddler_constructor(config);
		this.initBot(config);

	}

	var prototype = createjs.extend(PaddlerBot, Paddler);


	prototype.initBot = function() {

		this.isBot = true;
		this.isPlayer = false;
		this.paddling_interval = null;
		this.paddling_attempt = 0;
		this.tryTakeoff = false;
		this.isTakingOff = false;
		this.scale = 0.75;
		this.scaleX *= Math.random()<=0.75 ? 1 : -1;

	}

	prototype.initListeners = function() {
		this.ticker = this.on("tick", this.tick, this);
	}

	prototype.removeAllListeners = function() {
		this.off('tick', this.ticker);
	}

	prototype.tick = function(e) {
		if(PAUSED) return;
		this.checkCurrentWave();
		this.applyWaveLift();
		this.ajustVisibility();
		this.actionOnWave();
		this.drawDebug();
	}

	prototype.setCurrentWave = function(wave) {
		this.currentWave = wave;
		this.changedWave();
		this.decideTakeOff(wave);
	}

	prototype.changedWave = function() {
		this.tryTakeoff = false;
		window.clearInterval(this.paddling_interval);
		this.paddling_interval = null;
		this.paddling_attempt = 0;
	}

	prototype.decideTakeOff = function(wave) {

		this.tryTakeoff = (Math.random()*100 < 30)? true : false;
	}

	prototype.actionOnWave = function() {

		let wave = this.spot.getWaveBehindPaddler(this);
		if(!wave) return;

		if(this.isDucking) return;
		if(this.isTakingOff) return;

		//simulate ducking when over the wave
		if(this.y < wave.y - wave.params.height + this.hitbox_radius*1/2) {
			return this.duckWave(wave);
		}

		//duck paddler when hit by the lip
		for(let i=0,ln=wave.allpoints.length-1; i< ln; ++i){
			let point = wave.allpoints[i];
			let coor = wave.localToGlobal(point.x,point.y - wave.params.height);
			let loc = this.localToGlobal(0,0);
			let xDist = (loc.x) - (coor.x);
			let yDist = (loc.y) - (coor.y);
			let distance = Math.sqrt(xDist*xDist + yDist*yDist);
			if(distance <= this.hitbox_radius) {
				return this.duckWave(wave);
			}
		}

		// decide duck or takeoff when at mid-height
		if(this.y < wave.y - wave.params.height*1/2) {
			if(wave.breakPercent < 90) return this.duckWave(wave);
			if(this.tryTakeoff && this.isTakingOff === false) {
				this.isTakingOff = true;
				return this.initTakeoffPaddling(wave);
			}
			return this.duckWave(wave);
		}
	}

	prototype.initTakeoffPaddling = function(wave) {
		if(this.paddling_interval) return;
		this.takeOffPaddling();
		this.paddling_interval = window.setInterval(proxy(this.takeOffPaddling,this,[wave]),400);
	}

	prototype.takeOffPaddling = function(wave) {
		if(this.isDucking) {
			clearInterval(this.paddling_interval);
			return;
		}
		this.movePaddler({stageX: this.x, stageY: STAGEHEIGHT, wave: wave});
		this.paddling_attempt++;
	}

	prototype.clearPaddler = function() {
		this.removeAllListeners();
		clearInterval(this.paddling_interval);
	}

	window.PaddlerBot = createjs.promote(PaddlerBot, 'Paddler');


})();