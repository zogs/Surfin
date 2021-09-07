
(function() {

    function Arachfly(config = {}) {

      config.name = 'arachfly';
      config.img = 'arachfly';
      config.meter_height = 1;
      config.pixel_height = 150*rY;
      config.speedX = 15;
      config.amplitude = Math.random()*8;
      config.ymin = -config.wave.params.height;
      config.ymax = 1;
      config.hp = 0;
      config.y = -config.wave.params.height / 2;

      this.FlyObstacle_constructor(config);

      this.shotables = this.bonuses;
    }

    Arachfly.prototype = Object.create(FlyObstacle.prototype);
    Arachfly.prototype.constructor = Arachfly;
    window.Arachfly = createjs.promote(Arachfly, "FlyObstacle");

    Arachfly.prototype.drawImage = function() {
      var sheet = new createjs.SpriteSheet({
          images: [QUEUE.getResult(this.img)],
          frames: {width:parseInt(512*rX), height:parseInt(512*rY), regX:parseInt(256*rX), regY:parseInt(256*rY)},
          framerate: 60,
          animations: {
              fly: {
                frames: [0,1,2,3,4,5,4,3,2,1],
                next: 'fly',
              },
              die: {
                frames: [6,7,8],
                next: false,
                speed: 0.2
              },
          }
      });

      this.sprite = new createjs.Sprite(sheet);
      this.sprite.scale = 0.4;
      this.sprite.y = 0;
      this.sprite.gotoAndPlay('fly');
      this.image_cont.addChild(this.sprite);

    }

    Arachfly.prototype.drawBonus = function() {
      var bonus = new createjs.Shape();
        bonus.graphics.beginFill('green').drawCircle(0,0,80*rX*this.actualScale);
        bonus.alpha = 0.5;
        bonus.x = 0;
        bonus.y = 0;
        this.debug_cont.addChild(bonus);
        this.bonuses.push(bonus);
    }

    Arachfly.prototype.drawMalus = function() {

      var malus = new createjs.Shape();
        malus.graphics.beginFill('red').drawCircle(0,0,100*rX*this.actualScale);
        malus.x = 0;
        malus.y = 0;
        malus.alpha = 0.5;
        this.debug_cont.addChild(malus);
        this.maluses.push(malus);
    }

    Arachfly.prototype.drawExtra = function() {

      var range = new createjs.Shape();
      range.graphics.beginStroke('#AAA').setStrokeStyle(5).drawCircle(0,0,this.config.attackRange*rX);
      range.alpha = 0.2;
      this.debug_cont.addChild(range);
    }

    Arachfly.prototype.malusHitted = function() {
      this.active = false;
    }

    Arachfly.prototype.die = function() {
      this.active = false;
      this.sprite.stop();
      this.sprite.gotoAndPlay('die');
      this.sprite.on('animationend', (ev) => {
        if(ev.name === 'die') {
          createjs.Tween.get(this.sprite).to({alpha:0, y:-10}, 250).call(() => {
            this.selfRemove();
          });
        }
      });
    }

}());