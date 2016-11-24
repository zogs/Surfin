var stage;

window.loaded = function() {

	window.resizeCanvas();

	stage = new createjs.Stage('canvas');	
	stage.enableMouseOver(10);

	queue = new createjs.LoadQueue();
	queue.addEventListener('complete',initialize);
	queue.loadManifest([
		{id:'bg_paradize',src:'assets/img/bkg/sea.jpg'},
		{id:'wave',src:'assets/img/waves/wave1.jpg'},
		{id:'wave_riddle',src:'assets/img/waves/wave-riddle.png'},
		{id:'surfer_E',src:'assets/img/surfer/E.png'},
		{id:'surfer_EEEN',src:'assets/img/surfer/EEEN.png'},
		{id:'surfer_EEES',src:'assets/img/surfer/EEES.png'},
		{id:'surfer_EEN',src:'assets/img/surfer/EEN.png'},
		{id:'surfer_EES',src:'assets/img/surfer/EES.png'},
		{id:'surfer_EN',src:'assets/img/surfer/EN.png'},
		{id:'surfer_ES',src:'assets/img/surfer/ES.png'},
		{id:'surfer_N',src:'assets/img/surfer/N.png'},
		{id:'surfer_NE',src:'assets/img/surfer/NE.png'},
		{id:'surfer_NW',src:'assets/img/surfer/NW.png'},
		{id:'surfer_NWW',src:'assets/img/surfer/NWW.png'},
		{id:'surfer_S',src:'assets/img/surfer/S.png'},
		{id:'surfer_SE',src:'assets/img/surfer/SE.png'},
		{id:'surfer_SSW',src:'assets/img/surfer/SSW.png'},
		{id:'surfer_SW',src:'assets/img/surfer/SW.png'},
		{id:'surfer_W',src:'assets/img/surfer/W.png'},
		{id:'surfer_WN',src:'assets/img/surfer/WN.png'},
		{id:'surfer_WNN',src:'assets/img/surfer/WNN.png'},
		{id:'surfer_WS',src:'assets/img/surfer/WS.png'},
		{id:'surfer_WSS',src:'assets/img/surfer/WSS.png'},
		{id:'surfer_takeoff',src:'assets/img/surfer/takeoff.png'},
		{id:'paddler',src:'assets/img/surfer/paddler.png'},
		{id:'surfer_paddle',src:'assets/img/surfer/P.png'},
		{id:'photographer',src:'assets/img/object/photographer.png'},
		{id:'wash_plouf',src:'assets/img/object/wash.svg'},
		{id:'wash',src:'assets/img/object/wash.png'},
		{id:'washed_text',src:'assets/img/washed.png'}

		]);


	Justice.init();

}

window.initialize = function() {	

	//Globals
	STAGEWIDTH = stage.canvas.width;
	STAGEHEIGHT = stage.canvas.height;
	MOUSE_X = STAGEWIDTH/2;
	MOUSE_Y = STAGEHEIGHT/2;
	MOUSE_POINTS = [new createjs.Point(MOUSE_X,MOUSE_Y)];

	DEBUG = 0;
	TEST = 0;
	PAUSED = 0;
	PERF = 3;

	//USER
	USER = new UserManager();
	USER.init();

	//SPOT
	SPOT = new Spot();
	SPOT.init();
	stage.addChild(SPOT);
	

	//customizer
	initCustomizer();

	//init onEnterFrame
	createjs.Ticker.addEventListener('tick',tick);

	//init Mouse move 
	stage.addEventListener('stagemousemove',onMouseMove);

	 //keyboard handlers
	window.onkeyup = keyUpHandler;
	window.onkeydown = keyDownHandler;

	//resize event
	window.onresize = browserResize;

}

window.browserResize = function() {
	if(window.browserResizeTimeout) window.clearTimeout(window.browserResizeTimeout);	
	window.browserResizeTimeout = window.setTimeout(window.browserResizeEnded,500);
}

window.browserResizeEnded = function() {

	window.resizeCanvas();
}

window.resizeCanvas = function() {

	//parent div size
	//var parent = document.getElementById('canvas').parentElement;
	//var width = parent.style.width;
	//var height = parent.style.height;
	//document.getElementById('canvas').style.width = width;
	//document.getElementById('canvas').style.height = height;

	//fullscreen
	var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
	var height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;	
	document.getElementById('canvas').style.width = width+'px';
	document.getElementById('canvas').style.height = height+'px';
}

window.addSpot = function(config) {

	//clear stage
	stage.removeAllChildren();
	//create spot with new config
	SPOT = new Spot(config);
	//add it
	stage.addChild(SPOT);
	//launch initial set
	SPOT.launch();

}


window.tick = function() {

	stage.update();

}

window.keyDownHandler = function(e)
{
   switch(e.keyCode)
   {
    case KEYCODE_B:  SPOT.getWave().addBlockBreaking(200); break;
    case KEYCODE_N:  SPOT.getWave().addBreakingPeak(200,800); break;
    case KEYCODE_S:  window.addSpot(); break;
    case KEYCODE_A:  SPOT.breakAllWaves(); break;
    case KEYCODE_P:  window.pause(); break;
    //case KEYCODE_M:  SCORE.say('Hello !',3000); break;
    case KEYCODE_F:  SPOT.getWave().getSurfer().fall(); break;
    case KEYCODE_Z:  SPOT.addPaddlerBot(); break;
    case KEYCODE_R:  SPOT.getWave().addTestSurferBot(); break;
    case KEYCODE_O:  SPOT.getWave().addRandomObstacle(); break;
    case KEYCODE_I:  SPOT.getWave().addFlyingObstacle(); break;
    case KEYCODE_T:  switchTestMode(); break;
    case KEYCODE_D:  switchDebugMode(); break;
   } 
}

window.keyUpHandler = function(e)
{
   switch(e.keyCode)
   {
    case KEYCODE_B:  break;
   } 
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

	return vec2.fromValues(getMousePoint(n).x - getMousePoint(n+1).x,getMousePoint(n).y - getMousePoint(n+1).y);
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

window.pause = function() {

	if(PAUSED === 1) {
		PAUSED = 0;
		createjs.Ticker.setPaused(false);		
		console.log('PAUSE DESACTIVATED');
	}
	else {
		PAUSED = 1;
		createjs.Ticker.setPaused(true);		
		console.log('PAUSE ACTIVATED !');
	}	
}