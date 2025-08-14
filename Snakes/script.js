const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const highScoreElement = document.getElementById("highScore");
const homeScreen = document.getElementById("homeScreen");
const gameOverScreen = document.getElementById("gameOverScreen");

const box = 30;
let snake, direction, food, score, gameInterval;
let gameRunning = false;
let highScore = localStorage.getItem("snakeHighScore") || 0;
highScoreElement.textContent = "High Score: " + highScore;

function getRandomFoodPosition() {
    const min = 1; // at least 1 block away from edge
    const maxX = (canvas.width / box) - 2;
    const maxY = (canvas.height / box) - 2;

    return {
        x: Math.floor(Math.random() * (maxX - min + 1) + min) * box,
        y: Math.floor(Math.random() * (maxY - min + 1) + min) * box
    };
}

function resetGame() {
    snake = [{ x: 9 * box, y: 9 * box }];
    direction = null;
    score = 0;
    scoreElement.textContent = "Score: 0";
    food = getRandomFoodPosition();
}

function startGame() {
    homeScreen.style.display = "none";
    gameOverScreen.style.display = "none";
    canvas.style.display = "block";
    resetGame();
    gameRunning = true;
    gameInterval = setInterval(drawGame, 80);
}

function endGame() {
    clearInterval(gameInterval);
    gameRunning = false;
    canvas.style.display = "none";
    gameOverScreen.style.display = "block";

    if (score > highScore) {
        highScore = score;
        localStorage.setItem("snakeHighScore", highScore);
    }
    highScoreElement.textContent = "High Score: " + highScore;
}

document.addEventListener("keydown", e => {
    if (!gameRunning && e.key === "Enter") {
        startGame();
    }
    if (e.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
    else if (e.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
    else if (e.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
    else if (e.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
});

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw snake
    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = "#0f0";
        ctx.shadowBlur = 8;
        ctx.shadowColor = "#0f0";
        ctx.fillRect(snake[i].x, snake[i].y, box, box);
    }

    // Draw food
    ctx.fillStyle = "red";
    ctx.shadowBlur = 8;
    ctx.shadowColor = "red";
    ctx.fillRect(food.x, food.y, box, box);

    if (!direction) return;

    let headX = snake[0].x;
    let headY = snake[0].y;

    if (direction === "UP") headY -= box;
    if (direction === "DOWN") headY += box;
    if (direction === "LEFT") headX -= box;
    if (direction === "RIGHT") headX += box;

    let newHead = { x: headX, y: headY };

    // Collision check
    if (
        headX < 0 || headY < 0 ||
        headX > canvas.width - box || headY > canvas.height - box ||
        snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)
    ) {
        endGame();
        return;
    }

    // Eating food
    if (headX === food.x && headY === food.y) {
        score++;
        scoreElement.textContent = "Score: " + score;
        food = getRandomFoodPosition();
    } else {
        snake.pop();
    }

    snake.unshift(newHead);
}