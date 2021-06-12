class Scene {
  constructor() {

    this.shaking = false;
    this.shaking_force = 1;

  }

  loadLevel(name,args) {

    //stop click propagation
    if(args) args[0].stopImmediatePropagation();
    //clear previous spot
    if(SPOT) this.removeLevel(SPOT);
    //close menu
    MENU.close();
    //clear stage
    window.spot_cont.removeAllChildren();
    window.extra_cont.removeAllChildren();
    //create spot with new config
    SPOT = new SPOTS[name]();
    //add it
    window.spot_cont.addChild(SPOT);
    //stock progression
    USER.currentLevel = SPOT.id;
    USER.currentPlanet = SPOT.planet.id;
  }

  reloadLevel(e) {

    if(e) e.stopImmediatePropagation();
    let spotname = SPOT.id;
    this.removeLevel(SPOT);
    window.spot_cont.removeAllChildren();
    window.extra_cont.removeAllChildren();
    SPOT = new SPOTS[spotname]({
      retrying: true,
    });
    window.spot_cont.addChild(SPOT);
  }

  removeLevel(level) {

    if(SPOT === null) return;
    SPOT.remove();
    window.spot_cont.removeChild(SPOT);
    SPOT = null;
  }

  gotoNextLevel() {
    let level = this.getNextLevel();
    this.loadLevel(level.id);
  }

  getNextLevel() {

    let planet = PLANETS.find(p => p.id == USER.currentPlanet);
    let nextlevel = planet.levels[planet.levels.indexOf(USER.currentLevel) + 1];
    if(nextlevel) {
      return { planet_id: planet.id, id: nextlevel}
    } else {
      let nextplanet = PLANETS[PLANETS.indexOf(planet) + 1];
      let firstlevel = nextplanet.levels[0];
      return { planet_id: nextplanet.id, id: firstlevel}
    }
  }

  unlockNextLevel() {

    let nextlevel = this.getNextLevel();
    USER.unlockPlanet(nextlevel.planet_id);
    USER.unlockLevel(nextlevel.id);
  }

  switchShaking = function(force) {
    if(this.shaking === true) this.stopShaking();
    else this.startShaking(force);
  }

  startShaking = function(force) {
    this.shaking = true;
    this.shake(force);
  }

  stopShaking = function() {
    this.shaking = false;
  }

  shake = function(force) {

    if(this.shaking===false) return;

    if(force) this.shaking_force = force;
    this.shaking_force *= 5/6;

    let amplitude = (STAGEWIDTH*1/100)*this.shaking_force;
    if(amplitude < 1) {
      amplitude = 0;
      return null;
    }

    const x = Math.floor(Math.random()*amplitude*2 - amplitude);
    const y = Math.floor(Math.random()*amplitude*2 - amplitude);

    createjs.Tween.get(window.spot_cont)
      .to({x:x,y:y},75)
      .call(proxy(this.unshake,this));
  }

  unshake = function() {

    createjs.Tween.get(window.spot_cont)
      .to({x:0,y:0},75)
      .call(proxy(this.shake,this, [null]));
  }
}