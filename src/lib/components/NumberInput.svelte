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
    <span class="validation-badge valid">✓ Valid</span>
  {:else if isValid === false}
    <span class="validation-badge invalid">✗ Invalid</span>
  {/if}
</div>

<style>
  .number-input {
    margin-bottom: 1.5rem;
    position: relative;
  }
  
  .label-text {
    display: block;
    font-family: 'Courier New', monospace;
    font-size: 1rem;
    font-weight: 600;
    color: #2C3E50;
    margin-bottom: 0.5rem;
  }
  
  input {
    width: 100%;
    padding: 0.75rem 1rem;
    font-size: 1.125rem;
    font-family: 'Courier New', monospace;
    border: 2px solid #95A5A6;
    background: #FFFFFF;
    color: #1a1a1a;
    border-radius: 4px;
    transition: all 0.3s ease;
  }
  
  input:focus {
    outline: none;
    border-color: #4A5568;
    box-shadow: 0 0 0 3px rgba(74, 85, 104, 0.1);
  }
  
  input.valid {
    border-color: #27AE60;
    background: #f0fdf4;
  }
  
  input.invalid {
    border-color: #E74C3C;
    background: #fef2f2;
  }
  
  input:disabled {
    background: #e5e5e5;
    cursor: not-allowed;
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
    background: #27AE60;
    color: white;
  }
  
  .validation-badge.invalid {
    background: #E74C3C;
    color: white;
  }
</style>

