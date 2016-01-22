
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
   // currentAngle = animate(currentAngle);  // Update the rotation angle
   
    draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix);   // Draw the triangle
    //drawSmall(gl, n, currentSmallAngle, modelMatrix, u_ModelMatrix);
    requestAnimationFrame(tick, canvas);   // Request that the browser ?calls tick
  };
  tick();
}



function initVertexBuffers(gl) {
//==============================================================================
  var vertices = new Float32Array ([
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

     // 0.5, 0.4, 0, 1,
     // 0.37, 0, 0, 1, 
     // 0, 0, 0, 1,
     // 0.3, -0.25, 0, 1,
     // 0.15, -0.65, 0, 1,
     // 0.5, -0.4, 0, 1, 
     // 0.85, -0.65, 0, 1,
     // 0.7, -0.25, 0, 1,
     // 1, 0, 0, 1,
     // 0.63, 0, 0, 1,


  ]);
  var n = 10;   // The number of vertices

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

/*function drawSmall(gl, n, currentAngle, modelMatrix, u_ModelMatrix) {
//==============================================================================
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  modelMatrix.translate(0.06, 0.72, 0);       // Make new drawing axes that
                // we moved upwards (+y) measured in prev. drawing axes, and
                // moved rightwards (+x) by half the width of the box we just drew.
  modelMatrix.scale(0.2,0.2,0.2);   
  modelMatrix.rotate(currentAngle, 0, 1, 0);

// DRAW BOX: Use this matrix to transform & draw our VBO's contents:
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.LINE_LOOP, 0, n);

}*/
function draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix) {
//==============================================================================
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Build our Robot Arm by successively moving our drawing axes

 // -------big star---------------
  modelMatrix.setTranslate(0,0.1, 0.0);  // 'set' means DISCARD old matrix,
  						// (drawing axes centered in CVV), and then make new
  						// drawing axes moved to the lower-left corner of CVV. 
  modelMatrix.scale(0.7,0.7,0.7);
  
  modelMatrix.rotate(currentAngle, 0, 0, 1);  // Make new drawing axes that
  						// that spin around z axis (0,0,1) of the previous 
  						// drawing axes, using the same origin.
  //modelMatrix.rotate(3*currentAngle, 0,1,0);  // SPIN ON Y AXIS!!!
	// modelMatrix.translate(0.5, 0,0);						// Move box so that we pivot
							// around the MIDDLE of it's lower edge, and not the left corner.

  // DRAW BOX:  Use this matrix to transform & draw our VBo's contents:
  		// Pass our current matrix to the vertex shaders:
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  		// Draw the rectangle held in the VBO we created in initVertexBuffers().
  gl.drawArrays(gl.LINE_LOOP, 0, n);
  //gl.drawArrays(gl.POINTS, 0, n);
  pushMatrix(modelMatrix);
  pushMatrix(modelMatrix);
  pushMatrix(modelMatrix);
  pushMatrix(modelMatrix);
  pushMatrix(modelMatrix); 


 //-------1nd  small star----------------
  modelMatrix.translate(0.1, 0.6, 0); 			// Make new drawng axes that
  						// we moved upwards (+y) measured in prev. drawing axes, and
  						// moved rightwards (+x) by half the width of the box we just drew.
  modelMatrix.scale(0.2,0.2,0.2);				// Make new drawing axes that
  						// are smaller that the previous drawing axes by 0.6.
  //modelMatrix.rotate(30, 0,0,1);	// Make new drawing axes that
  						// spin around Z axis (0,0,1) of the previous drawing 
  						// axes, using the same origin.
  //modelMatrix.translate(-0.5, 0, 0);			// Make new drawing axes that
  						// move sideways by half the width of our rectangle model
  						// (REMEMBER! modelMatrix.scale() DIDN'T change the 
  						// the vertices of our model stored in our VBO; instead
  						// we changed the DRAWING AXES used to draw it. Thus
  						// we translate by the 0.1, not 0.1*0.6.)
  // DRAW BOX: Use this matrix to transform & draw our VBO's contents:
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.LINE_LOOP, 0, n);
 
/*//-------2nd  small star----------------
  modelMatrix = popMatrix();
	//modelMatrix.translate(-0.126, 0.0, 0.0);	// Make new drawing axes at 
	modelMatrix.rotate(100, 0,0,1);		
						// make new drawing axes that rotate for lower-jaw
	modelMatrix.scale(0.2, 0.2, 0.2);		// Make new drawing axes that
						// have size of just 40% of previous drawing axes,
						// (Then translate? no need--we already have the box's 
						//	left corner at the wrist-point; no change needed.)
	// Draw inner lower jaw segment:				
  // DRAW BOX: Use this matrix to transform & draw our VBO's contents:
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.LINE_LOOP, 0, n);
//-------3rd  small star----------------
  modelMatrix = popMatrix();
	// Now move drawing axes to the centered end of that lower-jaw segment:
	modelMatrix.translate(0.15, -0.65, 0.0);
	modelMatrix.rotate(-190.0, 0,0,1);		// make bend in the lower jaw
	//modelMatrix.translate(-0.1, 0.0, 0.0);	// re-center the outer segment,
	modelMatrix.scale(0.2, 0.2, 0.2);
	// Draw outer lower jaw segment:				
  // DRAW BOX: Use this matrix to transform & draw our VBO's contents:
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.LINE_LOOP, 0, n);
  
  
	
//-------4th small star----------------
  modelMatrix = popMatrix();
  // Now move drawing axes to the centered end of that lower-jaw segment:
  modelMatrix.translate(0.85, -0.65, 0.0);
  modelMatrix.rotate(-120.0, 0,0,1);    // make bend in the lower jaw
  //modelMatrix.translate(-0.1, 0.0, 0.0);  // re-center the outer segment,
  modelMatrix.scale(0.2, 0.2, 0.2);
  // Draw outer lower jaw segment:        
  // DRAW BOX: Use this matrix to transform & draw our VBO's contents:
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.LINE_LOOP, 0, n);
  

//-------3rd  small star----------------
  modelMatrix = popMatrix();
  // Now move drawing axes to the centered end of that lower-jaw segment:
  modelMatrix.translate(1, 0.0, 0.0);
  modelMatrix.rotate(-45.0, 0,0,1);    // make bend in the lower jaw
  //modelMatrix.translate(-0.1, 0.0, 0.0);  // re-center the outer segment,
  modelMatrix.scale(0.2, 0.2, 0.2);
  // Draw outer lower jaw segment:        
  // DRAW BOX: Use this matrix to transform & draw our VBO's contents:
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.LINE_LOOP, 0, n);*/
  
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
  //if(angle >   20.0 && ANGLE_STEP > 0) ANGLE_STEP = -ANGLE_STEP;
  //if(angle <  -85.0 && ANGLE_STEP < 0) ANGLE_STEP = -ANGLE_STEP;
  
  var newAngle = angle + ANGLE_STEP / 30.0;
  return newAngle %= 360;
}

// function animateSmall(angle) {
//   //==============================================================================
//   // Calculate the elapsed time
//   var now = Date.now();
//   var elapsed = now - g_last;
//   g_last = now;
  
//   //Update the current rotation angle (adjusted by the elapsed time)
//    //limit the angle to move smoothly between +20 and -85 degrees:
//   if(angle >   50.0 && ANGLE_STEP > 0) ANGLE_STEP = -ANGLE_STEP;
//   if(angle <  -85.0 && ANGLE_STEP < 0) ANGLE_STEP = -ANGLE_STEP;

//   var newAngle = angle + ANGLE_STEP / 70.0;
//   return newAngle %= 360;

// }

