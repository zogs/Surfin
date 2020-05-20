	function User() {

		this.level = 1;
		this.xp = 0;
		this.points = 0;
		this.currentPlanet = "";
		this.currentLevel = "";
		this.unlocked_planets = [];
		this.unlocked_levels = [];
		this.unlocked_powers = ["boost", "shield", "hadoken"];
		this.visited_levels = [];
		this.temp = {}; //temporary data
		this.skills = {
			speed: 0.1, //0 to 1
			aerial: 0.1, //0 to 1
			agility: 0.1, //0 to 1
			paddling: 0.1,
			takeoff: 0,
			force: 0.8
		}

		this.device = {};
		//detect ANDROID or IOS
		var ua = navigator.userAgent.toLowerCase();
		this.device.android = ua.indexOf('android') > -1 ? true : false;
		this.device.ios = ( ua.indexOf('iphone') > -1 || ua.indexOf('ipad') > -1  ) ? true : false;

		this.hasPlanet = function(planet) {
			if(this.unlocked_planets.indexOf(planet.name) !== -1) return true;
			return false;
		}

		this.hasPower = function(power) {
			if(this.unlocked_powers.indexOf(power) !== -1) return true;
			return false;
		}

		this.hasLevel = function(level) {
			if(this.unlocked_levels.indexOf(level.name) !== -1) return true;
			return false;
		}

		this.unlockPlanet = function(planet) {
			if(this.unlocked_planets.indexOf(planet) === -1) this.unlocked_planets.push(planet);
		}

		this.unlockLevel = function(level) {
			if(this.unlocked_levels.indexOf(level) === -1) this.unlocked_levels.push(level);
		}

		this.visitLevel = function(level) {
			if(this.visited_levels.indexOf(level) === -1) this.visited_levels.push(level);
		}

		this.hasVisited = function(level) {
			return this.visited_levels.indexOf(level) !== -1 ? true : false;
		}

		this.notVisited = function(level) {
			return this.visited_levels.indexOf(level) === -1 ? true : false;
		}

		this.resetVisits = function() {
			this.visited_levels = [];
		}

		this.resetUnlockLevels = function() {
			this.unlocked_levels = [];
		}

		this.resetUnlockPlanet = function() {
			this.unlocked_planets = [];
		}

		this.setLevel = function(level) {
			this.level = level;
			return this;
		}

		this.setXp = function(xp) {
			this.xp = xp;
			return this;
		}

		this.setSkillPoints = function(points) {
			this.points = points;
			return this;
		}

		this.levelUp = function() {
			this.level++;
			return this;
		}

		this.addSkillPoint = function(nb =1) {
			this.points += nb;
			return this;
		}

		this.updateTemp = function() {
			this.temp = {
				level: this.level,
				xp: this.xp,
				points: this.points
			}
			return this;
		}

		this.save = function() {
			let json = JSON.stringify(this);
			localStorage.setItem("user", json);
			return this;
		}

		this.load = function() {
			let json = localStorage.getItem('user');
			let user = JSON.parse(json);
			Object.assign(this, user);
			return this;
		}


		this.updateTemp();
	}

	function UserManager() {

		this.save = function(user) {

			var json = JSON.stringify(user);
			localStorage.setItem("user",json);

			return this.user = user;
		}

		this.load = function() {

			var json = localStorage.getItem('user');
			var user = JSON.parse(json);

			return user;
		}

		this.get = function() {

			if(this.user) return this.user;

			var user = this.load();
			if(user !== null) {
				return this.user = user;
			}
			else {
				return this.user = new User();

			}
		}

		this.new = function() {

			return this.user = new User();
		}

		this.init = function() {

			return this.get();
		}
	}

