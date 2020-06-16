(function() {

  function Pandora1(params) {

    let defaults = {
      id: 'Pandora1',
      name: 'Pandora 1',
      planet: 'pandora',
      init: {
        type: 'waiting',
      },
      series: {
        length :  3,
        speed : 20000,
        frequency : 5000,
        interval : 8000,
        spread : 0,
        xshift: 0,
      },
      //timelimit: 30,
      goals: [
        { type: 'score', current:0, aim: 20000, name: 'Faire un score de 20000 points' },
        { type: 'tube', current:0, aim: 5, name: 'Faire un tube de 5s ou + ({n})' },
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
        height : 300,
        width : 0,
        real_height: 3,
        breaking: {
          width: 220,
          y_speed: 1000,
          y_ease: "quartIn",
          splash_h_percent: 100,
          splash_h_ease: 0.4,
          unroll: {
            width: 25,
            width_max: 28,
            width_interval: 0,
            width_pause: 0,
            block_interval: 500,
            block_interval_max: 1000,
            block_width: 50,
            block_width_max: 90,
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
            'interval': 2000,
            'interval_max': 3000,
            'objects' : {
              'Toruk' : {percentage: 90},
              'TorukAttack' : {percentage: 10},
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

  var prototype = createjs.extend(Pandora1, window.Spot);

  SPOTS.Pandora1 = Pandora1;
  LEVELS.push(Pandora1);

}());