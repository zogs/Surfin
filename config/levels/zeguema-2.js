var conf = {
  id: 1,
  name: 'zeguema2',
  alias: 'zeguema2',
  planet: 'zeguema',
  level: 2,
  unlock: true,
    init: {
      type: 'waving',
      // type: 'fixed',
    },
    series: {
      length :  3,
      speed : 20000,
      frequency : 5000,
      interval : 8000,
      spread : 0,
      xshift: 0,
    },
    timelimit: 30,
    goals: [
      { type: 'score', current:0, aim: 2000, name: 'Faire un score de 2000 points' },
      { type: 'trick', current:0, aim: 'Backflip', count: 2, name: 'Faire 2 backflip ({n})' },
      { type: 'catch', current:0, aim: 'prize', count: 3, name: 'Attraper 3 prix ({n})' },
      { type: 'catch', current:0, aim: 'star', count: 50, name: 'Attraper 50 étoiles ({n})' },
      { type: 'kill', current:0, aim: 'surfer', count: 10, name: 'Défoncer 10 surfers ({n})' },
      { type: 'tube', current:0, aim: 5, name: 'Faire un tube de 5s ou + ({n})' },
    ],
    surfers: {
      max: 1,
      x: 750,
      y: 470,
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
          width_interval: 0,
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
        cap: {
          width: 700,
          height: 10,
          lifetime: 800,
        },
      },
      paddling_effort: 1,
      bottom_fall_scale: 0.8,
      top_fall_scale: 0.15,
      tube_difficulty_min : 1,
      tube_difficulty_max : 10,
      suction: {x: 5, y: 4},
      obstacles: {
        'float': {
          'interval': 500,
          'interval_max': 1000,
          'objects' : {
            'bomb': {percentage: 60},
            'trooper': {percentage: 40},
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
};

LEVELS.push(conf);
