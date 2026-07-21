const defaultQuizData = 
{
    "geografie": [
        {
            "question": "Welke rivier stroomt er dwars door de stad Parijs?",
            "answers": [
                "De Loire",
                "De Seine",
                "De Rhône",
                "De Rijn"
            ],
            "correct": 1
        },
        {
            "question": "Wat is het grootste land ter wereld qua oppervlakte?",
            "answers": [
                "Canada",
                "Verenigde Staten",
                "China",
                "Rusland"
            ],
            "correct": 3
        },
        {
            "question": "Hoeveel gemeenten heeft Nederland?",
            "answers": [
                "326",
                "336",
                "342",
                "351"
            ],
            "correct": 2
        },
        {
            "question": "Wat is de verste stad vanaf Harderwijk?",
            "answers": [
                "Sydney",
                "Wellington",
                "Christchurch",
                "Auckland"
            ],
            "correct": 1
        }
    ],
    "films": [
        {
            "question": "Hoeveel Oscars won de film 'Avatar' (2009) in totaal?",
            "answers": [
                "3",
                "5",
                "7",
                "11"
            ],
            "correct": 0
        },
        {
            "question": "Hoe lang duurt de film 'Titanic'?",
            "answers": [
                "151 min",
                "164 min",
                "182 min",
                "194 min"
            ],
            "correct": 3
        },
        {
            "question": "Wie componeerde de muziek bij de originele Star Wars?",
            "answers": [
                "Jerry Goldsmith",
                "John Williams",
                "James Horner",
                "Elmer Bernstein"
            ],
            "correct": 1
        },
        {
            "question": "Wie kreeg in 2001 de Oscar voor Beste Acteur?",
            "answers": [
                "Russell Crowe",
                "Tom Hanks",
                "Kevin Spacey",
                "Javier Bardem"
            ],
            "correct": 0
        }
    ],
    "geschiedenis": [
        {
            "question": "Wie was de eerste president van de Verenigde Staten?",
            "answers": [
                "Thomas Jefferson",
                "Abraham Lincoln",
                "George Washington",
                "John Adams"
            ],
            "correct": 2
        },
        {
            "question": "Welke beschaving bouwde Machu Picchu?",
            "answers": [
                "De Maya's",
                "De Azteken",
                "De Inca's",
                "De Romeinen"
            ],
            "correct": 2
        },
        {
            "question": "In welk jaar werd Nederland opgericht",
            "answers": [
                "1581",
                "1588",
                "1815",
                "1918"
            ],
            "correct": 2
        },
        {
            "question": "Wanneer had Nederland voor het eerst 10 miljoen inwoners?",
            "answers": [
                "1950",
                "1955",
                "1960",
                "1965"
            ],
            "correct": 0
        }
    ],
    "sport": [
        {
            "question": "Welke tennisspeler won de meeste Grand Slam-titels bij de mannen?",
            "answers": [
                "Roger Federer",
                "Rafael Nadal",
                "Novak Djokovic",
                "Pete Sampras"
            ],
            "correct": 2
        },
        {
            "question": "Wie won de meeste Gouden ballen?",
            "answers": [
                "Cristiano Ronaldo",
                "Kylian Mbappé",
                "Johan Cruijff",
                "Lionel Messi"
            ],
            "correct": 0
        },
        {
            "question": "Uit hoeveel minuten bestaat een reguliere hockeywedstrijd in Nederland?",
            "answers": [
                "60",
                "70",
                "80",
                "90"
            ],
            "correct": 1
        },
        {
            "question": "Welke legendarische darter gooide in 2002 als allereerste ooit een perfecte 9-darter live op de televisie tijdens de World Matchplay?",
            "answers": [
                "Raymond van Barneveld",
                "John Lowe",
                "Dennis Priestley",
                "Phil Tayler"
            ],
            "correct": 3
        }
    ],
    "wetenschap": [
        {
            "question": "Wat is het chemische symbool van goud?",
            "answers": [
                "Ag",
                "Go",
                "Au",
                "Gd"
            ],
            "correct": 2
        },
        {
            "question": "Wat is het 10e getal achter de komma van Pi?",
            "answers": [
                "2",
                "5",
                "7",
                "9"
            ],
            "correct": 0
        },
        {
            "question": "Bij hoeveel graden wordt kwik vloeibaar?",
            "answers": [
                "0",
                "20",
                "100",
                "271"
            ],
            "correct": 0
        },
        {
            "question": "Wat is het grootste tijdverschil tussen 2 plekken op aarde?",
            "answers": [
                "23 uur",
                "24 uur",
                "25 uur",
                "26 uur"
            ],
            "correct": 3
        }
    ],
    "Bier": [
        {
            "question": "Hoeveel liter zit er in een normale krat amstel?",
            "answers": [
                "6,9 L",
                "7,2 L",
                "8 L",
                "8,2 L"
            ],
            "correct": 1
        },
        {
            "question": "Wat is het goedkoopste bier van Nederland?",
            "answers": [
                "Schultenbräu",
                "AH Basic Premium Lager",
                "Kordaat",
                "Pitt Pils"
            ],
            "correct": 3
        },
        {
            "question": "Hoeveel L drink een Nederlander gemiddeld per jaar?",
            "answers": [
                "51 L",
                "61 L",
                "71 L",
                "81 L"
            ],
            "correct": 2
        },
        {
            "question": "Uit hoeveel % water bestaat bier?",
            "answers": [
                "85 %",
                "90 %",
                "95 %",
                "99 %"
            ],
            "correct": 1
        }
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