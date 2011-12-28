// ==========================================
// Network
//
// This class manages the connection between the client and the
// server and everything involved.
// ==========================================

// ==========================================
// Client
// ==========================================

// Constructor( socketio )
//
// Creates a new client using the specified socket interface.

function Client( socketio )
{
	this.io = socketio;
	this.eventHandlers = {};
}

// connect( uri, nickname )
//
// Connect to a server with the specified nickname.

Client.prototype.connect = function( uri, nickname )
{
	var socket = this.socket = this.io.connect( uri );	
	this.nickname = nickname;
	
	var s = this;
	socket.on( "connect", function() { s.onConnection(); } );
	socket.on( "world", function( data ) { s.onWorld( data ); } );
	socket.on( "spawn", function( data ) { s.onSpawn( data ); } );
}

// on( event, callback )
//
// Hooks an event.

Client.prototype.on = function( event, callback )
{
	this.eventHandlers[event] = callback;
}

// onConnection()
//
// Called when the client has connected.

Client.prototype.onConnection = function()
{
	if ( this.eventHandlers["connect"] ) this.eventHandlers.connect();
	
	this.socket.emit( "nickname", { nickname: this.nickname } );
}

// onWorld( data )
//
// Called when the server has sent the world.

Client.prototype.onWorld = function( data )
{
	// Create world from string representation
	var world = this.world = new World( data.sx, data.sy, data.sz );
	world.createFromString( data.blocks );
	
	if ( this.eventHandlers["world"] ) this.eventHandlers.world( world );
}

// onSpawn( data )
//
// Called when the local player is spawned.

Client.prototype.onSpawn = function( data )
{
	// Set spawn point
	this.world.spawnPoint = new Vector( data.x, data.y, data.z );
	
	if ( this.eventHandlers["spawn"] ) this.eventHandlers.spawn();
}

// ==========================================
// Server
// ==========================================

// Constructor( socketio )
//
// Creates a new server listening for clients using the specified
// socket interface.

function Server( socketio )
{
	var io = this.io = socketio.listen( 3000 );
	var s = this;
	
	io.set( "log level", 1 );
	io.sockets.on( "connection", function( socket ) { s.onConnection( socket ); } );
}

// setWorld( world )
//
// Assign a world to be networked.

Server.prototype.setWorld = function( world )
{
	this.world = world;
}

// onConnection( socket )
//
// Called when a new client has connected.

Server.prototype.onConnection = function( socket )
{
	// Hook events
	var s = this;
	socket.on( "nickname", function( data ) { s.onNickname( socket, data ) } );
}

// onNickname( socket, nickname )
//
// Called when a client has sent their nickname.

Server.prototype.onNickname = function( socket, data )
{
	// Associate nickname with socket
	socket.set( "nickname", data.nickname );
	
	// Send world to client
	var world = this.world;
	
	socket.emit( "world", {
		sx: world.sx,
		sy: world.sy,
		sz: world.sz,
		blocks: world.toNetworkString()
	} );
	
	// Spawn client
	socket.emit( "spawn", {
		x: world.spawnPoint.x,
		y: world.spawnPoint.y,
		z: world.spawnPoint.z
	} );
}

// Export to node.js
if ( typeof( exports ) != "undefined" )
{
	exports.Server = Server;
}