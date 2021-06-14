(function() {

    function Jeese(config = {}) {

      config.name = 'jeese';
      config.img = 'sprite_jeese';
      config.meter_height = 1.8;
      config.pixel_height = 60*rY;
      config.ymin = 150;
      config.ymax = config.wave.params.height*1.5;

      this.balls = [];

      this.FlyObstacle_constructor(config);

    }
    Jeese.prototype = Object.create(FlyObstacle.prototype);
    Jeese.prototype.constructor = Jeese;
    window.Jeese = createjs.promote(Jeese, "FlyObstacle");

    Jeese.prototype.drawImage = function() {

      var sheet = new createjs.SpriteSheet({
          images: [QUEUE.getResult(this.config.img)],
          frames: {width:parseInt(82*rX), height:parseInt(82*rY), regX: parseInt(41*rX), regY: parseInt(41*rY)},
          framerate: 12,
          animations: {
            wait: [0],
            ready: [1],
            fire: [2, 5, false],
          }
      });

      this.sprite = new createjs.Sprite(sheet);
      this.sprite.scale = this.actualScale;
      this.sprite.scaleX *= -this.actualDirection;
      this.image_cont.addChild(this.sprite);

      this.status = 'wait',
      this.sprite.gotoAndStop('wait');

    }

    Jeese.prototype.drawBonus = function() {

      var bonus = new createjs.Shape();
        bonus.graphics.beginFill('green').drawCircle(0,0,20*rX*this.actualScale);
        bonus.hitzone = 'body';
        bonus.alpha = 0.5;
        this.debug_cont.addChild(bonus);
        this.bonuses.push(bonus);
    }

    Jeese.prototype.drawMalus = function() {

      /* no malus */
    }

    Jeese.prototype.bonusHitted = function() {

      this.die();
    }

    Jeese.prototype.malusHitted = function(surfer, malus) {

    }

    Jeese.prototype.fire = function() {

      this.sprite.gotoAndPlay('fire');
      this.status = 'fire';

      this.sprite.on('animationend', (ev) => {
        if(ev.name == 'fire') {
          let ball = new createjs.Shape();
          ball.graphics.beginFill('yellow').drawCircle(0,0,20);
          ball.scaleY = 0.5;
          ball.alpha = 0.5;
          ball.hitzone = 'body';
          ball.hitradius = 10;
          ball.dirAngle = calculAngle(this.x, this.y, this.wave.surfer.x + this.wave.surfer.config.pixel_height * -this.wave.direction , this.wave.surfer.y);
          ball.rotation = ball.dirAngle;
          ball.dirSpeed = 15;
          this.addChild(ball);
          this.balls.push(ball);
          this.maluses.push(ball);


        }
      });

    }

    Jeese.prototype.onEnterFrame = function() {

      this.triggerEvents();
      this.moveFireballs();
    }

    Jeese.prototype.triggerEvents = function() {

      var distance = get2dDistance(this.x,this.y,this.wave.surfer.x,this.wave.surfer.y);
      if(distance < STAGEWIDTH*rX) {
        if(this.status == 'wait') {
          this.sprite.gotoAndPlay('ready');
          this.status = 'ready';
          setTimeout(proxy(this.fire, this), 1000);
        }
        return;
      }
    }

    Jeese.prototype.moveFireballs = function() {

      this.balls.map(b => {

        let x = Math.cos(Math.radians(b.dirAngle));
        let y = Math.sin(Math.radians(b.dirAngle));

        x *= b.dirSpeed;
        y *= b.dirSpeed;

        b.x += x;
        b.y += y;

        if(b.y > STAGEHEIGHT) {
          this.removeChild(b);
          this.balls.splice(this.balls.indexOf(b),1);
        }
      });
    }

    Jeese.prototype.die = function() {

      this.status = 'dead';
      createjs.Tween.get(this).to({alpha:0}, 500).call(() => this.selfRemove());
    }

}());
