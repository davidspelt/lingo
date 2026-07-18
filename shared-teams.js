// Gedeelde status variabelen
let scores = { A: 0, B: 0 };
let teamNames = { A: 'TEAM A', B: 'TEAM B' };
let currentTeam = 'A';

// Laad de actuele score, namen en team in bij het openen van de pagina
function loadSharedState() {
    const savedScores = localStorage.getItem('party_quiz_scores');
    if (savedScores) scores = JSON.parse(savedScores);
    
    const savedNames = localStorage.getItem('party_quiz_team_names');
    if (savedNames) teamNames = JSON.parse(savedNames);

    const savedTeam = localStorage.getItem('party_quiz_current_team');
    if (savedTeam) currentTeam = savedTeam;

    updateSharedUI();
}

// Sla alles op en update de visuele elementen
function saveSharedState() {
    localStorage.setItem('party_quiz_scores', JSON.stringify(scores));
    localStorage.setItem('party_quiz_team_names', JSON.stringify(teamNames));
    localStorage.setItem('party_quiz_current_team', currentTeam);
    updateSharedUI();
}

// Update de scoreborden, actieve team-box en de namen
function updateSharedUI() {
    const scoreAEl = document.getElementById('score-a');
    const scoreBEl = document.getElementById('score-b');
    const nameAEl = document.getElementById('name-a');
    const nameBEl = document.getElementById('name-b');
    const boxA = document.getElementById('team-a-box');
    const boxB = document.getElementById('team-b-box');

    if (scoreAEl) scoreAEl.innerText = scores.A;
    if (scoreBEl) scoreBEl.innerText = scores.B;
    
    if (nameAEl) nameAEl.innerText = teamNames.A;
    if (nameBEl) nameBEl.innerText = teamNames.B;

    if (boxA) boxA.classList.toggle('active', currentTeam === 'A');
    if (boxB) boxB.classList.toggle('active', currentTeam === 'B');
}

// Handmatig wisselen van team via de knoppen bovenin
function selectTeam(team) {
    if (window.isAnimating || window.isEvaluating) return;
    currentTeam = team;
    saveSharedState();
    if (typeof playSound === 'function') playSound('type');
}

// Functie om de teamnaam aan te passen (wordt getriggerd door dubbelklik)
function editTeamName(team) {
    const currentName = teamNames[team];
    const newName = prompt(`Voer een nieuwe naam in voor ${currentName}:`, currentName);
    
    if (newName && newName.trim() !== "") {
        teamNames[team] = newName.trim().toUpperCase();
        saveSharedState();
    }
}

// Volledige resetfunctie voor de scores en namen
function resetAllScores() {
    if (confirm("Weet je zeker dat je alle scores en teamnamen wilt resetten?")) {
        scores = { A: 0, B: 0 };
        teamNames = { A: 'TEAM A', B: 'TEAM B' };
        currentTeam = 'A';
        saveSharedState();
        location.reload();
    }
}

// Voer dit direct uit bij het inladen
document.addEventListener('DOMContentLoaded', loadSharedState);