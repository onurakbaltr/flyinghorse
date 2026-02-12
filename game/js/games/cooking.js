/* ============================================
   Cooking Game - Yemek Pişir!
   v2 — Interactive Prep + Customer Character
   ============================================ */

function initCookingGame(container) {

    // ── Recipe Definitions ──
    const recipes = {
        pizza: {
            name: 'Pizza', emoji: '🍕', cookMethod: 'oven', cookTime: 8000,
            ingredients: [
                { id: 'dough', name: 'Hamur', emoji: '🫓', prepType: 'roll', color: '#F5DEB3' },
                { id: 'sauce', name: 'Sos', emoji: '🍅', prepType: 'chop', color: '#E74C3C' },
                { id: 'cheese', name: 'Peynir', emoji: '🧀', prepType: 'grate', color: '#F1C40F' },
                { id: 'mushroom', name: 'Mantar', emoji: '🍄', prepType: 'chop', color: '#C4A882' },
                { id: 'olive', name: 'Zeytin', emoji: '🫒', prepType: 'slice', color: '#2C3E50' },
                { id: 'pepper', name: 'Biber', emoji: '🫑', prepType: 'chop', color: '#27AE60' }
            ]
        },
        cake: {
            name: 'Pasta', emoji: '🎂', cookMethod: 'oven', cookTime: 10000,
            ingredients: [
                { id: 'flour', name: 'Un', emoji: '🌾', prepType: 'pour', color: '#FDFEFE' },
                { id: 'egg', name: 'Yumurta', emoji: '🥚', prepType: 'crack', color: '#F9E79F' },
                { id: 'milk', name: 'Süt', emoji: '🥛', prepType: 'pour', color: '#FDFEFE' },
                { id: 'sugar', name: 'Şeker', emoji: '🍬', prepType: 'pour', color: '#FDFEFE' },
                { id: 'strawberry', name: 'Çilek', emoji: '🍓', prepType: 'chop', color: '#E74C3C' },
                { id: 'cream', name: 'Krema', emoji: '🍦', prepType: 'pour', color: '#FDFEFE' }
            ]
        },
        cookie: {
            name: 'Kurabiye', emoji: '🍪', cookMethod: 'oven', cookTime: 6000,
            ingredients: [
                { id: 'flour', name: 'Un', emoji: '🌾', prepType: 'pour', color: '#FDFEFE' },
                { id: 'butter', name: 'Tereyağı', emoji: '🧈', prepType: 'slice', color: '#F9E79F' },
                { id: 'sugar', name: 'Şeker', emoji: '🍬', prepType: 'pour', color: '#FDFEFE' },
                { id: 'egg', name: 'Yumurta', emoji: '🥚', prepType: 'crack', color: '#F9E79F' },
                { id: 'chocolate', name: 'Çikolata', emoji: '🍫', prepType: 'chop', color: '#6D4C41' }
            ]
        },
        pasta: {
            name: 'Makarna', emoji: '🍝', cookMethod: 'stove', cookTime: 7000,
            ingredients: [
                { id: 'pasta', name: 'Makarna', emoji: '🍝', prepType: 'pour', color: '#F5DEB3' },
                { id: 'tomato', name: 'Domates', emoji: '🍅', prepType: 'chop', color: '#E74C3C' },
                { id: 'onion', name: 'Soğan', emoji: '🧅', prepType: 'chop', color: '#F0E68C' },
                { id: 'garlic', name: 'Sarımsak', emoji: '🧄', prepType: 'chop', color: '#FDFEFE' },
                { id: 'cheese', name: 'Peynir', emoji: '🧀', prepType: 'grate', color: '#F1C40F' }
            ]
        }
    };

    const prepInstructions = {
        chop: { verb: 'Doğra', icon: '🔪', hint: 'Bıçağa bas ve doğra!' },
        slice: { verb: 'Dilimle', icon: '🔪', hint: 'Dilimlemek için tıkla!' },
        grate: { verb: 'Rendele', icon: '🧀', hint: 'Rendelemek için sürükle!' },
        pour: { verb: 'Dök', icon: '🫗', hint: 'Dökmek için eğ!' },
        crack: { verb: 'Kır', icon: '🥚', hint: 'Kırmak için tıkla!' },
        roll: { verb: 'Aç', icon: '🫓', hint: 'Hamuru açmak için sürükle!' }
    };

    let currentRecipe = null;
    let preparedIngredients = [];
    let currentPrepIndex = -1;
    let prepClickCount = 0;
    let prepActive = false;
    let cookProgress = 0;
    let cookInterval = null;
    let cookDone = false;

    // ── Inject Styles ──
    const style = document.createElement('style');
    style.textContent = `
        .cook-wrap{display:flex;flex-direction:column;height:100%;background:linear-gradient(180deg,#FFF8E1 0%,#FFECB3 100%);overflow:hidden}
        .cook-scene{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:10px;overflow-y:auto;position:relative}

        /* ── Recipe Select ── */
        .recipe-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:18px;max-width:420px;width:100%;padding:10px}
        .recipe-card{display:flex;flex-direction:column;align-items:center;cursor:pointer;transition:transform .25s}
        .recipe-card:active{transform:scale(.93)}
        .rc-inner{width:100%;aspect-ratio:1;border-radius:28px;display:flex;align-items:center;justify-content:center;font-size:4.2rem;position:relative;overflow:hidden;box-shadow:0 8px 28px rgba(0,0,0,.18),inset 0 2px 4px rgba(255,255,255,.7);border:3px solid rgba(255,255,255,.55)}
        .rc-inner .rc-shine{position:absolute;top:-50%;left:-50%;width:200%;height:200%;background:linear-gradient(45deg,transparent 40%,rgba(255,255,255,.35) 50%,transparent 60%);transform:translateX(-100%);animation:shine 3s ease-in-out infinite}
        .recipe-card span{margin-top:10px;font-size:1.15rem;font-weight:700;color:#5D4037}
        .rc-pizza{background:linear-gradient(145deg,#FFCCBC,#FF8A65)}
        .rc-cake{background:linear-gradient(145deg,#F8BBD0,#F48FB1)}
        .rc-cookie{background:linear-gradient(145deg,#FFE0B2,#FFB74D)}
        .rc-pasta{background:linear-gradient(145deg,#C8E6C9,#81C784)}
        .select-title{font-size:1.6rem;font-weight:800;color:#5D4037;margin-bottom:18px;text-align:center}
        .select-sub{font-size:1rem;color:#8D6E63;margin-bottom:8px}

        /* ── Prep Scene ── */
        .prep-area{display:flex;flex-direction:column;align-items:center;width:100%;max-width:500px;gap:10px}
        .prep-title{font-size:1.15rem;font-weight:700;color:#5D4037}
        .prep-progress{display:flex;gap:6px;margin:4px 0}
        .prep-dot{width:14px;height:14px;border-radius:50%;background:#E0E0E0;transition:background .3s,transform .3s}
        .prep-dot.done{background:#66BB6A;transform:scale(1.15)}
        .prep-dot.active{background:#FF9800;animation:pulse 1s infinite}

        /* Interactive Prep Area */
        .prep-station{width:92%;max-width:400px;aspect-ratio:1.4;background:linear-gradient(145deg,#D7B377,#C9A86C);border-radius:22px;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;
            box-shadow:0 6px 24px rgba(0,0,0,.22),inset 0 2px 6px rgba(255,255,255,.3);border:3px solid #BF9B5E;cursor:pointer;-webkit-user-select:none;user-select:none}
        .prep-station::before{content:'';position:absolute;inset:8px;border:2px dashed rgba(255,255,255,.2);border-radius:16px;pointer-events:none}

        /* Food on board */
        .prep-food{position:absolute;font-size:6rem;transition:transform .2s;z-index:3}
        .prep-food.shake{animation:foodShake .15s ease-in-out}
        .prep-food.split{opacity:0;transition:opacity .3s}

        /* Chopped pieces */
        .prep-pieces{position:absolute;display:flex;gap:8px;flex-wrap:wrap;justify-content:center;z-index:3;opacity:0;transition:opacity .4s}
        .prep-pieces.show{opacity:1}
        .prep-piece{font-size:2.5rem;animation:pieceBounce .4s ease-out;filter:drop-shadow(0 2px 4px rgba(0,0,0,.2))}

        /* Cut line */
        .cut-line{position:absolute;width:3px;height:0;background:rgba(0,0,0,.15);z-index:4;transition:height .15s;top:25%}
        .cut-line.show{height:50%}

        /* Knife */
        .prep-knife{position:absolute;font-size:5rem;z-index:5;pointer-events:none;right:10%;top:5%;transform:rotate(-30deg);transition:transform .15s;filter:drop-shadow(0 4px 8px rgba(0,0,0,.3))}
        .prep-knife.chop-anim{animation:knifeChop .25s ease-in-out}

        /* Pour effect */
        .pour-container{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:3}
        .pour-source{font-size:5rem;transition:transform .4s}
        .pour-source.tilted{transform:rotate(-45deg) translateX(-20px)}
        .pour-stream{width:10px;height:0;background:linear-gradient(180deg,rgba(255,255,255,.8),rgba(255,255,200,.6));border-radius:5px;transition:height .4s;margin:-5px 0}
        .pour-stream.flowing{height:70px}
        .pour-bowl-icon{font-size:3.5rem}
        .pour-particles{position:absolute;bottom:30%;left:50%;transform:translateX(-50%);pointer-events:none}
        .pour-particle{position:absolute;width:8px;height:8px;border-radius:50%;animation:particleFall .6s ease-in forwards}

        /* Grate effect */
        .grate-container{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:3}
        .grater{font-size:6rem;position:relative}
        .grate-food{font-size:5rem;position:absolute;top:-15px;transition:transform .15s}
        .grate-food.rub{animation:grateRub .3s ease-in-out}
        .grate-shreds{position:absolute;bottom:-35px;display:flex;gap:3px;flex-wrap:wrap;width:100px;justify-content:center}
        .grate-shred{font-size:1rem;animation:shredFall .3s ease-out forwards}

        /* Crack effect */
        .crack-container{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:3}
        .crack-egg{font-size:6rem;transition:transform .2s;cursor:pointer}
        .crack-egg.cracking{animation:eggCrack .4s ease-in-out}
        .crack-yolk{font-size:4rem;opacity:0;transform:translateY(-20px);transition:all .4s}
        .crack-yolk.show{opacity:1;transform:translateY(10px)}
        .crack-shell-l,.crack-shell-r{position:absolute;font-size:2.5rem;transition:all .4s}
        .crack-shell-l.split{transform:translateX(-40px) rotate(-20deg);opacity:.5}
        .crack-shell-r.split{transform:translateX(40px) rotate(20deg);opacity:.5}

        /* Roll effect */
        .roll-container{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:3}
        .roll-dough{width:100px;height:100px;background:radial-gradient(circle,#F5DEB3,#DEB887);border-radius:50%;transition:all .3s;box-shadow:0 4px 10px rgba(0,0,0,.15)}
        .roll-dough.flat{width:170px;height:45px;border-radius:22px}
        .roll-pin{font-size:3rem;position:absolute;top:10%;transition:transform .2s}
        .roll-pin.rolling{animation:rollingPin .4s ease-in-out}

        /* Prep hint */
        .prep-hint{position:absolute;bottom:12px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,.5);color:#fff;padding:8px 20px;border-radius:20px;font-size:.9rem;font-weight:600;z-index:10;white-space:nowrap;pointer-events:none;animation:pulse 1.5s infinite}

        /* Ingredient indicator */
        .prep-current-label{display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.9);padding:8px 20px;border-radius:20px;font-weight:700;color:#5D4037;box-shadow:0 2px 10px rgba(0,0,0,.08)}
        .prep-current-label .pcl-emoji{font-size:1.6rem}

        /* Bowl */
        .bowl-row{display:flex;align-items:center;gap:12px}
        .bowl{width:110px;height:72px;background:linear-gradient(180deg,#E0E0E0,#BDBDBD);border-radius:0 0 50% 50%;display:flex;align-items:flex-end;justify-content:center;padding-bottom:6px;position:relative;box-shadow:0 4px 12px rgba(0,0,0,.15),inset 0 3px 6px rgba(255,255,255,.4);border:2px solid #9E9E9E;overflow:hidden}
        .bowl-items{display:flex;gap:1px;flex-wrap:wrap;justify-content:center;max-width:90px;z-index:2}
        .bowl-items span{font-size:.8rem}
        .bowl-fill{position:absolute;bottom:0;left:0;width:100%;background:linear-gradient(180deg,rgba(255,165,0,.3),rgba(255,120,0,.5));transition:height .4s;border-radius:0 0 50% 50%}
        .cook-ready-btn{padding:12px 32px;border:none;border-radius:28px;font-size:1.1rem;font-weight:700;cursor:pointer;color:#fff;font-family:inherit;transition:transform .2s;box-shadow:0 6px 20px rgba(0,0,0,.2),inset 0 2px 4px rgba(255,255,255,.3)}
        .cook-ready-btn.active{background:linear-gradient(145deg,#FF7043,#F4511E);animation:pulse 1.2s infinite}
        .cook-ready-btn.inactive{background:#ccc;pointer-events:none}

        /* ── Cook Scene ── */
        .cook-area{display:flex;flex-direction:column;align-items:center;gap:12px;width:100%;max-width:460px}
        .appliance{width:92%;max-width:400px;aspect-ratio:1.1;border-radius:24px;position:relative;display:flex;align-items:center;justify-content:center;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,.25),inset 0 2px 8px rgba(255,255,255,.15)}
        .oven{background:linear-gradient(180deg,#37474F,#263238);border:4px solid #455A64}
        .oven-window{width:70%;aspect-ratio:1.2;background:linear-gradient(180deg,#1B1B1B,#0D0D0D);border-radius:16px;border:3px solid #546E7A;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden}
        .oven-glow{position:absolute;inset:0;background:radial-gradient(ellipse,rgba(255,152,0,0) 40%,transparent 100%);transition:background .5s;border-radius:14px}
        .oven-glow.hot{background:radial-gradient(ellipse,rgba(255,152,0,.5) 5%,rgba(255,87,34,.3) 40%,transparent 100%)}
        .oven-food{font-size:5rem;z-index:2;transition:filter .5s}
        .oven-knob-row{position:absolute;bottom:12px;display:flex;gap:20px}
        .oven-knob{width:26px;height:26px;background:radial-gradient(circle,#78909C,#546E7A);border-radius:50%;border:2px solid #455A64}
        .oven-handle{position:absolute;top:8px;width:60%;height:6px;background:linear-gradient(90deg,#78909C,#B0BEC5,#78909C);border-radius:3px}
        .stove{background:linear-gradient(180deg,#424242,#212121);border:4px solid #616161}
        .stove-top-area{position:relative;display:flex;flex-direction:column;align-items:center}
        .burner-ring{width:160px;height:160px;border-radius:50%;border:8px solid #333;position:relative;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle,#1a1a1a,#111)}
        /* CSS Flames */
        .flames{position:absolute;inset:10px;border-radius:50%;display:flex;align-items:center;justify-content:center}
        .flame{position:absolute;bottom:5px;width:12px;height:28px;background:linear-gradient(0deg,#FF6D00,#FFAB00,#FFF176);border-radius:50% 50% 50% 50%/60% 60% 40% 40%;animation:flameFlicker .4s ease-in-out infinite alternate;opacity:.9}
        .flame:nth-child(1){left:15%;animation-delay:0s;height:24px}
        .flame:nth-child(2){left:30%;animation-delay:.1s;height:30px}
        .flame:nth-child(3){left:45%;animation-delay:.05s}
        .flame:nth-child(4){left:60%;animation-delay:.15s;height:26px}
        .flame:nth-child(5){left:75%;animation-delay:.08s;height:22px}
        .flame:nth-child(6){top:5px;left:20%;animation-delay:.12s;height:20px;transform:rotate(90deg)}
        .flame:nth-child(7){top:5px;right:20%;animation-delay:.06s;height:18px;transform:rotate(-90deg)}
        .flame:nth-child(8){top:15px;left:5%;animation-delay:.1s;height:20px;transform:rotate(60deg)}
        .cook-pot{font-size:5.5rem;z-index:3;position:relative;filter:drop-shadow(0 6px 12px rgba(0,0,0,.3))}
        .pot-steam{position:absolute;top:-35px;left:50%;transform:translateX(-50%);display:flex;gap:8px}
        .steam-puff{width:14px;height:14px;background:rgba(255,255,255,.6);border-radius:50%;animation:steamRise 1.5s ease-out infinite}
        .steam-puff:nth-child(2){animation-delay:.3s;width:12px;height:12px}
        .steam-puff:nth-child(3){animation-delay:.6s;width:10px;height:10px}
        .cook-progress-wrap{width:90%;max-width:380px}
        .cook-progress-label{display:flex;justify-content:space-between;font-size:.85rem;font-weight:700;color:#5D4037;margin-bottom:4px}
        .cook-progress-bar{width:100%;height:28px;background:#E0E0E0;border-radius:14px;overflow:hidden;position:relative;box-shadow:inset 0 2px 6px rgba(0,0,0,.15)}
        .cook-progress-fill{height:100%;border-radius:14px;transition:width .3s,background .3s}
        .cook-progress-zones{position:absolute;inset:0;display:flex;pointer-events:none;border-radius:14px;overflow:hidden}
        .cpz{height:100%}.cpz-raw{width:60%;background:rgba(255,235,59,.15)}.cpz-perfect{width:20%;background:rgba(76,175,80,.2);border-left:2px dashed rgba(76,175,80,.5);border-right:2px dashed rgba(76,175,80,.5)}.cpz-burnt{width:20%;background:rgba(244,67,54,.15)}
        .cook-remove-btn{padding:16px 44px;border:none;border-radius:30px;font-size:1.15rem;font-weight:700;cursor:pointer;color:#fff;font-family:inherit;background:linear-gradient(145deg,#43A047,#2E7D32);box-shadow:0 6px 20px rgba(46,125,50,.35),inset 0 2px 4px rgba(255,255,255,.3);transition:transform .2s}
        .cook-remove-btn:active{transform:scale(.93)}
        .smoke-overlay{position:absolute;inset:0;pointer-events:none;z-index:10;display:flex;align-items:center;justify-content:center}
        .smoke-puff{font-size:3.5rem;position:absolute;animation:smokeRise 2s ease-out infinite;opacity:0}
        @keyframes flameFlicker{0%{transform:scaleY(1) scaleX(1)}100%{transform:scaleY(1.15) scaleX(.9)}}

        /* ── Serve Scene — Realistic Customer ── */
        .serve-area{display:flex;flex-direction:column;align-items:center;width:100%;max-width:460px;gap:0;position:relative}
        .restaurant-bg{width:100%;border-radius:24px;overflow:hidden;position:relative;background:linear-gradient(180deg,#E8739E 0%,#D4628A 35%,#8D6E63 35%,#8D6E63 100%);min-height:420px;display:flex;flex-direction:column;align-items:center;box-shadow:0 8px 30px rgba(0,0,0,.2)}
        .wall-decor{display:flex;gap:30px;margin-top:10px;font-size:1.8rem;opacity:.4}

        /* Realistic CSS Customer */
        .customer-char{position:relative;display:flex;flex-direction:column;align-items:center;margin-top:6px;z-index:5}
        .char-speech{position:absolute;top:-48px;left:50%;transform:translateX(-50%);background:#fff;padding:10px 18px;border-radius:16px;font-size:.9rem;font-weight:600;color:#5D4037;white-space:nowrap;box-shadow:0 3px 12px rgba(0,0,0,.15);z-index:10;animation:popIn .4s cubic-bezier(.68,-.55,.265,1.55)}
        .char-speech::after{content:'';position:absolute;bottom:-8px;left:50%;transform:translateX(-50%);border-left:8px solid transparent;border-right:8px solid transparent;border-top:8px solid #fff}
        /* Head */
        .char-head{width:80px;height:88px;border-radius:42%;background:linear-gradient(180deg,#EDBE8C,#DCA86E);position:relative;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,.15)}
        /* Hair - dark swept */
        .char-hair{position:absolute;top:-6px;left:-4px;right:-4px;height:40px;background:linear-gradient(180deg,#2C2016,#3E2E20);border-radius:44% 44% 0 0;z-index:1}
        .char-hair::after{content:'';position:absolute;top:4px;right:-2px;width:30px;height:22px;background:#2C2016;border-radius:0 40% 0 50%;z-index:2}
        /* Eyes */
        .char-eye-l,.char-eye-r{position:absolute;top:38px;width:8px;height:10px;background:#2C2016;border-radius:50%;z-index:3}
        .char-eye-l{left:22px}.char-eye-r{right:22px}
        .char-eye-l::after,.char-eye-r::after{content:'';position:absolute;top:1px;left:2px;width:3px;height:3px;background:white;border-radius:50%}
        /* Eyebrows */
        .char-brow-l,.char-brow-r{position:absolute;top:32px;width:14px;height:3px;background:#2C2016;border-radius:2px;z-index:3}
        .char-brow-l{left:18px}.char-brow-r{right:18px}
        /* Mouth */
        .char-mouth{position:absolute;bottom:18px;left:50%;transform:translateX(-50%);z-index:3}
        .char-smile{width:16px;height:8px;border:3px solid #C0725E;border-top:none;border-radius:0 0 12px 12px}
        /* Ears */
        .char-ear-l,.char-ear-r{position:absolute;top:42px;width:10px;height:14px;background:#DCA86E;border-radius:50%;z-index:0}
        .char-ear-l{left:-5px}.char-ear-r{right:-5px}
        /* Neck */
        .char-neck{width:24px;height:10px;background:#DCA86E;margin-top:-2px;z-index:2}
        /* Body with vest */
        .char-torso{position:relative;width:90px;height:55px;margin-top:-2px;z-index:1}
        .char-shirt{position:absolute;inset:0;background:linear-gradient(145deg,#E84F6A,#D43F5A);border-radius:16px 16px 0 0}
        .char-vest{position:absolute;top:0;left:8px;right:8px;bottom:0;background:linear-gradient(145deg,#2896A5,#1B7A87);border-radius:12px 12px 0 0;clip-path:polygon(0 0,35% 0,45% 100%,55% 100%,65% 0,100% 0,100% 100%,0 100%)}
        /* Arms */
        .char-arms{display:flex;justify-content:space-between;width:110px;margin-top:-38px;z-index:0}
        .char-arm{width:18px;height:40px;background:linear-gradient(145deg,#EDBE8C,#DCA86E);border-radius:9px}

        /* Table */
        .table-surface{width:92%;height:80px;background:linear-gradient(180deg,#A1887F,#8D6E63);border-radius:16px 16px 0 0;display:flex;align-items:center;justify-content:center;position:relative;box-shadow:0 4px 20px rgba(0,0,0,.2);margin-top:-6px;z-index:2;border-top:4px solid #BCAAA4}
        .table-cloth{position:absolute;top:-3px;left:10%;width:80%;height:8px;background:linear-gradient(90deg,#EF5350,#fff,#EF5350,#fff,#EF5350);border-radius:4px 4px 0 0}
        .table-legs{display:flex;justify-content:space-between;width:70%;z-index:1}
        .table-leg{width:14px;height:50px;background:linear-gradient(180deg,#8D6E63,#6D4C41);border-radius:0 0 4px 4px}
        .serve-plate{width:110px;height:60px;background:linear-gradient(180deg,#FAFAFA,#E0E0E0);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:3rem;box-shadow:0 4px 12px rgba(0,0,0,.15),inset 0 2px 4px rgba(255,255,255,.6);border:2px solid #BDBDBD;z-index:3;animation:plateSlide .6s ease-out}
        .cutlery{position:absolute;display:flex;gap:70px;font-size:1.6rem;top:50%;transform:translateY(-50%);z-index:1;opacity:.5}

        /* Stars */
        .stars-row{display:flex;gap:8px;margin-top:14px}
        .star{font-size:2.6rem;opacity:.2;transition:transform .3s,opacity .3s}
        .star.lit{opacity:1;animation:starPop .4s cubic-bezier(.68,-.55,.265,1.55)}
        .serve-msg{font-size:1.2rem;font-weight:800;color:#5D4037;margin-top:8px}
        .serve-btns{display:flex;gap:12px;margin-top:14px}
        .serve-btn{padding:12px 26px;border:none;border-radius:24px;font-size:1rem;font-weight:700;cursor:pointer;color:#fff;font-family:inherit;transition:transform .2s;box-shadow:0 4px 15px rgba(0,0,0,.15)}
        .serve-btn:active{transform:scale(.93)}
        .serve-btn.again{background:linear-gradient(145deg,#FF7043,#F4511E)}
        .serve-btn.menu{background:linear-gradient(145deg,#42A5F5,#1E88E5)}

        /* ── Animations ── */
        @keyframes knifeChop{0%{transform:rotate(-30deg) translateY(0)}50%{transform:rotate(-5deg) translateY(30px)}100%{transform:rotate(-30deg) translateY(0)}}
        @keyframes foodShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
        @keyframes pieceBounce{0%{transform:scale(0) translateY(10px)}60%{transform:scale(1.3) translateY(-5px)}100%{transform:scale(1) translateY(0)}}
        @keyframes burnerGlow{0%,100%{box-shadow:0 0 20px rgba(244,67,54,.3)}50%{box-shadow:0 0 40px rgba(244,67,54,.6),0 0 60px rgba(255,152,0,.3)}}
        @keyframes steamRise{0%{transform:translateY(0) scale(1);opacity:.7}100%{transform:translateY(-35px) scale(1.8);opacity:0}}
        @keyframes smokeRise{0%{transform:translateY(0) scale(.8);opacity:0}30%{opacity:.6}100%{transform:translateY(-60px) scale(2);opacity:0}}
        @keyframes plateSlide{0%{transform:translateY(40px) scale(.8);opacity:0}100%{transform:translateY(0) scale(1);opacity:1}}
        @keyframes starPop{0%{transform:scale(0)}60%{transform:scale(1.3)}100%{transform:scale(1)}}
        @keyframes grateRub{0%,100%{transform:translateY(0)}50%{transform:translateY(12px)}}
        @keyframes shredFall{0%{transform:translateY(0);opacity:1}100%{transform:translateY(15px);opacity:.7}}
        @keyframes particleFall{0%{transform:translateY(0) scale(1);opacity:.8}100%{transform:translateY(30px) scale(.5);opacity:0}}
        @keyframes rollingPin{0%{transform:translateX(-30px)}50%{transform:translateX(30px)}100%{transform:translateX(-30px)}}
        @keyframes eggCrack{0%{transform:scale(1)}30%{transform:scale(1.1)}50%{transform:scale(.95)}100%{transform:scale(0)}}
        @keyframes popIn{0%{transform:translateX(-50%) scale(0)}100%{transform:translateX(-50%) scale(1)}}

        @media(max-width:400px){
            .recipe-grid{gap:12px}.rc-inner{border-radius:20px}
            .prep-station{aspect-ratio:1.3}
            .restaurant-bg{min-height:350px}
        }
    `;
    container.appendChild(style);

    // ══════════════════════════════════
    //  RECIPE SELECT
    // ══════════════════════════════════
    function renderSelect() {
        scene().innerHTML = `
            <div class="select-title">🍳 Ne Pişirmek İstersin?</div>
            <div class="select-sub">Bir tarif seç ve aşçılığa başla!</div>
            <div class="recipe-grid">
                ${Object.entries(recipes).map(([k, r]) => `
                    <div class="recipe-card" onclick="cookSelectRecipe('${k}')">
                        <div class="rc-inner rc-${k}">${r.emoji}<div class="rc-shine"></div></div>
                        <span>${r.name}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    window.cookSelectRecipe = function (key) {
        playClick();
        currentRecipe = { ...recipes[key], key };
        preparedIngredients = [];
        currentPrepIndex = -1;
        cookProgress = 0;
        cookDone = false;
        renderPrep();
    };

    // ══════════════════════════════════
    //  INGREDIENT PREPARATION
    // ══════════════════════════════════
    function renderPrep() {
        const r = currentRecipe;
        scene().innerHTML = `
            <div class="prep-area">
                <div class="prep-title">${r.emoji} ${r.name} — Malzemeleri Hazırla!</div>
                <div class="prep-progress" id="prep-progress">
                    ${r.ingredients.map((_, i) => `<div class="prep-dot" id="pdot-${i}"></div>`).join('')}
                </div>
                <div class="prep-current-label" id="prep-label">
                    <span class="pcl-emoji">👆</span>
                    <span id="prep-label-text">Başlamak için tıkla!</span>
                </div>
                <div class="prep-station" id="prep-station">
                    <div id="prep-content" style="display:flex;align-items:center;justify-content:center;font-size:3rem;color:rgba(0,0,0,.2)">👆 Başla!</div>
                </div>
                <div class="bowl-row">
                    <div class="bowl" id="prep-bowl">
                        <div class="bowl-fill" id="bowl-fill" style="height:0%"></div>
                        <div class="bowl-items" id="bowl-items"></div>
                    </div>
                    <button class="cook-ready-btn inactive" id="cook-ready-btn" onclick="cookGoToCook()">🔥 Pişir!</button>
                </div>
            </div>
        `;
        // Start first ingredient
        advanceToNextIngredient();
    }

    function advanceToNextIngredient() {
        currentPrepIndex++;
        prepClickCount = 0;
        prepActive = true;

        if (currentPrepIndex >= currentRecipe.ingredients.length) {
            // All done
            prepActive = false;
            const btn = document.getElementById('cook-ready-btn');
            if (btn) { btn.classList.remove('inactive'); btn.classList.add('active'); }
            const label = document.getElementById('prep-label-text');
            if (label) label.textContent = 'Tüm malzemeler hazır! 🎉';
            const emoji = document.querySelector('.pcl-emoji');
            if (emoji) emoji.textContent = '✅';
            return;
        }

        const ing = currentRecipe.ingredients[currentPrepIndex];
        const info = prepInstructions[ing.prepType];

        // Update dot
        const dot = document.getElementById(`pdot-${currentPrepIndex}`);
        if (dot) dot.classList.add('active');

        // Update label
        const label = document.getElementById('prep-label-text');
        if (label) label.textContent = `${info.verb}: ${ing.name} ${ing.emoji}`;
        const emoji = document.querySelector('.pcl-emoji');
        if (emoji) emoji.textContent = info.icon;

        // Render interactive prep
        renderPrepInteraction(ing);
    }

    function renderPrepInteraction(ing) {
        const station = document.getElementById('prep-station');
        if (!station) return;
        const type = ing.prepType;
        const requiredClicks = type === 'pour' ? 3 : type === 'crack' ? 2 : type === 'roll' ? 5 : type === 'grate' ? 5 : 4;

        // Remove old listeners
        station.onclick = null;

        if (type === 'chop' || type === 'slice') {
            station.innerHTML = `
                <div class="prep-food" id="prep-food">${ing.emoji}</div>
                <div class="prep-knife" id="prep-knife">🔪</div>
                <div class="prep-pieces" id="prep-pieces"></div>
                <div class="prep-hint">${prepInstructions[type].hint} (${requiredClicks}x)</div>
            `;
            station.onclick = () => handleChop(ing, requiredClicks);
        } else if (type === 'pour') {
            station.innerHTML = `
                <div class="pour-container" id="pour-container">
                    <div class="pour-source" id="pour-source">${ing.emoji}</div>
                    <div class="pour-stream" id="pour-stream"></div>
                    <div class="pour-bowl-icon">🥣</div>
                    <div class="pour-particles" id="pour-particles"></div>
                </div>
                <div class="prep-hint">Dökmek için tıkla! (${requiredClicks}x)</div>
            `;
            station.onclick = () => handlePour(ing, requiredClicks);
        } else if (type === 'grate') {
            station.innerHTML = `
                <div class="grate-container">
                    <div class="grater">
                        <div style="font-size:4rem">🪒</div>
                        <div class="grate-food" id="grate-food">${ing.emoji}</div>
                        <div class="grate-shreds" id="grate-shreds"></div>
                    </div>
                </div>
                <div class="prep-hint">Rendelemek için tıkla! (${requiredClicks}x)</div>
            `;
            station.onclick = () => handleGrate(ing, requiredClicks);
        } else if (type === 'crack') {
            station.innerHTML = `
                <div class="crack-container">
                    <div style="display:flex;flex-direction:column;align-items:center;gap:8px;position:relative">
                        <div class="crack-egg" id="crack-egg">${ing.emoji}</div>
                        <div class="crack-yolk" id="crack-yolk">🍳</div>
                        <div class="crack-shell-l" id="crack-shell-l" style="display:none">🥚</div>
                        <div class="crack-shell-r" id="crack-shell-r" style="display:none">🥚</div>
                    </div>
                </div>
                <div class="prep-hint">Kırmak için tıkla! (${requiredClicks}x)</div>
            `;
            station.onclick = () => handleCrack(ing, requiredClicks);
        } else if (type === 'roll') {
            station.innerHTML = `
                <div class="roll-container">
                    <div style="display:flex;flex-direction:column;align-items:center;gap:10px;position:relative">
                        <div class="roll-pin" id="roll-pin">🪈</div>
                        <div class="roll-dough" id="roll-dough"></div>
                    </div>
                </div>
                <div class="prep-hint">Açmak için tıkla! (${requiredClicks}x)</div>
            `;
            station.onclick = () => handleRoll(ing, requiredClicks);
        }
    }

    // ── Chop / Slice ──
    function handleChop(ing, required) {
        if (!prepActive) return;
        prepClickCount++;
        playClick();

        const food = document.getElementById('prep-food');
        const knife = document.getElementById('prep-knife');
        const pieces = document.getElementById('prep-pieces');

        if (food) { food.classList.remove('shake'); void food.offsetWidth; food.classList.add('shake'); }
        if (knife) { knife.classList.remove('chop-anim'); void knife.offsetWidth; knife.classList.add('chop-anim'); }

        // Add pieces (food splits into visible chunks)
        if (pieces) {
            const p = document.createElement('span');
            p.className = 'prep-piece';
            p.textContent = ing.emoji;
            p.style.animationDelay = (prepClickCount * 0.05) + 's';
            pieces.appendChild(p);
        }

        if (prepClickCount >= required) {
            if (food) food.classList.add('split');
            if (pieces) pieces.classList.add('show');
            setTimeout(() => finishIngredient(ing), 500);
        }
    }

    // ── Pour ──
    function handlePour(ing, required) {
        if (!prepActive) return;
        prepClickCount++;
        playClick();

        const source = document.getElementById('pour-source');
        const stream = document.getElementById('pour-stream');
        const particles = document.getElementById('pour-particles');

        if (source) { source.classList.add('tilted'); setTimeout(() => source.classList.remove('tilted'), 400); }
        if (stream) { stream.classList.add('flowing'); setTimeout(() => stream.classList.remove('flowing'), 500); }

        // Particles
        if (particles) {
            for (let i = 0; i < 4; i++) {
                const p = document.createElement('div');
                p.className = 'pour-particle';
                p.style.background = ing.color;
                p.style.left = (Math.random() * 30 - 15) + 'px';
                p.style.animationDelay = (Math.random() * 0.2) + 's';
                particles.appendChild(p);
                setTimeout(() => p.remove(), 700);
            }
        }

        if (prepClickCount >= required) {
            setTimeout(() => finishIngredient(ing), 600);
        }
    }

    // ── Grate ──
    function handleGrate(ing, required) {
        if (!prepActive) return;
        prepClickCount++;
        playClick();

        const food = document.getElementById('grate-food');
        const shreds = document.getElementById('grate-shreds');

        if (food) { food.classList.remove('rub'); void food.offsetWidth; food.classList.add('rub'); }

        if (shreds) {
            for (let i = 0; i < 3; i++) {
                const s = document.createElement('span');
                s.className = 'grate-shred';
                s.textContent = '🟡';
                s.style.animationDelay = (i * 0.1) + 's';
                shreds.appendChild(s);
            }
        }

        if (prepClickCount >= required) {
            setTimeout(() => finishIngredient(ing), 400);
        }
    }

    // ── Crack ──
    function handleCrack(ing, required) {
        if (!prepActive) return;
        prepClickCount++;
        playClick();

        const egg = document.getElementById('crack-egg');

        if (prepClickCount === 1 && egg) {
            egg.style.transform = 'scale(1.1)';
            egg.classList.add('cracking');
        }

        if (prepClickCount >= required) {
            if (egg) egg.style.display = 'none';
            const yolk = document.getElementById('crack-yolk');
            if (yolk) yolk.classList.add('show');
            const sl = document.getElementById('crack-shell-l');
            const sr = document.getElementById('crack-shell-r');
            if (sl) { sl.style.display = 'block'; sl.classList.add('split'); }
            if (sr) { sr.style.display = 'block'; sr.classList.add('split'); }
            setTimeout(() => finishIngredient(ing), 600);
        }
    }

    // ── Roll ──
    function handleRoll(ing, required) {
        if (!prepActive) return;
        prepClickCount++;
        playClick();

        const pin = document.getElementById('roll-pin');
        const dough = document.getElementById('roll-dough');

        if (pin) { pin.classList.remove('rolling'); void pin.offsetWidth; pin.classList.add('rolling'); }

        if (dough) {
            const progress = prepClickCount / required;
            const w = 100 + progress * 90;
            const h = 100 - progress * 60;
            dough.style.width = w + 'px';
            dough.style.height = h + 'px';
            if (progress >= 1) dough.style.borderRadius = '22px';
        }

        if (prepClickCount >= required) {
            setTimeout(() => finishIngredient(ing), 400);
        }
    }

    function finishIngredient(ing) {
        prepActive = false;
        preparedIngredients.push(ing.id);

        // Mark dot
        const dot = document.getElementById(`pdot-${currentPrepIndex}`);
        if (dot) { dot.classList.remove('active'); dot.classList.add('done'); }

        // Add to bowl
        const bowlItems = document.getElementById('bowl-items');
        if (bowlItems) {
            const sp = document.createElement('span');
            sp.textContent = ing.emoji;
            sp.style.animation = 'popIn .3s cubic-bezier(.68,-.55,.265,1.55)';
            bowlItems.appendChild(sp);
        }
        const fillPct = (preparedIngredients.length / currentRecipe.ingredients.length) * 100;
        const fill = document.getElementById('bowl-fill');
        if (fill) fill.style.height = fillPct + '%';

        // Advance
        setTimeout(() => advanceToNextIngredient(), 300);
    }

    // ══════════════════════════════════
    //  COOKING
    // ══════════════════════════════════
    window.cookGoToCook = function () {
        if (preparedIngredients.length < currentRecipe.ingredients.length) return;
        playClick();
        renderCook();
    };

    function renderCook() {
        const r = currentRecipe;
        const isOven = r.cookMethod === 'oven';
        scene().innerHTML = `
            <div class="cook-area">
                <div class="prep-title">${r.emoji} ${r.name} — ${isOven ? 'Fırında' : 'Ocakta'} Pişir!</div>
                <div class="appliance ${isOven ? 'oven' : 'stove'}" id="appliance">
                    ${isOven ? `
                        <div class="oven-handle"></div>
                        <div class="oven-window" id="oven-window">
                            <div class="oven-glow" id="oven-glow"></div>
                            <div class="oven-food" id="cook-food">${r.emoji}</div>
                        </div>
                        <div class="oven-knob-row"><div class="oven-knob"></div><div class="oven-knob"></div><div class="oven-knob"></div></div>
                    ` : `
                        <div class="stove-top-area">
                            <div class="burner-ring">
                                <div class="flames">
                                    <div class="flame"></div><div class="flame"></div><div class="flame"></div>
                                    <div class="flame"></div><div class="flame"></div>
                                    <div class="flame"></div><div class="flame"></div><div class="flame"></div>
                                </div>
                                <div class="cook-pot" id="cook-food">🍳
                                    <div class="pot-steam" id="pot-steam">
                                        <div class="steam-puff"></div><div class="steam-puff"></div><div class="steam-puff"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `}
                    <div class="smoke-overlay" id="smoke-overlay" style="display:none">
                        <div class="smoke-puff" style="left:30%;animation-delay:0s">💨</div>
                        <div class="smoke-puff" style="left:50%;animation-delay:.4s">💨</div>
                        <div class="smoke-puff" style="left:70%;animation-delay:.8s">💨</div>
                    </div>
                </div>
                <div class="cook-progress-wrap">
                    <div class="cook-progress-label"><span>Çiğ 🥩</span><span>Mükemmel ✅</span><span>Yanmış 🔥</span></div>
                    <div class="cook-progress-bar">
                        <div class="cook-progress-zones"><div class="cpz cpz-raw"></div><div class="cpz cpz-perfect"></div><div class="cpz cpz-burnt"></div></div>
                        <div class="cook-progress-fill" id="cook-fill" style="width:0%"></div>
                    </div>
                </div>
                <button class="cook-remove-btn" id="cook-remove-btn" onclick="cookRemoveFood()">
                    ${isOven ? '🧤 Fırından Çıkar!' : '🍽️ Ocaktan Al!'}
                </button>
            </div>
        `;
        startCooking();
    }

    function startCooking() {
        cookProgress = 0; cookDone = false;
        const step = 100 / (currentRecipe.cookTime / 100);
        const isOven = currentRecipe.cookMethod === 'oven';
        cookInterval = setInterval(() => {
            if (cookDone) return;
            cookProgress += step;
            const fill = document.getElementById('cook-fill');
            if (!fill) { clearInterval(cookInterval); return; }
            fill.style.width = Math.min(cookProgress, 100) + '%';
            if (cookProgress < 60) {
                fill.style.background = 'linear-gradient(90deg,#FFF176,#FFD54F)';
            } else if (cookProgress < 80) {
                fill.style.background = 'linear-gradient(90deg,#66BB6A,#43A047)';
                if (isOven) { const g = document.getElementById('oven-glow'); if (g) g.classList.add('hot'); }
            } else {
                fill.style.background = 'linear-gradient(90deg,#EF5350,#C62828)';
                const smoke = document.getElementById('smoke-overlay'); if (smoke) smoke.style.display = 'flex';
                const food = document.getElementById('cook-food');
                if (food) food.style.filter = `brightness(${Math.max(0.3, 1 - (cookProgress - 80) / 40)})`;
            }
            if (cookProgress >= 100) { clearInterval(cookInterval); cookProgress = 100; }
        }, 100);
    }

    window.cookRemoveFood = function () {
        if (cookDone) return;
        cookDone = true; clearInterval(cookInterval);
        playClick(); renderServe();
    };

    // ══════════════════════════════════
    //  SERVE — Customer at Table
    // ══════════════════════════════════
    function renderServe() {
        const r = currentRecipe;
        const ingScore = preparedIngredients.length / r.ingredients.length;
        let cookScore;
        if (cookProgress >= 60 && cookProgress < 80) cookScore = 1;
        else if (cookProgress >= 50 && cookProgress < 90) cookScore = 0.6;
        else if (cookProgress >= 40 && cookProgress < 95) cookScore = 0.3;
        else cookScore = 0.1;

        const total = ingScore * 0.4 + cookScore * 0.6;
        let stars;
        if (total >= 0.9) stars = 5;
        else if (total >= 0.7) stars = 4;
        else if (total >= 0.5) stars = 3;
        else if (total >= 0.3) stars = 2;
        else stars = 1;

        const reactions = {
            5: { face: '😍', speech: 'Muhteşem! En güzel yemek!', msg: 'Harika Şef! 🌟' },
            4: { face: '😊', speech: 'Çok lezzetli, teşekkürler!', msg: 'Çok Güzel! 👏' },
            3: { face: '🙂', speech: 'Fena değil, idare eder!', msg: 'İyi Deneme! 👍' },
            2: { face: '😕', speech: 'Biraz daha çalışmalısın...', msg: 'Tekrar Dene! 💪' },
            1: { face: '😢', speech: 'Bu biraz yanmış gibi...', msg: 'Bir Dahakine! 🔥' }
        };
        const rx = reactions[stars];
        const foodEmoji = cookProgress >= 90 ? '🥴' : r.emoji;

        // Randomize customer look
        const hairs = ['👦', '👧', '👱', '👩‍🦱', '🧒'];
        const bodyColors = [
            ['#42A5F5', '#1E88E5'], ['#EF5350', '#C62828'], ['#66BB6A', '#2E7D32'],
            ['#AB47BC', '#7B1FA2'], ['#FFA726', '#F57C00']
        ];
        const hair = hairs[Math.floor(Math.random() * hairs.length)];
        const bc = bodyColors[Math.floor(Math.random() * bodyColors.length)];

        scene().innerHTML = `
            <div class="serve-area">
                <div class="restaurant-bg">
                    <div class="wall-decor">🖼️ 🕰️ 🪴</div>

                    <div class="customer-char" id="customer-char">
                        <div class="char-speech" id="char-speech">${rx.speech}</div>
                        <div class="char-head">
                            <div class="char-hair"></div>
                            <div class="char-brow-l"></div><div class="char-brow-r"></div>
                            <div class="char-eye-l"></div><div class="char-eye-r"></div>
                            <div class="char-mouth"><div class="char-smile" id="char-mouth-el"></div></div>
                            <div class="char-ear-l"></div><div class="char-ear-r"></div>
                        </div>
                        <div class="char-neck"></div>
                        <div class="char-torso">
                            <div class="char-shirt"></div>
                            <div class="char-vest"></div>
                        </div>
                        <div class="char-arms">
                            <div class="char-arm"></div>
                            <div class="char-arm"></div>
                        </div>
                    </div>

                    <div class="table-surface">
                        <div class="table-cloth"></div>
                        <div class="cutlery"><span>🍴</span><span>🍴</span></div>
                        <div class="serve-plate" id="serve-plate">${foodEmoji}</div>
                    </div>
                    <div class="table-legs">
                        <div class="table-leg"></div>
                        <div class="table-leg"></div>
                    </div>
                </div>

                <div class="stars-row" id="stars-row">
                    ${[1, 2, 3, 4, 5].map(i => `<div class="star" id="star-${i}">⭐</div>`).join('')}
                </div>
                <div class="serve-msg" id="serve-msg">${rx.msg}</div>
                <div class="serve-btns">
                    <button class="serve-btn again" onclick="cookAgain()">🔄 Tekrar Pişir</button>
                    <button class="serve-btn menu" onclick="cookGoMenu()">📋 Tarif Seç</button>
                </div>
            </div>
        `;

        // Set mouth based on rating
        const mouthEl = document.getElementById('char-mouth-el');
        if (mouthEl) {
            if (stars <= 2) {
                mouthEl.style.borderBottom = '3px solid #C0725E';
                mouthEl.style.borderTop = 'none';
                mouthEl.style.borderRadius = '12px 12px 0 0';
            }
        }

        // Animate stars
        for (let i = 1; i <= stars; i++) {
            setTimeout(() => {
                const s = document.getElementById(`star-${i}`);
                if (s) s.classList.add('lit');
                playClick();
            }, i * 350);
        }
        if (stars >= 4) {
            setTimeout(() => { if (typeof showCelebration === 'function') showCelebration(); }, stars * 350 + 500);
        }
    }

    window.cookAgain = function () {
        playClick(); preparedIngredients = []; currentPrepIndex = -1; cookProgress = 0; cookDone = false;
        renderPrep();
    };

    window.cookGoMenu = function () {
        playClick(); currentRecipe = null; preparedIngredients = []; currentPrepIndex = -1; cookProgress = 0; cookDone = false;
        renderSelect();
    };

    // ── Helpers ──
    function scene() { return container.querySelector('.cook-scene'); }
    function playClick() { if (typeof audioManager !== 'undefined') { try { audioManager.playClick(); } catch (e) { } } }

    // ── Init ──
    container.innerHTML = `<div class="cook-wrap"><div class="cook-scene"></div></div>`;
    container.appendChild(style);
    renderSelect();
}
