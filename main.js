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
		{id:'surfer_WSS',src:'assets/img/surfer/WSS.png'}
		]);


	Justice.init();

}

window.initialize = function() {
	console.log('initialize');

	//Globals
	_stageWidth = stage.canvas.width;
	_stageHeight = stage.canvas.height;
	_mouseX = _stageWidth/2;
	_mouseY = _stageHeight/2;
	_mousePoints = [new createjs.Point(_mouseX,_mouseY)];
	_waves = [];

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
	stage.addChild(SCORE);

	//init onEnterFrame
	createjs.Ticker.addEventListener('tick',tick);

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

	_mouseX = e.stageX;
	_mouseY = e.stageY;

	var pt = new createjs.Point(_mouseX,_mouseY);
	_mousePoints.unshift(pt);
	_mousePoints = _mousePoints.slice(0,300);

}

window._getMousePoint = function(n) {

	if(_mousePoints.length < n) return _mousePoints[_mousePoints.length];
	return _mousePoints[n];
}
