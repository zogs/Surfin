(function() {
	
	function Spot(config) {

		this.Container_constructor();

		this.waves = [];
		this.paddlers = [];

		this.config = config || {
			lines: {
				horizon: 180,
				peak: 400,
				beach: 500
			},
			peak_point : 500,
			horizon_point : 180,
			waves: {
				height : 150,
				width : 0,
				breaking: {
					yspeed: 1200,
					left: {
						width: 20,
						width_max: 0,				
						width_interval: 3000,
						width_pause: 1000,
						block_interval: 0,
						block_interval_max: 0,
						block_width: 100,
						block_width_max: 200,
					},					
					right: {
						width: 20,
						width_max: 0,
						width_interval: 3000,
						width_pause: 1000,
						block_interval: 500,
						block_interval_max: 600,
						block_width: 100,
						block_width_max: 200,
					}
				},
				paddling_effort: 1,
				bottom_fall_scale: 1,
				top_fall_scale: 0.2,				
				suction_x: 5,
				suction_y: 3,
				color_top: '#0b2648',
				color_bot: '#0d528c',
				obstacles_interval: 0,
				obstacles_interval_max: 0, 
				obstacles: {
					'paddler' : {percentage: 50},
					'photograph' : {percentage: 50},
				},
				shoulder : {
					left : {
						width: 1000,
						inner: 300,
						outer: 300,
						marge: 50,
						slope: 0
					},
					right : {
						width: 1000,
						inner: 300,
						outer: 300,
						marge: 50,
						slope: 0
					}
				}
			},
			series: {
				length :  4,
				interval : 8000,				
				spread : 200,				
				speed : 12000,
				frequency : 1500,
			},	
			surfers: {
				proportion: 1.5
			}		
		}

		this.bkg_cont = new createjs.Container();
		this.addChild(this.bkg_cont);
		var background = new createjs.Bitmap(queue.getResult('bg_paradize'));
		this.bkg_cont.addChild(background);

		//Score
		this.score_cont = new createjs.Container();
		this.addChild(this.score_cont);

		this.cont = new createjs.Container();
		this.addChild(this.cont);

		this.overlay_cont = new createjs.Container();
		this.addChild(this.overlay_cont);
		
		this.debug_cont = new createjs.Container();
		this.addChild(this.debug_cont);

		//trace debug
		this.traceDebug();		

		//Score
		this.initScore();

		//Listeners
		this.initEventsListeners();

		//Ticker
		this.addEventListener('tick',proxy(this.tick,this));
		
	}

	var prototype = createjs.extend(Spot, createjs.Container);

	prototype.init = function() {

		this.removeAllWaves();
		this.initEventsListeners();
		this.resetScore();
		//this.addWave(0.3);
		this.addWave(1);
		this.addPaddler(STAGEWIDTH/2,300);
	}

	prototype.launch = function() {

		this.removeAllWaves();
		this.initEventsListeners();
		this.resetScore();
		this.addInitialSerie();
		this.addPaddler(STAGEWIDTH/2,300);
	}

	prototype.initEventsListeners = function() {

		stage.on('player_take_off',function(event) {
			this.playerTakeOff(event.surfer,event.wave);
			event.remove();
		},this);

		stage.on('played_wave_on_spot',function(event) {
			this.stopPlayedWave(event.wave);
			event.remove();
		},this);

		stage.on('non_played_wave_on_spot',function(event) {
			this.fadeNonPlayedWave(event.wave);
			event.remove();
		},this);

		stage.on('paddler_paddling',function(event) {
			this.paddlerPaddling(event);
		},this);

		stage.on('player_fallen',function(event) {			
			this.playerFalling(event);
		},this);
	}

	prototype.tick = function() {

		if(PAUSED) return;
		this.managePaddlers();
		this.paralaxWaves();
	}

	prototype.managePaddlers = function() {

		//for each paddlers
		for(var i=0,len=this.paddlers.length;i<len;i++) {

			var paddler = this.paddlers[i];

			//find lower indexed waves
			var index = this.cont.getChildIndex(paddler) - 1;
			while(index >= 0) {

				if(this.cont.getChildAt(index) instanceof Wave) {
				
					var wave = this.cont.getChildAt(index);

					//find if paddler superposed to wave
					if(paddler.getY() < wave.y && paddler.getY() > wave.y - wave.params.height) {

						paddler.liftup(1);
					}

					//if user is above wave
					if(paddler.getY() < wave.y - wave.params.height) {
						
						//swap index pos
						this.cont.swapChildren(paddler,wave);

						//lower paddler pos
						paddler.liftdown();
					}
				}
				index--;
			}
		}
	}

	prototype.fadeNonPlayedWave = function(wave) {

		//var tween  = createjs.Tween.get(wave, {override:false}).wait(2000).to({alpha: 0}, 1000);
	}

	prototype.stopPlayedWave = function(wave) {

		//stop this wave and all the next ones
		var i = this.waves.indexOf(wave) + 1;
		while(i--) {
			//this.waves[i].ytween.setPaused(true);
			createjs.Tween.removeTweens(this.waves[i]);
		}

		//stop serie incoming
		clearTimeout(this.series_interval);
		clearTimeout(this.waves_interval);

	}

	prototype.playerTakeOff = function(surfer,wave) {
		this.isPlayed = true;
		this.wave = wave;
		this.surfer = surfer;
	}

	prototype.addPaddler = function(x,y) {

		var paddler = new Paddler({
			spot: this,
			x: x,
			y: y
		});

		this.cont.addChild(paddler);
		this.paddlers.push(paddler);
	}

	prototype.addPaddlerBot = function(x,y) {

		var x = x || STAGEWIDTH/4 + Math.random()*(STAGEWIDTH/2);
		var y = y || Math.random()*(this.config.lines.beach - this.config.lines.horizon) + this.config.lines.horizon;
		var y = 300;
		var bot = new PaddlerBot({
			spot: this,
			x: x,
			y: y,
		});

		this.cont.addChild(bot);
		this.paddlers.push(bot);

		console.log(this.paddlers);
	}

	prototype.addSeries = function() {

		if(this.isPlayed == true) return;

		this.addSerieWaves();

		this.series_interval = window.setTimeout(proxy(this.addSeries,this),(this.config.series.interval + this.config.series.length*this.config.series.frequency));
	}	

	prototype.addSerieWaves = function() {

		for(var i=0; i < this.config.series.length; i++) {

			this.waves_interval = window.setTimeout(proxy(this.addSwell,this),this.config.series.frequency*i);
		}
	}

	prototype.addInitialSerie = function() {

		for(var i = 1; i <=this.config.series.length; i++) {

			var config = this.config.waves;
			config.spot = this;
			config.x = this.config.series.spread/2 - Math.random()*this.config.series.spread;
			config.y = this.config.lines.horizon;

			var wave = new Wave(config);		

			//start tween
			var tween  = createjs.Tween.get(wave);		
			tween.to({y: STAGEHEIGHT + this.config.waves.height}, this.config.series.speed, createjs.Ease.cubicIn)
			tween.call(proxy(this.removeWave,this,[wave]))
			tween.addEventListener('change',proxy(wave.coming,wave));
			tween.setPosition((1500*this.config.series.length)-(1500*i));
			
			//add to scene
			this.cont.addChildAt(wave,0);			
			this.waves.unshift(wave);
		}

		this.series_interval = window.setTimeout(proxy(this.addSeries,this),(this.config.series.interval));
	}

	prototype.addSwell = function() {

		if(this.isPlayed) return;

		//configuration of the wave
		var config = this.config.waves;
			config.spot = this;
			config.x = this.config.series.spread/2 - Math.random()*this.config.series.spread;
			config.y = this.config.lines.horizon;

		//create Wave at horizon point
		var wave = new Wave(config);

		//add to scene
		this.cont.addChildAt(wave,0);
		this.waves.unshift(wave);

		//start tween
		var tween = createjs.Tween.get(wave);		
		tween.to({y: STAGEHEIGHT + this.config.waves.height}, this.config.series.speed, createjs.Ease.cubicIn)
		tween.call(proxy(this.removeWave,this,[wave]))
		tween.addEventListener('change',proxy(wave.coming,wave));

		wave.alpha = 0;
		createjs.Tween.get(wave).to({alpha: 1}, 5000);

	}

	prototype.paddlerPaddling = function(event) {

		var paddler = event.paddler;

		if(paddler.isBot) this.botPaddling(paddler);
		else if(paddler.isPlayer) this.playerPaddling(paddler);
	}

	prototype.botPaddling = function(bot) {


		var index = this.cont.getChildIndex(bot) - 1;
		while(index>=0) {

			var wave = this.cont.getChildAt(index);

			if(wave instanceof Wave) {

				if(bot.y <= wave.y - wave.params.height/3 && bot.y > wave.y - wave.params.height) {
					
					if(bot.paddling_attempt >= 2) {

						var x = ( bot.getX() - wave.getX() );
						var y = ( wave.params.height - ( wave.getY() - bot.getY() ));
						
						var direction = (bot.getX() <= STAGEWIDTH/2)? 'left' : 'right';

						var surfer = new SurferBot({
							x: x,
							y: y,
							wave: wave,
							spot: this,
							direction: direction
						});
						wave.addSurferBot(surfer);


						bot.removeListeners();
						this.cont.removeChild(bot);
						this.paddlers.splice(this.paddlers.indexOf(bot),1);

						break;
					}
				}
			}

			index--;
		}
	}

	prototype.playerPaddling = function(paddler) {

		var index = this.cont.getChildIndex(paddler) - 1;
		while(index>=0) {

			var wave = this.cont.getChildAt(index);

			if(wave instanceof Wave) {
			
				if(paddler.y <= wave.y - wave.params.height/3 && paddler.y > wave.y - wave.params.height) {
					
					//if paddling force is not enougth, quit and return
					if(paddler.paddling_force <= wave.params.paddling_effort) return;
					
					//calcul paddler position relative to wave
					var y = ( wave.params.height - ( wave.getY() - paddler.getY() ));
					var x = ( paddler.getX() - wave.getX() );

					//add surfer to wave
					var surfer = new Surfer({
						x: x,
						y: y,	
						wave: wave,
						spot: this,				
					});
					wave.playerTakeOff(surfer);

					//set rided wave
					this.wave = wave;
					
					//remove paddler
					paddler.removeListeners();
					this.cont.removeChild(paddler);
					this.paddlers.splice(this.paddlers.indexOf(paddler),1);

					//init score					
					this.showScore();
					
					//break loop
					break;
				}
			}

			index--;
		}
	}

	prototype.initScore = function() {

		//Score		
		this.score_cont.removeAllChildren();
		this.score = new Score();
		this.score.alpha = 0;
		this.score.setSpot(this);
		this.score_cont.addChild(this.score);
	}

	prototype.resetScore = function() {
		this.score.reset();
	}

	prototype.showScore = function() {
		this.score.alpha = 1;
	}

	prototype.paralaxWaves = function() {

		if(!this.wave || this.wave.direction == 0) return;
		
		var index = this.cont.getChildIndex(this.wave) - 1;
		while(index >= 0) {

			var wave = this.cont.getChildAt(index);

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
		
		if(TEST) return;

		//stop useless interval
		window.clearInterval(this.wave.clearnerInterval);
		//freaze the wave after 6s
		window.setTimeout(proxy(function(){ this.stopWaveAfterFall(); },this), 6000);
		//launch fall screen
		this.initFallScreen();

	}

	prototype.stopWaveAfterFall = function() {

		if(this.wave) {
			this.wave.removeAllEventListeners('tick');
		}
	}


	prototype.initFallScreen = function() {

		this.overlay_cont.removeAllChildren();

		var backred = new createjs.Shape();
		backred.graphics.beginFill('red').rect(0,0,STAGEWIDTH,STAGEHEIGHT);
		backred.alpha = 0;	

		var backwhite = new createjs.Shape();
		backwhite.graphics.beginFill('white').rect(0,0,STAGEWIDTH,STAGEHEIGHT);
		backwhite.alpha = 0;

		var wash = new createjs.Shape();
		wash.graphics.beginFill('rgba(255,255,255,0.3)').moveTo(0,0);
		wash.y = STAGEHEIGHT;
		var total=0;
		var width = 1000;
		var amp = 200;
		while(total<STAGEWIDTH*3) {
			wash.graphics.bezierCurveTo(total+width/2,amp,total+width*2/3,-amp,total+width,0);
			total+= width;
		}
		wash.graphics.lineTo(STAGEWIDTH*3,STAGEHEIGHT*3)
		.lineTo(0,STAGEHEIGHT*3)
		.closePath();

		var wash2 = wash.clone();
		wash2.y = STAGEHEIGHT;
		wash2.x = -STAGEWIDTH;

		var dx = Math.random()*500 + 200;

		createjs.Tween.get(backred).to({alpha:0.7},200).to({alpha:0.2},500);
		createjs.Tween.get(backwhite).wait(200).to({alpha:0.8},500);


		createjs.Tween.get(wash).to({y: 200,x:-dx},700);
		createjs.Tween.get(wash2).to({y: 150,x:-dx - STAGEWIDTH/2},800)
						.call(function(){
							createjs.Tween.get(wash,{loop:true}).to({x: wash.x+200},2000).to({x: wash.x},2000);
							createjs.Tween.get(wash2,{loop:true}).to({x: wash2.x+100},2000).to({x: wash2.x},2000);
						});

		this.overlay_cont.addChild(wash);
		this.overlay_cont.addChild(wash2);
		this.overlay_cont.addChild(backred);
		this.overlay_cont.addChild(backwhite);

		for(var i=0; i<=5; i++) {

			var drop = new createjs.Shape();
			drop.graphics.beginFill('white').drawCircle(0,0,Math.random()*150+50);
			drop.x = Math.random()*STAGEWIDTH;
			drop.y = Math.random()*STAGEHEIGHT;
			drop.alpha = 0;
			drop.scaleX = drop.scaleY = 0;
			this.overlay_cont.addChild(drop);

			createjs.Tween.get(drop).wait(200).to({alpha:0.3,scaleX:1,scaleY:1},300);
		}

		for(var i=0; i<=3; i++) {

			var drop = new createjs.Shape();
			drop.graphics.setStrokeStyle(Math.random()*15+5).beginStroke('#FFF').drawCircle(0,0,Math.random()*50+25);
			drop.x = Math.random()*STAGEWIDTH;
			drop.y = Math.random()*STAGEHEIGHT;
			drop.alpha = 0;
			drop.scaleX = drop.scaleY = 0;
			this.overlay_cont.addChild(drop);

			createjs.Tween.get(drop).wait(200).to({alpha:0.3,scaleX:1,scaleY:1},300);
		}

		var title = new createjs.Bitmap(queue.getResult('washed_text'));
		title.alpha = 0;
		title.x = STAGEWIDTH/2;
		title.y = STAGEHEIGHT*2/3 - title.image.height/2;
		title.regX = title.image.width/2;
		title.regY = title.image.height/2;
		title.scaleX = title.scaleY = 1;

		this.overlay_cont.addChild(title);
		createjs.Tween.get(title).wait(1000).to({alpha:1},2000);

		var failphrase = new createjs.Text('" '+this.score.getFailPhrase()+' "', "bold italic 18px Arial", "#95474a");
		failphrase.alpha = 0;
		failphrase.x = title.x ;
		failphrase.y = title.y + 125;
		failphrase.regX = failphrase.getMeasuredWidth()/2;
		failphrase.regY = failphrase.getMeasuredHeight()/2;

		this.overlay_cont.addChild(failphrase);
		createjs.Tween.get(failphrase).wait(1500).to({alpha:1},500);

		var subscore = new createjs.Text("Score : " + this.score.getScore(), "bold 18px Arial", "#AAA");
		subscore.alpha = 0;
		subscore.x = title.x ;
		subscore.y = title.y + 150;
		subscore.regX = subscore.getMeasuredWidth()/2;
		subscore.regY = subscore.getMeasuredHeight()/2;

		this.overlay_cont.addChild(subscore);
		createjs.Tween.get(subscore).wait(1800).to({alpha:1},500);


		var retry = new createjs.Text("[ CLICK TO RETRY ]", "14px Arial", "#AAA");
		retry.alpha = 0;
		retry.x = title.x ;
		retry.y = STAGEHEIGHT - 75;
		retry.regX = retry.getMeasuredWidth()/2;
		retry.regY = retry.getMeasuredHeight()/2;

		this.overlay_cont.addChild(retry);
		createjs.Tween.get(retry).wait(2000).to({alpha:1},500);

		this.click_retry = stage.on('click',proxy(this.fallRetry,this));

	}

	prototype.fallRetry = function(e) {

		e.stopPropagation();
		e.remove();

		this.overlay_cont.removeAllChildren();
		this.init();

	}

	prototype.setRidingWave = function(wave) {

		this.wave = wave;
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

	prototype.getRidingWave = function() {

		return this.wave;
	}

	prototype.getPeak = function() {

		return this.config.lines.peak;
	}

	prototype.getHorizon = function() {

		return this.config.lines.horizon;
	}
	prototype.getBeach = function() {

		return this.config.lines.beach;
	}


	prototype.addWave = function(coef) {

		var coef = coef || 1;

		var config = this.config.waves;
		config.spot = this;
		config.height = this.config.waves.height * coef
		config.width = this.config.waves.width * coef
		config.y = this.config.lines.horizon + (this.config.lines.peak - this.config.lines.horizon) * coef;

		var wave = new Wave(config);		
		this.cont.addChild(wave);
		this.waves.push(wave);
	}

	prototype.removeWave = function(wave) {
		
		wave.clearWave();
		this.cont.removeChild(wave);
		this.waves.splice(this.waves.indexOf(wave),1);
		wave = null;
		return this;
	}

	prototype.removeAllWaves = function() {
		
		this.cont.removeAllChildren();
		this.waves = [];
		this.paddlers = [];

		return this;
	}

	prototype.breakAllWaves = function() {

		for(var i=0; i < this.waves.length; i++) {

			this.waves[i].initBreak(700);
		}
	}

	prototype.pause = function() {

		for(var i=0; i < this.waves.length; i++) {

			this.waves[i].pause();
		}
	}

	prototype.stopOtherWaves = function() {

		for(var i=0; i < this.waves.length; i++) {

			//except the riding wave
			if(this.waves[i] == this.wave) continue;

			//remove tween only for non-breaked waves
			if(this.waves[i].y <= this.peak_point) createjs.Tween.removeTweens(this.waves[i]);
		}

		window.clearInterval(this.swell_timer);
	}

	prototype.stopNextWaves = function() {

		createjs.Tween.removeTweens(this.waves[3]);

		window.clearInterval(this.swell_timer);
	}

	prototype.traceDebug = function() {

		var peak = new createjs.Shape();
		peak.graphics.beginFill('pink')
			.drawCircle(0, 0, 6)
			;	
		peak.y = this.config.lines.peak; 
		this.debug_cont.addChild(peak);

		var horizon = new createjs.Shape();
		horizon.graphics.beginFill('red')
			.drawCircle(0, 0, 6)
			;	
		horizon.y = this.config.lines.horizon; 
		this.debug_cont.addChild(horizon);
	}

	window.Spot = createjs.promote(Spot,'Container');

}());