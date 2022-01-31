
(function() {

    function Shaidhulud(config = {}) {

      config.name = 'shaidhulud';
      config.meter_height = 1;
      config.pixel_height = 150*rY;
      config.speedX = 15;
      config.ymin = -config.wave.params.height;
      config.ymax = 1;
      config.hp = 0;
      config.y = -config.wave.params.height / 2;
      config.imgWidth = Math.floor(937*rX);
      config.imgHeight = Math.floor(300*rY);
      config.xrange = config.xrange || STAGEWIDTH/8;
      config.yrange = config.yrange || 20;

      this.config = config;

      this.xpos = 0;
      this.xshift = 0;
      this.xinit = 0;
      this.ypos = 0;
      this.yvar = 0;
      this.yinit = 0;
      this.xarrival = 0;

      this.FlyObstacle_constructor(config);

      this.direction = -this.wave.direction;
      this.shotables = this.bonuses;
    }

    Shaidhulud.prototype = Object.create(FlyObstacle.prototype);
    Shaidhulud.prototype.constructor = Shaidhulud;
    window.Shaidhulud = createjs.promote(Shaidhulud, "FlyObstacle");

    Shaidhulud.prototype.drawImage = function() {

     var sheet = new createjs.SpriteSheet({
          images: [QUEUE.getResult('shaidhulud')],
          frames: {width: this.config.imgWidth, height: this.config.imgHeight, regX: this.config.imgWidth/2, regY: this.config.imgHeight/2},
          animations: {
            idle: [2],
            ready: [1],
            attack: [0],
            bite: [1,2, false]
          }
      });

      this.sprite = new createjs.Sprite(sheet);
      this.sprite.scale = 1;
      this.sprite.scaleX = this.config.wave.direction === LEFT ? -1 : 1;
      this.sprite.y = 0;
      this.sprite.gotoAndStop('idle');
      this.image_cont.addChild(this.sprite);

      var sheet = new createjs.SpriteSheet({
          images: [QUEUE.getResult('shaidhulud_trail')],
          frames: {width: this.config.imgWidth, height: this.config.imgHeight, regX: this.config.imgWidth/2, regY: this.config.imgHeight/2},
          framerate: 6,
          animations: {
            run: {
                frames: [0,1,2],
                next: 'run',
            },
          }
      });
      this.trail = new createjs.Sprite(sheet);
      this.trail.scale = 1;
      this.trail.scaleX = this.config.wave.direction === LEFT ? -1 : 1;
      this.trail.y = 0;
      this.trail.gotoAndPlay('run');
      this.image_cont.addChild(this.trail);
    }

    Shaidhulud.prototype.drawBonus = function() {

    }

    Shaidhulud.prototype.drawMalus = function() {

      var malus = new createjs.Shape();
        malus.graphics.beginFill('red').drawCircle(0,0,200*rX*this.actualScale);
        malus.x = (this.config.imgWidth/2-150) * -this.direction;
        malus.alpha = 0.5;
        this.debug_cont.addChild(malus);
        this.maluses.push(malus);

      var malus = new createjs.Shape();
        malus.graphics.beginFill('red').drawCircle(0,0,180*rX*this.actualScale);
        malus.x = (this.config.imgWidth/2-150-90) * -this.direction;
        malus.alpha = 0.5;
        this.debug_cont.addChild(malus);
        this.maluses.push(malus);

      var malus = new createjs.Shape();
        malus.graphics.beginFill('red').drawCircle(0,0,180*rX*this.actualScale);
        malus.x = (this.config.imgWidth/2-150-180) * -this.direction;
        malus.alpha = 0.5;
        this.debug_cont.addChild(malus);
        this.maluses.push(malus);

      var malus = new createjs.Shape();
        malus.graphics.beginFill('red').drawCircle(0,0,180*rX*this.actualScale);
        malus.x = (this.config.imgWidth/2-150-260) * -this.direction;
        malus.alpha = 0.5;
        this.debug_cont.addChild(malus);
        this.maluses.push(malus);

    }

    Shaidhulud.prototype.malusHitted = function() {

    }

    Shaidhulud.prototype.initialPosition = function() {

    let x, y;
    if(this.wave) {
      x = 0;
      y = this.wave.params.height;
      if(this.direction === RIGHT) {
        x = 0 - this.config.imgWidth/2;
      }
      if(this.direction === LEFT) {
        x = STAGEWIDTH + this.config.imgWidth/2;
      }
    }
    this.xinit = x;
    this.yinit = y;
    this.image_cont.scaleX = -this.direction;
    this.setXY(x,y)
    this.initArrival();
    this.initVerticalMovement();
  }

  Shaidhulud.prototype.initArrival = function() {

    let tween = createjs.Tween.get(this)
      .call(() => this.sprite.gotoAndStop('idle'))
      .to({xarrival: STAGEWIDTH/5 * -this.direction}, 4000)
      .call(proxy(this.initAttack, this))
        ;
  }

  Shaidhulud.prototype.initVerticalMovement = function() {

    createjs.Tween.get(this)
      .set({yvar: 0})
      .to({yvar: 3}, 500)
      .to({yvar: -3}, 500)
      .call(proxy(this.initVerticalMovement, this))
      ;
  }

  Shaidhulud.prototype.initAttack = function() {

    let xrange = this.config.xrange * this.direction;
    let yrange = -this.config.yrange;

    let tween = createjs.Tween.get(this)
      .wait(5000*Math.random())
      .call(() => this.sprite.gotoAndStop('ready'))
      .wait(800)
      .call(() => this.sprite.gotoAndStop('attack'))
      .to({xshift: xrange, ypos: yrange}, 2000)
      .call(() => this.sprite.gotoAndStop('ready'))
      .to({xshift: 0, ypos: 0}, 2000)
      .call(() => this.sprite.gotoAndStop('idle'))
      .call(proxy(this.initAttack, this))
      ;
  }

  Shaidhulud.prototype.move = function() {

      this.xpos -= this.config.wave.movingX;
      this.x = this.xpos + this.xshift + this.xinit + this.xarrival;
      this.y = this.yinit + this.yvar + this.ypos;

  }

}());


(function() {

    function Shaidhulud2(config = {}) {

      config.name = 'shaidhulud2';
      this.xspeed = 10;
      this.Shaidhulud_constructor(config);
      this.direction = -this.wave.direction;
    }

    Shaidhulud2.prototype = Object.create(Shaidhulud.prototype);
    Shaidhulud2.prototype.constructor = Shaidhulud2;
    window.Shaidhulud2 = createjs.promote(Shaidhulud2, "Shaidhulud");

    Shaidhulud2.prototype.initialPosition = function() {

      let x, y;
      if(this.wave) {
        x = this.wave.params.breaking_center + (200 - Math.random() * 400);
        y = this.wave.params.height;
        if(this.direction === RIGHT) {
          x = this.wave.obstacle_cont.globalToLocal(STAGEWIDTH,0).x + this.config.imgWidth;
        }
        if(this.direction === LEFT) {
          x = this.wave.obstacle_cont.globalToLocal(0,0).x - this.config.imgWidth;
        }
      }
      this.setXY(x,y);
      this.xinit = x;
      this.yinit = y;
      this.initVerticalMovement();
    }

    Shaidhulud2.prototype.move = function() {

        //this.xpos -= this.config.wave.movingX;
        //this.x = this.xpos + this.xshift + this.xinit + this.xspeed;
        this.y = this.yinit + this.ypos + this.ypos;
    }

    Shaidhulud2.prototype.drawMalus = function() {

      var malus = new createjs.Shape();
        malus.graphics.beginFill('red').drawCircle(0,0,200*rX*this.actualScale);
        malus.x = (this.config.imgWidth/2-150) * this.direction;
        malus.alpha = 0.5;
        this.debug_cont.addChild(malus);
        this.maluses.push(malus);

      var malus = new createjs.Shape();
        malus.graphics.beginFill('red').drawCircle(0,0,180*rX*this.actualScale);
        malus.x = (this.config.imgWidth/2-150-90) * this.direction;
        malus.alpha = 0.5;
        this.debug_cont.addChild(malus);
        this.maluses.push(malus);

      var malus = new createjs.Shape();
        malus.graphics.beginFill('red').drawCircle(0,0,180*rX*this.actualScale);
        malus.x = (this.config.imgWidth/2-150-180) * this.direction;
        malus.alpha = 0.5;
        this.debug_cont.addChild(malus);
        this.maluses.push(malus);

      var malus = new createjs.Shape();
        malus.graphics.beginFill('red').drawCircle(0,0,180*rX*this.actualScale);
        malus.x = (this.config.imgWidth/2-150-260) * this.direction;
        malus.alpha = 0.5;
        this.debug_cont.addChild(malus);
        this.maluses.push(malus);

    }

    Shaidhulud2.prototype.onEnterFrame = function() {

      var distance = get2dDistance(this.x,this.y,this.wave.surfer.x,this.wave.surfer.y);
      if(distance < STAGEWIDTH/3) {
        return this.sprite.gotoAndStop('attack');
      }
      if(distance < STAGEWIDTH/2) {
        return this.sprite.gotoAndStop('ready');
      }
    }

    Shaidhulud2.prototype.checkRemove = function() {
      if(this.autoRemove === false) return;
      let coord = this.localToGlobal(0,0);
      if(this.direction === RIGHT && coord.x < -STAGEWIDTH/2) this.selfRemove();
      if(this.direction === LEFT && coord.x > STAGEWIDTH*1.5) this.selfRemove();
    }

}());

(function() {

    function Shaidhulud3(config = {}) {

      config.name = 'shaidhulud3';
      this.xspeed = 10;
      this.Shaidhulud_constructor(config);
      this.direction = -this.wave.direction;
    }

    Shaidhulud3.prototype = Object.create(Shaidhulud.prototype);
    Shaidhulud3.prototype.constructor = Shaidhulud3;
    window.Shaidhulud3 = createjs.promote(Shaidhulud3, "Shaidhulud");

    Shaidhulud3.prototype.initialPosition = function() {

      let x, y;
      if(this.wave) {
        x = this.wave.params.breaking_center + (200 - Math.random() * 400);
        y = this.wave.params.height;
        if(this.direction === RIGHT) {
          x = this.wave.obstacle_cont.globalToLocal(STAGEWIDTH,0).x + this.config.imgWidth;
        }
        if(this.direction === LEFT) {
          x = this.wave.obstacle_cont.globalToLocal(0,0).x - this.config.imgWidth;
        }
      }
      this.setXY(x,y);
      this.xinit = x;
      this.yinit = y;
      this.initVerticalMovement();
    }

    Shaidhulud3.prototype.move = function() {

        //this.xpos -= this.config.wave.movingX;
        //this.x = this.xpos + this.xshift + this.xinit + this.xspeed;
        this.y = this.yinit + this.ypos + this.ypos;
    }

    Shaidhulud3.prototype.drawExtra = function() {

     var sheet = new createjs.SpriteSheet({
          images: [QUEUE.getResult('shaidhulud_rider')],
          frames: {width: parseInt(600*rX), height: parseInt(286*rY), regX: parseInt(600/2*rX), regY: parseInt(286/2*rY)},
          animations: {
            run: { frames: [0,1], next: 'run', speed:0.5},
          }
      });

      let sprite = new createjs.Sprite(sheet);
      sprite.scale = 0.7;
      sprite.scaleX *= this.config.wave.direction === LEFT ? -1 : 1;
      sprite.y = -100;
      sprite.gotoAndPlay('run');
      this.image_cont.addChild(sprite);
    }

    Shaidhulud3.prototype.drawMalus = function() {

      var malus = new createjs.Shape();
        malus.graphics.beginFill('red').drawCircle(0,0,200*rX*this.actualScale);
        malus.x = (this.config.imgWidth/2-150) * this.direction;
        malus.alpha = 0.5;
        this.debug_cont.addChild(malus);
        this.maluses.push(malus);

      var malus = new createjs.Shape();
        malus.graphics.beginFill('red').drawCircle(0,0,180*rX*this.actualScale);
        malus.x = (this.config.imgWidth/2-150-90) * this.direction;
        malus.alpha = 0.5;
        this.debug_cont.addChild(malus);
        this.maluses.push(malus);

      var malus = new createjs.Shape();
        malus.graphics.beginFill('red').drawCircle(0,0,180*rX*this.actualScale);
        malus.x = (this.config.imgWidth/2-150-180) * this.direction;
        malus.alpha = 0.5;
        this.debug_cont.addChild(malus);
        this.maluses.push(malus);

      var malus = new createjs.Shape();
        malus.graphics.beginFill('red').drawCircle(0,0,180*rX*this.actualScale);
        malus.x = (this.config.imgWidth/2-150-260) * this.direction;
        malus.alpha = 0.5;
        this.debug_cont.addChild(malus);
        this.maluses.push(malus);

      var malus = new createjs.Shape();
        malus.graphics.beginFill('red').drawCircle(0,0,90*rX*this.actualScale);
        malus.x = 0 * this.direction;
        malus.y = -100;
        malus.alpha = 0.5;
        this.debug_cont.addChild(malus);
        this.maluses.push(malus);

    }

    Shaidhulud3.prototype.onEnterFrame = function() {

      var distance = get2dDistance(this.x,this.y,this.wave.surfer.x,this.wave.surfer.y);
      if(distance < STAGEWIDTH/3) {
        return this.sprite.gotoAndStop('attack');
      }
      if(distance < STAGEWIDTH/2) {
        return this.sprite.gotoAndStop('ready');
      }
    }

    Shaidhulud3.prototype.checkRemove = function() {
      if(this.autoRemove === false) return;
      let coord = this.localToGlobal(0,0);
      if(this.direction === RIGHT && coord.x < -STAGEWIDTH/2) this.selfRemove();
      if(this.direction === LEFT && coord.x > STAGEWIDTH*1.5) this.selfRemove();
    }

}());