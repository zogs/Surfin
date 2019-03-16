
(function() {

    function Cigogne(config) {

      config.name = 'cigogne';
      config.img = 'cigogne';
      config.high_min = 200;
      config.high_max = 400;
      config.speed = 20;
      config.reverse = true;

      this.FlyObstacle_constructor(config);
    }

    Cigogne.prototype = Object.create(FlyObstacle.prototype);
    Cigogne.prototype.constructor = Cigogne;
    window.Cigogne = createjs.promote(Cigogne, "FlyObstacle");

    Cigogne.prototype.drawImage = function() {

      var sheet = new createjs.SpriteSheet({
          images: [queue.getResult(this.img)],
          frames: {width:256, height:256, regX:128, regY:128},
          framerate: 1,
          animations: {
              fly: [0,5,'fly'],
          }
      });

      this.sprite = new createjs.Sprite(sheet);
      this.sprite.scaleX *= this.wave.isLEFT()? -1 : 1;
      this.sprite.gotoAndPlay('fly');
      this.image_cont.addChild(this.sprite);

    }

    Cigogne.prototype.drawBonus = function() {

    }

    Cigogne.prototype.drawMalus = function() {
      //no malus
    }

    Cigogne.prototype.bonusHitted = function() {

    }


}());