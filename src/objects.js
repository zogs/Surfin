(function() {

  function Obstacle(config) {

    this.Container_constructor();
    this.init(config);
  }

  var prototype = createjs.extend(Obstacle, createjs.Container);
  //add EventDispatcher
  createjs.EventDispatcher.initialize(prototype);

  //init
  prototype.init = function(config) {
    this.config = config || {};
    this.wave = this.config.wave;
    this.spot = this.config.spot;
    this.img = this.config.img != undefined ? this.config.img : 'paddler';
    this.config.name = config.name || 'paddler';

    this.location = new Victor();
    this.ducking = false;
    this.hitted = false;
    this.bodies = [];
    this.bonuses = [];
    this.maluses = [];
    this.duck_y = this.wave.params.height / 5;
    this.speedX = this.config.speedX || 0.5;
    this.speedY = this.config.speedY || 0.5;

    this.image_cont = new createjs.Container();
    this.addChild(this.image_cont);
    this.debug_cont = new createjs.Container();
    this.debug_cont.alpha = 0;
    this.addChild(this.debug_cont);

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

    let x = this.wave.params.breaking_center + (200 - Math.random() * 400);
    let y = Math.random()*this.wave.params.height;

    if(this.wave.direction === RIGHT) {
      x = this.wave.obstacle_cont.globalToLocal(STAGEWIDTH,0).x;
    }
    if(this.wave.direction === LEFT) {
      x = this.wave.obstacle_cont.globalToLocal(0,0).x;
    }

    this.setXY(x,y)
  }

  prototype.tick = function() {

    if(PAUSED) return;
    this.move();
    this.checkRemove();
    this.onEnterFrame();
    this.drawDebug();
  }

  prototype.move = function() {

    const move = new Victor(this.wave.getSuction().x, this.wave.getSuction().y);
    this.location.add(move);
    this.x = this.location.x;
    this.y = this.location.y;
  }

  prototype.setXY = function(x,y) {
    this.x = x;
    this.y = y;
    this.location = new Victor(x,y);
  }

  prototype.drawImage = function() {

    var sheet = new createjs.SpriteSheet({
        images: [queue.getResult('paddler')],
        frames: {width:300, height:300, count:11},
        animations: {
          up: {
            frames: [9,10,9,10,9,10],
            next: "up",
            speed: 0.1
          },
        }
    });

    this.sprite = new createjs.Sprite(sheet);
    this.sprite.scale = 0.5;
    this.sprite.x = 75;
    this.sprite.y = -75;
    this.sprite.scaleX *= this.wave.direction === LEFT ? -1 : 1;
    this.sprite.gotoAndPlay('up');
    this.image_cont.addChild(this.sprite);
  }

  prototype.drawBonus = function() {

    var bonus = new createjs.Shape();
      bonus.graphics.beginFill('green').drawCircle(0,0,20);
      bonus.y = 30;
      bonus.alpha = 0.5;
      this.debug_cont.addChild(bonus);
      this.bonuses.push(bonus);
  }

  prototype.drawMalus = function() {

    var malus = new createjs.Shape();
      malus.graphics.beginFill('red').drawCircle(0,0,20);
      malus.alpha = 0.5;
      this.debug_cont.addChild(malus);
      this.maluses.push(malus);
  }

  prototype.drawDebug = function() {
    this.debug_cont.alpha = (DEBUG===1)? 1 : 0;
  }

  prototype.hitBonus = function(surfer) {

    if(this.disabled === true) return;
    if(this.bonusDisabled === true) return;
    let j = this.bonuses.length;
    while(j--) {
      const bonus = this.bonuses[j];
      const radius = bonus.graphics.command.radius;
      const zone = typeof bonus.hitzone == 'undefined' ? 'board' : bonus.hitzone;
      const x = this.x + bonus.x;
      const y = this.y + bonus.y;

      if(bonus.hitted === true) continue;

      if(surfer.hit(zone,x,y,radius)) {
        bonus.hitted = true;
        this.bonusHitted(surfer, bonus);
        return true;
      }
    }
    return false;
  }

  prototype.hitMalus = function(surfer) {

    if(this.disabled === true) return;
    if(this.malusDisabled === true) return;
    let i = this.maluses.length;
    while(i--) {
      const malus = this.maluses[i];
      const radius = malus.graphics.command.radius;
      const zone = typeof malus.hitzone == 'undefined' ? 'board' : malus.hitzone;
      const x = this.x + malus.x;
      const y = this.y + malus.y;

      if(malus.hitted === true) continue;

      if(surfer.hit(zone,x,y,radius)) {
        malus.hitted = true;
        this.malusHitted(surfer, malus);
        return true;
      }
    }
    return false;
  }


  /*
  prototype.resize = function() {

    //only resize when object is coming to the wave ( not "on" the wave)
    if(this.y < this.wave.params.height) return;

    var scale = 1.5 * (this.wave.y - this.wave.params.height/2 - this.wave.spot.getHorizon()) / (this.wave.spot.getPeak() - this.wave.spot.getHorizon());
    this.scaleX = this.scaleX * scale;
    this.scaleY = this.scaleY * scale;
  }
  */

  prototype.checkRemove = function() {

    if(this.ducking == true) return;

    if(this.y < this.duck_y) {
      this.ducking = true;
      createjs.Tween.get(this)
        .to({ alpha: 0}, 300)
        .call(proxy(this.selfRemove,this));
    }
  }

  prototype.selfRemove = function() {

    this.removeListeners();
    this.wave.removeObstacle(this);
  }

  prototype.onEnterFrame = function() {

  }

  prototype.onInit = function() {

  }

  prototype.bonusHitted = function() {

    this.disable = true;
  }

  prototype.malusHitted = function() {

    this.disable = true;
  }

  //assign Obstacle to window's scope & promote
  window.Obstacle = createjs.promote(Obstacle, "Container");
}());



(function() {

    function FlyObstacle(config) {

      this.speed = config.speed || 10;
      this.amp = config.amp || 0;
      this.high_min = config.high_min || 50;
      this.high_max = config.high_max || Math.random() * STAGEHEIGHT*1/3;
      this.high = this.high_min + Math.random() * (this.high_max - this.high_min);
      this.time = 0;
      this.phase = Math.random() * 1000;
      this.reverse = config.reverse || false;

      this.Obstacle_constructor(config);
    }

    FlyObstacle.prototype = Object.create(Obstacle.prototype);
    FlyObstacle.prototype.constructor = FlyObstacle;
    window.FlyObstacle = createjs.promote(FlyObstacle, "Obstacle");

    FlyObstacle.prototype.move = function() {

      //compense la vitesse de la vague
      let x = (- this.wave.movingX);

      //vitesse reelle
      let speed = this.speed;

      //ajout direction de la vague
      speed *= (this.wave.isLEFT())? 1 : -1;

      //reverse direction if needed
      if(this.reverse) speed *= -1;

      //vitesse horizontale
      x += speed;

      // sinusoide verticale
      this.time += .1;
      let y = (this.amp === 0)? 0 : this.amp * Math.sin(this.time + this.phase);

      const moving = new Victor(x,y);
      this.location.add(moving);
      this.x = this.location.x;
      this.y = this.location.y;

    }

    FlyObstacle.prototype.initialPosition = function() {

      let x = this.wave.params.breaking_center + (200 - Math.random() * 400);
      let y = this.spot.config.lines.break - this.wave.params.height - this.wave.params.height - this.high;

      if(this.wave.isLEFT()) {
        if(this.reverse) x = this.wave.shoulder_left.x + STAGEWIDTH*2;
        else x = this.wave.shoulder_left.x - STAGEWIDTH/2;
      }
      if(this.wave.isRIGHT()) {
        if(this.reverse) x = this.wave.shoulder_right.x - STAGEWIDTH*2;
        else x = this.wave.shoulder_right.x + STAGEWIDTH/2;
      }

      let direction = (this.speed < 0)? -1 : 1;
      x *= direction;

      this.setXY(x,y);
    }

    FlyObstacle.prototype.checkRemove = function() {

      let remove = false;
      if(this.wave.isLEFT()) {
        if(this.reverse && this.x < this.wave.shoulder_left.x - STAGEWIDTH) remove = true;
        else if(this.x > this.wave.shoulder_left.x + STAGEWIDTH * 2) remove = true;
      }

      if(this.wave.isRIGHT()) {
        if(this.reverse && this.x > this.wave.shoulder_right.x + STAGEWIDTH) remove = true;
        else if(this.x < this.wave.shoulder_right.x - STAGEWIDTH * 2) remove = true;
      }

      if(remove === true) {
        this.selfRemove();
      }
    }


}());