const homeScreen = document.querySelector('.home-screen');
const gameContainer = document.querySelector('.game-container');
const endScreen = document.querySelector('.end-screen');
const target = document.querySelector('.target');
const scoreDisplay = document.querySelector('.score');
const timerDisplay = document.querySelector('.timer');
const finalScoreDisplay = document.getElementById('final-score');

let score = 0;
let timeLeft = 30;
let gameInterval;
let moveInterval;
const moveSpeed = 1000; // fixed speed in ms

function startGame() {
    score = 0;
    timeLeft = 30;
    scoreDisplay.textContent = `Score: ${score}`;
    timerDisplay.textContent = `Time: ${timeLeft}s`;
    homeScreen.classList.add('hidden');
    endScreen.classList.add('hidden');
    gameContainer.style.display = 'block';

    moveTarget();
    gameInterval = setInterval(updateTimer, 1000);
    moveInterval = setInterval(moveTarget, moveSpeed);
}

function endGame() {
    clearInterval(gameInterval);
    clearInterval(moveInterval);
    gameContainer.style.display = 'none';
    finalScoreDisplay.textContent = score;
    endScreen.classList.remove('hidden');
}

function moveTarget() {
    const maxX = gameContainer.offsetWidth - target.offsetWidth;
    const maxY = gameContainer.offsetHeight - target.offsetHeight;
    const randomX = Math.random() * maxX;
    const randomY = Math.random() * maxY;
    target.style.left = `${randomX}px`;
    target.style.top = `${randomY}px`;
}

target.addEventListener('click', () => {
    score++;
    scoreDisplay.textContent = `Score: ${score}`;
    moveTarget(); // move instantly on click
});

function updateTimer() {
    timeLeft--;
    timerDisplay.textContent = `Time: ${timeLeft}s`;
    if (timeLeft <= 0) {
        endGame();
    }
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        if (homeScreen.style.display !== 'none' || !endScreen.classList.contains('hidden')) {
            startGame();
        }
    }
});
