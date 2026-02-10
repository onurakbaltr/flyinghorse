/* ============================================ 
   Flying Horses - Main Application 
   ============================================ */

const gameState = {
    currentGame: null,
    soundEnabled: true
};

const gameTitles = {
    coloring: '🎨 Boyama Atölyesi',
    puzzle: '🧩 Puzzle Dünyası',
    memory: '🃏 Hafıza Kartları',
    balloons: '🎈 Balon Şenliği',
    music: '🎵 Müzik Bahçesi',
    runner: '🐱 Kedi Koşusu',
    shells: '🎯 Bul Karayı',
    darts: '🏹 Dart Atışı'
};

document.addEventListener('DOMContentLoaded', () => {
    initSparkles();
    animateCards();
});

function openGame(gameName) {
    if (typeof audioManager !== 'undefined') {
        audioManager.init();
        audioManager.playClick();
    }

    gameState.currentGame = gameName;
    document.getElementById('game-title').textContent = gameTitles[gameName] || 'Oyun';

    document.getElementById('main-menu').classList.remove('active');
    document.getElementById('game-container').classList.add('active');

    const gameArea = document.getElementById('game-area');
    gameArea.innerHTML = '';

    setTimeout(() => {
        switch (gameName) {
            case 'coloring': if (typeof initColoringGame === 'function') initColoringGame(gameArea); break;
            case 'puzzle': if (typeof initPuzzleGame === 'function') initPuzzleGame(gameArea); break;
            case 'memory': if (typeof initMemoryGame === 'function') initMemoryGame(gameArea); break;
            case 'balloons': if (typeof initBalloonsGame === 'function') initBalloonsGame(gameArea); break;
            case 'music': if (typeof initMusicGame === 'function') initMusicGame(gameArea); break;
            case 'runner': if (typeof initKittyRunnerGame === 'function') initKittyRunnerGame(gameArea); break;
            case 'shells': if (typeof initShellsGame === 'function') initShellsGame(gameArea); break;
            case 'darts': if (typeof initDartsGame === 'function') initDartsGame(gameArea); break;
        }
    }, 100);
}

function goBack() {
    if (typeof audioManager !== 'undefined') audioManager.playClick();
    document.getElementById('game-container').classList.remove('active');
    document.getElementById('main-menu').classList.add('active');
    document.getElementById('game-area').innerHTML = '';
    gameState.currentGame = null;
}

function toggleSound() {
    if (typeof audioManager !== 'undefined') {
        const enabled = audioManager.toggle();
        gameState.soundEnabled = enabled;
        document.getElementById('sound-icon').textContent = enabled ? '🔊' : '🔇';
        audioManager.playClick();
    }
}

function showCelebration() {
    if (typeof audioManager !== 'undefined') audioManager.playWin();
    const celebration = document.getElementById('celebration');
    celebration.classList.remove('hidden');
    createConfetti();
}

function closeCelebration() {
    if (typeof audioManager !== 'undefined') audioManager.playClick();
    const celebration = document.getElementById('celebration');
    celebration.classList.add('hidden');
    document.getElementById('confetti').innerHTML = '';
}

function createConfetti() {
    const container = document.getElementById('confetti');
    const colors = ['#FF6B9D', '#9B59B6', '#3498DB', '#2ECC71', '#F1C40F', '#E67E22'];
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 2 + 's';
        confetti.style.animationDuration = (2 + Math.random() * 2) + 's';
        const shapes = ['50%', '0', '50% 0 50% 50%'];
        confetti.style.borderRadius = shapes[Math.floor(Math.random() * shapes.length)];
        container.appendChild(confetti);
    }
}

function createSparkle(x, y) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.style.left = x + 'px';
    sparkle.style.top = y + 'px';
    const sparklesContainer = document.getElementById('sparkles');
    if (sparklesContainer) sparklesContainer.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 600);
}

function initSparkles() {
    document.addEventListener('click', (e) => {
        createSparkle(e.clientX - 10, e.clientY - 10);
    });
    document.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        createSparkle(touch.clientX - 10, touch.clientY - 10);
    });
}

function animateCards() {
    const cards = document.querySelectorAll('.game-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100 + 200);
    });
}

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}
