(function() {

    function Bomb(config = {}) {

      config.img = 'bomb';
      config.name = 'bomb';
      config.meter_height = 0.9;
      config.pixel_height = 140*rY;

      this.Obstacle_constructor(config);

      this.shotables = this.maluses;

    }
    Bomb.prototype = Object.create(Obstacle.prototype);
    Bomb.prototype.constructor = Bomb;
    window.Bomb = createjs.promote(Bomb, "Obstacle");

    Bomb.prototype.drawImage = function() {
      var sheet = new createjs.SpriteSheet({
          images: [QUEUE.getResult('bomb')],
          frames: {width:parseInt(200*rX), height:parseInt(200*rY), regX: parseInt(100*rX), regY: parseInt(100*rY)},
          framerate: 1,
          animations: {
            normal: [0],
            prox: [1, 2, 'prox', 1],
            timer: [3, 6, false, 2],
          }
      });

      this.bomb = new createjs.Sprite(sheet);
      this.bomb.scale = this.actualScale;
      this.bomb.scaleX *= this.actualDirection;
      this.bomb.gotoAndPlay('prox');
      this.image_cont.addChild(this.bomb);

      var sheet = new createjs.SpriteSheet({
          images: [QUEUE.getResult('boom')],
          frames: {width:parseInt(312*rX), height:parseInt(285*rY), regX: parseInt(155*rX), regY: parseInt(142*rY)},
          framerate: 10,
          animations: {
              explode: [0, 5, false],
          }
      });

      this.boom = new createjs.Sprite(sheet);
      this.boom.scale = this.actualScale;
      this.boom.gotoAndStop(0);
      this.boom.y = -80*rY*this.actualScale;
      this.boom.alpha = 0;
      this.image_cont.addChild(this.boom);

    }

    Bomb.prototype.drawBonus = function() {

    }

    Bomb.prototype.drawMalus = function() {

      var malus = new createjs.Shape();
        malus.graphics.beginFill('red').drawCircle(0,0,50*rX*this.actualScale);
        malus.y = 0;
        malus.x = 5 * rX;
        malus.alpha = 0.5;
        malus.hitzone = 'body';
        this.debug_cont.addChild(malus);
        this.maluses.push(malus);
    }

    Bomb.prototype.die = function() {

      this.boom.alpha = 1;
      this.boom.gotoAndPlay('explode');
      let sound = createjs.Sound.play("bombBoom");
      this.bomb.alpha = 0;
      this.boom.on('animationend', (ev) => {
        createjs.Tween.get(this.boom).to({alpha: 0}, 500).call(() => this.selfRemove())
      });
      this.active = false;
      this.hitted = true;
    }

    Bomb.prototype.malusHitted = function() {

      this.die();
    }


}());

(function() {

    function BombTriplet(config = {}) {

      this.defaultConfig = config;

      config.img = 'bombTriplet';
      config.name = 'bombTriplet';
      config.meter_height = 0.9;
      config.pixel_height = 140*rY;

      this.config = config;

      const types = ['top', 'middle', 'bottom', 'top2', 'bottom2', 'topbottom', 'triple'];
      console.log(this.defaultConfig);
      this.type = config.type ? config.type : types[Math.floor(Math.random()*(types.length+1))];

      this.Obstacle_constructor(config);

      this.shotables = this.bombs;

    }
    BombTriplet.prototype = Object.create(Obstacle.prototype);
    BombTriplet.prototype.constructor = BombTriplet;
    window.BombTriplet = createjs.promote(BombTriplet, "Obstacle");

    BombTriplet.prototype.drawImage = function() {

      this.bombs = [];

      if(this.type === 'top' || this.type === 'top2' || this.type === 'triple') {
        this.topBomb = new Bomb(Object.assign({},this.defaultConfig));
        this.topBomb.autoRemove = false;
        this.topBomb.setXY(0, this.config.wave.params.height - this.config.wave.params.height*2/3 - this.config.pixel_height/1/4);
        this.addChild(this.topBomb);
        this.bombs.push(this.topBomb);
      }

      if(this.type === 'middle' || this.type === 'top2' || this.type === 'bottom2' || this.type === 'triple') {
        this.middleBomb = new Bomb(Object.assign({},this.defaultConfig));
        this.middleBomb.autoRemove = false;
        this.middleBomb.setXY(0, this.config.wave.params.height - this.config.wave.params.height*1/3 - this.config.pixel_height/1/4);
        this.addChild(this.middleBomb);
        this.bombs.push(this.middleBomb);
      }

      if(this.type === 'bottom' || this.type === 'bottom2' || this.type === 'triple') {
        this.bottomBomb = new Bomb(Object.assign({},this.defaultConfig));
        this.bottomBomb.autoRemove = false;
        this.bottomBomb.setXY(0, this.config.wave.params.height - this.config.pixel_height/1/4);
        this.addChild(this.bottomBomb);
        this.bombs.push(this.bottomBomb);
      }

    }

    BombTriplet.prototype.drawBonus = function() {
    }

    BombTriplet.prototype.drawMalus = function() {
    }

    BombTriplet.prototype.bonusHitted = function() {
    }

    BombTriplet.prototype.hitBonus = function(surfer) {
      if(this.topBomb) this.topBomb.hitBonus(surfer);
      if(this.middleBomb) this.middleBomb.hitBonus(surfer);
      if(this.bottomBomb) this.bottomBomb.hitBonus(surfer);
    }

    BombTriplet.prototype.hitMalus = function(surfer) {
      if(this.topBomb) this.topBomb.hitMalus(surfer);
      if(this.middleBomb) this.middleBomb.hitMalus(surfer);
      if(this.bottomBomb) this.bottomBomb.hitMalus(surfer);
    }

    BombTriplet.prototype.bonusHitted = function() {
    }
    BombTriplet.prototype.malusHitted = function() {
    }

    BombTriplet.prototype.beforeRemoval = function() {
      if(this.topBomb) {
        this.topBomb.selfRemove();
        this.removeChild(this.topBomb);
      }
      if(this.middleBomb) {
        this.middleBomb.selfRemove();
        this.removeChild(this.middleBomb);
      }
      if(this.bottomBomb) {
         this.bottomBomb.selfRemove();
         this.removeChild(this.bottomBomb);
      }
    }

    BombTriplet.prototype.initialPosition = function() {

    let x = this.wave.params.breaking_center + (200 - Math.random() * 400)*rX;
    let y = 0;

    if(this.wave.direction === RIGHT) {
      x = this.wave.obstacle_cont.globalToLocal(STAGEWIDTH,0) + 120;
    }
    if(this.wave.direction === LEFT) {
      x = this.wave.obstacle_cont.globalToLocal(0,0).x - 120;
    }

    this.setXY(x,y);
  }

}());
