(function() {

    function PaddleTrooper(config = {}) {

      config.name = 'paddletrooper';
      config.img = 'sprite_paddle';
      config.meter_height = 1.5;
      config.pixel_height = 100*rY;

      this.Obstacle_constructor(config);

    }
    PaddleTrooper.prototype = Object.create(Obstacle.prototype);
    PaddleTrooper.prototype.constructor = PaddleTrooper;
    window.PaddleTrooper = createjs.promote(PaddleTrooper, "Obstacle");

    PaddleTrooper.prototype.drawImage = function() {

      var sheet = new createjs.SpriteSheet({
          images: [queue.getResult('sprite_paddle')],
          frames: {width:parseInt(256*rX), height:parseInt(256*rY), regX: parseInt(128*rX), regY: parseInt(128*rY)},
          framerate: 8,
          animations: {
            run: [0,4, 'run'],
            fall: [5,6, false],
            attack: [7,10, 'run']
          }
      });

      this.sprite = new createjs.Sprite(sheet);
      this.sprite.scale = this.actualScale;
      this.sprite.y = -70 * this.actualScale;
      this.sprite.x = 0 * this.actualScale;
      if(this.direction === RIGHT) this.sprite.scaleX *= -1;
      this.sprite.gotoAndPlay('run');
      this.status = 'run';
      this.image_cont.addChild(this.sprite);

    }

    PaddleTrooper.prototype.drawBonus = function() {

      var bonus = new createjs.Shape();
        bonus.graphics.beginFill('green').drawCircle(0,0,40*rX*this.actualScale);
        bonus.y = -20 * this.actualScale;
        bonus.hitzone = 'body';
        bonus.alpha = 0.5;
        this.debug_cont.addChild(bonus);
        this.bonuses.push(bonus);

      var trigger = new createjs.Shape();
        trigger.graphics.beginFill('orange').drawCircle(0,0,20*rX*this.actualScale);
        trigger.y = -100 * this.actualScale;
        trigger.x = 50 * this.actualDirection * this.actualScale;
        trigger.alpha = 0.5;
        this.debug_cont.addChild(trigger);
        this.trigger = trigger;
    }

    PaddleTrooper.prototype.drawMalus = function() {

      /* */
    }

    PaddleTrooper.prototype.drawAttackMalus = function() {

      var maluses = new createjs.Shape();
        maluses.graphics.beginFill('red').drawCircle(0,0,60*rX*this.actualScale);
        maluses.y = -60 * this.actualScale;
        maluses.hitzone = 'body';
        maluses.alpha = 0.5;
        this.debug_cont.addChild(maluses);
        this.maluses.push(maluses);
    }

    PaddleTrooper.prototype.removeAttackMalus= function() {

      this.debug_cont.removeChildAt(this.debug_cont.numChildren-1);
      this.maluses = [];
    }

    PaddleTrooper.prototype.bonusHitted = function() {

      this.die();
    }


    PaddleTrooper.prototype.malusHitted = function() {

    }

    PaddleTrooper.prototype.onEnterFrame = function() {

      let surfer = this.wave.surfer;
      let x = this.trigger.x + this.x;
      let y = this.y + this.trigger.y;
      let radius = this.trigger.graphics.command.radius;

      if(surfer.hit('body', x, y, radius)) {
        if(this.status == 'run') {
          this.attack();
        }
      }
    }

    PaddleTrooper.prototype.attack = function() {

      this.sprite.gotoAndPlay('attack');
      this.status = 'attack';
      setTimeout(proxy(this.drawAttackMalus, this), 250);
      this.sprite.on('animationend', proxy(this.attackEnded, this));

    }

    PaddleTrooper.prototype.attackEnded = function() {

      this.removeAttackMalus();
      this.status = 'iddle';
    }

    PaddleTrooper.prototype.die = function() {
      this.active = false;
      this.status = 'dead';
      this.sprite.gotoAndPlay('fall');
      this.sprite.on('animationend', (ev) => {
          createjs.Tween.get(this).to({alpha:0}, 500).call(() => this.selfRemove());
      })
    }
}());
