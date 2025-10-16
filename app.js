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

// Import audio management
import { getAudioManager, updateVolumeUI, updateMuteUI } from './src/audioControls.js';

// Initialize audio manager
const audioManager = getAudioManager();

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
  srAnnouncer,
  volumeSlider,
  volumeValue,
  muteButton;

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
  
  // Audio control elements
  volumeSlider = document.querySelector('#volume-slider');
  volumeValue = document.querySelector('#volume-value');
  muteButton = document.querySelector('#mute-button');
}

let result = 0;
let activeMoles = new Set(); // Track multiple active moles by their square IDs
let currentTime = 30;
let timer = null;
let countDownTimer = null;
let isGamePaused = false;
let isGameRunning = false;
let currentDifficulty = 'easy';
let selectedIndex = null;

// Add log function for debugging
function log(message) {
  console.log(message);
}

function initializeAudio() {
  // Load sound effects
  audioManager.loadSound('hit', 'audio/whack01.mp3');
  
  // Initialize UI with saved settings
  updateVolumeUI(audioManager.getVolume());
  updateMuteUI(audioManager.getMuted());
}

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

    squares.forEach(square => square.classList.remove('selected'));
    hit = null;
    selectedIndex = null;

    const randomIndex = spawnMole(9, true);
    const randomSquare = squares[randomIndex];
    randomSquare.classList.add('mole');
    hit = randomSquare.id;
  } catch (error) {
    log(`Error in randomSquare: ${error.message}`);
  }
}

// ======================
// 🧍 HIT DETECTION
// ======================
function hitSquare(index) {
  if (!isGameRunning || isGamePaused) return;
  const square = squares[index];
  if (!square) return;
  if (square.id == hit) {
    result = increaseScore(result, currentDifficulty, currentTime);
    if (score) score.textContent = result;
    hit = null;

    // Play hit sound using audio manager
    audioManager.playSound('hit');
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
  if (timeLeft) timeLeft.textContent = currentTime;
  if (shouldChangeSpeed(currentTime, currentDifficulty)) {
    moveMole();
  }
  if (currentTime == 0) {
    clearInterval(countDownTimer);
    clearInterval(timer);
    isGameRunning = false;
    if (pauseButton) pauseButton.disabled = true;
    if (restartButton) restartButton.disabled = false;
    if (squares) squares.forEach(square => square.classList.remove('mole'));
    checkHighScore();
  }
}

function setupAudioControls() {
  // Volume slider
  if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
      const volume = parseFloat(e.target.value);
      audioManager.setVolume(volume);
      updateVolumeUI(volume);
    });
  }

  // Mute button
  if (muteButton) {
    muteButton.addEventListener('click', () => {
      const isMuted = audioManager.toggleMute();
      updateMuteUI(isMuted);
    });
  }
}

function addEventListeners() {
  // Difficulty selection handler
  if (difficultyButtons) {
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
    const tag = document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;

    if (/^[1-9]$/.test(e.key)) {
      const idx = parseInt(e.key, 10) - 1;
      setSelection(idx);
      hitSquare(idx);
      e.preventDefault();
      return;
    }

    const COLS = 3;
    if (selectedIndex === null) setSelection(4);
    let row = Math.floor(selectedIndex / COLS);
    let col = selectedIndex % COLS;

    switch (e.key) {
      case 'ArrowLeft':
        col = Math.max(0, col - 1);
        setSelection(row * COLS + col);
        e.preventDefault();
        break;
      case 'ArrowRight':
        col = Math.min(COLS - 1, col + 1);
        setSelection(row * COLS + col);
        e.preventDefault();
        break;
      case 'ArrowUp':
        row = Math.max(0, row - 1);
        setSelection(row * COLS + col);
        e.preventDefault();
        break;
      case 'ArrowDown':
        row = Math.min(2, row + 1);
        setSelection(row * COLS + col);
        e.preventDefault();
        break;
      case 'Enter':
      case ' ':
        hitSquare(selectedIndex);
        e.preventDefault();
        break;
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
  setupAudioControls();
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