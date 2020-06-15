
(function() {

    function Stingbat(config = {}) {

      config.name = 'stingbat';
      config.img = 'stingbat';
      config.meter_height = 0.5;
      config.pixel_height = 300*rY;
      config.speedX = 15;
      config.amplitude = 0 //Math.random()*8;
      config.ymin = -config.wave.params.height;
      config.ymax = 1;
      config.hp = 0;
      config.y = config.wave.params.height / 2;

      this.FlyObstacle_constructor(config);

      this.shotable = this.bonuses;
      this.flapping = null;

    }

    Stingbat.prototype = Object.create(FlyObstacle.prototype);
    Stingbat.prototype.constructor = Stingbat;
    window.Stingbat = createjs.promote(Stingbat, "FlyObstacle");

    Stingbat.prototype.drawImage = function() {
      var sheet = new createjs.SpriteSheet({
          images: [queue.getResult(this.img)],
          frames: {width:parseInt(250*rX), height:parseInt(300*rY), regX:parseInt(125*rX), regY:parseInt(155*rY)},
          framerate: 20,
          animations: {
              fly: {
                frames: [0,1,2,3,4,3,2,1],
                next: false,
              },
              die: {
                frames: [5,6,7],
                next: false,
                speed: 0.5,
              },
          }
      });

      this.sprite = new createjs.Sprite(sheet);
      this.sprite.scale = 0.6;
      this.sprite.gotoAndStop(0);
      this.sprite.scaleX *= this.direction;
      this.image_cont.addChild(this.sprite);

      this.flapping = setInterval(proxy(this.flapWings, this), 1000);
    }

    Stingbat.prototype.flapWings = function() {
      if(this.active) {
        this.sprite.stop();
        this.sprite.gotoAndPlay('fly');
      }
    }

    Stingbat.prototype.drawBonus = function() {
      var bonus = new createjs.Shape();
        bonus.graphics.beginFill('green').drawCircle(0,0,200*rX*this.actualScale);
        bonus.alpha = 0.5;
        bonus.x = 20;
        bonus.y = -0;
        this.debug_cont.addChild(bonus);
        this.bonuses.push(bonus);
    }

    Stingbat.prototype.drawMalus = function() {

      var malus = new createjs.Shape();
        malus.graphics.beginFill('red').drawCircle(0,0,100*rX*this.actualScale);
        malus.y = 0;
        malus.x = 50;
        malus.alpha = 0.5;
        this.debug_cont.addChild(malus);
        this.maluses.push(malus);
    }

    Stingbat.prototype.malusHitted = function() {
      this.active = false;
    }

    Stingbat.prototype.die = function() {
      this.active = false;
      this.sprite.stop();
      this.sprite.gotoAndPlay('die');
      this.sprite.on('animationend', (ev) => {
        if(ev.name === 'die') {
          console.log('stingbat die')
          createjs.Tween.get(this.sprite).to({alpha:0, y:-10}, 250).call(() => {
            this.selfRemove();
          });
        }
      });
    }

    Stingbat.prototype.removeSelfListeners = function() {
      this.off('tick', this.tickering);
      clearInterval(this.flapping);
  }

}());