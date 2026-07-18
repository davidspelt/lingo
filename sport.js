let soundEnabled = true;
let audioCtx = null;

function initAudio() {
    if (!audioCtx) { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
}

function playSound(type) {
    if (!soundEnabled) return;
    try {
        initAudio();
        const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
        osc.connect(gain); gain.connect(audioCtx.destination); const now = audioCtx.currentTime;

        if (type === 'plus') {
            osc.type = 'triangle'; osc.frequency.setValueAtTime(523.25, now); gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15); osc.start(now); osc.stop(now + 0.15);
        } else if (type === 'min') {
            osc.type = 'sine'; osc.frequency.setValueAtTime(300, now); gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1); osc.start(now); osc.stop(now + 0.1);
        }
    } catch (e) { console.log("Audio play error", e); }
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    document.getElementById('sound-status').innerText = soundEnabled ? "AAN" : "UIT";
    document.getElementById('sound-icon').innerText = soundEnabled ? "🔊" : "🔇";
    if (document.activeElement) document.activeElement.blur();
}

function adjustSportScore(amount) {
    // Verander de score van het momenteel geselecteerde team
    scores[currentTeam] += amount;
    
    // Voorkom negatieve scores
    if (scores[currentTeam] < 0) scores[currentTeam] = 0;
    
    // Sla de stand centraal op en update de UI
    saveSharedState();
    
    // Geluidje afspelen op basis van plus of min
    if (amount > 0) {
        playSound('plus');
    } else {
        playSound('min');
    }
}