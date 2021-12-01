(function() {

  function Flhoston5(params) {

    let defaults = {
      id: 'Flhoston5',
      name: 'Flhoston 5',
      planet: 'flhoston',
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
        { type: 'timed', current:0, aim: 40, name: 'Survivre !!! ({n}s)' },
      ],
      player: {

      },
      surfers: {
        velocities: {
          x: 2,
          y: 1,
        }
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
          width: 200,
          y_speed: 1000,
          y_ease: 'quartIn',
          splash_h_percent: 100,
          splash_h_ease: 0.4,
          unroll: {
            width: 20,
            width_max: 25,
            width_interval: 1000,
            width_pause: 1000,
            block_interval: 1000,
            block_interval_max: 2000,
            block_width: 30,
            block_width_max: 60,
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
              'bomb': { tmin:0, tmax:0, interval:2000, intervalMax:4000 },
              'bombTriplet': { tmin:2000, tmax:0, interval:1000, intervalMax:3000 },
              'break': { tmin:4000, tmax:0, interval:6000, intervalMax:12000, width:100, widthMax: 180, dist: 200, distMax:300 },
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

  var prototype = createjs.extend(Flhoston5, window.Spot);

  SPOTS.Flhoston5 = Flhoston5;
  LEVELS.push(Flhoston5);

}());