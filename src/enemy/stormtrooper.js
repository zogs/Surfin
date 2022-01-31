
(function() {

    function Stormtrooper(config = {}) {

      config.name = 'stormsurfer';
      config.img = 'stormsurfer';
      config.meter_height = 1.4;
      config.pixel_height = 160*rY;
      config.speedX = 15;

      this.Obstacle_constructor(config);
    }

    Stormtrooper.prototype = Object.create(Obstacle.prototype);
    Stormtrooper.prototype.constructor = Stormtrooper;
    window.Stormtrooper = createjs.promote(Stormtrooper, "Obstacle");

    Stormtrooper.prototype.drawImage = function() {
      let sheet = new createjs.SpriteSheet({
        images: [QUEUE.getResult(this.img)],
        frames: {width: parseInt(256*rX), height: parseInt(256*rY), regX: parseInt(128*rX), regY: parseInt(128*rX)},
        animations: {
          S:0,SE:1,SEE:2,SEEE:3,SEEEE:4,E:5,EN:6,ENN:7,ENNN:8,ENNNN:9,N:10,NW:11,NWW:12,NWWW:13,NWWWW:14,W:15,WS:16,WSS:17,WSSS:18,WSSSS:19,
          takeoff: [20,24, false],
          fall: [25,31, false, 1]
        }
      });

      this.sprite = new createjs.Sprite(sheet);
      this.sprite.scale = this.actualScale;
      this.image_cont.addChild(this.sprite);

      if(this.direction === LEFT) {
        this.sprite.gotoAndStop('E');
      }
      if(this.direction === RIGHT) {
        this.sprite.gotoAndStop('W');
      }
    }

    Stormtrooper.prototype.drawBonus = function() {

    }

    Stormtrooper.prototype.drawMalus = function() {
      var malus = new createjs.Shape();
      malus.graphics.beginFill('red').drawCircle(0,0,40*rX);
      malus.alpha = 0.5;
      malus.x = 0;
      malus.y = 15*rY;
      malus.hitzone = 'body';
      this.debug_cont.addChild(malus);
      this.maluses.push(malus);
    }

    Stormtrooper.prototype.malusHitted = function(surfer) {

      this.die();
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

    Stormtrooper.prototype.onEnterFrame = function() {
      /* */
    }

    Stormtrooper.prototype.die = function() {

      this.active = false;
      this.sprite.gotoAndPlay('fall');
    }


}());