/*
class Cube {
    constructor(){
        this.type = 'cube';
        //this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        //this.size = 5.0;
        //this.segments = 10.0;
        this.matrix = new Matrix4();
    }

    render() {
        //var xy = this.position;
        var rgba = this.color;

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);


        drawTriangle3D([0.0, 0.0, 0.0,   1.0, 1.0, 0.0,   1.0, 0.0, 0.0]);
        drawTriangle3D([0.0, 0.0, 0.0,   0.0, 1.0, 0.0,   1.0, 1.0, 0.0]);

        gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);

        drawTriangle3D( [0,1,0,  0,1,1,  1,1,1]);
        drawTriangle3D( [0,1,0,  1,1,1,  1,1,0]);

        //––– RIGHT FACE (X=1) ––– 
        gl.uniform4f(u_FragColor,
            rgba[0] * 0.8, rgba[1] * 0.8, rgba[2] * 0.8, rgba[3]
        );

        drawTriangle3D([1.0, 0.0, 0.0,   1.0, 0.0, 1.0,   1.0, 1.0, 1.0]);
        drawTriangle3D([1.0, 0.0, 0.0,   1.0, 1.0, 1.0,   1.0, 1.0, 0.0]);




    }
}
*/
function drawCube(modelMatrix, rgba) {
    const [r, g, b, a] = rgba;
  
    // 1) upload the model matrix
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  
    // FRONT face (z=0)
    gl.uniform4f(u_FragColor, r*1.00, g*1.00, b*1.00, a);
    drawTriangle3D([0,0,0,  1,1,0,  1,0,0]);
    drawTriangle3D([0,0,0,  0,1,0,  1,1,0]);
  
    // TOP face (y=1)
    gl.uniform4f(u_FragColor, r*0.98, g*0.98, b*0.98, a);
    drawTriangle3D([0,1,0,  0,1,1,  1,1,1]);
    drawTriangle3D([0,1,0,  1,1,1,  1,1,0]);
  
    // RIGHT face (x=1)
    gl.uniform4f(u_FragColor, r*0.96, g*0.96, b*0.96, a);
    drawTriangle3D([1,0,0,  1,0,1,  1,1,1]);
    drawTriangle3D([1,0,0,  1,1,1,  1,1,0]);
  
    // BACK face (z=1)
    gl.uniform4f(u_FragColor, r*0.94, g*0.94, b*0.94, a);
    drawTriangle3D([0,0,1,  1,0,1,  1,1,1]);
    drawTriangle3D([0,0,1,  1,1,1,  0,1,1]);
  
    // LEFT face (x=0)
    gl.uniform4f(u_FragColor, r*0.92, g*0.92, b*0.92, a);
    drawTriangle3D([0,0,0,  0,1,0,  0,1,1]);
    drawTriangle3D([0,0,0,  0,1,1,  0,0,1]);
  
    // BOTTOM face (y=0)
    gl.uniform4f(u_FragColor, r*0.90, g*0.90, b*0.90, a);
    drawTriangle3D([0,0,0,  1,0,0,  1,0,1]);
    drawTriangle3D([0,0,0,  1,0,1,  0,0,1]);
  }
  
  /**
   * Cube class wraps a model matrix and color, and simply calls drawCube().
   */
  class Cube {
    constructor(color = [1.0, 1.0, 1.0, 1.0]) {
      this.matrix = new Matrix4();
      this.color  = color.slice();
    }
  
    render() {
      drawCube(this.matrix, this.color);
    }
  }
  
