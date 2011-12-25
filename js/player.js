// ==========================================
// Player
//
// This class contains the code that manages the local player.
// ==========================================

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
	this.angles = [ 0, 0, 0 ];
	this.falling = true;
	this.keys = {};
}

// onKeyEvent( keyCode, down )
//
// Hook for keyboard input.

Player.prototype.onKeyEvent = function( keyCode, down )
{
	var key = String.fromCharCode( keyCode ).toLowerCase();
	this.keys[key] = down;
	this.keys[keyCode] = down;
	//alert( keyCode );
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
	var blocks = world.blocks;
	var velocity = this.velocity;
	var pos = this.pos;
	var bPos = new Vector( Math.floor( pos.x ), Math.floor( pos.y ), Math.floor( pos.z ) );
	
	if ( this.lastUpdate != null )
	{
		var delta = ( new Date().getTime() - this.lastUpdate ) / 1000;
		
		// Yaw
		if ( this.keys[37] ) {
			this.angles[1] -= 1.4 * delta;
		}
		if ( this.keys[39] ) {
			this.angles[1] += 1.4 * delta;
		}
		
		// Pitch
		if ( this.keys[38] ) {
			this.angles[0] -= 1.2 * delta;
		}
		if ( this.keys[40] ) {
			this.angles[0] += 1.2 * delta;
		}
		this.angles[0] = this.angles[0] > Math.PI/2 ? Math.PI/2 : ( this.angles[0] < -Math.PI/2 ? -Math.PI/2 : this.angles[0] );
		
		// Gravity
		if ( pos.z == 0 || ( blocks[bPos.x][bPos.y][bPos.z-1] != BLOCK.AIR && pos.z == bPos.z ) ) {
			this.falling = false;
		} else if ( blocks[bPos.x][bPos.y][bPos.z] != BLOCK.AIR ) {
			pos.z = bPos.z + 1;
			velocity.z = 0;
			this.falling = true;
		} else {
			velocity.z += -0.3;
			this.falling = true;
		}
		
		// Jumping
		if ( this.keys[" "] && !this.falling )
		{
			velocity.z += 7.2;
		}
		
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
			velocity.x /= this.falling ? 1.005 : 1.2;
			velocity.y /= this.falling ? 1.005 : 1.2;
		}
		
		// Perform movement
		this.pos = this.pos.add( velocity.mul( delta ) );
	}
	
	this.lastUpdate = new Date().getTime();
}