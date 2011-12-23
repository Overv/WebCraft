// ==========================================
// Physics
//
// This class contains the code that takes care of simulating
// processes like gravity and fluid flow in the world.
// ==========================================

// Constructor()
//
// Creates a new physics simulator.

function Physics()
{
	
}

// setWorld( world )
//
// Assigns a world to simulate to this physics simulator.

Physics.prototype.setWorld = function( world )
{
	this.world = world;
}

// simulate()
//
// Perform one iteration of physics simulation.
// Should be called about once every second.

Physics.prototype.simulate = function()
{
	var world = this.world;
	var blocks = world.blocks;
	
	// Gravity
	for ( var x = 0; x < world.sx; x++ ) {
		for ( var y = 0; y < world.sy; y++ ) {
			for ( var z = 0; z < world.sz; z++ ) {
				if ( blocks[x][y][z].gravity && z > 0 && blocks[x][y][z-1] == BLOCK.AIR )
				{
					world.setBlock( x, y, z - 1, blocks[x][y][z] );
					world.setBlock( x, y, z, BLOCK.AIR );
				}
			}
		}
	}
}