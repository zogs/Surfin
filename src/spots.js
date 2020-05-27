(function() {

	function Spot(config) {

		this.Container_constructor();
    this.init(config);
  }

	var prototype = createjs.extend(Spot, createjs.Container);

  prototype.init = function(config) {

		this.config = cloneObject(config);
    this.adaptConfigToScreensize();

		this.id = this.config.id;
		this.name = this.config.name;
		this.planet = PLANETS.find(p => p.id == config.planet);
		this.level = this.config.level;

		this.waves = [];
		this.surfers = [];
		this.paddlers = [];
		this.timers = [];
    this.dialogs = [];

		this.score = null;
		this.wave = null;
    this.ticker = null;
		this.runing = false;
    this.paused = false;
    this.played = false;
    this.dialog = null;
    this.scoreboard = null;
		this.time_scale = (TIME_SCALE) ? TIME_SCALE : 1;
    this.retrying = config.retrying ? true : false;

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

    this.extra_cont = new createjs.Container();
    this.addChild(this.extra_cont);

    this.control_cont = new createjs.Container();
    this.addChild(this.control_cont);

		this.overlay_veil = new createjs.Container();
		this.addChild(this.overlay_veil);
		this.drawOverlayVeil();

		this.overlay_cont = new createjs.Container();
		this.addChild(this.overlay_cont);

    this.dialogs_cont = new createjs.Container();
    this.addChild(this.dialogs_cont);

		this.debug_cont = new createjs.Container();
    this.debug_cont.mouseChildren = false;
		this.addChild(this.debug_cont);

		this.drawBackground();
		this.drawFrontground();
    this.drawExtra();

		this.drawScore();
    this.drawControls();
		this.drawMenuBtn();

		this.initSpot();
    this.initStory();

    USER.visitLevel(this.id);
    USER.currentLevel = this.id;

    this.addEventListener('tick',proxy(this.tick,this));

	}


	prototype.initSpot = function(type) {

    /* default init strategy */
		this.initWhenReady();

	}

  prototype.initStory = function() {

    // add story message if USER have not yet visited this spot
    if(this.config.story && USER.notVisited(this.id)) {
      this.config.story.map((s) => {
        let lines = s.lines;
        let btns = (s.buttons) ? s.buttons : [{name: "CONTINUE", action: "continueStory"}];
        let buttons = btns.reduce((arr,b) => {
          arr.push(new Button(b.name, proxy(this[b.action], this)));
          return arr;
        }, []);
        let texts = lines.reduce((arr,text) => {
          arr.push(new Text(text));
          return arr;
        }, []);
        let options = Object.assign({}, {x: STAGEWIDTH/2, y: STAGEHEIGHT/2}, s.options);
        let dialog = new Dialog(texts, buttons, options);
        this.dialogs.push(dialog);
      })
    }

    // show goals message if needed
    if(this.config.goals && this.retrying === false) this.dialogs.push(this.dialogGoals());

    // display first message
    if(this.dialogs.length > 0) {
      this.dialog = this.dialogs[0];
      this.openDialog(this.dialog);
    }
  }

  prototype.continueStory = function() {
    this.closeDialog(this.dialog);
    this.dialog = this.dialogs[this.dialogs.indexOf(this.dialog) + 1];
    if(this.dialog === undefined) return;
    this.openDialog(this.dialog);
  }

  prototype.openDialog = function(dialog) {

    dialog.open();
    this.dialogs_cont.addChild(dialog);
  }

  prototype.closeDialog = function(dialog) {
    dialog.close();
    this.dialogs_cont.removeChild(dialog);
  }

  prototype.closeStory = function() {

    this.closeDialog(this.dialog);
    this.dialog = null;
  }

  prototype.dialogGoals = function() {

    let font_title = '20px "Work Sans", Arial';
    let font_goal = 'italic 16px Helvetica, Arial';

    let lines = [
        new Text("Objectifs", font_title),
        new Text(''),
        ];
    let goals = this.config.goals.reduce((arr, g) => {
      let name = '\u2022 '+ g.name.replace(/(\(.*\))/g, '');
      name = name.toLowerCase();
      arr.push(new Text(name, font_goal, {textAlign: 'left'}))
      return arr;
    }, []);

    let texts = [...lines, ...goals];

    return new Dialog(texts
      , [
        new Button("Commencer", proxy(this.closeStory, this)),
      ], {
        x: STAGEWIDTH/2,
        y: STAGEHEIGHT/2,
        dy: 0,
      })
  }

  prototype.gotoNextLevel = function() {

    SCENE.gotoNextLevel();
  }

	prototype.drawMenuBtn = function() {

		//do not draw MENU button when on Home
		if(this.name == 'home') return;

    let h = 50;
    let w = 45;
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
      .moveTo(0,h*2/3).lineTo(w, h*2/3)
      .setStrokeStyle(0).beginStroke(0).beginFill('rgba(255,255,255,0.2)').drawCircle(w/2,h/3,w*0.9)
      ;
		btn.x = STAGEWIDTH - w*1.8;
		btn.y = h;
		btn.cursor = 'pointer';
		btn.on('click', this.clickMenuButton);
		this.overlay_cont.addChild(btn);
	}

  prototype.clickMenuButton = function(e) {
    e.stopImmediatePropagation();
    MENU.open();
  }

	prototype.drawBackground = function() {

		this.background.removeAllChildren();

		const defaultbkg = new createjs.Shape();
		defaultbkg.graphics.beginFill('#000').drawRect(0,0,STAGEWIDTH,STAGEHEIGHT);
		this.background.addChild(defaultbkg);

		const skyimage = new createjs.Bitmap(queue.getResult(this.planet.images.background));
		skyimage.y = this.planet.lines.horizon - skyimage.image.height;
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

		let dx = (this.front1.y - this.planet.lines.horizon) / (this.wave.y - this.wave.params.height/2 - this.planet.lines.horizon) * 0.5;
		this.front1.x += this.wave.movingX * dx;
		this.front2.x += this.wave.movingX * dx;

		if(this.wave.isLEFT()) {
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

    // reset/init
    this.runing = true;
		this.removeAllWaves();
		this.initEventsListeners();

    // init wave
		var wave = this.addWave();
		this.setWave(wave);

    // init paddler
		var x = STAGEWIDTH/2;
  	var y = wave.params.height*1/3;
    var paddler = new Paddler({
      spot: this,
      x: x + wave.getX(),
      y: y + wave.getY() - wave.params.height,
      fixedsize: 0.6,
      nolift: true,
    });
    this.sea_cont.addChild(paddler);
    this.paddlers.push(paddler);

    // show text
    var cont = new createjs.Container();
    var ready = new Pop('Ready ?').getTextContent();
    ready.x = paddler.localToGlobal(0,0).x;
    ready.y = paddler.localToGlobal(0,0).y - 200;
    cont.addChild(ready);

    var taphere = new createjs.Text('Tap to paddle', 'bold '+Math.floor(16*rY)+'px Helvetica', 'rgba(0,0,0,0.5)');
    taphere.x = paddler.localToGlobal(0,0).x - 25 ;
    taphere.y = ready.y + 50;
    taphere.regX = taphere.getMeasuredWidth()/2;
    taphere.regY = taphere.getMeasuredHeight()/2;
    cont.addChild(taphere);
    var helper = new createjs.Text('Tap here and glide right or left', Math.floor(15*rY)+'px Helvetica', 'rgba(255,255,255,0.6');
    helper.x = paddler.localToGlobal(0,0).x;
    helper.y = wave.y + 10;
    helper.regX = helper.getMeasuredWidth()/2;
    helper.regY = helper.getMeasuredHeight()/2;
    cont.addChild(helper);
    this.overlay_cont.addChild(cont);

    // animate wave ripples
    var animatingWave = this.addEventListener('tick', proxy(wave.animateRipples, wave));

    // on take off, remove text and animation
    this.on('player_takeoff', function(e) {
      this.runing = false; //fix
      this.overlay_cont.removeChild(cont);
      this.removeEventListener('tick', animatingWave);

    })
	}

	prototype.initRunMode = function() {

		this.removeAllWaves();
		this.initEventsListeners();

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

    this.on('goals_filled', proxy(this.levelSucceeded, this), null, true);
	}

  prototype.levelSucceeded = function() {

    this.wave.addBlockBreaking(STAGEWIDTH);
    this.wave.removeObstaclesInterval();
    setTimeout(() => { this.wave.obstacles.map(o => o.die())}, 1200);
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

		this.wave.pause();
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

		this.initSpot();
	}

	prototype.showScoreboard = function(e) {
		this.overlay_cont.removeAllChildren();
		new Timer(proxy(function() {
			this.scoreboard = new Scoreboard(this.score);
			this.overlay_cont.addChild(this.scoreboard);
			this.scoreboard.show();
		},this),200);
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
		this.initSpot();

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
    this.waves.map(w => {
      w.pause();
      if(w.coming_tween) w.coming_tween.paused = true;
    });
    this.timers.map(t => t.pause());
		this.score.pause();
	}

	prototype.resume = function() {

    this.paused = false;
		this.waves.map(w => {
      w.resume();
      if(w.coming_tween) w.coming_tween.paused = false;
    });
		this.timers.map(t => t.resume());
		this.score.resume();
	}

  prototype.adaptConfigToScreensize = function() {
    //series
    this.config.series.spread *= rX;
    this.config.series.xshift *= rX;
    //surfers
    this.config.surfers.x *= rX;
    this.config.surfers.y *= rY;
    this.config.surfers.velocities.x *= rX;
    this.config.surfers.velocities.y *= rY;
    //waves
    this.config.waves.height *= rY;
    this.config.waves.width *= rX;
    this.config.waves.breaking.width *= rX;
    this.config.waves.breaking.x_speed *= rX;
    this.config.waves.breaking.x_speed_max *= rX;
    this.config.waves.breaking.y_speed *= rY;
    this.config.waves.breaking.left.width *= rX;
    this.config.waves.breaking.left.width_max *= rX;
    this.config.waves.breaking.left.block_width *= rX;
    this.config.waves.breaking.left.block_width_max *= rX;
    this.config.waves.breaking.right.width *= rX;
    this.config.waves.breaking.right.width_max *= rX;
    this.config.waves.breaking.right.block_width *= rX;
    this.config.waves.breaking.right.block_width_max *= rX;
    this.config.waves.lip.thickness *= rY;
    this.config.waves.lip.cap.width *= rX;
    this.config.waves.lip.cap.height *= rY;
    this.config.waves.suction.x *= rX;
    this.config.waves.suction.y *= rY;
    this.config.waves.shoulder.left.width *= rX;
    this.config.waves.shoulder.left.inner *= rX;
    this.config.waves.shoulder.left.outer *= rX;
    this.config.waves.shoulder.left.marge *= rX;
    this.config.waves.shoulder.left.slope *= rX;
    this.config.waves.shoulder.right.width *= rX;
    this.config.waves.shoulder.right.inner *= rX;
    this.config.waves.shoulder.right.outer *= rX;
    this.config.waves.shoulder.right.marge *= rX;
    this.config.waves.shoulder.right.slope *= rX;
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