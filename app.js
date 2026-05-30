// Sound Synthesizer System using Web Audio API
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.connect(g);
    g.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === 'correct') {
        o.type = 'sine';
        o.frequency.setValueAtTime(440, now); // A4
        o.frequency.exponentialRampToValueAtTime(880, now + 0.1); // A5
        g.gain.setValueAtTime(0.5, now);
        g.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        o.start(now);
        o.stop(now + 0.5);
    } else if (type === 'incorrect') {
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(300, now);
        o.frequency.exponentialRampToValueAtTime(100, now + 0.3);
        g.gain.setValueAtTime(0.5, now);
        g.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        o.start(now);
        o.stop(now + 0.3);
    } else if (type === 'pop') {
        o.type = 'square';
        o.frequency.setValueAtTime(600, now);
        g.gain.setValueAtTime(0.1, now);
        g.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        o.start(now);
        o.stop(now + 0.1);
    }
}

// State
let questionsData = [];
let currentQuestionIndex = 0;
let score = 0;
let playerName = "";
let gameQuestions = [];
const POINTS_PER_Q = 100;
let hearts = 3;
let skipsRemaining = 1;

// DOM Elements
const screenStart = document.getElementById('screen-start');
const screenGame = document.getElementById('screen-game');
const screenEnd = document.getElementById('screen-end');

const modalConfig = document.getElementById('modal-config');
const btnConfirmConfig = document.getElementById('btn-confirm-config');
const themeCheckboxes = document.querySelectorAll('.theme-checkbox');
const numQuestionsInput = document.getElementById('num-questions');

const playerNameInput = document.getElementById('player-name');
const btnStart = document.getElementById('btn-start');
const btnRestart = document.getElementById('btn-restart');
const leaderboardList = document.getElementById('leaderboard-list');

const questionCard = document.querySelector('.question-card');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const scoreDisplay = document.getElementById('score-display');
const currentQSpan = document.getElementById('current-q');
const totalQSpan = document.getElementById('total-q');
const finalScoreDisplay = document.getElementById('final-score-display');
const healthBar = document.getElementById('health-bar');
// const btnSkip = document.getElementById('btn-skip');

// Accessibility DOM & Logic
const accessibilityMenu = document.getElementById('accessibility-menu');
const btnAccessibilityToggle = document.getElementById('btn-accessibility-toggle');
const accessibilityOptions = document.getElementById('accessibility-options');
const btnContrast = document.getElementById('btn-contrast');
const btnFontDecrease = document.getElementById('btn-font-decrease');
const btnFontIncrease = document.getElementById('btn-font-increase');

let currentFontSize = 16;

btnAccessibilityToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    accessibilityOptions.classList.toggle('collapsed');
    playSound('pop');
});

// Fechar ao clicar fora
document.addEventListener('click', (e) => {
    if (accessibilityMenu && !accessibilityMenu.contains(e.target)) {
        accessibilityOptions.classList.add('collapsed');
    }
});

btnContrast.addEventListener('click', () => {
    document.documentElement.classList.toggle('high-contrast');
    playSound('pop');
});

btnFontDecrease.addEventListener('click', () => {
    if (currentFontSize > 12) {
        currentFontSize -= 2;
        document.documentElement.style.fontSize = `${currentFontSize}px`;
        playSound('pop');
    }
});

btnFontIncrease.addEventListener('click', () => {
    if (currentFontSize < 24) {
        currentFontSize += 2;
        document.documentElement.style.fontSize = `${currentFontSize}px`;
        playSound('pop');
    }
});

// Init
async function init() {
    updateLeaderboardView();
}

// Leaderboard LocalStorage
function getLeaderboard() {
    return JSON.parse(localStorage.getItem('trivia_track_leaderboard') || '[]');
}

function saveToLeaderboard(name, pts) {
    const lb = getLeaderboard();
    lb.push({ name, pts });
    lb.sort((a, b) => b.pts - a.pts);
    const top10 = lb.slice(0, 10);
    localStorage.setItem('trivia_track_leaderboard', JSON.stringify(top10));
}

function updateLeaderboardView() {
    const lb = getLeaderboard();
    leaderboardList.innerHTML = '';
    if (lb.length === 0) {
        leaderboardList.innerHTML = '<li style="text-align: center; justify-content:center; color:#999">Nenhuma pontuação ainda</li>';
        return;
    }
    lb.forEach((entry, idx) => {
        const li = document.createElement('li');
        let rankClass = idx === 0 ? 'rank-1' : idx === 1 ? 'rank-2' : idx === 2 ? 'rank-3' : '';
        li.innerHTML = `<span class="${rankClass}">#${idx + 1} ${entry.name}</span> <span class="pts">${entry.pts} pts</span>`;
        leaderboardList.appendChild(li);
    });
}

// Game Flow
function openConfigModal() {
    playerName = playerNameInput.value.trim() || 'Jogador';
    playSound('pop');
    modalConfig.classList.remove('hidden');
}

async function confirmConfigAndStart() {
    const selectedThemes = Array.from(themeCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);

    if (selectedThemes.length === 0) {
        alert('Selecione pelo menos um tema para prosseguir!');
        return;
    }

    let totalQuestionsToPlay = parseInt(numQuestionsInput.value) || 10;
    if (totalQuestionsToPlay < 10) totalQuestionsToPlay = 10;
    if (totalQuestionsToPlay > 30) totalQuestionsToPlay = 30;

    playSound('pop');
    btnConfirmConfig.disabled = true;
    btnConfirmConfig.textContent = "CARREGANDO...";

    questionsData = [];
    try {
        for (const themeFile of selectedThemes) {
            const res = await fetch(themeFile);
            const text = await res.text();
            if (text.trim()) {
                const data = JSON.parse(text);
                questionsData = questionsData.concat(data);
            }
        }
    } catch (e) {
        console.error("Falha ao carregar questoes:", e);
        alert("Erro ao carregar questões.");
        btnConfirmConfig.disabled = false;
        btnConfirmConfig.textContent = "CONFIRMAR";
        return;
    }

    if (questionsData.length === 0) {
        alert("Nenhuma pergunta encontrada nos temas selecionados!");
        btnConfirmConfig.disabled = false;
        btnConfirmConfig.textContent = "CONFIRMAR";
        return;
    }

    btnConfirmConfig.disabled = false;
    btnConfirmConfig.textContent = "CONFIRMAR";
    modalConfig.classList.add('hidden');

    score = 0;
    hearts = 3;
    skipsRemaining = 1;
    updateHealthUI();
    // updateSkipUI();

    const shuffled = [...questionsData].sort(() => 0.5 - Math.random());
    gameQuestions = shuffled.slice(0, totalQuestionsToPlay);
    currentQuestionIndex = 0;

    scoreDisplay.textContent = score;
    totalQSpan.textContent = gameQuestions.length;

    changeScreen(screenStart, screenGame);
    loadQuestion();
}

function updateHealthUI() {
    let heartStr = "";
    for (let i = 0; i < hearts; i++) heartStr += "❤️";
    for (let i = hearts; i < 3; i++) heartStr += "🖤";
    healthBar.textContent = heartStr;
}

// function updateSkipUI() {
//     if (skipsRemaining > 0) {
//         btnSkip.textContent = `PULAR QUESTÃO (${skipsRemaining})`;
//         btnSkip.disabled = false;
//     } else {
//         btnSkip.textContent = "PULO USADO";
//         btnSkip.disabled = true;
//     }
// }

function getRandomInt(min, max) {
    // Increase max by 1 to make it inclusive
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function loadQuestion() {
    if (currentQuestionIndex >= gameQuestions.length) {
        endGame();
        return;
    }

    const q = gameQuestions[currentQuestionIndex];
    currentQSpan.textContent = currentQuestionIndex + 1;
    questionText.textContent = q.pergunta;

    // Generate Options: exactly 1 correct + 3 wrong alternatives
    const correctAnswer = q.resposta;
    let wrongAnswers = q.alternativas_erradas;

    let options = [correctAnswer, ...wrongAnswers].sort(() => 0.5 - Math.random());

    // Update mascot according to category
    const hostMascot = document.getElementById('host-mascot');
    let randomId = getRandomInt(1, 7);
    if (randomId === 1) {
        hostMascot.src = 'assets/pers1.png';
    } else if (randomId === 2) {
        hostMascot.src = 'assets/pers2.png';
    } else if (randomId === 3) {
        hostMascot.src = 'assets/pers3.png';
    } else if (randomId === 4) {
        hostMascot.src = 'assets/pers4.png';
    } else if (randomId === 5) {
        hostMascot.src = 'assets/pers5.png';
    } else if (randomId === 6) {
        hostMascot.src = 'assets/pers6.png';
    } else {
        hostMascot.src = 'assets/pers7.png';
    }

    optionsContainer.innerHTML = '';
    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'btn-option';
        btn.textContent = opt;
        btn.onclick = () => selectOption(btn, opt === correctAnswer, correctAnswer);
        optionsContainer.appendChild(btn);
    });
}

function selectOption(btn, isCorrect, correctAnswerText) {
    // Disable all options
    Array.from(optionsContainer.children).forEach(b => {
        b.disabled = true;
        b.style.cursor = 'default';
        if (b.textContent === correctAnswerText && !isCorrect) {
            b.classList.add('correct'); // reveal correct one if user missed
        }
    });

    if (isCorrect) {
        btn.classList.add('correct');
        playSound('correct');
        score += POINTS_PER_Q;
        scoreDisplay.textContent = score;

        // Minor animation for character
        // document.getElementById('host-mascot').style.transform = 'scale(1.2)';
        setTimeout(() => document.getElementById('host-mascot').style.transform = '', 500);
    } else {
        btn.classList.add('incorrect');
        playSound('incorrect');

        hearts--;
        updateHealthUI();

        // document.getElementById('rival-mascot').style.transform = 'scale(1.2)';
        setTimeout(() => document.getElementById('rival-mascot').style.transform = '', 500);
    }

    setTimeout(() => {
        if (hearts <= 0) {
            endGame();
            return;
        }

        // Start fade out animation
        questionCard.classList.add('anim-fade-out');
        optionsContainer.classList.add('anim-fade-out');

        setTimeout(() => {
            currentQuestionIndex++;
            loadQuestion();

            // Remove fade out and trigger fade in
            questionCard.classList.remove('anim-fade-out');
            optionsContainer.classList.remove('anim-fade-out');
            questionCard.classList.add('anim-fade-in');
            optionsContainer.classList.add('anim-fade-in');

            // Clean up animation class after it completes
            setTimeout(() => {
                questionCard.classList.remove('anim-fade-in');
                optionsContainer.classList.remove('anim-fade-in');
            }, 250);
        }, 250);
    }, 1250);
}

function endGame() {
    finalScoreDisplay.textContent = score;
    saveToLeaderboard(playerName, score);
    updateLeaderboardView();
    changeScreen(screenGame, screenEnd);
}

function changeScreen(from, to) {
    from.classList.add('hidden');
    from.classList.remove('active');
    to.classList.remove('hidden');
    to.classList.add('active');
}

// Event Listeners
btnStart.addEventListener('click', openConfigModal);
btnConfirmConfig.addEventListener('click', confirmConfigAndStart);
playerNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') openConfigModal();
});
btnRestart.addEventListener('click', () => {
    playSound('pop');
    changeScreen(screenEnd, screenStart);
});

// btnSkip.addEventListener('click', () => {
//     if (skipsRemaining > 0) {
//         skipsRemaining--;
//         updateSkipUI();
//         playSound('pop');

//         // Start fade out animation
//         questionCard.classList.add('anim-fade-out');
//         optionsContainer.classList.add('anim-fade-out');

//         setTimeout(() => {
//             currentQuestionIndex++;
//             loadQuestion();

//             // Remove fade out and trigger fade in
//             questionCard.classList.remove('anim-fade-out');
//             optionsContainer.classList.remove('anim-fade-out');
//             questionCard.classList.add('anim-fade-in');
//             optionsContainer.classList.add('anim-fade-in');

//             // Clean up animation class after it completes
//             setTimeout(() => {
//                 questionCard.classList.remove('anim-fade-in');
//                 optionsContainer.classList.remove('anim-fade-in');
//             }, 250);
//         }, 250);
//     }
// });

// Run Init
window.onload = init;
