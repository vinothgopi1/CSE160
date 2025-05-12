// Global Variables
var gl;
var canvas;
var a_Position;
var a_UV;
var u_FragColor;
var u_Size; // Note: u_Size is declared but not retrieved via getUniformLocation in your original connectVariablesToGLSL
var u_ModelMatrix;
var u_ProjectionMatrix;
var u_ViewMatrix;
var u_GlobalRotateMatrix;
var u_Sampler0;
var u_Sampler1;
var u_whichTexture;
var u_Clicked;
var g_camera;
let isDragging = false; // This was in your original file

var isRotating = false;
var lastMouseX = null;
var lastMouseY = null;

// Add these lines to declare cubePositionBuffer and cubeUVBuffer globally
var cubePositionBuffer;
var cubeUVBuffer;

// UI (These were in your original file)
var gAnimalGlobalRotation = 0; // Camera
var g_jointAngle = 0; // Joint 1
var head_animation = 0;
var g_jointAngle2 = 0; // Joint 2
var g_Animation = false; // Joint 2 // Renamed from g_Animation in original to avoid conflict if it was a typo for g_AnimationOn or similar

// Animation (These were in your original file, g_startTime re-init in main for precision)
var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

var g_lastFrameTime = 0;        // Timestamp of the last frame processed
var g_frameCount = 0;           // How many frames we've counted for the current FPS calculation
var g_fpsAccumulator = 0;       // Accumulates time for FPS calculation
var g_fpsDisplayInterval = 0.5; // How often to update the FPS display (e.g., every 0.5 seconds)

var VSHADER_SOURCE =`
precision mediump float;
attribute vec4 a_Position;
attribute vec2 a_UV;
varying vec2 v_UV;
uniform mat4 u_ModelMatrix;
uniform mat4 u_GlobalRotateMatrix;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ProjectionMatrix;
uniform bool u_Clicked; // Mouse is pressed
void main() {
    if(u_Clicked){
        vec4(1,1,1,1);
    }
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
}`

var FSHADER_SOURCE =`
precision mediump float;
varying vec2 v_UV;
uniform vec4 u_FragColor;
uniform sampler2D u_Sampler0;
uniform sampler2D u_Sampler1;
uniform int u_whichTexture;
void main() {
    if(u_whichTexture == -2){
        gl_FragColor = u_FragColor;                  // Use color
    } else if (u_whichTexture == -1){
        gl_FragColor = vec4(v_UV, 1.0, 1.0);         // Use UV debug color
    } else if(u_whichTexture == 0){
        gl_FragColor = texture2D(u_Sampler0, v_UV);  // Use texture0
    } else if(u_whichTexture == 1){
        gl_FragColor = texture2D(u_Sampler1, v_UV);  // Use texture1
    } else {
        gl_FragColor = vec4(1,.2,.2,1);              // Error, Red
    }
}`

function deleteBlockInFront() {
  const origin = new Vector3(g_camera.eye.elements);
  const dir    = new Vector3(g_camera.at.elements)
                    .sub(g_camera.eye)
                    .normalize();

  const maxDistance = 5;
  const stepSize    = 0.1;

  for (let t = 0; t <= maxDistance; t += stepSize) {
    // current point in world space
    const hit = new Vector3(dir.elements).mul(t).add(origin);

    // map to user grid indices
    const jUser = Math.floor(hit.elements[0] / cellSize + gridCols/2);
    const iUser = Math.floor(hit.elements[2] / cellSize + gridRows/2);

    // if we’re inside the user grid and that cell has blocks, delete the top one
    if (
      iUser >= 0 && iUser < gridRows &&
      jUser >= 0 && jUser < gridCols
    ) {
      const cell = g_map[iUser][jUser];
      if (cell.height > 0) {
        cell.height--;
        console.log(`Deleted user block at [${iUser},${jUser}], new height ${cell.height}`);
        renderScene();
        return;
      }
    }

    // otherwise map to environment grid
    const jEnv = Math.floor(hit.elements[0] / cellSize + wallMapSize/2);
    const iEnv = Math.floor(hit.elements[2] / cellSize + wallMapSize/2);

    if (
      iEnv >= 0 && iEnv < wallMapSize &&
      jEnv >= 0 && jEnv < wallMapSize
    ) {
      if (wallMap32[iEnv][jEnv] > 0) {
        wallMap32[iEnv][jEnv]--;
        console.log(`Deleted env wall at [${iEnv},${jEnv}], new height ${wallMap32[iEnv][jEnv]}`);
        renderScene();
        return;
      }
    }
  }

  console.log("No block found in front to delete.");
}

/*

function deleteBlockInFront() {
  const origin = new Vector3(g_camera.eye.elements);
  const dir    = new Vector3(g_camera.at.elements)
                    .sub(g_camera.eye)
                    .normalize();

  const maxDistance = 5;
  const stepSize    = 0.1;

  for (let t = 0; t <= maxDistance; t += stepSize) {
    // 1) march the ray
    const hit = new Vector3(dir.elements).mul(t).add(origin);

    // 2) map to your user grid coords
    const jUser = Math.floor(hit.elements[0] / cellSize + gridCols/2);
    const iUser = Math.floor(hit.elements[2] / cellSize + gridRows/2);

    // if it’s inside your user grid and there’s a block, delete it
    if (
      iUser >= 0 && iUser < gridRows &&
      jUser >= 0 && jUser < gridCols &&
      g_map[iUser][jUser] > 0
    ) {
      g_map[iUser][jUser]--;
      console.log(`Deleted user block at [${iUser},${jUser}], new height ${g_map[iUser][jUser]}`);
      renderScene();
      return;
    }

    // 3) otherwise map to the environment grid coords
    const jEnv = Math.floor(hit.elements[0] / cellSize + wallMapSize/2);
    const iEnv = Math.floor(hit.elements[2] / cellSize + wallMapSize/2);

    // if it’s inside your wallMap32 and there’s a wall, delete it
    if (
      iEnv >= 0 && iEnv < wallMapSize &&
      jEnv >= 0 && jEnv < wallMapSize &&
      wallMap32[iEnv][jEnv] > 0
    ) {
      wallMap32[iEnv][jEnv]--;
      console.log(`Deleted env wall at [${iEnv},${jEnv}], new height ${wallMap32[iEnv][jEnv]}`);
      renderScene();
      return;
    }
  }

  console.log("No block found in front within range.");
}
*/

function addActionsForHtmlUI(){
    // This function was empty in your original code
}

function setupWebGL(){
    canvas = document.getElementById('webgl');
    if (!canvas) {
        console.log('Failed to retrieve the <canvas> element');
        return;
    }
    gl = getWebGLContext(canvas);
    if(!gl){
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
    gl.enable(gl.DEPTH_TEST);
}

// Compile Shader Programs and connect js to GLSL =================
function connectVariablesToGLSL(){
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) { 
        console.log('Failed to get a_Position'); 
        return; 
    }
    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_UV < 0) { console.log('Failed to get a_UV'); return; }
    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if (!u_whichTexture) { console.log('Failed to get u_whichTexture'); return; }
    u_Clicked = gl.getUniformLocation(gl.program, 'u_Clicked');
    if (!u_Clicked) { console.log('Failed to get u_Clicked'); return; }
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) { console.log('Failed to get u_FragColor'); return; }
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) { console.log('Failed to get u_ModelMatrix'); return; }
    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) { console.log('Failed to get u_GlobalRotateMatrix'); return; }
    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix) { console.log('Failed to get u_ViewMatrix'); return; }
    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (!u_ProjectionMatrix) { console.log('Failed to get u_ProjectionMatrix'); return; }
    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    if (!u_Sampler0) { console.log('Failed to get u_Sampler0'); return false; } // Should probably be 'return;'
    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    if (!u_Sampler1) { console.log('Failed to get u_Sampler1'); return false; } // Should probably be 'return;'

    // u_Size was declared globally but not retrieved. If needed, add:
    // u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    // if (u_Size < 0) { console.log('Failed to get u_Size'); return; }


    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

// Texture Stuff (Copied from your original asg3.js) ===================================
function initTextures() {
    var image = new Image();
    var image1 = new Image();
    if (!image) { console.log('Failed to create the image object'); return false; }
    if (!image1) { console.log('Failed to create the image1 object'); return false; }
    image.onload = function(){ sendTextureToTEXTURE0(image); };
    image1.onload = function(){ sendTextureToTEXTURE1(image1); };
    image.src = 'sand.png';
    image1.src = 'sky.jpg';
    return true;
}

function isPowerOf2(value) { return (value & (value - 1)) == 0; }

function sendTextureToTEXTURE0(image) {
    var texture = gl.createTexture();
    if(!texture){ console.log('Failed to create the texture0 object'); return false; }
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
        gl.generateMipmap(gl.TEXTURE_2D);
    } else {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); // REPEAT was CLAMP_TO_EDGE in some versions, check original if issues
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT); // REPEAT was CLAMP_TO_EDGE
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
    gl.uniform1i(u_Sampler0, 0);
    console.log("Finished loadTexture for sand.png (TEXTURE0)"); // Clarified log
}

function sendTextureToTEXTURE1(image) {
    var texture = gl.createTexture();
    if(!texture){ console.log('Failed to create the texture1 object'); return false; }
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
        gl.generateMipmap(gl.TEXTURE_2D);
    } else {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); // REPEAT was CLAMP_TO_EDGE
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT); // REPEAT was CLAMP_TO_EDGE
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
    gl.uniform1i(u_Sampler1, 1);
    console.log("Finished loadTexture1 for sky.jpg (TEXTURE1)"); // Clarified log
}


function main() {

    setupWebGL(); // Initialize WebGL and get the gl context


    initWorld();

    // Now that gl is initialized, you can create buffers
    cubePositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubePositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Cube().vertices, gl.STATIC_DRAW);

    cubeUVBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeUVBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Cube().uvs, gl.STATIC_DRAW);

    initWalls();
    connectVariablesToGLSL();
    addActionsForHtmlUI(); // Your original call

    g_camera = new Camera(); // Make sure Camera.js is included and Camera class is defined
    document.onkeydown = keydown;

    // --- Using your original mouse event handlers ---
    canvas.onmousedown = function(ev) {
        isDragging = true;
        check(ev); // Your original call
        isRotating = ev.button === 0; // Rotate only on left mouse button down
        lastMouseX = ev.clientX;
        lastMouseY = ev.clientY;
    };
    canvas.onmouseup = function(ev) {
        isDragging = false;
        isRotating = false;
    };
    canvas.onmouseout = function(ev) {
        isDragging = false;
        isRotating = false;
    };
    canvas.onmousemove = function(ev) {
      if (isDragging && !isRotating) {
        mouseCam(ev); // Existing panning
    }
  };

    // right after you set up camera & GLSL:
    canvas.onclick = placeBlockAtMouse;


    // --- End of original mouse event handlers ---

    initTextures();
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // ---- Initialize/Re-initialize time variables for tick and FPS ----
    g_startTime = performance.now() / 1000.0;       // Precise start time for g_seconds
    g_lastFrameTime = performance.now();           // For the first frame's deltaTime calculation
    g_fpsAccumulator = 0;                          // Reset FPS time accumulator
    g_frameCount = 0;                            // Reset frame count for FPS calculation

    requestAnimationFrame(tick);
}

// check function (Copied from your original asg3.js)
function check(ev) {
    var picked = false; // This variable is not used outside this function scope
    var x = ev.clientX, y = ev.clientY;
    var rect = ev.target.getBoundingClientRect();
    if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
        var x_in_canvas = x - rect.left, y_in_canvas = rect.bottom - y;
        gl.uniform1i(u_Clicked, 1);
        // IMPORTANT: For picking to work accurately with gl.readPixels,
        // you usually need to render the scene with unique colors for pickable objects
        // *immediately before* calling gl.readPixels. If your renderScene isn't called here,
        // u_Clicked might affect the *next* visible frame, not the pick itself.
        // For now, this is as per your original code structure.
        var pixels = new Uint8Array(4);
        gl.readPixels(x_in_canvas, y_in_canvas, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        console.log("Picked color R value (u_Clicked=1): " + pixels[0]); // Logging the R value
        // Original logic:
        // if (pixels[0] == 255)
        //    picked = true; // This 'picked' is local and not used.
        gl.uniform1i(u_Clicked, 0); // Reset u_Clicked for normal rendering
    }
}

// Movement functions (Copied from your original asg3.js)
function convertCoordinatesEventToGL(ev){
    var x = ev.clientX;
    var y = ev.clientY;
    var rect = ev.target.getBoundingClientRect() ;
    x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);
    return [x,y];
}

function mouseCam(ev){
    var coord = convertCoordinatesEventToGL(ev); // Renamed to avoid conflict if 'coord' was global
    // Assuming panMLeft and panMRight take a signed degree for simplicity,
    // or adjust the multiplication factor as needed.
    // Original code: if (coord[0] < 0.5) g_camera.panMLeft(coord[0] * -10); else g_camera.panMRight(coord[0] * -10);
    // This means both left and right mouse movements pan right if coord[0] is positive.
    // Let's assume a simple direct mapping for horizontal mouse movement to panning:
    var panAmount = coord[0] * 10; // Adjust sensitivity as needed
    if (panAmount < 0) {
        g_camera.panMLeft(Math.abs(panAmount)); // panMLeft expects positive degrees
    } else if (panAmount > 0) {
        g_camera.panMRight(panAmount); // panMRight (corrected in Camera.js) expects positive for right turn
    }
}
/*
function keydown(ev){
    if (ev.keyCode == 87) { g_camera.forward(); }
    else if (ev.keyCode == 65) { g_camera.left(); }
    else if (ev.keyCode == 83) { g_camera.back(); }
    else if (ev.keyCode == 68) { g_camera.right(); }
    else if (ev.keyCode == 81) { g_camera.panLeft(); }
    else if (ev.keyCode == 69) { g_camera.panRight(); }
    renderScene();
}
*/

function keydown(ev) {
  if (ev.keyCode == 87) { // W
      g_camera.forward(); // Move forward
  } else if (ev.keyCode == 83) { // S
      g_camera.back();    // Move backward
  } else if (ev.keyCode == 65) { // A
      g_camera.left();    // Strafe left
  } else if (ev.keyCode == 68) { // D
      g_camera.right();   // Strafe right
  } else if (ev.keyCode == 37) { // Left Arrow
      g_camera.panLeft(); // Turn camera left (Yaw)
  } else if (ev.keyCode == 39) { // Right Arrow
      g_camera.panRight(); // Turn camera right (Yaw)
  } else if (ev.keyCode == 70) { // F
      g_camera.panDown(); // Call panDown (your flip effect)
  } else if (ev.keyCode == 81) { // Q
      g_camera.panLeft(); // Turn camera left (Yaw)
  } else if (ev.keyCode == 69) { // E
      g_camera.panRight(); // Turn camera right (Yaw)
  } else if (ev.keyCode == 86) { // V
      deleteBlockInFront(); // Call the delete block function
  }
  renderScene();
}

function tick(){
    var currentTime = performance.now();
    var deltaTime = (currentTime - g_lastFrameTime) / 1000.0; // deltaTime in seconds
    g_lastFrameTime = currentTime;

    g_frameCount++;
    g_fpsAccumulator += deltaTime;

    if (g_fpsAccumulator >= g_fpsDisplayInterval) {
        var local_fps = g_frameCount / g_fpsAccumulator;
        var local_ms = (g_fpsAccumulator * 1000.0) / g_frameCount;

        var fpsElement = document.getElementById('numdot');
        if (fpsElement) {
            fpsElement.textContent = "ms: " + local_ms.toFixed(2) +
                                     " | fps: " + local_fps.toFixed(2);
        }
        g_frameCount = 0;
        g_fpsAccumulator = 0; // Reset for the next interval
    }

    // Original tick logic from your file:
    g_seconds = performance.now()/1000.0 - g_startTime; // Update global seconds
    renderScene();
    requestAnimationFrame(tick);
}

function renderScene(){
    var projMat = g_camera.projMat;
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

    var viewMat = g_camera.viewMat;
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

    var globalRotMat = new Matrix4().rotate(gAnimalGlobalRotation, 0, 1, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Pass the buffers to drawAllShapes
    drawAllShapes(cubePositionBuffer, cubeUVBuffer);
}
/*
function placeBlockAtMouse(ev) {
  console.log("placeBlockAtMouse function called!");
  // 1) canvas → NDC unprojection (same as before)
  const rect = canvas.getBoundingClientRect();
  const x_ndc = ((ev.clientX - rect.left) / canvas.width ) * 2 - 1;
  const y_ndc = (((canvas.height - (ev.clientY - rect.top)) / canvas.height) * 2 - 1);

  // build invPV
  const PV    = new Matrix4().set(g_camera.projMat).multiply(g_camera.viewMat);
  const invPV = new Matrix4().setInverseOf(PV);
  const e     = invPV.elements;

  function unproject(nx, ny, nz) {
    const tx = e[0]*nx + e[4]*ny + e[8]*nz  + e[12];
    const ty = e[1]*nx + e[5]*ny + e[9]*nz  + e[13];
    const tz = e[2]*nx + e[6]*ny + e[10]*nz + e[14];
    const tw = e[3]*nx + e[7]*ny + e[11]*nz + e[15];
    return [ tx/tw, ty/tw, tz/tw ];
  }

  // get ray origin & dir
  const [nx, ny, nz] = unproject(x_ndc, y_ndc, -1);
  const [fx, fy, fz] = unproject(x_ndc, y_ndc,  1);
  const origin = new Vector3([ nx, ny, nz ]);
  const dir    = new Vector3([ fx-nx, fy-ny, fz-nz ]).normalize();

  // 2) Try intersecting any block top face, starting from highest stacks
  let placed = false;
  for (let i = 0; i < gridRows && !placed; i++) {
    for (let j = 0; j < gridCols && !placed; j++) {
      const hMax = g_map[i][j];
      if (hMax === 0) continue;
      // cell center in world coords
      const cx = (j - gridCols/2 + 0.5) * cellSize;
      const cz = (i - gridRows/2 + 0.5) * cellSize;
      // test top faces from top‐down
      for (let h = hMax - 1; h >= 0; h--) {
        const planeY = (h + 1) * blockSize;
        const t = (planeY - origin.elements[1]) / dir.elements[1];
        if (t <= 0) continue;
        // intersection point
        const px = origin.elements[0] + dir.elements[0] * t;
        const pz = origin.elements[2] + dir.elements[2] * t;
        // within the cell?
        if (Math.abs(px - cx) <= blockSize/2 &&
            Math.abs(pz - cz) <= blockSize/2) {
          // hit this stack
          if (hMax < maxHeight) {
            g_map[i][j]++;
            console.log(
              `Clicked block at [${i},${j}], ` +
              `stacked to height ${g_map[i][j]}`
            );
          } else {
            console.log(`Cell [${i},${j}] already at max height (${maxHeight})`);
          }
          placed = true;
          break;
        }
      }
    }
  }

  if (placed) return;

  // 3) Otherwise, fall back to ground‐plane y=0
  const t0 = - origin.elements[1] / dir.elements[1];
  if (t0 <= 0) {
    console.log("Ray never hit the ground plane (clicked into sky)");
    return;
  }
  const hitX = origin.elements[0] + dir.elements[0] * t0;
  const hitZ = origin.elements[2] + dir.elements[2] * t0;
  // map to nearest cell
  const j0 = Math.round(hitX  / cellSize + gridCols/2 - 0.5);
  const i0 = Math.round(hitZ  / cellSize + gridRows/2 - 0.5);
  if (i0 < 0 || i0 >= gridRows || j0 < 0 || j0 >= gridCols) {
    console.log("Ground‐plane click outside grid");
    return;
  }
  if (g_map[i0][j0] < maxHeight) {
    g_map[i0][j0]++;
    console.log(`Placed new block on floor at [${i0},${j0}], height now ${g_map[i0][j0]}`);
  } else {
    console.log(`Cell [${i0},${j0}] at max height (${maxHeight}), no block added`);
  }
}
*/

function placeBlockAtMouse(ev) {
  // 1) Convert mouse click to NDC
  const rect = canvas.getBoundingClientRect();
  const x_ndc = ((ev.clientX - rect.left) / canvas.width) * 2 - 1;
  const y_ndc = ((canvas.height - (ev.clientY - rect.top)) / canvas.height) * 2 - 1;

  // 2) Build inverse PV for unproject
  const PV    = new Matrix4().set(g_camera.projMat).multiply(g_camera.viewMat);
  const invPV = new Matrix4().setInverseOf(PV);
  const e     = invPV.elements;
  function unproject(nx, ny, nz) {
    const tx = e[0]*nx + e[4]*ny + e[8]*nz  + e[12];
    const ty = e[1]*nx + e[5]*ny + e[9]*nz  + e[13];
    const tz = e[2]*nx + e[6]*ny + e[10]*nz + e[14];
    const tw = e[3]*nx + e[7]*ny + e[11]*nz + e[15];
    return [ tx/tw, ty/tw, tz/tw ];
  }

  // 3) Ray origin & dir
  const [nx, ny, nz] = unproject(x_ndc, y_ndc, -1);
  const [fx, fy, fz] = unproject(x_ndc, y_ndc,  1);
  const origin = new Vector3([ nx, ny, nz ]);
  const dir    = new Vector3([ fx-nx, fy-ny, fz-nz ]).normalize();

  // 4) Try hitting existing stack
  let placed = false;
  for (let i = 0; i < gridRows && !placed; i++) {
    for (let j = 0; j < gridCols && !placed; j++) {
      const cell = g_map[i][j];
      const hMax = cell.height;
      if (hMax === 0) continue;

      const cx = (j - gridCols/2 + 0.5) * cellSize;
      const cz = (i - gridRows/2 + 0.5) * cellSize;

      for (let h = hMax - 1; h >= 0; h--) {
        const planeY = (h + 1) * blockSize;
        const t = (planeY - origin.elements[1]) / dir.elements[1];
        if (t <= 0) continue;

        const px = origin.elements[0] + dir.elements[0] * t;
        const pz = origin.elements[2] + dir.elements[2] * t;

        if (Math.abs(px - cx) <= blockSize/2 && Math.abs(pz - cz) <= blockSize/2) {
          if (hMax < maxHeight) {
            cell.height++;
            // give the new block the world’s default brown color
            cell.color = [0.5, 0.35, 0.2, 1.0];
            console.log(`Added block at [${i},${j}], new height ${cell.height}`);
          } else {
            console.log(`Cell [${i},${j}] already at max height (${maxHeight})`);
          }
          placed = true;
          break;
        }
      }
    }
  }
  if (placed) return;

  // 5) Fallback: ground‐plane
  const t0 = - origin.elements[1] / dir.elements[1];
  if (t0 <= 0) { console.log("Ray missed the ground plane"); return; }
  const hitX = origin.elements[0] + dir.elements[0] * t0;
  const hitZ = origin.elements[2] + dir.elements[2] * t0;
  const j0 = Math.round(hitX / cellSize + gridCols/2 - 0.5);
  const i0 = Math.round(hitZ / cellSize + gridRows/2 - 0.5);

  if (i0 < 0 || i0 >= gridRows || j0 < 0 || j0 >= gridCols) {
    console.log("Ground‐plane click outside grid");
    return;
  }

  const groundCell = g_map[i0][j0];
  if (groundCell.height < maxHeight) {
    groundCell.height++;
    groundCell.color = [0.5, 0.35, 0.2, 1.0];
    console.log(`Placed block on floor at [${i0},${j0}], height now ${groundCell.height}`);
  } else {
    console.log(`Cell [${i0},${j0}] at max height (${maxHeight}), no block added`);
  }
}


function initWalls() {
  // You can modify the wall map here if needed
  console.log("Walls initialized with a 32x32 map");
}