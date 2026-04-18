<script>
  export let concept = {};
  export let onClick = () => {};
  export let available = true;
</script>

<button class="concept-card" class:coming-soon={!available} on:click={onClick}>
  <div class="icon">{(concept.id || 'SL').toUpperCase().slice(0, 3)}</div>
  <div class="content">
    <h3 class="title">{concept.title}</h3>
    <p class="description">{concept.description}</p>
  </div>
  <div class="arrow">→</div>
</button>

<style>
  .concept-card {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 1.5rem;
    background: var(--bg-card);
    background-image: var(--div-image-url, url('/div.jpg'));
    background-size: cover;
    background-position: center;
    background-blend-mode: overlay;
    backdrop-filter: blur(20px);
    border: 1px solid var(--border-dark);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: left;
    width: 100%;
    font-family: inherit;
    box-shadow: var(--shadow-md);
    position: relative;
    overflow: hidden;
  }
  
  .concept-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--bg-card);
    opacity: 0.85;
    z-index: 0;
  }
  
  .concept-card > * {
    position: relative;
    z-index: 1;
  }
  
  .concept-card:hover {
    border-color: var(--accent-blue);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
    transform: translateY(-2px);
    background: var(--bg-hover);
  }
  
  .concept-card:active {
    transform: translateY(0);
  }
  
  .icon {
    font-size: 0.75rem;
    font-weight: 700;
    font-family: var(--font-mono);
    letter-spacing: 0.05em;
    color: #60a5fa;
    flex-shrink: 0;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(96, 165, 250, 0.25);
    border-radius: 8px;
    background: rgba(96, 165, 250, 0.06);
  }
  
  .content {
    flex: 1;
  }
  
  .title {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-formula);
    margin: 0 0 0.5rem 0;
    font-family: var(--font-heading);
    letter-spacing: -0.01em;
  }
  
  .description {
    font-size: 0.95rem;
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.5;
    font-family: var(--font-sans);
  }
  
  .arrow {
    font-size: 1.5rem;
    color: var(--text-tertiary);
    transition: all 0.3s ease;
    flex-shrink: 0;
  }
  
  .concept-card:hover .arrow {
    transform: translateX(4px);
    color: var(--accent-blue);
  }
  
  .concept-card.coming-soon {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .concept-card.coming-soon:hover {
    transform: none;
    border-color: var(--border-dark);
    box-shadow: var(--shadow-md);
  }
  
  @media (max-width: 768px) {
    .concept-card {
      padding: 1rem;
      gap: 1rem;
    }
    
    .icon {
      font-size: 2rem;
    }
    
    .title {
      font-size: 1.1rem;
    }
    
    .description {
      font-size: 0.85rem;
    }
  }
</style>

