
        // Game state variables
        let gameActive = false;
        let gamePaused = false;
        let timeLeft = 30;
        let score1 = 0;
        let score2 = 0;
        let highScore = 0;
        let currentPlayer = 1;
        let timer;
        let moleInterval;
        let activeMoles = [];
        let isMultiplayer = false;

        // DOM elements
        const startButton = document.getElementById('start-button');
        const pauseButton = document.getElementById('pause-button');
        const restartButton = document.getElementById('restart-button');
        const resetHighscoreButton = document.getElementById('reset-highscore-button');
        const timeLeftDisplay = document.getElementById('time-left');
        const score1Display = document.getElementById('score1');
        const score2Display = document.getElementById('score2');
        const highScoreDisplay = document.getElementById('high-score');
        const finalScoreDisplay = document.getElementById('final-score');
        const highScoreMessage = document.getElementById('high-score-message');
        const grid = document.getElementById('grid');
        const holes = document.querySelectorAll('.hole');
        const themeSelect = document.getElementById('theme-select');
        const multiplayerToggle = document.getElementById('multiplayer-toggle');
        const player1Panel = document.getElementById('panel-player1');
        const player2Panel = document.getElementById('panel-player2');
        const particlesContainer = document.getElementById('particles');

feature/UI-ENCHANMENT-AND-ADD-NEW-FETAURE-Multiplayer-Mode

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


        const hitSound = new Audio('./audio/whack01.mp3')
        // Initialize game
        function initGame() {
            // Load high score from localStorage
            const savedHighScore = localStorage.getItem('whackamole-highscore');
            if (savedHighScore) {
                highScore = parseInt(savedHighScore);
                highScoreDisplay.textContent = highScore;
            }
            
            // Set up event listeners
            startButton.addEventListener('click', startGame);
            pauseButton.addEventListener('click', togglePause);
            restartButton.addEventListener('click', restartGame);
            resetHighscoreButton.addEventListener('click', resetHighScore);
            themeSelect.addEventListener('change', changeTheme);
            multiplayerToggle.addEventListener('change', toggleMultiplayer);
            
            // Add click events to holes
            holes.forEach(hole => {
                hole.addEventListener('click', () => whackMole(hole));
            });
            
            // Add keyboard controls
            document.addEventListener('keydown', handleKeyPress);
        }

        // Start the game
        function startGame() {
            if (gameActive) return;
            
            gameActive = true;
            gamePaused = false;
            timeLeft = 30;
            score1 = 0;
            score2 = 0;
            currentPlayer = 1;
            
            updateUI();
            startTimer();
            startMoles();
            
            startButton.disabled = true;
            pauseButton.disabled = false;
            restartButton.disabled = false;
            
            finalScoreDisplay.textContent = '';
            highScoreMessage.textContent = '';
        }

        // Toggle pause state
        function togglePause() {
            gamePaused = !gamePaused;
            
            if (gamePaused) {
                clearInterval(timer);
                clearInterval(moleInterval);
                pauseButton.innerHTML = '<i class="fas fa-play"></i> Resume';
            } else {
                startTimer();
                startMoles();
                pauseButton.innerHTML = '<i class="fas fa-pause"></i> Pause';
            }
        }

        // Restart the game
        function restartGame() {
            clearInterval(timer);
            clearInterval(moleInterval);
            activeMoles.forEach(mole => hideMole(mole));
            activeMoles = [];
            
            startGame();
        }

        // Reset high score
        function resetHighScore() {
            highScore = 0;
            highScoreDisplay.textContent = highScore;
            localStorage.setItem('whackamole-highscore', highScore);
        }

        // Change theme
        function changeTheme() {
            const theme = themeSelect.value;
            document.body.className = theme;
        }

        // Toggle multiplayer mode
        function toggleMultiplayer() {
            isMultiplayer = multiplayerToggle.checked;
            
            if (isMultiplayer) {
                player2Panel.classList.add('active');
            } else {
                player2Panel.classList.remove('active');
                currentPlayer = 1;
                player1Panel.classList.add('active');
            }
        }

        // Start the game timer
        function startTimer() {
            timer = setInterval(() => {
                if (!gamePaused) {
                    timeLeft--;
                    timeLeftDisplay.textContent = timeLeft;
                    
                    if (timeLeft <= 0) {
                        endGame();
                    }
                }
            }, 1000);
        }

        // Start mole popping
        function startMoles() {
            moleInterval = setInterval(() => {
                if (!gamePaused) {
                    popRandomMole();
                }
            }, 800);
        }

        // Pop up a random mole
        function popRandomMole() {
            // Hide a random active mole if there are too many
            if (activeMoles.length > 3) {
                const randomIndex = Math.floor(Math.random() * activeMoles.length);
                hideMole(activeMoles[randomIndex]);
            }
            
            // Find an inactive hole
            const inactiveHoles = Array.from(holes).filter(hole => 
                !hole.querySelector('.mole').classList.contains('up')
            );
            
            if (inactiveHoles.length > 0) {
                const randomHole = inactiveHoles[Math.floor(Math.random() * inactiveHoles.length)];
                showMole(randomHole);
            }
        }

        // Show a mole
        function showMole(hole) {
            const mole = hole.querySelector('.mole');
            mole.classList.add('up');
            activeMoles.push(hole);
            
            // Auto hide after a random time
            setTimeout(() => {
                if (mole.classList.contains('up')) {
                    hideMole(hole);
                }
            }, 1500 + Math.random() * 1000);
        }

        // Hide a mole
        function hideMole(hole) {
            const mole = hole.querySelector('.mole');
            mole.classList.remove('up');
            const index = activeMoles.indexOf(hole);
            if (index > -1) {
                activeMoles.splice(index, 1);
            }
        }

        // Whack a mole
       function whackMole(hole) {
    if (!gameActive || gamePaused) return;
    
    const mole = hole.querySelector('.mole');
    
    if (mole.classList.contains('up')) {
        mole.classList.remove('up');
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

        // Play hit sound
        hitSound.currentTime = 0; 
        hitSound.play().catch(e => console.log("Audio play error:", e));

        // Update score
        if (isMultiplayer) {
            if (currentPlayer === 1) {
                score1++;
                score1Display.textContent = score1;
            } else {
                score2++;
                score2Display.textContent = score2;
            }
        } else {
            score1++;
            score1Display.textContent = score1;
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

        // Visual feedback
        hole.style.boxShadow = '0 0 20px gold, inset 0 0 20px rgba(0,0,0,0.8)';
        setTimeout(() => {
            hole.style.boxShadow = '';
        }, 200);

        // Particle effect
        createParticles(hole);
    }
}

        // Play whack sound
        function playWhackSound() {
            // In a real implementation, you would play the actual sound file
            // For this example, we'll just log to console
            console.log("Whack sound played!");
        }

        // Create particles for visual effect
        function createParticles(hole) {
            const rect = hole.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            for (let i = 0; i < 15; i++) {
                const particle = document.createElement('div');
                particle.classList.add('particle');
                
                // Random position around the mole
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * 50;
                const x = centerX + Math.cos(angle) * distance;
                const y = centerY + Math.sin(angle) * distance;
                
                particle.style.left = `${x}px`;
                particle.style.top = `${y}px`;
                
                // Random size and color
                const size = 5 + Math.random() * 10;
                particle.style.width = `${size}px`;
                particle.style.height = `${size}px`;
                
                const colors = ['#FF5722', '#FFC107', '#4CAF50', '#2196F3'];
                particle.style.background = colors[Math.floor(Math.random() * colors.length)];
                
                particlesContainer.appendChild(particle);
                
                // Animate particle
                const animation = particle.animate([
                    { opacity: 1, transform: 'translate(0, 0) scale(1)' },
                    { opacity: 0, transform: `translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) scale(0)` }
                ], {
                    duration: 500 + Math.random() * 500,
                    easing: 'cubic-bezier(0, .9, .57, 1)'
                });
                
                // Remove particle after animation
                animation.onfinish = () => {
                    particle.remove();
                };
            }
        }

        // Handle keyboard controls
        function handleKeyPress(e) {
            if (!gameActive || gamePaused) return;
            
            // Player 1 controls (WASD + Space)
            if (currentPlayer === 1 || !isMultiplayer) {
                switch(e.key) {
                    case ' ':
                        // Space bar - whack current hole
                        const activeHole1 = document.querySelector(`.hole[data-id="${getHoleFromPosition(1)}"]`);
                        if (activeHole1) whackMole(activeHole1);
                        break;
                    case 'w':
                    case 'W':
                        // Move up
                        break;
                    case 'a':
                    case 'A':
                        // Move left
                        break;
                    case 's':
                    case 'S':
                        // Move down
                        break;
                    case 'd':
                    case 'D':
                        // Move right
                        break;
                }
            }
            
            // Player 2 controls (Arrow keys + Enter)
            if (isMultiplayer && currentPlayer === 2) {
                switch(e.key) {
                    case 'Enter':
                        // Enter key - whack current hole
                        const activeHole2 = document.querySelector(`.hole[data-id="${getHoleFromPosition(2)}"]`);
                        if (activeHole2) whackMole(activeHole2);
                        break;
                    case 'ArrowUp':
                        // Move up
                        break;
                    case 'ArrowLeft':
                        // Move left
                        break;
                    case 'ArrowDown':
                        // Move down
                        break;
                    case 'ArrowRight':
                        // Move right
                        break;
                }
            }
            
            // Switch players in multiplayer mode
            if (isMultiplayer && (e.key === 'Tab')) {
                e.preventDefault();
                switchPlayer();
            }
        }

        // Get hole ID from player position (simplified for this example)
        function getHoleFromPosition(player) {
            // In a real implementation, this would track player cursor position
            // For this example, we'll return a random hole
            return Math.floor(Math.random() * 9) + 1;
        }

        // Switch active player in multiplayer mode
        function switchPlayer() {
            if (!isMultiplayer) return;
            
            currentPlayer = currentPlayer === 1 ? 2 : 1;
            
            if (currentPlayer === 1) {
                player1Panel.classList.add('active');
                player2Panel.classList.remove('active');
            } else {
                player1Panel.classList.remove('active');
                player2Panel.classList.add('active');
            }
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

        // Update UI elements
        function updateUI() {
            timeLeftDisplay.textContent = timeLeft;
            score1Display.textContent = score1;
            score2Display.textContent = score2;
            highScoreDisplay.textContent = highScore;
        }

        // End the game
        function endGame() {
            gameActive = false;
            clearInterval(timer);
            clearInterval(moleInterval);
            
            // Hide all moles
            activeMoles.forEach(mole => hideMole(mole));
            activeMoles = [];
            
            // Calculate final score
            const finalScore = isMultiplayer ? Math.max(score1, score2) : score1;
            
            // Update high score if needed
            if (finalScore > highScore) {
                highScore = finalScore;
                highScoreDisplay.textContent = highScore;
                localStorage.setItem('whackamole-highscore', highScore);
                highScoreMessage.textContent = 'New High Score!';
            }
            
            // Display final score
            finalScoreDisplay.textContent = `Final Score: ${finalScore}`;
            
            // Enable/disable buttons
            startButton.disabled = false;
            pauseButton.disabled = true;
            restartButton.disabled = true;
        }

        // Initialize the game when the page loads
        window.addEventListener('DOMContentLoaded', initGame);
    