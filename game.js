/* Get the canvas and the 2d context */
var canvas = document.getElementById("gameArea");
var context = canvas.getContext("2d");

// Vars for game information
var score = 0, lives = 2;
var paddleHits = 10;
var gameOver = false;
var gameWon = false;
var capsule = {
    x : 0,
    width : 25,
    y : 0,
    height : 12,
    deployed : false,
    type : "null"
};

// Variables for ball information
var balls = [];
for(var index = 0; index < 1; index++){
    balls[index] = {
        x : canvas.width/2,
        y : canvas.height-30,
        dx : (Math.random() * 100 - 50) / 100,
        dy : -3,
        radius : 5
    }
}

// Variables for our paddle
var paddleWidth = 75;
var paddleHight = 7;
var paddleX = (canvas.width - paddleWidth) / 2;
var paddleSpeed = 5;

// Variables for our brick information
var brickRowCount = 6; //3
var brickColumnCount = 13;
var brickWidth = 30; // 75
var brickHeight = 15;
var brickPadding = 3;
var brickOffsetTop = 20;
var brickOffsetLeft = 26;

// Create our array of bricks
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
                // Check every ball, and see if it's hitting a brick
                balls.forEach(ball => {
                    if(ball.x > b.x && ball.x < b.x+brickWidth && ball.y + ball.radius > b.y && ball.y - ball.radius < b.y+brickHeight) {
                        ball.dy = -ball.dy;
                        b.status = 0;
                        score += 10;
                    }
                });
                
            }
        }
    }
}

// DRAWING FUNCTIONS

function drawBricks() {
    for(var col=0; col<brickColumnCount; col++) {
        for(var row=0; row<brickRowCount; row++) {
            if(bricks[col][row].status == 1){
                var brickX = (col*(brickWidth+brickPadding))+brickOffsetLeft;
                var brickY = (row*(brickHeight+brickPadding))+brickOffsetTop;
                bricks[col][row].x = brickX;
                bricks[col][row].y = brickY;
                context.beginPath();
                context.rect(brickX, brickY, brickWidth, brickHeight);
                context.fillStyle = "red";
                context.fill();
                context.closePath();
            }
        }
    }
}

function drawCapsule(){
    context.beginPath();
    context.rect(capsule.x, capsule.y, capsule.width, capsule.height);
    context.fillStyle = "grey"//"#00a3cc";
    context.fill();
    context.font = "11px Arial";
    context.fillStyle = "white";
    context.fillText(capsule.type, capsule.x, capsule.y + 10);
    context.closePath();
}

function drawPaddle() {
    context.beginPath();
    context.rect(paddleX, canvas.height - paddleHight, paddleWidth, paddleHight);
    context.fillStyle = "blue";
    context.fill();
    context.closePath();
}

function drawBalls() {
    balls.forEach(ball => {
        context.beginPath();
        context.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
        context.fillStyle = "black";
        context.fill();
        context.closePath();
    });
    
}

function updateScore(){
    var scoreLabel = document.getElementById("score");
    scoreLabel.innerText = "Score: " + score;
}

function updateLives(){
    var livesLabel = document.getElementById("lives");
    livesLabel.innerText = "Lives: " + lives;
}

// Called when the paddle is hit by a ball
function collision(ball){
    ball.dy = -ball.dy;
    ball.dy -= Math.random() / 10;

    if(paddleHits > 30 && paddleHits < 40){
        brickOffsetTop += paddleHits-30;
    }
}

/* Removes all balls from our ball array,
   but leaves the one ball specified. */
function clearBall(ball){
    ballsNew = [];
    var ballIndex = balls.indexOf(ball);
    for(var index = 0; index < balls.length; index++){
        if(index != ballIndex)
            ballsNew[index] = balls[index];
    }
    balls = ballsNew;
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

function deployCapsule(typeName){
    capsule.deployed = true;
    capsule.x = Math.random() * canvas.width;
    capsule.y = 0;
    capsule.type = typeName;
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

    context.clearRect(0, 0, canvas.width, canvas.height);

    drawBricks();
    drawPaddle();
    drawBalls();
    brickHit();
    updateScore();
    updateLives();

    

    // Control Capsules
    if(capsule.deployed == true){
        drawCapsule();
        capsule.y += 1;

        // Destroy capsule if it hits the ground
        if(capsule.y >= canvas.height)
            capsule.deployed = false;
    }else{

        // Randomized deployment of capsules
        if(Math.random() <= .001){
            deployCapsule("Life");
        }else if(Math.random() <= .0004){
            deployCapsule("Flip");
        }
    }

    if(capsule.y + capsule.height >= canvas.height - paddleHight 
            && capsule.x >= paddleX 
            && capsule.x <= paddleX + paddleWidth
            && capsule.deployed == true){
        // User catches capsule
        capsule.deployed = false;

        // Apply an effect depending on the capsule type
        if(capsule.type == "Life"){
            lives++;
        }else if(capsule.type == "Flip"){
            paddleSpeed = -paddleSpeed;
        }
    }

    // Control paddle movement
    if(paddleSpeed > 0){
        // Paddle not flipped
        if(rightPressed && paddleX < canvas.width-paddleWidth) 
            paddleX += paddleSpeed;
        else if(leftPressed && paddleX > 0)
            paddleX -= paddleSpeed;
    }else{
        // Paddle is flipped
        if(rightPressed && paddleX > 0) 
            paddleX += paddleSpeed;
        else if(leftPressed && paddleX < canvas.width-paddleWidth)
            paddleX -= paddleSpeed;
    }
    

    /* For each ball, manage it's movement 
       A future 'multi' capsule would require support for multiple balls */
    balls.forEach(ball => {
        // Make sure the ball bounces off
        if(ball.x+ball.radius > canvas.width || ball.x - ball.radius < 0){
            ball.dx = -ball.dx; // bounce off left & right
        }else if(ball.y - ball.radius < 0){
            ball.dy = -ball.dy; // bounce off top
        }
    
        // Check if the ball hit the paddle
        if(ball.x + ball.radius > paddleX-2 
                && ball.x - ball.radius < paddleX + paddleWidth+2 
                && ball.y + ball.radius > canvas.height - paddleHight){
            collision(ball);
            paddleHits++;
        }else if(ball.y > canvas.height + ball.radius - 10){
            // User missed the ball
            lives--;

            if(lives <= 0){
                gameOver = true;
                alert("Game Over");
            }
        
            // Reset positions upon death
            ball.x = canvas.width/2;
            ball.y = canvas.height-30;
            ball.dx = Math.random() * 3;
            ball.dy = -3;
            paddleX = (canvas.width - paddleWidth) / 2;
        }
    
        // Move the ball
        ball.x += ball.dx;
        ball.y += ball.dy;
    });
    

    // Check if the player won
    if(checkVictory() == true){
        gameWon = true;
        alert("Congradulations, you won!");
    }
}

// ~~~~~~~~~~~~~~~~~~~~~ User input

// Variables for controlling the paddle
var rightPressed = false;
var leftPressed = false;

// Key handelers
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

// Event Listeners keep track of keymovements
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
update();

// Button press 'listeners'
function leftBtnPressed(){
    leftBtnPressed = false;
    leftBtnPressed = true;
}

function rightBtnPressed(){
    leftBtnPressed = false;
    rightBtnPressed = true;
}

document.getElementById("leftBtn").onkeypress(leftBtnPressed());
