
(function() {

    function Cigogne(config = {}) {

      config.name = 'cigogne';
      config.img = 'cigogne';
      config.meter_height = 1.2;
      config.pixel_height = 120*rY;
      config.ymin = 200;
      config.ymax = 400;
      config.speed = 20;
      config.reverse = true;

      this.FlyObstacle_constructor(config);
    }

    Cigogne.prototype = Object.create(FlyObstacle.prototype);
    Cigogne.prototype.constructor = Cigogne;
    window.Cigogne = createjs.promote(Cigogne, "FlyObstacle");

    Cigogne.prototype.drawImage = function() {

      var sheet = new createjs.SpriteSheet({
          images: [QUEUE.getResult(this.img)],
          frames: {width:parseInt(256*rX), height:parseInt(256*rY), regX:parseInt(128*rX), regY:parseInt(128*rY)},
          framerate: 30,
          animations: {
              fly: [0,5,'fly'],
          }
      });

      this.sprite = new createjs.Sprite(sheet);
      this.sprite.scale = this.actualScale;
      this.sprite.scaleX *= -this.actualDirection;
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