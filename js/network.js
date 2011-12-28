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
	
	// Hook events
	var s = this;
	socket.on( "connect", function() { s.onConnection(); } );
	socket.on( "world", function( data ) { s.onWorld( data ); } );
	socket.on( "spawn", function( data ) { s.onSpawn( data ); } );
	socket.on( "setblock", function( data ) { s.onBlockUpdate( data ); } );
}

// setBlock( x, y, z, mat )
//
// Called to do a networked block update.

Client.prototype.setBlock = function( x, y, z, mat )
{
	this.socket.emit( "setblock", {
		x: x,
		y: y,
		z: z,
		mat: mat.id
	} );
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

// onBlockUpdate( data )
//
// Called when a block update is received from the server.

Client.prototype.onBlockUpdate = function( data )
{
	var material = BLOCK.fromId( data.mat );
	
	if ( this.eventHandlers["block"] ) this.eventHandlers.block( data.x, data.y, data.z, this.world.blocks[data.x][data.y][data.z], material );
	
	this.world.setBlock( data.x, data.y, data.z, material );
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
	io.set( "reconnect", false );
	io.sockets.on( "connection", function( socket ) { s.onConnection( socket ); } );
}

// setWorld( world )
//
// Assign a world to be networked.

Server.prototype.setWorld = function( world )
{
	this.world = world;
}

// setLogger( fn )
//
// Assign a log function to output activity to.

Server.prototype.setLogger = function( fn )
{
	this.log = fn;
}

// onConnection( socket )
//
// Called when a new client has connected.

Server.prototype.onConnection = function( socket )
{
	if ( this.log ) this.log( "Client " + socket.handshake.address.address + " connected to the server." );
	
	// Hook events
	var s = this;
	socket.on( "nickname", function( data ) { s.onNickname( socket, data ); } );
	socket.on( "setblock", function( data ) { s.onBlockUpdate( socket, data ); } );
	socket.on( "disconnect", function() { s.onDisconnect( socket ); } );
}

// onNickname( socket, nickname )
//
// Called when a client has sent their nickname.

Server.prototype.onNickname = function( socket, data )
{
	if ( data.nickname.length == 0 || data.nickname.length > 15 ) return false;
	
	if ( this.log ) this.log( "Client " + socket.handshake.address.address + " is now known as " + data.nickname + "." );
	
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

// onBlockUpdate( socket, data )
//
// Called when a client wants to change a block.

Server.prototype.onBlockUpdate = function( socket, data )
{
	var world = this.world;
	
	if ( typeof( data.x ) != "number" || typeof( data.y ) != "number" || typeof( data.z ) != "number" || typeof( data.mat ) != "number" ) return false;
	if ( data.x < 0 || data.y < 0 || data.z < 0 || data.x >= world.sx || data.y >= world.sy || data.z >= world.sz ) return false;
	
	var material = BLOCK.fromId( data.mat );
	if ( material == null || ( !material.spawnable && data.mat != 0 ) ) return false;
	
	// Check if the user has authenticated themselves before allowing them to set blocks
	var s = this;
	socket.get( "nickname", function( err, name )
	{
		if ( name != null  )
		{
			world.setBlock( data.x, data.y, data.z, material );
			
			s.io.sockets.emit( "setblock", {
				x: data.x,
				y: data.y,
				z: data.z,
				mat: data.mat
			} );
		}
	} );
}

// onDisconnect( socket, data )
//
// Called when a client has disconnected.

Server.prototype.onDisconnect = function( socket )
{
	if ( this.log ) this.log( "Client " + socket.handshake.address.address + " has disconnected." );
}

// Export to node.js
if ( typeof( exports ) != "undefined" )
{
	exports.Server = Server;
}