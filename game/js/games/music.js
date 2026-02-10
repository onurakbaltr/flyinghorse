/* ============================================
   Music Game - Müzik Bahçesi
   ============================================ */

function initMusicGame(container) {
    const instruments = [
        { name: 'Ksilofon', icon: '🎹', notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C2'], colors: ['#E74C3C', '#E67E22', '#F1C40F', '#2ECC71', '#3498DB', '#9B59B6', '#FF6B9D', '#E74C3C'] },
        { name: 'Davul', icon: '🥁', notes: ['kick', 'snare', 'hihat'], colors: ['#E74C3C', '#F1C40F', '#3498DB'] }
    ];

    let currentInstrument = 0;

    container.innerHTML = `
        <div class="music-container">
            <div class="music-header">
                <div class="instrument-tabs">
                    ${instruments.map((inst, i) => `
                        <button class="inst-btn ${i === 0 ? 'active' : ''}" data-index="${i}">
                            ${inst.icon} ${inst.name}
                        </button>
                    `).join('')}
                </div>
            </div>
            <div class="music-area" id="music-area"></div>
            <div class="music-footer">
                <div class="music-tip">🎵 Tuşlara dokun ve müzik yap!</div>
            </div>
        </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
        .music-container { display:flex; flex-direction:column; height:100%; }
        .music-header { padding:15px; background:rgba(255,255,255,0.9); }
        .instrument-tabs { display:flex; justify-content:center; gap:10px; }
        .inst-btn { padding:12px 24px; border:none; border-radius:25px; background:white; font-size:1rem; font-weight:600; font-family:inherit; cursor:pointer; box-shadow:0 4px 15px rgba(0,0,0,0.1); transition:all 0.2s; }
        .inst-btn.active { background:linear-gradient(145deg,var(--purple),var(--pink)); color:white; }
        .music-area { flex:1; display:flex; align-items:center; justify-content:center; padding:20px; }
        .music-footer { padding:15px; text-align:center; }
        .music-tip { background:white; display:inline-block; padding:10px 25px; border-radius:25px; font-weight:600; color:var(--purple); box-shadow:0 4px 15px rgba(0,0,0,0.1); }
        
        .xylophone { display:flex; align-items:flex-end; justify-content:center; gap:8px; height:100%; }
        .xylo-key { width:50px; border-radius:10px 10px 5px 5px; cursor:pointer; display:flex; align-items:flex-end; justify-content:center; padding-bottom:15px; color:white; font-weight:700; font-size:1.2rem; text-shadow:0 2px 4px rgba(0,0,0,0.3); box-shadow:0 6px 20px rgba(0,0,0,0.2),inset 0 2px 4px rgba(255,255,255,0.3); transition:transform 0.1s,box-shadow 0.1s; }
        .xylo-key:active { transform:translateY(5px); box-shadow:0 2px 10px rgba(0,0,0,0.2); }
        .xylo-key.playing { animation:jelly 0.3s; }
        
        .drums { display:flex; flex-wrap:wrap; justify-content:center; gap:20px; }
        .drum-pad { width:100px; height:100px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:2rem; box-shadow:0 10px 30px rgba(0,0,0,0.2),inset 0 5px 10px rgba(255,255,255,0.3),inset 0 -5px 10px rgba(0,0,0,0.1); transition:transform 0.1s; }
        .drum-pad:active { transform:scale(0.95); }
        .drum-pad.playing { animation:pulse 0.2s; }
    `;
    container.appendChild(style);

    container.querySelectorAll('.inst-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            container.querySelectorAll('.inst-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentInstrument = parseInt(btn.dataset.index);
            renderInstrument();
            audioManager.playClick();
        });
    });

    renderInstrument();

    function renderInstrument() {
        const area = document.getElementById('music-area');
        const inst = instruments[currentInstrument];

        if (inst.name === 'Ksilofon') {
            area.innerHTML = `<div class="xylophone">${inst.notes.map((note, i) => {
                const height = 180 + (7 - i) * 20;
                return `<div class="xylo-key" data-note="${note}" style="background:${inst.colors[i]};height:${height}px">${note.replace('2', '')}</div>`;
            }).join('')}</div>`;

            area.querySelectorAll('.xylo-key').forEach(key => {
                const playNote = () => {
                    key.classList.add('playing');
                    audioManager.playXylophone(key.dataset.note);
                    setTimeout(() => key.classList.remove('playing'), 200);
                };
                key.addEventListener('mousedown', playNote);
                key.addEventListener('touchstart', (e) => { e.preventDefault(); playNote(); });
            });
        } else {
            area.innerHTML = `<div class="drums">${inst.notes.map((note, i) =>
                `<div class="drum-pad" data-drum="${note}" style="background:linear-gradient(145deg,${inst.colors[i]},${inst.colors[i]}dd)">${note === 'kick' ? '🥁' : note === 'snare' ? '🪘' : '🔔'}</div>`
            ).join('')}</div>`;

            area.querySelectorAll('.drum-pad').forEach(pad => {
                const playDrum = () => {
                    pad.classList.add('playing');
                    audioManager.playDrum(pad.dataset.drum);
                    setTimeout(() => pad.classList.remove('playing'), 200);
                };
                pad.addEventListener('mousedown', playDrum);
                pad.addEventListener('touchstart', (e) => { e.preventDefault(); playDrum(); });
            });
        }
    }
}
