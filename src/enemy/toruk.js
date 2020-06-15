
(function() {

    function Toruk(config = {}) {

      config.name = 'toruk';
      config.img = 'toruk';
      config.meter_height = 1;
      config.pixel_height = 150*rY;
      config.speedX = 20;
      config.amplitude = 5 + Math.random()*10;
      config.ymin = 0;
      config.hp = 10;
      config.y = - config.wave.params.height * Math.random();


      this.FlyObstacle_constructor(config);

      this.shotable = this.maluses;
      this.flapping = null;

    }

    Toruk.prototype = Object.create(FlyObstacle.prototype);
    Toruk.prototype.constructor = Toruk;
    window.Toruk = createjs.promote(Toruk, "FlyObstacle");

    Toruk.prototype.drawImage = function() {
      var sheet = new createjs.SpriteSheet({
          images: [queue.getResult(this.img)],
          frames: {width:parseInt(400*rX), height:parseInt(400*rY), regX:parseInt(200*rX), regY:parseInt(200*rY)},
          framerate: 30,
          animations: {
              fly: {
                frames: [0,1,2,3,4,5,4,3,2,1,0],
                next: false,
              },
              bite: {
                frames: [6],
                next: false,
              },
              die: {
                frames: [7,8,9],
                next: false,
                speed: 0.3
              }
          }
      });

      this.sprite = new createjs.Sprite(sheet);
      this.sprite.scale = 1.1;
      this.sprite.y = 20;
      this.sprite.scaleX *= -this.direction;
      this.image_cont.addChild(this.sprite);

      setTimeout(proxy(this.flapWings, this),Math.random()*1000 + 1000);
    }

    Toruk.prototype.flapWings = function() {
      if(this.active) {
        this.sprite.gotoAndPlay('fly');
        this.flapping = setTimeout(proxy(this.flapWings, this),1800);
      }
    }

    Toruk.prototype.drawBonus = function() {

    }

    Toruk.prototype.drawMalus = function() {
      var malus = new createjs.Shape();
        malus.graphics.beginFill('red').drawCircle(0,0,50*rX*this.actualScale);
        malus.y = 0;
        malus.x = 30;
        malus.alpha = 0.5;
        this.debug_cont.addChild(malus);
        this.maluses.push(malus);

      var malus = new createjs.Shape();
        malus.graphics.beginFill('red').drawCircle(0,0,60*rX*this.actualScale);
        malus.y = 0;
        malus.x = 110;
        malus.alpha = 0.5;
        this.debug_cont.addChild(malus);
        this.maluses.push(malus);
    }

    Toruk.prototype.bonusHitted = function() {

    }

    Toruk.prototype.malusHitted = function() {
      this.active = false;
    }

    Toruk.prototype.die = function() {
      this.active = false;
      this.sprite.stop();
      this.sprite.gotoAndPlay('die');
      this.sprite.on('animationend', (ev) => {
        if(ev.name === 'die') {
          createjs.Tween.get(this).to({alpha:0, y:-10}, 200).call(() => {
            this.selfRemove();
          });
        }
      });
    }

    Toruk.prototype.removeSelfListeners = function() {
        this.off('tick', this.tickering);
        clearTimeout(this.flapping);
      }

}());


(function() {

    function TorukAttack(config = {}) {

      config.name = 'torukattack';
      config.img = 'toruk';
      config.meter_height = 1;
      config.pixel_height = 150*rY;
      config.speedX = 25;
      config.hp = 10;
      config.y = config.wave.params.height / 2;

      this.FlyObstacle_constructor(config);

      this.shotable = this.maluses;

      this.sprite.gotoAndPlay('bite');

    }

    TorukAttack.prototype = Object.create(Toruk.prototype);
    TorukAttack.prototype.constructor = TorukAttack;
    window.TorukAttack = createjs.promote(TorukAttack, "Toruk");

    TorukAttack.prototype.flapWings = function() {
     /* empty */
    }

    TorukAttack.prototype.bonusHitted = function() {

    }

    TorukAttack.prototype.malusHitted = function() {
      this.active = false;
    }

}());