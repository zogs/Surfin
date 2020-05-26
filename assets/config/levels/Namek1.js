(function() {

  function Namek1(params) {

    let defaults = {
      id: 'Namek1',
      name: 'Namek 1',
      planet: 'namek',
      init: {
        type: 'waiting',
      },
      series: {
        length :  3,
        speed : 20000,
        frequency : 5000,
        interval : 28000,
        spread : 0,
        xshift: 0,
      },
      goals: [
        { type: 'score', current:0, aim: 2000, name: 'Faire un score de 2000 points ({n})' },
        { type: 'tube', current:0, aim: 10, name: 'Faire un tube de 10s ou + ({n})' },
      ],
      surfers: {
        max: 1,
        proportion: 1.5,
        "x": 750,
        "y": 470,
        velocities: {
          x: 1,
          y: 1
        },
        weapons: []
      },
      waves: {
        height : 270,
        width : 0,
        real_height: 3,
        breaking: {
          width: 180,
          y_speed: 1200,
          y_ease: 'quartIn',
          splash_h_percent: 100,
          splash_h_ease: 0.4,
          left: {
            width: 30,
            width_max: 32,
            width_interval: 0,
            width_pause: 0,
            block_interval: 500,
            block_interval_max: 1000,
            block_width: 50,
            block_width_max: 100,
          },
          right: {
            width: 30,
            width_max: 32,
            width_interval: 0,
            width_pause: 1000,
            block_interval: 4000,
            block_interval_max: 4000,
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
            'interval': 3000,
            'interval_max': 6000,
            'objects' : {
              'guldo': {percentage: 33},
              'reacum': {percentage: 33},
              'jeese': {percentage: 33},
            },
          },
          'fly': {
            'interval': 0,
            'interval_max': 1000,
            'objects' : {
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
    let config = extend(defaults, params);

    this.Container_constructor();
    this.init(config);
  }

  var prototype = createjs.extend(Namek1, window.Spot);

  SPOTS.Namek1 = Namek1;
  LEVELS.push(Namek1);

}());