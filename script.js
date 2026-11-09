
const playBtn = document.getElementById("playBtn");
const difficultyBtn = document.getElementById("difficultyBtn");
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

let difficulty = "Easy";
let score = 0;
let health = 100;
let selectedLane = 2;
let zombies = [];
let gameRunning = false;
let spawnTimer = null;
let animationFrame = null;
let lastTime = 0;


const words = [
    "BRAIN", "HUNGRY", "NIGHT", "DANGER",
    "HOUSE", "RUN", "ZOMBIE", "DARK",
    "ATTACK", "SURVIVE", "ALERT", "GHOST",
    "SHADOW", "FOREST", "MONSTER", "ESCAPE",
    "SILENCE", "HUNTER", "DREAM", "BLOOD",
    "CASTLE", "WINDOW", "STORM", "THUNDER",
    "LIGHT", "FIRE", "WATER", "EARTH",
    "POWER", "ENERGY", "MAGIC", "SECRET",
    "MYSTERY", "ANCIENT", "DANGER", "DEFEND",
    "PROTECT", "SHELTER", "SURVIVAL", "DARKNESS",
    "PHANTOM", "CREATURE", "NIGHTMARE", "WARNING",
    "SOLDIER", "WARRIOR", "WEAPON", "BATTLE",
    "VICTORY", "MISSION", "CHALLENGE", "STRATEGY",
    "Courage", "RESCUE", "FORTRESS", "GUARDIAN",
    "JOURNEY", "TREASURE", "KINGDOM", "LEGEND",
    "MACHINE", "CIRCUIT", "ROBOT", "DIGITAL",
    "NETWORK", "SYSTEM", "PROGRAM", "COMPUTER",
    "KEYBOARD", "MONITOR", "PROCESSOR", "MEMORY",
    "GALAXY", "PLANET", "UNIVERSE", "COSMIC",
    "ORBIT", "METEOR", "ASTEROID", "SATELLITE",
    "OCEAN", "MOUNTAIN", "DESERT", "JUNGLE",
    "RIVER", "VALLEY", "ISLAND", "VOLCANO",
    "CRYSTAL", "DIAMOND", "SAPPHIRE", "EMERALD",
    "LIGHTNING", "TORNADO", "HURRICANE", "BLIZZARD",
    "ADVENTURE", "EXPEDITION", "DISCOVERY", "EXPLORATION"
];


const settings = {
    Easy: { speed: 4, spawn: 3000 },
    Medium: { speed: 6, spawn: 2400 },
    Hard: { speed: 8, spawn: 1900 }
};

// Modal
function showModal(title, message) {
    modalTitle.textContent = title;
    modalContent.textContent = message;
    modal.classList.remove("hidden");
    modal.classList.add("active");
}

function hideModal() {
    modal.classList.add("hidden");
    modal.classList.remove("active");
}

closeBtn.addEventListener("click", hideModal);

modal.addEventListener("click", event => {
    if (event.target === modal) hideModal();
});

// Difficulty
difficultyBtn.addEventListener("click", () => {
    const levels = ["Easy", "Medium", "Hard"];
    difficulty = levels[(levels.indexOf(difficulty) + 1) % 3];

    document.getElementById("difficulty").textContent =
        difficulty.toUpperCase();
});

// Instructions
howBtn.addEventListener("click", () => {
    showModal(
        "HOW TO PLAY",
        "Select a lane using the UP and DOWN arrow keys. Type the word above a zombie to defeat it. Protect your home!"
    );
});

// Settings
settingsBtn.addEventListener("click", () => {
    showModal(
        "SETTINGS",
        "Music and sound controls will be added in a future update."
    );
});

// Game appearance
const gameStyles = document.createElement("style");

gameStyles.textContent = `
.game-screen {
    box-sizing: border-box;
    width: 100%;
    min-height: 100vh;
    padding: 20px;
    background: #101a1b;
    color: white;
}

.game-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 15px;
    margin-bottom: 20px;
}

.game-header button {
    padding: 10px 18px;
    background: #e74c3c;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
}

.battlefield {
    display: flex;
    flex-direction: column;
    gap: 5px;
    width: 100%;
    height: 480px;
    box-sizing: border-box;
    padding: 10px;
    background: #253d32;
    border: 3px solid #54745b;
    border-radius: 12px;
    overflow: hidden;
}

.lane {
    flex: 1;
    min-height: 0;
    position: relative;
    border-bottom: 2px dashed rgba(255,255,255,0.2);
    background: rgba(130,180,110,0.08);
}

.lane:last-child {
    border-bottom: none;
}

.lane.selected-lane {
    background: rgba(197,232,108,0.2);
    outline: 2px solid #c5e86c;
}

.zombie {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 90px;
    text-align: center;
    z-index: 2;
}

.zombie-character {
    font-size: 34px;
}

.zombie-word {
    display: inline-block;
    padding: 4px 7px;
    margin-bottom: 3px;
    background: #172323;
    color: #c5e86c;
    border-radius: 5px;
    font-size: 13px;
    font-weight: bold;
}

.typing-area {
    text-align: center;
    margin-top: 25px;
}

#wordInput {
    width: min(350px, 90%);
    box-sizing: border-box;
    padding: 14px;
    border: 2px solid #8bc34a;
    border-radius: 8px;
    background: #172323;
    color: white;
    font-size: 18px;
    outline: none;
}

#wordInput:focus {
    border-color: #c5e86c;
}
`;

document.head.appendChild(gameStyles);

// Lane selection
function updateLaneSelection() {
    document.querySelectorAll(".lane").forEach((lane, index) => {
        lane.classList.toggle(
            "selected-lane",
            index === selectedLane
        );
    });
}

// Spawn zombies
function spawnZombie() {
    if (!gameRunning) return;

    const laneIndex = Math.floor(Math.random() * 5);
    const lane = document.querySelector(
        `.lane[data-lane="${laneIndex}"]`
    );

    const word = words[Math.floor(Math.random() * words.length)];

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
        word,
        lane: laneIndex,
        position: 90
    });
}

// Game loop
function updateGame(timestamp) {
    if (!gameRunning) return;

    const delta = lastTime
        ? Math.min((timestamp - lastTime) / 1000, 0.1)
        : 0;

    lastTime = timestamp;

    const speed = settings[difficulty].speed;

    zombies.forEach(zombie => {
        zombie.position -= speed * delta;
        zombie.element.style.left = zombie.position + "%";
    });

    const remaining = [];

    zombies.forEach(zombie => {
        if (zombie.position <= 2) {
            zombie.element.remove();
            health -= 20;
        } else {
            remaining.push(zombie);
        }
    });

    zombies = remaining;
    homeHealth.textContent = Math.max(0, health);

    if (health <= 0) {
        endGame();
        return;
    }

    animationFrame = requestAnimationFrame(updateGame);
}

// Start
function startGame() {
    hideModal();

    gameRunning = false;
    clearInterval(spawnTimer);
    cancelAnimationFrame(animationFrame);

    zombies.forEach(zombie => zombie.element.remove());
    zombies = [];

    score = 0;
    health = 100;
    selectedLane = 2;
    lastTime = 0;

    scoreValue.textContent = score;
    homeHealth.textContent = health;

    gameContainer.style.display = "none";
    gameScreen.style.display = "block";

    gameRunning = true;

    updateLaneSelection();

    wordInput.value = "";
    wordInput.focus();

    spawnTimer = setInterval(
        spawnZombie,
        settings[difficulty].spawn
    );

    spawnZombie();

    animationFrame = requestAnimationFrame(updateGame);
}

playBtn.addEventListener("click", startGame);

// Typing

wordInput.addEventListener("input", () => {
    const typed = wordInput.value.trim().toUpperCase();

    // Find a matching zombie in the selected lane
    const targetIndex = zombies.findIndex(zombie => {
        return (
            Number(zombie.lane) === Number(selectedLane) &&
            zombie.word.trim().toUpperCase() === typed
        );
    });

    if (targetIndex !== -1 && typed.length > 0) {
        const target = zombies[targetIndex];

        target.element.remove();
        zombies.splice(targetIndex, 1);

        score += 10;
        scoreValue.textContent = score;

        wordInput.value = "";
    }
});

document.addEventListener("keydown", event => {
    if (!gameRunning) {
        if (event.key === "Enter" &&
            gameContainer.style.display !== "none") {
            startGame();
        }
        return;
    }

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

    if (event.key === "Escape") {
        exitToMenu();
    }
});

// Game over
function endGame() {
    gameRunning = false;

    clearInterval(spawnTimer);
    cancelAnimationFrame(animationFrame);

    showModal(
        "GAME OVER",
        `Your home was overrun! Final score: ${score}`
    );
}

// Exit
function exitToMenu() {
    gameRunning = false;

    clearInterval(spawnTimer);
    cancelAnimationFrame(animationFrame);

    zombies.forEach(zombie => zombie.element.remove());
    zombies = [];

    gameScreen.style.display = "none";
    gameContainer.style.display = "";

    hideModal();
}

exitGame.addEventListener("click", exitToMenu);
