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
			console.log('fallen '+ this.fall_reason);
			this.removeBot();
		},this,true);


		this.on('take_off', function(event) {
			this.initVirtualMouse();
		},this,true);
	}

	prototype.initBot = function(config) {

		this.type = 'bot';
		this.direction = config.direction;
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

		var xd = Math.random()*(STAGEWIDTH/4);
		if(this.direction === LEFT) {
			this.vMouse.x -= xd;
			this.wave.shoulder_left.mouse_cont.addChild(this.vMouse);
		}
		if(this.direction === RIGHT) {
			this.vMouse.x += xd;
			this.wave.shoulder_right.mouse_cont.addChild(this.vMouse);
		}
		// this.wave.debug_cont.addChild(this.vMouse);

		this.initMouseResting();		
		this.initMouseJumping();
	}

	prototype.initMouseResting = function() {
		
		createjs.Tween.get(this.vMouse,{override:true})
			.to({y: this.wave.params.height}, 1000)
			.wait(1000)
			.to({y : 0}, 500)
			.call(proxy(this.initMouseMove,this))
			;
	}
	
	prototype.initMouseMove = function() {

		this.initMouseMoveX();
		this.initMouseMoveY();
	}

	prototype.initMouseMoveY = function() {
	
		var time = 1500 + Math.random()*500;
		createjs.Tween.get(this.vMouse)
			.to({y: 0 }, time, createjs.Ease.sineInOut)
			.to({y: this.wave.params.height }, time, createjs.Ease.sineInOut)
			.call(proxy(this.initMouseMoveY,this))
			;
	}

	prototype.initMouseMoveX = function() {
	
		if(this.wave.direction === LEFT) var dx = Math.random()*(STAGEWIDTH/4);
		if(this.wave.direction === RIGHT) var dx = -Math.random()*(STAGEWIDTH/4);
		const time = 5000;
		createjs.Tween.get(this.vMouse)
			.to({x: this.vMouse.x + dx}, time/2)
			.to({x: this.vMouse.x}, time/2)
			.call(proxy(this.initMouseMoveX,this))
			;

	}

	prototype.initMouseJumping = function(jump) {
		
		if(jump === true) createjs.Tween.get(this.vMouse,{override:true}).to({y: 0 - Math.random()*(STAGEHEIGHT/2)}, 500).call(proxy(this.initMouseResting,this));

		this.jumpTimeout = window.setTimeout(proxy(this.initMouseJumping,this,[true]),Math.random()*10000 + 5000);
	}

	prototype.removeJumping = function() {

		window.clearTimeout(this.jumpTimeout);
	}


	prototype.removeBot = function() {

		//remove bot element
		this.removeJumping();
		this.removeVirtualMouse();
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

	prototype.getSkill = function(comp) {

		const skill = {
			speed: 1, //0 to 1
			aerial: 1, //0 to 1
			agility: 1, //0 to 1
			paddling: 0.1,
			takeoff: 1
		}

		return skill[comp];
	}

	window.SurferBot = createjs.promote(SurferBot, 'Surfer');

}());