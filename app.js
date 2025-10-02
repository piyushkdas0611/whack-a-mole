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
const themeToggleButton = document.querySelector('#theme-toggle-button')
const soundToggleButton = document.querySelector('#sound-toggle-button')
const highScoreMessage = document.querySelector('#high-score-message')

// Audio System
const sounds = {
    hit: new Audio('audio/whack01.mp3'),
    gameStart: null, // Will create programmatically  
    gameOver: null, // Will create programmatically
    backgroundMusic: null // Will create programmatically
}

// Sound settings
let soundEnabled = true
let musicEnabled = true

// Initialize Web Audio Context for generated sounds
let audioContext = null
try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
} catch (e) {
    console.log('Web Audio not supported')
}

// Generate simple tones for sound effects
function createTone(frequency, duration, type = 'sine') {
    if (!audioContext) return null
    
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
    oscillator.type = type
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)
    
    return { oscillator, gainNode, duration }
}

// Play sound effects
function playSound(soundName) {
    if (!soundEnabled) return
    
    if (soundName === 'hit' && sounds.hit) {
        sounds.hit.currentTime = 0
        sounds.hit.volume = 0.3
        sounds.hit.play().catch(e => console.log('Hit sound failed:', e))
    } else if (soundName === 'gameStart') {
        // Create game start sound (ascending tones)
        if (audioContext) {
            [220, 330, 440].forEach((freq, index) => {
                const tone = createTone(freq, 0.2, 'square')
                if (tone) {
                    const startTime = audioContext.currentTime + (index * 0.1)
                    tone.oscillator.start(startTime)
                    tone.oscillator.stop(startTime + tone.duration)
                }
            })
        }
    } else if (soundName === 'gameOver') {
        // Create game over sound (descending tones)
        if (audioContext) {
            [440, 330, 220, 110].forEach((freq, index) => {
                const tone = createTone(freq, 0.3, 'triangle')
                if (tone) {
                    const startTime = audioContext.currentTime + (index * 0.2)
                    tone.oscillator.start(startTime)
                    tone.oscillator.stop(startTime + tone.duration)
                }
            })
        }
    }
}

// Background music management
function startBackgroundMusic() {
    if (!musicEnabled || !audioContext) return
    // Simple background music loop with gentle tones
    // This is a basic example - in real projects you'd load an audio file
    console.log('Background music would start here')
}

function stopBackgroundMusic() {
    console.log('Background music would stop here')
}

// Sound control functions
function toggleSound() {
    soundEnabled = !soundEnabled
    updateSoundButton()
}

function updateSoundButton() {
    const soundButton = document.querySelector('#sound-toggle-button')
    if (soundButton) {
        soundButton.textContent = soundEnabled ? '🔊 Sound On' : '🔇 Sound Off'
    }
}

let result = 0
let hit = 0
let currentTime = 30
let timer = null
let countDownTimer = null
let isGamePaused = false
let isGameRunning = false

// Mobile optimization: Prevent zoom and improve performance
document.addEventListener('gesturestart', function(e) {
    e.preventDefault()
})
document.addEventListener('gesturechange', function(e) {
    e.preventDefault()
})
document.addEventListener('gestureend', function(e) {
    e.preventDefault()
})

// Prevent double-tap zoom
let lastTouchEnd = 0
document.addEventListener('touchend', function(event) {
    const now = (new Date()).getTime()
    if (now - lastTouchEnd <= 300) {
        event.preventDefault()
    }
    lastTouchEnd = now
}, false)

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

// THEME MANAGEMENT - Dark/Light Mode
function getTheme() {
    return localStorage.getItem('whackAMoleTheme') || 'light'
}

function setTheme(theme) {
    localStorage.setItem('whackAMoleTheme', theme)
    document.documentElement.setAttribute('data-theme', theme)
    updateThemeButton(theme)
}

function updateThemeButton(theme) {
    if (theme === 'dark') {
        themeToggleButton.textContent = '☀️ Light Mode'
    } else {
        themeToggleButton.textContent = '🌙 Dark Mode'
    }
}

function toggleTheme() {
    const currentTheme = getTheme()
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
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
        
        // Play game start sound
        playSound('gameStart')
        startBackgroundMusic()
        
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
    // Add disappearing animation to current mole before removing
    squares.forEach(square => {
        if (square.classList.contains('mole')) {
            square.classList.add('disappearing')
            // Remove mole class after animation completes
            setTimeout(() => {
                square.classList.remove('mole', 'disappearing')
            }, 200) // Match the disappear animation duration
        } else {
            square.classList.remove('mole', 'disappearing')
        }
    })

    // Add new mole after a short delay to allow disappearing animation
    setTimeout(() => {
        let randomSquare = squares[Math.floor(Math.random() * 9)]
        randomSquare.classList.add('mole')
        hit = randomSquare.id
    }, 100) // Short delay for smooth transition
}

// Function to handle both mouse and touch events
function handleHit(square) {
    if(square.id == hit && isGameRunning && !isGamePaused){
        result++
        score.textContent = result
        hit = null

        // Add hit animation effects
        square.classList.add('disappearing', 'hit-effect')
        setTimeout(() => {
            square.classList.remove('mole', 'disappearing', 'hit-effect')
        }, 300)

        // Play hit sound
        playSound('hit')
    }
}

squares.forEach(square => {
    // Add mouse support
    square.addEventListener('mousedown', (e) => {
        e.preventDefault() // Prevent default behavior
        handleHit(square)
    })
    
    // Add touch support for mobile devices
    square.addEventListener('touchstart', (e) => {
        e.preventDefault() // Prevent scrolling and other touch behaviors
        handleHit(square)
    })
    
    // Prevent context menu on long press
    square.addEventListener('contextmenu', (e) => {
        e.preventDefault()
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
        checkHighScore()
        
        // Play game over sound and stop music
        playSound('gameOver')
        stopBackgroundMusic()
        
        document.querySelector('.stats').style.display = 'none'
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
themeToggleButton.addEventListener('click', toggleTheme)
soundToggleButton.addEventListener('click', toggleSound)

// Initialize
resetGame()
updateHighScoreDisplay()
// Initialize theme
setTheme(getTheme())
// Initialize sound button
updateSoundButton()
