
(function() {

    function RotatingStar(config) {

      config.name = 'star';
      config.img = 'star';
      config.high_min = 60;
      config.high_max = 60;
      config.speed = 20;
      config.reverse = false;

      this.FlyObstacle_constructor(config);
    }

    RotatingStar.prototype = Object.create(FlyObstacle.prototype);
    RotatingStar.prototype.constructor = RotatingStar;
    window.RotatingStar = createjs.promote(RotatingStar, "FlyObstacle");

    RotatingStar.prototype.drawImage = function() {

      var sheet = new createjs.SpriteSheet({
          images: [queue.getResult(this.img)],
          frames: {width:120, height:120, regX:60, regY:60},
          framerate: 1,
          animations: {
              rotate: [0,5,'rotate'],
          }
      });

      this.sprite = new createjs.Sprite(sheet);
      this.sprite.scale = 0.5;
      this.sprite.scaleX *= this.wave.isLEFT()? -1 : 1;
      this.sprite.gotoAndPlay('rotate');
      this.image_cont.addChild(this.sprite);

      this.shadow = new createjs.Shape();
      this.shadow.graphics.beginFill('#000').drawCircle(0,0,20);
      this.shadow.scaleY = 0.5;
      this.shadow.alpha = 0.1;
      this.shadow.y = 40;
      this.image_cont.addChild(this.shadow);

    }

    RotatingStar.prototype.drawBonus = function() {
      var bonus = new createjs.Shape();
      bonus.graphics.beginFill('green').drawCircle(0,0,30);
      bonus.alpha = 0.5;
      bonus.hitzone = 'body';
      this.debug_cont.addChild(bonus);
      this.bonuses.push(bonus);
    }

    RotatingStar.prototype.drawMalus = function() {
      //no malus
    }

    RotatingStar.prototype.bonusHitted = function() {
      let sound = createjs.Sound.play("pickup");
      sound.volume = 0.1;
      this.sprite.gotoAndStop(0);
      createjs.Tween.get(this.sprite).to({y: -400, alpha:0}, 800, createjs.Ease.quartIn);
      createjs.Tween.get(this.sprite).to({scale:0.2}, 200).to({scale:0.4}, 200);
      createjs.Tween.get(this.shadow).to({alpha:0}, 200);
    }

    RotatingStar.prototype.move = function() {
      const move = new Victor(0, this.wave.getSuction().y);
      this.location.add(move);
      this.x = this.location.x;
    }
    RotatingStar.prototype.initialPosition = function() {

    let x = this.wave.params.breaking_center + (200 - Math.random() * 400);
    let y = this.wave.y - this.wave.params.height - 60 - Math.random()*this.wave.params.height;

    if(this.wave.direction === RIGHT) {
      x = this.wave.shoulder_right.x + Math.random() * (this.wave.params.shoulder.right.width*2);
    }
    if(this.wave.direction === LEFT) {
      x = this.wave.shoulder_left.x - Math.random() * (this.wave.params.shoulder.left.width*2);
    }

    this.setXY(x,y);
  }

}());