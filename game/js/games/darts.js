/* ============================================ 
   Physics Darts 6.0 (Cafe Edition)
   Features: 
   - Sports Cafe Environment (Wood, Bricks)
   - Atmospheric Lighting
   - 3D Lamp Fixture
   - Professional Physics
   ============================================ */

window.initDartsGame = function (container) {
    console.log("Dart Game Initialized - v6 (Cafe Atmosphere)");

    // UI Overlay
    container.innerHTML = `
        <div id="darts-overlay" style="position:absolute; inset:0; pointer-events:none; z-index:10; font-family:'Outfit', sans-serif;">
            <div style="position:absolute; top:20px; right:20px; text-align:right; color:white; text-shadow:0 2px 4px rgba(0,0,0,0.8);">
                <div style="font-size:12px; opacity:0.8; letter-spacing:1px; color:#f1c40f;">SKOR</div>
                <div id="tk-score" style="font-size:36px; font-weight:800; color:#fff;">0</div>
            </div>
             <div id="darts-left" style="position:absolute; top:20px; left:20px; display:flex; gap:10px;">
                <span class="d-icon" style="font-size:28px; filter:drop-shadow(0 2px 2px rgba(0,0,0,0.5)); transition:opacity 0.3s;">🚀</span>
                <span class="d-icon" style="font-size:28px; filter:drop-shadow(0 2px 2px rgba(0,0,0,0.5)); transition:opacity 0.3s;">🚀</span>
                <span class="d-icon" style="font-size:28px; filter:drop-shadow(0 2px 2px rgba(0,0,0,0.5)); transition:opacity 0.3s;">🚀</span>
            </div>
            
            <div id="aim-hint" style="position:absolute; bottom:100px; left:50%; transform:translateX(-50%); color:rgba(255,255,255,0.4); font-size:14px; text-align:center; text-shadow:0 1px 2px black;">
                👇 Çekip Bırakarak Nişan Al
            </div>

            <div id="tk-msg" style="position:absolute; top:40%; left:50%; transform:translate(-50%,-50%) scale(0); color:white; font-size:56px; font-weight:900; 
                text-shadow:0 4px 15px rgba(0,0,0,0.6); white-space:nowrap;
                background: linear-gradient(to bottom, #fff, #bbb); -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                transition:transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);"></div>
        </div>
        <div id="canvas-container" style="width:100%; height:100%; cursor:grab; background:#050505;"></div>
    `;

    const canvasContainer = document.getElementById('canvas-container');
    const overlayScore = document.getElementById('tk-score');
    const overlayMsg = document.getElementById('tk-msg');

    // --- SCENE SETUP ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x100805); // Very Dark Brown/Black
    scene.fog = new THREE.Fog(0x100805, 20, 90);

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 150);
    camera.position.set(0, 0, 55);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.9;
    canvasContainer.appendChild(renderer.domElement);

    // --- PROCEDURAL TEXTURES ---
    function createWoodTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512; canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Base
        ctx.fillStyle = '#3e2723';
        ctx.fillRect(0, 0, 512, 512);

        // Planks
        ctx.strokeStyle = '#281815';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let i = 0; i < 512; i += 64) {
            ctx.moveTo(0, i); ctx.lineTo(512, i); // Horizontal lines for floor planks
            // Random vertical separations
            for (let j = 0; j < 512; j += 128) {
                if (Math.random() > 0.3) {
                    let off = (Math.random() * 20) - 10;
                    ctx.moveTo(j + off, i); ctx.lineTo(j + off, i + 64);
                }
            }
        }
        ctx.stroke();

        // Grain Noise
        for (let k = 0; k < 5000; k++) {
            ctx.fillStyle = Math.random() > 0.5 ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.05)';
            ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 40);
        }

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(8, 8);
        return tex;
    }

    function createBrickTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512; canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Mortar
        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, 512, 512);

        // Bricks
        const rows = 16;
        const cols = 8;
        const bH = 512 / rows;
        const bW = 512 / cols;

        for (let y = 0; y < rows; y++) {
            const offset = (y % 2) * (bW / 2);
            for (let x = 0; x < cols; x++) {
                ctx.fillStyle = Math.random() > 0.5 ? '#5d4037' : '#4e342e'; // Dark varieties
                // Add noise color
                if (Math.random() > 0.8) ctx.fillStyle = '#3e2723';

                let px = x * bW - offset;
                let py = y * bH;

                if (px < -bW) px += 512 + bW; // wrap fix not perfect but ok

                ctx.fillRect(px + 2, py + 2, bW - 4, bH - 4);
            }
        }
        // Grime overlay
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(0, 0, 512, 512);

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(4, 4);
        return tex;
    }

    // --- ENVIRONMENT ---

    // 1. Floor
    const floorMat = new THREE.MeshStandardMaterial({
        map: createWoodTexture(),
        roughness: 0.8,
        color: 0x888888
    });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -10;
    floor.receiveShadow = true;
    scene.add(floor);

    // 2. Wall
    const wallMat = new THREE.MeshStandardMaterial({
        map: createBrickTexture(),
        roughness: 0.9,
        normalScale: new THREE.Vector2(1, 1), // fake
        color: 0x555555
    });
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(100, 80), wallMat);
    wall.position.z = -2;
    wall.position.y = 10;
    wall.receiveShadow = true;
    scene.add(wall);

    // 3. Rug (Oche)
    const rugGeo = new THREE.PlaneGeometry(12, 20);
    const rugMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 1 });
    const rug = new THREE.Mesh(rugGeo, rugMat);
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(0, -9.9, 45); // Player pos
    rug.receiveShadow = true;
    scene.add(rug);

    // Line mark
    const lineGeo = new THREE.PlaneGeometry(10, 0.5);
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const line = new THREE.Mesh(lineGeo, lineMat);
    line.rotation.x = -Math.PI / 2;
    line.position.set(0, -9.8, 30); // Throw line limit?
    scene.add(line);

    // 4. LAMP FIXTURE
    const lampGroup = new THREE.Group();
    lampGroup.position.set(0, 18, 15); // Above and in front

    // Cord
    const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 10), new THREE.MeshBasicMaterial({ color: 0x111 }));
    cord.position.y = 5;
    lampGroup.add(cord);

    // Shade
    const shadeGeo = new THREE.ConeGeometry(3, 2, 32, 1, true);
    const shadeMat = new THREE.MeshStandardMaterial({ color: 0x1a237e, side: THREE.DoubleSide, metalness: 0.3 });
    const shade = new THREE.Mesh(shadeGeo, shadeMat);
    shade.position.y = 0;
    lampGroup.add(shade);

    // Bulb Glow
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.5), new THREE.MeshBasicMaterial({ color: 0xffaa00 }));
    bulb.position.y = -0.5;
    lampGroup.add(bulb);

    scene.add(lampGroup);

    // --- LIGHTING OVERHAUL ---
    const ambientLight = new THREE.AmbientLight(0xffae00, 0.1); // Very dim orange
    scene.add(ambientLight);

    // Main Spot (The lamp)
    const spotLight = new THREE.SpotLight(0xffbd5b, 2.0);
    spotLight.position.set(0, 17.5, 15);
    spotLight.target.position.set(0, 0, 0); // Aim at board center
    spotLight.castShadow = true;
    spotLight.angle = 0.5; // Narrow cone
    spotLight.penumbra = 0.5; // Soft edges
    spotLight.distance = 100;
    spotLight.decay = 2;
    spotLight.shadow.bias = -0.0001;
    scene.add(spotLight);
    scene.add(spotLight.target);

    // Board Rim Light (cool contrast)
    const rimLight = new THREE.PointLight(0x445588, 0.5, 20);
    rimLight.position.set(-8, -5, -1);
    scene.add(rimLight);

    // --- BOARD TEXTURE & OBJECTS (Reuse previous logic) ---
    // ... Copying createDartboardTexture logic ...
    function createDartboardTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 1024; canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        const cx = 512, cy = 512;

        ctx.fillStyle = '#111'; ctx.fillRect(0, 0, 1024, 1024);
        ctx.beginPath(); ctx.arc(cx, cy, 500, 0, Math.PI * 2); ctx.fillStyle = '#000'; ctx.fill();

        const numbers = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
        const sliceAngle = (Math.PI * 2) / 20;

        for (let i = 0; i < 20; i++) {
            const angle = (i * sliceAngle) - (Math.PI / 2) - (sliceAngle / 2);
            const isAlt = i % 2 === 0;
            const cSingle = isAlt ? '#111' : '#e0cda8'; // Darker beige
            const cRing = isAlt ? '#c62828' : '#2e7d32'; // Darker red/green

            ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, 380, angle, angle + sliceAngle); ctx.fillStyle = cSingle; ctx.fill();
            ctx.beginPath(); ctx.arc(cx, cy, 380, angle, angle + sliceAngle); ctx.arc(cx, cy, 360, angle + sliceAngle, angle, true); ctx.fillStyle = cRing; ctx.fill();
            ctx.beginPath(); ctx.arc(cx, cy, 210, angle, angle + sliceAngle); ctx.arc(cx, cy, 190, angle + sliceAngle, angle, true); ctx.fillStyle = cRing; ctx.fill();

            ctx.save(); ctx.translate(cx, cy); ctx.rotate(angle + sliceAngle / 2);
            ctx.fillStyle = '#fff'; ctx.font = 'bold 60px "Nunito"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(numbers[i].toString(), 440, 0); ctx.restore();
        }

        ctx.beginPath(); ctx.arc(cx, cy, 60, 0, Math.PI * 2); ctx.fillStyle = '#2e7d32'; ctx.fill();
        ctx.beginPath(); ctx.arc(cx, cy, 25, 0, Math.PI * 2); ctx.fillStyle = '#c62828'; ctx.fill();
        return new THREE.CanvasTexture(canvas);
    }

    const boardMat = new THREE.MeshStandardMaterial({ map: createDartboardTexture(), roughness: 0.5, metalness: 0.0 });
    const board = new THREE.Mesh(new THREE.CylinderGeometry(10, 10, 0.5, 64), boardMat);
    board.rotation.x = Math.PI / 2;
    board.receiveShadow = true;
    scene.add(board);

    // Shadow catcher behind board
    const boardShadow = new THREE.Mesh(new THREE.PlaneGeometry(24, 24), new THREE.ShadowMaterial({ opacity: 0.6 }));
    boardShadow.position.z = -1.9;
    boardShadow.receiveShadow = true;
    scene.add(boardShadow);


    // --- DART MODEL (Reuse V5 Fixed) ---
    const dartPivot = new THREE.Group(); scene.add(dartPivot);
    const dartModel = new THREE.Group();

    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.08, 1.5, 12), new THREE.MeshStandardMaterial({ color: 0x888, metalness: 1 }));
    tip.rotation.x = -Math.PI / 2; tip.position.z = -2.5; dartModel.add(tip);

    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.16, 2.5, 12), new THREE.MeshStandardMaterial({ color: 0x333, metalness: 0.8, roughness: 0.4 }));
    barrel.rotation.x = -Math.PI / 2; barrel.position.z = -0.5; dartModel.add(barrel);

    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2, 8), new THREE.MeshStandardMaterial({ color: 0xeee }));
    shaft.rotation.x = -Math.PI / 2; shaft.position.z = 1.75; dartModel.add(shaft);

    const flightGeo = new THREE.BoxGeometry(0.02, 1.5, 1.8);
    const flightMat = new THREE.MeshStandardMaterial({ color: 0xd32f2f, transparent: true, opacity: 0.95 });
    const f1 = new THREE.Mesh(flightGeo, flightMat); f1.position.z = 2.8; dartModel.add(f1);
    const f2 = new THREE.Mesh(flightGeo, flightMat); f2.rotation.z = Math.PI / 2; f2.position.z = 2.8; dartModel.add(f2);

    dartModel.rotation.y = Math.PI; // Correct orientation
    dartPivot.add(dartModel);

    // Trajectory
    const trajPoints = Array(30).fill().map(() => new THREE.Vector3());
    const trajLine = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(trajPoints),
        new THREE.LineBasicMaterial({ color: 0xffaa00, opacity: 0.3, transparent: true }) // Orange trace
    );
    scene.add(trajLine);

    // --- LOGIC (Reuse V9 Physics) ---
    let state = { phase: 'idle', score: 0, darts: 3, power: 0 };
    let phys = { pos: new THREE.Vector3(), vel: new THREE.Vector3(), grav: new THREE.Vector3(0, -0.02, 0) };

    function resetTurn() {
        if (state.darts <= 0) return;
        state.phase = 'idle';
        dartPivot.position.set(2, -3, 45); // Far back
        dartPivot.rotation.set(0, 0, 0);
        dartModel.rotation.set(0.1, Math.PI, 0); // Keep flipped Y + tilt
        trajLine.visible = false;
        canvasContainer.style.cursor = "grab";
    }
    resetTurn();

    let dragStart = { x: 0, y: 0 };
    canvasContainer.addEventListener('mousedown', (e) => {
        if (state.phase !== 'idle') return;
        state.phase = 'aiming';
        dragStart.x = e.clientX;
        dragStart.y = e.clientY;
        trajLine.visible = true;
        canvasContainer.style.cursor = "grabbing";
        document.getElementById('aim-hint').style.opacity = '0';
    });

    canvasContainer.addEventListener('mousemove', (e) => {
        const mx = (e.clientX / window.innerWidth) * 2 - 1;
        const my = -(e.clientY / window.innerHeight) * 2 + 1;

        // Cam Parallax
        camera.position.x = mx * 2;
        camera.position.y = my * 2;
        camera.lookAt(0, 0, 0);

        if (state.phase === 'aiming') {
            const dx = e.clientX - dragStart.x;
            const dy = e.clientY - dragStart.y;
            const pullFactor = Math.min(Math.max(dy, 0), 400) / 400;

            dartPivot.position.z = 45 + (pullFactor * 10);
            dartPivot.position.y = -3 - (pullFactor * 2);
            dartPivot.rotation.y = -(dx * 0.004);
            dartPivot.rotation.x = (pullFactor * 0.3);

            // Power V2
            const power = 0.6 + Math.pow(pullFactor, 2) * 1.6;
            const vel = new THREE.Vector3(0, 0, -power).applyEuler(dartPivot.rotation);
            vel.y += 0.25 * (1 - pullFactor);

            updateTrajectory(dartPivot.position, vel);
            state.power = power;
        }
    });

    canvasContainer.addEventListener('mouseup', (e) => {
        if (state.phase !== 'aiming') return;
        const dy = e.clientY - dragStart.y;
        if (dy < 20) { resetTurn(); return; }
        throwDart();
    });

    function updateTrajectory(start, vel) {
        const p = start.clone();
        const v = vel.clone();
        const pts = [];
        for (let i = 0; i < 30; i++) {
            pts.push(p.clone());
            p.add(v);
            v.add(phys.grav);
            if (p.z < 0) break;
        }
        trajLine.geometry.setFromPoints(pts);
    }

    function throwDart() {
        state.phase = 'flying';
        trajLine.visible = false;
        state.darts--;
        updateIcons();
        if (typeof audioManager !== 'undefined') audioManager.playPop();

        phys.pos.copy(dartPivot.position);

        // Recalc vel to be safe
        let vel = new THREE.Vector3(0, 0, -state.power).applyEuler(dartPivot.rotation);
        // Pull factor approximation for lift
        const pf = (state.power - 0.6) / 1.6;
        vel.y += 0.25 * (1 - Math.sqrt(Math.max(0, pf)));

        phys.vel.copy(vel);
    }

    function animate() {
        requestAnimationFrame(animate);
        if (state.phase === 'flying') {
            phys.pos.add(phys.vel);
            phys.vel.add(phys.grav);
            phys.vel.multiplyScalar(0.998); // Less drag
            dartPivot.position.copy(phys.pos);

            const target = phys.pos.clone().sub(phys.vel);
            dartPivot.lookAt(target);

            if (phys.pos.z <= 0.2) hitDetails();
            else if (phys.pos.y < -10) miss();
        }
        renderer.render(scene, camera);
    }

    function hitDetails() {
        state.phase = 'landed'; measureScore();
    }

    function measureScore() {
        phys.vel.set(0, 0, 0); dartPivot.position.z = 0.2;
        if (typeof audioManager !== 'undefined') audioManager.playCardFlip();

        const dx = dartPivot.position.x;
        const dy = dartPivot.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        let s = 0, t = "MISS";

        // Scoring V6
        if (dist > 10) { s = 0; t = "MISS"; }
        else if (dist < 1.5) { s = 50; t = "BULLSEYE"; }
        else if (dist < 3.2) { s = 25; t = "BULL"; }
        else {
            s = Math.floor(Math.random() * 20) + 1;
            if (dist > 5 && dist < 6) { s *= 3; t = `TRIPLE ${s / 3}`; }
            else if (dist > 9 && dist < 10) { s *= 2; t = `DOUBLE ${s / 2}`; }
            else t = s.toString();
        }

        state.score += s;
        overlayScore.textContent = state.score;
        showMsg(t);
        setTimeout(() => { if (state.darts > 0) resetTurn(); else gameOver(); }, 2000);
    }

    function miss() {
        state.phase = 'landed'; showMsg("OOPS");
        setTimeout(() => { if (state.darts > 0) resetTurn(); else gameOver(); }, 1000);
    }

    function showMsg(txt) {
        overlayMsg.textContent = txt;
        overlayMsg.style.transform = "translate(-50%,-50%) scale(1)";
        setTimeout(() => overlayMsg.style.transform = "translate(-50%,-50%) scale(0)", 1500);
    }

    function updateIcons() {
        document.querySelectorAll('.d-icon').forEach((icon, i) => icon.style.opacity = i < state.darts ? 1 : 0.2);
    }

    function gameOver() {
        showMsg("GAME OVER");
        setTimeout(() => { state.score = 0; state.darts = 3; overlayScore.textContent = "0"; updateIcons(); resetTurn(); }, 3000);
    }

    animate();
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
};
