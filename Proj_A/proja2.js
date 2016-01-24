
// Vertex shader program----------------------------------
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform mat4 u_ModelMatrix;\n' +
  'attribute vec4 a_Color;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_ModelMatrix * a_Position;\n' +
  '  v_Color = a_Color;\n' +
  '  gl_PointSize = 10.0;\n' + //added
  '}\n';

// Fragment shader program----------------------------------
var FSHADER_SOURCE =
//  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
//  '#endif GL_ES\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' + //vec4(1.0, 1.0, 0.0, 1.0);\n' +
  '}\n';
//  Each instance computes all the on-screen attributes for just one PIXEL.
// here we do the bare minimum: if we draw any part of any drawing primitive in 
// any pixel, we simply set that pixel to the constant color specified here.


// Global Variable -- Rotation angle rate (degrees/second)
var ANGLE_STEP = 5.0;

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

  // Write the positions of vertices into an array, transfer
  // array contents to a Vertex Buffer Object created in the
  // graphics hardware.
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the positions of the vertices');
    return;
  }

  // Specify the color for clearing <canvas>
  gl.clearColor(0, 0, 0, 1);

  // NEW!! Enable 3D depth-test when drawing: don't over-draw at any pixel 
  // unless the new Z value is closer to the eye than the old one..
//  gl.depthFunc(gl.LESS);
  gl.enable(gl.DEPTH_TEST); 

  // Get storage location of u_ModelMatrix
  var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) { 
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

   
  // Current rotation angle
  var currentAngle = 0.0;
  // Model matrix
  var modelMatrix = new Matrix4();
  
  // Start drawing
  var tick = function() {
    currentAngle = animate(currentAngle);  // Update the rotation angle
    draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix);   // Draw the triangle
    requestAnimationFrame(tick, canvas);   // Request that the browser ?calls tick
  };
  tick();
}


function initVertexBuffers(gl) {
//==============================================================================
  var vertices = new Float32Array ([
    //vertices for the middle big star
     0.0,  0.65, 0.0, 1,    1, 0, 0,
    -0.13, 0.25, 0.0, 1,    1, 0, 0,
    -0.5,  0.25, 0.0, 1,    0, 1, 0,
    -0.2,  0.0,  0.0, 1,    0, 1, 0,
     0.2,  0.0,  0.0, 1,    0, 1, 0,
     0.5,  0.25, 0.0, 1,    0, 0, 1,
     0.13, 0.25, 0.0, 1,    0, 0, 1,
    
    //lines connecting
    0.0,  0.65,  0.0, 1,    1, 0, 0,
    0.0,  0.65, -0.1, 1,    0, 1, 1,
  -0.13,  0.25,  0.0, 1,    1, 0, 0,
  -0.13,  0.25, -0.1, 1,    0, 1, 1,
  -0.5,   0.25,  0.0, 1,    0, 1, 0,
  -0.5,   0.25, -0.1, 1,    1, 1, 1,
  -0.2,   0.0,   0.0, 1,    0, 1, 0,
  -0.2,   0.0,  -0.1, 1,    1, 1, 0,
   0.2,   0.0,   0.0, 1,    0, 1, 0,  
   0.2,   0.0,  -0.1, 1,    1, 1, 1,
   0.5,   0.25,    0, 1,    0, 0, 1,
   0.5,   0.25, -0.1, 1,    1, 1, 0,
   0.13,  0.25,  0.0, 1,    0, 0, 1,
   0.13,  0.25, -0.1, 1,    1, 1, 0,

   //vertices for the small star
   0.5,   0.4,   0, 1,      1, 1, 0,
   0.37,  0.0,   0, 1,      1, 0, 1,
   0.0,   0.0,   0, 1,      0, 1, 1,
   0.3,  -0.25,  0, 1,      1, 0, 0,
   0.15, -0.65,  0, 1,      0, 1, 0,
   0.5,  -0.4,   0, 1,      0, 0, 1,
   0.85, -0.65,  0, 1,      1, 1, 1,
   0.7,  -0.25,  0, 1,      1, 0, 1,
   1,     0.0,   0, 1,      1, 0, 0,
   0.63,  0.0,   0, 1,      0, 0, 1,
  ]);
  var n = 31;   // The number of vertices

  // Create a buffer object. same as shapeBufferHandle
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  var FSIZE = vertices.BYTES_PER_ELEMENT; 

  // // Assign the buffer object to a_Position variable
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if(a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  gl.vertexAttribPointer(a_Position, 4, gl.FLOAT, false, FSIZE*7, 0);
  gl.enableVertexAttribArray(a_Position);

// Get graphics system's handle for our Vertex Shader's color-input variable;
  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if(a_Color < 0) {
    console.log('Failed to get the storage location of a_Color');
    return -1;
  }


  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE*7, FSIZE*4);
  gl.enableVertexAttribArray(a_Color);

  //--------------------------------DONE!
  // Unbind the buffer object 
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return n;
}

function draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix) {
//==============================================================================
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  //------- Starly girl with her pony tail------------------------
  // -------big star---------------
  modelMatrix.setTranslate(0,0.1, 0.0);  
  //modelMatrix.scale(0.7,0.7,0.7); 
  modelMatrix.rotate(30, 0, 1,0); 
  modelMatrix.rotate(currentAngle, 0, 1, 0);  
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);		
  gl.drawArrays(gl.LINE_LOOP, 0, 7);
  
  //drawSeveralTimes(gl, n, modelMatrix, u_ModelMatrix);
   //layer 2
    modelMatrix.translate(0, 0,0.1);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);    
    gl.drawArrays(gl.LINE_LOOP, 0, 7);

    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);    
    gl.drawArrays(gl.LINES, 7, 14);



/*
    //layer 3
    modelMatrix.translate(0.01, 0.01,0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);    
    gl.drawArrays(gl.LINE_LOOP, 0, 10);
*/
  // var i = 0; 
  // while(i < 6){
  //   modelMatrix = popMatrix();
  //   modelMatrix.translate(0.01, -0.01,0);
  //   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);    
  //   gl.drawArrays(gl.LINE_LOOP, 0, 10);
  // }


 //-------1nd  small star----------------
  modelMatrix.translate(0, 0.65, 0); 			
  modelMatrix.scale(0.2,0.2,0.2);			
  modelMatrix.rotate(20, 0,0,1);  
  modelMatrix.rotate(0.7*currentAngle, 0,0,1);	
  //pushMatrix(modelMatrix);
  
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.LINE_LOOP, 21, 10);
  
  modelMatrix.translate(0, 0, 0.07);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.LINE_LOOP, 21, 10);
 
//-------2nd  small star----------------
  //modelMatrix = popMatrix();
	modelMatrix.translate(0.85, -0.65, 0.0);	
	modelMatrix.scale(0.8, 0.8, 0.8);		
  modelMatrix.rotate(-10, 0,0,1); 
  modelMatrix.rotate(0.5*currentAngle, 0,0,1);  
  pushMatrix(modelMatrix);
  // DRAW BOX: Use this matrix to transform & draw our VBO's contents:
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.LINE_LOOP, 21, 10);

  modelMatrix.translate(0, 0, 0.07);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.LINE_LOOP, 21, 10); 

//-------3rd  small star----------------
  modelMatrix = popMatrix();
	// Now move drawing axes to the centered end of that lower-jaw segment:
	modelMatrix.translate(0.85, -0.65, 0.0);
	modelMatrix.scale(0.8, 0.8, 0.8);    
  modelMatrix.rotate(-10, 1,0,1);		// make bend in the lower jaw
	//modelMatrix.translate(-0.1, 0.0, 0.0);	// re-center the outer segment,
  modelMatrix.rotate(0.5*currentAngle, 0,0,1);  
	// Draw outer lower jaw segment:				
  // DRAW BOX: Use this matrix to transform & draw our VBO's contents:
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.LINE_LOOP, 21, 10);

  modelMatrix.translate(0, 0, 0.07);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.LINE_LOOP, 21, 10);

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
  if(angle >   30.0 && ANGLE_STEP > 0) ANGLE_STEP = -ANGLE_STEP;
  if(angle <  -20.0 && ANGLE_STEP < 0) ANGLE_STEP = -ANGLE_STEP;
  
  var newAngle = angle + ANGLE_STEP / 30.0;
  return newAngle %= 360;
}

