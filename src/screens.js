(function() {

  function ScreenManager(conf) {

    this.Container_constructor();

  }

  var prototype = createjs.extend(ScreenManager, createjs.Container);

  prototype.showHome = function() {

    window.spot_cont.removeAllChildren();

    // add waves & backgrounds
    const config = LEVELS.find(s => s.alias == 'home');
    SPOT = new Spot(config);
    window.spot_cont.addChild(SPOT);
    SPOT.init();

    // add doggo
    const dog = new createjs.Sprite(
      new createjs.SpriteSheet({
          images: [queue.getResult('dog')],
          frames: {width:64, height:64, regX: 16, regY: 16},
          framerate: 10,
          animations: {
            sit: [0,1, 'sit'],
          }
      })
    );
    dog.x = 430;
    dog.y = STAGEHEIGHT - 150;
    dog.scale = 1;
    dog.gotoAndPlay('sit');
    window.spot_cont.addChild(dog);

    // add ptero
    const ptero = new createjs.Sprite(
      new createjs.SpriteSheet({
          images: [queue.getResult('ptero')],
          frames: {width:128, height:128, regX: 64, regY: 64},
          framerate: 4,
          animations: {
            fly: [0,9, 'fly'],
          }
      })
    );
    let pad = 128;
    ptero.x = -pad;
    ptero.y = 150;
    ptero.scale = 1;
    ptero.gotoAndPlay('fly');
    window.spot_cont.addChild(ptero);
    createjs.Tween.get(ptero, {loop: true}).to({x: STAGEWIDTH+pad}, 10000).wait(2000).set({scaleX:-1}).to({x:-pad},10000).wait(2000).set({scaleX:1});
    createjs.Tween.get(ptero, {loop: true}).to({y: 200}, 2000).to({y: 150}, 2000);


    // add button
    const sprite = new createjs.Sprite(
      new createjs.SpriteSheet({
          images: [queue.getResult('btn_startgame')],
          frames: {width:700, height:280, regX: 350, regY: 140},
          framerate: 1,
          animations: {
            out: [0],
            over: [1],
            down: [2],
          }
      })
    );
    const btn = new createjs.ButtonHelper(sprite, "out", "over", "down");
    sprite.x = STAGEWIDTH/2;
    sprite.y = STAGEHEIGHT - 100;
    window.spot_cont.addChild(sprite);
    sprite.addEventListener('click', function(e) {
      MENU.open();
    });

  }

  prototype.getLevelScreen = function(parent) {

    //init score info
    let isCompleted = true;

    //init container
    let cont = new createjs.Container();

    // draw background
    var bkg = new createjs.Bitmap(queue.getResult('scoreboard'));
    bkg.regX = bkg.image.width/2;
    bkg.regY = bkg.image.height/2;
    bkg.x = STAGEWIDTH/2 + 80;
    bkg.y = STAGEHEIGHT/2 - 120;
    cont.addChild(bkg);

    // draw table
    var table = new createjs.Bitmap(queue.getResult('scoretable'));
    table.regX = table.image.width/2;
    table.regY = table.image.height/2;
    table.x = bkg.x - 400;
    table.y = bkg.y + 200;
    cont.addChild(table);

    //fill with design content
    let content = (isCompleted)? this.getSuccessContent() : this.getFailContent();
    cont.addChild(content);

    // draw location
    //
    // draw score
    //
    // draw buttons
    if(isCompleted) {
      let btn_menu = new createjs.Bitmap(queue.getResult('btn_menu'));
      btn_menu.x = 920;
      btn_menu.y = 400;
      let btn_retry = new createjs.Bitmap(queue.getResult('btn_retry_sm'));
      btn_retry.x = 700;
      btn_retry.y = 405;

      cont.addChild(btn_menu);
      cont.addChild(btn_retry);
    }
    else {
      let btn_retry = new createjs.Bitmap(queue.getResult('btn_retry'));
      btn_retry.x = 920;
      btn_retry.y = 400;
      let btn_menu = new createjs.Bitmap(queue.getResult('btn_menu_sm'));
      btn_menu.x = 700;
      btn_menu.y = 405;

      cont.addChild(btn_menu);
      cont.addChild(btn_retry);
    }

    return cont;
  }

  prototype.getSuccessContent = function() {

    var cont = new createjs.Container();

    //draw title
    let title = new createjs.Bitmap(queue.getResult('successtxt'));
    title.x = 410;
    title.y = 60;
    let van = new createjs.Sprite(
      new createjs.SpriteSheet({
          images: [queue.getResult('astrovan')],
          frames: {width:140, height:100, regX: 70, regY: 50},
          framerate: 12,
          animations: {
            fly: [0,1, 'fly'],
          }
      })
    );
    van.x = 674;
    van.y = 78;
    van.scale = 1;
    van.gotoAndPlay('fly');
    cont.addChild(van);
    cont.addChild(title);

    // add cocktail
    const cocktail = new createjs.Sprite(
      new createjs.SpriteSheet({
          images: [queue.getResult('cocktail')],
          frames: {width:100, height:120, regX: 50, regY: 60},
          framerate: 10,
          animations: {
            bubble: [0,11, 'bubble'],
          }
      })
    );
    cocktail.x = 500;
    cocktail.y = 465;
    cocktail.scale = 1;
    cocktail.gotoAndPlay('bubble');
    const shadow = new createjs.Bitmap(queue.getResult('drinkshadow'));
    shadow.x = 495;
    shadow.y = 470;

    cont.addChild(shadow);
    cont.addChild(cocktail);

    return cont;
  }

  prototype.getFailContent = function() {

    var cont = new createjs.Container();

    // title
    let title = new createjs.Bitmap(queue.getResult('tryagaintxt'));
    title.x = 410;
    title.y = 60;
    cont.addChild(title);
    let dog = new createjs.Sprite(
      new createjs.SpriteSheet({
          images: [queue.getResult('dog')],
          frames: {width:64, height:64, regX: 16, regY: 16},
          framerate: 10,
          animations: {
            sit: [0,1, 'sit'],
          }
      })
    );
    dog.x = 750;
    dog.y = 60;
    dog.scaleX = -1;
    dog.gotoAndPlay('sit');
    cont.addChild(dog);
    cont.addChild(title);

    const coffee = new createjs.Sprite(
      new createjs.SpriteSheet({
          images: [queue.getResult('coffee')],
          frames: {width:117, height:130, regX: 56, regY: 65},
          framerate: 10,
          animations: {
            smoke: [0,7, 'smoke'],
          }
      })
    );
    coffee.x = 500;
    coffee.y = 460;
    coffee.scale = 1;
    coffee.gotoAndPlay('smoke');
    const shadow = new createjs.Bitmap(queue.getResult('drinkshadow'));
    shadow.x = 495;
    shadow.y = 470;

    cont.addChild(shadow);
    cont.addChild(coffee);

    return cont;
  }

  prototype.getFallScreen = function(parent) {

    var cont = new createjs.Container();

    var backred = new createjs.Shape();
    backred.graphics.beginFill('red').rect(0,0,STAGEWIDTH,STAGEHEIGHT);
    backred.alpha = 0;

    var backwhite = new createjs.Shape();
    backwhite.graphics.beginFill('white').rect(0,0,STAGEWIDTH,STAGEHEIGHT);
    backwhite.alpha = 0;

    var wash = new createjs.Shape();
    wash.graphics.beginFill('rgba(255,255,255,0.3)').moveTo(0,0);
    wash.y = STAGEHEIGHT;
    var total=0;
    var width = 1000;
    var amp = 200;
    while(total<STAGEWIDTH*3) {
      wash.graphics.bezierCurveTo(total+width/2,amp,total+width*2/3,-amp,total+width,0);
      total+= width;
    }
    wash.graphics.lineTo(STAGEWIDTH*3,STAGEHEIGHT*3)
    .lineTo(0,STAGEHEIGHT*3)
    .closePath();

    var wash2 = wash.clone();
    wash2.y = STAGEHEIGHT;
    wash2.x = -STAGEWIDTH;

    var dx = Math.random()*500 + 200;

    createjs.Tween.get(backred).to({alpha:0.7},200).to({alpha:0.2},500);
    createjs.Tween.get(backwhite).wait(200).to({alpha:0.8},1500);


    createjs.Tween.get(wash).to({y: 200,x:-dx},700);
    createjs.Tween.get(wash2).to({y: 150,x:-dx - STAGEWIDTH/2},800)
            .call(function(){
              createjs.Tween.get(wash,{loop:true}).to({x: wash.x+200},2000).to({x: wash.x},2000);
              createjs.Tween.get(wash2,{loop:true}).to({x: wash2.x+100},2000).to({x: wash2.x},2000);
            });

    cont.addChild(wash);
    cont.addChild(wash2);
    cont.addChild(backred);
    cont.addChild(backwhite);

    for(var i=0; i<=5; ++i) {

      var drop = new createjs.Shape();
      drop.graphics.beginFill('white').drawCircle(0,0,Math.random()*150+50);
      drop.x = Math.random()*STAGEWIDTH;
      drop.y = Math.random()*STAGEHEIGHT;
      drop.alpha = 0;
      drop.scaleX = drop.scaleY = 0;
      cont.addChild(drop);

      createjs.Tween.get(drop).wait(200).to({alpha:0.3,scaleX:1,scaleY:1},300);
    }

    for(var i=0; i<=3; ++i) {

      var drop = new createjs.Shape();
      drop.graphics.setStrokeStyle(Math.random()*15+5).beginStroke('#FFF').drawCircle(0,0,Math.random()*50+25);
      drop.x = Math.random()*STAGEWIDTH;
      drop.y = Math.random()*STAGEHEIGHT;
      drop.alpha = 0;
      drop.scaleX = drop.scaleY = 0;
      cont.addChild(drop);

      createjs.Tween.get(drop).wait(200).to({alpha:0.3,scaleX:1,scaleY:1},300);
    }

    var title = new createjs.Bitmap(queue.getResult('washed_text'));
    title.alpha = 0;
    title.x = STAGEWIDTH/2;
    title.y = STAGEHEIGHT*1/3 - title.image.height/2;
    title.regX = title.image.width/2;
    title.regY = title.image.height/2;
    title.scaleX = title.scaleY = 1;

    cont.addChild(title);
    createjs.Tween.get(title).wait(1000).to({alpha:0.5},2000);

    //display fail phrase
    var failphrase = new createjs.Text('" '+SCORE.getFailPhrase()+' "', "bold italic 18px Arial", "#95474a");
    failphrase.alpha = 0;
    failphrase.x = title.x ;
    failphrase.y = STAGEHEIGHT - 100;
    failphrase.regX = failphrase.getMeasuredWidth()/2;
    failphrase.regY = failphrase.getMeasuredHeight()/2;

    cont.addChild(failphrase);
    createjs.Tween.get(failphrase).wait(1500).to({alpha:1},500);

    //User score
    var wave_score = SCORE.getScore();
    var previous_score = USER.xp;

    //XP bar
    var bar = new XpBar({width:500, height:25, dispatcher: SPOT, levels: SPOT.score.levels, points_per_level: SPOT.score.points_per_level});
    cont.addChild(bar);
    bar.x = STAGEWIDTH/2;
    bar.y = STAGEHEIGHT - 150;

    //Update score
    var fore = bar.predict(previous_score, wave_score, USER.level);
    USER.updateTemp();
    USER.setLevel(fore.level);
    USER.setXp(fore.xp);
    USER.addSkillPoint(fore.points);
    USER.save();

    //begin progress bar
    bar.start(previous_score, wave_score, USER.temp.level);

    //MENU
    var menu = new createjs.Container();
    cont.addChild(menu);

    //display retry button
    var retryButton = new createjs.Container();
    var bkg = new createjs.Shape();
    var txt = new createjs.Text('RETRY','24px Helvetica');
    var bound = txt.getBounds();
    var pad = {x: 40, y: 15};
    bkg.graphics.beginFill('#FFF').drawRoundRect(-bound.x/2 - pad.x, -bound.y - pad.y, bound.width + pad.x*2, bound.height + pad.y*2, 5);
    retryButton.x = title.x - 100;
    retryButton.y = STAGEHEIGHT*1/2;
    retryButton.regX = txt.getMeasuredWidth()/2;
    retryButton.regY = txt.getMeasuredHeight()/2;
    retryButton.cursor = 'pointer';
    retryButton.addChild(bkg,txt);
    menu.addChild(retryButton);


    var skillsButton = new createjs.Container();
    var bkg = new createjs.Shape();
    var txt = new createjs.Text('SKILLS','24px Helvetica');
    var bound = txt.getBounds();
    var pad = {x: 40, y: 15};
    bkg.graphics.beginFill('#FFF').drawRoundRect(-bound.x/2 - pad.x, -bound.y - pad.y, bound.width + pad.x*2, bound.height + pad.y*2, 5);
    skillsButton.x = title.x + 100;
    skillsButton.y = STAGEHEIGHT*1/2;
    skillsButton.regX = txt.getMeasuredWidth()/2;
    skillsButton.regY = txt.getMeasuredHeight()/2;
    skillsButton.cursor = 'pointer';
    skillsButton.addChild(bkg,txt);
    menu.addChild(skillsButton);


    let skillStar = new createjs.Container();
    let star = new createjs.Shape();
    star.graphics.beginFill('yellow').drawPolyStar(0,0,30,5,0.5);
    star.rotation = 55;
    let skillCounter = new createjs.Text("+"+USER.temp.points, "20px Helvetica", "#c3c32a");
    skillCounter.x = star.x - skillCounter.getMeasuredWidth()/2;
    skillCounter.y = star.y - skillCounter.getMeasuredHeight()/2;
    skillStar.addChild(star, skillCounter);
    skillStar.x = skillsButton.x + txt.getMeasuredWidth();
    skillStar.y = skillsButton.y - txt.getMeasuredHeight();
    skillStar.star = star;
    skillStar.text = skillCounter;
    menu.addChild(skillStar);
    skillStar.alpha = (USER.temp.points>0)? 1 : 0;

    let levelStar = new createjs.Container();
    levelStar.x = STAGEWIDTH*1/2 + 500;
    levelStar.y = STAGEHEIGHT*1/2 - 100;
    let stamp = new createjs.Shape();
    stamp.graphics.beginFill('red').drawPolyStar(0,0,100,10,0.3);
    stamp.alpha = 0.6;
    var levelCounter = new createjs.Text("Level "+USER.temp.level,"26px Arial", "#FFF");
    levelCounter.x = - levelCounter.getBounds().width/2;
    levelCounter.y = - levelCounter.getBounds().height/2;
    levelStar.addChild(stamp,levelCounter);
    cont.addChild(levelStar);
    levelStar.alpha = 0;
    //createjs.Tween.get(part).to({scaleX:1,scaleY:1},1000,createjs.Ease.bounceOut);
    //createjs.Tween.get(star, {loop:-1}).to({rotation:360},10000);

    //events
    //retry button
    retryButton.click_retry = cont.on('click',proxy(parent.fallRetry,parent));

    //skill button
    var that = this;
    skillsButton.addEventListener('click',function(e) {
      e.stopImmediatePropagation();
      e.stopPropagation();
      e.preventDefault();

      var skillcont = that.getSkillCont([menu],skillStar);
      cont.addChild(skillcont);

      menu.alpha = 0;

      //parent.initSkillScreen();
    },false);

    //on level up
    SPOT.on('xpbar.level_up', function(event) {

      USER.temp.level = event.level;
      USER.temp.points += SPOT.score.points_per_level;

      levelCounter.text = "Level "+USER.temp.level;
      skillCounter.text = "+"+USER.temp.points;

      levelStar.alpha = 0;
      levelStar.scale = 0;
      createjs.Tween.get(levelStar, {override: true}).to({scale:1, alpha: 1}, 1000, createjs.Ease.backOut);
      createjs.Tween.get(stamp, {loop:-1}).to({rotation:360},10000);

      createjs.Tween.get(skillStar, {loop: -1, bounce: true}).to({scale: 1.2}, 500);
      createjs.Tween.get(skillStar).to({alpha: 1}, 500);

    });

    return cont;

  }

  prototype.getSkillCont = function(to_hide = [], counter = null) {

    //hide elements
    for (var i = to_hide.length - 1; i >= 0; i--) {
      to_hide[i].alpha = 0;
    }

    var cont = new createjs.Container();

    var star = new createjs.Shape();
    star.graphics.beginFill('yellow').drawPolyStar(0,0,15,5,0.5);
    star.rotation = 55;

    var neutron = new createjs.Shape();
    neutron.graphics.beginFill('grey').drawPolyStar(0,0,15,5,0.5);
    neutron.rotation = 55;

    var x = STAGEWIDTH/2 - 140;
    var y = 300;

    var startitle = star.clone();
    startitle.y = y + 50;
    startitle.x = x + 480;
    startitle.scale = 4;
    this.title = new createjs.Text(USER.points,"bold 26px arial","grey");
    var b = this.title.getBounds();
    this.title.y = startitle.y - b.height/2;
    this.title.x = startitle.x - b.width/2;
    cont.addChild(startitle);
    cont.addChild(this.title);

    var skills = ['speed','aerial','agility','force'];
    this.stars = {};

    for(var i=0,len=skills.length-1;i<=len;++i) {

      var skill = skills[i];
      this.stars[skill] = [];

      var line = new createjs.Container();
      line.x = x - 130;
      line.y = y + 50 + i*50;
      var label = new createjs.Text(skill.toUpperCase(), "bold 30px Arial", "#AAA");
      label.width = 150;
      label.x = 0;
      label.y = -5;
      line.addChild(label);

      for(var j=0,ln=10;j<=ln;j++) {

        if(1 + j <= USER.skills[skill]*10) {
          var icon = star.clone();
          icon.active = true;
        }
        else var icon = neutron.clone();
        icon.x = label.width + j*30;
        icon.y = 8;
        icon.cont = line;
        line.addChild(icon);
        this.stars[skill].push(icon);
      }

      var button = new createjs.Container();
      button.skill = skill;
      var circle = new createjs.Shape();
      circle.graphics.beginFill('#FFF').drawCircle(0,0,20);
      circle.x = icon.x + 50;
      circle.y = icon.y;
      circle.cursor = 'pointer';

      var plus = new createjs.Text('+', 'bold 30px Helvetica', "#AAA");
      var b = plus.getBounds();
      plus.x = circle.x - b.width/2;
      plus.y = circle.y - b.height/2;

      button.addChild(circle, plus);
      line.addChild(button);
      cont.addChild(line)

      var that = this;
      button.addEventListener('click', function(ev) {
        that.addSkillPoint(ev.currentTarget.skill);
        ev.stopPropagation();
        ev.preventDefault();
      });
    }

    //back button
    var back = new createjs.Container();
    var bkg = new createjs.Shape();
    var txt = new createjs.Text('BACK','24px Helvetica');
    var bound = txt.getBounds();
    var pad = {x: 40, y: 15};
    bkg.graphics.beginFill('#FFF').drawRoundRect(-bound.x/2 - pad.x, -bound.y - pad.y, bound.width + pad.x*2, bound.height + pad.y*2, 5);
    back.x = STAGEWIDTH/2;
    back.y = line.y + 75;
    back.regX = txt.getMeasuredWidth()/2;
    back.regY = txt.getMeasuredHeight()/2;
    back.cursor = 'pointer';
    back.onclick = cont.on('click',function(ev) {
      //remove skills
      cont.parent.removeChild(cont);
      //re-show elements
      for (var i = to_hide.length - 1; i >= 0; i--) {
        to_hide[i].alpha = 1;
      }
      //update counter
      counter.text.text = '+'+USER.points;
      counter.alpha = (USER.points == 0)? 0 : 1;
      //stop ev
      ev.stopImmediatePropagation();
      ev.stopPropagation();
      ev.preventDefault();
      ev.remove();
    });
    back.addChild(bkg,txt);
    cont.addChild(back);

    return cont;

  }

  prototype.addSkillPoint = function(skill) {

    if(USER.points <= 0) return;

    for(var i=0,len=this.stars[skill].length;i<len;++i) {

      var icon = this.stars[skill][i];
      if(icon.active) continue;
      else {
        var newstar = new createjs.Shape();
        newstar.graphics.beginFill('yellow').drawPolyStar(0,0,10,5,0.5);
        newstar.rotation = 55;
        newstar.x = icon.x;
        newstar.y = icon.y;
        newstar.active = true;
        newstar.cont = icon.cont;
        icon.cont.addChild(newstar);
        newstar.cont.removeChild(icon);
        this.stars[skill][i] = newstar;

        USER.points--;
        this.title.text = USER.points;
        if(USER.skills[skill] <= 0.9) {
          USER.skills[skill] = Math.round( (USER.skills[skill]+0.1) * 10) / 10;
        }

        USER.save();


        icon = null;
        return;
      }

    }

  }


  window.ScreenManager = createjs.promote(ScreenManager,'Container');

}());