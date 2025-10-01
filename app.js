const squares = document.querySelectorAll('.square')
const timeLeft = document.querySelector('#time-left')
const score = document.querySelector('#score')
const highScore = document.querySelector('#high-score')
const final = document.querySelector('#final-score')
const startButton = document.querySelector('#start-button')
const pauseButton = document.querySelector('#pause-button')
const restartButton = document.querySelector('#restart-button')
const resetHighScoreButton = document.querySelector('#reset-highscore-button')
const highScoreMessage = document.querySelector('#high-score-message')

// Audio for hitting mole 
const hitSound = new Audio('./audio/whack01.mp3')

let result = 0
let hit = 0
let currentTime = 30
let timer = null
let countDownTimer = null
let isGamePaused = false
let isGameRunning = false

// HIGH SCORE- from local storage 
function getHighScore() {
    return parseInt(localStorage.getItem('whackAMoleHighScore')) || 0
}

function setHighScore(score) {
    localStorage.setItem('whackAMoleHighScore', score)
    highScore.textContent = score
}

function updateHighScoreDisplay() {
    highScore.textContent = getHighScore()
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
}

// reset to 0 on clicking reset high score button 
function resetHighScore() {
    if (confirm('Are you sure you want to reset the high score?')) {
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
    currentTime = 30
    score.textContent = result
    timeLeft.textContent = currentTime
    final.innerHTML = ''
    final.style.display = 'none'
    highScoreMessage.style.display = 'none'
    
    // Remove all moles
    squares.forEach(square => {
        square.classList.remove('mole')
    })
    
    isGamePaused = false
    isGameRunning = false
    startButton.disabled = false
    pauseButton.disabled = true
    pauseButton.textContent = 'Pause'
    restartButton.disabled = true
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
    }
}

function pauseGame() {
    if (isGameRunning) {
        if (!isGamePaused) {
            clearInterval(timer)
            clearInterval(countDownTimer)
            pauseButton.textContent = 'Resume'
            isGamePaused = true
        } else {
            moveMole()
            countDownTimer = setInterval(countDown, 1000)
            pauseButton.textContent = 'Pause'
            isGamePaused = false
        }
    }
}

function randomSquare() {
    squares.forEach(square => {
        square.classList.remove('mole')
    })

    let randomSquare = squares[Math.floor(Math.random() * 9)]
    randomSquare.classList.add('mole')
    hit = randomSquare.id
}

squares.forEach(square => {
    square.addEventListener('mousedown', () => {
        if(square.id == hit && isGameRunning && !isGamePaused){
            result++
            score.textContent = result
            hit = null

            // Play hit sound from your audio file
            hitSound.currentTime = 0   // Restart if clicked rapidly
            hitSound.play().catch(e => {
                console.log('Audio play failed:', e)
                // Fallback: Create a simple beep sound if the audio file fails
                const context = new (window.AudioContext || window.webkitAudioContext)()
                const oscillator = context.createOscillator()
                const gainNode = context.createGain()
                oscillator.connect(gainNode)
                gainNode.connect(context.destination)
                oscillator.type = 'sine'
                oscillator.frequency.value = 800
                gainNode.gain.value = 0.1
                oscillator.start()
                setTimeout(() => oscillator.stop(), 100)
            })
            
            // Add hit effect
            square.style.transform = 'scale(0.9)'
            setTimeout(() => {
                square.style.transform = 'scale(1)'
            }, 100)
        }
    })
})

function moveMole() {
    if(currentTime >= 20)
        timer = setInterval(randomSquare, 500)
    else if(currentTime < 20)
        timer = setInterval(randomSquare, 100)
}

function countDown() {
    currentTime--
    timeLeft.textContent = currentTime
    
    // Change color when time is running low
    if (currentTime <= 10) {
        timeLeft.style.color = '#FF0000'
    } else {
        timeLeft.style.color = '#8B4513'
    }
    
    if(currentTime == 0) {
        clearInterval(countDownTimer)
        clearInterval(timer)
        final.innerHTML = `Your final score is: ${score.textContent}`
        final.style.display = 'block'
        checkHighScore()
        
        isGameRunning = false
        startButton.disabled = true
        pauseButton.disabled = true
        restartButton.disabled = false
    }
}

// Event listeners
startButton.addEventListener('click', startGame)
pauseButton.addEventListener('click', pauseGame)
restartButton.addEventListener('click', resetGame)
resetHighScoreButton.addEventListener('click', resetHighScore)

// Initialize
resetGame()
updateHighScoreDisplay()