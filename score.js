(function() {
	
	function Score() {

		this.Container_constructor();
		
		this.spot = null;

		this.x = 0;
		this.y = 0;

		this.talking = false;

		this.score = new createjs.Text('0','50px Arial','#FFFFFF');
		this.score_pt = new createjs.Point(200,20);
		this.score.x = this.score_pt.x;
		this.score.y = this.score_pt.y;

		
		this.subscore = new createjs.Text('+0','italic 14px Arial','#FFFFFF');	
		this.subscore.alpha = 0;
		this.subscore_pt = new createjs.Point(200,5);

		this.onwavescore = new createjs.Text('','italic 26px BubblegumSansRegular','yellow');	//BubblegumSansRegular BoogalooRegular albaregular
				
		this.message = new createjs.Text('','bold 40px Arial','#FFF');
		this.message_pt = new createjs.Point(200,70);		

		this.addChild(this.score);
		this.addChild(this.subscore);
		this.addChild(this.message);
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

		stage.on('surfer_take_off_done',function(event) {
			this.add(50).say('Take Off !', 1000);
		},this);

		stage.on('surfer_arial_start',function(event) {			
			this.start(20).say('Aerial !');
		},this);

		stage.on('surfer_arial_end',function(event) {			
			this.end().silence();
		},this);

		stage.on('surfer_fall_bottom',function(event) {
			this.say('Too low !',1000,'red');
		},this);

		stage.on('surfer_fall_top',function(event) {
			this.say('Too high !',1000,'red');
		},this);

		stage.on('surfer_tube_in',function(event) {
			this.start(20).say('Tube !');
		},this);

		stage.on('surfer_tube_out',function(event) {
			this.end().silence();
		},this);

		stage.on('surfer_fall_edge',function(event) {
			this.say('Be smooth man !',1000,'red');
		},this);

		stage.on('surfer_fallen',function(event) {
			this.sub(500).end().silence();
		},this);

		stage.on('bonus_paddler_hitted',function(event) {
			this.add(100).say('That was close !',1000);
		},this);

		stage.on('malus_paddler_hitted',function(event) {
			this.sub(100).say('BIM!! You hurt someone !',2000, 'red');
		},this);

		stage.on('bonus_photograf_hitted',function(event) {
			this.add(500).say("Une petite photo !!",1000);
		},this);

		stage.on('malus_photograf_hitted',function(event) {
			this.sub(100).say("Bim you've hurt a paparazzi !",2000, 'red');
		},this);
	}

	prototype.tick = function() {

		this.slideAboveWaveText();
	}

	prototype.setSpot = function(spot) {

		this.spot = spot;
	}

	prototype.start = function(n) {

		this.subscore.alpha = 1;
		this.subscore.text = '+0';
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

		var u = parseInt(this.subscore.text.substr(1)) + n;
		this.subscore.text = '+'+u;
		return this;	
	}

	prototype.end = function() {
	
		window.clearInterval(this.launch_timer);

		var b = this.subscore.getBounds();
		this.subscore.x = this.subscore_pt.x + b.width/2;
		this.subscore.y = this.subscore_pt.y + b.width/2;
		this.subscore.regX = b.width/2;
		this.subscore.regY = b.height/2;

		createjs.Tween.get(this.subscore)
			.to({scaleX:4, scaleY:4 },200, createjs.Tween.elasticOut)	
			.to({scaleX:0, scaleY:0, alpha:0 },400, createjs.Tween.elasticOut)		
			;

		this.add(this.subscore.text.substr(1));


		//on-wave subscore
		var pt = this.spot.wave.surfer.localToGlobal(0,0);
		this.onwavescore.x = pt.x;
		var y = this.spot.wave.y - this.spot.wave.params.height;
		this.onwavescore.y = y;
		this.onwavescore.alpha = 1;
		this.onwavescore.text = this.subscore.text;

		createjs.Tween.get(this.onwavescore)	
			.to({y: y-50, alpha:0},1000)		
			;


		return this;
	}

	prototype.add = function(n) {

		this.score.text = parseInt(this.score.text) + parseInt(n);	
		return this;
	}

	prototype.sub = function(n) {

		var i = parseInt(this.score.text) - parseInt(n);
		if(i<0) i=0;	
		this.score.text = i;
		return this;
	}

	prototype.advance = function() {

		this.score.text = parseInt(this.score.text) + parseInt(1);
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