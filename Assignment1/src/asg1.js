// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =   `
   attribute vec4 a_Position;
   uniform float u_Size;
   void main() {
     gl_Position = a_Position;
     //gl_PointSize = 10.0;
     gl_PointSize = u_Size;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
   precision mediump float;
   uniform vec4 u_FragColor;
   void main() {
    gl_FragColor = u_FragColor;
   }`

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;
const IMAGE = 3;

// Global Variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;

function setUpWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  // gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true})
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }

}

let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_selectedSegments = 10;

function addActionsForHtmlUI() {
    //Button Event Shape Types
    document.getElementById('green').onclick = () => {
        g_selectedColor = [0.0, 1.0, 0.0, 1.0];
    };
    document.getElementById('red').onclick = () => {
        g_selectedColor = [1.0, 0.0, 0.0, 1.0];
    };
    document.getElementById('clearButton').onclick = () => {
        g_shapesList = [];
        renderAllShapes();
    }

    document.getElementById('pointButton').onclick = () => {
        g_selectedType = POINT;
    };
    document.getElementById('triButton').onclick = () => {
        g_selectedType = TRIANGLE;
    };
    document.getElementById('circleButton').onclick = () => {
        g_selectedType = CIRCLE;
    }
    document.getElementById('drawImage').onclick = () => {
        renderImage();
    }

    //Slider Events
    document.getElementById('redSlide').addEventListener('mouseup', function() { g_selectedColor[0] = this.value/100; });
    document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value/100; });
    document.getElementById('blueSlide').addEventListener('mouseup', function() { g_selectedColor[2] = this.value/100; });

    document.getElementById('sizeSlide').addEventListener('mouseup', function() { g_selectedSize = this.value; });
    document.getElementById('segmentSlider').addEventListener('mouseup', function() { g_selectedSegments = this.value;});
}   

function main() {
  //set up canvas and gl values
  setUpWebGL();
  //Set up GLSL shader programs and connect GLSL variables
  connectVariablesToGLSL();
  //set up actions for the html ui elements
  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = (ev) => {
    if (ev.buttons == 1){
        click(ev)
    };
  };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}



var g_shapesList = [];


//var g_points = [];  // The array for the position of a mouse press
//var g_colors = [];  // The array to store the color of a point
//var g_sizes = []; // The array to store the size of a point

function click(ev) {

  let [x, y] = convertCoordinatesEventToGL(ev);

  let point;
  if (g_selectedType === POINT) {
    point = new Point();
  } else if (g_selectedType === TRIANGLE) {
    point = new Triangle();
  } else {
    point = new Circle();
    point.segments = g_selectedSegments;
  }

  point.position = [x, y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  g_shapesList.push(point);

  // Store the coordinates to g_points array
  //g_points.push([x, y]);

  //use slice so it passes in actual value and not a reference to the array
  //g_colors.push(g_selectedColor.slice());

  //g_sizes.push(g_selectedSize);



/*
  if (x >= 0.0 && y >= 0.0) {      // First quadrant
    g_colors.push([1.0, 0.0, 0.0, 1.0]);  // Red
  } else if (x < 0.0 && y < 0.0) { // Third quadrant
    g_colors.push([0.0, 1.0, 0.0, 1.0]);  // Green
  } else {                         // Others
    g_colors.push([1.0, 1.0, 1.0, 1.0]);  // White
  }
*/

  renderAllShapes();
}

function convertCoordinatesEventToGL(ev) {
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();
  
    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
    return ([x, y])
}

function renderAllShapes() {


  var startTime = performance.now();

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  //var len = g_points.length;
  var len = g_shapesList.length;
  for(var i = 0; i < len; i++) {
    g_shapesList[i].render();
  }

  var duration = performance.now() - startTime;
  sendTextToHTML("numdot: " + len + " ms: " + Math.floor(duration) + " fps: " + Math.floor(10000 / duration), 'numdot');

}

function sendTextToHTML(text, htmlID) { 
    var htmlElm = document.getElementById(htmlID);
    if (!htmlElm) {
        console.log("Failed to get " + htmlID + " from HTML");
        return;
    }
    htmlElm.innerHTML = text;
}

/* ================================================================
   generateRobotTriangles  –  30‑triangle blue robot
   with yellow hands and a yellow “30” on its chest
   ================================================================ */
   function generateRobotTriangles() {
    const tris = [];
  
    /* ---------- colour palette ----------------------------------- */
    const blue      = [0.00, 0.00, 1.00, 1];   // main metal (was grey)
    const darkGrey  = [0.35, 0.35, 0.35, 1];   // outlines / feet
    const yellow    = [1.00, 1.00, 0.00, 1];   // hands + digits
    const eyeWhite  = [0.97, 0.97, 0.97, 1];
    const eyeBlack  = [0.05, 0.05, 0.05, 1];
  
    const SIZE = 40; // value for u_Size – arbitrary here
  
    /* helper: build one Triangle wrapper */
    function makeTri(v, color) {
      const t = new Triangle();
      t.color = color.slice();
      t.size  = SIZE;
      t.render = function () {
        gl.uniform4f(u_FragColor, ...this.color);
        gl.uniform1f(u_Size, this.size);
        drawTriangle(v);
      };
      return t;
    }
  
    /* helper: build a filled rectangle (2 tris) */
    function makeRect(x0, y0, x1, y1, color) {
      tris.push(makeTri([x0, y0,  x1, y0,  x1, y1], color));
      tris.push(makeTri([x0, y0,  x1, y1,  x0, y1], color));
    }
  
    /* ---------- HEAD (2) ----------------------------------------- */
    makeRect(-0.35, 0.25,  0.35, 0.55, blue);
  
    /* ---------- ANTENNA (2) -------------------------------------- */
    makeRect(-0.02, 0.55,  0.02, 0.75, blue);
  
    /* ---------- EYES (8) ----------------------------------------- */
    const eyeSize = 0.07;
    [-0.15, 0.15].forEach(cx => {
      makeRect(cx - eyeSize, 0.45 - eyeSize,
               cx + eyeSize, 0.45 + eyeSize, eyeWhite);          // sclera
      const p = eyeSize * 0.45;
      makeRect(cx - p, 0.45 - p,  cx + p, 0.45 + p, eyeBlack);    // pupil
    });
  
    /* ---------- MOUTH (2) ---------------------------------------- */
    makeRect(-0.18, 0.25,  0.18, 0.32, darkGrey);
  
    /* ---------- BODY (2) ----------------------------------------- */
    makeRect(-0.40, -0.20,  0.40, 0.25, blue);
  
    /* ---------- ARMS (4)  (still blue) --------------------------- */
    makeRect(-0.55, 0.00, -0.40, 0.25, blue); // left upper
    makeRect( 0.40, 0.00,  0.55, 0.25, blue); // right upper
  
    /* ---------- HANDS (4)  – now YELLOW -------------------------- */
    makeRect(-0.55, -0.30, -0.40, 0.00, yellow); // left hand
    makeRect( 0.40, -0.30,  0.55, 0.00, yellow); // right hand
  
    /* ---------- LEGS (4) ----------------------------------------- */
    const legW = 0.20, legH = 0.35;
    [-0.25, 0.05].forEach(x => makeRect(x, -0.55 + legH, x + legW, -0.20, blue));
  
  
    /* ---------- FEET (4) ----------------------------------------- */
    const footH   = 0.15;
    const border  = 0.02;                    // thickness of the white outline
    const white   = [1, 1, 1, 1];
    const black   = [0, 0, 0, 1];

    [-0.25, 0.05].forEach(x => {
    const x0 = x,           x1 = x + legW;      // original foot width (0.20)
    const y0 = -0.55,       y1 = y0 - footH;    // top / bottom of foot

    /* outer rectangle → white “frame” (2 triangles) */
    makeRect(x0, y0, x1, y1, white);

    /* inner rectangle → black sole, inset on all sides by `border` */
    makeRect(
        x0 + border,          // left
        y0 - border,          // top moves *down* (y is negative)
        x1 - border,          // right
        y1 + border,          // bottom moves *up*
        black
    );
    });
  
    /* ---------- YELLOW “30” (6 rectangles → 12 tris) ------------- */
    // digit 3 (left) – three horizontal bars + two right‑side connectors
    makeRect(-0.28, 0.13, -0.08, 0.18, yellow); // top bar
    makeRect(-0.28, 0.00, -0.08, 0.05, yellow); // middle bar
    makeRect(-0.28,-0.13, -0.08,-0.08, yellow); // bottom bar
    makeRect(-0.08, 0.05,-0.03, 0.13, yellow);  // upper right stem
    makeRect(-0.08,-0.08,-0.03, 0.00, yellow);  // lower right stem
  
    // digit 0 (right) – rectangle outline made of four bars
    makeRect( 0.05, 0.13, 0.25, 0.18, yellow);  // top
    makeRect( 0.05,-0.13, 0.25,-0.08, yellow);  // bottom
    makeRect( 0.05,-0.08, 0.10, 0.13, yellow);  // left side
    makeRect( 0.20,-0.08, 0.25, 0.13, yellow);  // right side
  
    return tris; // total = original 30 + “30” bars (12) – hands recoloured
  }
  

function renderImage() {
    //clear canvas
    g_shapesList = [];
    renderAllShapes();
    console.log("RENDER IMAGE!!!!");

    generateRobotTriangles().forEach(
        t => g_shapesList.push(t)
    );

    //redraw everything
     renderAllShapes();

}
