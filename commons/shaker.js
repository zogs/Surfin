function Shaker(target, smoothing = 0.5) {
	
	const _target = target, 
			_posX = target.x, 
			_posY = target.y;
	let _delta = {x:0, y:0}, 
		_frequency = 0, 
		_smoothing = smoothing;
		_tween = null;


	this.shake = function(powerX = 10, powerY = 0, frequency = 100) {

		_delta.x = powerX;
		_delta.y = powerY;
		_frequency = frequency

		this.initShake();
	}

	this.initShake = function() {

		this._tween = createjs.Tween.get(_target)
			.to({x: _posX + _delta.x/2, y: _posY + _delta.x/2}, _frequency)
			.to({x: _posX - _delta.y/2, y: _posY - _delta.y/2}, _frequency)
			.to({x: _posX, y: _posY}, _frequency/2)
			.call(proxy(this.continueShake,this))
			;
	}

	this.continueShake = function() {

		_delta.x *= 0.5;
		_delta.y *= 0.5;

		if(_delta.x < 0) _delta.x = 0;
		if(_delta.y < 0) _delta.y = 0;
		if(_delta.x < 1 && _delta.y < 1) return this.endShake();

		this._tween = createjs.Tween.get(_target)
			.to({x: _target.x + _delta.x/2, y: _target.y + _delta.y/2}, _frequency/2)
			.to({x: _target.x - _delta.x/2, y: _target.y - _delta.y/2}, _frequency)
			.to({x: _posX, y: _posY}, _frequency/2)
			.call(proxy(this.continueShake,this))
			;
	}

	this.endShake = function() {

		_tween = null;
		_delta.x = 0;
		_delta.y = 0;
	}

}