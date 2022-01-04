(function() {

  function Flhoston2_0(params) {

    let defaults = {
      id: 'Flhoston2_0',
      name: 'Flhoston entracte',
      planet: 'flhoston',
      story: [
          { lines: ["Hey ceci est un entracte !"] },
          { lines: ["Aller au niveau suivant :"],
            buttons: [{name: "Niveau suivant", action: "gotoNextLevel" }],
          },
      ],
      series: {
        length :  3,
        speed : 20000,
        frequency : 5000,
        interval : 28000,
        spread : 0,
        xshift: 0,
      },
      timelimit: null,
      goals: false,
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
            block_interval: 0,
            block_interval_max: 0,
            block_width: 100,
            block_width_max: 200,
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
        obstacles: [],
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

  var prototype = createjs.extend(Flhoston2_0, window.Spot);

  prototype.initSpot = function() {

    this.initWaving();
  }

  SPOTS.Flhoston2_0 = Flhoston2_0;
  LEVELS.push(Flhoston2_0);

}());