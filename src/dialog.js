class Dialog extends createjs.Container {

  constructor(content= [], buttons=[], params) {

    super();
    this.content = content;
    this.buttons = buttons;
    var defaults = {
      x: window.DefaultWidth/2,
      y: window.DefaultHeight/2 - 50,
      dx: 0,
      dy: 0,
      width: null,
      height: null,
      alpha: 0,
      lifetime: 0,
      call: null,
      onload: null,
      radius: 0,
      paddings: [30,60,30,60],
      backgroundColor: '#FFF',
      borderColor: '#FAFAFA',
      borderWidth: 1,
      arrowTo: null,
      arrowFrom: 'top',
      arrowWidth: 50,
      arrowCenter: 0,
      animate: false,
      animateSpeed: 750,
      id: 0,
    };

    this.params = extend(defaults,params);
    this.originParams = this.params;
    this.x = this.params.x;
    this.y = this.params.y;
    this.x += this.params.dx;
    this.y += this.params.dy;
    this.alpha = this.params.alpha;
    this.htmlElement = null;
    this.htmlContent = null;

    window.Stage.addEventListener('canvas_resized', proxy(this.onResize, this));

    this.init();
  }

  open() {

    this.mouseEnabled = true;
    if(this.htmlElement) this.htmlElement.style.pointerEvents = 'initial';

    if(this.params.onload) {
      this.params.onload(this);
    }

    if(this.params.lifetime > 0) {
      createjs.Tween.get(this).to({}, this.params.lifetime).call(proxy(this.params.call, this));
    }

    if(this.params.animate) {
      this.y -= 20;
      createjs.Tween.get(this).to({y: this.y + 20}, this.params.animateSpeed);
    }

    this.alpha = 0;
    createjs.Tween.get(this).to({alpha: 1}, this.params.animateSpeed);
  }

  close() {
    this.alpha = 0;
    this.mouseEnabled = false;
    if(this.htmlElement) this.htmlElement.style.pointerEvents = 'none';

  }

  onResize(ev) {

    if(this.htmlContent) {

      /*
      I don't understand
      this.htmlContent._props.matrix.appendTransform(100, 100, 0.5, 0.5, 0, 0, 0, 0, 0);
      this.htmlContent._oldProps.matrix = new createjs.Matrix2D();
      this.htmlContent._handleDrawEnd();
      */
    }
  }

  init() {

    let H = 0;
    let W = 0;

    let content;
    let element;
    // Exterior HTML element
    if(typeof this.content == 'string' && this.content.indexOf('#') == 0) {

      let id = this.content.replace('#','');
      element = document.getElementById(id);
      content = new createjs.DOMElement(id);
      this.htmlElement = element;
      this.htmlContent = content;
      W = element.offsetWidth;
      H = element.offsetHeight;
    }
    // HTML content
    else if(typeof this.content == 'string') {
      let html = this.content;
      let id = this.content.trim().replace(/(<([^>]+)>)/ig,"").substring(0,5).replace(' ','') + Math.ceil(Math.random()*1000);
      let element = document.createElement('div');
      element.classList.add('dialog','autogen');
      element.id = id;
      element.innerHTML = html;
      window.CanvasContainer.appendChild(element);
      content = new createjs.DOMElement(id);
      this.htmlElement = element;
      this.htmlContent = content;
      W = element.offsetWidth;
      H = element.offsetHeight;
    }
    // TEXT & IMAGE elements
    else if(typeof this.content == 'object') {
      for(let i=0; i<this.content.length; i++) {
        let obj = this.content[i];
        W = (obj.width > W)? obj.width : W;
      }
      if(this.params.width) W = this.params.width;
      for(let i=0; i<this.content.length; i++) {
        let obj = this.content[i];
        obj.y = H;
        H += obj.height;
        obj.params.width = W; // set all obj the same width
        obj.redraw(); // redraw allow us to align obj (left, right, center)
      }
    }

    if(this.params.width !== null) W = this.params.width;

    // BUTTON elements
    let totalw = 0;
    for(let i=0,ln=this.buttons.length; i<ln; i++) {
      let button = this.buttons[i];
      let w = button.width;
      let h = button.height;
      H += (i==0)? h/2 + 15 : 0;
      button.y = H + button.params.y;
      button.dialogBox = this;
      H += (i==this.buttons.length-1)? h*2/3 : 0;
      totalw += w + 20;
    }
    if(totalw > W) W = totalw;

    // box size
    this.width = W;
    this.height = H;

    // draw background
    if(this.params.backgroundColor) {
      this.drawBackground(W,H);


    }

    // draw arrow
    if(this.params.arrowTo !== null && typeof this.params.arrowTo == 'object' && this.params.arrowTo.x !== undefined && this.params.arrowTo.y !== undefined) {
      let to = this.globalToLocal(this.params.arrowTo.x, this.params.arrowTo.y);
      this.drawArrow(to);
    }

    if(this.params.arrow !== null && typeof this.params.arrow == 'object' && this.params.arrow.x !== undefined && this.params.arrow.y !== undefined) {
      let to = this.globalToLocal(this.x + this.params.arrow.x, this.y + this.params.arrow.y);
      this.drawArrow(to);
    }

    // Add TEXT elements
    if(typeof this.content == 'object') {
      for(let i=0; i<this.content.length; i++) {
        let obj = this.content[i];
        if(obj instanceof Image) {
          if(obj.params.align == 'left') obj.x += obj.width/2;
          if(obj.params.align == 'center') obj.x += W/2 - obj.width/2;
          if(obj.params.align == 'right') obj.x += W - obj.width;
        }
        this.addChild(obj);
      }
    }

    // Add HTML element
    if(typeof this.content == 'string') {

      this.addChild(content);
    }

    // Add BUTTON elements
    for(let i=0; i<this.buttons.length; i++) {
      let button = this.buttons[i];
      if(button.params.float == 'center') button.x = this.width /2;
      if(button.params.float == 'left') button.x = 0 + button.width/2;
      if(button.params.float == 'right') button.x = this.width  - button.width/2;
      button.x += button.params.x;
      this.addChild(button);
    }

    let mid = new createjs.Shape();
    mid.graphics.beginFill('red').drawCircle(0,0,3);
    //this.addChild(mid);


    // center dialog
    this.resetXY();
  }

  drawBackground(w,h) {

    let pad = this.params.paddings;

    let bg1 = new createjs.Shape();
    bg1.graphics.setStrokeStyle(this.params.borderWidth).beginStroke(this.params.borderColor).beginFill(this.params.backgroundColor).drawRoundRectComplex(0-pad[3]-5, 0-pad[0]+5, w + pad[1]*2+10, h + pad[2]*2-10 , this.params.radius, this.params.radius, this.params.radius, this.params.radius);
    bg1.alpha = 0.4;
    this.addChild(bg1);

    let bg = new createjs.Shape();
    bg.graphics.setStrokeStyle(this.params.borderWidth).beginStroke(this.params.borderColor).beginFill(this.params.backgroundColor).drawRoundRectComplex(0-pad[3], 0-pad[0], w + pad[1]*2, h + pad[2]*2 , this.params.radius, this.params.radius, this.params.radius, this.params.radius);
    this.addChild(bg);

    let bg2 = new createjs.Shape();
    bg2.graphics.setStrokeStyle(0.5).beginStroke('#919191').beginFill(this.params.backgroundColor).drawRoundRectComplex(0-pad[3]+10, 0-pad[0]+10, w + pad[1]*2-20, h + pad[2]*2-20 , this.params.radius, this.params.radius, this.params.radius, this.params.radius);
    this.addChild(bg2);
  }

  resetXY() {

    this.x = this.params.x + this.params.dx - this.width/2;
    this.y = this.params.y + this.params.dy - this.height/2;
  }

  drawArrow(to) {

    let arrow = new createjs.Shape();
    arrow.graphics.beginFill(this.params.backgroundColor).setStrokeStyle(this.params.borderWidth).beginStroke(this.params.borderColor);
    if(this.params.arrowFrom == 'top') {
      arrow.graphics
            .moveTo(this.width/2 - this.params.arrowWidth/2 + this.params.arrowCenter, - this.params.paddings[0]+ this.params.borderWidth/2+0.5)
            .lineTo(to.x + this.width/2, to.y + this.height/2)
            .lineTo(this.width/2 + this.params.arrowWidth/2 + this.params.arrowCenter, - this.params.paddings[0]+ this.params.borderWidth/2+0.5)
            ;
    }
    if(this.params.arrowFrom == 'left') {
      arrow.graphics
            .moveTo(-this.params.paddings[3]+ this.params.borderWidth/2+0.5, this.height/2 - this.params.arrowWidth/2 + this.params.arrowCenter)
            .lineTo(to.x + this.width/2, to.y + this.height/2)
            .lineTo(-this.params.paddings[3]+ this.params.borderWidth/2+0.5, this.height/2 + this.params.arrowWidth/2 + this.params.arrowCenter)
            ;
    }
    if(this.params.arrowFrom == 'right') {
      arrow.graphics
            .moveTo(this.width + this.params.paddings[1]- this.params.borderWidth/2-0.5, this.height/2 - this.params.arrowWidth/2 + this.params.arrowCenter)
            .lineTo(to.x + this.width/2, to.y + this.height/2)
            .lineTo(this.width + this.params.paddings[1]- this.params.borderWidth/2-0.5, this.height/2 + this.params.arrowWidth/2 + this.params.arrowCenter)
            ;
    }
    if(this.params.arrowFrom == 'bottom') {
      arrow.graphics
            .moveTo(this.width/2 - this.params.arrowWidth/2 + this.params.arrowCenter, this.height + this.params.paddings[2] -  this.params.borderWidth/2-0.5 )
            .lineTo(to.x + this.width/2, to.y + this.height/2)
            .lineTo(this.width/2 + this.params.arrowWidth/2 + this.params.arrowCenter, this.height + this.params.paddings[2] -  this.params.borderWidth/2-0.5 )
            ;
    }

    this.addChild(arrow);

  }

}


  class Text extends createjs.Container {

    constructor(text = 'KOMODO', font = null, params = {}) {

      super();
      var defaults = {
        text: text,
        font: 'normal 18px "Work Sans", Helvetica',
        width: null,
        height: null,
        color: '#626262',
        paddingTop: 5,
        paddingBottom: 5,
        paddingLeft: 10,
        paddingRight: 10,
        textAlign: 'center',
      };

      this.params = extend(defaults,params);
      if(font === 'bold') this.params.font = this.params.font.replace('normal', 'bold');
      else if(font === 'italic') this.params.font = this.params.font.replace('normal', 'italic');
      else if(font !== null) this.params.font = font;


      this.init();
    }

    init() {

      this.drawText();
    }

    redraw() {

      this.removeAllChildren();
      this.drawText();
    }

    drawText() {

      if(this.params.text.length == 0) {
        this.params.paddingTop = 0, this.params.paddingBottom = 0, this.params.paddingLeft = 0, this.params.paddingRight = 0;
      }

      let text = new createjs.Text(this.params.text, this.params.font, this.params.color);

      //calcul width
      let w = 0;
      if(this.params.text.length > 0) w = text.getMeasuredWidth();
      if(this.params.width) w = this.params.width;

      //calcul height
      let h = 0;
      if(this.params.text.length > 0) h = text.getMeasuredHeight();
      if(this.params.height) h = this.params.height;

      // add padding
      let W = w + this.params.paddingLeft + this.params.paddingRight;
      let H = h + this.params.paddingTop + this.params.paddingBottom;

      this.width = W;
      this.height = H;

      // align text horizonaly
      if(this.params.textAlign == 'left') {
        text.textAlign = 'left';
      }
      if(this.params.textAlign == 'right') {
        text.textAlign = 'right';
        text.x = this.width - this.params.paddingRight*2;
      }
      if(this.params.textAlign == 'center') {
        text.textAlign = 'center';
        text.x = this.width /2 - this.params.paddingLeft;
      }

      //align text vertically (to do)
      text.y = this.params.paddingTop;

      this.addChild(text);
      this.text = text;

      //let mid = new createjs.Shape();
      //mid.graphics.beginFill('red').drawCircle(0,0,3);
      //this.addChild(mid);
    }

  }

  class Link extends Text {

   constructor(text = 'http://perdu.com', link = null, font = null, params = {}) {

      params.color = params.color ? params.color : '#1a0dab';
      params.link = link ? link : text;

      super(text, font, params);

      this.cursor = 'pointer';
      this.addEventListener('click', proxy(this.openLink, this));

    }

    openLink(e) {

      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      window.open(this.params.link, '_self');

    }
  }

  class Button extends createjs.Container {

    constructor(text = 'CLICK ME', callback = null, params) {

      super();
      this.text = text;
      this.callback = callback;
      var defaults = {
        width: null,
        height: null,
        font: '36px "BenchNine", Arial',
        radius: 10,
        paddings: [20, 60, 20, 60],
        color: 'white',
        backgroundColor: "#b64576",
        borderWidth: 1,
        borderColor: '#e2b1c6',
        float: 'center',
        x: 0,
        y: 50 * rY,
      };

      this.params = extend(defaults,params);
      this.init();

    }

    init() {
      this.drawButton();
    }

    drawButton() {
      // get text size
      let c = new createjs.Text(this.text, this.params.font, this.params.color);
      let w = (this.params.width == null)? c.getBounds().width : this.params.width;
      let h = (this.params.height == null)? c.getBounds().height : this.params.height;

      // draw background
      let back = this.drawBackground(w,h);
      this.addChild(back);

      // draw text
      let text = this.drawText(w,h);
      this.addChild(text);

      // set globals
      this.front = text;
      this.back = back;

      // init event
      this.on("click", this.click);
      this.on("mousedown", this.down);
      this.on("mouseover", this.over);
      this.on("mouseout", this.out);

      this.cursor = "pointer";

      let pad = this.params.paddings;
      this.width = w + pad[1] + pad[3];
      this.height = h + pad[0] + pad[2];

    }

    drawText(w,h) {
      let container = new createjs.Container();
      let text = new createjs.Text(this.text, this.params.font, this.params.color);
      text.mouseEnabled = false;
      text.textAlign = 'center';
      text.regX = 0;
      text.regY = h/2;
      let shadow = new createjs.Text(this.text, this.params.font, 'rgba(0,0,0,0.4)');
      shadow.mouseEnabled = false;
      shadow.textAlign = 'center';
      shadow.regX = 0;
      shadow.regY = h/2;
      shadow.x = 2;

      container.y = -5;
      container.addChild(shadow);
      container.addChild(text);

      return container;

    }

    drawBackground(w,h) {
      let container = new createjs.Container();
      let pad = this.params.paddings;
      let bg = new createjs.Shape();
      bg.graphics
        .setStrokeStyle(this.params.borderWidth)
        .beginLinearGradientStroke(["#bb4a7b","#FFF","#bb4a7b"], [0, 0.5, 1], 0-pad[3], 0, w+pad[1]*2, 0)
        .beginLinearGradientFill(["#bb4a7c","#a02e5f"], [0, 1], 0, 0, 0, h)
        .drawRoundRectComplex(0-pad[3], 0-pad[0], w + pad[1]*2, h + pad[2]*2 , this.params.radius, this.params.radius, this.params.radius, this.params.radius);
      bg.regX = w/2;
      bg.regY = h/2 + 5;
      let shadow = new createjs.Shape();
      shadow.graphics.setStrokeStyle(0).beginFill('#7f3d59').drawRoundRectComplex(0-pad[3], 0-pad[0], w + pad[1]*2, h + pad[2]*2 , this.params.radius, this.params.radius, this.params.radius, this.params.radius);
      shadow.regX = w/2;
      shadow.regY = h/2 + 5;
      shadow.y = 8;

      container.addChild(shadow);
      container.addChild(bg);

      return container;
    }

    click(e) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      /* actual click is handle by down() and up() functions */
    }

    up(e) {
      e.stopImmediatePropagation();
      this.off("pressup", this.up);
      this.scaleX = this.scaleY = 1;
      if(this.callback === null) return this.nullCallback();
      else return this.callback();
    }

    down(e) {
      e.stopImmediatePropagation();
      this.scaleX = this.scaleY -= 0.05;
      this.on("pressup", this.up);
    }

    over(e) {
      this.front.y -= 1;
    }

    out(e) {
      this.front.y += 1;
      this.scaleX = this.scaleY = 1;
    }

    nullCallback() {

      console.error("Button has been clicked but there is no handler");
    }
  }

class ButtonSecondary extends Button {

  constructor(text = 'SECONDARY', callback = null, params) {

      var defaults = {
        width: null,
        height: null,
        font: '30px "BenchNine", Arial',
        radius: 10,
        paddings: [15, 40, 15, 40],
        color: 'white',
        backgroundColor: "#b64576",
        borderWidth: 1,
        borderColor: '#e2b1c6',
        float: 'center',
        x: 0,
        y: 50,
      };
      super(text, callback, defaults);
    }

    drawBackground(w,h) {
      let container = new createjs.Container();
      let pad = this.params.paddings;
      let bg = new createjs.Shape();
      bg.graphics
        .setStrokeStyle(this.params.borderWidth)
        .beginLinearGradientStroke(["#cdcdcd","#FFF","#cdcdcd"], [0, 0.5, 1], 0-pad[3], 0, w+pad[1]*2, 0)
        .beginLinearGradientFill(["#ededed","#dadada"], [0, 1], 0, 0, 0, h)
        .drawRoundRectComplex(0-pad[3], 0-pad[0], w + pad[1]*2, h + pad[2]*2 , this.params.radius, this.params.radius, this.params.radius, this.params.radius);
      bg.regX = w/2;
      bg.regY = h/2 + 5;
      let shadow = new createjs.Shape();
      shadow.graphics.setStrokeStyle(0).beginFill('#AAA').drawRoundRectComplex(0-pad[3], 0-pad[0], w + pad[1]*2, h + pad[2]*2 , this.params.radius, this.params.radius, this.params.radius, this.params.radius);
      shadow.regX = w/2;
      shadow.regY = h/2 + 5;
      shadow.y = 8;

      container.addChild(shadow);
      container.addChild(bg);

      return container;
    }
}

class Image extends createjs.Container {

    constructor(bitmap, params = {}) {

      super();
      var defaults = {
        x: 0,
        y: 0,
        width: null,
        height: null,
        paddingTop: 5,
        paddingBottom: 5,
        paddingLeft: 10,
        paddingRight: 10,
        align: 'left',
      };

      this.params = extend(defaults,params);
      this.bitmap = bitmap;
      this.width = (this.params.width)? this.params.width : bitmap.image.width;
      this.height = (this.params.height)? this.params.height : bitmap.image.height;
      this.init();
    }

    init() {
      this.drawImage();
    }

    redraw() {
      this.removeAllChildren();
      this.drawImage();
    }

    drawImage() {
      this.addChild(this.bitmap);
    }
  }