// ==========================================
// World container
//
// This class contains the elements that make up the game world.
// Other modules retrieve information from the world or alter it
// using this class.
// ==========================================

// Constructor( sx, sy, sz )
//
// Creates a new world container with the specified world size.
// Up and down should always be aligned with the Z-direction.
//
// sx - World size in the X-direction.
// sy - World size in the Y-direction.
// sz - World size in the Z-direction.

function World( sx, sy, sz )
{
	// Initialise world array
	this.blocks = new Array( sx );
	for ( var x = 0; x < sx; x++ )
	{
		this.blocks[x] = new Array( sy );
		for ( var y = 0; y < sy; y++ )
		{
			this.blocks[x][y] = new Array( sz );
		}
	}
	this.sx = sx;
	this.sy = sy;
	this.sz = sz;
	
	// Initialise player array
	this.players = new Array();
}

// createFlatWorld()
//
// Sets up the world so that the bottom half is filled with dirt
// and the top half with air.

World.prototype.createFlatWorld = function( height )
{
	this.spawnPoint = new Vector( this.sx / 2 + 0.5, this.sy / 2 + 0.5, height );
	
	for ( var x = 0; x < this.sx; x++ )
		for ( var y = 0; y < this.sy; y++ )
			for ( var z = 0; z < this.sz; z++ )
				this.blocks[x][y][z] = z < height ? BLOCK.DIRT : BLOCK.AIR;
}

// getBlock( x, y, z )
//
// Get the type of the block at the specified position.
// Mostly for neatness, since accessing the array
// directly is easier and faster.

World.prototype.getBlock = function( x, y, z )
{
	if ( x < 0 || y < 0 || z < 0 || x > this.sx - 1 || y > this.sy - 1 || z > this.sz - 1 ) return BLOCK.AIR;
	return this.blocks[x][y][z];
}

// setBlock( x, y, z )

World.prototype.setBlock = function( x, y, z, type )
{
	this.blocks[x][y][z] = type;
	if ( this.renderer != null ) this.renderer.onBlockChanged( x, y, z );
}