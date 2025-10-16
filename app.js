// Import game logic functions
import {
  difficultySettings,
  increaseScore,
  spawnMole,
  resetMolePosition,
  getCurrentSpeed,
  getInitialTime,
  shouldChangeSpeed,
} from './src/gameLogic.js';

// ======================
// 🎮 GLOBAL VARIABLES
// ======================
let squares,
  mole,
  timeLeft,
  score,
  highScore,
  final,
  startButton,
  pauseButton,
  restartButton,
  resetHighScoreButton,
  highScoreMessage,
  difficultyButtons,
  currentDifficultyDisplay,
  srAnnouncer;

function initializeElements() {
  squares = document.querySelectorAll('.square');
  mole = document.querySelector('.mole');
  timeLeft = document.querySelector('#time-left');
  score = document.querySelector('#score');
  highScore = document.querySelector('#high-score');
  final = document.querySelector('#final-score');
  startButton = document.querySelector('#start-button');
  pauseButton = document.querySelector('#pause-button');
  restartButton = document.querySelector('#restart-button');
  resetHighScoreButton = document.querySelector('#reset-highscore-button');
  highScoreMessage = document.querySelector('#high-score-message');
  difficultyButtons = document.querySelectorAll('.difficulty-btn');
  currentDifficultyDisplay = document.querySelector('#current-difficulty');
  srAnnouncer = document.querySelector('#sr-announcer');
}

// ======================
// 🔊 AUDIO
// ======================
let hitSound;

function initializeAudio() {
  hitSound = new Audio('audio/whack01.mp3');
}

// ======================
// 🧠 GAME STATE
// ======================
let result = 0;
let hit = 0;
let currentTime = 30;
let timer = null;
let countDownTimer = null;
let isGamePaused = false;
let isGameRunning = false;
let currentDifficulty = 'easy';
let selectedIndex = null; // For keyboard selection

// Multiplayer mode state
let multiplayer = false;
let currentPlayer = 1;
let scores = { 1: 0, 2: 0 };

// ======================
// 💾 HIGH SCORE LOGIC
// ======================
function getHighScore() {
  return (
    parseInt(
      localStorage.getItem(`whackAMoleHighScore_${currentDifficulty}`)
    ) || 0
  );
}

function setHighScore(scoreValue) {
  localStorage.setItem(`whackAMoleHighScore_${currentDifficulty}`, scoreValue);
  if (highScore) highScore.textContent = scoreValue;
}

function updateHighScoreDisplay() {
  try {
    if (highScore) {
      const hs = getHighScore(currentDifficulty);
      highScore.textContent = hs;
    }
  } catch (error) {
    console.error('Error updating high score:', error);
  }
}

function checkHighScore() {
  try {
    const currentHigh = getHighScore();
    if (result > currentHigh) {
      setHighScore(result);
      if (highScoreMessage) {
        highScoreMessage.textContent = '🎉 New High Score! 🎉';
        highScoreMessage.style.display = 'block';
        setTimeout(() => (highScoreMessage.style.display = 'none'), 3000);
      }
    }
  } catch (error) {
    console.error('Error checking high score:', error);
  }
}

function resetHighScore() {
  if (confirm(`Reset ${currentDifficulty.toUpperCase()} High Score?`)) {
    setHighScore(0);
    if (highScoreMessage) {
      highScoreMessage.textContent = 'High Score Reset!';
      highScoreMessage.style.display = 'block';
      setTimeout(() => (highScoreMessage.style.display = 'none'), 2000);
    }
  }
}

// ======================
// ⏱️ GAME LOGIC
// ======================
function updateTimerUI() {
  if (timeLeft) timeLeft.textContent = currentTime;
}

function resetGame(keepTime = false) {
  if (timer) clearInterval(timer);
  if (countDownTimer) clearInterval(countDownTimer);
  result = 0;
  if (score) score.textContent = result;
  if (final) final.textContent = '';
  if (squares) squares.forEach(s => s.classList.remove('mole'));
  resetMolePosition();
  isGamePaused = false;
  isGameRunning = false;
  if (startButton) startButton.disabled = false;
  if (pauseButton) {
    pauseButton.disabled = true;
    pauseButton.textContent = 'Pause';
  }
  if (restartButton) restartButton.disabled = true;
  if (!keepTime) currentTime = getInitialTime(currentDifficulty);
  updateTimerUI();
  updateHighScoreDisplay();

  // Reset multiplayer scores
  scores = { 1: 0, 2: 0 };
  const p1 = document.getElementById('score-player1');
  const p2 = document.getElementById('score-player2');
  if (p1) p1.textContent = 0;
  if (p2) p2.textContent = 0;
}

function startGame() {
  if (isGameRunning) return;
  resetGame(true);
  isGameRunning = true;
  if (startButton) startButton.disabled = true;
  if (pauseButton) pauseButton.disabled = false;
  if (restartButton) restartButton.disabled = false;
  moveMole();
  countDownTimer = setInterval(countDown, 1000);
}

function pauseGame() {
  if (!isGameRunning) return;
  if (!isGamePaused) {
    clearInterval(timer);
    clearInterval(countDownTimer);
    if (pauseButton) pauseButton.textContent = 'Resume';
    isGamePaused = true;
  } else {
    moveMole();
    countDownTimer = setInterval(countDown, 1000);
    if (pauseButton) pauseButton.textContent = 'Pause';
    isGamePaused = false;
  }
}

function randomSquare() {
  squares.forEach(square => square.classList.remove('mole', 'whacked'));
  squares.forEach(square => square.classList.remove('selected'));
  hit = null;
  selectedIndex = null;

  const randomIndex = spawnMole(9, true);
  const randomSquare = squares[randomIndex];
  randomSquare.classList.add('mole');
  hit = randomSquare.id;
}

// ======================
// 🧍 HIT DETECTION
// ======================
function hitSquare(index) {
  if (!isGameRunning || isGamePaused) return;
  const square = squares[index];
  if (!square) return;

  if (square.id == hit) {
    if (multiplayer) {
      scores[currentPlayer] = increaseScore(
        scores[currentPlayer],
        currentDifficulty,
        currentTime
      );
      document.getElementById(`score-player${currentPlayer}`).textContent =
        scores[currentPlayer];
      currentPlayer = currentPlayer === 1 ? 2 : 1; // Switch turn
      srAnnouncer.textContent = `Player ${currentPlayer}'s turn`;
    } else {
      result = increaseScore(result, currentDifficulty, currentTime);
      if (score) score.textContent = result;
    }

    if (hitSound) {
      hitSound.currentTime = 0;
      hitSound.play().catch(err => console.log('Audio play prevented:', err));
    }

    square.classList.add('whacked');
    hit = null;
  }
}

function addSquareListeners() {
  squares.forEach((square, i) => {
    square.addEventListener('mousedown', () => {
      hitSquare(i);
      setSelection(i);
    });
  });
}

// ======================
// ⌨️ KEYBOARD CONTROLS
// ======================
function setSelection(i) {
  if (selectedIndex !== null && squares[selectedIndex]) {
    squares[selectedIndex].classList.remove('selected');
  }
  selectedIndex = i;
  if (squares[selectedIndex]) {
    squares[selectedIndex].classList.add('selected');
    squares[selectedIndex].focus({ preventScroll: true });
    if (srAnnouncer)
      srAnnouncer.textContent = `Selected Hole ${selectedIndex + 1}`;
  }
}

// ======================
// 🕳️ MOLE MOVEMENT
// ======================
function moveMole() {
  if (timer) clearInterval(timer);
  const speed = getCurrentSpeed(currentTime, currentDifficulty);
  timer = setInterval(randomSquare, speed);
}

// ======================
// ⏳ COUNTDOWN
// ======================
function countDown() {
  currentTime--;
  updateTimerUI();

  if (shouldChangeSpeed(currentTime, currentDifficulty)) moveMole();

  if (currentTime == 0) {
    clearInterval(countDownTimer);
    clearInterval(timer);
    isGameRunning = false;
    if (pauseButton) pauseButton.disabled = true;
    if (restartButton) restartButton.disabled = false;
    if (squares) squares.forEach(square => square.classList.remove('mole'));

    if (final) {
      if (multiplayer) {
        const winner =
          scores[1] === scores[2]
            ? "It's a Tie!"
            : scores[1] > scores[2]
            ? '🏆 Player 1 Wins!'
            : '🏆 Player 2 Wins!';
        final.textContent = `P1: ${scores[1]} | P2: ${scores[2]} → ${winner}`;
      } else {
        final.textContent = `Your final score is: ${result}`;
        checkHighScore();
      }
    }
  }
}

// ======================
// 🌗 THEME TOGGLE
// ======================
const storageKey = 'theme-preference';
const getColorPreference = () => {
  if (localStorage.getItem(storageKey)) return localStorage.getItem(storageKey);
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
};
const setPreference = () => {
  localStorage.setItem(storageKey, theme.value);
  reflectPreference();
};
const reflectPreference = () => {
  document.firstElementChild.setAttribute('data-theme', theme.value);
  document
    .querySelector('#theme-toggle')
    ?.setAttribute('aria-label', theme.value);
};
const theme = { value: getColorPreference() };
reflectPreference();
window.onload = () => {
  reflectPreference();
  document.querySelector('#theme-toggle').addEventListener('click', () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
    setPreference();
  });
};

// ======================
// 🎯 EVENT LISTENERS
// ======================
function addEventListeners() {
  difficultyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (!isGameRunning) {
        difficultyButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentDifficulty = btn.dataset.level;
        if (currentDifficultyDisplay)
          currentDifficultyDisplay.textContent =
            currentDifficulty.charAt(0).toUpperCase() +
            currentDifficulty.slice(1);
        resetGame();
        updateHighScoreDisplay();
      }
    });
  });

  // Keyboard input
  document.addEventListener('keydown', e => {
    if (/^[1-9]$/.test(e.key)) {
      const idx = parseInt(e.key, 10) - 1;
      setSelection(idx);
      hitSquare(idx);
      e.preventDefault();
    }
  });

  // Buttons
  if (startButton) startButton.addEventListener('click', startGame);
  if (pauseButton) pauseButton.addEventListener('click', pauseGame);
  if (restartButton) restartButton.addEventListener('click', resetGame);
  if (resetHighScoreButton)
    resetHighScoreButton.addEventListener('click', resetHighScore);

  // Multiplayer toggle
  const multiplayerToggle = document.getElementById('multiplayer-toggle');
  if (multiplayerToggle) {
    multiplayerToggle.addEventListener('click', () => {
      multiplayer = !multiplayer;
      scores = { 1: 0, 2: 0 };
      document.getElementById('score-player1').textContent = 0;
      document.getElementById('score-player2').textContent = 0;
      alert(multiplayer ? '🎮 Multiplayer Mode On' : '🎯 Single Player Mode');
    });
  }
}

// ======================
// 🚀 INITIALIZATION
// ======================
export function initializeGame() {
  initializeElements();
  initializeAudio();
  resetMolePosition();
  resetGame();
  updateHighScoreDisplay();
  addEventListeners();
  addSquareListeners();
}

document.addEventListener('DOMContentLoaded', () => {
  initializeGame();
});
