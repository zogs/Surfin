(function() {

    function Guldo(config = {}) {

      config.name = 'guldo';
      config.img = 'sprite_guldo';
      config.meter_height = 1;
      config.pixel_height = 120*rY;
      config.distance_trigger = STAGEWIDTH/3;
      config.speedX = 20;

      this.Obstacle_constructor(config);

    }
    Guldo.prototype = Object.create(Obstacle.prototype);
    Guldo.prototype.constructor = Guldo;
    window.Guldo = createjs.promote(Guldo, "Obstacle");

    Guldo.prototype.drawImage = function() {

      var sheet = new createjs.SpriteSheet({
          images: [QUEUE.getResult(this.config.img)],
          frames: {width:parseInt(160*rX), height:parseInt(160*rY), regX: parseInt(80*rX), regY: parseInt(80*rY)},
          framerate: 6,
          animations: {
            normal: 0,
            fly: 1,
            wait: 12,
            ready: 9,
            attack: { frames: [3,4,5,6,7,6,7,6,7] },
            dance: [8, 12, false],
            hurt: [13,14, false]
          }
      });

      this.sprite = new createjs.Sprite(sheet);
      this.sprite.scale = this.actualScale;
      this.sprite.scaleX *= this.actualDirection;
      this.image_cont.addChild(this.sprite);

      this.status = 'fly',
      this.sprite.gotoAndStop('fly');
    }

    Guldo.prototype.drawBonus = function() {

      var bonus = new createjs.Shape();
        bonus.graphics.beginFill('green').drawCircle(0,0,50*rX*this.actualScale);
        bonus.hitzone = 'body';
        bonus.alpha = 0.5;
        this.debug_cont.addChild(bonus);
        this.bonuses.push(bonus);
    }

    Guldo.prototype.removeBonus = function() {

      this.debug_cont.removeAllChildren();
      this.bonuses = [];
    }

    Guldo.prototype.drawMalus = function() {

      /* */
    }

    Guldo.prototype.drawAttackMalus = function() {

      var malus = new createjs.Shape();
        malus.graphics.beginFill('red').drawCircle(0,0,50*rX*this.actualScale);
        malus.hitzone = 'body';
        malus.alpha = 0.5;
        this.debug_cont.addChild(malus);
        this.maluses.push(malus);
    }

    Guldo.prototype.removeMalus = function() {

      this.debug_cont.removeAllChildren();
      this.maluses = [];
    }

    Guldo.prototype.bonusHitted = function() {

      this.die();
    }

    Guldo.prototype.malusHitted = function() {

    }

    Guldo.prototype.onEnterFrame = function() {

      var distance = get2dDistance(this.x,this.y,this.wave.surfer.x,this.wave.surfer.y);
      if(distance < this.config.distance_trigger) {
        if(this.status == 'fly') {
          this.sprite.gotoAndPlay('wait');
          this.status = 'wait';
          setTimeout(proxy(this.attack, this), 500);
        }
        return;
      }
    }

    Guldo.prototype.attack = function() {

      this.sprite.gotoAndPlay('attack');
      this.status = 'attack';
      this.sprite.on('animationend', proxy(this.attackEnded, this));

      this.removeBonus();
      this.drawAttackMalus();
    }

    Guldo.prototype.attackEnded = function() {

      this.sprite.gotoAndStop('ready');
      this.status = 'ready';

      this.removeMalus();
      this.drawBonus();
    }

    Guldo.prototype.die = function() {

      this.active = false;
      this.status = 'dead';
      this.sprite.gotoAndPlay('hurt');
      createjs.Tween.get(this).to({alpha:0}, 400).call(() => this.selfRemove());
    }

}());
