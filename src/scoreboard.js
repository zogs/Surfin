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
      SCENE.unlockNextLevel();
    }
    else {
      this.drawTableRetry();
      this.drawBoardRetry();
      this.drawButtonRetry();
    }

    this.x = STAGEWIDTH/2;
    this.y = STAGEHEIGHT/2 - 100*rY;
  }


  prototype.drawBoard = function() {

    // draw background
    let bkg = new createjs.Bitmap(QUEUE.getResult('scoreboard'));
    bkg.regX = bkg.image.width/2;
    bkg.regY = bkg.image.height/2;
    bkg.mouseEnabled = false;
    this.cont_board.addChild(bkg);
    this.cont_board.alpha = 0;

  }

  prototype.drawTable = function() {

     // draw table
    var table = new createjs.Bitmap(QUEUE.getResult('scoretable'));
    table.regX = table.image.width/2;
    table.regY = table.image.height/2;
    table.x = - 400*rX;
    table.y = 200*rY;
    this.cont_table.addChild(table);
    this.cont_table.alpha = 0;
  }

  prototype.drawPlanet = function() {

    // draw planet
    let planet = SPOT.planet;
    let img = new createjs.Bitmap(QUEUE.getResult(planet.id));
    img.regX = img.image.width/2;
    img.regY = img.image.height/2;
    img.x = -350 * rX;
    img.y = -50 * rY;
    img.scale = 100 / img.image.width;
    let name = new createjs.Text(planet.name.toUpperCase(), Math.floor(18*rY)+'px Arial', '#747474');
    name.x = img.x + 60*rX;
    name.y = img.y - 15*rY;
    let system = new createjs.Text(planet.location, Math.floor(12*rY)+'px Arial', '#AAA');
    system.x = name.x + 5*rX;
    system.y = name.y + 20*rY;

    this.cont_board.addChild(img);
    this.cont_board.addChild(name);
    this.cont_board.addChild(system);
  }

  prototype.drawScore = function() {

    //draw goals
    let x = -80*rX;
    let y = -70*rY;
    let h = 28*rY;
    for(let i=0,ln=this.score.goals.length-1; i<=ln; i++) {
      let goal = this.score.goals[i];
      let isFilled = (goal.filled == true)? true : false;
      let color = (isFilled == true)? '#3e8d26' : '#5d5d5d';
      let name = goal.name.replace(/{n}/, goal.current);
      let text = new createjs.Text(name, 'bold '+Math.floor(14*rY)+'px Arial', color);
      text.mouseEnabled = false;
      text.x = x;
      text.y = y + (i*h);
      this.cont_board.addChild(text);

      let icon = new createjs.Bitmap(QUEUE.getResult((isFilled)? 'valid' : 'failed'));
      icon.mouseEnabled = false;
      icon.x = x - 35*rX;
      icon.y = y + (i*h) - 6*rY;
      this.cont_board.addChild(icon);
    }

    //draw medals
    let empty = new createjs.Bitmap(QUEUE.getResult('medal_empty'));
    empty.mouseEnabled = false;
    empty.x = - 120 * rX;
    empty.y = - 130 * rY;
    this.cont_board.addChild(empty);

    let grade = 'gold';
    let medal = new createjs.Bitmap(QUEUE.getResult('medal_'+grade));
    medal.mouseEnabled = false;
    medal.x = empty.x;
    medal.y = empty.y;
    this.cont_board.addChild(medal);

    let time = Math.ceil(Math.random()*30);
    let text = new createjs.Text(time+' s', 'bold '+Math.floor(22*rY)+'px Arial', '#AAA');
    text.mouseEnabled = false;
    text.x = medal.x + 50*rX;
    text.y = medal.y + 20*rY;
    this.cont_board.addChild(text);
  }

  prototype.drawSkills = function() {

    let img = new createjs.Bitmap(QUEUE.getResult('astroposeur'));
    img.x = 330 * rX;
    img.y = -150 * rY;
    this.cont_board.addChild(img);

    let btn = new createjs.Bitmap(QUEUE.getResult('btn_skills'));
    btn.x = 310 * rX;
    btn.y = -10 * rY;
    btn.mouseEnabled = true;
    btn.cursor = 'pointer';
    this.cont_board.addChild(btn);

    btn.on('click', proxy(MENU.open, MENU), null, true);
  }

  prototype.drawOverlay = function() {

    let overlay = new createjs.Shape();
    overlay.graphics.beginFill('#FFF').drawRect(0,0,STAGEWIDTH, STAGEHEIGHT);
    overlay.x = - STAGEWIDTH/2;
    overlay.y = - STAGEHEIGHT/2 + 100*rY;
    overlay.alpha = 0.4;
    this.cont_overlay.addChild(overlay);
    this.cont_overlay.alpha = 0;
  }

  prototype.drawTableSuccess = function() {

    // deserve a cocktail
    const cocktail = new createjs.Sprite(
      new createjs.SpriteSheet({
          images: [QUEUE.getResult('cocktail')],
          frames: {width:parseInt(100*rX), height:parseInt(120*rY), regX: parseInt(50*rX), regY: parseInt(60*rY)},
          framerate: 10,
          animations: {
            bubble: [0,11, 'bubble'],
          }
      })
    );
    cocktail.x = -360 * rX;
    cocktail.y = 240 * rY;
    cocktail.scale = 1;
    cocktail.gotoAndPlay('bubble');
    const shadow = new createjs.Bitmap(QUEUE.getResult('drinkshadow'));
    shadow.x = cocktail.x - 5*rX;
    shadow.y = cocktail.y + 3*rY;

    this.cont_table.addChild(shadow);
    this.cont_table.addChild(cocktail);

  }

  prototype.drawBoardSuccess = function() {

    //draw title
    let title = new createjs.Bitmap(QUEUE.getResult('successtxt'));
    title.x = -400*rX;
    title.y = -220*rY;
    let van = new createjs.Sprite(
      new createjs.SpriteSheet({
          images: [QUEUE.getResult('astrovan')],
          frames: {width:parseInt(140*rX), height:parseInt(100*rY), regX: parseInt(70*rX), regY: parseInt(50*rY)},
          framerate: 12,
          animations: {
            fly: [0,1, 'fly'],
          }
      })
    );
    van.x = title.x + title.image.width + 60 * rX;
    van.y = title.y + 18 * rY;
    van.scale = 1;
    van.gotoAndPlay('fly');
    this.cont_board.addChild(van);
    this.cont_board.addChild(title);
  }

  prototype.drawTableRetry = function() {

      //want some coffee
      const coffee = new createjs.Sprite(
      new createjs.SpriteSheet({
          images: [QUEUE.getResult('coffee')],
          frames: {width:parseInt(117*rX), height:parseInt(130*rY), regX: parseInt(56*rX), regY: parseInt(65*rY)},
          framerate: 10,
          animations: {
            smoke: [0,7, 'smoke'],
          }
      })
    );
    coffee.x = -350*rX;
    coffee.y = 220*rY;
    coffee.scale = 1;
    coffee.gotoAndPlay('smoke');
    const shadow = new createjs.Bitmap(QUEUE.getResult('drinkshadow'));
    shadow.x = coffee.x - 4*rX;
    shadow.y = coffee.y + 10*rY;

    this.cont_table.addChild(shadow);
    this.cont_table.addChild(coffee);
  }

  prototype.drawBoardRetry = function() {

    // title
    let title = new createjs.Bitmap(QUEUE.getResult('tryagaintxt'));
    title.x = -410*rX;
    title.y = -220*rY;
    let dog = new createjs.Sprite(
      new createjs.SpriteSheet({
          images: [QUEUE.getResult('dog')],
          frames: {width:parseInt(64*rX), height:parseInt(64*rY), regX: parseInt(16*rX), regY: parseInt(16*rY)},
          framerate: 10,
          animations: {
            sit: [0,1, 'sit'],
          }
      })
    );
    dog.x = title.x + title.image.width + 80*rX;
    dog.y = title.y + 10*rY;
    dog.scaleX = -1;
    dog.gotoAndPlay('sit');
    this.cont_board.addChild(dog);
    this.cont_board.addChild(title);
  }

  prototype.drawButtonSuccess = function() {

    let menu = new Button('NEXT LEVEL', proxy(SCENE.gotoNextLevel, SCENE));
    menu.x = 250*rX;
    menu.y = 180*rY;
    this.cont_board.addChild(menu);

    let next = new ButtonSecondary('MENU', proxy(MENU.open, MENU));
    next.x = 0*rX;
    next.y = 180*rY;
    this.cont_board.addChild(next);
  }

  prototype.drawButtonRetry = function() {

    let retry = new Button('RETRY', proxy(SCENE.reloadLevel, SCENE));
    retry.x = 220*rX;
    retry.y = 180*rY;
    this.cont_board.addChild(retry);

    let menu = new ButtonSecondary('MENU', proxy(MENU.open, MENU));
    menu.x = 0*rX;
    menu.y = 180*rY;
    this.cont_board.addChild(menu);
  }

  prototype.show = function() {

    let y = -400*rY;
    let t = 600;
    this.cont_board.y -= y;
    this.cont_board.scale = 0.9;
    createjs.Tween.get(this.cont_board).to({ y: this.cont_board.y + y, alpha: 1, scale: 1}, t, createjs.Ease.backOut);

    this.cont_table.y -= y;
    createjs.Tween.get(this.cont_table).wait(200).to({y: this.cont_table.y + y, alpha: 1}, t, createjs.Ease.backOut);

    this.cont_overlay.alpha = 0;
    createjs.Tween.get(this.cont_overlay).to({alpha:1}, t*2, createjs.Ease.quartOut);

  }

  prototype.selfRemove = function() {
    this.removeAllChildren();
  }

  window.Scoreboard = createjs.promote(Scoreboard, "Container");

}());