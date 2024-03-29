(function() {

    function Reacum(config = {}) {

      config.name = 'reacum';
      config.img = 'sprite_reacum';
      config.meter_height = 2;
      config.pixel_height = 120*rY;

      this.FlyObstacle_constructor(config);

    }
    Reacum.prototype = Object.create(FlyObstacle.prototype);
    Reacum.prototype.constructor = Reacum;
    window.Reacum = createjs.promote(Reacum, "FlyObstacle");

    Reacum.prototype.drawImage = function() {

      var sheet = new createjs.SpriteSheet({
          images: [QUEUE.getResult(this.config.img)],
          frames: {width:parseInt(160*rX), height:parseInt(160*rY), regX: parseInt(80*rX), regY: parseInt(80*rY)},
          framerate: 6,
          animations: {
            fly: 0,
            attack: 1,
          }
      });

      this.sprite = new createjs.Sprite(sheet);
      this.sprite.scale = this.actualScale;
      this.sprite.scaleX *= this.actualDirection;
      this.sprite.rotation = -20 * this.actualDirection;
      this.image_cont.addChild(this.sprite);

      this.status = 'fly',
      this.sprite.gotoAndStop('fly');
    }

    Reacum.prototype.drawBonus = function() {

     /* */
    }

    Reacum.prototype.drawMalus = function() {

      /* */
    }

    Reacum.prototype.drawAttackMalus = function() {

      var malus = new createjs.Shape();
        malus.graphics.beginFill('red').drawCircle(0,0,60*rX*this.actualScale);
        malus.hitzone = 'body';
        malus.alpha = 0.5;
        this.debug_cont.addChild(malus);
        this.maluses.push(malus);
    }

    Reacum.prototype.removeMalus = function() {

      this.debug_cont.removeAllChildren();
      this.maluses = [];
    }

    Reacum.prototype.bonusHitted = function() {

      this.sprite.gotoAndPlay('hurt');
      createjs.Tween.get(this).to({alpha:0}, 400);
    }

    Reacum.prototype.malusHitted = function() {

    }

    Reacum.prototype.onEnterFrame = function() {

      var distance = get2dDistance(this.x,this.y,this.wave.surfer.x,this.wave.surfer.y);
      if(this.status == 'fly') {
        if(distance < STAGEWIDTH/2) {
          this.attack();
        }
      }
    }

    Reacum.prototype.attack = function() {

      this.sprite.gotoAndPlay('attack');
      this.sprite.rotation = 0;
      this.status = 'attack';

      this.drawAttackMalus();

      let angle = calculAngle(this.x, this.y, this.wave.surfer.x, this.wave.surfer.y);
      let speed = 25;
      this.speedX = speed * Math.cos(Math.radians(angle));
      this.speedY = speed * Math.sin(Math.radians(angle));
    }

    Reacum.prototype.die = function() {

      this.status = 'dead';
      createjs.Tween.get(this).to({alpha:0}, 500).call(() => this.selfRemove());
    }


}());
