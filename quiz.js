const defaultQuizData = {
    "merken": [
        {"question": "Welk sportmerk heeft een logo dat bekend staat als de 'Swoosh'?", "answers": ["Adidas", "Puma", "Nike", "Reebok"], "correct": 2},
        {"question": "Uit welk land komt het bekende meubelmerk IKEA?", "answers": ["Denemarken", "Zweden", "Noorwegen", "Finland"], "correct": 1},
        {"question": "Welke tech-gigant produceerde oorspronkelijk speelkaarten?", "answers": ["Nintendo", "Sony", "Apple", "Sega"], "correct": 0}
    ],
    "geografie": [
        {"question": "Wat is de hoofdstad van Australië?", "answers": ["Sydney", "Melbourne", "Canberra", "Brisbane"], "correct": 2},
        {"question": "Welke rivier stroomt er dwars door de stad Parijs?", "answers": ["De Loire", "De Seine", "De Rhône", "De Rijn"], "correct": 1},
        {"question": "Wat is het grootste land ter wereld qua oppervlakte?", "answers": ["Canada", "Verenigde Staten", "China", "Rusland"], "correct": 3}
    ],
    "spellen": [
        {"question": "In welk populair spel vechten 100 spelers op een eiland tot er één overleeft?", "answers": ["Minecraft", "Fortnite", "Apex Legends", "PUBG"], "correct": 1},
        {"question": "Hoeveel vakjes heeft een standaard schaakbord?", "answers": ["36", "48", "64", "81"], "correct": 2},
        {"question": "Welk personage is de iconische mascotte van SEGA?", "answers": ["Mario", "Crash Bandicoot", "Sonic the Hedgehog", "Pac-Man"], "correct": 2}
    ],
    "films": [
        {"question": "Wie speelde de hoofdrol van Jack Dawson in de klassieker Titanic?", "answers": ["Brad Pitt", "Leonardo DiCaprio", "Matt Damon", "Johnny Depp"], "correct": 1},
        {"question": "Welke filmreeks bevat personages genaamd 'Hobbits'?", "answers": ["Star Wars", "Harry Potter", "The Lord of the Rings", "The Chronicles of Narnia"], "correct": 2},
        {"question": "Hoeveel Oscars won de film 'Avatar' (2009) in totaal?", "answers": ["3", "5", "7", "11"], "correct": 0}
    ]
};

let quizData = JSON.parse(JSON.stringify(defaultQuizData));
let activeCategory = "";
let currentQuestionIndex = 0;
let soundEnabled = true;
window.isEvaluating = false;

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

        if (type === 'click') {
            osc.type = 'sine'; osc.frequency.setValueAtTime(500, now); gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08); osc.start(now); osc.stop(now + 0.08);
        } else if (type === 'correct') {
            osc.type = 'triangle'; osc.frequency.setValueAtTime(523.25, now); gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15); osc.start(now); osc.stop(now + 0.15);
        } else if (type === 'wrong') {
            osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, now); osc.frequency.linearRampToValueAtTime(100, now + 0.25);
            gain.gain.setValueAtTime(0.15, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25); osc.start(now); osc.stop(now + 0.25);
        } else if (type === 'win') {
            const notes = [523.25, 659.25, 783.99, 1046.50];
            notes.forEach((freq, idx) => {
                const o = audioCtx.createOscillator(); const g = audioCtx.createGain();
                o.connect(g); g.connect(audioCtx.destination); o.frequency.setValueAtTime(freq, now + (idx * 0.12));
                g.gain.setValueAtTime(0.1, now + (idx * 0.12)); g.gain.exponentialRampToValueAtTime(0.001, now + (idx * 0.12) + 0.4);
                o.start(now + (idx * 0.12)); o.stop(now + (idx * 0.12) + 0.45);
            });
        }
    } catch (e) { console.log("Audio play error", e); }
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    document.getElementById('sound-status').innerText = soundEnabled ? "AAN" : "UIT";
    document.getElementById('sound-icon').innerText = soundEnabled ? "🔊" : "🔇";
    if (soundEnabled) { initAudio(); playSound('click'); }
    if (document.activeElement) document.activeElement.blur();
}

async function fetchQuizJSON() {
    try {
        const response = await fetch('vragen.json');
        if (!response.ok) throw new Error("JSON bestand niet gevonden.");
        const data = await response.json();
        if (Object.keys(data).length > 0) quizData = data;
    } catch (error) {
        console.warn("Laden mislukt, we vallen terug op defaults:", error.message);
    } finally {
        buildCategoryButtons();
    }
}

function buildCategoryButtons() {
    const container = document.getElementById('category-group');
    container.innerHTML = '';
    Object.keys(quizData).forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'btn'; btn.id = `cat-btn-${cat}`; btn.innerText = cat;
        btn.onclick = () => startCategory(cat);
        container.appendChild(btn);
    });
}

function startCategory(cat) {
    if (window.isEvaluating) return;
    activeCategory = cat;
    currentQuestionIndex = 0;

    document.querySelectorAll('#category-group .btn').forEach(btn => {
        btn.classList.toggle('active', btn.id === `cat-btn-${cat}`);
    });

    if (document.activeElement) document.activeElement.blur();
    loadQuestion();
}

function loadQuestion() {
    const questions = quizData[activeCategory];
    document.getElementById('current-question-num').innerText = `${currentQuestionIndex + 1}/${questions.length}`;
    document.getElementById('message').innerText = "";

    const q = questions[currentQuestionIndex];
    document.getElementById('question-text').innerText = q.question;

    const answersGrid = document.getElementById('answers-grid');
    answersGrid.innerHTML = '';

    const prefixes = ["A", "B", "C", "D"];
    q.answers.forEach((ans, idx) => {
        const button = document.createElement('button');
        button.className = 'answer-btn';
        button.innerHTML = `<span class="prefix">${prefixes[idx]}</span> ${ans}`;
        button.onclick = () => selectAnswer(idx);
        answersGrid.appendChild(button);
    });
}

function selectAnswer(selectedIndex) {
    if (window.isEvaluating) return;
    window.isEvaluating = true;

    const questions = quizData[activeCategory];
    const q = questions[currentQuestionIndex];
    const buttons = document.querySelectorAll('.answers-grid .answer-btn');

    buttons[selectedIndex].classList.add('selected');
    playSound('click');

    setTimeout(() => {
        buttons.forEach((btn, idx) => {
            btn.classList.remove('selected');
            btn.disabled = true; 
            btn.classList.add(idx === q.correct ? 'correct' : 'wrong');
        });

        if (selectedIndex === q.correct) {
            // Verhoog globale score via shared-teams.js
            scores[currentTeam] += 1; 
            saveSharedState(); 
            
            playSound('correct');
            document.getElementById('message').innerText = `Team ${currentTeam} scoort +1 punt! ✨`;
        } else {
            playSound('wrong');
            document.getElementById('message').innerText = "Helaas, onjuist! 🧩";
        }

        setTimeout(() => {
            currentQuestionIndex++;
            if (currentQuestionIndex < questions.length) {
                loadQuestion();
                window.isEvaluating = false;
            } else {
                showEndModal();
            }
        }, 1500);

    }, 800);
}

function showEndModal() {
    document.getElementById('status-modal').classList.add('active');
    playSound('win');
}

function closeModal() {
    document.getElementById('status-modal').classList.remove('active');
    document.querySelectorAll('#category-group .btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('question-text').innerText = "Kies hierboven een categorie om een nieuwe quiz te starten!";
    document.getElementById('answers-grid').innerHTML = '';
    document.getElementById('current-question-num').innerText = "0/0";
    document.getElementById('message').innerText = "";
    window.isEvaluating = false;
}

fetchQuizJSON();