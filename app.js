/* app.js
   Resolved merge conflicts and consolidated features:
   - Single-mole spawn logic (chained setTimeout) with dynamic speed
   - Proper timer cleanup and pause/resume handling
   - Centered mole, hammer-on-hit animation, keyboard support
   - Start / Pause / Restart / Reset-highscore / End-of-round modal
   - No overlapping intervals; prevents stuck state
*/

const squares = Array.from(document.querySelectorAll('.square'));
const timeLeftEl = document.querySelector('#time-left');
const scoreEl = document.querySelector('#score');
const highScoreEl = document.querySelector('#high-score');
const finalEl = document.querySelector('#final-score');
const startButton = document.querySelector('#start-button');
const pauseButton = document.querySelector('#pause-button');
const restartButton = document.querySelector('#restart-button');
const resetHighScoreButton = document.querySelector('#reset-highscore-button');
const highScoreMessage = document.querySelector('#high-score-message');

const endModal = document.getElementById('endModal');
const playAgainBtn = document.getElementById('play-again');
const modalCloseBtn = document.getElementById('modal-close');
const modalHigh = document.getElementById('modal-high');

const hitSound = new Audio('audio/whack01.mp3');

let result = 0;
let currentTime = 30;
let spawnTimeout = null;
let countDownTimer = null;
let activeSquare = null;
let isGameRunning = false;
let isGamePaused = false;

/* High score utils */
function getHighScore() {
  return parseInt(localStorage.getItem('whackAMoleHighScore')) || 0;
}
function setHighScore(v) {
  localStorage.setItem('whackAMoleHighScore', v);
  highScoreEl.textContent = v;
}
function updateHighScoreDisplay() {
  highScoreEl.textContent = getHighScore();
}

/* UI helpers */
function showHighScoreMessage(txt, timeout = 2200) {
  if (!txt) { highScoreMessage.style.display = 'none'; highScoreMessage.setAttribute('aria-hidden','true'); return; }
  highScoreMessage.textContent = txt;
  highScoreMessage.style.display = 'block';
  highScoreMessage.setAttribute('aria-hidden','false');
  if (timeout) {
    setTimeout(()=> {
      highScoreMessage.style.display = 'none';
      highScoreMessage.setAttribute('aria-hidden','true');
    }, timeout);
  }
}
function enableControlsOnStart(){
  startButton.disabled = true;
  pauseButton.disabled = false;
  restartButton.disabled = false;
  startButton.setAttribute('aria-pressed','true');
}
function disableAllInteractiveDuringModal(){
  startButton.disabled = true;
  pauseButton.disabled = true;
  restartButton.disabled = false;
  resetHighScoreButton.disabled = false;
}

/* Mole lifecycle helpers */
function clearActiveMole() {
  if (!activeSquare) return;
  const mole = activeSquare.querySelector('.mole');
  if (mole) mole.remove();
  const hammer = activeSquare ? activeSquare.querySelector('.hammer') : null;
  if (hammer) hammer.remove();
  activeSquare = null;
}
function removeSpawnTimeout(){
  if (spawnTimeout) {
    clearTimeout(spawnTimeout);
    spawnTimeout = null;
  }
}

/* Dynamic spawn delay based on remaining time */
function getSpawnDelay() {
  if (currentTime >= 25) return 700;
  if (currentTime >= 20) return 600;
  if (currentTime >= 15) return 480;
  if (currentTime >= 10) return 360;
  return 260;
}

/* Spawn a single mole (chained via setTimeout) */
function spawnMole() {
  removeSpawnTimeout();
  clearActiveMole();

  if (!isGameRunning || isGamePaused || currentTime <= 0) return;

  // pick a random square (avoid same as previous if possible)
  let idx = Math.floor(Math.random() * squares.length);
  if (activeSquare) {
    const prevIndex = squares.indexOf(activeSquare);
    let attempts = 0;
    while (idx === prevIndex && attempts < 5) {
      idx = Math.floor(Math.random() * squares.length);
      attempts++;
    }
  }
  const chosen = squares[idx];
  activeSquare = chosen;

  // create mole element (centered via CSS)
  const mole = document.createElement('div');
  mole.className = 'mole';
  chosen.appendChild(mole);

  // schedule next spawn (remove current mole if not hit)
  const delay = getSpawnDelay();
  spawnTimeout = setTimeout(()=> {
    // if mole still present (not hit), remove it
    if (activeSquare === chosen) {
      clearActiveMole();
    }
    // spawn next if game still running
    spawnMole();
  }, delay);
}

/* Hit logic */
function hitSquare(square) {
  if (!isGameRunning || isGamePaused) return;
  if (square !== activeSquare) return;

  const mole = square.querySelector('.mole');
  if (!mole) return;

  // increment score
  result++;
  scoreEl.textContent = result;

  // hit visual: add mole.hit class (shrinks) and hammer emoji animation
  mole.classList.add('hit');

  const hammer = document.createElement('div');
  hammer.className = 'hammer';
  hammer.textContent = '🔨';
  square.appendChild(hammer);

  // play sound
  try { hitSound.currentTime = 0; hitSound.play(); } catch (e) { /* ignore autoplay block */ }

  // cancel scheduled removal for this mole; we'll remove after animation
  removeSpawnTimeout();

  // remove mole + hammer after animation time and schedule next spawn
  setTimeout(()=> {
    clearActiveMole();
    if (isGameRunning && !isGamePaused && currentTime > 0) {
      // short delay before next spawn to create rhythm
      spawnTimeout = setTimeout(spawnMole, 180);
    }
  }, 360);
}

/* Countdown timer */
function startCountDown() {
  clearInterval(countDownTimer);
  countDownTimer = setInterval(()=> {
    if (!isGameRunning || isGamePaused) return;
    currentTime--;
    timeLeftEl.textContent = currentTime;
    if (currentTime <= 0) {
      endRound();
    }
  }, 1000);
}

/* Start / Pause / Reset / End */
function startGame() {
  if (isGameRunning) return; // avoid double start
  isGameRunning = true;
  isGamePaused = false;
  result = 0;
  currentTime = 30;
  scoreEl.textContent = result;
  timeLeftEl.textContent = currentTime;
  updateHighScoreDisplay();
  enableControlsOnStart();
  showHighScoreMessage('', 0);
  // start spawn chain and countdown
  spawnMole();
  startCountDown();
}

function pauseGame() {
  if (!isGameRunning) return;
  isGamePaused = !isGamePaused;
  pauseButton.textContent = isGamePaused ? 'Resume' : 'Pause';
  pauseButton.setAttribute('aria-pressed', String(isGamePaused));
  if (isGamePaused) {
    // freeze: stop countdown and any scheduled spawn
    removeSpawnTimeout();
    clearInterval(countDownTimer);
  } else {
    // resume timers
    startCountDown();
    // next mole spawn a short while after resume
    spawnTimeout = setTimeout(spawnMole, 300);
  }
}

function resetGame() {
  // fully stop everything and restore initial UI
  isGameRunning = false;
  isGamePaused = false;
  result = 0;
  currentTime = 30;
  scoreEl.textContent = result;
  timeLeftEl.textContent = currentTime;
  startButton.disabled = false;
  startButton.setAttribute('aria-pressed','false');
  pauseButton.disabled = true;
  pauseButton.textContent = 'Pause';
  restartButton.disabled = true;
  showHighScoreMessage('', 0);

  // cleanup timers and active mole
  removeSpawnTimeout();
  clearInterval(countDownTimer);
  clearActiveMole();
}

function endRound() {
  // stop spawning & countdown, clear mole
  removeSpawnTimeout();
  clearInterval(countDownTimer);
  isGameRunning = false;
  isGamePaused = false;

  // final score UI and highscore check
  finalEl.textContent = `Your final score is: ${result}`;
  const hs = getHighScore();
  if (result > hs) {
    setHighScore(result);
    modalHigh.textContent = `🎉 New High Score: ${result} 🎉`;
    showHighScoreMessage('🎉 New High Score! 🎉', 2500);
  } else {
    modalHigh.textContent = `High Score: ${hs}`;
  }

  // show modal
  endModal.setAttribute('aria-hidden', 'false');
  endModal.style.display = 'grid';
  disableAllInteractiveDuringModal();

  // remove any active mole from view
  clearActiveMole();
}

/* Modal helpers */
function closeModal() {
  endModal.setAttribute('aria-hidden', 'true');
  endModal.style.display = 'none';
  startButton.disabled = false;
  pauseButton.disabled = true;
  restartButton.disabled = true;
  startButton.setAttribute('aria-pressed','false');
}

function playAgain() {
  closeModal();
  resetGame();
  startGame();
}

/* Highscore reset */
function resetHighScore() {
  if (!confirm('Are you sure you want to reset the high score?')) return;
  setHighScore(0);
  showHighScoreMessage('High Score Reset!', 2000);
}

/* Attach event listeners to squares (mouse + keyboard) */
squares.forEach(sq => {
  sq.addEventListener('mousedown', (e) => {
    // prefer left-click only
    if (e.button !== 0) return;
    hitSquare(sq);
  });

  sq.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      hitSquare(sq);
    }
  });
});

/* Buttons */
startButton.addEventListener('click', () => {
  startGame();
});
pauseButton.addEventListener('click', () => {
  pauseGame();
});
restartButton.addEventListener('click', () => {
  if (confirm('Restart the game?')) {
    resetGame();
  }
});
resetHighScoreButton.addEventListener('click', resetHighScore);

playAgainBtn.addEventListener('click', playAgain);
modalCloseBtn.addEventListener('click', closeModal);

/* close modal on Escape */
document.addEventListener('keydown', (ev) => {
  if (ev.key === 'Escape' && endModal.getAttribute('aria-hidden') === 'false') {
    closeModal();
  }
});

/* Clean shutdown if user navigates away (helpful while developing) */
window.addEventListener('beforeunload', () => {
  removeSpawnTimeout();
  clearInterval(countDownTimer);
});

/* Init */
resetGame();
updateHighScoreDisplay();
