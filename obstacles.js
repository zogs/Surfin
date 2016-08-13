(function() {
	
	function Obstacle(config) {

		this.Container_constructor();
		this.init(config);
	}

	var prototype = createjs.extend(Obstacle, createjs.Container);
	//add EventDispatcher
	createjs.EventDispatcher.initialize(prototype);

	//init 
	prototype.init = function(config) {
		
		this.config = config || {};
		this.wave = this.config.wave;
		this.img = this.config.img != undefined ? this.config.img : 'surfer_paddle';
		this.config.name = config.name || 'paddler';

		this.location = new vec2.create();		
		this.ducking = false;
		this.hitted = false;
		this.bonuses = [];
		this.maluses = [];

		this.image_cont = new createjs.Container();
		this.addChild(this.image_cont);
		this.debug_cont = new createjs.Container();
		this.addChild(this.debug_cont);

		this.drawImage();
		this.drawMalus();
		this.drawBonus();

		if(DEBUG) {
			this.center = new createjs.Shape();
			this.center.graphics.beginFill('red').drawCircle(0,0,2);
			this.addChild(this.center);			
		}

		this.initialPosition();

		this.initListeners();
	}

	prototype.initListeners = function() {

		this.addEventListener('tick',proxy(this.tick,this));
	}

	prototype.removeListeners = function() {

		this.removeAllEventListeners('tick');
	}

	prototype.initialPosition = function() {

		var x;
		var y = (STAGEHEIGHT - this.wave.y) + this.wave.params.height;

		if(this.wave.direction == -1) {
			var x = this.wave.shoulder_right.x + ( STAGEWIDTH - Math.random()*STAGEWIDTH/2);
		}
		if(this.wave.direction == 1) {
			var x = this.wave.shoulder_left.x - ( STAGEWIDTH - Math.random()*STAGEWIDTH/2);
		}

		this.x = x;
		this.y = y;
		this.location = vec2.fromValues(x,y);
	}

	prototype.tick = function() {

		if(PAUSED) return;
		this.move();
		this.check();
	}

	prototype.hitBonus = function(surfer) {

		if(this.hitted == true) return;
		var j = this.bonuses.length;
		while(j--) {
			var point = this.bonuses[j];
			var radius = point.graphics.command.radius;
			if(surfer.hitSurf(point,radius)) {
				this.hitted = true;
				surfer.dispatchEvent('bonus_hitted_paddler');
				return true;
			}
		}
		return false;
	}

	prototype.hitMalus = function(surfer) {

		if(this.hitted == true) return;
		var i = this.maluses.length;
		while(i--) {
			var point = this.maluses[i];
			var radius = point.graphics.command.radius;
			if(surfer.hitSurf(point,radius)) {
				this.hitted = true;
				surfer.dispatchEvent('malus_hitted_paddler');
				return true;
			}
		}
		return false;
	}

	prototype.drawImage = function() {
		
		var img = new createjs.Bitmap(queue.getResult(this.img));
		this.image_cont.x = - img.image.width / 2;
		this.image_cont.y = - img.image.height / 2;
		this.image_cont.addChild(img);

	}

	prototype.drawBonus = function() {

		var bonus = new createjs.Shape();
			bonus.graphics.beginFill('green').drawCircle(0,0,20);
			bonus.y = 30;
			if(!DEBUG) bonus.alpha = 0;
			this.debug_cont.addChild(bonus);
			this.bonuses.push(bonus);
	}

	prototype.drawMalus = function() {

		var malus = new createjs.Shape();
			malus.graphics.beginFill('red').drawCircle(0,0,20);
			if(!DEBUG)  malus.alpha = 0;
			this.debug_cont.addChild(malus);
			this.maluses.push(malus);
	}

	prototype.move = function() {

		var moving = vec2.fromValues(0,-5);
		vec2.add(this.location,this.location,moving);
		this.x = this.location[0];
		this.y = this.location[1];
	}

	/*
	prototype.resize = function() {

		//only resize when object is coming to the wave ( not "on" the wave)
		if(this.y < this.wave.params.height) return;

		var scale = 1.5 * (this.wave.y - this.wave.params.height/2 - this.wave.spot.getHorizon()) / (this.wave.spot.getPeak() - this.wave.spot.getHorizon());
		this.scaleX = this.scaleX * scale;
		this.scaleY = this.scaleY * scale;
	}
	*/

	prototype.check = function() {

		if(this.ducking == true) return;

		if(this.y < this.wave.params.height/3) {
			this.ducking = true;
			createjs.Tween.get(this)
				.to({ alpha: 0}, 300)
				.call(proxy(this.wave.removeObstacle,this.wave,[this]));
		}
	}

	prototype.bonusHitted = function() {

		//nothing
	}

	prototype.malusHitted = function() {

		//nothing
	}

	//assign Obstacle to window's scope & promote
	window.Obstacle = createjs.promote(Obstacle, "Container");
}());


(function() {

		function Photograf(config) {

			config.img = 'photographer';
			config.name = 'photo';

			this.Obstacle_constructor(config);		    

		}
		Photograf.prototype = Object.create(Obstacle.prototype);
		Photograf.prototype.constructor = Photograf;
		window.Photograf = createjs.promote(Photograf, "Obstacle");

		Photograf.prototype.drawImage = function() {			

			var sheet = new createjs.SpriteSheet({
			    images: [queue.getResult(this.img)],
			    frames: {width:100, height:80, regX:30, regY:50},
			    framerate: 1,
			    animations: {	        
			        swim: 0,
			        flash: [1,1,'swim'],
			    }
			});

			this.animation = new createjs.Sprite(sheet);;	
			this.image_cont.addChild(this.animation);
			
		}

		Photograf.prototype.drawBonus = function() {

			var bonus = new createjs.Shape();
			bonus.graphics.beginFill('green').drawCircle(0,0,30);
			bonus.y = -30;
			if(this.wave.direction == -1) bonus.x = -60;
			if(this.wave.direction == 1) bonus.x = 60;
			if(!DEBUG) bonus.alpha = 0;
			this.debug_cont.addChild(bonus);
			this.bonuses.push(bonus);
		}

		Photograf.prototype.drawMalus = function() {

			var malus = new createjs.Shape();
				malus.graphics.beginFill('red').drawCircle(0,0,10);
				if(!DEBUG) malus.alpha = 0;				
				this.debug_cont.addChild(malus);
				this.maluses.push(malus);
		}

		Photograf.prototype.bonusHitted = function() {

			this.animation.gotoAndPlay('flash');
		}

		Photograf.prototype.malusHitted = function() {

			//no malus action
		}

}());


(function() {

		function FlyingMultiplier(config) {

			config.name = 'multiplier';
			this.multiplier = config.multiplier || 2;	

			this.Obstacle_constructor(config);

		}
		
		var prototype = createjs.extend(FlyingMultiplier, Obstacle);

		prototype.move = function() {

			var moving = vec2.fromValues(0,0);
			vec2.add(this.location,this.location,moving);
			this.x = this.location[0];
			this.y = this.location[1];
		}

		prototype.initialPosition = function() {

			if(this.wave.direction == -1) {
				var x = this.wave.shoulder_right.x + STAGEWIDTH * 2/3
				var y = - Math.random()*200
			}
			if(this.wave.direction == 1) {
				var x =  this.wave.shoulder_left.x - STAGEWIDTH * 2/3
				var y = - Math.random()*200
			}

			this.x = x;
			this.y = y;
			this.location = vec2.fromValues(x,y);

		}

		prototype.check = function() {

			if(this.wave.direction==1 && this.x > this.wave.shoulder_left.x + STAGEWIDTH
				||
				this.wave.direction==-1 && this.x < this.wave.shoulder_right.x - STAGEWIDTH
			) {	
				this.wave.removeObstacle(this);
			}			
		}

		prototype.drawImage = function() {			

			var graphics = new createjs.Graphics()
					.setStrokeStyle(5)
					.beginStroke('rgba(255,255,255,0.5)')
					.beginFill('rgba(255,255,255,1)')
					.drawCircle(0, 0, 15)
					;	 
		
			var circle = new createjs.Shape(graphics)
			this.image_cont.addChild(circle);
			
			var text = new createjs.Text('','normal 20px BubblegumSansRegular','#000')
			text.text = 'x'+this.config.multiplier;
			var b = text.getBounds()
			text.x = - b.width / 2
			text.y = - b.height / 2

			this.image_cont.addChild(text)
		}

		prototype.drawBonus = function() {

			var bonus = new createjs.Shape();
			bonus.graphics.beginFill('green').drawCircle(0,0,30);
			bonus.alpha = 0.1
			this.debug_cont.addChild(bonus);
			this.bonuses.push(bonus);
		}

		prototype.drawMalus = function() {
			//no malus
		}

		prototype.bonusHitted = function() {
			createjs.Tween.get(this).to({scaleX:4,scaleY:4,alpha:0},300);
		}

		window.FlyingMultiplier = createjs.promote(FlyingMultiplier, "Obstacle");

}());