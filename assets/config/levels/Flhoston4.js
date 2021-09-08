(function() {

  function Flhoston4(params) {

    let defaults = {
      id: 'Flhoston4',
      name: 'Flhoston 4',
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
        { type: 'catch', current:0, aim: 'star', count: 20, name: "Collecter 30 étoiles ({n})" },
        { type: 'catch', current:0, aim: 'beachtrooper', count: 6, name: "Faire tomber 6 touristes ({n})" },
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
            block_interval: 2000,
            block_interval_max: 4000,
            block_width: 60,
            block_width_max: 100,
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
          'starline': { tmin:5000, tmax:0, interval:5000, intervalMax:10000 },
          'star': { tmin:0, tmax:0, interval:3000, intervalMax:3500 },
          'bomb': { tmin:0, tmax:0, interval:2000, intervalMax:4000 },
          'beachtrooper': { tmin:10000, tmax:0, interval:2000, intervalMax:4000, y:220},
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

  var prototype = createjs.extend(Flhoston4, window.Spot);

  SPOTS.Flhoston4 = Flhoston4;
  LEVELS.push(Flhoston4);

}());