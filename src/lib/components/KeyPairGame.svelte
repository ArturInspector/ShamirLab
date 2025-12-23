<script>
  import { onMount } from 'svelte';
  import { tStore } from '../i18n/store.js';
  import { RSAKeyGenerator } from '../algorithms/rsa.js';
  import { isPrime } from '../algorithms/primeUtils.js';
  
  let selectedPublic = null;
  let selectedPrivate = null;
  let matchedPairs = new Set();
  let score = 0;
  let time = 0;
  let gameStarted = false;
  let gameWon = false;
  let timerInterval = null;
  
  // Generate key pairs for the game
  function generateKeyPairs(count = 4) {
    const pairs = [];
    const primes = [3, 5, 7, 11, 13, 17, 19, 23, 29, 31];
    
    for (let i = 0; i < count; i++) {
      const p = primes[Math.floor(Math.random() * primes.length)];
      let q = primes[Math.floor(Math.random() * primes.length)];
      while (q === p) {
        q = primes[Math.floor(Math.random() * primes.length)];
      }
      
      const generator = new RSAKeyGenerator(p, q);
      generator.calculateN();
      generator.calculatePhi();
      
      // Try common exponents, starting with smaller ones for small primes
      const exponents = [3, 5, 17, 257, 65537];
      let eChosen = false;
      for (const e of exponents) {
        const result = generator.chooseE(e);
        if (result.valid) {
          eChosen = true;
          break;
        }
      }
      
      if (!eChosen) {
        // Fallback: try e = 3, 5, 7, etc.
        for (let e = 3; e < generator.phi; e += 2) {
          const result = generator.chooseE(e);
          if (result.valid) {
            break;
          }
        }
      }
      
      generator.calculateD();
      
      const publicKey = generator.getPublicKey();
      const privateKey = generator.getPrivateKey();
      
      pairs.push({
        id: i,
        publicKey,
        privateKey,
        matched: false
      });
    }
    
    return pairs;
  }
  
  let keyPairs = generateKeyPairs(4);
  let publicKeys = keyPairs.map(p => ({ ...p.publicKey, pairId: p.id }));
  let privateKeys = keyPairs.map(p => ({ ...p.privateKey, pairId: p.id }));
  
  // Shuffle arrays
  function shuffle(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  publicKeys = shuffle(publicKeys);
  privateKeys = shuffle(privateKeys);
  
  function selectPublic(key) {
    if (matchedPairs.has(key.pairId)) return;
    selectedPublic = key;
    checkMatch();
  }
  
  function selectPrivate(key) {
    if (matchedPairs.has(key.pairId)) return;
    selectedPrivate = key;
    checkMatch();
  }
  
  function checkMatch() {
    if (!selectedPublic || !selectedPrivate) return;
    
    if (selectedPublic.pairId === selectedPrivate.pairId) {
      // Match!
      matchedPairs.add(selectedPublic.pairId);
      score += 10;
      selectedPublic = null;
      selectedPrivate = null;
      
      if (matchedPairs.size === keyPairs.length) {
        gameWon = true;
        if (timerInterval) {
          clearInterval(timerInterval);
        }
      }
    } else {
      // Wrong match
      setTimeout(() => {
        selectedPublic = null;
        selectedPrivate = null;
      }, 1000);
    }
  }
  
  function startNewGame() {
    keyPairs = generateKeyPairs(4);
    publicKeys = shuffle(keyPairs.map(p => ({ ...p.publicKey, pairId: p.id })));
    privateKeys = shuffle(keyPairs.map(p => ({ ...p.privateKey, pairId: p.id })));
    matchedPairs = new Set();
    selectedPublic = null;
    selectedPrivate = null;
    score = 0;
    time = 0;
    gameStarted = true;
    gameWon = false;
    
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    
    timerInterval = setInterval(() => {
      time++;
    }, 1000);
  }
  
  onMount(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  });
  
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
</script>

<div class="game-container">
  <div class="game-header">
    <h1 class="game-title">{$tStore('keyGame.title')}</h1>
    <p class="game-subtitle">{$tStore('keyGame.subtitle')}</p>
  </div>
  
  {#if !gameStarted}
    <div class="game-start">
      <h2 class="instructions-title">{$tStore('keyGame.instructions')}</h2>
      <div class="instructions-list">
        <div class="instruction-step">
          <span class="step-number">1</span>
          <span class="step-text">{$tStore('keyGame.instructionsStep1')}</span>
        </div>
        <div class="instruction-step">
          <span class="step-number">2</span>
          <span class="step-text">{$tStore('keyGame.instructionsStep2')}</span>
        </div>
        <div class="instruction-step">
          <span class="step-number">3</span>
          <span class="step-text">{$tStore('keyGame.instructionsStep3')}</span>
        </div>
        <div class="instruction-step">
          <span class="step-number">4</span>
          <span class="step-text">{$tStore('keyGame.instructionsStep4')}</span>
        </div>
      </div>
      <div class="hint-box">
        <p class="hint-title">{$tStore('keyGame.instructionsNote')}</p>
      </div>
      <button class="start-button" on:click={startNewGame}>
        {$tStore('keyGame.newGame')}
      </button>
    </div>
  {:else if gameWon}
    <div class="game-won">
      <h2>{$tStore('keyGame.win')}</h2>
      <div class="stats">
        <div class="stat">
          <span class="stat-label">{$tStore('keyGame.score')}:</span>
          <span class="stat-value">{score}</span>
        </div>
        <div class="stat">
          <span class="stat-label">{$tStore('keyGame.time')}:</span>
          <span class="stat-value">{formatTime(time)}</span>
        </div>
      </div>
      <button class="start-button" on:click={startNewGame}>
        {$tStore('keyGame.nextLevel')}
      </button>
    </div>
  {:else}
    <div class="game-stats">
      <div class="stat">
        <span class="stat-label">{$tStore('keyGame.score')}:</span>
        <span class="stat-value">{score}</span>
      </div>
      <div class="stat">
        <span class="stat-label">{$tStore('keyGame.matches')}:</span>
        <span class="stat-value">{matchedPairs.size} / {keyPairs.length}</span>
      </div>
      <div class="stat">
        <span class="stat-label">{$tStore('keyGame.time')}:</span>
        <span class="stat-value">{formatTime(time)}</span>
      </div>
    </div>
    
    <div class="game-board">
      <div class="keys-section">
        <h3 class="section-title">{$tStore('keyGame.publicKey')}</h3>
        <div class="keys-grid">
          {#each publicKeys as key}
            <button
              class="key-card public"
              class:selected={selectedPublic?.pairId === key.pairId}
              class:matched={matchedPairs.has(key.pairId)}
              on:click={() => selectPublic(key)}
              disabled={matchedPairs.has(key.pairId)}
            >
              <div class="key-label">e = {key.e}</div>
              <div class="key-value">n = {key.n}</div>
            </button>
          {/each}
        </div>
      </div>
      
      <div class="keys-section">
        <h3 class="section-title">{$tStore('keyGame.privateKey')}</h3>
        <div class="keys-grid">
          {#each privateKeys as key}
            <button
              class="key-card private"
              class:selected={selectedPrivate?.pairId === key.pairId}
              class:matched={matchedPairs.has(key.pairId)}
              on:click={() => selectPrivate(key)}
              disabled={matchedPairs.has(key.pairId)}
            >
              <div class="key-label">d = {key.d}</div>
              <div class="key-value">n = {key.n}</div>
            </button>
          {/each}
        </div>
      </div>
    </div>
    
    {#if selectedPublic && selectedPrivate}
      <div class="match-feedback" class:correct={selectedPublic.pairId === selectedPrivate.pairId}>
        {selectedPublic.pairId === selectedPrivate.pairId 
          ? $tStore('keyGame.correct')
          : $tStore('keyGame.wrong')}
      </div>
    {/if}
  {/if}
</div>

<style>
  .game-container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  .game-header {
    text-align: center;
    margin-bottom: 2rem;
  }
  
  .game-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--text-formula);
    margin: 0 0 0.5rem 0;
    font-family: var(--font-heading);
    text-shadow: 0 0 20px rgba(96, 165, 250, 0.3);
  }
  
  .game-subtitle {
    font-size: 1.1rem;
    color: var(--text-secondary);
    margin: 0;
  }
  
  .game-start {
    text-align: center;
    padding: 3rem 2rem;
    background: var(--bg-card);
    backdrop-filter: blur(20px);
    border-radius: 16px;
    border: 1px solid var(--border-dark);
  }
  
  .instructions-title {
    font-size: 1.5rem;
    color: var(--text-primary);
    margin: 0 0 2rem 0;
    font-weight: 600;
  }
  
  .instructions-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
    text-align: left;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }
  
  .instruction-step {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
    background: rgba(96, 165, 250, 0.1);
    border-radius: 8px;
    border-left: 3px solid var(--accent-blue);
  }
  
  .step-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    background: var(--accent-blue);
    color: var(--bg-deep);
    border-radius: 50%;
    font-weight: 700;
    flex-shrink: 0;
  }
  
  .step-text {
    flex: 1;
    color: var(--text-primary);
    font-size: 1rem;
    line-height: 1.5;
  }
  
  .hint-box {
    background: rgba(96, 165, 250, 0.15);
    border: 1px solid var(--accent-cyan);
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 2rem;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }
  
  .hint-title {
    margin: 0;
    color: var(--text-secondary);
    font-size: 0.95rem;
    line-height: 1.6;
  }
  
  .start-button {
    padding: 1rem 2rem;
    font-size: 1.2rem;
    font-weight: 600;
    background: var(--accent-blue);
    color: var(--bg-deep);
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-family: var(--font-sans);
  }
  
  .start-button:hover {
    background: var(--accent-cyan);
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(96, 165, 250, 0.4);
  }
  
  .game-stats {
    display: flex;
    justify-content: center;
    gap: 2rem;
    margin-bottom: 2rem;
    padding: 1rem;
    background: var(--bg-card);
    backdrop-filter: blur(20px);
    border-radius: 12px;
    border: 1px solid var(--border-dark);
  }
  
  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }
  
  .stat-label {
    font-size: 0.9rem;
    color: var(--text-secondary);
  }
  
  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--accent-cyan);
  }
  
  .game-board {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  
  .keys-section {
    background: var(--bg-card);
    backdrop-filter: blur(20px);
    border-radius: 16px;
    padding: 1.5rem;
    border: 1px solid var(--border-dark);
  }
  
  .section-title {
    font-size: 1.3rem;
    color: var(--text-primary);
    margin: 0 0 1rem 0;
    text-align: center;
  }
  
  .keys-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }
  
  .key-card {
    padding: 1.5rem;
    background: var(--bg-deep);
    border: 2px solid var(--border-dark);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-family: var(--font-mono);
    text-align: center;
  }
  
  .key-card:hover:not(:disabled) {
    border-color: var(--accent-blue);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(96, 165, 250, 0.3);
  }
  
  .key-card.selected {
    border-color: var(--accent-cyan);
    background: rgba(96, 165, 250, 0.1);
    box-shadow: 0 0 20px rgba(96, 165, 250, 0.5);
  }
  
  .key-card.matched {
    border-color: #10b981;
    background: rgba(16, 185, 129, 0.1);
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  .key-card:disabled {
    cursor: not-allowed;
  }
  
  .key-label {
    font-size: 1rem;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
  }
  
  .key-value {
    font-size: 1.2rem;
    color: var(--text-formula);
    font-weight: 600;
  }
  
  .match-feedback {
    text-align: center;
    padding: 1rem;
    margin-top: 1rem;
    border-radius: 12px;
    font-size: 1.2rem;
    font-weight: 600;
    animation: pop 0.3s ease;
  }
  
  .match-feedback.correct {
    background: rgba(16, 185, 129, 0.2);
    color: #10b981;
    border: 2px solid #10b981;
  }
  
  .match-feedback:not(.correct) {
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;
    border: 2px solid #ef4444;
  }
  
  .game-won {
    text-align: center;
    padding: 3rem 2rem;
    background: var(--bg-card);
    backdrop-filter: blur(20px);
    border-radius: 16px;
    border: 2px solid #10b981;
  }
  
  .game-won h2 {
    font-size: 2rem;
    color: #10b981;
    margin-bottom: 2rem;
  }
  
  @keyframes pop {
    0% {
      transform: scale(0.8);
      opacity: 0;
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
  
  @media (max-width: 768px) {
    .game-container {
      padding: 1rem;
    }
    
    .game-title {
      font-size: 2rem;
    }
    
    .keys-grid {
      grid-template-columns: 1fr;
    }
    
    .game-stats {
      flex-direction: column;
      gap: 1rem;
    }
  }
</style>
