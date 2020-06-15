
(function() {

    function Drone(config = {}) {

      config.name = 'drone';
      config.img = 'drone';
      config.meter_height = 1;
      config.pixel_height = 100*rY;
      config.amplitude = Math.random() * 2;
      config.ymin = 100;
      config.ymax = 300;
      config.speed = 5;

      this.FlyObstacle_constructor(config);

    }

    Drone.prototype = Object.create(FlyObstacle.prototype);
    Drone.prototype.constructor = Drone;
    window.Drone = createjs.promote(Drone, "FlyObstacle");

    Drone.prototype.drawImage = function() {

      var sheet = new createjs.SpriteSheet({
          images: [queue.getResult('drone')],
          frames: {width:parseInt(256*rX), height:parseInt(256*rY), regX:parseInt(128*rX), regY:parseInt(128*rY)},
          framerate: 1,
          animations: {
              fly: [0,2,'fly'],
              flash: [3,6,'fly']
          }
      });

      this.sprite = new createjs.Sprite(sheet);
      this.sprite.scale = this.actualScale;
      this.sprite.scaleX *= this.actualDirection;
      this.sprite.gotoAndPlay('fly');
      this.image_cont.addChild(this.sprite);

    }

    Drone.prototype.drawBonus = function() {
      var bonus = new createjs.Shape();
      bonus.graphics.beginFill('green').drawCircle(0,0,75*rX);
      bonus.alpha = 0.2;
      bonus.hitzone = 'body';
      bonus.y = 75*rY;
      this.debug_cont.addChild(bonus);
      this.bonuses.push(bonus);
    }

    Drone.prototype.drawMalus = function() {
      //no malus
    }

    Drone.prototype.bonusHitted = function() {

      this.sprite.gotoAndPlay('flash');

    }


}());