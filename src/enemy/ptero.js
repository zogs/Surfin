
(function() {

    function Ptero(config = {}) {

      config.name = 'ptero';
      config.img = 'ptero';
      config.meter_height = 1;
      config.pixel_height = 50*rY;

      this.FlyObstacle_constructor(config);

    }

    Ptero.prototype = Object.create(FlyObstacle.prototype);
    Ptero.prototype.constructor = Ptero;
    window.Ptero = createjs.promote(Ptero, "FlyObstacle");

    Ptero.prototype.drawImage = function() {
      var sheet = new createjs.SpriteSheet({
          images: [QUEUE.getResult(this.img)],
          frames: {width:parseInt(128*rX), height:parseInt(128*rY), regX:parseInt(64*rX), regY:parseInt(64*rY)},
          framerate: 10,
          animations: {
              fly: [0,10,'fly'],
          }
      });

      this.sprite = new createjs.Sprite(sheet);
      this.sprite.scaleX *= -this.direction;
      this.sprite.gotoAndPlay('fly');
      this.image_cont.addChild(this.sprite);

    }

    Ptero.prototype.drawBonus = function() {

    }

    Ptero.prototype.drawMalus = function() {
      //no malus
    }

    Ptero.prototype.bonusHitted = function() {

    }


}());