const squares = document.querySelectorAll('.square')
const mole = document.querySelector('.mole')
const timeLeft = document.querySelector('#time-left')
const score = document.querySelector('#score')
const final = document.querySelector('#final-score')
const startButton = document.querySelector('#start-button')
const pauseButton = document.querySelector('#pause-button')
const restartButton = document.querySelector('#restart-button')

let result = 0
let hit = 0
let currentTime = 30
let timer = null
let countDownTimer = null
let isGamePaused = false
let isGameRunning = false

function resetGame() {
    // Clear all running timers
    clearInterval(timer)
    clearInterval(countDownTimer)
    
    // Reset all game variables
    result = 0
    currentTime = 30
    score.textContent = result
    timeLeft.textContent = currentTime
    final.innerHTML = ''
    document.querySelector('.stats').style.display = 'block'
    squares.forEach(square => square.classList.remove('mole'))
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
            // Pause
            clearInterval(timer)
            clearInterval(countDownTimer)
            pauseButton.textContent = 'Resume'
            isGamePaused = true
        } else {
            // Resume
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
    if(currentTime == 0) {
        clearInterval(countDownTimer)
        clearInterval(timer)
        final.innerHTML = `Your final score is : ${score.textContent}`
        document.querySelector('.stats').style.display = 'none'
        isGameRunning = false
        startButton.disabled = true
        pauseButton.disabled = true
        restartButton.disabled = false
    }
}

// Event listeners for buttons
startButton.addEventListener('click', startGame)
pauseButton.addEventListener('click', pauseGame)
restartButton.addEventListener('click', resetGame)

// Initialize game state
resetGame()
