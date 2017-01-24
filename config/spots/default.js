var conf = {	
	id: 1,
	name: 'moyen',
	alias: 'default',
	config: {
		lines: {
			horizon: 240,
			break: 420,
			peak: 500,
			beach: 510
		},
		colors: {
			top: '#00354f',
			bottom: '#166f99'
		},
		waves: {
			height : 150,
			width : 0,
			real_height: 3,
			breaking: {
				width: 300,
				yspeed: 1200,
				splash_h_percent: 90,
				splash_h_ease: 0.4,
				left: {
					width: 10,
					width_max: 20,				
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
				thickness: 10,
				color: '#FFF',
				cap: {
					width: 700,
					height: 10,
					lifetime: 800,
				},
			},
			paddling_effort: 1,
			bottom_fall_scale: 0.8,
			top_fall_scale: 0.15,	
			tube_difficulty_min	: 1,	
			tube_difficulty_max	: 10,	
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
			length :  3,
			frequency : 3000,
			interval : 8000,				
			spread : 200,	
			xshift: 10,			
			speed : 25000,
		},	
		surfers: {
			proportion: 1.5,
			velocities: {
				x: 1,
				y: 1
			},
		}		
	}
};

SPOTSCONF.push(conf);
