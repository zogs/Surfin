
(function() {

    function Stormtrooper(config) {

      config.name = 'stormtrooper';
      config.img = 'stormsurfer';

      this.Obstacle_constructor(config);
      this.increment = Math.random();
      this.step = (Math.random()*100 >= 50)? 0.1 : -0.1;
      this.amplitude = Math.random()*5;
      this.speed = -(5+Math.random(5));
    }

    Stormtrooper.prototype = Object.create(Obstacle.prototype);
    Stormtrooper.prototype.constructor = Stormtrooper;
    window.Stormtrooper = createjs.promote(Stormtrooper, "Obstacle");

    Stormtrooper.prototype.drawImage = function() {
      let w = parseInt(300*rX);
      let h = parseInt(300*rY);
      let sheet = new createjs.SpriteSheet({
        images: [queue.getResult(this.img)],
        frames: {width: w, height: h},
        animations: {S:0,SE:1,SEE:2,SEEE:3,SEEEE:4,E:5,EN:6,ENN:7,ENNN:8,ENNNN:9,N:10,NW:11,NWW:12,NWWW:13,NWWWW:14,W:15,WS:16,WSS:17,WSSS:18,WSSSS:19}
      });

      this.sprite = new createjs.Sprite(sheet);
      this.sprite.scale = 0.7;
      this.sprite.regX = w/2;
      this.sprite.regY = h/2
      if(this.wave.direction === LEFT) this.sprite.scaleX *= -1;
      this.sprite.gotoAndPlay('W');
      this.image_cont.addChild(this.sprite);
    }

    Stormtrooper.prototype.drawBonus = function() {

    }

    Stormtrooper.prototype.drawMalus = function() {
      var malus = new createjs.Shape();
      malus.graphics.beginFill('red').drawCircle(0,0,30*rX);
      malus.alpha = 0.5;
      malus.x = 0;
      malus.y = 30*rY;
      malus.hitzone = 'board';
      this.debug_cont.addChild(malus);
      this.maluses.push(malus);
    }

    Stormtrooper.prototype.malusHitted = function(surfer) {
      surfer.fall('hit stormtrooper');
    }

    Stormtrooper.prototype.move = function() {
      this.x -= this.speed;
      this.y += Math.sin(this.increment)*this.amplitude;
      this.increment += this.step;
    }

    Stormtrooper.prototype.initialPosition = function() {

      let x = this.wave.params.breaking_center + (200 - Math.random() * 400);
      let y = this.wave.params.height/2;

      if(this.wave.direction === RIGHT) {
        x = this.wave.obstacle_cont.globalToLocal(STAGEWIDTH,0).x;
      }
      if(this.wave.direction === LEFT) {
        x = this.wave.obstacle_cont.globalToLocal(0,0).x;
      }

      this.setXY(x,y)
    }

}());