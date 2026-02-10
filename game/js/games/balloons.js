/* ============================================
   Balloon Game - Balon Şenliği
   ============================================ */

function initBalloonsGame(container) {
    const colors = [
        { name: 'Kırmızı', color: '#E74C3C', emoji: '🔴' },
        { name: 'Mavi', color: '#3498DB', emoji: '🔵' },
        { name: 'Yeşil', color: '#2ECC71', emoji: '🟢' },
        { name: 'Sarı', color: '#F1C40F', emoji: '🟡' },
        { name: 'Mor', color: '#9B59B6', emoji: '🟣' }
    ];

    let score = 0, targetColor = null, gameActive = false;
    let balloons = [], animationId = null, spawnInterval = null;

    container.innerHTML = `
        <div class="balloons-container">
            <div class="balloons-header">
                <div class="score-display">🎯 Puan: <span id="balloon-score">0</span></div>
                <div class="target-display">Bul: <span id="target-color">🔴</span></div>
            </div>
            <div class="balloons-area" id="balloons-area">
                <div class="start-overlay" id="start-overlay">
                    <div class="start-icon">🎈</div>
                    <h2>Balon Şenliği!</h2>
                    <p>Doğru renkteki balonları patlat!</p>
                    <button class="game-btn success" onclick="startBalloonGame()">🎮 Başla!</button>
                </div>
            </div>
            <div class="balloons-controls">
                <button class="game-btn secondary" onclick="resetBalloonGame()">🔄 Yeniden</button>
            </div>
        </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
        .balloons-container { display:flex; flex-direction:column; height:100%; }
        .balloons-header { display:flex; justify-content:space-between; padding:15px; background:rgba(255,255,255,0.9); }
        .score-display, .target-display { background:white; padding:10px 20px; border-radius:25px; font-weight:700; color:var(--purple); box-shadow:0 4px 15px rgba(0,0,0,0.1); }
        #target-color { font-size:1.5rem; animation:pulse 1s infinite; }
        .balloons-area { flex:1; position:relative; overflow:hidden; background:linear-gradient(180deg,#87CEEB 0%,#E0F7FA 50%,#A5D6A7 100%); }
        .start-overlay { position:absolute; inset:0; background:rgba(255,255,255,0.95); display:flex; flex-direction:column; align-items:center; justify-content:center; z-index:100; text-align:center; }
        .start-overlay.hidden { display:none; }
        .start-icon { font-size:5rem; animation:bounce 1s infinite; }
        .start-overlay h2 { color:var(--purple); margin:20px 0 10px; }
        .balloon { position:absolute; cursor:pointer; transition:transform 0.1s; }
        .balloon:active { transform:scale(0.9); }
        .balloon.popping { animation:balloonPop 0.3s forwards; pointer-events:none; }
        .balloons-controls { padding:15px; display:flex; justify-content:center; background:rgba(255,255,255,0.9); }
    `;
    container.appendChild(style);

    function createBalloonSVG(color) {
        return `<svg viewBox="0 0 100 130"><defs><radialGradient id="bg${color.replace('#', '')}" cx="30%" cy="30%" r="70%"><stop offset="0%" stop-color="white" stop-opacity="0.4"/><stop offset="100%" stop-color="${color}"/></radialGradient></defs><ellipse cx="50" cy="50" rx="40" ry="50" fill="url(#bg${color.replace('#', '')})"/><ellipse cx="35" cy="35" rx="10" ry="15" fill="white" opacity="0.3" transform="rotate(-30 35 35)"/><polygon points="45,98 55,98 50,105" fill="${color}"/><path d="M50,105 Q45,115 50,125" stroke="#8B4513" stroke-width="2" fill="none"/></svg>`;
    }

    function spawnBalloon() {
        if (!gameActive) return;
        const area = document.getElementById('balloons-area');
        const colorData = colors[Math.floor(Math.random() * colors.length)];
        const size = 60 + Math.random() * 30;
        const x = Math.random() * (area.offsetWidth - size);
        const balloon = document.createElement('div');
        balloon.className = 'balloon';
        balloon.style.cssText = `width:${size}px;height:${size * 1.3}px;left:${x}px;bottom:-150px;`;
        balloon.innerHTML = createBalloonSVG(colorData.color);
        balloon.dataset.color = colorData.name;
        balloon.onclick = balloon.ontouchstart = (e) => { e.preventDefault(); popBalloon(balloon, colorData); };
        area.appendChild(balloon);
        balloons.push({ el: balloon, y: -150, speed: 1 + Math.random() * 2 });
    }

    function popBalloon(balloon, colorData) {
        if (balloon.classList.contains('popping')) return;
        if (colorData.name === targetColor.name) {
            score += 10;
            document.getElementById('balloon-score').textContent = score;
            audioManager.playBalloonPop();
            if (score >= 50) endGame(true);
            else if (Math.random() > 0.7) setNewTarget();
        } else { audioManager.playError(); return; }
        balloon.classList.add('popping');
        setTimeout(() => balloon.remove(), 300);
    }

    function setNewTarget() {
        targetColor = colors[Math.floor(Math.random() * colors.length)];
        document.getElementById('target-color').textContent = targetColor.emoji;
    }

    function animate() {
        if (!gameActive) return;
        const areaH = document.getElementById('balloons-area').offsetHeight;
        balloons = balloons.filter(b => {
            if (!b.el.parentNode) return false;
            b.y += b.speed;
            b.el.style.bottom = b.y + 'px';
            if (b.y > areaH + 150) { b.el.remove(); return false; }
            return true;
        });
        animationId = requestAnimationFrame(animate);
    }

    function endGame(won) { gameActive = false; cancelAnimationFrame(animationId); clearInterval(spawnInterval); if (won) showCelebration(); }

    window.startBalloonGame = () => {
        document.getElementById('start-overlay').classList.add('hidden');
        score = 0; document.getElementById('balloon-score').textContent = '0';
        gameActive = true; balloons = []; setNewTarget();
        spawnInterval = setInterval(spawnBalloon, 800); animate();
        audioManager.playClick();
    };

    window.resetBalloonGame = () => {
        gameActive = false; cancelAnimationFrame(animationId); clearInterval(spawnInterval);
        balloons.forEach(b => b.el.remove()); balloons = [];
        document.getElementById('start-overlay').classList.remove('hidden');
        score = 0; document.getElementById('balloon-score').textContent = '0';
        audioManager.playClick();
    };
}
