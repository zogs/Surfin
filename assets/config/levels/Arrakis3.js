(function() {

  function Arrakis3(params) {

    let defaults = {
      id: 'Arrakis3',
      name: 'Arrakis 3',
      planet: 'arrakis',
      story: [
      ],
      init: {
        type: 'waiting',
      },
      series: {
        length :  3,
        speed : 20000,
        frequency : 5000,
        interval : 10000,
        spread : 0,
        xshift: 0,
      },
      timelimit: null,
      goals: [
        { type: 'catch', current:0, aim: 'spice', count: 1, name: "Attraper {c} fioles de mélange !  ({n})" },
        { type: 'tube', current:0, aim: 'tube', count: 10, name: 'Faire un tube de {c}s ou +  ({n}s)' },
        { type: 'timed', current:0, aim: 'time', count: 30, name: 'Terminer en {c} secondes  ({n}s)' },
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
        height : 275,
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
            width_max: 25,
            width_interval: 0,
            width_pause: 0,
            block_interval: 600,
            block_interval_max: 1000,
            block_width: 40,
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
        obstacles: [
              {name:'spice', tmin:3000, tmax:0, interval:3000, intervalMax:7000, y:-100 },
              {name:'beachtrooper', tmin:0, tmax:0, interval:1000, intervalMax:2000 },
              {name:'paddletrooper', tmin:0, tmax:0, interval:1000, intervalMax:2000, y: 200 },
              {name: 'break', tmin:1000, tmax:0, interval:6000, intervalMax:12000, width:100, widthMax: 180, dist: 200, distMax:300 },
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

  var prototype = createjs.extend(Arrakis3, window.Spot);

  SPOTS.Arrakis3 = Arrakis3;
  LEVELS.push(Arrakis3);

}());