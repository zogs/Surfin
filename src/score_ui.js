(function() {

  _CACHED = {};

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

    if(this.goals === null) this.goals = [
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
    this.goals_pt = new createjs.Point(STAGEWIDTH/2, 20);
    this.total = new createjs.Text('0','bold '+Math.floor(30*rY)+"px 'Blinker', sans-serif",'#FFFFFF');
    //this.score_cont.addChild(this.total);


    //Ticker
    this.ticker = this.on('tick', this.tick, this);

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

    if(this.spot.config.timelimit == undefined || this.spot.config.timelimit == null) return;
    this.countdown = this.spot.config.timelimit;
    this.timer = new createjs.Text('00:00', Math.floor(60*rY)+"px 'Blinker',sans-serif", '#FFFFFF');
    this.timer.x = STAGEWIDTH/2 - this.timer.getMeasuredWidth()/2;
    this.timer.y = 10;
    this.timer.alpha = 0.5;
    this.score_cont.addChild(this.timer);
    this.timer.text = this.formatCountdown(this.countdown);
  }

  prototype.updateCountdown = function(ev) {

    // only update on full round seconds
    if(ev.timing%1000 !== 0) return;

    // update countdown
    this.countdown--;
    this.timer.text = this.formatCountdown(this.countdown);

    // put the text in red under 10s
    if(this.countdown < 10) {
      this.timer.color = 'red';
      this.timer.alpha = 0.5 + 0.5 * (1/this.countdown);
    }

    if(this.countdown < 0) {
      this.timer.text = '0';
    }

    // on  countdown ended
    if(this.countdown === 0) {
      this.spot.dispatchEvent('wave_timeout');
    }

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
      bkg.x = text.x = pt.x - text.getMeasuredWidth()/2;
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
      this.spot.on('wave_timing_advance', proxy(this.updateCountdown, this));
      this.spot.on('wave_timeout', proxy(this.timeout, this), null, true);
    }

    //goals
    // goal.type === 'timed') {
    this.spot.on('wave_timing_advance', proxy(this.updateGoalTime,this) );

    // goal.type === 'score') {
    this.goalsTimers.push(new Interval(proxy(this.updateGoalScore,this), 100));

    // goal.type === 'trick') {
    this.spot.on('surfer_aerial_end', this.updateGoalTricks );

    // goal.type === 'catch') {
    this.spot.on('bonus_hitted', this.updateGoalCatch );

    // goal.type === 'kill') {
    this.spot.on('kill', this.updateGoalKill );

    // goal.type === 'tube') {
    this.spot.on('surfer_tube_in', proxy(this.updateTubeIn, this));
    this.spot.on('surfer_tube_out', proxy(this.updateTubeOut, this));

  }

  prototype.updateTubeIn = function() {

   this.tubeTime = 0;
   this.goalsTimers['tube'] = new Interval(proxy(this.updateTubeTime, this), 100);
  }

  prototype.updateTubeTime = function() {
    let goal = this.goals.find(g => g.type === 'tube');
    if(goal === undefined) return;
    if(goal.filled) return;
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
    if(goal === undefined) return;
    if(goal.filled) return;
    goal.text.text = this.goalsNameFormatter(goal, 0);
    goal.current = 0;
    this.goalsTimers['tube'].clear();
  }

  prototype.goalsCheck = function() {
    let total = this.goals.length;
    let count = 0;
    for(let i=0,ln=this.goals.length-1;i<=ln;i++) {
      if(this.goals[i].filled === true) count++;
    }

    if(count === total) {
      this.goalsAccomplished();
    }
  }

  prototype.goalsAccomplished = function() {
    this.goals_filled = true;
    let pop = this.popInfo('Success !');
    createjs.Tween.get(pop).to({y: -STAGEHEIGHT/2}, 2000, createjs.Ease.quartOut);
    let ev = new createjs.Event('goals_filled');
    SPOT.dispatchEvent(ev);
  }

  prototype.updateGoalTime = function(ev) {
    let goal = this.goals.find(g => g.type === 'timed');
    if(goal === undefined) return;
    if(goal.filled) return;
    let seconds = Math.floor(ev.timing/1000);
    goal.text.text = this.goalsNameFormatter(goal, seconds);
    goal.current = seconds;

    if(seconds == goal.aim) {
      this.setGoalFilled(goal);
    }
  }

  prototype.updateGoalScore = function() {
    let goal = this.goals.find(g => g.type === 'score');
    if(goal === undefined) return;
    if(goal.filled) return;
    let score = this.current_score;
    goal.text.text = this.goalsNameFormatter(goal, score);
    goal.current = score;

    if(score >= goal.aim) {
      this.setGoalFilled(goal);
      goal.text.text = this.goalsNameFormatter(goal, goal.aim);
    }
  }

  prototype.updateGoalTricks = function(e) {
    let trick = e.trick;
    let goal = that.goals.find(g => g.type === 'trick' && g.aim == trick.name);
    if(goal === undefined) return;
    if(typeof goal === 'undefined') return;
    if(goal.filled) return;
    goal.current += 1;
    goal.text.text = that.goalsNameFormatter(goal, goal.current);

    if(goal.current == goal.count) {
      that.setGoalFilled(goal);
    }
  }

  prototype.updateGoalCatch = function(e) {
    let name = e.object.config.name;
    let goal = that.goals.find(g => g.type === 'catch' && g.aim == name);
    if(goal === undefined) return;
    if(goal.filled) return;
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
    if(goal.filled) return;
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
      this.takeoff = this.popInfo('Take off !');
      this.time_on_wave = 0;
      this.timers.push(new Interval(proxy(this.updateTimeOnWave,this), 1000));
    },this, null, true);

    this.spot.on('player_takeoff_ended',function(event) {

      if(event.quality >= 50) this.takeoff.grade('Super').add(2000).end();
      else if(event.quality >= 20) this.takeoff.grade('Good').add(1000).end();
      else this.takeoff.grade('Bad').end();
      this.addScore(this.takeoff);

    },this, null, true);

    this.spot.on('surfer_aerial_start',function(event) {
      console.log(event.trick.name);
      this.aerial = this.popInfo(event.trick.name).add(0).timer(0.1, 100);
    },this);

    this.spot.on('surfer_aerial_end',function(event) {
      if(event.trick.quality_takeoff >= 0.75) this.aerial.grade('Super').end();
      else if(event.trick.quality_takeoff >= 0.25) this.aerial.grade('Good').end();
      else this.aerial.grade('Bad').end();
      this.addScore(this.aerial);
    },this);

    this.spot.on('surfer_tube_in',function(event) {
      this.tube = this.popInfo('T u b e !!!').add(0).timer(0.1, 100);
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
      let name = event.object.name;
      if(name == 'photo') {
        let score = this.popInfo("Nice pic !").add(500).end();
        this.addScore(score);
      }
      if(name == 'drone') {
        let score = this.popInfo("Great pic !").add(1000).end();
        this.addScore(score);
      }
      if(name == 'multiplier') {
        let score = this.popInfo("[TO DO...]").add(0).end();
        this.addScore(score);
      }
      if(name == 'prize') {
        let score = this.popInfo("Bonus !").add(event.obstacle.aim).end();
        this.addScore(score);
      }
    },this);

    this.spot.on('kill',function(event) {
      let score;
      if(event.target === 'surfer') {
        if(event.player === event.killed) score = this.popInfo("Paf...").end();
        if(event.player === event.killer) {
          this.kill_count++;
          if(this.kill_count === 1) score = this.popInfo('Kill!').add(100).end();
          if(this.kill_count === 2) score = this.popInfo('Kill!').add(500).end();
          if(this.kill_count === 3) score = this.popInfo('Kill!').add(1000).end();
          if(this.kill_count > 3) score = this.popInfo('Kill!').add(1000).end();
        }
        this.addScore(score);
      }

      //reset kill count to 0 after 2s
      clearTimeout(this.kill_reset);
      this.kill_reset = setTimeout(proxy(function(){ this.kill_count = 0;},this), 2000);
    },this);
  }

  prototype.updateTimeOnWave = function() {
    this.time_on_wave++;
  }

  prototype.popInfo = function(text, size, color) {

    if(this.disabled === true) return new Pop('~disable~');

    let score = new Pop(text, size, color);
    let pos = SPOT.wave.surfer.localToGlobal(0,0);
    let x = SPOT.wave.getX() + SPOT.wave.surfer.x;
    let y = (SPOT.wave.surfer.y <= 0)? SPOT.wave.surfer.y  - SPOT.wave.params.height - 70*rY : - SPOT.wave.params.height - 70*rY;
    SPOT.wave.score_text_cont.addChild(score);
    createjs.Tween.get(score).set({alpha:0, rotation:5, x:x, y:2000}).to({y:y, alpha:1, rotation: -5}, 500, createjs.Ease.backOut);

    return score;
  }

  prototype.addScore = function(score) {

    if(this.disabled === true) return;

    this.add(parseInt(score.subscore.text));
  }

  prototype.testScore = function() {

    let score = new Pop('Backloop').add(1000);
    SPOT.wave.score_text_cont.addChild(score);
    createjs.Tween.get(score).set({alpha:0, rotation:10, y:100, x: STAGEWIDTH/2}).to({y:-400, alpha:1, rotation: -10}, 800, createjs.Ease.backOut)
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
    this.off("tick", this.ticker);
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

    function Pop(text, size, color, border) {

      this.Container_constructor();

      this.init(text, size, color);
    }
    var prototype = createjs.extend(Pop, createjs.Container);

    prototype.init = function(text, size, color, border) {

      this.text = text ? text : null;
      this.size = size ? size : 50;
      this.color = color ? color : '#f7f7f7';
      this.border = border ? border : 'rgba(0,0,0,0.6)';
      this.sliding = false;
      this.timers = [];
      this.font = 'Blinker';
      //this.font = 'SurfingCapital, sans-serif';
      this.useCache = false;

      if(text === undefined) return;

      this.drawContent();

      // particles
      this.particles_cont = new createjs.Container();
      this.addChild(this.particles_cont);
      this.launchParticles();
    }

    prototype.drawContent = function() {
      this.removeAllChildren();
      this.drawText();
      this.drawScore();
      //this.drawQuality();
    }

    prototype.getTextContent = function() {

      if(_CACHED[this.text]) {
        return _CACHED[this.text];
      }
      else {
        console.warn('You should pre-generate text content "'+this.text+'" for Pop()');
        return this.generateCachedText();
      }
    }

    prototype.generateCachedText = function(text, size, color, border) {

      text = text ? text : this.text;
      size = size ? size : this.size;
      color = color ? color : this.color;
      border = border ? border : this.border;

      let cont = new createjs.Container();
      // text
      let outline = new createjs.Text(text, Math.floor(size*rY)+"px "+this.font, border);
      outline.regX = outline.getMeasuredWidth()/2;
      outline.regY = outline.getMeasuredHeight()/2;
      outline.outline = 5;
      cont.addChild(outline);
      // text
      let fill = new createjs.Text(text, Math.floor(size*rY)+"px "+this.font, color);
      fill.regX = fill.getMeasuredWidth()/2;
      fill.regY = fill.getMeasuredHeight()/2;
      cont.addChild(fill);
      // padding
      let pad = 12;

      if(this.useCache) {
        // generate cache
        cont.cache(-outline.getMeasuredWidth()/2-pad, -outline.getMeasuredHeight()/2-pad, outline.getMeasuredWidth()+pad*2, outline.getMeasuredHeight()+pad*2);
        // save cache
        _CACHED[text] = cont;
      }

      return cont;
    }

    prototype.drawText = function() {

      this.text_cont = this.getTextContent();
      this.addChild(this.text_cont);
    }

    prototype.drawScore = function() {

      this.subscore = new createjs.Text('0','italic '+Math.floor(32*rY)+"px 'Blinker', sans-serif",'yellow');  //BubblegumSansRegular BoogalooRegular albaregular
      this.subscore.regX = this.subscore.getMeasuredWidth()/2;
      this.subscore.regY = this.subscore.getMeasuredHeight()/2;
      this.subscore.x = 0;
      this.subscore.y = this.size/2 + 10;
      this.subscore.alpha = 0;
      this.addChild(this.subscore);
    }

    prototype.drawQuality = function() {

      this.quality = new createjs.Text('Wait for grade', 'bold '+Math.floor(70*rY)+"px 'Blinker', sans-serif", '#eaea49');
      this.quality.regX = this.quality.getMeasuredWidth()/2;
      this.quality.regY = this.quality.getMeasuredHeight()/2;
      this.quality.x = - 300;
      this.quality.alpha = 0;
      this.quality.outline = 0.5;
      this.addChild(this.quality);
    }

    prototype.grade = function(quality) {
      return this;
      this.quality.text = quality.toLowerCase();
      this.quality.regX = this.quality.getMeasuredWidth()/2;
      this.quality.regY = this.quality.getMeasuredHeight()/2;
      if(quality == 'Super') this.quality.color = 'rgba(247,208,93,0.5)';
      if(quality == 'Good') this.quality.color = 'rgba(73,146,73,0.5)';
      if(quality == 'Bad') this.quality.color = 'rgba(167,63,63,0.5)';
      let direction = SPOT.wave.isLEFT() ? 1 : -1;
      createjs.Tween.get(this.quality).set({alpha:0}).to({alpha:1, x:-25*direction}, 500, createjs.Ease.quadInOut).to({x: 25},800).to({x: 300*direction, alpha: 0},500);
      createjs.Tween.get(this.text_cont).to({alpha: 0, x: 300*direction}, 500, createjs.Ease.quadInOut)

      return this;
    }

    prototype.add = function(score) {

      this.subscore.text = parseInt(this.subscore.text) + score;
      this.subscore.regX = -this.subscore.getMeasuredWidth()*1/3;
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

    prototype.timer = function(amount, frequency = 50) {

      this.timer_interval = new Interval(proxy(this.addToTimer,this,[amount]),frequency);
      this.timers.push(this.timer_interval);

      return this;
    }

    prototype.stopTimer = function() {

      this.timers.splice(this.timers.indexOf(this.timer_interval,1));
      this.timer_interval.clear();
      this.timer_interval = null;

    }

    prototype.addToSubscore = function(amount) {
      this.subscore.text = parseInt(this.subscore.text) + amount;
    }

    prototype.addToTimer = function(amount) {
      let s = parseFloat(this.subscore.text) + amount;
      this.subscore.text = s.toFixed(2) + 's';
    }

    prototype.end = function() {

      if(this.timer_interval instanceof Interval) {
        this.stopTimer();
      }

      if(this.timer_interval instanceof Interval) {
        this.stopTimer();
      }

      createjs.Tween.get(this.subscore).to({scale: 1.2}, 500, createjs.Ease.bounceOut).wait(500).to({alpha: 0}, 500);

      createjs.Tween.get(this).to({y: this.y + 30, rotation: -15},400, createjs.Ease.backOut).set({sliding: true}).to({scale:0.8},400).to({alpha:0}, 700);

      return this;

    }

    prototype.addToSubscore = function(amount) {

      this.subscore.text = parseInt(this.subscore.text) + amount;
    }

    prototype.discard = function() {

      if(this.growth_interval instanceof Interval) {
        this.stopGrowth();
      }

      if(this.timer_interval instanceof Interval) {
        this.stopTimer();
      }

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
        density: 2 + Math.random()*4,
        duration: 240,
        frequency: 120,
        callback : proxy(this.removeParticles,this),
        magnitude: 23,
        magnitudemax : 33,
        angle: - Math.PI/2,
        spread: Math.PI/4,
        size: 8,
        scaler: 0.1,
        fader: 0.05,
        rotate: 0.1,
        rotatemax: 10,
        friction: 0.5,
        //tweens: [[{alpha:0},2000]],
        forces: [vec2.fromValues(0,3)],
        shapes: [{shape:'star',fill:'yellow',stroke:1,strokeColor:'#b0aa00',percentage:100}]
      });

      this.particles_cont.addChild(this.emitter);
    }

    prototype.removeParticles = function() {

      this.particles_cont.removeChild(this.emitter);
    }

    window.Pop = createjs.promote(Pop, "Container");

}());