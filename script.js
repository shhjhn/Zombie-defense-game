
const playBtn = document.getElementById("playBtn");
const difficultyBtn = document.getElementById("difficultyBtn");
const howBtn = document.getElementById("howBtn");
const settingsBtn = document.getElementById("settingsBtn");

const gameScreen = document.getElementById("gameScreen");
const battlefield = document.getElementById("battlefield");
const wordInput = document.getElementById("wordInput");
const scoreValue = document.getElementById("scoreValue");
const homeHealth = document.getElementById("homeHealth");
const exitGame = document.getElementById("exitGame");

const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalText = document.getElementById("modalText");
const closeModal = document.getElementById("closeModal");

let difficulty = "Easy";
let score = 0;
let health = 100;
let zombies = [];
let selectedLane = 2;
let gameRunning = false;
let spawnTimer;
let gameLoop;
let lastTime = 0;

const words = [
    "BRAIN", "HUNGRY", "NIGHT", "DANGER",
    "HOUSE", "RUN", "ZOMBIE", "DARK",
    "ATTACK", "SURVIVE", "ALERT", "GHOST"
];

const settings = {
    Easy: { speed: 3, spawn: 2800 },
    Medium: { speed: 4.5, spawn: 2200 },
    Hard: { speed: 6, spawn: 1700 }
};

function showModal(title, text) {
    if (!modal) return;
    modalTitle.textContent = title;
    modalText.textContent = text;
    modal.classList.add("active");
}

function hideModal() {
    if (modal) modal.classList.remove("active");
}

if (closeModal) closeModal.addEventListener("click", hideModal);

if (modal) {
    modal.addEventListener("click", event => {
        if (event.target === modal) hideModal();
    });
}

if (difficultyBtn) {
    difficultyBtn.textContent = "Difficulty: Easy";

    difficultyBtn.addEventListener("click", () => {
        const levels = ["Easy", "Medium", "Hard"];
        difficulty = levels[(levels.indexOf(difficulty) + 1) % 3];
        difficultyBtn.textContent = "Difficulty: " + difficulty;
    });
}

if (howBtn) {
    howBtn.addEventListener("click", () => {
        showModal(
            "How to Play",
            "Use UP and DOWN arrows to select a lane. Type the word above a zombie to defeat it. Don't let zombies reach your home!"
        );
    });
}

if (settingsBtn) {
    settingsBtn.addEventListener("click", () => {
        showModal("Settings", "Sound and music settings are coming soon!");
    });
}

// Add zombie appearance
const zombieStyles = document.createElement("style");
zombieStyles.textContent = `
.zombie {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 85px;
    text-align: center;
    transition: left 0.05s linear;
    z-index: 2;
}
.zombie-character {
    font-size: 35px;
}
.zombie-word {
    display: inline-block;
    background: #172323;
    color: #c5e86c;
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: bold;
    margin-bottom: 4px;
}
.lane.selected-lane {
    outline: 2px solid #c5e86c;
    background: rgba(197, 232, 108, 0.15);
}
`;
document.head.appendChild(zombieStyles);

function updateLaneSelection() {
    document.querySelectorAll(".lane").forEach((lane, index) => {
        lane.classList.toggle("selected-lane", index === selectedLane);
    });
}

function spawnZombie() {
    if (!gameRunning) return;

    const lanes = document.querySelectorAll(".lane");
    const laneIndex = Math.floor(Math.random() * lanes.length);
    const lane = lanes[laneIndex];

    const zombie = document.createElement("div");
    zombie.className = "zombie";

    const word = words[Math.floor(Math.random() * words.length)];

    zombie.innerHTML = `
        <div class="zombie-word">${word}</div>
        <div class="zombie-character">🧟</div>
    `;

    zombie.dataset.word = word;
    zombie.dataset.lane = laneIndex;
    zombie.style.left = "85%";

    lane.appendChild(zombie);

    zombies.push({
        element: zombie,
        word: word,
        lane: laneIndex,
        position: 85
    });
}

function updateGame(timestamp) {
    if (!gameRunning) return;

    const delta = lastTime ? Math.min((timestamp - lastTime) / 1000, 0.1) : 0;
    lastTime = timestamp;

    zombies.forEach(zombie => {
        zombie.position -= settings[difficulty].speed * delta;
        zombie.element.style.left = zombie.position + "%";
    });

    zombies = zombies.filter(zombie => {
        if (zombie.position <= 2) {
            zombie.element.remove();
            health -= 20;
            homeHealth.textContent = health;

            if (health <= 0) {
                endGame();
            }

            return false;
        }

        return true;
    });

    gameLoop = requestAnimationFrame(updateGame);
}

function startGame() {
    hideModal();

    // Hide the main menu elements
    document.querySelectorAll(
        ".hero, .logo, .buttons, .topbar"
    ).forEach(element => {
        element.style.display = "none";
    });

    gameScreen.style.display = "block";

    score = 0;
    health = 100;
    zombies = [];
    selectedLane = 2;
    gameRunning = true;
    lastTime = 0;

    scoreValue.textContent = score;
    homeHealth.textContent = health;
    wordInput.value = "";

    updateLaneSelection();

    spawnTimer = setInterval(
        spawnZombie,
        settings[difficulty].spawn
    );

    spawnZombie();
    gameLoop = requestAnimationFrame(updateGame);

    wordInput.focus();
}

function endGame() {
    if (!gameRunning) return;

    gameRunning = false;
    clearInterval(spawnTimer);
    cancelAnimationFrame(gameLoop);

    showModal(
        "GAME OVER",
        "Your home has been overrun! Final score: " + score
    );
}

function exitToMenu() {
    gameRunning = false;
    clearInterval(spawnTimer);
    cancelAnimationFrame(gameLoop);

    zombies.forEach(zombie => zombie.element.remove());
    zombies = [];

    gameScreen.style.display = "none";

    document.querySelectorAll(
        ".hero, .logo, .buttons, .topbar"
    ).forEach(element => {
        element.style.display = "";
    });

    hideModal();
}

if (playBtn) {
    playBtn.addEventListener("click", startGame);
}

if (exitGame) {
    exitGame.addEventListener("click", exitToMenu);
}

if (wordInput) {
    wordInput.addEventListener("input", () => {
        const typed = wordInput.value.trim().toUpperCase();

        const target = zombies.find(zombie =>
            zombie.lane === selectedLane &&
            zombie.word === typed
        );

        if (target && typed.length > 0) {
            target.element.remove();
            zombies = zombies.filter(zombie => zombie !== target);

            score += 10;
            scoreValue.textContent = score;
            wordInput.value = "";
        }
    });
}

document.addEventListener("keydown", event => {
    if (!gameRunning) return;

    if (event.key === "ArrowUp") {
        event.preventDefault();
        selectedLane = Math.max(0, selectedLane - 1);
        updateLaneSelection();
    }

    if (event.key === "ArrowDown") {
        event.preventDefault();
        selectedLane = Math.min(4, selectedLane + 1);
        updateLaneSelection();
    }
});
