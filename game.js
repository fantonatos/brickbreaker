// Load our canvas and the 2d context
var canvas = document.getElementById("gameArea");
var ctx = canvas.getContext("2d");

// Vars for game information
var score = 0;
var paddleHits = 10;
var gameOver = false;
var gameWon = false;

// Variables for ball information
var x = canvas.width/2;
var y = canvas.height-30;
var dx = Math.random() * 3;
var dy = -3;
var ballradius = 5;

// Variables for our paddle
var paddleWidth = 75;
var paddleHight = 7;
var paddleX = (canvas.width - paddleWidth) / 2;
var paddleSpeed = 5;

// Variables for our brick information
var brickRowCount = 3;
var brickColumnCount = 13;
var brickWidth = 30; // 75
var brickHeight = 15;
var brickPadding = 3;
var brickOffsetTop = 20;
var brickOffsetLeft = 26;

var bricks = [];
for(var col = 0; col < brickColumnCount; col++) {
    bricks[col] = [];
    for(var row = 0; row < brickRowCount; row++) {
        bricks[col][row] = { x: 0, y: 0, status: 1 };
    }
}

function brickHit() {
    for(var c=0; c<brickColumnCount; c++) {
        for(var r=0; r<brickRowCount; r++) {
            var b = bricks[c][r];
            if(b.status == 1){
                if(x > b.x && x < b.x+brickWidth && y + ballradius > b.y && y - ballradius < b.y+brickHeight) {
                    dy = -dy;
                    b.status = 0;
                    score += 10;
                }
            }
        }
    }
}

// DRAWING FUNCTIONS

function drawBricks() {
    for(var c=0; c<brickColumnCount; c++) {
        for(var r=0; r<brickRowCount; r++) {
            if(bricks[c][r].status == 1){
                var brickX = (c*(brickWidth+brickPadding))+brickOffsetLeft;
                var brickY = (r*(brickHeight+brickPadding))+brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = "red";
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function updateScore(){
    var scoreLabel = document.getElementById("score");
    scoreLabel.innerText = "Score: " + score;
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHight - 1, paddleWidth, paddleHight);
    ctx.fillStyle = "blue";
    ctx.fill();
    ctx.closePath();
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballradius, 0, Math.PI*2);
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.closePath();
}

// Called when the paddle is hit by a ball
function collision(){
    if(Math.random() < .5)
        dx = Math.random() * 3;
    else
        var dx = -Math.random() * 3;
    dy = -3 - Math.random();

    if(paddleHits > 30 && paddleHits < 40){
        brickOffsetTop += paddleHits-30;
    }
}

function checkVictory(){
    
    for(var col = 0; col < brickColumnCount; col++){
        for(var row = 0; row < brickRowCount; row++){
            if(bricks[col][row].status == 1)
                return false;
        }
    }

    return true;
}

// main game loop
function update() {
    requestAnimationFrame(update);

    if(gameOver == true){
        document.location.reload();
        return;
    }
    if(gameWon == true){
        document.location.reload();
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    
    drawBricks();
    drawPaddle();
    drawBall();
    brickHit();
    updateScore();


    // Control paddle movement
    if(rightPressed && paddleX < canvas.width-paddleWidth) 
        paddleX += paddleSpeed;
    else if(leftPressed && paddleX > 0)
        paddleX -= paddleSpeed;

    // Control ball movement
    if(x+ballradius > canvas.width || x - ballradius < 0){
        dx = 0 - dx;
    }
    if(y - ballradius < 0){
        dy = 0 - dy;
    }
    // Ball hit Paddle
    if(x + ballradius > paddleX && x - ballradius < paddleX + paddleWidth && y + ballradius > canvas.height - paddleHight - 1){
        dy = 0 - dy;
        collision();
        paddleHits++;
    }else if(y > canvas.height + ballradius + 10){
        // Check if ball hit the paddle
        gameOver = true;
        alert("Game Over");
    }

    // Check if the player won
    if(checkVictory() == true){
        gameWon = true;
        alert("Congradulations, you won!");
    }

    x += dx;
    y += dy;
}

// Variables for controlling the paddle
var rightPressed = false;
var leftPressed = false;

function keyDownHandler(e) {
    if(e.keyCode == 39) {
        rightPressed = true;
    }
    else if(e.keyCode == 37) {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if(e.keyCode == 39) {
        rightPressed = false;
    }
    else if(e.keyCode == 37) {
        leftPressed = false;
    }
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
update();