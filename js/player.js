// ==========================================
// Player
//
// This class contains the code that manages the local player.
// ==========================================

// Mouse event enumeration
MOUSE = {};
MOUSE.DOWN = 1;
MOUSE.UP = 2;
MOUSE.MOVE = 3;

// Constructor()
//
// Creates a new local player manager.

function Player()
{	
}

// setWorld( world )
//
// Assign the local player to a world.

Player.prototype.setWorld = function( world )
{
	this.world = world;
	this.pos = world.spawnPoint;
	this.velocity = new Vector( 0, 0, 0 );
	this.angles = [ 0, Math.PI, 0 ];
	this.falling = false;
	this.keys = {};
}

// setInputCanvas( id )
//
// Set the canvas the renderer uses for some input operations.

Player.prototype.setInputCanvas = function( id )
{
	var canvas = this.canvas = document.getElementById( id );
	
	var t = this;
	document.onkeydown = function( e ) { t.onKeyEvent( e.keyCode, true ); return false; }
	document.onkeyup = function( e ) { t.onKeyEvent( e.keyCode, false ); return false; }
	document.onmousedown = function( e ) { t.onMouseEvent( e.clientX, e.clientY, MOUSE.DOWN, e.which == 3 ); return false; }
	document.onmouseup = function( e ) { t.onMouseEvent( e.clientX, e.clientY, MOUSE.UP, e.which == 3 ); return false; }
	document.onmousemove = function( e ) { t.onMouseEvent( e.clientX, e.clientY, MOUSE.MOVE, e.which == 3 ); return false; }
}

// onKeyEvent( keyCode, down )
//
// Hook for keyboard input.

Player.prototype.onKeyEvent = function( keyCode, down )
{
	var key = String.fromCharCode( keyCode ).toLowerCase();
	this.keys[key] = down;
	this.keys[keyCode] = down;
}

// onMouseEvent( x, y, type, rmb )
//
// Hook for mouse input.

Player.prototype.onMouseEvent = function( x, y, type, rmb )
{
	if ( type == MOUSE.DOWN ) {
		this.dragStart = { x: x, y: y };
		this.mouseDown = true;
		this.yawStart = this.targetYaw = this.angles[1];
		this.pitchStart = this.targetPitch = this.angles[0];
	} else if ( type == MOUSE.UP ) {
		if ( Math.abs( this.dragStart.x - x ) + Math.abs( this.dragStart.y - y ) < 4 )	
			this.doBlockAction( x, y, !rmb );
		
		this.dragging = false;
		this.mouseDown = false;
		this.canvas.style.cursor = "default";
	} else if ( type == MOUSE.MOVE && this.mouseDown ) {
		this.dragging = true;
		this.targetPitch = this.pitchStart - ( y - this.dragStart.y ) / 200;
		this.targetYaw = this.yawStart + ( x - this.dragStart.x ) / 200;
		
		this.canvas.style.cursor = "move";
	}
}

// doBlockAction( x, y )
//
// Called to perform an action based on the player's block selection and input.

Player.prototype.doBlockAction = function( x, y, destroy )
{
	var world = this.world;
	
	// Get view ray
	var res = [];
	vec3.unproject( [ x, render.gl.viewportHeight - y, 1 ], render.viewMatrix, render.projMatrix, [ 0, 0, render.gl.viewportWidth, render.gl.viewportHeight ], res );
	var viewLine = { start: this.getEyePos(), dir: new Vector( res[0], res[1], res[2] ).normal() };
	
	// Collect block surfaces
	var blockFaces = [];
	var bPos = [ Math.floor( this.pos.x ), Math.floor( this.pos.y ), Math.floor( this.pos.z ) ];
	for ( var x = bPos[0] - 4; x <= bPos[0] + 4; x++ )
		for ( var y = bPos[1] - 4; y <= bPos[1] + 4; y++ )
			for ( var z = bPos[2] - 4; z <= bPos[2] + 4; z++ )
			{
				if ( world.getBlock( x, y, z ) != BLOCK.AIR )
				{
					if ( world.getBlock( x, y, z + 1 ) == BLOCK.AIR ) blockFaces.push( { p: new Vector( x + 0.5, y + 0.5, z + 0.99 ), normal: new Vector( 0, 0, 1 ), block: { x: x, y: y, z: z } } );
					if ( world.getBlock( x, y, z - 1 ) == BLOCK.AIR ) blockFaces.push( { p: new Vector( x + 0.5, y + 0.5, z ), normal: new Vector( 0, 0, -1 ), block: { x: x, y: y, z: z } } );
					
					if ( world.getBlock( x, y + 1, z ) == BLOCK.AIR ) blockFaces.push( { p: new Vector( x + 0.5, y + 0.99, z + 0.5 ), normal: new Vector( 0, 1, 0 ), block: { x: x, y: y, z: z } } );
					if ( world.getBlock( x, y - 1, z ) == BLOCK.AIR ) blockFaces.push( { p: new Vector( x + 0.5, y, z + 0.5 ), normal: new Vector( 0, -1, 0 ), block: { x: x, y: y, z: z } } );
					
					if ( world.getBlock( x + 1, y, z ) == BLOCK.AIR ) blockFaces.push( { p: new Vector( x + 0.99, y + 0.5, z + 0.5 ), normal: new Vector( 1, 0, 0 ), block: { x: x, y: y, z: z } } );
					if ( world.getBlock( x - 1, y, z ) == BLOCK.AIR ) blockFaces.push( { p: new Vector( x, y + 0.5, z + 0.5 ), normal: new Vector( -1, 0, 0 ), block: { x: x, y: y, z: z } } );
				}
			}
	
	// Find closest intersection
	var intersection = { pos: new Vector( 0, 0, 0 ), distance: 999, normal: new Vector( 0, 0, 0 ) };
	for ( var i in blockFaces )
	{
		var hit = linePlaneIntersect( viewLine, blockFaces[i] );
		var block = blockFaces[i].block;
		
		if ( hit != false && hit.x >= block.x && hit.x <= block.x+1 && hit.y >= block.y && hit.y <= block.y+1 && hit.z >= block.z && hit.z <= block.z+1 && hit.distance( viewLine.start ) < intersection.distance )
			intersection = {
				pos: new Vector( Math.floor( hit.x ), Math.floor( hit.y ), Math.floor( hit.z ) ),
				distance: hit.distance( viewLine.start ),
				normal: blockFaces[i].normal
			};
	}
	
	if ( intersection.distance < 10 ) {
		if ( destroy )
			world.setBlock( intersection.pos.x, intersection.pos.y, intersection.pos.z, BLOCK.AIR );
		else
			world.setBlock( intersection.pos.x + intersection.normal.x, intersection.pos.y + intersection.normal.y, intersection.pos.z + intersection.normal.z, BLOCK.DIRT );
	}
}

// getEyePos()
//
// Returns the position of the eyes of the player for rendering.

Player.prototype.getEyePos = function()
{
	return this.pos.add( new Vector( 0.0, 0.0, 1.7 ) );
}

// update()
//
// Updates this local player (gravity, movement)

Player.prototype.update = function()
{
	var world = this.world;
	var velocity = this.velocity;
	var pos = this.pos;
	var bPos = new Vector( Math.floor( pos.x ), Math.floor( pos.y ), Math.floor( pos.z ) );
	
	if ( this.lastUpdate != null )
	{
		var delta = ( new Date().getTime() - this.lastUpdate ) / 1000;
		
		// View
		if ( this.dragging )
		{
			this.angles[0] += ( this.targetPitch - this.angles[0] ) * 30 * delta;
			this.angles[1] += ( this.targetYaw - this.angles[1] ) * 30 * delta;
			if ( this.angles[0] < -Math.PI/2 ) this.angles[0] = -Math.PI/2;
			if ( this.angles[0] > Math.PI/2 ) this.angles[0] = Math.PI/2;
		}
		
		// Gravity
		if ( this.falling )
			velocity.z += -0.5;

		// Jumping
		if ( this.keys[" "] && !this.falling )
			velocity.z = 8;
		
		// Walking
		var walkVelocity = new Vector( 0, 0, 0 );
		if ( !this.falling )
		{
			if ( this.keys["w"] ) {
				walkVelocity.x += Math.cos( Math.PI / 2 - this.angles[1] );
				walkVelocity.y += Math.sin( Math.PI / 2 - this.angles[1] );
			}
			if ( this.keys["s"] ) {
				walkVelocity.x += Math.cos( Math.PI + Math.PI / 2 - this.angles[1] );
				walkVelocity.y += Math.sin( Math.PI + Math.PI / 2 - this.angles[1] );
			}
			if ( this.keys["a"] ) {
				walkVelocity.x += Math.cos( Math.PI / 2 + Math.PI / 2 - this.angles[1] );
				walkVelocity.y += Math.sin( Math.PI / 2 + Math.PI / 2 - this.angles[1] );
			}
			if ( this.keys["d"] ) {
				walkVelocity.x += Math.cos( -Math.PI / 2 + Math.PI / 2 - this.angles[1] );
				walkVelocity.y += Math.sin( -Math.PI / 2 + Math.PI / 2 - this.angles[1] );
			}
		}
		if ( walkVelocity.length() > 0 ) {
				walkVelocity = walkVelocity.normal();
				velocity.x = walkVelocity.x * 4;
				velocity.y = walkVelocity.y * 4;
		} else {
			velocity.x /= this.falling ? 1.01 : 1.5;
			velocity.y /= this.falling ? 1.01 : 1.5;
		}
		
		// Resolve collision
		this.pos = this.resolveCollision( pos, bPos, velocity.mul( delta ) );
	}
	
	this.lastUpdate = new Date().getTime();
}

// resolveCollision( pos, bPos, velocity )
//
// Resolves collisions between the player and blocks on XY level for the next movement step.

Player.prototype.resolveCollision = function( pos, bPos, velocity )
{
	var world = this.world;
	var playerRect = { x: pos.x + velocity.x, y: pos.y + velocity.y, size: 0.25 };
	
	// Collect XY collision sides
	var collisionCandidates = [];
	
	for ( var x = bPos.x - 1; x <= bPos.x + 1; x++ )
	{
		for ( var y = bPos.y - 1; y <= bPos.y + 1; y++ )
		{
			for ( var z = bPos.z; z <= bPos.z + 1; z++ )
			{
				if ( world.getBlock( x, y, z ) != BLOCK.AIR )
				{
					if ( world.getBlock( x - 1, y, z ) == BLOCK.AIR ) collisionCandidates.push( { x: x, dir: -1, y1: y, y2: y + 1 } );
					if ( world.getBlock( x + 1, y, z ) == BLOCK.AIR ) collisionCandidates.push( { x: x + 1, dir: 1, y1: y, y2: y + 1 } );
					if ( world.getBlock( x, y - 1, z ) == BLOCK.AIR ) collisionCandidates.push( { y: y, dir: -1, x1: x, x2: x + 1 } );
					if ( world.getBlock( x, y + 1, z ) == BLOCK.AIR ) collisionCandidates.push( { y: y + 1, dir: 1, x1: x, x2: x + 1 } );
				}
			}
		}
	}
	
	// Solve XY collisions
	for( var i in collisionCandidates ) 
	{
		var side = collisionCandidates[i];
		
		if ( lineRectCollide( side, playerRect ) )
		{
			if ( side.x != null && velocity.x * side.dir < 0 ) {
				pos.x = side.x + playerRect.size / 2 * ( velocity.x > 0 ? -1 : 1 );
				velocity.x = 0;
			} else if ( side.y != null && velocity.y * side.dir < 0 ) {
				pos.y = side.y + playerRect.size / 2 * ( velocity.y > 0 ? -1 : 1 );
				velocity.y = 0;
			}
		}
	}
	
	var playerFace = { x1: pos.x + velocity.x - 0.125, y1: pos.y + velocity.y - 0.125, x2: pos.x + velocity.x + 0.125, y2: pos.y + velocity.y + 0.125 };
	var newBZLower = Math.floor( pos.z + velocity.z );
	var newBZUpper = Math.floor( pos.z + 1.7 + velocity.z * 1.1 );
	
	// Collect Z collision sides
	collisionCandidates = [];
	
	for ( var x = bPos.x - 1; x <= bPos.x + 1; x++ ) 
	{
		for ( var y = bPos.y - 1; y <= bPos.y + 1; y++ )
		{
			if ( world.getBlock( x, y, newBZLower ) != BLOCK.AIR )
				collisionCandidates.push( { z: newBZLower + 1, dir: 1, x1: x, y1: y, x2: x + 1, y2: y + 1 } );
			if ( world.getBlock( x, y, newBZUpper ) != BLOCK.AIR )
				collisionCandidates.push( { z: newBZUpper, dir: -1, x1: x, y1: y, x2: x + 1, y2: y + 1 } );
		}
	}
	
	// Solve Z collisions
	this.falling = true;
	for ( var i in collisionCandidates )
	{
		var face = collisionCandidates[i];
		
		if ( rectRectCollide( face, playerFace ) && velocity.z * face.dir < 0 )
		{
			if ( velocity.z < 0 ) {
				this.falling = false;
				pos.z = face.z;
				velocity.z = 0;
				this.velocity.z = 0;
			} else {
				pos.z = face.z - 1.8;
				velocity.z = 0;
				this.velocity.z = 0;
			}
			
			break;
		}
	}
	
	// Return solution
	return pos.add( velocity );
}