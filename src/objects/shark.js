
(function() {

    function Shark(config) {

      config.name = 'shark';
      config.img = 'shark';
      config.speed = 5;

      this.FlyObstacle_constructor(config);
    }

    Shark.prototype = Object.create(FlyObstacle.prototype);
    Shark.prototype.constructor = Shark;
    window.Shark = createjs.promote(Shark, "FlyObstacle");

    Shark.prototype.drawImage = function() {

      var sheet = new createjs.SpriteSheet({
          images: [queue.getResult(this.img)],
          frames: {width:parseInt(200*rX), height:parseInt(80*rY), regX:parseInt(100*rX), regY:parseInt(40*rY)},
          framerate: 5,
          animations: {
              swim: [0,5],
          }
      });

      this.sprite = new createjs.Sprite(sheet);
      this.sprite.scale = 1.5;
      this.sprite.scaleX *= this.wave.isLEFT()? 1 : -1;
      this.sprite.gotoAndPlay('swim');
      this.image_cont.addChild(this.sprite);

    }

    Shark.prototype.drawBonus = function() {

    }

    Shark.prototype.drawMalus = function() {
      var malus = new createjs.Shape();
      malus.graphics.beginFill('red').drawCircle(0,0,30*rX);
      malus.alpha = 0.5;
      malus.y = -30*rX;
      malus.x = -15*rY;
      malus.hitzone = 'board';
      this.debug_cont.addChild(malus);
      this.maluses.push(malus);
    }

    Shark.prototype.malusHitted = function(surfer) {
      let sound1 = createjs.Sound.play("cut");
      let sound2 = createjs.Sound.play("sharkroar");

      surfer.fall('hit shark');
    }

    Shark.prototype.move = function() {
      this.x -= this.speed;
    }
    Shark.prototype.initialPosition = function() {

    let x = this.wave.params.breaking_center + (200 - Math.random() * 400)*rX;
    let y = this.wave.y - this.wave.params.height - this.wave.params.height/2 + Math.random()*this.wave.params.height/2  - 60 *rY;

    if(this.wave.direction === RIGHT) {
      x = this.wave.shoulder_right.x + Math.random() * (this.wave.params.shoulder.right.width*2);
    }
    if(this.wave.direction === LEFT) {
      x = this.wave.shoulder_left.x - Math.random() * (this.wave.params.shoulder.left.width*2);
    }

    this.setXY(x,y);
  }

}());