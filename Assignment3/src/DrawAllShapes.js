function drawCactus() {
   // Cactus Main Body
   var body = new Cube();
   body.color = [0.0, 0.5, 0.2, 1.0]; // Dark green color
   body.textureNum = -2; // Use solid color
   
   var bodyMatrix = new Matrix4();
   // Position the body so its base is at y = -0.25 (on the floor)
   bodyMatrix.translate(-0.1, -0.25, -0.1); 
   bodyMatrix.scale(0.2, 0.9, 0.2);      
   body.matrix = bodyMatrix;
   body.renderfast();

   // Left Cactus Arm
   var leftArm = new Cube();
   leftArm.color = [0.0, 0.5, 0.2, 1.0]; // Match body color
   leftArm.textureNum = -2;
   
   var leftArmMatrix = new Matrix4();
   // Make the horizontal part longer
   leftArmMatrix.translate(-0.4, 0.2, -0.1); 
   leftArmMatrix.scale(0.3, 0.15, 0.2);    // Longer horizontal section
   leftArm.matrix = leftArmMatrix;
   leftArm.renderfast();
   
   // Left Arm Vertical Part
   var leftArmUp = new Cube();
   leftArmUp.color = [0.0, 0.5, 0.2, 1.0];
   leftArmUp.textureNum = -2;
   
   var leftArmUpMatrix = new Matrix4();
   leftArmUpMatrix.translate(-0.4, 0.2, -0.1); 
   leftArmUpMatrix.scale(0.15, 0.4, 0.15);   // Taller vertical section
   leftArmUp.matrix = leftArmUpMatrix;
   leftArmUp.renderfast();

   // Right Cactus Arm
   var rightArm = new Cube();
   rightArm.color = [0.0, 0.5, 0.2, 1.0];
   rightArm.textureNum = -2;
   
   var rightArmMatrix = new Matrix4();
   rightArmMatrix.translate(0.1, 0.4, -0.1); 
   rightArmMatrix.scale(0.3, 0.15, 0.2);   // Longer horizontal section
   rightArm.matrix = rightArmMatrix;
   rightArm.renderfast();
   
   // Right Arm Vertical Part
   var rightArmUp = new Cube();
   rightArmUp.color = [0.0, 0.5, 0.2, 1.0];
   rightArmUp.textureNum = -2;
   
   var rightArmUpMatrix = new Matrix4();
   rightArmUpMatrix.translate(0.25, 0.4, -0.1); 
   rightArmUpMatrix.scale(0.15, 0.4, 0.15);   // Taller vertical section
   rightArmUp.matrix = rightArmUpMatrix;
   rightArmUp.renderfast();
   
   // Top Cactus Arm (added third arm)
   var topArm = new Cube();
   topArm.color = [0.0, 0.5, 0.2, 1.0];
   topArm.textureNum = -2;
   
   var topArmMatrix = new Matrix4();
   topArmMatrix.translate(-0.1, 0.65, -0.1); 
   topArmMatrix.scale(0.2, 0.25, 0.2);   // Vertical extension of main body
   topArm.matrix = topArmMatrix;
   topArm.renderfast();
   
   // Add small hole/dimple in the body for visual interest
   var dimple = new Cube();
   dimple.color = [0.0, 0.4, 0.15, 1.0]; // Slightly darker green
   dimple.textureNum = -2;
   
   var dimpleMatrix = new Matrix4();
   dimpleMatrix.translate(0.05, 0.3, -0.05);
   dimpleMatrix.scale(0.05, 0.05, 0.01); // Small flat dimple
   dimple.matrix = dimpleMatrix;
   dimple.renderfast();
   
   // Add thorns
   drawThorns();
   
   // Add red flower on top
   drawFlower();
}

function drawThorns() {
   // Add more thorns all around the cactus
   var thorn = new Cube();
   thorn.color = [0.8, 0.8, 0.6, 1.0]; // Light tan color for thorns
   thorn.textureNum = -2;
   
   // Thorns positions (many more now)
   var thornPositions = [
     // Main body thorns
     {x: 0.1, y: -0.1, z: -0.03},  // Front low
     {x: -0.03, y: 0.0, z: 0.1},   // Right side low
     {x: 0.1, y: 0.2, z: -0.03},   // Front middle
     {x: -0.13, y: 0.2, z: -0.03}, // Left middle
     {x: -0.03, y: 0.3, z: 0.1},   // Right middle
     {x: 0.1, y: 0.5, z: -0.03},   // Front upper
     {x: -0.13, y: 0.5, z: -0.03}, // Left upper
     {x: -0.03, y: 0.5, z: 0.1},   // Right upper
     
     // Left arm thorns
     {x: -0.25, y: 0.25, z: -0.03}, // Top of left arm
     {x: -0.35, y: 0.25, z: -0.03}, // Middle of left arm
     {x: -0.45, y: 0.15, z: -0.03}, // End of left arm horizontal
     {x: -0.45, y: 0.3, z: -0.03},  // Middle of left arm vertical
     {x: -0.45, y: 0.45, z: -0.03}, // Top of left arm vertical
     
     // Right arm thorns
     {x: 0.2, y: 0.45, z: -0.03},  // Top of right arm
     {x: 0.3, y: 0.45, z: -0.03},  // Middle of right arm
     {x: 0.4, y: 0.45, z: -0.03},  // End of right arm horizontal
     {x: 0.3, y: 0.6, z: -0.03},   // Middle of right arm vertical
     {x: 0.3, y: 0.75, z: -0.03},  // Top of right arm vertical
     
     // Top arm thorns
     {x: -0.03, y: 0.75, z: -0.03}, // Front of top arm
     {x: -0.03, y: 0.85, z: -0.03}, // Top of top arm
   ];
   
   for (var i = 0; i < thornPositions.length; i++) {
     var pos = thornPositions[i];
     var thornMatrix = new Matrix4();
     thornMatrix.translate(pos.x, pos.y, pos.z);
     thornMatrix.scale(0.03, 0.03, 0.03); // Small thorns
     thorn.matrix = thornMatrix;
     thorn.renderfast();
   }
}

function drawFlower() {
   // Create a flower using small cubes at the top of the cactus
   // Base of the flower (center)
   var flowerCenter = new Cube();
   flowerCenter.color = [0.8, 0.2, 0.2, 1.0]; // Dark red
   flowerCenter.textureNum = -2;
   
   var centerMatrix = new Matrix4();
   centerMatrix.translate(-0.05, 0.9, -0.05);
   centerMatrix.scale(0.1, 0.05, 0.1);
   flowerCenter.matrix = centerMatrix;
   flowerCenter.renderfast();
   
   // Flower petals (using cubes arranged in a circle)
   var petalPositions = [
     {x: -0.05, y: 0.9, z: -0.15}, // Front petal
     {x: 0.05, y: 0.9, z: -0.05},  // Right petal
     {x: -0.05, y: 0.9, z: 0.05},  // Back petal
     {x: -0.15, y: 0.9, z: -0.05}, // Left petal
     {x: -0.15, y: 0.9, z: -0.15}, // Front-left petal
     {x: 0.05, y: 0.9, z: -0.15},  // Front-right petal
     {x: -0.15, y: 0.9, z: 0.05},  // Back-left petal
     {x: 0.05, y: 0.9, z: 0.05},   // Back-right petal
   ];
   
   for (var i = 0; i < petalPositions.length; i++) {
     var pos = petalPositions[i];
     var petal = new Cube();
     petal.color = [0.9, 0.1, 0.1, 1.0]; // Bright red
     petal.textureNum = -2;
     
     var petalMatrix = new Matrix4();
     petalMatrix.translate(pos.x, pos.y, pos.z);
     petalMatrix.scale(0.1, 0.03, 0.1);
     petal.matrix = petalMatrix;
     petal.renderfast();
   }
   
   // Yellow stamen in the center
   var stamen = new Cube();
   stamen.color = [1.0, 0.8, 0.0, 1.0]; // Yellow
   stamen.textureNum = -2;
   
   var stamenMatrix = new Matrix4();
   stamenMatrix.translate(-0.03, 0.95, -0.03);
   stamenMatrix.scale(0.06, 0.03, 0.06);
   stamen.matrix = stamenMatrix;
   stamen.renderfast();
}

/*

const gridRows  = 20;        // e.g. 20 rows
const gridCols  = 20;        // e.g. 20 columns
const cellSize  = 0.4;       // distance between cell centers
const blockSize = 0.3;      // size of each block
const maxHeight = 3;

// initialize an empty height‐map (all zeros)
let g_map = Array.from({ length: gridRows }, () =>
  Array.from({ length: gridCols }, () => 0)
);

function drawMap() {
  const xOff = gridCols / 2;
  const zOff = gridRows / 2;

  for (let i = 0; i < gridRows; i++) {
    for (let j = 0; j < gridCols; j++) {
      const height = g_map[i][j];
      if (height <= 0) continue;

      // Draw blocks stacked from h=0 up to h=height-1
      for (let h = 0; h < height; h++) {
        const block = new Cube();
        block.color      = [0.5, 0.35, 0.2, 1];
        block.textureNum = -2;

        // world‐space center of cell (j,i), then raise by (h+0.5)*blockSize
        const cx = (j - xOff + 0.5) * cellSize;
        const cz = (i - zOff + 0.5) * cellSize;
        const cy = (h + 0.5) * blockSize;

        block.matrix = new Matrix4()
          .translate(cx, cy, cz)
          .scale(blockSize, blockSize, blockSize);

        block.renderfast();
      }
    }
  }
}
*/



/*

// ─── 1) Configuration ────────────────────────────────────────────────────
const cellSize   = 0.4;    // distance between cell centers
const blockSize  = 0.3;    // size of each block
const maxHeight  = 3;      // user stack cap

// Size of the user‐grid
const gridRows   = 20;
const gridCols   = 20;

// Big procedural wall map size
const wallMapSize = 32;

// ─── 2) Maps ─────────────────────────────────────────────────────────────
// User clicks height‐map
let g_map = Array.from({ length: gridRows }, () =>
  Array.from({ length: gridCols }, () => 0)
);


function drawMap() {
   const rows = g_map.length;
   if (rows === 0) return;
   const cols = g_map[0].length;
 
   const xOff = cols / 2;
   const zOff = rows / 2;
 
   for (let i = 0; i < rows; i++) {
     for (let j = 0; j < cols; j++) {
       const height = g_map[i][j];
       if (height <= 0) continue;
 
       for (let h = 0; h < height; h++) {
         const block = new Cube();
         block.color      = [0.5, 0.35, 0.2, 1];
         block.textureNum = -2;
 
         // world‐space center of cell (j,i), layer h
         const cx = (j - xOff + 0.5) * cellSize;
         const cz = (i - zOff + 0.5) * cellSize;
         const cy = (h + 0.5) * blockSize;
 
         block.matrix = new Matrix4()
           .translate(cx, cy, cz)
           .scale(blockSize, blockSize, blockSize);
 
         block.renderfast();
       }
     }
   }
 }

let wallMap = [
   [1, 0, 0, 1],
   [1, 1, 0, 1],
   [1, 0, 0, 1],
   [1, 1, 1, 1]
 ];
 
 // Expand to a 32x32 map with more interesting wall patterns
 function generateWallMap(size) {
   // Initialize an empty map filled with zeros
   let map = Array.from({ length: size }, () =>
     Array.from({ length: size }, () => 0)
   );
   
   // Create outer walls (border)
   for (let i = 0; i < size; i++) {
     map[0][i] = 3;           // Top wall (height 3)
     map[size-1][i] = 3;      // Bottom wall (height 3)
     map[i][0] = 3;           // Left wall (height 3)
     map[i][size-1] = 3;      // Right wall (height 3)
   }
   
   // Create some internal structure - a simple maze pattern
   for (let i = 5; i < size-5; i += 6) {
     for (let j = 0; j < size; j++) {
       if (j % 8 !== 0) {     // Leave some gaps for passages
         map[i][j] = 2;       // Horizontal walls (height 2)
       }
     }
   }
   
   for (let j = 5; j < size-5; j += 6) {
     for (let i = 0; i < size; i++) {
       if (i % 8 !== 0) {     // Leave some gaps for passages
         map[i][j] = 2;       // Vertical walls (height 2)
       }
     }
   }
   
   // Add some taller structures at intersections
   for (let i = 11; i < size-5; i += 12) {
     for (let j = 11; j < size-5; j += 12) {
       map[i][j] = 4;         // Tall pillars (height 4)
       map[i+1][j] = 4;
       map[i][j+1] = 4;
       map[i+1][j+1] = 4;
     }
   }
   
   // Add some random walls
   for (let i = 0; i < size; i++) {
     for (let j = 0; j < size; j++) {
       // Skip if already has a wall
       if (map[i][j] > 0) continue;
       
       // 5% chance of adding a random wall
       if (Math.random() < 0.05) {
         map[i][j] = Math.floor(Math.random() * 3) + 1; // Random height 1-3
       }
     }
   }
   
   // Ensure there's a clear path in the center (where your cactus is)
   const center = Math.floor(size / 2);
   for (let i = center-2; i <= center+2; i++) {
     for (let j = center-2; j <= center+2; j++) {
       if (i >= 0 && i < size && j >= 0 && j < size) {
         map[i][j] = 0; // Clear area around center
       }
     }
   }
   
   return map;
 }
 
 // Create our 32x32 wall map
 const wallMapSize = 32;
 let wallMap32 = generateWallMap(wallMapSize);
 
 // Function to draw walls based on the map
 function drawWalls() {
   const xOff = wallMapSize / 2;
   const zOff = wallMapSize / 2;
   
   // Wall block colors - different colors for different heights
   const wallColors = [
     [0.6, 0.4, 0.2, 1.0],  // Height 1 - Light brown
     [0.5, 0.35, 0.2, 1.0], // Height 2 - Medium brown
     [0.4, 0.3, 0.2, 1.0],  // Height 3 - Dark brown
     [0.35, 0.25, 0.15, 1.0] // Height 4 - Very dark brown
   ];
 
   // Loop through the map
   for (let i = 0; i < wallMapSize; i++) {
     for (let j = 0; j < wallMapSize; j++) {
       const height = wallMap32[i][j];
       if (height <= 0) continue; // Skip empty spaces
       
       // Draw blocks stacked from h=0 up to h=height-1
       for (let h = 0; h < height; h++) {
         const block = new Cube();
         
         // Choose color based on height (capped at wallColors.length)
         const colorIndex = Math.min(height - 1, wallColors.length - 1);
         block.color = wallColors[colorIndex];
         block.textureNum = -2; // Use solid color
         
         // Calculate position
         const cx = (j - xOff + 0.5) * cellSize;
         const cz = (i - zOff + 0.5) * cellSize;
         const cy = (h + 0.5) * blockSize;
         
         // Set transformation matrix
         block.matrix = new Matrix4()
           .translate(cx, cy, cz)
           .scale(blockSize, blockSize, blockSize);
         
         // Render the block
         block.renderfast();
       }
     }
   }
 }
 
 function drawAllShapes() {
   // clear buffers
   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
 
   // 1) Skybox
   const sky = new Cube();
   sky.textureNum = 1;
   sky.matrix = new Matrix4()
                  .scale(50, 50, 50)
                  .translate(-0.5, -0.5, -0.5);
   sky.render();
 
   // 2) Ground plane
   const floor = new Cube();
   floor.textureNum = 0;
   floor.matrix = new Matrix4()
                    .translate(0, -0.01, 0)
                    .scale(wallMapSize, 0.0, wallMapSize)
                    .translate(-0.5, 0, -0.5);
   floor.render();
 
   // 3) Cactus in place of tree
   drawCactus();
 
   // 4) All user-placed blocks
   drawMap();
   
   // 5) Add walls from the wallMap
   drawWalls();
 }
 



/*
 // ─── 2) drawAllShapes, mimicking your original tree call ─────────────────
 function drawAllShapes() {
   // clear buffers
   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
 
   // 1) Skybox
   const sky = new Cube();
   sky.textureNum = 1;
   sky.matrix     = new Matrix4()
                       .scale(50,50,50)
                       .translate(-0.5,-0.5,-0.5);
   sky.render();
 
   // 2) Ground plane
   const floor = new Cube();
   floor.textureNum = 0;
   floor.matrix     = new Matrix4()
                         .translate(0, -0.01, 0)
                         .scale(gridCols, 0.0, gridRows)
                         .translate(-0.5, 0, -0.5);
   floor.render();
 
   // 3) Cactus in place of tree
   drawCactus();
 
   // 4) All user‑placed blocks
   drawMap();
 }
 */


 // DrawAllShapes.js

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
// User‐placed block height map (initialized to zeros)
let g_map = Array.from({ length: gridRows }, () =>
  Array.from({ length: gridCols }, () => 0)
);

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

// ─── 3) Drawing Functions ────────────────────────────────────────────────

function drawMap() {
  const rows = g_map.length;
  if (rows === 0) return;
  const cols = g_map[0].length;

  const xOff = cols / 2;
  const zOff = rows / 2;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const height = g_map[i][j];
      if (height <= 0) continue;

      for (let h = 0; h < height; h++) {
        const block = new Cube();
        block.color      = [0.5, 0.35, 0.2, 1];
        block.textureNum = -2;

        const cx = (j - xOff + 0.5) * cellSize;
        const cz = (i - zOff + 0.5) * cellSize;
        const cy = (h + 0.5) * blockSize;

        block.matrix = new Matrix4()
          .translate(cx, cy, cz)
          .scale(blockSize, blockSize, blockSize);

        block.renderfast();
      }
    }
  }
}

function drawWalls() {
  const xOff = wallMapSize / 2;
  const zOff = wallMapSize / 2;

  const wallColors = [
    [0.6, 0.4, 0.2, 1.0],
    [0.5, 0.35, 0.2, 1.0],
    [0.4, 0.3, 0.2, 1.0],
    [0.35, 0.25, 0.15, 1.0]
  ];

  for (let i = 0; i < wallMapSize; i++) {
    for (let j = 0; j < wallMapSize; j++) {
      const height = wallMap32[i][j];
      if (height <= 0) continue;

      for (let h = 0; h < height; h++) {
        const block = new Cube();
        const colorIdx = Math.min(height - 1, wallColors.length - 1);
        block.color      = wallColors[colorIdx];
        block.textureNum = -2;

        const cx = (j - xOff + 0.5) * cellSize;
        const cz = (i - zOff + 0.5) * cellSize;
        const cy = (h + 0.5) * blockSize;

        block.matrix = new Matrix4()
          .translate(cx, cy, cz)
          .scale(blockSize, blockSize, blockSize);

        block.renderfast();
      }
    }
  }
}

function drawAllShapes() {
  // Clear
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // 1) Skybox
  const sky = new Cube();
  sky.textureNum = 1;
  sky.matrix     = new Matrix4()
                      .scale(50, 50, 50)
                      .translate(-0.5, -0.5, -0.5);
  sky.render();

  // 2) Ground plane
  const floor = new Cube();
  floor.textureNum = 0;
  floor.matrix     = new Matrix4()
                        .translate(0, -0.01, 0)
                        .scale(wallMapSize, 0.0, wallMapSize)
                        .translate(-0.5, 0, -0.5);
  floor.render();

  // 3) Cactus (or tree)  
  drawCactus();  // call your existing drawCactus()

  // 4) User‐placed blocks
  drawMap();

  // 5) Procedural walls
  drawWalls();
}
