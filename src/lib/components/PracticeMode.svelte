<script>
  import { onMount } from 'svelte';
  import MathNotation from './MathNotation.svelte';
  import NumberInput from './NumberInput.svelte';
  import { isPrime } from '../algorithms/primeUtils.js';
  import { RSAKeyGenerator, rsaEncrypt, rsaDecrypt } from '../algorithms/rsa.js';
  
  let challengeType = 'encrypt';
  let userAnswer = '';
  let correctAnswer = null;
  let showResult = false;
  let isCorrect = false;
  let attempts = 0;
  let score = 0;
  
  // Challenge 1: Encrypt
  let challenge1_p = 11;
  let challenge1_q = 13;
  let challenge1_e = 7;
  let challenge1_message = 42;
  let challenge1_n = null;
  let challenge1_correct = null;
  
  // Challenge 2: Factorize
  let challenge2_n = 143;
  let challenge2_p = null;
  let challenge2_q = null;
  
  // Challenge 3: Find private key
  let challenge3_e = 7;
  let challenge3_phi = 120;
  let challenge3_d = null;
  
  function generateChallenge1() {
    const generator = new RSAKeyGenerator(challenge1_p, challenge1_q);
    challenge1_n = generator.calculateN();
    const publicKey = { e: challenge1_e, n: challenge1_n };
    const result = rsaEncrypt(challenge1_message, publicKey);
    challenge1_correct = result.ciphertext;
  }
  
  function checkEncrypt() {
    attempts++;
    const userNum = parseInt(userAnswer);
    if (userNum === challenge1_correct) {
      isCorrect = true;
      score++;
      showResult = true;
    } else {
      isCorrect = false;
      showResult = true;
    }
  }
  
  function checkFactorize() {
    attempts++;
    const userP = parseInt(challenge2_p);
    const userQ = parseInt(challenge2_q);
    
    if (isPrime(userP) && isPrime(userQ) && userP * userQ === challenge2_n) {
      isCorrect = true;
      score++;
      showResult = true;
    } else {
      isCorrect = false;
      showResult = true;
    }
  }
  
  function checkPrivateKey() {
    attempts++;
    const generator = new RSAKeyGenerator(11, 13); // dummy, just for modInverse
    generator.calculateN();
    generator.calculatePhi();
    generator.chooseE(challenge3_e);
    const dResult = generator.calculateD();
    challenge3_d = dResult.d;
    
    const userD = parseInt(userAnswer);
    if (userD === challenge3_d) {
      isCorrect = true;
      score++;
      showResult = true;
    } else {
      isCorrect = false;
      showResult = true;
    }
  }
  
  function nextChallenge() {
    challengeType = challengeType === 'encrypt' ? 'factorize' : 
                    challengeType === 'factorize' ? 'private' : 'encrypt';
    userAnswer = '';
    challenge2_p = null;
    challenge2_q = null;
    showResult = false;
    attempts = 0;
    generateChallenge1();
  }
  
  function reset() {
    challengeType = 'encrypt';
    userAnswer = '';
    showResult = false;
    attempts = 0;
    score = 0;
    generateChallenge1();
  }
  
  onMount(() => {
    generateChallenge1();
  });
</script>

<div class="practice-mode">
  <div class="header-section">
    <h2>Практические задачи</h2>
    <div class="score">Очки: <strong>{score}</strong></div>
  </div>
  
  <div class="challenge-selector">
    <button 
      class="challenge-btn" 
      class:active={challengeType === 'encrypt'}
      on:click={() => { challengeType = 'encrypt'; reset(); }}
    >
      Зашифровать
    </button>
    <button 
      class="challenge-btn"
      class:active={challengeType === 'factorize'}
      on:click={() => { challengeType = 'factorize'; reset(); }}
    >
      Факторизовать
    </button>
    <button 
      class="challenge-btn"
      class:active={challengeType === 'private'}
      on:click={() => { challengeType = 'private'; reset(); }}
    >
      Найти приватный ключ
    </button>
  </div>
  
  {#if challengeType === 'encrypt'}
    <div class="challenge-box">
      <h3>Задача 1: Зашифруй сообщение</h3>
      <div class="challenge-info">
        <p>Дано:</p>
        <ul>
          <li>p = {challenge1_p}, q = {challenge1_q}</li>
          <li>e = {challenge1_e}</li>
          <li>Сообщение m = {challenge1_message}</li>
        </ul>
        <p><strong>Задача:</strong> Вычисли c = m^e mod n</p>
      </div>
      
      <div class="input-section">
        <input 
          type="number" 
          bind:value={userAnswer}
          placeholder="Ваш ответ (c)"
          class="answer-input"
        />
        <button class="check-btn" on:click={checkEncrypt}>
          Проверить
        </button>
      </div>
      
      {#if showResult}
        <div class="result-box" class:correct={isCorrect} class:wrong={!isCorrect}>
          {#if isCorrect}
            <p><span class="check-mark">✓</span> Правильно! c = {challenge1_correct}</p>
            <button class="next-btn" on:click={nextChallenge}>Следующая задача →</button>
          {:else}
            <p><span class="cross-mark">✗</span> Неправильно. Попробуй еще раз!</p>
            <p class="hint">Подсказка: сначала найди n = p × q</p>
          {/if}
        </div>
      {/if}
    </div>
  {/if}
  
  {#if challengeType === 'factorize'}
    <div class="challenge-box">
      <h3>Задача 2: Факторизуй число</h3>
      <div class="challenge-info">
        <p>Дано: n = {challenge2_n}</p>
        <p><strong>Задача:</strong> Найди простые числа p и q такие, что p × q = n</p>
      </div>
      
      <div class="input-section">
        <div class="factor-inputs">
          <input 
            type="number" 
            bind:value={challenge2_p}
            placeholder="p"
            class="factor-input"
          />
          <span>×</span>
          <input 
            type="number" 
            bind:value={challenge2_q}
            placeholder="q"
            class="factor-input"
          />
        </div>
        <button class="check-btn" on:click={checkFactorize}>
          Проверить
        </button>
      </div>
      
      {#if showResult}
        <div class="result-box" class:correct={isCorrect} class:wrong={!isCorrect}>
          {#if isCorrect}
            <p><span class="check-mark">✓</span> Правильно! {challenge2_n} = {challenge2_p} × {challenge2_q}</p>
            <button class="next-btn" on:click={nextChallenge}>Следующая задача →</button>
          {:else}
            <p><span class="cross-mark">✗</span> Неправильно. Попробуй еще раз!</p>
            <p class="hint">Подсказка: попробуй делить n на простые числа</p>
          {/if}
        </div>
      {/if}
    </div>
  {/if}
  
  {#if challengeType === 'private'}
    <div class="challenge-box">
      <h3>Задача 3: Найди приватный ключ</h3>
      <div class="challenge-info">
        <p>Дано:</p>
        <ul>
          <li>e = {challenge3_e}</li>
          <li>φ(n) = {challenge3_phi}</li>
        </ul>
        <p><strong>Задача:</strong> Найди d такое, что d × e ≡ 1 (mod φ(n))</p>
      </div>
      
      <div class="input-section">
        <input 
          type="number" 
          bind:value={userAnswer}
          placeholder="Ваш ответ (d)"
          class="answer-input"
        />
        <button class="check-btn" on:click={checkPrivateKey}>
          Проверить
        </button>
      </div>
      
      {#if showResult}
        <div class="result-box" class:correct={isCorrect} class:wrong={!isCorrect}>
          {#if isCorrect}
            <p><span class="check-mark">✓</span> Правильно! d = {challenge3_d}</p>
            <button class="next-btn" on:click={nextChallenge}>Начать заново →</button>
          {:else}
            <p><span class="cross-mark">✗</span> Неправильно. Попробуй еще раз!</p>
            <p class="hint">Подсказка: используй расширенный алгоритм Евклида</p>
          {/if}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .practice-mode {
    padding: 2rem;
    background: var(--bg-card);
    background-image: var(--div-image-url, url('/div.jpg'));
    background-size: cover;
    background-position: center;
    background-blend-mode: overlay;
    border-radius: 12px;
    border: 1px solid var(--border-dark);
    margin: 2rem 0;
    position: relative;
    overflow: hidden;
  }
  
  .practice-mode::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--bg-card);
    opacity: 0.8;
    z-index: 0;
    border-radius: 12px;
  }
  
  .practice-mode > * {
    position: relative;
    z-index: 1;
  }
  
  .header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  h2 {
    color: var(--text-formula);
    margin: 0;
  }
  
  .score {
    color: var(--text-secondary);
    font-size: 1.1rem;
  }
  
  .score strong {
    color: var(--accent-green);
    font-size: 1.5rem;
  }
  
  .challenge-selector {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
  }
  
  .challenge-btn {
    flex: 1;
    padding: 0.75rem 1.5rem;
    background: var(--bg-dark);
    border: 1px solid var(--border-medium);
    border-radius: 8px;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.3s ease;
    font-family: var(--font-sans);
    font-weight: 500;
    min-width: 150px;
  }
  
  .challenge-btn:hover {
    border-color: var(--accent-blue);
    color: var(--text-primary);
  }
  
  .challenge-btn.active {
    background: var(--accent-blue);
    border-color: var(--accent-blue);
    color: var(--bg-deep);
    font-weight: 600;
    box-shadow: 0 0 20px rgba(96, 165, 250, 0.5);
  }
  
  .challenge-box {
    background: rgba(255, 255, 255, 0.05);
    padding: 2rem;
    border-radius: 12px;
    border: 1px solid var(--border-medium);
  }
  
  .challenge-box h3 {
    color: var(--text-formula);
    margin-bottom: 1.5rem;
  }
  
  .challenge-info {
    margin-bottom: 2rem;
  }
  
  .challenge-info p {
    color: var(--text-secondary);
    margin: 0.5rem 0;
  }
  
  .challenge-info ul {
    margin: 1rem 0;
    padding-left: 2rem;
  }
  
  .challenge-info li {
    color: var(--text-secondary);
    margin: 0.5rem 0;
    font-family: var(--font-mono);
  }
  
  .challenge-info strong {
    color: var(--text-formula);
  }
  
  .input-section {
    display: flex;
    gap: 1rem;
    align-items: center;
    flex-wrap: wrap;
    margin-bottom: 1.5rem;
  }
  
  .answer-input {
    flex: 1;
    padding: 0.75rem 1rem;
    background: var(--bg-dark);
    border: 1px solid var(--border-medium);
    border-radius: 8px;
    color: var(--text-primary);
    font-family: var(--font-mono);
    font-size: 1.1rem;
    min-width: 200px;
  }
  
  .answer-input:focus {
    outline: none;
    border-color: var(--accent-blue);
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2);
  }
  
  .factor-inputs {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex: 1;
  }
  
  .factor-input {
    flex: 1;
    padding: 0.75rem 1rem;
    background: var(--bg-dark);
    border: 1px solid var(--border-medium);
    border-radius: 8px;
    color: var(--text-primary);
    font-family: var(--font-mono);
    font-size: 1.1rem;
  }
  
  .factor-input:focus {
    outline: none;
    border-color: var(--accent-blue);
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2);
  }
  
  .factor-inputs span {
    color: var(--text-formula);
    font-size: 1.5rem;
    font-weight: 600;
  }
  
  .check-btn {
    padding: 0.75rem 2rem;
    background: var(--accent-blue);
    color: var(--bg-deep);
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    font-family: var(--font-sans);
  }
  
  .check-btn:hover {
    background: var(--accent-cyan);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(96, 165, 250, 0.4);
  }
  
  .result-box {
    padding: 1.5rem;
    border-radius: 8px;
    margin-top: 1.5rem;
  }
  
  .result-box.correct {
    background: rgba(52, 211, 153, 0.15);
    border: 2px solid var(--accent-green);
  }
  
  .result-box.wrong {
    background: rgba(239, 68, 68, 0.15);
    border: 2px solid var(--error);
  }
  
  .result-box p {
    color: var(--text-primary);
    margin: 0.5rem 0;
    font-size: 1.1rem;
  }
  
  .hint {
    color: var(--text-tertiary);
    font-size: 0.9rem;
    font-style: italic;
    margin-top: 0.5rem;
  }
  
  .check-mark {
    color: var(--accent-green);
    font-weight: bold;
    margin-right: 0.5rem;
  }
  
  .cross-mark {
    color: var(--error);
    font-weight: bold;
    margin-right: 0.5rem;
  }
  
  .next-btn {
    margin-top: 1rem;
    padding: 0.75rem 2rem;
    background: var(--accent-green);
    color: var(--bg-deep);
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    font-family: var(--font-sans);
  }
  
  .next-btn:hover {
    background: var(--accent-green);
    filter: brightness(1.1);
    transform: translateY(-2px);
  }
  
  @media (max-width: 768px) {
    .input-section {
      flex-direction: column;
    }
    
    .answer-input, .factor-input {
      width: 100%;
    }
  }
</style>

