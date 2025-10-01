// Difficulty configurations
export const difficultySettings = {
  easy: {
    initialSpeed: 800,
    fastSpeed: 600,
    speedChangeTime: 20,
    gameTime: 40,
    pointsPerHit: 1,
    bonusMultiplier: 1.5
  },
  medium: {
    initialSpeed: 600,
    fastSpeed: 400,
    speedChangeTime: 20,
    gameTime: 30,
    pointsPerHit: 2,
    bonusMultiplier: 2
  },
  hard: {
    initialSpeed: 400,
    fastSpeed: 200,
    speedChangeTime: 15,
    gameTime: 25,
    pointsPerHit: 3,
    bonusMultiplier: 2.5
  }
};

// Game scoring logic with difficulty bonus
export function increaseScore(currentScore, difficulty = 'easy', timeRemaining = 0) {
  const settings = difficultySettings[difficulty];
  let points = settings.pointsPerHit;
  
  // Bonus points for fast phase (when time is low)
  if (timeRemaining > 0 && timeRemaining < settings.speedChangeTime) {
    points = Math.floor(points * settings.bonusMultiplier);
  }
  
  return currentScore + points;
}

// Calculate combo bonus (for consecutive hits)
export function calculateComboBonus(comboCount, difficulty = 'easy') {
  if (comboCount < 3) return 0;
  
  const baseBonus = difficultySettings[difficulty].pointsPerHit;
  // Every 3 consecutive hits gives a bonus
  return Math.floor(comboCount / 3) * baseBonus;
}

// Mole spawning logic with anti-repeat mechanism
let lastMolePosition = -1;

export function spawnMole(gridSize, avoidLastPosition = true) {
  let position;
  
  if (avoidLastPosition && gridSize > 1) {
    // Ensure mole doesn't spawn in same position twice in a row
    do {
      position = Math.floor(Math.random() * gridSize);
    } while (position === lastMolePosition);
  } else {
    position = Math.floor(Math.random() * gridSize);
  }
  
  lastMolePosition = position;
  return position;
}

// Reset last mole position (call when game restarts)
export function resetMolePosition() {
  lastMolePosition = -1;
}

// Timer logic with difficulty awareness
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

