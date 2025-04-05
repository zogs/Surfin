(function() {

  function ControlUI(params) {

    this.spot = params.spot;
    const defaults = {
      iconScale: 0.4,
      iconAlpha: 0.6,
      buttonSize: 60,
      holdTime: 300,
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

    this.initBoostButton();
    this.initShieldButton();
    this.initFireButton();
    this.initJumpButton();

   //keyboard handlers
    window.onkeyup = proxy(this.onKeyup, this);
    window.onkeydown = proxy(this.onKeypress, this);

    this.set();
  }

  prototype.initBoostButton = function() {
    this.boost = new createjs.Container();
    let icon = new createjs.Bitmap(QUEUE.getResult('icon_boost'));
    icon.regX = icon.image.width/2;
    icon.regY = icon.image.height/2;
    icon.scale = this.config.iconScale;
    icon.alpha = this.config.iconAlpha;
    let btn = new createjs.Shape();
    btn.graphics.beginFill('#FFF').drawCircle(0,0,this.config.buttonSize);
    btn.alpha = 0.6;
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
  }

  prototype.initJumpButton = function() {
    this.jump = new createjs.Container();
    let icon = new createjs.Bitmap(QUEUE.getResult('icon_boost'));
    icon.regX = icon.image.width/2;
    icon.regY = icon.image.height/2;
    icon.scale = this.config.iconScale;
    icon.alpha = this.config.iconAlpha;
    icon.rotation = -45;
    let btn = new createjs.Shape();
    btn.graphics.beginFill('#FFF').drawCircle(0,0,this.config.buttonSize);
    btn.alpha = 0.6;
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
  }

  prototype.initShieldButton = function() {
    this.shield = new createjs.Container();
    let icon = new createjs.Bitmap(QUEUE.getResult('icon_shield'));
    icon.regX = icon.image.width/2;
    icon.regY = icon.image.height/2;
    icon.scale = this.config.iconScale;
    icon.alpha = this.config.iconAlpha;
    let btn = new createjs.Shape();
    btn.graphics.beginFill('#FFF').drawCircle(0,0,this.config.buttonSize);
    btn.alpha = 0.6;
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
  }

  prototype.initFireButton = function() {
    this.fire = new createjs.Container();
    let icon = new createjs.Bitmap(QUEUE.getResult('icon_hadoken'));
    icon.regX = icon.image.width/2;
    icon.regY = icon.image.height/2;
    icon.scale = this.config.iconScale;
    icon.alpha = this.config.iconAlpha;
    let btn = new createjs.Shape();
    btn.graphics.beginFill('#FFF').drawCircle(0,0,this.config.buttonSize);
    btn.alpha = 0.6;
    let shadow = new createjs.Shape();
    shadow.graphics.beginFill('#000').drawCircle(0,4,this.config.buttonSize);
    shadow.alpha = 0.3;
    this.fire.addChild(shadow);
    this.fire.addChild(btn);
    this.fire.addChild(icon);
    this.fire.cursor = 'pointer';
    this.fire.pressed = false;
    this.fire.hold = false;
    this.fire.mouseChildren = false;
    this.fire.alpha = 0;
    this.fire.on('mousedown', proxy(this.holdFireButton,this));
  }

  prototype.holdFireButton = function() {
    if(this.fire.pressed === false) {
      this.fire.pressed = true;
      this.holdButtonTimer = new Timer(proxy(this.holdFireButtonSuccess, this), this.config.holdTime);
    }
    window.Stage.on('stagemouseup', proxy(this.cancelHoldFireButton,this), null, true);
  }

  prototype.cancelHoldFireButton = function() {
    if(this.fire.hold === false) {
      this.startHadoken();
    }
    this.fire.pressed = false;
    this.fire.hold = false;
    this.holdButtonTimer.clear();
    this.stopShield();
  }

  prototype.holdFireButtonSuccess = function() {
    this.fire.hold = true;
    this.startShield();
  }

  prototype.onKeypress = function(e) {
    switch(e.key)
     {
      case 'a':  this.startBoost(e); break;
      case 'z':  this.holdFireButton(); break;
      case 'e':  this.startJump(e); break;
      default: window.defaultKeyDownHandler(e);
     }
  }

  prototype.onKeyup = function(e) {
    switch(e.key)
     {
      case 'a':  this.stopBoost(e); break;
      case 'z':  this.cancelHoldFireButton(); break;
      case 'e':  this.stopJump(e); break;
      default: window.defaultKeyUpHandler(e);
     }
  }

  prototype.set = function() {
    if(this.spot.getWave()) {

      let base, position;
      if(this.spot.getWave().direction === LEFT) {
        base = {x: STAGEWIDTH - 100, y: STAGEHEIGHT/3 };
        position = {
          one : {x: base.x, y: base.y },
          two: {x: base.x, y: base.y - 140 },
          three: {x: base.x - 120, y: base.y - 70 },
          _scaleX: -1,
        }
      }
      if(this.spot.getWave().direction === RIGHT) {
        base = {x: 100, y: STAGEHEIGHT/3 };
        position = {
          one : {x: base.x, y: base.y },
          two: {x: base.x, y: base.y - 140 },
          three: {x: base.x + 120, y: base.y - 70 },
          _scaleX: 1
        }
      }

      this.boost.x = position.one.x;
      this.boost.y = position.one.y;
      this.jump.x = position.two.x;
      this.jump.y = position.two.y;
      this.shield.x = position.three.x;
      this.shield.y = position.three.y;
      this.fire.x = position.three.x;
      this.fire.y = position.three.y;

      this.boost.alpha = 1;
      this.shield.alpha = 1;
      this.fire.alpha = 1;
      this.jump.alpha = 1;

      this.boost.scaleX = position._scaleX;
      this.fire.scaleX = position._scaleX;
      this.shield.scaleX = position._scaleX;
      this.jump.scaleX = position._scaleX;

      this.addChild(this.boost);
      this.addChild(this.jump);
      this.addChild(this.fire);
      //this.addChild(this.shield);

    } else {

      this.boost.y = 1000;
      this.jump.y = 1000;
      this.shield.y = 1000;
      this.fire.y = 1000;
    }
  }

  prototype.startBoost = function(e) {
    if(e) e.stopImmediatePropagation();
    if(e && e.pointerID && e.pointerID <= 0) return;
    if(this.boost == undefined) return;
    if(this.boost.pressed === true) return;
    this.spot.getWave().getSurfer().startBoost();
    this.boost.pressed = true;
    window.Stage.on('stagemouseup', proxy(this.stopBoost,this), null, true);
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
    window.Stage.on('stagemouseup', proxy(this.stopJump,this), null, true);
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
    window.Stage.on('stagemouseup', proxy(this.stopShield,this), null, true);
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
    if(this.fire == undefined) return;
    this.spot.getWave().getSurfer().hadokenFire();
    this.fire.pressed = true;
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
    this.jump.off('mousedown', this.startJump);
    this.jump.off('pressup', this.stopJump);
    this.shield.off('mousedown', this.startShield);
    this.shield.off('pressup', this.stopShield);
    this.boost.off('mousedown', this.startBoost);
    this.boost.off('pressup', this.stopBoost);
    this.fire.off('mouseup', this.holdFireButton);
    this.fire.off('pressup', this.cancelHoldFireButton);
  }



  window.ControlUI = createjs.promote(ControlUI, "Container");

}());