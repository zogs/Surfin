(function() {
	
	function Spot(config) {

		this.Container_constructor();

		this.waves = [];
		this.paddlers = [];

		this.config = config || {
			lines: {
				horizon: 240,
				break: 420,
				peak: 500,
				beach: 590
			},
			peak_point : 500,
			horizon_point : 180,
			waves: {
				height : 150,
				width : 0,
				real_height: 3,
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
				lip: {
					cap: {
						width: 700,
						height: 10,
						lifetime: 800,
					}
				},
				paddling_effort: 1,
				bottom_fall_scale: 1,
				top_fall_scale: 0.2,				
				suction_x: 5,
				suction_y: 3,
				color_top: '#17719b',
				color_bot: '#0d6087',
				colors: [
					['#093950',0,0],
					['#146389',0,50],
					['#0f597d',0,100]
				],
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
				length :  1,
				interval : 11000,				
				spread : 200,				
				speed : 10000,
				frequency : 8000,
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
	
	}

	var prototype = createjs.extend(Spot, createjs.Container);

	prototype.init = function() {

		this.removeAllWaves();
		this.initEventsListeners();		
		this.initScore();
		this.resetScore();
		this.traceDebug();		
		//this.addWave(0.3);
		this.addWave(1);
		this.addPaddler(STAGEWIDTH/2,370);
	}

	prototype.launch = function() {

		this.removeAllWaves();
		this.initEventsListeners();
		this.initScore();
		this.addInitialSerie();
		this.addPaddler(STAGEWIDTH/2,370);
		this.traceDebug();	
	}

	prototype.initEventsListeners = function() {

		this.addEventListener('tick',proxy(this.tick,this));

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
		},this,true);

		stage.on('level_up',function(event) {
			this.levelUp(event.level);
		},this,true);
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
			tween.to({y: this.config.lines.beach + this.config.waves.height}, this.config.series.speed)
			tween.call(proxy(this.removeWave,this,[wave]))
			tween.addEventListener('change',proxy(wave.coming,wave));

			var position = this.config.series.speed/2 * (this.config.series.length - i) / this.config.series.length;
			tween.setPosition(position);
			
			//add to scene
			this.cont.addChildAt(wave);			
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
		tween.to({y: this.config.lines.beach + this.config.waves.height}, this.config.series.speed)
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

	prototype.firstWaveBehindPaddler = function(paddler) {

		var index = this.cont.getChildIndex(paddler) - 1;
		while(index>=0) {
			var wave = this.cont.getChildAt(index);
			if(wave instanceof Wave) return wave;
			index--;
		}
		return false;
	}

	prototype.isPaddlerOnWave = function(paddler,wave) {

		if(paddler.getY() < wave.getY() && paddler.getY() > (wave.getY() - wave.params.height)) return true;
		return false;
	}

	prototype.playerPaddling = function(paddler) {

		var wave = this.firstWaveBehindPaddler(paddler);
		//return if no wave
		if(!wave) return;		
		//return is not ON wave
		if(!this.isPaddlerOnWave(paddler,wave)) return;
		//return if paddling force not enough
		if(paddler.paddling_force <= wave.params.paddling_effort) return;

		//calcul paddler position relative to the wave
		var y = ( wave.params.height - (wave.getY() - paddler.getY() ));
		var x = ( paddler.getX() - wave.getX() );

		//replace paddler by surfer
		var surfer = new Surfer({
			x: x, y: y, wave: wave, spot: this
		});
		wave.playerTakeOff(surfer);
		this.removePaddler(paddler);

		//score
		this.showScore();

		this.wave = wave;

	}

	prototype.removePaddler = function(paddler) {

		paddler.removeListeners();
		this.cont.removeChild(paddler);
		this.paddlers.splice(this.paddlers.indexOf(paddler),1);
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
		this.stopWaveTimeout = setTimeout(proxy(this.stopWaveAfterFall,this), 6000);		
		//launch fall screen
		this.initFallScreen();
	}

	prototype.stopWaveAfterFall = function() {
				
		this.wave.removeAllEventListeners('tick');
	}

	prototype.removeSkillScreen = function() {

		this.overlay_cont.removeAllChildren();
		this.removeAllWaves();

		this.stars = null;
		this.title = null;

		this.init();
	}

	prototype.initSkillScreen = function(e) {

		e.stopImmediatePropagation();
		e.stopPropagation();
		e.preventDefault();
		e.remove();

		this.overlay_cont.removeAllChildren();
		this.removeAllWaves();

		var user = USER.get();

		var star = new createjs.Shape();
		star.graphics.beginFill('yellow').drawPolyStar(0,0,10,5,0.5);	
		star.rotation = 55;

		var neutron = new createjs.Shape();
		neutron.graphics.beginFill('grey').drawPolyStar(0,0,10,5,0.5);	
		neutron.rotation = 55;

		this.title = new createjs.Text("to distribute : "+USER.get().skill_pts,"20px arial","#000");
		this.title.y = 100;
		this.title.x = STAGEWIDTH/2 - this.title.getBounds().width/2;
		this.overlay_cont.addChild(this.title);
		var startitle = star.clone();
		startitle.y = this.title.y + 10;
		startitle.x = this.title.x - 20;
		this.overlay_cont.addChild(startitle);

		var skills = ['speed','aerial','agility','paddling'];
		this.stars = {};

		for(var i=0,len=skills.length-1;i<=len;i++) {

			var skill = skills[i];
			this.stars[skill] = [];

			var cont = new createjs.Container();
			cont.x = this.title.x - 100;
			cont.y = this.title.y + 100 + i*50;
			var label = new createjs.Text(skill, "16px Arial", "#FFF");
			cont.addChild(label);

			for(var j=0,ln=10;j<=ln;j++) {
				
				if(1 + j <= user.skill[skill]*10) {
					var icon = star.clone();
					icon.active = true;
				}
				else var icon = neutron.clone();
				icon.x = 100 + j*30;
				icon.y = 8;
				icon.cont = cont;
				cont.addChild(icon);
				this.stars[skill].push(icon);
			}

			var button = new createjs.Shape();
			button.graphics.beginFill('blue').drawCircle(0,0,20);
			button.x = icon.x + 50;
			button.y = icon.y;
			button.addEventListener('click',proxy(this.addSkillPoint,this,[skill]));
			cont.addChild(button);

			this.overlay_cont.addChild(cont);
		}


		//back button
		var back = new createjs.Shape();
		back.graphics.beginFill('red').beginStroke('#FFF').beginStroke(5).drawCircle(0,0,30);
		back.x = 1/4* STAGEWIDTH;
		back.y = 2/3* STAGEHEIGHT;
		back.addEventListener('click',proxy(this.removeSkillScreen,this));
		this.overlay_cont.addChild(back);

	}

	prototype.addSkillPoint = function(skill) {

		for(var i=0,len=this.stars[skill].length;i<len;i++) {

			var icon = this.stars[skill][i];
			if(icon.active) continue;
			else {
				var newstar = new createjs.Shape();
				newstar.graphics.beginFill('yellow').drawPolyStar(0,0,10,5,0.5);	
				newstar.rotation = 55;
				newstar.x = icon.x;
				newstar.y = icon.y;
				newstar.active = true;
				newstar.cont = icon.cont;
				icon.cont.addChild(newstar);
				newstar.cont.removeChild(icon);
				this.stars[skill][i] = newstar;

				var user = USER.get();				
				user.skill_pts--;
				this.title.text = "to distribute : "+user.skill_pts;
				if(user.skill[skill] <= 0.9) {
					user.skill[skill] = Math.round( (user.skill[skill]+0.1) * 10) / 10;
				}

				USER.save(user);


				icon = null;
				return;
			}

		}
	}

	prototype.initFallScreen = function(e) {

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

		//display fail phrase
		var failphrase = new createjs.Text('" '+this.score.getFailPhrase()+' "', "bold italic 18px Arial", "#95474a");
		failphrase.alpha = 0;
		failphrase.x = title.x ;
		failphrase.y = title.y + 125;
		failphrase.regX = failphrase.getMeasuredWidth()/2;
		failphrase.regY = failphrase.getMeasuredHeight()/2;

		this.overlay_cont.addChild(failphrase);
		createjs.Tween.get(failphrase).wait(1500).to({alpha:1},500);



		//User score
		var user = USER.get();
		var wave_score = this.score.getScore();
		var up = this.score.calculXpUp(user.xp,wave_score,user.level);	
		user.xp = up.xp;
		user.level = up.level;
		user.skill_pts += 2;
		USER.save(user);


		//score bars
		var xpbar = this.score.getXpBar(200,4);
		this.overlay_cont.addChild(xpbar);
		var xp_counter = xpbar.xp_counter;
		this.overlay_cont.addChild(xp_counter);
		var lvl_counter = xpbar.level_counter;
		this.overlay_cont.addChild(lvl_counter);

		xp_counter.x = title.x;
		xp_counter.y = title.y + 150;
		lvl_counter.x = title.x - 30;
		lvl_counter.y = title.y + 150;
		xpbar.x = xp_counter.x - xpbar.width/2;
		xpbar.y = xp_counter.y + 20;

		this.score.startXpBar(user.xp,wave_score,user.level);
		



		//display retry prhase
		var retry = new createjs.Text("[ CLICK TO RETRY ]", "14px Arial", "#AAA");
		retry.alpha = 0;
		retry.x = title.x ;
		retry.y = STAGEHEIGHT - 75;
		retry.regX = retry.getMeasuredWidth()/2;
		retry.regY = retry.getMeasuredHeight()/2;

		this.overlay_cont.addChild(retry);
		createjs.Tween.get(retry).wait(2000).to({alpha:1},500);

		this.click_retry = this.overlay_cont.on('click',proxy(this.fallRetry,this));

		//display buttons
		
		var button = new createjs.Container();
		var circle = new createjs.Shape()
		circle.graphics.beginFill('#FEFEFE').drawCircle(0,0,30);
		button.addChild(circle);
		var star = new createjs.Shape()
		star.graphics.beginFill('yellow').drawPolyStar(0,0,30,5,0.6);
		button.addChild(star);
		button.y = STAGEHEIGHT - 50;
		button.x = STAGEWIDTH - 100;
		button.cursor = 'pointer';
		this.overlay_cont.addChild(button);

		button.addEventListener('click',function(e) { proxy(this.initSkillScreen,this,[e]) },false);


	}

	prototype.levelUp = function() {

		var cont = new createjs.Container();
		cont.x = STAGEWIDTH*3/4;
		cont.y = STAGEHEIGHT*3/4;
		var star = new createjs.Shape();
		star.graphics.beginFill('red').drawPolyStar(0,0,150,10,0.5);	
		star.alpha = 0.6;
		cont.addChild(star);

		var text = new createjs.Text("Level Up !","30px Arial", "#FFF");
		text.x = - text.getBounds().width/2;
		text.y = - text.getBounds().height/2;
		cont.addChild(text);

		cont.scaleX = cont.scaleY = 0;
		createjs.Tween.get(cont).to({scaleX:1,scaleY:1},1000,createjs.Ease.bounceOut);
		createjs.Tween.get(star).to({rotation:2},1000,createjs.Ease.quartIn);

		this.overlay_cont.addChild(cont);
	}

	prototype.fallRetry = function(e) {


		clearTimeout(this.stopWaveTimeout);

		//clear scene
		this.overlay_cont.removeAllChildren();
		
		//reset this spot
		this.init();

		e.stopPropagation();
		e.remove();
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
	prototype.getBreak = function() {

		return this.config.lines.break;
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

		var line = new createjs.Shape();
		line.graphics.beginStroke('red').setStrokeStyle(2).moveTo(0, this.config.lines.horizon).lineTo(50,this.config.lines.horizon);
		this.debug_cont.addChild(line);

		var line = new createjs.Shape();
		line.graphics.beginStroke('orange').setStrokeStyle(2).moveTo(0, this.config.lines.break).lineTo(50,this.config.lines.break);
		this.debug_cont.addChild(line);

		var line = new createjs.Shape();
		line.graphics.beginStroke('pink').setStrokeStyle(2).moveTo(0, this.config.lines.peak).lineTo(50,this.config.lines.peak);
		this.debug_cont.addChild(line);

		var line = new createjs.Shape();
		line.graphics.beginStroke('yellow').setStrokeStyle(2).moveTo(0, this.config.lines.beach).lineTo(50,this.config.lines.beach);
		this.debug_cont.addChild(line);
	}

	window.Spot = createjs.promote(Spot,'Container');

}());