var stage;

window.loaded = function() {

	var width = window.innerWidth
	|| document.documentElement.clientWidth
	|| document.body.clientWidth;

	document.getElementById('canvas').style.width = width+'px';

	stage = new createjs.Stage('canvas');



	queue = new createjs.LoadQueue();
	queue.addEventListener('complete',initialize);
	queue.loadManifest([
		{id:'bg_paradize',src:'assets/img/bkg/spot.jpg'},
		{id:'wave',src:'assets/img/waves/wave1.jpg'},
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
		{id:'surfer_paddle',src:'assets/img/surfer/P.png'},
		{id:'photographer',src:'assets/img/object/photographer.png'},
		{id:'wash_plouf',src:'assets/img/object/wash.svg'},
		{id:'wash',src:'assets/img/object/wash.png'}

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

	var background = new createjs.Bitmap(queue.getResult('bg_paradize'));
	stage.addChild(background);


	//SPOT
	SPOT = new Spot();
	stage.addChild(SPOT);
	SPOT.addWave(50,200);
	SPOT.addWave(100,300);
	SPOT.addWave(200,480);

	//SCORE
	SCORE = new Score();
	SCORE.setSpot(SPOT);
	stage.addChild(SCORE);

	//DEBUG
	DEBUG = {
		active: true,
		opacity: 0.2
	}

	
	//init onEnterFrame
	createjs.Ticker.addEventListener('tick',tick);

	//mouse point
	MOUSE = new createjs.Shape();
	MOUSE.graphics.beginFill('white').drawCircle(0,0,2);
	stage.addChild(MOUSE);

	//init Mouse move 
	stage.addEventListener('stagemousemove',onMouseMove);


	 //keyboard handlers
	window.onkeyup = keyUpHandler;
	window.onkeydown = keyDownHandler;
	

	
}


window.tick = function() {

	stage.update();
}

window.keyDownHandler = function(e)
{
   switch(e.keyCode)
   {
    case KEYCODE_B:  SPOT.getWave().addBlockBreaking(); break;
    case KEYCODE_N:  SPOT.getWave().addBreakingPeak(200,800); break;
    case KEYCODE_S:  SPOT.removeAllWaves().addInitialSerie(); break;
    case KEYCODE_A:  SPOT.breakAllWaves(); break;
    case KEYCODE_R:  SPOT.removeAllWaves(); break;
    case KEYCODE_P:  SPOT.pauseAllWaves(); break;
    case KEYCODE_M:  SCORE.say('Test !',3000); break;
    case KEYCODE_T:  SPOT.getWave().getSurfer().testTrail(); break;
    case KEYCODE_F:  SPOT.getWave().getSurfer().fall(); break;
    case KEYCODE_O:  SPOT.getWave().addObstacle(); break;
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

	createjs.Tween.get(MOUSE).to({x: e.stageX,y:e.stageY},100);

	var pt = new createjs.Point(MOUSE_X,MOUSE_Y);
	MOUSE_POINTS.unshift(pt);
	MOUSE_POINTS = MOUSE_POINTS.slice(0,300);

}

window._getMousePoint = function(n) {

	if(MOUSE_POINTS.length < n) return MOUSE_POINTS[MOUSE_POINTS.length];
	return MOUSE_POINTS[n];
}

window._getMouseVector = function(n) {

	return vec2.fromValues(_getMousePoint(n).x,_getMousePoint(n).y);
}

