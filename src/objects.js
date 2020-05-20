(function() {

  function Obstacle(config = {}) {

    this.Container_constructor();
    this.init(config);
  }

  var prototype = createjs.extend(Obstacle, createjs.Container);
  //add EventDispatcher
  createjs.EventDispatcher.initialize(prototype);

  //init
  prototype.init = function(config = {}) {

    this.config = config;
    this.wave = this.config.wave || null;
    this.spot = this.config.spot || null;
    this.direction = this.config.direction || 1;
    this.actualDirection = this.direction === LEFT ? 1 : -1;
    this.container = this.config.container || this.wave.obstacle_cont;
    this.img = this.config.img != undefined ? this.config.img : 'paddler';
    this.config.name = config.name || 'paddler';

    this.amplitude = config.amplitude || 0;
    this.high_min = config.high_min || 50 + 50 * rY;
    this.high_max = config.high_max || Math.random() * STAGEHEIGHT*1/2;
    this.high = this.high_min + Math.random() * (this.high_max - this.high_min);

    this.time = 0;
    this.phase = Math.random() * 1000;
    this.reverse = config.reverse || false;
    this.actualScale = 1;
    this.config.scale = config.scale || 1;
    this.config.meter_height = config.meter_height || 0.80;
    this.config.pixel_height = config.pixel_height || 190;

    this.location = new Victor();
    this.active = true;
    this.ducking = false;
    this.hitted = false;
    this.bodies = [];
    this.bonuses = [];
    this.maluses = [];
    this.speedX = this.config.speedX || 10;
    this.speedY = this.config.speedY || 0;
    this.velocity = null;

    this.image_cont = new createjs.Container();
    this.addChild(this.image_cont);
    this.debug_cont = new createjs.Container();
    this.debug_cont.alpha = 0;
    this.addChild(this.debug_cont);

    this.resize();

    this.drawImage();
    this.drawMalus();
    this.drawBonus();

    this.center = new createjs.Shape();
    this.center.graphics.beginFill('black').drawCircle(0,0,2);
    this.debug_cont.addChild(this.center);

    this.initialPosition();

    this.onInit();

    this.initListeners();
  }

  prototype.initListeners = function() {

    this.addEventListener('tick',proxy(this.tick,this));
  }

  prototype.removeListeners = function() {

    this.removeAllEventListeners('tick');
  }

  prototype.initialPosition = function() {

    let x, y;
    if(this.wave) {
      x = this.wave.params.breaking_center + (200 - Math.random() * 400);
      y = Math.random()*this.wave.params.height;
      if(this.direction === RIGHT) {
        x = this.wave.obstacle_cont.globalToLocal(STAGEWIDTH,0).x;
        if(this.reverse) x = this.wave.obstacle_cont.globalToLocal(0,0).x;
      }
      if(this.direction === LEFT) {
        x = this.wave.obstacle_cont.globalToLocal(0,0).x;
        if(this.reverse) x = this.wave.obstacle_cont.globalToLocal(STAGEWIDTH,0).x;
      }
    }

    if(this.config.x !== undefined) x = this.config.x;
    if(this.config.y !== undefined) y = this.config.y;

    this.setXY(x,y)
  }

  prototype.tick = function() {

    if(PAUSED) return;
    if(this.wave && this.wave.paused) return;

    this.move();
    this.checkRemove();
    this.onEnterFrame();
    this.drawDebug();
  }

  prototype.move = function() {

      let x = 0;

      //compense la vitesse de la vague
      if(this.wave) x = -this.wave.movingX;

      //vitesse reelle
      let speedX = this.speedX;

      //ajout direction de la vague
      speedX *= (this.direction === LEFT)? 1 : -1;

      //reverse direction if needed
      if(this.reverse) speedX *= -1;

      //vitesse horizontale
      x += speedX;

      // vitesse vertical
      let y = 0;

      y += this.speedY;

      // sinusoide verticale
      this.time += 1;
      if(this.amplitude !== 0) y += this.amplitude * Math.sin(this.time/10 + this.phase);

      this.velocity = new Victor(x,y);
      this.location.add(this.velocity);
      this.x = this.location.x;
      this.y = this.location.y;

  }

  prototype.resize = function() {
    if(this.wave) {
      this.actualScale *= this.wave.scaleToFit(this.config.pixel_height, this.config.meter_height);
    }
    if(this.config.scale) {
      this.actualScale *= this.config.scale;
    }
  }

  prototype.setXY = function(x,y) {
    this.x = x;
    this.y = y;
    this.location = new Victor(x,y);
  }

  prototype.checkRemove = function() {

    let coord = this.localToGlobal(0,0);
    if(coord.x < -STAGEWIDTH/2) this.selfRemove();
    if(coord.x > STAGEWIDTH*1.5) this.selfRemove();
  }

  prototype.hitBonus = function(surfer) {

    if(this.active === false) return;
    let j = this.bonuses.length;
    while(j--) {
      const bonus = this.bonuses[j];
      const radius = bonus.hitradius == undefined ? bonus.graphics.command.radius : malus.hitradius;
      const zone = typeof bonus.hitzone == 'undefined' ? 'board' : bonus.hitzone;
      const x = this.x + bonus.x;
      const y = this.y + bonus.y;

      if(bonus.hitted === true) continue;
      if(bonus.disabled === true) continue;

      if(surfer.hit(zone,x,y,radius)) {
        bonus.hitted = true;
        this.bonusHitted(surfer, bonus);
        return true;
      }
    }
    return false;
  }

  prototype.hitMalus = function(surfer) {

    if(this.active === false) return;
    let i = this.maluses.length;
    while(i--) {
      const malus = this.maluses[i];
      const radius = malus.hitradius == undefined ? malus.graphics.command.radius : malus.hitradius;
      const zone = malus.hitzone == undefined ? 'board' : malus.hitzone;
      const x = this.x + malus.x;
      const y = this.y + malus.y;

      if(malus.hitted === true) continue;
      if(malus.disabled === true) continue;

      if(surfer.hit(zone,x,y,radius)) {
        malus.hitted = true;
        this.malusHitted(surfer, malus);
        return true;
      }
    }
    return false;
  }

  prototype.selfRemove = function() {

    this.removeListeners();
    if(this.wave) this.wave.removeObstacle(this);
    else this.container.removeChild(this);
  }

  /*
    This method should be override by final class
  */
  prototype.drawImage = function() {

    var sheet = new createjs.SpriteSheet({
        images: [queue.getResult('paddler')],
        frames: {width:parseInt(300*rX), height:parseInt(300*rY), count:11},
        animations: {
          up: {
            frames: [9,10,9,10,9,10],
            next: "up",
            speed: 0.1
          },
        }
    });

    this.sprite = new createjs.Sprite(sheet);
    this.sprite.x = 75 * rX;
    this.sprite.y = -75 * rY;
    this.sprite.scaleX *= this.direction === LEFT ? -1 : 1;
    this.sprite.gotoAndPlay('up');
    this.image_cont.addChild(this.sprite);
  }

  /*
    This method should be override by final class
  */
  prototype.drawBonus = function() {

    var bonus = new createjs.Shape();
      bonus.graphics.beginFill('green').drawCircle(0,0,20*rY);
      bonus.y = 30*rY;
      bonus.alpha = 0.5;
      this.debug_cont.addChild(bonus);
      this.bonuses.push(bonus);
  }

  /*
    This method should be override by final class
  */
  prototype.drawMalus = function() {

    var malus = new createjs.Shape();
      malus.graphics.beginFill('red').drawCircle(0,0,20*rY);
      malus.alpha = 0.5;
      this.debug_cont.addChild(malus);
      this.maluses.push(malus);
  }

  /*
    This method should be override by final class
  */
  prototype.drawDebug = function() {
    this.debug_cont.alpha = (DEBUG===1)? 1 : 0;
  }


  /*
    This method should be override by final class
  */
  prototype.onEnterFrame = function() {
    /* empty by default */
  }

  /*
    This method should be override by final class
  */
  prototype.onInit = function() {
    /* empty by default */
  }

  /*
    This method should be override by final class
  */
  prototype.bonusHitted = function() {

    this.active = false;
  }

  /*
    This method should be override by final class
  */
  prototype.malusHitted = function() {

    this.active = false;
  }

  /*
    This method should be override by final class
  */
  prototype.die = function() {

    this.active = false;
    createjs.Tween.get(this).to({alpha: 0}, 500).call(() => this.selfRemove());
  }

  /*
    This method should be override by final class
  */
  prototype.shooted = function(where, what) {

    console.log('Obstacle is shooted. No handler...');
  }

  //assign Obstacle to window's scope & promote
  window.Obstacle = createjs.promote(Obstacle, "Container");
}());



(function() {

    function FlyObstacle(config = {}) {

      this.Obstacle_constructor(config);
    }

    FlyObstacle.prototype = Object.create(Obstacle.prototype);
    FlyObstacle.prototype.constructor = FlyObstacle;
    window.FlyObstacle = createjs.promote(FlyObstacle, "Obstacle");


    FlyObstacle.prototype.initialPosition = function() {

      let x, y;
      if(this.wave) {
        x = this.wave.params.breaking_center + (200 - Math.random() * 400);
        y = this.spot.planet.lines.break - this.wave.params.height - this.wave.params.height - this.high;
        if(this.wave.direction === RIGHT) {
          x = this.wave.obstacle_cont.globalToLocal(STAGEWIDTH,0).x;
          if(this.reverse) x = this.wave.obstacle_cont.globalToLocal(0,0).x;
        }
        if(this.wave.direction === LEFT) {
          x = this.wave.obstacle_cont.globalToLocal(0,0).x;
          if(this.reverse) x = this.wave.obstacle_cont.globalToLocal(STAGEWIDTH,0).x;
        }
      }

      if(this.config.x !== undefined) x = this.config.x;
      if(this.config.y !== undefined) y = this.config.y;

      this.setXY(x,y);
    }

    FlyObstacle.prototype.checkRemove = function() {

      let coord = this.localToGlobal(0,0);
      if(coord.x < -STAGEWIDTH/2) this.selfRemove();
      if(coord.x > STAGEWIDTH*1.5) this.selfRemove();
    }


}());