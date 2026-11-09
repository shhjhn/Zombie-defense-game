
// ==========================================
// ZOMBIE TYPE DEFENSE
// Complete game script
// ==========================================

// DOM ELEMENTS
const playBtn = document.getElementById("playBtn");
const difficultyBtn = document.getElementById("difficultyBtn");
const difficultyText = document.getElementById("difficulty");
const howBtn = document.getElementById("howBtn");
const settingsBtn = document.getElementById("settingsBtn");

const gameContainer = document.querySelector(".game-container");
const gameScreen = document.getElementById("gameScreen");
const battlefield = document.getElementById("battlefield");
const wordInput = document.getElementById("wordInput");

const scoreValue = document.getElementById("scoreValue");
const homeHealth = document.getElementById("homeHealth");
const exitGame = document.getElementById("exitGame");

const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalContent = document.getElementById("modalContent");
const closeBtn = document.getElementById("closeBtn");

// GAME SETTINGS
const words = [
    "BRAIN", "HUNGRY", "NIGHT", "DANGER", "RUN",
    "DARK", "DEAD", "ZOMBIE", "ATTACK", "BLOOD",
    "SHADOW", "FEAR", "GHOST", "ALIVE", "ESCAPE",
    "FOREST", "MONSTER", "SURVIVE", "SILENCE", "HUNTER",
    "CREEPY", "GRAVE", "HAUNTED", "WARNING", "SHELTER",
    "DANGER", "RESCUE", "SURVIVOR", "INFECTION", "MIDNIGHT"
];

const difficulties = {
    EASY: { spawn: 3500, speed: 0.035 },
    MEDIUM: { spawn: 2500, speed: 0.05 },
    HARD: { spawn: 1700, speed: 0.07 }
};

let difficulty = "EASY";
let zombies = [];
let score = 0;
let health = 100;
let selectedLane = 2;
let gameRunning = false;

let spawnTimer = null;
let animationFrame = null;
let lastFrameTime = 0;
let lastSpawn = 0;

// ==========================================
// MENU
// ==========================================

function openModal(title, content) {
    modalTitle.textContent = title;
    modalContent.innerHTML = content;
    modal.classList.remove("hidden");
}

function closeModal() {
    modal.classList.add("hidden");
}

playBtn.addEventListener("click", startGame);

difficultyBtn.addEventListener("click", () => {
    const levels = ["EASY", "MEDIUM", "HARD"];
    const index = levels.indexOf(difficulty);

    difficulty = levels[(index + 1) % levels.length];
    difficultyText.textContent = difficulty;
});

howBtn.addEventListener("click", () => {
    openModal(
        "HOW TO PLAY",
        `
        <p>🧟 Zombies are approaching your home!</p>
        <p>⬆️ Use UP and DOWN arrows to select a lane.</p>
        <p>⌨️ Type the word above a zombie to eliminate it.</p>
        <p>❤️ Protect your home. Don't let zombies through!</p>
        <p>🏆 Earn 10 points for every zombie defeated.</p>
        `
    );
});

settingsBtn.addEventListener("click", () => {
    openModal(
        "SETTINGS",
        `
        <p>Keyboard controls:</p>
        <p>↑ / ↓ : Select lane</p>
        <p>Enter : Start game</p>
        <p>Escape : Exit game or close menu</p>
        `
    );
});

closeBtn.addEventListener("click", closeModal);

modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
});

exitGame.addEventListener("click", exitToMenu);

// ==========================================
// LANE SELECTION
// ==========================================

function updateSelectedLane() {
    document.querySelectorAll(".lane").forEach(lane => {
        lane.classList.remove("selected-lane");
    });

    const lane = document.querySelector(
        `.lane[data-lane="${selectedLane}"]`
    );

    if (lane) lane.classList.add("selected-lane");
}

// ==========================================
// KEYBOARD CONTROLS
// ==========================================

document.addEventListener("keydown", (event) => {

    // Escape closes modal first
    if (event.key === "Escape") {
        if (!modal.classList.contains("hidden")) {
            closeModal();
        } else if (gameRunning) {
            exitToMenu();
        }
        return;
    }

    // Enter starts the game from the menu
    if (event.key === "Enter" && !gameRunning) {
        if (modal.classList.contains("hidden")) {
            event.preventDefault();
            startGame();
        }
        return;
    }

    if (!gameRunning) return;

    // Prevent arrow keys from moving the page
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault();

        if (event.key === "ArrowUp") {
            selectedLane = Math.max(0, selectedLane - 1);
        }

        if (event.key === "ArrowDown") {
            selectedLane = Math.min(4, selectedLane + 1);
        }

        updateSelectedLane();
    }
});

// ==========================================
// GAME START / EXIT
// ==========================================

function startGame() {
    if (gameRunning) return;

    gameRunning = true;

    gameContainer.style.display = "none";
    gameScreen.style.display = "block";

    score = 0;
    health = 100;
    selectedLane = 2;
    zombies = [];

    scoreValue.textContent = score;
    homeHealth.textContent = health;

    document.querySelectorAll(".lane").forEach(lane => {
        lane.innerHTML = "";
    });

    wordInput.value = "";

    updateSelectedLane();

    wordInput.focus();

    lastFrameTime = 0;
    lastSpawn = 0;

    animationFrame = requestAnimationFrame(gameLoop);
}

function exitToMenu() {
    gameRunning = false;

    clearInterval(spawnTimer);
    cancelAnimationFrame(animationFrame);

    gameScreen.style.display = "none";
    gameContainer.style.display = "";

    wordInput.value = "";
    closeModal();
}

// ==========================================
// SPAWN ZOMBIES
// ==========================================

function spawnZombie() {
    if (!gameRunning) return;

    const laneIndex = Math.floor(Math.random() * 5);

    const lane = document.querySelector(
        `.lane[data-lane="${laneIndex}"]`
    );

    if (!lane) return;

    const word = words[
        Math.floor(Math.random() * words.length)
    ];

    const zombieElement = document.createElement("div");
    zombieElement.className = "zombie";

    const wordElement = document.createElement("div");
    wordElement.className = "zombie-word";
    wordElement.textContent = word;

    const character = document.createElement("div");
    character.className = "zombie-character";
    character.textContent = "🧟";

    zombieElement.append(wordElement, character);

    zombieElement.style.left = "90%";

    lane.appendChild(zombieElement);

    zombies.push({
        element: zombieElement,
        word: word,
        lane: laneIndex,
        position: 90
    });
}

// ==========================================
// GAME LOOP
// ==========================================

function gameLoop(timestamp) {
    if (!gameRunning) return;

    const delta = lastFrameTime
        ? Math.min((timestamp - lastFrameTime) / 16.67, 3)
        : 1;

    lastFrameTime = timestamp;

    const settings = difficulties[difficulty];

    if (timestamp - lastSpawn >= settings.spawn) {
        spawnZombie();
        lastSpawn = timestamp;
    }

    zombies.forEach((zombie, index) => {
        zombie.position -= settings.speed * delta;

        zombie.element.style.left = zombie.position + "%";

        if (zombie.position <= 2) {
            zombie.element.remove();
            zombies.splice(index, 1);

            health -= 20;
            homeHealth.textContent = health;

            if (health <= 0) {
                endGame();
            }
        }
    });

    animationFrame = requestAnimationFrame(gameLoop);
}

// ==========================================
// TYPING SYSTEM
// ==========================================

wordInput.addEventListener("input", () => {
    if (!gameRunning) return;

    const typed = wordInput.value.trim().toUpperCase();

    if (!typed) return;

    const targetIndex = zombies.findIndex(zombie => {
        return (
            zombie.lane === selectedLane &&
            zombie.word.toUpperCase() === typed
        );
    });

    if (targetIndex !== -1) {
        const target = zombies[targetIndex];

        target.element.remove();
        zombies.splice(targetIndex, 1);

        score += 10;
        scoreValue.textContent = score;

        wordInput.value = "";
    }
});

// ==========================================
// GAME OVER
// ==========================================

function endGame() {
    gameRunning = false;

    cancelAnimationFrame(animationFrame);

    wordInput.blur();

    openModal(
        "GAME OVER",
        `
        <h3>Your score: ${score}</h3>
        <p>The night has won... this time.</p>
        <button id="restartBtn">PLAY AGAIN</button>
    `
    );

    document.getElementById("restartBtn").addEventListener(
        "click",
        () => {
            closeModal();
            startGame();
        }
    );
}
