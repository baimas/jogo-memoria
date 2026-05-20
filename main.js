// Dataset Pedagógico
const BIOMOLECULES = [
  {
    id: 1,
    category: 'Proteínas',
    tagClass: 'tag-protein',
    cardA: 'Aminoácidos',
    cardB: 'São as unidades básicas que formam as proteínas. Também participam do crescimento, reparo dos tecidos e de várias reações do organismo.'
  },
  {
    id: 2,
    category: 'Proteínas',
    tagClass: 'tag-protein',
    cardA: 'Enzimas',
    cardB: 'São proteínas que aceleram as reações químicas do organismo, como digestão, produção de energia e funcionamento celular.'
  },
  {
    id: 3,
    category: 'Carboidratos',
    tagClass: 'tag-carb',
    cardA: 'Monossacarídeo',
    cardB: 'É o carboidrato mais simples. Serve principalmente como fonte rápida de energia para as células.'
  },
  {
    id: 4,
    category: 'Carboidratos',
    tagClass: 'tag-carb',
    cardA: 'Glicose',
    cardB: 'É um tipo de monossacarídeo e a principal fonte de energia do corpo, usada pelas células para produzir energia.'
  },
  {
    id: 5,
    category: 'Ácidos Nucleicos',
    tagClass: 'tag-nucleic',
    cardA: 'DNA',
    cardB: 'É a molécula responsável pelo armazenamento e transmissão da informação genética dos seres vivos.'
  },
  {
    id: 6,
    category: 'Ácidos Nucleicos',
    tagClass: 'tag-nucleic',
    cardA: 'RNA',
    cardB: 'Participa da expressão da informação genética, atuando principalmente na síntese de proteínas.'
  }
];

// Estado da Aplicação
const state = {
  p1: {
    name: '',
    score: 0,
    flippedCards: [],
    matchedPairs: 0,
    isFrozen: false,
    boardId: 'p1'
  },
  p2: {
    name: '',
    score: 0,
    flippedCards: [],
    matchedPairs: 0,
    isFrozen: false,
    boardId: 'p2'
  },
  gameActive: false,
  winScore: 6
};

// DOM Elements
const screens = {
  start: document.getElementById('start-screen'),
  game: document.getElementById('game-screen'),
  victory: document.getElementById('victory-screen')
};

const inputs = {
  p1: document.getElementById('p1-name'),
  p2: document.getElementById('p2-name'),
  btnStart: document.getElementById('btn-start'),
  btnRestart: document.getElementById('btn-restart')
};

const displays = {
  p1Name: document.getElementById('p1-display-name'),
  p2Name: document.getElementById('p2-display-name'),
  p1Score: document.getElementById('p1-score'),
  p2Score: document.getElementById('p2-score')
};

const grids = {
  p1: document.getElementById('grid-p1'),
  p2: document.getElementById('grid-p2')
};

// Inicialização
function init() {
  // Listeners de Input
  inputs.p1.addEventListener('input', checkInputs);
  inputs.p2.addEventListener('input', checkInputs);
  
  inputs.btnStart.addEventListener('click', startGame);
  inputs.btnRestart.addEventListener('click', resetGame);
}

function checkInputs() {
  const p1Val = inputs.p1.value.trim();
  const p2Val = inputs.p2.value.trim();
  inputs.btnStart.disabled = !(p1Val.length > 0 && p2Val.length > 0);
}

function startGame() {
  state.p1.name = inputs.p1.value.trim();
  state.p2.name = inputs.p2.value.trim();
  
  displays.p1Name.textContent = state.p1.name;
  displays.p2Name.textContent = state.p2.name;
  
  switchScreen('game');
  state.gameActive = true;
  
  setupBoard('p1');
  setupBoard('p2');
}

function resetGame() {
  state.p1.score = 0;
  state.p2.score = 0;
  state.p1.matchedPairs = 0;
  state.p2.matchedPairs = 0;
  state.p1.flippedCards = [];
  state.p2.flippedCards = [];
  state.p1.isFrozen = false;
  state.p2.isFrozen = false;
  state.gameActive = false;
  
  updateScore('p1');
  updateScore('p2');
  
  switchScreen('start');
  inputs.p1.value = '';
  inputs.p2.value = '';
  checkInputs();
}

function switchScreen(screenName) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[screenName].classList.add('active');
}

// Lógica do Tabuleiro
function generateCardsArray() {
  const cards = [];
  BIOMOLECULES.forEach(mol => {
    // Carta A (Nome)
    cards.push({
      pairId: mol.id,
      text: mol.cardA,
      category: mol.category,
      tagClass: mol.tagClass,
      uid: Math.random().toString(36).substr(2, 9)
    });
    // Carta B (Função)
    cards.push({
      pairId: mol.id,
      text: mol.cardB,
      category: mol.category,
      tagClass: mol.tagClass,
      uid: Math.random().toString(36).substr(2, 9)
    });
  });
  
  // Shuffle (Fisher-Yates)
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

function setupBoard(playerKey) {
  const grid = grids[playerKey];
  grid.innerHTML = '';
  
  const cards = generateCardsArray();
  
  cards.forEach(cardData => {
    const cardEl = document.createElement('div');
    cardEl.className = 'card-scene';
    
    cardEl.innerHTML = `
      <div class="card" data-pair-id="${cardData.pairId}" data-uid="${cardData.uid}">
        <div class="card-face card-face-back">
          <span class="icon-dna">🧬</span>
        </div>
        <div class="card-face card-face-front">
          <span class="card-tag ${cardData.tagClass}">${cardData.category}</span>
          <span class="card-content">${cardData.text}</span>
        </div>
      </div>
    `;
    
    // Listener Isolado
    cardEl.addEventListener('click', () => handleCardClick(playerKey, cardEl.querySelector('.card')));
    grid.appendChild(cardEl);
  });
}

function handleCardClick(playerKey, cardEl) {
  if (!state.gameActive) return;
  
  const playerState = state[playerKey];
  
  // Condições de bloqueio
  if (playerState.isFrozen) return;
  if (cardEl.classList.contains('is-flipped') || cardEl.classList.contains('is-matched')) return;
  if (playerState.flippedCards.length >= 2) return; // Segurança extra
  
  // Virar a carta
  cardEl.classList.add('is-flipped');
  playerState.flippedCards.push(cardEl);
  
  // Checar Match
  if (playerState.flippedCards.length === 2) {
    checkMatch(playerKey);
  }
}

function checkMatch(playerKey) {
  const playerState = state[playerKey];
  const [card1, card2] = playerState.flippedCards;
  
  const id1 = card1.getAttribute('data-pair-id');
  const id2 = card2.getAttribute('data-pair-id');
  
  if (id1 === id2) {
    // Acerto (Match)
    card1.classList.add('success');
    card2.classList.add('success');
    
    setTimeout(() => {
      card1.classList.add('is-matched');
      card2.classList.add('is-matched');
      playerState.flippedCards = [];
      
      playerState.score++;
      playerState.matchedPairs++;
      updateScore(playerKey);
      
      checkVictory();
    }, 400); // tempo para ver a cor de sucesso

  } else {
    // Erro (Mismatch)
    playerState.isFrozen = true;
    const boardEl = document.getElementById(`board-${playerKey}`);
    boardEl.classList.add('frozen');
    
    card1.classList.add('error');
    card2.classList.add('error');
    
    setTimeout(() => {
      card1.classList.remove('is-flipped', 'error');
      card2.classList.remove('is-flipped', 'error');
      
      playerState.flippedCards = [];
      playerState.isFrozen = false;
      boardEl.classList.remove('frozen');
    }, 1200); // 1.2s de congelamento
  }
}

function updateScore(playerKey) {
  const scoreEl = displays[`${playerKey}Score`];
  scoreEl.textContent = state[playerKey].score;
  
  // Animar score
  scoreEl.classList.remove('pulse');
  void scoreEl.offsetWidth; // trigger reflow
  scoreEl.classList.add('pulse');
}

function checkVictory() {
  if (!state.gameActive) return;
  
  let winner = null;
  if (state.p1.matchedPairs === state.winScore) winner = state.p1;
  else if (state.p2.matchedPairs === state.winScore) winner = state.p2;
  
  if (winner) {
    state.gameActive = false;
    
    document.getElementById('winner-name').textContent = winner.name;
    document.getElementById('final-score-p1').textContent = `${state.p1.name}: ${state.p1.score} pontos`;
    document.getElementById('final-score-p2').textContent = `${state.p2.name}: ${state.p2.score} pontos`;
    
    setTimeout(() => {
      switchScreen('victory');
    }, 600); // Esperar a animação da última carta desaparecer
  }
}

// Iniciar aplicação
init();
