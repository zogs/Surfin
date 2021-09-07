
(function() {

    function Star(config = {}) {

      config.name = 'star';
      config.img = 'star';
      config.ymin = 60;
      config.ymax = 60;
      config.reverse = false;

      this.Obstacle_constructor(config);
    }

    Star.prototype = Object.create(Obstacle.prototype);
    Star.prototype.constructor = Star;
    window.Star = createjs.promote(Star, "Obstacle");

    Star.prototype.drawImage = function() {

      var sheet = new createjs.SpriteSheet({
          images: [QUEUE.getResult(this.img)],
          frames: {width:parseInt(120*rX), height:parseInt(120*rY), regX:parseInt(60*rX), regY:parseInt(60*rY)},
          framerate: 20,
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
      this.shadow.y = 40 * rY;
      this.image_cont.addChild(this.shadow);

    }

    Star.prototype.drawBonus = function() {
      var bonus = new createjs.Shape();
      bonus.graphics.beginFill('green').drawCircle(0,0,30);
      bonus.alpha = 0.5;
      bonus.hitzone = 'body';
      this.debug_cont.addChild(bonus);
      this.bonuses.push(bonus);
    }

    Star.prototype.drawMalus = function() {
      //no malus
    }

    Star.prototype.bonusHitted = function() {
      let sound = createjs.Sound.play("pickup");
      this.sprite.gotoAndStop(0);
      createjs.Tween.get(this.sprite).to({y: -400*rY, alpha:0}, 800, createjs.Ease.quartIn);
      createjs.Tween.get(this.sprite).to({scale:0.2}, 200).to({scale:0.4}, 200);
      createjs.Tween.get(this.shadow).to({alpha:0}, 200);
    }

    Star.prototype.initialPosition = function() {

    let x = this.wave.params.breaking_center + (200 - Math.random() * 400)*rX;
    let y = this.wave.y - this.wave.params.height - Math.random()*this.wave.params.height;

    if(this.wave.direction === RIGHT) {
      x = this.wave.obstacle_cont.globalToLocal(STAGEWIDTH,0) + this.sprite.spriteSheet.getFrameBounds(0).width;
    }
    if(this.wave.direction === LEFT) {
      //x = this.wave.shoulder_left.x - Math.random() * (this.wave.params.shoulder.width*2);
      x = this.wave.obstacle_cont.globalToLocal(0,0).x - this.sprite.spriteSheet.getFrameBounds(0).width;
    }

    this.setXY(x,y);
  }

}());


(function() {

    function FlyingStar(config = {}) {

      config.name = 'star';
      config.img = 'star';
      config.ymin = 60;
      config.ymax = 60;
      config.reverse = false;

      this.FlyObstacle_constructor(config);
    }

    FlyingStar.prototype = Object.create(FlyObstacle.prototype);
    FlyingStar.prototype.constructor = FlyingStar;
    window.FlyingStar = createjs.promote(FlyingStar, "FlyObstacle");

    FlyingStar.prototype.drawImage = function() {

      var sheet = new createjs.SpriteSheet({
          images: [QUEUE.getResult(this.img)],
          frames: {width:parseInt(120*rX), height:parseInt(120*rY), regX:parseInt(60*rX), regY:parseInt(60*rY)},
          framerate: 20,
          animations: {
              rotate: [0,5,'rotate'],
          }
      });

      this.sprite = new createjs.Sprite(sheet);
      this.sprite.scale = 0.5;
      this.sprite.scaleX *= this.wave.isLEFT()? -1 : 1;
      this.sprite.gotoAndPlay('rotate');
      this.image_cont.addChild(this.sprite);

    }

    FlyingStar.prototype.drawBonus = function() {
      var bonus = new createjs.Shape();
      bonus.graphics.beginFill('green').drawCircle(0,0,30);
      bonus.alpha = 0.5;
      bonus.hitzone = 'body';
      this.debug_cont.addChild(bonus);
      this.bonuses.push(bonus);
    }

    FlyingStar.prototype.drawMalus = function() {
      //no malus
    }

    FlyingStar.prototype.bonusHitted = function() {
      let sound = createjs.Sound.play("pickup");
      this.sprite.gotoAndStop(0);
      createjs.Tween.get(this.sprite).to({y: -400*rY, alpha:0}, 800, createjs.Ease.quartIn);
      createjs.Tween.get(this.sprite).to({scale:0.2}, 200).to({scale:0.4}, 200);
    }

    FlyingStar.prototype.initialPosition = function() {

    let x = this.wave.params.breaking_center + (200 - Math.random() * 400)*rX;
    let y = - Math.random()*this.wave.params.height/2 - 60;

    if(this.wave.direction === RIGHT) {
      x = this.wave.obstacle_cont.globalToLocal(STAGEWIDTH,0) + this.sprite.spriteSheet.getFrameBounds(0).width;
    }
    if(this.wave.direction === LEFT) {
      //x = this.wave.shoulder_left.x - Math.random() * (this.wave.params.shoulder.width*2);
      x = this.wave.obstacle_cont.globalToLocal(0,0).x - this.sprite.spriteSheet.getFrameBounds(0).width;
    }

    this.setXY(x,y);
  }

}());

(function() {

    function Starline(config = {}) {

      this.defaultConfig = config;

      config.name = 'starline';
      config.img = 'star';
      config.ymin = 60;
      config.ymax = 60;
      config.reverse = false;

      this.config = config;

      this.FlyObstacle_constructor(config);
    }

    Starline.prototype = Object.create(FlyObstacle.prototype);
    Starline.prototype.constructor = Starline;
    window.Starline = createjs.promote(Starline, "FlyObstacle");

    Starline.prototype.drawImage = function() {

      this.star1 = new Star(Object.assign({},this.defaultConfig));
      this.star1.autoRemove = false;
      this.star1.setXY(0,0);
      this.addChild(this.star1);

      this.star2 = new FlyingStar(Object.assign({},this.defaultConfig));
      this.star2.autoRemove = false;
      this.star2.setXY(-100,-50);
      this.addChild(this.star2);

      this.star3 = new FlyingStar(Object.assign({},this.defaultConfig));
      this.star3.autoRemove = false;
      this.star3.setXY(-200,-100);
      this.addChild(this.star3);

      this.bomb = new Bomb(Object.assign({},this.defaultConfig));
      this.bomb.autoRemove = false;
      const rand = Math.random()*100;
      if(rand < 10) this.bomb.setXY(-400,50);
      else if(rand < 20) this.bomb.setXY(100,50);
      else {
        this.bomb.active = false;
        this.bomb.setXY(0,0);
        this.bomb.alpha = 0.1;
      }
      this.addChild(this.bomb);
    }

    Starline.prototype.drawBonus = function() {
    }

    Starline.prototype.drawMalus = function() {
    }

    Starline.prototype.bonusHitted = function() {
    }

    Starline.prototype.hitBonus = function(surfer) {
      this.star1.hitBonus(surfer);
      this.star2.hitBonus(surfer);
      this.star3.hitBonus(surfer);
    }

    Starline.prototype.hitMalus = function(surfer) {
      this.bomb.hitMalus(surfer);
    }

    Starline.prototype.bonusHitted = function() {
    }
    Starline.prototype.malusHitted = function() {
    }

    Starline.prototype.beforeRemoval = function() {
      this.star1.selfRemove();
      this.star2.selfRemove();
      this.star3.selfRemove();
      this.bomb.selfRemove();
      this.removeChild(this.star1);
      this.removeChild(this.star2);
      this.removeChild(this.star3);
      this.removeChild(this.bomb);
    }

    Starline.prototype.initialPosition = function() {

    let x = this.wave.params.breaking_center + (200 - Math.random() * 400)*rX;
    let y = 0;

    if(this.wave.direction === RIGHT) {
      x = this.wave.obstacle_cont.globalToLocal(STAGEWIDTH,0) + 120;
    }
    if(this.wave.direction === LEFT) {
      x = this.wave.obstacle_cont.globalToLocal(0,0).x - 120;
    }

    this.setXY(x,y);
  }

}());