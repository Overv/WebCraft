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
	this.angles = [ 0, 0, 0 ];
	this.keys = {};
}

// onKeyEvent( keyCode, down )
//
// Hook for keyboard input.

Player.prototype.onKeyEvent = function( keyCode, down )
{
	var key = String.fromCharCode( keyCode ).toLowerCase();
	this.keys[key] = down;
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
	
	if ( this.lastUpdate != null )
	{
		var delta = ( new Date().getTime() - this.lastUpdate ) / 1000;
		
		// Simulate gravity
		var bX = Math.floor( this.pos.x );
		var bY = Math.floor( this.pos.y );
		var bZ = Math.floor( this.pos.z );
		
		if ( world.blocks[bX][bY][bZ] == BLOCK.AIR && this.pos.z - bZ > 0.1 )
		{
			this.pos.z  -= delta * 10;
		} else if ( bZ > 0 && world.blocks[bX][bY][bZ-1] == BLOCK.AIR ) {
			this.pos.z -= delta * 10;
		}
		
		// Rotating the view
		if ( this.keys["a"] )
			this.angles[1] -= delta * 1.5;
		else if ( this.keys["d"] )
			this.angles[1] += delta * 1.5;
		
		// Moving
		var dX, dY;
		if ( this.keys["w"] ) {
			dX = Math.cos( Math.PI / 2 - this.angles[1] );
			dY = Math.sin( Math.PI / 2 - this.angles[1] );
		} else if ( this.keys["s"] ) {
			dX = Math.cos( Math.PI + Math.PI / 2 - this.angles[1] );
			dY = Math.sin( Math.PI + Math.PI / 2 - this.angles[1] );
		}
		
		if ( dX && dY )
		{
			var newBX = Math.floor( this.pos.x + dX / 5 );
			var newBY = Math.floor( this.pos.y + dY / 5 );
			
			if ( newBX >= 0 && newBY >= 0 && newBX < world.sx && newBY < world.sy )
			{
				var block = world.blocks[newBX][newBY][bZ];
				if ( block == BLOCK.AIR )
				{
					this.pos.x += dX * 3 * delta;
					this.pos.y += dY * 3 * delta;
				}
			}
		}
	}
	
	this.lastUpdate = new Date().getTime();
}