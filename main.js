
// define usefull const
var stage;


// define global usefull constant
// (NB: use positive numeric for perf reason)
const LEFT = 1;
const CENTER = 0;
const RIGHT = 2;

const assetsdir = 'assets/img/1500x800/';

window.loaded = function() {

	window.Stage = new createjs.Stage('canvas');
	window.Stage.enableMouseOver(10);

	queue = new createjs.LoadQueue();
	queue.addEventListener('complete',initialize);
	queue.loadManifest([
		{id:'bg_paradize',src:assetsdir+'spots/default/full.jpg'},
		{id:'wave',src:assetsdir+'waves/wave1.jpg'},
		{id:'wave_ripple',src:assetsdir+'waves/wave-ripple.png'},
		{id:'lip_ripple',src:assetsdir+'waves/lip-ripple.png'},
		{id:'spot_searipple',src:assetsdir+'spots/default/searipples.png'},
		{id:'spot_back',src:assetsdir+'spots/zegema_beach/back.jpg'},
		{id:'spot_back_home',src:assetsdir+'spots/default/homeback.jpg'},
		{id:'spot_front_home',src:assetsdir+'spots/default/homefront.png'},
		{id:'spot_front',src:assetsdir+'spots/default/beach.png'},
		{id:'caladan_back', src:assetsdir+'spots/Caladan_Peak/back.jpg'},
		{id:'flhoston_back', src:assetsdir+'spots/Flhoston_Paradise/back.png'},
		{id:'flhoston_back_reflect', src:assetsdir+'spots/Flhoston_Paradise/shipreflect.png'},
		{id:'pandora_back', src:assetsdir+'spots/Pandora_Bay/back.jpg'},
		{id:'zeguema_back', src:assetsdir+'spots/Zeguema_Beach/back.jpg'},
		{id:'btn_startgame',src:assetsdir+'buttons/btn_startgame.png'},
		{id:'btn_level',src:assetsdir+'buttons/btn_level.png'},
		{id:'btn_back',src:assetsdir+'buttons/btn_back.png'},
		{id:'btn_menu',src:assetsdir+'buttons/btn_menu.png'},
		{id:'btn_menu_sm',src:assetsdir+'buttons/btn_menu_sm.png'},
		{id:'btn_retry',src:assetsdir+'buttons/btn_retry.png'},
		{id:'btn_retry_sm',src:assetsdir+'buttons/btn_retry_sm.png'},
		{id:'btn_close',src:assetsdir+'buttons/btn_close.png'},
		{id:'btn_skills',src:assetsdir+'buttons/btn_skills.png'},
		{id:'dog',src:assetsdir+'object/spacedog.png'},
		{id:'bomb',src:assetsdir+'object/astro_bomb.png'},
		{id:'boom',src:assetsdir+'object/astro_boom.png'},
		{id:'surfer_splash',src:assetsdir+'object/splash.gif'},
		{id:'surfer',src:assetsdir+'surfer/astrosurfer_moves.png'},
		{id:'surfer_takeoff',src:assetsdir+'surfer/astrosurfer_takeoff.png'},
		{id:'stormsurfer',src:assetsdir+'surfer/surfer_stormtrooper.png'},
		{id:'stormsurfer_takeoff',src:assetsdir+'surfer/takeoff_stormtrooper.png'},
		{id:'paddler',src:assetsdir+'surfer/astropaddler.png'},
		{id:'photographer',src:assetsdir+'object/photographer.png'},
		{id:'cigogne',src:assetsdir+'object/cigogne.png'},
		{id:'drone',src:assetsdir+'object/drone.png'},
		{id:'wash_plouf',src:assetsdir+'object/wash.svg'},
		{id:'wash',src:assetsdir+'object/wash.png'},
		{id:'sprite_beachtrooper',src:assetsdir+'object/beachtrooper.png'},
		{id:'washed_text',src:assetsdir+'washed.png'},
		{id:'star', src:assetsdir+'object/star.png'},
		{id:'shark', src:assetsdir+'object/shark.png'},
		{id:'ptero', src:assetsdir+'object/ptero.png'},
		{id:'spacetablet', src:assetsdir+'bkg/tablet.png'},
		{id:'scoretable', src:assetsdir+'bkg/scoretable.png'},
		{id:'scoreboard', src:assetsdir+'bkg/scoreboard.png'},
		{id:'caladan', src:assetsdir+'planets/caladan.png'},
		{id:'flhoston', src:assetsdir+'planets/flhoston.png'},
		{id:'kashykkk', src:assetsdir+'planets/kashykkk.png'},
		{id:'pandora', src:assetsdir+'planets/pandora.png'},
		{id:'zeguema', src:assetsdir+'planets/zeguema.png'},
		{id:'gargantua', src:assetsdir+'planets/gargantua.png'},
		{id:'default', src:assetsdir+'planets/default.png'},
		{id:'lock', src:assetsdir+'planets/lock.png'},
		{id:'astrovan', src:assetsdir+'object/astrovan.png'},
		{id:'cocktail', src:assetsdir+'object/cocktail.png'},
		{id:'coffee', src:assetsdir+'object/coffee.png'},
		{id:'drinkshadow', src:assetsdir+'object/drinkshadow.png'},
		{id:'successtxt', src:assetsdir+'object/successtxt.png'},
		{id:'tryagaintxt', src:assetsdir+'object/tryagaintxt.png'},
		{id:'failed', src:assetsdir+'object/failed.png'},
		{id:'valid', src:assetsdir+'object/valid.png'},
		{id:'medal_gold', src:assetsdir+'object/medal_gold.png'},
		{id:'medal_silver', src:assetsdir+'object/medal_silver.png'},
		{id:'medal_bronze', src:assetsdir+'object/medal_bronze.png'},
		{id:'medal_empty', src:assetsdir+'object/medal_empty.png'},
		{id:'astroposeur', src:assetsdir+'object/astroposeur.png'}

		]);

	createjs.Sound.alternateExtensions = ["mp3"];
 	createjs.Sound.registerSound("assets/sounds/yeah.mp3", "bravo");
 	createjs.Sound.registerSound("assets/sounds/pickup.wav", "pickup");
 	createjs.Sound.registerSound("assets/sounds/cut.wav", "cut");
 	createjs.Sound.registerSound("assets/sounds/sharkroar.wav", "sharkroar");
 	createjs.Sound.registerSound("assets/sounds/plouf.mp3", "plouf");
 	createjs.Sound.registerSound("assets/sounds/gasp.wav", "gasp");
	createjs.Sound.volume = 0.1;



	Justice.init();

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


	// Containers
	window.spot_cont = new createjs.Container();
	window.Stage.addChild(window.spot_cont);
	window.border_cont = new createjs.Container();
	window.Stage.addChild(window.border_cont);
	window.menu_cont = new createjs.Container();
	window.Stage.addChild(window.menu_cont);
	window.pause_cont = new createjs.Container();
	window.Stage.addChild(window.pause_cont);

	let border = new createjs.Shape();
	border.graphics.beginStroke('#000').setStrokeStyle(10).moveTo(0,0).lineTo(STAGEWIDTH,0).lineTo(STAGEWIDTH,STAGEHEIGHT).lineTo(0,STAGEHEIGHT).closePath();
	window.border_cont.addChild(border);


	//USER
	USER = new User();
	//USER.load();

	//SCREEN
	SCREENS = new ScreenManager();

	//BUILD LEVELS
	PLANETS.sort(function(a,b) { return a.order - b.order }).map(function(p) {
		p.levels = LEVELS.filter(l => l.planet == p.id);
		//(temp) fill empty planet with default levels
		if(p.levels.length==0) p.levels = LEVELS.filter(l => l.planet == 'zeguema');
		//order levels
		p.levels = p.levels.sort(function(a,b) { return a.level - b.level });
	});

	//MENU
	MENU = new Menu(PLANETS);
	this.menu_cont.addChild(MENU);
	//MENU.open();



	//SPOT
	const config = LEVELS.find(s => s.alias == 'flhoston1');
	window.addSpot(config,false);

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

	window.resizeCanvas();


	/*let bar = new XpBar({width: 500, height: 30, dispatcher: stage});
	bar.x = STAGEWIDTH/2;
	bar.y = STAGEHEIGHT/2;
	stage.addChild(bar);

	bar.start(0, 13000, 1);
*/

	let image = new createjs.Bitmap(queue.getResult('spot_front'));
	image.x = 0;
	image.y = 300;
	var matrix = new createjs.ColorMatrix().adjustHue(11).adjustSaturation(-71);
	var filter = new createjs.ColorMatrixFilter(matrix);
  image.filters = [filter];
  image.cache(0, 0, image.getBounds().width, image.getBounds().height);
	//window.Stage.addChild(image);



}

window.tick = function(e) {

	if(PAUSED) return;
	window.Stage.update(e);
}

window.loadSpot = function(event, name = 'default') {

	console.log('Loading spot "'+name+'"')

	window.menu_cont.removeAllChildren();

	const spot = LEVELS.find(s => s.name === name || s.alias === name);

	if(typeof spot === 'undefined') {
		console.error(name+ " spot can't be found...");
	}

	if(event) {
		event.stopPropagation();
	}

	window.addSpot(spot);
}

window.addSpot = function(config, launch = true) {

	//clear previous spot
	if(SPOT) {
		SPOT.remove();
		window.removeSpot(SPOT);
	}
	//clear stage
	window.spot_cont.removeAllChildren();
	//create spot with new config
	SPOT = new Spot(config);
	//add it
	window.spot_cont.addChild(SPOT);

}

window.removeSpot = function(spot) {

	if(SPOT === null) return;
	spot.remove();
	window.spot_cont.removeChild(spot);
	SPOT = null;
}


window.initRunnerMode = function(e) {

	SPOT.initRunMode();
}



window.keyDownHandler = function(e)
{
   switch(e.key)
   {
    case 'b':  SPOT.getWave().addBlockBreaking(200); break;
    case 'n':  SPOT.getWave().addBreakingPeak(50,500); break;
    case 'm':  MENU.switch(); break;
    case 's':  window.loadSpot(null,'default'); break;
    case 'a':  SPOT.breakAllWaves(); break;
    case 'p':  window.pause(); break;
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
    case 'q':  initRunnerMode(); break;
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

	var windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
	var windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

	var currentHeight = window.Stage.canvas.height;
	var currentWidth = window.Stage.canvas.width;
	if(windowHeight < window.Stage.canvas.height) {
		currentHeight = windowHeight;
		currentWidth = currentHeight * RATIO;
	}
	if(windowWidth < window.Stage.canvas.width) {
		currentWidth = windowWidth;
		currentHeight = currentWidth / RATIO;
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
