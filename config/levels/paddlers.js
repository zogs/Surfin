var conf = {
  id: 2,
  name: 'paddlers',
  alias: 'paddlers',
  planet: 'caladan',
  level: 4,
  config: {
    init: {
      type: 'static',
    },
    colors: {
      top: '#00557f',
      bottom: '#57c9ff'
    },
    lines: {
      horizon: 240,
      break: 500,
      peak: 600,
      beach: 700,
      obstacle: 750,
    },
    series: {
      length :  2,
      speed : 20000,
      frequency : 5000,
      interval : 14000,
      spread : 200,
      xshift: 10,
    },
    surfers: {
      proportion: 1.5,
      velocities: {
        x: 1,
        y: 1
      },
      weapons: []
    },
    waves: {
      height : 250,
      width : 0,
      real_height: 3,
      breaking: {
        width: 180,
        x_speed: 50,
        x_speed_max: 50,
        x_speed_interval: 0,
        x_speed_pause: 200,
        y_speed: 1200,
        y_ease: 'quartIn',
        splash_h_percent: 100,
        splash_h_ease: 0.4,
        left: {
          width: 20,
          width_max: 30,
          width_interval: 1000,
          width_pause: 0,
          block_interval: 0,
          block_interval_max: 0,
          block_width: 100,
          block_width_max: 200,
        },
        right: {
          width: 20,
          width_max: 0,
          width_interval: 0,
          width_pause: 1000,
          block_interval: 2000,
          block_interval_max: 600,
          block_width: 100,
          block_width_max: 200,
        }
      },
      lip: {
        thickness: 10,
        colors: {
          top: '#093950',
          bottom: 'rgba(255,255,255,0.2)',
        },
        cap: {
          width: 700,
          height: 10,
          lifetime: 800,
        },
      },
      splash: {
        colors: {
          top: '#FFF',
          bottom: '#FFF',
        }
      },
      paddling_effort: 1,
      bottom_fall_scale: 0.8,
      top_fall_scale: 0.15,
      tube_difficulty_min : 1,
      tube_difficulty_max : 10,
      suction: {x: 5, y: 4},
      colors: [
        ['#04567d',0,0],
        ['#2ea8e3',0,50],
        ['#36aee8',0,100]
      ],
      obstacles: {
        'float': {
          'interval': 200,
          'interval_max': 1000,
          'objects' : {
            'paddler' : {percentage: 100},
            'photographer' : {percentage: 0},
            'bomb': {percentage: 0},
            'trooper': {percentage: 0},
          },
        },
        'fly': {
          'interval': 0,
          'interval_max': 1000,
          'objects' : {
            'prize' : {percentage: 30},
            'cigogne' : {percentage: 30},
            'drone': {percentage: 40},
          },
        }
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
  }
};

LEVELS.push(conf);
