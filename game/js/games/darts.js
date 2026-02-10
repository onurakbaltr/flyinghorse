/* ============================================ 
   Physics Darts 10.0 (Mobile Touch Fix)
   Features: 
   - Mobile Touch Events (Start/Move/End)
   - Touch-Action: None (Prevents Scroll)
   - Camera Zoom & Accurate Scoring
   - Native Forward Geometry (-Z)
   ============================================ */

window.initDartsGame = function (container) {
    console.log("Dart Game Initialized - v10 (Mobile Fix)");

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
            <div id="aim-hint" style="position:absolute; bottom:15%; left:50%; transform:translateX(-50%); color:rgba(255,255,255,0.4); font-size:14px; text-align:center; text-shadow:0 1px 2px black;">
                👇 Çekip Bırakarak Nişan Al
            </div>
            <div id="tk-msg" style="position:absolute; top:40%; left:50%; transform:translate(-50%,-50%) scale(0); color:white; font-size:56px; font-weight:900; 
                text-shadow:0 4px 15px rgba(0,0,0,0.6); white-space:nowrap;
                background: linear-gradient(to bottom, #fff, #bbb); -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                transition:transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);"></div>
        </div>
        <div id="canvas-container" style="width:100%; height:100%; cursor:grab; background:#050505; touch-action: none;"></div>
    `;

    const canvasContainer = document.getElementById('canvas-container');
    const overlayScore = document.getElementById('tk-score');
    const overlayMsg = document.getElementById('tk-msg');

    // SCENE
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050302);
    scene.fog = new THREE.Fog(0x050302, 20, 100);

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 150);
    const CAM_START = new THREE.Vector3(0, 0, 55);
    camera.position.copy(CAM_START);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 1.2;
    canvasContainer.appendChild(renderer.domElement);

    // TEXTURES
    function createWoodTexture() {
        const c = document.createElement('canvas'); c.width = 512; c.height = 512; const x = c.getContext('2d');
        x.fillStyle = '#3e2723'; x.fillRect(0, 0, 512, 512);
        x.strokeStyle = '#281815'; x.lineWidth = 3; x.beginPath();
        for (let i = 0; i < 512; i += 64) { x.moveTo(0, i); x.lineTo(512, i); for (let j = 0; j < 512; j += 128) if (Math.random() > 0.3) { let o = (Math.random() * 20) - 10; x.moveTo(j + o, i); x.lineTo(j + o, i + 64); } } x.stroke();
        const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(8, 8); return t;
    }
    function createBrickTexture() {
        const c = document.createElement('canvas'); c.width = 512; c.height = 512; const x = c.getContext('2d');
        x.fillStyle = '#222'; x.fillRect(0, 0, 512, 512);
        const r = 16, cl = 8, bh = 512 / r, bw = 512 / cl;
        for (let y = 0; y < r; y++) { const o = (y % 2) * (bw / 2); for (let i = 0; i < cl; i++) { x.fillStyle = Math.random() > 0.5 ? '#5d4037' : '#4e342e'; let px = i * bw - o; if (px < -bw) px += 512 + bw; x.fillRect(px + 2, y * bh + 2, bw - 4, bh - 4); } }
        x.fillStyle = 'rgba(0,0,0,0.4)'; x.fillRect(0, 0, 512, 512);
        const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 4); return t;
    }

    // ENV
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshStandardMaterial({ map: createWoodTexture(), roughness: 0.8 }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = -10; floor.receiveShadow = true; scene.add(floor);

    const wall = new THREE.Mesh(new THREE.PlaneGeometry(100, 80), new THREE.MeshStandardMaterial({ map: createBrickTexture(), roughness: 0.9 }));
    wall.position.z = -2; wall.position.y = 10; wall.receiveShadow = true; scene.add(wall);

    const rug = new THREE.Mesh(new THREE.PlaneGeometry(12, 20), new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 1 }));
    rug.rotation.x = -Math.PI / 2; rug.position.set(0, -9.9, 45); rug.receiveShadow = true; scene.add(rug);

    // LAMP
    const lampGroup = new THREE.Group(); lampGroup.position.set(0, 15, 12); scene.add(lampGroup);
    lampGroup.add(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 15), new THREE.MeshStandardMaterial({ color: 0x111 })).translateY(7.5));
    const pts = [new THREE.Vector2(0, 0), new THREE.Vector2(1, 0.2), new THREE.Vector2(2.5, 1), new THREE.Vector2(3, 2.5), new THREE.Vector2(0.3, 2.5), new THREE.Vector2(0.3, 3), new THREE.Vector2(0, 3)];
    const shade = new THREE.Mesh(new THREE.LatheGeometry(pts, 32), new THREE.MeshStandardMaterial({ color: 0x212121, side: THREE.DoubleSide })); shade.rotation.x = Math.PI; lampGroup.add(shade);
    lampGroup.add(new THREE.Mesh(new THREE.SphereGeometry(0.6), new THREE.MeshBasicMaterial({ color: 0xffaa00 })).translateY(-1));
    const vol = new THREE.Mesh(new THREE.ConeGeometry(5, 15, 32, 1, true), new THREE.MeshBasicMaterial({ color: 0xffd54f, transparent: true, opacity: 0.08, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false })); vol.position.y = -7.5; lampGroup.add(vol);

    // LIGHTS
    scene.add(new THREE.AmbientLight(0xffae00, 0.15));
    const spot = new THREE.SpotLight(0xffb74d, 2.5); spot.position.set(0, 15, 12); spot.target.position.set(0, 0, 0);
    spot.castShadow = true; spot.angle = 0.6; spot.penumbra = 0.8; spot.decay = 2; spot.distance = 80; scene.add(spot); scene.add(spot.target);

    // BOARD
    function createBoardTex() {
        const c = document.createElement('canvas'); c.width = 1024; c.height = 1024; const x = c.getContext('2d'); const cx = 512, cy = 512;
        x.fillStyle = '#111'; x.fillRect(0, 0, 1024, 1024); x.beginPath(); x.arc(cx, cy, 500, 0, Math.PI * 2); x.fillStyle = '#000'; x.fill();
        const nums = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5], sa = (Math.PI * 2) / 20;
        for (let i = 0; i < 20; i++) {
            const a = (i * sa) - (Math.PI / 2) - (sa / 2); const alt = i % 2 == 0;
            x.beginPath(); x.moveTo(cx, cy); x.arc(cx, cy, 380, a, a + sa); x.fillStyle = alt ? '#111' : '#e0cda8'; x.fill();
            x.beginPath(); x.arc(cx, cy, 380, a, a + sa); x.arc(cx, cy, 360, a + sa, a, true); x.fillStyle = alt ? '#c62828' : '#2e7d32'; x.fill();
            x.beginPath(); x.arc(cx, cy, 210, a, a + sa); x.arc(cx, cy, 190, a + sa, a, true); x.fillStyle = alt ? '#c62828' : '#2e7d32'; x.fill();
            x.save(); x.translate(cx, cy); x.rotate(a + sa / 2); x.fillStyle = '#fff'; x.font = 'bold 60px "Nunito"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(nums[i].toString(), 440, 0); x.restore();
        }
        x.beginPath(); x.arc(cx, cy, 60, 0, Math.PI * 2); x.fillStyle = '#2e7d32'; x.fill(); x.beginPath(); x.arc(cx, cy, 25, 0, Math.PI * 2); x.fillStyle = '#c62828'; x.fill(); return new THREE.CanvasTexture(c);
    }
    const board = new THREE.Mesh(new THREE.CylinderGeometry(10, 10, 0.5, 64), new THREE.MeshStandardMaterial({ map: createBoardTex(), roughness: 0.5 }));
    board.rotation.x = Math.PI / 2; board.receiveShadow = true; scene.add(board);

    // DART
    const dartPivot = new THREE.Group(); scene.add(dartPivot);
    const dartModel = new THREE.Group();
    // Tip -Z
    dartModel.add(new THREE.Mesh(new THREE.ConeGeometry(0.08, 1.5, 12), new THREE.MeshStandardMaterial({ color: 0x999, metalness: 1 })).rotateX(-Math.PI / 2).translateZ(-2.5));
    dartModel.add(new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.16, 2.5, 12), new THREE.MeshStandardMaterial({ color: 0x333, roughness: 0.4 })).rotateX(-Math.PI / 2).translateZ(-0.5));
    dartModel.add(new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2, 8), new THREE.MeshStandardMaterial({ color: 0xeee })).rotateX(-Math.PI / 2).translateZ(1.75));
    const fMat = new THREE.MeshStandardMaterial({ color: 0xd32f2f, side: THREE.DoubleSide, transparent: true, opacity: 0.95 }); const fGeo = new THREE.BoxGeometry(0.02, 1.5, 1.8);
    dartModel.add(new THREE.Mesh(fGeo, fMat).translateZ(2.8)); dartModel.add(new THREE.Mesh(fGeo, fMat).rotateZ(Math.PI / 2).translateZ(2.8));
    dartPivot.add(dartModel);

    // LOGIC
    const trajLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(Array(30).fill().map(() => new THREE.Vector3())), new THREE.LineBasicMaterial({ color: 0xffaa00, opacity: 0.4, transparent: true })); scene.add(trajLine);
    let state = { phase: 'idle', score: 0, darts: 3, power: 0, vel: new THREE.Vector3() };
    let phys = { pos: new THREE.Vector3(), vel: new THREE.Vector3(), grav: new THREE.Vector3(0, -0.02, 0) };

    function resetTurn() {
        if (state.darts <= 0) return;
        state.phase = 'idle';
        dartPivot.position.set(2, -3, 45);
        dartPivot.rotation.set(0, 0, 0);
        dartModel.rotation.set(0.1, 0, 0);
        camera.position.copy(CAM_START);
        camera.lookAt(0, 0, 0);
        trajLine.visible = false; container.style.cursor = "grab";
    }
    resetTurn();

    // INPUT LOGIC
    let dragStart = { x: 0, y: 0 };

    function handleStart(x, y) {
        if (state.phase !== 'idle') return;
        state.phase = 'aiming';
        dragStart = { x: x, y: y };
        trajLine.visible = true;
        container.style.cursor = "grabbing";
        document.getElementById('aim-hint').style.opacity = '0';
    }

    function handleMove(x, y) {
        if (state.phase === 'idle' || state.phase === 'aiming') {
            const mx = (x / window.innerWidth) * 2 - 1, my = -(y / window.innerHeight) * 2 + 1;
            camera.position.x = mx * 2; camera.position.y = my * 2; camera.position.z = 55;
            camera.lookAt(0, 0, 0);
        }
        if (state.phase === 'aiming') {
            const dx = x - dragStart.x;
            const dy = y - dragStart.y;
            const pull = Math.min(Math.max(dy, 0), 400) / 400;

            dartPivot.position.z = 45 + (pull * 10);
            dartPivot.position.y = -3 - (pull * 2);
            dartPivot.rotation.y = -(dx * 0.004);
            dartPivot.rotation.x = (pull * 0.3);

            const power = 0.6 + Math.pow(pull, 2) * 1.6;
            state.power = power;
            const vel = new THREE.Vector3(0, 0, -power).applyEuler(dartPivot.rotation);
            vel.y += 0.25 * (1 - pull);
            state.vel = vel;
            updateTrajectory(dartPivot.position, vel);
        }
    }

    function handleEnd(currentY) {
        if (state.phase !== 'aiming') return;
        // Check throw or cancel
        if ((currentY - dragStart.y) < 20) { resetTurn(); return; }
        throwDart();
    }

    // MOUSE EVENTS
    container.addEventListener('mousedown', e => handleStart(e.clientX, e.clientY));
    container.addEventListener('mousemove', e => handleMove(e.clientX, e.clientY));
    container.addEventListener('mouseup', e => handleEnd(e.clientY));

    // TOUCH EVENTS (Passive: false required to use preventDefault)
    container.addEventListener('touchstart', e => {
        e.preventDefault();
        handleStart(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: false });

    container.addEventListener('touchmove', e => {
        e.preventDefault();
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: false });

    container.addEventListener('touchend', e => {
        e.preventDefault();
        // changedTouches required for touchend
        handleEnd(e.changedTouches[0].clientY);
    }, { passive: false });


    function updateTrajectory(p, v) {
        let tp = p.clone(), tv = v.clone(), pts = [];
        for (let i = 0; i < 30; i++) { pts.push(tp.clone()); tp.add(tv); tv.add(phys.grav); if (tp.z < 0) break; }
        trajLine.geometry.setFromPoints(pts);
    }

    function throwDart() {
        state.phase = 'flying'; trajLine.visible = false; state.darts--; updateIcons();
        if (typeof audioManager !== 'undefined') audioManager.playPop();
        phys.pos.copy(dartPivot.position);

        let vel = new THREE.Vector3(0, 0, -state.power).applyEuler(dartPivot.rotation);
        let pf = (state.power - 0.6) / 1.6;
        vel.y += 0.25 * (1 - Math.sqrt(Math.max(0, pf)));
        phys.vel.copy(vel);
    }

    function animate() {
        requestAnimationFrame(animate);
        if (state.phase === 'flying' || state.phase === 'landed') {
            if (state.phase === 'flying') {
                phys.pos.add(phys.vel); phys.vel.add(phys.grav); phys.vel.multiplyScalar(0.998);
                dartPivot.position.copy(phys.pos);
                dartPivot.lookAt(phys.pos.clone().sub(phys.vel));
                if (phys.pos.z <= 0.2) hitDetails();
                else if (phys.pos.y < -10) { state.phase = 'landed'; showMsg("OOPS"); setTimeout(() => { if (state.darts > 0) resetTurn(); else gameOver(); }, 1000); }
            }
            // Zoom
            const camTarget = new THREE.Vector3(dartPivot.position.x * 0.5, dartPivot.position.y * 0.5, dartPivot.position.z + 15);
            if (camTarget.z < 15) camTarget.z = 15;
            camera.position.lerp(camTarget, 0.05);
            camera.lookAt(dartPivot.position.x * 0.2, dartPivot.position.y * 0.2, 0);
        }
        renderer.render(scene, camera);
    }

    function hitDetails() {
        state.phase = 'landed'; phys.vel.set(0, 0, 0); dartPivot.position.z = 0.2;
        if (typeof audioManager !== 'undefined') audioManager.playCardFlip();
        const dx = dartPivot.position.x, dy = dartPivot.position.y, dist = Math.sqrt(dx * dx + dy * dy);
        let s = 0, t = "MISS";
        if (dist > 7.7) { s = 0; t = "MISS"; }
        else if (dist < 0.5) { s = 50; t = "BULLSEYE"; }
        else if (dist < 1.2) { s = 25; t = "BULL"; }
        else {
            let theta = Math.atan2(dx, dy); if (theta < 0) theta += Math.PI * 2;
            const sliceIdx = Math.round(theta / (Math.PI / 10)) % 20;
            const numbers = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
            const baseScore = numbers[sliceIdx];
            if (dist > 3.8 && dist < 4.2) { s = baseScore * 3; t = `TRIPLE ${baseScore}`; }
            else if (dist > 7.2 && dist < 7.6) { s = baseScore * 2; t = `DOUBLE ${baseScore}`; }
            else { s = baseScore; t = baseScore.toString(); }
        }
        state.score += s; overlayScore.textContent = state.score; showMsg(t);
        setTimeout(() => { if (state.darts > 0) resetTurn(); else gameOver(); }, 2000);
    }

    function showMsg(txt) { overlayMsg.textContent = txt; overlayMsg.style.transform = "translate(-50%,-50%) scale(1)"; setTimeout(() => overlayMsg.style.transform = "translate(-50%,-50%) scale(0)", 1500); }
    function updateIcons() { document.querySelectorAll('.d-icon').forEach((x, i) => x.style.opacity = i < state.darts ? 1 : 0.2); }
    function gameOver() { showMsg("GAME OVER"); setTimeout(() => { state.score = 0; state.darts = 3; overlayScore.textContent = "0"; updateIcons(); resetTurn(); }, 3000); }

    animate();
    window.addEventListener('resize', () => { camera.aspect = container.clientWidth / container.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(container.clientWidth, container.clientHeight); });
};
