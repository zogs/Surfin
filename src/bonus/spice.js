
(function() {

    function Spice(config = {}) {

      config.name = 'spice';
      config.img = 'spice';
      config.speed = 20;
      config.reverse = false;
      config.size_x = 50;
      config.size_y = 50;

      this.FlyObstacle_constructor(config);
    }

    Spice.prototype = Object.create(FlyObstacle.prototype);
    Spice.prototype.constructor = Spice;
    window.Spice = createjs.promote(Spice, "FlyObstacle");

    Spice.prototype.drawImage = function() {

      var sheet = new createjs.SpriteSheet({
          images: [QUEUE.getResult(this.img)],
          frames: {width:parseInt(256*rX), height:parseInt(256*rY), regX:parseInt(128*rX), regY:parseInt(128*rY)},
          framerate: 20,
          animations: {
              loop: [0,7, 'loop'],
          }
      });

      let radius = 50;
      this.circle = new createjs.Shape();
      this.circle.graphics.setStrokeStyle(5).beginStroke('rgba(255,200 ,200 ,0.8)').beginRadialGradientFill(["rgba(255,255,255,0)","rgba(255,255,255,0.55)"], [0, 1], 0, 0, 0, 0, 0, radius).drawCircle(0,0,radius);
      this.image_cont.addChild(this.circle);
      createjs.Tween.get(this.circle, {loop: true}).to({alpha:0.5},500, createjs.Ease.quartInOut).to({alpha:1}, 500, createjs.Ease.quartInOut);

      this.sprite = new createjs.Sprite(sheet);
      this.sprite.scale = 0.5;
      this.sprite.scaleX *= this.direction === LEFT ? -1 : 1;
      this.sprite.gotoAndPlay('loop');
      this.image_cont.addChild(this.sprite);

    }

    Spice.prototype.drawBonus = function() {
      var bonus = new createjs.Shape();
      bonus.graphics.beginFill('green').drawCircle(0,0,40);
      bonus.alpha = 0.5;
      bonus.hitzone = 'body';
      this.debug_cont.addChild(bonus);
      this.bonuses.push(bonus);
    }

    Spice.prototype.drawMalus = function() {
      //no malus
    }

    Spice.prototype.bonusHitted = function() {
      let sound = createjs.Sound.play("pickup");
      createjs.Tween.get(this.image_cont).to({scale:2, alpha:0}, 500, createjs.Ease.quartIn);
    }

}());