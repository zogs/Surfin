
(function() {

    function Drone(config) {

      config.name = 'drone';
      config.img = 'drone';
      config.amp = Math.random() * 2;
      config.high_min = 100;
      config.high_max = 300;
      config.speed = 5;

      this.FlyObstacle_constructor(config);

    }

    Drone.prototype = Object.create(FlyObstacle.prototype);
    Drone.prototype.constructor = Drone;
    window.Drone = createjs.promote(Drone, "FlyObstacle");

    Drone.prototype.drawImage = function() {

      var sheet = new createjs.SpriteSheet({
          images: [queue.getResult('drone')],
          frames: {width:256, height:256, regX:128, regY:128},
          framerate: 1,
          animations: {
              fly: [0,2,'fly'],
              flash: [3,6,'fly']
          }
      });

      this.sprite = new createjs.Sprite(sheet);
      this.sprite.scaleX *= this.wave.direction === LEFT ? 1 : -1;
      this.sprite.gotoAndPlay('fly');
      this.sprite.scale = 0.5;
      this.image_cont.addChild(this.sprite);

    }

    Drone.prototype.drawBonus = function() {
      var bonus = new createjs.Shape();
      bonus.graphics.beginFill('green').drawCircle(0,0,75);
      bonus.alpha = 0.2;
      bonus.hitzone = 'body';
      bonus.y = 75;
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