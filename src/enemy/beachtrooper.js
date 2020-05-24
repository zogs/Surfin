(function() {

    function Beachtrooper(config = {}) {

      config.img = 'beachtrooper';
      config.name = 'beachtrooper';
      config.meter_height = 1;
      config.pixel_height = 200*rY;

      this.Obstacle_constructor(config);

    }
    Beachtrooper.prototype = Object.create(Obstacle.prototype);
    Beachtrooper.prototype.constructor = Beachtrooper;
    window.Beachtrooper = createjs.promote(Beachtrooper, "Obstacle");

    Beachtrooper.prototype.drawImage = function() {

      var sheet = new createjs.SpriteSheet({
          images: [queue.getResult('sprite_beachtrooper')],
          frames: {width:parseInt(380*rX), height:parseInt(280*rY), regX: parseInt(190*rX), regY: parseInt(140*rY)},
          framerate: 10,
          animations: {
            chill: [0,1, 'chill'],
            fire: [2,8, false],
            fall: [9, 14, false]
          }
      });

      this.sprite = new createjs.Sprite(sheet);
      this.sprite.scale = this.actualScale;
      this.sprite.x = 30 * rX;
      this.sprite.y = -30 * rY;
      if(this.direction === LEFT) this.sprite.scaleX *= -1;
      this.sprite.gotoAndPlay('chill');
      this.image_cont.addChild(this.sprite);

    }

    Beachtrooper.prototype.drawBonus = function() {

      var bonus = new createjs.Shape();
        bonus.graphics.beginFill('green').drawCircle(0,0,80*rX*this.actualScale);
        bonus.hitzone = 'body';
        bonus.alpha = 0.5;
        this.debug_cont.addChild(bonus);
        this.bonuses.push(bonus);
    }

    Beachtrooper.prototype.drawMalus = function() {

      /* no malus */
    }

    Beachtrooper.prototype.bonusHitted = function() {

      this.die();
    }

    Beachtrooper.prototype.die = function() {

      this.sprite.gotoAndPlay('fall');
      this.sprite.on('animationend', (ev) => {
        createjs.Tween.get(this.sprite).to({alpha: 0}, 500)
          .call(() => this.selfRemove())
      })
      this.active = false;
    }

    Beachtrooper.prototype.malusHitted = function() {

      this.wave.surfer.fall('laser_hit');

    }

    Beachtrooper.prototype.onEnterFrame = function() {
      return;
      var distance = get2dDistance(this.x,this.y,this.wave.surfer.x,this.wave.surfer.y);

      if(distance < 620*rX) {
        this.sprite.gotoAndPlay('fire');
        this.fire();
        return;
      }
    }

    Beachtrooper.prototype.fire = function() {

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

    Beachtrooper.prototype.cancelShot = function() {

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
