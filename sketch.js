/*The Project: The goal for this project was to combine a game with generative art. To do this, I made a simple snake game that influences the direction of the artwork as the player progresses. I wanted to showcase a 'slow descent into madness' by taking away colour colour over time, that way it makes the game more difficult (and therefore more engaging to the player) while bringing more meaning to the art they generate. I layered many generative art algorithms taught in class to make the game as dynamic as possible. The main challenge was implementing some form of motion in everything I added, since it's a game and that would be more interesting to see rather than still images. Hope you enjoy!*/

/*References:
Snake game: https://p5js.org/examples/interaction-snake-game.html
Truchet tiles: https://openprocessing.org/sketch/505865/
Pixelating tiles: https://openprocessing.org/sketch/1834677
Sparkles: https://p5js.org/examples/simulate-particles.html
Random walk:https: //p5js.org/examples/simulate-brownian-motion.html

I combined bits and pices of these examples along with making minor changes to create this game. Some of the changes made are (but not limited to) size, colour, opacity, frequency, layering via arrays, saving image, etc.
*/

//Snake information: pieces to start, starting direction to move in, coordinates of snake and food
let numSegments = 10;
let direction = 'right';
const xStart = 0; 
const yStart = 250; 
const diff = 5;
let xCor = [];
let yCor = [];
let xFruit = 0;
let yFruit = 0;

//Background design: truchet tiles 
var numTiles = 20;
var sizeTile;
var tiles = [];

//Motion of truchet tiles
let num = 100;
let range = 10;

//Random walk information
let paths = [];
let currentPath = [];

//Background design: sparkles
let sparkles = [];

//Background design: growing lines
let lines = [];

//Background design: pixelating tiles
let forms = [];
let colors = ['#E7E7E73D', 'rgba(185,185,185,0.24)', 'rgba(31,31,31,0.24)', 'rgba(155,155,155,0.23)', 'rgba(123,123,123,0.24)', '#5E5E5E3D', '#62626238', '#2828283A', '#0000003A', '#7878783D'];
let c = 5;

//Game state
let gameOver = false;

function setup() {  
  
  //Canvas setup
  createCanvas(750, 750);
  frameRate(15);
  
  //Setup pixelating tiles
  makeTiles();
  
  //Setup sparkles
  for (let i = 0; i < 100; i++) {
    sparkles.push(new Sparkle(random(width), random(height)));
  }
  
  //Setup truchet tiles
  sizeTile = width / numTiles;
	colorMode(HSB, 255)
	noFill();
	strokeWeight(3);
	for (var i = 0; i < numTiles; i++) {
		for (var j = 0; j < numTiles; j++) {
			tiles.push(new Tile);
			tiles[j + i * numTiles].x = j * sizeTile + sizeTile / 2;
			tiles[j + i * numTiles].y = i * sizeTile + sizeTile / 2;
			tiles[j + i * numTiles].col = [2 * j, 0.8 * i];
		}
	}

  //Setup snake game
  stroke(255);
  strokeWeight(10);
  updateFruitCoordinates();
  for (let i = 0; i < numSegments; i++) {
    xCor.push(xStart + i * diff);
    yCor.push(yStart);
  }
  
}

function draw() {
  background(0, 150);
  
  //Draw pixelating tiles
  for (let i of forms) {
		i.show();
	}
  
  //Draw sparkles
  for (let sparkle of sparkles) {
    sparkle.update();
    sparkle.display();
  }
  
  //Draw growing lines
  for (let line of lines) {
    line.grow();
    line.display();
  }
  
  noFill();
  
  //Draw truchet tiles
  for (var i = 0; i < numTiles * numTiles; i++) {
		tiles[i].display();
		if (random() < 0.002) {
			tiles[i].rotating = true;
		}
	}
  
  //Draw snake
  for (let i = 0; i < numSegments - 1; i++) {
    stroke(255);
    line(xCor[i], yCor[i], xCor[i + 1], yCor[i + 1]);
  }
  
  //Game updates
  drawLine();
  updateSnakeCoordinates();
  checkForFruit();
  checkGameStatus();
}

//Controls for the game (lines on edges will grow with each move made by the player)
function keyPressed() {
    lines.push(new GrowingLine(random(width), 0));
    lines.push(new GrowingLine(random(width), height));
    lines.push(new GrowingLine(0, random(height)));
    lines.push(new GrowingLine(width, random(height)));
  switch (keyCode) {
    case LEFT_ARROW:
      if (direction !== 'right') {
        direction = 'left';
      }
      break;
    case RIGHT_ARROW:
      if (direction !== 'left') {
        direction = 'right';
      }
      break;
    case UP_ARROW:
      if (direction !== 'down') {
        direction = 'up';
      }
      break;
    case DOWN_ARROW:
      if (direction !== 'up') {
        direction = 'down';
      }
      break;
  }
}

//For the sparkles
class Sparkle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = random(2, 7);
    this.color = color(random(255), random(255), 255, 200);
    this.angle = random(TWO_PI);
    this.speed = random(1, 4);
  }

  update() {
    this.x += cos(this.angle) * this.speed;
    this.y += sin(this.angle) * this.speed;

    // Bounce off the walls
    if (this.x < 0 || this.x > width) {
      this.angle = PI - this.angle;
    }
    if (this.y < 0 || this.y > height) {
      this.angle = -this.angle;
    }
  }

  display() {
    noStroke();
    fill(this.color);
    ellipse(this.x, this.y, this.size, this.size);
  }
}

//For the pixelating tiles
class Form {
	constructor(x, y, w) {
		this.x = x;
		this.y = y;
		this.w = w;
		let dst = dist(x, y, width / 2, height / 2);
		this.p = (norm(dst, sqrt(sq(width / 2) + sq(height / 2)), 0) ** 3);
		this.col = random(colors); //chooses random colour from array defined in global
	}
	show() {
		if (random() < this.p) {
			fill(this.col);
			noStroke();
			rect(this.x, this.y, this.w, this.w);
		}
	}
}

//For the truchet tiles
function Tile() {
	this.x;
	this.y;
	this.r = sizeTile;
	this.orientation = random();
	this.rotation = 0;
	this.rotating = false;
	this.col;
	
    //Allows the truchet tiles to move
	this.display = function() {
		push();
		translate(this.x, this.y);
		rotate(radians(this.rotation));
        if(gameOver == true)
          {
            
          }
        else
         {
            stroke(300 * noise(this.col[0], this.col[1]), 300 * noise(this.col[0], this.col[1]), 255, 30);
         }
		if (this.orientation > 0.5) {
			arc(-this.r / 2, -this.r / 2, this.r, this.r, 0, PI / 2);
			arc(this.r / 2, this.r / 2, this.r, this.r, -PI, -PI / 2);
		} else {
			arc(-this.r / 2, this.r / 2, this.r, this.r, -PI / 2, 0);
			arc(this.r / 2, -this.r / 2, this.r, this.r, PI / 2, PI);
		}
		pop();

		this.col[0] += 0.01;
		this.col[1] += 0.01;
		if (this.rotating) {
			this.rotation += 1;
			if (this.rotation % 90==0) {
				this.rotating = false;
			}
		}

	}
}

//Segments of the snake are updated based on its direction
function updateSnakeCoordinates() {
  for (let i = 0; i < numSegments - 1; i++) {
    xCor[i] = xCor[i + 1];
    yCor[i] = yCor[i + 1];
  }
  switch (direction) {
    case 'right':
      xCor[numSegments - 1] = xCor[numSegments - 2] + diff;
      yCor[numSegments - 1] = yCor[numSegments - 2];
      break;
    case 'up':
      xCor[numSegments - 1] = xCor[numSegments - 2];
      yCor[numSegments - 1] = yCor[numSegments - 2] - diff;
      break;
    case 'left':
      xCor[numSegments - 1] = xCor[numSegments - 2] - diff;
      yCor[numSegments - 1] = yCor[numSegments - 2];
      break;
    case 'down':
      xCor[numSegments - 1] = xCor[numSegments - 2];
      yCor[numSegments - 1] = yCor[numSegments - 2] + diff;
      break;
  }
}

//Check if the snake hits the edges of the canvas (option 1 of losing)
function checkGameStatus() {
  if (
    xCor[xCor.length - 1] > width ||
    xCor[xCor.length - 1] < 0 ||
    yCor[yCor.length - 1] > height ||
    yCor[yCor.length - 1] < 0 ||
    checkSnakeCollision()
  ) {
    noLoop();
    saveCanvas('myCanvas.jpg');
    gameOver = true;
  }
}

//Check is snake hits itself (option 2 of losing)
function checkSnakeCollision() {
  const snakeHeadX = xCor[xCor.length - 1];
  const snakeHeadY = yCor[yCor.length - 1];
  for (let i = 0; i < xCor.length - 1; i++) {
    if (xCor[i] === snakeHeadX && yCor[i] === snakeHeadY) {
      return true;
    }
  }
}

//Game always check whether fruit has been eaten
function checkForFruit() {
  //Draw fruit point
  stroke(255);
  point(xFruit, yFruit);
  //If snake eats fruit, draw new random walk path, increase pixelating tiles, draw new fruit, and grow the snake
  if (xCor[xCor.length - 1] === xFruit && yCor[yCor.length - 1] === yFruit) {
    paths.push(currentPath);
    currentPath = [];
    c += 3;
    makeTiles();
    xCor.unshift(xCor[0]);
    yCor.unshift(yCor[0]);
    numSegments++;
    updateFruitCoordinates();
  }
}

//Snake moves in multiples of 10, so the position of the fruit needs to lie somewhere where the snake can get it
function updateFruitCoordinates() {
  xFruit = floor(random(10, (width - 100) / 10)) * 10;
  yFruit = floor(random(10, (height - 100) / 10)) * 10;
  //Setup random walk on the new position of the fruit
  initializeParticles();
}

//Keeping track of the paths made by the random walk
function initializeParticles() {
  currentPath = [];
  for (let i = 0; i < num; i++) {
    currentPath.push(createVector(xFruit, yFruit));
  }
}

function makeTiles()
{
  	let w = width / c;
	for (let i = 0; i < c; i++) {
		for (let j = 0; j < c; j++) {
			let x = i * w;
			let y = j * w;
			forms.push(new Form(x, y, w));
		}
	}
}


//For the random walk: chooses a random direction to move and tracks the line
function drawLine()
{

  // Shift all elements 1 place to the left
  for (let i = 1; i < num; i++) {
    currentPath[i - 1].x = currentPath[i].x;
    currentPath[i - 1].y = currentPath[i].y;
  }

  // Put a new value at the end of the array
  currentPath[num - 1].x += random(-range, range);
  currentPath[num - 1].y += random(-range, range);

  // Constrain all points to the screen
  currentPath[num - 1].x = constrain(currentPath[num - 1].x, 0, width);
  currentPath[num - 1].y = constrain(currentPath[num - 1].y, 0, height);

  // Draw lines for the current path
  for (let j = 1; j < num; j++) {
    let val = j / num * 204.0 + 51;
    stroke(val);
    line(currentPath[j - 1].x, currentPath[j - 1].y, currentPath[j].x, currentPath[j].y);
  }

  // Draw lines for previous paths
  for (let path of paths) {
    for (let j = 1; j < num; j++) {
      let val = j / num * 204.0 + 51;
      stroke(val); // Reduce opacity for previous paths
      line(path[j - 1].x, path[j - 1].y, path[j].x, path[j].y);
    }
  }
}

//For the growing lines on the edges
class GrowingLine {
  constructor(x, y) {
    this.startX = x;
    this.startY = y;
    this.endX = x;
    this.endY = y;
    this.growthSpeed = 2;
  }

  grow() {
    // Grow the line by increasing the end point's coordinates
    this.endX += random(-this.growthSpeed, this.growthSpeed);
    this.endY += random(-this.growthSpeed, this.growthSpeed);

    // Constrain the line to stay within the canvas
    this.endX = constrain(this.endX, 0, width);
    this.endY = constrain(this.endY, 0, height);
  }

  display() {
    stroke(100);
    line(this.startX, this.startY, this.endX, this.endY);
  }
}
