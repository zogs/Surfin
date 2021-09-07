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
        { type: 'catch', current:0, count:10, aim: 'star', name: 'Collecter 10 étoiles ({n})' },
      ],
      player: {

      },
      paddlers: {
        nb: 0,
        xmin: 200,
        xmax: 1300,
        ymin: 400,
        ymax: 520,
        skills: {}
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
          unroll: {
            width: 20,
            width_max: 22,
            width_interval: 2000,
            width_pause: 1000,
            block_interval: 0,
            block_interval_max: 0,
            block_width: 0,
            block_width_max: 0,
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
            'interval': 800,
            'interval_max': 800,
            'objects' : {
              'star' : { percentage: 100}
              //'beachtrooper': { percentage: 50 },
              //'paddletrooper': { percentage: 10 },
              //'bomb': { percentage: 40 },
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
    };

    let config = extend(defaults, params);

    this.Container_constructor();
    this.init(config);
  }

  var prototype = createjs.extend(Flhoston1, window.Spot);

  SPOTS.Flhoston1 = Flhoston1;
  LEVELS.push(Flhoston1);

}());