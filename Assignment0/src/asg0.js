


// DrawRectangle.js
function main() {
    // Retrieve <canvas> element                                  <- (1)
    var canvas = document.getElementById('example');
    if (!canvas) {
        console.log('Failed to retrieve the <canvas> element');
        return;
    }

    // Get the rendering context for 2DCG                          <- (2)
    var ctx = canvas.getContext('2d');

    // Draw a blue rectangle                                       <- (3)
    //ctx.fillStyle = 'rgba(0, 0, 255, 1.0)'; // Set a blue color
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set a black color
    ctx.fillRect(0, 0, 400, 400); // Fill a rectangle with the color

    //draw red vector Step 1
    //drawVector(v1, 'rgba(255, 0, 0, 1.0)')



}



//make vector v1 using Vector3 class
//var v1 = new Vector3([2.25, 2.25, 0])

//function drawVector
function drawVector(v, color){
    var canvas = document.getElementById('example')
    var ctx = canvas.getContext('2d')
    ctx.strokeStyle = color
    ctx.beginPath()
    ctx.moveTo(200, 200)
    ctx.lineTo(200 + v.elements[0] * 20, 200 - v.elements[1] * 20)
    ctx.stroke()
}

//function handleDrawEvent
function handleDrawEvent(){
    var canvas = document.getElementById('example');
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 400, 400);
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
    ctx.fillRect(0, 0, 400, 400);

    var x_value1 = document.getElementById("xVal1").value;
    //console.log("X value 1: " + x_value1);
    var y_value1 = document.getElementById("yVal1").value;
    //console.log("Y value 1: " + y_value1);
    var v1 = new Vector3([x_value1, y_value1, 0]);

    var x_value2 = document.getElementById("xVal2").value;
    //console.log("X value 2: " + x_value2);
    var y_value2 = document.getElementById("yVal2").value;
    //console.log("Y value 2: " + y_value2);
    var v2 = new Vector3([x_value2, y_value2, 0]);

    drawVector(v1, 'rgba(255, 0, 0, 1.0)');
    drawVector(v2, 'rgba(0, 0, 255, 1.0)');
}

function handleDrawOperationEvent(){
    var canvas = document.getElementById('example');
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 400, 400);
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
    ctx.fillRect(0, 0, 400, 400);

    //handleDrawEvent();

    var x_value1 = document.getElementById("xVal1").value;
    var y_value1 = document.getElementById("yVal1").value;
    var v1 = new Vector3([x_value1, y_value1, 0]);

    var x_value2 = document.getElementById("xVal2").value;
    var y_value2 = document.getElementById("yVal2").value;
    var v2 = new Vector3([x_value2, y_value2, 0]);

    drawVector(v1, 'rgba(255, 0, 0, 1.0)');
    drawVector(v2, 'rgba(0, 0, 255, 1.0)');

    var selected_op = document.getElementById('operation').value;
    //console.log("Selected Operation: " + selected_op);
    var scalar = document.getElementById('scalar').value;
    //console.log("Scalar Value: " + scalar);
    
    var v3, v4;
    if (selected_op === "add") {
        v3 = v1.add(v2);
    } else if(selected_op === "sub") {
        v3 = v1.sub(v2);
    } else if(selected_op === "div") {
        v3 = v1.div(scalar);
        v4 = v2.div(scalar);
    } else if(selected_op === "mul") {
        v3 = v1.mul(scalar);
        v4 = v2.mul(scalar);
    } else if(selected_op === "magnitude") {
        console.log("Magnitude v1: " + v1.magnitude());
        console.log("Magnitude v2: " + v2.magnitude());
    } else if(selected_op === "normalize") {
        v3 = v1.normalize();
        v4 = v2.normalize();
    } else if (selected_op === "angle") {
        var angle_between = angleBetween(v1, v2);
        console.log("Angle: " + angle_between);
    } else if (selected_op === "area") {
        var Area = areaTriangle(v1, v2);
        console.log("Area of the Triangle: " + Area);
    }

    if (v3) {
        drawVector(v3, 'rgba(0, 255, 0, 1.0)');
    }
    if (v4) {
        drawVector(v4, 'rgba(0, 255, 0, 1.0)');
    }
}

function angleBetween(v1, v2) {
    dotProduct = Vector3.dot(v1, v2);
    mag_v1 = v1.magnitude();
    mag_v2 = v2.magnitude();
    
    if ( mag_v1 != 0 && mag_v2 != 0) {
        cosTheta = dotProduct / (mag_v1 * mag_v2);
    }

    angle = Math.acos(cosTheta);
    //console.log(angle)
    angle_in_degrees = angle * (180 / Math.PI);
    return angle_in_degrees;
}

function areaTriangle(v1, v2) {
    crossProduct = Vector3.cross(v1, v2);
    magnitude = crossProduct.magnitude();
    area = 0.5 * magnitude;
    return area;
}