(function() {

  function Home(params) {

    let defaults = {
      id: 'Home',
      name: 'Home',
      planet: 'home',
      series: {
        length :  3,
        speed : 20000,
        frequency : 5000,
        interval : 8000,
        spread : 0,
        xshift: 0,
      },
      goals: null,
      scores: null,
      player: false,
      paddlers: {
        nb: 0,
        xmin: 200,
        xmax: 1300,
        ymin: 400,
        ymax: 520,
        skills: {}
      },
      waves: {
        height : 150,
        width : 0,
        real_height: 1.2,
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
        colors: [
          ['#04567d',0,0],
          ['#2ea8e3',0,50],
          ['#36aee8',0,100]
        ],
        obstacles: {
          'float': {
            'interval': 0,
            'interval_max': 1000,
            'objects' : {
              'paddler' : {percentage: 30},
              'photographer' : {percentage: 30},
              'bomb': {percentage: 40},
              'trooper': {percentage: 0},
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

  var prototype = createjs.extend(Home, window.Spot);

  prototype.initSpot = function() {

    this.initWaving();
    this.initHomeScreen();
    //this.initScrolling();
  }

  prototype.initScrolling = function() {

    this.y = 200;
    createjs.Tween.get(this).to({y: 0}, 10000, createjs.Ease.quartOut);
  }

  prototype.initHomeScreen = function() {

    //hide score
    this.score_cont.alpha = 0;

    // add doggo
    const dog = new createjs.Sprite(
      new createjs.SpriteSheet({
          images: [queue.getResult('dog')],
          frames: {width:parseInt(64*rX), height:parseInt(64*rY), regX: parseInt(16*rX), regY: parseInt(16*rY)},
          framerate: 10,
          animations: {
            sit: [0,1, 'sit'],
          }
      })
    );
    dog.x = 430*rX;
    dog.y = STAGEHEIGHT - 150*rY;
    dog.scale = 1;
    dog.gotoAndPlay('sit');
    this.extra_cont.addChild(dog);

    // add ptero

    const ptero = new createjs.Sprite(
      new createjs.SpriteSheet({
          images: [queue.getResult('ptero')],
          frames: {width:parseInt(128*rX), height:parseInt(128*rY), regX: parseInt(64*rX), regY: parseInt(64*rY)},
          framerate: 4,
          animations: {
            fly: [0,9, 'fly'],
          }
      })
    );
    let pad = 128;
    ptero.x = -pad * rX;
    ptero.y = 150 * rY;
    ptero.scale = 1;
    ptero.gotoAndPlay('fly');
    this.extra_cont.addChild(ptero);
    createjs.Tween.get(ptero, {loop: true}).to({x: STAGEWIDTH+pad*rX}, 10000).wait(2000).set({scaleX:-1}).to({x:-pad*rX},10000).wait(2000).set({scaleX:1});
    createjs.Tween.get(ptero, {loop: true}).to({y: 200*rY}, 2000).to({y: 150*rY}, 2000);


    // add button
    const sprite = new createjs.Sprite(
      new createjs.SpriteSheet({
          images: [queue.getResult('btn_startgame')],
          frames: {width:parseInt(700*rX), height:parseInt(280*rY), regX: parseInt(350*rX), regY: parseInt(140*rY)},
          framerate: 1,
          animations: {
            out: [0],
            over: [1],
            down: [2],
          }
      })
    );
    const btn = new createjs.ButtonHelper(sprite, "out", "over", "down");
    sprite.x = STAGEWIDTH/2;
    sprite.y = STAGEHEIGHT - 100*rY;
    this.extra_cont.addChild(sprite);
    sprite.addEventListener('click', function(e) {
      e.stopImmediatePropagation();
      SCENE.loadLevel('Terre0');
    });
  }

  SPOTS.Home = Home;
  LEVELS.push(Home);

}());