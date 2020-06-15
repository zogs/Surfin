(function() {

    function Hadoken(conf = {}) {

      let defaults = {
        name: 'hadoken',
        speed: 30,
        direction: -1,
        range: 200,
        faderate: 0,
        scale: 1,
        surfer: null,
        ball_container: this,
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
      this.shockwave.scale = 1.5;
      this.addChild(this.shockwave);

      this.scale = this.conf.scale;

      this.ticker = this.on('tick', this.tick, this);

    }

    Hadoken.prototype.tick = function() {

      this.fireballs.map(f => {

        if(f.impacted === false) {
          f.x += f.dX;
          f.y += f.dY;
          f.dtravelled += f.dX;
        }


        this.fadeAway(f)
        this.removeFaded(f)
        this.removeOffscreen(f)

        this.debugging(f);
      });
    }

    Hadoken.prototype.selfRemove = function() {
      this.removeAllChildren();
      this.off('tick', this.ticker);
    }

    Hadoken.prototype.debugging = function(f) {
      if(window.DEBUG) f.debug(true)
      else f.debug(false)
    }

    Hadoken.prototype.fadeAway = function(f) {
      if(Math.sqrt(Math.pow(f.dtravelled,2)) > this.conf.range) {
        f.alpha += - this.conf.faderate;
      }
    }

    Hadoken.prototype.removeFaded = function(f) {
      if(f.alpha <= 0) {
        this.removeFireball(f);
      }
    }

    Hadoken.prototype.removeOffscreen = function(f) {
      let c = f.localToGlobal(0,0);
      if(c.x < 0 || c.x > window.STAGEWIDTH || c.y > window.STAGEHEIGHT || c.y < 0) {
        this.removeFireball(f);
      }
    }

    Hadoken.prototype.removeFireball = function(f) {
      this.fireballs.splice(this.fireballs.indexOf(f),1);
      this.conf.ball_container.removeChild(f);
    }

    Hadoken.prototype.fire = function(direction) {

      this.scaleX = direction*-1;
      this.x = (direction === 1) ? -50 : 50;
      this.shockwave.gotoAndPlay('run');
      let fireball = new Fireball({
        direction: direction*-1,
        emitter: this,
      });
      let container = this.conf.ball_container;
      let coord = this.localToLocal(0, 0, container);
      fireball.x = coord.x;
      fireball.y = coord.y;
      fireball.dX = this.conf.speed*Math.cos(this.conf.surfer.angle_rad);
      fireball.dY = this.conf.speed*Math.sin(this.conf.surfer.angle_rad);
      fireball.rotation = this.conf.surfer.getAngle() + 180;

      container.addChild(fireball);
      this.fireballs.push(fireball);

    }

    //assign  to window's scope & promote
    window.Hadoken = createjs.promote(Hadoken, "Container");
}());

(function() {

    function Fireball(conf = {}) {

      let defaults = {
        name: 'fireball',
        emitter: null,
        direction: -1,
        alpha: 0.6,
        scale:1,
        radius: 22,
      }
      this.conf = Object.assign({}, defaults, conf);
      this.Container_constructor();
      this.init();
      this.alpha = this.conf.alpha;
      this.scaleX = this.conf.direction;
      this.dX = 0;
      this.dY = 0;
      this.dtravelled = 0;
      this.impacted = false;

    }

    Fireball.prototype = createjs.extend(Fireball, createjs.Container);

    Fireball.prototype.init = function(conf) {

      var sheet = new createjs.SpriteSheet({
          images: [queue.getResult('waterball')],
          frames: {width:parseInt(64*rX), height:parseInt(64*rY), regX: parseInt(32*rX), regY: parseInt(32*rY)},
          framerate: 20,
          animations: {
            run: [0, 3, 'run', 3],
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
            explode: [0, 3, false],
          }
      });
      this.sprinkle = new createjs.Sprite(sheet);
      this.sprinkle.scaleX = -1;
      this.sprinkle.scale = 1.7;
      this.sprinkle.x = -50;
      this.sprinkle.alpha = 0;
      this.addChild(this.sprinkle);

      this.hitzone = new createjs.Shape();
      this.hitzone.graphics.beginFill('green').drawCircle(0,0, this.conf.radius);
      this.hitzone.alpha = 0;
      this.addChild(this.hitzone);

    }

    Fireball.prototype.impact = function() {
      this.impacted = true;
      this.ball.stop();
      this.ball.alpha = 0;
      this.sprinkle.alpha = 1;
      this.sprinkle.stop();
      this.sprinkle.gotoAndPlay('explode');
      this.sprinkle.on('animationend', (e) => {
        this.selfRemove();
      })
    }

    Fireball.prototype.destroy = function() {
      this.selfRemove();
    }

    Fireball.prototype.selfRemove = function() {
      this.conf.emitter.removeFireball(this);
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

