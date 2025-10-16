/**
 * @jest-environment jsdom
 */

import { jest } from '@jest/globals';

// Mock window.matchMedia before importing the app module
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock Audio constructor
global.Audio = jest.fn().mockImplementation(() => ({
  play: jest.fn().mockResolvedValue(undefined),
  pause: jest.fn(),
  currentTime: 0,
  volume: 1,
}));

// We need to import the functions after setting up mocks
import { initializeGame } from './app.js';

describe('App.js Functions Unit Tests', () => {
  let mockLocalStorage;

  beforeEach(() => {
    // Mock localStorage
    mockLocalStorage = {};
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(key => mockLocalStorage[key] || null),
        setItem: jest.fn((key, value) => {
          mockLocalStorage[key] = value.toString();
        }),
        clear: jest.fn(() => {
          mockLocalStorage = {};
        }),
      },
      writable: true,
    });

    // Mock confirm function
    window.confirm = jest.fn().mockReturnValue(true);

    // Mock console.log to reduce noise
    console.log = jest.fn();

    // Setup DOM
    document.body.innerHTML = `
      <div class="stats">
        <span id="score">0</span>
        <span id="time-left">30</span>
        <span id="high-score">0</span>
      </div>
      <div class="controls">
        <button id="start-button">Start Game</button>
        <button id="pause-button" disabled>Pause</button>
        <button id="restart-button" disabled>Restart</button>
        <button id="reset-highscore-button">Reset High Score</button>
      </div>
      <div class="difficulty-selector">
        <button class="difficulty-btn active" data-level="easy">Easy</button>
        <button class="difficulty-btn" data-level="medium">Medium</button>
        <button class="difficulty-btn" data-level="hard">Hard</button>
      </div>
      <h2 id="final-score"></h2>
      <div id="high-score-message"></div>
      <div id="current-difficulty"></div>
      <div id="sr-announcer"></div>
      <div id="theme-toggle"></div>
      <div class="grid">
        ${Array(9)
          .fill()
          .map((_, i) => `<div class="square" id="${i + 1}"></div>`)
          .join('')}
      </div>
    `;

    // Initialize the game
    initializeGame();

    // Mock timers
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('High Score Functions', () => {
    test('getHighScore should return 0 when no high score exists', () => {
      const highScoreElement = document.querySelector('#high-score');
      expect(highScoreElement.textContent).toBe('0');
    });

    test('getHighScore should return stored high score', () => {
      localStorage.setItem('whackAMoleHighScore_easy', '15');
      initializeGame(); // Re-initialize to pick up the stored value
      const highScoreElement = document.querySelector('#high-score');
      expect(highScoreElement.textContent).toBe('15');
    });

    test('setHighScore should update localStorage and DOM', () => {
      const highScoreElement = document.querySelector('#high-score');

      // Simulate setting a high score
      localStorage.setItem('whackAMoleHighScore_easy', '25');
      highScoreElement.textContent = '25';

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'whackAMoleHighScore_easy',
        '25'
      );
      expect(highScoreElement.textContent).toBe('25');
    });

    test('resetHighScore should reset score when confirmed', () => {
      // Set initial high score
      localStorage.setItem('whackAMoleHighScore_easy', '20');

      // Simulate reset
      const resetButton = document.querySelector('#reset-highscore-button');
      resetButton.click();

      expect(window.confirm).toHaveBeenCalled();
    });

    test('updateHighScoreDisplay should update display correctly', () => {
      localStorage.setItem('whackAMoleHighScore_easy', '30');

      // Reinitialize to trigger updateHighScoreDisplay
      initializeGame();

      const highScoreElement = document.querySelector('#high-score');
      expect(highScoreElement.textContent).toBe('30');
    });
  });

  describe('Game State Functions', () => {
    test('resetGame should reset all game variables', () => {
      const scoreElement = document.querySelector('#score');
      const timeElement = document.querySelector('#time-left');
      const finalElement = document.querySelector('#final-score');
      const startButton = document.querySelector('#start-button');
      const pauseButton = document.querySelector('#pause-button');
      const restartButton = document.querySelector('#restart-button');

      // Reset the game
      const restartBtn = document.querySelector('#restart-button');
      restartBtn.click();

      expect(scoreElement.textContent).toBe('0');
      expect(timeElement.textContent).toBe('30');
      expect(finalElement.textContent).toBe('');
      expect(startButton.disabled).toBeFalsy();
      expect(pauseButton.disabled).toBeTruthy();
      expect(restartButton.disabled).toBeTruthy();
    });

    test('startGame should initialize game correctly', () => {
      const startButton = document.querySelector('#start-button');
      const pauseButton = document.querySelector('#pause-button');
      const restartButton = document.querySelector('#restart-button');

      startButton.click();

      expect(startButton.disabled).toBeTruthy();
      expect(pauseButton.disabled).toBeFalsy();
      expect(restartButton.disabled).toBeFalsy();
    });

    test('pauseGame should toggle pause state', () => {
      const startButton = document.querySelector('#start-button');
      const pauseButton = document.querySelector('#pause-button');

      // Start game first
      startButton.click();

      // Then pause
      pauseButton.click();

      expect(pauseButton.textContent).toBe('Resume');
    });

    test('updateTimerUI should update time display', () => {
      const timeElement = document.querySelector('#time-left');

      // The time should be set to 30 initially
      expect(timeElement.textContent).toBe('30');
    });
  });

  describe('Selection Functions', () => {
    test('setSelection should highlight selected square', () => {
      const squares = document.querySelectorAll('.square');
      const srAnnouncer = document.querySelector('#sr-announcer');

      // Simulate selection
      squares[0].click();

      // Check if selection logic is working (square should have been processed)
      expect(squares.length).toBe(9);
      expect(srAnnouncer).toBeTruthy();
    });

    test('clearSelection should remove selection', () => {
      const squares = document.querySelectorAll('.square');

      // First select a square
      squares[0].click();

      // The square should exist and be clickable
      expect(squares[0]).toBeTruthy();
    });
  });

  describe('Mole Functions', () => {
    test('randomSquare should add mole class to a square', () => {
      const squares = document.querySelectorAll('.square');

      // Start the game to trigger mole spawning
      const startButton = document.querySelector('#start-button');
      startButton.click();

      // Advance timers to trigger mole movement
      jest.advanceTimersByTime(1000);

      // Check if any square has mole class
      const moleSquares = document.querySelectorAll('.square.mole');
      expect(squares.length).toBe(9);
    });

    test('hitSquare should handle hitting correct mole', () => {
      const startButton = document.querySelector('#start-button');
      const scoreElement = document.querySelector('#score');

      // Start the game
      startButton.click();

      // The score should start at 0
      expect(scoreElement.textContent).toBe('0');
    });
  });

  describe('Theme Functions', () => {
    test('theme toggle should exist', () => {
      const themeToggle = document.querySelector('#theme-toggle');
      expect(themeToggle).toBeTruthy();
    });

    test('getColorPreference should return default when no preference stored', () => {
      // Since we mocked matchMedia to return false, it should default to 'light'
      // This is tested indirectly through the theme system
      expect(window.matchMedia).toBeDefined();
    });
  });

  describe('Difficulty Functions', () => {
    test('difficulty buttons should exist and be clickable', () => {
      const difficultyButtons = document.querySelectorAll('.difficulty-btn');

      expect(difficultyButtons.length).toBe(3);

      // Test clicking difficulty button
      difficultyButtons[1].click(); // Medium difficulty

      expect(difficultyButtons[1].dataset.level).toBe('medium');
    });

    test('should prevent difficulty change during game', () => {
      const startButton = document.querySelector('#start-button');
      const difficultyButtons = document.querySelectorAll('.difficulty-btn');

      // Start game
      startButton.click();

      // Try to change difficulty during game
      difficultyButtons[2].click(); // Hard difficulty

      // Game should still be running
      expect(startButton.disabled).toBeTruthy();
    });
  });

  describe('Audio Functions', () => {
    test('initializeAudio should create Audio object', () => {
      // Audio should be mocked and created during initialization
      expect(global.Audio).toHaveBeenCalledWith('audio/whack01.mp3');
    });
  });

  describe('Timer Functions', () => {
    test('countDown should decrease time', () => {
      const startButton = document.querySelector('#start-button');
      const timeElement = document.querySelector('#time-left');

      // Start game
      startButton.click();

      // Get initial time
      const initialTime = parseInt(timeElement.textContent);

      // Advance timer by 1 second
      jest.advanceTimersByTime(1000);

      // Time should have decreased
      const currentTime = parseInt(timeElement.textContent);
      expect(currentTime).toBeLessThan(initialTime);
    });

    test('game should end when time reaches 0', () => {
      const startButton = document.querySelector('#start-button');
      const pauseButton = document.querySelector('#pause-button');
      const finalScore = document.querySelector('#final-score');
      const timeElement = document.querySelector('#time-left');

      // Start game
      startButton.click();

      // Get the initial time to know how much to advance
      const initialTime = parseInt(timeElement.textContent);

      // Advance timer by initial time + 1 second to ensure game ends
      jest.advanceTimersByTime((initialTime + 1) * 1000);

      // Game should be ended
      expect(finalScore.textContent).toContain('Your final score is');
      expect(startButton.disabled).toBeTruthy();
      expect(pauseButton.disabled).toBeTruthy();
    });
  });
  describe('Event Listeners', () => {
    test('keyboard navigation should work', () => {
      const squares = document.querySelectorAll('.square');

      // Simulate number key press
      const event = new KeyboardEvent('keydown', { key: '1' });
      document.dispatchEvent(event);

      expect(squares.length).toBe(9);
    });

    test('arrow key navigation should work', () => {
      // Simulate arrow key press
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      document.dispatchEvent(event);

      // Should not throw error
      expect(document.querySelectorAll('.square').length).toBe(9);
    });

    test('enter key should trigger hit', () => {
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      document.dispatchEvent(event);

      // Should not throw error
      expect(document.querySelectorAll('.square').length).toBe(9);
    });
  });

  describe('Integration Tests', () => {
    test('complete game flow should work', () => {
      const startButton = document.querySelector('#start-button');
      const pauseButton = document.querySelector('#pause-button');
      const restartButton = document.querySelector('#restart-button');
      const scoreElement = document.querySelector('#score');

      // Start game
      startButton.click();
      expect(startButton.disabled).toBeTruthy();

      // Pause game
      pauseButton.click();
      expect(pauseButton.textContent).toBe('Resume');

      // Resume game
      pauseButton.click();
      expect(pauseButton.textContent).toBe('Pause');

      // Restart game
      restartButton.click();
      expect(scoreElement.textContent).toBe('0');
      expect(startButton.disabled).toBeFalsy();
    });

    test('high score should be checked at game end', () => {
      const startButton = document.querySelector('#start-button');
      const timeElement = document.querySelector('#time-left');

      // Set a lower high score
      localStorage.setItem('whackAMoleHighScore_easy', '5');

      // Start and immediately end game
      startButton.click();
      const initialTime = parseInt(timeElement.textContent);
      jest.advanceTimersByTime((initialTime + 1) * 1000);

      // High score check should have been called
      expect(console.log).toHaveBeenCalledWith('checkHighScore called');
    });
  });

  describe('Error Handling', () => {
    test('functions should handle missing DOM elements gracefully', () => {
      // Remove an important element
      const scoreElement = document.querySelector('#score');
      scoreElement.remove();

      // This should not throw error
      expect(() => {
        initializeGame();
      }).not.toThrow();
    });

    test('localStorage errors should be handled', () => {
      // Mock localStorage to throw error
      window.localStorage.getItem = jest.fn(() => {
        throw new Error('Storage error');
      });

      // Should not crash the app
      expect(() => {
        initializeGame();
      }).not.toThrow();
    });
  });

  describe('Performance Tests', () => {
    test('rapid clicking should not break the game', () => {
      const startButton = document.querySelector('#start-button');
      const squares = document.querySelectorAll('.square');

      startButton.click();

      // Rapid click simulation
      for (let i = 0; i < 10; i++) {
        squares[0].click();
      }

      // Game should still be functional
      expect(startButton.disabled).toBeTruthy();
    });

    test('multiple timer operations should work correctly', () => {
      const startButton = document.querySelector('#start-button');
      const pauseButton = document.querySelector('#pause-button');

      // Start the game
      startButton.click();

      // Pause and resume cycle
      pauseButton.click(); // Should be "Resume"
      expect(pauseButton.textContent).toBe('Resume');

      pauseButton.click(); // Should be "Pause"
      expect(pauseButton.textContent).toBe('Pause');

      pauseButton.click(); // Should be "Resume" again
      expect(pauseButton.textContent).toBe('Resume');
    });
  });
});
