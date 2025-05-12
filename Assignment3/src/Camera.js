
// Camera.js
class Camera {
   constructor() {
       this.fov = 60;
       this.eye = new Vector3([0, .5, 3]);
       this.at = new Vector3([0, 0, -100]);
       this.up = new Vector3([0, 1, 0]);
       this.viewMat = new Matrix4();
       this.viewMat.setLookAt(
           this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
           this.at.elements[0], this.at.elements[1], this.at.elements[2],
           this.up.elements[0], this.up.elements[1], this.up.elements[2]);
       this.projMat = new Matrix4();
       if (typeof canvas !== 'undefined' && canvas) {
           this.projMat.setPerspective(50, canvas.width / canvas.height, 0.1, 1000);
       } else {
           this.projMat.setPerspective(50, 1, 0.1, 1000);
       }
       this.rotationSpeed = 5; // Speed of rotation for arrow keys
       this.moveSpeed = 0.25;   // Speed for WASD movement
   }

   updateViewMatrix() {
       this.viewMat.setLookAt(
           this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
           this.at.elements[0], this.at.elements[1], this.at.elements[2],
           this.up.elements[0], this.up.elements[1], this.up.elements[2]);
   }

   forward() {
       var f = new Vector3();
       f.set(this.at);
       f.sub(this.eye);
       f.normalize();
       this.at = this.at.add(f.mul(this.moveSpeed));
       this.eye = this.eye.add(f.mul(this.moveSpeed));
       this.updateViewMatrix();
   }

   back() {
       var dir = new Vector3();
       dir.set(this.eye);
       dir.sub(this.at);
       dir.normalize();
       this.at = this.at.add(dir.mul(this.moveSpeed));
       this.eye = this.eye.add(dir.mul(this.moveSpeed));
       this.updateViewMatrix();
   }

   left() {
       var forward_dir = new Vector3();
       forward_dir.set(this.at);
       forward_dir.sub(this.eye);
       var right_vec = Vector3.cross(forward_dir, this.up);
       right_vec.normalize();
       this.eye.sub(right_vec.mul(this.moveSpeed));
       this.at.sub(right_vec.mul(this.moveSpeed));
       this.updateViewMatrix();
   }

   right() {
       var forward_dir = new Vector3();
       forward_dir.set(this.at);
       forward_dir.sub(this.eye);
       var right_vec = Vector3.cross(forward_dir, this.up);
       right_vec.normalize();
       this.eye.add(right_vec.mul(this.moveSpeed));
       this.at.add(right_vec.mul(this.moveSpeed));
       this.updateViewMatrix();
   }

   panLeft(degrees = this.rotationSpeed) { // Yaw Left
       var f = new Vector3().set(this.at).sub(this.eye);
       var rotationMatrix = new Matrix4().setRotate(degrees, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
       var f_prime = rotationMatrix.multiplyVector3(f);
       this.at.set(this.eye).add(f_prime);
       this.updateViewMatrix();
   }

   panRight(degrees = this.rotationSpeed) { // Yaw Right
       this.panLeft(-degrees);
   }


   panUp(degrees = this.rotationSpeed) { // Pitch Up
      let forward = new Vector3().set(this.at).sub(this.eye).normalize();
      let right = new Vector3();
      Vector3.cross(forward, this.up, right).normalize();
      const radians = degrees * Math.PI / 180; // Convert degrees to radians
      this.at.add(right.mul(Math.sin(radians)));
      this.at.add(this.up.mul(Math.cos(radians) - 1));
      this.updateViewMatrix();
  }

  panDown(degrees = this.rotationSpeed) { // Pitch Down
      let forward = new Vector3().set(this.at).sub(this.eye).normalize();
      let right = new Vector3();
      Vector3.cross(forward, this.up, right).normalize();
      const radians = degrees * Math.PI / 180; // Convert degrees to radians
      this.at.sub(right.mul(Math.sin(radians)));
      this.at.sub(this.up.mul(Math.cos(radians) - 1));
      this.updateViewMatrix();
  }

}


