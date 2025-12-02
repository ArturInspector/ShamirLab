<script>
  import { onMount } from 'svelte';
  import Header from './lib/components/layout/Header.svelte';
  import MainMenu from './lib/components/MainMenu.svelte';
  import RSAVisualization from './lib/components/RSAVisualization.svelte';
  
  let currentRoute = 'home';
  
  function updateRoute() {
    const hash = window.location.hash.slice(1);
    if (hash.startsWith('/')) {
      currentRoute = hash.slice(1) || 'home';
    } else {
      currentRoute = hash || 'home';
    }
  }
  
  onMount(() => {
    // Set cache-busting version for div.jpg image
    const version = Date.now();
    document.documentElement.style.setProperty('--div-image-url', `url('/div.jpg?v=${version}')`);
    
    updateRoute();
    window.addEventListener('hashchange', updateRoute);
    return () => {
      window.removeEventListener('hashchange', updateRoute);
    };
  });
</script>

<Header />
<main 
  class:rsa-page={currentRoute === 'rsa'}
  class:sha256-page={currentRoute === 'sha256'}
  class:ripemd-page={currentRoute === 'ripemd'}
  class:nonce-page={currentRoute === 'nonce'}
>
  {#if currentRoute === 'home' || currentRoute === ''}
    <MainMenu />
  {:else if currentRoute === 'rsa'}
    <RSAVisualization />
  {:else}
    <div class="not-found">
      <h2>404 - Not Found</h2>
      <p>This concept is coming soon!</p>
      <a href="#/">← Back to Home</a>
    </div>
  {/if}
</main>

<style>
  main {
    width: 100%;
    min-height: calc(100vh - 100px);
    position: relative;
  }
  
  main::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url('/background1.jpg');
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
    z-index: 0;
    pointer-events: none;
    opacity: 0.4;
    transition: opacity 0.5s ease, background-image 0.5s ease;
  }
  
  main.rsa-page::before {
    background-image: url('/background3.jpg');
    opacity: 0.5;
  }
  
  main.sha256-page::before {
    background-image: url('/background2.jpg');
    opacity: 0.5;
  }
  
  main.ripemd-page::before {
    background-image: url('/background4.jpg');
    opacity: 0.5;
  }
  
  main.nonce-page::before {
    background-image: url('/background5.jpg');
    opacity: 0.5;
  }
  
  main::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      180deg,
      rgba(10, 10, 10, 0.7) 0%,
      rgba(18, 18, 18, 0.8) 50%,
      rgba(10, 10, 10, 0.7) 100%
    );
    z-index: 0;
    pointer-events: none;
  }
  
  main > :global(*) {
    position: relative;
    z-index: 1;
  }
  
  .not-found {
    max-width: 600px;
    margin: 4rem auto;
    padding: 2rem;
    text-align: center;
    background: var(--bg-card);
    backdrop-filter: blur(20px);
    border: 1px solid var(--border-dark);
    border-radius: 12px;
    box-shadow: var(--shadow-lg);
  }
  
  .not-found h2 {
    font-size: 2rem;
    color: var(--text-primary);
    margin-bottom: 1rem;
  }
  
  .not-found p {
    color: var(--text-secondary);
    margin-bottom: 2rem;
  }
  
  .not-found a {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    background: var(--accent-blue);
    color: var(--bg-deep);
    text-decoration: none;
    border-radius: 8px;
    font-weight: 600;
    transition: all 0.2s ease;
  }
  
  .not-found a:hover {
    background: var(--accent-cyan);
    transform: translateY(-1px);
  }
</style>
