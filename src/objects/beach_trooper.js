(function() {

    function BeachTrooper(config) {

      config.img = 'beachtrooper';
      config.name = 'beachtrooper';
      this.Obstacle_constructor(config);

    }
    BeachTrooper.prototype = Object.create(Obstacle.prototype);
    BeachTrooper.prototype.constructor = BeachTrooper;
    window.BeachTrooper = createjs.promote(BeachTrooper, "Obstacle");

    BeachTrooper.prototype.drawImage = function() {

      var sheet = new createjs.SpriteSheet({
          images: [queue.getResult('sprite_beachtrooper')],
          frames: {width:368, height:281, regX: 155, regY: 142},
          framerate: 1,
          animations: {
            chill: 0,
            sleep: [1,2,false],
            warned: 3,
            pullout: [4,6,false],
            fire: 7
          }
      });

      this.sprite = new createjs.Sprite(sheet);
      this.sprite.scaleX = this.sprite.scaleY = 0.5;
      this.sprite.y = -50;
      if(this.wave.isLEFT()) this.scaleX = - this.scaleX;
      this.sprite.gotoAndPlay('chill');
      this.image_cont.addChild(this.sprite);

    }

    BeachTrooper.prototype.drawBonus = function() {

      var bonus = new createjs.Shape();
        bonus.graphics.beginFill('green').drawCircle(0,0,50);
        bonus.y = -35;
        bonus.x = 25;
        bonus.alpha = 0.5;
        this.debug_cont.addChild(bonus);
        this.bonuses.push(bonus);
    }

    BeachTrooper.prototype.drawMalus = function() {

      /* no malus */
    }

    BeachTrooper.prototype.bonusHitted = function() {

      SCORE.add(200).say('Stromtrooper kill !', 500);
      createjs.Tween.get(this).to({alpha:0}, 300);
    }

    BeachTrooper.prototype.malusHitted = function() {

      this.wave.surfer.fall('laser_hit');

    }

    BeachTrooper.prototype.onEnterFrame = function() {

      var distance = get2dDistance(this.x,this.y,this.wave.surfer.x,this.wave.surfer.y);

      if(distance < 620) {
        this.sprite.gotoAndPlay('fire');
        this.fire();
        return;
      }
      if(distance < 650) {
        this.sprite.gotoAndPlay('pullout');
        return;
      }
      if(distance < 700) {
        this.sprite.gotoAndStop('warned');
        return;
      }
    }

    BeachTrooper.prototype.fire = function() {

      if(this.fired === true) return;
      this.fired = true;

      var width = 100;
      var speed = 6000;

      var laser = new createjs.Shape();
      laser.graphics.beginStroke('red').setStrokeStyle(3).beginFill('yellow').drawRoundRect(0,0,width * (-1*this.wave.direction),5,1);
      laser.x = - 40 + width;
      laser.y = -75;
      this.image_cont.addChild(laser);

      var start = new createjs.Shape();
      start.graphics.beginFill('white').drawCircle(0,0,8);
      start.x = laser.x - width;
      start.y = laser.y;
      start.hitzone = 'body';
      start.laser = laser;
      start.shotable = true;
      start.onShoted = this.cancelShot;

      var end = start.clone();
      end.x = laser.x;
      end.hitzone = 'none';
      end.laser = laser;
      end.shotable = true;
      end.onShoted = this.cancelShot;

      laser.start = start;
      laser.end = end;

      this.debug_cont.addChild(start,end);
      this.maluses.push(start,end);

      var mask = new createjs.Shape();
      mask.graphics.beginFill('rgba(0,0,0,0)').drawRect(- 40,0,- STAGEWIDTH,-100);
      //this.image_cont.addChild(mask);
      laser.mask = mask;

      createjs.Tween.get(laser).to({x: laser.x + STAGEWIDTH * (-1*this.wave.direction)}, speed);
      createjs.Tween.get(start).to({x: start.x + STAGEWIDTH * (-1*this.wave.direction)}, speed);
      createjs.Tween.get(end).to({x: end.x + STAGEWIDTH * (-1*this.wave.direction)}, speed);

    }

    BeachTrooper.prototype.cancelShot = function() {

      let laser = this.laser;
      let trooper = this.parent.parent;

      trooper.maluses.splice(trooper.maluses.indexOf(laser.start),1);
      trooper.maluses.splice(trooper.maluses.indexOf(laser.end),1);

      createjs.Tween.get(laser).to({alpha: 0, scaleX:0.5},100).call(function() {
        trooper.debug_cont.removeChild(laser.start);
        trooper.debug_cont.removeChild(laser.end);
        trooper.image_cont.removeChild(laser);
      });
    }

}());
