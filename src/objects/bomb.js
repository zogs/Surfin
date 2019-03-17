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
          images: [queue.getResult('bomb')],
          frames: {width:200, height:200, regX: 100, regY: 100},
          framerate: 1,
          animations: {
            normal: [0],
            prox: [1, 2, 'prox', 1],
            timer: [3, 6, false, 2],
          }
      });

      this.bomb = new createjs.Sprite(sheet);
      this.bomb.scaleX = this.bomb.scaleY = 0.8;
      this.bomb.gotoAndPlay('timer');
      this.image_cont.addChild(this.bomb);

      var sheet = new createjs.SpriteSheet({
          images: [queue.getResult('boom')],
          frames: {width:312, height:285, regX: 155, regY: 142},
          framerate: 10,
          animations: {
              explode: [0, 5, false],
          }
      });

      this.boom = new createjs.Sprite(sheet);
      this.boom.scaleX = this.boom.scaleY = 0.8;
      this.boom.gotoAndStop(0);
      this.boom.y = -80;
      this.boom.alpha = 0;
      this.image_cont.addChild(this.boom);

    }

    BombObstacle.prototype.drawBonus = function() {

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

    }

    BombObstacle.prototype.malusHitted = function() {

      this.bomb.alpha = 0;
      this.boom.alpha = 1;
      this.boom.gotoAndPlay('explode');
    }

}());
