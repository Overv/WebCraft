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
	selflit: false,
	gravity: false,
	fluid: false,
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

// Wood
BLOCK.WOOD = {
	transparent: false,
	selflit: false,
	gravity: false,
	fluid: false,
	texture: function( world, lightmap, lit, x, y, z, dir )
	{
		if ( dir == DIRECTION.UP || dir == DIRECTION.DOWN )
			return [ 5/16, 1/16, 6/16, 2/16 ];
		else
			return [ 4/16, 1/16, 5/16, 2/16 ];
	}
};

// TNT
BLOCK.TNT = {
	transparent: false,
	selflit: false,
	gravity: false,
	fluid: false,
	texture: function( world, lightmap, lit, x, y, z, dir )
	{
		if ( dir == DIRECTION.UP || dir == DIRECTION.DOWN )
			return [ 10/16, 0/16, 11/16, 1/16 ];
		else
			return [ 8/16, 0/16, 9/16, 1/16 ];
	}
};

// Bookcase
BLOCK.BOOKCASE = {
	transparent: false,
	selflit: false,
	gravity: false,
	fluid: false,
	texture: function( world, lightmap, lit, x, y, z, dir )
	{
		if ( dir == DIRECTION.FORWARD || dir == DIRECTION.BACK )
			return [ 3/16, 2/16, 4/16, 3/16 ];
		else
			return [ 4/16, 0/16, 5/16, 1/16 ];
	}
};

// Lava
BLOCK.LAVA = {
	transparent: true,
	selflit: true,
	gravity: true,
	fluid: true,
	texture: function( world, lightmap, lit, x, y, z, dir )
	{
		return [ 13/16, 14/16, 14/16, 15/16 ];
	}
};

// Plank
BLOCK.PLANK = {
	transparent: false,
	selflit: false,
	gravity: false,
	fluid: false,
	texture: function( world, lightmap, lit, x, y, z, dir ) { return [ 4/16, 0/16, 5/16, 1/16 ]; }
};

// Cobblestone
BLOCK.COBBLESTONE = {
	transparent: false,
	selflit: false,
	gravity: false,
	fluid: false,
	texture: function( world, lightmap, lit, x, y, z, dir ) { return [ 0/16, 1/16, 1/16, 2/16 ]; }
};

// Concrete
BLOCK.CONCRETE = {
	transparent: false,
	selflit: false,
	gravity: false,
	fluid: false,
	texture: function( world, lightmap, lit, x, y, z, dir ) { return [ 1/16, 0/16, 2/16, 1/16 ]; }
};

// Brick
BLOCK.BRICK = {
	transparent: false,
	selflit: false,
	gravity: false,
	fluid: false,
	texture: function( world, lightmap, lit, x, y, z, dir ) { return [ 7/16, 0/16, 8/16, 1/16 ]; }
};

// Sand
BLOCK.SAND = {
	transparent: false,
	selflit: false,
	gravity: true,
	fluid: false,
	texture: function( world, lightmap, lit, x, y, z, dir ) { return [ 2/16, 1/16, 3/16, 2/16 ]; }
};

// Gravel
BLOCK.GRAVEL = {
	transparent: false,
	selflit: false,
	gravity: true,
	fluid: false,
	texture: function( world, lightmap, lit, x, y, z, dir ) { return [ 3/16, 1/16, 4/16, 2/16 ]; }
};

// Iron
BLOCK.IRON = {
	transparent: false,
	selflit: false,
	gravity: false,
	fluid: false,
	texture: function( world, lightmap, lit, x, y, z, dir ) { return [ 6/16, 1/16, 7/16, 2/16 ]; }
};

// Gold
BLOCK.GOLD = {
	transparent: false,
	selflit: false,
	gravity: false,
	fluid: false,
	texture: function( world, lightmap, lit, x, y, z, dir ) { return [ 7/16, 1/16, 8/16, 2/16 ]; }
};

// Diamond
BLOCK.DIAMOND = {
	transparent: false,
	selflit: false,
	gravity: false,
	fluid: false,
	texture: function( world, lightmap, lit, x, y, z, dir ) { return [ 8/16, 1/16, 9/16, 2/16 ]; }
};

// Obsidian
BLOCK.OBSIDIAN = {
	transparent: false,
	selflit: false,
	gravity: false,
	fluid: false,
	texture: function( world, lightmap, lit, x, y, z, dir ) { return [ 5/16, 2/16, 6/16, 3/16 ]; }
};

// Glass
BLOCK.GLASS = {
	transparent: true,
	selflit: false,
	gravity: false,
	fluid: false,
	texture: function( world, lightmap, lit, x, y, z, dir ) { return [ 1/16, 3/16, 2/16, 4/16 ]; }
};

// Sponge
BLOCK.SPONGE = {
	transparent: false,
	selflit: false,
	gravity: false,
	fluid: false,
	texture: function( world, lightmap, lit, x, y, z, dir ) { return [ 0/16, 3/16, 1/16, 4/16 ]; }
};

// pushVertices( vertices, world, lightmap, x, y, z )
//
// Pushes the vertices necessary for rendering a
// specific block into the array.

BLOCK.pushVertices = function( vertices, world, lightmap, x, y, z )
{
	var blocks = world.blocks;
	var blockLit = z >= lightmap[x][y];
	var block = blocks[x][y][z];
	var bH = block.fluid ? 0.9 : 1.0;
	
	// Top
	if ( z == world.sz - 1 || world.blocks[x][y][z+1].transparent )
	{
		var c = block.texture( world, lightmap, blockLit, x, y, z, DIRECTION.UP );
		
		var lightMultiplier = z >= lightmap[x][y] ? 1.0 : 0.6;
		if ( block.selflit ) lightMultiplier = 1.0;
		
		pushQuad(
			vertices,
			[ x, y, z + bH, c[0], c[1], lightMultiplier, lightMultiplier, lightMultiplier, 1.0 ],
			[ x + 1.0, y, z + bH, c[2], c[1], lightMultiplier, lightMultiplier, lightMultiplier, 1.0 ],
			[ x + 1.0, y + 1.0, z + bH, c[2], c[3], lightMultiplier, lightMultiplier, lightMultiplier, 1.0 ],
			[ x, y + 1.0, z + bH, c[0], c[3], lightMultiplier, lightMultiplier, lightMultiplier, 1.0 ]
		);
	}
	
	// Bottom
	if ( z == 0 || world.blocks[x][y][z-1].transparent )
	{
		var c = block.texture( world, lightmap, blockLit, x, y, z, DIRECTION.DOWN );
		
		var lightMultiplier = block.selflit ? 1.0 : 0.6;
		
		pushQuad(
			vertices,							
			[ x, y + 1.0, z, c[0], c[3], lightMultiplier, lightMultiplier, lightMultiplier, 1.0 ],
			[ x + 1.0, y + 1.0, z, c[2], c[3], lightMultiplier, lightMultiplier, lightMultiplier, 1.0 ],
			[ x + 1.0, y, z, c[2], c[1], lightMultiplier, lightMultiplier, lightMultiplier, 1.0 ],
			[ x, y, z, c[0], c[1], lightMultiplier, lightMultiplier, lightMultiplier, 1.0 ]
		);
	}
	
	// Front
	if ( y == 0 || world.blocks[x][y-1][z].transparent )
	{
		var c = block.texture( world, lightmap, blockLit, x, y, z, DIRECTION.FORWARD );
		
		var lightMultiplier = ( y == 0 || z >= lightmap[x][y-1] ) ? 1.0 : 0.6;
		if ( block.selflit ) lightMultiplier = 1.0;
		
		pushQuad(
			vertices,
			[ x, y, z, c[0], c[3], lightMultiplier, lightMultiplier, lightMultiplier, 1.0 ],
			[ x + 1.0, y, z, c[2], c[3], lightMultiplier, lightMultiplier, lightMultiplier, 1.0 ],
			[ x + 1.0, y, z + bH, c[2], c[1], lightMultiplier, lightMultiplier, lightMultiplier, 1.0 ],
			[ x, y, z + bH, c[0], c[1], lightMultiplier, lightMultiplier, lightMultiplier, 1.0 ]
		);
	}
	
	// Back
	if ( y == world.sy - 1 || world.blocks[x][y+1][z].transparent )
	{
		var c = block.texture( world, lightmap, blockLit, x, y, z, DIRECTION.BACK );
		
		var lightMultiplier = block.selflit ? 1.0 : 0.6;
		
		pushQuad(
			vertices,
			[ x, y + 1.0, z + bH, c[2], c[1], lightMultiplier, lightMultiplier, lightMultiplier, 1.0 ],
			[ x + 1.0, y + 1.0, z + bH, c[0], c[1], lightMultiplier, lightMultiplier, lightMultiplier, 1.0 ],
			[ x + 1.0, y + 1.0, z, c[0], c[3], lightMultiplier, lightMultiplier, lightMultiplier, 1.0 ],
			[ x, y + 1.0, z, c[2], c[3], lightMultiplier, lightMultiplier, lightMultiplier, 1.0 ]
		);
	}
	
	// Left
	if ( x == 0 || world.blocks[x-1][y][z].transparent )
	{
		var c = block.texture( world, lightmap, blockLit, x, y, z, DIRECTION.LEFT );
		
		var lightMultiplier = block.selflit ? 1.0 : 0.6;
		
		pushQuad(
			vertices,
			[ x, y, z + bH, c[2], c[1], lightMultiplier, lightMultiplier, lightMultiplier, 1.0 ],
			[ x, y + 1.0, z + bH, c[0], c[1], lightMultiplier, lightMultiplier, lightMultiplier, 1.0 ],
			[ x, y + 1.0, z, c[0], c[3], lightMultiplier, lightMultiplier, lightMultiplier, 1.0 ],
			[ x, y, z, c[2], c[3], lightMultiplier, lightMultiplier, lightMultiplier, 1.0 ]
		);
	}
	
	// Right
	if ( x == world.sx - 1 || world.blocks[x+1][y][z].transparent )
	{
		var c = block.texture( world, lightmap, blockLit, x, y, z, DIRECTION.RIGHT );
		
		var lightMultiplier = ( x == world.sx - 1 || z >= lightmap[x+1][y] ) ? 1.0 : 0.6;
		if ( block.selflit ) lightMultiplier = 1.0;
		
		pushQuad(
			vertices,
			[ x + 1.0, y, z, c[0], c[3], lightMultiplier, lightMultiplier, lightMultiplier, 1.0 ],
			[ x + 1.0, y + 1.0, z, c[2], c[3], lightMultiplier, lightMultiplier, lightMultiplier, 1.0 ],
			[ x + 1.0, y + 1.0, z + bH, c[2], c[1], lightMultiplier, lightMultiplier, lightMultiplier, 1.0 ],
			[ x + 1.0, y, z + bH, c[0], c[1], lightMultiplier, lightMultiplier, lightMultiplier, 1.0 ]
		);
	}
}