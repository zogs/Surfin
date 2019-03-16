
(function() {

    function Photografer(config) {

      config.img = 'photographer';
      config.name = 'photo';

      this.Obstacle_constructor(config);

    }
    Photografer.prototype = Object.create(Obstacle.prototype);
    Photografer.prototype.constructor = Photografer;
    window.Photografer = createjs.promote(Photografer, "Obstacle");

    Photografer.prototype.drawImage = function() {

      var sheet = new createjs.SpriteSheet({
          images: [queue.getResult(this.img)],
          frames: {width:100, height:80, regX:50, regY:40},
          framerate: 1,
          animations: {
              swim: 0,
              flash: [1,1,'swim'],
          }
      });

      this.sprite = new createjs.Sprite(sheet);
      this.sprite.scale = 1.8;
      this.sprite.scaleX *= this.wave.direction === LEFT ? 1 : -1;
      this.image_cont.addChild(this.sprite);

    }

    Photografer.prototype.drawBonus = function() {

      var bonus = new createjs.Shape();
      bonus.graphics.beginFill('green').drawCircle(0,0,60);
      bonus.y = -50;
      bonus.x = this.wave.direction === LEFT ? 60 : -60;
      bonus.alpha = 0.5;
      this.debug_cont.addChild(bonus);
      this.bonuses.push(bonus);
    }

    Photografer.prototype.drawMalus = function() {

      var malus = new createjs.Shape();
        malus.graphics.beginFill('red').drawCircle(0,0,20);
        malus.x = this.wave.direction === LEFT ? -40 : 40;
        malus.y = 40;
        malus.alpha = 0.5;
        this.debug_cont.addChild(malus);
        this.maluses.push(malus);
    }

    Photografer.prototype.bonusHitted = function() {

      this.sprite.gotoAndPlay('flash');
    }

    Photografer.prototype.malusHitted = function() {

      console.log('photographer malus');
    }

}());