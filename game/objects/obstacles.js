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
		this.spot = this.config.spot;
		this.img = this.config.img != undefined ? this.config.img : 'paddler';
		this.config.name = config.name || 'paddler';

		this.location = new Victor();
		this.ducking = false;
		this.hitted = false;
		this.bodies = [];
		this.bonuses = [];
		this.maluses = [];
		this.duck_y = this.wave.params.height / 5;
		this.speedX = this.config.speedX || 0.5;
		this.speedY = this.config.speedY || 0.5;

		this.image_cont = new createjs.Container();
		this.addChild(this.image_cont);
		this.debug_cont = new createjs.Container();
		this.debug_cont.alpha = 0;
		this.addChild(this.debug_cont);

		this.drawImage();
		this.drawMalus();
		this.drawBonus();

		this.center = new createjs.Shape();
		this.center.graphics.beginFill('black').drawCircle(0,0,2);
		this.debug_cont.addChild(this.center);		

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
			x = this.wave.shoulder_right.x + Math.random() * (this.wave.params.shoulder.right.width*2);
		}
		if(this.wave.direction === LEFT) {
			x = this.wave.shoulder_left.x - Math.random() * (this.wave.params.shoulder.left.width*2);
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
		this.drawDebug();
	}

	prototype.move = function() {

		const move = new Victor(0, this.wave.getSuction().y);
		this.location.add(move);
		this.x = this.location.x;
		this.y = this.location.y;
	}

	prototype.drawImage = function() {
		
		var sheet = new createjs.SpriteSheet({
		    images: [queue.getResult('paddler')],
		    frames: {width:80, height:80, count:11},
		    animations: {
	        up: {
	        	frames: [9,10,9,10,9,10],
	        	next: "up",
	        	speed: 0.3
	        },	        
		    }
		});		

		this.sprite = new createjs.Sprite(sheet);
		this.sprite.scale = 2;
		this.sprite.x = 80;
		this.sprite.y = -80;
		this.sprite.scaleX *= this.wave.direction === LEFT ? -1 : 1;
		this.sprite.gotoAndPlay('up');	
		this.image_cont.addChild(this.sprite);
	}

	prototype.drawBonus = function() {

		var bonus = new createjs.Shape();
			bonus.graphics.beginFill('green').drawCircle(0,0,20);
			bonus.y = 30;
			bonus.alpha = 0.5;
			this.debug_cont.addChild(bonus);
			this.bonuses.push(bonus);
	}

	prototype.drawMalus = function() {

		var malus = new createjs.Shape();
			malus.graphics.beginFill('red').drawCircle(0,0,20);
			malus.alpha = 0.5;
			this.debug_cont.addChild(malus);
			this.maluses.push(malus);
	}

	prototype.drawDebug = function() {		
		this.debug_cont.alpha = (DEBUG===1)? 1 : 0;
	}

	prototype.hitBonus = function(surfer) {

		if(this.disabled === true) return;
		if(this.bonusDisabled === true) return;
		let j = this.bonuses.length;
		while(j--) {
			const bonus = this.bonuses[j];
			const radius = bonus.graphics.command.radius;
			const zone = typeof bonus.hitzone == 'undefined' ? 'board' : bonus.hitzone;
			const x = this.x + bonus.x;
			const y = this.y + bonus.y;

			if(bonus.hitted === true) continue;

			if(surfer.hit(zone,x,y,radius)) {
				bonus.hitted = true;
				this.bonusHitted(bonus);
				return true;
			}
		}
		return false;
	}

	prototype.hitMalus = function(surfer) {

		if(this.disabled === true) return;
		if(this.malusDisabled === true) return;
		let i = this.maluses.length;
		while(i--) {
			const malus = this.maluses[i];
			const radius = malus.graphics.command.radius;
			const zone = typeof malus.hitzone == 'undefined' ? 'board' : malus.hitzone;
			const x = this.x + malus.x;
			const y = this.y + malus.y;

			if(malus.hitted === true) continue;

			if(surfer.hit(zone,x,y,radius)) {
				malus.hitted = true;
				this.malusHitted(malus);
				return true;
			}
		}
		return false;
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
				.call(proxy(this.selfRemove(),this));
		}
	}

	prototype.selfRemove = function() {

		this.removeListeners();
		this.wave.removeObstacle(this);
	}

	prototype.onEnterFrame = function() {

		//nothing
	}

	prototype.bonusHitted = function() {

		this.disable = true;
	}

	prototype.malusHitted = function() {

		this.disable = true;
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

			var bonus = new createjs.Shape();
				bonus.graphics.beginFill('green').drawCircle(0,0,100);
				bonus.y = 0;
				bonus.x = 5;
				bonus.alpha = 0.5;
				this.debug_cont.addChild(bonus);
				this.bonuses.push(bonus);
		}

		BombObstacle.prototype.drawMalus = function() {

			var malus = new createjs.Shape();
				malus.graphics.beginFill('red').drawCircle(0,0,50);
				malus.y = 0;
				malus.x = 5;
				malus.alpha = 0.5;
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
			// bomb explose at distance (bonus), but if surfer is too close (malus) he will fall...
			this.sprite.gotoAndPlay('explode');	

		}

		BombObstacle.prototype.malusHitted = function() {

			//
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
				bonus.alpha = 0.5;
				this.debug_cont.addChild(bonus);
				this.bonuses.push(bonus);
		}

		BeachTrooper.prototype.drawMalus = function() {

			/* no malus */
		}

		BeachTrooper.prototype.bonusHitted = function() {

			SCORE.add(200).say('Stromtrooper kill !', 500);
			createjs.Tween.get(this).to({alpha:0}, 300);
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

		function Photografer(config) {

			config.img = 'photographer';
			config.name = 'photo';

			this.Obstacle_constructor(config);		    

		}
		Photografer.prototype = Object.create(Obstacle.prototype);
		Photografer.prototype.constructor = Photografer;
		window.Photografer = createjs.promote(Photografer, "Obstacle");

		Photografer.prototype.drawImage = function() {			

			var sheet = new createjs.SpriteSheet({
			    images: [queue.getResult(this.img)],
			    frames: {width:100, height:80, regX:50, regY:40},
			    framerate: 1,
			    animations: {	        
			        swim: 0,
			        flash: [1,1,'swim'],
			    }
			});

			this.sprite = new createjs.Sprite(sheet);
			this.sprite.scale = 1.8;
			this.sprite.scaleX *= this.wave.direction === LEFT ? 1 : -1;
			this.image_cont.addChild(this.sprite);
			
		}

		Photografer.prototype.drawBonus = function() {

			var bonus = new createjs.Shape();
			bonus.graphics.beginFill('green').drawCircle(0,0,60);
			bonus.y = -50;
			bonus.x = this.wave.direction === LEFT ? 60 : -60;
			bonus.alpha = 0.5;
			this.debug_cont.addChild(bonus);
			this.bonuses.push(bonus);
		}

		Photografer.prototype.drawMalus = function() {

			var malus = new createjs.Shape();
				malus.graphics.beginFill('red').drawCircle(0,0,20);		
				malus.x = this.wave.direction === LEFT ? -40 : 40;
				malus.y = 40;
				malus.alpha = 0.5;
				this.debug_cont.addChild(malus);
				this.maluses.push(malus);
		}

		Photografer.prototype.bonusHitted = function() {

			this.sprite.gotoAndPlay('flash');
		}

		Photografer.prototype.malusHitted = function() {

			console.log('photographer malus');
		}

}());

(function() {

		function FlyObstacle(config) {

			this.speed = config.speed || 10;
			this.amp = config.amp || 0;
			this.high_min = config.high_min || 50;
			this.high_max = config.high_max || Math.random() * STAGEHEIGHT*1/3;
			this.high = this.high_min + Math.random() * (this.high_max - this.high_min);
			this.time = 0;
			this.phase = Math.random() * 1000;
			this.reverse = config.reverse || false;

			this.Obstacle_constructor(config);
		}
		
		FlyObstacle.prototype = Object.create(Obstacle.prototype);
		FlyObstacle.prototype.constructor = FlyObstacle;
		window.FlyObstacle = createjs.promote(FlyObstacle, "Obstacle");

		FlyObstacle.prototype.move = function() {

			//compense la vitesse de la vague
			let x = (- this.wave.movingX);

			//vitesse reelle
			let speed = this.speed;

			//ajout direction de la vague
			speed *= (this.wave.isLEFT())? 1 : -1;

			//reverse direction if needed
			if(this.reverse) speed *= -1;

			//vitesse horizontale
			x += speed;

			// sinusoide verticale
			this.time += .1;
			let y = (this.amp === 0)? 0 : this.amp * Math.sin(this.time + this.phase);

			const moving = new Victor(x,y);
			this.location.add(moving);
			this.x = this.location.x;
			this.y = this.location.y;

		}

		FlyObstacle.prototype.initialPosition = function() {

			let x = this.wave.params.breaking_center + (200 - Math.random() * 400);
			let y = this.spot.config.lines.break - this.wave.params.height - this.wave.params.height - this.high;
		
			if(this.wave.isLEFT()) {
				if(this.reverse) x = this.wave.shoulder_left.x + STAGEWIDTH*2;
				else x = this.wave.shoulder_left.x - STAGEWIDTH/2;										
			}
			if(this.wave.isRIGHT()) {
				if(this.reverse) x = this.wave.shoulder_right.x - STAGEWIDTH*2;
				else x = this.wave.shoulder_right.x + STAGEWIDTH/2;
			}				

			let direction = (this.speed < 0)? -1 : 1;
			x *= direction;

			this.x = x;
			this.y = y;
			this.location = new Victor(x,y);
		}

		FlyObstacle.prototype.checkRemove = function() {

			let remove = false;
			if(this.wave.isLEFT()) {
				if(this.reverse && this.x < this.wave.shoulder_left.x - STAGEWIDTH) remove = true;
				else if(this.x > this.wave.shoulder_left.x + STAGEWIDTH * 2) remove = true;
			}

			if(this.wave.isRIGHT()) {
				if(this.reverse && this.x > this.wave.shoulder_right.x + STAGEWIDTH) remove = true;
				else if(this.x < this.wave.shoulder_right.x - STAGEWIDTH * 2) remove = true;
			}

			if(remove === true) {
				this.selfRemove();
			}
		}


}());


(function() {

		function FlyingMultiplier(config) {

			config.name = 'multiplier';
			config.amp = 10;
			config.time = 0;
			config.phase = Math.random() * 1000;
			
			this.multiplier = config.multiplier || 2;	

			this.FlyObstacle_constructor(config);

		}
		
		FlyingMultiplier.prototype = Object.create(FlyObstacle.prototype);
		FlyingMultiplier.prototype.constructor = FlyingMultiplier;
		window.FlyingMultiplier = createjs.promote(FlyingMultiplier, "FlyObstacle");

		FlyingMultiplier.prototype.drawImage = function() {			

			var graphics = new createjs.Graphics()
					.setStrokeStyle(5)
					.beginStroke('rgba(255,255,255,0.5)')
					.beginFill('rgba(255,255,255,1)')
					.drawCircle(0, 0, 30)
					;	 
		
			var circle = new createjs.Shape(graphics)
			this.image_cont.addChild(circle);
			
			var text = new createjs.Text('','bold 26px Helvetica','#000')
			text.text = 'x'+this.config.multiplier;
			var b = text.getBounds()
			text.x = - b.width / 2
			text.y = - b.height / 2

			this.image_cont.addChild(text)
		}

		FlyingMultiplier.prototype.drawBonus = function() {

			var bonus = new createjs.Shape();
			bonus.graphics.beginFill('green').drawCircle(0,0,30);
			bonus.alpha = 0.5;
			this.debug_cont.addChild(bonus);
			this.bonuses.push(bonus);
		}

		FlyingMultiplier.prototype.drawMalus = function() {
			//no malus
		}

		FlyingMultiplier.prototype.bonusHitted = function() {
			createjs.Tween.get(this).to({scaleX:4,scaleY:4,alpha:0},300);
		}


}());

(function() {

		function FlyingPrize(config) {

			config.name = 'prize';
			config.amp = 20;
			config.time = 0;
			config.speed = 15;
			config.phase = Math.random() * 1000;

			this.value = config.value || 1000;	
			if(this.value === 1000) this.color = 'green';
			if(this.value === 2000) this.color = 'yellow';
			if(this.value === 3000) this.color = 'orange';
			if(this.value === 4000) this.color = 'red';
			if(this.value === 5000) this.color = 'gold';

			this.FlyObstacle_constructor(config);

		}
		
		FlyingPrize.prototype = Object.create(FlyObstacle.prototype);
		FlyingPrize.prototype.constructor = FlyingPrize;
		window.FlyingPrize = createjs.promote(FlyingPrize, "FlyObstacle");

		FlyingPrize.prototype.drawImage = function() {			

			var graphics = new createjs.Graphics()
					.setStrokeStyle(5)
					.beginStroke('rgba(255,255,255,0.5)')
					.beginFill(this.color)
					.drawCircle(0, 0, 30)
					;	 
		
			var circle = new createjs.Shape(graphics)
			this.image_cont.addChild(circle);

			var text = new createjs.Text(this.value,'bold 20px Helvetica','#000')
			var b = text.getBounds()
			text.x = - b.width / 2
			text.y = - b.height / 2

			this.image_cont.addChild(text)
		}

		FlyingPrize.prototype.drawBonus = function() {

			var bonus = new createjs.Shape();
			bonus.graphics.beginFill('green').drawCircle(0,0,30);
			bonus.alpha = 0.5;
			bonus.hitzone = 'body';
			this.debug_cont.addChild(bonus);
			this.bonuses.push(bonus);
		}

		FlyingPrize.prototype.drawMalus = function() {
			//no malus
		}

		FlyingPrize.prototype.bonusHitted = function() {
			createjs.Tween.get(this).to({scaleX:3,scaleY:3,alpha:0},300);
		}


}());



(function() {

		function Cigogne(config) {

			config.name = 'cigogne';
			config.img = 'cigogne';
			config.high_min = 200;
			config.high_max = 400;
			config.speed = 20;
			config.reverse = true;

			this.FlyObstacle_constructor(config);
		}
		
		Cigogne.prototype = Object.create(FlyObstacle.prototype);
		Cigogne.prototype.constructor = Cigogne;
		window.Cigogne = createjs.promote(Cigogne, "FlyObstacle");

		Cigogne.prototype.drawImage = function() {			

			var sheet = new createjs.SpriteSheet({
			    images: [queue.getResult(this.img)],
			    frames: {width:256, height:256, regX:128, regY:128},
			    framerate: 1,
			    animations: {	        
			        fly: [0,5,'fly'],
			    }
			});

			this.sprite = new createjs.Sprite(sheet);
			this.sprite.scaleX *= this.wave.isLEFT()? -1 : 1;
			this.sprite.gotoAndPlay('fly');
			this.image_cont.addChild(this.sprite);

		}

		Cigogne.prototype.drawBonus = function() {

		}

		Cigogne.prototype.drawMalus = function() {
			//no malus
		}

		Cigogne.prototype.bonusHitted = function() {
			
		}


}());

(function() {

		function Drone(config) {

			config.name = 'drone';
			config.img = 'drone';
			config.amp = Math.random() * 2;
			config.high_min = 100;
			config.high_max = 300;
			config.speed = 5;

			this.FlyObstacle_constructor(config);

		}
		
		Drone.prototype = Object.create(FlyObstacle.prototype);
		Drone.prototype.constructor = Drone;
		window.Drone = createjs.promote(Drone, "FlyObstacle");

		Drone.prototype.drawImage = function() {			

			var sheet = new createjs.SpriteSheet({
			    images: [queue.getResult('drone')],
			    frames: {width:256, height:256, regX:128, regY:128},
			    framerate: 1,
			    animations: {	        
			        fly: [0,2,'fly'],
			        flash: [3,6,'fly']
			    }
			});

			this.sprite = new createjs.Sprite(sheet);
			this.sprite.scaleX *= this.wave.direction === LEFT ? 1 : -1;
			this.sprite.gotoAndPlay('fly');
			this.sprite.scale = 0.5;
			this.image_cont.addChild(this.sprite);

		}

		Drone.prototype.drawBonus = function() {
			var bonus = new createjs.Shape();
			bonus.graphics.beginFill('green').drawCircle(0,0,75);
			bonus.alpha = 0.2;
			bonus.hitzone = 'body';
			bonus.y = 75;
			this.debug_cont.addChild(bonus);
			this.bonuses.push(bonus);
		}

		Drone.prototype.drawMalus = function() {
			//no malus
		}

		Drone.prototype.bonusHitted = function() {
			
			this.sprite.gotoAndPlay('flash');
			
		}


}());