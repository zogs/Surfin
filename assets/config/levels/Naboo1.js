(function() {

  function Naboo1(params) {

    let defaults = {
      id: 'Naboo1',
      name: 'Naboo 1',
      planet: 'naboo',
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
        proportion: 3,
        "x": 750,
        "y": 470,
        velocities: {
          x: 1,
          y: 1
        },
        weapons: []
      },
      waves: {
        height : 310,
        width : 0,
        real_height: 3.5,
        breaking: {
          width: 180,
          y_speed: 1200,
          y_ease: 'quartIn',
          splash_h_percent: 100,
          splash_h_ease: 0.4,
          unroll: {
            width: 20,
            width_max: 25,
            width_interval: 2000,
            width_pause: 500,
            block_interval: 1000,
            block_interval_max: 5000,
            block_width: 50,
            block_width_max: 500,
          },
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
            'interval': 1000,
            'interval_max': 3000,
            'objects' : {
              'seafish': {percentage:90},
              'beachtrooper': {percentage: 5},
              'paddletrooper': {percentage: 5},
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
          width: 1000,
          inner: 300,
          outer: 300,
          marge: 50,
          slope: 0
        }
      },
    }
    let config = extend(defaults, params);

    this.Container_constructor();
    this.init(config);
  }

  var prototype = createjs.extend(Naboo1, window.Spot);

  SPOTS.Naboo1 = Naboo1;
  LEVELS.push(Naboo1);

}());