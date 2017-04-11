/*var test = new ParticleEmitter({
		x: 500,
		y: 300,
		density: 10,
		callback : function() { console.log('callback')},
		magnitude: 10,
		angle: 0,
		spread: Math.PI,
		size: 1,
		scaler: 0.5,
		rotate: 0.1,
		rotatemax: 10,
		//tweens: [[{alpha:0},2000]],
		//forces: [vec2.fromValues(0,0.01)],
		//shapes: [{shape:'star',fill:'#FFF',stroke:0.1,strokeColor:'red',percentage:50},{shape:'circle',fill:null,stroke:0.1,strokeColor:'red',percentage:50}]
	});
	stage.addChild(test);
	createjs.Tween.get(test).to({x:1000},5000);
	*/

(function() {
	
	function Particle(params) {

		this.Container_constructor();

		this.params = params;
		this.position = params.position || new vec2.fromValues(0,0);
		this.velocity = params.velocity || new vec2.fromValues(0,0);
		this.forces = params.forces || [];
		this.acceleration = params.acceleration || new vec2.fromValues(0,0);
		this.scaler = params.scaler || 0;
		this.color = params.color || '#FFF';
		this.size = params.size || 10;
		this.fader = params.fader || 0;
		this.rotate = params.rotate || 0;
		this.tweens = params.tweens || [];
		this.shapes = params.shapes || [];
		this.scale = 1;
		
		this.drawParticle();

		//aplly tweens
		for(var i=0,len=this.tweens.length;i<len;i++) {
			var tween = this.tweens[i];
			createjs.Tween.get(this).to(tween[0],tween[1]);
		}
	}

	var prototype = createjs.extend(Particle, createjs.Container);

	prototype.drawParticle = function() {
		
		if(this.shapes.length == 0) {
			var shape = new createjs.Shape();
			shape.graphics.beginFill('#FFF').drawCircle(0,0,this.size);
		}
		else if(this.shapes.length == 1) {
			var shape = this.createShape(this.shapes[0]);
		}
		else {
			var rand = Math.random() * 100;
			var pc = 0;
			for(var i=0,len=this.shapes.length;i<len;i++) {
				var pc = pc + this.shapes[i].percentage;
				if( rand <= pc) {
					var shape = this.createShape(this.shapes[i]);
					break;
				}
			}
		}
		shape.x = - this.size/2;
		shape.y = - this.size/2;
		this.addChild(shape);
	}

	prototype.createShape = function(config) {

		var shape = new createjs.Shape();
		var k = shape.graphics;			
		if(config.stroke) k.setStrokeStyle(config.stroke);
		if(config.strokeColor) k.beginStroke(config.strokeColor);
		if(config.fill) k.beginFill(config.fill);
		if(config.shape == 'circle') k.drawCircle(0,0,this.size);
		if(config.shape == 'rect') k.drawRect(0,0,this.size,this.size);
		if(config.shape == 'ellipse') k.drawEllipse(0,0,this.size,this.size);
		if(config.shape == 'star') k.drawPolyStar(0,0,this.size,5,0.5);		

		return shape;
	}

	prototype.update = function() {

		this.alpha -= this.fader;
		if(this.alpha<=0) this.alpha = 0;
		
		this.rotation += this.rotate;

		this.scale += this.scaler;
		this.scaleX = this.scaleY = this.scale;


		for(let i=0,len=this.forces.length;i<len;i++) {

			vec2.add(this.acceleration,this.acceleration,this.forces[i]);
		}

		vec2.add(this.velocity,this.velocity,this.acceleration);


		vec2.add(this.position,this.position,this.velocity);

		this.x = this.position[0];
		this.y = this.position[1];

	}

	prototype.addMove = function(vec) {

		vec2.add(this.position,this.position,vec);
		this.x = this.position[0];
		this.y = this.position[1];
	}

	window.Particle = createjs.promote(Particle,'Container');

}());

(function() {

	function ParticleEmitter(params) {

		this.Container_constructor();
		this.x = params.x || 0;
		this.y = params.y || 0;
		this.params = {};
		this.params.position = vec2.fromValues(0,0);
		this.params.duration = (params.duration >= 0)? params.duration : null;
		this.params.velocity = params.velocity || null;
		this.params.forces = params.forces || [];
		this.params.angle = params.angle || 0;
		this.params.magnitude = params.magnitude || 10;
		this.params.magnitudemax = params.magnitudemax || this.params.magnitude;
		this.params.spread = params.spread || 0;
		this.params.color = params.color || "#FFF";
		this.params.size = params.size || 1;
		this.params.sizemax = params.sizemax || this.params.size;
		this.params.fader = params.fader || 0;
		this.params.fadermax = params.fademax || this.params.fader;
		this.params.rotate = params.rotate || 0;
		this.params.rotatemax = params.rotatemax || this.params.rotate;
		this.params.scaler = params.scaler || 0;
		this.params.frequency = params.frequency || 100;
		this.params.density = params.density || 1;
		this.params.callback = params.callback || function() {};
		this.params.tweens = params.tweens || [];
		this.params.shapes = params.shapes || [];
		this.params.timeMode = params.timeMode || 'TIMEOUT';
		this.params.timeScale = params.timeScale || 1;
		this.params.timeInterval = 50 * this.params.timeScale;
		this.params.onEmit = params.onEmit || function() {};
		this.totalTime = 0;
		this.config = cloneObject(this.params);

		this.cleaner_interval = null;
		this.duration_interval = null;
		this.update_interval = null;

		this.particles_cont = new createjs.Container();
		this.addChild(this.particles_cont);

		if(this.params.timeMode === 'TIMEOUT') {
			this.timer();
		} 
		else {
			this.addEventListener('tick', proxy(this.tick, this));
		}		

		// emit particles for a time duration
		if(this.params.duration >= 0) this.duration_interval = window.setTimeout(proxy(this.continuousEmitting,this),this.params.frequency);
		else this.emitParticles(this.params.density);
		
		// clean invisible particles
		this.cleaner_interval = window.setInterval(proxy(this.cleanParticles,this),1000);
	}

	var prototype = createjs.extend(ParticleEmitter, createjs.Container);
	createjs.EventDispatcher.initialize(prototype);


	prototype.continuousEmitting = function() {

		if(this.paused) return;
		
		this.params.onEmit(this);

		this.totalTime += this.params.frequency;

		this.emitParticles(this.params.density);

		if(this.totalTime > this.params.duration && this.config.duration !== 0) {
			
			window.clearTimeout(this.duration_interval);			
			return;
		}

		this.duration_interval = window.setTimeout(proxy(this.continuousEmitting,this),this.params.frequency);

	}

	prototype.clear = function() {

		window.clearInterval(this.cleaner_interval);
		window.clearInterval(this.update_interval);
		if(this.params.timeMode == 'TIMEOUT') window.clearInterval(this.duration_interval);
		else createjs.Ticker.removeEventListener("tick", this.tick);
		this.removeAllChildren();
	}

	prototype.emitParticles = function(n) {

		for(let i=0; i < n; i++) {
			let particule = this.createParticle();
			this.particles_cont.addChild(particule);
		}
	}

	prototype.createParticle = function() {

		let angle = this.params.angle + this.params.spread - (Math.random()*this.params.spread*2);
		let magnitude = this.params.magnitude + Math.random()*(this.params.magnitudemax - this.params.magnitude);

		//if velicity is set, override angle and magnitude
		if(this.params.velocity !== null) {
			// Use an angle randomized over the spread so we have more of a "spray"
			angle = Math.atan2(this.params.velocity[1],this.params.velocity[0]) + this.params.spread - (Math.random() * this.params.spread * 2);		
			// The magnitude of the emitter's velocity
			magnitude = vec2.length(this.params.velocity);
		}

		// The emitter's position
		const position = vec2.fromValues(this.params.position[0], this.params.position[1]);
		
		// New velocity based off of the calculated angle and magnitude
		const velocity = vec2.fromValues(magnitude * Math.cos(angle), magnitude * Math.sin(angle));

		const size = this.params.size + Math.random()*(this.params.sizemax - this.params.size);

		const fader = this.params.fader + Math.random() * (this.params.fadermax - this.params.fader);

		const rotate = this.params.rotate + Math.random() * (this.params.rotatemax - this.params.rotate);

		// return our new Particle!
		return new Particle({
			position: position,
			velocity: velocity,
			size: size,
			fader: fader,
			rotate: rotate,
			color: this.params.color,
			scaler: this.params.scaler,
			forces: this.params.forces,
			tweens: this.params.tweens,
			shapes: this.params.shapes,
		});
	}

	prototype.setPaused = function(bool) {

		this.paused = (bool === true)? true : false;
		return this;
	}

	prototype.pause = function() {
		this.paused = true;
		return this;
	}

	prototype.resume = function() {
		this.paused = false;
		return this;
	}

	prototype.setTimeScale = function(scale) {

		this.params.timeScale = scale;
		this.params.timeInterval = this.config.timeInterval / scale;
		this.params.frequency = this.config.frequency / scale;
	}

	prototype.tick = function() {

		if(this.paused) return;

		this.updateParticles();
	}

	prototype.timer = function() {

		if(this.paused) return;

		this.updateParticles();

		this.update_interval = setTimeout(proxy(this.timer,this), this.params.timeInterval);
	}

	prototype.updateParticles = function() {

		if(this.particles_cont.numChildren == 0) return;

		let i = this.particles_cont.numChildren - 1;
		while(i >= 0) {
			this.particles_cont.getChildAt(i).update();
			i--;
		}
	}

	prototype.cleanParticles = function() {

		if(this.paused) return;

		let i = this.particles_cont.numChildren - 1;
		while(i >= 0) {

			let particle = this.particles_cont.getChildAt(i);
			let position = particle.localToGlobal();

			if(particle.alpha <= 0) {
				this.particles_cont.removeChildAt(i);
			}
			if(position.y - particle.scale <= 0) {
				this.particles_cont.removeChildAt(i);
			}
			if(position.y - particle.scale >= stage.canvas.height) {
				this.particles_cont.removeChildAt(i);
			}
			if(position.x - particle.scale <= 0) {
				this.particles_cont.removeChildAt(i);
			}
			if(position.x - particle.scale >= stage.canvas.width) {
				this.particles_cont.removeChildAt(i);
			}
			i--;
		}


		if(this.particles_cont.numChildren === 0) {			
			window.clearInterval(this.cleaner_interval);
			if(this.params.timeMode == 'TIMEOUT') window.clearInterval(this.duration_interval);
			else createjs.Ticker.removeEventListener("tick", this.tick);
			this.removeAllChildren();
			this.params.callback(this);

		}
	}

	window.ParticleEmitter = createjs.promote(ParticleEmitter,'Container');
}());