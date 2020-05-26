(function() {

  function Flhoston1(params) {

    let defaults = {
      id: 'Flhoston1',
      name: 'Flhoston 1',
      planet: 'flhoston',
      story: [],
      init: {
        type: 'waiting',
        // type: 'fixed',
      },
      series: {
        length :  3,
        speed : 20000,
        frequency : 5000,
        interval : 28000,
        spread : 0,
        xshift: 0,
      },
      timelimit: null,
      goals: [
        { type: 'score', current:0, aim: 2000, name: 'Faire un score de 2000 points ({n})' },
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
        height : 280,
        width : 0,
        real_height: 3,
        breaking: {
          width: 180,
          y_speed: 1500,
          y_ease: 'quartIn',
          splash_h_percent: 100,
          splash_h_ease: 0.4,
          left: {
            width: 28,
            width_max: 30,
            width_interval: 2000,
            width_pause: 1000,
            block_interval: 1000,
            block_interval_max: 3000,
            block_width: 80,
            block_width_max: 160,
          },
          right: {
            width: 28,
            width_max:43,
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
            'interval': 2500,
            'interval_max': 5000,
            'objects' : {
              'beachtrooper': { percentage: 50 },
              'bomb': { percentage: 50 },
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
    };

    let config = extend(defaults, params);

    this.Container_constructor();
    this.init(config);
  }

  var prototype = createjs.extend(Flhoston1, window.Spot);

  SPOTS.Flhoston1 = Flhoston1;
  LEVELS.push(Flhoston1);

}());