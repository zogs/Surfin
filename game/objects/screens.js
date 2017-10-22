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
    createjs.Tween.get(backwhite).wait(200).to({alpha:0.8},500);


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
    title.y = STAGEHEIGHT*2/3 - title.image.height/2;
    title.regX = title.image.width/2;
    title.regY = title.image.height/2;
    title.scaleX = title.scaleY = 1;

    cont.addChild(title);
    createjs.Tween.get(title).wait(1000).to({alpha:1},2000);

    //display fail phrase
    var failphrase = new createjs.Text('" '+SCORE.getFailPhrase()+' "', "bold italic 18px Arial", "#95474a");
    failphrase.alpha = 0;
    failphrase.x = title.x ;
    failphrase.y = title.y + 125;
    failphrase.regX = failphrase.getMeasuredWidth()/2;
    failphrase.regY = failphrase.getMeasuredHeight()/2;

    cont.addChild(failphrase);
    createjs.Tween.get(failphrase).wait(1500).to({alpha:1},500);

    //User score
    var user = USER.get();
    var wave_score = SCORE.getScore();
    var up = SCORE.calculXpUp(user.xp,wave_score,user.level);  
    user.xp = up.xp;
    user.level = up.level;
    user.skill_pts += 2;
    USER.save(user);

    //score bars
    var xpbar = SCORE.getXpBar(200,4);
    cont.addChild(xpbar);
    var xp_counter = xpbar.xp_counter;
    cont.addChild(xp_counter);
    var lvl_counter = xpbar.level_counter;
    cont.addChild(lvl_counter);

    xp_counter.x = title.x;
    xp_counter.y = title.y + 150;
    lvl_counter.x = title.x - 30;
    lvl_counter.y = title.y + 150;
    xpbar.x = xp_counter.x - xpbar.width/2;
    xpbar.y = xp_counter.y + 20;

    SCORE.startXpBar(user.xp,wave_score,user.level);
    
    //display retry prhase
    var retry = new createjs.Text("[ CLICK TO RETRY ]", "14px Arial", "#AAA");
    retry.alpha = 0;
    retry.x = title.x ;
    retry.y = STAGEHEIGHT - 75;
    retry.regX = retry.getMeasuredWidth()/2;
    retry.regY = retry.getMeasuredHeight()/2;

    cont.addChild(retry);
    createjs.Tween.get(retry).wait(2000).to({alpha:1},500);

    //cont.click_retry = cont.on('click',proxy(parent.fallRetry,parent));

    //display buttons
    var button = new createjs.Container();
    var circle = new createjs.Shape()
    circle.graphics.beginFill('#FEFEFE').drawCircle(0,0,30);
    button.addChild(circle);
    var star = new createjs.Shape()
    star.graphics.beginFill('yellow').drawPolyStar(0,0,30,5,0.6);
    button.addChild(star);
    button.y = STAGEHEIGHT - 50;
    button.x = STAGEWIDTH - 100;
    button.cursor = 'pointer';
    cont.addChild(button);

    button.addEventListener('click',function(e) { 
      e.stopImmediatePropagation();
      e.stopPropagation();
      e.preventDefault();
      e.remove();
      parent.initSkillScreen(); 
    },false);

    return cont;

  }

  prototype.getSkillScreen = function(parent) {

    var cont = new createjs.Container();

    var user = USER.get();

    var star = new createjs.Shape();
    star.graphics.beginFill('yellow').drawPolyStar(0,0,10,5,0.5); 
    star.rotation = 55;

    var neutron = new createjs.Shape();
    neutron.graphics.beginFill('grey').drawPolyStar(0,0,10,5,0.5);  
    neutron.rotation = 55;

    this.title = new createjs.Text("to distribute : "+USER.get().skill_pts,"20px arial","#000");
    this.title.y = 100;
    this.title.x = STAGEWIDTH/2 - this.title.getBounds().width/2;
    cont.addChild(this.title);
    var startitle = star.clone();
    startitle.y = this.title.y + 10;
    startitle.x = this.title.x - 20;
    cont.addChild(startitle);

    var skills = ['speed','aerial','agility','paddling'];
    this.stars = {};

    for(var i=0,len=skills.length-1;i<=len;++i) {

      var skill = skills[i];
      this.stars[skill] = [];

      var c = new createjs.Container();
      c.x = this.title.x - 100;
      c.y = this.title.y + 100 + i*50;
      var label = new createjs.Text(skill, "16px Arial", "#FFF");
      c.addChild(label);

      for(var j=0,ln=10;j<=ln;j++) {
        
        if(1 + j <= user.skills[skill]*10) {
          var icon = star.clone();
          icon.active = true;
        }
        else var icon = neutron.clone();
        icon.x = 100 + j*30;
        icon.y = 8;
        icon.cont = c;
        c.addChild(icon);
        this.stars[skill].push(icon);
      }

      var button = new createjs.Shape();
      button.graphics.beginFill('blue').drawCircle(0,0,20);
      button.x = c.x + icon.x + 50;
      button.y = c.y + icon.y;
      button.addEventListener('click',proxy(this.addSkillPoint,this,[skill]));
      cont.addChild(button);

      cont.addChild(c);
    }

    //back button
    var back = new createjs.Shape();
    back.graphics.beginFill('red').beginStroke('#FFF').beginStroke(5).drawCircle(0,0,30);
    back.x = 1/4* STAGEWIDTH;
    back.y = 2/3* STAGEHEIGHT;
    back.addEventListener('click',proxy(parent.removeSkillScreen,parent));
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

        var user = USER.get();        
        user.skill_pts--;
        this.title.text = "to distribute : "+user.skill_pts;
        if(user.skill[skill] <= 0.9) {
          user.skill[skill] = Math.round( (user.skill[skill]+0.1) * 10) / 10;
        }

        USER.save(user);


        icon = null;
        return;
      }

    }
  }


  window.ScreenManager = createjs.promote(ScreenManager,'Container');

}());