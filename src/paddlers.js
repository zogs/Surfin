	(function() {

	function Paddler(params) {

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

		this.paddling_force = 0;
		this.paddling_progress = 0;
		this.height = 300;
		this.heightInMeter = 2;
		this.lifttotal = 0;
		this.isPlayer = true;
		this.isPaddling = false;
		this.isDucking = false;

		this.skill = {
			speed: 1, //0 to 1
			aerial: 1, //0 to 1
			agility: 0.8, //0 to 1
			paddling: 1,
		}

		this.cont = new createjs.Container();
		this.addChild(this.cont);

		this.silhouette_cont = new createjs.Container();
		this.cont.addChild(this.silhouette_cont);
		this.initPaddler();

		this.debug_cont = new createjs.Container();
		this.cont.addChild(this.debug_cont);

		this.hitbox = new createjs.Shape();
		this.hitbox.graphics.beginFill('orange').drawCircle(0,0,1);
		this.hitbox.alpha = 0;
		this.hitbox_radius = 1;
		this.cont.addChild(this.hitbox);

		this.resize();

		this.addEventListener("tick", proxy(this.tick, this));

		this.initListeners();

	}

	prototype.getX = function() {
		return this.x;
	}

	prototype.getY = function() {
		return this.y + this.cont.y;
	}

	prototype.tick = function() {
		if(PAUSED) return;
		this.checkDucking();
		this.drawDebug();
	}

	prototype.initListeners = function() {

		this.click_listener = window.Stage.on('click',proxy(this.movePaddler,this),this);

	}

	prototype.remove = function() {

		this.removeAllChildren();
		this.removeAllListeners();
		this.removeAllEventListeners();
	}

	prototype.removeAllListeners = function() {

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

		return (this.y - this.spot.planet.lines.horizon) / (this.spot.planet.lines.peak - this.spot.planet.lines.horizon);
	}

	prototype.getScaleByWaveSize = function() {

		return (this.spot.config.waves.height / this.height) * (this.spot.config.waves.real_height / this.heightInMeter)
	}

	prototype.resize = function() {

		this.scale = this.getScaleByPosition() * this.getScaleByWaveSize();

		this.silhouette.scaleX = this.scale;
		this.silhouette.scaleY = this.scale;
		this.silhouette.x = (- this.silhouette.spriteSheet._frameWidth/2) * this.scale;
		this.silhouette.y = (- this.silhouette.spriteSheet._frameHeight/2) * this.scale;

		this.hitbox.scale = this.hitbox_radius = this.scale * 50;

	}

	prototype.liftup = function(y) {

		this.cont.y = this.cont.y - y;
		this.lifttotal += y;
		this.liftamount = y;
	}

	prototype.liftdown = function() {

		this.cont.y = this.cont.y + this.lifttotal;
		this.lifttotal = 0;
		this.liftamount = 0;
	}

	prototype.movePaddler = function(evt) {

		var x = evt.stageX;
		var y = evt.stageY;
		var t = 1000;

		//calcul angle
		var angle = calculAngle(this.x,this.y,x,y);
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
		var power = this.skill.paddling * 100;
		//perspective ajustment
		if(direction == 'up') power = power/2;
		if(direction == 'down') power = power/3;

		//if a previous paddling is 50% progressed, add a extra power
		this.paddling_force = this.paddling_force + this.skill.paddling + this.paddling_progress/100;
		t -= (t*(this.paddling_progress)/100)*1/2;
		createjs.Tween.get(this, {override:true}).to({paddling_progress: 100}, t, createjs.Tween.quartOut).addEventListener('change', proxy(this.updatePaddlingProgress,this, [direction]));

		//throw event
		var e = new createjs.Event("paddler_paddling");
		e.paddler = this;
		e.direction = direction;
		e.force = this.paddling_force;
		this.spot.dispatchEvent(e);

		// move paddler only horizontaly
		if(direction == 'left' || direction == 'right') {
			//calcul the arrival point
			var point = findPointFromAngle(this.x, this.y, angle, power);
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

	prototype.checkDucking = function() {

		let wave = SPOT.firstWaveBehindPaddler(this);

		if(!wave) return;

		for(let i=0,ln=wave.allpoints.length-1; i< ln; ++i){
			let point = wave.allpoints[i];
			let minDistance = this.hitbox_radius;
			let xDist = (wave.getX() + point.x) - (this.x + this.cont.x + this.hitbox.x);
			let yDist = (wave.getY() - wave.params.height + point.y) - (this.y + this.cont.y + this.hitbox.y);
			let distance = Math.sqrt(xDist*xDist + yDist*yDist);
			if(distance < minDistance && this.isDucking === false) {
				this.isDucking = true;
				//init ducking
				createjs.Tween.get(this).to({alpha:0},200)
					.wait(50)
					.call(proxy(this.duckWave, this, [wave]))
				return;
			}
		}
	}

	prototype.duckWave = function(wave) {
		SPOT.sea_cont.swapChildren(this,wave);
		//this.y = wave.y;
		this.alpha = 1;
		this.isDucking = false;
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
		    images: [queue.getResult('paddler')],
		    frames: {width:parseInt(300*rX), height:parseInt(300*rY), count:11},
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
	        }
		    }
		});

		this.silhouette = new createjs.Sprite(paddler_sheet, "waitright");
		this.silhouette_cont.addChild(this.silhouette);
	}

	prototype.clearPaddler = function() {

		clearTimeout(this.lifted);
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

		this.Paddler_constructor(config);
		this.initBot(config);
	}

	var prototype = createjs.extend(PaddlerBot, Paddler);


	prototype.initBot = function() {

		this.isBot = true;
		this.isPlayer = false;
		this.paddling_interval = null;
		this.paddling_attempt = 0;

		this.addEventListener('tick',proxy(this.tick,this));
	}

	prototype.tick = function(e) {

		this.paddlingOnWave();
	}

	prototype.paddlingOnWave = function() {

		var waves = this.spot.waves;

		for(var i=0,len=waves.length; i<len; i++) {

			var wave = waves[i];
			//if bot is placed on the wave
			if(this.getY() < wave.y - wave.params.height/2 && this.getY() > wave.y - wave.params.height) {

				this.isOnWave = true;

				this.initTakeoffPaddling();

				return;
			}
		}

		this.isOnWave = false;
	}

	prototype.initTakeoffPaddling = function() {

		if(this.paddling_interval) return;

		this.takeOffPaddling();

		this.paddling_interval = window.setInterval(proxy(this.takeOffPaddling,this),500);
	}

	prototype.takeOffPaddling = function(e) {

		this.movePaddler({stageX: this.x, stageY: STAGEHEIGHT});

		this.paddling_attempt++;

		if(this.isOnWave == false) {

			window.clearInterval(this.paddling_interval);
			this.paddling_interval = null;
			this.paddling_attempt = 0;
		}

	}

	window.PaddlerBot = createjs.promote(PaddlerBot, 'Paddler');


})();