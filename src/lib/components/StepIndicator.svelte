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
    background: rgba(255, 255, 255, 0.5);
    border-radius: 8px;
    border: 2px solid #95A5A6;
  }
  
  .step {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 0 0 auto;
  }
  
  .step-circle {
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    border: 3px solid #95A5A6;
    background: #FFFFFF;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Courier New', monospace;
    font-weight: bold;
    font-size: 1.25rem;
    color: #95A5A6;
    transition: all 0.3s ease;
  }
  
  .step.active .step-circle {
    border-color: #4A5568;
    background: #4A5568;
    color: white;
    box-shadow: 0 4px 6px rgba(74, 85, 104, 0.3);
    transform: scale(1.1);
  }
  
  .step.completed .step-circle {
    border-color: #27AE60;
    background: #27AE60;
    color: white;
  }
  
  .step-title {
    margin-top: 0.75rem;
    font-size: 0.75rem;
    font-family: 'Georgia', serif;
    color: #2C3E50;
    text-align: center;
    max-width: 5rem;
    font-weight: 600;
  }
  
  .step.active .step-title {
    color: #4A5568;
    font-weight: bold;
  }
  
  .step-connector {
    flex: 1;
    height: 3px;
    background: #95A5A6;
    margin: 1.5rem 0.5rem 0 0.5rem;
    transition: all 0.3s ease;
  }
  
  .step-connector.completed {
    background: #27AE60;
  }
  
  .checkmark {
    font-size: 1.5rem;
  }
</style>

