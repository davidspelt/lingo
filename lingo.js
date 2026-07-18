const defaultWords = {
    5: ["water", "brood", "fiets", "stoel", "tafel", "bloem", "vogel", "groen", "blauw", "appel", "herfst", "zomer", "kabel", "jeugd", "graan", "schat", "draad", "vloer", "plant", "spoor", "trein", "krant", "feest", "storm", "grens", "piano", "brand", "kaart", "droom", "vlees"],
    6: ["banaan", "koffie", "tomaat", "school", "leraar", "winter", "wortel", "dromen", "geluid", "polder", "kasteel", "reizen", "boeken", "vriend", "muziek", "strand", "vlucht", "slapen", "zuster", "dokter", "keuken", "zolder", "wereld", "oranje", "vlieg", "penseel", "camera", "huizen", "glazen", "straten"],
    10: ["bibliotheek", "vliegtuigen", "universiteit", "computeren", "schilderij", "wandelingen", "ziekenhuizen", "speelplaats", "chocolades", "kabeljauwen", "tekenfilm", "hoofdstad", "speelgoed", "sportvelden", "vriendschap", "vogelkooi", "aardbeving", "bosbranden", "werelddeel", "wintertijd", "klaslokaal", "regendruppel", "vuurtorens", "zandstrand", "bloementuin"]
};

// Controleer of de customWordsList uit woorden.js bestaat, anders pakken we de defaults
let wordsData = (typeof customWordsList !== 'undefined') ? JSON.parse(JSON.stringify(customWordsList)) : JSON.parse(JSON.stringify(defaultWords));
let secretWord = "";
let currentAttempt = 0;
let totalAttempts = 5; 
let wordLength = 5;
let currentGuess = [];
let gameActive = false;
let soundEnabled = true;
window.isAnimating = false; 

let revealedHints = []; 
let lastRowCorrect = []; 

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

        if (type === 'type') {
            osc.type = 'sine'; osc.frequency.setValueAtTime(600, now); gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08); osc.start(now); osc.stop(now + 0.08);
        } else if (type === 'backspace') {
            osc.type = 'sine'; osc.frequency.setValueAtTime(400, now); gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08); osc.start(now); osc.stop(now + 0.08);
        } else if (type === 'error') {
            osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, now); osc.frequency.linearRampToValueAtTime(100, now + 0.25);
            gain.gain.setValueAtTime(0.15, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25); osc.start(now); osc.stop(now + 0.25);
        } else if (type === 'correct') {
            osc.type = 'triangle'; osc.frequency.setValueAtTime(523.25, now); gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15); osc.start(now); osc.stop(now + 0.15);
        } else if (type === 'present') {
            osc.type = 'sine'; osc.frequency.setValueAtTime(440, now); gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15); osc.start(now); osc.stop(now + 0.15);
        } else if (type === 'absent') {
            osc.type = 'sine'; osc.frequency.setValueAtTime(250, now); gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1); osc.start(now); osc.stop(now + 0.1);
        } else if (type === 'win') {
            const notes = [523.25, 659.25, 783.99, 1046.50]; 
            notes.forEach((freq, idx) => {
                const o = audioCtx.createOscillator(); const g = audioCtx.createGain();
                o.connect(g); g.connect(audioCtx.destination); o.frequency.setValueAtTime(freq, now + (idx * 0.12));
                g.gain.setValueAtTime(0.1, now + (idx * 0.12)); g.gain.exponentialRampToValueAtTime(0.001, now + (idx * 0.12) + 0.4);
                o.start(now + (idx * 0.12)); o.stop(now + (idx * 0.12) + 0.45);
            });
        } else if (type === 'hint') {
            const notes = [587.33, 698.46, 880.00]; 
            notes.forEach((freq, idx) => {
                const o = audioCtx.createOscillator(); const g = audioCtx.createGain();
                o.connect(g); g.connect(audioCtx.destination); o.frequency.setValueAtTime(freq, now + (idx * 0.08));
                g.gain.setValueAtTime(0.08, now + (idx * 0.08)); g.gain.exponentialRampToValueAtTime(0.001, now + (idx * 0.08) + 0.3);
                o.start(now + (idx * 0.08)); o.stop(now + (idx * 0.08) + 0.35);
            });
        }
    } catch (e) { console.log("Audio play error", e); }
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    document.getElementById('sound-status').innerText = soundEnabled ? "AAN" : "UIT";
    document.getElementById('sound-icon').innerText = soundEnabled ? "🔊" : "🔇";
    if (soundEnabled) { initAudio(); playSound('type'); }
    if (document.activeElement) document.activeElement.blur();
}

function initGame(length) {
    wordLength = length;
    const availableWords = wordsData[wordLength];

    if (!availableWords || availableWords.length === 0) {
        wordsData[wordLength] = defaultWords[wordLength];
    }

    const cleanAvailable = wordsData[wordLength].filter(w => w.length === wordLength);
    let usedWords = [];
    try { usedWords = JSON.parse(localStorage.getItem('lingo_used_words_' + wordLength)) || []; } catch (e) { usedWords = []; }

    let unusedWords = cleanAvailable.filter(w => !usedWords.includes(w));
    if (unusedWords.length === 0) {
        gameActive = false;
        document.getElementById('board').innerHTML = '';
        showMessage("Alle beschikbare woorden zijn al geraden!", true);
        return;
    }

    secretWord = unusedWords[Math.floor(Math.random() * unusedWords.length)].toLowerCase();
    usedWords.push(secretWord);
    localStorage.setItem('lingo_used_words_' + wordLength, JSON.stringify(usedWords));
    
    currentAttempt = 0;
    totalAttempts = 5; 
    window.isAnimating = false; 
    revealedHints = [0]; 
    lastRowCorrect = []; 
    currentGuess = [];
    gameActive = true;
    clearMessage();

    const board = document.getElementById('board');
    board.innerHTML = '';
    board.setAttribute('data-letters', length); 
    buildGridRows(0, totalAttempts);
}

function buildGridRows(startIndex, endIndex) {
    const board = document.getElementById('board');
    board.style.gridTemplateRows = `repeat(${endIndex}, 1fr)`;

    for (let r = startIndex; r < endIndex; r++) {
        const row = document.createElement('div');
        row.className = 'row';
        for (let c = 0; c < wordLength; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.id = `cell-${r}-${c}`;
            
            if (r === currentAttempt) {
                let isHint = (r < 5) ? (c === 0 || lastRowCorrect.includes(c)) : (revealedHints.includes(c) || lastRowCorrect.includes(c));
                if (isHint) {
                    cell.innerText = secretWord[c];
                    cell.classList.add('hint-letter');
                }
            }
            row.appendChild(cell);
        }
        board.appendChild(row);
    }
}

function addExtraRow() {
    totalAttempts++;
    buildGridRows(totalAttempts - 1, totalAttempts);
    
    let eligibleIndices = [];
    for (let i = 0; i < wordLength; i++) {
        if (!revealedHints.includes(i) && !lastRowCorrect.includes(i)) eligibleIndices.push(i);
    }
    if (eligibleIndices.length === 0) {
        for (let i = 0; i < wordLength; i++) { if (!revealedHints.includes(i)) eligibleIndices.push(i); }
    }

    if (eligibleIndices.length > 0) {
        revealedHints.push(eligibleIndices[0]);
        playSound('hint');
        showMessage(`Nieuwe poging! Extra hint gekregen ✨`);
    } else {
        showMessage(`Nieuwe poging! Blijf proberen! 💪`);
    }

    setTimeout(() => {
        const container = document.getElementById('board-container');
        container.scrollTop = container.scrollHeight;
    }, 50);
}

function changeWordLength(len) {
    const buttons = document.querySelectorAll('.btn-group .btn');
    buttons.forEach(btn => btn.classList.toggle('active', btn.innerText.includes(len.toString())));
    if (document.activeElement) document.activeElement.blur();
    initGame(len);
}

function handleKeyPress(key) {
    if (!gameActive || window.isAnimating) return;

    if (key === 'backspace') {
        if (currentGuess.length > 0) { currentGuess.pop(); playSound('backspace'); updateRowUI(); }
    } else if (key === 'enter') {
        if (currentGuess.length === wordLength) checkGuess();
        else { showMessage(`Woord moet exact ${wordLength} letters lang zijn.`, true); playSound('error'); }
    } else if (/^[a-z]$/.test(key)) {
        if (currentGuess.length < wordLength) { currentGuess.push(key); playSound('type'); updateRowUI(); }
    }
}

function updateRowUI() {
    clearMessage();
    for (let c = 0; c < wordLength; c++) {
        const cell = document.getElementById(`cell-${currentAttempt}-${c}`);
        if (!cell) continue;
        
        if (currentGuess[c]) {
            cell.innerText = currentGuess[c];
            cell.classList.remove('hint-letter');
            cell.classList.add('pop');
            setTimeout(() => cell.classList.remove('pop'), 100);
        } else {
            let isHint = (currentAttempt < 5) ? (c === 0 || lastRowCorrect.includes(c)) : (revealedHints.includes(c) || lastRowCorrect.includes(c));
            if (isHint) {
                cell.innerText = secretWord[c];
                cell.classList.add('hint-letter');
            } else {
                cell.innerText = '';
                cell.classList.remove('hint-letter');
            }
        }
    }
}

function checkGuess() {
    window.isAnimating = true; 
    const guess = currentGuess.join('').toLowerCase();
    const secretLetters = secretWord.split('');
    const guessLetters = [...currentGuess];
    const rowResults = new Array(wordLength).fill('absent');
    let currentRowCorrect = [];

    for (let i = 0; i < wordLength; i++) {
        if (guessLetters[i] === secretLetters[i]) {
            rowResults[i] = 'correct';
            currentRowCorrect.push(i); 
            secretLetters[i] = null; guessLetters[i] = null;
        }
    }

    for (let i = 0; i < wordLength; i++) {
        if (guessLetters[i] !== null) {
            const index = secretLetters.indexOf(guessLetters[i]);
            if (index !== -1) { rowResults[i] = 'present'; secretLetters[index] = null; }
        }
    }

    let delay = 0;
    for (let i = 0; i < wordLength; i++) {
        const cell = document.getElementById(`cell-${currentAttempt}-${i}`);
        if (!cell) continue;
        setTimeout(() => {
            cell.innerText = currentGuess[i];
            cell.classList.remove('hint-letter');
            cell.classList.add('reveal', rowResults[i]);
            playSound(rowResults[i]);
        }, delay);
        delay += 150;
    }

    setTimeout(() => {
        if (guess === secretWord) {
            let pointsEarned = (wordLength === 10) ? 5 : 1;
            scores[currentTeam] += pointsEarned;
            saveSharedState(); 

            showEndGameModal(true, pointsEarned);
            window.isAnimating = false;
        } else {
            currentRowCorrect.forEach(idx => { if (!lastRowCorrect.includes(idx)) lastRowCorrect.push(idx); });
            currentAttempt++;
            if (currentAttempt >= totalAttempts) addExtraRow();
            currentGuess = [];
            updateRowUI();
            window.isAnimating = false;
        }
    }, delay + 200);
}

function showMessage(msg, isError = false) {
    const msgEl = document.getElementById('message');
    msgEl.innerText = msg;
    if (isError) { msgEl.classList.add('error'); setTimeout(() => msgEl.classList.remove('error'), 400); }
}
function clearMessage() { document.getElementById('message').innerText = ''; }

function showEndGameModal(isWin, points) {
    gameActive = false;
    const modalOverlay = document.getElementById('status-modal');
    const desc = document.getElementById('modal-desc');
    document.getElementById('modal-word').innerText = secretWord.toUpperCase();
    desc.innerText = `${teamNames[currentTeam]} scoort +${points} ${points === 1 ? 'punt' : 'punten'}!`;
    playSound('win');
    modalOverlay.classList.add('active');
}

function closeModalAndRestart() {
    document.getElementById('status-modal').classList.remove('active');
    initGame(wordLength);
}

window.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const key = e.key.toLowerCase();
    if (key === 'enter') { e.preventDefault(); handleKeyPress('enter'); }
    else if (key === 'backspace') handleKeyPress('backspace');
    else handleKeyPress(key);
});

// Start de game nu direct op basis van de array in woorden.js
initGame(wordLength);