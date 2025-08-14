const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let basket, objects, score, baseSpeed;
let state = "home"; // home, playing, gameover

// Load sounds
const catchSound = new Audio("musics/ting.mp3");
const gameOverSound = new Audio("musics/gameover.mp3");

// Removed cyan from ball colors
const colors = ["red", "yellow", "lime", "orange", "magenta"];

function initGame() {
    basket = { x: canvas.width / 2 - 50, y: canvas.height - 40, w: 100, h: 20, speed: 12 };
    objects = [];
    score = 0;
    baseSpeed = 3; // starting speed
    spawnObject();
    state = "playing";
    gameLoop();
}

function spawnObject() {
    objects.push({
        x: Math.random() * (canvas.width - 20),
        y: -20,
        size: 25,
        speed: baseSpeed,
        color: colors[Math.floor(Math.random() * colors.length)]
    });
}

function gameLoop() {
    if (state !== "playing") return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Basket
    ctx.fillStyle = "cyan";
    ctx.shadowColor = "cyan";
    ctx.shadowBlur = 15;
    ctx.fillRect(basket.x, basket.y, basket.w, basket.h);
    ctx.shadowBlur = 0;

    // Objects
    for (let i = 0; i < objects.length; i++) {
        let obj = objects[i];
        obj.y += obj.speed;

        ctx.beginPath();
        ctx.fillStyle = obj.color;
        ctx.shadowColor = obj.color;
        ctx.shadowBlur = 15;
        ctx.arc(obj.x, obj.y, obj.size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Catch
        if (
            obj.y + obj.size / 2 >= basket.y &&
            obj.x >= basket.x &&
            obj.x <= basket.x + basket.w
        ) {
            score++;
            baseSpeed += 0.10;
            catchSound.currentTime = 0;
            catchSound.play();
            objects.splice(i, 1);
            spawnObject();
            i--;
        }
        // Miss (Game Over)
        else if (obj.y > canvas.height) {
            gameOverSound.currentTime = 0; // reset sound
            gameOverSound.play(); // play immediately
            endGame();
        }
    }

    // Score
    ctx.fillStyle = "white";
    ctx.shadowColor = "white";
    ctx.shadowBlur = 10;
    ctx.font = "22px Arial Black";
    ctx.fillText("Score: " + score, 20, 30);
    ctx.shadowBlur = 0;

    requestAnimationFrame(gameLoop);
}

function endGame() {
    state = "gameover";
    canvas.style.display = "none";
    document.getElementById("final-score").innerText = "Your Score: " + score;
    document.getElementById("game-over").style.display = "flex";
}

document.addEventListener("keydown", e => {
    if (state === "playing") {
        if (e.key === "ArrowLeft") basket.x = Math.max(0, basket.x - basket.speed);
        if (e.key === "ArrowRight") basket.x = Math.min(canvas.width - basket.w, basket.x + basket.speed);
    }
    if (e.key === "Enter") {
        if (state === "home") {
            document.getElementById("home").style.display = "none";
            canvas.style.display = "block";
            initGame();
        }
        else if (state === "gameover") {
            document.getElementById("game-over").style.display = "none";
            canvas.style.display = "block";
            initGame();
        }
    }
});
