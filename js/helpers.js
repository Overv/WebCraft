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

Vector.prototype.toString = function()
{
	return "( " + this.x + ", " + this.y + ", " + this.z + " )";
}