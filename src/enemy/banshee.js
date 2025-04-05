
(function() {

    function Banshee(config = {}) {

      config.name = 'banshee';
      config.img = 'banshee';
      config.meter_height = 1;
      config.pixel_height = 150*rY;
      config.speedX = 0;
      config.amplitude = 150
      config.frequence = 0.5;
      config.ymin = -config.wave.params.height*2;
      config.ymax = config.wave.params.height;
      config.ystart = -config.wave.params.height*2;
      config.hp = 0;
      config.y = config.wave.params.height / 2;

      this.FlyObstacle_constructor(config);

      this.shotables = this.bonuses;
      this.flapping = null;

    }

    Banshee.prototype = Object.create(FlyObstacle.prototype);
    Banshee.prototype.constructor = Banshee;
    window.Banshee = createjs.promote(Banshee, "FlyObstacle");

    Banshee.prototype.drawImage = function() {
      var sheet = new createjs.SpriteSheet({
          images: [QUEUE.getResult(this.img)],
          frames: {width:parseInt(400*rX), height:parseInt(350*rY), regX:parseInt(200*rX), regY:parseInt(175*rY)},
          framerate: 20,
          animations: {
              fly: {
                frames: [0,1,2,3,4,5,4,3,2,1,0],
                next: false,
              },
              die: {
                frames: [7,8,9],
                next: false,
                speed: 0.5,
              },
              bite: {
                frames: [6],
                next: false
              },
          }
      });

      this.sprite = new createjs.Sprite(sheet);
      this.sprite.scale = 0.7;
      this.sprite.y = 20;
      this.sprite.gotoAndStop(0);
      this.sprite.scaleX *= this.direction;
      this.image_cont.addChild(this.sprite);

      this.flapping = setInterval(proxy(this.flapWings, this), 1500);
    }

    Banshee.prototype.flapWings = function() {
      if(this.active) {
        this.sprite.stop();
        this.sprite.gotoAndPlay('fly');
      }
    }

    Banshee.prototype.drawBonus = function() {
      var bonus = new createjs.Shape();
        bonus.graphics.beginFill('green').drawCircle(0,0,80*rX*this.actualScale);
        bonus.alpha = 0.5;
        bonus.x = 50;
        bonus.y = -30;
        this.debug_cont.addChild(bonus);
        this.bonuses.push(bonus);
    }

    Banshee.prototype.drawMalus = function() {

      var malus = new createjs.Shape();
        malus.graphics.beginFill('red').drawCircle(0,0,30*rX*this.actualScale);
        malus.y = 0;
        malus.x = 50;
        malus.alpha = 0.5;
        this.debug_cont.addChild(malus);
        this.maluses.push(malus);
    }

    Banshee.prototype.malusHitted = function() {
      this.active = false;
      this.sprite.gotoAndPlay('bite');
    }

    Banshee.prototype.die = function() {
      this.active = false;
      this.sprite.stop();
      this.sprite.gotoAndPlay('die');
      this.sprite.on('animationend', (ev) => {
        if(ev.name === 'die') {
          createjs.Tween.get(this.sprite).to({alpha:0, y:-10}, 500).call(() => {
            this.selfRemove();
          });
        }
      });
    }

    Banshee.prototype.removeSelfListeners = function() {
      this.off('tick', this.tickering);
      clearInterval(this.flapping);
  }

}());

(function() {

    function BansheeRider(config = {}) {

      config.name = 'bansheeRider';
      config.img = 'banshee_rider';
      config.meter_height = 1;
      config.pixel_height = 512*rY;
      config.speedX = 4;
      config.amplitude = 0;
      config.frequence = 0;
      config.ymin = -config.wave.params.height*1/3;
      config.ymax = -config.wave.params.height;
      config.hp = 0;

      this.FlyObstacle_constructor(config);

      this.shotables = this.bonuses;
      this.flapping = null;

    }

    BansheeRider.prototype = Object.create(FlyObstacle.prototype);
    BansheeRider.prototype.constructor = BansheeRider;
    window.BansheeRider = createjs.promote(BansheeRider, "FlyObstacle");

    BansheeRider.prototype.drawImage = function() {
      var sheet = new createjs.SpriteSheet({
          images: [QUEUE.getResult(this.img)],
          frames: {width:parseInt(512*rX), height:parseInt(512*rY), regX:parseInt(256*rX), regY:parseInt(256*rY)},
          framerate: 20,
          animations: {
              fly: {
                frames: [0],
                next: 'fly',
              },
              die: {
                frames: [0],
                next: false,
              },
          }
      });

      this.sprite = new createjs.Sprite(sheet);
      this.sprite.scale = 0.8;
      this.sprite.y = 20;
      this.sprite.gotoAndStop(0);
      this.sprite.scaleX *= this.direction;
      this.image_cont.addChild(this.sprite);

    }

    BansheeRider.prototype.drawBonus = function() {
      var bonus = new createjs.Shape();
        bonus.graphics.beginFill('green').drawCircle(0,0,80*rX*this.actualScale);
        bonus.alpha = 0.5;
        bonus.x = 50;
        bonus.y = -30;
        this.debug_cont.addChild(bonus);
        this.bonuses.push(bonus);
    }

    BansheeRider.prototype.drawMalus = function() {

      var malus = new createjs.Shape();
        malus.graphics.beginFill('red').drawCircle(0,0,30*rX*this.actualScale);
        malus.y = 0;
        malus.x = 50;
        malus.alpha = 0.5;
        this.debug_cont.addChild(malus);
        this.maluses.push(malus);
    }

    BansheeRider.prototype.malusHitted = function() {
      this.active = false;
      //this.sprite.gotoAndPlay('bite');
    }

    BansheeRider.prototype.die = function() {
      this.active = false;
      this.sprite.stop();
      //this.sprite.gotoAndPlay('die');
      this.sprite.on('animationend', (ev) => {
        if(ev.name === 'die') {
          createjs.Tween.get(this.sprite).to({alpha:0, y:-10}, 500).call(() => {
            this.selfRemove();
          });
        }
      });
    }

}());