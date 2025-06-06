
/*
class Triangle{
    constructor(){
       this.color = [1.0, 1.0, 1.0, 1.0];
       this.matrix = new Matrix4();
    }

    render() {
       var rgba = this.color;

       // Pass the color of a point to u_FragColor variable
       gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

       // Pass the matrix to u_ModelMatrix attribute
       gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

       // Front Triangle
       drawTriangle3D([-0.5,0.0,0.0, 0.0,1.0,0.0, 0.5,0.0,0.0 ]);
       //Back Triangle
       drawTriangle3D([-0.5,0.0,0.25, 0.0,1.0,0.25, 0.5,0.0,0.25 ]);
       // Left
       drawTriangle3D([-0.5,0.0,0.25, 0.0,1.0,0.25, 0.0,1.0,0.0 ]);
       drawTriangle3D([-0.5,0.0,0.25, -0.5,0.0,0.0, 0.0,1.0,0.0 ]);
       // Right
       drawTriangle3D([0.5,0.0,0.25, 0.0,1.0,0.25, 0.0,1.0,0.0 ]);
       drawTriangle3D([0.5,0.0,0.25, 0.5,0.0,0.0, 0.0,1.0,0.0 ]);
       // Bottom
       drawTriangle3D([0.5,0.0,0.0, 0.5,0.0,0.25, -0.5,0.0,0.0 ]);
       drawTriangle3D([-0.5,0.0,0.25, -0.5,0.0,0.0, 0.5,0.0,0.0 ]);
    }
   }
*/

class Triangle {
   constructor() {
       this.color = [1.0, 1.0, 1.0, 1.0];
       this.matrix = new Matrix4();
       this.normalMatrix = new Matrix4(); // Added for lighting
       this.textureNum = -2; // Default to solid color (-2)

       // Define all vertices, UVs, and Normals for the entire shape ONCE
       this.vertices = new Float32Array([
           // Front Triangle
           -0.5, 0.0, 0.0, 0.0, 1.0, 0.0, 0.5, 0.0, 0.0,
           // Back Triangle
           -0.5, 0.0, 0.25, 0.0, 1.0, 0.25, 0.5, 0.0, 0.25,
           // Left Face (two triangles)
           -0.5, 0.0, 0.25, 0.0, 1.0, 0.25, 0.0, 1.0, 0.0,
           -0.5, 0.0, 0.25, -0.5, 0.0, 0.0, 0.0, 1.0, 0.0,
           // Right Face (two triangles)
           0.5, 0.0, 0.25, 0.0, 1.0, 0.25, 0.0, 1.0, 0.0,
           0.5, 0.0, 0.25, 0.5, 0.0, 0.0, 0.0, 1.0, 0.0,
           // Bottom Face (two triangles)
           0.5, 0.0, 0.0, 0.5, 0.0, 0.25, -0.5, 0.0, 0.0,
           -0.5, 0.0, 0.25, -0.5, 0.0, 0.0, 0.5, 0.0, 0.0
       ]);

       // You'll need to define UVs and Normals for ALL these vertices
       // For simplicity, I'll only add placeholder normals for now.
       // Calculating correct normals for each face is crucial for proper lighting.
       // Example for one face normal (pointing "up-right-front" for the first triangle)
       // Normals should be perpendicular to each face.
       this.normals = new Float32Array([
           // Front Triangle normal (example, you'll need to calculate for all 8 triangles)
           0.0, 0.5, -0.5, 0.0, 0.5, -0.5, 0.0, 0.5, -0.5, // Simplified: normal for a triangular face
           // ... repeat for all 8 triangles, with correct face normals
           // A common approach is to compute the cross product of two edges of each triangle.
           // For a prism/pyramid, each side face will have a distinct normal.
           // For example, for the first triangle (-0.5,0,0, 0,1,0, 0.5,0,0)
           // edge1 = (0.5 - (-0.5), 0-0, 0-0) = (1,0,0)
           // edge2 = (0 - (-0.5), 1-0, 0-0) = (0.5,1,0)
           // Normal = edge1 x edge2 = (0,0,1) (pointing out of the screen)
           // You need to do this for all 8 faces, adjusting based on vertex winding.
           // For now, I'll put dummy normals so it can run.
           0,0,1, 0,0,1, 0,0,1, // Front
           0,0,-1, 0,0,-1, 0,0,-1, // Back
           // ... and so on for all 24 vertices (8 triangles * 3 vertices/triangle * 3 components/normal)
       ]);

       // Dummy UVs if not used for this shape, or proper UVs if you want textures.
       this.uvs = new Float32Array(this.vertices.length / 3 * 2); // 2 components per UV

       this.numVertices = this.vertices.length / 3;

       // Create buffers once in the constructor
       this.vertexBuffer = gl.createBuffer();
       this.uvBuffer = gl.createBuffer();
       this.normalBuffer = gl.createBuffer();

       // Upload data once to GPU
       gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
       gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);

       gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
       gl.bufferData(gl.ARRAY_BUFFER, this.uvs, gl.STATIC_DRAW);

       gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
       gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);
   }

   render() {
       // Pass the color of a point to u_FragColor variable
       gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
       gl.uniform1i(u_whichTexture, this.textureNum); // Set texture mode

       // Pass the matrix to u_ModelMatrix attribute
       gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

       // Compute and upload Normal Matrix
       this.normalMatrix.setInverseOf(this.matrix);
       this.normalMatrix.transpose();
       gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);


       // Bind and enable position buffer
       gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
       gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
       gl.enableVertexAttribArray(a_Position);

       // Bind and enable UV buffer (if using textures)
       if (this.textureNum >= 0) { // If using a texture
           gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
           gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
           gl.enableVertexAttribArray(a_UV);
       } else { // If not using a texture, disable UVs
           if (a_UV >= 0) gl.disableVertexAttribArray(a_UV);
       }

       // Bind and enable Normal buffer
       gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
       gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
       gl.enableVertexAttribArray(a_Normal);

       // Draw the entire shape with one call
       gl.drawArrays(gl.TRIANGLES, 0, this.numVertices);

       // (Optional) Disable attribute arrays if they are not consistently used by subsequent draws
       // gl.disableVertexAttribArray(a_Position);
       // gl.disableVertexAttribArray(a_UV);
       // gl.disableVertexAttribArray(a_Normal);
   }
}

 function drawTriangle(vertices){
    var n = 3;
    var vertexBuffer = gl.createBuffer();
    if(!vertexBuffer){
       console.log('Failed to create the buffer object');
       return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    // If a_UV was enabled by a 3D textured draw, disable it for this 2D non-textured draw.
    if (a_UV >= 0) { // Check if a_UV is a valid attribute location
        gl.disableVertexAttribArray(a_UV);
    }
    // Similarly for a_Normal if it were used
    // if (a_Normal >= 0) {
    //     gl.disableVertexAttribArray(a_Normal);
    // }

    gl.drawArrays(gl.TRIANGLES, 0, n);
 }

 function drawTriangle3D(vertices){
    var n = vertices.length/3; // Number of vertices
    var vertexBuffer = gl.createBuffer();
    if(!vertexBuffer){
       console.log('Failed to create the buffer object for 3D vertices');
       return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0); // 3 components for 3D
    gl.enableVertexAttribArray(a_Position);

    // Disable a_UV as this function only handles positions
    if (a_UV >= 0) { // Check if a_UV is a valid attribute location
        gl.disableVertexAttribArray(a_UV);
    }
    // Disable a_Normal if it were used and not provided here
    // if (a_Normal >= 0) { // Example if you add normals later
    //     gl.disableVertexAttribArray(a_Normal);
    // }

    gl.drawArrays(gl.TRIANGLES, 0, n);
 }


 function drawTriangle3DUV(vertices, uv){
    var n = vertices.length/3; // Number of vertices, should match for UVs

    // --- Position Buffer ---
    var vertexBuffer = gl.createBuffer();
    if(!vertexBuffer){
       console.log('Failed to create the position buffer object in drawTriangle3DUV');
       return -1;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    // --- UV Buffer ---
    var uvBuffer = gl.createBuffer();
    if(!uvBuffer){
       console.log('Failed to create the UV buffer object in drawTriangle3DUV');
       return -1;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0); // 2 components for UV
    gl.enableVertexAttribArray(a_UV);

    // Disable a_Normal if it were used and not provided here
    // if (a_Normal >= 0) { // Example if you add normals later
    //    gl.disableVertexAttribArray(a_Normal);
    // }

    // Draw ONCE after all attributes are set
    gl.drawArrays(gl.TRIANGLES, 0, n);
 }

 /*
 function drawTriangle3DUVNormal(vertices, uv, normals) {

   var n = vertices.length / 3;
   var vertexBuffer = gl.createBuffer();

   if(!vertexBuffer) {
      console.log("Failed to create the buffer object");
      return -1;
   }

   gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
   gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0); // 3 components for 3D
   gl.enableVertexAttribArray(a_Position);


   // --- UV Buffer ---
   var uvBuffer = gl.createBuffer();
   if(!uvBuffer){
      console.log('Failed to create the UV buffer object in drawTriangle3DUV');
      return -1;
   }
   gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.DYNAMIC_DRAW);
   gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0); // 2 components for UV
   gl.enableVertexAttribArray(a_UV);

   // ---- Buffer Object for Normals ---
   var normalBuffer = gl.createBuffer();
   if (!normalBuffer) {
      console.log("Failed to create buffer object");
      return -1;
   }

   gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.DYNAMIC_DRAW);
   gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(a_Normal);

   gl.drawArrays(gl.TRIANGLES, 0, n);
   //g_vertexBuffer = null;


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