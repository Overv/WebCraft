// ==========================================
// Helpers
//
// This file contains helper classes and functions.
// ==========================================

// ==========================================
// Vector class
// ==========================================

function Vector( x, y, z )
{
	this.x = x;
	this.y = y;
	this.z = z;
}

Vector.prototype.add = function( vec )
{
	return new Vector( this.x + vec.x, this.y + vec.y, this.z + vec.z );
}

Vector.prototype.mul = function( n )
{
	return new Vector( this.x*n, this.y*n, this.z*n );
}

Vector.prototype.length = function()
{
	return Math.sqrt( this.x*this.x + this.y*this.y + this.z*this.z );
}

Vector.prototype.normal = function()
{
	var l = this.length();
	return new Vector( this.x/l, this.y/l, this.z/l );
}

Vector.prototype.toArray = function()
{
	return [ this.x, this.y, this.z ];
}

Vector.prototype.toString = function()
{
	return "( " + this.x + ", " + this.y + ", " + this.z + " )";
}