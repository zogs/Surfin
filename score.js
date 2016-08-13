(function() {
	
	function Score() {

		this.Container_constructor();
		
		this.spot = null;

		this.x = 0;
		this.y = 0;

		this.talking = false;

		this.phrases = {
			fall_bottom : ['Open your mouth for a free teethbrush','This wave is too big for you'],
			fall_top : ['Beware the power of the lip !', "Quick advice, avoid touching the lip with your head !","Riding on the top of the wave can be dangerous..."],
			fall_edge : ['Be smooth, you are not Kelly Slater yet...'],
			paddler_hitted : ['Outch, this man is hurt...',"Try to avoid your fellow surfers"],
			photograf_hitted : ['Damn it, you will pay for this camera !'],
		}

		this.score = new createjs.Text('0','50px Arial','#FFFFFF');
		this.score_pt = new createjs.Point(200,20);
		this.score.x = this.score_pt.x;
		this.score.y = this.score_pt.y;

		this.current_score = 0;
		this.current_tricks_score = 0;
		this.current_multiplier = 0;
		
		this.subscore = new createjs.Text('+0','italic 14px Arial','#FFFFFF');	
		this.subscore.alpha = 0;
		this.subscore_pt = new createjs.Point(200,5);

		this.onwavescore = new createjs.Text('','italic 26px BubblegumSansRegular','yellow');	//BubblegumSansRegular BoogalooRegular albaregular

		this.addChild(this.score);
		this.addChild(this.subscore);
		this.addChild(this.onwavescore);


		this.aboveWaveTextCont = new createjs.Container();
		this.addChild(this.aboveWaveTextCont);

		this.aboveWaveParticleCont = new createjs.Container();
		this.addChild(this.aboveWaveParticleCont);

		//Ticker
		this.addEventListener('tick',proxy(this.tick,this));

		this.initEventsListeners();	

	}

	var prototype = createjs.extend(Score, createjs.Container);

	//add EventDispatcher
	createjs.EventDispatcher.initialize(prototype);

	prototype.initEventsListeners = function() {

		stage.on('surfer_take_off_ended',function(event) {
			this.add(50).say('Take Off !', 1000);
		},this);

		stage.on('surfer_arial_start',function(event) {	
			this.start(20).say(event.tricks +' !');
		},this);

		stage.on('surfer_arial_end',function(event) {			
			this.end().silence();
		},this);

		stage.on('surfer_fall_bottom',function(event) {
			this.failPhrase = this.getRandomPhrase('fall_bottom');
		},this);

		stage.on('surfer_fall_top',function(event) {
			this.failPhrase = this.getRandomPhrase('fall_top');
		},this);

		stage.on('surfer_tube_in',function(event) {
			this.start(20).say('Tube !');
		},this);

		stage.on('surfer_tube_out',function(event) {
			this.end().silence();
		},this);

		stage.on('surfer_fall_edge',function(event) {
			this.failPhrase = this.getRandomPhrase('fall_edge');
		},this);

		stage.on('surfer_fallen',function(event) {
			this.end().silence();
		},this);

		stage.on('paddler_bonus_hitted',function(event) {
			this.add(100).say('Yo buddy !',500);
		},this);

		stage.on('paddler_malus_hitted',function(event) {			
			this.failPhrase = this.getRandomPhrase('paddler_hitted');
		},this);

		stage.on('photo_bonus_hitted',function(event) {
			console.log('score')
			this.add(200).say("Photo",500);
		},this);

		stage.on('photo_malus_hitted',function(event) {
			this.failPhrase = this.getRandomPhrase('photograf_hitted');
		},this);

		stage.on('multiplier_bonus_hitted',function(event) {
			console.log(event);
			if(this.current_multiplier == 0) this.current_multiplier = event.multiplier;
			else this.current_multiplier = this.current_multiplier * event.multiplier;
		},this);
	}


	prototype.getRandomPhrase = function(key) {

		var i = Math.random()*this.phrases[key].length;
		i = Math.floor(i);
		return this.phrases[key][i];

	}
	prototype.tick = function() {

		if(PAUSED) return;
		this.slideAboveWaveText();

	}

	prototype.setSpot = function(spot) {

		this.spot = spot;
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
		this.launch_timer = window.setInterval(proxy(this.addsub,this,[n]),150);
		return this;
	}

	prototype.addsub = function(n) {

		this.current_tricks_score += n;		
		this.subscore.text = '+'+this.current_tricks_score;
		return this;	
	}

	prototype.end = function() {
	
		window.clearInterval(this.launch_timer);

		//on-wave subscore
		var pt = this.spot.wave.surfer.localToGlobal(0,0);
		this.onwavescore.x = pt.x;
		var y = this.spot.wave.y - this.spot.wave.params.height;
		this.onwavescore.y = y;
		this.onwavescore.alpha = 1;
		var tx = (this.current_multiplier==0)? this.current_tricks_score : this.current_tricks_score+' x'+this.current_multiplier+''; 
		this.onwavescore.text = tx;

		createjs.Tween.get(this.onwavescore)	
			.to({y: y-50, alpha:0},1000)		
			;


		if(this.current_multiplier != 0) {
			this.current_tricks_score = this.current_tricks_score * this.current_multiplier;
		}

		this.add(this.current_tricks_score);

		var b = this.subscore.getBounds();
		this.subscore.x = this.subscore_pt.x + b.width/2;
		this.subscore.y = this.subscore_pt.y + b.width/2;
		this.subscore.regX = b.width/2;
		this.subscore.regY = b.height/2;

		createjs.Tween.get(this.subscore)
			.to({scaleX:4, scaleY:4 },200, createjs.Tween.elasticOut)	
			.to({scaleX:0, scaleY:0, alpha:0 },400, createjs.Tween.elasticOut)		
			;


		this.current_multiplier = 0;

		return this;
	}

	prototype.add = function(n) {

		this.current_score += n;
		this.score.text = this.current_score;	
		return this;
	}

	prototype.sub = function(n) {

		
		this.current_score -= n;
		if(this.current_score < 0) this.current_score = 0;	
		this.score.text = this.current_score;
		return this;
	}

	prototype.advance = function() {

		this.score.text = this.current_score + parseInt(1);
		return this;
	}

	prototype.say = function(tx,time,color) {

		var pos = this.spot.wave.surfer.localToGlobal(0,0);

		var text = new createjs.Text('','bold 40px BubblegumSansRegular','#FFF'); //BubblegumSansRegular BoogalooRegular albaregular
		text.text = tx;
		text.alpha = 0.8;
		var b = text.getBounds();
		if(this.spot.wave.direction === 1) text.x = pos.x + b.width*2;
		if(this.spot.wave.direction === -1) text.x = pos.x - b.width*2;
		if(this.spot.wave.direction === 0) text.x = pos.x + b.width/2;
		text.y = -this.spot.wave.params.height/2;
		var y = - this.spot.wave.params.height - b.height;
		text.regX = b.width/2;
		text.regY = b.height/2;

		this.spot.wave.score_text_cont.addChild(text);

		var tween = createjs.Tween.get(text).to({y: y},800, createjs.Ease.elasticOut);

		if(time != undefined) {
			tween.wait(time).set({sliding:true});			
		}

		if(color != undefined) text.color = color;

		//lauch particles
		window.setTimeout(proxy(this.launchTextParticles,this,[text]),200);

		return this;
	}

	prototype.launchTextParticles = function(text) {

		//particles
		var emitter = new ParticleEmitter({
			x: text.x,
			y: - this.spot.wave.params.height,
			density: 5 + Math.random()*5,
			callback : proxy(this.removeTextParticles,this),
			magnitude: 20,
			angle: - Math.PI/2,
			spread: Math.PI/2,
			size: 5,
			scaler: 0.2,
			fader: 0.1,
			rotate: 0.1,
			rotatemax: 10,
			//tweens: [[{alpha:0},2000]],
			forces: [vec2.fromValues(0,0.5)],
			shapes: [{shape:'star',fill:'yellow',stroke:0.1,strokeColor:'yellow',percentage:100}]
		});
		this.spot.wave.score_particles_cont.addChild(emitter);
	}

	prototype.removeTextParticles = function(emitter) {

		this.spot.wave.score_particles_cont.removeChild(emitter);
	}

	prototype.silence = function() {

		//get last text child
		var text = this.spot.wave.score_text_cont.getChildAt(this.spot.wave.score_text_cont.numChildren-1);

		//begin to slide it out
		text.sliding = true;

		return this;
	}

	prototype.slideAboveWaveText = function() {
		
		if(this.spot.wave == undefined) return;

		var offscreen = null;
		var cont = this.spot.wave.score_text_cont;

		for(var i=0;i<cont.numChildren;i++) {

			var text = cont.getChildAt(i);
	
			if(text.sliding == undefined) continue;
			if(text.sliding == true) {
				text.x += this.spot.wave.movingX;
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


	window.Score = createjs.promote(Score,'Container');

}());