
(function() {

    function XpBar(config) {

      this.Container_constructor();
      config = config || {};
      this.init(config);
    }
    var prototype = createjs.extend(XpBar, createjs.Container);

    prototype.init = function(conf) {

      this.width = conf.width || 200;
      this.height = conf.height || 10;
      this.regX = this.width/2;
      this.regY = this.height/2;
      this.levels = conf.levels || {1: 1000, 2: 2000, 3:3000, 4:40000};
      this.points_per_level = conf.points_per_level || 0;
      this.user = conf.user || {};
      this.dispatcher = conf.dispatcher || this.parent;
      this.duration = conf.duration || 3000;

      //containers
      this.background = new createjs.Container();
      this.currentBar = new createjs.Container();
      this.progressBar = new createjs.Container();
      this.addChild(this.background, this.currentBar, this.progressBar);

      //shapes
      var background = new createjs.Shape();
      background.graphics.beginFill('#AAA').drawRect(0,0,this.width,this.height);
      this.background.addChild(background);
      var progress = new createjs.Shape();
      progress.graphics.beginFill('yellow').drawRect(0,0,this.width,this.height);
      this.progressBar.addChild(progress);
      var current = new createjs.Shape();
      current.graphics.beginFill('lightblue').drawRect(0,0,this.width,this.height);
      this.currentBar.addChild(current);

      //texts
      this.currentXP = new createjs.Text("0", "bold "+Math.floor(16*rY)+"px Arial", "#AAA");
      this.maxXP = new createjs.Text("0", Math.floor(16*rY)+"px Arial", "#AAA");
      this.minXP = new createjs.Text("0", Math.floor(16*rY)+"px Arial", "#AAA");
      this.levelCounter = new createjs.Text("Level 1", Math.floor(16*rY)+"px Arial", "#AAA");
      this.addChild(this.currentXP, this.maxXP, this.minXP, this.levelCounter);

      //default position
      this.currentXP.x = this.width/2;
      this.currentXP.y = -10;
      this.maxXP.x = this.width + 5;
      this.maxXP.y = this.height/2;
      this.minXP.x = - this.minXP.getMeasuredWidth() - 5;
      this.minXP.y = this.height/2;
      this.levelCounter.x = this.width/2;
      this.levelCounter.y = this.height + 10;

    }

    prototype.predict = function(current_xp,win_xp,level,points = 0) {

      let level_xp = this.levels[level];
      for(let i=0; i <= win_xp; i++) {
        if(current_xp + i >= level_xp) {
          level++;
          points += this.points_per_level;
          current_xp = 0;
          level_xp = this.levels[level];
          win_xp = win_xp - i;
          if(win_xp > 0) {
            this.predict(current_xp,win_xp,level);
          }
        }
      }
      return { level: level, xp: win_xp, points: points };
    }

    prototype.start = function(current_xp,win_xp,level) {

      var level_xp = this.levels[level];
      var ratio = current_xp/level_xp;

      this.currentBar.scaleX = ratio;
      this.progressBar.scaleX = ratio;
      this.progressBar.xp = current_xp;
      this.levelCounter.text = 'Level '+ parseInt(level);

      var newRatio = (win_xp + current_xp)/level_xp;
      var excedent_xp = (current_xp + win_xp) - level_xp;
      var time = this.duration * (newRatio-ratio);

      createjs.Tween.removeTweens(this.progressBar);
      createjs.Tween.get(this.progressBar)
          .to({scaleX:newRatio,xp: current_xp + win_xp},time)
          .addEventListener('change',proxy(this.progress, this, [level,excedent_xp]))
          ;
    }

    prototype.progress = function(level,excedent_xp) {

      //update xp counter
      this.currentXP.text = parseInt(this.progressBar.xp);
      this.maxXP.text = parseInt(this.levels[level]);

      this.currentXP.regX = this.currentXP.getMeasuredWidth()/2;
      this.currentXP.regY = this.currentXP.getMeasuredHeight()/2;
      this.maxXP.regX = 0;
      this.maxXP.regY = this.maxXP.getMeasuredHeight()/2;
      this.minXP.regX = this.minXP.getMeasuredWidth();
      this.minXP.regY = this.minXP.getMeasuredHeight()/2;
      this.levelCounter.regX = this.levelCounter.getMeasuredWidth()/2;
      this.levelCounter.regY = this.levelCounter.getMeasuredHeight()/2;

      //dispatch progress event
      let ev = new createjs.Event('xpbar.progress');
      ev.currentXP = this.currentXP.text;
      if(this.dispatcher !== null) {
        this.dispatcher.dispatchEvent(ev);
      }

      //check for level up
      if(this.progressBar.scaleX >= 1) {

        //level up
        var new_level = level+1;
        var event = new createjs.Event('xpbar.level_up');
        event.level = new_level;
        if(this.dispatcher !== null) {
          this.dispatcher.dispatchEvent(event);
        }

        //new progress bar
        this.start(0,excedent_xp,new_level);

      }
    }

    window.XpBar = createjs.promote(XpBar, "Container");

}());