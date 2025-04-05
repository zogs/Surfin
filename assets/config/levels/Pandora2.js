(function() {

  function Pandora2(params) {

    let defaults = {
      id: 'Pandora2',
      name: 'Pandora 2',
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
        { type: 'tube', current:0, aim:null, count: 5, name: 'Faire un tube de {c}s ou +  ({n})' },
        { type: 'catch', current:0, aim: 'star', count: 10, name: 'Collecter {c} étoiles  ({n})' },
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
          width: 180,
          y_speed: 1000,
          y_ease: "quartIn",
          splash_h_percent: 100,
          splash_h_ease: 0.4,
          unroll: {
            width: 20,
            width_max: 24,
            width_interval: 0,
            width_pause: 0,
            block_interval: 0,
            block_interval_max: 2000,
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
        obstacles: [
              {name:'StingbatLine', tmin:0, tmax:0, interval:3000, intervalMax:3000 },
              {name:'star', tmin:0, tmax:0, interval:2000, intervalMax:2500 },
        ],
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

  var prototype = createjs.extend(Pandora2, window.Spot);

  SPOTS.Pandora2 = Pandora2;
  LEVELS.push(Pandora2);

}());