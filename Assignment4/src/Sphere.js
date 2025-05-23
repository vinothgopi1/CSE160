/*

class Sphere {
    constructor() {
      this.type = "sphere";
      this.color = [1.0, 1.0, 1.0, 1.0];
      this.matrix = new Matrix4();
      this.textureNum = -2; // Default: solid color (-2) or normals (-3)
    }
  
    // Move the sphere in world space
    translate(x, y, z) {
      this.matrix.translate(x, y, z);
    }
  
    // Normalize a 3‑component vector
    normalize(p) {
      const len = Math.hypot(p[0], p[1], p[2]);
      return [p[0] / len, p[1] / len, p[2] / len];
    }
  
    render() {
      console.log("Sphere rendering with textureNum:", this.textureNum);
  
      // 1) Upload debug-mode or texture choice
      gl.uniform1i(u_whichTexture, this.textureNum);
      // 2) Upload color (used for solid‑color debug)
      gl.uniform4f(u_FragColor, ...this.color);
      // 3) Upload your model matrix
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
  
      // **If we're in "debug" mode (textureNum < 0), disable UV so the shader
      //  can fall into your -3 normals branch.**
      if (this.textureNum < 0 && a_UV >= 0) {
        gl.disableVertexAttribArray(a_UV);
      }
  
      // sphere tessellation steps
      const d  = Math.PI / 10;
      const dd = Math.PI / 10;
  
      for (let t = 0; t < Math.PI;      t += d) {
        for (let r = 0; r < 2*Math.PI;  r += d) {
          // build four corner points
          const p1 = [ Math.sin(t)      * Math.cos(r),       Math.sin(t)      * Math.sin(r),       Math.cos(t)      ];
          const p2 = [ Math.sin(t+dd)   * Math.cos(r),       Math.sin(t+dd)   * Math.sin(r),       Math.cos(t+dd)   ];
          const p3 = [ Math.sin(t)      * Math.cos(r+dd),    Math.sin(t)      * Math.sin(r+dd),    Math.cos(t)      ];
          const p4 = [ Math.sin(t+dd)   * Math.cos(r+dd),    Math.sin(t+dd)   * Math.sin(r+dd),    Math.cos(t+dd)   ];
  
          // UV coords
          const uv1 = [ t/Math.PI,         r/(2*Math.PI) ];
          const uv2 = [ (t+dd)/Math.PI,    r/(2*Math.PI) ];
          const uv3 = [ t/Math.PI,         (r+dd)/(2*Math.PI) ];
          const uv4 = [ (t+dd)/Math.PI,    (r+dd)/(2*Math.PI) ];
  
          // normals = same as positions for unit sphere        
          const n1 = this.normalize(p1);
          const n2 = this.normalize(p2);
          const n3 = this.normalize(p3);
          const n4 = this.normalize(p4);
  
          // Triangle #1: p1, p2, p4
          drawTriangle3DUVNormal(
            [...p1, ...p2, ...p4],
            [...uv1, ...uv2, ...uv4],
            [...n1, ...n2, ...n4]
          );
  
          // Triangle #2: p1, p4, p3
          drawTriangle3DUVNormal(
            [...p1, ...p4, ...p3],
            [...uv1, ...uv4, ...uv3],
            [...n1, ...n4, ...n3]
          );
        }
      }
    }
  }
*/

class Sphere {
    constructor() {
      this.type       = "sphere";
      this.color      = [1.0, 1.0, 1.0, 1.0];
      this.matrix     = new Matrix4();
      this.normalMatrix = new Matrix4();
      this.textureNum = -2;  // –2=solid‑color, –3=normals‑visualize
    }
  
    normalize(p) {
      const len = Math.hypot(p[0],p[1],p[2]);
      return [ p[0]/len, p[1]/len, p[2]/len ];
    }
  
    render() {
      // 1) tell the shader which mode we're in
      gl.uniform1i(u_whichTexture, this.textureNum);
  
      // 2) if in solid‑color mode, upload this.color so lighting tints it correctly
      if (this.textureNum === -2) {
        gl.uniform4f(
          u_FragColor,
          this.color[0],
          this.color[1],
          this.color[2],
          this.color[3]
        );
        // make sure UV is off so fragment shader doesn't try to sample a texture
        if (a_UV >= 0) gl.disableVertexAttribArray(a_UV);
      }
      // (if textureNum===-3 you’ll still hit the normals‑branch in the shader)

      // compute normalMatrix = inverse(modelMatrix)^T
        this.normalMatrix.setInverseOf(this.matrix);
        this.normalMatrix.transpose();
        gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);
  
      // 3) upload your sphere's model matrix
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
  
      // 4) now draw all your little triangles exactly as before
      const d  = Math.PI / 10;
      const dd = Math.PI / 10;
  
      for (let t = 0; t < Math.PI;   t += d) {
        for (let r = 0; r < 2*Math.PI; r += d) {
          const p1 = [ Math.sin(t)*Math.cos(r),      Math.sin(t)*Math.sin(r),      Math.cos(t)    ];
          const p2 = [ Math.sin(t+dd)*Math.cos(r),   Math.sin(t+dd)*Math.sin(r),   Math.cos(t+dd) ];
          const p3 = [ Math.sin(t)*Math.cos(r+dd),   Math.sin(t)*Math.sin(r+dd),   Math.cos(t)    ];
          const p4 = [ Math.sin(t+dd)*Math.cos(r+dd),Math.sin(t+dd)*Math.sin(r+dd),Math.cos(t+dd) ];
  
          const uv1 = [ t/Math.PI,       r/(2*Math.PI) ];
          const uv2 = [ (t+dd)/Math.PI,  r/(2*Math.PI) ];
          const uv3 = [ t/Math.PI,       (r+dd)/(2*Math.PI) ];
          const uv4 = [ (t+dd)/Math.PI,  (r+dd)/(2*Math.PI) ];
  
          const n1 = this.normalize(p1);
          const n2 = this.normalize(p2);
          const n3 = this.normalize(p3);
          const n4 = this.normalize(p4);
  
          // Triangle #1
          drawTriangle3DUVNormal(
            [...p1, ...p2, ...p4],
            [...uv1, ...uv2, ...uv4],
            [...n1, ...n2, ...n4]
          );
          // Triangle #2
          drawTriangle3DUVNormal(
            [...p1, ...p4, ...p3],
            [...uv1, ...uv4, ...uv3],
            [...n1, ...n4, ...n3]
          );
        }
      }
    }
  }
  
  
  