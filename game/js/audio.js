/* ============================================ 
   Flying Horses - Audio System 
   Sound Effects & Music using Web Audio API 
   ============================================ */

class AudioManager {
    constructor() {
        this.enabled = true;
        this.context = null;
        this.masterGain = null;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.context.createGain();
            this.masterGain.connect(this.context.destination);
            this.masterGain.gain.value = 0.5;
            this.initialized = true;
        } catch (e) {
            console.warn('Web Audio API not supported');
            this.enabled = false;
        }
    }

    resume() {
        if (this.context && this.context.state === 'suspended') {
            this.context.resume();
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        if (this.masterGain) {
            this.masterGain.gain.value = this.enabled ? 0.5 : 0;
        }
        return this.enabled;
    }

    playTone(frequency, duration, type = 'sine', volume = 0.3) {
        if (!this.enabled || !this.initialized) return;
        this.resume();
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);
        gainNode.gain.setValueAtTime(volume, this.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);
        oscillator.start(this.context.currentTime);
        oscillator.stop(this.context.currentTime + duration);
    }

    playMelody(notes, tempo = 200) {
        if (!this.enabled || !this.initialized) return;
        notes.forEach((note, index) => {
            setTimeout(() => {
                this.playTone(note.freq, note.duration || 0.2, 'sine', 0.3);
            }, index * tempo);
        });
    }

    playClick() { this.playTone(800, 0.1, 'sine', 0.2); }
    playPop() {
        this.playTone(400, 0.1, 'sine', 0.3);
        setTimeout(() => this.playTone(600, 0.1, 'sine', 0.2), 50);
    }

    playSuccess() {
        const notes = [
            { freq: 523.25, duration: 0.1 },
            { freq: 659.25, duration: 0.1 },
            { freq: 783.99, duration: 0.2 },
        ];
        this.playMelody(notes, 100);
    }

    playWin() {
        const notes = [
            { freq: 523.25, duration: 0.15 }, { freq: 587.33, duration: 0.15 },
            { freq: 659.25, duration: 0.15 }, { freq: 698.46, duration: 0.15 },
            { freq: 783.99, duration: 0.15 }, { freq: 880.00, duration: 0.15 },
            { freq: 987.77, duration: 0.15 }, { freq: 1046.50, duration: 0.3 }
        ];
        this.playMelody(notes, 100);
    }

    playError() { this.playTone(200, 0.2, 'sawtooth', 0.2); }

    playBalloonPop() {
        if (!this.enabled || !this.initialized) return;
        this.resume();
        const bufferSize = this.context.sampleRate * 0.1;
        const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = this.context.createBufferSource();
        const gainNode = this.context.createGain();
        const filter = this.context.createBiquadFilter();
        noise.buffer = buffer; filter.type = 'highpass'; filter.frequency.value = 1000;
        noise.connect(filter); filter.connect(gainNode); gainNode.connect(this.masterGain);
        gainNode.gain.setValueAtTime(0.4, this.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.1);
        noise.start(); noise.stop(this.context.currentTime + 0.1);
        this.playTone(300, 0.05, 'sine', 0.3);
    }

    playCardFlip() { this.playTone(500, 0.08, 'triangle', 0.2); }
    playMatch() {
        this.playTone(600, 0.1, 'sine', 0.3);
        setTimeout(() => this.playTone(800, 0.15, 'sine', 0.3), 100);
    }
    playPuzzleSnap() {
        this.playTone(700, 0.1, 'sine', 0.3);
        setTimeout(() => this.playTone(900, 0.1, 'sine', 0.2), 50);
    }
    playPaint() { this.playTone(400 + Math.random() * 200, 0.05, 'sine', 0.15); }

    playMusicalNote(note) {
        const frequencies = { 'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88, 'C5': 523.25 };
        const freq = frequencies[note] || 440;
        this.playTone(freq, 0.4, 'sine', 0.4);
    }

    playXylophone(note) {
        if (!this.enabled || !this.initialized) return;
        this.resume();
        const frequencies = { 'C': 523.25, 'D': 587.33, 'E': 659.25, 'F': 698.46, 'G': 783.99, 'A': 880.00, 'B': 987.77, 'C2': 1046.50 };
        const freq = frequencies[note] || 523.25;
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();
        oscillator.connect(gainNode); gainNode.connect(this.masterGain);
        oscillator.type = 'triangle'; oscillator.frequency.setValueAtTime(freq, this.context.currentTime);
        gainNode.gain.setValueAtTime(0.5, this.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.8);
        oscillator.start(this.context.currentTime); oscillator.stop(this.context.currentTime + 0.8);
    }

    playDrum(type = 'kick') {
        if (!this.enabled || !this.initialized) return;
        this.resume();
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();
        oscillator.connect(gainNode); gainNode.connect(this.masterGain);
        if (type === 'kick') {
            oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(150, this.context.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.3);
            gainNode.gain.setValueAtTime(0.5, this.context.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.3);
        } else if (type === 'snare') {
            oscillator.type = 'triangle'; oscillator.frequency.setValueAtTime(200, this.context.currentTime);
            gainNode.gain.setValueAtTime(0.3, this.context.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.1);
        } else if (type === 'hihat') {
            oscillator.type = 'square'; oscillator.frequency.setValueAtTime(1000, this.context.currentTime);
            gainNode.gain.setValueAtTime(0.1, this.context.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.05);
        }
        oscillator.start(); oscillator.stop(this.context.currentTime + 0.5);
    }
}

const audioManager = new AudioManager();

document.addEventListener('click', () => { audioManager.init(); }, { once: true });
document.addEventListener('touchstart', () => { audioManager.init(); }, { once: true });
