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

    if(USER.hasPower('boost')) this.initButtonBoost();
    if(USER.hasPower('shield')) this.initButtonShield();
    if(USER.hasPower('hadoken')) this.initButtonHadoken();

   //keyboard handlers
    window.onkeyup = proxy(this.onKeyup, this);
    window.onkeydown = proxy(this.onKeypress, this);

    this.set();
  }

  prototype.initButtonBoost = function() {
    this.boost = new createjs.Container();
    let icon = new createjs.Bitmap(queue.getResult('icon_boost'));
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
    this.addChild(this.boost);
  }

  prototype.initButtonShield = function() {
    this.shield = new createjs.Container();
    let icon = new createjs.Bitmap(queue.getResult('icon_shield'));
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
    this.addChild(this.shield);
  }

  prototype.initButtonHadoken = function() {
    this.hadoken = new createjs.Container();
    let icon = new createjs.Bitmap(queue.getResult('icon_hadoken'));
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
    this.addChild(this.hadoken);
  }

  prototype.onKeypress = function(e) {
    switch(e.key)
     {
      case 'b':  this.startBoost(e); break;
      default: window.defaultKeyDownHandler(e);
     }
  }

  prototype.onKeyup = function(e) {
    switch(e.key)
     {
      case 'b':  this.stopBoost(e); break;
      default: window.defaultKeyUpHandler(e);
     }
  }

  prototype.set = function() {
    if(this.spot.getWave()) {
      this.boost.alpha = 1;
      this.shield.alpha = 1;
      this.hadoken.alpha = 1;
      if(this.spot.getWave().direction === LEFT) {
        this.boost.scaleX = -1;
        this.hadoken.scaleX = -1;
        this.shield.scaleX = -1;
        this.boost.x = STAGEWIDTH - 150;
        this.boost.y = STAGEHEIGHT/2;
        this.hadoken.x = this.boost.x + 50;
        this.hadoken.y = this.boost.y - 140;
        this.shield.x = this.boost.x + 50;
        this.shield.y = this.boost.y + 140;
      } else {
        this.boost.scaleX = 1;
        this.hadoken.scaleX = 1;
        this.shield.scaleX = 1;
        this.boost.x = 150;
        this.boost.y = STAGEHEIGHT/2;
        this.hadoken.x = this.boost.x - 50;
        this.hadoken.y = this.boost.y - 140;
        this.shield.x = this.boost.x - 50;
        this.shield.y = this.boost.y + 140;
      }
    } else {
      this.hide();
    }
  }

  prototype.hide = function() {
    this.boost.alpha = 0;
    this.boost.x = STAGEWIDTH/2;
    this.boost.y = STAGEHEIGHT - 80;
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
    this.boost.off('mousedown', this.startBoost);
    this.shield.off('mousedown', this.startShield);
    this.hadoken.off('mousedown', this.startHadoken);
    this.boost.off('pressup', this.stopBoost);
    this.shield.off('pressup', this.stopShield);
    this.hadoken.off('pressup', this.stopHadoken);
  }



  window.ControlUI = createjs.promote(ControlUI, "Container");

}());