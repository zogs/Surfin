
(function() {

    function FlyingPrize(config = {}) {

      config.name = 'prize';
      config.amplitude = 20;
      config.time = 0;
      config.speed = 15;
      config.phase = Math.random() * 1000;

      this.value = config.value || 1000;
      if(this.value === 1000) this.color = 'green';
      if(this.value === 2000) this.color = 'yellow';
      if(this.value === 3000) this.color = 'orange';
      if(this.value === 4000) this.color = 'red';
      if(this.value === 5000) this.color = 'gold';

      this.FlyObstacle_constructor(config);

    }

    FlyingPrize.prototype = Object.create(FlyObstacle.prototype);
    FlyingPrize.prototype.constructor = FlyingPrize;
    window.FlyingPrize = createjs.promote(FlyingPrize, "FlyObstacle");

    FlyingPrize.prototype.drawImage = function() {

      var graphics = new createjs.Graphics()
          .setStrokeStyle(5)
          .beginStroke('rgba(255,255,255,0.5)')
          .beginFill(this.color)
          .drawCircle(0, 0, 30)
          ;

      var circle = new createjs.Shape(graphics)
      this.image_cont.addChild(circle);

      var text = new createjs.Text(this.value,'bold '+Math.floor(20*rY)+'px Helvetica','#000')
      var b = text.getBounds()
      text.x = - b.width / 2
      text.y = - b.height / 2

      this.image_cont.addChild(text)
    }

    FlyingPrize.prototype.drawBonus = function() {

      var bonus = new createjs.Shape();
      bonus.graphics.beginFill('green').drawCircle(0,0,30);
      bonus.alpha = 0.5;
      bonus.hitzone = 'body';
      this.debug_cont.addChild(bonus);
      this.bonuses.push(bonus);
    }

    FlyingPrize.prototype.drawMalus = function() {
      //no malus
    }

    FlyingPrize.prototype.bonusHitted = function() {
      createjs.Tween.get(this).to({scaleX:3,scaleY:3,alpha:0},300);
    }


}());