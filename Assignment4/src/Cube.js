/*
class Cube {
  constructor() {
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
    this.textureNum = -2; // Default to debug color
    this.vertices = new Float32Array([
      // Front face
      0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0,
      0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0,
      // Back face
      0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0,
      0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0,
      // Top face
      0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0,
      0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0,
      // Bottom face
      0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0,
      1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0,
      // Left face
      0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0,
      0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0,
      // Right face
      1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0,
      1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0,
    ]);
    this.uvs = new Float32Array([
      // Front
      0.0, 0.0, 1.0, 0.0, 1.0, 1.0,
      0.0, 0.0, 1.0, 1.0, 0.0, 1.0,
      // Back
      0.0, 0.0, 1.0, 1.0, 1.0, 0.0,
      0.0, 0.0, 0.0, 1.0, 1.0, 1.0,
      // Top
      0.0, 0.0, 1.0, 0.0, 1.0, 1.0,
      0.0, 0.0, 1.0, 1.0, 0.0, 1.0,
      // Bottom
      0.0, 0.0, 0.0, 1.0, 1.0, 0.0,
      1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
      // Left
      0.0, 0.0, 1.0, 0.0, 1.0, 1.0,
      0.0, 0.0, 0.0, 1.0, 1.0, 1.0,
      // Right
      0.0, 0.0, 1.0, 1.0, 1.0, 0.0,
      0.0, 0.0, 0.0, 1.0, 1.0, 1.0,
    ]);
    this.numVertices = 36;
  }

  render(positionBuffer, uvBuffer) {
    var rgba = this.color;

    gl.uniform1i(u_whichTexture, this.textureNum);
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    if (this.textureNum >= 0) {
      gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
      gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(a_UV);
    } else if (a_UV >= 0) {
      gl.disableVertexAttribArray(a_UV);
    }

    gl.drawArrays(gl.TRIANGLES, 0, this.numVertices);
  }

  renderfast(positionBuffer) {
    var rgba = this.color;

    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniform1i(u_whichTexture, this.textureNum);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    if (a_UV >= 0) {
      gl.disableVertexAttribArray(a_UV);
    }

    gl.drawArrays(gl.TRIANGLES, 0, this.numVertices);
  }
}
*/

/*
class Cube {
  constructor() {
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
    this.normalMatrix = new Matrix4();
    this.textureNum = -2; // Default: solid color
    this.numVertices = 36;

    this.vertices = new Float32Array([
      // Front face
      0, 0, 0,   1, 0, 0,   1, 1, 0,
      0, 0, 0,   1, 1, 0,   0, 1, 0,
      // Back face
      0, 0, 1,   1, 1, 1,   1, 0, 1,
      0, 0, 1,   0, 1, 1,   1, 1, 1,
      // Top face
      0, 1, 0,   1, 1, 0,   1, 1, 1,
      0, 1, 0,   1, 1, 1,   0, 1, 1,
      // Bottom face
      0, 0, 0,   1, 0, 1,   1, 0, 0,
      0, 0, 0,   0, 0, 1,   1, 0, 1,
      // Left face
      0, 0, 0,   0, 1, 1,   0, 1, 0,
      0, 0, 0,   0, 0, 1,   0, 1, 1,
      // Right face
      1, 0, 0,   1, 1, 1,   1, 1, 0,
      1, 0, 0,   1, 0, 1,   1, 1, 1
    ]);

    
    this.uvs = new Float32Array([
      // Front
      0,0, 1,0, 1,1,
      0,0, 1,1, 0,1,
      // Back
      0,0, 1,1, 1,0,
      0,0, 0,1, 1,1,
      // Top
      0,0, 1,0, 1,1,
      0,0, 1,1, 0,1,
      // Bottom
      0,0, 1,1, 1,0,
      0,0, 0,1, 1,1,
      // Left
      0,0, 1,1, 1,0,
      0,0, 0,1, 1,1,
      // Right
      0,0, 1,1, 1,0,
      0,0, 0,1, 1,1
    ]);

    

    this.normals = new Float32Array([
      // Front face (Z-)
      0,0,-1, 0,0,-1, 0,0,-1,
      0,0,-1, 0,0,-1, 0,0,-1,
      // Back face (Z+)
      0,0,1, 0,0,1, 0,0,1,
      0,0,1, 0,0,1, 0,0,1,
      // Top face (Y+)
      0,1,0, 0,1,0, 0,1,0,
      0,1,0, 0,1,0, 0,1,0,
      // Bottom face (Y-)
      0,-1,0, 0,-1,0, 0,-1,0,
      0,-1,0, 0,-1,0, 0,-1,0,
      // Left face (X-)
      -1,0,0, -1,0,0, -1,0,0,
      -1,0,0, -1,0,0, -1,0,0,
      // Right face (X+)
      1,0,0, 1,0,0, 1,0,0,
      1,0,0, 1,0,0, 1,0,0
    ]);
  }

  
  render(positionBuffer, uvBuffer) {
    const rgba = this.color;

    gl.uniform1i(u_whichTexture, this.textureNum);
    //gl.uniform4f(u_FragColor, ...rgba);

    if (this.textureNum < 0) {
      gl.uniform4f(
        u_FragColor,
        this.color[0],
        this.color[1],
        this.color[2],
        this.color[3]
      );
    }

     // compute normalMatrix = inverse(modelMatrix)^T
  this.normalMatrix.setInverseOf(this.matrix);
  this.normalMatrix.transpose();
  // upload it:
  gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);



    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    drawTriangle3DUVNormal(this.vertices, this.uvs, this.normals);
  }
  
  
}


// SkyboxCube class definition (with inward-facing normals)
class SkyboxCube extends Cube {
  constructor() {
      super(); // Call parent constructor to inherit properties
      this.normals = new Float32Array([
          // Front face (Z-) - should point towards +Z for inward
          0,0,1, 0,0,1, 0,0,1,
          0,0,1, 0,0,1, 0,0,1,
          // Back face (Z+) - should point towards -Z for inward
          0,0,-1, 0,0,-1, 0,0,-1,
          0,0,-1, 0,0,-1, 0,0,-1,
          // Top face (Y+) - should point towards -Y for inward
          0,-1,0, 0,-1,0, 0,-1,0,
          0,-1,0, 0,-1,0, 0,-1,0,
          // Bottom face (Y-) - should point towards +Y for inward
          0,1,0, 0,1,0, 0,1,0,
          0,1,0, 0,1,0, 0,1,0,
          // Left face (X-) - should point towards +X for inward
          1,0,0, 1,0,0, 1,0,0,
          1,0,0, 1,0,0, 1,0,0,
          // Right face (X+) - should point towards -X for inward
          -1,0,0, -1,0,0, -1,0,0,
          -1,0,0, -1,0,0, -1,0,0
      ]);
  }
}
*/


// Assuming drawTriangle3DUVNormal is defined globally or accessible:
// This function needs to be correctly defined to accept the actual data.
// It also needs access to the global gl, a_Position, a_UV, a_Normal variables.

/*
function drawTriangle3DUVNormal(vertices, uvs, normals) {
  // Vertices (a_Position)
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); // Create a new buffer for each draw call,
                                                    // or reuse a global one if performance is critical
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  // UVs (a_UV)
  if (uvs && a_UV !== undefined && a_UV >= 0) { // Check if UV data exists and a_UV location is valid
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);
      gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(a_UV);
  } else if (a_UV !== undefined && a_UV >= 0) { // If a_UV is a valid attribute but no UVs provided, disable it
      gl.disableVertexAttribArray(a_UV);
  }

  // Normals (a_Normal)
  if (normals && a_Normal !== undefined && a_Normal >= 0) { // Check if normal data exists and a_Normal location is valid
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
      gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(a_Normal);
  } else if (a_Normal !== undefined && a_Normal >= 0) { // If a_Normal is valid but no normals, disable it
      gl.disableVertexAttribArray(a_Normal);
  }

  gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 3);
}
*/

// This function creates new buffers for each call.
// This is acceptable for single, unique draws, but inefficient for drawing many identical shapes.
// For drawing many cubes, the Cube class itself should manage its buffers (see Cube refactor).
function drawTriangle3DUVNormal(vertices, uvs, normals) {
  const n = vertices.length / 3;

  // --- Position Buffer ---
  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  // --- UV Buffer ---
  if (uvs && a_UV !== undefined && a_UV >= 0) {
      const uvBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);
      gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(a_UV);
  } else if (a_UV !== undefined && a_UV >= 0) {
      gl.disableVertexAttribArray(a_UV);
  }

  // --- Normal Buffer ---
  if (normals && a_Normal !== undefined && a_Normal >= 0) {
      const normalBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
      gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(a_Normal);
  } else if (a_Normal !== undefined && a_Normal >= 0) {
      gl.disableVertexAttribArray(a_Normal);
  }

  // Draw
  gl.drawArrays(gl.TRIANGLES, 0, n);

  // Clean up: Unbind buffers and disable attributes
  // In a real application, you might manage these more carefully
  // if switching between many different object types with different attribute sets.
  gl.disableVertexAttribArray(a_Position);
  if (a_UV >= 0) gl.disableVertexAttribArray(a_UV);
  if (a_Normal >= 0) gl.disableVertexAttribArray(a_Normal);
  // Note: gl.deleteBuffer() is not called here, as it might be slow.
  // Rely on garbage collection for these temporary buffers, but it's not ideal.
  // The true optimization is to *not* create them per draw.
}


/*
class Cube {
constructor() {
  this.color = [1.0, 1.0, 1.0, 1.0];
  this.matrix = new Matrix4();
  this.normalMatrix = new Matrix4();
  this.textureNum = -2; // Default: solid color
  this.numVertices = 36; // This property isn't directly used in the drawArrays call, but good to keep.

  // Define vertices, uvs, and normals in the constructor as you already have.
  // Ensure these arrays are always present.

  this.vertices = new Float32Array([
    // Front face (corrected winding for consistent normal direction if needed later)
    0, 0, 0,   1, 0, 0,   1, 1, 0,
    0, 0, 0,   1, 1, 0,   0, 1, 0,
    // Back face
    0, 0, 1,   1, 1, 1,   1, 0, 1,
    0, 0, 1,   0, 1, 1,   1, 1, 1,
    // Top face
    0, 1, 0,   1, 1, 0,   1, 1, 1,
    0, 1, 0,   1, 1, 1,   0, 1, 1,
    // Bottom face
    0, 0, 0,   1, 0, 1,   1, 0, 0, // Corrected from your original for bottom face winding
    0, 0, 0,   0, 0, 1,   1, 0, 1,
    // Left face
    0, 0, 0,   0, 1, 1,   0, 1, 0,
    0, 0, 0,   0, 0, 1,   0, 1, 1,
    // Right face
    1, 0, 0,   1, 1, 1,   1, 1, 0,
    1, 0, 0,   1, 0, 1,   1, 1, 1
  ]);

  this.uvs = new Float32Array([
    // Front
    0,0, 1,0, 1,1,
    0,0, 1,1, 0,1,
    // Back
    0,0, 1,1, 1,0,
    0,0, 0,1, 1,1,
    // Top
    0,0, 1,0, 1,1,
    0,0, 1,1, 0,1,
    // Bottom
    0,0, 1,1, 1,0, // Bottom face UVs might need adjustment depending on how you want them to map
    0,0, 0,1, 1,1,
    // Left
    0,0, 1,1, 1,0,
    0,0, 0,1, 1,1,
    // Right
    0,0, 1,1, 1,0,
    0,0, 0,1, 1,1
  ]);

  this.normals = new Float32Array([
    // Front face (Z-)
    0,0,-1, 0,0,-1, 0,0,-1,
    0,0,-1, 0,0,-1, 0,0,-1,
    // Back face (Z+)
    0,0,1, 0,0,1, 0,0,1,
    0,0,1, 0,0,1, 0,0,1,
    // Top face (Y+)
    0,1,0, 0,1,0, 0,1,0,
    0,1,0, 0,1,0, 0,1,0,
    // Bottom face (Y-)
    0,-1,0, 0,-1,0, 0,-1,0,
    0,-1,0, 0,-1,0, 0,-1,0,
    // Left face (X-)
    -1,0,0, -1,0,0, -1,0,0,
    -1,0,0, -1,0,0, -1,0,0,
    // Right face (X+)
    1,0,0, 1,0,0, 1,0,0,
    1,0,0, 1,0,0, 1,0,0
  ]);
}

// The render method no longer needs positionBuffer, uvBuffer passed as arguments
// because drawTriangle3DUVNormal creates its own temporary buffers.
// If you want to use the pre-created global buffers (cubePositionBuffer, cubeUVBuffer, cubeNormalBuffer),
// then you'd need to modify drawTriangle3DUVNormal to accept and use those.
// For now, I'll assume drawTriangle3DUVNormal creates its own.
render() { // Removed parameters positionBuffer, uvBuffer
  // 1. Set uniforms that control shader behavior (texture choice, color, light)
  gl.uniform1i(u_whichTexture, this.textureNum);

  // Only upload u_FragColor if not using a texture (i.e., -2 for solid color, -3 for normals)
  // The shader relies on u_FragColor for ambient/diffuse base when not using a texture.
  if (this.textureNum < 0) {
    gl.uniform4f(
      u_FragColor,
      this.color[0],
      this.color[1],
      this.color[2],
      this.color[3]
    );
  }

  // 2. Compute and upload Normal Matrix
  this.normalMatrix.setInverseOf(this.matrix);
  this.normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);

  // 3. Upload Model Matrix
  gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

  // 4. Call the generic drawing helper function with the cube's data
  // This is where the actual buffer binding and attribute enabling happens.
  // It's crucial that drawTriangle3DUVNormal handles enabling/disabling a_UV and a_Normal based on data presence.
  drawTriangle3DUVNormal(this.vertices, this.uvs, this.normals);
}
}


// SkyboxCube class definition (with inward-facing normals)
class SkyboxCube extends Cube {
constructor() {
    super(); // Call parent constructor to inherit properties
    this.normals = new Float32Array([
        // Front face (Z-) - should point towards +Z for inward
        0,0,1, 0,0,1, 0,0,1,
        0,0,1, 0,0,1, 0,0,1,
        // Back face (Z+) - should point towards -Z for inward
        0,0,-1, 0,0,-1, 0,0,-1,
        0,0,-1, 0,0,-1, 0,0,-1,
        // Top face (Y+) - should point towards -Y for inward
        0,-1,0, 0,-1,0, 0,-1,0,
        0,-1,0, 0,-1,0, 0,-1,0,
        // Bottom face (Y-) - should point towards +Y for inward
        0,1,0, 0,1,0, 0,1,0,
        0,1,0, 0,1,0, 0,1,0,
        // Left face (X-) - should point towards +X for inward
        1,0,0, 1,0,0, 1,0,0,
        1,0,0, 1,0,0, 1,0,0,
        // Right face (X+) - should point towards -X for inward
        -1,0,0, -1,0,0, -1,0,0,
        -1,0,0, -1,0,0, -1,0,0
    ]);
}
}
*/

class Cube {
  constructor() {
      this.color = [1.0, 1.0, 1.0, 1.0];
      this.matrix = new Matrix4();
      this.normalMatrix = new Matrix4();
      this.textureNum = -2; // Default: solid color

      // Define vertices, uvs, and normals in the constructor as you already have.
      // These are Float32Array, which is good.
      this.vertices = new Float32Array([
          // Front face
          0, 0, 0, 1, 0, 0, 1, 1, 0,
          0, 0, 0, 1, 1, 0, 0, 1, 0,
          // Back face
          0, 0, 1, 1, 1, 1, 1, 0, 1,
          0, 0, 1, 0, 1, 1, 1, 1, 1,
          // Top face
          0, 1, 0, 1, 1, 0, 1, 1, 1,
          0, 1, 0, 1, 1, 1, 0, 1, 1,
          // Bottom face (corrected winding for consistent normal direction)
          0, 0, 0, 0, 0, 1, 1, 0, 1, // Triangle 1: (0,0,0), (0,0,1), (1,0,1)
          0, 0, 0, 1, 0, 1, 1, 0, 0, // Triangle 2: (0,0,0), (1,0,1), (1,0,0)
          // Left face
          0, 0, 0, 0, 1, 0, 0, 1, 1,
          0, 0, 0, 0, 1, 1, 0, 0, 1,
          // Right face
          1, 0, 0, 1, 1, 0, 1, 1, 1,
          1, 0, 0, 1, 1, 1, 1, 0, 1
      ]);

      this.uvs = new Float32Array([
          // Front
          0, 0, 1, 0, 1, 1,
          0, 0, 1, 1, 0, 1,
          // Back
          0, 0, 1, 1, 1, 0, // UVs usually flipped for back face if texture is same as front
          0, 0, 0, 1, 1, 1,
          // Top
          0, 0, 1, 0, 1, 1,
          0, 0, 1, 1, 0, 1,
          // Bottom
          0, 0, 0, 1, 1, 1, // UVs for corrected winding order
          0, 0, 1, 1, 1, 0,
          // Left
          0, 0, 1, 0, 1, 1,
          0, 0, 0, 1, 1, 1,
          // Right
          0, 0, 1, 0, 1, 1,
          0, 0, 0, 1, 1, 1
      ]);

      this.normals = new Float32Array([
          // Front face (Z-)
          0, 0, -1, 0, 0, -1, 0, 0, -1,
          0, 0, -1, 0, 0, -1, 0, 0, -1,
          // Back face (Z+)
          0, 0, 1, 0, 0, 1, 0, 0, 1,
          0, 0, 1, 0, 0, 1, 0, 0, 1,
          // Top face (Y+)
          0, 1, 0, 0, 1, 0, 0, 1, 0,
          0, 1, 0, 0, 1, 0, 0, 1, 0,
          // Bottom face (Y-)
          0, -1, 0, 0, -1, 0, 0, -1, 0,
          0, -1, 0, 0, -1, 0, 0, -1, 0,
          // Left face (X-)
          -1, 0, 0, -1, 0, 0, -1, 0, 0,
          -1, 0, 0, -1, 0, 0, -1, 0, 0,
          // Right face (X+)
          1, 0, 0, 1, 0, 0, 1, 0, 0,
          1, 0, 0, 1, 0, 0, 1, 0, 0
      ]);

      this.numVertices = this.vertices.length / 3; // Should be 36 for a standard cube (12 triangles * 3 vertices)

      // Create WebGL buffers ONCE in the constructor
      this.vertexBuffer = gl.createBuffer();
      this.uvBuffer = gl.createBuffer();
      this.normalBuffer = gl.createBuffer();

      // Upload data to GPU buffers ONCE
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, this.uvs, gl.STATIC_DRAW);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);
  }

  render() {
      const rgba = this.color;

      // 1. Set uniforms that control shader behavior (texture choice, color, light)
      gl.uniform1i(u_whichTexture, this.textureNum);

      // Only upload u_FragColor if not using a texture (-2 for solid color, -3 for normals)
      if (this.textureNum < 0) {
          gl.uniform4f(
              u_FragColor,
              this.color[0],
              this.color[1],
              this.color[2],
              this.color[3]
          );
          // If not using texture, disable UV attribute array
          if (a_UV >= 0) gl.disableVertexAttribArray(a_UV);
      } else {
          // If using texture, enable UV attribute array and point to its buffer
          if (a_UV >= 0) {
              gl.enableVertexAttribArray(a_UV);
              gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
              gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
          }
      }

      // 2. Compute and upload Normal Matrix
      this.normalMatrix.setInverseOf(this.matrix);
      this.normalMatrix.transpose();
      gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);

      // 3. Upload Model Matrix
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

      // 4. Bind and enable position attribute
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
      gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(a_Position);

      // 5. Bind and enable normal attribute
      gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
      gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(a_Normal);

      // 6. Draw the entire cube with one call
      gl.drawArrays(gl.TRIANGLES, 0, this.numVertices);

      // (Optional) Disable attribute arrays if they are not consistently used by subsequent draws
      // gl.disableVertexAttribArray(a_Position);
      // if (a_UV >= 0) gl.disableVertexAttribArray(a_UV);
      // if (a_Normal >= 0) gl.disableVertexAttribArray(a_Normal);
  }
}
