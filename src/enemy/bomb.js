(function() {

    function Bomb(config = {}) {

      config.img = 'bomb';
      config.name = 'bomb';
      config.meter_height = 0.9;
      config.pixel_height = 140*rY;

      this.Obstacle_constructor(config);

      this.shotable = this.bonuses;

    }
    Bomb.prototype = Object.create(Obstacle.prototype);
    Bomb.prototype.constructor = Bomb;
    window.Bomb = createjs.promote(Bomb, "Obstacle");

    Bomb.prototype.drawImage = function() {
      var sheet = new createjs.SpriteSheet({
          images: [QUEUE.getResult('bomb')],
          frames: {width:parseInt(200*rX), height:parseInt(200*rY), regX: parseInt(100*rX), regY: parseInt(100*rY)},
          framerate: 1,
          animations: {
            normal: [0],
            prox: [1, 2, 'prox', 1],
            timer: [3, 6, false, 2],
          }
      });

      this.bomb = new createjs.Sprite(sheet);
      this.bomb.scale = this.actualScale;
      this.bomb.scaleX *= this.actualDirection;
      this.bomb.gotoAndPlay('prox');
      this.image_cont.addChild(this.bomb);

      var sheet = new createjs.SpriteSheet({
          images: [QUEUE.getResult('boom')],
          frames: {width:parseInt(312*rX), height:parseInt(285*rY), regX: parseInt(155*rX), regY: parseInt(142*rY)},
          framerate: 10,
          animations: {
              explode: [0, 5, false],
          }
      });

      this.boom = new createjs.Sprite(sheet);
      this.boom.scale = this.actualScale;
      this.boom.gotoAndStop(0);
      this.boom.y = -80*rY*this.actualScale;
      this.boom.alpha = 0;
      this.image_cont.addChild(this.boom);

    }

    Bomb.prototype.drawBonus = function() {

        var bonus = new createjs.Shape();
        bonus.graphics.beginFill('green').drawCircle(0,0,30*rX*this.actualScale);
        bonus.y = 0;
        bonus.x = 5 * rX;
        bonus.alpha = 0.5;
        bonus.shotable = true;
        this.debug_cont.addChild(bonus);
        this.bonuses.push(bonus);
    }

    Bomb.prototype.drawMalus = function() {

      var malus = new createjs.Shape();
        malus.graphics.beginFill('red').drawCircle(0,0,50*rX*this.actualScale);
        malus.y = 0;
        malus.x = 5 * rX;
        malus.alpha = 0.5;
        this.debug_cont.addChild(malus);
        this.maluses.push(malus);
    }

    Bomb.prototype.cancelMalus = function(malus) {

      createjs.Tween.get(this).to({alpha: 0}, 500);
      this.maluses.splice(this.maluses.indexOf(malus),1);
    }

    Bomb.prototype.die = function() {

      this.boom.alpha = 1;
      this.boom.gotoAndPlay('explode');
      this.bomb.alpha = 0;
      this.boom.on('animationend', (ev) => {
        createjs.Tween.get(this.boom).to({alpha: 0}, 500).call(() => this.selfRemove())
      });
      this.active = false;
      this.hitted = true;
    }

    Bomb.prototype.malusHitted = function() {

      this.die();
    }


}());
