<script>
  import LanguageSwitcher from './LanguageSwitcher.svelte';
  import { tStore } from '../../i18n/store.js';
</script>

<header class="header">
  <div class="header-content">
    <h1 class="logo">{$tStore('app.name')}</h1>
    <LanguageSwitcher />
  </div>
</header>

<style>
  .header {
    background: rgba(10, 10, 10, 0.8);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border-dark);
    padding: 1rem 2rem;
    position: sticky;
    top: 0;
    z-index: 100;
  }
  
  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 2rem;
  }
  
  .logo {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-formula);
    margin: 0;
    font-family: var(--font-sans);
    letter-spacing: 0.05em;
  }
  
  @media (max-width: 768px) {
    .header {
      padding: 0.75rem 1rem;
    }
    
    .logo {
      font-size: 1.25rem;
    }
  }
</style>
