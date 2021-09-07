
(function() {

    function Seafish(config = {}) {

      config.name = 'seafish';
      config.img = 'seafish';
      config.meter_height = 1;
      config.pixel_height = 150*rY;
      config.hp = 0;
      config.attackRange = 300;

      this.Obstacle_constructor(config);

      this.shotables = this.bonuses;
      this.attacking = false;
      this.attacked = false;
    }

    Seafish.prototype = Object.create(Obstacle.prototype);
    Seafish.prototype.constructor = Seafish;
    window.Seafish = createjs.promote(Seafish, "Obstacle");

    Seafish.prototype.drawImage = function() {
      var sheet = new createjs.SpriteSheet({
          images: [QUEUE.getResult(this.img)],
          frames: {width:parseInt(400*rX), height:parseInt(200*rY), regX:parseInt(200*rX), regY:parseInt(100*rY)},
          framerate: 200,
          animations: {
              swim: {
                frames: [0,1],
                next: 'swim',
                speed: 0.01,
              },
              attack: {
                frames: [2,3,4,5,6,7,8,9],
                next: false,
              },
              die: {
                frames: [10,11,12],
                next: false,
              },
          }
      });

      this.sprite = new createjs.Sprite(sheet);
      this.sprite.scale = 1;
      this.sprite.y = 0;
      this.sprite.gotoAndPlay('swim');
      this.image_cont.addChild(this.sprite);

      this.shadow = new createjs.Sprite(sheet);
      this.shadow.scale = 1;
      this.shadow.alpha = 0.2;
      this.shadow.gotoAndPlay('swim');
      this.image_cont.addChild(this.shadow);

      let mask = new createjs.Shape();
      mask.graphics.beginFill('#000').drawRect(0,0,400, 100);
      mask.regX = 200;
      mask.y = -85;
      this.sprite.mask = mask;
      //this.image_cont.addChild(mask);

    }

    Seafish.prototype.drawBonus = function() {
      var bonus = new createjs.Shape();
        bonus.graphics.beginFill('green').drawCircle(0,0,80*rX*this.actualScale);
        bonus.alpha = 0.5;
        bonus.x = 0;
        bonus.y = 0;
        this.debug_cont.addChild(bonus);
        this.bonuses.push(bonus);
    }

    Seafish.prototype.drawMalus = function() {

      var malus = new createjs.Shape();
        malus.graphics.beginFill('red').drawCircle(0,0,100*rX*this.actualScale);
        malus.x = 0;
        malus.y = 0;
        malus.alpha = 0.5;
        this.debug_cont.addChild(malus);
        this.maluses.push(malus);
    }

    Seafish.prototype.drawExtra = function() {

      var range = new createjs.Shape();
      range.graphics.beginStroke('#AAA').setStrokeStyle(5).drawCircle(0,0,this.config.attackRange*rX);
      range.alpha = 0.2;
      this.debug_cont.addChild(range);
    }

    Seafish.prototype.malusHitted = function() {
      this.active = false;
    }

    Seafish.prototype.onEnterFrame = function() {
      let distance = get2dDistance(this.x,this.y,this.wave.surfer.x,this.wave.surfer.y);
      if(this.active && this.attacking === false && distance <= this.config.attackRange*rX) {
        this.attack();
      }
    }

    Seafish.prototype.attack = function() {
      this.attacking = true;
      this.sprite.stop();
      this.sprite.gotoAndPlay('attack');
      this.shadow.stop();
      this.shadow.gotoAndPlay('attack');
      this.sprite.on('animationend',(ev) => {
        if(ev.name !== 'attack') return;
        if(this.attacked === false) {
          let malus = new createjs.Shape();
          malus.graphics.beginFill('red').drawCircle(0,0,40*rX*this.actualScale);
          malus.x = 120;
          malus.y = -40;
          malus.alpha = 0.2;
          this.debug_cont.addChild(malus);
          this.maluses.push(malus);
        }
        this.attacking = true;
        this.attacked = true;
      })
    }

    Seafish.prototype.die = function() {
      this.active = false;
      this.sprite.stop();
      this.sprite.gotoAndPlay('die');
      this.shadow.stop();
      this.shadow.gotoAndPlay('die');
      this.sprite.on('animationend', (ev) => {
        if(ev.name === 'die') {
          createjs.Tween.get(this).to({alpha:0, y:-10}, 250).call(() => {
            this.selfRemove();
          });
        }
      });
    }

    Seafish.prototype.removeSelfListeners = function() {
      this.off('tick', this.tickering);
  }

}());