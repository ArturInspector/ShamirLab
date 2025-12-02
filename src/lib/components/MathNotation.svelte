<script>
  import { onMount } from 'svelte';
  import katex from 'katex';
  
  export let formula = '';
  export let displayMode = false; // Block vs inline
  
  let element;
  
  onMount(() => {
    renderMath();
  });
  
  $: if (element && formula) {
    renderMath();
  }
  
  function renderMath() {
    if (!element || !formula) return;
    
    try {
      katex.render(formula, element, {
        displayMode: displayMode,
        throwOnError: false,
        output: 'html'
      });
    } catch (e) {
      console.error('KaTeX rendering error:', e);
      element.textContent = formula;
    }
  }
</script>

<span bind:this={element} class="math-notation" class:display={displayMode}></span>

<style>
  .math-notation {
    font-size: 1.25rem;
    color: #2C3E50;
  }
  
  .math-notation.display {
    display: block;
    margin: 1.5rem 0;
    text-align: center;
    font-size: 1.5rem;
  }
  
  :global(.katex) {
    font-size: 1.2em;
  }
  
  :global(.katex-display) {
    margin: 1rem 0;
  }
</style>

