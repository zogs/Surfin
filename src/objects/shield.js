(function() {

    function Shield(conf = {}) {

      let defaults = {
        name: 'shield',
        radius: 80,
        speed: 200,
      }
      this.conf = Object.assign({}, defaults, conf);
      this.Container_constructor();
      this.init();

    }

    Shield.prototype = createjs.extend(Shield, createjs.Container);
    createjs.EventDispatcher.initialize(Shield.prototype);

    Shield.prototype.init = function(conf) {

      let radius = this.conf.radius;
      this.circle = new createjs.Shape();
      this.circle.graphics.setStrokeStyle(5).beginStroke('rgba(255,255,255,0.2)').beginRadialGradientFill(["rgba(0,0,0,0)","rgba(75,175,216,0.7"], [0, 1], 0, 0, 0, 0, 0, radius).drawCircle(0,0,radius);
      this.addChild(this.circle);
      this.glow = new createjs.Shape();
      this.glow.graphics.beginRadialGradientFill(["rgba(0,0,0,0)","rgba(75,175,216,0.5)","rgba(0,0,0,0)"], [0.25, 0.30, 0.9], 0, 0, radius, 0, 0, radius*1.2).drawCircle(0,0,radius*1.2);
      this.addChild(this.glow);
      this.riddle = new createjs.Bitmap(queue.getResult('spot_searipple'));
      this.riddle.rotation = 90;
      this.riddle.x = 500;
      this.riddle.y = -500;
      this.riddle.alpha = 0.4;
      this.riddle.mask = this.circle;
      this.addChild(this.riddle);

      this.hitzone = new createjs.Shape();
      this.hitzone.graphics.beginFill('green').drawCircle(0,0, radius);
      this.hitzone.alpha = 0;
      this.addChild(this.hitzone);

      this.scale = 0;
      this.alpha = 0;
      this.isOpen = false;

      this.addEventListener('tick',proxy(this.tick,this));

    }

    Shield.prototype.open = function() {
      this.isOpen = true;
      createjs.Tween.get(this).to({scale:1, alpha:1}, this.conf.speed, createjs.Ease.bounceOut);
      createjs.Tween.get(this.glow, {loop: true}).to({scale:0.9},100).to({scale:1},100);
      createjs.Tween.get(this.circle, {loop: true}).to({alpha:0.5},100).to({alpha:1},100);
    }

    Shield.prototype.close = function() {
      this.isOpen = false;
      createjs.Tween.get(this).to({scale:0, alpha:0}, this.conf.speed/2, createjs.Ease.quartIn);
      createjs.Tween.get(this.glow, {override: true}).to({scale:1},0);
      createjs.Tween.get(this.circle, {override: true}).to({alpha:1},0);
    }

    Shield.prototype.toggle = function() {
      if(this.isOpen) this.close();
      else this.open();
    }

    Shield.prototype.debug = function(bool) {
      if(bool) {
        this.hitzone.alpha = 0.5;
      } else {
        this.hitzone.alpha = 0;
      }
    }

    Shield.prototype.tick = function() {

      // show debug
      if(window.DEBUG) this.debug(true);
      else this.debug(false);
    }

    //assign  to window's scope & promote
    window.Shield = createjs.promote(Shield, "Container");
}());
