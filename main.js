
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

window.load = function() {

	CURRENTX = 1280
	CURRENTY = 720;

	USER = new User();

	window.Stage = new createjs.Stage('canvas');
	window.Stage.enableMouseOver(10);

	window.resizeCanvas();

	let imgdir = 'dist/img/'+CURRENTX+'x'+CURRENTY+'/';
	queue = new createjs.LoadQueue();
	queue.addEventListener('complete',initialize);
	queue.loadManifest([
		{id:'bg_paradize',src:imgdir+'spots/default/full.jpg'},
		{id:'wave',src:imgdir+'waves/wave1.jpg'},
		{id:'wave_ripple',src:imgdir+'waves/wave-ripple.png'},
		{id:'lip_ripple',src:imgdir+'waves/lip-ripple.png'},
		{id:'spot_searipple',src:imgdir+'spots/default/searipples.png'},
		{id:'spot_back',src:imgdir+'spots/zegema_beach/back.jpg'},
		{id:'spot_back_home',src:imgdir+'spots/default/homeback.jpg'},
		{id:'spot_front_home',src:imgdir+'spots/default/homefront.png'},
		{id:'spot_front',src:imgdir+'spots/default/beach.png'},
		{id:'caladan_back', src:imgdir+'spots/Caladan_Peak/back.jpg'},
		{id:'flhoston_back', src:imgdir+'spots/Flhoston_Paradise/back.png'},
		{id:'flhoston_back_reflect', src:imgdir+'spots/Flhoston_Paradise/shipreflect.png'},
		{id:'pandora_back', src:imgdir+'spots/Pandora_Bay/back.jpg'},
		{id:'zeguema_back', src:imgdir+'spots/Zeguema_Beach/back.jpg'},
		{id:'btn_startgame',src:imgdir+'buttons/btn_startgame.png'},
		{id:'btn_level',src:imgdir+'buttons/btn_level.png'},
		{id:'btn_menu',src:imgdir+'buttons/btn_menu.png'},
		{id:'btn_menu_sm',src:imgdir+'buttons/btn_menu_sm.png'},
		{id:'btn_retry',src:imgdir+'buttons/btn_retry.png'},
		{id:'btn_retry_sm',src:imgdir+'buttons/btn_retry_sm.png'},
		{id:'btn_close',src:imgdir+'buttons/btn_close.png'},
		{id:'btn_skills',src:imgdir+'buttons/btn_skills.png'},
		{id:'dog',src:imgdir+'object/spacedog.png'},
		{id:'bomb',src:imgdir+'object/astro_bomb.png'},
		{id:'boom',src:imgdir+'object/astro_boom.png'},
		{id:'surfer_splash',src:imgdir+'object/splash.png'},
		{id:'surfer',src:imgdir+'surfer/astrosurfer_moves.png'},
		{id:'surfer_takeoff',src:imgdir+'surfer/astrosurfer_takeoff.png'},
		{id:'stormsurfer',src:imgdir+'surfer/surfer_stormtrooper.png'},
		{id:'stormsurfer_takeoff',src:imgdir+'surfer/takeoff_stormtrooper.png'},
		{id:'paddler',src:imgdir+'surfer/astropaddler.png'},
		{id:'photographer',src:imgdir+'object/photographer.png'},
		{id:'cigogne',src:imgdir+'object/cigogne.png'},
		{id:'drone',src:imgdir+'object/drone.png'},
		{id:'wash',src:imgdir+'object/wash.png'},
		{id:'sprite_beachtrooper',src:imgdir+'object/beachtrooper.png'},
		{id:'washed_text',src:imgdir+'washed.png'},
		{id:'star', src:imgdir+'object/star.png'},
		{id:'shark', src:imgdir+'object/shark.png'},
		{id:'ptero', src:imgdir+'object/ptero.png'},
		{id:'spacetablet', src:imgdir+'bkg/tablet.png'},
		{id:'scoretable', src:imgdir+'bkg/scoretable.png'},
		{id:'scoreboard', src:imgdir+'bkg/scoreboard.png'},
		{id:'caladan', src:imgdir+'planets/caladan.png'},
		{id:'flhoston', src:imgdir+'planets/flhoston.png'},
		{id:'kashykkk', src:imgdir+'planets/kashykkk.png'},
		{id:'pandora', src:imgdir+'planets/pandora.png'},
		{id:'zeguema', src:imgdir+'planets/zeguema.png'},
		{id:'gargantua', src:imgdir+'planets/gargantua.png'},
		{id:'default', src:imgdir+'planets/default.png'},
		{id:'lock', src:imgdir+'planets/lock.png'},
		{id:'astrovan', src:imgdir+'object/astrovan.png'},
		{id:'cocktail', src:imgdir+'object/cocktail.png'},
		{id:'coffee', src:imgdir+'object/coffee.png'},
		{id:'drinkshadow', src:imgdir+'object/drinkshadow.png'},
		{id:'successtxt', src:imgdir+'object/successtxt.png'},
		{id:'tryagaintxt', src:imgdir+'object/tryagaintxt.png'},
		{id:'failed', src:imgdir+'object/failed.png'},
		{id:'valid', src:imgdir+'object/valid.png'},
		{id:'medal_gold', src:imgdir+'object/medal_gold.png'},
		{id:'medal_silver', src:imgdir+'object/medal_silver.png'},
		{id:'medal_bronze', src:imgdir+'object/medal_bronze.png'},
		{id:'medal_empty', src:imgdir+'object/medal_empty.png'},
		{id:'astroposeur', src:imgdir+'object/astroposeur.png'},
		{id:'icon_boost', src:imgdir+'buttons/boost.png'}

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
	SPOT = null;
	TEST = true;


	// Containers
	window.spot_cont = new createjs.Container();
	window.Stage.addChild(window.spot_cont);
	window.extra_cont = new createjs.Container();
	window.Stage.addChild(window.extra_cont);
	window.border_cont = new createjs.Container();
	window.Stage.addChild(window.border_cont);
	window.menu_cont = new createjs.Container();
	window.Stage.addChild(window.menu_cont);
	window.pause_cont = new createjs.Container();
	window.Stage.addChild(window.pause_cont);

	let border = new createjs.Shape();
	border.graphics.beginStroke('#000').setStrokeStyle(10).moveTo(0,0).lineTo(STAGEWIDTH,0).lineTo(STAGEWIDTH,STAGEHEIGHT).lineTo(0,STAGEHEIGHT).closePath();
	window.border_cont.addChild(border);



	//USER.load();

	//SCREEN
	SCREENS = new ScreenManager();

	//BUILD LEVELS
	PLANETS.sort(function(a,b) { return a.order - b.order }).map(function(p) {
		// adapt planet variables to resolution
		resizePlanetConf(p);
		// find levels of a planet
		let levels = LEVELS.filter(l => l.planet == p.id);
		//##temp## fill empty planet with default levels
		if(levels.length==0) levels = [];
		// adapt level variables to resolution
		levels.map(l => resizeLevelConf(l));
		//order levels
		levels = levels.sort(function(a,b) { return a.level - b.level });
		// assign levels to planet
		p.levels = levels;
	});

	//unlock first level
	let planet = PLANETS.find(p => p.order == 1);
	let level = planet.levels.find(p => p.level == 1);
	USER.unlockPlanet(planet);
	USER.unlockLevel(level);
	USER.currentPlanet = planet.id;
	USER.currentLevel = level.id;

	//MENU
	MENU = new Menu(PLANETS);
	this.menu_cont.addChild(MENU);
	//MENU.open();

	//SPOT
	const config = LEVELS.find(s => s.alias == 'home');
	MENU.loadLevel(config);


	//init onEnterFrame
	createjs.Ticker.timingMode = createjs.Ticker.TIMEOUT;
	createjs.Ticker.addEventListener('tick',tick);

	//init Mouse move
	window.Stage.addEventListener('stagemousemove',onMouseMove);

	 //keyboard handlers
	window.onkeyup = keyUpHandler;
	window.onkeydown = keyDownHandler;

	//resize event
	window.onresize = browserResize;

	//window event
  window.addEventListener('blur', window.onWindowPassive);
  window.addEventListener('focus', window.onWindowActive);

	// set customizer
	//initCustomizer();

}


window.tick = function(e) {

	if(PAUSED) return;
	window.Stage.update(e);
}

window.keyDownHandler = function(e)
{
   switch(e.key)
   {
    case 'b':  SPOT.controls.onBoost(); break;
    case ',':  SPOT.getWave().addBlockBreaking(200); break;
    case ',':  SPOT.getWave().addBreakingPeak(50,500); break;
    case 'm':  MENU.switch(); break;
    case 's':  window.loadSpot(null,'default'); break;
    case 'a':  SPOT.breakAllWaves(); break;
    case 'p':  SPOT.getWave().getSurfer().initImagePersistance(60); break;
    case ' ':  window.pause(); break;
    case 'f':  SPOT.getWave().getSurfer().fall(); break;
    case 'z':  SPOT.addPaddlerBot(); break;
    case 'r':  SPOT.getWave().addTestSurferBot(); break;
    case 'u':  console.log(USER); break;
    case 'o':  SPOT.getWave().addRandomObstacle(); break;
    case '&':  SPOT.getWave().addPaddler(); break;
    case 'é':  SPOT.getWave().addPhotographer(); break;
    case '"':  SPOT.getWave().addBomb(); break;
    case '\'':  SPOT.getWave().addBeachTrooper(); break;
    case '(':  SPOT.getWave().addRandomStarline(); break;
    case '-':  SPOT.getWave().addShark(); break;
    case '1':  SPOT.getWave().addFlyingMultiplier(); break;
    case '2':  SPOT.getWave().addFlyingPrize(); break;
    case '3':  SPOT.getWave().addCigogne(); break;
    case '4':  SPOT.getWave().addDrone(); break;
    case 'k':  SPOT.getWave().getSurfer().updateLifebar(0.2); break;
    case 't':  switchTestMode(); break;
    case 'd':  switchDebugMode(); break;
    case 'w':  switchSlowMo(0.1,500); break;
    case 'g':  SPOT.removeAllPaddlers().getWave().breakAndFollow(); break;
    case '+':  SPOT.score.add(1000); break;
    case '*':  SPOT.score.testScore();
    default: console.log('Key "'+e.key+'" have no handler.');
   }
}

window.keyUpHandler = function(e)
{

}

window.onMouseMove= function(e) {

	MOUSE_X = e.stageX;
	MOUSE_Y = e.stageY;

	var pt = new createjs.Point(MOUSE_X,MOUSE_Y);
	MOUSE_POINTS.unshift(pt);
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

resizeLevelConf = function(level) {
	//series
	level.series.spread *= rX;
	level.series.xshift *= rX;
	//surfers
	level.surfers.x *= rX;
	level.surfers.y *= rY;
	level.surfers.velocities.x *= rX;
	level.surfers.velocities.y *= rY;
	//waves
	level.waves.height *= rY;
	level.waves.width *= rX;
	level.waves.breaking.width *= rX;
	level.waves.breaking.x_speed *= rX;
	level.waves.breaking.x_speed_max *= rX;
	level.waves.breaking.y_speed *= rY;
	level.waves.breaking.left.width *= rX;
	level.waves.breaking.left.width_max *= rX;
	level.waves.breaking.left.block_width *= rX;
	level.waves.breaking.left.block_width_max *= rX;
	level.waves.breaking.right.width *= rX;
	level.waves.breaking.right.width_max *= rX;
	level.waves.breaking.right.block_width *= rX;
	level.waves.breaking.right.block_width_max *= rX;
	level.waves.lip.thickness *= rY;
	level.waves.lip.cap.width *= rX;
	level.waves.lip.cap.height *= rY;
	level.waves.suction.x *= rX;
	level.waves.suction.y *= rY;
	level.waves.shoulder.left.width *= rX;
	level.waves.shoulder.left.inner *= rX;
	level.waves.shoulder.left.outer *= rX;
	level.waves.shoulder.left.marge *= rX;
	level.waves.shoulder.left.slope *= rX;
	level.waves.shoulder.right.width *= rX;
	level.waves.shoulder.right.inner *= rX;
	level.waves.shoulder.right.outer *= rX;
	level.waves.shoulder.right.marge *= rX;
	level.waves.shoulder.right.slope *= rX;
	return level;
}