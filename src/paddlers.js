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
		this.config.pixel_height = 150*rY; //average pixel height of character
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

	prototype.getX = function() {
		return this.x;
	}

	prototype.getY = function() {
		return this.y;
	}

	prototype.tick = function() {
		if(PAUSED) return;
		this.checkDucking();
		this.ajustVisibility();
		this.drawDebug();
	}

	prototype.initListeners = function() {

		this.ticker = this.on("tick", this.tick, this);
		this.click_listener = window.Stage.on('click',proxy(this.movePaddler,this),this);
	}

	prototype.remove = function() {

		this.removeAllChildren();
		this.removeAllListeners();
		this.removeAllEventListeners();
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

	prototype.ajustVisibility = function() {

		let wave = this.spot.getWaveBeforePaddler(this);
		if(wave) {
			if(wave.alpha <= 0) {
				return this.alpha = 1;
			}
			else if(this.y < wave.y - wave.params.height + this.hitbox_radius) {
				return this.alpha = 1;
			}
			else {
				return this.alpha = 0.2;
			}
		}
		else {
			return this.alpha = 1;
		}
	}

	prototype.setCurrentWave = function(wave) {
		//console.log(this.id, wave.name)
		this.currentWave = wave;
	}

	prototype.checkDucking = function() {

		//find wave to catch
		let wave = this.spot.getWaveBehindPaddler(this);
		//return early if no wave
		if(!wave) return;
		// when paddler is on the wave
		if(this.y < wave.y && this.y > wave.y - wave.params.height) {
				//lift paddler when on the wave
        this.liftup(1);
				// set current wave
				if(wave !== this.currentWave) this.setCurrentWave(wave);
    }
		//simulate ducking when over the wave
		if(this.y < wave.y - wave.params.height + this.hitbox_radius*2) {
			return this.duckWave(wave);
		}
    //duck paddler when close to the top
		for(let i=0,ln=wave.allpoints.length-1; i< ln; ++i){
			let point = wave.allpoints[i];
			let coor = wave.localToGlobal(point.x,point.y - wave.params.height);
			let loc = this.localToGlobal(0,0);
			let xDist = (loc.x) - (coor.x);
			let yDist = (loc.y) - (coor.y);
			let distance = Math.sqrt(xDist*xDist + yDist*yDist) - this.hitbox_radius*2;
			if(distance <= 60) {
				return this.duckWave(wave);
			}
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
				this.spot.sea_cont.swapChildren(this,wave);
				this.liftdown(wave);
				this.isDucking = false;
				ev.remove();
			}
		})
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

	prototype.initPaddler = function() {

		var paddler_sheet = new createjs.SpriteSheet({
		    images: [queue.getResult(this.config.img)],
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

	prototype.clearPaddler = function() {

		this.removeAllListeners();
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
		console.log(this.id)
	}

	var prototype = createjs.extend(PaddlerBot, Paddler);


	prototype.initBot = function() {

		this.isBot = true;
		this.isPlayer = false;
		this.paddling_interval = null;
		this.paddling_attempt = 0;
		this.tryTakeoff = false;
		this.isTakingOff = false;

		this.addEventListener('tick',proxy(this.tick,this));
	}

	prototype.initListeners = function() {
		this.ticker = this.on("tick", this.tick, this);
	}

	prototype.removeAllListeners = function() {
		this.off('tick', this.ticker);
	}

	prototype.tick = function(e) {
		if(PAUSED) return;
		this.checkDucking();
		this.ajustVisibility();
		this.launchTakeOff();
		this.drawDebug();
		//this.paddlingOnWave();
	}

	prototype.setCurrentWave = function(wave) {
		//console.log(this.id, wave.name)
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

		let n = Math.random()*100;
		if(n < 0) {
			this.tryTakeoff = true;
		}
	}

	prototype.launchTakeOff = function() {

		let wave = this.spot.getWaveBehindPaddler(this);
		if(!wave) return;

		if(this.tryTakeoff === true && this.isTakingOff === false && this.isDucking === false && this.y < wave.y - wave.params.height*1/3) {
			this.isTakingOff = true;
			this.initTakeoffPaddling(wave);
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