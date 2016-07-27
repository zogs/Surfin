(function() {

	var Custom = function() {

		this.horizon = SPOT.config.lines.horizon;
		this.peak = SPOT.config.lines.peak;
		this.beach = SPOT.config.lines.beach;

		this.Width = SPOT.config.waves.width;
		this.Height = SPOT.config.waves.height;
		this.YSpeed = SPOT.config.waves.breaking_yspeed;
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

		this.LBreakingWidth = SPOT.config.waves.breaking_width_left;
		this.RBreakingWidth = SPOT.config.waves.breaking_width_right;	
		this.LBreakBlockInt = SPOT.config.waves.breaking_block_left_interval;	
		this.LBreakBlockIntMax = SPOT.config.waves.breaking_block_left_interval_max;	
		this.LBreakBlockWidth = SPOT.config.waves.breaking_block_left_width;
		this.LBreakBlockWidthMax = SPOT.config.waves.breaking_block_left_width_max;
		this.RBreakBlockInt = SPOT.config.waves.breaking_block_right_interval;	
		this.RBreakBlockIntMax = SPOT.config.waves.breaking_block_right_interval_max;	
		this.RBreakBlockWidth = SPOT.config.waves.breaking_block_right_width;
		this.RBreakBlockWidthMax = SPOT.config.waves.breaking_block_right_width_max;

		this.NbWaves = SPOT.config.series.length;
		this.Interval = SPOT.config.series.interval;
		this.Etalement = SPOT.config.series.spread;
		this.WaveVitesse = SPOT.config.series.speed;
		this.WaveFrequency = SPOT.config.series.frequency;

		this.surfersSize = SPOT.config.surfers.proportion;

		this.wavePaddlingEffort = SPOT.config.waves.paddling_effort;
		this.fallAtBottom = SPOT.config.waves.bottom_fall_scale;
		this.fallAtTop = SPOT.config.waves.top_fall_scale;

		this.ColorTop = SPOT.config.waves.color_top;
		this.ColorBottom = SPOT.config.waves.color_bot;

		this.obstaclesInterval = SPOT.config.waves.obstacles_interval;
		this.obstaclesIntervalMax = SPOT.config.waves.obstacles_interval_max;
		this.paddlerPercentage = SPOT.config.waves.obstacles['paddler'].percentage;
		this.photographPercentage = SPOT.config.waves.obstacles['photograph'].percentage;

		this.resetSpot = function() {
			window.addSpot(SPOT.config);
		}

		this.activateDebug = function() {
			window.switchDebugMode();
		}

		this.activateTesting = function() {
			window.switchTestMode();
		}
	};


	initCustomizer = function() {

		var custom = new Custom();
		var gui = new dat.GUI();

		gui.remember(custom);

		gui.close();

		var waves = gui.addFolder('Waves');
		waves.add(custom, 'Width', 100, 10000).step(200).onChange(function(value) { SPOT.config.waves.width = value; });
		waves.add(custom, 'Height', 10, 300).onChange(function(value) { SPOT.config.waves.height = value; });
		waves.add(custom, 'YSpeed',0).step(100).onChange(function(value) { SPOT.config.waves.breaking_yspeed = value; });
		waves.add(custom, 'LShoulderWidth',0).onChange(function(value) { SPOT.config.waves.shoulder.left.width = value; });
		waves.add(custom, 'LShoulderInner',0).onChange(function(value) { SPOT.config.waves.shoulder.left.inner = value; });
		waves.add(custom, 'LShoulderOuter',0).onChange(function(value) { SPOT.config.waves.shoulder.left.outer = value; });
		waves.add(custom, 'LShoulderMarge',0).onChange(function(value) { SPOT.config.waves.shoulder.left.marge = value; });
		waves.add(custom, 'RShoulderWidth',0).onChange(function(value) { SPOT.config.waves.shoulder.right.width = value; });
		waves.add(custom, 'RShoulderInner',0).onChange(function(value) { SPOT.config.waves.shoulder.right.inner = value; });
		waves.add(custom, 'RShoulderOuter',0).onChange(function(value) { SPOT.config.waves.shoulder.right.outer = value; });
		waves.add(custom, 'RShoulderMarge',0).onChange(function(value) { SPOT.config.waves.shoulder.right.marge = value; });
		waves.add(custom, 'SuctionX',1,50).onChange(function(value) { SPOT.config.waves.suction_x = value; });
		waves.add(custom, 'SuctionY',1,50).onChange(function(value) { SPOT.config.waves.suction_y = value; });
		waves.close();

		var breaking = gui.addFolder('Breaking Left');
		breaking.add(custom, 'LBreakingWidth',1,50).onChange(function(value) { SPOT.config.waves.breaking_width_left = value; });
		breaking.add(custom, 'LBreakBlockInt',0).onChange(function(value) { SPOT.config.waves.breaking_block_left_interval = value; });	
		breaking.add(custom, 'LBreakBlockIntMax',0).onChange(function(value) { SPOT.config.waves.breaking_block_left_interval_max = value; });	
		breaking.add(custom, 'LBreakBlockWidth',0).onChange(function(value) { SPOT.config.waves.breaking_block_left_width = value; });	
		breaking.add(custom, 'LBreakBlockWidthMax',0).onChange(function(value) { SPOT.config.waves.breaking_block_left_width_max = value; });

		var breaking = gui.addFolder('Breaking Right');
		breaking.add(custom, 'RBreakingWidth',1,50).onChange(function(value) { SPOT.config.waves.breaking_width_right = value; });	
		breaking.add(custom, 'RBreakBlockInt',0).onChange(function(value) { SPOT.config.waves.breaking_block_right_interval = value; });	
		breaking.add(custom, 'RBreakBlockIntMax',0).onChange(function(value) { SPOT.config.waves.breaking_block_right_interval_max = value; });	
		breaking.add(custom, 'RBreakBlockWidth',0).onChange(function(value) { SPOT.config.waves.breaking_block_right_width = value; });	
		breaking.add(custom, 'RBreakBlockWidthMax',0).onChange(function(value) { SPOT.config.waves.breaking_block_right_width_max = value; });	

		var series = gui.addFolder('Series');
		series.add(custom, 'NbWaves', 1, 10).onChange(function(value) { SPOT.config.series.length = value; });
		series.add(custom, 'Interval').min(0).step(100).onChange(function(value) { SPOT.config.series.interval = value; });
		series.add(custom, 'Etalement',0).step(10).onChange(function(value) { SPOT.config.series.spread = value; });
		series.add(custom, 'WaveVitesse',0).min(5000).step(100).onChange(function(value) { SPOT.config.series.speed = value; });
		series.add(custom, 'WaveFrequency',0).min(0).step(100).onChange(function(value) { SPOT.config.series.frequency = value; });

		var surfers = gui.addFolder('Surfers');
		surfers.add(custom, 'surfersSize', 0, 3).onChange(function(value) { SPOT.config.surfers.proportion = value; })

		var spot = gui.addFolder('Spot');
		spot.add(custom, 'horizon', 0, STAGEHEIGHT).onChange(function(value) { SPOT.config.lines.horizon = value; });
		spot.add(custom, 'peak', 0, STAGEHEIGHT).onChange(function(value) { SPOT.config.lines.peak = value; });
		spot.add(custom, 'beach', 0, STAGEHEIGHT).onChange(function(value) { SPOT.config.lines.beach = value; });

		var diff = gui.addFolder('Difficulty');
		diff.add(custom, 'fallAtBottom', 0, 2).step(0.1).onChange(function(value) { SPOT.config.waves.bottom_fall_scale = value; });
		diff.add(custom, 'fallAtTop', 0, 2).step(0.1).onChange(function(value) { SPOT.config.waves.top_fall_scale = value; });
		diff.add(custom, 'wavePaddlingEffort',0).onChange(function(value) { SPOT.config.waves.paddling_effort = value; });

		var obstacles = gui.addFolder('Obstacles');
		obstacles.add(custom, 'obstaclesInterval',0).onChange(function(value) { SPOT.config.waves.obstacles_interval = value; });
		obstacles.add(custom, 'obstaclesIntervalMax',0).onChange(function(value) { SPOT.config.waves.obstacles_interval_max = value; });
		obstacles.add(custom, 'paddlerPercentage',0,100).onChange(function(value) { SPOT.config.waves.obstacles['paddler'].percentage = value; });
		obstacles.add(custom, 'photographPercentage',0,100).onChange(function(value) { SPOT.config.waves.obstacles['photograph'].percentage = value; });

		var colors = gui.addFolder('Colors');
		colors.addColor(custom, 'ColorTop').onChange(function(value) { SPOT.config.waves.color_top = value; });
		colors.addColor(custom, 'ColorBottom').onChange(function(value) { SPOT.config.waves.color_bot = value; });

		gui.add(custom, 'resetSpot');
		gui.add(custom, 'activateDebug');
		gui.add(custom, 'activateTesting');


	}

})();