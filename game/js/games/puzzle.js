/* ============================================
   Puzzle Game - Puzzle Dünyası
   Real Picture Puzzles with Canvas
   ============================================ */

function initPuzzleGame(container) {
    const puzzleImages = [
        { name: 'Kedi', color1: '#FFB6C1', color2: '#FF69B4', drawFn: drawCat },
        { name: 'Köpek', color1: '#DEB887', color2: '#8B4513', drawFn: drawDog },
        { name: 'Tavşan', color1: '#E6E6FA', color2: '#9370DB', drawFn: drawBunny },
        { name: 'Balık', color1: '#87CEEB', color2: '#4169E1', drawFn: drawFish },
        { name: 'Kuş', color1: '#98FB98', color2: '#32CD32', drawFn: drawBird }
    ];

    let currentImageIndex = 0;
    let gridSize = 2;
    let pieces = [];
    let selectedPiece = null;

    container.innerHTML = `
        <div class="puzzle-container">
            <div class="puzzle-header">
                <div class="puzzle-preview-box">
                    <span class="preview-label">Hedef Resim:</span>
                    <canvas id="preview-canvas" width="80" height="80"></canvas>
                </div>
                <div class="puzzle-selectors">
                    <div class="image-selector" id="image-selector"></div>
                    <div class="level-selector">
                        <button class="level-btn active" data-size="2">2×2</button>
                        <button class="level-btn" data-size="3">3×3</button>
                    </div>
                </div>
            </div>
            <div class="puzzle-board-wrapper">
                <div class="puzzle-board" id="puzzle-board"></div>
            </div>
            <div class="puzzle-controls">
                <button class="game-btn secondary" onclick="shufflePuzzle()">🔀 Karıştır</button>
                <button class="game-btn success" onclick="checkPuzzle()">✅ Kontrol</button>
            </div>
        </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
        .puzzle-container { display: flex; flex-direction: column; height: 100%; padding: 15px; }
        .puzzle-header { display: flex; justify-content: space-between; align-items: center; gap: 15px; margin-bottom: 15px; flex-wrap: wrap; }
        .puzzle-preview-box { display: flex; align-items: center; gap: 12px; background: linear-gradient(145deg, #fff, #f8f8f8); padding: 10px 15px; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .preview-label { font-weight: 600; color: var(--purple); font-size: 0.9rem; }
        #preview-canvas { border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.15); }
        .puzzle-selectors { display: flex; gap: 15px; align-items: center; }
        .image-selector { display: flex; gap: 8px; }
        .img-select-btn { width: 45px; height: 45px; border: 3px solid #ddd; border-radius: 12px; cursor: pointer; transition: all 0.2s ease; padding: 0; overflow: hidden; }
        .img-select-btn.active { border-color: var(--purple); transform: scale(1.1); box-shadow: 0 4px 15px rgba(155, 89, 182, 0.3); }
        .img-select-btn canvas { width: 100%; height: 100%; }
        .level-selector { display: flex; gap: 8px; }
        .level-btn { padding: 10px 16px; border: none; border-radius: 15px; background: linear-gradient(145deg, #fff, #f0f0f0); color: var(--purple); font-weight: 700; font-family: inherit; cursor: pointer; box-shadow: 0 3px 10px rgba(0,0,0,0.1); transition: all 0.2s; }
        .level-btn.active { background: linear-gradient(145deg, var(--purple), var(--pink)); color: white; }
        .puzzle-board-wrapper { flex: 1; display: flex; align-items: center; justify-content: center; padding: 10px; }
        .puzzle-board { display: grid; gap: 6px; width: 100%; max-width: 320px; aspect-ratio: 1; background: linear-gradient(145deg, #fff, #f0f0f0); padding: 12px; border-radius: 20px; box-shadow: 0 15px 40px rgba(0,0,0,0.15), inset 0 2px 4px rgba(255,255,255,0.8); }
        .puzzle-board.grid-2 { grid-template-columns: repeat(2, 1fr); }
        .puzzle-board.grid-3 { grid-template-columns: repeat(3, 1fr); }
        .puzzle-piece { aspect-ratio: 1; border-radius: 12px; cursor: grab; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 15px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.5); overflow: hidden; position: relative; }
        .puzzle-piece:active { cursor: grabbing; transform: scale(1.05); box-shadow: 0 8px 25px rgba(0,0,0,0.3); z-index: 10; }
        .puzzle-piece.selected { box-shadow: 0 0 0 4px var(--purple), 0 8px 25px rgba(155,89,182,0.4); transform: scale(1.02); }
        .puzzle-piece.correct { box-shadow: 0 0 0 4px var(--green), 0 4px 15px rgba(46,204,113,0.4); }
        .puzzle-piece canvas { width: 100%; height: 100%; display: block; }
        .puzzle-controls { display: flex; justify-content: center; gap: 15px; padding: 15px 0; }
    `;
    container.appendChild(style);

    function drawCat(ctx, w, h) {
        ctx.fillStyle = '#FFE4EC'; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#FFB6C1'; ctx.beginPath(); ctx.ellipse(w / 2, h * 0.65, w * 0.35, h * 0.28, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(w / 2, h * 0.38, w * 0.28, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#FF69B4'; ctx.beginPath(); ctx.moveTo(w * 0.28, h * 0.25); ctx.lineTo(w * 0.18, h * 0.08); ctx.lineTo(w * 0.38, h * 0.18); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(w * 0.72, h * 0.25); ctx.lineTo(w * 0.82, h * 0.08); ctx.lineTo(w * 0.62, h * 0.18); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(w * 0.4, h * 0.35, w * 0.04, 0, Math.PI * 2); ctx.arc(w * 0.6, h * 0.35, w * 0.04, 0, Math.PI * 2); ctx.fill();
    }

    function drawDog(ctx, w, h) {
        ctx.fillStyle = '#FFF8DC'; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#DEB887'; ctx.beginPath(); ctx.ellipse(w / 2, h * 0.65, w * 0.38, h * 0.28, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(w / 2, h * 0.4, w * 0.3, 0, Math.PI * 2); ctx.fill();
    }

    function drawBunny(ctx, w, h) {
        ctx.fillStyle = '#F0F0FF'; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#E6E6FA'; ctx.beginPath(); ctx.ellipse(w / 2, h * 0.7, w * 0.35, h * 0.25, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(w / 2, h * 0.45, w * 0.3, 0, Math.PI * 2); ctx.fill();
    }

    function drawFish(ctx, w, h) {
        ctx.fillStyle = '#E0FFFF'; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#4169E1'; ctx.beginPath(); ctx.ellipse(w / 2, h / 2, w * 0.4, h * 0.25, 0, 0, Math.PI * 2); ctx.fill();
    }

    function drawBird(ctx, w, h) {
        ctx.fillStyle = '#E0FFE0'; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#98FB98'; ctx.beginPath(); ctx.ellipse(w / 2, h * 0.6, w * 0.3, h * 0.2, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(w * 0.6, h * 0.35, w * 0.2, 0, Math.PI * 2); ctx.fill();
    }

    function createImageSelectors() {
        const selector = document.getElementById('image-selector');
        selector.innerHTML = puzzleImages.map((img, i) => {
            return `<button class="img-select-btn ${i === 0 ? 'active' : ''}" data-index="${i}">
                <canvas width="40" height="40"></canvas>
            </button>`;
        }).join('');

        selector.querySelectorAll('.img-select-btn').forEach((btn, i) => {
            const canvas = btn.querySelector('canvas');
            const ctx = canvas.getContext('2d');
            puzzleImages[i].drawFn(ctx, 40, 40);
            btn.addEventListener('click', () => {
                selector.querySelectorAll('.img-select-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentImageIndex = i;
                createPuzzle();
                if (typeof audioManager !== 'undefined') audioManager.playClick();
            });
        });
    }

    container.querySelectorAll('.level-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            container.querySelectorAll('.level-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            gridSize = parseInt(btn.dataset.size);
            createPuzzle();
            if (typeof audioManager !== 'undefined') audioManager.playClick();
        });
    });

    createImageSelectors();
    createPuzzle();

    function createPuzzle() {
        const board = document.getElementById('puzzle-board');
        board.className = `puzzle-board grid-${gridSize}`;
        const previewCanvas = document.getElementById('preview-canvas');
        puzzleImages[currentImageIndex].drawFn(previewCanvas.getContext('2d'), 80, 80);

        const totalPieces = gridSize * gridSize;
        pieces = [];
        for (let i = 0; i < totalPieces; i++) {
            pieces.push({ id: i, currentPos: i, correctPos: i });
        }
        shufflePieces();
        renderBoard();
    }

    function shufflePieces() {
        for (let i = pieces.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = pieces[i].currentPos;
            pieces[i].currentPos = pieces[j].currentPos;
            pieces[j].currentPos = temp;
        }
    }

    function renderBoard() {
        const board = document.getElementById('puzzle-board');
        board.innerHTML = '';
        const sortedPieces = [...pieces].sort((a, b) => a.currentPos - b.currentPos);

        sortedPieces.forEach(piece => {
            const div = document.createElement('div');
            div.className = 'puzzle-piece';
            if (piece.currentPos === piece.correctPos) div.classList.add('correct');

            const canvas = document.createElement('canvas');
            canvas.width = 150; canvas.height = 150;
            const ctx = canvas.getContext('2d');
            const fullSize = 150 * gridSize;

            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = fullSize; tempCanvas.height = fullSize;
            puzzleImages[currentImageIndex].drawFn(tempCanvas.getContext('2d'), fullSize, fullSize);

            const row = Math.floor(piece.id / gridSize);
            const col = piece.id % gridSize;
            ctx.drawImage(tempCanvas, col * 150, row * 150, 150, 150, 0, 0, 150, 150);

            div.appendChild(canvas);
            div.addEventListener('click', () => selectPiece(div, piece));
            board.appendChild(div);
        });
    }

    function selectPiece(div, piece) {
        if (selectedPiece === null) {
            selectedPiece = piece;
            div.classList.add('selected');
            if (typeof audioManager !== 'undefined') audioManager.playClick();
        } else {
            const temp = selectedPiece.currentPos;
            selectedPiece.currentPos = piece.currentPos;
            piece.currentPos = temp;
            selectedPiece = null;
            if (typeof audioManager !== 'undefined') audioManager.playPuzzleSnap();
            renderBoard();
            if (pieces.every(p => p.currentPos === p.correctPos)) setTimeout(() => showCelebration(), 300);
        }
    }

    window.shufflePuzzle = function () {
        shufflePieces();
        renderBoard();
        if (typeof audioManager !== 'undefined') audioManager.playClick();
    };

    window.checkPuzzle = function () {
        if (pieces.every(p => p.currentPos === p.correctPos)) showCelebration();
        else if (typeof audioManager !== 'undefined') audioManager.playSuccess();
    };
}
