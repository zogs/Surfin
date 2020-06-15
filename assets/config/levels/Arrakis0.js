(function() {

  function Arrakis0(params) {

    let defaults = {
      id: 'Arrakis0',
      name: 'arrakis-intro',
      planet: 'arrakis',
      story: [
          { lines: ["Vous arrivez sur la planète Flhoston Paradize,","destination paradiziaque des habitants fortunés de la galaxie."] },
          { lines: ["Les spots sont nombreux et vous garez l'astrovan près de l'un deux,","à l'écart du flot de touriste.", "Il est temps de se mettre à l'eau !"],
            buttons: [{name: "Allez à l'eau", action: "continueStory" }],
          },
      ],
      series: {
        length :  1,
        speed : 20000,
        frequency : 5000,
        interval : 10000,
        spread : 0,
        xshift: 0,
      },
      timelimit: null,
      goals: false,
      surfers: {
        max: 0,
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
        height : 260,
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
        obstacles: {
          'float': {
            'interval': 5000,
            'interval_max': 10000,
            'objects' : {
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

  var prototype = createjs.extend(Arrakis0, window.Spot);

  prototype.initSpot = function() {

    this.initWaving();
  }

  SPOTS.Arrakis0 = Arrakis0;
  LEVELS.push(Arrakis0);

}());