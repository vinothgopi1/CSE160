// main.js

// ─── 1) Configuration & Map Data ─────────────────────────────────────────
const cellSize   = 0.4;
const blockSize  = 0.3;
const maxHeight  = 3;
const gridRows   = 10;
const gridCols   = 10;
const wallMapSize = 16;

let g_map;

// Generate procedural 32×32 wall map
function generateWallMap(size) {
  let map = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => 0)
  );
  // Outer border
  for (let i = 0; i < size; i++) {
    map[0][i] = map[size-1][i] = map[i][0] = map[i][size-1] = 3;
  }
  // Internal maze (height 2)
  for (let i = 5; i < size-5; i += 6)
    for (let j = 0; j < size; j++)
      if (j % 8 !== 0) map[i][j] = 2;
  for (let j = 5; j < size-5; j += 6)
    for (let i = 0; i < size; i++)
      if (i % 8 !== 0) map[i][j] = 2;
  // Pillars (height 4)
  for (let i = 11; i < size-5; i += 12)
    for (let j = 11; j < size-5; j += 12)
      [ [i,j], [i+1,j], [i,j+1], [i+1,j+1] ].forEach(([x,y]) => map[x][y]=4);
  // Random walls (5% chance, height 1–3)
  for (let i = 0; i < size; i++)
    for (let j = 0; j < size; j++)
      if (map[i][j]===0 && Math.random()<0.05)
        map[i][j] = Math.floor(Math.random()*3)+1;
  // Clear 5×5 center
  const c = Math.floor(size/2);
  for (let di=-2; di<=2; di++)
    for (let dj=-2; dj<=2; dj++){
      const x=c+di, y=c+dj;
      if (x>=0 && x<size && y>=0 && y<size) map[x][y]=0;
    }
  return map;
}
let wallMap32 = generateWallMap(wallMapSize);

// Initialize user world
function initWorld() {
  g_map = Array.from({ length:gridRows }, () =>
    Array.from({ length:gridCols }, () => ({
      height: 0,
      color: [0.5,0.35,0.2,1]
    }))
  );
  // Random initial stacks (~15%)
  for (let i=0;i<gridRows;i++){
    for (let j=0;j<gridCols;j++){
      if (Math.random()>=0.85){
        g_map[i][j].height = Math.floor(Math.random()*maxHeight);
        if (Math.random()<0.5)
          g_map[i][j].color = [0,0,1,1];
      }
    }
  }
  // Clear a circle of radius 6 around center
  const cx = Math.floor(gridCols/2), cz = Math.floor(gridRows/2);
  for (let di=-6; di<=6; di++)
    for (let dj=-6; dj<=6; dj++){
      const x=cx+dj, z=cz+di;
      if (x>=0&&x<gridCols&&z>=0&&z<gridRows)
        g_map[z][x].height=0;
    }
  // Place 5 blue cubes
  const bluePositions = [
    {x:2,y:1,z:2},{x:5,y:2,z:5},
    {x:10,y:1,z:10},{x:15,y:3,z:12},{x:18,y:1,z:18}
  ];


  g_redSphere1 = new Sphere();
  g_redSphere1.color = [1.0, 0.0, 0.0, 1.0]; // Red color
  g_redSphere1.matrix.translate(2.0, 0.5, 1.0).scale(0.3, 0.3, 0.3); // Position and size

  g_redSphere2 = new Sphere();
  g_redSphere2.color = [1.0, 0.0, 0.0, 1.0]; // Red color
  g_redSphere2.matrix.translate(-1.5, 1.0, -2.5).scale(0.4, 0.4, 0.4); // Position and size
  
  bluePositions.forEach(pos=>{
    const gx=Math.round(pos.x),
          gy=Math.round(pos.y),
          gz=Math.round(pos.z);
    if (gx>=0&&gx<gridCols&&gz>=0&&gz<gridRows&&gy<maxHeight){
      g_map[gz][gx].height = Math.max(g_map[gz][gx].height,gy);
      g_map[gz][gx].color  = [0,0,1,1];
    }
  });
}

// ─── 2) Shader Sources (Phong + textures/colors) ─────────────────────────
const VSHADER_SOURCE = `
precision mediump float;
attribute vec4 a_Position;
attribute vec3 a_Normal;
attribute vec2 a_UV;
uniform mat4 u_ModelMatrix;
uniform mat4 u_NormalMatrix;
uniform mat4 u_GlobalRotateMatrix;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ProjectionMatrix;
varying vec3 v_Normal;
varying vec4 v_VertPos;
varying vec2 v_UV;
void main() {
  gl_Position = u_ProjectionMatrix
              * u_ViewMatrix
              * u_GlobalRotateMatrix
              * u_ModelMatrix
              * a_Position;
  v_Normal  = normalize((u_NormalMatrix * vec4(a_Normal,0.0)).xyz);
  v_VertPos = u_ModelMatrix * a_Position;
  v_UV      = a_UV;
}
`;

/*
const FSHADER_SOURCE = `
precision mediump float;

varying vec3  v_Normal;
varying vec4  v_VertPos;
varying vec2  v_UV;

uniform bool   u_lightOn;
uniform vec3   u_lightPos;
uniform vec3   u_cameraPos;
uniform vec4   u_FragColor;
uniform int    u_whichTexture;
uniform sampler2D u_Sampler0;
uniform sampler2D u_Sampler1;

void main() {
  // 1) Normal‐visualization mode?
  if (u_whichTexture == -3) {
    gl_FragColor = vec4((v_Normal + 1.0) * 0.5, 1.0);
    return;
  }

  // 2) Pick base colour or sample texture
  vec4 base;
  if      (u_whichTexture == -2) base = u_FragColor;
  else if (u_whichTexture ==  0) base = texture2D(u_Sampler0, v_UV);
  else if (u_whichTexture ==  1) base = texture2D(u_Sampler1, v_UV);
  else                            base = vec4(1.0, 0.0, 0.0, 1.0);

  // 3) Lighting completely off?
  if (!u_lightOn) {
    gl_FragColor = base;
    return;
  }

  // 4) Phong lighting
  vec3 N = normalize(v_Normal);
  vec3 L = normalize(u_lightPos - v_VertPos.xyz);
  float diff = max(dot(N, L), 0.0);
  vec3 R = reflect(-L, N);
  vec3 E = normalize(u_cameraPos - v_VertPos.xyz);
  float spec = pow(max(dot(E, R), 0.0), 16.0);

  vec3 ambient = 0.3 * base.rgb;
  vec3 diffuse = 0.7 * diff * base.rgb;
  vec3 color   = ambient + diffuse + spec;

  gl_FragColor = vec4(color, base.a);
}
`;
*/

const FSHADER_SOURCE = `
precision mediump float;

varying vec3  v_Normal;
varying vec4  v_VertPos;
varying vec2  v_UV;

uniform bool   u_lightOn; // Main light toggle
uniform vec3   u_lightPos; // Main light position
uniform vec3   u_lightColor; // NEW: Light color uniform
uniform vec3   u_cameraPos;
uniform vec4   u_FragColor;
uniform int    u_whichTexture;
uniform sampler2D u_Sampler0;
uniform sampler2D u_Sampler1;

// Spotlight Uniforms
uniform bool   u_spotlightOn;
uniform vec3   u_spotlightPos;
uniform vec3   u_spotlightDirection;
uniform float  u_spotlightCutoff;
uniform float  u_spotlightOuterCutoff;

// NEW: Default Lighting Uniform
uniform bool   u_defaultLightingOn; // Flag to enable default lighting

void main() {
  // 1) Normal‐visualization mode?
  if (u_whichTexture == -3) {
    gl_FragColor = vec4((v_Normal + 1.0) * 0.5, 1.0);
    return;
  }

  // 2) Pick base colour or sample texture
  vec4 base;
  if      (u_whichTexture == -2) base = u_FragColor;
  else if (u_whichTexture ==  0) base = texture2D(u_Sampler0, v_UV);
  else if (u_whichTexture ==  1) base = texture2D(u_Sampler1, v_UV);
  else                            base = vec4(1.0, 0.0, 0.0, 1.0);

  // NEW: If default lighting is on, just use the base color/texture
  if (u_defaultLightingOn) {
    gl_FragColor = base;
    return; // Exit early, no lighting calculations needed
  }


  // Initialize ambient, diffuse, specular components
  vec3 ambient  = vec3(0.0, 0.0, 0.0);
  vec3 diffuse  = vec3(0.0, 0.0, 0.0);
  vec3 specular = vec3(0.0, 0.0, 0.0);

  if (u_lightOn) {
    vec3 N_main = normalize(v_Normal);
    vec3 L_main = normalize(u_lightPos - v_VertPos.xyz);
    float diff_main = max(dot(N_main, L_main), 0.0);
    vec3 R_main = reflect(-L_main, N_main);
    vec3 E_main = normalize(u_cameraPos - v_VertPos.xyz);
    float spec_main = pow(max(dot(E_main, R_main), 0.0), 16.0);

    // Main light contribution factors
    ambient  += 0.3 * base.rgb * u_lightColor;  // NEW: Apply light color
    diffuse  += 0.7 * diff_main * base.rgb * u_lightColor; // NEW: Apply light color
    specular += spec_main * base.rgb * u_lightColor; // NEW: Apply light color
  }

  // Spotlight Calculation (if enabled)
  if (u_spotlightOn) {
    vec3 N_spot = normalize(v_Normal);
    vec3 L_spot = normalize(u_spotlightPos - v_VertPos.xyz);
    vec3 S_spot = normalize(u_spotlightDirection);

    float angleDot = dot(-L_spot, S_spot);

    float spotlightFactor = 0.0;
    if (angleDot > u_spotlightOuterCutoff) {
      if (angleDot > u_spotlightCutoff) {
        spotlightFactor = 1.0;
      } else {
        spotlightFactor = smoothstep(u_spotlightOuterCutoff, u_spotlightCutoff, angleDot);
      }
    }
    
    float diff_spot = max(dot(N_spot, L_spot), 0.0);
    vec3 R_spot = reflect(-L_spot, N_spot);
    vec3 E_spot = normalize(u_cameraPos - v_VertPos.xyz);
    float spec_spot = pow(max(dot(E_spot, R_spot), 0.0), 16.0);

    float spotlight_ambient_intensity = 0.1;
    float spotlight_diffuse_intensity = 1.5;
    float spotlight_specular_intensity = 2.0;

    ambient  += spotlight_ambient_intensity * base.rgb;
    diffuse  += spotlight_diffuse_intensity * diff_spot * base.rgb * spotlightFactor;
    specular += spotlight_specular_intensity * spec_spot * base.rgb * spotlightFactor;
  }

  // Combine total lighting components
  vec3 finalColor = ambient + diffuse + specular;

  gl_FragColor = vec4(finalColor, base.a);
}
`;

// ─── 3) Globals ─────────────────────────────────────────────────────────
let canvas, gl;
let a_Position, a_Normal, a_UV;
let u_FragColor, u_ModelMatrix, u_NormalMatrix;
let u_GlobalRotateMatrix, u_ViewMatrix, u_ProjectionMatrix;
let u_whichTexture, u_lightOn, u_lightPos, u_cameraPos;
let u_Sampler0, u_Sampler1;
let cubePositionBuffer, cubeUVBuffer, cubeNormalBuffer;
let g_camera;

let g_lightEnabled = true;
let g_lightPos = [0,1,-2];
let g_lightColor = [1.0, 1.0, 1.0];
let gAnimalGlobalRotation = 0;

let isDragging=false, lastMouseX, lastMouseY;

let g_startTime=performance.now()/1000;
let g_lastFrameTime=performance.now();
let g_frameCount=0, g_fpsAccumulator=0;
const g_fpsDisplayInterval=0.5;
let g_normalOn    = false;

let g_redSphere1;
let g_redSphere2;

let g_spotlightEnabled = false; // Initial state: spotlight is off
// Spotlight properties (adjust these values to fine-tune the beam)
let g_spotlightPos = [0, 2, 0]; // Position: Directly above the origin
let g_spotlightDirection = [0, -1, 0]; // Direction: Straight down
const g_spotlightCutoff = Math.cos(Math.PI / 8); // Inner cone angle (22.5 degrees)
const g_spotlightOuterCutoff = Math.cos(Math.PI / 6); // Outer cone angle (30 degrees)

let g_defaultLightingEnabled = false;


// ─── 5) Drawing Helpers ─────────────────────────────────────────────────
/*
function drawMap(cube, positionBuffer) {
  const rows = g_map.length, cols = rows?g_map[0].length:0;
  const xOff = cols/2, zOff = rows/2;
  const m = new Matrix4();
  cube.textureNum = -2;
  for (let i=0;i<rows;i++) for (let j=0;j<cols;j++){
    const bd = g_map[i][j], h=bd.height;
    if (h<=0) continue;
    cube.color = bd.color;
    for (let k=0;k<h;k++){
      const cx=(j-xOff+0.5)*cellSize,
            cz=(i-zOff+0.5)*cellSize,
            cy=(k+0.5)*blockSize;
      m.setTranslate(cx,cy,cz).scale(blockSize,blockSize,blockSize);
      cube.matrix = m;
      //cube.renderfast(positionBuffer);
      cube.render(positionBuffer, cubeUVBuffer);
    }
  }
}
*/

function drawMap(cube, positionBuffer) {
  const rows = g_map.length, cols = rows?g_map[0].length:0;
  const xOff = cols/2, zOff = rows/2;
  const m = new Matrix4();
  // Change this line:
  cube.textureNum = g_normalOn ? -3 : -2; // Use -3 for normals, -2 for solid color
  for (let i=0;i<rows;i++) for (let j=0;j<cols;j++){
    const bd = g_map[i][j], h=bd.height;
    if (h<=0) continue;
    cube.color = bd.color;
    for (let k=0;k<h;k++){
      const cx=(j-xOff+0.5)*cellSize,
            cz=(i-zOff+0.5)*cellSize,
            cy=(k+0.5)*blockSize;
      m.setTranslate(cx,cy,cz).scale(blockSize,blockSize,blockSize);
      cube.matrix = m;
      cube.render(positionBuffer, cubeUVBuffer);
    }
  }
}

/*
function drawWalls(cube, positionBuffer) {
  const xOff=wallMapSize/2, zOff=wallMapSize/2;
  const wallColors=[
    [0.6,0.4,0.2,1],[0.5,0.35,0.2,1],
    [0.4,0.3,0.2,1],[0.35,0.25,0.15,1]
  ];
  const m=new Matrix4();
  cube.textureNum=-2;
  for (let i=0;i<wallMapSize;i++) for (let j=0;j<wallMapSize;j++){
    const h=wallMap32[i][j];
    if (h<=0) continue;
    const colorIdx=Math.min(h-1,wallColors.length-1);
    cube.color = wallColors[colorIdx];
    for (let k=0;k<h;k++){
      const cx=(j-xOff+0.5)*cellSize,
            cz=(i-zOff+0.5)*cellSize,
            cy=(k+0.5)*blockSize;
      m.setTranslate(cx,cy,cz).scale(blockSize,blockSize,blockSize);
      cube.matrix = m;
      //cube.renderfast(positionBuffer);
      cube.render(positionBuffer, cubeUVBuffer);
    }
  }
}
*/

function drawWalls(cube, positionBuffer) {
  const xOff=wallMapSize/2, zOff=wallMapSize/2;
  const wallColors=[
    [0.6,0.4,0.2,1],[0.5,0.35,0.2,1],
    [0.4,0.3,0.2,1],[0.35,0.25,0.15,1]
  ];
  const m=new Matrix4();
  // Change this line:
  cube.textureNum = g_normalOn ? -3 : -2; // Use -3 for normals, -2 for solid color
  for (let i=0;i<wallMapSize;i++) for (let j=0;j<wallMapSize;j++){
    const h=wallMap32[i][j];
    if (h<=0) continue;
    const colorIdx=Math.min(h-1,wallColors.length-1);
    cube.color = wallColors[colorIdx];
    for (let k=0;k<h;k++){
      const cx=(j-xOff+0.5)*cellSize,
            cz=(i-zOff+0.5)*cellSize,
            cy=(k+0.5)*blockSize;
      m.setTranslate(cx,cy,cz).scale(blockSize,blockSize,blockSize);
      cube.matrix = m;
      cube.render(positionBuffer, cubeUVBuffer);
    }
  }
}

/*
function drawThorns(cube, positionBuffer) {
  cube.color=[0.8,0.8,0.6,1];
  cube.textureNum=-2;
  const thorns=[
    {x:0.1,y:-0.1,z:-0.03},{x:-0.03,y:0.0,z:0.1},
    {x:0.1,y:0.2,z:-0.03},{x:-0.13,y:0.2,z:-0.03},
    {x:-0.03,y:0.3,z:0.1},{x:0.1,y:0.5,z:-0.03},
    {x:-0.13,y:0.5,z:-0.03},{x:-0.03,y:0.5,z:0.1},
    {x:-0.25,y:0.25,z:-0.03},{x:-0.35,y:0.25,z:-0.03},
    {x:-0.45,y:0.15,z:-0.03},{x:-0.45,y:0.3,z:-0.03},
    {x:-0.45,y:0.45,z:-0.03},{x:0.2,y:0.45,z:-0.03},
    {x:0.3,y:0.45,z:-0.03},{x:0.4,y:0.45,z:-0.03},
    {x:0.3,y:0.6,z:-0.03},{x:0.3,y:0.75,z:-0.03},
    {x:-0.03,y:0.75,z:-0.03},{x:-0.03,y:0.85,z:-0.03}
  ];
  const m = new Matrix4();
  thorns.forEach(p=>{
    m.setTranslate(p.x,p.y,p.z).scale(0.03,0.03,0.03);
    cube.matrix=m;
    //cube.renderfast(positionBuffer);
    cube.render(positionBuffer, cubeUVBuffer);
  });
}


function drawFlower(cube, positionBuffer) {
  // center
  let c = new Cube();
  c.color=[0.8,0.2,0.2,1];
  c.textureNum=-2;
  let m=new Matrix4();
  m.translate(-0.05,0.9,-0.05).scale(0.1,0.05,0.1);
  c.matrix=m; //c.renderfast(positionBuffer);
  c.render(positionBuffer, cubeUVBuffer);
  // petals
  const petals=[
    {x:-0.05,y:0.9,z:-0.15},{x:0.05,y:0.9,z:-0.05},
    {x:-0.05,y:0.9,z:0.05},{x:-0.15,y:0.9,z:-0.05},
    {x:-0.15,y:0.9,z:-0.15},{x:0.05,y:0.9,z:-0.15},
    {x:-0.15,y:0.9,z:0.05},{x:0.05,y:0.9,z:0.05}
  ];
  let pCube=new Cube();
  pCube.color=[0.9,0.1,0.1,1];
  pCube.textureNum=-2;
  petals.forEach(p=>{
    m.setTranslate(p.x,p.y,p.z).scale(0.1,0.03,0.1);
    pCube.matrix=m; //pCube.renderfast(positionBuffer);
    pCube.render(positionBuffer, cubeUVBuffer);
  });
  // stamen
  let s=new Cube();
  s.color=[1,0.8,0,1]; s.textureNum=-2;
  m.setTranslate(-0.03,0.95,-0.03).scale(0.06,0.03,0.06);
  s.matrix=m; //s.renderfast(positionBuffer);
  s.render(positionBuffer, cubeUVBuffer);
}

function drawCactus(cube, positionBuffer) {
  cube.color=[0,0.5,0.2,1]; cube.textureNum=-2;
  let m=new Matrix4();
  // body
  m.setTranslate(-0.1,-0.25,-0.1).scale(0.2,0.9,0.2);
  cube.matrix=m; cube.render(positionBuffer, cubeUVBuffer);
  // left horizontal arm
  m.setTranslate(-0.4,0.2,-0.1).scale(0.3,0.15,0.2);
  cube.matrix=m; cube.render(positionBuffer, cubeUVBuffer);
  // left vertical segment
  m.setTranslate(-0.4,0.2,-0.1).scale(0.15,0.4,0.15);
  cube.matrix=m; cube.render(positionBuffer, cubeUVBuffer);
  // right arm
  m.setTranslate(0.1,0.4,-0.1).scale(0.3,0.15,0.2);
  cube.matrix=m; cube.render(positionBuffer, cubeUVBuffer);
  m.setTranslate(0.25,0.4,-0.1).scale(0.15,0.4,0.15);
  cube.matrix=m; cube.render(positionBuffer, cubeUVBuffer);
  // top arm
  m.setTranslate(-0.1,0.65,-0.1).scale(0.2,0.25,0.2);
  cube.matrix=m; cube.render(positionBuffer, cubeUVBuffer);
  drawThorns(cube, positionBuffer);
  drawFlower(cube, positionBuffer);
}
*/

function drawThorns(cube, positionBuffer) {
  cube.color=[0.8,0.8,0.6,1];
  // Change this line:
  cube.textureNum = g_normalOn ? -3 : -2;
  const thorns=[
    {x:0.1,y:-0.1,z:-0.03},{x:-0.03,y:0.0,z:0.1},
    {x:0.1,y:0.2,z:-0.03},{x:-0.13,y:0.2,z:-0.03},
    {x:-0.03,y:0.3,z:0.1},{x:0.1,y:0.5,z:-0.03},
    {x:-0.13,y:0.5,z:-0.03},{x:-0.03,y:0.5,z:0.1},
    {x:-0.25,y:0.25,z:-0.03},{x:-0.35,y:0.25,z:-0.03},
    {x:-0.45,y:0.15,z:-0.03},{x:-0.45,y:0.3,z:-0.03},
    {x:-0.45,y:0.45,z:-0.03},{x:0.2,y:0.45,z:-0.03},
    {x:0.3,y:0.45,z:-0.03},{x:0.4,y:0.45,z:-0.03},
    {x:0.3,y:0.6,z:-0.03},{x:0.3,y:0.75,z:-0.03},
    {x:-0.03,y:0.75,z:-0.03},{x:-0.03,y:0.85,z:-0.03}
  ];
  const m = new Matrix4();
  thorns.forEach(p=>{
    m.setTranslate(p.x,p.y,p.z).scale(0.03,0.03,0.03);
    cube.matrix=m;
    cube.render(positionBuffer, cubeUVBuffer);
  });
}

function drawFlower(cube, positionBuffer) {
  // center
  let c = new Cube();
  c.color=[0.8,0.2,0.2,1];
  // Change this line:
  c.textureNum = g_normalOn ? -3 : -2;
  let m=new Matrix4();
  m.translate(-0.05,0.9,-0.05).scale(0.1,0.05,0.1);
  c.matrix=m;
  c.render(positionBuffer, cubeUVBuffer);
  // petals
  const petals=[
    {x:-0.05,y:0.9,z:-0.15},{x:0.05,y:0.9,z:-0.05},
    {x:-0.05,y:0.9,z:0.05},{x:-0.15,y:0.9,z:-0.05},
    {x:-0.15,y:0.9,z:-0.15},{x:0.05,y:0.9,z:-0.15},
    {x:-0.15,y:0.9,z:0.05},{x:0.05,y:0.9,z:0.05}
  ];
  let pCube=new Cube();
  pCube.color=[0.9,0.1,0.1,1];
  // Change this line:
  pCube.textureNum = g_normalOn ? -3 : -2;
  petals.forEach(p=>{
    m.setTranslate(p.x,p.y,p.z).scale(0.1,0.03,0.1);
    pCube.matrix=m;
    pCube.render(positionBuffer, cubeUVBuffer);
  });
  // stamen
  let s=new Cube();
  s.color=[1,0.8,0,1];
  // Change this line:
  s.textureNum = g_normalOn ? -3 : -2;
  m.setTranslate(-0.03,0.95,-0.03).scale(0.06,0.03,0.06);
  s.matrix=m;
  s.render(positionBuffer, cubeUVBuffer);
}

function drawCactus(cube, positionBuffer) {
  cube.color=[0,0.5,0.2,1];
  // Change this line:
  cube.textureNum = g_normalOn ? -3 : -2;
  let m=new Matrix4();
  // body
  m.setTranslate(-0.1,-0.25,-0.1).scale(0.2,0.9,0.2);
  cube.matrix=m; cube.render(positionBuffer, cubeUVBuffer);
  // left horizontal arm
  m.setTranslate(-0.4,0.2,-0.1).scale(0.3,0.15,0.2);
  cube.matrix=m; cube.render(positionBuffer, cubeUVBuffer);
  // left vertical segment
  m.setTranslate(-0.4,0.2,-0.1).scale(0.15,0.4,0.15);
  cube.matrix=m; cube.render(positionBuffer, cubeUVBuffer);
  // right arm
  m.setTranslate(0.1,0.4,-0.1).scale(0.3,0.15,0.2);
  cube.matrix=m; cube.render(positionBuffer, cubeUVBuffer);
  m.setTranslate(0.25,0.4,-0.1).scale(0.15,0.4,0.15);
  cube.matrix=m; cube.render(positionBuffer, cubeUVBuffer);
  // top arm
  m.setTranslate(-0.1,0.65,-0.1).scale(0.2,0.25,0.2);
  cube.matrix=m; cube.render(positionBuffer, cubeUVBuffer);
  // Pass the normal status to sub-parts:
  drawThorns(new Cube(), positionBuffer); // Create a new cube for thorns to set its own textureNum
  drawFlower(new Cube(), positionBuffer); // Create a new cube for flower to set its own textureNum
}

// ─── 6) WebGL Init & GLSL hookup ────────────────────────────────────────
function setupWebGL() {
  canvas = document.getElementById('webgl');
  gl = getWebGLContext(canvas);
  if (!gl) throw "WebGL context failed";
  gl.enable(gl.DEPTH_TEST);
}
function connectVariablesToGLSL() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE))
    throw "Shader init failed";
  a_Position           = gl.getAttribLocation(gl.program,'a_Position');
  a_Normal             = gl.getAttribLocation(gl.program,'a_Normal');
  a_UV                 = gl.getAttribLocation(gl.program,'a_UV');
  u_FragColor          = gl.getUniformLocation(gl.program,'u_FragColor');
  u_ModelMatrix        = gl.getUniformLocation(gl.program,'u_ModelMatrix');
  u_NormalMatrix       = gl.getUniformLocation(gl.program,'u_NormalMatrix');
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program,'u_GlobalRotateMatrix');
  u_ViewMatrix         = gl.getUniformLocation(gl.program,'u_ViewMatrix');
  u_ProjectionMatrix   = gl.getUniformLocation(gl.program,'u_ProjectionMatrix');
  u_whichTexture       = gl.getUniformLocation(gl.program,'u_whichTexture');
  u_lightOn            = gl.getUniformLocation(gl.program,'u_lightOn');
  u_lightColor         = gl.getUniformLocation(gl.program,'u_lightColor'); // NEW: Uniform for light color
  u_lightPos           = gl.getUniformLocation(gl.program,'u_lightPos');
  u_cameraPos          = gl.getUniformLocation(gl.program,'u_cameraPos');
  u_Sampler0           = gl.getUniformLocation(gl.program,'u_Sampler0');
  u_Sampler1           = gl.getUniformLocation(gl.program,'u_Sampler1');



  u_spotlightPos      = gl.getUniformLocation(gl.program, 'u_spotlightPos');
  u_spotlightDirection= gl.getUniformLocation(gl.program, 'u_spotlightDirection');
  u_spotlightCutoff   = gl.getUniformLocation(gl.program, 'u_spotlightCutoff');
  u_spotlightOuterCutoff = gl.getUniformLocation(gl.program, 'u_spotlightOuterCutoff');
  u_spotlightOn       = gl.getUniformLocation(gl.program, 'u_spotlightOn'); // New uniform for toggle

  u_defaultLightingOn = gl.getUniformLocation(gl.program, 'u_defaultLightingOn');
}

// ─── 7) Shared Buffers ──────────────────────────────────────────────────
function initBuffers() {
  const proto = new Cube();
  cubePositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,cubePositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,proto.vertices,gl.STATIC_DRAW);

  cubeUVBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,cubeUVBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,proto.uvs,gl.STATIC_DRAW);

  cubeNormalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,cubeNormalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,proto.normals,gl.STATIC_DRAW);
}

// ─── 8) Textures ───────────────────────────────────────────────────────
function initTextures() {
  const img0=new Image(), img1=new Image();
  img0.onload=() => sendTexture(gl.TEXTURE0,u_Sampler0,img0);
  img1.onload=() => sendTexture(gl.TEXTURE1,u_Sampler1,img1);
  img0.src='sand.png'; img1.src='sky.jpg';
}
function sendTexture(unit,uniform,image){
  const tex=gl.createTexture();
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,1);
  gl.activeTexture(unit);
  gl.bindTexture(gl.TEXTURE_2D,tex);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,image);
  if ((image.width&(image.width-1))===0 && (image.height&(image.height-1))===0)
    gl.generateMipmap(gl.TEXTURE_2D);
  else {
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
  }
  gl.uniform1i(uniform,unit-gl.TEXTURE0);
}

// ─── 9) UI Controls ─────────────────────────────────────────────────────
function addActionsForHtmlUI(){
  document.getElementById('rotateSlider')
    .addEventListener('input',e=>{
      gAnimalGlobalRotation = e.target.value;
      renderScene();
    });
  document.getElementById('normalOn').onclick  = ()=>{ g_normalOn=true;  renderScene(); };
  document.getElementById('normalOff').onclick = ()=>{ g_normalOn=false; renderScene(); };
  document.getElementById('lightOn').onclick   = ()=>{ g_lightEnabled=true;  renderScene(); };
  document.getElementById('lightOff').onclick  = ()=>{ g_lightEnabled=false; renderScene(); };
  ['X','Y','Z'].forEach(axis=>{
    document.getElementById('lightSlide'+axis)
      .addEventListener('input',e=>{
        g_lightPos[['X','Y','Z'].indexOf(axis)] = e.target.value/10;
        renderScene();
      });
  });


  // NEW: Light Color sliders
  ['R','G','B'].forEach(colorComponent => {
    document.getElementById('lightColor' + colorComponent)
      .addEventListener('input', e => {
        g_lightColor[['R','G','B'].indexOf(colorComponent)] = e.target.value / 100.0; // Scale to 0.0-1.0
        renderScene();
      });
  });

  document.getElementById('spotlightOn').onclick  = ()=>{ g_spotlightEnabled = true; renderScene(); };
  document.getElementById('spotlightOff').onclick = ()=>{ g_spotlightEnabled = false; renderScene(); };

  document.getElementById('defaultLightingOn').onclick = ()=>{
    g_defaultLightingEnabled = true; // Enable default mode
    g_lightEnabled = false;        // Turn off main light
    g_spotlightEnabled = false;    // Turn off spotlight
    renderScene();
  };
}

// ───10) Event Handlers ───────────────────────────────────────────────────
function initEventHandlers(){
  canvas.onmousedown = ev=>{
    isDragging=true; lastMouseX=ev.clientX; lastMouseY=ev.clientY;
  };
  canvas.onmouseup   = ()=>{ isDragging=false; };
  canvas.onmouseout  = ()=>{ isDragging=false; };
  canvas.onmousemove = ev=>{
    if(!isDragging) return;
    const dx=ev.clientX-lastMouseX, dy=ev.clientY-lastMouseY;
    lastMouseX=ev.clientX; lastMouseY=ev.clientY;
    mouseCam(ev);
  };
  canvas.onclick = placeBlockAtMouse;
  document.onkeydown = keydown;
}

// ───11) Main & Loop ─────────────────────────────────────────────────────
function main(){
  setupWebGL();
  connectVariablesToGLSL();
  initWorld();
  initBuffers();
  initTextures();
  addActionsForHtmlUI();
  initEventHandlers();
  g_camera=new Camera();
  gl.clearColor(0,0,0,1);
  g_startTime=performance.now()/1000;
  g_lastFrameTime=performance.now();
  g_frameCount=0; g_fpsAccumulator=0;
  requestAnimationFrame(tick);
}

function updateAnimationAngles() {
  const now     = performance.now() / 1000.0;
  const elapsed = now - g_startTime;
  g_lightPos[0] = Math.cos(elapsed) * 1.0;   // radius = 1.0
}

function tick(now){
  updateAnimationAngles();
  const delta=(now-g_lastFrameTime)/1000;
  g_lastFrameTime=now;
  g_frameCount++; g_fpsAccumulator+=delta;
  if(g_fpsAccumulator>=g_fpsDisplayInterval){
    const fps=g_frameCount/g_fpsAccumulator;
    const ms=(g_fpsDisplayInterval*1000)/g_frameCount;
    document.getElementById('numdot').textContent=`ms: ${ms.toFixed(2)} | fps: ${fps.toFixed(2)}`;
    g_frameCount=0; g_fpsAccumulator=0;
  }
  renderScene();
  requestAnimationFrame(tick);
}

// ───12) Render & Draw ───────────────────────────────────────────────────
function renderScene(){
  gl.uniformMatrix4fv(u_ProjectionMatrix,false,g_camera.projMat.elements);
  gl.uniformMatrix4fv(u_ViewMatrix,false,g_camera.viewMat.elements);
  const gm=new Matrix4().rotate(gAnimalGlobalRotation,0,1,0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix,false,gm.elements);

  gl.uniform1i(u_lightOn, g_lightEnabled?1:0);
  const invV=new Matrix4(g_camera.viewMat).invert().elements;
  gl.uniform3f(u_cameraPos,invV[12],invV[13],invV[14]);
  gl.uniform3f(u_lightPos, g_lightPos[0],g_lightPos[1],g_lightPos[2]);
  gl.uniform3f(u_lightColor, g_lightColor[0], g_lightColor[1], g_lightColor[2]); // NEW: Pass light color
  gl.uniform1i(u_spotlightOn, g_spotlightEnabled ? 1 : 0);
  gl.uniform3f(u_spotlightPos, g_spotlightPos[0], g_spotlightPos[1], g_spotlightPos[2]);
  gl.uniform3f(u_spotlightDirection, g_spotlightDirection[0], g_spotlightDirection[1], g_spotlightDirection[2]);
  gl.uniform1f(u_spotlightCutoff, g_spotlightCutoff);
  gl.uniform1f(u_spotlightOuterCutoff, g_spotlightOuterCutoff);

  // NEW: Set Default Lighting Uniform
  gl.uniform1i(u_defaultLightingOn, g_defaultLightingEnabled ? 1 : 0);

  drawAllShapes(cubePositionBuffer,cubeUVBuffer);

  drawAllShapes(cubePositionBuffer,cubeUVBuffer);
}

function drawAllShapes(positionBuffer,uvBuffer){
  gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

  // Skybox
  let sky=new Cube();
  sky.textureNum = g_normalOn ? -3 : 1;    
  //sky.textureNum=1;
  sky.matrix=new Matrix4().scale(50,50,50).translate(-0.5,-0.5,-0.5);
  sky.render(positionBuffer,uvBuffer);

  // Floor
  let floor=new Cube();
  //floor.textureNum=0;
  floor.textureNum = g_normalOn ? -3 : 0;    
  floor.matrix=new Matrix4().translate(0,-0.01,0)
    .scale(wallMapSize,0,wallMapSize).translate(-0.5,0,-0.5);
  floor.render(positionBuffer,uvBuffer);



  const lightCube = new Cube();
  lightCube.color      = [2,2,0,1];
  lightCube.textureNum = -2;                            // solid color
  lightCube.matrix.setTranslate(g_lightPos[0], g_lightPos[1], g_lightPos[2])
                   .scale(0.1,0.1,0.1);
  lightCube.render(positionBuffer, uvBuffer);

  if (g_spotlightEnabled) { // Only draw if spotlight is on
    const spotlightSource = new Cube();
    spotlightSource.color = [0.8, 0.8, 0.0, 1]; // Greenish-yellow color
    spotlightSource.textureNum = -2;
    spotlightSource.matrix.setTranslate(g_spotlightPos[0], g_spotlightPos[1], g_spotlightPos[2])
                           .scale(0.05, 0.05, 0.05) // Smaller cube
                           .translate(-0.5, -0.5, -0.5); // Center the small cube
    spotlightSource.render();
}


  // NEW: Render Red Spheres
  // Ensure the spheres respect the normal visualization setting
  g_redSphere1.textureNum = g_normalOn ? -3 : -2;
  g_redSphere1.render();

  g_redSphere2.textureNum = g_normalOn ? -3 : -2;
  g_redSphere2.render();

  // Cactus
  drawCactus(new Cube(),positionBuffer);



  // User blocks & walls
  drawMap(new Cube(),positionBuffer);
  drawWalls(new Cube(),positionBuffer);
}

// ───13) Block Interaction & Camera etc ───────────────────────────────────
/*
function deleteBlockInFront(){
  const origin=new Vector3(g_camera.eye.elements);
  const dir=new Vector3(g_camera.at.elements).sub(g_camera.eye).normalize();
  const maxDistance=5, stepSize=0.1;
  for(let t=0;t<=maxDistance;t+=stepSize){
    const hit=origin.add(dir.mul(t));
    // user grid
    const jUser=Math.floor(hit.elements[0]/cellSize+gridCols/2);
    const iUser=Math.floor(hit.elements[2]/cellSize+gridRows/2);
    if(iUser>=0&&iUser<gridRows&&jUser>=0&&jUser<gridCols){
      let cell=g_map[iUser][jUser];
      if(cell.height>0){
        const wasBlue=cell.color[0]===0&&cell.color[1]===0&&cell.color[2]===1;
        cell.height--;
        renderScene();
        if(wasBlue) showOverlayMessage('🎉 YOU WIN! 🎉',3000);
        return;
      }
    }
    // walls
    const jEnv=Math.floor(hit.elements[0]/cellSize+wallMapSize/2);
    const iEnv=Math.floor(hit.elements[2]/cellSize+wallMapSize/2);
    if(iEnv>=0&&iEnv<wallMapSize&&jEnv>=0&&jEnv<wallMapSize&&wallMap32[iEnv][jEnv]>0){
      wallMap32[iEnv][jEnv]--;
      renderScene();
      return;
    }
  }
}
*/

function deleteBlockInFront() {
  // 1) build origin & forward ray
  const o = new Vector3(g_camera.eye.elements);
  const d = new Vector3(g_camera.at.elements).sub(g_camera.eye).normalize();

  // 2) setup constants
  const maxDist = 5;
  const cs      = cellSize;          // horizontal cell size
  const hsRows  = gridRows/2*cs;     // half‑span in world units
  const hsCols  = gridCols/2*cs;

  // 3) compute starting cell coords in user grid
  let x = o.elements[0], z = o.elements[2];
  let j = Math.floor((x + hsCols)/cs),
      i = Math.floor((z + hsRows)/cs);

  // 4) DDA prep
  const sx = d.elements[0] > 0 ?  1 : -1;
  const sz = d.elements[2] > 0 ?  1 : -1;
  const txDelta = Math.abs(cs / d.elements[0]);
  const tzDelta = Math.abs(cs / d.elements[2]);

  const nextX = (j + (sx > 0 ? 1 : 0))*cs - hsCols;
  const nextZ = (i + (sz > 0 ? 1 : 0))*cs - hsRows;
  let tx = d.elements[0] !== 0 ? (nextX - x)/d.elements[0] : Infinity;
  let tz = d.elements[2] !== 0 ? (nextZ - z)/d.elements[2] : Infinity;

  let t = 0;
  // 5) march until we hit something or go out of range
  while (t < maxDist) {
    if (tx < tz) {
      j += sx; 
      t = tx; 
      tx += txDelta;
    } else {
      i += sz; 
      t = tz; 
      tz += tzDelta;
    }

    // 6) check user grid first
    if (i >= 0 && i < gridRows && j >= 0 && j < gridCols) {
      let cell = g_map[i][j];
      if (cell.height > 0) {
        const wasBlue = (cell.color[0]===0 && cell.color[1]===0 && cell.color[2]===1);
        cell.height--;
        renderScene();
        if (wasBlue) showOverlayMessage('🎉 YOU WIN! 🎉', 3000);
        return;
      }
    }

    // 7) then check environment walls
    //    we need a separate offset half‑span for wallMap
    const hsEnv = wallMapSize/2 * cs;
    const jw = Math.floor((x + o.elements[0] + hsEnv)/cs); // reuse o and d, but recalc x,z along ray:
    const iw = Math.floor((z + o.elements[2] + hsEnv)/cs);
    if (iw >= 0 && iw < wallMapSize && jw >= 0 && jw < wallMapSize) {
      if (wallMap32[iw][jw] > 0) {
        wallMap32[iw][jw]--;
        renderScene();
        return;
      }
    }
  }
}


function placeBlockAtMouse(ev){
  const rect=canvas.getBoundingClientRect();
  const xNDC=( (ev.clientX-rect.left)/canvas.width )*2-1;
  const yNDC=( (canvas.height-(ev.clientY-rect.top))/canvas.height )*2-1;
  const PV=new Matrix4().set(g_camera.projMat).multiply(g_camera.viewMat);
  const invPV=new Matrix4().setInverseOf(PV).elements;
  function unproject(nx,ny,nz){
    const tx=invPV[0]*nx+invPV[4]*ny+invPV[8]*nz+invPV[12];
    const ty=invPV[1]*nx+invPV[5]*ny+invPV[9]*nz+invPV[13];
    const tz=invPV[2]*nx+invPV[6]*ny+invPV[10]*nz+invPV[14];
    const tw=invPV[3]*nx+invPV[7]*ny+invPV[11]*nz+invPV[15];
    return [tx/tw,ty/tw,tz/tw];
  }
  const [nx,ny,nz]=unproject(xNDC,yNDC,-1);
  const [fx,fy,fz]=unproject(xNDC,yNDC, 1);
  const origin=new Vector3([nx,ny,nz]);
  const dir=new Vector3([fx-nx,fy-ny,fz-nz]).normalize();

  let placed=false;
  // existing stacks
  for(let i=0;i<gridRows&&!placed;i++){
    for(let j=0;j<gridCols&&!placed;j++){
      let cd=g_map[i][j], hMax=cd.height;
      if(hMax===0) continue;
      const cx=(j-gridCols/2+0.5)*cellSize;
      const cz=(i-gridRows/2+0.5)*cellSize;
      for(let h=hMax-1;h>=0;h--){
        const t=( (h+1)*blockSize - origin.elements[1] )/dir.elements[1];
        if(t<=0) continue;
        const px=origin.elements[0]+dir.elements[0]*t;
        const pz=origin.elements[2]+dir.elements[2]*t;
        if(Math.abs(px-cx)<=blockSize/2&&Math.abs(pz-cz)<=blockSize/2){
          if(hMax<maxHeight){
            cd.height++;
            cd.color=[0.5,0.35,0.2,1];
          }
          placed=true;
          break;
        }
      }
    }
  }
  if(placed) { renderScene(); return; }
  // ground
  const t0=-origin.elements[1]/dir.elements[1];
  if(t0<=0) return;
  const hitX=origin.elements[0]+dir.elements[0]*t0;
  const hitZ=origin.elements[2]+dir.elements[2]*t0;
  const j0=Math.round(hitX/cellSize+gridCols/2-0.5);
  const i0=Math.round(hitZ/cellSize+gridRows/2-0.5);
  if(i0<0||i0>=gridRows||j0<0||j0>=gridCols) return;
  let ground=g_map[i0][j0];
  if(ground.height<maxHeight){
    ground.height++;
    ground.color=[0.5,0.35,0.2,1];
  }
  renderScene();
}

function mouseCam(ev){
  const [x,y]=convertCoordinatesEventToGL(ev);
  const panAmount=x*10;
  if(panAmount<0) g_camera.panLeft(-panAmount);
  else g_camera.panRight(panAmount);
}

function convertCoordinatesEventToGL(ev){
  const rect=canvas.getBoundingClientRect();
  let x=(ev.clientX-rect.left - canvas.width/2)/(canvas.width/2);
  let y=(canvas.height/2 - (ev.clientY-rect.top))/(canvas.height/2);
  return [x,y];
}

function keydown(ev){
  switch(ev.keyCode){
    case 87: g_camera.forward(); break;   // W
    case 83: g_camera.back();    break;   // S
    case 65: g_camera.left();    break;   // A
    case 68: g_camera.right();   break;   // D
    case 37: g_camera.panLeft(); break;   // ←
    case 39: g_camera.panRight();break;   // →
    case 81: g_camera.panLeft(); break;   // Q
    case 69: g_camera.panRight();break;   // E
    case 86: deleteBlockInFront(); break; // V
  }
  renderScene();
}

function showOverlayMessage(msg, ms = 2000) {
  const o = document.getElementById('overlayMessage');
  o.textContent = msg;
  o.style.display = 'block';
  clearTimeout(o._timeout);
  o._timeout = setTimeout(() => o.style.display = 'none', ms);
}

// Start
window.onload = main;