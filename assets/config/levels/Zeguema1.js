(function() {

  function Zeguema1(params) {

    let defaults = {
      id: 'Zeguema1',
      name: 'Zeguema 1',
      planet: 'zeguema',
      init: {
        type: 'waiting',
      },
      series: {
        length :  3,
        speed : 20000,
        frequency : 10000,
        interval : 8000,
        spread : 0,
        xshift: 0,
      },
      timelimit: null,
      goals: [
        { type: 'score', current:0, aim: 2000, name: 'Faire un score de 2000 points' },
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
        height : 280,
        width : 0,
        real_height: 3,
        breaking: {
          width: 180,
          y_speed: 1200,
          y_ease: 'quartIn',
          splash_h_percent: 100,
          splash_h_ease: 0.4,
          unroll: {
            width: 20,
            width_max: 30,
            width_interval: 0,
            width_pause: 0,
            block_interval: 1500,
            block_interval_max: 3500,
            block_width: 80,
            block_width_max: 350,
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
          'arachnid' : {percentage: 50},
          'arachfly' : {percentage: 50},
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

  var prototype = createjs.extend(Zeguema1, window.Spot);

  SPOTS.Zeguema1 = Zeguema1;
  LEVELS.push(Zeguema1);

}());