// ==========================================
// Server
//
// This file contains all of the code necessary for managing a
// WebCraft server on the Node.js platform.
// ==========================================

// Parameters
var WORLD_SX = 128;
var WORLD_SY = 128;
var WORLD_SZ = 32;
var WORLD_GROUNDHEIGHT = 16;
var SECONDS_BETWEEN_SAVES = 60;
var ADMIN_IP = "";

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
var server = new modules.network.Server( modules.io, 16 );
server.setWorld( world );
server.setLogger( log );
server.setOneUserPerIp( true );
log( "Waiting for clients..." );

// Chat commands
server.on( "chat", function( client, nickname, msg )
{
	if ( msg == "/spawn" ) {
		server.setPos( client, world.spawnPoint.x, world.spawnPoint.y, world.spawnPoint.z );
		return true;
	} else if ( msg.substr( 0, 3 ) == "/tp" ) {
		var target = msg.substr( 4 );
		target = server.findPlayerByName( target );
		
		if ( target != null ) {
				server.setPos( client, target.x, target.y, target.z );
				server.sendMessage( nickname + " was teleported to " + target.nick + "." );
				return true;
		} else {
			server.sendMessage( "Couldn't find that player!", client );
			return false;
		}
	} else if ( msg.substr( 0, 5 ) == "/kick" && client.handshake.address.address == ADMIN_IP ) {
		var target = msg.substr( 6 );
		target = server.findPlayerByName( target );
		
		if ( target != null ) {
				server.kick( target.socket, "Kicked by Overv" );
				return true;
		} else {
			server.sendMessage( "Couldn't find that player!", client );
			return false;
		}
	} else if ( msg == "/list" ) {
		var playerlist = "";
		for ( var p in world.players )
			playerlist += p + ", ";
		playerlist = playerlist.substring( 0, playerlist.length - 2 );
		server.sendMessage( "Players: " + playerlist, client );
		return true;
	} else if ( msg.substr( 0, 1 ) == "/" ) {
		server.sendMessage( "Unknown command!", client );
		return false;
	}
} );

// Send a welcome message to new clients
server.on( "join", function( client, nickname )
{
	server.sendMessage( "Welcome! Enjoy your stay, " + nickname + "!", client );
	server.broadcastMessage( nickname + " joined the game.", client );
} );

// And let players know of a disconnecting user
server.on( "leave", function( nickname )
{
	server.sendMessage( nickname + " left the game." );
} );

// Periodical saves
setInterval( function()
{
	world.saveToFile( "world" );
	log( "Saved world to file." );
}, SECONDS_BETWEEN_SAVES * 1000 );