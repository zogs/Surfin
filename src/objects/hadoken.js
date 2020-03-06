(function() {

    function Hadoken(conf = {}) {

      let defaults = {
        name: 'hadoken',
        speed: 15,
        direction: -1,
        range: 200,
        faderate: 0.05,
        scale: 1.5,
      }
      this.conf = Object.assign({}, defaults, conf);
      this.Container_constructor();
      this.fireballs = [];
      this.init();

    }

    Hadoken.prototype = createjs.extend(Hadoken, createjs.Container);
    createjs.EventDispatcher.initialize(Hadoken.prototype);

    Hadoken.prototype.init = function(conf) {

      var sheet = new createjs.SpriteSheet({
          images: [queue.getResult('shockwave')],
          frames: {width:parseInt(128*rX), height:parseInt(128*rY), regX: parseInt(64*rX), regY: parseInt(64*rY)},
          framerate: 20,
          animations: {
            stand: [0],
            run: [1, 5, 'stand'],
          }
      });
      this.shockwave = new createjs.Sprite(sheet);
      this.addChild(this.shockwave);

      this.scale = this.conf.scale;

      this.addEventListener('tick',proxy(this.tick,this));

    }

    Hadoken.prototype.tick = function() {

      this.fireballs.map(f => {
        // add speed to fireball
        let speed = this.conf.speed * f.conf.direction;
        f.x += speed;
        f.dx += speed;

        // test range
        if(Math.sqrt(Math.pow(f.dx,2)) > this.conf.range) {
          f.alpha += - this.conf.faderate;
        }
        if(f.alpha <= 0) {
          this.removeFireball(f);
        }

        // show debug
        if(window.DEBUG) f.debug(true);
        else f.debug(false);

        // remove when offscreen
        let c = f.localToGlobal(0,0);
        if(c.x < - window.STAGEWIDTH/2 || c.x > window.STAGEWIDTH*1.5) {
          this.removeFireball(f);
        }
      });
    }

    Hadoken.prototype.removeFireball = function(f) {
      this.fireballs.splice(this.fireballs.indexOf(f),1);
    }

    Hadoken.prototype.fire = function(direction) {

      this.scaleX = direction*-1;
      this.x = (direction === 1) ? -50 : 50;
      this.shockwave.gotoAndPlay('run');

      let fireball = new Fireball({
        direction: direction,
      });
      this.addChild(fireball);
      this.fireballs.push(fireball);

    }

    //assign  to window's scope & promote
    window.Hadoken = createjs.promote(Hadoken, "Container");
}());

(function() {

    function Fireball(conf = {}) {

      let defaults = {
        name: 'fireball',
        direction: -1,
        alpha: 0.6,
        scale:1.5,
      }
      this.conf = Object.assign({}, defaults, conf);
      this.Container_constructor();
      this.init();
      this.alpha = this.conf.alpha;
      this.scaleY = this.conf.scale;
      this.scaleX = this.conf.scale * this.conf.direction;
      this.dx = 0;

    }

    Fireball.prototype = createjs.extend(Fireball, createjs.Container);

    Fireball.prototype.init = function(conf) {

      var sheet = new createjs.SpriteSheet({
          images: [queue.getResult('waterball')],
          frames: {width:parseInt(64*rX), height:parseInt(64*rY), regX: parseInt(32*rX), regY: parseInt(32*rY)},
          framerate: 20,
          animations: {
            run: [0, 3, false, 3],
          }
      });
      this.ball = new createjs.Sprite(sheet);
      this.ball.gotoAndPlay('run');
      this.addChild(this.ball);

      var sheet = new createjs.SpriteSheet({
          images: [queue.getResult('waterballsprinkle')],
          frames: {width:parseInt(64*rX), height:parseInt(64*rY), regX: parseInt(32*rX), regY: parseInt(32*rY)},
          framerate: 20,
          animations: {
            run: [0, 3, 'run'],
          }
      });
      this.sprinkle = new createjs.Sprite(sheet);
      this.sprinkle.regX = 30;
      this.sprinkle.gotoAndPlay('run');
      this.addChild(this.sprinkle);

      this.hitzone = new createjs.Shape();
      this.hitzone.graphics.beginFill('green').drawCircle(0,0,22);
      this.hitzone.alpha = 0;
      this.addChild(this.hitzone);

    }

    Fireball.prototype.debug = function(val) {
      if(val) {
        this.hitzone.alpha = 0.5;
      } else {
        this.hitzone.alpha = 0;
      }
    }


  //assign  to window's scope & promote
  window.Fireball = createjs.promote(Fireball, "Container");
}());

