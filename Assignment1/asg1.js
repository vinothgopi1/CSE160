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

// Global Variables
let canvas;
let gl;
let a_Position;
let u_FragColor;

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

    //Slider Events
    document.getElementById('redSlide').addEventListener('mouseup', function() { g_selectedColor[0] = this.value/100; });
    document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value/100; });
    document.getElementById('blueSlide').addEventListener('mouseup', function() { g_selectedColor[2] = this.value/100; });

    document.getElementById('sizeSlide').addEventListener('mouseup', function() { g_selectedSize = this.value; });
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

  let point = new Point();
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
