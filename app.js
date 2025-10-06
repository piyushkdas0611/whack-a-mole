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

// Audio for hitting mole
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

let hitSound;

let result = 0;
let hit = 0;
let currentTime = 30;
let timer = null;
let countDownTimer = null;
let isGamePaused = false;
let isGameRunning = false;
let currentDifficulty = 'easy';
let selectedIndex = null; // For keyboard selection

// Add log function for debugging
function log(message) {
  console.log(message);
}

function initializeAudio() {
  hitSound = new Audio('audio/whack01.mp3');
}

// HIGH SCORE- from local storage
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
  log('updateHighScoreDisplay called');
  try {
    if (highScore) {
      const hs = getHighScore(currentDifficulty);
      highScore.textContent = hs;
      log(`High score displayed: ${hs}`);
    } else {
      log('Error: highScore element not found');
    }
  } catch (error) {
    log(`Error in updateHighScoreDisplay: ${error.message}`);
  }
}

function checkHighScore() {
  log('checkHighScore called');
  try {
    const currentHigh = getHighScore();
    if (result > currentHigh) {
      log(`New High Score! Old: ${currentHigh}, New: ${result}`);
      setHighScore(result);
      if (highScoreMessage) {
        highScoreMessage.textContent = '🎉 New High Score! 🎉';
        highScoreMessage.style.display = 'block';
        setTimeout(() => (highScoreMessage.style.display = 'none'), 3000);
      }
    } else {
      log(
        `No new high score. Current score: ${result}, High Score: ${currentHigh}`
      );
    }
  } catch (error) {
    log(`Error in checkHighScore: ${error.message}`);
  }
}

function resetHighScore() {
  log('resetHighScore called');
  try {
    if (confirm(`Reset ${currentDifficulty.toUpperCase()} High Score?`)) {
      log(`Resetting high score for ${currentDifficulty}`);
      setHighScore(0);
      if (highScoreMessage) {
        highScoreMessage.textContent = 'High Score Reset!';
        highScoreMessage.style.display = 'block';
        setTimeout(() => (highScoreMessage.style.display = 'none'), 2000);
      }
    }
  } catch (error) {
    log(`Error in resetHighScore: ${error.message}`);
  }
}

function updateTimerUI() {
  if (timeLeft) timeLeft.textContent = currentTime;
}

// Game Functions
function resetGame(keepTime = false) {
  log('resetGame called');
  try {
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
    if (!keepTime) {
      currentTime = getInitialTime(currentDifficulty);
      log(`getInitialTime in resetGame returned: ${currentTime}`);
    }
    updateTimerUI();
    updateHighScoreDisplay();
    log(`Game reset. Difficulty: ${currentDifficulty}, time: ${currentTime}`);
  } catch (error) {
    log(`Error in resetGame: ${error.message}`);
  }
}

function startGame() {
  log('startGame called');
  try {
    if (isGameRunning) {
      log('Game already running, ignoring startGame');
      return;
    }
    resetGame(true);
    isGameRunning = true;
    if (startButton) startButton.disabled = true;
    if (pauseButton) pauseButton.disabled = false;
    if (restartButton) restartButton.disabled = false;
    log('Starting moveMole');
    moveMole();
    log('Starting countDown timer');
    countDownTimer = setInterval(countDown, 1000);
    log('Game started successfully');
  } catch (error) {
    log(`Error in startGame: ${error.message}`);
  }
}

function pauseGame() {
  log('pauseGame called');
  try {
    if (!isGameRunning) {
      log('Game not running, ignoring pauseGame');
      return;
    }
    if (!isGamePaused) {
      clearInterval(timer);
      clearInterval(countDownTimer);
      if (pauseButton) pauseButton.textContent = 'Resume';
      isGamePaused = true;
      log('Game paused');
    } else {
      moveMole();
      countDownTimer = setInterval(countDown, 1000);
      if (pauseButton) pauseButton.textContent = 'Pause';
      isGamePaused = false;
      log('Game resumed');
    }
  } catch (error) {
    log(`Error in pauseGame: ${error.message}`);
  }
}

function randomSquare() {
  log('randomSquare called');
  try {
    if (!squares) {
      log('Error: squares not initialized');
      return;
    }
    squares.forEach(square => {
      // --- MODIFIED LINE ---
      // Remove 'mole' and 'whacked' classes to clean up previous state
      square.classList.remove('mole', 'whacked');
    });

    // Clear selection on reset
    squares.forEach(square => square.classList.remove('selected'));
    hit = null;
    selectedIndex = null;

    const randomIndex = spawnMole(9, true); // 9 squares, avoid repeats
    const randomSquare = squares[randomIndex];
    randomSquare.classList.add('mole');
    hit = randomSquare.id;
  } catch (error) {
    log(`Error in randomSquare: ${error.message}`);
  }
}

// Central hit function for mouse & keyboard
function hitSquare(index) {
  if (!isGameRunning || isGamePaused) return;
  const square = squares[index];
  if (!square) return;
  if (square.id == hit) {
    // Use enhanced scoring from gameLogic
    result = increaseScore(result, currentDifficulty, currentTime);
    if (score) score.textContent = result;
    hit = null;

    // Play hit sound
    if (hitSound) {
      hitSound.currentTime = 0; // Restart if clicked rapidly
      hitSound.play().catch(err => {
        // Handle audio play errors (browser autoplay policy)
        console.log('Audio play prevented:', err);
      });
    }

    // --- START OF NEW CODE ---
    // Add the 'whacked' class to trigger the CSS animation
    square.classList.add('whacked');
    // The 'mole' class will be removed by the next randomSquare() call
    // --- END OF NEW CODE ---
  }
}

function addSquareListeners() {
  if (!squares) return;
  squares.forEach((square, i) => {
    square.addEventListener('mousedown', () => {
      hitSquare(i);
      setSelection(i);
    });
  });
}

// Selection highlight functions
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

function clearSelection() {
  if (selectedIndex !== null && squares[selectedIndex]) {
    squares[selectedIndex].classList.remove('selected');
  }
  selectedIndex = null;
}

function moveMole() {
  log('moveMole called');
  try {
    if (timer) clearInterval(timer);
    const speed = getCurrentSpeed(currentTime, currentDifficulty);
    log(`Setting mole timer with speed: ${speed}`);
    timer = setInterval(randomSquare, speed);
  } catch (error) {
    log(`Error in moveMole: ${error.message}`);
  }
}

function countDown() {
  currentTime--;
  if (timeLeft) timeLeft.textContent = currentTime;
  // Check if speed should change (based on difficulty settings)
  if (shouldChangeSpeed(currentTime, currentDifficulty)) {
    moveMole(); // Update to faster speed
  }
  if (currentTime == 0) {
    clearInterval(countDownTimer);
    clearInterval(timer);
    if (final) final.textContent = `Your final score is : ${result}`;
    const stats = document.querySelector('.stats');
    if (stats) stats.style.display = 'flex';
    isGameRunning = false;
    if (startButton) startButton.disabled = true;
    if (pauseButton) pauseButton.disabled = true;
    if (restartButton) restartButton.disabled = false;
    // Remove any remaining moles
    if (squares) squares.forEach(square => square.classList.remove('mole'));
    checkHighScore(); // Check for high score when game ends
  }
}

const storageKey = 'theme-preference';

const onClick = () => {
  // flip current value
  theme.value = theme.value === 'light' ? 'dark' : 'light';
  setPreference();
};

const getColorPreference = () => {
  if (localStorage.getItem(storageKey)) return localStorage.getItem(storageKey);
  else
    return window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
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

const theme = {
  value: getColorPreference(),
};

// set early so no page flashes / CSS is made aware
reflectPreference();

window.onload = () => {
  // set on load so screen readers can see latest value on the button
  reflectPreference();

  // now this script can find and listen for clicks on the control
  document.querySelector('#theme-toggle').addEventListener('click', onClick);
};

// sync with system changes
if (window.matchMedia) {
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', ({ matches: isDark }) => {
      theme.value = isDark ? 'dark' : 'light';
      setPreference();
    });
}

function addEventListeners() {
  // Difficulty selection handler
  difficultyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Only allow difficulty change when game is not running
      if (!isGameRunning) {
        // Update active button styling
        difficultyButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Set new difficulty
        currentDifficulty = btn.dataset.level;
        if (currentDifficultyDisplay)
          currentDifficultyDisplay.textContent =
            currentDifficulty.charAt(0).toUpperCase() +
            currentDifficulty.slice(1);

        // Reset game with new difficulty settings
        resetGame();
        updateHighScoreDisplay();
      }
    });
  });

  // Keyboard event listener
  document.addEventListener('keydown', e => {
    // Ignore inputs
    const tag = document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;

    // Number keys 1-9 → hit square
    if (/^[1-9]$/.test(e.key)) {
      const idx = parseInt(e.key, 10) - 1;
      setSelection(idx);
      hitSquare(idx);
      e.preventDefault();
      return;
    }

    // Arrow key navigation
    const COLS = 3;
    if (selectedIndex === null) setSelection(4); // default center
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

  // Event listeners for buttons
  if (startButton) startButton.addEventListener('click', startGame);
  if (pauseButton) pauseButton.addEventListener('click', pauseGame);
  if (restartButton) restartButton.addEventListener('click', resetGame);
  if (resetHighScoreButton)
    resetHighScoreButton.addEventListener('click', resetHighScore);
}

export function initializeGame() {
  initializeElements();
  initializeAudio();
  resetMolePosition();
  resetGame();
  updateHighScoreDisplay();
  addEventListeners();
  addSquareListeners();
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initializeGame();
});
