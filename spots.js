(function() {
	
	function Spot(cont) {

		this.Container_constructor();

		this.waves = [];


		this.config = {
			peak_point : 500,
			horizon_point : 180,
			waves: {
				height : 200,
				width : 1500,
			},
			series: {
				length :  5,
				interval : 5000,				
				spread : 0,				
				speed : 6000,
				frequency : 1500,
			},			
		}


		this.cont = new createjs.Container();
		this.addChild(this.cont);

		this.debug_cont = new createjs.Container();
		this.addChild(this.debug_cont);

		var peak = new createjs.Shape();
		peak.graphics.beginFill('pink')
			.drawCircle(0, 0, 6)
			;	
		peak.y = this.config.peak_point; 
		this.debug_cont.addChild(peak);

		var horizon = new createjs.Shape();
		horizon.graphics.beginFill('red')
			.drawCircle(0, 0, 6)
			;	
		horizon.y = this.config.horizon_point; 
		this.debug_cont.addChild(horizon);



		this.initEventsListeners();

		//Ticker
		this.addEventListener('tick',proxy(this.tick,this));
		
	}

	var prototype = createjs.extend(Spot, createjs.Container);

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
	}

	prototype.tick = function() {

		//console.log(this.waves.length);
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

			var wave = new Wave({
				height: this.config.waves.height,
				width: this.config.waves.width,
				y: this.config.horizon_point,
				x: this.config.series.spread/2 - Math.random()*this.config.series.spread
			});		


			//start tween
			var tween  = createjs.Tween.get(wave);		
			tween.to({y: STAGEHEIGHT + this.config.waves.height*3}, this.config.series.speed, createjs.Ease.quadIn)
			tween.call(proxy(this.removeWave,this,[wave]))
			tween.addEventListener('change',proxy(wave.resize,wave));
			tween.setPosition((1500*this.config.series.length)-(1500*i));
			
			//add to scene
			this.cont.addChildAt(wave,0);			
			this.waves.unshift(wave);
		}

		this.series_interval = window.setTimeout(proxy(this.addSeries,this),(this.config.series.interval));
	}

	prototype.addSwell = function() {

		//create Wave at horizon point
		var wave = new Wave({
				height: this.config.waves.height,
				width: this.config.waves.width,
				y: this.config.horizon_point,
				x: this.config.series.spread/2 - Math.random()*this.config.series.spread
			});

		//add to scene
		this.cont.addChildAt(wave,0);
		this.waves.unshift(wave);

		//start tween
		var tween = createjs.Tween.get(wave);		
		tween.to({y: STAGEHEIGHT + this.config.waves.height*3}, this.config.series.speed, createjs.Ease.quadIn)
		tween.call(proxy(this.removeWave,this,[wave]))
		tween.addEventListener('change',proxy(wave.resize,wave));

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

		return this.config.peak_point;
	}

	prototype.getHorizon = function() {

		return this.config.horizon_point;
	}


	prototype.addWave = function(height,width,y) {

		var wave = new Wave({height:height,width:1000,y:this.config.horizon_point+y});		
		this.cont.addChild(wave);
		this.waves.push(wave);
	}

	prototype.removeWave = function(wave) {
		console.log('removeWave');
		wave.clearAllIntervals();
		this.cont.removeChild(wave);
		this.waves.splice(this.waves.indexOf(wave),1);
		return this;
	}

	prototype.removeAllWaves = function() {
		
		this.cont.removeAllChildren();
		this.waves = [];

		return this;
	}

	prototype.breakAllWaves = function() {

		for(var i=0; i < this.waves.length; i++) {

			this.waves[i].initBreak(700);
		}
	}

	prototype.pauseAllWaves = function() {

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

	window.Spot = createjs.promote(Spot,'Container');

}());