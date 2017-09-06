//updated 20160824
//added the ability to edit the Bezier curve using mouse click/drag

//#using jQuery.min.js  //auto included by jsFiddle
//bezier curve editor gVars

// EXTRAS 
var previewBtn = document.getElementById("previewBtn")
previewBtn.addEventListener("click", function(){
    if(document.getElementById("maxChar").value === "")
        alert("Please, enter maximum amount of characters")
    else
    {
        if(document.getElementById("selectedFontSizes").options.length < 1)
            alert("Please, select at least 1 font size")
        else 
        {
            if(document.getElementById("selectedFontFamilies").options.length < 1)
                alert("Please, select at least 1 font family")
            else
                renderPreview()
        }
    }       
})
const ajaxData = {}
let pFontSize, pFontFammily

function fetchData() 
{
    return new Promise(function (resolve) {
        resolve(ajaxData)
    })
}

function renderPreview()
{
    setData()
    fetchData()
        .then(function(data){
            generateHtml(data)
        })
}

function setData()
{
    let fontFamilies = getValuesFromList(document.getElementById("selectedFontFamilies"))
    let fontSizes    = getValuesFromList(document.getElementById("selectedFontSizes"))

    ajaxData.curve = document.getElementById("curve").value
    ajaxData.label = document.getElementById("labelText").value
    ajaxData.defaultText = document.getElementById("text").value
    ajaxData.maxChar = document.getElementById("maxChar").value
    ajaxData.fontSizes = fontSizes
    ajaxData.fontFamilies = fontFamilies

    if(fontSizes.length % 2 === 0)
        ajaxData.defaultFontSize = fontSizes[Math.floor((fontSizes.length - 1) / 2)]
    else    
        ajaxData.defaultFontSize = fontSizes[Math.floor((fontSizes.length) / 2)]

    if(document.getElementById("defaultFontFamily").value !== "")
        ajaxData.defaultFontFamily = document.getElementById("defaultFontFamily").value
    else 
        ajaxData.defaultFontFamily = fontFamilies[0]
}

function generateHtml(data)
{
    const wrapper = document.getElementById('previewDiv');
    while(wrapper.firstChild){
        wrapper.removeChild(wrapper.firstChild);
    }

    createCanvas()
    prevCanvas = getCanvas()
    prevCtx = getContext(prevCanvas)
    setContextProperties(prevCtx)

    pFontSize = data.defaultFontSize
    pFontFamily = data.defaultFontFamily
    setPText(data)
    setFontFamilies(prevCtx, data)
    setFontSizes(prevCtx, data)
    

  //curve = data.curve;
 
    pCurveText = document.getElementById('pText');
  //  $(curve).keyup(function(e) {changeCurve();});
    $(pCurveText).keyup(function(e) {render(prevCtx, pCurveText.value)});
    
    render(prevCtx)
}

function createCanvas() { document.getElementById('previewCanvasDiv').innerHTML = '<canvas id="prevCanvas" width="500" height="300"></canvas>'; } //for IE  
function getCanvas() { return document.getElementById('prevCanvas'); }
function getContext(canvas) { return canvas.getContext('2d') }
function setContextProperties(ctx) 
{
    ctx.shadowColor = "#f9f9f9";
    ctx.shadowOffsetX = -1; 
    ctx.shadowOffsetY = 0; 
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#343638";
}

function setPText(data)
{
    `<div class="form-group" >
        <label for="pText">Enter Your Text</label>
        <input type="text" class="form-control" id="pText" name="pText" value="Hello World <3">
    </div>`
    const container = document.getElementById('previewDiv')
    const div = document.createElement('div')
    div.className = "form-group"
    const label = document.createElement('label')
    label.innerHTML = data.label
    const input = document.createElement('input')
    input.className = "form-control"
    input.id = "pText"
    input.value = data.defaultText
    input.maxLength = data.maxChar
    
    container.appendChild(div)
    div.appendChild(label)
    div.appendChild(input)
}

function setFontFamilies(ctx, data)
{
    ctx.font = pFontSize + "px " + pFontFamily
    if(data.fontFamilies.length > 1)
    {
        const container = document.getElementById('previewDiv')
        const div = document.createElement('div')
        div.className = "form-group"
        const label = document.createElement('label')
        label.innerHTML = "Font"
        const select = document.createElement('select')
        select.className = "form-control"
      
        for (let i = 0; i < data.fontFamilies.length; i++)
        {
            let option = document.createElement('option');
            option.innerHTML = data.fontFamilies[i];
            select.appendChild(option);

            if(option.value == data.defaultFontFamily)
                select.selectedIndex = i;
        }

        container.appendChild(div)
        div.appendChild(label)
        div.appendChild(select)

        select.addEventListener("change", ()=> {
            pFontFamily = select.options[select.selectedIndex].text;
            ctx.font = pFontSize + "px " + pFontFamily;
            render(prevCtx)
        })
    }    
}

function setFontSizes(ctx, data)
{
    let len = data.fontSizes.length;
    if(len > 1)
    {
        const container = document.getElementById('previewDiv')
        const div = document.createElement('div')
        div.className = "form-group"
        const label = document.createElement('label')
        label.innerHTML = "Text Size"
        const select = document.createElement('select')
        select.className = "form-control"

        let sizeLabel = [];
        if(len == 5)
            sizeLabel = ["Extra Small","Small","Medium","Large","Extra Large"]
        else if(len == 4)
            sizeLabel = ["Extra Small","Small","Medium","Large"]
        else if(len == 3)
            sizeLabel = ["Small","Medium","Large"]
        else 
            sizeLabel = ["Small","Large"]

        for (let i = 0; i < len; i++)
        {

            let option = document.createElement('option');
            option.value = data.fontSizes[i];
            option.innerHTML = sizeLabel[i];
            select.appendChild(option);

            if(option.value == data.defaultFontSize)
                select.selectedIndex = i;
        }

        container.appendChild(div)
        div.appendChild(label)
        div.appendChild(select)

        select.addEventListener("change", ()=> {
            pFontSize = select.options[select.selectedIndex].value;
            ctx.font = pFontSize + "px " + pFontFamily;
            render(prevCtx);
        })
    }
}

// END OF EXTRAS

var first = true;
var gState;
var Mode = {
  kAdding: {
    value: 0,
    name: "Adding"
  },
  kSelecting: {
    value: 1,
    name: "Selecting"
  },
  kDragging: {
    value: 2,
    name: "Dragging"
  },
  kRemoving: {
    value: 3,
    name: "Removing"
  },
};
var gBezierPath;
var WIDTH;
var HEIGHT;
var pWIDTH, pHEIGHT;
//bezier curve editor gVars

var ctx;
var canvas;
var prevCanvas;
var prevCtx;

var fontSizeSlider = document.getElementById('fontSizeSlider');
var fontSize = fontSizeSlider.value;
var fontFamilySelector = document.getElementById('fontFamilySelector');
var fontFamily = fontFamilySelector.options[fontFamilySelector.selectedIndex].text;
var fontSizeText = document.getElementById('fontSizeText');

fontSizeText.value = fontSizeSlider.value;
        
fontSizeSlider.addEventListener("mousemove", function () {
    fontSizeText.value = this.value;
    fontSize = this.value;
    ctx.font = this.value + "px " + fontFamily;
    render(ctx);
});       
        
fontFamilySelector.addEventListener("change", ()=> {
    fontFamily = fontFamilySelector.options[fontFamilySelector.selectedIndex].text;
    ctx.font = fontSize + "px " + fontFamily;
    render(ctx);
})


window.onload = function () { 
    
    startIt();
}

function startIt() {
    canvasDiv = document.getElementById('canvasDiv');
    canvasDiv.innerHTML = '<canvas id="layer0" width="500" height="270" style="display:inline"></canvas>'; //for IE
    canvas = document.getElementById('layer0');
    WIDTH = canvas.width;
    HEIGHT = canvas.height;
    canvas.addEventListener("mousedown", handleDown, false);
    canvas.addEventListener("mouseup", handleUp, false);
    ctx = canvas.getContext('2d');

    
    
    ctx.shadowColor = "#f9f9f9";
    ctx.shadowOffsetX = -1; 
    ctx.shadowOffsetY = 0; 
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#343638";
    ctx.font = fontSize + "px " + fontFamily;



    cBox = document.getElementById("cBox");

    curve = document.getElementById('curve');
    curveText = document.getElementById('text');
    $(curveText).keyup(function(e) {
        render(ctx);
    });



  //this code sets up the initial curve definition
  gState = Mode.kAdding
  gBezierPath = new BezierPath(new Point(50, 100));
  gBezierPath.addPoint(new Point(280, 100));
  render(ctx);
  
  gState = Mode.kSelecting;
  
  //this code sets up the initial curve definition
}

cBox.onchange = () => {
    render(ctx);
}

function drawStack(ct, text) {
  Ribbon = gBezierPath.toRibbon(); //get the curve definition to pass to the text2path
  if (Ribbon != null)
    if(text)
        FillRibbon(text, Ribbon, ct)
    else
        FillRibbon(curveText.value, Ribbon, ct);
}

function FillRibbon(text, Ribbon, context) {

  var textCurve = [];
  var ribbon = text.substring(0, Ribbon.maxChar);
  var curveSample = 1000;


  xDist = 0;
  var i = 0;
  for (i = 0; i < curveSample; i++) {
    a = new bezier2(i / curveSample, Ribbon.startX, Ribbon.startY, Ribbon.control1X, Ribbon.control1Y, Ribbon.control2X, Ribbon.control2Y, Ribbon.endX, Ribbon.endY);
    b = new bezier2((i + 1) / curveSample, Ribbon.startX, Ribbon.startY, Ribbon.control1X, Ribbon.control1Y, Ribbon.control2X, Ribbon.control2Y, Ribbon.endX, Ribbon.endY);
    c = new bezier(a, b);
    textCurve.push({
      bezier: a,
      curve: c.curve
    });
  }

  letterPadding = context.measureText(" ").width / 4;
  w = ribbon.length;
  ww = Math.round(context.measureText(ribbon).width);

  totalPadding = (w - 1) * letterPadding;
  totalLength = ww + totalPadding;
  p = 0;

  cDist = textCurve[curveSample - 1].curve.cDist;

  z = (cDist / 2) - (totalLength / 2);

  for (i = 0; i < curveSample; i++) {
    if (textCurve[i].curve.cDist >= z) {
      p = i;
      break;
    }
  }

  for (i = 0; i < w; i++) {
    context.save();
    context.translate(textCurve[p].bezier.point.x, textCurve[p].bezier.point.y);
    context.rotate(textCurve[p].curve.rad);
    context.fillText(ribbon[i], 0, fontSize/4);
    context.restore();

    x1 = context.measureText(ribbon[i]).width + letterPadding;
    x2 = 0;
    for (j = p; j < curveSample; j++) {
      x2 = x2 + textCurve[j].curve.dist;
      if (x2 >= x1) {
        p = j;
        break;
      }
    }
  }
} //end FillRibon

function bezier(b1, b2) {
  //Final stage which takes p, p+1 and calculates the rotation, distance on the path and accumulates the total distance along path at each point using linear approximation.
  this.rad = Math.atan(b1.point.mY / b1.point.mX);
  this.b2 = b2;
  this.b1 = b1;
  dx = (b2.x - b1.x);
  dx2 = (b2.x - b1.x) * (b2.x - b1.x);
  this.dist = Math.sqrt(((b2.x - b1.x) * (b2.x - b1.x)) + ((b2.y - b1.y) * (b2.y - b1.y)));
  xDist = xDist + this.dist;
  this.curve = {
    rad: this.rad,
    dist: this.dist,
    cDist: xDist
  };
}

function bezierT(t, startX, startY, control1X, control1Y, control2X, control2Y, endX, endY) {
  //calculates the tangent line to a point in the curve; later used to calculate the degree of rotation at this point.
  this.mx = (3 * (1 - t) * (1 - t) * (control1X - startX)) + ((6 * (1 - t) * t) * (control2X - control1X)) + (3 * t * t * (endX - control2X));
  this.my = (3 * (1 - t) * (1 - t) * (control1Y - startY)) + ((6 * (1 - t) * t) * (control2Y - control1Y)) + (3 * t * t * (endY - control2Y));
}

function bezier2(t, startX, startY, control1X, control1Y, control2X, control2Y, endX, endY) {
  //Quadratic bezier curve plotter
  this.Bezier1 = new bezier1(t, startX, startY, control1X, control1Y, control2X, control2Y);
  this.Bezier2 = new bezier1(t, control1X, control1Y, control2X, control2Y, endX, endY);
  this.x = ((1 - t) * this.Bezier1.x) + (t * this.Bezier2.x);
  this.y = ((1 - t) * this.Bezier1.y) + (t * this.Bezier2.y);
  this.slope = new bezierT(t, startX, startY, control1X, control1Y, control2X, control2Y, endX, endY);

  this.point = {
    t: t,
    x: this.x,
    y: this.y,
    mX: this.slope.mx,
    mY: this.slope.my
  };
}

function bezier1(t, startX, startY, control1X, control1Y, control2X, control2Y) {
  //linear bezier curve plotter; used recursivly in the quadratic bezier curve calculation
  this.x = ((1 - t) * (1 - t) * startX) + (2 * (1 - t) * t * control1X) + (t * t * control2X);
  this.y = ((1 - t) * (1 - t) * startY) + (2 * (1 - t) * t * control1Y) + (t * t * control2Y);

}


//None of the below is necessary for the text2path.  
//Just nice to see the render speed and flexibility on the fly.
//Code below this borrowed from 
//@author Victoria Kirst
//Bezier Tool Canvas Commands Generator
//http://www.victoriakirst.com/beziertool/
function getMousePosition(e, obj) {
  debug = document.getElementById("point");
  var x;
  var y;
  x = e.pageX - $(canvas).offset().left;
  y = e.pageY - $(canvas).offset().top;

  z = new Point(x, y);
  debug.innerHTML = "x=" + x + ",y=" + y + ":" + gState.name
  return z;
}


function handleDown(e) {
  var pos = getMousePosition(e);
  switch (gState) {
    case Mode.kAdding:
      handleDownAdd(pos);
      break;
    case Mode.kSelecting:
      handleDownSelect(pos);
      break;
    case Mode.kRemoving:
      handleDownRemove(pos);
      break;
  }
}

function handleDownAdd(pos) {
  if (!gBezierPath)
    gBezierPath = new BezierPath(pos);
  else {
    // If this was probably a selection, change to
    // select/drag mode
    if (handleDownSelect(pos))
      return;
    gBezierPath.addPoint(pos);
  }
  render(ctx);
}
// Return true/false if dragging mode
function handleDownSelect(pos) {
  if (!gBezierPath)
    return false;
  var selected = gBezierPath.selectPoint(pos);
  if (selected) {
    gState = Mode.kDragging;
    canvas.addEventListener("mousemove", updateSelected, false);
    return true;
  }
  return false;
}

function handleDownRemove(pos) {
  if (!gBezierPath)
    return;
  var deleted = gBezierPath.deletePoint(pos);
  if (deleted)
    render(ctx);
}

function updateSelected(e) {
  var pos = getMousePosition(e);
  gBezierPath.updateSelected(pos);
  render(ctx);
}



function handleUp(e) {
  if (gState == Mode.kDragging) {
    canvas.removeEventListener("mousemove", updateSelected, false);
    gBezierPath.clearSelected();
    gState = Mode.kSelecting;
  }
}

function render(ct, text) {
  ct.clearRect(0, 0, WIDTH, HEIGHT);
 
  if (gBezierPath) {
    gBezierPath.draw(ctx);
    drawStack(ct, text);
  }
   curve.text = gBezierPath.toJSString();
   curve.value = gBezierPath.toJSString();
}

///////////////////////////////////////////////////////////////////////////////
// Classes
///////////////////////////////////////////////////////////////////////////////
function Point(newX, newY) {
  var my = this;
  var xVal = newX;
  var yVal = newY;

  var RADIUS = 3;
  var SELECT_RADIUS = RADIUS + 2;

  this.x = function() {
    return xVal;
  }

  this.y = function() {
    return yVal;
  }

  this.set = function(x, y) {
    xVal = x;
    yVal = y;
  };

  this.drawSquare = function(ctx) {
    ctx.fillRect(xVal - RADIUS, yVal - RADIUS, RADIUS * 2, RADIUS * 2);
  };

  this.computeSlope = function(pt) {
    return (pt.y() - yVal) / (pt.x() - xVal);
  };

  this.contains = function(pt) {
    var xInRange = pt.x() >= xVal - SELECT_RADIUS && pt.x() <= xVal + SELECT_RADIUS;
    var yInRange = pt.y() >= yVal - SELECT_RADIUS && pt.y() <= yVal + SELECT_RADIUS;
    return xInRange && yInRange;
  };

  this.offsetFrom = function(pt) {
    return {
      xDelta: pt.x() - xVal,
      yDelta: pt.y() - yVal,
    };
  };

  this.translate = function(xDelta, yDelta) {
    xVal += xDelta;
    yVal += yDelta;
  };
}

function ControlPoint(angle, magnitude, owner, isFirst) {
  var my = this;

  var _angle = angle;
  var _magnitude = magnitude;

  // Pointer to the line segment to which this belongs.
  var _owner = owner;
  var _isFirst = isFirst;

  this.setAngle = function(deg) {
    // don't update neighbor in risk of infinite loop!
    // TODO fixme fragile
    if (_angle != deg)
      _angle = deg;
  }

  this.origin = function origin() {
    var line = null;
    if (_isFirst)
      line = _owner.prev;
    else
      line = _owner;
    if (line)
      return new Point(line.pt.x(), line.pt.y());
    return null;
  }

  // Returns the Point at which the knob is located.
  this.asPoint = function() {
    return new Point(my.x(), my.y());
  };

  this.x = function() {
    return my.origin().x() + my.xDelta();
  }

  this.y = function() {
    return my.origin().y() + my.yDelta();
  }

  this.xDelta = function() {
    return _magnitude * Math.cos(_angle);
  }

  this.yDelta = function() {
    return _magnitude * Math.sin(_angle);
  }

  function computeMagnitudeAngleFromOffset(xDelta, yDelta) {
    _magnitude = Math.sqrt(Math.pow(xDelta, 2) + Math.pow(yDelta, 2));
    var tryAngle = Math.atan(yDelta / xDelta);
    if (!isNaN(tryAngle)) {
      _angle = tryAngle;
      if (xDelta < 0)
        _angle += Math.PI
    }
  }

  this.translate = function(xDelta, yDelta) {
    var newLoc = my.asPoint();
    newLoc.translate(xDelta, yDelta);
    var dist = my.origin().offsetFrom(newLoc);
    computeMagnitudeAngleFromOffset(dist.xDelta, dist.yDelta);
    if (my.__proto__.syncNeighbor)
      updateNeighbor();
  };

  function updateNeighbor() {
    var neighbor = null;
    if (_isFirst && _owner.prev)
      neighbor = _owner.prev.ctrlPt2;
    else if (!_isFirst && _owner.next)
      neighbor = _owner.next.ctrlPt1;
    if (neighbor)
      neighbor.setAngle(_angle + Math.PI);
  }

  this.contains = function(pt) {
    return my.asPoint().contains(pt);
  }

  this.offsetFrom = function(pt) {
    return my.asPoint().offsetFrom(pt);
  }

  this.draw = function(ctx) {
    ctx.save();
    ctx.fillStyle = 'gray';
    ctx.strokeStyle = 'gray';
    ctx.beginPath();
    var startPt = my.origin();
    var endPt = my.asPoint();
    ctx.moveTo(startPt.x(), startPt.y());
    ctx.lineTo(endPt.x(), endPt.y());

    if(!cBox.checked) {
        ctx.stroke();
        endPt.drawSquare(ctx);
    }   
    ctx.restore();
  }

  // When Constructed
  if (my.__proto__.syncNeighbor)
    updateNeighbor();
}

// Static variable dictacting if neighbors must be kept in sync.
ControlPoint.prototype.syncNeighbor = true;

function LineSegment(pt, prev) {
  var my = this;

  // Path point.
  this.pt;
  // Control point 1.
  this.ctrlPt1;
  // Control point 2.
  this.ctrlPt2;

  // Next LineSegment in path
  this.next;
  // Previous LineSegment in path
  this.prev;

  // Specific point on the LineSegment that is selected.
  this.selectedPoint;

  init();

  this.draw = function(ctx) {
     if(!cBox.checked) {
        my.pt.drawSquare(ctx);
        // Draw control points if we have them
        if (my.ctrlPt1)
        my.ctrlPt1.draw(ctx);
        if (my.ctrlPt2)
        my.ctrlPt2.draw(ctx);

        // If there are at least two points, draw curve.
        if (my.prev)
            drawCurve(ctx, my.prev.pt, my.pt, my.ctrlPt1, my.ctrlPt2);
     }     
  }

  this.toJSString = function() {
    //original code returned the HTML5 code block for the curve definition.  modified for text2path
    if (!my.prev)
    //return '  ctx.moveTo(' + Math.round(my.pt.x()) + ' + xoff, ' + Math.round(my.pt.y()) + ' + yoff);';
      return '' + Math.round(my.pt.x()) + ',' + Math.round(my.pt.y())
    else {
      var ctrlPt1x = 0;
      var ctrlPt1y = 0;
      var ctrlPt2x = 0;
      var ctlrPt2y = 0;
      var x = 0;
      var y = 0;

      if (my.ctrlPt1) {
        ctrlPt1x = Math.round(my.ctrlPt1.x());
        ctrlPt1y = Math.round(my.ctrlPt1.y());
      }

      if (my.ctrlPt2) {
        ctrlPt2x = Math.round(my.ctrlPt2.x());
        ctrlPt2y = Math.round(my.ctrlPt2.y());
      }
      if (my.pt) {
        x = Math.round(my.pt.x());
        y = Math.round(my.pt.y());
      }

      // return ',' + ctrlPt1x + ',' + ctrlPt1y + ',' + ctrlPt2x + ',' + ctrlPt2y + ',' + x + ',' + y
      return ctrlPt1x + ',' + ctrlPt1y + ',' + ctrlPt2x + ',' + ctrlPt2y + ',' + x + ',' + y
        /*
      return '  ctx.bezierCurveTo(' + ctrlPt1x + ' + xoff, ' +
              ctrlPt1y + ' + yoff, ' +
              ctrlPt2x + ' + xoff, ' +
              ctrlPt2y + ' + yoff, ' +
              x + ' + xoff, ' +
              y + ' + yoff);';
		*/
    }
  }
  this.toPoints = function() {
    //added for text2path
    if (!my.prev)
    //return '  ctx.moveTo(' + Math.round(my.pt.x()) + ' + xoff, ' + Math.round(my.pt.y()) + ' + yoff);';
      return {
      sX: my.pt.x(),
      sY: my.pt.y()
    };
    //return '' + Math.round(my.pt.x()) + ',' + Math.round(my.pt.y())
    else {
      var ctrlPt1x = 0;
      var ctrlPt1y = 0;
      var ctrlPt2x = 0;
      var ctlrPt2y = 0;
      var x = 0;
      var y = 0;

      if (my.ctrlPt1) {
        ctrlPt1x = Math.round(my.ctrlPt1.x());
        ctrlPt1y = Math.round(my.ctrlPt1.y());
      }

      if (my.ctrlPt2) {
        ctrlPt2x = Math.round(my.ctrlPt2.x());
        ctrlPt2y = Math.round(my.ctrlPt2.y());
      }
      if (my.pt) {
        x = Math.round(my.pt.x());
        y = Math.round(my.pt.y());
      }

      //return ',' + ctrlPt1x + ',' + ctrlPt1y + ',' + ctrlPt2x + ',' + ctrlPt2y + ',' + x + ',' + y
      return {
        c1x: ctrlPt1x,
        c1y: ctrlPt1y,
        c2x: ctrlPt2x,
        c2y: ctrlPt2y,
        eX: x,
        eY: y
      }
      /*
      return '  ctx.bezierCurveTo(' + ctrlPt1x + ' + xoff, ' +
              ctrlPt1y + ' + yoff, ' +
              ctrlPt2x + ' + xoff, ' +
              ctrlPt2y + ' + yoff, ' +
              x + ' + xoff, ' +
              y + ' + yoff);';
		*/
    }
  }


  this.findInLineSegment = function(pos) {
    if (my.pathPointIntersects(pos)) {
      my.selectedPoint = my.pt;
      return true;
    } else if (my.ctrlPt1 && my.ctrlPt1.contains(pos)) {
      my.selectedPoint = my.ctrlPt1;
      return true;
    } else if (my.ctrlPt2 && my.ctrlPt2.contains(pos)) {
      my.selectedPoint = my.ctrlPt2;
      return true;
    }
    return false;
  }

  this.pathPointIntersects = function(pos) {
    return my.pt && my.pt.contains(pos);
  }

  this.moveTo = function(pos) {
    var dist = my.selectedPoint.offsetFrom(pos);
    my.selectedPoint.translate(dist.xDelta, dist.yDelta);
  };


  function drawCurve(ctx, startPt, endPt, ctrlPt1, ctrlPt2) {
    ctx.save();
    ctx.fillStyle = 'black';
    ctx.strokeStyle = 'black';
    ctx.beginPath();
    ctx.moveTo(startPt.x(), startPt.y());
    ctx.bezierCurveTo(ctrlPt1.x(), ctrlPt1.y(), ctrlPt2.x(), ctrlPt2.y(), endPt.x(), endPt.y());
    
    if(!cBox.checked) {
        ctx.stroke();
    }
   
    ctx.restore();
  }

  function init() {
    my.pt = pt;
    my.prev = prev;

    if (my.prev) {

      // Make initial line straight and with controls of length 15.
      var slope = my.pt.computeSlope(my.prev.pt);
      var angle = Math.atan(slope);

      if (my.prev.pt.x() > my.pt.x())
        angle *= -1;

      my.ctrlPt1 = new ControlPoint(angle + Math.PI - 90, 75, my, true);
      my.ctrlPt2 = new ControlPoint(90, 75, my, false);
    }
  };
}


function BezierPath(startPoint) {
  var my = this;
  // Beginning of BezierPath linked list.
  this.head = null;
  // End of BezierPath linked list
  this.tail = null;
  // Reference to selected LineSegment
  var selectedSegment;

  this.addPoint = function(pt) {
    var newPt = new LineSegment(pt, my.tail);
    if (my.tail == null) {
      my.tail = newPt;
      my.head = newPt;
    } else {
      my.tail.next = newPt;
      my.tail = my.tail.next;
    }
    return newPt;
  };

  // Must call after add point, since init uses
  // addPoint
  // TODO: this is a little gross
  init();

  this.draw = function(ctx) {
    if (my.head == null)
      return;

    var current = my.head;
    while (current != null) {
      current.draw(ctx);
      current = current.next;
    }
  };

  // returns true if point selected
  this.selectPoint = function(pos) {
    var current = my.head;
    while (current != null) {
      if (current.findInLineSegment(pos)) {
        selectedSegment = current;
        return true;
      }
      current = current.next;
    }
    return false;
  }

  // returns true if point deleted
  this.deletePoint = function(pos) {
    var current = my.head;
    while (current != null) {
      if (current.pathPointIntersects(pos)) {
        var toDelete = current;
        var leftNeighbor = current.prev;
        var rightNeighbor = current.next;

        // Middle case
        if (leftNeighbor && rightNeighbor) {
          leftNeighbor.next = rightNeighbor;
          rightNeighbor.prev = leftNeighbor
        }
        // HEAD CASE
        else if (!leftNeighbor) {
          my.head = rightNeighbor;
          if (my.head) {
            rightNeighbor.ctrlPt1 = null;
            rightNeighbor.ctrlPt2 = null;
            my.head.prev = null;
          } else
            my.tail = null;
        }
        // TAIL CASE
        else if (!rightNeighbor) {
          my.tail = leftNeighbor;
          if (my.tail)
            my.tail.next = null;
          else
            my.head = null;
        }
        return true;
      }
      current = current.next;
    }
    return false;
  }

  this.clearSelected = function() {
    selectedSegment = null;
  }

  this.updateSelected = function(pos) {
    selectedSegment.moveTo(pos);
  }

  this.toRibbon = function() {
    //added for text2path 
    var ribbon;
    var current = my.head;
    if (current != null)
      start = current.toPoints();
    current = current.next;
    if (current != null) {
      def = current.toPoints();
      ribbon = {
        maxChar: 50,
        startX: start.sX,
        startY: start.sY,
        control1X: def.c1x,
        control1Y: def.c1y,
        control2X: def.c2x,
        control2Y: def.c2y,
        endX: def.eX,
        endY: def.eY
      };
    }
    return ribbon;
  }
  this.toJSString = function() {

    var myString = [];
    /*
	  ['function drawShape(ctx, xoff, yoff) {',
       '  ctx.beginPath();',
      ];
	  */

    var current = my.head;
    while (current != null) {
      myString.push(current.toJSString());
      current = current.next;
    }
    //myString.push('  ctx.stroke();');
    //myString.push('}');
    return myString.join(',');
  }

  function init() {
    my.addPoint(startPoint);
  };
}
