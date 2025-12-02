<script>
  import ConceptCard from './ConceptCard.svelte';
  import AliceAndBob from './AliceAndBob.svelte';
  import FactorizationVisualization from './FactorizationVisualization.svelte';
  import PracticeMode from './PracticeMode.svelte';
  import { tStore } from '../i18n/store.js';
  
  let activeSection = 'concepts'; // 'concepts', 'alice-bob', 'factorize', 'practice'
  
  // Reactive concepts that update when language changes
  $: concepts = [
    {
      id: 'rsa',
      title: $tStore('concepts.rsa.title'),
      description: $tStore('concepts.rsa.description'),
      icon: $tStore('concepts.rsa.icon'),
      available: true
    },
    {
      id: 'sha256',
      title: $tStore('concepts.sha256.title'),
      description: $tStore('concepts.sha256.description'),
      icon: $tStore('concepts.sha256.icon'),
      available: false
    },
    {
      id: 'ripemd',
      title: $tStore('concepts.ripemd.title'),
      description: $tStore('concepts.ripemd.description'),
      icon: $tStore('concepts.ripemd.icon'),
      available: false
    },
    {
      id: 'nonce',
      title: $tStore('concepts.nonce.title'),
      description: $tStore('concepts.nonce.description'),
      icon: $tStore('concepts.nonce.icon'),
      available: false
    }
  ];
  
  function handleConceptClick(concept) {
    if (concept.available) {
      // Navigate to concept using hash routing
      window.location.hash = `#/${concept.id}`;
    } else {
      alert($tStore('common.coming_soon'));
    }
  }
</script>

<div class="main-menu">
  <div class="hero">
    <h1 class="hero-title">{$tStore('app.name')}</h1>
    <p class="hero-description">{$tStore('app.description')}</p>
  </div>
  
  <div class="practice-tabs">
    <button 
      class="practice-tab" 
      class:active={activeSection === 'concepts'}
      on:click={() => activeSection = 'concepts'}
    >
      Концепции
    </button>
    <button 
      class="practice-tab"
      class:active={activeSection === 'alice-bob'}
      on:click={() => activeSection = 'alice-bob'}
    >
      Алиса и Боб
    </button>
    <button 
      class="practice-tab"
      class:active={activeSection === 'factorize'}
      on:click={() => activeSection = 'factorize'}
    >
      Взлом
    </button>
    <button 
      class="practice-tab"
      class:active={activeSection === 'practice'}
      on:click={() => activeSection = 'practice'}
    >
      Практика
    </button>
  </div>
  
  {#if activeSection === 'concepts'}
    <div class="concepts-section">
      <div class="concepts-grid">
        {#each concepts as concept}
          <ConceptCard 
            concept={concept} 
            onClick={() => handleConceptClick(concept)}
            available={concept.available}
          />
        {/each}
      </div>
      
      <div class="info-section">
        <p class="info-text">
          {$tStore('common.select_concept')}
        </p>
      </div>
    </div>
  {:else if activeSection === 'alice-bob'}
    <div class="practice-section">
      <AliceAndBob />
    </div>
  {:else if activeSection === 'factorize'}
    <div class="practice-section">
      <FactorizationVisualization n={391} p={17} q={23} />
    </div>
  {:else if activeSection === 'practice'}
    <div class="practice-section">
      <PracticeMode />
    </div>
  {/if}
</div>

<style>
  .main-menu {
    max-width: 1200px;
    margin: 0 auto;
    padding: 3rem 2rem;
    position: relative;
  }
  
  .hero {
    text-align: center;
    margin-bottom: 3rem;
    padding: 2rem;
    background: var(--bg-card);
    background-image: var(--div-image-url, url('/div.jpg'));
    background-size: cover;
    background-position: center;
    background-blend-mode: overlay;
    border-radius: 16px;
    backdrop-filter: blur(20px);
    border: 1px solid var(--border-dark);
    box-shadow: var(--shadow-lg);
    position: relative;
    overflow: hidden;
  }
  
  .hero::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--bg-card);
    opacity: 0.75;
    z-index: 0;
  }
  
  .hero > * {
    position: relative;
    z-index: 1;
  }
  
  .hero::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(96, 165, 250, 0.1) 0%, transparent 70%);
    animation: rotate 20s linear infinite;
    pointer-events: none;
  }
  
  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  
  .hero-title {
    font-size: 3rem;
    font-weight: 700;
    color: var(--text-formula);
    margin: 0 0 1rem 0;
    font-family: var(--font-heading);
    text-shadow: 0 0 30px rgba(96, 165, 250, 0.5);
    position: relative;
    z-index: 1;
    letter-spacing: -0.03em;
    text-transform: uppercase;
    font-size: clamp(2rem, 5vw, 3.5rem);
  }
  
  .hero-description {
    font-size: 1.25rem;
    color: var(--text-secondary);
    margin: 0;
    font-family: var(--font-sans);
    position: relative;
    z-index: 1;
  }
  
  .practice-tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 2rem;
    border-bottom: 2px solid var(--border-dark);
    flex-wrap: wrap;
    background: var(--bg-card);
    padding: 1rem;
    border-radius: 12px;
    backdrop-filter: blur(20px);
  }
  
  .practice-tab {
    padding: 0.75rem 1.5rem;
    background: transparent;
    border: none;
    border-bottom: 3px solid transparent;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.3s ease;
    font-family: var(--font-sans);
    font-weight: 500;
    font-size: 1rem;
    position: relative;
  }
  
  .practice-tab::before {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--accent-blue);
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }
  
  .practice-tab:hover {
    color: var(--text-primary);
    background: rgba(255, 255, 255, 0.05);
  }
  
  .practice-tab.active {
    color: var(--accent-blue);
  }
  
  .practice-tab.active::before {
    transform: scaleX(1);
  }
  
  .concepts-section {
    animation: fadeIn 0.4s ease;
  }
  
  .practice-section {
    animation: fadeIn 0.4s ease;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .concepts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-bottom: 3rem;
  }
  
  .info-section {
    text-align: center;
    padding: 2rem;
    background: var(--bg-card);
    backdrop-filter: blur(20px);
    border-radius: 12px;
    border: 1px dashed var(--border-medium);
    box-shadow: var(--shadow-md);
  }
  
  .info-text {
    color: var(--text-secondary);
    margin: 0;
    font-size: 1rem;
    font-family: var(--font-sans);
  }
  
  @media (max-width: 768px) {
    .main-menu {
      padding: 2rem 1rem;
    }
    
    .hero {
      padding: 1.5rem;
    }
    
    .hero-title {
      font-size: 2rem;
    }
    
    .hero-description {
      font-size: 1rem;
    }
    
    .concepts-grid {
      grid-template-columns: 1fr;
    }
    
    .practice-tabs {
      padding: 0.5rem;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }
    
    .practice-tab {
      padding: 0.5rem 1rem;
      font-size: 0.9rem;
      white-space: nowrap;
    }
  }
  
  @media (max-width: 480px) {
    .main-menu {
      padding: 1rem 0.5rem;
    }
    
    .hero {
      padding: 1rem;
    }
    
    .hero-title {
      font-size: 1.5rem;
    }
    
    .hero-description {
      font-size: 0.9rem;
    }
  }
</style>
