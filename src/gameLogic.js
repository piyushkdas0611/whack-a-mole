// Game scoring logic
export function increaseScore(currentScore) {
  return currentScore + 1;
}

// Mole spawning logic
export function spawnMole(gridSize) {
  // returns a random cell index within grid
  return Math.floor(Math.random() * gridSize);
}

// Timer logic (optional)
export function decreaseTime(currentTime) {
  return currentTime > 0 ? currentTime - 1 : 0;
}
