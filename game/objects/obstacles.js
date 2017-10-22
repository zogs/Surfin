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

		this.location = new Victor();
		this.ducking = false;
		this.hitted = false;
		this.bodies = [];
		this.bonuses = [];
		this.maluses = [];
		this.duck_y = this.wave.params.height / 5;

		this.image_cont = new createjs.Container();
		this.addChild(this.image_cont);
		this.debug_cont = new createjs.Container();
		this.debug_cont.alpha = 0;
		this.addChild(this.debug_cont);

		this.drawImage();
		this.drawMalus();
		this.drawBonus();

			this.center = new createjs.Shape();
			this.center.graphics.beginFill('red').drawCircle(0,0,2);
			this.addChild(this.center);		
		if(DEBUG) {

			this.debug_cont.alpha = 0.3;
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

		let x = this.wave.params.breaking_center + (200 - Math.random() * 400);
		let y = this.wave.spot.config.lines.obstacle - this.wave.y + this.wave.params.height;

		if(this.wave.direction === RIGHT) {
			x = this.wave.shoulder_right.x + Math.random() * (this.wave.params.shoulder.right.width);
		}
		if(this.wave.direction === LEFT) {
			x = this.wave.shoulder_left.x - Math.random() * (this.wave.params.shoulder.left.width);
		}

		this.x = x;
		this.y = y;
		this.location = new Victor(x,y);
	}

	prototype.tick = function() {

		if(PAUSED) return;
		this.move();
		this.checkRemove();
		this.onEnterFrame();
	}

	prototype.hitBonus = function(surfer) {

		if(this.hitted == true) return;
		let j = this.bonuses.length;
		while(j--) {
			const bonus = this.bonuses[j];
			const radius = bonus.graphics.command.radius;
			const zone = typeof bonus.hitzone == 'undefined' ? 'board' : bonus.hitzone;
			const x = this.x + (bonus.x * -1*this.wave.direction);
			const y = this.y + bonus.y;

			if(surfer.hit(zone,x,y,radius)) {
				this.hitted = true;
				this.bonusHitted(bonus);
				return true;
			}
		}
		return false;
	}

	prototype.hitMalus = function(surfer) {

		if(this.hitted == true) return;
		let i = this.maluses.length;
		while(i--) {
			const malus = this.maluses[i];
			const radius = malus.graphics.command.radius;
			const zone = typeof malus.hitzone == 'undefined' ? 'board' : malus.hitzone;
			const x = this.x + (malus.x * -1*this.wave.direction);
			const y = this.y + malus.y;

			if(surfer.hit(zone,x,y,radius)) {
				this.hitted = true;
				this.malusHitted(malus);
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
			this.debug_cont.addChild(bonus);
			this.bonuses.push(bonus);
	}

	prototype.drawMalus = function() {

		var malus = new createjs.Shape();
			malus.graphics.beginFill('red').drawCircle(0,0,20);
			this.debug_cont.addChild(malus);
			this.maluses.push(malus);
	}

	prototype.move = function() {

		const moving = new Victor(0, this.wave.params.suction.y);

		this.location.add(moving);
		this.x = this.location.x;
		this.y = this.location.y;
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

	prototype.checkRemove = function() {

		if(this.ducking == true) return;

		if(this.y < this.duck_y) {
			this.ducking = true;
			createjs.Tween.get(this)
				.to({ alpha: 0}, 300)
				.call(proxy(this.wave.removeObstacle,this.wave,[this]));
		}
	}

	prototype.onEnterFrame = function() {

		//nothing
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

		function BombObstacle(config) {

			config.img = 'bomb';
			config.name = 'bomb';			
			this.Obstacle_constructor(config);		    

		}
		BombObstacle.prototype = Object.create(Obstacle.prototype);
		BombObstacle.prototype.constructor = BombObstacle;
		window.BombObstacle = createjs.promote(BombObstacle, "Obstacle");

		BombObstacle.prototype.drawImage = function() {			
		
			var sheet = new createjs.SpriteSheet({
			    images: [queue.getResult('bomb_boom')],
			    frames: {width:312, height:285, regX: 155, regY: 142},
			    framerate: 1,
			    animations: {
			    	floating: [0, 1, false, 1],	        
			        explode: [2, 7, false, 0.5],
			    }
			});			

			this.sprite = new createjs.Sprite(sheet);
			this.sprite.scaleX = this.sprite.scaleY = 0.5;
			this.sprite.y = -50;
			this.sprite.gotoAndPlay('floating');	
			this.image_cont.addChild(this.sprite);

		}

		BombObstacle.prototype.drawBonus = function() {

			/* no bonus */
		}

		BombObstacle.prototype.drawMalus = function() {

			var malus = new createjs.Shape();
				malus.graphics.beginFill('red').drawCircle(0,0,30);
				malus.y = 0;
				malus.x = 5;
				malus.shotable = true;
				malus.onShoted = proxy(this.cancelMalus,this,[malus]);
				this.debug_cont.addChild(malus);
				this.maluses.push(malus);
		}

		BombObstacle.prototype.cancelMalus = function(malus) {

			createjs.Tween.get(this).to({alpha: 0}, 500);
			this.maluses.splice(this.maluses.indexOf(malus),1);
		}

		BombObstacle.prototype.bonusHitted = function() {

			/* no bonus */

		}

		BombObstacle.prototype.malusHitted = function() {

			this.sprite.gotoAndPlay('explode');	

		}

}());



(function() {

		function BeachTrooper(config) {

			config.img = 'beachtrooper';
			config.name = 'beachtrooper';			
			this.Obstacle_constructor(config);		    

		}
		BeachTrooper.prototype = Object.create(Obstacle.prototype);
		BeachTrooper.prototype.constructor = BeachTrooper;
		window.BeachTrooper = createjs.promote(BeachTrooper, "Obstacle");

		BeachTrooper.prototype.drawImage = function() {			
		
			var sheet = new createjs.SpriteSheet({
			    images: [queue.getResult('sprite_beachtrooper')],
			    frames: {width:368, height:281, regX: 155, regY: 142},
			    framerate: 1,
			    animations: {
			    	chill: 0,
			    	sleep: [1,2,false],
			    	warned: 3,
			    	pullout: [4,6,false],
			    	fire: 7
			    }
			});			

			this.sprite = new createjs.Sprite(sheet);
			this.sprite.scaleX = this.sprite.scaleY = 0.5;
			this.sprite.y = -50;
			if(this.wave.isLEFT()) this.scaleX = - this.scaleX;
			this.sprite.gotoAndPlay('chill');	
			this.image_cont.addChild(this.sprite);

		}

		BeachTrooper.prototype.drawBonus = function() {
			
			var bonus = new createjs.Shape();
				bonus.graphics.beginFill('green').drawCircle(0,0,50);
				bonus.y = -35;
				bonus.x = 25;
				this.debug_cont.addChild(bonus);
				this.bonuses.push(bonus);
		}

		BeachTrooper.prototype.drawMalus = function() {

			/* no malus */
		}

		BeachTrooper.prototype.bonusHitted = function() {

			SCORE.add(200).say('Stromtrooper kill !', 500);
			createjs.Tween.get(this).to({alpha:0}, 300).call(proxy(this.wave.removeObstacle,this.wave,[this]));
		}

		BeachTrooper.prototype.malusHitted = function() {			

			this.wave.surfer.fall('laser_hit');			

		}

		BeachTrooper.prototype.onEnterFrame = function() {

			var distance = get2dDistance(this.x,this.y,this.wave.surfer.x,this.wave.surfer.y);

			if(distance < 620) {
				this.sprite.gotoAndPlay('fire');
				this.fire();
				return;
			}
			if(distance < 650) {
				this.sprite.gotoAndPlay('pullout');
				return;
			}
			if(distance < 700) {
				this.sprite.gotoAndStop('warned');
				return;
			}
		}

		BeachTrooper.prototype.fire = function() {

			if(this.fired === true) return;
			this.fired = true;

			var width = 100;
			var speed = 6000;

			var laser = new createjs.Shape();
			laser.graphics.beginStroke('red').setStrokeStyle(3).beginFill('yellow').drawRoundRect(0,0,width * (-1*this.wave.direction),5,1);
			laser.x = - 40 + width;
			laser.y = -75;
			this.image_cont.addChild(laser);

			var start = new createjs.Shape();
			start.graphics.beginFill('white').drawCircle(0,0,8);
			start.x = laser.x - width;
			start.y = laser.y;
			start.hitzone = 'body';
			start.laser = laser;
			start.shotable = true;
			start.onShoted = this.cancelShot;

			var end = start.clone();
			end.x = laser.x;
			end.hitzone = 'none';
			end.laser = laser;
			end.shotable = true;
			end.onShoted = this.cancelShot;

			laser.start = start;
			laser.end = end;

			this.debug_cont.addChild(start,end);
			this.maluses.push(start,end);

			var mask = new createjs.Shape();
			mask.graphics.beginFill('rgba(0,0,0,0)').drawRect(- 40,0,- STAGEWIDTH,-100);
			//this.image_cont.addChild(mask);
			laser.mask = mask;

			createjs.Tween.get(laser).to({x: laser.x + STAGEWIDTH * (-1*this.wave.direction)}, speed);
			createjs.Tween.get(start).to({x: start.x + STAGEWIDTH * (-1*this.wave.direction)}, speed);
			createjs.Tween.get(end).to({x: end.x + STAGEWIDTH * (-1*this.wave.direction)}, speed);

		}

		BeachTrooper.prototype.cancelShot = function() {

			let laser = this.laser;
			let trooper = this.parent.parent;

			trooper.maluses.splice(trooper.maluses.indexOf(laser.start),1);
			trooper.maluses.splice(trooper.maluses.indexOf(laser.end),1);

			createjs.Tween.get(laser).to({alpha: 0, scaleX:0.5},100).call(function() {
				trooper.debug_cont.removeChild(laser.start);
				trooper.debug_cont.removeChild(laser.end);
				trooper.image_cont.removeChild(laser);
			});
		}

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

			this.sprite = new createjs.Sprite(sheet);;	
			this.image_cont.addChild(this.sprite);
			
		}

		Photograf.prototype.drawBonus = function() {

			var bonus = new createjs.Shape();
			bonus.graphics.beginFill('green').drawCircle(0,0,30);
			bonus.y = -30;
			if(this.wave.direction == -1) bonus.x = -60;
			if(this.wave.direction == 1) bonus.x = 60;
			this.debug_cont.addChild(bonus);
			this.bonuses.push(bonus);
		}

		Photograf.prototype.drawMalus = function() {

			var malus = new createjs.Shape();
				malus.graphics.beginFill('red').drawCircle(0,0,10);		
				this.debug_cont.addChild(malus);
				this.maluses.push(malus);
		}

		Photograf.prototype.bonusHitted = function() {

			this.sprite.gotoAndPlay('flash');
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

			const moving = new Victor(0,0);
			this.location.add(moving);
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
			this.location = new Victor(x,y);

		}

		prototype.checkRemove = function() {

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