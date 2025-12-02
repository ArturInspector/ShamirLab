<script>
  import MathNotation from './MathNotation.svelte';
  
  export let base = 42;
  export let exponent = 5;
  export let modulus = 391;
  export let steps = [];
  
  let currentStepIndex = 0;
  let isAnimating = false;
  
  function startAnimation() {
    if (isAnimating) return;
    isAnimating = true;
    currentStepIndex = 0;
    
    const interval = setInterval(() => {
      if (currentStepIndex < steps.length - 1) {
        currentStepIndex++;
      } else {
        clearInterval(interval);
        isAnimating = false;
      }
    }, 800);
  }
  
  function resetAnimation() {
    currentStepIndex = 0;
    isAnimating = false;
  }
</script>

<div class="mod-exp-viz">
  <h4>Как вычисляется модульное возведение в степень:</h4>
  
  <div class="formula-header">
    <MathNotation formula={base + '^{' + exponent + '} \\bmod ' + modulus} displayMode={true} />
  </div>
  
  {#if steps.length > 0}
    <div class="controls-viz">
      <button class="animate-btn" on:click={startAnimation} disabled={isAnimating}>
        Показать шаги
      </button>
      <button class="reset-btn" on:click={resetAnimation}>
        Сброс
      </button>
    </div>
    
    <div class="steps-container">
      {#each steps as step, index}
        <div 
          class="step-item" 
          class:active={index === currentStepIndex}
          class:completed={index < currentStepIndex}
        >
          {#if step.type === 'binary'}
            <div class="step-type binary">
              <span class="type-label">Двоичное представление:</span>
              <span class="binary-value">{step.exponent}<sub>10</sub> = {step.binary}<sub>2</sub></span>
            </div>
          {:else if step.type === 'initialize'}
            <div class="step-type initialize">
              <span class="type-label">Инициализация:</span>
              <span class="formula">result = {step.value}</span>
            </div>
          {:else if step.type === 'square'}
            <div class="step-type square">
              <span class="type-label">Бит {step.bit}: Возводим в квадрат</span>
              <span class="formula">{step.oldValue}² mod {modulus} = {step.newValue}</span>
            </div>
          {:else if step.type === 'multiply'}
            <div class="step-type multiply">
              <span class="type-label">Бит {step.bit}: Умножаем</span>
              <span class="formula">{step.oldValue} × {step.base} mod {modulus} = {step.newValue}</span>
            </div>
          {/if}
        </div>
      {/each}
    </div>
    
    {#if currentStepIndex === steps.length - 1 && steps.length > 0}
      <div class="final-result">
        <strong>Результат:</strong> 
        <MathNotation formula={base + '^{' + exponent + '} \\bmod ' + modulus + ' = ' + steps[steps.length - 1].newValue} displayMode={true} />
      </div>
    {/if}
  {/if}
</div>

<style>
  .mod-exp-viz {
    margin: 2rem 0;
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
    border: 1px dashed var(--border-medium);
  }
  
  h4 {
    color: var(--text-formula);
    margin-bottom: 1rem;
  }
  
  .formula-header {
    text-align: center;
    margin: 1.5rem 0;
    padding: 1rem;
    background: rgba(96, 165, 250, 0.1);
    border-radius: 8px;
  }
  
  .controls-viz {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin: 1.5rem 0;
  }
  
  .animate-btn, .reset-btn {
    padding: 0.5rem 1.5rem;
    border: none;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    font-family: var(--font-sans);
  }
  
  .animate-btn {
    background: var(--accent-blue);
    color: var(--bg-deep);
  }
  
  .animate-btn:hover:not(:disabled) {
    background: var(--accent-cyan);
  }
  
  .animate-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .reset-btn {
    background: var(--bg-dark);
    color: var(--text-primary);
    border: 1px solid var(--border-medium);
  }
  
  .reset-btn:hover {
    background: var(--bg-hover);
  }
  
  .steps-container {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin: 1.5rem 0;
  }
  
  .step-item {
    padding: 1rem;
    background: rgba(255, 255, 255, 0.03);
    border-left: 3px solid var(--border-dark);
    border-radius: 6px;
    transition: all 0.3s ease;
    opacity: 0.5;
  }
  
  .step-item.completed {
    opacity: 0.7;
    border-left-color: var(--accent-green);
  }
  
  .step-item.active {
    opacity: 1;
    border-left-color: var(--accent-blue);
    background: rgba(96, 165, 250, 0.15);
    transform: translateX(4px);
  }
  
  .step-type {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .type-label {
    color: var(--text-tertiary);
    font-size: 0.85rem;
    font-weight: 600;
    text-transform: uppercase;
  }
  
  .step-item.active .type-label {
    color: var(--accent-blue);
  }
  
  .formula, .binary-value {
    color: var(--text-formula);
    font-family: var(--font-mono);
    font-size: 1.1rem;
  }
  
  .binary-value {
    font-size: 1.25rem;
  }
  
  .final-result {
    margin-top: 2rem;
    padding: 1.5rem;
    background: rgba(52, 211, 153, 0.1);
    border: 2px solid var(--accent-green);
    border-radius: 8px;
    text-align: center;
  }
  
  .final-result strong {
    color: var(--accent-green);
    display: block;
    margin-bottom: 0.5rem;
  }
</style>

