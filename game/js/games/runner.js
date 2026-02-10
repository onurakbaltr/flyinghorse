/* ============================================
   Kitty Runner Game - Kedi Koşusu
   Hello Kitty style cat jumping over dogs
   ============================================ */

function initKittyRunnerGame(container) {
    let gameActive = false;
    let score = 0;
    let catY = 0;
    let velocity = 0;
    let isJumping = false;
    let animationId = null;
    let foods = [];
    let dogs = [];
    let groundY = 0;
    let gameSpeed = 4;
    let catFrame = 0;
    let frameCount = 0;

    const GRAVITY = 0.7;
    const JUMP_FORCE = -15;
    const CAT_WIDTH = 70;
    const CAT_HEIGHT = 70;
    const FOOD_SIZE = 35;
    const DOG_WIDTH = 55;
    const DOG_HEIGHT = 45;

    container.innerHTML = `
        <div class="runner-container">
            <div class="runner-header">
                <div class="runner-score">
                    <span class="score-icon">🍰</span>
                    <span class="score-value" id="runner-score">0</span>
                </div>
            </div>
            <div class="runner-game-wrapper">
                <canvas id="runner-canvas"></canvas>
                <div class="runner-start-overlay" id="runner-start">
                    <div class="start-kitty">🐱</div>
                    <h2>Kedi Koşusu!</h2>
                    <p>Köpeklerden kaç, mamaları topla!</p>
                    <p class="tap-hint">👆 Zıplamak için dokun</p>
                    <button class="game-btn success start-game-btn">🎮 Başla!</button>
                </div>
                <div class="runner-gameover hidden" id="runner-gameover">
                    <h2>🐶 Yakalandın!</h2>
                    <p>Toplanan: <span id="final-score">0</span> 🍰</p>
                    <button class="game-btn success restart-game-btn">🔄 Tekrar</button>
                </div>
            </div>
        </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
        .runner-container { display:flex; flex-direction:column; height:100%; background:linear-gradient(180deg,#87CEEB 0%,#E0F7FA 60%,#90EE90 100%); }
        .runner-header { padding:15px; display:flex; justify-content:center; }
        .runner-score { display:flex; align-items:center; gap:10px; background:linear-gradient(145deg,#fff,#f0f0f0); padding:12px 25px; border-radius:30px; box-shadow:0 6px 20px rgba(0,0,0,0.15); }
        .score-icon { font-size:1.8rem; }
        .score-value { font-size:1.8rem; font-weight:800; color:var(--pink); }
        .runner-game-wrapper { flex:1; position:relative; display:flex; align-items:center; justify-content:center; padding:10px; }
        #runner-canvas { width:100%; max-width:400px; height:100%; max-height:500px; border-radius:20px; box-shadow:0 10px 40px rgba(0,0,0,0.2); touch-action:none; cursor:pointer; }
        .runner-start-overlay, .runner-gameover { position:absolute; inset:10px; display:flex; flex-direction:column; align-items:center; justify-content:center; background:rgba(255,255,255,0.95); border-radius:20px; text-align:center; z-index:10; }
        .runner-start-overlay.hidden, .runner-gameover.hidden { display:none; }
        .start-kitty { font-size:5rem; animation:bounce 1s infinite; margin-bottom:15px; }
        .runner-start-overlay h2, .runner-gameover h2 { color:var(--pink); font-size:1.8rem; margin-bottom:10px; }
        .runner-start-overlay p, .runner-gameover p { color:#666; margin-bottom:10px; font-size:1rem; }
        .tap-hint { background:var(--pink); color:white; padding:8px 20px; border-radius:20px; font-weight:600; margin-bottom:15px; }
    `;
    container.appendChild(style);

    const canvas = document.getElementById('runner-canvas');
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        const wrapper = canvas.parentElement;
        canvas.width = Math.min(400, wrapper.clientWidth - 20);
        canvas.height = Math.min(500, wrapper.clientHeight - 20);
        groundY = canvas.height - 60;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Hello Kitty style cat
    function drawCat(x, y, frame) {
        const w = CAT_WIDTH, h = CAT_HEIGHT;

        // Body
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(x + w / 2, y + h * 0.65, w * 0.35, h * 0.28, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Head
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x + w / 2, y + h * 0.35, w * 0.36, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Ears
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(x + w * 0.22, y + h * 0.22);
        ctx.lineTo(x + w * 0.14, y - h * 0.02);
        ctx.lineTo(x + w * 0.35, y + h * 0.12);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x + w * 0.78, y + h * 0.22);
        ctx.lineTo(x + w * 0.86, y - h * 0.02);
        ctx.lineTo(x + w * 0.65, y + h * 0.12);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        // Pink inner ears
        ctx.fillStyle = '#FFB6C1';
        ctx.beginPath();
        ctx.moveTo(x + w * 0.24, y + h * 0.20);
        ctx.lineTo(x + w * 0.18, y + h * 0.04);
        ctx.lineTo(x + w * 0.32, y + h * 0.14);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(x + w * 0.76, y + h * 0.20);
        ctx.lineTo(x + w * 0.82, y + h * 0.04);
        ctx.lineTo(x + w * 0.68, y + h * 0.14);
        ctx.closePath();
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.ellipse(x + w * 0.36, y + h * 0.32, 5, 7, 0, 0, Math.PI * 2);
        ctx.ellipse(x + w * 0.64, y + h * 0.32, 5, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(x + w * 0.34, y + h * 0.30, 2, 0, Math.PI * 2);
        ctx.arc(x + w * 0.62, y + h * 0.30, 2, 0, Math.PI * 2);
        ctx.fill();

        // Nose (yellow like Hello Kitty)
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.ellipse(x + w / 2, y + h * 0.42, 4, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Whiskers
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x + w * 0.08, y + h * 0.38); ctx.lineTo(x + w * 0.30, y + h * 0.40);
        ctx.moveTo(x + w * 0.08, y + h * 0.46); ctx.lineTo(x + w * 0.30, y + h * 0.45);
        ctx.moveTo(x + w * 0.92, y + h * 0.38); ctx.lineTo(x + w * 0.70, y + h * 0.40);
        ctx.moveTo(x + w * 0.92, y + h * 0.46); ctx.lineTo(x + w * 0.70, y + h * 0.45);
        ctx.stroke();

        // Red bow (Hello Kitty signature)
        ctx.fillStyle = '#FF6B9D';
        ctx.beginPath();
        ctx.ellipse(x + w * 0.18, y + h * 0.06, 10, 7, -0.3, 0, Math.PI * 2);
        ctx.ellipse(x + w * 0.08, y + h * 0.14, 8, 6, 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(x + w * 0.14, y + h * 0.10, 4, 0, Math.PI * 2);
        ctx.fill();

        // Legs (animated when running)
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        const legOffset = isJumping ? -8 : Math.sin(frame * 0.4) * 6;

        ctx.beginPath();
        ctx.ellipse(x + w * 0.35, y + h * 0.90 + legOffset, 7, 10, 0, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(x + w * 0.65, y + h * 0.90 - legOffset, 7, 10, 0, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();

        // Tail
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x + w * 0.85, y + h * 0.58);
        ctx.quadraticCurveTo(x + w + 8, y + h * 0.40 + Math.sin(frame * 0.25) * 6, x + w * 0.88, y + h * 0.25);
        ctx.stroke();
    }

    // Draw cute dog obstacle
    function drawDog(x, y) {
        const w = DOG_WIDTH, h = DOG_HEIGHT;

        // Body
        ctx.fillStyle = '#DEB887';
        ctx.beginPath();
        ctx.ellipse(x + w / 2, y + h * 0.6, w * 0.42, h * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Head
        ctx.fillStyle = '#DEB887';
        ctx.beginPath();
        ctx.arc(x + w * 0.75, y + h * 0.35, w * 0.28, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Ears (floppy)
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.ellipse(x + w * 0.60, y + h * 0.25, 8, 14, -0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(x + w * 0.88, y + h * 0.28, 8, 12, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Snout
        ctx.fillStyle = '#F5DEB3';
        ctx.beginPath();
        ctx.ellipse(x + w * 0.85, y + h * 0.42, 10, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(x + w * 0.70, y + h * 0.32, 4, 0, Math.PI * 2);
        ctx.arc(x + w * 0.82, y + h * 0.32, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(x + w * 0.69, y + h * 0.30, 1.5, 0, Math.PI * 2);
        ctx.arc(x + w * 0.81, y + h * 0.30, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Nose
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.ellipse(x + w * 0.90, y + h * 0.40, 4, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Legs
        ctx.fillStyle = '#DEB887';
        ctx.strokeStyle = '#8B4513';
        const legAnim = Math.sin(frameCount * 0.5) * 3;
        ctx.beginPath();
        ctx.ellipse(x + w * 0.25, y + h * 0.88 + legAnim, 6, 10, 0, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(x + w * 0.45, y + h * 0.88 - legAnim, 6, 10, 0, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(x + w * 0.65, y + h * 0.85, 5, 8, 0, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();

        // Tail (wagging)
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x + w * 0.12, y + h * 0.50);
        ctx.quadraticCurveTo(x - 5, y + h * 0.25 + Math.sin(frameCount * 0.6) * 8, x + 5, y + h * 0.15);
        ctx.stroke();
    }

    function drawFood(x, y, type) {
        const emojis = ['🍰', '🧁', '🍩', '🍪', '🍬', '🍭'];
        ctx.font = `${FOOD_SIZE}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(emojis[type % emojis.length], x, y);
    }

    function drawBackground() {
        // Sky
        const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
        skyGrad.addColorStop(0, '#87CEEB');
        skyGrad.addColorStop(1, '#E8F5E9');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, canvas.width, groundY);

        // Clouds
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        const cloudOffset = (frameCount * 0.3) % (canvas.width + 100);
        [[60, 45], [180, 65], [320, 40]].forEach(([cx, cy]) => {
            const x = (cx - cloudOffset + canvas.width + 100) % (canvas.width + 100) - 50;
            ctx.beginPath();
            ctx.arc(x, cy, 22, 0, Math.PI * 2);
            ctx.arc(x + 22, cy - 8, 18, 0, Math.PI * 2);
            ctx.arc(x + 44, cy, 22, 0, Math.PI * 2);
            ctx.fill();
        });

        // Buildings
        const buildingColors = ['#FFB6C1', '#87CEEB', '#DDA0DD', '#98FB98', '#FFE4B5', '#B0E0E6'];
        const buildings = [[15, 85], [70, 105], [130, 75], [200, 95], [270, 70], [330, 88]];
        buildings.forEach(([bx, bh], i) => {
            ctx.fillStyle = buildingColors[i];
            ctx.fillRect(bx, groundY - bh, 45, bh);
            // Windows
            ctx.fillStyle = '#FFFFFF';
            for (let wy = groundY - bh + 12; wy < groundY - 15; wy += 22) {
                ctx.fillRect(bx + 8, wy, 12, 12);
                ctx.fillRect(bx + 25, wy, 12, 12);
            }
        });

        // Ground (street)
        ctx.fillStyle = '#707070';
        ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);

        // Street lines
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 4;
        ctx.setLineDash([25, 18]);
        const lineOffset = (frameCount * gameSpeed) % 43;
        ctx.beginPath();
        ctx.moveTo(-lineOffset, groundY + 30);
        ctx.lineTo(canvas.width, groundY + 30);
        ctx.stroke();
        ctx.setLineDash([]);

        // Grass strip
        ctx.fillStyle = '#7CCD7C';
        ctx.fillRect(0, groundY - 4, canvas.width, 6);
    }

    function spawnFood() {
        if (Math.random() < 0.025 && (foods.length === 0 || foods[foods.length - 1].x < canvas.width - 100)) {
            foods.push({
                x: canvas.width + 20,
                y: groundY - 60 - Math.random() * 80,
                type: Math.floor(Math.random() * 6)
            });
        }
    }

    function spawnDog() {
        if (Math.random() < 0.012 && (dogs.length === 0 || dogs[dogs.length - 1].x < canvas.width - 200)) {
            dogs.push({
                x: canvas.width + 20,
                y: groundY - DOG_HEIGHT
            });
        }
    }

    function update() {
        if (!gameActive) return;

        frameCount++;

        // Cat physics
        velocity += GRAVITY;
        catY += velocity;

        if (catY >= groundY - CAT_HEIGHT) {
            catY = groundY - CAT_HEIGHT;
            velocity = 0;
            isJumping = false;
        }

        // Update foods
        foods = foods.filter(food => {
            food.x -= gameSpeed;

            const catCenterX = 60 + CAT_WIDTH / 2;
            const catCenterY = catY + CAT_HEIGHT / 2;
            const dist = Math.hypot(food.x - catCenterX, food.y - catCenterY);

            if (dist < 38) {
                score++;
                document.getElementById('runner-score').textContent = score;
                audioManager.playSuccess();
                if (score % 8 === 0 && gameSpeed < 8) gameSpeed += 0.3;
                return false;
            }

            return food.x > -FOOD_SIZE;
        });

        // Update dogs
        dogs = dogs.filter(dog => {
            dog.x -= gameSpeed;

            // Collision with cat (more forgiving hitbox)
            const catLeft = 60 + 10;
            const catRight = 60 + CAT_WIDTH - 15;
            const catBottom = catY + CAT_HEIGHT - 5;
            const catTop = catY + 15;

            const dogLeft = dog.x + 8;
            const dogRight = dog.x + DOG_WIDTH - 8;
            const dogTop = dog.y + 10;

            if (catRight > dogLeft && catLeft < dogRight && catBottom > dogTop && catTop < dog.y + DOG_HEIGHT) {
                endGame();
            }

            return dog.x > -DOG_WIDTH;
        });

        spawnFood();
        spawnDog();
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawBackground();

        // Draw foods
        foods.forEach(food => drawFood(food.x, food.y, food.type));

        // Draw dogs
        dogs.forEach(dog => drawDog(dog.x, dog.y));

        // Draw cat
        drawCat(60, catY, frameCount);
    }

    function gameLoop() {
        update();
        draw();
        if (gameActive) animationId = requestAnimationFrame(gameLoop);
    }

    function jump() {
        if (!gameActive) return;
        if (!isJumping) {
            velocity = JUMP_FORCE;
            isJumping = true;
            audioManager.playPop();
        }
    }

    function endGame() {
        gameActive = false;
        cancelAnimationFrame(animationId);
        document.getElementById('final-score').textContent = score;
        document.getElementById('runner-gameover').classList.remove('hidden');
        audioManager.playError();
    }

    function startGame() {
        document.getElementById('runner-start').classList.add('hidden');
        document.getElementById('runner-gameover').classList.add('hidden');

        gameActive = true;
        score = 0;
        catY = groundY - CAT_HEIGHT;
        velocity = 0;
        isJumping = false;
        foods = [];
        dogs = [];
        gameSpeed = 4;
        frameCount = 0;

        document.getElementById('runner-score').textContent = '0';
        audioManager.playClick();

        gameLoop();
    }

    // Event listeners
    canvas.addEventListener('click', jump);
    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); jump(); });

    container.querySelector('.start-game-btn').addEventListener('click', startGame);
    container.querySelector('.restart-game-btn').addEventListener('click', startGame);

    // Initial draw
    catY = groundY - CAT_HEIGHT;
    draw();
}
