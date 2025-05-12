// ─── 1) Configuration ────────────────────────────────────────────────────
const cellSize   = 0.4;    // distance between cell centers
const blockSize  = 0.3;    // size of each block
const maxHeight  = 3;      // user stack cap

// Size of the user‐grid
const gridRows   = 20;
const gridCols   = 20;

// Size of the procedural wall map
const wallMapSize = 32;

// ─── 2) Map Data ─────────────────────────────────────────────────────────
// User‐placed block height map (declared, will be initialized in initWorld)
let g_map;

// Generate a 32×32 procedural wall map
function generateWallMap(size) {
  let map = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => 0)
  );

  // Outer border walls (height 3)
  for (let i = 0; i < size; i++) {
    map[0][i]       = 3;
    map[size - 1][i] = 3;
    map[i][0]       = 3;
    map[i][size - 1] = 3;
  }

  // Internal maze pattern (height 2)
  for (let i = 5; i < size - 5; i += 6) {
    for (let j = 0; j < size; j++) {
      if (j % 8 !== 0) map[i][j] = 2;
    }
  }
  for (let j = 5; j < size - 5; j += 6) {
    for (let i = 0; i < size; i++) {
      if (i % 8 !== 0) map[i][j] = 2;
    }
  }

  // Pillars at intersections (height 4)
  for (let i = 11; i < size - 5; i += 12) {
    for (let j = 11; j < size - 5; j += 12) {
      map[i][j]     = 4;
      map[i + 1][j] = 4;
      map[i][j + 1] = 4;
      map[i + 1][j + 1] = 4;
    }
  }

  // Random walls (5% chance, height 1–3)
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (map[i][j] === 0 && Math.random() < 0.05) {
        map[i][j] = Math.floor(Math.random() * 3) + 1;
      }
    }
  }

  // Clear a 5×5 area around center
  const center = Math.floor(size / 2);
  for (let di = -2; di <= 2; di++) {
    for (let dj = -2; dj <= 2; dj++) {
      const i = center + di, j = center + dj;
      if (i >= 0 && i < size && j >= 0 && j < size) {
        map[i][j] = 0;
      }
    }
  }

  return map;
}

let wallMap32 = generateWallMap(wallMapSize);

function initWorld() {
  // Initialize an empty height‐map (all zeros) on each call
  g_map = Array.from({ length: gridRows }, () =>
    Array.from({ length: gridCols }, () => 0)
  );
  console.log("World map initialized.");
  // You can add code here to create an initial world layout in g_map
  // For example, to place some initial walls that appear every time:
  // g_map[5][5] = 2;
  // g_map[10][10] = 3;
}


// ─── 3) Drawing Functions ────────────────────────────────────────────────

function drawMap(cube, positionBuffer) {
  const rows = g_map.length;
  if (!rows) return;
  const cols = g_map[0].length;
  const xOff = cols / 2, zOff = rows / 2;

  const m = new Matrix4();
  cube.color = [0.5, 0.35, 0.2, 1];
  cube.textureNum = -2;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const height = g_map[i][j];
      if (height <= 0) continue;

      for (let h = 0; h < height; h++) {
        const cx = (j - xOff + 0.5) * cellSize;
        const cz = (i - zOff + 0.5) * cellSize;

        if (g_map[i][j] > 0) {
         console.log("Block Rendered at Grid:", j, i, "World Coords:", cx, (height - 0.5) * blockSize, cz); // Log placement
       }

        const cy = (h + 0.5) * blockSize;

        m.setTranslate(cx, cy, cz);
        m.scale(blockSize, blockSize, blockSize);
        cube.matrix = m;
        cube.renderfast(positionBuffer);
      }
    }
  }
}

function drawWalls(cube, positionBuffer) {
  const xOff = wallMapSize / 2;
  const zOff = wallMapSize / 2;

  const wallColors = [
    [0.6, 0.4, 0.2, 1.0],
    [0.5, 0.35, 0.2, 1.0],
    [0.4, 0.3, 0.2, 1.0],
    [0.35, 0.25, 0.15, 1.0]
  ];

  const m = new Matrix4();
  cube.textureNum = -2;

  for (let i = 0; i < wallMapSize; i++) {
    for (let j = 0; j < wallMapSize; j++) {
      const height = wallMap32[i][j];
      if (height <= 0) continue;

      for (let h = 0; h < height; h++) {
        const colorIdx = Math.min(height - 1, wallColors.length - 1);
        cube.color = wallColors[colorIdx];

        const cx = (j - xOff + 0.5) * cellSize;
        const cz = (i - zOff + 0.5) * cellSize;
        const cy = (h + 0.5) * blockSize;

        m.setTranslate(cx, cy, cz);
        m.scale(blockSize, blockSize, blockSize);
        cube.matrix = m;
        cube.renderfast(positionBuffer);
      }
    }
  }
}

function drawCactus(cube, positionBuffer) {
  cube.color = [0.0, 0.5, 0.2, 1.0]; // Dark green color
  cube.textureNum = -2;

  let m = new Matrix4();

  // Cactus Main Body
  m.setTranslate(-0.1, -0.25, -0.1);
  m.scale(0.2, 0.9, 0.2);
  cube.matrix = m;
  cube.renderfast(positionBuffer);

  // Left Cactus Arm
  m = new Matrix4();
  m.translate(-0.4, 0.2, -0.1);
  m.scale(0.3, 0.15, 0.2);
  cube.matrix = m;
  cube.renderfast(positionBuffer);

  // Left Arm Vertical Part
  m = new Matrix4();
  m.translate(-0.4, 0.2, -0.1);
  m.scale(0.15, 0.4, 0.15);
  cube.matrix = m;
  cube.renderfast(positionBuffer);

  // Right Cactus Arm
  m = new Matrix4();
  m.translate(0.1, 0.4, -0.1);
  m.scale(0.3, 0.15, 0.2);
  cube.matrix = m;
  cube.renderfast(positionBuffer);

  // Right Arm Vertical Part
  m = new Matrix4();
  m.translate(0.25, 0.4, -0.1);
  m.scale(0.15, 0.4, 0.15);
  cube.matrix = m;
  cube.renderfast(positionBuffer);

  // Top Cactus Arm (added third arm)
  m = new Matrix4();
  m.translate(-0.1, 0.65, -0.1);
  m.scale(0.2, 0.25, 0.2);
  cube.matrix = m;
  cube.renderfast(positionBuffer);

  // Add small hole/dimple in the body for visual interest
  let dimpleCube = new Cube(); // Use a separate instance for different color
  dimpleCube.color = [0.0, 0.4, 0.15, 1.0]; // Slightly darker green
  dimpleCube.textureNum = -2;
  m = new Matrix4();
  m.translate(0.05, 0.3, -0.05);
  m.scale(0.05, 0.05, 0.01);
  dimpleCube.matrix = m;
  dimpleCube.renderfast(positionBuffer);

  // Add thorns
  drawThorns(cube, positionBuffer);

  // Add red flower on top
  drawFlower(cube, positionBuffer);
}

function drawThorns(cube, positionBuffer) {
  cube.color = [0.8, 0.8, 0.6, 1.0]; // Light tan color for thorns
  cube.textureNum = -2;

  var thornPositions = [
    // Main body thorns
    { x: 0.1, y: -0.1, z: -0.03 },  // Front low
    { x: -0.03, y: 0.0, z: 0.1 },   // Right side low
    { x: 0.1, y: 0.2, z: -0.03 },   // Front middle
    { x: -0.13, y: 0.2, z: -0.03 }, // Left middle
    { x: -0.03, y: 0.3, z: 0.1 },   // Right middle
    { x: 0.1, y: 0.5, z: -0.03},   // Front upper
    { x: -0.13, y: 0.5, z: -0.03 }, // Left upper
    { x: -0.03, y: 0.5, z: 0.1 },   // Right upper

    // Left arm thorns
    { x: -0.25, y: 0.25, z: -0.03 }, // Top of left arm
    { x: -0.35, y: 0.25, z: -0.03 }, // Middle of left arm
    { x: -0.45, y: 0.15, z: -0.03 }, // End of left arm horizontal
    { x: -0.45, y: 0.3, z: -0.03 },  // Middle of left arm vertical
    { x: -0.45, y: 0.45, z: -0.03 }, // Top of left arm vertical

    // Right arm thorns
    { x: 0.2, y: 0.45, z: -0.03 },  // Top of right arm
    { x: 0.3, y: 0.45, z: -0.03 },  // Middle of right arm
    { x: 0.4, y: 0.45, z: -0.03 },  // End of right arm horizontal
    { x: 0.3, y: 0.6, z: -0.03 },   // Middle of right arm vertical
    { x: 0.3, y: 0.75, z: -0.03 },  // Top of right arm vertical

    // Top arm thorns
    { x: -0.03, y: 0.75, z: -0.03 }, // Front of top arm
    { x: -0.03, y: 0.85, z: -0.03 }, // Top of top arm
  ];

  let m = new Matrix4();
  for (var i = 0; i < thornPositions.length; i++) {
    var pos = thornPositions[i];
    m.setTranslate(pos.x, pos.y, pos.z);
    m.scale(0.03, 0.03, 0.03); // Small thorns
    cube.matrix = m;
    cube.renderfast(positionBuffer);
  }
}

function drawFlower(cube, positionBuffer) {
  // Base of the flower (center)
  let flowerCenterCube = new Cube();
  flowerCenterCube.color = [0.8, 0.2, 0.2, 1.0]; // Dark red
  flowerCenterCube.textureNum = -2;
  let m = new Matrix4();
  m.translate(-0.05, 0.9, -0.05);
  m.scale(0.1, 0.05, 0.1);
  flowerCenterCube.matrix = m;
  flowerCenterCube.renderfast(positionBuffer);

  // Flower petals (using cubes arranged in a circle)
  var petalPositions = [
    { x: -0.05, y: 0.9, z: -0.15 }, // Front petal
    { x: 0.05, y: 0.9, z: -0.05 },  // Right petal
    { x: -0.05, y: 0.9, z: 0.05 },  // Back petal
    { x: -0.15, y: 0.9, z: -0.05 }, // Left petal
    { x: -0.15, y: 0.9, z: -0.15 }, // Front-left petal
    { x: 0.05, y: 0.9, z: -0.15 },  // Front-right petal
    { x: -0.15, y: 0.9, z: 0.05 },  // Back-left petal
    { x: 0.05, y: 0.9, z: 0.05 },   // Back-right petal
  ];

  let petalCube = new Cube();
  petalCube.color = [0.9, 0.1, 0.1, 1.0];
  petalCube.textureNum = -2;
  m = new Matrix4();
  for (var i = 0; i < petalPositions.length; i++) {
    var pos = petalPositions[i];
    m.setTranslate(pos.x, pos.y, pos.z);
    m.scale(0.1, 0.03, 0.1);
    petalCube.matrix = m;
    petalCube.renderfast(positionBuffer);
  }

  // Yellow stamen in the center
  let stamenCube = new Cube();
  stamenCube.color = [1.0, 0.8, 0.0, 1.0]; // Yellow
  stamenCube.textureNum = -2;
  m = new Matrix4();
  m.translate(-0.03, 0.95, -0.03);
  m.scale(0.06, 0.03, 0.06);
  stamenCube.matrix = m;
  stamenCube.renderfast(positionBuffer);
}

function drawAllShapes(positionBuffer, uvBuffer) {
  // Clear
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Create a single cube instance to reuse for non-textured objects
  const solidCube = new Cube();

  // 1) Skybox
  const sky = new Cube();
  sky.textureNum = 1;
  sky.matrix = new Matrix4()
    .scale(50, 50, 50)
    .translate(-0.5, -0.5, -0.5);
  sky.render(positionBuffer, uvBuffer); // Sky uses textures

  // 2) Ground plane
  const floor = new Cube();
  floor.textureNum = 0;
  floor.matrix = new Matrix4()
    .translate(0, -0.01, 0)
    .scale(wallMapSize, 0.0, wallMapSize)
    .translate(-0.5, 0, -0.5);
  floor.render(positionBuffer, uvBuffer); // Ground uses textures

  // 3) Cactus (or tree)
  drawCactus(solidCube, positionBuffer);

  // 4) User‐placed blocks
  drawMap(solidCube, positionBuffer);

  // 5) Procedural walls
  drawWalls(solidCube, positionBuffer);
}