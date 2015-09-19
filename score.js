(function() {
	
	function Score() {

		this.Container_constructor();
		
		this.spot = null;

		this.x = 0;
		this.y = 0;

		this.talking = false;

		this.score = new createjs.Text('0','50px Arial','#FFFFFF');
		this.score_pt = new createjs.Point(200,20);
		this.score.x = this.score_pt.x;
		this.score.y = this.score_pt.y;

		
		this.subscore = new createjs.Text('+0','italic 14px Arial','#FFFFFF');	
		this.subscore.alpha = 0;
		this.subscore_pt = new createjs.Point(200,5);

		this.onwavescore = new createjs.Text('','italic 18px Arial','#FFFFFF');	
				
		this.message = new createjs.Text('','bold 40px Arial','#FFF');
		this.message_pt = new createjs.Point(200,70);		


		this.addChild(this.score);
		this.addChild(this.subscore);
		this.addChild(this.message);
		this.addChild(this.onwavescore);

		this.initEventsListeners();		
	}

	var prototype = createjs.extend(Score, createjs.Container);

	//add EventDispatcher
	createjs.EventDispatcher.initialize(prototype);

	prototype.initEventsListeners = function() {

		stage.on('surfer_take_off',function(event) {
			this.add(50).say('Take Off !',2000);
		},this);

		stage.on('surfer_arial_start',function(event) {			
			this.start(20).say('Arial !!!');
		},this);

		stage.on('surfer_arial_end',function(event) {			
			this.end().silence();
		},this);

		stage.on('surfer_fall_bottom',function(event) {
			this.say('Too low !',1000,'red');
		},this);

		stage.on('surfer_fall_top',function(event) {
			this.say('Too high !',1000,'red');
		},this);

		stage.on('surfer_tube_in',function(event) {
			this.start(20).say('Tube !!!');
		},this);

		stage.on('surfer_tube_out',function(event) {
			this.end().silence();
		},this);
	}

	prototype.setSpot = function(spot) {

		this.spot = spot;
	}

	prototype.start = function(n) {

		this.subscore.alpha = 1;
		this.subscore.text = '+0';
		this.subscore.scaleX = this.subscore.scaleY = 1;
		var b = this.subscore.getBounds();
		this.subscore.x = this.subscore_pt.x + b.width/2;
		this.subscore.y = this.subscore_pt.y + b.width/2;
		this.subscore.regX = b.width/2;
		this.subscore.regY = b.height/2;
		this.launch_timer = window.setInterval(proxy(this.addsub,this,[n]),150);
		return this;
	}

	prototype.addsub = function(n) {

		var u = parseInt(this.subscore.text.substr(1)) + n;
		this.subscore.text = '+'+u;
		return this;	
	}

	prototype.end = function() {
	
		window.clearInterval(this.launch_timer);

		var b = this.subscore.getBounds();
		this.subscore.x = this.subscore_pt.x + b.width/2;
		this.subscore.y = this.subscore_pt.y + b.width/2;
		this.subscore.regX = b.width/2;
		this.subscore.regY = b.height/2;

		createjs.Tween.get(this.subscore)
			.to({scaleX:4, scaleY:4 },200, createjs.Tween.elasticOut)	
			.to({scaleX:0, scaleY:0, alpha:0 },400, createjs.Tween.elasticOut)		
			;

		this.add(this.subscore.text.substr(1));


		//on-wave subscore
		var pt = this.spot.wave.surfer.localToGlobal(0,0);
		this.onwavescore.x = pt.x;
		this.onwavescore.y = pt.y;
		this.onwavescore.alpha = 1;
		this.onwavescore.text = this.subscore.text;
		createjs.Tween.get(this.onwavescore)	
			.to({alpha:0, y: (pt.y-50) },800)		
			;


		return this;
	}

	prototype.add = function(n) {

		this.score.text = parseInt(this.score.text) + parseInt(n);	
		return this;
	}

	prototype.advance = function() {

		this.score.text = parseInt(this.score.text) + parseInt(1);
		return this;
	}

	prototype.say = function(tx,time,color) {

		this.message.text = tx;		
		
		this.message.alpha = 0;
		this.message.color = 'white';
		this.message.scaleX = this.message.scaleY = 0.1;
		this.message.rotation = 180;
		var b = this.message.getBounds();
		this.message.x = this.message_pt.x + b.width/2;
		this.message.y = this.message_pt.y + b.height/2;
		this.message.regX = b.width/2;
		this.message.regY = b.height/2;

		createjs.Tween.get(this.message)
			.to({alpha:1, scaleX:1, scaleY:1, rotation:0},800,createjs.Ease.elasticOut)
			;

		if(time != undefined) window.setTimeout(proxy(this.silence,this),time);
		if(color != undefined) this.message.color = color;

		return this;
	}

	prototype.silence = function() {

		createjs.Tween.get(this.message)
			.to({alpha:0, scaleX:0, scaleY:0},400,createjs.Ease.elasticIn)
			;

		return this;
	}


	window.Score = createjs.promote(Score,'Container');

}());