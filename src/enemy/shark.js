
(function() {

    function Shark(config = {}) {

      config.name = 'shark';
      config.img = 'shark';
      config.meter_height = 2;
      config.pixel_height = 160*rY;
      config.speed = 5;

      this.FlyObstacle_constructor(config);
    }

    Shark.prototype = Object.create(FlyObstacle.prototype);
    Shark.prototype.constructor = Shark;
    window.Shark = createjs.promote(Shark, "FlyObstacle");

    Shark.prototype.drawImage = function() {

      var sheet = new createjs.SpriteSheet({
          images: [queue.getResult(this.img)],
          frames: {width:parseInt(200*rX), height:parseInt(80*rY), regX:parseInt(100*rX), regY:parseInt(40*rY)},
          framerate: 5,
          animations: {
              swim: [0,5],
          }
      });

      this.sprite = new createjs.Sprite(sheet);
      this.sprite.scale = this.actualScale;
      this.sprite.scaleX *= this.actualDirection;
      this.sprite.gotoAndPlay('swim');
      this.image_cont.addChild(this.sprite);

    }

    Shark.prototype.drawBonus = function() {

    }

    Shark.prototype.drawMalus = function() {
      var malus = new createjs.Shape();
      malus.graphics.beginFill('red').drawCircle(0,0,30*rX);
      malus.alpha = 0.5;
      malus.y = -30*rX;
      malus.x = -15*rY*this.actualDirection ;
      malus.hitzone = 'board';
      this.debug_cont.addChild(malus);
      this.maluses.push(malus);
    }

    Shark.prototype.malusHitted = function(surfer) {

      this.die();
      surfer.fall('hit shark');
    }

    Shark.prototype.die = function(surfer) {
      this.active = false;
      let sound1 = createjs.Sound.play("cut");
      let sound2 = createjs.Sound.play("sharkroar");
    }

}());