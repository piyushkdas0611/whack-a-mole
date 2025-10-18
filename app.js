// Import game logic functions
import {
  difficultySettings,
  increaseScore,
  spawnMole,
  spawnMultipleMoles,
  resetMolePosition,
  getCurrentSpeed,
  getInitialTime,
  shouldChangeSpeed,
} from './src/gameLogic.js';

// ======================
// 🎮 GLOBAL VARIABLES
// ======================
let squares,
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
  try {
    hitSound = new Audio('./audio/whack01.mp3');
    hitSound.preload = 'auto';
    hitSound.volume = 0.5;
  } catch (error) {
    console.warn('Audio initialization failed:', error);
  }
}

// ======================
// 🧠 GAME STATE
// ======================
let result = 0;
let activeMoles = new Set(); // Track multiple active moles by their square IDs
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
  if (timeLeft) {
    timeLeft.textContent = currentTime;
  }
}

function resetGame(keepTime = false) {
  if (timer) clearInterval(timer);
  if (countDownTimer) clearInterval(countDownTimer);
  result = 0;
  if (score) score.textContent = result;
  if (final) final.textContent = '';
  if (squares)
    squares.forEach(s => s.classList.remove('mole', 'whacked', 'selected'));
  activeMoles.clear(); // Clear the active moles set
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
  activeMoles.clear();
  selectedIndex = null;

  const molePositions = spawnMultipleMoles(9, currentDifficulty);

  molePositions.forEach(position => {
    const square = squares[position];
    if (square) {
      square.classList.add('mole');
      activeMoles.add((position + 1).toString()); // Convert to string ID (1-9)
    }
  });
}

// ======================
// 🧍 HIT DETECTION
// ======================
function hitSquare(index) {
  if (!isGameRunning || isGamePaused) return;
  const square = squares[index];
  if (!square) return;

  if (activeMoles.has(square.id)) {
    if (multiplayer) {
      scores[currentPlayer] = increaseScore(
        scores[currentPlayer],
        currentDifficulty,
        currentTime
      );
      document.getElementById(`score-player${currentPlayer}`).textContent =
        scores[currentPlayer];
      currentPlayer = currentPlayer === 1 ? 2 : 1; // Switch turn
      if (srAnnouncer)
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
    activeMoles.delete(square.id); // Remove this mole from active set
  }
}

function addSquareListeners() {
  squares.forEach((square, i) => {
    // Add both mousedown and click events for better compatibility
    square.addEventListener('mousedown', () => {
      hitSquare(i);
      setSelection(i);
    });
    square.addEventListener('click', () => {
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
    if (squares)
      squares.forEach(square =>
        square.classList.remove('mole', 'whacked', 'selected')
      );
    activeMoles.clear(); // Clear active moles when game ends

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

// Initialize theme toggle
function initializeTheme() {
  reflectPreference();
  const themeToggle = document.querySelector('#theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      theme.value = theme.value === 'light' ? 'dark' : 'light';
      setPreference();
    });
  }
}

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

  // Keyboard input - numpad only (calculator layout)
  document.addEventListener('keydown', e => {
    let gridIndex = null;

    // Check for numpad keys - calculator layout mapping
    if (e.code && /^Numpad[1-9]$/.test(e.code)) {
      const numpadKey = parseInt(e.code.replace('Numpad', ''), 10);
      // Map numpad keys to grid positions (calculator layout):
      // Numpad7=0, Numpad8=1, Numpad9=2
      // Numpad4=3, Numpad5=4, Numpad6=5
      // Numpad1=6, Numpad2=7, Numpad3=8
      const numpadToGrid = {
        7: 0,
        8: 1,
        9: 2, // Top row
        4: 3,
        5: 4,
        6: 5, // Middle row
        1: 6,
        2: 7,
        3: 8, // Bottom row
      };
      gridIndex = numpadToGrid[numpadKey];
    }

    if (
      gridIndex !== null &&
      gridIndex >= 0 &&
      gridIndex < 9 &&
      squares &&
      squares[gridIndex]
    ) {
      setSelection(gridIndex);
      hitSquare(gridIndex);
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
  initializeTheme();
  resetMolePosition();

  // Set initial time and update UI
  currentTime = getInitialTime(currentDifficulty);
  updateTimerUI();

  resetGame();
  updateHighScoreDisplay();
  addEventListeners();
  addSquareListeners();

  // Initialize difficulty selection
  if (difficultyButtons && difficultyButtons.length > 0) {
    difficultyButtons.forEach(btn => btn.classList.remove('active'));
    const easyButton = document.querySelector(
      '.difficulty-btn[data-level="easy"]'
    );
    if (easyButton) {
      easyButton.classList.add('active');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initializeGame();
});
