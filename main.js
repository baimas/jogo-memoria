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
  p1: { name: '', score: 0, panelId: 'p1-panel' },
  p2: { name: '', score: 0, panelId: 'p2-panel' },
  currentPlayer: 'p1', // 'p1' ou 'p2'
  flippedCards: [],
  matchedPairsTotal: 0,
  isFrozen: false,
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
  p2Score: document.getElementById('p2-score'),
  p1Panel: document.getElementById('p1-panel'),
  p2Panel: document.getElementById('p2-panel')
};

const grid = document.getElementById('main-grid');

// Inicialização
function init() {
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
  
  setupBoard();
  updateTurnUI();
}

function resetGame() {
  state.p1.score = 0;
  state.p2.score = 0;
  state.currentPlayer = 'p1';
  state.matchedPairsTotal = 0;
  state.flippedCards = [];
  state.isFrozen = false;
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

function updateTurnUI() {
  displays.p1Panel.classList.remove('active');
  displays.p2Panel.classList.remove('active');
  
  if (state.currentPlayer === 'p1') {
    displays.p1Panel.classList.add('active');
  } else {
    displays.p2Panel.classList.add('active');
  }
}

// Lógica do Tabuleiro
function generateCardsArray() {
  const cards = [];
  BIOMOLECULES.forEach(mol => {
    cards.push({
      pairId: mol.id,
      text: mol.cardA,
      category: mol.category,
      tagClass: mol.tagClass,
      uid: Math.random().toString(36).substr(2, 9)
    });
    cards.push({
      pairId: mol.id,
      text: mol.cardB,
      category: mol.category,
      tagClass: mol.tagClass,
      uid: Math.random().toString(36).substr(2, 9)
    });
  });
  
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

function setupBoard() {
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
    
    cardEl.addEventListener('click', () => handleCardClick(cardEl.querySelector('.card')));
    grid.appendChild(cardEl);
  });
}

function handleCardClick(cardEl) {
  if (!state.gameActive || state.isFrozen) return;
  if (cardEl.classList.contains('is-flipped') || cardEl.classList.contains('is-matched')) return;
  if (state.flippedCards.length >= 2) return;
  
  cardEl.classList.add('is-flipped');
  state.flippedCards.push(cardEl);
  
  if (state.flippedCards.length === 2) {
    checkMatch();
  }
}

function checkMatch() {
  state.isFrozen = true;
  const [card1, card2] = state.flippedCards;
  
  const id1 = card1.getAttribute('data-pair-id');
  const id2 = card2.getAttribute('data-pair-id');
  
  if (id1 === id2) {
    // Acerto (Match)
    card1.classList.add('success');
    card2.classList.add('success');
    
    // Aguarda um clique ou toque para recolher as cartas e pontuar
    setTimeout(() => {
      const matchHandler = () => {
        card1.classList.add('is-matched');
        card2.classList.add('is-matched');
        state.flippedCards = [];
        
        // Pontuar para o jogador atual
        state[state.currentPlayer].score++;
        state.matchedPairsTotal++;
        updateScore(state.currentPlayer);
        
        state.isFrozen = false;
        checkVictory();
        // O jogador continua jogando (não muda o turno)
        
        document.removeEventListener('pointerdown', matchHandler);
      };
      
      document.addEventListener('pointerdown', matchHandler);
    }, 50);

  } else {
    // Erro (Mismatch)
    card1.classList.add('error');
    card2.classList.add('error');
    
    // Aguarda um clique ou toque em qualquer lugar para desvirar as cartas
    setTimeout(() => {
      const unflipHandler = () => {
        card1.classList.remove('is-flipped', 'error');
        card2.classList.remove('is-flipped', 'error');
        
        state.flippedCards = [];
        state.isFrozen = false;
        
        // Passar a vez
        state.currentPlayer = state.currentPlayer === 'p1' ? 'p2' : 'p1';
        updateTurnUI();
        
        document.removeEventListener('pointerdown', unflipHandler);
      };
      
      document.addEventListener('pointerdown', unflipHandler);
    }, 50); // delay pequeno para não capturar o clique original que virou a carta
  }
}

function updateScore(playerKey) {
  const scoreEl = displays[`${playerKey}Score`];
  scoreEl.textContent = state[playerKey].score;
  
  scoreEl.classList.remove('pulse');
  void scoreEl.offsetWidth; // trigger reflow
  scoreEl.classList.add('pulse');
}

function checkVictory() {
  if (!state.gameActive) return;
  
  if (state.matchedPairsTotal === state.winScore) {
    state.gameActive = false;
    
    let winnerText = '';
    if (state.p1.score > state.p2.score) {
      winnerText = state.p1.name;
    } else if (state.p2.score > state.p1.score) {
      winnerText = state.p2.name;
    } else {
      winnerText = 'Empate!';
    }
    
    document.getElementById('winner-name').textContent = winnerText;
    
    const h2Msg = document.querySelector('#victory-screen h2');
    if (winnerText === 'Empate!') {
      h2Msg.textContent = 'Foi um jogo disputado!';
    } else {
      h2Msg.textContent = 'venceu a corrida!';
    }
    
    document.getElementById('final-score-p1').textContent = `${state.p1.name}: ${state.p1.score} pontos`;
    document.getElementById('final-score-p2').textContent = `${state.p2.name}: ${state.p2.score} pontos`;
    
    setTimeout(() => {
      switchScreen('victory');
      triggerExplosions();
    }, 600);
  }
}

function triggerExplosions() {
  if (typeof confetti !== 'undefined') {
    const duration = 3000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ef4444', '#06b6d4', '#22c55e', '#eab308']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#ef4444', '#06b6d4', '#22c55e', '#eab308']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  }
}

// Iniciar aplicação
init();
