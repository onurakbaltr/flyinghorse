/* ============================================
   Coloring Game - Boyama Atölyesi
   Professional Canvas-based Coloring
   ============================================ */

function initColoringGame(container) {
    const coloringImages = [
        { name: 'Kelebek', icon: '🦋', draw: drawButterfly },
        { name: 'Kedi', icon: '🐱', draw: drawCatColoring },
        { name: 'Balık', icon: '🐟', draw: drawFishColoring },
        { name: 'Çiçek', icon: '🌸', draw: drawFlower },
        { name: 'Ev', icon: '🏠', draw: drawHouse }
    ];

    const colors = [
        { name: 'Kırmızı', color: '#E74C3C' },
        { name: 'Turuncu', color: '#E67E22' },
        { name: 'Sarı', color: '#F1C40F' },
        { name: 'Yeşil', color: '#2ECC71' },
        { name: 'Mavi', color: '#3498DB' },
        { name: 'Mor', color: '#9B59B6' },
        { name: 'Pembe', color: '#FF6B9D' },
        { name: 'Kahve', color: '#8B4513' }
    ];

    let currentImageIndex = 0;
    let selectedColor = colors[0].color;
    let coloredAreas = {};
    let canvas, ctx;
    let areas = [];

    container.innerHTML = `
        <div class="coloring-container">
            <div class="coloring-top">
                <div class="image-selector" id="coloring-selector"></div>
            </div>
            <div class="coloring-canvas-wrapper">
                <canvas id="coloring-canvas" width="320" height="320"></canvas>
            </div>
            <div class="coloring-bottom">
                <div class="color-palette">
                    ${colors.map((c, i) => `
                        <button class="color-btn ${i === 0 ? 'active' : ''}" 
                                data-color="${c.color}" 
                                style="background: ${c.color}">
                        </button>
                    `).join('')}
                </div>
                <div class="coloring-actions">
                    <button class="game-btn secondary" onclick="clearColoring()">🔄 Temizle</button>
                    <button class="game-btn success" onclick="checkColoring()">✅ Bitti!</button>
                </div>
            </div>
        </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
        .coloring-container { display: flex; flex-direction: column; height: 100%; padding: 10px; }
        .coloring-top { padding: 10px 0; }
        .image-selector { display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; }
        .img-btn { width: 55px; height: 55px; border: 3px solid #ddd; border-radius: 15px; background: white; font-size: 1.8rem; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 4px 12px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; }
        .img-btn.active { border-color: var(--purple); transform: scale(1.1); box-shadow: 0 6px 20px rgba(155, 89, 182, 0.4); }
        .coloring-canvas-wrapper { flex: 1; display: flex; align-items: center; justify-content: center; padding: 10px; }
        #coloring-canvas { background: white; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.15), inset 0 2px 4px rgba(255,255,255,0.8); border: 4px solid rgba(255,255,255,0.6); cursor: pointer; max-width: 100%; touch-action: none; }
        .coloring-bottom { padding: 10px 0; }
        .color-palette { display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; margin-bottom: 15px; }
        .color-btn { width: 48px; height: 48px; border: 4px solid #fff; border-radius: 50%; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
        .color-btn.active { transform: scale(1.25); box-shadow: 0 6px 20px rgba(0,0,0,0.35); }
        .coloring-actions { display: flex; justify-content: center; gap: 15px; }
    `;
    container.appendChild(style);

    const selector = document.getElementById('coloring-selector');
    selector.innerHTML = coloringImages.map((img, i) =>
        `<button class="img-btn ${i === 0 ? 'active' : ''}" data-index="${i}">${img.icon}</button>`
    ).join('');

    selector.querySelectorAll('.img-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            selector.querySelectorAll('.img-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentImageIndex = parseInt(btn.dataset.index);
            coloredAreas = {};
            drawCurrentImage();
            if (typeof audioManager !== 'undefined') audioManager.playClick();
        });
    });

    container.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            container.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedColor = btn.dataset.color;
            if (typeof audioManager !== 'undefined') audioManager.playClick();
        });
    });

    canvas = document.getElementById('coloring-canvas');
    ctx = canvas.getContext('2d');
    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const x = (touch.clientX - rect.left) * (canvas.width / rect.width);
        const y = (touch.clientY - rect.top) * (canvas.height / rect.height);
        colorAtPoint(x, y);
    });

    function handleCanvasClick(e) {
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (canvas.width / rect.width);
        const y = (e.clientY - rect.top) * (canvas.height / rect.height);
        colorAtPoint(x, y);
    }

    function colorAtPoint(x, y) {
        for (let area of areas) {
            if (ctx.isPointInPath(area.path, x, y)) {
                coloredAreas[area.id] = selectedColor;
                if (typeof audioManager !== 'undefined') audioManager.playPaint();
                drawCurrentImage();
                return;
            }
        }
    }

    function drawButterfly() {
        const w = canvas.width, h = canvas.height;
        areas = [];
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#F0F8FF';
        ctx.fillRect(0, 0, w, h);

        const leftWingTop = new Path2D();
        leftWingTop.moveTo(w * 0.5, h * 0.45);
        leftWingTop.bezierCurveTo(w * 0.35, h * 0.15, w * 0.05, h * 0.2, w * 0.15, h * 0.45);
        leftWingTop.bezierCurveTo(w * 0.2, h * 0.48, w * 0.4, h * 0.48, w * 0.5, h * 0.45);
        areas.push({ id: 'leftWingTop', path: leftWingTop });

        const leftWingBottom = new Path2D();
        leftWingBottom.moveTo(w * 0.5, h * 0.55);
        leftWingBottom.bezierCurveTo(w * 0.35, h * 0.85, w * 0.08, h * 0.75, w * 0.18, h * 0.55);
        leftWingBottom.bezierCurveTo(w * 0.25, h * 0.52, w * 0.4, h * 0.52, w * 0.5, h * 0.55);
        areas.push({ id: 'leftWingBottom', path: leftWingBottom });

        const rightWingTop = new Path2D();
        rightWingTop.moveTo(w * 0.5, h * 0.45);
        rightWingTop.bezierCurveTo(w * 0.65, h * 0.15, w * 0.95, h * 0.2, w * 0.85, h * 0.45);
        rightWingTop.bezierCurveTo(w * 0.8, h * 0.48, w * 0.6, h * 0.48, w * 0.5, h * 0.45);
        areas.push({ id: 'rightWingTop', path: rightWingTop });

        const rightWingBottom = new Path2D();
        rightWingBottom.moveTo(w * 0.5, h * 0.55);
        rightWingBottom.bezierCurveTo(w * 0.65, h * 0.85, w * 0.92, h * 0.75, w * 0.82, h * 0.55);
        rightWingBottom.bezierCurveTo(w * 0.75, h * 0.52, w * 0.6, h * 0.52, w * 0.5, h * 0.55);
        areas.push({ id: 'rightWingBottom', path: rightWingBottom });

        areas.forEach(area => {
            ctx.fillStyle = coloredAreas[area.id] || '#FFFFFF';
            ctx.fill(area.path);
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 3;
            ctx.stroke(area.path);
        });

        ctx.fillStyle = '#4A4A4A';
        ctx.beginPath();
        ctx.ellipse(w * 0.5, h * 0.5, w * 0.04, h * 0.22, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = '#333'; ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(w * 0.48, h * 0.3); ctx.quadraticCurveTo(w * 0.42, h * 0.15, w * 0.38, h * 0.12);
        ctx.moveTo(w * 0.52, h * 0.3); ctx.quadraticCurveTo(w * 0.58, h * 0.15, w * 0.62, h * 0.12);
        ctx.stroke();

        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(w * 0.38, h * 0.12, 5, 0, Math.PI * 2);
        ctx.arc(w * 0.62, h * 0.12, 5, 0, Math.PI * 2);
        ctx.fill();
    }

    function drawCatColoring() {
        const w = canvas.width, h = canvas.height;
        areas = [];
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#FFF5EE';
        ctx.fillRect(0, 0, w, h);

        const body = new Path2D();
        body.ellipse(w * 0.5, h * 0.68, w * 0.32, h * 0.22, 0, 0, Math.PI * 2);
        areas.push({ id: 'body', path: body });

        const head = new Path2D();
        head.arc(w * 0.5, h * 0.38, w * 0.26, 0, Math.PI * 2);
        areas.push({ id: 'head', path: head });

        const leftEar = new Path2D();
        leftEar.moveTo(w * 0.28, h * 0.28); leftEar.lineTo(w * 0.18, h * 0.08); leftEar.lineTo(w * 0.38, h * 0.18);
        leftEar.closePath();
        areas.push({ id: 'leftEar', path: leftEar });

        const rightEar = new Path2D();
        rightEar.moveTo(w * 0.72, h * 0.28); rightEar.lineTo(w * 0.82, h * 0.08); rightEar.lineTo(w * 0.62, h * 0.18);
        rightEar.closePath();
        areas.push({ id: 'rightEar', path: rightEar });

        areas.forEach(area => {
            ctx.fillStyle = coloredAreas[area.id] || '#FFFFFF';
            ctx.fill(area.path);
            ctx.strokeStyle = '#333'; ctx.lineWidth = 3;
            ctx.stroke(area.path);
        });

        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(w * 0.4, h * 0.35, 8, 0, Math.PI * 2);
        ctx.arc(w * 0.6, h * 0.35, 8, 0, Math.PI * 2);
        ctx.fill();
    }

    function drawFishColoring() {
        const w = canvas.width, h = canvas.height;
        areas = [];
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#E0F7FA';
        ctx.fillRect(0, 0, w, h);

        const body = new Path2D();
        body.ellipse(w * 0.5, h * 0.5, w * 0.4, h * 0.25, 0, 0, Math.PI * 2);
        areas.push({ id: 'body', path: body });

        const tail = new Path2D();
        tail.moveTo(w * 0.15, h * 0.5); tail.lineTo(w * 0.02, h * 0.3); tail.lineTo(w * 0.02, h * 0.7);
        tail.closePath();
        areas.push({ id: 'tail', path: tail });

        areas.forEach(area => {
            ctx.fillStyle = coloredAreas[area.id] || '#FFFFFF';
            ctx.fill(area.path);
            ctx.strokeStyle = '#333'; ctx.lineWidth = 3;
            ctx.stroke(area.path);
        });
    }

    function drawFlower() {
        const w = canvas.width, h = canvas.height;
        areas = [];
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#F0FFF0';
        ctx.fillRect(0, 0, w, h);

        const center = new Path2D();
        center.arc(w * 0.5, h * 0.5, w * 0.15, 0, Math.PI * 2);
        areas.push({ id: 'center', path: center });

        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI * 2) / 6;
            const px = w * 0.5 + Math.cos(angle) * w * 0.25;
            const py = h * 0.5 + Math.sin(angle) * h * 0.25;
            const petal = new Path2D();
            petal.arc(px, py, w * 0.12, 0, Math.PI * 2);
            areas.push({ id: `petal${i}`, path: petal });
        }

        areas.forEach(area => {
            ctx.fillStyle = coloredAreas[area.id] || '#FFFFFF';
            ctx.fill(area.path);
            ctx.strokeStyle = '#333'; ctx.lineWidth = 3;
            ctx.stroke(area.path);
        });
    }

    function drawHouse() {
        const w = canvas.width, h = canvas.height;
        areas = [];
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#E0F0FF';
        ctx.fillRect(0, 0, w, h);

        const body = new Path2D();
        body.rect(w * 0.2, h * 0.4, w * 0.6, h * 0.5);
        areas.push({ id: 'body', path: body });

        const roof = new Path2D();
        roof.moveTo(w * 0.15, h * 0.4); roof.lineTo(w * 0.5, h * 0.1); roof.lineTo(w * 0.85, h * 0.4);
        roof.closePath();
        areas.push({ id: 'roof', path: roof });

        const door = new Path2D();
        door.rect(w * 0.4, h * 0.6, w * 0.2, h * 0.3);
        areas.push({ id: 'door', path: door });

        areas.forEach(area => {
            ctx.fillStyle = coloredAreas[area.id] || '#FFFFFF';
            ctx.fill(area.path);
            ctx.strokeStyle = '#333'; ctx.lineWidth = 3;
            ctx.stroke(area.path);
        });
    }

    function drawCurrentImage() {
        if (coloringImages[currentImageIndex]) {
            coloringImages[currentImageIndex].draw();
        }
    }

    drawCurrentImage();

    window.clearColoring = function () {
        coloredAreas = {};
        drawCurrentImage();
        if (typeof audioManager !== 'undefined') audioManager.playClick();
    };

    window.checkColoring = function () {
        if (typeof showCelebration === 'function') {
            showCelebration();
        } else if (typeof audioManager !== 'undefined') {
            audioManager.playWin();
        }
    };
}
