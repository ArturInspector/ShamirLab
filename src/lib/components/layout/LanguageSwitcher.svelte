<script>
  import { locale, languages } from '../../i18n/store.js';
  
  let showMenu = false;
  
  function switchLanguage(code) {
    locale.set(code);
    showMenu = false;
  }
  
  function toggleMenu() {
    showMenu = !showMenu;
  }
</script>

<div class="language-switcher">
  <button 
    class="switcher-button"
    on:click={toggleMenu}
    aria-label="Switch language"
    aria-expanded={showMenu}
  >
    <span class="current-flag">
      {#each languages as lang}
        {#if lang.code === $locale}
          {lang.flag}
        {/if}
      {/each}
    </span>
    <span class="arrow" class:open={showMenu}>▼</span>
  </button>
  
  {#if showMenu}
    <div class="language-menu">
      {#each languages as lang}
        <button
          class="language-option"
          class:active={lang.code === $locale}
          on:click={() => switchLanguage(lang.code)}
        >
          <span class="flag">{lang.flag}</span>
          <span class="name">{lang.name}</span>
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .language-switcher {
    position: relative;
    display: inline-block;
  }
  
  .switcher-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: var(--bg-card);
    border: 1px solid var(--border-dark);
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.2s ease;
    font-family: inherit;
    color: var(--text-primary);
  }
  
  .switcher-button:hover {
    border-color: var(--accent-blue);
    background: var(--bg-hover);
  }
  
  .current-flag {
    font-size: 1.25rem;
  }
  
  .arrow {
    font-size: 0.75rem;
    transition: transform 0.2s ease;
    color: var(--text-secondary);
  }
  
  .arrow.open {
    transform: rotate(180deg);
  }
  
  .language-menu {
    position: absolute;
    top: calc(100% + 0.5rem);
    right: 0;
    background: var(--bg-card);
    backdrop-filter: blur(20px);
    border: 1px solid var(--border-dark);
    border-radius: 8px;
    box-shadow: var(--shadow-lg);
    min-width: 150px;
    z-index: 1000;
    overflow: hidden;
  }
  
  .language-option {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.75rem 1rem;
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 0.95rem;
    text-align: left;
    transition: background 0.2s ease;
    font-family: inherit;
    color: var(--text-primary);
  }
  
  .language-option:hover {
    background: var(--bg-hover);
  }
  
  .language-option.active {
    background: rgba(96, 165, 250, 0.2);
    color: var(--accent-blue);
    font-weight: 600;
  }
  
  .flag {
    font-size: 1.25rem;
  }
  
  .name {
    flex: 1;
  }
</style>

