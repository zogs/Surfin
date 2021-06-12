
(function() {

    function Arachnid(config = {}) {

      config.name = 'arachnid';
      config.img = 'arachnid';
      config.meter_height = 1;
      config.pixel_height = 150*rY;
      config.hp = 0;
      config.attackRange = 500;

      this.Obstacle_constructor(config);

      this.shotable = this.bonuses;
      this.attacking = false;
      this.attacked = false;
    }

    Arachnid.prototype = Object.create(Obstacle.prototype);
    Arachnid.prototype.constructor = Arachnid;
    window.Arachnid = createjs.promote(Arachnid, "Obstacle");

    Arachnid.prototype.drawImage = function() {
      var sheet = new createjs.SpriteSheet({
          images: [QUEUE.getResult(this.img)],
          frames: {width:parseInt(500*rX), height:parseInt(400*rY), regX:parseInt(250*rX), regY:parseInt(200*rY)},
          framerate: 15,
          animations: {
              bite: {
                frames: [0,1,2,1],
                next: 'bite',
              },
              attack: {
                frames: [3,4,5,6,7,8,9],
                next: 'bite',
                speed: 2,
              },
              die: {
                frames: [10,11,12],
                next: false,
              },
          }
      });

      this.sprite = new createjs.Sprite(sheet);
      this.sprite.scale = 0.5;
      this.sprite.y = 0;
      this.sprite.gotoAndPlay('bite');
      this.image_cont.addChild(this.sprite);

    }

    Arachnid.prototype.drawBonus = function() {
      var bonus = new createjs.Shape();
        bonus.graphics.beginFill('green').drawCircle(0,0,80*rX*this.actualScale);
        bonus.alpha = 0.5;
        bonus.x = 0;
        bonus.y = 0;
        this.debug_cont.addChild(bonus);
        this.bonuses.push(bonus);
    }

    Arachnid.prototype.drawMalus = function() {

      var malus = new createjs.Shape();
        malus.graphics.beginFill('red').drawCircle(0,0,80*rX*this.actualScale);
        malus.x = 0;
        malus.y = 0;
        malus.alpha = 0.5;
        this.debug_cont.addChild(malus);
        this.maluses.push(malus);
    }

    Arachnid.prototype.drawExtra = function() {

      var range = new createjs.Shape();
      range.graphics.beginStroke('#AAA').setStrokeStyle(5).drawCircle(0,0,this.config.attackRange*rX);
      range.alpha = 0.2;
      this.debug_cont.addChild(range);
    }

    Arachnid.prototype.malusHitted = function() {
      this.active = false;
    }

    Arachnid.prototype.onEnterFrame = function() {
      let distance = get2dDistance(this.x,this.y,this.wave.surfer.x,this.wave.surfer.y);
      if(this.active && this.attacking === false && distance <= this.config.attackRange*rX) {
        this.attack();
      }
    }

    Arachnid.prototype.attack = function() {
      this.attacking = true;
      this.sprite.stop();
      this.sprite.gotoAndPlay('attack');
      this.sprite.on('animationend',(ev) => {
        if(ev.name !== 'attack') return;
        if(this.attacked === false) {
          let malus = new createjs.Shape();
          malus.graphics.beginFill('red').drawCircle(0,0,60*rX*this.actualScale);
          malus.x = 70;
          malus.y = 0;
          malus.alpha = 0.2;
          this.debug_cont.addChild(malus);
          this.maluses.push(malus);
        }
        this.attacking = true;
        this.attacked = true;
        this.sprite.gotoAndPlay('attack');
      })
    }

    Arachnid.prototype.die = function() {
      this.active = false;
      this.sprite.stop();
      this.sprite.gotoAndPlay('die');
      this.sprite.on('animationend', (ev) => {
        if(ev.name === 'die') {
          createjs.Tween.get(this.sprite).to({alpha:0, y:-10}, 250).call(() => {
            this.selfRemove();
          });
        }
      });
    }

    Arachnid.prototype.removeSelfListeners = function() {
      this.off('tick', this.tickering);
  }

}());