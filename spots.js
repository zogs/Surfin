(function() {
	
	function Spot(cont) {

		this.Container_constructor();

		this.waves = [];

		this.peak_point = 250;
		this.horizon_point = 120;
		this.waves_height = 200;
		this.waves_speed = 8000;
		this.waves_frequency = 1500;
		this.serie_interval = 4000;
		this.serie_nb_waves = 3;

		this.cont = new createjs.Container();
		this.addChild(this.cont);


		
	}

	var prototype = createjs.extend(Spot, createjs.Container);

	prototype.addSeries = function() {

		this.addSerie();

		window.setTimeout(proxy(this.addSeries,this),(this.serie_interval + this.serie_nb_waves*this.waves_frequency));
	}	

	prototype.addSerie = function() {

		for(var i=0; i < this.serie_nb_waves; i++) {

			window.setTimeout(proxy(this.addSwell,this),this.waves_frequency*i);
		}
	}

	prototype.addInitialSerie = function() {

		for(var i = 1; i <=this.serie_nb_waves; i++) {

			var wave = new Wave(this.waves_height);
			wave.y = this.horizon_point + this.waves_height;		

			//add to scene
			this.cont.addChildAt(wave,0);
			this.waves.unshift(wave);

			//start tween
			var tween = createjs.Tween.get(wave);		
			tween.to({y: STAGEHEIGHT + this.waves_height,}, this.waves_speed, createjs.Ease.quadIn)
			tween.call(proxy(this.removeWave,this,[wave]))
			tween.addEventListener('change',proxy(wave.swellProgress,wave,[this.horizon_point,this.peak_point]));
			tween.setPosition((1500*this.serie_nb_waves)-(1500*i));
		}

		window.setTimeout(proxy(this.addSeries,this),(this.serie_interval));
	}

	prototype.addSwell = function() {

		//create Wave at horizon point
		var wave = new Wave(this.waves_height);
		wave.y = this.horizon_point + this.waves_height;		

		//add to scene
		this.cont.addChildAt(wave,0);
		this.waves.push(wave);

		//start tween
		var tween = createjs.Tween.get(wave);		
		tween.to({y: STAGEHEIGHT + this.waves_height,}, this.waves_speed, createjs.Ease.quadIn)
		tween.call(proxy(this.removeWave,this,[wave]))
		tween.addEventListener('change',proxy(wave.swellProgress,wave,[this.horizon_point,this.peak_point]));

	}

	prototype.setRidingWave = function(wave) {

		this.wave = wave;
	}

	prototype.setWave = function(wave) {

		this.wave = wave;
	}

	prototype.setWaveHeight = function(height) {

		this.waves_height = height;
	}

	prototype.getWave = function() {

		return this.wave;
	}

	prototype.getRidingWave = function() {

		return this.wave;
	}


	prototype.addWave = function(height,y) {

		var wave = new Wave(height);
		wave.y = y;
		this.cont.addChild(wave);
		this.waves.push(wave);
	}

	prototype.removeWave = function(wave) {
		console.log('removeWave');
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