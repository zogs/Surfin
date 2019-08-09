(function() {

  function ScoreUI(params) {

    this.Container_constructor();

    this.x = 0;
    this.y = 0;
    this.spot = params.spot;
    this.goals = this.spot.config.goals;
    that = this;

    this.disabled = false;
    this.talking = false;
    this.kill_count = 0;
    this.countdown = false;
    this.timers = [];
    this.goals_filled = false;
    this.countdown_interval = null;

    this.phrases = {
      'hit top lip' : ['Open your mouth for a free teethbrush','This wave is too big for you'],
      'hit bottom splash' : ['Beware the power of the LIP !', "May the Tube be with you !", "Yeah.. you might not want to touch the lip with your head...","Riding the top of the wave can be dangerous..."],
      'bad trajectory' : ['Be smooth, you are not Kelly Slater yet...'],
      'hit paddler' : ['Outch, this man is hurt...',"Try to avoid your fellow surfers"],
      'hit photographer' : ['Damn it, you will pay for this camera !'],
    }

    if(!this.goals) this.goals = [
      { type: 'timed', current:0, aim: 20, name: 'Survivre 20 secondes ({n}s)' },
      { type: 'score', current:0, aim: 2000, name: 'Faire un score de 2000 points' },
      { type: 'trick', current:0, aim: 'Backflip', count: 2, name: 'Faire 2 backflip ({n})' },
      { type: 'catch', current:0, aim: 'prize', count: 3, name: 'Attraper 3 prix ({n})' },
      { type: 'catch', current:0, aim: 'star', count: 50, name: 'Attraper 50 étoiles ({n})' },
      { type: 'kill', current:0, aim: 'surfer', count: 10, name: 'Défoncer 10 surfers ({n})' },
      { type: 'tube', current:0, aim: 5, name: 'Faire un tube de 5s ou + ({n})' },
    ];

    this.goalsTimers = [];

    this.levels = {
      1: 10000,
      2: 20000,
      3: 30000,
      4: 40000,
      5: 50000,
      6: 60000,
      7: 70000,
      8: 80000,
      9: 90000,
      10: 100000
    }

    this.current_score = 0;
    this.time_on_wave = 0;
    this.current_tricks_score = 0;
    this.current_multiplier = 1;
    this.points_per_level = 2;

    //containers
    this.score_cont = new createjs.Container();
    this.addChild(this.score_cont);

    //display
    this.goals_pt = new createjs.Point(20, 20);
    this.total = new createjs.Text('0','bold '+Math.floor(30*rY)+"px 'Blinker', sans-serif",'#FFFFFF');
    //this.score_cont.addChild(this.total);


    //Ticker
    this.addEventListener('tick',proxy(this.tick,this));

    this.init();

  }

  var prototype = createjs.extend(ScoreUI, createjs.Container);

  //add EventDispatcher
  createjs.EventDispatcher.initialize(prototype);

  prototype.init = function() {

    this.initCountdown();
    this.showGoals();
    this.initPlayerListeners();
    this.spot.on('player_takeoff', proxy(this.initGoalsListeners, this), null, true);
  }

  prototype.initCountdown = function() {

    if(typeof this.spot.config.timelimit == 'undefined') return;
    this.countdown = this.spot.config.timelimit;
    this.timer = new createjs.Text('00:00', Math.floor(60*rY)+"px 'Blinker',sans-serif", '#FFFFFF');
    this.timer.x = STAGEWIDTH/2 - this.timer.getMeasuredWidth()/2;
    this.timer.y = 10;
    this.timer.alpha = 0.5;
    this.score_cont.addChild(this.timer);
    this.timer.text = this.formatCountdown(this.countdown);
  }

  prototype.startCountdown = function() {

    this.countdown_interval = new Interval(proxy(this.updateCountdown,this), 1000);
    this.timers.push(this.timer);
    this.spot.on('player_fall', proxy(this.stopCountdown, this), null, true);
  }

  prototype.stopCountdown = function() {

    if(this.countdown_interval == null) return;
    this.timers.splice(this.timers.indexOf(this.countdown_interval),1);
    this.countdown_interval.clear();
    this.countdown_interval = null;
  }

  prototype.updateCountdown = function() {

    this.countdown--;
    if(this.countdown == 0) {
      this.spot.dispatchEvent('wave_timeout');
      this.stopCountdown();
    }
    if(this.countdown < 10) {
      this.timer.color = 'red';
      this.timer.alpha = 0.5 + 0.5 * (1/this.countdown);
    }
    this.timer.text = this.formatCountdown(this.countdown);
  }

  prototype.formatCountdown = function(total) {

    let min = Math.floor(total/60);
    let sec = total - min*60;
    min = (min<10)? '0'+min : min;
    sec = (sec<10)? '0'+sec : sec;
    return min+':'+sec;
  }

  prototype.timeout = function() {

    this.spot.wave.addBlockBreaking(STAGEWIDTH);

  }

  prototype.showGoals = function() {

    let pt = this.goals_pt.clone();
    let pad = 4;
    let dy = 30;

    for(let i=0,ln=this.goals.length-1;i<=ln;i++) {

      let goal = this.goals[i];
      let name = this.goalsNameFormatter(goal, 0);
      let text = new createjs.Text(name, 'bold '+Math.floor(18*rY)+"px 'Blinker', sans-serif", '#545454');

      let bkg = new createjs.Shape();
      bkg.graphics.beginLinearGradientFill(['#FFFFFFCC','#FFFFFF55'],[0.65,1],0,0,text.getMeasuredWidth(),0)
                  .drawRect(-pad,-pad,text.getMeasuredWidth()+2*pad*4, text.getMeasuredHeight()+2*pad);
      bkg.x = text.x = pt.x;
      bkg.y = text.y = pt.y;

      this.score_cont.addChild(bkg, text);
      goal.text = text;
      pt.y += dy;
    }

    //console.log(this.goals);
  }

  prototype.initGoalsListeners = function() {

    //countdown
    if(this.countdown) {
      //takeoff
      this.startCountdown();
      //timeout
      this.spot.on('wave_timeout', proxy(this.timeout, this), null, true);
    }

    //goals
    for(let i=0,ln=this.goals.length-1;i<=ln;i++) {
      let goal = this.goals[i];
      if(goal.type === 'timed') {
        this.goalsTimers.push(new Interval(proxy(this.updateGoalTime,this), 100));
      }
      if(goal.type === 'score') {
        this.goalsTimers.push(new Interval(proxy(this.updateGoalScore,this), 100));
      }
      if(goal.type === 'trick') {
        this.spot.on('surfer_aerial_end', this.updateGoalTricks );
      }
      if(goal.type === 'catch') {
        this.spot.on('bonus_hitted', this.updateGoalCatch );
      }
      if(goal.type === 'kill') {
        this.spot.on('kill', this.updateGoalKill );
      }
      if(goal.type === 'tube') {
        this.spot.on('surfer_tube_in', proxy(this.updateTubeIn, this));
        this.spot.on('surfer_tube_out', proxy(this.updateTubeOut, this));
      }
    }
  }

  prototype.updateTubeIn = function() {

   this.tubeTime = 0;
   this.goalsTimers['tube'] = new Interval(proxy(this.updateTubeTime, this), 100);
  }

  prototype.updateTubeTime = function() {
    let goal = this.goals.find(g => g.type === 'tube');
    this.tubeTime += 100;
    let seconds = Math.ceil(this.tubeTime/1000);
    goal.text.text = this.goalsNameFormatter(goal, seconds);
    goal.current = seconds;

    if(seconds == goal.aim) {
      this.setGoalFilled(goal);
    }
  }

  prototype.updateTubeOut = function() {
    let goal = this.goals.find(g => g.type === 'tube');
    if(goal.filled !== true) {
      goal.text.text = this.goalsNameFormatter(goal, 0);
      goal.current = 0;
    }
    this.goalsTimers['tube'].clear();
  }

  prototype.goalsCheck = function() {
    let total = this.goals.length;
    let count = 0;
    for(let i=0,ln=this.goals.length-1;i<=ln;i++) {
      if(this.goals[i].filled === true) count++;
    }

    if(count == total) {
      this.goals_filled = true;
    }
  }

  prototype.updateGoalTime = function() {
    let goal = this.goals.find(g => g.type === 'timed');
    let seconds = this.time_on_wave;
    goal.text.text = this.goalsNameFormatter(goal, seconds);
    goal.current = seconds;

    if(seconds == goal.aim) {
      this.setGoalFilled(goal);
    }
  }

  prototype.updateGoalScore = function() {
    let goal = this.goals.find(g => g.type === 'score');
    let score = this.current_score;
    goal.text.text = this.goalsNameFormatter(goal, score);
    goal.current = score;

    if(score == goal.aim) {
      this.setGoalFilled(goal);
    }
  }

  prototype.updateGoalTricks = function(e) {

    let trick = e.trick;
    let goal = that.goals.find(g => g.type === 'trick' && g.aim == trick.name);
    if(typeof goal === 'undefined') return;
    goal.current += 1;
    goal.text.text = that.goalsNameFormatter(goal, goal.current);

    if(goal.current == goal.count) {
      that.setGoalFilled(goal);
    }
  }

  prototype.updateGoalCatch = function(e) {
    let bonus = e.bonus;
    let goal = that.goals.find(g => g.type === 'catch' && g.aim == bonus);
    if(typeof goal === 'undefined') return;
    goal.current += 1;
    goal.text.text = that.goalsNameFormatter(goal, goal.current);

    if(goal.current == goal.count) {
      that.setGoalFilled(goal);
    }
  }

  prototype.updateGoalKill = function(e) {

    let type = e.type;
    let goal = that.goals.find(g => g.type === 'kill' && g.aim === 'surfer');
    if(typeof goal === 'undefined') return;
    goal.current += 1;
    goal.text.text = that.goalsNameFormatter(goal, goal.current);

    if(goal.current == goal.count) {
      that.setGoalFilled(goal);
    }
  }

  prototype.setGoalFilled = function(goal) {

    goal.text.color = '#018d2f';
    goal.filled = true;
    this.goalsCheck();
  }

  prototype.goalsNameFormatter = function(goal, n) {

    return goal.name.replace(/{n}/,n);
  }

  prototype.initPlayerListeners = function() {

    this.spot.on('player_takeoff',function(event) {
      this.progress();
      this.takeoff = this.newScore('Takeoff');
      this.time_on_wave = 0;
      this.timers.push(new Interval(proxy(this.updatetime_on_wave,this), 1000));
    },this, null, true);

    this.spot.on('player_takeoff_ended',function(event) {

      if(event.quality >= 50) this.takeoff.grade('Super').add(2000).end();
      else if(event.quality >= 20) this.takeoff.grade('Good').add(1000).end();
      else this.takeoff.grade('Bad').end();
      this.addScore(this.takeoff);

    },this, null, true);

    this.spot.on('surfer_aerial_start',function(event) {
      this.aerial = this.newScore(event.trick.name).add(event.trick.score).growth(20);
    },this);

    this.spot.on('surfer_aerial_end',function(event) {
      if(event.trick.quality_takeoff >= 0.75) this.aerial.grade('Super').end();
      else if(event.trick.quality_takeoff >= 0.25) this.aerial.grade('Good').end();
      else this.aerial.grade('Bad').end();
      this.addScore(this.aerial);
    },this);

    this.spot.on('surfer_tube_in',function(event) {
      this.tube = this.newScore('Tuuube !').add(100).growth(50);
    },this);

    this.spot.on('surfer_tube_out',function(event) {
      if(event.tubeTime >= 3000) {
        this.tube.grade('Super');
      }
      else {
        if(event.tubeDeep > 0.6) this.tube.grade('Super');
        else if(event.tubeDeep >= 0.4) this.tube.grade('Good');
        else if(event.tubeDeep < 0.2) this.tube.grade('Bad');
      }
      this.tube.end();
      this.addScore(this.tube);
    },this);

    this.spot.on('player_fall',function(event) {
      this.disable().stopProgress().discardAllScores();
      this.failPhrase = this.getRandomPhrase(event.reason);
    },this, null, true);

    this.spot.on('player_fallen',function(event) {
      //
    },this, null, true);

    this.spot.on('bonus_hitted',function(event) {
      let bonus = event.bonus;
      if(bonus == 'photo') {
        let score = this.newScore("Nice pic !").add(500).end();
        this.addScore(score);
      }
      if(bonus == 'drone') {
        let score = this.newScore("Great pic !").add(1000).end();
        this.addScore(score);
      }
      if(bonus == 'multiplier') {
        let score = this.newScore("[TO DO...]").add(0).end();
        this.addScore(score);
      }
      if(bonus == 'prize') {
        let score = this.newScore("Bonus !").add(event.obstacle.aim).end();
        this.addScore(score);
      }
    },this);

    this.spot.on('kill',function(event) {
      let score;
      if(event.target === 'surfer') {
        if(event.player === event.killed) score = this.newScore("Paf...").end();
        if(event.player === event.killer) {
          this.kill_count++;
          if(this.kill_count === 1) score = this.newScore('Kill!').add(100).end();
          if(this.kill_count === 2) score = this.newScore('Kill!').add(500).end();
          if(this.kill_count === 3) score = this.newScore('Kill!').add(1000).end();
          if(this.kill_count > 3) score = this.newScore('Kill!').add(1000).end();
        }
        this.addScore(score);
      }

      //reset kill count to 0 after 2s
      clearTimeout(this.kill_reset);
      this.kill_reset = setTimeout(proxy(function(){ this.kill_count = 0;},this), 2000);
    },this);
  }

  prototype.updatetime_on_wave = function() {
    this.time_on_wave++;
  }

  prototype.newScore = function(text) {

    if(this.disabled === true) return new PopScore('~disable~');

    let score = new PopScore(text);
    let pos = SPOT.wave.surfer.localToGlobal(0,0);
    let x = SPOT.wave.getX() + SPOT.wave.surfer.x;
    let y = (SPOT.wave.surfer.y <= 0)? SPOT.wave.surfer.y  - SPOT.wave.params.height - 100 : - SPOT.wave.params.height - 100;
    SPOT.wave.score_text_cont.addChild(score);
    createjs.Tween.get(score).set({alpha:0, rotation:10, x:x, y:100}).to({y:y, alpha:1, rotation: -10}, 800, createjs.Ease.bounceOut);

    return score;
  }

  prototype.addScore = function(score) {

    if(this.disabled === true) return;

    this.add(parseInt(score.subscore.text));
  }

  prototype.testScore = function() {

    let score = new PopScore('Backloop').add(1000);
    SPOT.wave.score_text_cont.addChild(score);
    createjs.Tween.get(score).set({alpha:0, rotation:10, y:100, x: STAGEWIDTH/2}).to({y:-400, alpha:1, rotation: -10}, 500, createjs.Ease.backOut)
        .wait(500)
        //.call(proxy(score.grade,score,['Super']))
        //.wait(500)
        .call(proxy(score.end,score))
        //.call(proxy(score.end,score))
        .wait(2000).set({sliding:true})
        ;

  }

  prototype.discardAllScores = function() {
    this.getScores().map(score => score.discard());
  }

  prototype.getRandomPhrase = function(key) {

    if(typeof key === 'undefined') return 'Key is not defined...';
    if(typeof this.phrases[key] === 'undefined') return 'There is no key ('+key+')...';
    if(typeof this.phrases[key].length === 0) return 'There is no cool text for this key ('+key+')...';
    var i = Math.random()*this.phrases[key].length;
    i = Math.floor(i);
    return this.phrases[key][i];

  }
  prototype.tick = function() {

    if(PAUSED) return;
    this.slideAboveWaveText();
  }

  prototype.getScore = function() {
    return this.current_score;
  }

  prototype.disable = function() {
    this.disabled = true;
    return this;
  }
  prototype.enable = function() {
    this.disabled = false;
    return this;
  }

  prototype.setScore = function(sc) {
    this.current_score = sc;
    this.total.text = sc;
    return this;
  }

  prototype.getFailPhrase = function() {
    return this.failPhrase;
  }

  prototype.add = function(amount) {

    this.current_score += amount;
    this.total.text = this.current_score;
    return this;
  }

  prototype.sub = function(amount) {

    this.current_score -= amount;
    if(this.current_score < 0) this.current_score = 0;
    this.total.text = this.current_score;
    return this;
  }

  prototype.progress = function() {

    let amount = 5;
    let time = 250;
    this.progress_timer = new Interval(proxy(this.advance,this,[amount]), time);
    this.timers.push(this.progress_timer);
    return this;
  }

  prototype.stopProgress = function() {

    this.timers.splice(this.timers.indexOf(this.progress_timer),1);
    this.progress_timer.clear();
    this.progress_timer = null;
    return this;
  }

  prototype.advance = function(amount) {

    this.current_score += parseInt(amount);
    this.total.text = this.current_score;
    return this;
  }

  prototype.slideAboveWaveText = function() {

    if(SPOT.wave == undefined) return;

    var offscreen = null;
    var cont = SPOT.wave.score_text_cont;

    for(var i=0;i<cont.numChildren;i++) {

      var text = cont.getChildAt(i);

      if(text.sliding == undefined) continue;
      if(text.sliding == true) {
        text.x += SPOT.wave.movingX;
        //when text is off screen, remove it
        if(text.x > STAGEWIDTH*1.5 || text.x < - STAGEWIDTH*0.5) {
          offscreen = i;
        }
      }
    }

    if(offscreen != null) {
      cont.removeChildAt(offscreen);
    }
  }

  prototype.getTimers = function() {
    for (var i = this.timers.length - 1; i >= 0; i--) {
      if(this.timers[i] instanceof Timer || this.timers[i] instanceof Interval) {
        continue;
      }
      else {
        this.timers.splice(i,1);
      }
    }
    return this.timers;
  }

  prototype.getScores = function() {
    let array = [];
    if(SPOT.wave == null) return [];
    for (let i=0, len=SPOT.wave.score_text_cont.numChildren; i < len; ++i) {
      let score = SPOT.wave.score_text_cont.getChildAt(i);
      array.push(score);
    }
    return array;
  }

  prototype.selfRemove = function() {

    this.getTimers().map(t => t !== null? t.clear() : null);
    this.getScores().map(s => s.clear());
    this.goalsTimers.map(t => t.clear());
    this.timers = [];
    this.goalsTimers = [];
    this.removeEventListener("tick", this.tick);
    this.removeAllEventListeners();
    this.removeAllChildren();
  }

  prototype.pause = function() {
    this.getTimers().map(t => t !== null? t.pause() : null);
    this.getScores().map(s => s.pause());
    this.goalsTimers.map(t => t.pause());
  }

  prototype.resume = function() {
    this.getTimers().map(t => t !== null? t.resume() : null);
    this.getScores().map(s => s.resume());
    this.goalsTimers.map(t => t.resume());
  }

  window.ScoreUI = createjs.promote(ScoreUI,'Container');

}());


(function() {

    function PopScore(text) {

      this.Container_constructor();

      this.timers = [];
      this.sliding = false;

      this.init(text);
    }
    var prototype = createjs.extend(PopScore, createjs.Container);

    prototype.init = function(text = 'score') {

      // circle
      this.circle = new createjs.Shape();
      this.circle.graphics.beginFill('yellow').drawCircle(0,0,2000);
      this.circle.alpha = 0;
      this.addChild(this.circle);
      createjs.Tween.get(this.circle).set({scale: 0}).to({scale: 1}, 700, createjs.Ease.bounceOut).wait(300).to({alpha: 0}, 1000, createjs.Ease.quartOut);

      // text
      this.text = new createjs.Text(text,'bold '+Math.floor(70*rY)+"px 'BubblegumSansRegular', sans-serif",'#FFF'); //BubblegumSansRegular BoogalooRegular albaregular
      this.text.regX = this.text.getMeasuredWidth()/2;
      this.text.regY = this.text.getMeasuredHeight()/2;
      this.addChild(this.text);
      createjs.Tween.get(this.text).set({y: 100, scale: 0, alpha: 0}).to({y: 0, alpha: 1, scale:1}, 800, createjs.Ease.elasticOut);

      // quality
      this.quality = new createjs.Text('Wait for grade', 'bold '+Math.floor(70*rY)+"px 'Blinker', sans-serif", '#eaea49');
      this.quality.regX = this.quality.getMeasuredWidth()/2;
      this.quality.regY = this.quality.getMeasuredHeight()/2;
      this.quality.x = - 300;
      this.quality.alpha = 0;
      this.addChild(this.quality);

      // score
      this.subscore = new createjs.Text('0','italic '+Math.floor(36*rY)+"px 'Blinker', sans-serif",'yellow');  //BubblegumSansRegular BoogalooRegular albaregular
      this.subscore.regX = this.subscore.getMeasuredWidth()/2;
      this.subscore.regY = this.subscore.getMeasuredHeight()/2;
      this.subscore.x = 0;
      this.subscore.y = this.text.getMeasuredHeight()/2 + 5;
      this.subscore.alpha = 0;
      this.addChild(this.subscore);

            //center
      let center = new createjs.Shape();
      center.graphics.beginFill('red').drawCircle(0,0,5);
      center.alpha = 0;
      this.addChild(center);

      // particles
      this.particles_cont = new createjs.Container();
      this.addChild(this.particles_cont);
      this.launchParticles();

    }

    prototype.grade = function(quality) {

      this.quality.text = quality;
      this.quality.regX = this.quality.getMeasuredWidth()/2;
      this.quality.regY = this.quality.getMeasuredHeight()/2;
      if(quality == 'Super') this.quality.color = '#f7d05d';
      if(quality == 'Good') this.quality.color = '#499249';
      if(quality == 'Bad') this.quality.color = '#a73f3f';
      createjs.Tween.get(this.quality).set({alpha:0}).to({alpha:1, x:-25}, 500, createjs.Ease.quadInOut).to({x: 25},800).to({x: 300, alpha: 0},500);
      createjs.Tween.get(this.text).to({alpha: 0, x: 300}, 500, createjs.Ease.quadInOut)

      return this;
    }

    prototype.add = function(score) {

      this.subscore.text = parseInt(this.subscore.text) + score;
      this.subscore.regX = this.subscore.getMeasuredWidth()/2;
      this.subscore.regY = this.subscore.getMeasuredHeight()/2;
      this.subscore.alpha = 1;

      return this;
    }

    prototype.get = function() {

      return parseInt(this.subscore.text);
    }

    prototype.pause = function() {
      this.timers.map(t => t.pause());
    }

    prototype.resume = function() {
      this.timers.map(t=> t.resume());
    }

    prototype.clear = function() {
      this.timers.map(t=> t.clear());
    }

    prototype.growth = function(amount, frequency = 50) {

      this.growth_interval = new Interval(proxy(this.addToSubscore,this,[amount]),frequency);
      this.timers.push(this.growth_interval);

      return this;
    }

    prototype.stopGrowth = function() {

      this.timers.splice(this.timers.indexOf(this.growth_interval,1));
      this.growth_interval.clear();
      this.growth_interval = null;

    }

    prototype.end = function() {

      if(this.growth_interval instanceof Interval) {
        this.stopGrowth();
      }

      createjs.Tween.get(this.subscore).to({scale: 1.5}, 500, createjs.Ease.bounceOut).wait(500).to({alpha: 0}, 500);

      createjs.Tween.get(this).wait(1000).set({sliding: true});

      return this;

    }

    prototype.addToSubscore = function(amount) {

      this.subscore.text = parseInt(this.subscore.text) + amount;
    }

    prototype.discard = function() {

      if(this.growth_interval instanceof Interval) {
        this.stopGrowth();
      }

      this.text.color = 'red';
      this.quality.color = 'red';
      this.subscore.color = 'red';

      if(this.subscore.alpha !== 0) {
        createjs.Tween.get(this.subscore).to({scale:1.2},200).to({scale: 0.5, alpha: 0}, 800, createjs.Ease.quartIn);
        createjs.Tween.get(this.subscore).to({y: this.subscore.y+50}, 1000);
      }

      createjs.Tween.get(this).wait(500).to({alpha: 0}, 1500, createjs.Ease.quartIn);
    }


    prototype.launchParticles = function() {

      //particles
      this.emitter = new ParticleEmitter({
        x: 0,
        y: 0,
        density: 5 + Math.random()*5,
        callback : proxy(this.removeParticles,this),
        magnitude: 20,
        magnitudemax : 25,
        angle: - Math.PI/2,
        spread: Math.PI/2,
        size: 8,
        scaler: 0.2,
        fader: 0.1,
        rotate: 0.1,
        rotatemax: 10,
        //tweens: [[{alpha:0},2000]],
        forces: [vec2.fromValues(0,0.5)],
        shapes: [{shape:'star',fill:'yellow',stroke:0.1,strokeColor:'yellow',percentage:100}]
      });

      this.particles_cont.addChild(this.emitter);
    }

    prototype.removeParticles = function() {

      this.particles_cont.removeChild(this.emitter);
    }

    window.PopScore = createjs.promote(PopScore, "Container");

}());