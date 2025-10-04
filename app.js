console.log('Script started');
try {
    import { 
        difficultySettings,
        increaseScore,
        spawnMole,
        resetMolePosition,
        getCurrentSpeed,
        getInitialTime,
        shouldChangeSpeed,
        isValidDifficulty
    } from './src/gameLogic.js';
    console.log('gameLogic.js imported successfully');
} catch (error) {
    console.error(`Failed to import gameLogic.js: ${error.message}`);
}

// Utility to log
let logBuffer = '';
function log(message) {
    console.log(message);
    logBuffer += message + '\n';
}
function saveLogFile() {
    const blob = new Blob([logBuffer], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'whackamole_log.txt';
    a.click();
}

// DOM elements
let squares = null;
let timeLeft = null;
let score = null;
let highScore = null;
let final = null;
let startButton = null;
let pauseButton = null;
let restartButton = null;
let resetHighScoreButton = null;
let highScoreMessage = null;
let difficultyButtons = null;

// Initialize DOM elements
function initializeDOM() {
    log('initializeDOM called');
    try {
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

        if (!timeLeft || !squares || squares.length === 0 || !startButton || !score || !difficultyButtons || difficultyButtons.length === 0) {
            log(`Error: DOM elements missing - timeLeft=${!!timeLeft}, squares.length=${squares.length}, startButton=${!!startButton}, score=${!!score}, difficultyButtons.length=${difficultyButtons.length}`);
            return false;
        }
        log(`DOM elements initialized: timeLeft=${!!timeLeft}, squares.length=${squares.length}, startButton=${!!startButton}, score=${!!score}, difficultyButtons.length=${difficultyButtons.length}`);
        return true;
    } catch (error) {
        log(`Error in initializeDOM: ${error.message}`);
        return false;
    }
}

// Audio for hitting mole
let hitSound = null;
try {
    hitSound = new Audio('audio/whack01.mp3');
    log('Audio loaded successfully');
} catch (error) {
    log(`Error loading audio: ${error.message}`);
}

let result = 0;
let hit = null;
let currentTime = 30; // Default
let timer = null;
let countDownTimer = null;
let isGameRunning = false;
let isGamePaused = false;

// Load difficulty
let currentDifficulty = localStorage.getItem('whackAMoleCurrentDifficulty');
try {
    if (!isValidDifficulty(currentDifficulty)) {
        currentDifficulty = 'easy';
        localStorage.setItem('whackAMoleCurrentDifficulty', currentDifficulty);
        log(`Invalid or no difficulty in localStorage, defaulting to: ${currentDifficulty}`);
    } else {
        log(`Loaded difficulty from localStorage: ${currentDifficulty}`);
    }
} catch (error) {
    log(`Error checking difficulty: ${error.message}`);
    currentDifficulty = 'easy';
}

// Set initial time
try {
    currentTime = getInitialTime(currentDifficulty);
    log(`getInitialTime returned: ${currentTime} for difficulty: ${currentDifficulty}`);
    if (!currentTime || isNaN(currentTime)) {
        currentTime = 30;
        log(`getInitialTime returned invalid value, falling back to: ${currentTime}`);
    }
} catch (error) {
    log(`Error in getInitialTime: ${error.message}`);
    currentTime = 30;
}
log(`Initial currentTime set to: ${currentTime}`);

// Update timer UI
function updateTimerUI() {
    log('updateTimerUI called');
    try {
        if (timeLeft) {
            timeLeft.textContent = currentTime;
            log(`Timer UI updated to: ${currentTime}`);
        } else {
            log('Error: timeLeft not found');
        }
    } catch (error) {
        log(`Error in updateTimerUI: ${error.message}`);
    }
}

// Set active difficulty button
function setActiveDifficultyButton() {
    log('setActiveDifficultyButton called');
    try {
        if (difficultyButtons) {
            difficultyButtons.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.level === currentDifficulty);
                log(`Button ${btn.dataset.level} active: ${btn.classList.contains('active')}`);
            });
        } else {
            log('Error: difficultyButtons not initialized');
        }
    } catch (error) {
        log(`Error in setActiveDifficultyButton: ${error.message}`);
    }
}

// High Score Functions
function getHighScore(difficulty = currentDifficulty) {
    log(`getHighScore called for ${difficulty}`);
    try {
        const hs = parseInt(localStorage.getItem(`whackAMoleHighScore_${difficulty}`)) || 0;
        log(`High score: ${hs}`);
        return hs;
    } catch (error) {
        log(`Error in getHighScore: ${error.message}`);
        return 0;
    }
}

function setHighScore(value, difficulty = currentDifficulty) {
    log(`setHighScore called with value: ${value}, difficulty: ${difficulty}`);
    try {
        localStorage.setItem(`whackAMoleHighScore_${difficulty}`, value);
        if (difficulty === currentDifficulty && highScore) {
            highScore.textContent = value;
            log(`High score updated in UI: ${value}`);
        }
    } catch (error) {
        log(`Error in setHighScore: ${error.message}`);
    }
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
                highScoreMessage.textContent = "🎉 New High Score! 🎉";
                highScoreMessage.style.display = 'block';
                setTimeout(() => highScoreMessage.style.display = 'none', 3000);
            }
        } else {
            log(`No new high score. Current score: ${result}, High Score: ${currentHigh}`);
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
                highScoreMessage.textContent = "High Score Reset!";
                highScoreMessage.style.display = 'block';
                setTimeout(() => highScoreMessage.style.display = 'none', 2000);
            }
        }
    } catch (error) {
        log(`Error in resetHighScore: ${error.message}`);
    }
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
        if (squares) {
            squares.forEach(s => s.classList.remove('mole'));
            const idx = spawnMole(9, true);
            if (squares[idx]) {
                squares[idx].classList.add('mole');
                hit = squares[idx].id;
                log(`Mole spawned at square ${idx}, hit ID: ${hit}`);
            } else {
                log(`Error: squares[${idx}] is undefined`);
            }
        } else {
            log('Error: squares not initialized');
        }
    } catch (error) {
        log(`Error in randomSquare: ${error.message}`);
    }
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
    log('countDown called');
    try {
        currentTime--;
        updateTimerUI();
        if (shouldChangeSpeed(currentTime, currentDifficulty)) {
            log('Speed change triggered');
            moveMole();
        }
        if (currentTime <= 0) {
            log('Game over');
            clearInterval(timer);
            clearInterval(countDownTimer);
            if (final) final.textContent = `Your final score: ${result}`;
            checkHighScore();
            if (squares) squares.forEach(s => s.classList.remove('mole'));
            isGameRunning = false;
            if (startButton) startButton.disabled = true;
            if (pauseButton) pauseButton.disabled = true;
            if (restartButton) restartButton.disabled = false;
            saveLogFile();
        }
    } catch (error) {
        log(`Error in countDown: ${error.message}`);
    }
}

// Event Listeners for Squares
function setupSquareListeners() {
    log('setupSquareListeners called');
    try {
        if (squares) {
            squares.forEach(square => {
                square.addEventListener('mousedown', () => {
                    log(`Square ${square.id} clicked`);
                    if (square.id === hit && isGameRunning && !isGamePaused) {
                        result = increaseScore(result, currentDifficulty, currentTime);
                        if (score) score.textContent = result;
                        hit = null;
                        log(`Mole hit! Score: ${result}`);
                        if (hitSound) {
                            hitSound.currentTime = 0;
                            hitSound.play().catch(err => log(`Audio error: ${err.message}`));
                        }
                    } else {
                        log(`Missed hit. Square: ${square.id}, hit: ${hit}, isGameRunning: ${isGameRunning}, isGamePaused: ${isGamePaused}`);
                    }
                });
            });
        } else {
            log('Error: squares not initialized');
        }
    } catch (error) {
        log(`Error in setupSquareListeners: ${error.message}`);
    }
}

// Difficulty Handler
function setDifficulty(difficulty) {
    log('setDifficulty called with: ${difficulty}');
    try {
        currentDifficulty = difficulty;
        localStorage.setItem('whackAMoleCurrentDifficulty', difficulty);
        setActiveDifficultyButton();
        resetGame();
        log(`Difficulty set to: ${difficulty}, time: ${currentTime}`);
    } catch (error) {
        log(`Error in setDifficulty: ${error.message}`);
    }
}

// Event Listeners
function setupEventListeners() {
    log('setupEventListeners called');
    try {
        if (startButton) {
            startButton.addEventListener('click', () => {
                log('Start button clicked');
                startGame();
            });
        } else {
            log('Error: startButton not found');
        }
        if (pauseButton) pauseButton.addEventListener('click', pauseGame);
        if (restartButton) restartButton.addEventListener('click', () => {
            log('Restart button clicked');
            resetGame();
        });
        if (resetHighScoreButton) resetHighScoreButton.addEventListener('click', resetHighScore);
        if (difficultyButtons) {
            difficultyButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    if (!isGameRunning) {
                        log(`Difficulty button clicked: ${btn.dataset.level}`);
                        setDifficulty(btn.dataset.level);
                    } else {
                        log('Game running, ignoring difficulty change');
                    }
                });
            });
        } else {
            log('Error: difficultyButtons not found');
        }
        setupSquareListeners();
    } catch (error) {
        log(`Error in setupEventListeners: ${error.message}`);
    }
}

// Initialization
try {
    document.addEventListener('DOMContentLoaded', () => {
        log('DOMContentLoaded fired');
        if (initializeDOM()) {
            log('DOM initialized successfully');
            setActiveDifficultyButton();
            updateTimerUI();
            updateHighScoreDisplay();
            setupEventListeners();
            log(`Initialization complete! Difficulty: ${currentDifficulty}, time: ${currentTime}`);
        } else {
            log('Initialization failed due to missing DOM elements');
        }
    });
} catch (error) {
    log(`Error in initialization: ${error.message}`);
}