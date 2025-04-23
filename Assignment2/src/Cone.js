class Cone {
    constructor(segments = 20) {
        this.type     = 'cone';
        this.color    = [1.0, 1.0, 1.0, 1.0];
        this.matrix   = new Matrix4();
        this.segments = segments;
    }

    render() {
        var rgba = this.color;

        // set color & model matrix
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // draw lateral surface as a triangle‐fan from the apex (0,1,0)
        for (var i = 0; i < this.segments; i++) {
            var t1 = (2.0 * Math.PI * i)     / this.segments;
            var t2 = (2.0 * Math.PI * (i+1)) / this.segments;
            var x1 = Math.cos(t1), z1 = Math.sin(t1);
            var x2 = Math.cos(t2), z2 = Math.sin(t2);

            drawTriangle3D([
                0.0, 1.0, 0.0,   // apex
                x1,  0.0, z1,    // base vertex 1
                x2,  0.0, z2     // base vertex 2
            ]);
        }
    }
}
