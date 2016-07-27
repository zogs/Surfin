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
		
		config = config || {};
		this.wave = config.wave;
		this.img = config.img != undefined ? config.img : 'surfer_paddle';

		this.location = new vec2.create();
		this.moving = vec2.fromValues(0,-5);
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

		this.center = new createjs.Shape();
		this.center.graphics.beginFill('red').drawCircle(0,0,2);
		this.addChild(this.center);

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
			var x = this.wave.shoulder_right.x + ( this.wave.width - Math.random()*this.wave.width);
		}
		if(this.wave.direction == 1) {
			var x = this.wave.shoulder_left.x - ( this.wave.width - Math.random()*this.wave.width);
		}

		this.x = x;
		this.y = y;
		this.location = vec2.fromValues(x,y);
	}

	prototype.tick = function() {

		this.move();
		this.check();
		//this.resize();
	}

	prototype.hitBonus = function(surfer) {

		if(this.hitted == true) return;
		var j = this.bonuses.length;
		while(j--) {
			var point = this.bonuses[j];
			var radius = point.graphics.command.radius;
			if(surfer.hitSurf(point,radius)) {
				this.hitted = true;
				this.bonusHitted();
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
				this.malusHitted();
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

		vec2.add(this.location,this.location,this.moving);
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

		stage.dispatchEvent('paddler_bonus_hitted');
	}

	prototype.malusHitted = function() {

		stage.dispatchEvent('paddler_malus_hitted');
	}

	//assign Obstacle to window's scope & promote
	window.Obstacle = createjs.promote(Obstacle, "Container");
}());


(function() {

		function Photograf(config) {

			config.img = 'photographer';

			Obstacle.prototype.Container_constructor.call(this);		    
			Obstacle.prototype.init.call(this,config);

		}
		Photograf.prototype = Object.create(Obstacle.prototype);
		Photograf.prototype.constructor = Photograf;
		window.Photograf = createjs.promote(Photograf, "Container");

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
			stage.dispatchEvent('bonus_photograf_hitted');
		}

		Photograf.prototype.malusHitted = function() {

			stage.dispatchEvent('malus_photograf_hitted');
		}

}());