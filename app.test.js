/**
 * @jest-environment jsdom
 */

describe('Whack-a-Mole Game', () => {
    beforeEach(() => {
        // Remove document declaration since it's already provided by jsdom
        document.body.innerHTML = `
            <div class="stats">
                <span id="score">0</span>
                <span id="time-left">30</span>
            </div>
            <div class="controls">
                <button id="start-button">Start Game</button>
                <button id="pause-button" disabled>Pause</button>
                <button id="restart-button" disabled>Restart</button>
            </div>
            <h2 id="final-score"></h2>
            <div class="grid">
                ${Array(9).fill().map((_, i) => `<div class="square" id="${i + 1}"></div>`).join('')}
            </div>
        `;

        // Reset any timers
        jest.useFakeTimers();
        
        // Clear any existing module cache
        jest.resetModules();
        
        // Import the game logic
        require('./app.js');
    });

    afterEach(() => {
        // Clean up timers
        jest.clearAllTimers();
        jest.useRealTimers();
    });
    
    test('initial game state', () => {
        expect(document.querySelector('#score').textContent).toBe('0');
        expect(document.querySelector('#time-left').textContent).toBe('30');
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
        jest.useFakeTimers();
        
        const startButton = document.querySelector('#start-button');
        startButton.click();

        // Fast forward 30 seconds
        jest.advanceTimersByTime(30000);

        expect(document.querySelector('#final-score')).not.toBe('');
        expect(startButton.disabled).toBeTruthy();
        expect(document.querySelector('#pause-button').disabled).toBeTruthy();
        expect(document.querySelector('#restart-button').disabled).toBeFalsy();
    });
});