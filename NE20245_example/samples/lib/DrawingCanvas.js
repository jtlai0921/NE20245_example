/*
 * DrawingCanvas.js  0.02
 *
 * nanto_vi (TOYAMA Nao), 2005-10-06
 *
 */


// SVG Tiny Backend

function DrawingCanvasSVGT(parent, width, height)
{
  if (!parent) throw new Error("No canvas parent!");

  if (!width)  width  = parent.clientWidth;
  if (!height) height = parent.clientHeight;

  this.parent        = parent;
  this.width         = width;
  this.height        = height;
  this._bgColor      = "none";
  this._lineWidth    = 2;
  this._lineColor    = "#000";
  this._isDrawing    = false;
  this._currentShape = null;
  this._points       = "";
  this._dummyDot     = null;
  this._stack        = [];
  this._stackTop     = -1;

  var svg = document.createElementNS(this._XMLNS_SVG, "svg");
  svg.setAttribute("width", width);
  svg.setAttribute("height", height);

  var rect = document.createElementNS(this._XMLNS_SVG, "rect");
  rect.setAttribute("width", width);
  rect.setAttribute("height", height);
  rect.setAttribute("fill", this._bgColor);
  svg.appendChild(rect);

  var container = document.createElementNS("http://www.w3.org/1999/xhtml",
                                          "div");
  container.setAttribute("style", "width: "  + width  + "px; " +
                                  "height: " + height + "px; " +
                                  "vertical-align: bottom; ");
  container.appendChild(svg);

  parent.appendChild(container);

  this.container = container;
  this._svgRoot  = svg;
  this._bg       = rect;
}

DrawingCanvasSVGT.prototype = {
  _XMLNS_SVG: "http://www.w3.org/2000/svg",

  setBgColor: function (color) {
    this._bgColor = (color == "transparent") ? "none" : color;
    this._refresh();
  },

  setLineColor: function (color) {
    this._lineColor = color;
  },

  setLineWidth: function (width) {
    this._lineWidth = width;
  },

  startLine: function (x, y) {
    if (this._isDrawing)
      this.endLine();
    this._isDrawing = true;

    var dot = document.createElementNS(this._XMLNS_SVG, "circle");
    dot.setAttribute("cx", x);
    dot.setAttribute("cy", y);
    dot.setAttribute("r", this._lineWidth / 2);
    this._svgRoot.appendChild(dot);
    dot.setAttribute("fill", this._lineColor);

    this._dummyDot = dot;
    this._points   = x + "," + y;

    var polyline = document.createElementNS(this._XMLNS_SVG, "polyline");
    polyline.setAttribute("fill", "none");
    polyline.setAttribute("stroke", this._lineColor);
    polyline.setAttribute("stroke-width", this._lineWidth);
    polyline.setAttribute("stroke-linecap", "round");
    polyline.setAttribute("stroke-linejoin", "round");
    polyline.setAttribute("points", this._points);
    this._svgRoot.appendChild(polyline);
    this._currentShape = polyline;
  },

  endLine: function () {
    if (!this._isDrawing) return;

    if (this._dummyDot) {
      this._svgRoot.removeChild(this._currentShape);
      this._pushStack(this._dummyDot);
      this._dummyDot = null;
    } else {
      this._pushStack(this._currentShape);
    }
    this._isDrawing    = false;
    this._currentShape = null;
    this._points       = "";
  },

  lineTo: function (x, y) {
    if (!this._isDrawing) return;
    if (this._dummyDot) {
      this._svgRoot.removeChild(this._dummyDot);
      this._dummyDot = null;
    }

    this._points += " " + x + "," + y;
    this._currentShape.setAttribute("points", this._points);
  },

  undo: function () {
    if (this._isDrawing)
      this.endLine();
    if (this._stackTop < 0)
      return false;

    this._svgRoot.removeChild(this._stack[this._stackTop--]);
    this._refresh();
    return true;
  },

  redo: function () {
    if (this._isDrawing)
      this.endLine();
    if (this._stackTop >= this._stack.length - 1)
      return false;

    this._svgRoot.appendChild(this._stack[++this._stackTop]);
    this._refresh();
    return true;
  },

  clear: function () {
    if (this._isDrawing)
      this.endLine();

    for (var i = this._stackTop; i >= 0; i--)
      this._svgRoot.removeChild(this._stack[i]);
    this._refresh();
    this._stack.length = 0;
    this._stackTop     = -1;
  },

  getX: function () {
    var box = this.container;
    var x   = box.offsetLeft;
    while ((box = box.offsetParent))
      x += box.offsetLeft;

    return x;
  },

  getY: function () {
    var box = this.container;
    var y   = box.offsetTop;
    while ((box = box.offsetParent))
      y += box.offsetTop;

    return y;
  },

  _pushStack: function (shape) {
    if (++this._stackTop + 1 < this._stack.length)
      this._stack.length = this._stackTop + 1;
    this._stack[this._stackTop] = shape;
  },

  _refresh: function () {
    this._bg.setAttribute("fill", this._bgColor);
  }
};


// HTML Canvas Backend

function DrawingCanvasCanvas(parent, width, height)
{
  if (!parent) throw new Error("No canvas parent!");

  if (!width)  width  = parent.clientWidth;
  if (!height) height = parent.clientHeight;

  this.parent        = parent;
  this.width         = width;
  this.height        = height;
  this._bgColor      = "transparent";
  this._lineWidth    = 2;
  this._lineColor    = "#000";
  this._isDrawing    = false;

  this._points       = null;
  this._stack        = [];
  this._stackTop     = -1;

  this._currentShape = null;
  this._dummyDot     = null;

  var canvas = document.createElement("canvas");
  // Apple の文献によると id は必須とのことなので念のために追加
  // http://developer.apple.com/documentation/AppleApplications/Reference/SafariJSRef/Classes/Canvas.html#//apple_ref/js/cl/Canvas
  canvas.setAttribute("id", "DCCanvas" + (new Date()).getTime() +
                            ++DrawingCanvasCanvas._count);
  canvas.setAttribute("width", width);
  canvas.setAttribute("height", height);

  var container = document.createElement("div");
  container.setAttribute("style", "width: "  + width  + "px; " +
                                  "height: " + height + "px; " +
                                  "vertical-align: bottom; ");
  container.appendChild(canvas);
  parent.appendChild(container);

  var context = canvas.getContext("2d")
  context.lineCap  = "round";
  context.lineJoin = "round";

  this.container = container;
  this._context  = context;
}

DrawingCanvasCanvas._count = 0;

DrawingCanvasCanvas.prototype = {
  _MATH_2PI: 2 * Math.PI,

  setBgColor: function (color) {
    this._bgColor = color;
    this._refresh();
  },

  setLineColor: function (color) {
    this._lineColor = color;
  },

  setLineWidth: function (width) {
    this._lineWidth = width;
  },

  startLine: function (x, y) {
    if (this._isDrawing)
      this.endLine();
    this._isDrawing = true;

    this._context.strokeStyle = this._lineColor;
    this._context.fillStyle   = this._lineColor;
    this._context.lineWidth   = this._lineWidth;

    this._context.arc(x, y, this._lineWidth / 2, 0, this._MATH_2PI, true);
    this._context.fill();

    this._points           = [x, y];
    this._currentX         = x;
    this._currentY         = y;
    this._currentLineColor = this._lineColor;
    this._currentLineWidth = this._lineWidth;
  },

  endLine: function () {
    if (!this._isDrawing) return;

    this._isDrawing = false;
    this._pushStack(this._points,
                    this._currentLineColor, this._currentLineWidth);
    this._points    = null;
  },

  lineTo: function (x, y) {
    if (!this._isDrawing) return;

    this._context.moveTo(this._currentX, this._currentY);
    this._context.lineTo(x, y);
    this._context.stroke();

    this._points.push(x, y);
    this._currentX = x;
    this._currentY = y;
  },

  undo: function () {
    if (this._isDrawing)
      this.endLine();
    if (this._stackTop < 0)
      return false;

    this._stackTop--;
    this._refresh();
    return true;
  },

  redo: function () {
    if (this._isDrawing)
      this.endLine();
    if (this._stackTop >= this._stack.length - 1)
      return false;

    this._stackTop++;
    this._refresh();
    return true;
  },

  clear: function () {
    if (this._isDrawing)
      this.endLine();

    this._stack.length = 0;
    this._stackTop     = -1;
    this._refresh();
  },

  getX: function () {
    var box = this.container;
    var x   = box.offsetLeft;
    while ((box = box.offsetParent))
      x += box.offsetLeft;

    return x;
  },

  getY: function () {
    var box = this.container;
    var y   = box.offsetTop;
    while ((box = box.offsetParent))
      y += box.offsetTop;

    return y;
  },

  _pushStack: function (points, lineColor, lineWidth) {
    if (++this._stackTop + 1 < this._stack.length)
      this._stack.length = this._stackTop + 1;
    this._stack[this._stackTop] = {
      type:      (points.length == 2) ? "dot" : "polyline",
      points:    points,
      lineColor: lineColor,
      lineWidth: lineWidth
    };
  },

  _refresh: function () {
    if (this._bgColor == "transparent") {
      this._context.clearRect(0, 0, this.width, this.height);
    } else {
      this._context.fillStyle = this._bgColor;
      this._context.fillRect(0, 0, this.width, this.height);
    }

    for (var i = 0; i <= this._stackTop; i++) {
      var shape = this._stack[i];
      if (shape.type == "dot") {
        this._context.fillStyle = shape.lineColor;
        this._context.arc(shape.points[0], shape.points[1],
                          shape.lineWidth / 2, 0, this._MATH_2PI, true);
        this._context.fill();
      } else {
        this._context.strokeStyle = shape.lineColor;
        this._context.lineWidth   = shape.lineWidth;
        this._context.moveTo(shape.points[0], shape.points[1]);
        for (var j = 2, n = shape.points.length; j < n; j += 2)
          this._context.lineTo(shape.points[j], shape.points[j + 1]);
        this._context.stroke();
      }
    }
  }
};


// CSS Positioning Backend

function DrawingCanvasCSSP(parent, width, height)
{
  if (!parent) throw new Error("No canvas parent!");

  if (!width)  width  = parent.clientWidth;
  if (!height) height = parent.clientHeight;

  this.parent         = parent;
  this.width          = width;
  this.height         = height;
  this._bgColor       = "transparent";
  this._lineWidth     = 2;
  this._lineColor     = "#000";
  this._isDrawing     = false;
  this._currentShape  = null;
  this._stack         = [];
  this._stackTop      = -1;

  this._dotStyle  = "";
  this._dotOffset = 0;
  this._dotX      = 0;
  this._dotY      = 0;

  var container = document.createElement("div");
  var containerStyle = "background-color: " + this._bgColor + "; " +
                       "position: relative; " +
                       "width: "  + width  + "px; " +
                       "height: " + height + "px; " +
                       "overflow: hidden; ";
  if (this._useCssText)
    container.style.cssText = containerStyle;
  else
    container.setAttribute("style", containerStyle);

  parent.appendChild(container);
  this.container = container;
}

DrawingCanvasCSSP.prototype = {
  _useCssText: (function () {
    var htmlStyle = document.documentElement.getAttribute("style");
    return (htmlStyle !== null) && (typeof htmlStyle == "object");
  })(),

  setBgColor: function (color) {
    this.container.style.backgroundColor = this._bgColor = color;
  },

  setLineColor: function (color) {
    this._lineColor = color;
  },

  setLineWidth: function (width) {
    this._lineWidth = width;
  },

  startLine: function (x, y) {
    if (this._isDrawing)
      this.endLine();
    this._isDrawing = true;

    this._dotStyle  = "background-color: " + this._lineColor + "; " +
                      "position: absolute; " +
                      "width: "  + this._lineWidth + "px; " +
                      "height: " + this._lineWidth + "px; " +
                      "overflow: hidden; ";
    this._dotOffset = Math.round(this._lineWidth / 2);
    this._dotX      = x - this._dotOffset;
    this._dotY      = y - this._dotOffset;

    var layer    = document.createElement("div");
    var dot      = document.createElement("div");
    var dotStyle = this._dotStyle +
                   "left: " + this._dotX + "px; " +
                   "top: "  + this._dotY + "px; ";
    if (this._useCssText)
      dot.style.cssText = dotStyle;
    else
      dot.setAttribute("style", dotStyle);
    layer.appendChild(dot);
    this.container.appendChild(layer);
    this._currentShape = layer;
  },

  endLine: function () {
    if (!this._isDrawing) return;

    this._isDrawing    = false;
    this._pushStack(this._currentShape);
    this._currentShape = null;
  },

  lineTo: function (x, y) {
    if (!this._isDrawing) return;

    // ライン・ルーチン (1)線分描画のアルゴリズム - Fussy's HOMEPAGE
    // http://www2.starcat.ne.jp/~fussy/algo/algo1-1.htm
    var currentX = this._dotX;
    var currentY = this._dotY;
    var endX     = x - this._dotOffset;
    var endY     = y - this._dotOffset;
    var dirX     = (currentX < endX) ? 1 : -1;
    var dirY     = (currentY < endY) ? 1 : -1;
    var dx       = (dirX == 1) ? endX - currentX : currentX - endX;
    var dy       = (dirY == 1) ? endY - currentY : currentY - endY;
    var error, errorIncrement, errorCorrection;

    if (!(dx || dy)) return;
    var fragment       = document.createDocumentFragment();
    var dotStyleCommon = this._dotStyle;
    var useCssText     = this._useCssText;

    if (dx >= dy) {
      error           = -dx;
      errorIncrement  = dy << 1;
      errorCorrection = dx << 1;
      for (var i = 0; i < dx; i++) {
        currentX += dirX;
        error    += errorIncrement;
        if (error >= 0) {
          currentY += dirY;
          error    -= errorCorrection;
        }
        var dot      = document.createElement("div");
        var dotStyle = dotStyleCommon +
                       "left: " + currentX + "px; " +
                       "top: "  + currentY + "px; ";
        if (useCssText)
          dot.style.cssText = dotStyle;
        else
          dot.setAttribute("style", dotStyle);
        fragment.appendChild(dot);
      }
    } else {
      error           = -dy;
      errorIncrement  = dx << 1;
      errorCorrection = dy << 1;
      for (var i = 0; i < dy; i++) {
        currentY += dirY;
        error    += errorIncrement;
        if (error >= 0) {
          currentX += dirX;
          error    -= errorCorrection;
        }
        var dot      = document.createElement("div");
        var dotStyle = dotStyleCommon +
                       "left: " + currentX + "px; " +
                       "top: "  + currentY + "px; ";
        if (useCssText)
          dot.style.cssText = dotStyle;
        else
          dot.setAttribute("style", dotStyle);
        fragment.appendChild(dot);
      }
    }

    this._currentShape.appendChild(fragment);
    this._dotX = endX;
    this._dotY = endY;
  },

  undo: function () {
    if (this._isDrawing)
      this.endLine();
    if (this._stackTop < 0)
      return false;

    this.container.removeChild(this._stack[this._stackTop--]);
    return true;
  },

  redo: function () {
    if (this._isDrawing)
      this.endLine();
    if (this._stackTop >= this._stack.length - 1)
      return false;

    this.container.appendChild(this._stack[++this._stackTop]);
    return true;
  },

  clear: function () {
    if (this._isDrawing)
      this.endLine();

    for (var i = this._stackTop; i >= 0; i--)
      this.container.removeChild(this._stack[i]);
    this._stack.length = 0;
    this._stackTop     = -1;
  },

  _htmlIsRoot: (typeof document.compatMode == "string") &&
               (document.compatMode == "CSS1Compat"),

  getX: function () {
    var box = this.container;
    var x = box.offsetLeft;
    while ((box = box.offsetParent))
      x += box.offsetLeft;

    if (this._useCssText)
      x += (this._htmlIsRoot ? document.documentElement
                             : document.body).clientLeft;
    return x;
  },

  getY: function () {
    var box = this.container;
    var y = box.offsetTop;
    while ((box = box.offsetParent))
      y += box.offsetTop;

    if (this._useCssText)
      y += (this._htmlIsRoot ? document.documentElement
                             : document.body).clientTop;
    return y;
  },

  _pushStack: function (shape) {
    if (++this._stackTop + 1 < this._stack.length)
      this._stack.length = this._stackTop + 1;
    this._stack[this._stackTop] = shape;
  }
};


// VML Backend

function DrawingCanvasVML(parent, width, height)
{
  if (!document.namespaces) throw new Error("Not supported!");
  if (!document.namespaces.v) {
    document.namespaces.add("v", "urn:schemas-microsoft-com:vml");
    document.createStyleSheet().addRule("v\\:*",
                                        "behavior: url(#default#VML);");
  }
  if (!parent) throw new Error("No canvas parent!");

  if (!width)  width  = parent.clientWidth;
  if (!height) height = parent.clientHeight;

  this.parent        = parent;
  this.width         = width;
  this.height        = height;
  this._bgColor      = "none";
  this._lineWidth    = 2;
  this._lineColor    = "#000";
  this._isDrawing    = false;
  this._currentShape = null;
  this._dummyDot     = null;
  this._points       = "";
  this._stack        = [];
  this._stackTop     = -1;

  var container = document.createElement("div");
  container.style.cssText = "position: relative; " +
                            "width: "  + width  + "px; " +
                            "height: " + height + "px; " +
                            "overflow: hidden; ";
  parent.appendChild(container);
  this.container = container;
}

DrawingCanvasVML.prototype = {
  setBgColor: function (color) {
    this.container.style.backgroundColor = this._bgColor = color;
  },

  setLineColor: function (color) {
    this._lineColor = color;
  },

  setLineWidth: function (width) {
    this._lineWidth = width;
  },

  startLine: function (x, y) {
    if (this._isDrawing)
      this.endLine();
    this._isDrawing = true;

    var dot  = document.createElement("v:oval");
    var size = this._lineWidth
    dot.fillcolor     = this._lineColor;
    dot.strokecolor   = this._lineColor;
    //dot.stroked       = false;
    dot.style.cssText = "position: absolute; " +
                        "width: "  + size + "px; " +
                        "height: " + size + "px; " +
                        "left: " + (x - size / 2) + "px; " +
                        "top: "  + (y - size / 2) + "px; ";
    this.container.appendChild(dot);

    this._dummyDot = dot;
    this._points   = x + "," + y;

    var polyline = document.createElement("v:polyline");
    polyline.filled       = false;
    polyline.strokecolor  = this._lineColor;
    polyline.strokeweight = this._lineWidth;
    polyline.points       = this._points;
    var stroke = document.createElement("v:stroke");
    stroke.endcap = "round";
    polyline.appendChild(stroke);
    this.container.appendChild(polyline);
    this._currentShape = polyline;
  },

  endLine: function () {
    if (!this._isDrawing) return;

    if (this._dummyDot) {
      this.container.removeChild(this._currentShape);
      this._pushStack(this._dummyDot);
      this._dummyDot = null;
    } else {
      this._pushStack(this._currentShape);
    }
    this._isDrawing    = false;
    this._currentShape = null;
    this._points       = "";
  },

  lineTo: function (x, y) {
    if (!this._isDrawing) return;
    if (this._dummyDot) {
      this.container.removeChild(this._dummyDot);
      this._dummyDot = null;
    }

    this._points +=  " " + x + "," + y;
    this._currentShape.points.value = this._points;
  },

  undo: function () {
    if (this._isDrawing)
      this.endLine();
    if (this._stackTop < 0)
      return false;

    this._stack[this._stackTop--].style.visibility = "hidden";
    return true;
  },

  redo: function () {
    if (this._isDrawing)
      this.endLine();
    if (this._stackTop >= this._stack.length - 1)
      return false;

    this._stack[++this._stackTop].style.visibility = "visible";
    return true;
  },

  clear: function () {
    if (this._isDrawing)
      this.endLine();

    for (var i = this._stack.length; i--;)
      this.container.removeChild(this._stack[i]);
    this._stack.length = 0;
    this._stackTop     = -1;
  },

  _htmlIsRoot: (typeof document.compatMode == "string") &&
               (document.compatMode == "CSS1Compat"),

  getX: function () {
    var box = this.container;
    var x   = box.offsetLeft;
    while ((box = box.offsetParent))
      x += box.offsetLeft;

    x += (this._htmlIsRoot ? document.documentElement
                           : document.body).clientLeft;
    return x;
  },

  getY: function () {
    var box = this.container;
    var y   = box.offsetTop;
    while ((box = box.offsetParent))
      y += box.offsetTop;

    y += (this._htmlIsRoot ? document.documentElement
                           : document.body).clientTop;
    return y;
  },

  _pushStack: function (shape) {
    var stackLength = this._stack.length;
    if (++this._stackTop < stackLength) {
      for (var i = this._stackTop; i < stackLength; i++)
        this.container.removeChild(this._stack[i]);
      this._stack.length = this._stackTop + 1;
    }
    this._stack[this._stackTop] = shape;
  }
};


function DrawingCanvas()
{
  var backend = "CSSP";
  if (document.namespaces && document.namespaces.add)
    backend = "VML";
  try {
    if (document.createElement("canvas").getContext)
      backend = "Canvas";
  } catch (e) {}
  if (document.createElementNS) {
    if (document.implementation.hasFeature("org.w3c.svg", null))
      backend = "SVGT";
    if (window.opera) {
      var ua    = navigator.userAgent;
      var index = ua.indexOf("Opera");
      if (index >= 0 && parseInt(ua.substring(index + 6)) >= 8)
        backend = "SVGT";
    }
  }

  switch (backend) {
    case "SVGT":   DrawingCanvas = DrawingCanvasSVGT;   break;
    case "Canvas": DrawingCanvas = DrawingCanvasCanvas; break;
    case "CSSP":   DrawingCanvas = DrawingCanvasCSSP;   break;
    case "VML":    DrawingCanvas = DrawingCanvasVML;    break;
  }
  DrawingCanvas.backend = backend;
  DrawingCanvas.prototype.constructor = DrawingCanvas;
}
DrawingCanvas();
