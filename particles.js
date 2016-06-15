(function() {
	
	function Particle(params) {

		this.Container_constructor();

		this.params = params;
		this.position = params.position || new vec2.fromValues(0,0);
		this.velocity = params.velocity || new vec2.fromValues(0,0);
		this.gravity = params.gravity || new vec2.fromValues(0,0);
		this.acceleration = params.acceleration || new vec2.fromValues(0,0);
		this.scaler = params.scaler || 0;
		this.color = params.color || '#FFF';
		this.size = params.size || 10;
		this.fade = params.fade || 0;
		this.rotate = params.rotate || 0;
		this.scale = 1;
		
		this.drawParticle();

		/*
		var angle = new createjs.Shape();	
		angle.graphics.setStrokeStyle(1).beginStroke('red').moveTo(20,20).lineTo(this.velocity[0],this.velocity[1]);
		this.addChild(angle);
		*/
	}

	var prototype = createjs.extend(Particle, createjs.Container);

	prototype.drawParticle = function() {

		var shape = new createjs.Shape();
		shape.graphics.beginFill(this.color).drawCircle(0,0,this.size);
		shape.x = - this.size/2;
		shape.y = - this.size/2;
		this.addChild(shape);
	}

	prototype.move = function() {

		vec2.add(this.acceleration,this.acceleration,this.gravity);

		vec2.add(this.velocity,this.velocity,this.acceleration);

		vec2.add(this.position,this.position,this.velocity);

		this.x = this.position[0];
		this.y = this.position[1];

		this.alpha -= this.fade;

		this.rotation += this.rotate;

		this.scale = this.scale + this.scaler;
		this.scaleX = this.scaleY = this.scale;
	}

	prototype.addMove = function(vec) {

		vec2.add(this.position,this.position,vec);
	}

	prototype.applyForce = function(vec) {

		vec2.add(this.acceleration,this.acceleration,vec);
	}

	window.Particle = createjs.promote(Particle,'Container');

}());

(function() {

	function ParticleEmitter(params) {

		this.Container_constructor();
		this.position = params.position || vec2.fromValues(0,0);
		this.velocity = params.velocity || null;
		this.angle = params.angle || 0;
		this.magnitude = params.magnitude || 10;
		this.magnitudemax = params.magnitudemax || this.magnitude;
		this.spread = params.spread || 0;
		this.color = params.color || "#FFF";
		this.size = params.size || 1;
		this.sizemax = params.sizemax || this.size;
		this.fade = params.fade || 0;
		this.fademax = params.fademax || this.fade;
		this.rotate = params.rotate || 0;
		this.rotatemax = params.rotatemax || this.rotate;
		this.gravity = params.gravity || 0;
		this.scaler = params.scaler || 0;


		
	}

	var prototype = createjs.extend(ParticleEmitter, createjs.Container);

	prototype.emitParticle = function() {

		var angle = this.angle + this.spread - (Math.random()*this.spread*2);
		var magnitude = this.magnitude + Math.random()*(this.magnitudemax - this.magnitude);

		//if velicity is set, override angle and magnitude
		if(this.velocity !== null) {
			// Use an angle randomized over the spread so we have more of a "spray"
			var angle = Math.atan2(this.velocity[1],this.velocity[0]) + this.spread - (Math.random() * this.spread * 2);		
			// The magnitude of the emitter's velocity
			var magnitude = vec2.length(this.velocity);
		}

		// The emitter's position
		var position = vec2.fromValues(this.position[0], this.position[1]);
		
		// New velocity based off of the calculated angle and magnitude
		var velocity = vec2.fromValues(magnitude * Math.cos(angle), magnitude * Math.sin(angle));

		var size = this.size + Math.random()*(this.sizemax - this.size);

		var fade = this.fade + Math.random() * (this.fademax - this.fade);

		var rotate = this.rotate + Math.random() * (this.rotatemax - this.rotate);
		// return our new Particle!
		return new Particle({
			position: position,
			velocity: velocity,
			color: this.color,
			size: size,
			fade: fade,
			rotate: rotate,
			scaler: this.scaler,
		});
	}

	window.ParticleEmitter = createjs.promote(ParticleEmitter,'Container');
}());