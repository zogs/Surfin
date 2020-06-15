
(function() {

    function Photographer(config) {

      config.img = 'photographer';
      config.name = 'photo';
      config.meter_height = 0.4;
      config.pixel_height = 40*rY;

      this.Obstacle_constructor(config);

    }
    Photographer.prototype = Object.create(Obstacle.prototype);
    Photographer.prototype.constructor = Photographer;
    window.Photographer = createjs.promote(Photographer, "Obstacle");

    Photographer.prototype.drawImage = function() {

      var sheet = new createjs.SpriteSheet({
          images: [queue.getResult(this.img)],
          frames: {width:parseInt(100*rX), height:parseInt(80*rY), regX:parseInt(50*rX), regY:parseInt(40*rY)},
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

    Photographer.prototype.drawBonus = function() {

      var bonus = new createjs.Shape();
      bonus.graphics.beginFill('green').drawCircle(0,0,60*rX);
      bonus.y = -50*rY;
      bonus.x = this.wave.direction === LEFT ? 60*rX : -60*rX;
      bonus.alpha = 0.5;
      this.debug_cont.addChild(bonus);
      this.bonuses.push(bonus);
    }

    Photographer.prototype.drawMalus = function() {

      var malus = new createjs.Shape();
        malus.graphics.beginFill('red').drawCircle(0,0,20*rX);
        malus.x = this.wave.direction === LEFT ? -40*rX : 40*rX;
        malus.y = 40*rY;
        malus.alpha = 0.5;
        this.debug_cont.addChild(malus);
        this.maluses.push(malus);
    }

    Photographer.prototype.bonusHitted = function() {

      this.sprite.gotoAndPlay('flash');
    }

    Photographer.prototype.malusHitted = function() {

      console.log('photographer malus');
    }

}());