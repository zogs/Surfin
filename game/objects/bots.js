//=============================
// SURFER BOT
//=============================

(function() {

	function SurferBot(config) {
		
		this.Surfer_constructor(config);
		this.initBot(config);

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
		this.direction = config.direction;
		this.saber_color = 'red';
		this.saber_length_default = this.saber_length;
		this.saber_length = 0;
		this.skills = {
			speed: 0.5, //0 to 1
			aerial: 0.2, //0 to 1
			agility: 1, //0 to 1
			paddling: 0.1,
			takeoff: 0,
			force: 0
		}

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
		this.vMouse.graphics.beginFill(createjs.Graphics.getHSL(Math.random()*360, 100, 50)).drawCircle(0,0,5);
		this.vMouse.y = 0;
		this.vMouse.alpha = 0;
		if(DEBUG === true) this.vMouse.alpha = 1;

		var xd = Math.random()*(STAGEWIDTH/2);
		if(this.direction === LEFT) {
			this.vMouse.x -= xd;
			this.wave.shoulder_left.mouse_cont.addChild(this.vMouse);
		}
		if(this.direction === RIGHT) {
			this.vMouse.x += xd;
			this.wave.shoulder_right.mouse_cont.addChild(this.vMouse);
		}
		// this.wave.debug_cont.addChild(this.vMouse);

		this.initMouseRest();		
		this.initMouseJump();
		this.initSaberStrike();
	}

	prototype.initMouseRest = function() {
		
		createjs.Tween.get(this.vMouse,{override:true})
			.to({y: this.wave.params.height}, 1000)
			.wait(500)
			.to({y: this.wave.params.height / 2}, 500)
			.call(proxy(this.initMouseMove,this))
			;
	}
	
	prototype.initMouseMove = function() {

		this.initMouseMoveX();
		this.initMouseMoveY();
		//this.initMouseNoMove();
	}

	prototype.initMouseNoMove = function() {

		this.vMouse.y = this.wave.params.height;
	}

	prototype.initMouseMoveY = function() {
	
		var time = 250 + Math.random()*500;
		createjs.Tween.get(this.vMouse)
			.to({y: Math.random()*this.wave.params.height }, time, createjs.Ease.sineInOut)
			.to({y: this.wave.params.height }, time, createjs.Ease.sineInOut)
			.call(proxy(this.initMouseMoveY,this))
			;
	}

	prototype.initMouseMoveX = function() {
	
		if(this.wave.direction === LEFT) var dx = Math.random()*(STAGEWIDTH/4);
		if(this.wave.direction === RIGHT) var dx = -Math.random()*(STAGEWIDTH/4);
		const time = 500 + Math.random()*5000;
		createjs.Tween.get(this.vMouse)
			.to({x: this.vMouse.x + dx}, time/2)
			.to({x: this.vMouse.x}, time/2)
			.call(proxy(this.initMouseMoveX,this))
			;

	}

	prototype.initMouseJump = function(jump) {
		
		//call next jump delay
		this.jumpTimeout = window.setTimeout(proxy(this.initMouseJump,this,[true]),Math.random()*10000 + 5000);
		


		if(jump === true) {
			//cancel jump if surfer is too close of the tube
			if( this.wave.direction === LEFT && this.x > this.wave.boundaries[LEFT] -150 ) return console.info('jump canceled');
			if( this.wave.direction === RIGHT && this.x < this.wave.boundaries[RIGHT] + 150 ) return console.info('jump canceled');
			//jump !
			var height = - Math.random()*(STAGEHEIGHT/2);
			console.log('jump',height);
			createjs.Tween.get(this.vMouse,{override:true}).to({y: height}, 500).wait(500).call(proxy(this.initMouseRest,this));		
		}

	}

	prototype.initSaberStrike = function() {

		this.saberTimeout = window.setTimeout(proxy(this.initSaberStrike,this), 500 + Math.random()*2000);

		//strike fi close to the player
		var dist = get2dDistance(this.x,this.y,this.wave.player.x,this.wave.player.y);
		if(dist < 100) {
			this.lightSaberStrike();
		}
	}

	prototype.removeSaberStrike = function() {

		window.clearTimeout(this.saberTimeout);
	}

	prototype.removeJumping = function() {

		window.clearTimeout(this.jumpTimeout);
	}


	prototype.removeBot = function() {

		//remove bot element
		this.removeJumping();
		this.removeVirtualMouse();
		this.removeSaberStrike();
		//remove bot from within the wave
		this.wave.removeBot(this);
	}

	prototype.removeVirtualMouse = function() {
	
		createjs.Tween.removeTweens(this.vMouse);
		if(this.direction === LEFT) {
			this.wave.shoulder_left.mouse_cont.removeChild(this.vMouse);
		}
		if(this.direction === RIGHT) {
			this.wave.shoulder_right.mouse_cont.removeChild(this.vMouse);
		}
		this.vMouse = null;
	}

	window.SurferBot = createjs.promote(SurferBot, 'Surfer');

}());