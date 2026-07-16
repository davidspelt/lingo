let wordsData = { 5: [], 6: [], 10: [] };
let secretWord = "";
let currentAttempt = 0;
const maxAttempts = 5;
let wordLength = 5;

// Laad de CSV in bij het opstarten
async function loadWords() {
    try {
        // We verwachten een CSV zonder headers, bijv: woord,lengte
        const response = await fetch('woorden.csv');
        const text = await response.text();
        
        // Simpele CSV parser (gaat uit van één woord per regel of 'woord,lengte')
        const lines = text.split('\n');
        lines.forEach(line => {
            const cleanWord = line.split(',')[0].trim().toLowerCase();
            if ([5, 6, 10].includes(cleanWord.length)) {
                wordsData[cleanWord.length].push(cleanWord);
            }
        });
        
        document.getElementById('message').innerText = "Woordenlijst geladen! Kies een lengte en start.";
    } catch (error) {
        console.error("Fout bij laden CSV:", error);
        document.getElementById('message').innerText = "Kon woorden.csv niet laden. Gebruik je een lokale server?";
    }
}

function initGame() {
    wordLength = parseInt(document.getElementById('length-select').value);
    const availableWords = wordsData[wordLength];

    if (!availableWords || availableWords.length === 0) {
        document.getElementById('message').innerText = `Geen woorden gevonden voor lengte ${wordLength} in CSV.`;
        return;
    }

    // Kies een willekeurig woord
    secretWord = availableWords[Math.floor(Math.random() * availableWords.length)];
    currentAttempt = 0;
    
    // Reset UI
    const board = document.getElementById('board');
    board.innerHTML = '';
    
    const input = document.getElementById('guess-input');
    input.maxLength = wordLength;
    input.value = '';
    input.disabled = false;
    document.getElementById('guess-btn').disabled = false;
    document.getElementById('message').innerText = "Spel gestart! Raad het woord.";

    // Bouw het lege bord met de eerste letter alvast ingevuld op de eerste rij
    for (let r = 0; r < maxAttempts; r++) {
        const row = document.createElement('div');
        row.className = 'row';
        for (let c = 0; c < wordLength; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.id = `cell-${r}-${c}`;
            if (r === 0 && c === 0) {
                cell.innerText = secretWord[0]; // Eerste letter cadeau
            }
            row.appendChild(cell);
        }
        board.appendChild(row);
    }
    input.focus();
}

function checkGuess() {
    const input = document.getElementById('guess-input');
    const guess = input.value.toLowerCase().trim();
    const message = document.getElementById('message');

    if (guess.length !== wordLength) {
        message.innerText = `Het woord moet exact ${wordLength} letters lang zijn.`;
        return;
    }

    const secretLetters = secretWord.split('');
    const guessLetters = guess.split('');
    const rowResults = new Array(wordLength).fill('absent');

    // Stap 1: Check op juiste letters op de juiste plek (Rood)
    for (let i = 0; i < wordLength; i++) {
        if (guessLetters[i] === secretLetters[i]) {
            rowResults[i] = 'correct';
            secretLetters[i] = null; // Voorkom dubbele telling
            guessLetters[i] = null;
        }
    }

    // Stap 2: Check op juiste letters op de verkeerde plek (Geel/Cirkel)
    for (let i = 0; i < wordLength; i++) {
        if (guessLetters[i] !== null) {
            const index = secretLetters.indexOf(guessLetters[i]);
            if (index !== -1) {
                rowResults[i] = 'present';
                secretLetters[index] = null;
            }
        }
    }

    // Stap 3: Update de UI van de huidige rij
    for (let i = 0; i < wordLength; i++) {
        const cell = document.getElementById(`cell-${currentAttempt}-${i}`);
        cell.innerText = guess[i];
        cell.classList.add(rowResults[i]);
    }

    // Check winst of verlies
    if (guess === secretWord) {
        message.innerText = "Gefeliciteerd! Je hebt het woord geraden! 🎉";
        endGame();
        return;
    }

    currentAttempt++;

    if (currentAttempt >= maxAttempts) {
        message.innerText = `Helaas! Het juiste woord was: ${secretWord.toUpperCase()}`;
        endGame();
    } else {
        // Vul de juiste letters van de vorige poging alvast in op de volgende rij (Lingo traditie)
        for (let i = 0; i < wordLength; i++) {
            const currentCell = document.getElementById(`cell-${currentAttempt}-${i}`);
            const previousCell = document.getElementById(`cell-${currentAttempt - 1}-${i}`);
            if (previousCell.classList.contains('correct')) {
                currentCell.innerText = secretWord[i];
            }
        }
        input.value = '';
        message.innerText = "";
    }
}

function endGame() {
    document.getElementById('guess-input').disabled = true;
    document.getElementById('guess-btn').disabled = true;
}

// Event Listeners
document.getElementById('start-btn').addEventListener('click', initGame);
document.getElementById('guess-btn').addEventListener('click', checkGuess);
document.getElementById('guess-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !document.getElementById('guess-btn').disabled) {
        checkGuess();
    }
});

// Start met het laden van de woorden
loadWords();
