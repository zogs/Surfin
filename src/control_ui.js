(function() {

  function ControlUI(params) {

    this.spot = params.spot;

    this.Container_constructor();

    this.init();

  }

  var prototype = createjs.extend(ControlUI, createjs.Container);

  //add EventDispatcher
  createjs.EventDispatcher.initialize(prototype);

  prototype.init = function() {

    this.removeAllChildren();

    this.boost = new createjs.Container();
    let icon = new createjs.Bitmap(queue.getResult('icon_boost'));
    icon.regX = icon.image.width/2;
    icon.regY = icon.image.height/2;
    icon.scale = 0.7;
    icon.alpha = 0.6;
    let btn = new createjs.Shape();
    btn.graphics.beginFill('#FFF').drawCircle(0,0,70);
    btn.alpha = 0.8;
    let shadow = new createjs.Shape();
    shadow.graphics.beginFill('#000').drawCircle(0,4,70);
    shadow.alpha = 0.3;
    this.boost.addChild(shadow);
    this.boost.addChild(btn);
    this.boost.addChild(icon);
    this.boost.cursor = 'pointer';
    this.boost.active = true;
    this.boost.mouseChildren = false;
    this.boost.alpha = 0;
    this.boost.on('mousedown', proxy(this.onBoost,this));
    window.Stage.on('pressup', proxy(this.stopBoost,this));

    this.addChild(this.boost);

    this.show();
  }

  prototype.show = function() {
    if(this.spot.getWave()) {
      this.boost.alpha = 1;
      if(this.spot.getWave().direction === LEFT) {
        this.boost.scaleX = -1;
        this.boost.x = STAGEWIDTH - 100;
        this.boost.y = STAGEHEIGHT - 100;;
      } else {
        this.boost.x = 100;
        this.boost.y = STAGEHEIGHT - 100;;
      }
    } else {
      this.boost.alpha = 0;
      this.boost.x = STAGEWIDTH/2;
      this.boost.y = STAGEHEIGHT - 80;
    }
  }

  prototype.stopBoost = function(e) {
    console.log('stopBoost');
  }

  prototype.onBoost = function(e) {
    console.log('startBoost');
    if(e) e.stopImmediatePropagation();
    if(e.pointerID <= 0) return; //only second touch event

    this.spot.getWave().getSurfer().startBoost();
  }

  prototype.stopBoost = function(e) {
    this.spot.getWave().getSurfer().endBoost();
  }

  prototype.cooldown = function(btn, time) {
    btn.active = false;
    btn.alpha = 0.5;
    btn.cursor = 'none';
    btn.mouseEnabled = false;
    setTimeout(proxy(this.endCooldown, this, [btn]), time);
  }

  prototype.endCooldown = function(btn) {
    btn.active = true;
    btn.alpha = 1;
    btn.cursor = 'normal';
    btn.mouseEnabled = true;
  }

  prototype.selfRemove = function() {

    this.removeAllChildren();

    this.boost.off('click', this.onBoost);
  }



  window.ControlUI = createjs.promote(ControlUI, "Container");

}());