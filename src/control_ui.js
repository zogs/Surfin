(function() {

  function ControlUI(params) {

    this.spot = params.spot;
    const defaults = {
      iconScale: 0.4,
      iconAlpha: 0.6,
      buttonSize: 60,
    }
    this.config = Object.assign({}, defaults, params);

    this.Container_constructor();
    this.init();
  }

  var prototype = createjs.extend(ControlUI, createjs.Container);

  //add EventDispatcher
  createjs.EventDispatcher.initialize(prototype);

  prototype.init = function() {

    this.removeAllChildren();

    this.initButtonBoost();
    this.initButtonShield();
    this.initButtonHadoken();
    this.initButtonJump();

   //keyboard handlers
    window.onkeyup = proxy(this.onKeyup, this);
    window.onkeydown = proxy(this.onKeypress, this);

    this.set();
  }

  prototype.initButtonBoost = function() {
    this.boost = new createjs.Container();
    let icon = new createjs.Bitmap(QUEUE.getResult('icon_boost'));
    icon.regX = icon.image.width/2;
    icon.regY = icon.image.height/2;
    icon.scale = this.config.iconScale;
    icon.alpha = this.config.iconAlpha;
    let btn = new createjs.Shape();
    btn.graphics.beginFill('#FFF').drawCircle(0,0,this.config.buttonSize);
    btn.alpha = 0.8;
    let shadow = new createjs.Shape();
    shadow.graphics.beginFill('#000').drawCircle(0,4,this.config.buttonSize);
    shadow.alpha = 0.3;
    this.boost.addChild(shadow);
    this.boost.addChild(btn);
    this.boost.addChild(icon);
    this.boost.cursor = 'pointer';
    this.boost.pressed = false;
    this.boost.mouseChildren = false;
    this.boost.alpha = 0;
    this.boost.on('mousedown', proxy(this.startBoost,this));
    this.boost.on('pressup', proxy(this.stopBoost,this));
  }

  prototype.initButtonJump = function() {
    this.jump = new createjs.Container();
    let icon = new createjs.Bitmap(QUEUE.getResult('icon_boost'));
    icon.regX = icon.image.width/2;
    icon.regY = icon.image.height/2;
    icon.scale = this.config.iconScale;
    icon.alpha = this.config.iconAlpha;
    icon.rotation = -45;
    let btn = new createjs.Shape();
    btn.graphics.beginFill('#FFF').drawCircle(0,0,this.config.buttonSize);
    btn.alpha = 0.8;
    let shadow = new createjs.Shape();
    shadow.graphics.beginFill('#000').drawCircle(0,4,this.config.buttonSize);
    shadow.alpha = 0.3;
    this.jump.addChild(shadow);
    this.jump.addChild(btn);
    this.jump.addChild(icon);
    this.jump.cursor = 'pointer';
    this.jump.pressed = false;
    this.jump.mouseChildren = false;
    this.jump.alpha = 0;
    this.jump.on('mousedown', proxy(this.startJump,this));
    this.jump.on('pressup', proxy(this.stopJump,this));
  }

  prototype.initButtonShield = function() {
    this.shield = new createjs.Container();
    let icon = new createjs.Bitmap(QUEUE.getResult('icon_shield'));
    icon.regX = icon.image.width/2;
    icon.regY = icon.image.height/2;
    icon.scale = this.config.iconScale;
    icon.alpha = this.config.iconAlpha;
    let btn = new createjs.Shape();
    btn.graphics.beginFill('#FFF').drawCircle(0,0,this.config.buttonSize);
    btn.alpha = 0.8;
    let shadow = new createjs.Shape();
    shadow.graphics.beginFill('#000').drawCircle(0,4,this.config.buttonSize);
    shadow.alpha = 0.3;
    this.shield.addChild(shadow);
    this.shield.addChild(btn);
    this.shield.addChild(icon);
    this.shield.cursor = 'pointer';
    this.shield.pressed = false;
    this.shield.mouseChildren = false;
    this.shield.alpha = 0;
    this.shield.on('mousedown', proxy(this.startShield,this));
    this.shield.on('pressup', proxy(this.stopShield,this));
  }

  prototype.initButtonHadoken = function() {
    this.hadoken = new createjs.Container();
    let icon = new createjs.Bitmap(QUEUE.getResult('icon_hadoken'));
    icon.regX = icon.image.width/2;
    icon.regY = icon.image.height/2;
    icon.scale = this.config.iconScale;
    icon.alpha = this.config.iconAlpha;
    let btn = new createjs.Shape();
    btn.graphics.beginFill('#FFF').drawCircle(0,0,this.config.buttonSize);
    btn.alpha = 0.8;
    let shadow = new createjs.Shape();
    shadow.graphics.beginFill('#000').drawCircle(0,4,this.config.buttonSize);
    shadow.alpha = 0.3;
    this.hadoken.addChild(shadow);
    this.hadoken.addChild(btn);
    this.hadoken.addChild(icon);
    this.hadoken.cursor = 'pointer';
    this.hadoken.pressed = false;
    this.hadoken.mouseChildren = false;
    this.hadoken.alpha = 0;
    this.hadoken.on('mousedown', proxy(this.startHadoken,this));
    this.hadoken.on('pressup', proxy(this.stopHadoken,this));
  }

  prototype.onKeypress = function(e) {
    switch(e.key)
     {
      case 'a':  this.startBoost(e); break;
      case 'z':  this.startHadoken(e); break;
      case 'e':  this.startJump(e); break;
      default: window.defaultKeyDownHandler(e);
     }
  }

  prototype.onKeyup = function(e) {
    switch(e.key)
     {
      case 'a':  this.stopBoost(e); break;
      case 'z':  this.stopHadoken(e); break;
      case 'e':  this.stopJump(e); break;
      default: window.defaultKeyUpHandler(e);
     }
  }

  prototype.set = function() {
    if(this.spot.getWave()) {

      let base, position;
      if(this.spot.getWave().direction === LEFT) {
        base = {x: STAGEWIDTH - 150, y: STAGEHEIGHT/2 };
        position = {
          one : {x: base.x, y: base.y },
          two: {x: base.x + 50, y: base.y - 140 },
          three: {x: base.x + 50, y: base.y + 140 },
          _scaleX: -1,
        }
      }
      if(this.spot.getWave().direction === RIGHT) {
        base = {x: 150, y: STAGEHEIGHT/2 };
        position = {
          one : {x: base.x, y: base.y },
          two: {x: base.x + 50, y: base.y - 140 },
          three: {x: base.x + 50, y: base.y + 140 },
          _scaleX: 1
        }
      }

      this.boost.x = position.one.x;
      this.boost.y = position.one.y;
      this.jump.x = position.two.x;
      this.jump.y = position.two.y;
      this.shield.x = position.three.x;
      this.shield.y = position.three.y;
      this.hadoken.x = position.three.x;
      this.hadoken.y = position.three.y;

      this.boost.alpha = 1;
      this.shield.alpha = 1;
      this.hadoken.alpha = 1;
      this.jump.alpha = 1;

      this.boost.scaleX = position._scaleX;
      this.hadoken.scaleX = position._scaleX;
      this.shield.scaleX = position._scaleX;
      this.jump.scaleX = position._scaleX;

      this.addChild(this.boost);
      this.addChild(this.jump);
      this.addChild(this.hadoken);
      this.addChild(this.shield);

    } else {

      this.boost.y = 1000;
      this.jump.y = 1000;
      this.shield.y = 1000;
      this.hadoken.y = 1000;
    }
  }

  prototype.startBoost = function(e) {
    if(e) e.stopImmediatePropagation();
    if(e && e.pointerID && e.pointerID <= 0) return;
    if(this.boost == undefined) return;
    if(this.boost.pressed === true) return;
    this.spot.getWave().getSurfer().startBoost();
    this.boost.pressed = true;
  }

  prototype.stopBoost = function(e) {
    if(e) e.stopImmediatePropagation();
    if(e && e.pointerID && e.pointerID <= 0) return;
    if(this.boost == undefined) return;
    if(this.boost.pressed === false) return;
    this.spot.getWave().getSurfer().endBoost();
    this.boost.pressed = false;
  }

  prototype.startJump = function(e) {
    if(e) e.stopImmediatePropagation();
    if(e && e.pointerID && e.pointerID <= 0) return;
    if(this.jump == undefined) return;
    if(this.jump.pressed === true) return;
    this.spot.getWave().getSurfer().startJump();
    this.jump.pressed = true;
  }

  prototype.stopJump = function(e) {
    if(e) e.stopImmediatePropagation();
    if(e && e.pointerID && e.pointerID <= 0) return;
    if(this.jump == undefined) return;
    if(this.jump.pressed === false) return;
    this.spot.getWave().getSurfer().endJump();
    this.jump.pressed = false;
  }

  prototype.startShield = function(e) {
    if(e) e.stopImmediatePropagation();
    if(e && e.pointerID && e.pointerID <= 0) return;
    if(this.shield == undefined) return;
    if(this.shield.pressed === true) return;
    this.spot.getWave().getSurfer().shieldToggle();
    this.shield.pressed = true;
  }

  prototype.stopShield = function(e) {
    if(e) e.stopImmediatePropagation();
    if(e && e.pointerID && e.pointerID <= 0) return;
    if(this.shield == undefined) return;
    if(this.shield.pressed === false) return;
    this.spot.getWave().getSurfer().shieldToggle();
    this.shield.pressed = false;
  }

  prototype.startHadoken = function(e) {
    if(e) e.stopImmediatePropagation();
    if(e && e.pointerID && e.pointerID <= 0) return;
    if(this.hadoken == undefined) return;
    if(this.hadoken.pressed === true) return;
    this.spot.getWave().getSurfer().hadokenFire();
    this.hadoken.pressed = true;
  }

  prototype.stopHadoken = function(e) {
    if(e) e.stopImmediatePropagation();
    if(e && e.pointerID && e.pointerID <= 0) return;
    if(this.hadoken == undefined) return;
    if(this.hadoken.pressed === false) return;
    //this.spot.getWave().getSurfer().weapons.hadoken.close();
    this.hadoken.pressed = false;
  }

  prototype.cooldown = function(btn, time) {
    btn.pressed = false;
    btn.alpha = 0.5;
    btn.cursor = 'none';
    btn.mouseEnabled = false;
    setTimeout(proxy(this.endCooldown, this, [btn]), time);
  }

  prototype.endCooldown = function(btn) {
    btn.pressed = true;
    btn.alpha = 1;
    btn.cursor = 'normal';
    btn.mouseEnabled = true;
  }

  prototype.selfRemove = function() {

    this.removeAllChildren();
    this.jump.off('mousedown', this.startHadoken);
    this.boost.off('mousedown', this.startBoost);
    this.shield.off('mousedown', this.startShield);
    this.hadoken.off('mousedown', this.startHadoken);
    this.jump.off('pressup', this.stopBoost);
    this.boost.off('pressup', this.stopBoost);
    this.shield.off('pressup', this.stopShield);
    this.hadoken.off('pressup', this.stopHadoken);
  }



  window.ControlUI = createjs.promote(ControlUI, "Container");

}());