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
var SECONDS_BETWEEN_SAVES = 60;

// Load modules
var modules = {};
modules.helpers = require( "./js/helpers.js" );
modules.blocks = require( "./js/blocks.js" );
modules.world = require( "./js/world.js" );
modules.network = require( "./js/network.js" );
modules.io = require( "socket.io" );
modules.fs = require( "fs" );
var log = require( "util" ).log;

// Set-up evil globals
global.Vector = modules.helpers.Vector;
global.BLOCK = modules.blocks.BLOCK;

// Create new empty world or load one from file
var world = new modules.world.World( WORLD_SX, WORLD_SY, WORLD_SZ );
log( "Creating world..." );
if ( world.loadFromFile( "world" ) ) {
	log( "Loaded the world from file." );
} else {
	log( "Creating a new empty world." );
	world.createFlatWorld( WORLD_GROUNDHEIGHT );
	world.saveToFile( "world" );
}

// Start server
var server = new modules.network.Server( modules.io );
server.setWorld( world );
server.setLogger( log );
log( "Waiting for clients..." );

// Periodical saves
setInterval( function()
{
	world.saveToFile( "world" );
	log( "Saved world to file." );
}, SECONDS_BETWEEN_SAVES * 1000 );