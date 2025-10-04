'use client'
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

let squares, mole, timeLeft, score, highScore, final, startButton, pauseButton, restartButton, resetHighScoreButton, highScoreMessage, difficultyButtons, currentDifficultyDisplay;

function initializeElements() {
    squares = document.querySelectorAll('.square')
    mole = document.querySelector('.mole')
    timeLeft = document.querySelector('#time-left')
    score = document.querySelector('#score')
    highScore = document.querySelector('#high-score')
    final = document.querySelector('#final-score')
    startButton = document.querySelector('#start-button')
    pauseButton = document.querySelector('#pause-button')
    restartButton = document.querySelector('#restart-button')
    resetHighScoreButton = document.querySelector('#reset-highscore-button')
    highScoreMessage = document.querySelector('#high-score-message')
    difficultyButtons = document.querySelectorAll('.difficulty-btn')
    currentDifficultyDisplay = document.querySelector('#current-difficulty')
}

let hitSound;

let result = 0
let hit = 0
let currentTime = 30
let timer = null
let countDownTimer = null
let isGamePaused = false
let isGameRunning = false
let currentDifficulty = 'easy'

function initializeAudio() {
    hitSound = new Audio('audio/whack01.mp3')
}

// HIGH SCORE- from local storage 
function getHighScore() {
    return parseInt(localStorage.getItem(`whackAMoleHighScore_${currentDifficulty}`)) || 0
}

function setHighScore(scoreValue) {
    localStorage.setItem(`whackAMoleHighScore_${currentDifficulty}`, scoreValue)
    if (highScore) highScore.textContent = scoreValue
}

function updateHighScoreDisplay() {
    if (highScore) highScore.textContent = getHighScore()
}

// compare current score with high score 
function checkHighScore() {
    const currentHigh = getHighScore()
    if (result > currentHigh) {
        setHighScore(result)
        highScoreMessage.textContent = '🎉 New High Score! 🎉'
        highScoreMessage.style.display = 'block'
        setTimeout(() => {
            highScoreMessage.style.display = 'none'
        }, 3000)
    }
    else
    {
        document.querySelector('.stats').style.display = 'block'
    }
}

// reset to 0 on clicking reset high score button 
function resetHighScore() {
     if (confirm(`Are you sure you want to reset the ${currentDifficulty.toUpperCase()} high score?`)) {
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
    if (score) score.textContent = result
    if (timeLeft) timeLeft.textContent = currentTime
    if (final) final.innerHTML = ''
    if (highScoreMessage) highScoreMessage.style.display = 'none'
    const stats = document.querySelector('.stats')
    if (stats) stats.style.display = 'flex'
    if (squares) squares.forEach(square => square.classList.remove('mole'))
    resetMolePosition()
    isGamePaused = false
    isGameRunning = false
    if (startButton) startButton.disabled = false
    if (pauseButton) {
        pauseButton.disabled = true
        pauseButton.textContent = 'Pause'
    }
    if (restartButton) restartButton.disabled = true
}

function startGame() {
    if (!isGameRunning) {
        resetGame()
        isGameRunning = true
        if (startButton) startButton.disabled = true
        if (pauseButton) pauseButton.disabled = false
        if (restartButton) restartButton.disabled = false
        moveMole()
        countDownTimer = setInterval(countDown, 1000)
    }
}

function pauseGame() {
    if (isGameRunning) {
        if (!isGamePaused) {
            clearInterval(timer)
            clearInterval(countDownTimer)
            if (pauseButton) pauseButton.textContent = 'Resume'
            isGamePaused = true

        } else {
            moveMole()
            countDownTimer = setInterval(countDown, 1000)
            if (pauseButton) pauseButton.textContent = 'Pause'
            isGamePaused = false

        }
    }
}

function randomSquare() {
    if (!squares) return
    squares.forEach(square => {
        square.classList.remove('mole')
    })

    const randomIndex = spawnMole(9, true) // 9 squares, avoid repeats
    const randomSquare = squares[randomIndex]
    randomSquare.classList.add('mole')
    hit = randomSquare.id
}

function addSquareListeners() {
    if (!squares) return
    squares.forEach(square => {
        square.addEventListener('mousedown', () => {
            if(square.id == hit && isGameRunning && !isGamePaused){
               // Use enhanced scoring from gameLogic
                result = increaseScore(result, currentDifficulty, currentTime)
                if (score) score.textContent = result
                hit = null

                // Play hit sound
                hitSound.currentTime = 0   // Restart if clicked rapidly
                hitSound.play().catch(err => {
                    // Handle audio play errors (browser autoplay policy)
                    console.log('Audio play prevented:', err)
                })
            }
        })
    })
}

function moveMole() {
    clearInterval(timer)
    const speed = getCurrentSpeed(currentTime, currentDifficulty)
    timer = setInterval(randomSquare, speed)
}

function countDown() {
    currentTime--
    if (timeLeft) timeLeft.textContent = currentTime
    // Check if speed should change (based on difficulty settings)
    if (shouldChangeSpeed(currentTime, currentDifficulty)) {
        moveMole() // Update to faster speed
    }
    if(currentTime == 0) {
        clearInterval(countDownTimer)
        clearInterval(timer)
        if (final) final.textContent = `Your final score is : ${result}`
        const stats = document.querySelector('.stats')
        if (stats) stats.style.display = 'flex'
        isGameRunning = false
        if (startButton) startButton.disabled = true
        if (pauseButton) pauseButton.disabled = true
        if (restartButton) restartButton.disabled = false
         // Remove any remaining moles
        if (squares) squares.forEach(square => square.classList.remove('mole'))
    }
}
function addEventListeners() {
    // Difficulty selection handler
    if (!difficultyButtons) return
    difficultyButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Only allow difficulty change when game is not running
            if (!isGameRunning) {
                // Update active button styling
                difficultyButtons.forEach(b => b.classList.remove('active'))
                btn.classList.add('active')

                // Set new difficulty
                currentDifficulty = btn.dataset.level
                if (currentDifficultyDisplay) currentDifficultyDisplay.textContent = currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1)

                // Reset game with new difficulty settings
                resetGame()
                updateHighScoreDisplay()
            }
        })
    })
    // Event listeners
    if (startButton) startButton.addEventListener('click', startGame)
    if (pauseButton) pauseButton.addEventListener('click', pauseGame)
    if (restartButton) restartButton.addEventListener('click', resetGame)
    if (resetHighScoreButton) resetHighScoreButton.addEventListener('click', resetHighScore)
}

export function initializeGame() {
    initializeElements()
    initializeAudio()
    resetMolePosition()
    resetGame()
    updateHighScoreDisplay()
    addEventListeners()
    addSquareListeners()
}
