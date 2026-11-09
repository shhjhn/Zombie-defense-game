
const playBtn = document.getElementById("playBtn");
const difficultyBtn = document.getElementById("difficultyBtn");
const howBtn = document.getElementById("howBtn");
const settingsBtn = document.getElementById("settingsBtn");

const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalText = document.getElementById("modalText");
const closeModal = document.getElementById("closeModal");

let difficulty = "Medium";

function showModal(title, text) {
    modalTitle.textContent = title;
    modalText.textContent = text;
    modal.classList.add("active");
}

function hideModal() {
    modal.classList.remove("active");
}

playBtn.addEventListener("click", () => {
    showModal(
        "Get Ready!",
        "Your adventure is about to begin. The game arena is coming in the next step!"
    );
});

difficultyBtn.addEventListener("click", () => {
    const choices = ["Easy", "Medium", "Hard"];
    const currentIndex = choices.indexOf(difficulty);
    difficulty = choices[(currentIndex + 1) % choices.length];

    difficultyBtn.textContent = "Difficulty: " + difficulty;
});

howBtn.addEventListener("click", () => {
    showModal(
        "How to Play",
        "Zombies are approaching! Type the word above a zombie to defeat it. Use the UP and DOWN arrow keys to switch between five lanes. Protect your house!"
    );
});

settingsBtn.addEventListener("click", () => {
    showModal(
        "Settings",
        "Music and sound settings will be added soon."
    );
});

closeModal.addEventListener("click", hideModal);

modal.addEventListener("click", (event) => {
    if (event.target === modal) {
        hideModal();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        hideModal();
    }
});
