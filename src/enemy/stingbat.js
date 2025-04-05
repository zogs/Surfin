
(function() {

    function Stingbat(config = {}) {

      config.name = 'stingbat';
      config.img = 'stingbat';
      config.meter_height = 0.5;
      config.pixel_height = 300*rY;
      config.speedX = 0;
      config.amplitude = config.amplitude || 60;
      config.frequence = config.frequence || 2;
      config.ymin;
      config.ymax = 1;
      config.hp = 0;
      config.y = config.wave.params.height / 2;

      this.FlyObstacle_constructor(config);

      this.shotables = this.bonuses;
      this.flapping = null;

    }

    Stingbat.prototype = Object.create(FlyObstacle.prototype);
    Stingbat.prototype.constructor = Stingbat;
    window.Stingbat = createjs.promote(Stingbat, "FlyObstacle");

    Stingbat.prototype.drawImage = function() {
      var sheet = new createjs.SpriteSheet({
          images: [QUEUE.getResult(this.img)],
          frames: {width:parseInt(256*rX), height:parseInt(256*rY), regX:parseInt(128*rX), regY:parseInt(128*rY)},
          framerate: 20,
          animations: {
              fly: {
                frames: [2,3,4,3,2,1,0,1,2,3,2],
                next: 'fly',
                speed: 0.9
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
      this.sprite.scaleX *= this.direction;
      this.sprite.gotoAndPlay('fly')
      this.image_cont.addChild(this.sprite);

      //this.flapping = setInterval(proxy(this.flapWings, this), 1000);
    }

    Stingbat.prototype.flapWings = function() {
      if(this.active) {
        this.sprite.stop();
        this.sprite.gotoAndPlay('fly');
      }
    }

    Stingbat.prototype.drawBonus = function() {
      var bonus = new createjs.Shape();
        bonus.graphics.beginFill('green').drawCircle(0,0,100*rX*this.actualScale);
        bonus.alpha = 0.5;
        bonus.x = 20;
        bonus.y = -0;
        this.debug_cont.addChild(bonus);
        this.bonuses.push(bonus);
    }

    Stingbat.prototype.drawMalus = function() {

      var malus = new createjs.Shape();
        malus.graphics.beginFill('red').drawCircle(0,0,50*rX*this.actualScale);
        malus.y = 0;
        malus.x = 0;
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
          createjs.Tween.get(this.sprite).to({alpha:0, y:-10}, 500).call(() => {
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


(function() {

    function StingbatLine(config = {}) {

      this.defaultConfig = config;

      config.name = 'stingbatLine';
      config.img = 'stingbat';
      config.size_x = 600;
      config.size_y = 300;
      this.config = config;

      let params = {};
      params.amplitude = 0;
      params.frequence = 0;
      params.ystart = 0;
      this.objConfig = Object.assign({}, this.defaultConfig, params);
      console.log(this.objConfig);

      this.FlyObstacle_constructor(config);
    }

    StingbatLine.prototype = Object.create(FlyObstacle.prototype);
    StingbatLine.prototype.constructor = StingbatLine;
    window.StingbatLine = createjs.promote(StingbatLine, "FlyObstacle");

    StingbatLine.prototype.drawImage = function() {

      this.obj1 = new Stingbat(this.objConfig);
      this.obj1.autoRemove = false;
      this.obj1.setXY(0,0);
      this.addChild(this.obj1);

      this.obj2 = new Stingbat(this.objConfig);
      this.obj2.autoRemove = false;
      this.obj2.setXY(-100,-50);
      this.addChild(this.obj2);

      this.obj3 = new Stingbat(this.objConfig);
      this.obj3.autoRemove = false;
      this.obj3.setXY(-200,-100);
      this.addChild(this.obj3);

    }

    StingbatLine.prototype.drawBonus = function() {
    }

    StingbatLine.prototype.drawMalus = function() {
    }

    StingbatLine.prototype.bonusHitted = function() {
    }

    StingbatLine.prototype.hitBonus = function(surfer) {
      this.obj1.hitBonus(surfer);
      this.obj2.hitBonus(surfer);
      this.obj3.hitBonus(surfer);
    }

    StingbatLine.prototype.hitMalus = function(surfer) {
    }

    StingbatLine.prototype.bonusHitted = function() {
    }
    StingbatLine.prototype.malusHitted = function() {
    }

    StingbatLine.prototype.beforeRemoval = function() {
      this.obj1.selfRemove();
      this.obj2.selfRemove();
      this.obj3.selfRemove();
      this.removeChild(this.obj1);
      this.removeChild(this.obj2);
      this.removeChild(this.obj3);
    }

    StingbatLine.prototype.initialPosition = function() {

    let x = this.wave.params.breaking_center + (200 - Math.random() * 400)*rX;
    let y = 0;

    if(this.wave.direction === RIGHT) {
      x = this.wave.obstacle_cont.globalToLocal(STAGEWIDTH,0) + this.config.size_x;
    }
    if(this.wave.direction === LEFT) {
      x = this.wave.obstacle_cont.globalToLocal(0,0).x - this.config.size_x;
    }

    this.setXY(x,y);
  }

}());