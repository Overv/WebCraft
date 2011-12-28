// ==========================================
// Server
//
// This file contains all of the code necessary for managing a
// WebCraft server on the Node.js platform.
// ==========================================

// Parameters
var WORLD_SX = 16;
var WORLD_SY = 16;
var WORLD_SZ = 16;
var WORLD_GROUNDHEIGHT = 8;

// Load modules
var modules = {};
modules.helpers = require( "./js/helpers.js" );
modules.blocks = require( "./js/blocks.js" );
modules.world = require( "./js/world.js" );
modules.network = require( "./js/network.js" );
modules.io = require( "socket.io" );

// Set-up evil globals
global.Vector = modules.helpers.Vector;
global.BLOCK = modules.blocks.BLOCK;

// Create new empty world
var world = new modules.world.World( WORLD_SX, WORLD_SY, WORLD_SZ );
world.createFlatWorld( WORLD_GROUNDHEIGHT );

// Start server
var server = new modules.network.Server( modules.io );
server.setWorld( world );