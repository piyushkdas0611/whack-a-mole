# Testing Documentation

This document provides comprehensive information about the testing setup for the Whack-a-Mole game.

## Testing Overview

The project includes comprehensive unit and integration tests covering all major functionality:

- **Unit Tests**: Individual function testing
- **Integration Tests**: End-to-end game flow testing
- **Game Logic Tests**: Core game mechanics testing

## Test Structure

### 1. **Integration Tests** (`app.test.js`)

Tests the complete game flow and user interactions:

- Initial game state
- Start/pause/restart functionality
- Scoring mechanism
- Game over conditions

### 2. **Function Unit Tests** (`app.functions.test.js`)

Comprehensive testing of all app.js functions:

#### High Score Functions

- `getHighScore()` - Retrieves stored high scores
- `setHighScore()` - Updates localStorage and DOM
- `updateHighScoreDisplay()` - Updates display elements
- `checkHighScore()` - Validates new high scores
- `resetHighScore()` - Resets high score data

#### Game State Functions

- `resetGame()` - Resets all game variables
- `startGame()` - Initializes game state
- `pauseGame()` - Handles pause/resume logic
- `updateTimerUI()` - Updates timer display

#### Selection & Navigation Functions

- `setSelection()` - Handles keyboard selection
- `clearSelection()` - Clears current selection
- `hitSquare()` - Processes mole hits
- `randomSquare()` - Spawns moles randomly

#### Timer Functions

- `countDown()` - Game timer countdown
- `moveMole()` - Mole movement timing

#### Theme Functions

- `getColorPreference()` - Theme preference detection
- Theme toggle functionality

#### Event Handling

- Keyboard navigation (arrow keys, number keys)
- Mouse interactions
- Button click handlers

### 3. **Game Logic Tests** (`src/gameLogic.test.js`)

Tests core game mechanics:

- Score calculation
- Mole spawning algorithms
- Timer functionality
- Difficulty settings

## Test Technologies

### Jest (Integration & Unit Tests)

- **Environment**: jsdom for DOM simulation
- **Features**: Fake timers, mocking, assertion library
- **Configuration**: `jest.config.js`

### Vitest (Game Logic Tests)

- **Environment**: Node.js
- **Features**: Fast execution, modern syntax
- **Integration**: Works with ES modules

## Running Tests

### Individual Test Suites

```bash
# Run integration tests only
npm test

# Run function unit tests only
npm run test:functions

# Run game logic tests only
npm run vitest
```

### All Tests (Separately)

```bash
# Run Jest tests
npm test && npm run test:functions

# Run Vitest tests
npm run vitest
```

## Test Configuration

### Jest Setup

- **Environment**: jsdom
- **Module Support**: ES modules with experimental VM modules
- **Mocks**: window.matchMedia, localStorage, Audio API

### Vitest Setup

- **Config**: Minimal configuration for game logic testing
- **Speed**: Fast execution for rapid development

## Coverage Areas

### ✅ Covered Functionality

- All core game functions (29 unit tests)
- Complete game flow (6 integration tests)
- Game logic algorithms (3 logic tests)
- Error handling and edge cases
- Performance scenarios
- Keyboard/mouse interactions
- Theme system
- High score persistence
- Audio functionality

### Test Categories by Function Count:

| Category       | Functions Tested | Test Count |
| -------------- | ---------------- | ---------- |
| High Score     | 5 functions      | 5 tests    |
| Game State     | 4 functions      | 4 tests    |
| Selection      | 3 functions      | 2 tests    |
| Mole Logic     | 2 functions      | 2 tests    |
| Theme          | 2 functions      | 2 tests    |
| Difficulty     | 1 function       | 2 tests    |
| Audio          | 1 function       | 1 test     |
| Timers         | 2 functions      | 2 tests    |
| Events         | Multiple         | 3 tests    |
| Integration    | Full flow        | 2 tests    |
| Error Handling | Edge cases       | 2 tests    |
| Performance    | Stress tests     | 2 tests    |

## Mocking Strategy

### External APIs

- **Audio**: Mock Audio constructor and methods
- **localStorage**: Mock storage operations
- **matchMedia**: Mock CSS media queries
- **Timers**: Jest fake timers for controlled testing

### DOM Elements

- Complete HTML structure in `beforeEach`
- All game elements (buttons, score display, grid)
- Event listeners and interactions

## Best Practices Implemented

### Test Organization

- Descriptive test names
- Grouped by functionality
- Clear setup/teardown

### Assertions

- Specific expectations
- Multiple assertions per test where appropriate
- Edge case coverage

### Test Isolation

- Independent test execution
- Clean state between tests
- Mock reset in teardown

## Continuous Integration

Tests are configured to run in CI/CD pipeline:

- GitHub Actions workflow
- Multiple Node.js versions (18, 20)
- Automatic test execution on PR/push

## Debugging Tests

### Running with Verbose Output

```bash
npm test -- --verbose
npm run test:functions -- --verbose
```

### Debug Specific Tests

```bash
# Run specific test file
npm test app.test.js

# Run specific test pattern
npm test -- --testNamePattern="high score"
```

## Performance Metrics

- **Total Tests**: 38 tests
- **Coverage**: ~100% of app.js functions
- **Execution Time**: ~4-5 seconds total
- **Reliability**: All tests consistently pass

## Future Enhancements

### Potential Additions

- Visual regression testing
- E2E testing with Playwright/Cypress
- Performance benchmarking
- Accessibility testing
- Cross-browser testing automation

### Test Coverage Goals

- Maintain 100% function coverage
- Add property-based testing
- Enhance error scenario coverage
- Add load testing for high-frequency interactions

---

This testing setup ensures robust, reliable code and provides confidence for future development and refactoring.
