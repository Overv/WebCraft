// ==========================================
// Renderer
//
// This class contains the code that takes care of visualising the
// elements in the specified world.
// ==========================================

// Shaders
var vertexSource =
	"uniform mat4 uProjMatrix;"+
	"uniform mat4 uViewMatrix;"+
	"attribute vec3 aPos;"+
	"attribute vec4 aColor;"+
	"attribute vec2 aTexCoord;"+
	"varying vec4 vColor;"+
	"varying vec2 vTexCoord;"+
	"void main() {"+
	"	gl_Position = uProjMatrix * uViewMatrix * vec4( aPos, 1.0 );"+
	"	vColor = aColor;"+
	"	vTexCoord = aTexCoord;"+
	"}";
var fragmentSource =
	"precision highp float;"+
	"uniform sampler2D uSampler;"+
	"varying vec4 vColor;"+
	"varying vec2 vTexCoord;"+
	"void main() {"+
	"	gl_FragColor = texture2D( uSampler, vec2( vTexCoord.s, vTexCoord.t ) ) * vec4( vColor );\n"+
	"}";

// Constructor( id )
//
// Creates a new renderer with the specified canvas as target.
//
// id - Identifier of the HTML canvas element to render to.

function Renderer( id )
{
	var canvas = this.canvas = document.getElementById( id );
	canvas.width = canvas.clientWidth;
	canvas.height = canvas.clientHeight;
	
	// Initialise WebGL
	var gl;
	try
	{
		gl = this.gl = canvas.getContext( "experimental-webgl" );
	} catch ( e ) {
		throw "Your browser doesn't support WebGL!";
	}
	
	gl.viewportWidth = canvas.width;
	gl.viewportHeight = canvas.height;
	
	gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
	gl.enable( gl.DEPTH_TEST );
	gl.enable( gl.CULL_FACE );
	
	// Load shaders
	this.loadShaders();
	
	// Create projection and view matrices
	var projMatrix = this.projMatrix = mat4.create();
	var viewMatrix = this.viewMatrix = mat4.create();
	
	// Load terrain texture
	var texture = this.texTerrain = gl.createTexture();
	texture.image = new Image();
	texture.image.onload = function()
	{
		gl.activeTexture( gl.TEXTURE0 );
		gl.bindTexture( gl.TEXTURE_2D, texture );
		gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
		gl.uniform1i(  this.uSampler, 0 );
	};
	texture.image.src = "media/terrain.png";
}

// draw()
//
// Render one frame of the world to the canvas.

Renderer.prototype.draw = function()
{
	var gl = this.gl;
	
	// Initialise view
	gl.viewport( 0, 0, gl.viewportWidth, gl.viewportHeight );
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
	
	// Draw level chunks
	var chunks = this.chunks;
	if ( chunks != null )
	{
		for ( var i = 0; i < chunks.length; i++ )
		{
			if ( chunks[i].buffer != null ) 
				this.drawBuffer( chunks[i].buffer );
		}
	}
}

// loadShaders()
//
// Takes care of loading the shaders.

Renderer.prototype.loadShaders = function()
{
	var gl = this.gl;
	
	// Create shader program
	var program = this.program = gl.createProgram();
	
	// Compile vertex shader
	var vertexShader = gl.createShader( gl.VERTEX_SHADER );
	gl.shaderSource( vertexShader, vertexSource );
	gl.compileShader( vertexShader );
	gl.attachShader( program, vertexShader );
	
	if ( !gl.getShaderParameter( vertexShader, gl.COMPILE_STATUS ) )
		throw "Could not compile vertex shader!\n" + gl.getShaderInfoLog( vertexShader );
	
	// Compile fragment shader
	var fragmentShader = gl.createShader( gl.FRAGMENT_SHADER );
	gl.shaderSource( fragmentShader, fragmentSource );
	gl.compileShader( fragmentShader );
	gl.attachShader( program, fragmentShader );
	
	if ( !gl.getShaderParameter( fragmentShader, gl.COMPILE_STATUS ) )
		throw "Could not compile fragment shader!\n" + gl.getShaderInfoLog( fragmentShader );
	
	// Finish program
	gl.linkProgram( program );
	
	if ( !gl.getProgramParameter( program, gl.LINK_STATUS ) )
		throw "Could not link the shader program!";
	
	gl.useProgram( program );
	
	// Store variable locations
	this.uProjMat = gl.getUniformLocation( program, "uProjMatrix" );
	this.uViewMat= gl.getUniformLocation( program, "uViewMatrix" );
	this.uSampler = gl.getUniformLocation( program, "uSampler" );
	this.aPos = gl.getAttribLocation( program, "aPos" );
	this.aColor = gl.getAttribLocation( program, "aColor" );
	this.aTexCoord = gl.getAttribLocation( program, "aTexCoord" );
	
	// Enable input
	gl.enableVertexAttribArray( this.aPos );
	gl.enableVertexAttribArray( this.aColor );
	gl.enableVertexAttribArray( this.aTexCoord );
}

// setWorld( world, chunkSize )
//
// Makes the renderer start tracking a new world and set up the chunk structure.
//
// world - The world object to operate on.
// chunkSize - X, Y and Z dimensions of each chunk, doesn't have to fit exactly inside the world.

Renderer.prototype.setWorld = function( world, chunkSize )
{
	this.world = world;
	this.chunkSize = chunkSize;
	
	// Create chunk list
	var chunks = this.chunks = [];
	for ( var x = 0; x < world.sx; x += chunkSize ) {
		for ( var y = 0; y < world.sy; y += chunkSize ) {
			for ( var z = 0; z < world.sz; z += chunkSize ) {
				chunks.push( {
					start: [ x, y, z ],
					end: [ Math.min( world.sz, x + chunkSize ), Math.min( world.sy, y + chunkSize ), Math.min( world.sz, z + chunkSize ) ],
					dirty: true
				} );
			}
		}
	}
}

// buildChunks( count )
//
// Build up to <count> dirty chunks.

function pushQuad( v, p1, p2, p3, p4 )
{
	v.push( p1[0], p1[1], p1[2], p1[3], p1[4], p1[5], p1[6], p1[7], p1[8] );
	v.push( p2[0], p2[1], p2[2], p2[3], p2[4], p2[5], p2[6], p2[7], p2[8] );
	v.push( p3[0], p3[1], p3[2], p3[3], p3[4], p3[5], p3[6], p3[7], p3[8] );
	
	v.push( p3[0], p3[1], p3[2], p3[3], p3[4], p3[5], p3[6], p3[7], p3[8] );
	v.push( p4[0], p4[1], p4[2], p4[3], p4[4], p4[5], p4[6], p4[7], p4[8] );
	v.push( p1[0], p1[1], p1[2], p1[3], p1[4], p1[5], p1[6], p1[7], p1[8] );
}

Renderer.prototype.buildChunks = function( count )
{
	var gl = this.gl;
	var chunks = this.chunks;
	var world = this.world;
	
	for ( var i = 0; i < chunks.length; i++ )
	{
		var chunk = chunks[i];
		
		if ( chunk.dirty )
		{
			var vertices = [];
			
			// Add vertices for blocks
			for ( var x = chunk.start[0]; x < chunk.end[0]; x++ ) {
				for ( var y = chunk.start[1]; y < chunk.end[1]; y++ ) {
					for ( var z = chunk.start[2]; z < chunk.end[2]; z++ ) {
						if ( world.blocks[x][y][z] == BLOCK.AIR ) continue;
						BLOCK.pushVertices( vertices, world, x, y, z );
					}
				}
			}
			
			// Create WebGL buffer
			if ( chunk.buffer ) gl.destroyBuffer( chunk.buffer );
			
			var buffer = chunk.buffer = gl.createBuffer();
			buffer.vertices = vertices.length / 9;
			gl.bindBuffer( gl.ARRAY_BUFFER, buffer );
			gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( vertices ), gl.STATIC_DRAW );
			
			chunk.dirty = false;
			count--;
		}
		
		if ( count == 0 ) break;
	}
}

// setPerspective( fov, min, max )
//
// Sets the properties of the perspective projection.

Renderer.prototype.setPerspective = function( fov, min, max )
{
	var gl = this.gl;
	
	mat4.perspective( fov, gl.viewportWidth / gl.viewportHeight, min, max, this.projMatrix );
	gl.uniformMatrix4fv( this.uProjMat, false, this.projMatrix );
}

// setCamera( pos, target )
//
// Moves the camera to the specified position and makes it look at <target>.

Renderer.prototype.setCamera = function( pos, target )
{
	var gl = this.gl;
	
	mat4.lookAt( pos, target, [ 0, 0, 1 ], this.viewMatrix );
	gl.uniformMatrix4fv( this.uViewMat, false, this.viewMatrix );
}

Renderer.prototype.drawBuffer = function( buffer )
{
	var gl = this.gl;
	
	gl.bindBuffer( gl.ARRAY_BUFFER, buffer );
	
	gl.vertexAttribPointer( this.aPos, 3, gl.FLOAT, false, 9*4, 0 );
	gl.vertexAttribPointer( this.aColor, 4, gl.FLOAT, false, 9*4, 5*4 );
	gl.vertexAttribPointer( this.aTexCoord, 2, gl.FLOAT, false, 9*4, 3*4 );
	
	gl.drawArrays( gl.TRIANGLES, 0, buffer.vertices );
}