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
      player: false,
      paddlers: {
        nb: 50,
        xmin: 200,
        xmax: 1300,
        ymin: 400,
        ymax: 560,
        skills: {}
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

  var prototype = createjs.extend(Terre0, window.Spot);

  prototype.initSpot = function() {

    this.initWaving();

    let cargo = new createjs.Bitmap(QUEUE.getResult('terre_cargo'));
    cargo.x = 1050;
    cargo.y = 240;
    this.addChild(cargo);
    createjs.Tween.get(cargo).to({x: -100}, 500000);

    let astrovan = new createjs.Bitmap(QUEUE.getResult('terre_astrovan'));
    astrovan.x = 520;
    astrovan.y = 460;
    this.addChild(astrovan);

    let h = 50;
    let w = 45;
    let y = 4;
    let btn = new createjs.Shape();
    btn.graphics
      .setStrokeStyle(10,"round").beginStroke("rgba(0,0,0,0.4)")
      .moveTo(0,y).lineTo(w, y)
      .moveTo(0,h*1/3+y).lineTo(w, h*1/3+y)
      .moveTo(0,h*2/3+y).lineTo(w, h*2/3+y)
      .setStrokeStyle(10,"round").beginStroke("#FFF")
      .moveTo(0,0).lineTo(w, 0)
      .moveTo(0,h*1/3).lineTo(w, h*1/3)
      .moveTo(0,h*2/3).lineTo(w, h*2/3)
      .setStrokeStyle(0).beginStroke(0).beginFill('rgba(255,255,255,0.2)').drawCircle(w/2,h/3,w*0.9)
      ;
    btn.x = STAGEWIDTH - w*1.8;
    btn.y = h;
    btn.cursor = 'pointer';
    btn.on('click', this.clickMenuButton, this);
    this.addChild(btn);

  }

   prototype.clickMenuButton = function(e) {
    e.stopImmediatePropagation();
    MENU.open();
  }

  SPOTS.Terre0 = Terre0;
  LEVELS.push(Terre0);

}());