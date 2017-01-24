(function() {

	var Custom = function() {

		this.Horizon = SPOT.config.lines.horizon;
		this.Break = SPOT.config.lines.break;
		this.Peak = SPOT.config.lines.peak;
		this.Beach = SPOT.config.lines.beach;
		this.XShift = SPOT.config.series.xshift;
		this.SeaColorTop = SPOT.config.colors.top;
		this.SeaColorBottom = SPOT.config.colors.bottom;

		this.Width = SPOT.config.waves.width;
		this.Height = SPOT.config.waves.height;
		this.Meters = SPOT.config.waves.real_height;
		this.BreakWidth = SPOT.config.waves.breaking.width;
		this.BreakSpeed = SPOT.config.waves.breaking.yspeed;
		this.BreakPerCent = SPOT.config.waves.breaking.splash_h_percent;
		this.BreakEase = SPOT.config.waves.breaking.splash_h_ease;
		this.ColorTop = SPOT.config.waves.colors[0][0];
		this.ColorMiddle = SPOT.config.waves.colors[1][0];
		this.ColorBottom = SPOT.config.waves.colors[2][0];


		this.SuctionX = SPOT.config.waves.suction_x;
		this.SuctionY = SPOT.config.waves.suction_y;
		this.LShoulderWidth = SPOT.config.waves.shoulder.left.width;
		this.LShoulderInner = SPOT.config.waves.shoulder.left.inner;
		this.LShoulderOuter = SPOT.config.waves.shoulder.left.outer;
		this.LShoulderMarge = SPOT.config.waves.shoulder.left.marge;
		this.RShoulderWidth = SPOT.config.waves.shoulder.right.width;
		this.RShoulderInner = SPOT.config.waves.shoulder.right.inner;
		this.RShoulderOuter = SPOT.config.waves.shoulder.right.outer;
		this.RShoulderMarge = SPOT.config.waves.shoulder.right.marge;

		this.Thickness = SPOT.config.waves.lip.thickness;
		this.CapLifetime = SPOT.config.waves.lip.cap.lifetime;
		this.CapHeight = SPOT.config.waves.lip.cap.height;
		this.CapWidth = SPOT.config.waves.lip.cap.width;

		this.LBreakWidth = SPOT.config.waves.breaking.left.width;
		this.LBreakWidthMax = SPOT.config.waves.breaking.left.width_max;
		this.LBreakWidthInt = SPOT.config.waves.breaking.left.width_interval;
		this.LBreakWidthPause = SPOT.config.waves.breaking.left.width_pause;
		this.LBreakBlockWidth = SPOT.config.waves.breaking.left.block_width;
		this.LBreakBlockWidthMax = SPOT.config.waves.breaking.left.block_width_max;
		this.LBreakBlockInt = SPOT.config.waves.breaking.left.block_interval;	
		this.LBreakBlockIntMax = SPOT.config.waves.breaking.left.block_interval_max;

		this.RBreakWidth = SPOT.config.waves.breaking.right.width;	
		this.RBreakWidthMax = SPOT.config.waves.breaking.right.width_max;
		this.RBreakWidthInt = SPOT.config.waves.breaking.right.width_interval;
		this.RBreakWidthPause = SPOT.config.waves.breaking.right.width_pause;
		this.RBreakBlockWidth = SPOT.config.waves.breaking.right.block_width;
		this.RBreakBlockWidth = SPOT.config.waves.breaking.right.block_width;
		this.RBreakBlockWidthMax = SPOT.config.waves.breaking.right.block_width_max;
		this.RBreakBlockInt = SPOT.config.waves.breaking.right.block_interval;	
		this.RBreakBlockIntMax = SPOT.config.waves.breaking.right.block_interval_max;	

		this.NbWaves = SPOT.config.series.length;
		this.Interval = SPOT.config.series.interval;
		this.Etalement = SPOT.config.series.spread;
		this.WaveVitesse = SPOT.config.series.speed;
		this.WaveFrequency = SPOT.config.series.frequency;

		this.surfersSize = SPOT.config.surfers.proportion;
		this.surfersVX = SPOT.config.surfers.velocities.x;
		this.surfersVY = SPOT.config.surfers.velocities.y;

		this.wavePaddlingEffort = SPOT.config.waves.paddling_effort;
		this.fallAtBottom = SPOT.config.waves.bottom_fall_scale;
		this.fallAtTop = SPOT.config.waves.top_fall_scale;

		this.obstaclesInterval = SPOT.config.waves.obstacles_interval;
		this.obstaclesIntervalMax = SPOT.config.waves.obstacles_interval_max;
		this.paddlerPercentage = SPOT.config.waves.obstacles['paddler'].percentage;
		this.photographPercentage = SPOT.config.waves.obstacles['photograph'].percentage;

		this.performance = window.PERF;

		this.LaunchSpot = function() {

			//remove pause if needed
			if(PAUSED) window.pause();

			//add spot
			window.addSpot(SPOT);
		}

		this.BreakWave = function() {

			//remove pause if needed
			if(PAUSED) window.pause();

			// add a wave and break it
			window.addSpot(SPOT, false);
			SPOT.init();
			SPOT.removeAllPaddlers();
			SPOT.waves[0].initBreak(STAGEWIDTH/2);
		}

		this.TestWave = function() {

			//remove pause if needed
			if(PAUSED) window.pause();

			// add a wave and break it
			window.addSpot(SPOT, false);
			SPOT.init();
		}

		this.SwitchDebugMode = function() {
			window.switchDebugMode();
		}

		this.SwitchTestMode = function() {
			window.switchTestMode();
		}

		this.Pause = function() {
			window.pause();
		}

	};


	initCustomizer = function() {

		var custom = new Custom();
		var gui = new dat.GUI();

		gui.width = 300;

		gui.remember(custom);

		gui.close();

		gui.add(custom, 'SwitchDebugMode');
		gui.add(custom, 'SwitchTestMode');
		gui.add(custom, 'LaunchSpot');
		gui.add(custom, 'BreakWave');
		gui.add(custom, 'TestWave');
		gui.add(custom, 'Pause');

		var waves = gui.addFolder('Waves');
		waves.add(custom, 'Width', 100, 5000).step(100).onChange(function(value) { SPOT.config.waves.width = value; });
		waves.add(custom, 'Height', 10, 400).onChange(function(value) { SPOT.config.waves.height = value; });
		waves.add(custom, 'Meters', 1, 10).onChange(function(value) { SPOT.config.waves.real_height = value; });
		waves.add(custom, 'BreakWidth',1,1500).step(10).onChange(function(value) { SPOT.config.waves.breaking.width = value; });
		waves.add(custom, 'BreakSpeed',0,5000).step(50).onChange(function(value) { SPOT.config.waves.breaking.yspeed = value; });
		waves.add(custom, 'BreakPerCent',0,100).step(1).onChange(function(value) { SPOT.config.waves.breaking.splash_h_percent = value; });
		waves.add(custom, 'BreakEase',0,1).step(0.1).onChange(function(value) { SPOT.config.waves.breaking.splash_h_ease = value; });
		waves.addColor(custom, 'ColorTop').onChange(function(value) { SPOT.config.waves.colors[0][0] = value; SPOT.getWaves().map(w => w.drawBackground()); });
		waves.addColor(custom, 'ColorMiddle').onChange(function(value) { SPOT.config.waves.colors[1][0] = value; SPOT.getWaves().map(w => w.drawBackground()); });
		waves.addColor(custom, 'ColorBottom').onChange(function(value) { SPOT.config.waves.colors[2][0] = value; SPOT.getWaves().map(w => w.drawBackground()); });

		var lip = gui.addFolder('Lip');
		lip.add(custom, 'Thickness', 0, 50).onChange(function(value) { SPOT.config.waves.lip.thickness = value; })
		lip.add(custom, 'CapLifetime', 0, 5000).onChange(function(value) { SPOT.config.waves.lip.cap.lifetime = value; });
		lip.add(custom, 'CapHeight', 0, 25).onChange(function(value) { SPOT.config.waves.lip.cap.height = value; });
		lip.add(custom, 'CapWidth', 0, 3000).onChange(function(value) { SPOT.config.waves.lip.cap.width = value; });

		var shoulders = gui.addFolder('Shoulders');
		shoulders.add(custom, 'LShoulderWidth',0, 1000).step(10).onChange(function(value) { SPOT.config.waves.shoulder.left.width = value; });
		shoulders.add(custom, 'LShoulderInner',0, 1000).step(10).onChange(function(value) { SPOT.config.waves.shoulder.left.inner = value; });
		shoulders.add(custom, 'LShoulderOuter',0, 1000).step(10).onChange(function(value) { SPOT.config.waves.shoulder.left.outer = value; });
		shoulders.add(custom, 'LShoulderMarge',0, 1000).step(10).onChange(function(value) { SPOT.config.waves.shoulder.left.marge = value; });
		shoulders.add(custom, 'RShoulderWidth',0, 1000).step(10).onChange(function(value) { SPOT.config.waves.shoulder.right.width = value; });
		shoulders.add(custom, 'RShoulderInner',0, 1000).step(10).onChange(function(value) { SPOT.config.waves.shoulder.right.inner = value; });
		shoulders.add(custom, 'RShoulderOuter',0, 1000).step(10).onChange(function(value) { SPOT.config.waves.shoulder.right.outer = value; });
		shoulders.add(custom, 'RShoulderMarge',0, 1000).step(10).onChange(function(value) { SPOT.config.waves.shoulder.right.marge = value; });

		var breaking = gui.addFolder('Breaking Left');
		breaking.add(custom, 'LBreakWidth',1,50).onChange(function(value) { SPOT.config.waves.breaking.left.width = value; });
		breaking.add(custom, 'LBreakWidthMax',1,50).onChange(function(value) { SPOT.config.waves.breaking.left.width_max = value; });
		breaking.add(custom, 'LBreakWidthInt',0,10000).step(100).onChange(function(value) { SPOT.config.waves.breaking.left.width_interval = value; });
		breaking.add(custom, 'LBreakWidthPause',0,10000).step(100).onChange(function(value) { SPOT.config.waves.breaking.left.width_pause = value; });
		breaking.add(custom, 'LBreakBlockInt',0,10000).step(100).onChange(function(value) { SPOT.config.waves.breaking.left.block_interval = value; });	
		breaking.add(custom, 'LBreakBlockIntMax',0,10000).step(100).onChange(function(value) { SPOT.config.waves.breaking.left.block_interval_max = value; });	
		breaking.add(custom, 'LBreakBlockWidth',0,10000).step(100).onChange(function(value) { SPOT.config.waves.breaking.left.block_width = value; });	
		breaking.add(custom, 'LBreakBlockWidthMax',0,10000).step(100).onChange(function(value) { SPOT.config.waves.breaking.left.block_width_max = value; });

		var breaking = gui.addFolder('Breaking Right');
		breaking.add(custom, 'RBreakWidth',1,50).onChange(function(value) { SPOT.config.waves.breaking.right.width = value; });	
		breaking.add(custom, 'RBreakWidthMax',1,50).onChange(function(value) { SPOT.config.waves.breaking.right.width_max = value; });	
		breaking.add(custom, 'RBreakWidthInt',0,10000).step(100).onChange(function(value) { SPOT.config.waves.breaking.right.width_interval = value; });	
		breaking.add(custom, 'RBreakWidthPause',0,10000).step(100).onChange(function(value) { SPOT.config.waves.breaking.right.width_pause = value; });	
		breaking.add(custom, 'RBreakBlockInt',0,10000).step(100).onChange(function(value) { SPOT.config.waves.breaking.right.block_interval = value; });	
		breaking.add(custom, 'RBreakBlockIntMax',0,10000).step(100).onChange(function(value) { SPOT.config.waves.breaking.right.block_interval_max = value; });	
		breaking.add(custom, 'RBreakBlockWidth',0,10000).step(100).onChange(function(value) { SPOT.config.waves.breaking.right.block_width = value; });	
		breaking.add(custom, 'RBreakBlockWidthMax',0,10000).step(100).onChange(function(value) { SPOT.config.waves.breaking.right.block_width_max = value; });	

		var spot = gui.addFolder('Spot');
		spot.add(custom, 'Horizon', 0, STAGEHEIGHT)
			.onChange(function(value) { SPOT.config.lines.horizon = value; SPOT.drawDebug(); SPOT.drawBackground(); SPOT.getWaves().map(w => w.resize()); });
		spot.add(custom, 'Break', 0, STAGEHEIGHT)
			.onChange(function(value) { SPOT.config.lines.break = value; SPOT.drawDebug(); SPOT.drawBackground(); SPOT.getWaves().map(w => w.resize()); });
		spot.add(custom, 'Peak', 0, STAGEHEIGHT)
			.onChange(function(value) { SPOT.config.lines.peak = value; SPOT.drawDebug(); SPOT.drawBackground(); SPOT.getWaves().map(w => w.resize()); });
		spot.add(custom, 'Beach', 0, STAGEHEIGHT)
			.onChange(function(value) { SPOT.config.lines.beach = value; SPOT.drawDebug(); SPOT.drawBackground(); SPOT.getWaves().map(w => w.resize()); });
		spot.add(custom, 'XShift', -100, 100).onChange(function(value) { SPOT.config.series.xshift = value; });
		spot.addColor(custom, 'SeaColorTop').onChange(function(value) { SPOT.config.colors.top = value; SPOT.drawBackground(); });
		spot.addColor(custom, 'SeaColorBottom').onChange(function(value) { SPOT.config.colors.bottom = value; SPOT.drawBackground(); });

		var series = gui.addFolder('Series');
		series.add(custom, 'NbWaves', 1, 10).onChange(function(value) { SPOT.config.series.length = value; });
		series.add(custom, 'Interval').min(0).step(100).onChange(function(value) { SPOT.config.series.interval = value; });
		series.add(custom, 'Etalement',0).step(10).onChange(function(value) { SPOT.config.series.spread = value; });
		series.add(custom, 'WaveVitesse',0).min(5000).step(100).onChange(function(value) { SPOT.config.series.speed = value; });
		series.add(custom, 'WaveFrequency',0).min(0).step(100).onChange(function(value) { SPOT.config.series.frequency = value; });

		var surfers = gui.addFolder('Surfers');
		surfers.add(custom, 'surfersSize', 0, 3).onChange(function(value) { SPOT.config.surfers.proportion = value; })
		surfers.add(custom, 'surfersVX', 0, 1).step(0.01).onChange(function(value) { SPOT.config.surfers.velocities.x = value; })
		surfers.add(custom, 'surfersVY', 0, 1).step(0.01).onChange(function(value) { SPOT.config.surfers.velocities.x = value; })


		var diff = gui.addFolder('Difficulty');
		diff.add(custom, 'fallAtBottom', 0, 1).step(0.1).onChange(function(value) { SPOT.config.waves.bottom_fall_scale = value; });
		diff.add(custom, 'fallAtTop', 0, 1).step(0.1).onChange(function(value) { SPOT.config.waves.top_fall_scale = value; });
		diff.add(custom, 'wavePaddlingEffort',0).onChange(function(value) { SPOT.config.waves.paddling_effort = value; });

		var obstacles = gui.addFolder('Obstacles');
		obstacles.add(custom, 'obstaclesInterval',0,10000).step(100).onChange(function(value) { SPOT.config.waves.obstacles_interval = value; });
		obstacles.add(custom, 'obstaclesIntervalMax',0,10000).step(100).onChange(function(value) { SPOT.config.waves.obstacles_interval_max = value; });
		obstacles.add(custom, 'paddlerPercentage',0,100).onChange(function(value) { SPOT.config.waves.obstacles['paddler'].percentage = value; });
		obstacles.add(custom, 'photographPercentage',0,100).onChange(function(value) { SPOT.config.waves.obstacles['photograph'].percentage = value; });

		gui.add(custom, 'performance',{ Minimum: 0, Normal:2, High: 3}).onChange(function(value) { window.PERF = value; });



	}

})();