/**
 * @jest-environment jsdom
 */

import { jest } from '@jest/globals';
import { initializeGame } from './app.js';

describe('Whack-a-Mole Game', () => {
    beforeEach(() => {
        // Remove document declaration since it's already provided by jsdom
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
            <h2 id="final-score"></h2>
            <div id="high-score-message"></div>
            <div class="grid">
                ${Array(9).fill().map((_, i) => `<div class="square" id="${i + 1}"></div>`).join('')}
            </div>
        `;

        // Initialize the game after DOM is set
        initializeGame();

        // Reset any timers
        jest.useFakeTimers();

        // Clear any existing module cache
        jest.resetModules();
    });

    afterEach(() => {
        // Clean up timers
        jest.clearAllTimers();
        jest.useRealTimers();
        localStorage.clear();
    });
    
    test('initial game state', () => {
        expect(document.querySelector('#score').textContent).toBe('0');
        expect(document.querySelector('#time-left').textContent).toBe('30');
         expect(document.querySelector('#high-score').textContent).toBe('0');
        expect(document.querySelector('#start-button').disabled).toBeFalsy();
        expect(document.querySelector('#pause-button').disabled).toBeTruthy();
        expect(document.querySelector('#restart-button').disabled).toBeTruthy();
    });

    test('start game functionality', () => {
        const startButton = document.querySelector('#start-button');
        startButton.click();

        expect(startButton.disabled).toBeTruthy();
        expect(document.querySelector('#pause-button').disabled).toBeFalsy();
        expect(document.querySelector('#restart-button').disabled).toBeFalsy();
    });

    test('pause game functionality', () => {
        const startButton = document.querySelector('#start-button');
        const pauseButton = document.querySelector('#pause-button');
        
        startButton.click();
        pauseButton.click();

        expect(pauseButton.textContent).toBe('Resume');
    });

    test('restart game functionality', () => {
        const startButton = document.querySelector('#start-button');
        const restartButton = document.querySelector('#restart-button');
        
        startButton.click();
        restartButton.click();

        expect(document.querySelector('#score').textContent).toBe('0');
        expect(document.querySelector('#time-left').textContent).toBe('30');
        expect(startButton.disabled).toBeFalsy();
        expect(document.querySelector('#pause-button').disabled).toBeTruthy();
        expect(restartButton.disabled).toBeTruthy();
    });

    test('scoring mechanism', () => {
        const startButton = document.querySelector('#start-button');
        startButton.click();

        const mole = document.querySelector('.mole');
        if (mole) {
            mole.click();
            expect(document.querySelector('#score').textContent).toBe('1');
        }
    });

    test('game over state', () => {
        // Clear any existing timers first
        jest.clearAllTimers();
        jest.useFakeTimers();
        
        const startButton = document.querySelector('#start-button');
        const finalScore = document.querySelector('#final-score');
        const timeLeft = document.querySelector('#time-left');
        
        // Start the game
        startButton.click();
        
        // Log initial state
        console.log('Initial state:', {
            timeLeft: timeLeft.textContent,
            finalScore: finalScore.textContent
        });

        // Advance time by 30 seconds
        jest.advanceTimersByTime(30000);
        jest.runOnlyPendingTimers();
        
        // Log final state
        console.log('Final state:', {
            timeLeft: timeLeft.textContent,
            finalScore: finalScore.textContent
        });

        // More specific expectation
        expect(finalScore.textContent).toContain('Your final score is');
        expect(timeLeft.textContent).toBe('0');
        expect(startButton.disabled).toBeTruthy();
        expect(document.querySelector('#pause-button').disabled).toBeTruthy();
        expect(document.querySelector('#restart-button').disabled).toBeFalsy();
    });
});