<script>
  export let currentStep = 1;
  export let totalSteps = 7;
  
  const steps = [
    { number: 1, title: 'Choose Primes' },
    { number: 2, title: 'Calculate n' },
    { number: 3, title: 'Calculate φ(n)' },
    { number: 4, title: 'Choose e' },
    { number: 5, title: 'Calculate d' },
    { number: 6, title: 'Encrypt' },
    { number: 7, title: 'Decrypt' }
  ];
</script>

<div class="step-indicator">
  {#each steps as step}
    <div 
      class="step" 
      class:active={step.number === currentStep}
      class:completed={step.number < currentStep}
    >
      <div class="step-circle">
        {#if step.number < currentStep}
          <span class="checkmark">✓</span>
        {:else}
          <span class="step-number">{step.number}</span>
        {/if}
      </div>
      <div class="step-title">{step.title}</div>
    </div>
    {#if step.number < totalSteps}
      <div class="step-connector" class:completed={step.number < currentStep}></div>
    {/if}
  {/each}
</div>

<style>
  .step-indicator {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 3rem;
    padding: 1.5rem;
    background: var(--bg-card);
    background-image: var(--div-image-url, url('/div.jpg'));
    background-size: cover;
    background-position: center;
    background-blend-mode: overlay;
    backdrop-filter: blur(20px);
    border-radius: 12px;
    border: 1px solid var(--border-dark);
    box-shadow: var(--shadow-md);
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
    scrollbar-color: var(--border-medium) transparent;
    position: relative;
  }
  
  .step-indicator::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--bg-card);
    opacity: 0.85;
    z-index: 0;
    border-radius: 12px;
  }
  
  .step-indicator > * {
    position: relative;
    z-index: 1;
  }
  
  .step-indicator::-webkit-scrollbar {
    height: 6px;
  }
  
  .step-indicator::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .step-indicator::-webkit-scrollbar-thumb {
    background: var(--border-medium);
    border-radius: 3px;
  }
  
  .step {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 0 0 auto;
    min-width: 60px;
  }
  
  .step-circle {
    width: 3rem;
    height: 3rem;
    min-width: 3rem;
    border-radius: 50%;
    border: 2px solid var(--border-medium);
    background: var(--bg-dark);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-mono);
    font-weight: bold;
    font-size: 1.25rem;
    color: var(--text-tertiary);
    transition: all 0.3s ease;
  }
  
  .step.active .step-circle {
    border-color: var(--accent-blue);
    background: var(--accent-blue);
    color: var(--bg-deep);
    box-shadow: 0 0 20px rgba(96, 165, 250, 0.5);
    transform: scale(1.1);
  }
  
  .step.completed .step-circle {
    border-color: var(--accent-green);
    background: var(--accent-green);
    color: var(--bg-deep);
  }
  
  .step-title {
    margin-top: 0.75rem;
    font-size: 0.75rem;
    font-family: var(--font-sans);
    color: var(--text-secondary);
    text-align: center;
    max-width: 5rem;
    font-weight: 600;
    word-break: break-word;
  }
  
  .step.active .step-title {
    color: var(--text-formula);
    font-weight: bold;
  }
  
  .step-connector {
    flex: 1;
    min-width: 20px;
    height: 2px;
    background: var(--border-medium);
    margin: 1.5rem 0.5rem 0 0.5rem;
    transition: all 0.3s ease;
  }
  
  @media (max-width: 768px) {
    .step-indicator {
      padding: 1rem;
      gap: 0.5rem;
    }
    
    .step {
      min-width: 50px;
    }
    
    .step-circle {
      width: 2.5rem;
      height: 2.5rem;
      min-width: 2.5rem;
      font-size: 1rem;
    }
    
    .step-title {
      font-size: 0.65rem;
      max-width: 4rem;
      margin-top: 0.5rem;
    }
    
    .step-connector {
      min-width: 15px;
      margin: 1.25rem 0.25rem 0 0.25rem;
    }
  }
  
  @media (max-width: 480px) {
    .step-title {
      display: none;
    }
    
    .step-circle {
      width: 2rem;
      height: 2rem;
      min-width: 2rem;
      font-size: 0.9rem;
    }
  }
  
  .step-connector.completed {
    background: var(--accent-green);
  }
  
  .checkmark {
    font-size: 1.5rem;
  }
</style>

