//3456789_123456789_123456789_123456789_123456789_123456789_123456789_123456789_
// (JT: why the numbers? counts columns, helps me keep 80-char-wide listings)
//
// Chapter 5: ColoredTriangle.js (c) 2012 matsuda  AND
// Chapter 4: RotatingTriangle_withButtons.js (c) 2012 matsuda
// became:
//
// ColoredMultiObject.js  MODIFIED for EECS 351-1, 
//                  Northwestern Univ. Jack Tumblin
//    --converted from 2D to 4D (x,y,z,w) vertices
//    --demonstrate how to keep & use MULTIPLE colored shapes in just one
//      Vertex Buffer Object(VBO). 
//    --demonstrate 'nodes' vs. 'vertices'; geometric corner locations where
//        OpenGL/WebGL requires multiple co-located vertices to implement the
//        meeting point of multiple diverse faces.
//
// Vertex shader program----------------------------------
var VSHADER_SOURCE = 
  'uniform mat4 u_ModelMatrix;\n' +
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_ModelMatrix * a_Position;\n' +
  '  gl_PointSize = 10.0;\n' +
  '  v_Color = a_Color;\n' +
  '}\n';

// Fragment shader program----------------------------------
var FSHADER_SOURCE = 
//  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
//  '#endif GL_ES\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';

// Global Variable -- Rotation angle rate (degrees/second)
var ANGLE_STEP = 45.0;

function main() {
//==============================================================================
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // 
  var n = initVertexBuffer(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // NEW!! Enable 3D depth-test when drawing: don't over-draw at any pixel 
  // unless the new Z value is closer to the eye than the old one..
//  gl.depthFunc(gl.LESS);
  gl.enable(gl.DEPTH_TEST);     
  
  // Get handle to graphics system's storage location of u_ModelMatrix
  var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) { 
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }
  // Create a local version of our model matrix in JavaScript 
  var modelMatrix = new Matrix4();
  
  // Create, init current rotation angle value in JavaScript
  var currentAngle = 0.0;

//-----------------  

  // Start drawing: create 'tick' variable whose value is this function:
  var tick = function() {
    currentAngle = animate(currentAngle);  // Update the rotation angle
    draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix);   // Draw shapes
    console.log('currentAngle=',currentAngle);
    requestAnimationFrame(tick, canvas);   
                      // Request that the browser re-draw the webpage
  };
  tick();             // start (and continue) animation: draw current image
  
}

function initVertexBuffer(gl) {
//==============================================================================
  var c30 = Math.sqrt(0.75);          // == cos(30deg) == sqrt(3) / 2
  var sq2 = Math.sqrt(2.0);            

  var colorShapes = new Float32Array([
  
/*    // Cube Nodes
    -1.0, -1.0, -1.0, 1.0 // Node 0
    -1.0,  1.0, -1.0, 1.0 // Node 1
     1.0,  1.0, -1.0, 1.0 // Node 2
     1.0, -1.0, -1.0, 1.0 // Node 3
    
     1.0,  1.0,  1.0, 1.0 // Node 4
    -1.0,  1.0,  1.0, 1.0 // Node 5
    -1.0, -1.0,  1.0, 1.0 // Node 6
     1.0, -1.0,  1.0, 1.0 // Node 7
*/
    // +x face: RED
     2.0, -2.0, -2.0, 1.0,    0.2, 0, 0,  // Node 3
     2.0,  0.0, -2.0, 1.0,    0.2, 0, 0,  // Node 2
     2.5,  -1,     -1, 1 ,    0, 0, 0,  //pointly

     2.5,  -1,     -1, 1 ,     0.1, 0.2, 0.2,  //pointly
     2.0,  0,       0, 1,      0.5, 0, 0,  // Node 4
     2.0,  0,    -2.0, 1.0,    0.2, 0, 0,  // Node 2
     
     2.0,  0.0,  0.0, 1.0,    0.2, 0, 0, // Node 4
     2.0, -2.0,  0.0, 1.0,    0.2, 0, 0,  // Node 7
     2.5, -1.0,   -1, 1 ,     0.3, 0.2, 0.2,  //pointly
     
     2.0, -2.0,  0.0, 1.0,    0.2, 0, 0,  // Node 7
     2.5, -1,    -1, 1 ,     0.3, 0.2, 0.2,  //pointly
     2.0, -2.0, -2.0, 1.0,    0.2, 0, 0,  // Node 3

    // +y face: GREEN
    0.0,  0.0, -2.0, 1.0,    0.0, 1.0, 0.0,  // Node 1
    0.0,  0.0,  0.0, 1.0,    0.0, 1.0, 0.0,  // Node 5
    1.0,  0.5, -1.0,    1,     0.0, 1.0, 0.0,    //pointy

      1.0,  0.5,  -1.0, 1,     0.0, 1.0, 0.0,    //pointy  
     2.0,  0.0,  0.0, 1.0,    1.0, 0.0, 0.0,  // Node 4
     0.0,  0.0,  0.0, 1.0,    0.0, 1.0, 0.0,  // Node 5

       1,  0.5,  -1,    1,     0.0, 1.0, 0.0,    //pointy  
     2.0,  0.0,  0.0, 1.0,    1.0, 0.0, 0.0,  // Node 4
     2.0,  0.0, -2.0, 1.0,    1.0, 0.0, 0.0,  // Node 2 
    
     1.0,  0.5,  -1.0,    1,    0.0, 1.0, 1.0,    //pointy 
     2.0,  0.0, -2.0, 1.0,    1.0, 0.0, 1.0,  // Node 2  
     0.0,  0.0, -2.0, 1.0,    0.0, 1.0, 1.0,   // Node 1

    // -x face: CYAN
    0.0, -2.0,  0.0, 1.0,    0.0, 1.0, 1.0,  // Node 6 
    0.0,  0.0,  0.0, 1.0,    0.0, 1.0, 1.0,  // Node 5 
   -0.5, -1.0, -1.0, 1.0,    0.0, 0.0, 1.0,  // pointy

    0.0, -2.0,  0.0, 1.0,    0.0, 1.0, 1.0,  // Node 6 
    -0.5, -1.0, -1.0, 1.0,    0.0, 0.0, 1.0,  // pointy
    0.0, -2.0, -2.0, 1.0,    0.1, 1.0, 1.0,  // Node 0 

   -0.5, -1.0, -1.0, 1.0,    0.0, 0.0, 1.0,  // pointy
    0.0, -2.0, -2.0, 1.0,    0.1, 1.0, 1.0,  // Node 0 
    0.0,  0.0, -2.0, 1.0,    0.0, 1.0, 1.0,  // Node 1
    
   -0.5, -1.0, -1.0, 1.0,    0.0, 0.0, 1.0,  // pointy
   0.0,  0.0, -2.0, 1.0,    0.0, 1.0, 1.0,  // Node 1
   0.0,  0.0,  0.0, 1.0,    0.0, 1.0, 1.0,  // Node 5 
   
    // -y face: MAGENTA
     2.0, -2.0, -2.0, 1.0,    1.0, 1.0, 1.0,  // Node 3
     2.0, -2.0,  0.0, 1.0,    0.0, 0.0, 1.0,  // Node 7
     1.0, -2.5, -1.0, 1.0,    0.0, 0.0, 1.0,  // pointy

     1.0, -2.5, -1.0, 1.0,    1.0, 0.0, 1.0,  // pointy
     0.0, -2.0,  0.0, 1.0,    1.0, 0.0, 1.0,  // Node 6
      2.0, -2.0,  0.0, 1.0,    1.0, 0.0, 1.0,  // Node 7

    1.0, -2.5, -1.0, 1.0,    1.0, 0.0, .2,  // pointy
     0.0, -2.0,  0.0, 1.0,    1.0, 0.0, .2,  // Node 6
    -0.0, -2.0, -2.0, 1.0,    1.0, 0.1, .2,  // Node 0
     
      1.0, -2.5, -1.0, 1.0,    1.0, 0.0, 1.0,  // pointy
     2.0, -2.0, -2.0, 1.0,    1.0, 0.0, 1.0,  // Node 3
     -0.0, -2.0, -2.0, 1.0,    1.0, 0.1, 1.0,  // Node 0

     // -z face: YELLOW
     2.0,  0.0, -2.0, 1.0,    1.0, 1.0, 1.0,  // Node 2
     2.0, -2.0, -2.0, 1.0,    1.0, 1.0, 1.0,  // Node 3
     1.0, -1.0, -2.5, 1.0,    1.0, 1.0, 0.0,  // pointy

     1.0, -1.0, -2.5, 1.0,    1.0, 1.0, 0.0,  // pointy
     0.0,  0.0, -2.0, 1.0,    1.0, 1.0, 1.0,  // Node 1
     2.0,  0.0, -2.0, 1.0,    1.0, 1.0, 0.0,  // Node 2

    1.0, -1.0, -2.5, 1.0,    1.0, 1.0, 0.0,  // pointy
     0.0,  0.0, -2.0, 1.0,    1.0, 1.0, 0.1,  // Node 1
    0.0, -2.0, -2.0, 1.0,    1.0, 1.0, 0.0,  // Node 0   

    1.0, -1.0, -2.5, 1.0,    1.0, 1.0, 0.0,  // pointy
    0.0, -2.0, -2.0, 1.0,    1.0, 1.0, 0.0,  // Node 0  
    2.0, -2.0, -2.0, 1.0,    1.0, 1.0, 0.0,  // Node 3
 
  ]);
  var nn = 60;   
  
  
  // Create a buffer object
  var shapeBufferHandle = gl.createBuffer();  
  if (!shapeBufferHandle) {
    console.log('Failed to create the shape buffer object');
    return false;
  }

  // Bind the the buffer object to target:
  gl.bindBuffer(gl.ARRAY_BUFFER, shapeBufferHandle);
  // Transfer data from Javascript array colorShapes to Graphics system VBO
  // (Use sparingly--may be slow if you transfer large shapes stored in files)
  gl.bufferData(gl.ARRAY_BUFFER, colorShapes, gl.STATIC_DRAW);

  var FSIZE = colorShapes.BYTES_PER_ELEMENT; // how many bytes per stored value?
    
  //Get graphics system's handle for our Vertex Shader's position-input variable: 
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  // Use handle to specify how to retrieve position data from our VBO:
  gl.vertexAttribPointer(
      a_Position,   // choose Vertex Shader attribute to fill with data
      4,            // how many values? 1,2,3 or 4.  (we're using x,y,z,w)
      gl.FLOAT,     // data type for each value: usually gl.FLOAT
      false,        // did we supply fixed-point data AND it needs normalizing?
      FSIZE * 7,    // Stride -- how many bytes used to store each vertex?
                    // (x,y,z,w, r,g,b) * bytes/value
      0);           // Offset -- now many bytes from START of buffer to the
                    // value we will actually use?
  gl.enableVertexAttribArray(a_Position);  
                    // Enable assignment of vertex buffer object's position data

  // Get graphics system's handle for our Vertex Shader's color-input variable;
  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if(a_Color < 0) {
    console.log('Failed to get the storage location of a_Color');
    return -1;
  }
  // Use handle to specify how to retrieve color data from our VBO:
  gl.vertexAttribPointer(
    a_Color,        // choose Vertex Shader attribute to fill with data
    3,              // how many values? 1,2,3 or 4. (we're using R,G,B)
    gl.FLOAT,       // data type for each value: usually gl.FLOAT
    false,          // did we supply fixed-point data AND it needs normalizing?
    FSIZE * 7,      // Stride -- how many bytes used to store each vertex?
                    // (x,y,z,w, r,g,b) * bytes/value
    FSIZE * 4);     // Offset -- how many bytes from START of buffer to the
                    // value we will actually use?  Need to skip over x,y,z,w
                    
  gl.enableVertexAttribArray(a_Color);  
                    // Enable assignment of vertex buffer object's position data

  //--------------------------------DONE!
  // Unbind the buffer object 
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return nn;
}

function draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix) {
//==============================================================================
  // Clear <canvas>  colors AND the depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  modelMatrix.setTranslate(-0.6, 0.5, 0.0);              
  modelMatrix.scale(1,1,-1);              
  modelMatrix.scale(0.1, 0.1, 0.1);             
  modelMatrix.rotate(currentAngle, 0, 0, 1);  

  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0,60);

//second
  modelMatrix.translate(2, -2, -2);
  modelMatrix.rotate(0.2*currentAngle, 0, 1, 1);  
  modelMatrix.scale(0.8, 0.8, 0.8);    
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0,60);

  //third
  modelMatrix.translate(2, -2, -2);
  modelMatrix.rotate(-50, 1, 0, 0);
  modelMatrix.rotate(0.2*currentAngle, 1, 0, 0);  
  modelMatrix.scale(0.8, 0.8, 0.8);  
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0,60);

//fourth
  modelMatrix.translate(2, -2, -2);
  modelMatrix.rotate(-30, 1, 0, 0);
  modelMatrix.rotate(2*currentAngle, 1, 0, 0);  
  modelMatrix.scale(0.8, 0.8, 0.8);  
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0,60);

//fifth
  modelMatrix.translate(2, -2, -2);
 // modelMatrix.rotate(-30, 1, 0, 0);
  modelMatrix.rotate(0.2*currentAngle, 1, 0, 0);  
  modelMatrix.scale(0.8, 0.8, 0.8);  
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0,60);

  //sixth
  modelMatrix.translate(2, -2, -2);
  //modelMatrix.rotate(-30, 1, 0, 0);
  modelMatrix.rotate(3*currentAngle, 1, 0, 0);  
  modelMatrix.scale(0.8, 0.8, 0.8);  
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0,60);


}

// Last time that this function was called:  (used for animation timing)
var g_last = Date.now();

function animate(angle) {
//==============================================================================
  // Calculate the elapsed time
  var now = Date.now();
  var elapsed = now - g_last;
  g_last = now;
  
  // Update the current rotation angle (adjusted by the elapsed time)
  //  limit the angle to move smoothly between +20 and -85 degrees:
 if(angle >  30.0 && ANGLE_STEP > 0) ANGLE_STEP = -ANGLE_STEP;
 if(angle < -30.0 && ANGLE_STEP < 0) ANGLE_STEP = -ANGLE_STEP;
  
  var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
  return newAngle %= 360;
}

//==================HTML Button Callbacks
function spinUp() {
  ANGLE_STEP += 25; 
}

function spinDown() {
 ANGLE_STEP -= 25; 
}

function runStop() {
  if(ANGLE_STEP*ANGLE_STEP > 1) {
    myTmp = ANGLE_STEP;
    ANGLE_STEP = 0;
  }
  else {
    ANGLE_STEP = myTmp;
  }
}
 