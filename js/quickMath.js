
// Mathy math math stuff
var Vec2 = function(x=0, y=0) {
  this.set(x,y)
};

Vec2.prototype.set = function(x, y) {
  this.x = x;
  this.y = y;
}

Vec2.prototype.clone = function() {
  return new Vec2(this.x, this.y);
}

Vec2.prototype.scale = function(scalar) {
  return new Vec2( this.x * scalar, this.y * scalar );
};

Vec2.prototype.mul = function(x, y) {
  return new Vec2(this.x * x, this.y * y);
};

Vec2.prototype.mag = function() {
  return this.x*this.x + this.y*this.y;
}

Vec2.prototype.normalize = function () {
  return this.scale(1/Math.sqrt(this.mag()));
}

Vec2.prototype.add = function(vec2) {
  this.x += vec2.x;
  this.y += vec2.y;
  return this;
};

Vec2.prototype.sub = function(vec2) {
  this.x -= vec2.x;
  this.y -= vec2.y;
  return this;
};

Vec2.left   = new Vec2(-1,0);
Vec2.right  = new Vec2(1,0);
Vec2.up     = new Vec2(0,-1);
Vec2.down   = new Vec2(0,1);

var quickMath = function() {
  this.foo = 'bar';
}

quickMath.prototype.getRandomInt = function(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

/*
  r =     a*b
       √‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
         a^2*sin^2(θ) + b^2*cos^2(θ)
*/
quickMath.prototype.getRadius = function(direction, collisionRadius) {
  var a = collisionRadius.x;
  var b = collisionRadius.y;
  var aa = a*a;
  var bb = b*b;

  var angleScale = direction.y/direction.x;
  var angle = Math.atan(angleScale);
  // console.log("angle", angle * (180/Math.PI))
  var s = Math.sin(angle);
  var c = Math.cos(angle);
  var ss = s*s;
  var cc = c*c;

  var y = b*s;
  var x = a*c;
  /*
    x^2/a^2 + y^2/b^2 = 1
  */
  //console.log('proof', (x*x)/aa+(y*y)/bb);

  return a*b/( Math.sqrt( aa*ss+ bb*cc ) );
}

quickMath = new quickMath();
