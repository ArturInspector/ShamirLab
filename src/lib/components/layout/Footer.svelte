<script>
  import { tStore } from '../../i18n/store.js';
  import { onMount } from 'svelte';
  
  let showButerinEgg = false;
  let buterinPosition = { x: 50, y: 50 };
  let scrollCount = 0;
  
  onMount(() => {
    const handleScroll = () => {
      scrollCount++;
      if (scrollCount === 13 || scrollCount === 42 || scrollCount === 69) {
        triggerButerinEgg();
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  });
  
  function triggerButerinEgg() {
    buterinPosition = {
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10
    };
    showButerinEgg = true;
    setTimeout(() => {
      showButerinEgg = false;
    }, 3000);
  }
  
  const currentYear = new Date().getFullYear();
</script>

<footer class="footer">
  <div class="footer-content">
    <div class="footer-section">
      <h3 class="footer-title">{$tStore('app.name')}</h3>
      <p class="footer-tagline">{$tStore('app.tagline')}</p>
    </div>
    
    <div class="footer-section">
      <a 
        href="https://github.com/ArturInspector" 
        target="_blank" 
        rel="noopener noreferrer"
        class="github-link"
        title="GitHub Profile"
      >
        <svg class="github-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
        <span class="github-text">{$tStore('footer.moreProjects')}</span>
      </a>
    </div>
    
    <div class="footer-section footer-copy">
      <p>&copy; {currentYear} {$tStore('app.name')}</p>
      <button 
        class="easter-egg-trigger" 
        on:click={triggerButerinEgg}
        aria-label="Easter Egg"
      >
        👁️
      </button>
    </div>
  </div>
  
  {#if showButerinEgg}
    <div 
      class="buterin-egg" 
      style="left: {buterinPosition.x}%; top: {buterinPosition.y}%;"
      role="alert"
    >
      <div class="buterin-eye">👁️</div>
      <div class="buterin-text">{$tStore('footer.buterinWatching')}</div>
    </div>
  {/if}
</footer>

<style>
  .footer {
    background: rgba(10, 10, 10, 0.95);
    backdrop-filter: blur(20px);
    border-top: 1px solid var(--border-dark);
    padding: 3rem 2rem 2rem;
    margin-top: 4rem;
    position: relative;
    overflow: hidden;
  }
  
  .footer::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      var(--accent-blue),
      var(--accent-cyan),
      var(--accent-blue),
      transparent
    );
    animation: shimmer 3s linear infinite;
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    align-items: center;
  }
  
  .footer-section {
    text-align: center;
  }
  
  .footer-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-formula);
    margin: 0 0 0.5rem 0;
    font-family: var(--font-heading);
    text-transform: uppercase;
    letter-spacing: -0.02em;
  }
  
  .footer-tagline {
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin: 0;
    font-style: italic;
  }
  
  .github-link {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1.5rem;
    background: var(--bg-card);
    border: 1px solid var(--border-dark);
    border-radius: 12px;
    color: var(--text-primary);
    text-decoration: none;
    transition: all 0.3s ease;
    font-weight: 500;
    position: relative;
    overflow: hidden;
  }
  
  .github-link::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: var(--accent-blue);
    opacity: 0.2;
    transform: translate(-50%, -50%);
    transition: width 0.6s ease, height 0.6s ease;
  }
  
  .github-link:hover::before {
    width: 300px;
    height: 300px;
  }
  
  .github-link:hover {
    border-color: var(--accent-blue);
    box-shadow: 0 4px 20px rgba(96, 165, 250, 0.3);
    transform: translateY(-2px);
  }
  
  .github-icon {
    width: 24px;
    height: 24px;
    transition: transform 0.3s ease;
    position: relative;
    z-index: 1;
  }
  
  .github-link:hover .github-icon {
    transform: rotate(360deg) scale(1.1);
  }
  
  .github-text {
    position: relative;
    z-index: 1;
  }
  
  .footer-copy {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
  }
  
  .footer-copy p {
    margin: 0;
    color: var(--text-tertiary);
    font-size: 0.9rem;
  }
  
  .easter-egg-trigger {
    background: transparent;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.5rem;
    transition: all 0.3s ease;
    filter: grayscale(100%) opacity(0.3);
  }
  
  .easter-egg-trigger:hover {
    filter: grayscale(0%) opacity(1);
    transform: scale(1.2);
  }
  
  .buterin-egg {
    position: fixed;
    z-index: 9999;
    pointer-events: none;
    animation: fadeInOut 3s ease-in-out;
  }
  
  @keyframes fadeInOut {
    0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
    10%, 90% { opacity: 1; transform: scale(1) rotate(5deg); }
    50% { transform: scale(1.1) rotate(-5deg); }
  }
  
  .buterin-eye {
    font-size: 4rem;
    animation: blink 2s infinite;
    text-align: center;
    filter: drop-shadow(0 0 20px rgba(96, 165, 250, 0.8));
  }
  
  @keyframes blink {
    0%, 48%, 52%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
  
  .buterin-text {
    background: rgba(10, 10, 10, 0.95);
    border: 2px solid var(--accent-cyan);
    border-radius: 8px;
    padding: 0.75rem 1rem;
    color: var(--accent-cyan);
    font-weight: 600;
    text-align: center;
    white-space: nowrap;
    margin-top: 0.5rem;
    box-shadow: 0 0 20px rgba(34, 211, 238, 0.5);
    animation: glitch 0.3s infinite;
  }
  
  @keyframes glitch {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-2px); }
    75% { transform: translateX(2px); }
  }
  
  @media (max-width: 768px) {
    .footer {
      padding: 2rem 1rem 1.5rem;
    }
    
    .footer-content {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
    
    .footer-title {
      font-size: 1.25rem;
    }
    
    .github-link {
      padding: 0.6rem 1.2rem;
      font-size: 0.9rem;
    }
    
    .github-icon {
      width: 20px;
      height: 20px;
    }
    
    .buterin-eye {
      font-size: 3rem;
    }
    
    .buterin-text {
      font-size: 0.85rem;
      padding: 0.5rem 0.75rem;
    }
  }
  
  @media (max-width: 480px) {
    .footer {
      padding: 1.5rem 0.75rem;
    }
    
    .footer-tagline {
      font-size: 0.8rem;
    }
    
    .buterin-eye {
      font-size: 2.5rem;
    }
  }
</style>
