<script>
  import { tStore } from '../i18n/store.js';
  
  export let type = 'crypto'; // 'crypto' or 'web3'
  
  let openIndex = null;
  
  $: faqData = $tStore(`faq.${type}`);
  $: items = faqData?.items || [];
  
  function toggle(index) {
    openIndex = openIndex === index ? null : index;
  }
</script>

<div class="faq-container">
  <div class="faq-header">
    <h1 class="faq-title">{faqData?.title || 'FAQ'}</h1>
    <p class="faq-subtitle">{faqData?.subtitle || ''}</p>
  </div>
  
  <div class="faq-list">
    {#each items as item, index}
      <div class="faq-item" class:open={openIndex === index}>
        <button 
          class="faq-question"
          on:click={() => toggle(index)}
        >
          <span class="question-text">{item.q}</span>
          <span class="toggle-icon">{openIndex === index ? '−' : '+'}</span>
        </button>
        {#if openIndex === index}
          <div class="faq-answer">
            <p>{item.a}</p>
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>

<style>
  .faq-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  .faq-header {
    text-align: center;
    margin-bottom: 3rem;
  }
  
  .faq-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--text-formula);
    margin: 0 0 1rem 0;
    font-family: var(--font-heading);
    text-shadow: 0 0 20px rgba(96, 165, 250, 0.3);
  }
  
  .faq-subtitle {
    font-size: 1.1rem;
    color: var(--text-secondary);
    margin: 0;
    font-style: italic;
  }
  
  .faq-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .faq-item {
    background: var(--bg-card);
    backdrop-filter: blur(20px);
    border: 1px solid var(--border-dark);
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.3s ease;
    box-shadow: var(--shadow-md);
  }
  
  .faq-item:hover {
    border-color: var(--accent-blue);
    box-shadow: var(--shadow-lg);
    transform: translateY(-2px);
  }
  
  .faq-item.open {
    border-color: var(--accent-cyan);
  }
  
  .faq-question {
    width: 100%;
    padding: 1.5rem;
    background: transparent;
    border: none;
    text-align: left;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    color: var(--text-primary);
    font-family: var(--font-sans);
    font-size: 1.1rem;
    font-weight: 600;
    transition: all 0.2s ease;
  }
  
  .faq-question:hover {
    color: var(--accent-blue);
  }
  
  .question-text {
    flex: 1;
  }
  
  .toggle-icon {
    font-size: 1.5rem;
    font-weight: 300;
    color: var(--accent-cyan);
    transition: transform 0.3s ease;
    min-width: 24px;
    text-align: center;
  }
  
  .faq-item.open .toggle-icon {
    transform: rotate(180deg);
  }
  
  .faq-answer {
    padding: 0 1.5rem 1.5rem 1.5rem;
    color: var(--text-secondary);
    font-size: 1rem;
    line-height: 1.6;
    animation: slideDown 0.3s ease;
  }
  
  .faq-answer p {
    margin: 0;
  }
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @media (max-width: 768px) {
    .faq-container {
      padding: 1rem;
    }
    
    .faq-title {
      font-size: 2rem;
    }
    
    .faq-subtitle {
      font-size: 1rem;
    }
    
    .faq-question {
      padding: 1rem;
      font-size: 1rem;
    }
    
    .faq-answer {
      padding: 0 1rem 1rem 1rem;
      font-size: 0.95rem;
    }
  }
</style>
