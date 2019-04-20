
// define usefull const
var stage;


// define global usefull constant
// (NB: use positive numeric for perf reason)
const LEFT = 1;
const CENTER = 0;
const RIGHT = 2;

window.loaded = function() {

	stage = new createjs.Stage('canvas');
	stage.enableMouseOver(10);

	queue = new createjs.LoadQueue();
	queue.addEventListener('complete',initialize);
	queue.loadManifest([
		{id:'bg_paradize',src:'assets/img/spots/default/full.jpg'},
		{id:'wave',src:'assets/img/waves/wave1.jpg'},
		{id:'wave_riddle',src:'assets/img/waves/wave-riddle.png'},
		{id:'spot_seariddle',src:'assets/img/spots/default/seariddles.png'},
		{id:'spot_back',src:'assets/img/spots/zegema_beach/back.jpg'},
		{id:'spot_back_home',src:'assets/img/spots/default/homeback.jpg'},
		{id:'spot_front_home',src:'assets/img/spots/default/homefront.png'},
		{id:'spot_front',src:'assets/img/spots/default/beach.png'},
		{id:'btn_startgame',src:'assets/img/buttons/btn_startgame.png'},
		{id:'btn_level',src:'assets/img/buttons/btn_level.png'},
		{id:'btn_menu',src:'assets/img/buttons/btn_menu.png'},
		{id:'btn_close',src:'assets/img/buttons/btn_close.png'},
		{id:'dog',src:'assets/img/object/spacedog.png'},
		{id:'bomb',src:'assets/img/object/astro_bomb.png'},
		{id:'boom',src:'assets/img/object/astro_boom.png'},
		{id:'surfer_splash',src:'assets/img/object/splash.gif'},
		{id:'surfer',src:'assets/img/surfer/astrosurfer_moves.png'},
		{id:'surfer_takeoff',src:'assets/img/surfer/astrosurfer_takeoff.png'},
		{id:'paddler',src:'assets/img/surfer/astropaddler.png'},
		{id:'photographer',src:'assets/img/object/photographer.png'},
		{id:'cigogne',src:'assets/img/object/cigogne.png'},
		{id:'drone',src:'assets/img/object/drone.png'},
		{id:'wash_plouf',src:'assets/img/object/wash.svg'},
		{id:'wash',src:'assets/img/object/wash.png'},
		{id:'sprite_beachtrooper',src:'assets/img/object/beachtrooper.png'},
		{id:'washed_text',src:'assets/img/washed.png'},
		{id:'star', src:'assets/img/object/star.png'},
		{id:'shark', src:'assets/img/object/shark.png'},
		{id:'ptero', src:'assets/img/object/ptero.png'},
		{id:'spacetablet', src:'assets/img/bkg/tablet.png'},
		{id:'caladan', src:'assets/img/planets/caladan.png'},
		{id:'flhoston', src:'assets/img/planets/flhoston.png'},
		{id:'kashykkk', src:'assets/img/planets/kashykkk.png'},
		{id:'pandora', src:'assets/img/planets/pandora.png'},
		{id:'zeguema', src:'assets/img/planets/zeguema.png'},
		{id:'gargantua', src:'assets/img/planets/gargantua.png'},
		{id:'lock', src:'assets/img/planets/lock.png'},
		{id:'caladan_back', src:'assets/img/spots/Caladan_Peak/back.jpg'},

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
	STAGEWIDTH = stage.canvas.width;
	STAGEHEIGHT = stage.canvas.height;
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
	stage.addChild(window.spot_cont);
	window.border_cont = new createjs.Container();
	stage.addChild(window.border_cont);
	window.menu_cont = new createjs.Container();
	stage.addChild(window.menu_cont);
	window.pause_cont = new createjs.Container();
	stage.addChild(window.pause_cont);

	let border = new createjs.Shape();
	border.graphics.beginStroke('#000').setStrokeStyle(10).moveTo(0,0).lineTo(STAGEWIDTH,0).lineTo(STAGEWIDTH,STAGEHEIGHT).lineTo(0,STAGEHEIGHT).closePath();
	window.border_cont.addChild(border);


	//USER
	USER = new User();
	//USER.load();

	//SCREEN
	SCREENS = new ScreenManager();

	//BUILD LEVELS
	PLANETS.map(function(p) {
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
	//const config = LEVELS.find(s => s.alias == 'home');
	//window.addSpot(config,false);
	SCREENS.showHome();


	//init onEnterFrame
	createjs.Ticker.timingMode = createjs.Ticker.TIMEOUT;
	createjs.Ticker.addEventListener('tick',tick);

	//init Mouse move
	stage.addEventListener('stagemousemove',onMouseMove);

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

}

window.tick = function(e) {

	if(PAUSED) return;
	stage.update(e);
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
	//init spot
  SPOT.init();
	// add menu
	//SCREENS.addMenuIcon();

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
		stage.update();

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

	var currentHeight = stage.canvas.height;
	var currentWidth = stage.canvas.width;
	if(windowHeight < stage.canvas.height) {
		currentHeight = windowHeight;
		currentWidth = currentHeight * RATIO;
	}
	if(windowWidth < stage.canvas.width) {
		currentWidth = windowWidth;
		currentHeight = currentWidth / RATIO;
	}

	if (USER.device.android || USER.device.ios) { //if android or ios
		//hide address bar
        document.body.style.height = (windowHeight + 50) + 'px';
        //enable Touch event
        createjs.Touch.enable(stage);
    }

	document.getElementById('canvas').style.width = currentWidth+'px';
	document.getElementById('canvas').style.height = currentHeight+'px';

	//scroll to top
	window.setTimeout(function() { //rowsers don't fire if there is not short delay
		window.scrollTo(0,1);
    }, 1);

}
