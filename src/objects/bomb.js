(function() {

    function BombObstacle(config) {

      config.img = 'bomb';
      config.name = 'bomb';
      this.Obstacle_constructor(config);

    }
    BombObstacle.prototype = Object.create(Obstacle.prototype);
    BombObstacle.prototype.constructor = BombObstacle;
    window.BombObstacle = createjs.promote(BombObstacle, "Obstacle");

    BombObstacle.prototype.drawImage = function() {

      var sheet = new createjs.SpriteSheet({
          images: [queue.getResult('bomb_boom')],
          frames: {width:312, height:285, regX: 155, regY: 142},
          framerate: 1,
          animations: {
            floating: [0, 1, false, 1],
              explode: [2, 7, false, 0.5],
          }
      });

      this.sprite = new createjs.Sprite(sheet);
      this.sprite.scaleX = this.sprite.scaleY = 0.5;
      this.sprite.y = -50;
      this.sprite.gotoAndPlay('floating');
      this.image_cont.addChild(this.sprite);

    }

    BombObstacle.prototype.drawBonus = function() {

      var bonus = new createjs.Shape();
        bonus.graphics.beginFill('green').drawCircle(0,0,100);
        bonus.y = 0;
        bonus.x = 5;
        bonus.alpha = 0.5;
        this.debug_cont.addChild(bonus);
        this.bonuses.push(bonus);
    }

    BombObstacle.prototype.drawMalus = function() {

      var malus = new createjs.Shape();
        malus.graphics.beginFill('red').drawCircle(0,0,50);
        malus.y = 0;
        malus.x = 5;
        malus.alpha = 0.5;
        malus.shotable = true;
        malus.onShoted = proxy(this.cancelMalus,this,[malus]);
        this.debug_cont.addChild(malus);
        this.maluses.push(malus);
    }

    BombObstacle.prototype.cancelMalus = function(malus) {

      createjs.Tween.get(this).to({alpha: 0}, 500);
      this.maluses.splice(this.maluses.indexOf(malus),1);
    }

    BombObstacle.prototype.bonusHitted = function() {
      // bomb explose at distance (bonus), but if surfer is too close (malus) he will fall...
      this.sprite.gotoAndPlay('explode');

    }

    BombObstacle.prototype.malusHitted = function() {

      //
    }

}());
