// Load our canvas and the 2d context
var canvas = document.getElementById("gameArea");
var ctx = canvas.getContext("2d");

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

function drawCapsule(){
    ctx.beginPath();
    ctx.rect(capsule.x, capsule.y, capsule.width, capsule.height);
    ctx.fillStyle = "grey"//"#00a3cc";
    ctx.fill();
    ctx.font = "11px Arial";
    ctx.fillStyle = "white";
    ctx.fillText(capsule.type, capsule.x, capsule.y + 10);
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHight, paddleWidth, paddleHight);
    ctx.fillStyle = "blue";
    ctx.fill();
    ctx.closePath();
}

function drawBalls() {
    balls.forEach(ball => {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
        ctx.fillStyle = "black";
        ctx.fill();
        ctx.closePath();
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

// Called when the paddle is hit by a balls[0]
function collision(ball){
    ball.dy = -ball.dy;
    ball.dy -= Math.random() / 10;

    if(paddleHits > 30 && paddleHits < 40){
        brickOffsetTop += paddleHits-30;
    }
}

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

    ctx.clearRect(0, 0, canvas.width, canvas.height);

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
        // user hit capsule
        capsule.deployed = false;

        // Apply effect depending on capsule type
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
    

    // Control ball movement
    balls.forEach(ball => {
        if(ball.x+ball.radius > canvas.width || ball.x - ball.radius < 0){
            ball.dx = -ball.dx; // bounce off sides
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
        
            ball.x = canvas.width/2;
            ball.y = canvas.height-30;
            ball.dx = Math.random() * 3;
            ball.dy = -3;
        }
    
        ball.x += ball.dx;
        ball.y += ball.dy;
    });
    

    // Check if the player won
    if(checkVictory() == true){
        gameWon = true;
        alert("Congradulations, you won!");
    }
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