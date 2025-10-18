// Import game logic functions
import {
  difficultySettings,
  increaseScore,
  spawnMultipleMoles, // Using this now
  resetMolePosition,
  getCurrentSpeed,
  getInitialTime,
  shouldChangeSpeed,
} from './src/gameLogic.js';

// Import audio management
import { getAudioManager, updateVolumeUI, updateMuteUI } from './src/audioControls.js';

// Initialize audio manager
const audioManager = getAudioManager();

// All DOM elements are declared here
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

// Initializes all the DOM element variables
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
  volumeSlider = document.querySelector('#volume-slider');
  volumeValue = document.querySelector('#volume-value');
  muteButton = document.querySelector('#mute-button');
}

// All global state variables are declared here
let result = 0;
let activeMoles = new Set();
let currentTime = 30;
let selectedIndex = null;
let timer = null;
let countDownTimer = null;
let isGamePaused = false;
let isGameRunning = false;
let currentDifficulty = 'easy';

// FIX #2: Declaring missing global variables
let scores = { 1: 0, 2: 0 };
let multiplayer = false;
// The 'hit' variable is no longer needed with the new multi-mole logic

// ===================================
//
// All function definitions follow
//
// ===================================

function initializeAudio() {
  audioManager.loadSound('hit', 'audio/whack01.mp3');
  updateVolumeUI(audioManager.getVolume());
  updateMuteUI(audioManager.getMuted());
}

function getHighScore() {
  return parseInt(localStorage.getItem(`whackAMoleHighScore_${currentDifficulty}`)) || 0;
}

function setHighScore(scoreValue) {
  localStorage.setItem(`whackAMoleHighScore_${currentDifficulty}`, scoreValue);
  if (highScore) highScore.textContent = scoreValue;
}

function updateHighScoreDisplay() {
    if (highScore) {
      highScore.textContent = getHighScore();
    }
}

function checkHighScore() {
    const currentHigh = getHighScore();
    if (result > currentHigh) {
      setHighScore(result);
      if (highScoreMessage) {
        highScoreMessage.textContent = '🎉 New High Score! 🎉';
        highScoreMessage.style.display = 'block';
        setTimeout(() => (highScoreMessage.style.display = 'none'), 3000);
      }
    }
}

function resetHighScore() {
  if (confirm(`Reset ${currentDifficulty.toUpperCase()} High Score?`)) {
    setHighScore(0);
  }
}

function updateTimerUI() {
  if (timeLeft) {
    timeLeft.textContent = currentTime;
  }
}

function resetGame(keepTime = false) {
  clearInterval(timer);
  clearInterval(countDownTimer);
  result = 0;
  if (score) score.textContent = result;
  if (final) final.textContent = '';
  if (squares) squares.forEach(s => s.classList.remove('mole', 'whacked', 'selected'));
  activeMoles.clear();
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

// REFACTOR: This function now supports multiple moles
function randomSquare() {
  squares.forEach(square => square.classList.remove('mole', 'whacked'));
  activeMoles.clear();

  const moleCount = difficultySettings[currentDifficulty]?.moleCount || 1;
  const newMoleIndexes = spawnMultipleMoles(9, moleCount, true);

  newMoleIndexes.forEach(index => {
    const moleSquare = squares[index];
    if (moleSquare) {
      moleSquare.classList.add('mole');
      activeMoles.add(moleSquare.id);
    }
  });
}

// REFACTOR: This function now supports multiple moles
function hitSquare(index) {
  if (!isGameRunning || isGamePaused || index === null) return;
  const square = squares[index];
  if (!square) return;

  if (activeMoles.has(square.id)) {
    result = increaseScore(result, currentDifficulty, currentTime);
    if (score) score.textContent = result;

    activeMoles.delete(square.id);
    square.classList.remove('mole');
    square.classList.add('whacked');

    audioManager.playSound('hit');
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

function setSelection(i) {
  if (selectedIndex !== null && squares[selectedIndex]) {
    squares[selectedIndex].classList.remove('selected');
  }
  selectedIndex = i;
  if (squares[selectedIndex]) {
    squares[selectedIndex].classList.add('selected');
    squares[selectedIndex].focus({ preventScroll: true });
    if (srAnnouncer) srAnnouncer.textContent = `Selected Hole ${selectedIndex + 1}`;
  }
}

function moveMole() {
  if (timer) clearInterval(timer);
  const speed = getCurrentSpeed(currentTime, currentDifficulty);
  timer = setInterval(randomSquare, speed);
}

function countDown() {
  currentTime--;
  if (timeLeft) timeLeft.textContent = currentTime;
  if (shouldChangeSpeed(currentTime, currentDifficulty)) {
    moveMole();
  }
  if (currentTime === 0) {
    clearInterval(countDownTimer);
    clearInterval(timer);
    isGameRunning = false;
    if (final) final.textContent = `Your final score is: ${result}`;
    if (pauseButton) pauseButton.disabled = true;
    if (restartButton) restartButton.disabled = false;
    squares.forEach(square => square.classList.remove('mole'));
    checkHighScore();
  }
}

function setupAudioControls() {
  if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
      const volume = parseFloat(e.target.value);
      audioManager.setVolume(volume);
      updateVolumeUI(volume);
    });
  }
  if (muteButton) {
    muteButton.addEventListener('click', () => {
      const isMuted = audioManager.toggleMute();
      updateMuteUI(isMuted);
    });
  }
}

// FIX #1: Added the missing function wrapper
function addEventListeners() {
  if (difficultyButtons) {
    difficultyButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        if (isGameRunning) return;
        difficultyButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentDifficulty = btn.dataset.level;
        if (currentDifficultyDisplay) {
          currentDifficultyDisplay.textContent = currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1);
        }
        resetGame();
        updateHighScoreDisplay();
      });
    });
  }

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
        break;
      case 'ArrowRight':
        col = Math.min(COLS - 1, col + 1);
        break;
      case 'ArrowUp':
        row = Math.max(0, row - 1);
        break;
      case 'ArrowDown':
        row = Math.min(2, row + 1);
        break;
      case 'Enter':
      case ' ':
        hitSquare(selectedIndex);
        e.preventDefault();
        return; // Return to avoid running setSelection again
      default:
        return; // Ignore other keys
    }
    setSelection(row * COLS + col);
    e.preventDefault();
  });

  if (startButton) startButton.addEventListener('click', startGame);
  if (pauseButton) pauseButton.addEventListener('click', pauseGame);
  if (restartButton) restartButton.addEventListener('click', resetGame);
  if (resetHighScoreButton) resetHighScoreButton.addEventListener('click', resetHighScore);

  const multiplayerToggle = document.getElementById('multiplayer-toggle');
  if (multiplayerToggle) {
    multiplayerToggle.addEventListener('click', () => {
      multiplayer = !multiplayer;
      // Reset scores when toggling mode
      resetGame();
      alert(multiplayer ? '🎮 Multiplayer Mode On' : '🎯 Single Player Mode');
    });
  }
}

export function initializeGame() {
  initializeElements();
  initializeAudio();
  setupAudioControls();
  resetGame(); // Simplified initialization, resetGame handles most setup
  addEventListeners();
  addSquareListeners();
}

document.addEventListener('DOMContentLoaded', () => {
  initializeGame();
});