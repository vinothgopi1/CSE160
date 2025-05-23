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
