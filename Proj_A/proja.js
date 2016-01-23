
// Vertex shader program----------------------------------
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform mat4 u_ModelMatrix;\n' +
  'void main() {\n' +
  '  gl_Position = u_ModelMatrix * a_Position;\n' +
  //'  gl_PointSize = 10.0;\n' + //added
  '}\n';

// Fragment shader program----------------------------------
var FSHADER_SOURCE =
  'void main() {\n' +
  '  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
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
  //new vector, translate the star
  var vec3 = new Vector3([-0.5 , -0.25, 0]);

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
     0.0,  0.65, 0.0, 1,  // CAREFUL! I made these into 4D points/ vertices: x,y,z,w.
    -0.13,  0.25,   0,   1,
    -0.5,  0.25,   0,   1,
    -0.2,  0.0, 0.0, 1, // new point!  (? What happens if I make w=0 instead of 1.0?)   
    -0.35, -0.4, 0.0, 1,  //when w = 1, it's a point; when w = 0, it's vector  
     0.0, -0.15, 0.0, 1,  // new point! 
     0.35, -0.4, 0.0, 1,  //
     0.2,  0.0, 0.0, 1,   // new point!  (note we need a trailing comma here)    
     0.5,  0.25, 0,   1,
     0.13,  0.25, 0,1,

     //vertices for the small star
     0.5, 0.4, 0, 1,
     0.37, 0, 0, 1, 
     0, 0, 0, 1,
     0.3, -0.25, 0, 1,
     0.15, -0.65, 0, 1,
     0.5, -0.4, 0, 1, 
     0.85, -0.65, 0, 1,
     0.7, -0.25, 0, 1,
     1, 0, 0, 1,
     0.63, 0, 0, 1,


  ]);
  var n = 20;   // The number of vertices

  // Create a buffer object
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  // Assign the buffer object to a_Position variable
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if(a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  gl.vertexAttribPointer(a_Position, 4, gl.FLOAT, false, 0, 0);
	// websearch yields OpenGL version: 
	//		http://www.opengl.org/sdk/docs/man/xhtml/glVertexAttribPointer.xml
				//	glVertexAttributePointer (
				//			index == which attribute variable will we use?
				//			size == how many dimensions for this attribute: 1,2,3 or 4?
				//			type == what data type did we use for those numbers?
				//			isNormalized == are these fixed-point values that we need
				//						normalize before use? true or false
				//			stride == #bytes (of other, interleaved data) between OUR values?
				//			pointer == offset; how many (interleaved) values to skip to reach
				//					our first value?
				//				)
  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  return n;
}

function draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix) {
//==============================================================================
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  //------- Starly girl with her pony tail------------------------
  // -------big star---------------
  modelMatrix.setTranslate(0,0.1, 0.0);  
  //modelMatrix.scale(0.7,0.7,0.7); 
  //modelMatrix.rotate(40, 0, 1,0); 
  modelMatrix.rotate(currentAngle, 0, 1, 0);  
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);		
  gl.drawArrays(gl.LINE_LOOP, 0, 10);
  pushMatrix(modelMatrix);

  modelMatrix = popMatrix();
  modelMatrix.translate(-0.02, 0,0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);    
  gl.drawArrays(gl.LINE_LOOP, 0, 10);

/*
 //-------1nd  small star----------------
  modelMatrix.translate(0, 0.65, 0); 			
  modelMatrix.scale(0.2,0.2,0.2);			
  modelMatrix.rotate(20, 0,0,1);  
  modelMatrix.rotate(0.7*currentAngle, 0,0,1);	
  pushMatrix(modelMatrix);
  
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.LINE_LOOP, 10, 10);
 
//-------2nd  small star----------------
  modelMatrix = popMatrix();
	modelMatrix.translate(0.85, -0.65, 0.0);	
	modelMatrix.scale(0.8, 0.8, 0.8);		
  modelMatrix.rotate(-10, 0,0,1); 
  modelMatrix.rotate(0.5*currentAngle, 0,0,1);  
  pushMatrix(modelMatrix);
  // DRAW BOX: Use this matrix to transform & draw our VBO's contents:
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.LINE_LOOP, 10, 10);

//-------3rd  small star----------------
  modelMatrix = popMatrix();
	// Now move drawing axes to the centered end of that lower-jaw segment:
	modelMatrix.translate(0.85, -0.65, 0.0);
	modelMatrix.scale(0.8, 0.8, 0.8);    
  modelMatrix.rotate(-10, 0,0,1);		// make bend in the lower jaw
	//modelMatrix.translate(-0.1, 0.0, 0.0);	// re-center the outer segment,
  modelMatrix.rotate(0.5*currentAngle, 0,0,1);  
	// Draw outer lower jaw segment:				
  // DRAW BOX: Use this matrix to transform & draw our VBO's contents:
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.LINE_LOOP, 10, 10);

*/


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

