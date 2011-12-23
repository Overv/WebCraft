// ==========================================
// Block types
//
// This file contains all available block types and their properties.
// ==========================================

// Direction enumeration
var DIRECTION = {};
DIRECTION.UP = 1;
DIRECTION.DOWN = 2;
DIRECTION.LEFT = 3;
DIRECTION.RIGHT = 4;
DIRECTION.FORWARD = 5;
DIRECTION.BACK = 6;

BLOCK = {};

// Air
BLOCK.AIR = {
	transparent: true
};

// Dirt
BLOCK.DIRT = {
	transparent: false,
	
	texture: function( world, lightmap, lit, x, y, z, dir )
	{
		if ( dir == DIRECTION.UP && lit )
			return [ 14/16, 0/16, 15/16, 1/16 ];
		else if ( dir == DIRECTION.DOWN || !lit ) 
			return [ 2/16, 0/16, 3/16, 1/16 ];
		else
			return [ 3/16, 0/16, 4/16, 1/16 ];
	}
};

// pushVertices( vertices, world, lightmap, x, y, z )
//
// Pushes the vertices necessary for rendering a
// specific block into the array.

BLOCK.pushVertices = function( vertices, world, lightmap, x, y, z )
{
	var blocks = world.blocks;
	var blockLit = z >= lightmap[x][y];
	
	// Top
	if ( z == world.sz - 1 || world.blocks[x][y][z+1].transparent )
	{
		var c = world.blocks[x][y][z].texture( world, lightmap, blockLit, x, y, z, DIRECTION.UP );
		
		var lightMultiplier = z >= lightmap[x][y] ? 1.0 : 0.6;
		
		pushQuad(
			vertices,
			[ x, y, z + 1.0, c[0], c[1], lightMultiplier, lightMultiplier, lightMultiplier, 1.0 ],
			[ x + 1.0, y, z + 1.0, c[2], c[1], lightMultiplier, lightMultiplier, lightMultiplier, 1.0 ],
			[ x + 1.0, y + 1.0, z + 1.0, c[2], c[3], lightMultiplier, lightMultiplier, lightMultiplier, 1.0 ],
			[ x, y + 1.0, z + 1.0, c[0], c[3], lightMultiplier, lightMultiplier, lightMultiplier, 1.0 ]
		);
	}
	
	// Bottom
	if ( z == 0 || world.blocks[x][y][z-1].transparent )
	{
		var c = world.blocks[x][y][z].texture( world, lightmap, blockLit, x, y, z, DIRECTION.DOWN );
		
		pushQuad(
			vertices,							
			[ x, y + 1.0, z, c[0], c[3], 0.6, 0.6, 0.6, 1.0 ],
			[ x + 1.0, y + 1.0, z, c[2], c[3], 0.6, 0.6, 0.6, 1.0 ],
			[ x + 1.0, y, z, c[2], c[1], 0.6, 0.6, 0.6, 1.0 ],
			[ x, y, z, c[0], c[1], 0.6, 0.6, 0.6, 1.0 ]
		);
	}
	
	// Front
	if ( y == 0 || world.blocks[x][y-1][z].transparent )
	{
		var c = world.blocks[x][y][z].texture( world, lightmap, blockLit, x, y, z, DIRECTION.FORWARD );
		
		var lightMultiplier = ( y == 0 || z >= lightmap[x][y-1] ) ? 1.0 : 0.6;
		
		pushQuad(
			vertices,
			[ x, y, z, c[0], c[3], lightMultiplier, lightMultiplier, lightMultiplier, 1.0 ],
			[ x + 1.0, y, z, c[2], c[3], lightMultiplier, lightMultiplier, lightMultiplier, 1.0 ],
			[ x + 1.0, y, z + 1.0, c[2], c[1], lightMultiplier, lightMultiplier, lightMultiplier, 1.0 ],
			[ x, y, z + 1.0, c[0], c[1], lightMultiplier, lightMultiplier, lightMultiplier, 1.0 ]
		);
	}
	
	// Back
	if ( y == world.sy - 1 || world.blocks[x][y+1][z].transparent )
	{
		var c = world.blocks[x][y][z].texture( world, lightmap, blockLit, x, y, z, DIRECTION.BACK );
		
		pushQuad(
			vertices,
			[ x, y + 1.0, z + 1.0, c[0], c[1], 0.6, 0.6, 0.6, 1.0 ],
			[ x + 1.0, y + 1.0, z + 1.0, c[2], c[1], 0.6, 0.6, 0.6, 1.0 ],
			[ x + 1.0, y + 1.0, z, c[2], c[3], 0.6, 0.6, 0.6, 1.0 ],
			[ x, y + 1.0, z, c[0], c[3], 0.6, 0.6, 0.6, 1.0 ]
		);
	}
	
	// Left
	if ( x == 0 || world.blocks[x-1][y][z].transparent )
	{
		var c = world.blocks[x][y][z].texture( world, lightmap, blockLit, x, y, z, DIRECTION.LEFT );
		
		pushQuad(
			vertices,
			[ x, y, z + 1.0, c[0], c[1], 0.6, 0.6, 0.6, 1.0 ],
			[ x, y + 1.0, z + 1.0, c[2], c[1], 0.6, 0.6, 0.6, 1.0 ],
			[ x, y + 1.0, z, c[2], c[3], 0.6, 0.6, 0.6, 1.0 ],
			[ x, y, z, c[0], c[3], 0.6, 0.6, 0.6, 1.0 ]
		);
	}
	
	// Right
	if ( x == world.sx - 1 || world.blocks[x+1][y][z].transparent )
	{
		var c = world.blocks[x][y][z].texture( world, lightmap, blockLit, x, y, z, DIRECTION.RIGHT );
		
		var lightMultiplier = ( x == world.sx - 1 || z >= lightmap[x+1][y] ) ? 1.0 : 0.6;
		
		pushQuad(
			vertices,
			[ x + 1.0, y, z, c[0], c[3], lightMultiplier, lightMultiplier, lightMultiplier, 1.0 ],
			[ x + 1.0, y + 1.0, z, c[2], c[3], lightMultiplier, lightMultiplier, lightMultiplier, 1.0 ],
			[ x + 1.0, y + 1.0, z + 1.0, c[2], c[1], lightMultiplier, lightMultiplier, lightMultiplier, 1.0 ],
			[ x + 1.0, y, z + 1.0, c[0], c[1], lightMultiplier, lightMultiplier, lightMultiplier, 1.0 ]
		);
	}
}