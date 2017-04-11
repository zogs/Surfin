	function User() {

		this.level = 1;
		this.xp = 0;
		this.skill_pts = 10;
		this.skills = {
			speed: 0.5, //0 to 1
			aerial: 0.2, //0 to 1
			agility: 1, //0 to 1
			paddling: 0.1,
			takeoff: 0,
			force: 0.7
		}

		this.device = {};
		//detect ANDROID or IOS
		var ua = navigator.userAgent.toLowerCase();
		this.device.android = ua.indexOf('android') > -1 ? true : false;
		this.device.ios = ( ua.indexOf('iphone') > -1 || ua.indexOf('ipad') > -1  ) ? true : false;

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

