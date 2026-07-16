let wordsData = { 5: [], 6: [], 10: [] };
let secretWord = "";
let currentAttempt = 0;
const maxAttempts = 5;
let wordLength = 5;
let currentGuess = [];
let gameActive = false;

const keyboardLayout = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["enter", "z", "x", "c", "v", "b", "n", "m", "backspace"]
];

// Stille lader voor de CSV
async function loadWords() {
    try {
        const response = await fetch('woorden.csv');
        const text = await response.text();
        const lines = text.split('\n');
        
        lines.forEach(line => {
            const cleanWord = line.split(',')[0].trim().toLowerCase();
            if ([5, 6, 10].includes(cleanWord.length)) {
                wordsData[cleanWord.length].push(cleanWord);
            }
        });
        // Start direct het eerste spel zodra de lijst binnen is
        initGame(5);
    } catch (error) {
        console.error("Fout bij laden CSV:", error);
    }
}

function initGame(length) {
    wordLength = length;
    const availableWords = wordsData[wordLength];

    if (!availableWords || availableWords.length === 0) {
        document.getElementById('message').innerText = `Geen ${wordLength}-letterwoorden gevonden in woorden.csv.`;
        return;
    }

    secretWord = availableWords[Math.floor(Math.random() * availableWords.length)];
    currentAttempt = 0;
    currentGuess = [];
    gameActive = true;
    
    document.getElementById('message').innerText = "Raad het woord! Typ live op je toetsenbord.";

    // Update actieve knop styling
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active');
        if (parseInt(btn.dataset.length) === length) {
            btn.classList.add('active');
        }
    });

    // Bouw het grid
    const board = document.getElementById('board');
    board.innerHTML = '';
    board.setAttribute('data-letters', wordLength);

    for (let r = 0; r < maxAttempts; r++) {
        const row = document.createElement('div');
        row.className = 'row';
        for (let c = 0; c < wordLength; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.id = `cell-${r}-${c}`;
            
            // Eerste letter cadeau geven op de allereerste rij
            if (r === 0 && c === 0) {
                cell.innerText = secretWord[0];
            }
            row.appendChild(cell);
        }
        board.appendChild(row);
    }

    buildKeyboard();
}

// Live toetsenbord input afvangen
function handleKeyPress(key) {
    if (!gameActive) return;

    if (key === 'backspace') {
        if (currentGuess.length > 0) {
            currentGuess.pop();
            updateRowUI();
        }
    } else if (key === 'enter') {
        if (currentGuess.length === wordLength) {
            checkGuess();
        } else {
            document.getElementById('message').innerText = `Woord moet ${wordLength} letters lang zijn.`;
        }
    } else if (/^[a-z]$/.test(key)) {
        if (currentGuess.length < wordLength) {
            currentGuess.push(key);
            updateRowUI();
        }
    }
}

// Update de letters in de actieve rij tijdens het typen
function updateRowUI() {
    for (let c = 0; c < wordLength; c++) {
        const cell = document.getElementById(`cell-${currentAttempt}-${c}`);
        
        // Zorg dat we de cadeau-letter of eerdere correcte letters niet visueel leegmaken als de gebruiker nog niks typte
        if (currentGuess[c]) {
            cell.innerText = currentGuess[c];
            cell.classList.add('pop');
            setTimeout(() => cell.classList.remove('pop'), 100);
        } else {
            // Val terug op logica: eerste rij positie 0 heeft altijd de eerste letter van het geheime woord als er niks getypt is
            if (currentAttempt === 0 && c === 0) {
                cell.innerText = secretWord[0];
            } else {
                // Check of de vorige poging hier een juiste letter had staan
                if (currentAttempt > 0) {
                    const prevCell = document.getElementById(`cell-${currentAttempt - 1}-${c}`);
                    if (prevCell && prevCell.classList.contains('correct')) {
                        cell.innerText = secretWord[c];
                        continue;
                    }
                }
                cell.innerText = '';
            }
        }
    }
}

function checkGuess() {
    const guess = currentGuess.join('');
    const message = document.getElementById('message');
    const secretLetters = secretWord.split('');
    const guessLetters = [...currentGuess];
    const rowResults = new Array(wordLength).fill('absent');

    // 1. Correcte letters (Rood)
    for (let i = 0; i < wordLength; i++) {
        if (guessLetters[i] === secretLetters[i]) {
            rowResults[i] = 'correct';
            secretLetters[i] = null;
            guessLetters[i] = null;
        }
    }

    // 2. Bestaande letters (Geel)
    for (let i = 0; i < wordLength; i++) {
        if (guessLetters[i] !== null) {
            const index = secretLetters.indexOf(guessLetters[i]);
            if (index !== -1) {
                rowResults[i] = 'present';
                secretLetters[index] = null;
            }
        }
    }

    // 3. UI en Keyboard inkleuren
    for (let i = 0; i < wordLength; i++) {
        const cell = document.getElementById(`cell-${currentAttempt}-${i}`);
        cell.innerText = currentGuess[i];
        cell.classList.add(rowResults[i]);
        
        updateKeyboardKeyColor(currentGuess[i], rowResults[i]);
    }

    if (guess === secretWord) {
        message.innerText = "Gefeliciteerd! Je hebt het geraden! 🎉";
        gameActive = false;
        return;
    }

    currentAttempt++;

    if (currentAttempt >= maxAttempts) {
        message.innerText = `Helaas! Het juiste woord was: ${secretWord.toUpperCase()}`;
        gameActive = false;
    } else {
        currentGuess = [];
        message.innerText = "";
        // Vul automatisch de bekende rode letters in voor de volgende rij
        updateRowUI();
    }
}

// Keyboard genereren
function buildKeyboard() {
    const kbContainer = document.getElementById('keyboard');
    kbContainer.innerHTML = '';

    keyboardLayout.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'keyboard-row';
        
        row.forEach(key => {
            const button = document.createElement('button');
            button.innerText = key;
            button.className = 'key';
            button.id = `key-${key}`;
            if (key === 'enter' || key === 'backspace') {
                button.classList.add('wide');
            }
            button.addEventListener('click', () => handleKeyPress(key));
            rowDiv.appendChild(button);
        });
        kbContainer.appendChild(rowDiv);
    });
}

function updateKeyboardKeyColor(letter, status) {
    const keyBtn = document.getElementById(`key-${letter}`);
    if (!keyBtn) return;

    if (status === 'correct') {
        keyBtn.className = 'key correct';
    } else if (status === 'present' && !keyBtn.classList.contains('correct')) {
        keyBtn.className = 'key present';
    } else if (status === 'absent' && !keyBtn.classList.contains('correct') && !keyBtn.classList.contains('present')) {
        keyBtn.className = 'key absent';
    }
}
// Event Listeners voor fysiek toetsenbord
window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'enter') handleKeyPress('enter');
    else if (key === 'backspace') handleKeyPress('backspace');
    else handleKeyPress(key);
});

// Setup de keuzeknoppen bovenin
document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const len = parseInt(e.target.dataset.length);
        initGame(len);
    });
});

// Start de app
loadWords();
