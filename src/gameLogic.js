// Difficulty settings configuration
export const difficultySettings = {
  easy: {
    gameTime: 30,
    initialSpeed: 1000,
    fastSpeed: 800,
    speedChangeTime: 15,
    pointsPerHit: 1,
    timeBonus: false
  },
  medium: {
    gameTime: 45,
    initialSpeed: 700,
    fastSpeed: 500,
    speedChangeTime: 25,
    pointsPerHit: 2,
    timeBonus: true
  },
  hard: {
    gameTime: 60,
    initialSpeed: 500,
    fastSpeed: 300,
    speedChangeTime: 40,
    pointsPerHit: 3,
    timeBonus: true
  }
};

// Track last mole position to avoid repeats
let lastMolePosition = -1;

// Game scoring logic with difficulty multiplier
export function increaseScore(currentScore, difficulty = 'easy', timeRemaining = 0) {
  const settings = difficultySettings[difficulty];
  let points = settings.pointsPerHit;
  
  // Time bonus for medium/hard difficulties (extra points when time is low)
  if (settings.timeBonus && timeRemaining < 10) {
    points += 1;
  }
  
  return currentScore + points;
}

// Mole spawning logic with anti-repeat system
export function spawnMole(maxSquares, avoidRepeat = true) {
  let randomIndex;
  
  if (avoidRepeat && lastMolePosition !== -1) {
    // Generate new position different from last
    do {
      randomIndex = Math.floor(Math.random() * maxSquares);
    } while (randomIndex === lastMolePosition);
  } else {
    randomIndex = Math.floor(Math.random() * maxSquares);
  }
  
  lastMolePosition = randomIndex;
  return randomIndex;
}

// Reset last mole position (call when game restarts)
export function resetMolePosition() {
  lastMolePosition = -1;
}

// Timer logic (optional)
export function decreaseTime(currentTime) {
  return currentTime > 0 ? currentTime - 1 : 0;
}

// Get initial time based on difficulty
export function getInitialTime(difficulty = 'easy') {
  return difficultySettings[difficulty].gameTime;
}

// Get current speed based on time remaining and difficulty
export function getCurrentSpeed(timeRemaining, difficulty = 'easy') {
  const settings = difficultySettings[difficulty];
  return timeRemaining >= settings.speedChangeTime 
    ? settings.initialSpeed 
    : settings.fastSpeed;
}

// Check if speed should change at this time
export function shouldChangeSpeed(timeRemaining, difficulty = 'easy') {
  return timeRemaining === difficultySettings[difficulty].speedChangeTime;
}

// Calculate final score with difficulty multiplier
export function calculateFinalScore(rawScore, difficulty = 'easy', perfectHits = 0, totalMoles = 1) {
  const accuracy = (perfectHits / totalMoles) * 100;
  let multiplier = 1;

  // Accuracy bonus
  if (accuracy >= 90) multiplier += 0.5;
  else if (accuracy >= 75) multiplier += 0.3;
  else if (accuracy >= 50) multiplier += 0.1;

  // Difficulty multiplier
  if (difficulty === 'medium') multiplier += 0.2;
  if (difficulty === 'hard') multiplier += 0.5;

  return Math.floor(rawScore * multiplier);
}

// Validate difficulty level
export function isValidDifficulty(difficulty) {
  return ['easy', 'medium', 'hard'].includes(difficulty);
}

// Get difficulty display name
export function getDifficultyName(difficulty) {
  if (!isValidDifficulty(difficulty)) return 'Easy';
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
}