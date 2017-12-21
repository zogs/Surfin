
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
		{id:'bg_paradize',src:'assets/img/bkg/sea.jpg'},
		{id:'wave',src:'assets/img/waves/wave1.jpg'},
		{id:'wave_riddle',src:'assets/img/waves/wave-riddle.png'},
		{id:'spot_seariddle',src:'assets/img/spots/default/seariddles.png'},
		{id:'spot_front',src:'assets/img/spots/default/front.png'},
		{id:'spot_back',src:'assets/img/spots/default/bkg_night.jpg'},
		{id:'bomb_boom',src:'assets/img/object/bomb_boom.png'},
		{id:'surfer_splash',src:'assets/img/object/splash.gif'},
		{id:'surfer',src:'assets/img/surfer/surfer_stormtrooper.png'},	
		{id:'surfer_takeoff',src:'assets/img/surfer/takeoff.png'},
		{id:'paddler',src:'assets/img/surfer/paddler.png'},
		{id:'surfer_paddle',src:'assets/img/surfer/P.png'},
		{id:'photographer',src:'assets/img/object/photographer.png'},
		{id:'wash_plouf',src:'assets/img/object/wash.svg'},
		{id:'wash',src:'assets/img/object/wash.png'},
		{id:'sprite_beachtrooper',src:'assets/img/object/beachtrooper.png'},
		{id:'washed_text',src:'assets/img/washed.png'}

		]);

	createjs.Sound.alternateExtensions = ["mp3"];
 	createjs.Sound.registerSound("assets/sounds/yeah.mp3", "bravo");
 	


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

	//USER
	USER = new UserManager();
	USER.new();

	//SCREEN
	SCREENS = new ScreenManager();

	//SPOT
	const spot = SPOTSCONF.find(s => s.alias == 'default');
	window.addSpot(spot,false);

	/*const boom = new createjs.SpriteSheet({
			images: [queue.getResult('bomb_boom')],
			frames: {width:312, height:285},
			framerate: 0.1,
			animations: {
				floating: [0,5,false],
				explode: [2,7,false,1],
			}
		});

		const animation = new createjs.Sprite(boom,'boom');
		animation.y = 400;
		animation.x = 300;
		animation.gotoAndStop('floating');
		stage.addChild(animation);
	*/

	//MENU
	addMenu();

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

	// set customizer
	initCustomizer();

	window.resizeCanvas();


}


window.tick = function() {

	//console.log(createjs.Tween._tweens.length);
	stage.update();	
}

window.loadSpot = function(event, name = 'default') {

	console.log('Loading spot "'+name+'"')

	const spot = SPOTSCONF.find(s => s.name === name || s.alias === name);

	if(spot === undefined) {
		console.error(name+ " spot can't be found...");
	}

	if(event) {
		event.stopPropagation();
	}

	window.addSpot(spot);
}

window.addSpot = function(spot, launch = true) {

	//clear stage
	stage.removeAllChildren();
	//create spot with new config
	SPOT = new Spot(spot);
	//add it
	stage.addChild(SPOT);
	//launch initial set
	if(launch)  SPOT.launch();
	else SPOT.init();
	// add menu
	window.addMenu();

}

window.removeSpot = function(spot) {

	spot.remove();

	//stage.removeAllEventListeners();
	stage.removeChild(spot);

	spot = null;
	SPOT = null;
}


window.initRunnerMode = function(e) {

	SPOT.initRunMode();

}

window.addMenu = function() {

	const cont = new createjs.Container();
	const bkg = new createjs.Shape();
	const txt = new createjs.Text('Menu','16px Helvetica');
	const bound = txt.getBounds();
	const pad = {x: 10, y: 5};

	bkg.graphics.beginFill('#FFF').drawRoundRect(-bound.x/2 - pad.x, -bound.y - pad.y, bound.width + pad.x*2, bound.height + pad.y*2, 5);

	cont.x = 20;
	cont.y = 10;
	cont.addChild(bkg,txt);
	stage.addChild(cont);

	cont.on('click',showMenu);
}

window.showMenu = function(e) {

	e.stopPropagation();
	console.log('menu');

	stage.removeAllChildren();

	const spots = SPOTSCONF;

	const background = new createjs.Bitmap(queue.getResult('bg_paradize'));
	stage.addChild(background);

	const cont = new createjs.Container();
	cont.x = STAGEWIDTH/10;
	stage.addChild(cont);

	let rowx = 200;
	let rowy = 100;
	let posx = 0;
	let posy = 0;
	for(let i=0,len=spots.length; i< len; ++i) {

		let spot = spots[i];
		let button = new createjs.Container();
		let txt = new createjs.Text(spot.name,'26px Helvetica');
		let bkg = new createjs.Shape();
		let bound = txt.getBounds();
		let pad = {x: 30, y: 15};

		bkg.graphics.beginFill('#EEE').drawRoundRect(-bound.x/2 - pad.x, -bound.y - pad.y, bound.width + pad.x*2, bound.height + pad.y*2, 5);

		posy += rowy;

		if(posy >= STAGEHEIGHT - 100) {
			posx += rowx;
			posy = rowy;
		}

		button.x = posx;
		button.y = posy;
		button.addChild(bkg,txt);
		cont.addChild(button);

		button.on('click', loadSpot, null, true, spot.name, true);

	}


}


window.keyDownHandler = function(e)
{
   switch(e.key)
   {
    case 'b':  SPOT.getWave().addBlockBreaking(200); break;
    case 'n':  SPOT.getWave().addBreakingPeak(50,500); break;
    case 's':  window.loadSpot(null,'default'); break;
    case 'a':  SPOT.breakAllWaves(); break;
    case 'p':  window.pause(); break;
    case ' ':  window.pause(); break;
    case 'f':  SPOT.getWave().getSurfer().fall(); break;
    case 'z':  SPOT.addPaddlerBot(); break;
    case 'r':  SPOT.getWave().addTestSurferBot(); break;
    case 'o':  SPOT.getWave().addBomb(); break;
    case '&':  SPOT.getWave().addBeachTrooper(); break;
    case 'i':  SPOT.getWave().addFlyingObstacle(); break;
    case 'k':  SPOT.getWave().getSurfer().updateLifebar(0.2); break;
    case 't':  switchTestMode(); break;
    case 'd':  switchDebugMode(); break;
    case 'w':  switchSlowMo(0.1,500); break;
    case 'q':  initRunnerMode(); break;
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

	SPOT.setTimeScale(TIME_SCALE);
}

window.pause = function() {

	if(PAUSED === 1) {
		PAUSED = 0;
		createjs.Ticker.paused = false;	
		SPOT.resume();	
		console.log('PAUSE DESACTIVATED');
	}
	else {
		PAUSED = 1;
		createjs.Ticker.paused = true;		
		SPOT.pause();
		console.log('PAUSE ACTIVATED !');
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

	if (USER.get().device.android || USER.get().device.ios) { //if android or ios
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
