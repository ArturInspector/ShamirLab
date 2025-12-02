<script>
  export let value = '';
  export let label = '';
  export let isValid = null;
  export let placeholder = '';
  export let disabled = false;
  
  function handleInput(event) {
    value = event.target.value;
  }
</script>

<div class="number-input">
  <label>
    <span class="label-text">{label}</span>
    <input
      type="number"
      {placeholder}
      {disabled}
      value={value}
      on:input={handleInput}
      class:valid={isValid === true}
      class:invalid={isValid === false}
    />
  </label>
  {#if isValid === true}
    <span class="validation-badge valid">Valid</span>
  {:else if isValid === false}
    <span class="validation-badge invalid">Invalid</span>
  {/if}
</div>

<style>
  .number-input {
    margin-bottom: 1.5rem;
    position: relative;
  }
  
  .label-text {
    display: block;
    font-family: var(--font-mono);
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-formula);
    margin-bottom: 0.5rem;
  }
  
  input {
    width: 100%;
    padding: 0.75rem 1rem;
    font-size: 1.125rem;
    font-family: var(--font-mono);
    border: 1px solid var(--border-medium);
    background: var(--bg-card);
    color: var(--text-primary);
    border-radius: 8px;
    transition: all 0.3s ease;
  }
  
  input:focus {
    outline: none;
    border-color: var(--accent-blue);
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2);
  }
  
  input.valid {
    border-color: var(--accent-green);
    background: rgba(52, 211, 153, 0.1);
  }
  
  input.invalid {
    border-color: var(--error);
    background: rgba(239, 68, 68, 0.1);
  }
  
  input:disabled {
    background: rgba(255, 255, 255, 0.05);
    cursor: not-allowed;
    opacity: 0.5;
  }
  
  .validation-badge {
    display: inline-block;
    margin-top: 0.5rem;
    padding: 0.25rem 0.75rem;
    border-radius: 4px;
    font-size: 0.875rem;
    font-weight: 600;
  }
  
  .validation-badge.valid {
    background: var(--accent-green);
    color: var(--bg-deep);
  }
  
  .validation-badge.invalid {
    background: var(--error);
    color: var(--bg-deep);
  }
</style>

