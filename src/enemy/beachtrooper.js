(function() {

    function Beachtrooper(config = {}) {

      config.img = 'beachtrooper';
      config.name = 'beachtrooper';
      config.meter_height = 1;
      config.pixel_height = 200*rY;
      config.size_x = 380;
      config.size_y = 190;

      this.Obstacle_constructor(config);

      this.shotables = this.bonuses;

    }
    Beachtrooper.prototype = Object.create(Obstacle.prototype);
    Beachtrooper.prototype.constructor = Beachtrooper;
    window.Beachtrooper = createjs.promote(Beachtrooper, "Obstacle");

    Beachtrooper.prototype.drawImage = function() {

      var sheet = new createjs.SpriteSheet({
          images: [QUEUE.getResult('sprite_beachtrooper')],
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

      let rant = new createjs.SpriteSheet({
        images: [QUEUE.getResult('rant')],
        frames: {width:parseInt(64*rX), height:parseInt(64*rY), regX: parseInt(32*rX), regY: parseInt(32*rY)},
        framerate: 3,
        animations: {
          hide: [0],
          rant: [1, 5, false],
          die: {frames: [5,4], next: false, speed:1}

        }
      });
      this.rant = new createjs.Sprite(rant);
      this.rant.scale = 1;
      this.rant.y = -80 * rY;
      this.rant.x = -20;
      this.rant.gotoAndPlay('hide');
      this.image_cont.addChild(this.rant);


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

      console.log(this.rant);
      this.rant.gotoAndPlay('die');
      this.rant.alpha = 1;
      createjs.Tween.get(this.rant).to({y: this.rant.y - 30, alpha: 0.8}, 500, createjs.Ease.quartOut).to({alpha: 0, y: -100}, 300);
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

      var end = start.clone();
      end.x = laser.x;
      end.hitzone = 'none';
      end.laser = laser;

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
