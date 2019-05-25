(function() {

  function Scoreboard(score) {

    this.Container_constructor();

    this.score = score;
    this.success = this.score.goals_filled;

    this.cont_board = new createjs.Container();
    this.cont_table = new createjs.Container();
    this.cont_overlay = new createjs.Container();
    this.addChild(this.cont_overlay, this.cont_board, this.cont_table);

    this.cont_table.mouseEnabled = false;
    this.cont_overlay.mouseEnabled = false;

    this.init();
  }

  var prototype = createjs.extend(Scoreboard, createjs.Container);

  //add EventDispatcher
  createjs.EventDispatcher.initialize(prototype);

  prototype.init = function() {

    this.drawBoard();
    this.drawTable();
    this.drawPlanet();
    this.drawScore();
    this.drawSkills();
    this.drawOverlay();

    if(this.success) {
      this.drawTableSuccess();
      this.drawBoardSuccess();
      this.drawButtonSuccess();
    }
    else {
      this.drawTableRetry();
      this.drawBoardRetry();
      this.drawButtonRetry();
    }

    this.x = STAGEWIDTH/2;
    this.y = STAGEHEIGHT/2 - 100;
  }

  prototype.drawBoard = function() {

    // draw background
    let bkg = new createjs.Bitmap(queue.getResult('scoreboard'));
    bkg.regX = bkg.image.width/2;
    bkg.regY = bkg.image.height/2;
    bkg.mouseEnabled = false;
    this.cont_board.addChild(bkg);
    this.cont_board.alpha = 0;

  }

  prototype.drawTable = function() {

     // draw table
    var table = new createjs.Bitmap(queue.getResult('scoretable'));
    table.regX = table.image.width/2;
    table.regY = table.image.height/2;
    table.x = - 400;
    table.y = 200;
    this.cont_table.addChild(table);
    this.cont_table.alpha = 0;
  }

  prototype.drawPlanet = function() {

    // draw planet
    let planet = SPOT.planet;
    let img = new createjs.Bitmap(queue.getResult(planet.id));
    img.regX = img.image.width/2;
    img.regY = img.image.height/2;
    img.x = -350;
    img.y = -50;
    img.scale = 100 / img.image.width;
    let name = new createjs.Text(planet.name.toUpperCase(), '18px Arial', '#747474');
    name.x = img.x + 60;
    name.y = img.y - 15;
    let system = new createjs.Text(planet.location, '12px Arial', '#AAA');
    system.x = name.x + 5;
    system.y = name.y + 20;

    this.cont_board.addChild(img);
    this.cont_board.addChild(name);
    this.cont_board.addChild(system);
  }

  prototype.drawScore = function() {

    //draw goals
    let x = -80;
    let y = -70;
    let h = 28;
    for(let i=0,ln=this.score.goals.length-1; i<=ln; i++) {
      let goal = this.score.goals[i];
      let isFilled = (goal.filled == true)? true : false;
      let color = (isFilled == true)? '#3e8d26' : '#5d5d5d';
      let name = goal.name.replace(/{n}/, goal.current);
      let text = new createjs.Text(name, 'bold 14px Arial', color);
      text.mouseEnabled = false;
      text.x = x;
      text.y = y + (i*h);
      this.cont_board.addChild(text);

      let icon = new createjs.Bitmap(queue.getResult((isFilled)? 'valid' : 'failed'));
      icon.mouseEnabled = false;
      icon.x = x - 35;
      icon.y = y + (i*h) - 6;
      this.cont_board.addChild(icon);
    }

    //draw medals
    let empty = new createjs.Bitmap(queue.getResult('medal_empty'));
    empty.mouseEnabled = false;
    empty.x = - 120;
    empty.y = - 130;
    this.cont_board.addChild(empty);

    let grade = 'gold';
    let medal = new createjs.Bitmap(queue.getResult('medal_'+grade));
    medal.mouseEnabled = false;
    medal.x = empty.x;
    medal.y = empty.y;
    this.cont_board.addChild(medal);

    let time = Math.ceil(Math.random()*30);
    let text = new createjs.Text(time+' s', 'bold 22px Arial', '#AAA');
    text.mouseEnabled = false;
    text.x = medal.x + 50;
    text.y = medal.y + 20;
    this.cont_board.addChild(text);
  }

  prototype.drawSkills = function() {

    let img = new createjs.Bitmap(queue.getResult('astroposeur'));
    img.x = 330;
    img.y = -150;
    this.cont_board.addChild(img);

    let btn = new createjs.Bitmap(queue.getResult('btn_skills'));
    btn.x = 310;
    btn.y = -10;
    btn.mouseEnabled = true;
    btn.cursor = 'pointer';
    this.cont_board.addChild(btn);

    btn.on('click', proxy(MENU.open, MENU), null, true);
  }

  prototype.drawOverlay = function() {

    let overlay = new createjs.Shape();
    overlay.graphics.beginFill('#FFF').drawRect(0,0,STAGEWIDTH, STAGEHEIGHT);
    overlay.x = - STAGEWIDTH/2;
    overlay.y = - STAGEHEIGHT/2 + 100;
    overlay.alpha = 0.4;
    this.cont_overlay.addChild(overlay);
    this.cont_overlay.alpha = 0;
  }

  prototype.drawTableSuccess = function() {

    // deserve a cocktail
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
    cocktail.x = -360;
    cocktail.y = 240;
    cocktail.scale = 1;
    cocktail.gotoAndPlay('bubble');
    const shadow = new createjs.Bitmap(queue.getResult('drinkshadow'));
    shadow.x = cocktail.x - 5;
    shadow.y = cocktail.y + 3;

    this.cont_table.addChild(shadow);
    this.cont_table.addChild(cocktail);

  }

  prototype.drawBoardSuccess = function() {

    //draw title
    let title = new createjs.Bitmap(queue.getResult('successtxt'));
    title.x = -400;
    title.y = -220;
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
    van.x = title.x + title.image.width + 60;
    van.y = title.y + 18;
    van.scale = 1;
    van.gotoAndPlay('fly');
    this.cont_board.addChild(van);
    this.cont_board.addChild(title);
  }

  prototype.drawTableRetry = function() {

      //want some coffee
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
    coffee.x = -350;
    coffee.y = 220;
    coffee.scale = 1;
    coffee.gotoAndPlay('smoke');
    const shadow = new createjs.Bitmap(queue.getResult('drinkshadow'));
    shadow.x = coffee.x - 4;
    shadow.y = coffee.y + 10;

    this.cont_table.addChild(shadow);
    this.cont_table.addChild(coffee);
  }

  prototype.drawBoardRetry = function() {

    // title
    let title = new createjs.Bitmap(queue.getResult('tryagaintxt'));
    title.x = -410;
    title.y = -220;
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
    dog.x = title.x + title.image.width + 80;
    dog.y = title.y + 10;
    dog.scaleX = -1;
    dog.gotoAndPlay('sit');
    this.cont_board.addChild(dog);
    this.cont_board.addChild(title);
  }

  prototype.drawButtonSuccess = function() {

    let btn_menu = new createjs.Bitmap(queue.getResult('btn_menu'));
    btn_menu.mouseEnabled = true;
    btn_menu.cursor = 'pointer';
    btn_menu.x = 100;
    btn_menu.y = 130;
    let btn_retry = new createjs.Bitmap(queue.getResult('btn_retry_sm'));
    btn_retry.mouseEnabled = true;
    btn_retry.cursor = 'pointer';
    btn_retry.x = -120;
    btn_retry.y = 135;

    this.cont_board.addChild(btn_menu);
    this.cont_board.addChild(btn_retry);

    btn_menu.on('click', proxy(MENU.open, MENU), null, true);
    btn_retry.on('click', proxy(SPOT.retry, SPOT), null, true);
  }

  prototype.drawButtonRetry = function() {

    let btn_retry = new createjs.Bitmap(queue.getResult('btn_retry'));
    btn_retry.mouseEnabled = true;
    btn_retry.cursor = 'pointer';
    btn_retry.x = 100;
    btn_retry.y = 130;
    let btn_menu = new createjs.Bitmap(queue.getResult('btn_menu_sm'));
    btn_menu.mouseEnabled = true;
    btn_menu.cursor = 'pointer';
    btn_menu.x = -120;
    btn_menu.y = 135;

    this.cont_board.addChild(btn_menu);
    this.cont_board.addChild(btn_retry);

    btn_menu.on('click', proxy(MENU.open, MENU), null, true);
    btn_retry.on('click', proxy(SPOT.retry, SPOT), null, true);
  }

  prototype.show = function() {

    let y = 100;
    let t = 800;
    this.cont_board.y -= y;
    createjs.Tween.get(this.cont_board).to({ y: this.cont_board.y + y, alpha: 1}, t, createjs.Ease.backOut);

    this.cont_table.y -= y;
    createjs.Tween.get(this.cont_table).wait(100).to({y: this.cont_table.y + y, alpha: 1}, t, createjs.Ease.backOut);

    this.cont_overlay.alpha = 0;
    createjs.Tween.get(this.cont_overlay).to({alpha:1}, t*2, createjs.Ease.quartOut);

  }

  window.Scoreboard = createjs.promote(Scoreboard, "Container");

}());