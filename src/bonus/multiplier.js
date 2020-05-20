
(function() {

    function FlyingMultiplier(config) {

      config.name = 'multiplier';
      config.amplitude = 10;
      config.time = 0;
      config.phase = Math.random() * 1000;

      this.multiplier = config.multiplier || 2;

      this.FlyObstacle_constructor(config);

    }

    FlyingMultiplier.prototype = Object.create(FlyObstacle.prototype);
    FlyingMultiplier.prototype.constructor = FlyingMultiplier;
    window.FlyingMultiplier = createjs.promote(FlyingMultiplier, "FlyObstacle");

    FlyingMultiplier.prototype.drawImage = function() {

      var graphics = new createjs.Graphics()
          .setStrokeStyle(5)
          .beginStroke('rgba(255,255,255,0.5)')
          .beginFill('rgba(255,255,255,1)')
          .drawCircle(0, 0, 30)
          ;

      var circle = new createjs.Shape(graphics)
      this.image_cont.addChild(circle);

      var text = new createjs.Text('','bold '+Math.floor(26*rY)+'px Helvetica','#000')
      text.text = 'x'+this.config.multiplier;
      var b = text.getBounds()
      text.x = - b.width / 2
      text.y = - b.height / 2

      this.image_cont.addChild(text)
    }

    FlyingMultiplier.prototype.drawBonus = function() {

      var bonus = new createjs.Shape();
      bonus.graphics.beginFill('green').drawCircle(0,0,30);
      bonus.alpha = 0.5;
      this.debug_cont.addChild(bonus);
      this.bonuses.push(bonus);
    }

    FlyingMultiplier.prototype.drawMalus = function() {
      //no malus
    }

    FlyingMultiplier.prototype.bonusHitted = function() {
      createjs.Tween.get(this).to({scaleX:4,scaleY:4,alpha:0},300);
    }


}());