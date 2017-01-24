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

		this.spot = params.spot;

		this.x = params.x;
		this.y = params.y;

		this.paddling_force = 0;
		this.paddling_progress = 0;
		this.pixel_height = 80;
		this.lifttotal = 0;
		this.isPlayer = true;
		this.isPaddling = false;

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
		if(DEBUG) this.drawDebug();

		this.resize();

		this.initListeners();

	}

	prototype.getX = function() {
		return this.x;
	}

	prototype.getY = function() {
		return this.y + this.cont.y;
	}

	prototype.initListeners = function() {

		this.click_listener = stage.on('click',proxy(this.movePaddler,this),this);			

	}

	prototype.removeListeners = function() {

		stage.off('click',this.click_listener);
	}

	prototype.drawDebug = function() {

		var center = new createjs.Shape();
		center.graphics.beginFill('red').drawCircle(0,0,3);		
		this.debug_cont.addChild(center);
	}

	prototype.getSurferProportion = function() {

		var c = (1.8 / this.spot.config.waves.real_height) * (this.spot.config.waves.height / ( this.pixel_height/2));
		return c;
	}

	prototype.resize = function() {

		var scale = (this.y - this.spot.config.lines.horizon) / (this.spot.config.lines.beach - this.spot.config.lines.horizon);

		this.scale = scale * this.getSurferProportion();

		this.silhouette.scaleX = this.scale;
		this.silhouette.scaleY = this.scale;
		this.silhouette.x = (- this.silhouette.spriteSheet._frameWidth/2) * this.scale;
		this.silhouette.y = (- this.silhouette.spriteSheet._frameHeight/2) * this.scale;		

	}

	prototype.liftup = function(y) {

		if(this.lifted) return;

		this.cont.y = this.cont.y - y;
		this.lifttotal += y;
		this.liftamount = y;

	}

	prototype.liftdown = function() {

		if(this.lifttotal == 0) return;

		this.cont.y = this.cont.y + this.liftamount*2;
		this.lifttotal -= this.liftamount*2;

		if(this.lifttotal <=0) {
			window.clearTimeout(this.lifted);
			this.lifted = null;
			return;
		}

		this.lifted = window.setTimeout(proxy(this.liftdown,this),50);
	}

	prototype.movePaddler = function(evt) {
		var x = evt.stageX;
		var y = evt.stageY;

		//calcul angle
		var angle = calculAngle(this.x,this.y,x,y);
		//set silhouette accordingly
		this.setPaddlerSilhouette(angle);
		//power of paddling
		var power = this.skill.paddling * 100;
		//perspective ajustment
		if(this.paddling == 'up') power = power/2;
		if(this.paddling == 'down') power = power/3;
		//calcul the arrival point 
		var point = findPointFromAngle(this.x, this.y, angle, power);

		//if a previous paddling is 50% progressed, add a extra power
		if(this.paddling_progress > 50) {
			this.paddling_force = this.paddling_force + this.skill.paddling + this.paddling_force*10/this.paddling_progress ;
		}
		else {
			this.paddling_force = this.paddling_force + this.skill.paddling;			
		}
		this.paddling_progress = 0;
		//move the paddler
		var tween = createjs.Tween.get(this, {override:true});
			tween.to({ y:point.y, x:point.x, paddling_progress:100 },1000, createjs.Tween.quartOut).call(proxy(this.endMoving,this));
			tween.addEventListener('change',proxy(this.paddlingProgress,this));

			;		

		//throw event
		var e = new createjs.Event("paddler_paddling");
			e.paddler = this;
			stage.dispatchEvent(e);
	}

	prototype.endMoving = function() {

		this.isPaddling = false;
	}

	prototype.paddlingProgress = function(evt) {

		this.isPaddling = true;

		//resize paddler
		this.resize();

		if(this.paddling_progress === 100) {
			this.paddling_force = 0;
			this.paddling_progress = 0;			
		}
	}

	prototype.setPaddlerSilhouette = function(angle) {


		if(angle >= 45 && angle < 135) {
			this.paddling = 'down';
			this.silhouette.gotoAndPlay("down");
		}
		if(angle >= 135 && angle < 225) {
			this.paddling = 'left';
			this.silhouette.gotoAndPlay("left");
		}
		if(angle >= 225 && angle < 315) {
			this.paddling = 'up';
			this.silhouette.gotoAndPlay("up");
		}
		if(angle >=315 || angle < 45) {
			this.paddling = 'right';
			this.silhouette.gotoAndPlay("right");
		}

	}

	prototype.initPaddler = function() {

		var paddler_sheet = new createjs.SpriteSheet({
		    images: [queue.getResult('paddler')],
		    frames: {width:80, height:80, count:11},
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