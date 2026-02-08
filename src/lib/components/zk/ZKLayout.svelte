<script>
  export let title = '';
  export let accent = 'var(--accent-blue)';
  export let backHref = '#/zk';
  export let prevHref = '';
  export let nextHref = '';
  export let breadcrumb = '';
</script>

<div class="zk-shell" style={`--accent:${accent}`}>
  <nav class="nav">
    <a class="nav-link" href={backHref}>🏠 Карта</a>
    {#if prevHref}
      <a class="nav-link" href={prevHref}>← Назад</a>
    {/if}
    <span class="nav-link active">{breadcrumb || title}</span>
    {#if nextHref}
      <a class="nav-link" href={nextHref}>Далее →</a>
    {/if}
  </nav>

  <div class="content">
    <div class="visual">
      <slot name="visual" />
    </div>
    <div class="theory">
      <slot name="theory" />
    </div>
  </div>
</div>

<style>
  .zk-shell {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--bg-dark);
    color: var(--text-primary);
  }

  .nav {
    width: 100%;
    height: 60px;
    background: rgba(18, 18, 18, 0.9);
    border-bottom: 1px solid var(--border-dark);
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    flex-shrink: 0;
    z-index: 5;
    backdrop-filter: blur(12px);
  }

  .nav-link {
    color: var(--text-tertiary);
    text-decoration: none;
    font-size: 0.95rem;
    letter-spacing: 1px;
    text-transform: uppercase;
    font-weight: 700;
    transition: color 0.2s ease;
  }

  .nav-link:hover {
    color: var(--accent);
  }

  .nav-link.active {
    color: var(--accent);
  }

  .content {
    display: flex;
    flex: 1;
    width: 100%;
    overflow: hidden;
  }

  .visual {
    flex: 1;
    background: radial-gradient(circle at 20% 20%, rgba(96, 165, 250, 0.08), transparent 35%),
      radial-gradient(circle at 80% 30%, rgba(34, 211, 238, 0.08), transparent 35%),
      linear-gradient(180deg, rgba(10, 10, 10, 0.9), rgba(10, 10, 10, 0.95));
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    border-right: 1px solid var(--border-dark);
    overflow: hidden;
  }

  .theory {
    width: 420px;
    min-width: 340px;
    background: rgba(12, 12, 12, 0.95);
    padding: 32px;
    overflow-y: auto;
    border-left: 1px solid var(--border-dark);
    box-shadow: -5px 0 25px rgba(0, 0, 0, 0.5);
  }

  h1 {
    margin-top: 0;
    text-transform: uppercase;
    letter-spacing: 2px;
    font-size: 1.5rem;
    border-bottom: 1px solid var(--border-medium);
    padding-bottom: 12px;
    color: var(--accent);
  }

  h2 {
    color: var(--text-primary);
    font-size: 1.1rem;
    margin-top: 24px;
  }

  p,
  li {
    line-height: 1.6;
    color: var(--text-secondary);
    font-size: 0.97rem;
  }

  ul {
    padding-left: 18px;
  }

  @media (max-width: 980px) {
    .content {
      flex-direction: column;
    }

    .theory {
      width: 100%;
      min-width: unset;
      border-left: none;
      border-top: 1px solid var(--border-dark);
    }

    .visual {
      min-height: 360px;
      border-right: none;
      border-bottom: 1px solid var(--border-dark);
    }
  }
</style>
