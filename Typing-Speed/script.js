// View switching
const viewHome = document.getElementById("view-home");
const viewSentence = document.getElementById("view-sentence");
const viewWord = document.getElementById("view-word");

function showView(view) {
    [viewHome, viewSentence, viewWord].forEach(v => v.classList.remove("active"));
    view.classList.add("active");
}

// Nav buttons
document.getElementById("nav-home").addEventListener("click", () => showView(viewHome));
document.getElementById("btnSentence").addEventListener("click", () => showView(viewSentence));
document.getElementById("btnWord").addEventListener("click", () => showView(viewWord));
document.getElementById("backFromSentence").addEventListener("click", () => showView(viewHome));
document.getElementById("backFromWord").addEventListener("click", () => showView(viewHome));

/* ================= SENTENCE MODE ================= */
const quotes = [
    "The quick brown fox jumps over the lazy dog.",
    "Typing speed tests can be fun and challenging.",
    "JavaScript makes web games interactive and dynamic.",
    "Neon lights glow beautifully in the dark.",
    "Coding every day builds skill and confidence.",
    "The ship sails smoothly across the blue ocean.",
    "Winter brings snow and chilly winds.",
    "The city lights glow bright at night.",
    "Kindness can change someone's entire day.",
    "Hard work always leads to success in life.",
    "The moon glows softly above the silent hills.",
    "Games are a fun way to relax and enjoy.",
    "Never stop learning new and exciting things.",
    "A journey of a thousand miles begins with a step.",
    "Water is the most precious gift of nature.",
    "Happiness grows when you share it with others.",
    "Typing games help improve your accuracy and focus.",
    "A bright future comes from working hard today."
];

let startTimeSentence;
const quoteElem = document.getElementById("quote");
const inputElem = document.getElementById("sentenceInput");
const statsElem = document.getElementById("sentenceStats");
const startBtn = document.getElementById("sentenceStartBtn");

function startSentenceTest() {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    quoteElem.innerHTML = randomQuote.split("").map(c => `<span>${c}</span>`).join("");
    inputElem.value = "";
    inputElem.disabled = false;
    inputElem.focus();
    startTimeSentence = null;
    statsElem.textContent = "WPM: 0 | Accuracy: 100% | Time: 0s";
    startBtn.textContent = "Start Test";
}

function updateSentenceStats() {
    if (!startTimeSentence) {
        startTimeSentence = new Date().getTime();
        startBtn.textContent = "Restart";
    }
    const quoteSpans = quoteElem.querySelectorAll("span");
    const inputChars = inputElem.value.split("");
    let correctChars = 0;
    quoteSpans.forEach((span, i) => {
        const char = inputChars[i];
        if (char === span.innerText) {
            span.style.color = "#00ffb3";
            correctChars++;
        } else if (char) {
            span.style.color = "#ff4d6d";
        } else {
            span.style.color = "var(--neon-blue)";
        }
    });
    const elapsedTimeMin = (new Date().getTime() - startTimeSentence) / 1000 / 60;
    const wpm = Math.round((inputChars.length / 5) / elapsedTimeMin) || 0;
    const accuracy = Math.round((correctChars / inputChars.length) * 100) || 100;
    const elapsedSec = ((new Date().getTime() - startTimeSentence) / 1000).toFixed(1);
    statsElem.textContent = `WPM: ${wpm} | Accuracy: ${accuracy}% | Time: ${elapsedSec}s`;
}

startBtn.addEventListener("click", startSentenceTest);
inputElem.addEventListener("input", updateSentenceStats);

/* ================= WORD MODE ================= */
document.addEventListener('DOMContentLoaded', () => {
    const wordList = [
        "apple", "car", "light", "keyboard", "ocean", "code", "sky", "music", "random", "speed",
        "narrow", "science", "maths", "board", "game", "river", "green", "fast", "blue", "moon",
        "star", "cloud", "train", "ship", "plane", "earth", "mouse", "screen", "phone", "book",
        "table", "chair", "glass", "stone", "road", "city", "forest", "mountain", "water", "fire",
        "wind", "snow", "rain", "tree", "leaf", "flower", "sun", "gold", "silver", "time"
    ];

    const duration = 30;
    let currentWord = "";
    let correctCount = 0;
    let totalTyped = 0;
    let startTime = null;
    let timerWord = null;

    const wordDisplay = document.getElementById("wordDisplay");
    const wordInput = document.getElementById("wordInput");
    const wordStats = document.getElementById("wordStats");
    const wordStartBtn = document.getElementById("wordStartBtn");

    function nextWord() {
        currentWord = wordList[Math.floor(Math.random() * wordList.length)];
        wordDisplay.textContent = currentWord;
    }

    function updateStatsDisplay() {
        const elapsedSec = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
        const elapsedMin = elapsedSec / 60;
        const wpm = elapsedMin > 0 ? Math.round(correctCount / elapsedMin) : 0;
        const accuracy = totalTyped > 0 ? Math.round((correctCount / totalTyped) * 100) : 100;
        const timeLeft = Math.max(0, duration - elapsedSec);
        wordStats.textContent = `WPM: ${wpm} | Accuracy: ${accuracy}% | Time Left: ${timeLeft}s`;
    }

    function startWordTest() {
        clearInterval(timerWord);
        correctCount = 0;
        totalTyped = 0;
        startTime = Date.now();
        wordStartBtn.disabled = true;
        wordInput.disabled = false;
        wordInput.value = "";
        nextWord();
        wordInput.focus();
        updateStatsDisplay();
        timerWord = setInterval(() => {
            updateStatsDisplay();
            if ((Date.now() - startTime) / 1000 >= duration) {
                endWordTest();
            }
        }, 200);
    }

    wordInput.addEventListener("keydown", (e) => {
        if (e.code === "Space" || e.key === " ") {
            e.preventDefault();
            const typed = wordInput.value.trim();
            totalTyped++;
            if (typed === currentWord) correctCount++;
            wordInput.value = "";
            nextWord();
            updateStatsDisplay();
        }
    });

    function endWordTest() {
        clearInterval(timerWord);
        wordInput.disabled = true;
        wordStartBtn.disabled = false;
        const elapsedMin = duration / 60;
        const wpm = Math.round(correctCount / elapsedMin);
        const accuracy = totalTyped > 0 ? Math.round((correctCount / totalTyped) * 100) : 0;
        wordStats.textContent = `WPM: ${wpm} | Accuracy: ${accuracy}% | Time Left: 0s`;
    }

    wordStartBtn.addEventListener("click", startWordTest);
});
