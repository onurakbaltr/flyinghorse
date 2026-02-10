/* ============================================
   Memory Game - Hafıza Kartları
   Simple Display Toggle (No 3D Transforms)
   ============================================ */

function initMemoryGame(container) {
    const cardSets = [
        { theme: 'Hayvanlar', cards: ['🐱', '🐶', '🐰', '🐻', '🦊', '🐼'], colors: ['#FFB6C1', '#87CEEB', '#DDA0DD', '#F0E68C', '#FFA07A', '#98FB98'] },
        { theme: 'Meyveler', cards: ['🍎', '🍊', '🍋', '🍇', '🍓', '🍌'], colors: ['#FF6B6B', '#FFA500', '#FFE135', '#8B5CF6', '#FF4757', '#FFDA79'] },
        { theme: 'Doğa', cards: ['🌸', '🌺', '🌻', '🌹', '🌷', '🦋'], colors: ['#FFB7C5', '#FF6B6B', '#FFD93D', '#FF4757', '#FF6B9D', '#87CEEB'] }
    ];

    let currentSetIndex = 0;
    let currentSet = cardSets[currentSetIndex];
    let gridSize = 2;
    let cards = [];
    let flippedCards = [];
    let matchedPairs = 0;
    let isLocked = false;
    let moves = 0;

    container.innerHTML = `
        <div class="memory-container">
            <div class="memory-header">
                <div class="memory-stats">
                    <div class="stat-box"><span class="stat-icon">🎯</span><span class="stat-value" id="matched-count">0</span></div>
                    <div class="stat-box"><span class="stat-icon">👆</span><span class="stat-value" id="move-count">0</span></div>
                </div>
                <div class="memory-levels">
                    <button class="level-btn active" data-pairs="2">2×2</button>
                    <button class="level-btn" data-pairs="4">2×4</button>
                    <button class="level-btn" data-pairs="6">3×4</button>
                </div>
            </div>
            <div class="memory-board-wrapper">
                <div class="memory-board" id="memory-board"></div>
            </div>
            <div class="memory-controls">
                <button class="game-btn secondary" id="restart-mem-btn">🔄 Yeniden</button>
                <button class="game-btn primary" id="theme-mem-btn">🎲 Tema</button>
            </div>
        </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
        .memory-container { display:flex; flex-direction:column; height:100%; padding:15px; }
        .memory-header { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:15px; }
        .memory-stats { display:flex; gap:15px; }
        .stat-box { display:flex; align-items:center; gap:8px; background:linear-gradient(145deg,#fff,#f0f0f0); padding:10px 18px; border-radius:20px; box-shadow:0 4px 15px rgba(0,0,0,0.1); }
        .stat-icon { font-size:1.2rem; }
        .stat-value { font-size:1.3rem; font-weight:800; color:var(--purple); }
        .memory-levels { display:flex; gap:8px; }
        .level-btn { padding:10px 18px; border:none; border-radius:20px; background:linear-gradient(145deg,#fff,#f0f0f0); color:var(--purple); font-weight:700; font-family:inherit; cursor:pointer; box-shadow:0 4px 15px rgba(0,0,0,0.1); transition:all 0.2s; }
        .level-btn.active { background:linear-gradient(145deg,var(--purple),var(--pink)); color:white; }
        .memory-board-wrapper { flex:1; display:flex; align-items:center; justify-content:center; padding:10px; }
        .memory-board { display:grid; gap:12px; width:100%; max-width:360px; }
        .memory-board.grid-2x2 { grid-template-columns:repeat(2,1fr); }
        .memory-board.grid-2x4 { grid-template-columns:repeat(4,1fr); }
        .memory-board.grid-3x4 { grid-template-columns:repeat(4,1fr); }
        .memory-card { aspect-ratio:1; cursor:pointer; border-radius: 16px; position: relative; transition: transform 0.15s ease; }
        .memory-card:hover { transform: scale(1.03); }
        .memory-card:active { transform: scale(0.97); }
        .memory-card .card-back { position: absolute; inset: 0; background: linear-gradient(145deg, #667eea, #764ba2); border-radius: 16px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 25px rgba(102,126,234,0.4); transition: all 0.3s ease; }
        .memory-card .card-back::before { content: ''; position: absolute; inset: 6px; border: 3px solid rgba(255,255,255,0.25); border-radius: 12px; }
        .memory-card .card-back::after { content: '⭐'; font-size: 2.5rem; filter: drop-shadow(0 3px 6px rgba(0,0,0,0.3)); }
        .memory-card .card-front { position: absolute; inset: 0; background: linear-gradient(145deg, #fff, #f8f8f8); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 3rem; box-shadow: 0 8px 25px rgba(0,0,0,0.15); border: 4px solid; opacity: 0; transform: scale(0.8); transition: all 0.3s ease; }
        .memory-card.flipped .card-back { opacity: 0; transform: scale(0.5) rotateY(180deg); }
        .memory-card.flipped .card-front { opacity: 1; transform: scale(1); }
        .memory-card.matched .card-back { opacity: 0; transform: scale(0.5) rotateY(180deg); }
        .memory-card.matched .card-front { opacity: 1; transform: scale(1); animation: matchPop 0.4s ease; }
        @keyframes matchPop { 0% { transform: scale(1); } 50% { transform: scale(1.15); } 100% { transform: scale(1); } }
        .memory-controls { display:flex; justify-content:center; gap:15px; padding:15px 0; }
    `;
    container.appendChild(style);

    container.querySelectorAll('.level-btn').forEach(btn => {
        btn.onclick = () => {
            container.querySelectorAll('.level-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            gridSize = parseInt(btn.dataset.pairs);
            createMemoryGame();
            if (typeof audioManager !== 'undefined') audioManager.playClick();
        };
    });

    container.querySelector('#restart-mem-btn').onclick = () => {
        createMemoryGame();
        if (typeof audioManager !== 'undefined') audioManager.playClick();
    };

    container.querySelector('#theme-mem-btn').onclick = () => {
        currentSetIndex = (currentSetIndex + 1) % cardSets.length;
        currentSet = cardSets[currentSetIndex];
        createMemoryGame();
        if (typeof audioManager !== 'undefined') audioManager.playClick();
    };

    createMemoryGame();

    function createMemoryGame() {
        const board = document.getElementById('memory-board');
        if (gridSize === 2) board.className = 'memory-board grid-2x2';
        else if (gridSize === 4) board.className = 'memory-board grid-2x4';
        else board.className = 'memory-board grid-3x4';

        flippedCards = []; matchedPairs = 0; moves = 0; isLocked = false;
        updateStats();

        const emojis = currentSet.cards.slice(0, gridSize);
        const cardColors = currentSet.colors.slice(0, gridSize);
        let cardData = emojis.map((emoji, i) => ({ emoji, color: cardColors[i] }));
        cardData = [...cardData, ...cardData];

        if (typeof shuffleArray === 'function') {
            cards = shuffleArray(cardData);
        } else {
            cards = cardData.sort(() => Math.random() - 0.5);
        }

        board.innerHTML = cards.map((card, index) => `
            <div class="memory-card" data-index="${index}" data-emoji="${card.emoji}">
                <div class="card-back"></div>
                <div class="card-front" style="border-color:${card.color};background:linear-gradient(145deg,#fff,${card.color}22);">${card.emoji}</div>
            </div>
        `).join('');

        board.querySelectorAll('.memory-card').forEach(card => {
            card.onclick = () => flipCard(card);
        });
    }

    function flipCard(card) {
        if (isLocked || card.classList.contains('flipped') || card.classList.contains('matched') || flippedCards.length >= 2) return;
        card.classList.add('flipped');
        flippedCards.push(card);
        if (typeof audioManager !== 'undefined') audioManager.playCardFlip();
        if (flippedCards.length === 2) { moves++; updateStats(); checkMatch(); }
    }

    function checkMatch() {
        const [card1, card2] = flippedCards;
        if (card1.dataset.emoji === card2.dataset.emoji) {
            setTimeout(() => {
                card1.classList.add('matched'); card2.classList.add('matched');
                if (typeof audioManager !== 'undefined') audioManager.playMatch();
                matchedPairs++; updateStats();
                if (matchedPairs === gridSize) {
                    if (typeof showCelebration === 'function') setTimeout(() => showCelebration(), 500);
                }
            }, 400);
        } else {
            isLocked = true;
            setTimeout(() => { card1.classList.remove('flipped'); card2.classList.remove('flipped'); isLocked = false; }, 1200);
        }
        flippedCards = [];
    }

    function updateStats() {
        document.getElementById('matched-count').textContent = matchedPairs;
        document.getElementById('move-count').textContent = moves;
    }
}
