
(function() {

    function Ptero(config) {

      config.name = 'pterose';
      config.img = 'pterose';
      config.high_min = 200;
      config.high_max = 400;
      config.speed = 20;
      config.reverse = false;

      this.FlyObstacle_constructor(config);
    }

    Ptero.prototype = Object.create(FlyObstacle.prototype);
    Ptero.prototype.constructor = Ptero;
    window.Ptero = createjs.promote(Ptero, "FlyObstacle");

    Ptero.prototype.drawImage = function() {

      var sheet = new createjs.SpriteSheet({
          images: [queue.getResult(this.img)],
          frames: {width:parseInt(128*rX), height:parseInt(128*rY), regX:parseInt(64,rX), regY:parseInt(64,rY)},
          framerate: 10,
          animations: {
              fly: [0,10,'fly'],
          }
      });

      this.sprite = new createjs.Sprite(sheet);
      this.sprite.scaleX *= this.wave.isLEFT()? -1 : 1;
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