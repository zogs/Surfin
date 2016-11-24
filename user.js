	function User() {

		this.level = 1;
		this.xp = 0;
		this.skill_pts = 10;
		this.skill = {
			speed: 0.5, //0 to 1
			aerial: 0.2, //0 to 1
			agility: 1, //0 to 1
			paddling: 0.1,
		}

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

		this.init = function() {

			this.get();
		}
	}

