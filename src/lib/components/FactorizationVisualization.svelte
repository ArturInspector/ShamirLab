<script>
  import { onMount } from 'svelte';
  import MathNotation from './MathNotation.svelte';
  
  export let n = 391;
  export let p = 17;
  export let q = 23;
  
  let isFactoring = false;
  let currentDivisor = 2;
  let attempts = [];
  let foundFactors = null;
  let timeElapsed = 0;
  let startTime = null;
  
  function factorize() {
    if (isFactoring) return;
    
    isFactoring = true;
    attempts = [];
    foundFactors = null;
    currentDivisor = 2;
    timeElapsed = 0;
    startTime = Date.now();
    
    const interval = setInterval(() => {
      timeElapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      
      // Try current divisor
      if (n % currentDivisor === 0) {
        const quotient = n / currentDivisor;
        attempts.push({
          divisor: currentDivisor,
          quotient: quotient,
          success: true
        });
        
        foundFactors = {
          p: currentDivisor,
          q: quotient
        };
        
        clearInterval(interval);
        isFactoring = false;
      } else {
        attempts.push({
          divisor: currentDivisor,
          success: false
        });
        currentDivisor++;
        
        // Safety limit
        if (currentDivisor > Math.sqrt(n) + 10) {
          clearInterval(interval);
          isFactoring = false;
        }
      }
    }, 300); // 300ms per attempt for visualization
  }
  
  function reset() {
    isFactoring = false;
    attempts = [];
    foundFactors = null;
    currentDivisor = 2;
    timeElapsed = 0;
  }
  
  function estimateTimeForLargeKey(bits) {
    // Rough estimate: factoring time grows exponentially
    // This is simplified for educational purposes
    const baseTime = 0.001; // seconds for small numbers
    const growthFactor = Math.pow(2, bits / 2 - 10);
    return (baseTime * growthFactor).toFixed(0);
  }
</script>

<div class="factorization-viz">
  <h2>Визуализация факторизации</h2>
  <p class="subtitle">Попробуем взломать ключ, найдя p и q из n</p>
  
  <div class="target-box">
    <div class="target-label">Цель: факторизовать</div>
    <div class="target-value">
      <MathNotation formula={'n = ' + n} displayMode={true} />
    </div>
    <div class="target-info">
      <p>n = p × q, где p = {p} и q = {q}</p>
    </div>
  </div>
  
  <div class="controls">
    <button class="factor-btn" on:click={factorize} disabled={isFactoring}>
      {isFactoring ? 'Факторизуем...' : 'Начать факторизацию'}
    </button>
    <button class="reset-btn" on:click={reset} disabled={isFactoring}>
      Сброс
    </button>
  </div>
  
  {#if isFactoring || attempts.length > 0}
    <div class="progress-section">
      <div class="stats">
        <div class="stat">
          <span class="stat-label">Попыток:</span>
          <span class="stat-value">{attempts.length}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Время:</span>
          <span class="stat-value">{timeElapsed}с</span>
        </div>
        <div class="stat">
          <span class="stat-label">Проверяем:</span>
          <span class="stat-value">{currentDivisor}</span>
        </div>
      </div>
      
      <div class="attempts-list">
        <h4>Попытки деления:</h4>
        <div class="attempts-scroll">
          {#each attempts.slice(-10) as attempt}
            <div class="attempt" class:success={attempt.success}>
              {#if attempt.success}
                <span class="check">✓</span>
                <span class="formula">
                  {n} ÷ {attempt.divisor} = {attempt.quotient}
                </span>
                <span class="result">НАЙДЕНО!</span>
              {:else}
                <span class="cross">×</span>
                <span class="formula">
                  {n} ÷ {attempt.divisor} ≠ целое число
                </span>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    </div>
  {/if}
  
  {#if foundFactors}
    <div class="success-result">
      <h3>люч взломан!</h3>
      <div class="factors">
        <MathNotation formula={n + ' = ' + foundFactors.p + ' \\times ' + foundFactors.q} displayMode={true} />
      </div>
      <div class="warning-box">
        <p><strong>Внимание!</strong></p>
        <p>Этот ключ взломан за {timeElapsed} секунд, потому что числа маленькие ({p} и {q}).</p>
        <p>С реальными ключами (2048 бит) это заняло бы:</p>
        <div class="time-estimate">
          <strong>{estimateTimeForLargeKey(2048)} лет</strong> на суперкомпьютере
        </div>
      </div>
    </div>
  {/if}
  
  <div class="comparison-table">
    <h4>Сравнение времени взлома:</h4>
    <table>
      <thead>
        <tr>
          <th>Размер ключа</th>
          <th>Пример n</th>
          <th>Время взлома</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>32 бита</td>
          <td>~10^9</td>
          <td>Несколько секунд</td>
        </tr>
        <tr>
          <td>64 бита</td>
          <td>~10^18</td>
          <td>Несколько часов</td>
        </tr>
        <tr>
          <td>128 бит</td>
          <td>~10^38</td>
          <td>Миллионы лет</td>
        </tr>
        <tr class="recommended">
          <td><strong>2048 бит</strong></td>
          <td>~10^616</td>
          <td><strong>10^50+ лет</strong></td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

<style>
  .factorization-viz {
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
  
  .factorization-viz::before {
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
  
  .factorization-viz > * {
    position: relative;
    z-index: 1;
  }
  
  h2 {
    text-align: center;
    color: var(--text-formula);
    margin-bottom: 0.5rem;
  }
  
  .subtitle {
    text-align: center;
    color: var(--text-secondary);
    margin-bottom: 2rem;
  }
  
  .target-box {
    background: rgba(239, 68, 68, 0.1);
    border: 2px solid var(--error);
    border-radius: 12px;
    padding: 2rem;
    text-align: center;
    margin-bottom: 2rem;
  }
  
  .target-label {
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }
  
  .target-value {
    font-size: 2rem;
    color: var(--text-formula);
    margin: 1rem 0;
  }
  
  .target-info {
    color: var(--text-tertiary);
    font-size: 0.9rem;
    margin-top: 1rem;
  }
  
  .controls {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-bottom: 2rem;
  }
  
  .factor-btn, .reset-btn {
    padding: 0.75rem 2rem;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    font-family: var(--font-sans);
  }
  
  .factor-btn {
    background: var(--error);
    color: var(--bg-deep);
  }
  
  .factor-btn:hover:not(:disabled) {
    background: #dc2626;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
  }
  
  .reset-btn {
    background: var(--bg-dark);
    color: var(--text-primary);
    border: 1px solid var(--border-medium);
  }
  
  .reset-btn:hover:not(:disabled) {
    background: var(--bg-hover);
    border-color: var(--accent-blue);
  }
  
  .progress-section {
    margin: 2rem 0;
  }
  
  .stats {
    display: flex;
    justify-content: space-around;
    gap: 2rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
  }
  
  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    min-width: 120px;
  }
  
  .stat-label {
    color: var(--text-tertiary);
    font-size: 0.85rem;
    margin-bottom: 0.5rem;
  }
  
  .stat-value {
    color: var(--text-formula);
    font-size: 1.5rem;
    font-weight: 600;
    font-family: var(--font-mono);
  }
  
  .attempts-list {
    margin-top: 2rem;
  }
  
  .attempts-list h4 {
    color: var(--text-formula);
    margin-bottom: 1rem;
  }
  
  .attempts-scroll {
    max-height: 300px;
    overflow-y: auto;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 8px;
    padding: 1rem;
  }
  
  .attempt {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem;
    margin: 0.5rem 0;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 6px;
    border-left: 3px solid var(--border-dark);
    font-family: var(--font-mono);
    font-size: 0.9rem;
  }
  
  .attempt.success {
    border-left-color: var(--accent-green);
    background: rgba(52, 211, 153, 0.1);
  }
  
  .check {
    color: var(--accent-green);
    font-size: 1.2rem;
    font-weight: bold;
  }
  
  .cross {
    color: var(--text-tertiary);
    font-size: 1rem;
  }
  
  .formula {
    flex: 1;
    color: var(--text-secondary);
  }
  
  .result {
    color: var(--accent-green);
    font-weight: 600;
  }
  
  .success-result {
    margin: 2rem 0;
    padding: 2rem;
    background: rgba(239, 68, 68, 0.15);
    border: 2px solid var(--error);
    border-radius: 12px;
    text-align: center;
  }
  
  .success-result h3 {
    color: var(--error);
    margin-bottom: 1rem;
  }
  
  .factors {
    margin: 1.5rem 0;
    font-size: 1.5rem;
  }
  
  .warning-box {
    margin-top: 2rem;
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    text-align: left;
  }
  
  .warning-box p {
    color: var(--text-secondary);
    margin: 0.5rem 0;
  }
  
  .warning-box strong {
    color: var(--text-formula);
  }
  
  .time-estimate {
    margin-top: 1rem;
    padding: 1rem;
    background: rgba(239, 68, 68, 0.2);
    border-radius: 8px;
    text-align: center;
  }
  
  .time-estimate strong {
    font-size: 1.5rem;
    color: var(--error);
  }
  
  .comparison-table {
    margin-top: 3rem;
  }
  
  .comparison-table h4 {
    color: var(--text-formula);
    margin-bottom: 1rem;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
    overflow: hidden;
  }
  
  thead {
    background: rgba(96, 165, 250, 0.2);
  }
  
  th {
    padding: 1rem;
    text-align: left;
    color: var(--text-formula);
    font-weight: 600;
    border-bottom: 2px solid var(--border-medium);
  }
  
  td {
    padding: 1rem;
    color: var(--text-secondary);
    border-bottom: 1px solid var(--border-dark);
  }
  
  tr.recommended {
    background: rgba(52, 211, 153, 0.1);
  }
  
  tr.recommended td {
    color: var(--accent-green);
    font-weight: 600;
  }
  
  @media (max-width: 768px) {
    .stats {
      flex-direction: column;
    }
    
    table {
      font-size: 0.85rem;
    }
    
    th, td {
      padding: 0.5rem;
    }
  }
</style>

