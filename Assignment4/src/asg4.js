let canvas, gl;
let a_Position, a_UV, a_Normal;
let u_ModelMatrix, u_GlobalRotateMatrix, u_ViewMatrix, u_ProjectionMatrix, u_NormalMatrix;
let u_Sampler0, u_Sampler1, u_whichTexture, u_FragColor, u_lightPos, u_cameraPos, u_lightOn;

let cubePositionBuffer, cubeUVBuffer;
let g_camera;
let gAnimalGlobalRotation = 0;
let g_normalOn = false;
let g_lightPos = [0, 1, -2];
let g_lightEnabled = true;

let g_startTime = performance.now() / 1000.0;


// Shaders
const VSHADER_SOURCE = `
precision mediump float;
attribute vec4 a_Position;
attribute vec2 a_UV;
attribute vec3 a_Normal;
varying vec2 v_UV;
varying vec3 v_Normal;
varying vec4 v_VertPos;
uniform mat4 u_ModelMatrix;
uniform mat4 u_NormalMatrix;
uniform mat4 u_GlobalRotateMatrix;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ProjectionMatrix;
void main() {
  gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  v_UV = a_UV;
  //v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal, 1)));
  v_Normal = normalize((u_NormalMatrix * vec4(a_Normal, 0.0)).xyz);
  //v_Normal = a_Normal;
  v_VertPos = u_ModelMatrix * a_Position;
}
`;

const FSHADER_SOURCE = `
precision mediump float;
varying vec2 v_UV;
varying vec3 v_Normal;
uniform vec4 u_FragColor;
uniform sampler2D u_Sampler0;
uniform sampler2D u_Sampler1;
uniform int u_whichTexture;
uniform vec3 u_lightPos;
uniform vec3 u_cameraPos;
varying vec4 v_VertPos;
uniform bool u_lightOn;
void main() {
  if (u_whichTexture == -3) {
    gl_FragColor = vec4((v_Normal + 1.0) / 2.0, 1.0);
  } else if (u_whichTexture == -2) {
    gl_FragColor = u_FragColor;
  } else if (u_whichTexture == 0) {
    gl_FragColor = texture2D(u_Sampler0, v_UV);
  } else if (u_whichTexture == 1) {
    gl_FragColor = texture2D(u_Sampler1, v_UV);
  } else {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  }

  // vec3 lightVector = vec3(v_VertPos) - u_lightPos;
  // float r = length(lightVector);

  vec3 lightVector = u_lightPos - vec3(v_VertPos);
  float r = length(lightVector);

  //  if (r < 1.0) {
  //    gl_FragColor = vec4(1, 0, 0, 1);
  //  } else if (r < 2.0) {
  //   gl_FragColor = vec4(0, 1, 0, 1);
  //  }

  // gl_FragColor = vec4(vec3(gl_FragColor) / (r*r), 1);

  // N dot L
  vec3 L = normalize(lightVector);
  vec3 N = normalize(v_Normal);
  float nDotL = max(dot(N,L), 0.0);

  //Reflection
  vec3 R = reflect(L, N);

  //eye
  vec3 E = normalize(u_cameraPos - vec3(v_VertPos));

  //Specular
  float specular = pow(max(dot(E, R), 0.0), 10.0);

  vec3 diffuse = vec3(gl_FragColor) * nDotL * 0.7;
  vec3 ambient = vec3(gl_FragColor) * 0.3;

  if(u_lightOn) {
    if(u_whichTexture == 0) {
      gl_FragColor = vec4(specular+diffuse+ambient, 1.0);
    } else {
      gl_FragColor = vec4(diffuse+ambient, 1.0);
    }
  }

  //gl_FragColor = vec4(specular+diffuse+ambient, 1.0);
  //gl_FragColor = gl_FragColor * nDotL;
  //gl_FragColor.a = 1.0;



}
`;

function addActionsForHtmlUI(){
  // This function was empty in your original code
  document.getElementById('rotateSlider').addEventListener('input', (event) => {
    gAnimalGlobalRotation = event.target.value;
    renderScene();
  });
  document.getElementById('normalOn').onclick = () => {g_normalOn = true; renderScene();};
  document.getElementById('normalOff').onclick = () => {g_normalOn = false; renderScene();};
  document.getElementById('lightOn').onclick = () => {g_lightEnabled = true; renderScene();};
  document.getElementById('lightOff').onclick = () => {g_lightEnabled = false; renderScene();};
  document.getElementById('lightSlideX').addEventListener('mousemove', e => {
    if (event.buttons == 1) {
      g_lightPos[0] = e.target.value/100;
      renderScene();
    }
  });

  document.getElementById('lightSlideY').addEventListener('mousemove', e => {
    if (event.buttons == 1) {
      g_lightPos[1] = e.target.value/100;
      renderScene();
    }
  })

  document.getElementById('lightSlideZ').addEventListener('mousemove', e => {
    if (event.buttons == 1) {
      g_lightPos[2] = e.target.value/100;
      renderScene();
    }
  })
}

function setupWebGL() {
  canvas = document.getElementById('webgl');
  gl = canvas.getContext('webgl');
  gl.enable(gl.DEPTH_TEST);

}

function connectGLSL() {
  initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);

  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if(a_Normal < 0) {
    console.log("failed to get storage location of a_Normal");
  }

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');

  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
  u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
  u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');


}

function initBuffers() {
  const cube = new Cube();

  cubePositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubePositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, cube.vertices, gl.STATIC_DRAW);

  cubeUVBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeUVBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, cube.uvs, gl.STATIC_DRAW);
}

function initTextures() {
  const image0 = new Image();
  const image1 = new Image();

  image0.onload = () => {
    sendTextureToGL(image0, 0);
    if (image1.complete) renderScene();
  };
  image1.onload = () => {
    sendTextureToGL(image1, 1);
    if (image0.complete) renderScene();
  };

  image0.src = 'sand.png'; // Texture for floor
  image1.src = 'sky.jpg';  // Texture for skybox
}

function updateAnimationAngles() {
  // how many seconds since we started
  const now     = performance.now() / 1000.0;
  const elapsed = now - g_startTime;

  // slide ±1 unit along X; change the multiplier for a larger sweep
  g_lightPos[0] = Math.cos(elapsed) * 1.0;
}

function tick() {
  updateAnimationAngles();
  renderScene();
  requestAnimationFrame(tick);
}
/*
function updateAnimatoinAngles() {
  g_lightPos[0] = Math.cos(g_seconds);
}
*/


function sendTextureToGL(image, index) {
  const texture = gl.createTexture();
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(index === 0 ? gl.TEXTURE0 : gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.uniform1i(index === 0 ? u_Sampler0 : u_Sampler1, index);
}

function renderScene() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const globalRotate = new Matrix4().rotate(gAnimalGlobalRotation, 0, 1, 0);
  const viewMatrix = g_camera.viewMat;
  const projMatrix = g_camera.projMat;

  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotate.elements);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMatrix.elements);

  gl.uniform1i(u_lightOn, g_lightEnabled ? 1 : 0);

  
  /*
  // Skybox cube
  gl.disable(gl.DEPTH_TEST); // prevent skybox from occluding foreground
  const skybox = new Cube();
  if (g_normalOn) {
    skybox.textureNum = -3;
  } else {
    skybox.textureNum = 1; // sky.jpg
  }
  skybox.color = [1, 1, 1, 1];
  skybox.matrix.setTranslate(-50, -50, -50).scale(100, 100, 100);
  skybox.render(cubePositionBuffer, cubeUVBuffer);
  gl.enable(gl.DEPTH_TEST);
  */

    // Skybox cube (rendered first, with depth test disabled to prevent occlusion)
    gl.disable(gl.DEPTH_TEST); // Disable depth test for skybox
    const skybox = new SkyboxCube(); // <--- CHANGE IS HERE: Using SkyboxCube
    if (g_normalOn) {
      skybox.textureNum = -3; // Visualize normals
    } else {
      skybox.textureNum = 1; // Use sky texture
    }
    skybox.color = [1, 1, 1, 1]; // White color for texture
    skybox.matrix.setTranslate(-50, -50, -50).scale(100, 100, 100);
    skybox.render();
    gl.enable(gl.DEPTH_TEST); // Re-enable depth test for other objects

  // Floor
  const floor = new Cube();
  if (g_normalOn) {
    floor.textureNum = -3;
  } else {
    floor.textureNum = 0; // sand
  }
  floor.matrix.setTranslate(-3, 0, -3).scale(6, 0.01, 6);
  floor.render(cubePositionBuffer, cubeUVBuffer);


    gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);

    //Light
    var light = new Cube();
    light.color = [2,2,0,1];
    light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
    light.matrix.scale(-0.1, -0.1, -0.1);
    light.matrix.translate(-0.5, -0.5, -0.5);
    light.render();

  // Center cube
  const cube = new Cube();
  cube.color = [0.3, 0.5, 0.7, 1];
  cube.matrix.setTranslate(-0.25, 0.01, -0.25).scale(0.5, 0.5, 0.5);
  cube.normalMatrix.setInverseOf(cube.matrix).transpose();

  // Show normals if enabled
  if (g_normalOn) {
    cube.textureNum = -3;
  } else {
    cube.textureNum = -2; // fallback to solid color
  }
  cube.render(cubePositionBuffer, cubeUVBuffer);


  const sphere = new Sphere();
  sphere.color = [1, 0.5, 0.5, 1];
  if (g_normalOn) {
    sphere.textureNum = -3;
  } else {
    sphere.textureNum = -2;
  }
  sphere.matrix.setTranslate(-0.75, 0.75, 0);
  sphere.matrix.scale(0.5, 0.5, 0.5);
  sphere.normalMatrix.setInverseOf(sphere.matrix).transpose();
  sphere.render();



}

function main() {
  setupWebGL();
  connectGLSL();
  initBuffers();
  initTextures();
  addActionsForHtmlUI();

  g_camera = new Camera();


  //document.onkeydown = () => renderScene();

  // reset startTime here so we start motion from t=0 when the app
  // truly begins:
  g_startTime = performance.now() / 1000.0;

  // start the animation loop
  requestAnimationFrame(tick);

  gl.clearColor(0.5, 0.7, 1.0, 1.0); // fallback color
}
