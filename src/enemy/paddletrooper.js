(function() {

    function Paddletrooper(config = {}) {

      config.name = 'paddletrooper';
      config.img = 'sprite_paddle';
      config.meter_height = 1.5;
      config.pixel_height = 100*rY;
      config.y = config.wave.params.height * 1/2 + Math.random() * (config.wave.params.height * 1/2)

      this.Obstacle_constructor(config);

      this.shotable = this.bonuses;

    }
    Paddletrooper.prototype = Object.create(Obstacle.prototype);
    Paddletrooper.prototype.constructor = Paddletrooper;
    window.Paddletrooper = createjs.promote(Paddletrooper, "Obstacle");

    Paddletrooper.prototype.drawImage = function() {

      var sheet = new createjs.SpriteSheet({
          images: [QUEUE.getResult('sprite_paddle')],
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

    Paddletrooper.prototype.drawBonus = function() {

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

    Paddletrooper.prototype.drawMalus = function() {

      /* */
    }

    Paddletrooper.prototype.drawAttackMalus = function() {

      var maluses = new createjs.Shape();
        maluses.graphics.beginFill('red').drawCircle(0,0,60*rX*this.actualScale);
        maluses.y = -60 * this.actualScale;
        maluses.hitzone = 'body';
        maluses.alpha = 0.5;
        this.debug_cont.addChild(maluses);
        this.maluses.push(maluses);
    }

    Paddletrooper.prototype.removeAttackMalus= function() {

      this.debug_cont.removeChildAt(this.debug_cont.numChildren-1);
      this.maluses = [];
    }

    Paddletrooper.prototype.bonusHitted = function() {

      this.die();
    }


    Paddletrooper.prototype.malusHitted = function() {

    }

    Paddletrooper.prototype.onEnterFrame = function() {

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

    Paddletrooper.prototype.attack = function() {

      this.sprite.gotoAndPlay('attack');
      this.status = 'attack';
      setTimeout(proxy(this.drawAttackMalus, this), 250);
      this.sprite.on('animationend', proxy(this.attackEnded, this));

    }

    Paddletrooper.prototype.attackEnded = function() {

      this.removeAttackMalus();
      this.status = 'iddle';
    }

    Paddletrooper.prototype.die = function() {
      this.active = false;
      this.status = 'dead';
      this.sprite.gotoAndPlay('fall');
      this.sprite.on('animationend', (ev) => {
          createjs.Tween.get(this).to({alpha:0}, 500).call(() => this.selfRemove());
      })
    }
}());
