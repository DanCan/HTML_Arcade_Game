
var Entity = function(position, velocity, centerOffset,collisionRadius) {
  this.position = position;
  this.velocity = velocity;
  // Center of image
  this.collisionCenter = new Vec2(this.position.x + Block.width/2 + centerOffset.x, this.position.y + Block.height/2 + centerOffset.y);
  this.collisionRadius = collisionRadius;
}

// Enemies our player must avoid
var Enemy = function(randomXStart) {
    var xOffset = 0;
    if(randomXStart) {
      xOffset = Screen.renderWidth * Math.random();
    }
    var startLane = quickMath.getRandomInt(0, 3);
    this.sprite = 'images/enemy-bug.png';
    this.difficulty = cDifficulty;
    Entity.call(
      this,
      // Position w/randomg startLane
      new Vec2(-Block.width + xOffset, startLane * Block.partialHeight + Block.edgeHeight ),
      // Variable speed based on Difficulty
      new Vec2(),
      // Collision offset from center
      new Vec2(0,24),
      // Collision Radius
      new Vec2(50, 34)
    );

    this.recalculateSpeed();

    // Debug starting position
    // this.position = new Vec2(Block.width, startLane * Block.partialHeight + Block.edgeHeight );

};

// Go, Go!
Enemy.prototype.recalculateSpeed = function() {
  this.velocity = Vec2.right.scale(quickMath.getRandomInt(70, (cDifficulty+1)*90));
}

Enemy.prototype.checkRecycle = function(){
  // Lower or Raise the amount of enemies
  if (allEnemies.length > difficultyConfig[cDifficulty].amount){
    var self = this;
    allEnemies.forEach(function(elm, index) {
      if(elm === self){
        // Delete?
        allEnemies.splice(index, 1);
      }
    });
  // Did we change difficulty
  } else if (this.difficulty !== cDifficulty){
    this.recalculateSpeed();
  }
}

Enemy.prototype.checkCollisions = function() {

  var enemydir = new Vec2(
    this.collisionCenter.x - player.collisionCenter.x,
    this.collisionCenter.y - player.collisionCenter.y);
  enemydir = enemydir.scale(-1);

  var enemyRadius = quickMath.getRadius(
    enemydir,
    this.collisionRadius
  );

  var playerdir = new Vec2(
    player.collisionCenter.x - this.collisionCenter.x,
    player.collisionCenter.y - this.collisionCenter.y);
  playerdir = playerdir.scale(-1);

  var playerRadius = quickMath.getRadius(
    playerdir,
    player.collisionRadius
  );

  var dx = this.collisionCenter.x - player.collisionCenter.x;
  var dy = this.collisionCenter.y - player.collisionCenter.y;

  var distance = Math.sqrt(dx * dx + dy * dy);

  if (debug_drawDir) {
    var normEnemy = enemydir.normalize();
    normEnemy = normEnemy.scale(enemyRadius);
    normEnemy = normEnemy.add(this.collisionCenter);

    normPlayer = playerdir.normalize();
    normPlayer = normPlayer.scale(playerRadius);
    normPlayer = normPlayer.add(player.collisionCenter);

    // dir
    //  ctx.moveTo(elm.collisionCenter.x, elm.collisionCenter.y);
    //  ctx.lineTo(player.collisionCenter.x, player.collisionCenter.y);
    // ctx.stroke();
    // Radius enemy
    debugPushLine(this.collisionCenter, normEnemy);

    // Player Radius
    debugPushLine(player.collisionCenter, normPlayer);
  }

  // The player is hitting an enemy
  if (enemyRadius + playerRadius > distance){
    player.velocity.x = 0;
    player.velocity.y = 0;

    // Player is ded
    playerDead = true;
  }

  // You WON!
  if (player.gridLocation.y <= 0){
    playerWin = true;
  }

  // Recycle Enemy
  if( this.position.x > Screen.width){
    this.position.x = -Block.width;

    this.checkRecycle();
  }

}

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.

    // Move
    this.position.add(this.velocity.scale(dt));

    // Update center
    this.collisionCenter.x = this.position.x + Block.width/2;
    this.collisionCenter.y = this.position.y + Block.height/2 + 24;
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {

  // Draw image
  ctx.drawImage(Resources.get(this.sprite), this.position.x, this.position.y);

  // Bounding box
  if(debug_drawBounds) {
    ctx.beginPath();
    ctx.ellipse(this.collisionCenter.x,this.collisionCenter.y,
      this.collisionRadius.x, this.collisionRadius.y, 0, 0, 2*Math.PI);
    ctx.stroke();
  }
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function() {
    this.sprite = 'images/char-boy.png';
    this.velocity = new Vec2();
    this.position = new Vec2(Screen.width/2 - Block.width/2,
                              Screen.height - Block.edgeHeight );

    this.gridLocation = new Vec2();
    this.calculateGridLocation();

    this.preDir = new Vec2(-99,-99);

    this.collisionCenter = new Vec2();
    this.updateCenter();
    this.collisionRadius = new Vec2(16, 12);
};

Player.edgeHeight = 32;
Player.edgeWidth = 10;
Player.extraFriction = false;


Player.prototype.update = function(dt) {
  // Move
  this.position.add(this.velocity);

  // Slow down
  friction = 0.83 * dt;
  friction = this.extraFriction ? friction * 5 : friction;
  this.velocity.x -= this.velocity.x * friction
  this.velocity.y -= this.velocity.y * friction

  // Update center
  this.updateCenter();
};

Player.prototype.updateCenter = function() {
  this.collisionCenter.x = this.position.x + Block.width/2;
  this.collisionCenter.y = this.position.y + Block.height/2 + 40;
}


Player.prototype.handleInput = function(v2Dir) {

  switch(cMode){
    case 2:
      // Got to be moving somewhat
      if(this.velocity.mag() > 0.3 &&
        // Opposite horizontal pressed?
        (this.preDir.x * -1 === v2Dir.x && this.preDir.y - v2Dir.y === 0 && v2Dir.x !== 0) ||
        // Opposite verticle pressed?
        (this.preDir.x - v2Dir.x === 0 && this.preDir.y *-1 === v2Dir.y && v2Dir.y !== 0))
          this.extraFriction = true;

      this.velocity.add(v2Dir);

      this.preDir = v2Dir;

    break;
    default:
      this.position.add( v2Dir.mul(Block.width, Block.partialHeight) );
  }

  this.calculateGridLocation();

};

Player.prototype.snap = function() {
  this.velocity = new Vec2();
  console.log(this.gridLocation.y*Block.partialHeight + Block.edgeHeight);
  this.position = new Vec2(this.gridLocation.x*Block.width, (this.gridLocation.y-1)*Block.partialHeight + Block.edgeHeight);

}

Player.prototype.calculateGridLocation = function() {
  this.gridLocation.x = Math.floor(this.position.x / Block.width);
  this.gridLocation.y = Math.floor(this.position.y / Block.partialHeight+1);
}

Player.prototype.render = function() {

    // Draw image
    ctx.drawImage(Resources.get(this.sprite), this.position.x, this.position.y);

    // Bounding box
    if(debug_drawBounds) {
      ctx.beginPath();
      ctx.ellipse(this.collisionCenter.x,this.collisionCenter.y,
        this.collisionRadius.x, this.collisionRadius.y, 0, 0, 2*Math.PI);
      ctx.stroke();

      //ctx.fillStyle = 'rgb(0,0,0)';
      //ctx.strokeRect(this.position.x,this.position.y,Block.width, Block.height);
    }

};


Player.prototype.checkCollisions = function() {
  this.calculateGridLocation();

  if (this.velocity.mag() !== 0){
    //out of bound left right and bottom
    if(this.position.x + Player.edgeWidth < 0){
      this.position.x = -Player.edgeWidth;
      this.velocity.x *= -1;

    }else if(this.position.x > Screen.width - Block.width + Player.edgeWidth){
      this.position.x = Screen.width - Block.width + Player.edgeWidth;
      this.velocity.x *= -1;

    }else if (this.position.y > Screen.renderHeight - Block.height - Block.edgeHeight + 8 ){
      this.position.y = Screen.renderHeight - Block.height - Block.edgeHeight + 8;
      this.velocity.y *= -1;
    }
  } else {
    // Based off this position what tile am i on, can i go there?
    if (this.gridLocation.x >= Grid.cols ) {
      this.position.x = (Grid.cols-1) * Block.width;
    }
    if (this.gridLocation.x < 1) {
      this.position.x = 0;
    }
    if( this.gridLocation.y >= Grid.rows) {
      this.position.y = Screen.height + -Block.edgeHeight;
    }

  }

}

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var player = new Player();;
var allEnemies = [];
var cDifficulty = 0;
var cMode = 1;
var allowedKeys = {
    37: Vec2.left,
    38: Vec2.up,
    39: Vec2.right,
    40: Vec2.down
};
var difficultyConfig = [
  { amount: 6, freq: 2 }, { amount: 10, freq: 1.5 },
  { amount: 15, freq: 1 }, { amount: 99, freq: .66 }
]
// Timer for Player Controls.
var intervalID = {};
// Timer for Spawning Enemies.
var spawnTimer;

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    if(inputOff) return;
    if(!allowedKeys[e.keyCode]) return;
    // Not pressing key anymore
    clearInterval(intervalID[e.keyCode]);
    intervalID[e.keyCode] = false;
    // Don't hanle extra input if the mode isn't Sppaaaaaaaaacccee
    if(cMode===2)return;

    player.handleInput(allowedKeys[e.keyCode]);
});

document.addEventListener('keydown', function(e) {
  if(inputOff) return;

  // Space... Space, spaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaacccee
  if(cMode === 2) {
    // Prevent bug: Locking friction while pressing
    if(player.extraFriction){
      player.extraFriction = false;
      player.preDir.x = -99;
    }

  // Only allow Directionals or if you are still pressing a key.
  if(!allowedKeys[e.keyCode] || intervalID[e.keyCode]) return;
    var kode = e.keyCode;
    intervalID[kode] = setInterval(function () {
      player.handleInput(allowedKeys[kode].scale(1/100));
    }, .33);
  }
});

// Detect Changes for:
var diffficultyHTML = document.getElementById('difficulty');
var modeHTML = document.getElementById('mode');

Resources.onReady(function(e) {

  // You can always change the difficulty and settings while playing, just for fun
  diffficultyHTML.addEventListener('change', function(e){
    cDifficulty = parseInt(e.target.value);
    appReset();
    appRestart();
    e.target.blur();
  });
  modeHTML.addEventListener('change', function(e){
    cMode = parseInt(e.target.value) + 1;
    if (cMode === 1) {
      player.snap();
    }
    e.target.blur();
  });

  // Start simulating
  disableRender = true;
  inputOff = false;
});

// Show end screen
function appEnd(){
  inputOff = true;
  endScreenHTML.style = "";
  var h2 = endScreenHTML.querySelector('h2');
  h2.innerText = h2.innerText.replace(
    "%data%",playerWin?"Won!":"Lost");
  endScreenHTML.children[0].className = endScreenHTML.children[0].className.replace('off','on');
}

// Remove spawner
function appReset(){
  clearInterval(spawnTimer);
}

// Start up the spawner
function appRestart(){
  spawnTimer = setInterval(function() {
    if(allEnemies.length < difficultyConfig[cDifficulty].amount){
      allEnemies.push(new Enemy());
    }
  },difficultyConfig[cDifficulty].freq*1000);
}

///
///
///
///
///

var startScreenHTML = document.getElementById('startscreen');
var endScreenHTML = document.getElementById('endscreen');

// Starting values
var inputOff = true;
var playerDead = false;
var playerWin = false;

// Reset variable :: init from Engine
function restart() {
    playerWin = false;
    playerDead = false;
    inputOff = false;
    disableRender = false;

    // clear any pressed keys
    Object.keys(intervalID).forEach(function(kode) {
        clearInterval(intervalID[kode]);
    });
}

// Init
function appStart() {
  // Turn off screens
  if(endScreenHTML.children[0].className.indexOf('on') !== -1) {
     endScreenHTML.children[0].className = endScreenHTML.children[0].className.replace('on','off');
  }
  startScreenHTML.children[0].className = 'screenbody off';

  restart();

  // Remove screen from stack
  setTimeout(function(){
    startScreenHTML.style = "display:none";
    endScreenHTML.style = "display:none";
    var h2 = endScreenHTML.querySelector('h2');
    h2.innerText = "You %data%";
  }, 3000);

  // New up
  player = new Player();
  allEnemies = [];

  // Push min amoutn of Enemies based on 0 index
  for(var i=0; i < difficultyConfig[0].amount; i++) {
    allEnemies.push(new Enemy(true));
  }
  // Start timer to spawn more enemies
  appRestart();
}
