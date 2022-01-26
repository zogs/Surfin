(function() {

  function Obstacle(config = {}) {

    this.Container_constructor();
    this.init(config);
  }

  Obstacle.prototype = createjs.extend(Obstacle, createjs.Container);
  //add EventDispatcher
  createjs.EventDispatcher.initialize(Obstacle.prototype);

  //init
  Obstacle.prototype.init = function(config = {}) {

    this.config = config;
    this.wave = this.config.wave || null;
    this.spot = this.config.spot || null;
    this.direction = this.config.direction || 1;
    this.actualDirection = this.direction === LEFT ? 1 : -1;
    this.container = this.config.container || this.wave.obstacle_cont;
    this.img = this.config.img != undefined ? this.config.img : 'paddler';
    this.config.name = config.name || 'paddler';
    this.hp = this.config.hp || 0;

    this.amplitude = config.amplitude || 0;
    this.frequence = config.frequence || 1;
    this.ymin = config.ymin || 50 + 50 * rY;
    this.ymax = config.ymax || Math.random() * STAGEHEIGHT*1/3;
    this.ystart = this.ymin + Math.random() * (this.ymax - this.ymin);

    this.time = 0;
    this.phase = Math.random() * 1000;
    this.reverse = config.reverse || false;
    this.actualScale = 1;
    this.config.scale = config.scale || 1;
    this.config.meter_height = config.meter_height || 0.80;
    this.config.pixel_height = config.pixel_height || 190;
    this.config.size_x = config.size_x || 200;
    this.config.size_y = config.size_y || 200;

    this.location = new Victor();
    this.active = true;
    this.ticker = null;
    this.ducking = false;
    this.hitted = false;
    this.shotables = null;
    this.autoRemove = true;
    this.bonuses = [];
    this.maluses = [];
    this.speedX = this.config.speedX || 0;
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
    this.drawExtra();

    this.center = new createjs.Shape();
    this.center.graphics.beginFill('black').drawCircle(0,0,2);
    this.debug_cont.addChild(this.center);

    this.initialPosition();

    this.onInit();

    this.initSelfListeners();

  }

  Obstacle.prototype.initSelfListeners = function() {

    this.ticker = this.on('tick', this.tick, this);
  }

  Obstacle.prototype.removeSelfListeners = function() {

    this.off('tick', this.ticker);
  }

  Obstacle.prototype.initialPosition = function() {

    let x, y;
    if(this.wave) {
      x = this.wave.params.breaking_center + (200 - Math.random() * 400);
      y = Math.random()*this.wave.params.height;
      if(this.direction === RIGHT) {
        x = this.wave.obstacle_cont.globalToLocal(STAGEWIDTH,0).x + this.config.size_x;
        if(this.reverse) x = this.wave.obstacle_cont.globalToLocal(0,0).x;
      }
      if(this.direction === LEFT) {
        x = this.wave.obstacle_cont.globalToLocal(0,0).x - this.config.size_x;
        if(this.reverse) x = this.wave.obstacle_cont.globalToLocal(STAGEWIDTH,0).x;
      }
    }

    if(this.config.x != null) x = this.config.x;
    if(this.config.y != null) y = this.config.y;

    this.setXY(x,y)
  }

  Obstacle.prototype.tick = function() {

    if(PAUSED) return;
    if(this.wave && this.wave.paused) return;

    this.move();
    this.checkRemove();
    this.onEnterFrame();
    this.drawDebug();
  }

  Obstacle.prototype.move = function() {

      let x = 0;
      //vitesse horizontal additionelle
      let speedX = this.speedX;
      //direction de la vague
      speedX *= (this.direction === LEFT)? 1 : -1;
      //reverse la direction si besoin
      if(this.reverse) speedX *= -1;
      //ajout vitesse horizontale
      x += speedX;

      // vitesse vertical
      let y = 0;
      y += this.speedY;

      // sinusoide verticale
      this.time += 1;
      if(this.amplitude !== 0) y += this.amplitude * Math.sin(this.time*this.frequence + this.phase);

      this.velocity = new Victor(x,y);
      this.location.add(this.velocity);
      this.x = this.location.x;
      this.y = this.location.y;

  }

  Obstacle.prototype.resize = function() {
    if(this.wave) {
      this.actualScale *= this.wave.scaleToFit(this.config.pixel_height, this.config.meter_height);
    }
    if(this.config.scale) {
      this.actualScale *= this.config.scale;
    }
  }

  Obstacle.prototype.setXY = function(x,y) {
    let pos = this.avoidOverlapingXY(x,y);
    this.x = pos.x;
    this.y = pos.y;
    this.location = new Victor(pos.x, pos.y);
  }

  /* shift the given coordinates on the x axis until there is no overlaping with others */
  Obstacle.prototype.avoidOverlapingXY = function(x,y) {
    for(let i=0,ln=this.wave.obstacles.length; i<ln; ++i) {
      const obs = this.wave.obstacles[i];
      const xDist = x - obs.x;
      const yDist = y - obs.y;
      const distance = Math.sqrt(xDist*xDist + yDist*yDist);
      const distanceMax = (this.config.size_x/2 + obs.config.size_x/2);
      if(distance < distanceMax) {
        const xShift = this.config.size_x * this.config.wave.direction*-1;
        x += xShift;
        return this.avoidOverlapingXY(x, y);
      };
    }
    return {x, y};
  }

  Obstacle.prototype.checkRemove = function() {
    if(this.autoRemove === false) return;
    let coord = this.localToGlobal(0,0);
    if(coord.x < -STAGEWIDTH/2) this.selfRemove();
    if(coord.x > STAGEWIDTH*1.5) this.selfRemove();
  }

  Obstacle.prototype.hitBonus = function(surfer) {

    if(this.active === false) return;
    let j = this.bonuses.length;
    while(j--) {
      const bonus = this.bonuses[j];
      const radius = bonus.hitradius == undefined ? bonus.graphics.command.radius : malus.hitradius;
      const zone = typeof bonus.hitzone == 'undefined' ? 'body' : bonus.hitzone;
      const pos = this.localToLocal(bonus.x, bonus.y, this.wave.obstacle_cont);
      const x = pos.x;
      const y = pos.y;

      if(bonus.hitted === true) continue;
      if(bonus.disabled === true) continue;

      if(surfer.hit(zone,x,y,radius)) {
        bonus.hitted = true;
        this.bonusHitted(surfer, bonus);
        var ev = new createjs.Event('bonus_hitted');
				ev.object = this;
				surfer.dispatchEvent(ev);
        return true;
      }
    }
    return false;
  }

  Obstacle.prototype.hitMalus = function(surfer) {

    if(this.active === false) return;
    let i = this.maluses.length;
    while(i--) {
      const malus = this.maluses[i];
      const radius = malus.hitradius == undefined ? malus.graphics.command.radius : malus.hitradius;
      const zone = typeof malus.hitzone == 'undefined' ? 'body' : malus.hitzone;
      const pos = this.localToLocal(malus.x, malus.y, this.wave.obstacle_cont);
      const x = pos.x;
      const y = pos.y;

      if(malus.hitted === true) continue;
      if(malus.disabled === true) continue;

      if(surfer.hit(zone,x,y,radius)) {
        malus.hitted = true;
        this.malusHitted(surfer, malus);
        var ev = new createjs.Event('malus_hitted');
				ev.object = this;
				surfer.dispatchEvent(ev);
        return true;
      }
    }
    return false;
  }

  Obstacle.prototype.selfRemove = function() {
    this.beforeRemoval();
    this.removeSelfListeners();
    if(this.wave) this.wave.removeObstacle(this);
    else this.container.removeChild(this);
    this.afterRemoval();
  }

  /*
    This method should be override by final class
  */
  Obstacle.prototype.beforeRemoval = function() {}

    /*
    This method should be override by final class
  */
  Obstacle.prototype.afterRemoval = function() {}

  /*
    This method should be override by final class
  */
  Obstacle.prototype.drawImage = function() {

    var sheet = new createjs.SpriteSheet({
        images: [QUEUE.getResult('paddler')],
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
  Obstacle.prototype.drawBonus = function() {

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
  Obstacle.prototype.drawMalus = function() {

    var malus = new createjs.Shape();
      malus.graphics.beginFill('red').drawCircle(0,0,20*rY);
      malus.alpha = 0.5;
      this.debug_cont.addChild(malus);
      this.maluses.push(malus);
  }

  /*
    This method should be override by final class
  */
  Obstacle.prototype.drawDebug = function() {
    this.debug_cont.alpha = (DEBUG===1)? 1 : 0;
  }

  /*
    This method should be override by final class
  */
  Obstacle.prototype.drawExtra = function() {
    /* empty by default */
  }

  /*
    This method should be override by final class
  */
  Obstacle.prototype.onEnterFrame = function() {
    /* empty by default */
  }

  /*
    This method should be override by final class
  */
  Obstacle.prototype.onInit = function() {
    /* empty by default */
  }

  /*
    This method should be override by final class
  */
  Obstacle.prototype.bonusHitted = function() {
    /* empty by default */
  }

  /*
    This method should be override by final class
  */
  Obstacle.prototype.malusHitted = function() {

    this.active = false;
  }

  /*
    This method should be override by final class
  */
  Obstacle.prototype.die = function() {
    this.active = false;
    createjs.Tween.get(this).to({alpha: 0}, 500).call(() => this.selfRemove());
  }

  /*
    This method should be override by final class
  */
  Obstacle.prototype.shooted = function(hitter, dmg = 10) {

    this.hp -= dmg;
    if(this.hp <= 0) {
      this.die();
    }
    hitter.impact();
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
        x = this.wave.params.breaking_center + (200 - Math.random() * 400) ;
        y = this.spot.planet.lines.break - this.wave.params.height - this.wave.params.height - this.ystart;
        if(this.wave.direction === RIGHT) {
          x = this.wave.obstacle_cont.globalToLocal(STAGEWIDTH,0).x + this.config.size_x;;
          if(this.reverse) x = this.wave.obstacle_cont.globalToLocal(0,0).x;
        }
        if(this.wave.direction === LEFT) {
          x = this.wave.obstacle_cont.globalToLocal(0,0).x - this.config.size_x;;
          if(this.reverse) x = this.wave.obstacle_cont.globalToLocal(STAGEWIDTH,0).x;
        }
      }

      if(this.config.x !== undefined) x = this.config.x;
      if(this.config.y !== undefined) y = this.config.y;

      this.setXY(x,y);
    }


}());