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
const srAnnouncer = document.getElementById('sr-announcer')

let result = 0
let hit = 0
let currentTime = 30
let timer = null
let countDownTimer = null
let isGamePaused = false
let isGameRunning = false
let selectedIndex = null // For keyboard selection

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
    highScoreMessage.style.display = 'none'
    document.querySelector('.stats').style.display = 'block'
    squares.forEach(square => square.classList.remove('mole'))

      // --- ADDITION: clear selection on reset
    squares.forEach(square => square.classList.remove('selected')) 
    hit = null 
    selectedIndex = null 

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

// --- ADDITION: central hit function for mouse & keyboard
function hitSquare(index) { // Add
    if (!isGameRunning || isGamePaused) return
    const square = squares[index]
    if (!square) return
    if (square.id == hit) {
        result++
        score.textContent = result
        hit = null
    }
}

// --- Mouse click updated to use central hit
squares.forEach((square, i) => {
    square.addEventListener('mousedown', () => {
        hitSquare(i) // changed from original direct logic
        setSelection(i) // ADD: highlight clicked square
    })
})

squares.forEach(square => {
    square.addEventListener('mousedown', () => {
        if(square.id == hit && isGameRunning && !isGamePaused){
            result++
            score.textContent = result
            hit = null
        }
    })
})


// --- ADDITION: selection highlight functions
function setSelection(i) { // Add
    if (selectedIndex !== null && squares[selectedIndex]) {
        squares[selectedIndex].classList.remove('selected')
    }
    selectedIndex = i
    if (squares[selectedIndex]) {
        squares[selectedIndex].classList.add('selected')
        squares[selectedIndex].focus({ preventScroll: true })
        if (srAnnouncer) srAnnouncer.textContent = `Selected Hole ${selectedIndex + 1}`
    }
}

function clearSelection() { // Add
    if (selectedIndex !== null && squares[selectedIndex]) {
        squares[selectedIndex].classList.remove('selected')
    }
    selectedIndex = null
}

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
        checkHighScore()
        
        document.querySelector('.stats').style.display = 'none'
        isGameRunning = false
        startButton.disabled = true
        pauseButton.disabled = true
        restartButton.disabled = false
    }
}

// --- ADDITION: keyboard event listener
document.addEventListener('keydown', (e) => { // Add
    // Ignore inputs
    const tag = document.activeElement.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA') return

    // Number keys 1-9 → hit square
    if (/^[1-9]$/.test(e.key)) {
        const idx = parseInt(e.key, 10) - 1
        setSelection(idx)
        hitSquare(idx)
        e.preventDefault()
        return
    }

    // Arrow key navigation
    const COLS = 3
    if (selectedIndex === null) setSelection(4) // default center
    let row = Math.floor(selectedIndex / COLS)
    let col = selectedIndex % COLS

    switch(e.key) {
        case 'ArrowLeft':
            col = Math.max(0, col -1)
            setSelection(row*COLS + col)
            e.preventDefault()
            break
        case 'ArrowRight':
            col = Math.min(COLS -1, col +1)
            setSelection(row*COLS + col)
            e.preventDefault()
            break
        case 'ArrowUp':
            row = Math.max(0, row -1)
            setSelection(row*COLS + col)
            e.preventDefault()
            break
        case 'ArrowDown':
            row = Math.min(2, row +1)
            setSelection(row*COLS + col)
            e.preventDefault()
            break
        case 'Enter':
        case ' ':
            hitSquare(selectedIndex)
            e.preventDefault()
            break
    }
})

// Event listeners
startButton.addEventListener('click', startGame)
pauseButton.addEventListener('click', pauseGame)
restartButton.addEventListener('click', resetGame)
resetHighScoreButton.addEventListener('click', resetHighScore)

// Initialize
resetGame()
updateHighScoreDisplay() 
