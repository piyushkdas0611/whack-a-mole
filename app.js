// Import game logic functions
import { 
    difficultySettings,
    increaseScore,
    spawnMole,
    resetMolePosition,
    getCurrentSpeed,
    getInitialTime,
    shouldChangeSpeed
} from './src/gameLogic.js';

// Utility to log and save messages to file
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
const squares = document.querySelectorAll('.square')
const mole = document.querySelector('.mole')
const timeLeft = document.querySelector('#time-left')
const score = document.querySelector('#score')
const highScore = document.querySelector('#high-score')
const final = document.querySelector('#final-score')
const startButton = document.querySelector('#start-button')
const pauseButton = document.querySelector('#pause-button')
const restartButton = document.querySelector('#restart-button')
const resetHighScoreButton = document.querySelector('#reset-highscore-button')
const highScoreMessage = document.querySelector('#high-score-message')
const difficultyButtons = document.querySelectorAll('.difficulty-btn')
const currentDifficultyDisplay = document.querySelector('#current-difficulty')

// Audio for hitting mole
const hitSound = new Audio('audio/whack01.mp3')  

let result = 0
let hit = 0
let currentTime = 30
let timer = null
let countDownTimer = null
let isGamePaused = false
let isGameRunning = false
let currentDifficulty = 'easy'

// HIGH SCORE- from local storage 
function getHighScore() {
    const hs = parseInt(localStorage.getItem(`whackAMoleHighScore_${currentDifficulty}`)) || 0
    log(`getHighScore called. Difficulty: ${currentDifficulty}, value: ${hs}`)
    return hs
}

function setHighScore(scoreValue) {
    log(`setHighScore called. Setting ${scoreValue} for difficulty ${currentDifficulty}`)
    localStorage.setItem(`whackAMoleHighScore_${currentDifficulty}`, scoreValue)
    highScore.textContent = scoreValue
}

function updateHighScoreDisplay() {
    const hs = getHighScore()
    highScore.textContent = hs
    log(`updateHighScoreDisplay called. Displaying: ${hs}`)
}

// Compare current score with high score 
function checkHighScore() {
    const currentHigh = getHighScore()
    if (result > currentHigh) {
        log(`New High Score! Old: ${currentHigh}, New: ${result}`)
        setHighScore(result)
        highScoreMessage.textContent = '🎉 New High Score! 🎉'
        highScoreMessage.style.display = 'block'
        setTimeout(() => {
            highScoreMessage.style.display = 'none'
        }, 3000)
    } else {
        log(`No new high score. Current score: ${result}, High Score: ${currentHigh}`)
        document.querySelector('.stats').style.display = 'block'
    }
}

// reset to 0 on clicking reset high score button 
function resetHighScore() {
    if (confirm(`Are you sure you want to reset the ${currentDifficulty.toUpperCase()} high score?`)) {
        log(`Resetting high score for ${currentDifficulty}`)
        setHighScore(0)
        highScoreMessage.textContent = 'High Score Reset!'
        highScoreMessage.style.display = 'block'
        setTimeout(() => {
            highScoreMessage.style.display = 'none'
        }, 2000)
    }
}

function resetGame() {
    clearInterval(timer)
    clearInterval(countDownTimer)
    
    result = 0
    currentTime = getInitialTime(currentDifficulty)
    score.textContent = result
    timeLeft.textContent = currentTime
    final.innerHTML = ''
    highScoreMessage.style.display = 'none'
    document.querySelector('.stats').style.display = 'flex'
    squares.forEach(square => square.classList.remove('mole'))
    resetMolePosition()
    isGamePaused = false
    isGameRunning = false
    startButton.disabled = false
    pauseButton.disabled = true
    pauseButton.textContent = 'Pause'
    restartButton.disabled = true
    log(`Game reset. Difficulty: ${currentDifficulty}`)
    updateHighScoreDisplay()
}

function startGame() {
    if (!isGameRunning) {
        resetGame()
        isGameRunning = true
        startButton.disabled = true
        pauseButton.disabled = false
        restartButton.disabled = false
        moveMole()
        countDownTimer = setInterval(countDown, 1000)
        log("Game started")
    }
}

function pauseGame() {
    if (isGameRunning) {
        if (!isGamePaused) {
            clearInterval(timer)
            clearInterval(countDownTimer)
            pauseButton.textContent = 'Resume'
            isGamePaused = true
            log("Game paused")
        } else {
            moveMole()
            countDownTimer = setInterval(countDown, 1000)
            pauseButton.textContent = 'Pause'
            isGamePaused = false
            log("Game resumed")
        }
    }
}

function randomSquare() {
    squares.forEach(square => {
        square.classList.remove('mole')
    })

    const randomIndex = spawnMole(9, true) // 9 squares, avoid repeats
    const randomSquare = squares[randomIndex]
    randomSquare.classList.add('mole')
    hit = randomSquare.id
}

squares.forEach(square => {
    square.addEventListener('mousedown', () => {
        if(square.id == hit && isGameRunning && !isGamePaused){
            result = increaseScore(result, currentDifficulty, currentTime)
            score.textContent = result
            hit = null
            log(`Mole hit! Current score: ${result}`)

            hitSound.currentTime = 0
            hitSound.play().catch(err => {
                log('Audio play prevented: ' + err)
            })
        }
    })
})

function moveMole() {
    clearInterval(timer)
    const speed = getCurrentSpeed(currentTime, currentDifficulty)
    timer = setInterval(randomSquare, speed)
}

function countDown() {
    currentTime--
    timeLeft.textContent = currentTime
    if (shouldChangeSpeed(currentTime, currentDifficulty)) {
        moveMole()
    }
    if(currentTime == 0) {
        clearInterval(countDownTimer)
        clearInterval(timer)
        final.textContent = `Your final score is : ${result}`
        log(`Game over! Final score: ${result}`)
        checkHighScore()
        document.querySelector('.stats').style.display = 'flex'
        isGameRunning = false
        startButton.disabled = true
        pauseButton.disabled = true
        restartButton.disabled = false
        squares.forEach(square => square.classList.remove('mole'))

        // Save log file automatically at game over
        saveLogFile()
    }
}

// Difficulty selection handler
difficultyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        if (!isGameRunning) {
            difficultyButtons.forEach(b => b.classList.remove('active'))
            btn.classList.add('active')
            currentDifficulty = btn.dataset.level
            currentDifficultyDisplay.textContent = currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1)
            resetGame()
        }
    })
})

// Event listeners
startButton.addEventListener('click', startGame)
pauseButton.addEventListener('click', pauseGame)
restartButton.addEventListener('click', resetGame)
resetHighScoreButton.addEventListener('click', resetHighScore)

// Initialize
resetMolePosition()
resetGame()
updateHighScoreDisplay()
log("App.js loaded!")
