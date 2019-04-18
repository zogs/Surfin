(function() {

	var Custom = function() {

		CONFIG = cloneObject(SPOT.config);

		this.Horizon = SPOT.config.lines.horizon;
		this.Break = SPOT.config.lines.break;
		this.Peak = SPOT.config.lines.peak;
		this.Beach = SPOT.config.lines.beach;
		this.XShift = SPOT.config.series.xshift;
		this.SeaTop = SPOT.config.colors.top;
		this.SeaBottom = SPOT.config.colors.bottom;

		this.Width        = SPOT.config.waves.width;
		this.Height       = SPOT.config.waves.height;
		this.Meters       = SPOT.config.waves.real_height;
		this.BreakWidth   = SPOT.config.waves.breaking.width;
		this.XSpeed       = SPOT.config.waves.breaking.x_speed;
		this.XSpeedMax    = SPOT.config.waves.breaking.x_speed_max;
		this.XSpeedInterval = SPOT.config.waves.breaking.x_speed_interval;
		this.XSpeedPause  = SPOT.config.waves.breaking.x_speed_pause;
		this.BreakSpeed   = SPOT.config.waves.breaking.y_speed;
		this.BreakEase    = SPOT.config.waves.breaking.y_ease;
		this.SplashPerCent = SPOT.config.waves.breaking.splash_h_percent;
		this.SplashEase = SPOT.config.waves.breaking.splash_h_ease;
		this.WaveTop     = SPOT.config.waves.colors[0][0];
		this.WaveMiddle  = SPOT.config.waves.colors[1][0];
		this.WaveBottom  = SPOT.config.waves.colors[2][0];


		this.SuctionX = SPOT.config.waves.suction.x;
		this.SuctionY = SPOT.config.waves.suction.y;
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
		this.LipTop     = SPOT.config.waves.lip.colors.top;
		this.LipBottom  = SPOT.config.waves.lip.colors.bottom;
		this.SplashTop     = SPOT.config.waves.splash.colors.top;
		this.SplashBottom  = SPOT.config.waves.splash.colors.bottom;

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
		this.WaveFrequency = SPOT.config.series.frequency;
		this.WaveSpeed = SPOT.config.series.speed;
		this.Etalement = SPOT.config.series.spread;
		this.IntervalBetweenSerie = SPOT.config.series.interval;

		this.surfersSize = SPOT.config.surfers.proportion;
		this.surfersVX = SPOT.config.surfers.velocities.x;
		this.surfersVY = SPOT.config.surfers.velocities.y;

		this.wavePaddlingEffort = SPOT.config.waves.paddling_effort;
		this.fallAtBottom = SPOT.config.waves.bottom_fall_scale;
		this.fallAtTop = SPOT.config.waves.top_fall_scale;

		this.floatInterval = SPOT.config.waves.obstacles.float.interval;
		this.floatIntervalMax = SPOT.config.waves.obstacles.float.interval_max;
		this.paddlerPercent = SPOT.config.waves.obstacles.float.objects['paddler'].percentage;
		this.photographPercent = SPOT.config.waves.obstacles.float.objects['photographer'].percentage;
		this.bombPercent = SPOT.config.waves.obstacles.float.objects['bomb'].percentage;
		this.flyInterval = SPOT.config.waves.obstacles.fly.interval;
		this.flyIntervalMax = SPOT.config.waves.obstacles.fly.interval_max;
		this.prizePercent = SPOT.config.waves.obstacles.fly.objects['prize'].percentage;
		this.dronePercent = SPOT.config.waves.obstacles.fly.objects['drone'].percentage;
		this.cigognePercent = SPOT.config.waves.obstacles.fly.objects['cigogne'].percentage;

		this.performance = window.PERF;

		this.LaunchSpot = function() {

			//remove pause if needed
			if(PAUSED) window.pause();

			//add spot with updated config
			window.addSpot(SPOT);
		}

		this.TestWave = function() {

			//remove pause if needed
			if(PAUSED) window.pause();

			//apply config
			applyConfig();

			// add a wave and break it
			window.addSpot(SPOT, false);
			SPOT.removeAllPaddlers().getWave().breakAndFollow();
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

		this.PrintConfig = function() {

			var popup=window.open('','config','height=600,width=400,location=no,resizable=yes,scrollbar=yes');
			popup.document.write("<pre id='config'>"+JSON.stringify(CONFIG,undefined, 2)+"<pre>");
			var range = popup.document.createRange();
			range.selectNode(popup.document.getElementById('config'));
			popup.getSelection().addRange(range);
		}

	};

	applyConfig = function() {
		console.log('applyConfig');
		var conf = CONFIG;

		delete conf.waves.x;
		delete conf.waves.y;
		delete conf.waves.height;
		delete conf.waves.width;

		SPOT.setConfig(conf);

	}

	initCustomizer = function() {
		console.log('initCustomizer');
		var custom = new Custom();
		var gui = new dat.GUI();

		gui.width = 300;

		gui.remember(custom);

		gui.close();

		gui.add(custom, 'LaunchSpot');
		gui.add(custom, 'TestWave');


		var spot = gui.addFolder('Spot');
		var lines = spot.addFolder('Lines');
		lines.add(custom, 'Horizon', 0, STAGEHEIGHT).onChange(function(value) { CONFIG.lines.horizon = value; applyConfig();});
		lines.add(custom, 'Break', 0, STAGEHEIGHT).onChange(function(value) { CONFIG.lines.break = value; applyConfig(); });
		lines.add(custom, 'Peak', 0, STAGEHEIGHT).onChange(function(value) { CONFIG.lines.peak = value; applyConfig(); });
		lines.add(custom, 'Beach', 0, STAGEHEIGHT).onChange(function(value) { CONFIG.lines.beach = value; applyConfig(); });
		lines.add(custom, 'XShift', -100, 100).onChange(function(value) { CONFIG.series.xshift = value; applyConfig(); });

		var series = spot.addFolder('Series');
		series.add(custom, 'NbWaves', 1, 10).onChange(function(value) { CONFIG.series.length = value; applyConfig(); });
		series.add(custom, 'WaveFrequency',0).min(0).step(100).onChange(function(value) { CONFIG.series.frequency = value; applyConfig(); });
		series.add(custom, 'WaveSpeed',0).min(5000).step(100).onChange(function(value) { CONFIG.series.speed = value; applyConfig(); });
		series.add(custom, 'Etalement',0).step(10).onChange(function(value) { CONFIG.series.spread = value; applyConfig(); });
		series.add(custom, 'IntervalBetweenSerie').min(0).step(100).onChange(function(value) { CONFIG.series.interval = value; applyConfig(); });

		var waves = gui.addFolder('Waves');

		var dimension = waves.addFolder('Dimension')
		var heights = dimension.addFolder('Vertical');
		heights.add(custom, 'Height', 10, 400).onChange(function(value) { CONFIG.waves.height = value; applyConfig(); });
		heights.add(custom, 'Meters', 1, 10).onChange(function(value) { CONFIG.waves.real_height = value; applyConfig(); });
		var widths = dimension.addFolder('Horizontal');
		widths.add(custom, 'Width', 100, 5000).step(100).onChange(function(value) { CONFIG.waves.width = value; applyConfig(); });
		widths.add(custom, 'BreakWidth',1,1500).step(10).onChange(function(value) { CONFIG.waves.breaking.width = value; applyConfig(); });

		var breaking = waves.addFolder('Breaking');
		var verti = breaking.addFolder('Vertical');
		verti.add(custom, 'BreakSpeed',0,5000).step(50).onChange(function(value) { CONFIG.waves.breaking.y_speed = value; applyConfig(); });
		verti.add(custom, 'BreakEase',['quartIn','cubicIn','circIn']).onChange(function(value) { CONFIG.waves.breaking.y_ease = value; applyConfig(); });
		verti.add(custom, 'SplashPerCent',0,100).step(1).onChange(function(value) { CONFIG.waves.breaking.splash_h_percent = value; applyConfig(); });
		verti.add(custom, 'SplashEase',0,1).step(0.1).onChange(function(value) { CONFIG.waves.breaking.splash_h_ease = value; applyConfig(); });
		var horiz = breaking.addFolder('Horizontal');
		horiz.add(custom, 'XSpeed',10,100).step(2).onChange(function(value) { CONFIG.waves.breaking.x_speed = value; applyConfig(); });
		horiz.add(custom, 'XSpeedMax',10,100).step(2).onChange(function(value) { CONFIG.waves.breaking.x_speed_max = value; applyConfig(); });
		horiz.add(custom, 'XSpeedInterval',1,1500).step(10).onChange(function(value) { CONFIG.waves.breaking.x_speed_interval = value; applyConfig(); });
		horiz.add(custom, 'XSpeedPause',1,1500).step(10).onChange(function(value) { CONFIG.waves.breaking.x_speed_pause = value; applyConfig(); });


		var left = breaking.addFolder('Left');
		left.add(custom, 'LBreakWidth',1,50).onChange(function(value) { CONFIG.waves.breaking.left.width = value; applyConfig(); });
		left.add(custom, 'LBreakWidthMax',1,50).onChange(function(value) { CONFIG.waves.breaking.left.width_max = value; applyConfig(); });
		left.add(custom, 'LBreakWidthInt',0,10000).step(100).onChange(function(value) { CONFIG.waves.breaking.left.width_interval = value; applyConfig(); });
		left.add(custom, 'LBreakWidthPause',0,10000).step(100).onChange(function(value) { CONFIG.waves.breaking.left.width_pause = value; applyConfig(); });
		left.add(custom, 'LBreakBlockInt',0,10000).step(100).onChange(function(value) { CONFIG.waves.breaking.left.block_interval = value; applyConfig(); });
		left.add(custom, 'LBreakBlockIntMax',0,20000).step(100).onChange(function(value) { CONFIG.waves.breaking.left.block_interval_max = value; applyConfig(); });
		left.add(custom, 'LBreakBlockWidth',0,3000).step(100).onChange(function(value) { CONFIG.waves.breaking.left.block_width = value; applyConfig(); });
		left.add(custom, 'LBreakBlockWidthMax',0,3000).step(100).onChange(function(value) { CONFIG.waves.breaking.left.block_width_max = value; applyConfig(); });

		var right = breaking.addFolder('Right');
		right.add(custom, 'RBreakWidth',1,50).onChange(function(value) { CONFIG.waves.breaking.right.width = value; applyConfig(); });
		right.add(custom, 'RBreakWidthMax',1,50).onChange(function(value) { CONFIG.waves.breaking.right.width_max = value; applyConfig(); });
		right.add(custom, 'RBreakWidthInt',0,10000).step(100).onChange(function(value) { CONFIG.waves.breaking.right.width_interval = value; applyConfig(); });
		right.add(custom, 'RBreakWidthPause',0,10000).step(100).onChange(function(value) { CONFIG.waves.breaking.right.width_pause = value; applyConfig(); });
		right.add(custom, 'RBreakBlockInt',0,10000).step(100).onChange(function(value) { CONFIG.waves.breaking.right.block_interval = value; applyConfig(); });
		right.add(custom, 'RBreakBlockIntMax',0,20000).step(100).onChange(function(value) { CONFIG.waves.breaking.right.block_interval_max = value; applyConfig(); });
		right.add(custom, 'RBreakBlockWidth',0,3000).step(100).onChange(function(value) { CONFIG.waves.breaking.right.block_width = value; applyConfig(); });
		right.add(custom, 'RBreakBlockWidthMax',0,3000).step(100).onChange(function(value) { CONFIG.waves.breaking.right.block_width_max = value; applyConfig(); });

		var shoulders = waves.addFolder('Shoulders');
		shoulders.add(custom, 'LShoulderWidth',0, 1000).step(10).onChange(function(value) { CONFIG.waves.shoulder.left.width = value; applyConfig(); });
		shoulders.add(custom, 'LShoulderInner',0, 1000).step(10).onChange(function(value) { CONFIG.waves.shoulder.left.inner = value; applyConfig(); });
		shoulders.add(custom, 'LShoulderOuter',0, 1000).step(10).onChange(function(value) { CONFIG.waves.shoulder.left.outer = value; applyConfig(); });
		shoulders.add(custom, 'LShoulderMarge',0, 1000).step(10).onChange(function(value) { CONFIG.waves.shoulder.left.marge = value; applyConfig(); });
		shoulders.add(custom, 'RShoulderWidth',0, 1000).step(10).onChange(function(value) { CONFIG.waves.shoulder.right.width = value; applyConfig(); });
		shoulders.add(custom, 'RShoulderInner',0, 1000).step(10).onChange(function(value) { CONFIG.waves.shoulder.right.inner = value; applyConfig(); });
		shoulders.add(custom, 'RShoulderOuter',0, 1000).step(10).onChange(function(value) { CONFIG.waves.shoulder.right.outer = value; applyConfig(); });
		shoulders.add(custom, 'RShoulderMarge',0, 1000).step(10).onChange(function(value) { CONFIG.waves.shoulder.right.marge = value; applyConfig(); });

		var lip = waves.addFolder('Lip');
		lip.add(custom, 'Thickness', 0, 50).onChange(function(value) { CONFIG.waves.lip.thickness = value;applyConfig();  })
		lip.add(custom, 'CapLifetime', 0, 5000).onChange(function(value) { CONFIG.waves.lip.cap.lifetime = value; applyConfig(); });
		lip.add(custom, 'CapHeight', 0, 25).onChange(function(value) { CONFIG.waves.lip.cap.height = value; applyConfig(); });
		lip.add(custom, 'CapWidth', 0, 3000).onChange(function(value) { CONFIG.waves.lip.cap.width = value; applyConfig(); });

		var colors = gui.addFolder('Colors');
		colors.addColor(custom, 'WaveTop').onChange(function(value) { CONFIG.waves.colors[0][0] = value; applyConfig(); });
		colors.addColor(custom, 'WaveMiddle').onChange(function(value) { CONFIG.waves.colors[1][0] = value; applyConfig(); });
		colors.addColor(custom, 'WaveBottom').onChange(function(value) { CONFIG.waves.colors[2][0] = value; applyConfig(); });
		colors.addColor(custom, 'LipTop').onChange(function(value) { CONFIG.waves.lip.colors.top = value; applyConfig(); });
		colors.addColor(custom, 'LipBottom').onChange(function(value) { CONFIG.waves.lip.colors.bottom = value; applyConfig(); });
		colors.addColor(custom, 'SplashTop').onChange(function(value) { CONFIG.waves.splash.colors.top = value; applyConfig(); });
		colors.addColor(custom, 'SplashBottom').onChange(function(value) { CONFIG.waves.splash.colors.bottom = value; applyConfig(); });
		colors.addColor(custom, 'SeaTop').onChange(function(value) { CONFIG.colors.top = value; SPOT.drawBackground(); applyConfig(); });
		colors.addColor(custom, 'SeaBottom').onChange(function(value) { CONFIG.colors.bottom = value; SPOT.drawBackground(); applyConfig(); });

		var surfers = gui.addFolder('Surfers');
		surfers.add(custom, 'surfersSize', 0, 3).onChange(function(value) { CONFIG.surfers.proportion = value;applyConfig();  })
		surfers.add(custom, 'surfersVX', 0, 1).step(0.01).onChange(function(value) { CONFIG.surfers.velocities.x = value;applyConfig();  })
		surfers.add(custom, 'surfersVY', 0, 1).step(0.01).onChange(function(value) { CONFIG.surfers.velocities.x = value;applyConfig();  })


		var diff = gui.addFolder('Difficulty');
		diff.add(custom, 'fallAtBottom', 0, 1).step(0.1).onChange(function(value) { CONFIG.waves.bottom_fall_scale = value; applyConfig(); });
		diff.add(custom, 'fallAtTop', 0, 1).step(0.1).onChange(function(value) { CONFIG.waves.top_fall_scale = value; applyConfig(); });
		diff.add(custom, 'wavePaddlingEffort',0).onChange(function(value) { CONFIG.waves.paddling_effort = value; applyConfig(); });

		var obstacles = gui.addFolder('Obstacles');

		var float = obstacles.addFolder('Floating');
		float.add(custom, 'floatInterval',0,10000).step(100).onChange(function(value) { CONFIG.waves.obstacles.float.interval = value; applyConfig(); });
		float.add(custom, 'floatIntervalMax',0,10000).step(100).onChange(function(value) { CONFIG.waves.obstacles.float.interval_max = value; applyConfig(); });
		float.add(custom, 'paddlerPercent',0,100).onChange(function(value) { CONFIG.waves.obstacles.float.objects['paddler'].percentage = value; applyConfig(); });
		float.add(custom, 'photographPercent',0,100).onChange(function(value) { CONFIG.waves.obstacles.float.objects['photograph'].percentage = value; applyConfig(); });
		float.add(custom, 'bombPercent',0,100).onChange(function(value) { CONFIG.waves.obstacles.float.objects['bomb'].percentage = value; applyConfig(); });

		var fly = obstacles.addFolder('Flying');
		fly.add(custom, 'flyInterval',0,10000).step(100).onChange(function(value) { CONFIG.waves.obstacles.fly.interval = value; applyConfig(); });
		fly.add(custom, 'flyIntervalMax',0,10000).step(100).onChange(function(value) { CONFIG.waves.obstacles.fly.interval_max = value; applyConfig(); });
		fly.add(custom, 'prizePercent',0,100).onChange(function(value) { CONFIG.waves.obstacles.fly.objects['prize'].percentage = value; applyConfig(); });
		fly.add(custom, 'dronePercent',0,100).onChange(function(value) { CONFIG.waves.obstacles.fly.objects['drone'].percentage = value; applyConfig(); });
		fly.add(custom, 'cigognePercent',0,100).onChange(function(value) { CONFIG.waves.obstacles.fly.objects['cigogne'].percentage = value; applyConfig(); });

		gui.add(custom, 'performance',{ Minimum: 0, Normal:2, High: 3}).onChange(function(value) { window.PERF = value; });
		gui.add(custom, 'SwitchDebugMode');
		gui.add(custom, 'SwitchTestMode');
		gui.add(custom, 'Pause');

		gui.add(custom, 'PrintConfig');



	}

})();