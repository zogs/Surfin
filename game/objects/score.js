(function() {
	
	function Score(params) {

		this.Container_constructor();

		this.x = 0;
		this.y = 0;
		this.spot = params.spot;

		this.talking = false;
		this.kill_count = 0;
		this.timers = [];

		this.phrases = {
			'hit top lip' : ['Open your mouth for a free teethbrush','This wave is too big for you'],
			'hit bottom splash' : ['Beware the power of the LIP !', "May the Tube be with you !", "Yeah.. you might not want to touch the lip with your head...","Riding the top of the wave can be dangerous..."],
			'bad trajectory' : ['Be smooth, you are not Kelly Slater yet...'],
			'hit paddler' : ['Outch, this man is hurt...',"Try to avoid your fellow surfers"],
			'hit photographer' : ['Damn it, you will pay for this camera !'],
		}

		this.levels = {
			1: 10000,
			2: 20000,
			3: 30000,
			4: 40000,
			5: 50000,
			6: 60000,
			7: 70000,
			8: 80000,
			9: 90000,
			10: 100000
		}

		this.current_score = 0;
		this.current_tricks_score = 0;
		this.current_multiplier = 1;
		this.skill_per_level = 2;

		//containers
		this.score_cont = new createjs.Container();
		this.addChild(this.score_cont);

		//display
		this.score = new createjs.Text('0','50px Arial','#FFFFFF');
		this.score_pt = new createjs.Point(200,20);
		this.score.x = this.score_pt.x;
		this.score.y = this.score_pt.y;
		
		this.subscore = new createjs.Text('+0','italic 14px Arial','#FFFFFF');	
		this.subscore.alpha = 0;
		this.subscore_pt = new createjs.Point(200,5);

		this.score_cont.addChild(this.score);
		this.score_cont.addChild(this.subscore);

		//Ticker
		this.addEventListener('tick',proxy(this.tick,this));
		//Listeners
		this.initEventsListeners();	

	}

	var prototype = createjs.extend(Score, createjs.Container);

	//add EventDispatcher
	createjs.EventDispatcher.initialize(prototype);

	prototype.initEventsListeners = function() {

		stage.on('surfer_take_off_ended',function(event) {
			this.progress().say('Take Off !', 1000);
		},this);

		stage.on('surfer_aerial_start',function(event) {	
			this.say(event.trick.name, null, event.trick.score,10);
		},this);

		stage.on('surfer_aerial_end',function(event) {			
			this.silence();
		},this);

		stage.on('surfer_tube_in',function(event) {
			this.say('Tuuube !', null, 1000, 50);
		},this);

		stage.on('surfer_tube_out',function(event) {
			this.silence();
		},this);

		stage.on('player_fall',function(event) {
			this.stopProgress();
			this.failPhrase = this.getRandomPhrase(event.reason);
		},this);

		stage.on('player_fallen',function(event) {
			this.end().silence();
		},this);

		stage.on('paddler_bonus_hitted',function(event) {
			this.say('hey buddy !',300,100);
		},this);

		stage.on('photo_bonus_hitted',function(event) {
			this.say("Nice pic !",500,200);
		},this);

		stage.on('drone_bonus_hitted',function(event) {
			this.say("Nice pic !",500,1000);
		},this);

		stage.on('multiplier_bonus_hitted',function(event) {
			this.current_multiplier = this.current_multiplier * event.obstacle.multiplier;
		},this);

		stage.on('prize_bonus_hitted', function(event) {
			console.log(event);
			this.say('+'+event.obstacle.value+' points !',500);
		},this);

		stage.on('level_up',function(event) {
			this.levelUp(event.level);
		},this);

		stage.on('surfer_kill',function(event) {
			console.log('shoted');
			if(event.player === event.killed) this.say("Paf...", 1000);
			if(event.player === event.killer) {
				this.kill_count++;
				if(this.kill_count === 1) this.add(100).say("Kill !", 500);
				if(this.kill_count === 2) this.add(500).say("Double kill !", 500);
				if(this.kill_count === 3) this.add(1000).say("Triple kill !", 500);
				if(this.kill_count > 3) this.add(1000).say("Multii kill !", 500);
			}

			//reset kill count to 0 after 2s
			clearTimeout(this.kill_reset);
			this.kill_reset = setTimeout(proxy(function(){ this.kill_count = 0;},this), 2000);
		},this);
	}

	prototype.selfRemove = function() {

		this.removeEventListener("tick", this.tick);
		this.removeAllEventListeners();
		this.removeAllChildren();

	}


	prototype.getRandomPhrase = function(key) {

		if(typeof key === 'undefined') return 'Key is not defined...';
		if(typeof this.phrases[key] === 'undefined') return 'There is no key ('+key+')...';		
		if(typeof this.phrases[key].length === 0) return 'There is no cool text for this key ('+key+')...';		
		var i = Math.random()*this.phrases[key].length;
		i = Math.floor(i);
		return this.phrases[key][i];

	}
	prototype.tick = function() {

		if(PAUSED) return;
		this.slideAboveWaveText();

	}

	prototype.reset = function() {
		this.current_score = 0;
		this.score.text = 0;
	}

	prototype.getScore = function() {
		return this.current_score;
	}

	prototype.setScore = function(sc) {
		this.current_score = sc;
		this.score.text = sc;
		return this;
	}

	prototype.getFailPhrase = function() {
		return this.failPhrase;
	}

	prototype.start = function(n) {

		this.subscore.alpha = 1;
		this.subscore.text = ' ';
		this.subscore.scaleX = this.subscore.scaleY = 1;
		var b = this.subscore.getBounds();
		this.subscore.x = this.subscore_pt.x + b.width/2;
		this.subscore.y = this.subscore_pt.y + b.width/2;
		this.subscore.regX = b.width/2;
		this.subscore.regY = b.height/2;
		this.launch_timer = new Interval(proxy(this.addsub,this,[n]),150);
		this.timers.push(this.launch_timer);
		return this;
	}

	prototype.addsub = function(n) {

		this.current_tricks_score += n;		
		this.subscore.text = '+'+this.current_tricks_score;
		return this;	
	}

	prototype.end = function() {
	
		if(this.launch_timer instanceof Interval === false) return this;

		this.timers.splice(this.timers.indexOf(this.launch_timer),1);
		this.launch_timer.clear();
		this.launch_timer = null;

		var score = (this.current_multiplier != 0)? this.current_tricks_score * this.current_multiplier : this.current_tricks_score;
		var text = (this.current_multiplier==0)? this.current_tricks_score : this.current_tricks_score+' x'+this.current_multiplier+''; 

		// add score
		this.current_tricks_score = score;
		this.add(score);

		// show score
		this.showSubScore(text);

		// reset multiplier
		this.current_multiplier = 1;

		return this;
	}

	prototype.showSubScore = function(text) {

		var b = this.subscore.getBounds();
		this.subscore.x = this.subscore_pt.x + b.width/2;
		this.subscore.y = this.subscore_pt.y + b.width/2;
		this.subscore.regX = b.width/2;
		this.subscore.regY = b.height/2;
		this.subscore.alpha = 1;
		this.subscore.text = text;

		createjs.Tween.get(this.subscore)
			.to({scaleX:4, scaleY:4 },200, createjs.Tween.elasticOut)	
			.to({scaleX:0, scaleY:0, alpha:0 },400, createjs.Tween.elasticOut)		
			;
	}

	prototype.add = function(amount) {

		this.current_score += amount;
		this.score.text = this.current_score;	
		this.showSubScore('+'+amount);
		return this;
	}

	prototype.sub = function(amount) {
		
		this.current_score -= amount;
		if(this.current_score < 0) this.current_score = 0;	
		this.score.text = this.current_score;
		this.showSubScore('+'+amount);
		return this;
	}

	prototype.progress = function() {

		let amount = 5;
		let time = 250;
		this.progress_timer = new Interval(proxy(this.advance,this,[amount]), time);
		this.timers.push(this.progress_timer);
		return this;
	}

	prototype.stopProgress = function() {

		this.timers.splice(this.timers.indexOf(this.progress_timer),1);
		this.progress_timer.clear();
		this.progress_timer = null;
		return this;
	}

	prototype.advance = function(amount) {

		this.current_score += parseInt(amount);
		this.score.text = this.current_score;
		return this;
	}

	prototype.say = function(tx, time = null, score = null, growth = null) {
		var pos = SPOT.wave.surfer.localToGlobal(0,0);

		this.onWaveDisplay = new createjs.Container();
		this.onWaveDisplay.sliding = false;

		this.onWaveDisplay.y = -SPOT.wave.params.height - 150;
		this.onWaveDisplay.x = (SPOT.wave.isCENTER())? this.onWaveDisplay.x = pos.x : this.onWaveDisplay.x = pos.x ;

		let circle = new createjs.Shape();
		circle.graphics.beginFill('yellow').drawCircle(0,0,200);
		circle.alpha = 0.1;
		this.onWaveDisplay.addChild(circle);
		circle.scale = 0;
		createjs.Tween.get(circle).to({scale: 1}, 700, createjs.Ease.bounceOut).wait(300).to({alpha: 0},1000, createjs.Ease.quartOut);

		let text = new createjs.Text('','bold 80px BubblegumSansRegular','#FFF'); //BubblegumSansRegular BoogalooRegular albaregular
		text.text = tx;
	  text.alpha = 0.8;
	  let b = text.getBounds();
	  text.x = - b.width / 2;
		this.onWaveDisplay.text = text;
		this.onWaveDisplay.addChild(text);

		text.y = +100;
		text.alpha = 0;
		text.scale = 0;
		createjs.Tween.get(text).to({y: 0, alpha: 1, scale: 1}, 800, createjs.Ease.elasticOut);

		if(time !== null) {
			createjs.Tween.get(this.onWaveDisplay).wait(time).call(proxy(this.silence,this));			
		}

		if(score !== null) {
			let sub = new createjs.Text('','italic 36px BubblegumSansRegular','yellow');	//BubblegumSansRegular BoogalooRegular albaregular
			sub.text = score;
		  sub.alpha = 1;
		  sub.x = 50;
			this.onWaveDisplay.score = sub;
			this.onWaveDisplay.addChild(sub);

			sub.y = +500;
			sub.alpha = 0;
			sub.scale = 0;
			createjs.Tween.get(sub).wait(250).to({y: 100, alpha: 1, scale: 1}, 500, createjs.Ease.bounceOut);
	
			if(growth !== null) {
				this.onWaveDisplay.growth = new Interval(proxy(this.subScoreGrowth,this,[sub,growth]),50);
				this.timers.push(this.onWaveDisplay.growth);
			}
		}

		SPOT.wave.score_text_cont.addChild(this.onWaveDisplay);

		this.onWaveDisplay.rotation = 15;
		let yo = this.onWaveDisplay.y;
		this.onWaveDisplay.y = 100;
		this.onWaveDisplay.alpha = 0;
		createjs.Tween.get(this.onWaveDisplay).to({y: yo, alpha: 1, rotation: -15}, 800, createjs.Ease.bounceOut);
		//lauch particles
		//window.setTimeout(proxy(this.launchTextParticles,this,[text]),200);

		return this;
	}

	prototype.subScoreGrowth = function(subscore, growthrate) {

		subscore.text = parseInt(subscore.text + growthrate);
	}

	prototype.launchTextParticles = function(text) {

		//particles
		var emitter = new ParticleEmitter({
			x: text.x,
			y: - SPOT.wave.params.height,
			density: 5 + Math.random()*5,
			callback : proxy(this.removeTextParticles,this),
			magnitude: 20,
			magnitudemax : 25,
			angle: - Math.PI/2,
			spread: Math.PI/2,
			size: 8,
			scaler: 0.2,
			fader: 0.1,
			rotate: 0.1,
			rotatemax: 10,
			//tweens: [[{alpha:0},2000]],
			forces: [vec2.fromValues(0,0.5)],
			shapes: [{shape:'star',fill:'yellow',stroke:0.1,strokeColor:'yellow',percentage:100}]
		});
		
		SPOT.wave.score_particles_cont.addChild(emitter);
	}

	prototype.removeTextParticles = function(emitter) {

		SPOT.wave.score_particles_cont.removeChild(emitter);
	}

	prototype.silence = function() {

		//for all text childs
		for (var i = SPOT.wave.score_text_cont.numChildren - 1; i >= 0; i--) {
			let cont = SPOT.wave.score_text_cont.getChildAt(i);

			//if no text, return early
			if(cont instanceof createjs.Container === false) continue;

			// clear growth interval if needed
			if(cont.growth instanceof Interval) {
				this.timers.splice(this.timers.indexOf(cont.growth),1);
				cont.growth.clear();
				cont.growth = null;
			}

			if(cont.score instanceof createjs.Text) {
				createjs.Tween.get(cont.score).to({scale: 2}, 400, createjs.Ease.bounceOut);

				let score = parseInt(cont.score.text);
				this.add(score);
			}

			//begin to slide it out			
			createjs.Tween.get(cont).wait(500 + i*200).set({sliding : true});

		}
		return this;
	}

	prototype.slideAboveWaveText = function() {
		
		if(SPOT.wave == undefined) return;

		var offscreen = null;
		var cont = SPOT.wave.score_text_cont;

		for(var i=0;i<cont.numChildren;i++) {

			var text = cont.getChildAt(i);
	
			if(text.sliding == undefined) continue;
			if(text.sliding == true) {
				text.x += SPOT.wave.movingX;
				text.alpha += - 0.05;
				//when text is off screen, remove it
				if(text.x > STAGEWIDTH*1.5 || text.x < - STAGEWIDTH*0.5) {
					offscreen = i;
				}
			}
		}

		if(offscreen != null) {
			cont.removeChildAt(offscreen);
		}
	}


	prototype.getXpBar = function(width,height) {

		if(this.xpbar) return this.xpbar;

		this.xpbar = new createjs.Container();
		this.xpbar.width = width;
		this.xpbar.height = height;
		this.xpbar.duration = 3000;
		this.xpbar.background = new createjs.Container();
		this.xpbar.current = new createjs.Container();
		this.xpbar.progress = new createjs.Container();
		this.xpbar.xp_current = new createjs.Text("0", "bold 16px Arial", "#AAA");
		this.xpbar.xp_max = new createjs.Text("0", "16px Arial", "#AAA");
		this.xpbar.xp_min = new createjs.Text("0", "16px Arial", "#AAA");
		this.xpbar.level_counter = new createjs.Text("Level 1", "14px Arial", "#AAA");
		this.xpbar.addChild(this.xpbar.background);
		this.xpbar.addChild(this.xpbar.progress);
		this.xpbar.addChild(this.xpbar.current);

		var background = new createjs.Shape();
		background.graphics.beginFill('#AAA').drawRect(0,0,this.xpbar.width,this.xpbar.height);
		this.xpbar.background.addChild(background);

		var progress = new createjs.Shape();
		progress.graphics.beginFill('yellow').drawRect(0,0,this.xpbar.width,this.xpbar.height);
		this.xpbar.progress.addChild(progress);

		var current = new createjs.Shape();
		current.graphics.beginFill('lightblue').drawRect(0,0,this.xpbar.width,this.xpbar.height);
		this.xpbar.current.addChild(current);		

		return this.xpbar;
	}

	prototype.startXpBar = function(current_xp,win_xp,level) {

		var level_xp = this.levels[level];
		var ratio = current_xp/level_xp;

		this.xpbar.current.scaleX = ratio;
		this.xpbar.progress.scaleX = ratio;
		this.xpbar.progress.xp = current_xp;
		this.xpbar.level_counter.text = 'Level '+ parseInt(level);
		
		var newRatio = (win_xp + current_xp)/level_xp;
		var excedent_xp = (current_xp + win_xp) - level_xp;
		var time = this.xpbar.duration * (newRatio-ratio);

		USER.xp = current_xp + win_xp;
		
		createjs.Tween.removeTweens(this.xpbar.progress);
		createjs.Tween.get(this.xpbar.progress)
				.to({scaleX:newRatio,xp: current_xp + win_xp},time)
				.addEventListener('change',proxy(this.xpBarProgress, this, [level,excedent_xp]))
				;
	}

	prototype.xpBarProgress = function(level,excedent_xp) {
		
		//update xp counter
		this.xpbar.xp_current.text = parseInt(this.xpbar.progress.xp);
		this.xpbar.xp_max.text = parseInt(this.levels[level]);

		//save user xp
		USER.setXp(this.xpbar.progress.xp).save();

		//check for level up
		if(this.xpbar.progress.scaleX >= 1) {

			//level up
			var new_level = level+1;
			var event = new createjs.Event('level_up');
			event.level = new_level;
			event.points = this.skill_per_level;
			stage.dispatchEvent(event);

			//new progress bar
			this.startXpBar(0,excedent_xp,new_level);
			
		}	
	}

	prototype.levelUp = function(level) {

		//save user
		USER.levelUp().addSkillPoint(this.skill_per_level).save();

	}

	prototype.calculXpUp = function(current_xp,win_xp,level) {

		var level_xp = this.levels[level];
		var new_level = level;
		var new_current_xp = current_xp;
		
		for(var i = 1; i<= win_xp; i++) {

			new_current_xp++;
			if(new_current_xp >= level_xp) {				
				new_level++;
				var exc = win_xp - new_current_xp;
				return this.calculXpUp(0,exc,new_level);
			}
		}

		return {
			xp: current_xp,
			level: level,
			new_level: new_level,
			new_current_xp: new_current_xp
		}
	}

	prototype.getTimers = function() {

		for (var i = this.timers.length - 1; i >= 0; i--) {
			if(this.timers[i] instanceof Timer || this.timers[i] instanceof Interval) {
				continue;
			}
			else {
				this.timers.splice(i,1);
			}
		}
		
		return this.timers;
	}

	prototype.pause = function() {

		this.getTimers().map(t => t !== null? t.pause() : null);
	}

	prototype.resume = function() {

		this.getTimers().map(t => t !== null? t.resume() : null);
	}


	window.Score = createjs.promote(Score,'Container');

}());