//=============================
// SURFER BOT
//=============================

(function() {

	function SurferBot(config) {
		
		this.Surfer_constructor(config);
		this.initBot(config);

		console.log('surfer bot init');
	}

	var prototype = createjs.extend(SurferBot, Surfer);

	prototype.initEventsListener = function() {
		//override and clear parent function

		//on bot fall
		this.on('fallen',function(event) {				
			this.removeBot();
		},this,true);


		this.on('take_off', function(event) {
			this.initVirtualMouse();
			this.initLightSaber();
		},this,true);
	}

	prototype.initBot = function(config) {

		this.type = 'bot';
		this.direction = (config.direction == 1)? 1 : -1;
		this.saber_color = 'red';
		this.saber_length_default = this.saber_length;
		this.saber_length = 0;
		this.minMouseX = 200 * -this.direction;
		this.skills = {
			speed: 0.5, //0 to 1
			aerial: 0.2, //0 to 1
			agility: 1, //0 to 1
			paddling: 0.1,
			takeoff: 0,
			force: 0
		}
		

		console.log(this.direction);

	}

	prototype.initLightSaber = function() {

		createjs.Tween.get(this).wait(1000).to({saber_length: this.saber_length_default}, 800);
	}

	/**
	 * Replace parent method returning a VIRTUAL mouse point
	 * @return {createjs.Point} 
	 */
	prototype.getMousePoint = function() {

		var mouse = this.vMouse.localToLocal(0,0,this.wave.cont);
		return mouse;
	}
	

	prototype.initVirtualMouse = function() {

		this.vMouse = new createjs.Shape();
		this.vMouse.graphics.beginFill(createjs.Graphics.getHSL(Math.random()*360, 100, 50)).drawCircle(0,0,2);
		this.vMouse.y = 0;
		this.vMouse.alpha = (DEBUG == true)? 1 : 1;
		this.addChild(this.vMouse);


		this.initMouseRest();		
		//this.initMouseMoveX();
		//this.initMouseJump();
		this.initSaberStrike();
	}

	prototype.initMouseRest = function() {

		let coef = Math.random()*1 + 0.5;
		this.removeTween(this.tweenMoveRest);
		this.tweenMoveRest = createjs.Tween.get(this.vMouse,{override:true})
			.to({y: this.wave.params.height/2}, 500*coef)
			.wait(200)
			.to({y: 0, x: this.minMouseX }, 1000*coef)
			.wait(250)
			.call(proxy(this.initMouseMove,this))
			;
		this.addTween(this.tweenMoveRest);
	}
	
	prototype.initMouseMove = function() {

		this.initMouseMoveX();
		this.initMouseMoveY();
		this.initMouseNoMove();
	}

	prototype.initMouseNoMove = function() {

		this.vMouse.y = this.wave.params.height;
	}

	prototype.initMouseMoveY = function() {
	
		var time = 500 + Math.random()*1000;
		this.removeTween(this.tweenMoveY);
		this.tweenMoveY = createjs.Tween.get(this.vMouse)
			.to({y: Math.random()* this.wave.params.height/4 }, time, createjs.Ease.sineInOut)
			.to({y: Math.random()* -this.wave.params.height/3 }, time, createjs.Ease.sineInOut)
			.to({y: 0 }, time/2, createjs.Ease.sineInOut)
			.call(proxy(this.initMouseMoveY,this))
			;
		this.addTween(this.tweenMoveY);
	}

	prototype.initMouseMoveX = function() {
	
		let dx = Math.random()*STAGEWIDTH/4 * -this.direction;
		const time = 1000 + Math.random()*5000;
		this.removeTween(this.tweenMoveX);
		this.tweenMoveX = createjs.Tween.get(this.vMouse)
			.to({x: dx + this.minMouseX}, time/2)
			.to({x: 50 + Math.random()*this.minMouseX }, time/2)
			.wait(Math.random()*500)
			.call(proxy(this.initMouseMoveX,this))
			;
		this.addTween(this.tweenMoveX);

	}

	prototype.initMouseJump = function(jump) {
		
		//call next jump delay
		this.jumpTimeout = window.setTimeout(proxy(this.initMouseJump,this,[true]),Math.random()*10000 + 5000);
		


		if(jump === true) {
			//cancel jump if surfer is too close of the tube
			if( this.wave.direction === LEFT && this.x > this.wave.boundaries[LEFT] -150 ) return console.info('jump canceled');
			if( this.wave.direction === RIGHT && this.x < this.wave.boundaries[RIGHT] + 150 ) return console.info('jump canceled');
			//jump !
			var height = - Math.random()*this.wave.params.height * 2;
			console.log('jump',height);
			createjs.Tween.get(this.vMouse,{override:true})
				.to({y: - height}, 800)
				.wait(500)
				.to({y: 0}, 200)
				.call(proxy(this.initMouseRest,this));		
		}

	}

	prototype.initSaberStrike = function() {

		this.saberTimeout = window.setTimeout(proxy(this.initSaberStrike,this), 500 + Math.random()*2000);

		//TODO: detecter la presence d'ennemi dans la zone proche
		//strike fi close to the player
		//var dist = get2dDistance(this.x,this.y,this.wave.player.x,this.wave.player.y);
		//if(dist < 100) {
			this.lightSaberStrike();
		//}
	}

	prototype.removeSaberStrike = function() {

		window.clearTimeout(this.saberTimeout);
	}

	prototype.removeJumping = function() {

		window.clearTimeout(this.jumpTimeout);
	}


	prototype.selfRemove = function() {

		//remove surfer elements
		this.removeAllTweens();
		this.timer.clear();
		this.removeAllEventListeners('tick');
		this.removeAllChildren();

		//remove bot element
		this.removeJumping();
		this.removeVirtualMouse();
		this.removeSaberStrike();
		//remove bot from within the wave
		this.wave.removeBot(this);
	}

	prototype.removeVirtualMouse = function() {
	
		createjs.Tween.removeTweens(this.vMouse);
		this.removeChild(this.vMouse);
		this.vMouse = null;
	}

	window.SurferBot = createjs.promote(SurferBot, 'Surfer');

}());