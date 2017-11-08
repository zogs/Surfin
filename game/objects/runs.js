(function() {
  
  function Run(spot) {

    this.Container_constructor();

    this.waves = [];
    this.paddlers = [];

    this.isRun = true;
    this.timers = [];
    this.time_scale = (TIME_SCALE) ? TIME_SCALE : 1;

    this.id = spot.id;
    this.name = spot.name;
    this.config = spot.config

    //Score
    this.score_cont = new createjs.Container();
    this.addChild(this.score_cont);

    this.background = new createjs.Container();
    this.addChild(this.background);

    this.sea_cont = new createjs.Container();
    this.addChild(this.sea_cont);

    this.frontground = new createjs.Container();
    this.addChild(this.frontground);

    this.overlay_veil = new createjs.Container();
    this.addChild(this.overlay_veil);
    this.drawOverlayVeil();

    this.overlay_cont = new createjs.Container();
    this.addChild(this.overlay_cont);
    
    this.debug_cont = new createjs.Container();
    this.addChild(this.debug_cont); 

    this.drawBackground();
    this.drawFrontground();

  }

  var prototype = createjs.extend(Run, createjs.Container);

  prototype.drawBackground = function() {

    this.background.removeAllChildren();

    const defaultbkg = new createjs.Shape();
    defaultbkg.graphics.beginFill('#0d4e6d').drawRect(0,0,STAGEWIDTH,STAGEHEIGHT);
    this.background.addChild(defaultbkg);

    const skyimage = new createjs.Bitmap(queue.getResult('spot_back'));
    this.background.addChild(skyimage);

    const seagradient = new createjs.Shape();
    seagradient.graphics
          .beginLinearGradientFill([this.config.colors.top,this.config.colors.bottom],[0,1],0,this.config.lines.horizon,0,STAGEHEIGHT)
          .drawRect(0,this.config.lines.horizon,STAGEWIDTH,STAGEHEIGHT)
          ;
    this.background.addChild(seagradient);

    const image1 = new createjs.Bitmap(queue.getResult('spot_seariddle'));
    image1.alpha = 0.2;
    image1.y = this.config.lines.horizon;
    this.riddles1 = image1;
    this.background.addChild(image1);

    const image2 = new createjs.Bitmap(queue.getResult('spot_seariddle'));
    image2.alpha = 0.2;
    image2.y = this.config.lines.horizon;
    image2.skewX = 1;
    this.riddles2 = image2;
    this.background.addChild(image2);

    this.animateBackground();
  }

  prototype.animateBackground = function() {

    if(PERF <= 2) return;

    createjs.Tween.get(this.riddles1,{override: true, loop:true}).to({ x: this.riddles1.x + 20 }, 1500).to({x: this.riddles1.x }, 1500);
    createjs.Tween.get(this.riddles2,{override: true, loop:true}).to({ x: this.riddles2.x - 20 }, 1500).to({x: this.riddles2.x }, 1500);
  }

  prototype.drawFrontground = function() {

    const frontimage = new createjs.Bitmap(queue.getResult('spot_front'));
    frontimage.alpha = 0.4;
    this.frontground.addChild(frontimage);
  }

  prototype.init = function() {

    this.initEventsListeners();   
    this.initScore();
    this.resetScore();
    //this.addWave(0.3);
    this.addWave(); 
    this.addSurfer();    

    this.wave.initBreak(STAGEWIDTH/2);   
  }

  prototype.addWave = function(coef) {

    var coef = coef || 1;

    var config = this.config.waves;
    config.spot = this;
    config.height = this.config.waves.height * coef
    config.width = this.config.waves.width * coef
    config.y = this.config.lines.horizon + (this.config.lines.peak - this.config.lines.horizon) * coef;
    config.x = 0;

    var wave = new Wave(config);    
    this.sea_cont.addChild(wave);
    this.waves.push(wave);
    this.wave = wave;
  }

  prototype.addSurfer = function() {

    var surfer = new Surfer({
      x: STAGEWIDTH/2,
      y: 10,
      wave: this.wave,
      spot: this,
      config: this.config.surfers
    });

    surfer.automove = true;        
    surfer.alpha = 0; //hide surfer temporaly
    TEST = 1; // avoid auto surfer to fall  
    surfer.saber_length = 0;
    this.wave.playerTakeOff(surfer);

    createjs.Tween.get(surfer.virtualMouse).to({y: this.wave.y + surfer.y }, 2000).to({y: this.wave.y - this.wave.params.height*1/3 }, 500);
    createjs.Tween.get(surfer.virtualMouse).to({x: this.wave.x + surfer.x - this.wave.params.breaking.width * 2}, 2000);
    createjs.Tween.get(surfer).wait(1500).to({saber_length: 80}, 1000);
    createjs.Tween.get(surfer).wait(1000).to({alpha: 1}, 1000)
      .call(function() { 
        surfer.automove = false; 
        TEST = 0; 
      });

  }

  prototype.initEventsListeners = function() {

    this.addEventListener('tick',proxy(this.tick,this));
   
    stage.on('player_fallen',function(event) {  
      this.playerFalling(event);
    },this,true);

    stage.on('level_up',function(event) {
      this.levelUp(event.level);
    },this,true);
  }

  prototype.tick = function() {

    if(PAUSED) return;

    this.drawDebug();

  }

  prototype.initScore = function() {

    //Score   
    this.score_cont.removeAllChildren();
    this.score = new Score();
    this.score.alpha = 0;
    this.score.setSpot(this);
    this.score_cont.addChild(this.score);
  }

  prototype.resetScore = function() {
    this.score.reset();
  }

  prototype.showScore = function() {
    this.score.alpha = 1;
  }

  prototype.playerFalling = function(event) {
    
    if(TEST) return;

    //stop useless interval
    window.clearInterval(this.wave.clearnerInterval);
    //freaze the wave after 6s
    this.stopWaveTimeout = setTimeout(proxy(this.stopWaveAfterFall,this), 6000);    
    //launch fall screen
    this.initFallScreen();
  }

  prototype.stopWaveAfterFall = function() {
        
    this.wave.removeAllEventListeners('tick');
  }

  prototype.removeAllOverlays = function() {

    this.overlay_cont.removeAllChildren();

  }

  prototype.initFallScreen = function(e) {

    this.overlay_cont.removeAllChildren();

    this.overlay_cont.addChild(SCREENS.getFallScreen(this));

  }


  prototype.initSkillScreen = function(e) {

    this.overlay_cont.removeAllChildren();

    this.removeAllWaves();

    this.overlay_cont.addChild(SCREENS.getSkillScreen(this));
    
  }

  prototype.removeSkillScreen = function() {

    this.overlay_cont.removeAllChildren();

    this.init();
  }

  prototype.levelUp = function() {

    var cont = new createjs.Container();
    cont.x = STAGEWIDTH*3/4;
    cont.y = STAGEHEIGHT*3/4;
    var star = new createjs.Shape();
    star.graphics.beginFill('red').drawPolyStar(0,0,150,10,0.5);  
    star.alpha = 0.6;
    cont.addChild(star);

    var text = new createjs.Text("Level Up !","30px Arial", "#FFF");
    text.x = - text.getBounds().width/2;
    text.y = - text.getBounds().height/2;
    cont.addChild(text);

    cont.scaleX = cont.scaleY = 0;
    createjs.Tween.get(cont).to({scaleX:1,scaleY:1},1000,createjs.Ease.bounceOut);
    createjs.Tween.get(star).to({rotation:2},1000,createjs.Ease.quartIn);

    this.overlay_cont.addChild(cont);
  }

  prototype.fallRetry = function(e) {


    clearTimeout(this.stopWaveTimeout);

    //clear scene
    this.overlay_cont.removeAllChildren();
    
    //reset this spot
    this.init();

    e.stopPropagation();
    e.remove();
  }

  prototype.getWave = function() {

    return this.wave;
  }

  prototype.setTimeScale = function(scale) {

    this.time_scale = scale;
    this.waves.map(w => w.setTimeScale(scale));
  }

  prototype.pause = function() {

    for(var i=0; i < this.waves.length; ++i) {
      this.waves[i].pause();
    }

    for(var i=0; i < this.timers.length; ++i) {
      this.timers[i].pause();
    }
  }

  prototype.resume = function() {

    for(var i=0; i < this.waves.length; ++i) {
      this.waves[i].resume();
    }

    for(var i=0; i < this.timers.length; ++i) {
      this.timers[i].resume();
    }
  }

  prototype.drawDebug = function() {

    if(DEBUG === 1) this.debug_cont.alpha = 1;
    else this.debug_cont.alpha = 0;
  }

  prototype.drawOverlayVeil = function() {

    var veil = new createjs.Shape();
    veil.graphics.beginFill('white').drawRect(0,0,STAGEWIDTH,STAGEHEIGHT);
    this.overlay_veil.addChild(veil);
    this.overlay_veil.alpha = 0;
    this.overlay_veil.mouseEnabled = false;
  }

  prototype.showOverlayVeil = function(percent)
  {
    var max = 0.8;
    this.overlay_veil.alpha = percent/100*max;
  }

  prototype.hideOverlayVeil = function() {

    if(this.overlay_veil.alpha === 0) return;
    var time = this.overlay_veil.alpha * 1000;
    createjs.Tween.get(this.overlay_veil).to({alpha: 0}, time);
  }

  window.Run = createjs.promote(Run,'Container');

}());