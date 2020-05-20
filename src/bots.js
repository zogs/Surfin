//=============================
// SURFER BOT
//=============================

(function() {

	function SurferBot(params) {

		params.type = 'bot';
		params.img = 'stormsurfer';
		this.Surfer_constructor(params);
		this.initBot(params);

	}

	var prototype = createjs.extend(SurferBot, Surfer);


	prototype.initSilhouette = function() {

		let sprite = new createjs.SpriteSheet({
			images: [queue.getResult(this.config.img)],
			frames: {width: parseInt(256*rX), height: parseInt(256*rY)},
			framerate: 5,
			animations: {
				S: 0,
				SE: 1,
				SEE: 2,
				SEEE: 3,
				SEEEE: 4,
				E: 5,
				EN: 6,
				ENN: 7,
				ENNN: 8,
				ENNNN: 9,
				N: 10,
				NW: 11,
				NWW: 12,
				NWWW: 13,
				NWWWW: 14,
				W: 15,
				WS: 16,
				WSS: 17,
				WSSS: 18,
				WSSSS: 19,
				takeoff: [20,24, false],
				fall: [25,31, false, 2]
			}
		});

		this.silhouette = new createjs.Sprite(sprite,'S');
		this.silhouette_width = 256*rX;
		this.silhouette_height = 256*rY;
		this.silhouette_cont.addChild(this.silhouette);
	}

	prototype.initEventsListener = function() {
		//override and clear parent function

		//on bot fall
		this.on('fallen',function(event) {
			this.selfRemove();
		},this,true);


		this.on('takeoff', function(event) {
			this.initVirtualMouse();
		},this,true);
	}

	prototype.initBot = function(config) {

		this.direction = (config.direction === LEFT)? 1 : -1;
		this.minMouseX = STAGEWIDTH/2 * -this.direction;
		this.skills = {
			speed: 0.1, //0 to 1
			aerial: 0.1, //0 to 1
			agility: 1, //0 to 1
			paddling: 0.1,
			takeoff: 0,
			force: 0
		}
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
		this.vMouse.alpha = (DEBUG == true)? 1 : 0;
		this.addChild(this.vMouse);


		this.initMouseRest();
		//this.initMouseMoveX();
		//this.initMouseJump();
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

	prototype.removeJumping = function() {
		window.clearTimeout(this.jumpTimeout);
	}

	prototype.selfRemove = function() {
		//remove bot element
		this.removeJumping();
		this.removeVirtualMouse();
		//remove surfer elements
		this.removeAllTweens();
		this.removeAllEventListeners();
		//remove bot from within the wave
		this.wave.removeBot(this);
	}

	prototype.removeVirtualMouse = function() {
		createjs.Tween.removeTweens(this.vMouse);
		this.removeChild(this.vMouse);
	}

	window.SurferBot = createjs.promote(SurferBot, 'Surfer');

}());