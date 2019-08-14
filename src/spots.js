(function() {

	function Spot(config) {

		this.Container_constructor();

		this.id = config.id;
		this.name = config.name;
		this.planet = PLANETS.find(p => p.id == config.planet);
		this.level = config.level;
		this.config = config;

		this.waves = [];
		this.surfers = [];
		this.paddlers = [];
		this.timers = [];

		this.score = null;
		this.wave = null;
    this.ticker = null;
		this.runing = false;
    this.paused = false;
    this.played = false;
    this.scoreboard = null;
		this.time_scale = (TIME_SCALE) ? TIME_SCALE : 1;

		this.background = new createjs.Container();
    this.background.mouseChildren = false;
		this.addChild(this.background);

		this.score_cont = new createjs.Container();
    this.score_cont.mouseChildren = false;
		this.addChild(this.score_cont);

		this.sea_cont = new createjs.Container();
    this.sea_cont.mouseChildren = false;
		this.addChild(this.sea_cont);

		this.frontground = new createjs.Container();
		this.addChild(this.frontground);

    this.control_cont = new createjs.Container();
    this.addChild(this.control_cont);

		this.overlay_veil = new createjs.Container();
		this.addChild(this.overlay_veil);
		this.drawOverlayVeil();

		this.overlay_cont = new createjs.Container();
		this.addChild(this.overlay_cont);

		this.debug_cont = new createjs.Container();
    this.debug_cont.mouseChildren = false;
		this.addChild(this.debug_cont);

		this.drawBackground();
		this.drawFrontground();
    this.drawExtra();

		this.drawScore();
    this.drawControls();
		this.drawMenuBtn();

		this.init();

	}

	var prototype = createjs.extend(Spot, createjs.Container);

	prototype.init = function(type) {

		if(this.name == 'home') this.initHomeScreen();

		if(this.config.init.type == undefined) return this.initStatic();
		if(this.config.init.type === 'static') return this.initStatic();
		if(this.config.init.type === 'waving') return this.initWaving();
		if(this.config.init.type === 'ready?') return this.initWhenReady();

	}

	prototype.drawMenuBtn = function() {

		//do not draw MENU button when on Home
		if(this.name == 'home') return;

    let h = 50;
    let w = 50;
    let y = 4;
		let btn = new createjs.Shape();
    btn.graphics
      .setStrokeStyle(10,"round").beginStroke("rgba(0,0,0,0.4)")
      .moveTo(0,y).lineTo(w, y)
      .moveTo(0,h*1/3+y).lineTo(w, h*1/3+y)
      .moveTo(0,h*2/3+y).lineTo(w, h*2/3+y)
      .setStrokeStyle(10,"round").beginStroke("#FFF")
      .moveTo(0,0).lineTo(w, 0)
      .moveTo(0,h*1/3).lineTo(w, h*1/3)
      .moveTo(0,h*2/3).lineTo(w, h*2/3);
		btn.x = STAGEWIDTH - w*1.5;
		btn.y = h/2;
		btn.cursor = 'pointer';
		btn.on('click', proxy(MENU.open,MENU));
		this.overlay_cont.addChild(btn);
	}

	prototype.drawBackground = function() {

		this.background.removeAllChildren();

		const defaultbkg = new createjs.Shape();
		defaultbkg.graphics.beginFill('#0d4e6d').drawRect(0,0,STAGEWIDTH,STAGEHEIGHT);
		this.background.addChild(defaultbkg);

		const skyimage = new createjs.Bitmap(queue.getResult(this.planet.images.background));
		skyimage.y = - skyimage.image.height + this.planet.lines.horizon;
		this.background.addChild(skyimage);

		const seagradient = new createjs.Shape();
		seagradient.graphics
					.beginLinearGradientFill([this.planet.colors.sea.top, this.planet.colors.sea.bottom],[0,1],0, this.planet.lines.horizon,0,STAGEHEIGHT)
					.drawRect(0,this.planet.lines.horizon,STAGEWIDTH,STAGEHEIGHT)
					;
		this.background.addChild(seagradient);

		const image1 = new createjs.Bitmap(queue.getResult('spot_searipple'));
		image1.alpha = 0.2;
		image1.y = this.planet.lines.horizon;
		this.riddles1 = image1;
		this.background.addChild(image1);

		const image2 = new createjs.Bitmap(queue.getResult('spot_searipple'));
		image2.alpha = 0.2;
		image2.y = this.planet.lines.horizon;
		image2.skewX = 1;
		this.riddles2 = image2;
		this.background.addChild(image2);

		this.animateBackground();
	}

  prototype.drawExtra = function() {

    if(this.planet.images.extra) {
      for(let i=0,ln=this.planet.images.extra.length; i<ln; i++) {
        let extra = this.planet.images.extra[i];
        let image = new createjs.Bitmap(queue.getResult(extra.asset));
        image.x = extra.x;
        image.y = extra.y;
        image.alpha = (extra.alpha)? extra.alpha : 1;
        this.background.addChild(image);
      }
    }
  }

	prototype.animateBackground = function() {

		if(PERF <= 2) return;

		createjs.Tween.get(this.riddles1,{override: true, loop:true}).to({ x: this.riddles1.x + 20 }, 1500).to({x: this.riddles1.x }, 1500);
		createjs.Tween.get(this.riddles2,{override: true, loop:true}).to({ x: this.riddles2.x - 20 }, 1500).to({x: this.riddles2.x }, 1500);
	}

	prototype.drawFrontground = function() {

		var matrix = new createjs.ColorMatrix()
					.adjustHue(this.planet.colors.sand.hue)
					.adjustSaturation(this.planet.colors.sand.sat)
					.adjustContrast(this.planet.colors.sand.con)
					.adjustBrightness(this.planet.colors.sand.lum)
					;
		var filter = new createjs.ColorMatrixFilter(matrix);

		const front1 = new createjs.Bitmap(queue.getResult(this.planet.images.frontground));
		front1.regX = front1.image.width/2;
		front1.regY = front1.image.height/2;
		front1.y = STAGEHEIGHT - front1.image.height/2;
		front1.x = STAGEWIDTH/2;
		front1.filters = [filter];
  	front1.cache(0, 0, front1.getBounds().width, front1.getBounds().height);
		this.frontground.addChild(front1);

		const front2 = new createjs.Bitmap(queue.getResult(this.planet.images.frontground));
		front2.regX = front2.image.width/2;
		front2.regY = front2.image.height/2;
		front2.scaleX = -1;
		front2.y = front1.y;
		front2.x = front1.x + front1.image.width;
		front2.filters = [filter];
  	front2.cache(0, 0, front2.getBounds().width, front2.getBounds().height);
		this.frontground.addChild(front2);

		this.frontground.alpha = this.planet.colors.sand.alpha;

		this.front1 = front1;
		this.front2 = front2;
	}

	prototype.paralaxFront = function() {

		if(!this.wave) return;

		let dx = (this.front1.y - this.planet.lines.horizon) / (this.wave.y - this.wave.params.height/2 - this.planet.lines.horizon);

		this.front1.x += this.wave.movingX * dx;
		this.front2.x += this.wave.movingX * dx;

		if(this.wave.direction === LEFT) {
			if(this.front1.x > STAGEWIDTH + this.front1.image.width/2) { this.front1.x = this.front2.x - this.front1.image.width; }
			if(this.front2.x > STAGEWIDTH + this.front2.image.width/2) { this.front2.x = this.front1.x - this.front2.image.width;}
		}
		else {
			if(this.front1.x < - this.front1.image.width/2) { this.front1.x = this.front2.x + this.front1.image.width; }
			if(this.front2.x < - this.front2.image.width/2) { this.front2.x = this.front1.x + this.front2.image.width; }
		}

	}

	prototype.addNextSerie = function() {
    //console.log('addNextSerie');
		// launch a new serie timer
		let serie_timer = new Timer(proxy(this.addSerie,this),this.config.series.interval, proxy(this.removeTimer, this));
		this.timers.push(serie_timer);

	}

	prototype.addWave = function(coef) {

		var coef = coef || 1;

		var config = this.config.waves;
			config.height = this.config.waves.height * coef
			config.width = this.config.waves.width * coef
			config.y = this.planet.lines.horizon + (this.planet.lines.peak - this.planet.lines.horizon) * coef;
			config.x = (this.config.series.xshift/100 * STAGEWIDTH) + this.config.series.spread/2 - Math.random()*this.config.series.spread;

		var wave = new Wave({spot: this, config: config});
		this.sea_cont.addChild(wave);
		this.waves.push(wave);

		return wave;
	}

	prototype.addSerie = function() {
    //console.log('addSerie');
		// launch first wave
		this.addSwell(1);

		// launch the rest with delay
		for(let i=2; i <= this.config.series.length; ++i) {

			// calcul delay
			let delay = (i-1) * this.config.series.frequency;
			// launch timer
			let timer = new Timer(proxy(this.addSwell,this,[i]),delay, proxy(this.removeTimer, this));
			// add timer to timers
			this.timers.push(timer);

		}
	}

	prototype.addSwell = function(nb) {
    //console.log('addSwell', nb);
    // if spot is already played, return early
    if(this.played) return;

		//configuration of the wave
		var config = this.config.waves;
			config.x = (this.config.series.xshift/100 * STAGEWIDTH) + this.config.series.spread/2 - Math.random()*this.config.series.spread;
			config.y = this.planet.lines.horizon;

		//create Wave at horizon point
		var wave = new Wave({spot: this, config: config});

		//add to scene
		this.sea_cont.addChildAt(wave,0);
		this.waves.unshift(wave);

		//start tween
		var tween = createjs.Tween.get(wave);
		tween.to({y: this.planet.lines.beach + this.config.waves.height}, this.config.series.speed)
		tween.call(proxy(this.removeWave,this,[wave]))
		tween.addEventListener('change',proxy(wave.coming,wave));
		wave.coming_tween = tween;

		// if last wave of serie, add next wave
		if( nb === this.config.series.length ) {
			// if its not played yet
      if(this.played === false) {
  			// call next serie

  			this.addNextSerie();
      }
		}

	}

	prototype.addInitialSerie = function() {

    //console.log('addInitialSerie');
		let speed = this.config.series.speed;
		let length = this.config.series.length;
		let frequency = this.config.series.frequency;

		let startAt = 0.3;

		// launch first wave at advanced position
		this.addInitialWave(speed * startAt, 1);

		// test others wave of the serie
		for(let i=1; i < length; i++) {
			let previLaunch = frequency * i;
			let currentTime = speed * startAt;
			let diff = previLaunch - currentTime;

			// if next wave should be already launched
			if(diff <= 0) {
        //console.log(i,'at advanced position');
				// add a wave at a advanced position
				let position = diff * -1;
				this.addInitialWave(position,i+1);
				//console.log('add now at position', position);
			}
			else {
        //console.log(i,'with a bit of delay', diff);
				// launch wave at position zero with a bit of delay
				let delay = diff;
				let timer = new Timer(proxy(this.addSwell,this,[i+1]), delay, proxy(this.removeTimer, this));
				this.timers.push(timer);
				//console.log('add with delay', delay);
			}
		}



	}

	prototype.addInitialWave = function(position = 0, nb) {

    //console.log('addInitialWave');
		// create config
		let config = this.config.waves;
		config.x = (this.config.series.xshift/100 * STAGEWIDTH) + this.config.series.spread/2 - Math.random()*this.config.series.spread;
		config.y = this.planet.lines.horizon;

		// create wave
		let wave = new Wave({spot: this, config: config});

		// set tween
		let tween  = createjs.Tween.get(wave);
			tween.to({y: this.planet.lines.beach + this.config.waves.height}, this.config.series.speed)
			tween.call(proxy(this.removeWave,this,[wave]))
			tween.addEventListener('change',proxy(wave.coming,wave));
			wave.coming_tween = tween;

		// start tween at advanced position
		tween.setPosition(position);

		// if this wave is starting at a position which is over the breaking line, skip this wave
		if(wave.y >= this.planet.lines.break) return;

		// add to scene
		this.sea_cont.addChildAt(wave);

		// add to array
		this.waves.unshift(wave);

    // add the next serie after interval
    if(nb == this.config.series.length) this.addNextSerie();

	}


	prototype.initHomeScreen = function() {

		//hide score
		this.score_cont.alpha = 0;

		// add doggo
    const dog = new createjs.Sprite(
      new createjs.SpriteSheet({
          images: [queue.getResult('dog')],
          frames: {width:parseInt(64*rX), height:parseInt(64*rY), regX: parseInt(16*rX), regY: parseInt(16*rY)},
          framerate: 10,
          animations: {
            sit: [0,1, 'sit'],
          }
      })
    );
    dog.x = 430*rX;
    dog.y = STAGEHEIGHT - 150*rY;
    dog.scale = 1;
    dog.gotoAndPlay('sit');
    window.extra_cont.addChild(dog);

    // add ptero

    const ptero = new createjs.Sprite(
      new createjs.SpriteSheet({
          images: [queue.getResult('ptero')],
          frames: {width:parseInt(128*rX), height:parseInt(128*rY), regX: parseInt(64*rX), regY: parseInt(64*rY)},
          framerate: 4,
          animations: {
            fly: [0,9, 'fly'],
          }
      })
    );
    let pad = 128;
    ptero.x = -pad * rX;
    ptero.y = 150 * rY;
    ptero.scale = 1;
    ptero.gotoAndPlay('fly');
    window.extra_cont.addChild(ptero);
    createjs.Tween.get(ptero, {loop: true}).to({x: STAGEWIDTH+pad*rX}, 10000).wait(2000).set({scaleX:-1}).to({x:-pad*rX},10000).wait(2000).set({scaleX:1});
    createjs.Tween.get(ptero, {loop: true}).to({y: 200*rY}, 2000).to({y: 150*rY}, 2000);


    // add button
    const sprite = new createjs.Sprite(
      new createjs.SpriteSheet({
          images: [queue.getResult('btn_startgame')],
          frames: {width:parseInt(700*rX), height:parseInt(280*rY), regX: parseInt(350*rX), regY: parseInt(140*rY)},
          framerate: 1,
          animations: {
            out: [0],
            over: [1],
            down: [2],
          }
      })
    );
    const btn = new createjs.ButtonHelper(sprite, "out", "over", "down");
    sprite.x = STAGEWIDTH/2;
    sprite.y = STAGEHEIGHT - 100*rY;
    window.extra_cont.addChild(sprite);
    sprite.addEventListener('click', function(e) {
      MENU.open();
    });

	}

	prototype.initStatic = function() {
    //console.log('initStatic');
		this.removeAllWaves();
		this.initEventsListeners();
		let wave = this.addWave(1);
		this.setWave(wave);
		this.addPaddler(this.config.surfers.x, this.config.surfers.y);

	}

	prototype.initWaving = function() {
    //console.log('initWaving');

		this.runing = true;
		this.removeAllWaves();
		this.initEventsListeners();
		this.addInitialSerie();
		//this.addSerie();
		this.addPaddler(this.config.surfers.x, this.config.surfers.y);
	}

	prototype.initWhenReady = function() {
    //console.log('initWhenReady');
		this.removeAllWaves();
		this.initEventsListeners();

		var wave = this.addWave();
		this.setWave(wave);

		var x = STAGEWIDTH/2
		var y = wave.params.height*1/3;
		var paddler = this.addPaddler(x + wave.getX(), wave.y - wave.params.height + y);
		paddler.removeAllListeners();


		var surfer = new Surfer({
			x: x,
			y: y,
			wave: wave,
			spot: this,
		});

    var count = 3;
		var readyButton = new createjs.Container();
    var bkg = new createjs.Shape();
    var txt = new createjs.Text('Click '+count+' times',Math.floor(22*rY)+'px Helvetica');
    var bound = txt.getBounds();
    var pad = {x: 40, y: 15};
    bkg.graphics.beginFill('#FFF').drawRoundRect(-bound.x/2 - pad.x, -bound.y - pad.y, bound.width + pad.x*2, bound.height + pad.y*2, 5);
    readyButton.x = paddler.localToGlobal(0,0).x;
    readyButton.y = paddler.localToGlobal(0,0).y + 100;
    readyButton.regX = txt.getMeasuredWidth()/2;
    readyButton.regY = txt.getMeasuredHeight()/2;
    readyButton.cursor = 'pointer';
    readyButton.addChild(bkg,txt);
    this.overlay_cont.addChild(readyButton);

    var time = wave.config.breaking.y_speed;

    readyButton.on('click',proxy(function() {

    		count--;
    		txt.text = 'Click '+count+' times';
				paddler.silhouette.gotoAndPlay('down');

    		if(count > 0) return;

				window.switchSlowMo(0.2, 0);
				wave.initBreak(STAGEWIDTH/2);

				window.switchSlowMo(1, time)
				setTimeout(proxy(
					function() {
						wave.playerTakeOff(surfer);
						this.removePaddler(paddler);
					},this)
				,time*1/4);

				this.overlay_cont.removeChild(readyButton);

    	},this));




	}

	prototype.initRunMode = function() {

		this.removeAllWaves();
		this.initEventsListeners();

		// add weapon to config
		this.config.surfers.weapons = ['saberlight'];

		// add Wave
		var wave = this.addWave();

		// add Surfer and place it on the wave
		var surfer = new Surfer({
      x: STAGEWIDTH/2,
      y: 10,
      wave: wave,
      spot: this,
    });

    surfer.automove = true;
    surfer.alpha = 0; //hide surfer temporaly
    TEST = 1; // avoid auto surfer to fall
    wave.playerTakeOff(surfer);

    createjs.Tween.get(surfer.virtualMouse).to({y: wave.y + surfer.y }, 2000).to({y: wave.y - wave.params.height*1/3 }, 500);
    createjs.Tween.get(surfer.virtualMouse).to({x: wave.x + surfer.x - wave.params.breaking.width * 2}, 2000);
    createjs.Tween.get(surfer).wait(1000).to({alpha: 1}, 1000)
      .call(function() {
        surfer.automove = false;
        TEST = 0;
      });

	}

	prototype.remove = function() {

		this.timers.map(function(timer) { timer.clear(); });
		this.waves.map(function(wave) { createjs.Tween.removeTweens(wave); wave.selfRemove(); });
		this.paddlers.map(function(paddler) { paddler.remove() });
		this.score.selfRemove();
    this.score = null;
    this.controls.selfRemove();
    this.controls = null;

    this.timers = [];
		this.waves = [];
		this.paddlers = [];
		this.removeAllChildren();
    this.removeEventListeners();
	}

  prototype.removeEventListeners = function() {

    this.off('tick', this.ticker);
		this.removeAllEventListeners();
  }

	prototype.initEventsListeners = function() {

		this.ticker = this.addEventListener('tick',proxy(this.tick,this), this);
		this.on('player_takeoff',function(event) {
			this.playerTakeOff(event.surfer,event.wave);
		},this);

		this.on('played_wave',function(event) {
			//console.log('played_wave');
			this.stopPlayedWave(event.wave);
		},this);

		this.on('non_played_wave',function(event) {
			this.fadeNonPlayedWave(event.wave);
		},this);

		this.on('paddler_paddling',function(event) {
			this.paddlerPaddling(event);
		},this);

		this.on('player_fallen',function(event) {
			this.playerFalling(event);
		},this,true);

		this.on('xpbar.level_up',function(event) {
			//
		},this);
	}

	prototype.tick = function() {

		if(this.paused) return;

		this.paralaxWaves();
		this.paralaxFront();
		this.drawDebug();
	}

	prototype.fadeNonPlayedWave = function(wave) {

		var tween  = createjs.Tween.get(wave, {override:false})
			.to({alpha: 0}, 1000)
			.call(proxy(this.removeWave,this,[wave]))
			;
	}

	prototype.stopPlayedWave = function(wave) {

		//stop this wave
		wave.coming_tween.paused = true;

		//fade out other wave
		for(let i=0, ln=this.waves.length-1; i<ln; i++) {
			let other = this.waves[i];
			if(other == wave) continue;
			createjs.Tween.get(other).to({alpha:0}, 1200).call(proxy(this.removeWave,this,[other]));
		}

		//stop serie incoming
		this.timers.map(t => t.clear());

	}

	prototype.playerTakeOff = function(surfer,wave) {

    this.played = true;
		this.wave = wave;
		this.surfer = surfer;
		//stop spot timers
		this.timers.map(t => t.clear());

    this.on('goals_filled', proxy(this.playerSucceed, this), null, true);
	}

  prototype.playerSucceed = function() {

    this.wave.addBlockBreaking(STAGEWIDTH);
  }

	prototype.addPaddler = function(x,y) {

		if(this.config.surfers.max == 0) return;

		var paddler = new Paddler({
			spot: this,
			x: x,
			y: y
		});

		this.sea_cont.addChild(paddler);
		this.paddlers.push(paddler);

		return paddler;
	}

	prototype.addPaddlerBot = function(x,y) {

		var x = x || STAGEWIDTH/4 + Math.random()*(STAGEWIDTH/2);
		var y = y || Math.random()*(this.planet.lines.peak - this.planet.lines.horizon - 100) + this.planet.lines.horizon;


		var x = MOUSE_X;
		var y = MOUSE_Y;

		var bot = new PaddlerBot({
			spot: this,
			x: x,
			y: y,
		});

		this.sea_cont.addChild(bot);
		this.paddlers.push(bot);

		//console.log(this.paddlers);
	}



	prototype.paddlerPaddling = function(event) {

    let paddler = event.paddler;
		if(paddler.isBot) this.botPaddling(event);
		if(paddler.isPlayer) this.playerPaddling(event);
	}

	prototype.botPaddling = function(event) {

		if(this.runing === false) return;

    let bot = event.paddler;

		var index = this.sea_cont.getChildIndex(bot) - 1;
		while(index>=0) {

			var wave = this.sea_cont.getChildAt(index);

			if(wave instanceof Wave) {

				if(bot.y <= wave.y - wave.params.height/3 && bot.y > wave.y - wave.params.height) {

					if(bot.paddling_attempt >= 2) {

						var x = ( bot.getX() - wave.getX() );
						var y = ( wave.params.height - ( wave.getY() - bot.getY() ));

						var direction = (bot.getX() <= STAGEWIDTH/2)? 1 : -1;

						var surfer = new SurferBot({
							x: x,
							y: y,
							wave: wave,
							spot: this,
							direction: direction
						});
						wave.addSurferBot(surfer);


						bot.clearPaddler();
						this.sea_cont.removeChild(bot);
						this.paddlers.splice(this.paddlers.indexOf(bot),1);

						break;
					}
				}
			}

			index--;
		}
	}

	prototype.firstWaveBehindPaddler = function(paddler) {

		var index = this.sea_cont.getChildIndex(paddler) - 1;
		while(index>=0) {
			var wave = this.sea_cont.getChildAt(index);
			if(wave instanceof Wave) return wave;
			index--;
		}
		return false;
	}

	prototype.isPaddlerOnWave = function(paddler,wave) {
		if(paddler.getY() < wave.getY() && paddler.getY() > (wave.getY() - wave.params.height)) return true;
		return false;
	}

	prototype.playerPaddling = function(event) {

    let paddler = event.paddler;
    let direction = event.direction;
    let force = event.force;

    // return if no trying to take wave
    if(direction !== 'down') return;
    // get wave he is trying to catch
		var wave = this.firstWaveBehindPaddler(paddler);
		//return if no wave
		if(!wave) return;
		//return if not ON wave
		if(!this.isPaddlerOnWave(paddler,wave)) return;
		//return if paddling force not enough
		if(force <= wave.params.paddling_effort) return;

		//calcul paddler position relative to the wave
		var y = ( wave.params.height - (wave.getY() - paddler.getY() ));
		var x = ( paddler.getX() - wave.getX() );

		//replace paddler by surfer
		var surfer = new Surfer({
			x: x,
			y: y,
			wave: wave,
			spot: this,
		});

		this.wave = wave;
		wave.playerTakeOff(surfer);
		this.removePaddler(paddler);

	}

	prototype.removePaddler = function(paddler) {

		paddler.clearPaddler();
		this.sea_cont.removeChild(paddler);
		this.paddlers.splice(this.paddlers.indexOf(paddler),1);
		return this;
	}

	prototype.removeAllPaddlers = function() {

		for(let i=0,len=this.paddlers.length; i<len; ++i) {
			let paddler = this.paddlers[i];
			this.removePaddler(paddler);
		}
		return this;
	}

	prototype.drawScore = function() {

		if(this.score) {
			this.score.selfRemove();
			this.score_cont.removeAllChildren();
		}
		this.score = new ScoreUI({spot: this});
		this.score_cont.addChild(this.score);
		this.score_cont.alpha = 1;
		SCORE = this.score;
	}

  prototype.drawControls = function() {

    this.controls = new ControlUI({spot: this});
    this.control_cont.addChild(this.controls);
  }

	prototype.showScore = function() {
		this.score.alpha = 1;
	}

	prototype.hideScore = function() {
		this.score.alpha = 0;
	}

	prototype.paralaxWaves = function() {

		if(!this.wave || this.wave.direction == 0) return;

		if(this.paused) return;

		var index = this.sea_cont.getChildIndex(this.wave) - 1;
		while(index >= 0) {

			var wave = this.sea_cont.getChildAt(index);

			if(wave instanceof Wave) {

				var dx = 15 * (this.wave.direction);
				wave.cont.x += dx;

				if(wave.cont.x > STAGEWIDTH || wave.cont.x < -STAGEWIDTH) {
					this.removeWave(wave);
				}

			}

			index--;
		}
	}

	prototype.playerFalling = function(event) {
		//stop useless interval
		this.wave.cleaning_timer.clear();
		//freaze the wave after 6s
		this.stopWaveTimeout = setTimeout(proxy(this.stopWaveAfterFall,this), 6000);
		//launch fall screen
		this.showScoreboard();
	}

	prototype.stopWaveAfterFall = function() {

		this.wave.removeAllEventListeners('tick');
	}

	prototype.removeAllOverlays = function() {

		this.overlay_cont.removeAllChildren();

	}

	prototype.initSkillScreen = function(e) {

		this.overlay_cont.removeAllChildren();

		this.removeAllWaves();

		this.overlay_cont.addChild(SCREENS.getSkillScreen(this));

	}

	prototype.removeSkillScreen = function() {

		this.overlay_cont.removeAllChildren();

		this.init();
	}

	prototype.showScoreboard = function(e) {
		this.overlay_cont.removeAllChildren();
		new Timer(proxy(function() {
			this.scoreboard = new Scoreboard(this.score);
			this.overlay_cont.addChild(this.scoreboard);
			this.scoreboard.show();
		},this),1500);
	}

  prototype.hideScoreboard = function(e) {
    this.scoreboard.selfRemove();
    this.overlay_cont.removeAllChildren();
    this.scoreboard = null;
  }

	prototype.drawOverlayVeil = function() {

		var veil = new createjs.Shape();
		veil.graphics.beginFill('white').drawRect(0,0,STAGEWIDTH,STAGEHEIGHT);
		this.overlay_veil.addChild(veil);
		this.overlay_veil.alpha = 0;
		this.overlay_veil.mouseEnabled = false;
	}

	prototype.showOverlayVeil = function(percent)
	{
		var max = 0.8;
		this.overlay_veil.alpha = percent/100*max;
	}

	prototype.hideOverlayVeil = function() {

		if(this.overlay_veil.alpha === 0) return;
		var time = this.overlay_veil.alpha * 1000;
		createjs.Tween.get(this.overlay_veil).to({alpha: 0}, time);
	}

	prototype.retry = function(e) {

    if(this.scoreboard) this.hideScoreboard();

    this.hideOverlayVeil();

    this.controls.hide();

		//reset this spot
		this.init();

		e.stopPropagation();
		e.remove();
	}

	prototype.setRidingWave = function(wave) {

		this.wave = wave;
	}

	prototype.setTimeScale = function(scale) {

		this.time_scale = scale;
		this.waves.map(w => w.setTimeScale(scale));
	}

	prototype.setConfig = function(config) {
		this.config = config;
		this.planet = PLANETS.find(p => p.id == config.planet);
		this.getWaves().map(function(w) {
			w.updateConfig(config.waves);
			w.getSurfers().map(s => s.updateConfig(config.surfers));
		});
	}

	prototype.setWave = function(wave) {

		this.wave = wave;
	}

	prototype.setWaveHeight = function(height) {

		this.config.waves.height = height;
	}

	prototype.getWave = function() {

		return this.wave;
	}

	prototype.getWaves = function() {

		return this.waves;
	}

	prototype.getRidingWave = function() {

		return this.wave;
	}

	prototype.removeWave = function(wave) {
		//console.log('removeWave');
		createjs.Tween.removeTweens(wave);
		wave.selfRemove();
		this.sea_cont.removeChild(wave);
		this.waves.splice(this.waves.indexOf(wave),1);
		return this;
	}

	prototype.removeAllWaves = function() {
		this.timers.map(t => t.clear());
    this.timers = [];
		this.waves.map(w => createjs.Tween.removeTweens(w));
		this.waves.map(w => w.selfRemove());
		this.waves = [];
		this.paddlers.map(p => p.clearPaddler());
		this.paddlers = [];
		this.sea_cont.removeAllChildren();

		return this;
	}

	prototype.breakAllWaves = function() {

		for(var i=0; i < this.waves.length; ++i) {
			this.waves[i].initBreak(700);
		}
	}

  prototype.removeTimer = function(timer) {
    this.timers.splice(this.timers.indexOf(timer), 1);
  }

	prototype.pause = function() {

    this.paused = true;
    this.waves.map(w => { w.pause(); w.coming_tween.paused = true; });
    this.timers.map(t => t.pause());
		this.score.pause();
	}

	prototype.resume = function() {

    this.paused = false;
		this.waves.map(w => { w.coming_tween.paused = false; w.resume(); });
		this.timers.map(t => t.resume());
		this.score.resume();
	}

	prototype.drawDebug = function() {

		if(DEBUG == false) return;

		this.debug_cont.removeAllChildren();

		var line = new createjs.Shape();
		line.graphics.beginStroke('red').setStrokeStyle(1).moveTo(0, this.planet.lines.horizon).lineTo(50,this.planet.lines.horizon);
		this.debug_cont.addChild(line);

		var line = new createjs.Shape();
		line.graphics.beginStroke('orange').setStrokeStyle(1).moveTo(0, this.planet.lines.break).lineTo(50,this.planet.lines.break);
		this.debug_cont.addChild(line);

		var line = new createjs.Shape();
		line.graphics.beginStroke('pink').setStrokeStyle(1).moveTo(0, this.planet.lines.peak).lineTo(50,this.planet.lines.peak);
		this.debug_cont.addChild(line);

		var line = new createjs.Shape();
		line.graphics.beginStroke('yellow').setStrokeStyle(1).moveTo(0, this.planet.lines.beach).lineTo(50,this.planet.lines.beach);
		this.debug_cont.addChild(line);

		var line = new createjs.Shape();
		line.graphics.beginStroke('purple').setStrokeStyle(1).moveTo(0, this.planet.lines.obstacle).lineTo(50,this.planet.lines.obstacle);
		this.debug_cont.addChild(line);
	}

	window.Spot = createjs.promote(Spot,'Container');

}());