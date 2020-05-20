(function() {

  function Terre0(params) {

    let defaults = {
      id: 'Terre0',
      name: 'Terre',
      planet: 'terre',
      story: [
      ],
      series: {
        length :  2,
        speed : 40000,
        frequency : 8000,
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
        height : 160,
        width : 0,
        real_height: 3,
        breaking: {
          width: 180,
          y_speed: 1200,
          y_ease: 'quartIn',
          splash_h_percent: 100,
          splash_h_ease: 0.4,
          left: {
            width: 20,
            width_max: 30,
            width_interval: 0,
            width_pause: 0,
            block_interval: 0,
            block_interval_max: 0,
            block_width: 100,
            block_width_max: 200,
          },
          right: {
            width: 20,
            width_max: 0,
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
    }
    let config = extend(defaults, params);

    this.Container_constructor();
    this.init(config);
  }

  var prototype = createjs.extend(Terre0, window.Spot);

  prototype.initSpot = function() {

    this.initWaving();

    let cargo = new createjs.Bitmap(queue.getResult('terre_cargo'));
    cargo.x = 1050;
    cargo.y = 210;
    this.addChild(cargo);
    createjs.Tween.get(cargo).to({x: -100}, 500000);

    let astrovan = new createjs.Bitmap(queue.getResult('terre_astrovan'));
    astrovan.x = 520;
    astrovan.y = 460;
    this.addChild(astrovan);

  }

  SPOTS.Terre0 = Terre0;
  LEVELS.push(Terre0);

}());