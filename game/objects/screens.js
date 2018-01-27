(function() {
  
  function ScreenManager(conf) {

    this.Container_constructor();
    
  }

  var prototype = createjs.extend(ScreenManager, createjs.Container);

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


    //score bars
    var xpbar = SCORE.getXpBar(200,4);
    cont.addChild(xpbar);
    var xp_current = xpbar.xp_current;
    cont.addChild(xp_current);
    var xp_max = xpbar.xp_max;
    cont.addChild(xp_max);
    var xp_min = xpbar.xp_min;
    cont.addChild(xp_min);
    var lvl_counter = xpbar.level_counter;
    cont.addChild(lvl_counter);

    xpbar.x = STAGEWIDTH/2 - xpbar.width/2;
    xpbar.y = STAGEHEIGHT - 150;
    xp_max.x = xpbar.x + xpbar.width + 10;
    xp_max.y = xpbar.y - 5;
    xp_min.x = xpbar.x - 20;
    xp_min.y = xpbar.y - 5;
    xp_current.x = title.x - 10;
    xp_current.y = xpbar.y - 20;
    lvl_counter.x = title.x - 20;
    lvl_counter.y = xpbar.y + 10;

    SCORE.startXpBar(previous_score,wave_score,USER.level);


    //MENU
    var menu = new createjs.Container();
    cont.addChild(menu);

    //display retry button
    var retry = new createjs.Container();
    var bkg = new createjs.Shape();
    var txt = new createjs.Text('RETRY','24px Helvetica');
    var bound = txt.getBounds();
    var pad = {x: 40, y: 15};
    bkg.graphics.beginFill('#FFF').drawRoundRect(-bound.x/2 - pad.x, -bound.y - pad.y, bound.width + pad.x*2, bound.height + pad.y*2, 5);
    retry.x = title.x - 100;
    retry.y = STAGEHEIGHT*1/2;
    retry.regX = txt.getMeasuredWidth()/2;
    retry.regY = txt.getMeasuredHeight()/2;
    retry.cursor = 'pointer';
    retry.addChild(bkg,txt);
    menu.addChild(retry);
    retry.click_retry = cont.on('click',proxy(parent.fallRetry,parent));

    var skills = new createjs.Container();
    var bkg = new createjs.Shape();
    var txt = new createjs.Text('SKILLS','24px Helvetica');
    var bound = txt.getBounds();
    var pad = {x: 40, y: 15};
    bkg.graphics.beginFill('#FFF').drawRoundRect(-bound.x/2 - pad.x, -bound.y - pad.y, bound.width + pad.x*2, bound.height + pad.y*2, 5);
    skills.x = title.x + 100;
    skills.y = STAGEHEIGHT*1/2;
    skills.regX = txt.getMeasuredWidth()/2;
    skills.regY = txt.getMeasuredHeight()/2;
    skills.cursor = 'pointer';
    skills.addChild(bkg,txt);
    menu.addChild(skills);
    var that = this;
    skills.addEventListener('click',function(e) { 
      e.stopImmediatePropagation();
      e.stopPropagation();
      e.preventDefault();
      
      var skillcont = that.getSkillCont([menu]);
      cont.addChild(skillcont);

      menu.alpha = 0;

      //parent.initSkillScreen(); 
    },false);


    return cont;

  }

  prototype.getSkillCont = function(to_hide = []) {

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
    this.title = new createjs.Text(USER.skill_pts,"bold 26px arial","grey");
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

      var c = new createjs.Container();
      c.x = x - 130;
      c.y = y + 50 + i*50;
      var label = new createjs.Text(skill.toUpperCase(), "bold 30px Arial", "#AAA");
      label.width = 150;      
      label.x = 0;
      label.y = -5;
      c.addChild(label);

      for(var j=0,ln=10;j<=ln;j++) {
        
        if(1 + j <= USER.skills[skill]*10) {
          var icon = star.clone();
          icon.active = true;
        }
        else var icon = neutron.clone();
        icon.x = label.width + j*30;
        icon.y = 8;
        icon.cont = c;
        c.addChild(icon);
        this.stars[skill].push(icon);
      }

      var button = new createjs.Shape();
      button.graphics.beginFill('#FFF').drawCircle(0,0,20);
      button.x = c.x + icon.x + 50;
      button.y = c.y + icon.y;
      button.cursor = 'pointer';
      button.skill = skill;
      var that = this;
      button.addEventListener('click', function(ev) {
        that.addSkillPoint(ev.target.skill);
        ev.stopPropagation();
        ev.preventDefault();
      });
      cont.addChild(button);

      var plus = new createjs.Text('+', 'bold 30px Helvetica', "#AAA");
      var b = plus.getBounds();
      plus.x = button.x - b.width/2;
      plus.y = button.y - b.height/2;
      cont.addChild(plus);

      cont.addChild(c);
    }

    //back button
    var back = new createjs.Container();
    var bkg = new createjs.Shape();
    var txt = new createjs.Text('BACK','24px Helvetica');
    var bound = txt.getBounds();
    var pad = {x: 40, y: 15};
    bkg.graphics.beginFill('#FFF').drawRoundRect(-bound.x/2 - pad.x, -bound.y - pad.y, bound.width + pad.x*2, bound.height + pad.y*2, 5);
    back.x = STAGEWIDTH/2;
    back.y = c.y + 75;
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

        USER.skill_pts--;
        this.title.text = USER.skill_pts;
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