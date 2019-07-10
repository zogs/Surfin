//=============================
// SURFER BOT
//=============================

(function() {

  function Menu(planets) {

    this.Container_constructor();
    this.planets = planets;

    this.bkg_cont = new createjs.Container();
    this.addChild(this.bkg_cont);

    this.nav_cont = new createjs.Container();
    this.addChild(this.nav_cont);

    this.deco_cont = new createjs.Container();
    this.deco_cont.mouseEnabled = false;
    this.addChild(this.deco_cont);

    this.acti_cont = new createjs.Container();
    this.addChild(this.acti_cont);

    this.init();
  }

  var prototype = createjs.extend(Menu, createjs.Container);

  prototype.open = function(e) {

    this.status = 'opened';
    SPOT.pause();
    createjs.Tween.get(this).to({rotation:0, alpha:1}, 777, createjs.Ease.quartOut);

    if(e) e.stopImmediatePropagation();
  }

  prototype.close = function(e) {

    this.status = 'closed';
    SPOT.resume();
    createjs.Tween.get(this).to({rotation:40, alpha:0}, 777, createjs.Ease.quartOut);

    if(e) e.stopImmediatePropagation();
  }

  prototype.switch = function() {

    if(this.status == 'closed') return this.open();
    if(this.status == 'opened') return this.close();
  }

  prototype.init = function() {

    this.status = 'initiated';
    this.cplanet = '';
    let that = this;

    //background
    this.tablet = new createjs.Bitmap(queue.getResult('spacetablet'));
    this.regX = this.tablet.image.width;
    this.regY = this.tablet.image.height;
    this.x = this.tablet.image.width;
    this.y = this.tablet.image.height;
    this.rotation = 20;
    this.alpha = 0;
    this.bkg_cont.addChild(this.tablet);

    //planets
    let startx = 0;
    let starty = 0;
    let previous = null;
    let padding = 50*rY;
    for(let i=0,ln=this.planets.length; i<ln; i++) {
      let config = this.planets[i];
      if(config.active == false) continue;
      let planet = new createjs.Bitmap(queue.getResult(config.id));
      planet.name = config.name;
      planet.regX = planet.image.width/2;
      planet.regY = planet.image.height/2;
      planet.x = startx;
      if(previous) starty += previous.image.height + padding;
      planet.y = starty + planet.image.height/2;
      previous = planet;
      this.nav_cont.addChild(planet);
      // click
      if(config.unlock == true) {
        planet.cursor = 'pointer';
        planet.on('click', function(e) {
            that.loadPlanet(planet.name);
        });
      }
      //or lock
      else {
        let circle = new createjs.Shape();
        circle.graphics.beginFill('#586073').beginStroke('#FFF').setStrokeStyle(2).drawCircle(0,0,planet.image.width/2);
        circle.x = planet.x;
        circle.y = planet.y;
        circle.alpha = 0.5;
        this.nav_cont.addChild(circle);
        let lock = new createjs.Bitmap(queue.getResult('lock'));
        lock.regX = lock.image.width/2;
        lock.regY = lock.image.height/2;
        lock.x = planet.x;
        lock.y = planet.y;
        lock.alpha = 0.5;
        lock.scale = 0.6;
        lock.mouseEnabled = false;
        this.nav_cont.addChild(lock);
      }

    }
    this.nav_cont.scale = 0.35;
    this.nav_cont.x = 183*rX;
    this.nav_cont.y = 190*rY;


    let first = this.planets[0].name;
    this.loadPlanet(first)

  }

  prototype.loadPlanet = function(name, e) {

    if(e) e.stopImmediatePropagation();

    if(this.cplanet == name) return;
    this.cplanet = name;

    let planet = this.planets.find(p => p.name == name);

    this.deco_cont.removeAllChildren();
    this.acti_cont.removeAllChildren();
    this.deco_cont.alpha = 0;
    this.acti_cont.alpha = 0;

    //planet
    let bplanet = new createjs.Bitmap(queue.getResult(planet.id));
    bplanet.regX = bplanet.image.width/2;
    bplanet.regY = bplanet.image.height/2;
    bplanet.x = 750*rX;
    bplanet.y = 250*rY;
    this.deco_cont.addChild(bplanet);

    //title
    let title = new createjs.Text(planet.name.toUpperCase().replace(/(\S{1})/g,"$1 "), '30px Arial', '#FFF');
    title.regX = title.getMeasuredWidth()/2;
    title.x = 750*rX;
    title.y = bplanet.y + bplanet.image.height/2 + 10*rY;
    this.deco_cont.addChild(title);
    let subtitle = new createjs.Text(planet.location, '15px Arial', '#FFF');
    subtitle.regX = subtitle.getMeasuredWidth()/2;
    subtitle.x = 750*rX;
    subtitle.y = title.y + 30*rY;
    this.deco_cont.addChild(subtitle);

    //levels
    let ox = 330*rX;
    let oy = subtitle.y + 80*rY;
    for(let i=0,ln=planet.levels.length; i<ln; i++) {
      let level = planet.levels[i];
      let btn = new createjs.Sprite(
        new createjs.SpriteSheet({
            images: [queue.getResult('btn_level')],
            frames: {width:parseInt(160*rX), height:parseInt(45*rY)},
            framerate: 1,
            animations: { out: [0], over: [1], down: [2], lock: [3] }
        })
      );
      btn.x = ox + 180*i*rX;
      btn.y = oy;
      this.acti_cont.addChild(btn);
      let title = new createjs.Text('LEVEL '+(i+1), '16px Arial', '#0f2d58');
      title.x = btn.x + 45*rX;
      title.y = btn.y + 15*rY;
      title.mouseEnabled = false;
      this.acti_cont.addChild(title);

      if(level.unlock) {
        btn.on('click', proxy(this.loadLevel, this, [level]));
        new createjs.ButtonHelper(btn, "out", "over", "down");
      }
      else {
        btn.gotoAndStop('lock');
      }
    }

    //close button
    let btn = new createjs.Sprite(
        new createjs.SpriteSheet({
            images: [queue.getResult('btn_close')],
            frames: {width:parseInt(71*rX), height:parseInt(71*rY)},
            framerate: 1,
            animations: { out: [0], over: [1], down: [2] }
        })
      );
    btn.x = 1265 * rX;
    btn.y = 350 * rY;
    new createjs.ButtonHelper(btn, "out","over","down");
    this.acti_cont.addChild(btn);
    btn.on('click', proxy(this.close, this));


    //fancy bar
    this.loadFancy();

    //news
    this.loadNews(planet.information);

    //fade in
    createjs.Tween.get(this.deco_cont).wait(100).to({alpha: 1}, 800);
    createjs.Tween.get(this.acti_cont).wait(100).to({alpha: 1}, 800);

  }

  prototype.loadLevel = function(level) {

    //clear previous spot
    if(SPOT) {
      SPOT.remove();
      this.removeLevel(SPOT);
    }
    //clear stage
    window.spot_cont.removeAllChildren();
    window.extra_cont.removeAllChildren();
    //create spot with new config
    SPOT = new Spot(level);
    //add it
    window.spot_cont.addChild(SPOT);
    //init spot
    setTimeout(function() {
      SPOT.init();
    },100);
    // add menu
    //SCREENS.addMenuIcon();
    this.close();

    //initCustomizer();
  }

  prototype.removeLevel = function(level) {

    if(SPOT === null) return;
    SPOT.remove();
    window.spot_cont.removeChild(SPOT);
    SPOT = null;
  }

  prototype.loadNews = function(infos) {

    let text = new createjs.Text(infos, '12px Arial', '#25d2d0');
    text.lineWidth = 400;
    text.x = 880 * rX;
    text.y = 690 * rY;
    this.deco_cont.addChild(text);
  }

  prototype.loadFancy = function(name) {

    //bars
    let ox = 330 * rX;
    let oy = 690 * rY;
    let bars = new createjs.Container();
    for(var i=0,ln=10;i<=ln;i++) {
      let bar = this.makeBar();
      bar.x = ox + 10*i*rX;
      bar.y = oy;
      bars.addChild(bar);
    }
    this.deco_cont.addChild(bars);

    //curves
    ox = 450 * rX;
    oy = 690 * rY;
    for(var i=0,ln=3;i<ln;i++) {
      let curve = this.makeCurve();
      curve.x = ox;
      curve.y = oy;
      this.deco_cont.addChild(curve);
    }

    //rounds
    ox = 640 * rX;
    oy = 715 * rY;
    dx = 60 * rX;
    dy = 50 * rY;
    for(var i=0,ln=4;i<ln;i++) {
      let round = this.makeRound();
      round.x = ox + dx*i;
      round.y = oy;
      round.scale = 0.4;
      this.deco_cont.addChild(round);
      if(i==1) {
        ox -= dx*2;
        oy += dy;
      }
    }
    let round = this.makeRound();
    round.scale = 0.9;
    round.x = 800 * rX;
    round.y = 750 * rY;
    this.deco_cont.addChild(round);
  }

  prototype.makeRound = function() {

    let size = 50 * rX;
    let cont = new createjs.Container();
    let back = new createjs.Shape();
    back.graphics.beginFill('#25d2d0').drawCircle(0,0,size);
    back.regX = size/2;
    back.regY = size/2;
    let shade = new createjs.Shape();
    let angle = Math.random()*360;
    let pt1 = findPointFromAngle(0,0,angle,2000);
    let pt2 = findPointFromAngle(0,0,angle + 60 + Math.random()*280,2000);
    shade.graphics.beginFill('#1eaaa9').moveTo(0,0).lineTo(pt1.x,pt1.y).lineTo(pt2.x,pt2.y).closePath();
    shade.x = -25 * rX;
    shade.y = -25 * rX;
    shade.mask = back;
    let center = new createjs.Shape();
    center.graphics.beginFill('#425898').drawCircle(0,0,size);
    center.regX = size/2;
    center.regY = size/2;
    center.scale = 0.35;
    center.x = -15 * rX;
    center.y = -15 * rX;

    cont.addChild(back, shade, center);
    return cont;
  }

  prototype.makeCurve = function() {

    let width = 100;
    let height = 50;
    let curve = new createjs.Shape();
    curve.graphics.setStrokeStyle(2).beginStroke('#25d2d0').moveTo(0,(height/2)+Math.random()*height).quadraticCurveTo(width/2,Math.random()*(height*2/3),width,(height/2)+Math.random()*height);
    curve.alpha = Math.random()*0.8 + 0.2;
    return curve;
  }

  prototype.makeBar = function() {

    let cont = new createjs.Container();
    let back = new createjs.Shape();
    let width = 5 * rX;
    let height = 80 * rY;
    back.graphics.beginFill('#25d2d0').setStrokeStyle(0).drawRect(0, 0, width, height);
    let front = new createjs.Shape();
    back.graphics.beginFill('#5570b3').setStrokeStyle(0).drawRect(0, 0, width, Math.random()*(height*2/3)+(height*1/3));
    cont.addChild(back,front);
    return cont;
  }

  window.Menu = createjs.promote(Menu, 'Container');

}());