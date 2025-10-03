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
const themeToggle = document.querySelector('#theme-toggle')

// Remove green highlight on theme toggle
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle');
    
    // Prevent default touch behavior
    themeToggle.addEventListener('touchstart', function(e) {
        e.preventDefault();
        e.stopPropagation();
    }, { passive: false });
    
    // Force remove any highlight
    themeToggle.style.setProperty('-webkit-tap-highlight-color', 'transparent', 'important');
    themeToggle.style.setProperty('tap-highlight-color', 'transparent', 'important');
    
    // Add a small delay to ensure styles are applied
    setTimeout(() => {
        themeToggle.blur();
        window.getComputedStyle(themeToggle, ':active').getPropertyValue('background-color');
    }, 100);
});

// Audio for hitting mole
const hitSound = new Audio('audio/whack01.mp3')  

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
    else
    {
        document.querySelector('.stats').style.display = 'block'
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
    document.querySelector('.stats').style.display = 'flex'
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

async function randomSquare() {
    // First, remove any existing moles with animation
    const removePromises = [];
    squares.forEach(square => {
        if (square.classList.contains('mole')) {
            square.classList.add('hiding');
            // Wait for the hide animation to complete before removing the class
            const promise = new Promise(resolve => {
                setTimeout(() => {
                    square.classList.remove('mole', 'hiding');
                    resolve();
                }, 200); // Match this with the CSS animation duration
            });
            removePromises.push(promise);
        }
    });

    // Wait for all remove animations to complete
    await Promise.all(removePromises);

    // Then add a new mole with animation
    const availableSquares = Array.from(squares).filter(sq => !sq.classList.contains('mole'));
    if (availableSquares.length > 0) {
        const randomSquare = availableSquares[Math.floor(Math.random() * availableSquares.length)];
        randomSquare.classList.add('mole');
        hit = randomSquare.id;
    }
}

// Handle both mouse and touch events
async function handleHit(square) {
    if(square.id == hit && isGameRunning && !isGamePaused && square.classList.contains('mole')){
        result++
        score.textContent = result
        hit = null
        hitSound.currentTime = 0
        hitSound.play()
        
        // Add hit effect
        square.classList.add('hit')
        
        // Wait for hit animation to complete before removing the mole
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Add hiding animation
        square.classList.add('hiding');
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Remove all mole-related classes
        square.classList.remove('mole', 'hit', 'hiding');
    }
}

// Add event listeners for both mouse and touch
squares.forEach(square => {
    // Mouse events
    square.addEventListener('mousedown', (e) => {
        e.preventDefault(); // Prevent text selection
        handleHit(square);
    });
    
    // Touch events
    square.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Prevent scrolling/zooming
        handleHit(square);
    }, { passive: false });
    
    // Prevent long press context menu on mobile
    square.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        return false;
    });
});

async function moveMole() {
    // Clear any existing timer to prevent multiple timers running
    if (timer) {
        clearInterval(timer);
    }
    
    // Start a new timer that calls randomSquare
    if(currentTime >= 20) {
        timer = setInterval(async () => {
            if (isGameRunning && !isGamePaused) {
                await randomSquare();
            }
        }, 1000); // Slightly longer interval to allow animations to complete
    } else if(currentTime < 20)
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
        startButton.disabled = false
        pauseButton.disabled = true
        restartButton.disabled = false
    }
}

const storageKey = 'theme-preference';

const onClick = () => {
    // flip current value
    theme.value = theme.value === 'light' ? 'dark' : 'light';
    setPreference();
}

const getColorPreference = () => {
    if (localStorage.getItem(storageKey))
        return localStorage.getItem(storageKey);
    else
        return window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
}

const setPreference = () => {
    localStorage.setItem(storageKey, theme.value);
    reflectPreference();
}

const reflectPreference = () => {
    document.firstElementChild.setAttribute('data-theme', theme.value);
    document.querySelector('#theme-toggle')?.setAttribute('aria-label', theme.value);
}

const theme = {
    value: getColorPreference(),
}

// set early so no page flashes / CSS is made aware
reflectPreference();

window.onload = () => {
    // set on load so screen readers can see latest value on the button
    reflectPreference();

    // now this script can find and listen for clicks on the control
    document.querySelector('#theme-toggle').addEventListener('click', onClick);
}

// sync with system changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ({matches:isDark}) => {
    theme.value = isDark ? 'dark' : 'light';
    setPreference();
});

// Event listeners
startButton.addEventListener('click', startGame)
pauseButton.addEventListener('click', pauseGame)
restartButton.addEventListener('click', resetGame)
resetHighScoreButton.addEventListener('click', resetHighScore)

// Initialize
resetGame()
updateHighScoreDisplay()
