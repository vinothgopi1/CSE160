// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =   `
   attribute vec4 a_Position;
   uniform mat4 u_ModelMatrix;
   uniform mat4 u_GlobalRotateMatrix;
   void main() {
     gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
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
let isDragging   = false;
let lastMouseX   = 0;
let lastMouseY   = 0;
let g_rotX       = 0;   // tilt up/down
let g_rotY       = 0;   // spin left/right

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

  gl.enable(gl.DEPTH_TEST);
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

  /*
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }
  */

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log("Failed to get the storage location of u_ModelMatrix");
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log("Failed to get the storage location of u_GlobalRotateMatrix");
    return;
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

}

let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_selectedSegments = 10;
let g_rainbowMode = false;
let rainbowHue = 0;
let g_globalAngle = 0;
let g_yellowAngle = 0;
let g_magentaAngle = 0;
let g_armsAngle = 0
let g_yellowAnimation = false;
let g_magentaAnimation = false;


function addActionsForHtmlUI() {
    //Button Event Shape Types
    /*
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
    document.getElementById('rainbow').onclick = () => {
        g_rainbowMode = true;
    }
    document.getElementById('off').onclick = () => {
        g_rainbowMode = false; 
        g_selectedColor = [1.0, 1.0, 1.0, 1.0];
    }
    */

    //Slider Events
    /*
    document.getElementById('redSlide').addEventListener('mouseup', function() { g_selectedColor[0] = this.value/100; });
    document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value/100; });
    document.getElementById('blueSlide').addEventListener('mouseup', function() { g_selectedColor[2] = this.value/100; });
    */

    document.getElementById('yellowSlide').addEventListener('mousemove', function() { g_yellowAngle = this.value; renderAllShapes(); })
    document.getElementById('magentaSlider').addEventListener('mousemove', function() { g_magentaAngle = this.value; renderAllShapes(); })
    document.getElementById('armsSlide').addEventListener('mousemove', function() { g_armsAngle = this.value; renderAllShapes();})



    document.getElementById('animationYellowOnButton').onclick = () => {
      g_yellowAnimation = true;
    }

    document.getElementById('animationYellowOffButton').onclick = () => {
      g_yellowAnimation = false;
    }

    document.getElementById('animationMagentaOnButton').onclick = () => {
      g_magentaAnimation = true;
    }

    document.getElementById('animationMagentaOffButton').onclick = () => {
      g_magentaAnimation = false;
    }

    
    document.getElementById('angleSlide').addEventListener('mousemove', function() { g_globalAngle = Number(this.value); renderAllShapes(); });
   // document.getElementById('segmentSlider').addEventListener('mouseup', function() { g_selectedSegments = this.value;});
}   

function main() {
  //set up canvas and gl values
  setUpWebGL();
  //Set up GLSL shader programs and connect GLSL variables
  connectVariablesToGLSL();
  //set up actions for the html ui elements
  addActionsForHtmlUI();

  /*
  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = (ev) => {
    if (ev.buttons == 1){
        click(ev)
    };
  };
  */

  canvas.addEventListener('mousedown', (e) => {
    isDragging  = true;
    lastMouseX  = e.clientX;
    lastMouseY  = e.clientY;
  });
  
  canvas.addEventListener('mouseup', () => {
    isDragging = false;
  });
  canvas.addEventListener('mouseleave', () => {
    isDragging = false;
  });
  
  canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMouseX;
    const dy = e.clientY - lastMouseY;
    // adjust these multipliers to taste
    g_rotY += dx * 0.5;   // horizontal movement → Y‑axis rotation
    g_rotX += dy * 0.5;   // vertical movement   → X‑axis rotation
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    renderAllShapes();
  });

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  //gl.clear(gl.COLOR_BUFFER_BIT);

  //renderAllShapes();

  requestAnimationFrame(tick);
}

var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;

function tick() {

  g_seconds = performance.now() / 1000.0 - g_startTime;
  console.log(g_seconds);

  updateAnimationAngles();

  renderAllShapes();

  requestAnimationFrame(tick);

}



var g_shapesList = [];


//var g_points = [];  // The array for the position of a mouse press
//var g_colors = [];  // The array to store the color of a point
//var g_sizes = []; // The array to store the size of a point

function click(ev) {

  let [x, y] = convertCoordinatesEventToGL(ev);

  // If rainbow mode is on, update the color
  if (g_rainbowMode) {
    // Create a color using the current hue, full saturation, and medium lightness.
    g_selectedColor = hslToRgb(rainbowHue, 1.0, 0.5);
    // Increment hue for the next shape. A small increment ensures a smooth color transition.
    rainbowHue += 0.01;
    if (rainbowHue > 1) rainbowHue -= 1;  // Keep hue within [0,1]
  }

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

function updateAnimationAngles() {
  if (g_yellowAnimation) {
    g_yellowAngle = (45 * Math.sin(g_seconds));
  }

  if (g_magentaAnimation) {
    g_magentaAngle = (45 * Math.sin(3*g_seconds));
  }

}

function renderAllShapes() {


  var startTime = performance.now();

  //var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  //gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  const totalYaw   = g_globalAngle + g_rotY;
  const globalRotMat = new Matrix4()
  .rotate(g_rotX,   1, 0, 0)   // drag pitch
  .rotate(totalYaw,     0, 1, 0);  // slider yaw + drag yaw
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  //gl.clear(gl.COLOR_BUFFER_BIT);

  // test triangle
  //drawTriangle3D([-1.0, 0.0, 0.0,   -0.5, -1.0, 0.0,   0.0, 0.0, 0.0]);

  /*
  //var len = g_points.length;
  var len = g_shapesList.length;
  for(var i = 0; i < len; i++) {
    g_shapesList[i].render();
  }
  */

  //base
  var body = new Cube();
  body.color = [1.0, 0.0, 0.0, 1.0];
  body.matrix.translate(-0.25, -0.75, 0.0);
  body.matrix.rotate(-5, 1, 0, 0);
  body.matrix.scale(0.5, 0.3, 0.5);
  body.render();

  //Body
  var leftArm = new Cube();
  leftArm.color = [1, 1, 0, 1];
  leftArm.matrix.setTranslate(0.0, -0.5, 0.0);
  leftArm.matrix.rotate(-5, 1, 0, 0);
  leftArm.matrix.rotate(-g_yellowAngle, 0, 0, 1);
  /*
  if (g_yellowAnimation) {
    leftArm.matrix.rotate(45*Math.sin(g_seconds), 0, 0, 1);
  } else {
    leftArm.matrix.rotate(-g_yellowAngle, 0, 0, 1);
  }
  */
  var yellowCoordinatesMat = new Matrix4(leftArm.matrix);
  leftArm.matrix.scale(0.25, 0.7, 0.5);
  leftArm.matrix.translate(-0.5, 0, 0);
  leftArm.render();

  // Head
  var box = new Cube();
  box.color = [1,0,1,1];
  box.matrix = yellowCoordinatesMat;
  box.matrix.translate(0, 0.65, 0);
  box.matrix.rotate(g_magentaAngle, 0, 0, 1);
  box.matrix.scale(0.3, 0.3, 0.3);
  box.matrix.translate(-0.5, 0, -0.001);
  //box.matrix.translate(-0.1, 0.1, 0, 0);
  //box.matrix.rotate(-30, 1, 0, 0)
  //box.matrix.scale(0.2, 0.4, 0.2);
  box.render();


// how far out from the center of the yellow block
const armOffsetX = 0.9;
// how far down so they sit just under the pink head
const armOffsetY = -0.5;  
// how big the arms are
const armScaleX = 1.2;
const armScaleY = 0.2;
const armScaleZ = 0.2;

// ––– LEFT ARM –––
var armLeft = new Cube();
armLeft.color = [0.0, 1.0, 0.0, 1.0];
armLeft.matrix = new Matrix4(yellowCoordinatesMat);
// push left and down
armLeft.matrix.rotate(-g_armsAngle, 0, 0, 1);
armLeft.matrix.translate(-armOffsetX - 0.2, armOffsetY, 0);
//armLeft.matrix.rotate(-g_armsAngle, 0, 0, 1);
// scale into a long “arm”
armLeft.matrix.scale(armScaleX, armScaleY, armScaleZ);
armLeft.render();

// ––– RIGHT ARM –––
var armRight = new Cube();
armRight.color = [0.0, 1.0, 0.0, 1.0];
armRight.matrix = new Matrix4(yellowCoordinatesMat);
// push right and down
armRight.matrix.rotate(g_armsAngle, 0, 0, 1);
armRight.matrix.translate(+armOffsetX, armOffsetY, 0);
//armRight.matrix.rotate(g_armsAngle, 0, 0, 1);
armRight.matrix.scale(armScaleX, armScaleY, armScaleZ);
armRight.render();




  
  




  var duration = performance.now() - startTime;
  sendTextToHTML( " ms: " + Math.floor(duration) + " fps: " + Math.floor(10000 / duration), 'numdot');

}

function sendTextToHTML(text, htmlID) { 
    var htmlElm = document.getElementById(htmlID);
    if (!htmlElm) {
        console.log("Failed to get " + htmlID + " from HTML");
        return;
    }
    htmlElm.innerHTML = text;
}




function generateRobotTriangles() {
  const tris = [];

  /* ---------- colour palette ----------------------------------- */
  const blue      = [0.00, 0.00, 1.00, 1.0];   // main metal (was grey)
  const darkGrey  = [0.35, 0.35, 0.35, 1.0];   // outlines / feet
  const yellow    = [1.00, 1.00, 0.00, 1.0];   // hands + digits
  const eyeWhite  = [0.97, 0.97, 0.97, 1.0];
  const eyeBlack  = [0.05, 0.05, 0.05, 1.0];

  const SIZE = 40; // value for u_Size – arbitrary here

  // Helper: create one Triangle instance with given vertices and color.
  // Here we add a custom `vertices` property, and override render() so that it passes our vertices to drawTriangle.
  function makeTri(v, color) {
      const t = new Triangle();
      t.vertices = v;               // store custom vertices
      t.color = color.slice();
      t.size  = SIZE;               // for consistency; you can adjust this as needed
      t.render = function () {
          gl.uniform4f(u_FragColor, ...this.color);
          gl.uniform1f(u_Size, this.size);
          // Call drawTriangle with our custom vertices array.
          drawTriangle(this.vertices);
      };
      return t;
  }

  // Helper: build a rectangle using two triangles.
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
      // sclera
      makeRect(cx - eyeSize, 0.45 - eyeSize,
               cx + eyeSize, 0.45 + eyeSize, eyeWhite);
      // pupil
      const p = eyeSize * 0.45;
      makeRect(cx - p, 0.45 - p,  cx + p, 0.45 + p, eyeBlack);
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
  [-0.25, 0.05].forEach(x => {
      makeRect(x, -0.55 + legH, x + legW, -0.20, blue);
  });

  /* ---------- FEET (4) ----------------------------------------- */
  const footH  = 0.15;
  const border = 0.02;
  const white  = [1, 1, 1, 1];
  const black  = [0, 0, 0, 1];

  [-0.25, 0.05].forEach(x => {
      const x0 = x, x1 = x + legW;
      const y0 = -0.55, y1 = y0 - footH;

      // Outer rectangle → white "frame" (2 triangles)
      makeRect(x0, y0, x1, y1, white);

      // Inner rectangle → black sole, inset on all sides by `border`
      makeRect(x0 + border, y0 - border, x1 - border, y1 + border, black);
  });

  /* ---------- YELLOW “30” (12 triangles total) ------------- */
  // Digit 3 (left): three horizontal bars + two right‑side connectors
  makeRect(-0.28, 0.13, -0.08, 0.18, yellow); // top bar
  makeRect(-0.28, 0.00, -0.08, 0.05, yellow); // middle bar
  makeRect(-0.28, -0.13, -0.08, -0.08, yellow); // bottom bar
  makeRect(-0.08, 0.05, -0.03, 0.13, yellow);  // upper right stem
  makeRect(-0.08, -0.08, -0.03, 0.00, yellow);  // lower right stem

  // Digit 0 (right): rectangle outline made of four bars
  makeRect( 0.05, 0.13,  0.25, 0.18, yellow);  // top
  makeRect( 0.05, -0.13,  0.25, -0.08, yellow);  // bottom
  makeRect( 0.05, -0.08,  0.10, 0.13, yellow);  // left side
  makeRect( 0.20, -0.08,  0.25, 0.13, yellow);  // right side

  return tris;
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

//converts HSL values to RGBA
//utilized online resources to figure out how to create this function
function hslToRgb(h, s, l) {
  let r, g, b;
  if (s === 0) {
    r = g = b = l;  // Achromatic (grey)
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return [r, g, b, 1.0];
}