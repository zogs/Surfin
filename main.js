
// define usefull const
var stage;


// define global usefull constant
// (NB: use positive numeric for perf reason)
const LEFT = 1;
const CENTER = 0;
const RIGHT = 2;

const ORIGINX = 1500;
const ORIGINY = 800;

let CURRENTX;
let CURRENTY;
let rX;
let rY;

let PROGRESSBAR;

window.load = function() {

	CURRENTX = 1280
	CURRENTY = 720;
	USER = new User();

	window.Stage = new createjs.Stage('canvas');
	window.Stage.enableMouseOver(10);
	window.CanvasContainer = document.getElementById('container');

	window.resizeCanvas();

  window.initLoadingScreen();

}

window.initLoadingScreen = function() {

  QUEUE = new createjs.LoadQueue();
  QUEUE.addEventListener('complete', showLoadingScreen);
  let imgdir = 'dist/img/'+CURRENTX+'x'+CURRENTY+'/';
  QUEUE.loadManifest([
    {id:'astrovan', src:imgdir+'ui/astrovan.png'},
  ]);
}

window.showLoadingScreen = function() {


  let cont = new createjs.Container();
  let title = new createjs.Text("Chargement en cours...", '18px Helvetica, sans-serif', 'white');
  title.x = CURRENTX/2 - title.getMeasuredWidth()/2;
  title.y = 120;
  let border = new createjs.Shape();
  border.graphics.beginStroke('#ddd').setStrokeStyle(2).drawRect(0,0, 500, 25);
  border.x = CURRENTX/2 - 250;
  border.y = 25;
  border.alpha = 0;
  let bar = new createjs.Shape();
  bar.graphics.beginFill('#fd4e01').drawRect(0,0, 500, 36);
  bar.x = CURRENTX/2 - 250;
  bar.y = 25;
  bar.scaleX = 0.5;
  let van = new createjs.Sprite(
      new createjs.SpriteSheet({
          images: [QUEUE.getResult('astrovan')],
          frames: {width:parseInt(140*rX), height:parseInt(100*rY), regX: parseInt(70*rX), regY: parseInt(50*rY)},
          framerate: 12,
          animations: {
            fly: [0,1, 'fly'],
          }
      })
  );
  van.x = bar.x;
  van.y = bar.y + 20;
  van.regX = -55;
  van.scale = 1.5;
  van.gotoAndPlay('fly');
  let lights = new createjs.Container();
  lights.width = 500;
  lights.height = 100;
  lights.x = CURRENTX/2 - 250;
  for(let i=0,ln=12; i <= ln; i++) {
    let light = new createjs.Shape();
    light.lineWidth = 100;
    light.lineSpeed = Math.random();
    light.graphics.setStrokeStyle(1).beginStroke('#fff').moveTo(0,0).lineTo(light.lineWidth, 0);
    light.x = Math.random()* lights.width;
    light.y = Math.random()* lights.height;
    light.alpha = 0.5 + Math.random()*0.5;
    lights.addChild(light);
  }
  let mask = new createjs.Shape();
  mask.graphics.beginFill('red').drawRect(0,0, lights.width, lights.height);
  mask.x = lights.x;
  mask.y = lights.y;
  lights.mask = mask;
  cont.addChild(lights);
  cont.addChild(title);
  cont.addChild(border);
  cont.addChild(bar);
  cont.addChild(van);
  cont.y = 250;
  window.Stage.addChild(cont);
  window.Stage.update();
  PROGRESSBAR = bar;
  PROGRESSVAN = van;
  PROGRESSBOR = border;
  PROGRESSLGT = lights;
  window.loadAssets();
}

window.loadingProgress = function(e) {
  PROGRESSBAR.scaleX = e.progress;
  PROGRESSVAN.x = e.progress * 500 + PROGRESSBOR.x;
  for(let i=0,ln=PROGRESSLGT.numChildren; i<ln; i++) {
    let light = PROGRESSLGT.getChildAt(i);
    light.x -= 10 + light.lineSpeed * 5;
    if(light.x < -light.lineWidth) light.x = PROGRESSLGT.width + light.lineWidth;
  }
  window.Stage.update();
}

window.loadAssets = function() {

	QUEUE = new createjs.LoadQueue();
	QUEUE.addEventListener('complete',initialize);
  QUEUE.addEventListener('progress',loadingProgress);
	let imgdir = 'dist/img/'+CURRENTX+'x'+CURRENTY+'/';
	QUEUE.loadManifest([
		{id:'bg_paradize',src:imgdir+'spots/default/full.jpg'},
		{id:'wave',src:imgdir+'waves/wave1.jpg'},
		{id:'wave_ripple',src:imgdir+'waves/wave-ripple.png'},
		{id:'lip_ripple',src:imgdir+'waves/lip-ripple.png'},
		{id:'spot_searipple',src:imgdir+'spots/default/searipples.png'},
		{id:'spot_back',src:imgdir+'spots/zegema_beach/back.jpg'},
		{id:'spot_back_home',src:imgdir+'spots/default/homeback.jpg'},
		{id:'spot_front_home',src:imgdir+'spots/default/homefront.png'},
		{id:'spot_front',src:imgdir+'spots/default/beach.png'},
		{id:'caladan_back', src:imgdir+'spots/Caladan_Peak/back2.jpg'},
		{id:'flhoston_back', src:imgdir+'spots/Flhoston_Paradise/back.jpg'},
		{id:'flhoston_back_reflect', src:imgdir+'spots/Flhoston_Paradise/shipreflect.png'},
    {id:'flhoston_back_islands', src:imgdir+'spots/Flhoston_Paradise/islands.png'},
		{id:'pandora_back', src:imgdir+'spots/Pandora_Bay/back.jpg'},
		{id:'zeguema_back', src:imgdir+'spots/Zeguema_Beach/back.jpg'},
		{id:'namek_back', src:imgdir+'spots/Namek/back.jpg'},
		{id:'namek_front', src:imgdir+'spots/Namek/front.png'},
		{id:'naboo_back', src:imgdir+'spots/Naboo/back.jpg'},
		{id:'naboo_coast', src:imgdir+'spots/Naboo/coast.png'},
    {id:'arrakis_back', src:imgdir+'spots/Arrakis/arrakis_back.jpg'},
    {id:'arrakis_sunreflect', src:imgdir+'spots/Arrakis/sunreflect.png'},
    {id:'terre_back', src:imgdir+'spots/Terre/back.jpg'},
    {id:'terre_front', src:imgdir+'spots/Terre/front.png'},
    {id:'terre_cargo', src:imgdir+'spots/Terre/cargo.png'},
    {id:'terre_astrovan', src:imgdir+'spots/Terre/astrovan.png'},
		{id:'btn_startgame',src:imgdir+'buttons/btn_startgame.png'},
		{id:'btn_level',src:imgdir+'buttons/btn_level.png'},
		{id:'btn_menu',src:imgdir+'buttons/btn_menu.png'},
		{id:'btn_menu_sm',src:imgdir+'buttons/btn_menu_sm.png'},
		{id:'btn_retry',src:imgdir+'buttons/btn_retry.png'},
		{id:'btn_retry_sm',src:imgdir+'buttons/btn_retry_sm.png'},
		{id:'btn_skills',src:imgdir+'buttons/btn_skills.png'},
		{id:'dog',src:imgdir+'ui/spacedog.png'},
		{id:'bomb',src:imgdir+'enemy/astro_bomb.png'},
		{id:'boom',src:imgdir+'enemy/astro_boom.png'},
		{id:'surfer_splash',src:imgdir+'ui/splash.png'},
    {id:'astrosurfer',src:imgdir+'surfer/astrosurfer.png'},
    {id:'shadowsurfer',src:imgdir+'surfer/shadowsurfer.png'},
		{id:'stormsurfer',src:imgdir+'surfer/stormsurfer.png'},
		{id:'astropaddler',src:imgdir+'surfer/astropaddler.png'},
    {id:'paddler',src:imgdir+'surfer/shadowpaddler.png'},
		{id:'photographer',src:imgdir+'bonus/photographer.png'},
		{id:'cigogne',src:imgdir+'bonus/cigogne.png'},
		{id:'drone',src:imgdir+'bonus/drone.png'},
		{id:'star', src:imgdir+'bonus/star.png'},
		{id:'wash',src:imgdir+'ui/wash.png'},
		{id:'sprite_beachtrooper',src:imgdir+'enemy/beachtrooper.png'},
		{id:'washed_text',src:imgdir+'washed.png'},
		{id:'shark', src:imgdir+'enemy/shark.png'},
		{id:'ptero', src:imgdir+'enemy/ptero.png'},
    {id:'banshee', src:imgdir+'enemy/banshee.png'},
    {id:'stingbat', src:imgdir+'enemy/stingbat.png'},
    {id:'toruk', src:imgdir+'enemy/toruk.png'},
    {id:'arachnid', src:imgdir+'enemy/arachnid.png'},
    {id:'arachfly', src:imgdir+'enemy/arachfly.png'},
    {id:'seafish', src:imgdir+'enemy/seafish.png'},
		{id:'spacetablet', src:imgdir+'bkg/tablet.png'},
		{id:'scoretable', src:imgdir+'bkg/scoretable.png'},
		{id:'scoreboard', src:imgdir+'bkg/scoreboard.png'},
		{id:'caladan', src:imgdir+'planets/caladan.png'},
		{id:'flhoston', src:imgdir+'planets/flhoston.png'},
		{id:'kashykkk', src:imgdir+'planets/kashykkk.png'},
		{id:'pandora', src:imgdir+'planets/pandora.png'},
    {id:'arrakis', src:imgdir+'planets/arrakis.png'},
		{id:'zeguema', src:imgdir+'planets/zeguema.png'},
    {id:'terre', src:imgdir+'planets/terre.png'},
		{id:'gargantua', src:imgdir+'planets/gargantua.png'},
		{id:'namek', src:imgdir+'planets/namek.png'},
		{id:'naboo', src:imgdir+'planets/naboo.png'},
		{id:'default', src:imgdir+'planets/default.png'},
		{id:'lock', src:imgdir+'planets/lock.png'},
		{id:'astrovan', src:imgdir+'ui/astrovan.png'},
		{id:'cocktail', src:imgdir+'ui/cocktail.png'},
		{id:'coffee', src:imgdir+'ui/coffee.png'},
		{id:'drinkshadow', src:imgdir+'ui/drinkshadow.png'},
		{id:'successtxt', src:imgdir+'ui/successtxt.png'},
		{id:'tryagaintxt', src:imgdir+'ui/tryagaintxt.png'},
		{id:'failed', src:imgdir+'ui/failed.png'},
		{id:'valid', src:imgdir+'ui/valid.png'},
		{id:'medal_gold', src:imgdir+'ui/medal_gold.png'},
		{id:'medal_silver', src:imgdir+'ui/medal_silver.png'},
		{id:'medal_bronze', src:imgdir+'ui/medal_bronze.png'},
		{id:'medal_empty', src:imgdir+'ui/medal_empty.png'},
		{id:'astroposeur', src:imgdir+'ui/astroposeur.png'},
		{id:'icon_boost', src:imgdir+'buttons/boost.png'},
		{id:'icon_shield', src:imgdir+'buttons/shield.png'},
		{id:'icon_hadoken', src:imgdir+'buttons/fire.png'},
		{id:'redspouf', src:imgdir+'ui/spouf_red.png'},
		{id:'bluespouf', src:imgdir+'ui/spouf_blue.png'},
		{id:'spindash', src:imgdir+'ui/spindash.png'},
		{id:'shockwave', src:imgdir+'bonus/shockwave.png'},
		{id:'waterball', src:imgdir+'bonus/waterball.png'},
    {id:'spice', src:imgdir+'bonus/spice.png'},
		{id:'waterballsprinkle', src:imgdir+'bonus/waterballsprinkle.png'},
    {id:'sprite_guldo', src:imgdir+'enemy/guldo.png'},
    {id:'sprite_jeese', src:imgdir+'enemy/jeese.png'},
    {id:'sprite_reacum', src:imgdir+'enemy/reacum.png'},
    {id:'sprite_paddle', src:imgdir+'enemy/paddle.png'},

		]);
	createjs.Sound.alternateExtensions = ["mp3"];
 	createjs.Sound.registerSound("dist/sounds/yeah.mp3", "bravo");
 	createjs.Sound.registerSound("dist/sounds/pickup.wav", "pickup");
 	createjs.Sound.registerSound("dist/sounds/cut.wav", "cut");
 	createjs.Sound.registerSound("dist/sounds/sharkroar.wav", "sharkroar");
 	createjs.Sound.registerSound("dist/sounds/plouf.mp3", "plouf");
 	createjs.Sound.registerSound("dist/sounds/gasp.wav", "gasp");
	createjs.Sound.volume = 0.1;

	//Justice.init();

}

window.initialize = function() {

	//Globals
	STAGEWIDTH = window.Stage.canvas.width;
	STAGEHEIGHT = window.Stage.canvas.height;
	RATIO = STAGEWIDTH / STAGEHEIGHT;
	MOUSE_X = STAGEWIDTH/2;
	MOUSE_Y = STAGEHEIGHT/2;
	MOUSE_POINTS = [new createjs.Point(MOUSE_X,MOUSE_Y)];
	DEBUG = 0;
	TEST = 0;
	PAUSED = 0;
	PERF = 3;
	TIME_SCALE = 1;
	SLOW_MOTION = false;
  SHAKING = null;
  SHAKING_FORCE = 2;
	SPOT = null;
	TEST = true;

  // clear Stage
  window.Stage.removeAllChildren();

	// Containers
	window.spot_cont = new createjs.Container();
	window.Stage.addChild(window.spot_cont);
	window.extra_cont = new createjs.Container();
	window.Stage.addChild(window.extra_cont);
	window.border_cont = new createjs.Container();
	window.Stage.addChild(window.border_cont);
	window.menu_cont = new createjs.Container();
	window.Stage.addChild(window.menu_cont);
	window.dial_cont = new createjs.Container();
	window.Stage.addChild(window.dial_cont);
	window.pause_cont = new createjs.Container();
	window.Stage.addChild(window.pause_cont);

	let border = new createjs.Shape();
	border.graphics.beginStroke('#000').setStrokeStyle(10).moveTo(0,0).lineTo(STAGEWIDTH,0).lineTo(STAGEWIDTH,STAGEHEIGHT).lineTo(0,STAGEHEIGHT).closePath();
	window.border_cont.addChild(border);

  // pre-generate pops
  // THIS IS TOO SLOWWWWW
  /*
  new Pop().generateCachedText('Ready ?', 80);
  new Pop().generateCachedText('Take off !', 60);
  new Pop().generateCachedText('T u b e !!!');
  new Pop().generateCachedText('Aerial');
  new Pop().generateCachedText('Success !', 80, '#90fc8d');
  */

  //USER
	//USER.load();

	//SCREEN
	SCREENS = new ScreenManager();

	//BUILD LEVELS
	let planets = PLANETS
    // keep only active planets
    .filter(p => p.active == true)
    // order them
    .sort(function(a,b) { return a.order - b.order })
		// adapt planet variables to resolution
    .map(function(p) { resizePlanetConf(p); return p; });


	//unlock first level
	let planet = planets.find(p => p.order == 1);
	let level = planet.levels[0];
	USER.unlockPlanet(planet.id);
	USER.unlockLevel(level);
	USER.currentPlanet = planet.id;
	USER.currentLevel = level;

	//MENU
	MENU = new Menu(planets);
	this.menu_cont.addChild(MENU);

	//SCENE
  SCENE = new Scene();
	//SCENE.loadLevel('Home');
	SCENE.loadLevel('Home');

	//init onEnterFrame
	createjs.Ticker.timingMode = createjs.Ticker.TIMEOUT;
	createjs.Ticker.addEventListener('tick',tick);

	//init Mouse move
	window.Stage.addEventListener('stagemousemove',onMouseMove);

	//resize event
	window.onresize = browserResize;

	//window event
  window.addEventListener('blur', window.onWindowPassive);
  window.addEventListener('focus', window.onWindowActive);
	// set customizer
	//initCustomizer();
	//

	/*
	SPOUF SPRITE
	var sheet = new createjs.SpriteSheet({
          images: [queue.getResult('redspouf')],
          frames: {width:parseInt(64*rX), height:parseInt(64*rY), regX: parseInt(32*rX), regY: parseInt(32*rY)},
          framerate: 40,
          animations: {
            spouf: [0, 16, true],
          }
      });

	let spouf = new createjs.Sprite(sheet);
  spouf.scaleX = spouf.scaleY = 1;
  spouf.gotoAndPlay('spouf');
  spouf.x = 200;
  spouf.y = 200;
 	this.Stage.addChild(spouf);
	 */


	// DASH SPRITE
	/*
	var sheet = new createjs.SpriteSheet({
          images: [queue.getResult('spindash')],
          frames: {width:parseInt(64*rX), height:parseInt(64*rY), regX: parseInt(32*rX), regY: parseInt(32*rY)},
          framerate: 40,
          animations: {
            spin: [0, 7, true],
          }
      });

	let dash = new createjs.Sprite(sheet);
  dash.scaleX = dash.scaleY = 1;
  dash.gotoAndPlay('spin');
  dash.x = 200;
  dash.y = 200;
 	this.Stage.addChild(dash);
	*/


	 /* DIALOG TEST
	let dialog = new Dialog([
		new Text('NOW ALL YOU HAVE TO DO')
		], [
		new Button('S T A R T  G A M E', function() { this.close() })
		], {
			x: 600,
			y: 300,
			lifetime: 800, call: function() { this.close() }
		});
	dialog.open();
	window.dial_cont.addChild(dialog);
	*/
}


window.tick = function(e) {

	if(PAUSED) return;
	window.Stage.update(e);
}

window.defaultKeyDownHandler = function(e)
{
   switch(e.key)
   {
    case ',':  SPOT.getWave().addBlockBreaking(200); break;
    case ',':  SPOT.getWave().addBreakingPeak(50,500); break;
    case 'm':  MENU.toggle(); break;
    case 's':  SCENE.switchShaking(3); break;
    case 'a':  SPOT.breakAllWaves(); break;
    case 'p':  SPOT.getWave().getSurfer().initImagePersistance(60); break;
    case ' ':  window.pause(); break;
    case 'f':  SPOT.getWave().getSurfer().fall(); break;
    case 'z':  SPOT.addPaddlerBot(); break;
    case 'r':  SPOT.getWave().addTestSurferBot(); break;
    case 'u':  console.log(USER); break;
    case '1':  SPOT.getWave().addRandomObstacle(); break;
    case '2':  SPOT.getWave().addOstacle('Paddler'); break;
    case '3':  SPOT.getWave().addOBstacle('Photographer'); break;
    case '4':  SPOT.getWave().addObstacle('Bomb'); break;
    case '5':  SPOT.getWave().addObstacle('Beachtrooper'); break;
    case '6':  SPOT.getWave().addRandomStarline(); break;
    case '7':  SPOT.getWave().addOstacle('Shark'); break;
    case '8':  SPOT.getWave().addOstacle('Stormtrooper'); break;
    case '&':  SPOT.getWave().addFlyingMultiplier(); break;
    case 'é':  SPOT.getWave().addFlyingPrize(); break;
    case '"':  SPOT.getWave().addCigogne(); break;
    case '\'':  SPOT.getWave().addDrone(); break;
    case 'k':  SPOT.getWave().getSurfer().updateLifebar(0.2); break;
    case 't':  switchTestMode(); break;
    case 'd':  switchDebugMode(); break;
    case 'w':  switchSlowMo(0.1,500); break;
    case 'g':  SPOT.removeAllPaddlers().getWave().breakAndFollow(); break;
    case '+':  SPOT.score.add(1000); break;
    case '/':  SPOT.controls.startShield(); break;
    case '*':  SPOT.controls.startHadoken(); break;
    case '-':  SPOT.controls.startBoost(); break;
    default: console.log('Key "'+e.key+'" have no handler.');
   }
}

window.defaultKeyUpHandler = function(e)
{
   switch(e.key)
   {
    case '/':  SPOT.controls.stopShield(); break;
    case '*':  SPOT.controls.stopHadoken(); break;
    case '-':  SPOT.controls.stopBoost(); break;
    default: '';
   }
}

window.onMouseMove= function(e) {

	// dont track move when event is a second touch
	if(e.pointerID > 0) {
		return;
	}

	MOUSE_X = e.stageX;
	MOUSE_Y = e.stageY;
	MOUSE_POINTS.unshift(new createjs.Point(MOUSE_X,MOUSE_Y));
	MOUSE_POINTS = MOUSE_POINTS.slice(0,300);

}

window.getMousePoint = function(n) {

	if(MOUSE_POINTS.length < n) return MOUSE_POINTS[MOUSE_POINTS.length];
	return MOUSE_POINTS[n];
}

window.getMouseVector = function(n) {

	return new Victor(getMousePoint(n).x - getMousePoint(n+1).x, getMousePoint(n).y - getMousePoint(n+1).y );
}

window.switchDebugMode = function() {

	if(DEBUG === 1) {
		DEBUG = 0;
		console.log('DEBUG DESACTIVED');
	}
	else {
		DEBUG = 1;
		console.log('DEBUG ACTIVATED !');
	}
}

window.switchTestMode = function() {

	if(TEST === 1) {
		TEST = 0;
		console.log('TEST DESACTIVATED');
	}
	else {
		TEST = 1;
		console.log('TEST ACTIVATED !');
	}
}

window.switchSlowMo = function(scale,time) {

	if(SLOW_MOTION === false) {
		SLOW_MOTION = true;
		const tween = createjs.Tween.get(window).to({TIME_SCALE: scale}, time);
		tween.addEventListener('change', window.updateTimeScale);
	}
	else {
		SLOW_MOTION = false;
		const tween = createjs.Tween.get(window).to({TIME_SCALE: 1}, time);
		tween.addEventListener('change', window.updateTimeScale);

	}
}

window.updateTimeScale = function() {

	if(SPOT) SPOT.setTimeScale(TIME_SCALE);
}

window.onWindowActive = function(e) {
  // must click to unpause
}

window.onWindowPassive = function(e) {
  if(window.PAUSED == false) window.pause();
}

window.pause = function() {

	if(!SPOT) return;

	//disable pause
	if(PAUSED === 1) {
		PAUSED = 0;
		createjs.Ticker.paused = false;
		window.pause_cont.removeAllChildren();
		SPOT.resume();
	}
	//enable pause
	else {
		let overlay = new createjs.Shape();
		overlay.graphics.beginFill('#000').drawRect(0,0,STAGEWIDTH,STAGEHEIGHT);
		overlay.alpha = 0.2;
		window.pause_cont.addChild(overlay);
		window.Stage.update();

		PAUSED = 1;
		createjs.Ticker.paused = true;
		SPOT.pause();


		overlay.on('click', function(e) {
			window.pause();
			e.stopImmediatePropagation();
		}, null, true);
	}
}


window.browserResize = function() {
	if(window.browserResizeTimeout) window.clearTimeout(window.browserResizeTimeout);
	window.browserResizeTimeout = window.setTimeout(window.browserResizeEnded,500);
}

window.browserResizeEnded = function() {

	window.resizeCanvas();
}

window.resizeCanvas = function() {

	if (USER.device.android || USER.device.ios) { //if android or ios
				//hide address bar
        //document.body.style.height = (windowHeight + 50) + 'px';
        //enable Touch event
        createjs.Touch.enable(window.Stage);
    }

  rX = CURRENTX / ORIGINX;
  rY = CURRENTY / ORIGINY;

  document.getElementById('canvas').width = CURRENTX;
  document.getElementById('canvas').height = CURRENTY;

	var windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
	var windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

	if(windowHeight > CURRENTY) {
		windowHeight = CURRENTY;
	}
	if(windowWidth > CURRENTX) {
		windowWidth = CURRENTX;
	}
	document.getElementById('canvas').style.width = windowWidth+'px';
	document.getElementById('canvas').style.height = windowHeight+'px';

	//scroll to top
	window.setTimeout(function() { //rowsers don't fire if there is not short delay
		window.scrollTo(0,1);
    }, 1);

}
/*
window.resizeCanvas = function() {

	var windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
	var windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;


	var currentWidth = window.Stage.canvas.width;
	var currentHeight = window.Stage.canvas.height;
	var ratio = currentWidth / currentHeight;

	if(windowHeight < window.Stage.canvas.height) {
		currentHeight = windowHeight;
		currentWidth = currentHeight * ratio;
	}
	if(windowWidth < window.Stage.canvas.width) {
		currentWidth = windowWidth;
		currentHeight = currentWidth / ratio;
	}

	if (USER.device.android || USER.device.ios) { //if android or ios
		//hide address bar
        document.body.style.height = (windowHeight + 50) + 'px';
        //enable Touch event
        createjs.Touch.enable(window.Stage);
    }

	document.getElementById('canvas').style.width = currentWidth+'px';
	document.getElementById('canvas').style.height = currentHeight+'px';

	//scroll to top
	window.setTimeout(function() { //rowsers don't fire if there is not short delay
		window.scrollTo(0,1);
    }, 1);

}
*/

resizePlanetConf = function(planet) {
	planet.lines.horizon *= rY;
	planet.lines.break *= rY;
	planet.lines.peak *= rY;
	planet.lines.beach *= rY;
	planet.lines.obstacle *= rY;
	return planet;
}
