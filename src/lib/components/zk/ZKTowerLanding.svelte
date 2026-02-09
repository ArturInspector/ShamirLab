<script>
  import { zkFloors, zkLanding } from '../../content/zkFloors';

  const badgeMap = {
    ready: { label: 'Готово', tone: 'var(--accent-green)' },
    active: { label: 'Активно', tone: 'var(--accent-cyan)' },
    soon: { label: 'Скоро', tone: 'var(--accent-purple)' },
  };

  function cardAccent(floor) {
    return floor.accent === 'secondary' ? 'var(--accent-cyan)' : 'var(--accent-blue)';
  }
</script>

<div class="landing">
  <div class="hero">
    <p class="eyebrow">{zkLanding.id}</p>
    <h1>{zkLanding.title}</h1>
    <p class="subtitle">{zkLanding.subtitle}</p>
  </div>

  <div class="grid">
    {#each zkFloors as floor}
      <a class="card" href={`#/` + floor.route} style={`--accent:${cardAccent(floor)}`}>
        <div class="card-top">
          <span class="number">{floor.number}</span>
          <span class="status" style={`color:${badgeMap[floor.status].tone}`}>
            <span class="dot" style={`background:${badgeMap[floor.status].tone}`}></span>
            {badgeMap[floor.status].label}
          </span>
        </div>
        <h2>{floor.title}</h2>
        <p>{floor.description}</p>
        <div class="tags">
          {#each floor.tags as tag}
            <span class="tag">{tag}</span>
          {/each}
        </div>
      </a>
    {/each}
  </div>
</div>

<style>
  .landing {
    max-width: 1180px;
    margin: 0 auto;
    padding: 3rem 1.5rem 4rem;
    position: relative;
  }

  .landing::before,
  .landing::after {
    content: '';
    position: absolute;
    width: 320px;
    height: 320px;
    filter: blur(90px);
    opacity: 0.4;
    z-index: 0;
  }

  .landing::before {
    top: -80px;
    left: -120px;
    background: radial-gradient(circle, rgba(96, 165, 250, 0.6), transparent 60%);
  }

  .landing::after {
    bottom: -60px;
    right: -120px;
    background: radial-gradient(circle, rgba(34, 211, 238, 0.6), transparent 60%);
  }

  .hero {
    text-align: center;
    margin-bottom: 2.5rem;
    position: relative;
    z-index: 1;
  }

  .eyebrow {
    letter-spacing: 6px;
    text-transform: uppercase;
    color: var(--text-tertiary);
    font-weight: 700;
    font-size: 0.85rem;
    margin-bottom: 0.5rem;
  }

  h1 {
    font-size: clamp(2.2rem, 3vw, 3rem);
    margin: 0 0 0.75rem 0;
    color: var(--text-primary);
    letter-spacing: -0.5px;
  }

  .subtitle {
    color: var(--text-secondary);
    max-width: 680px;
    margin: 0 auto;
    line-height: 1.7;
    font-size: 1.05rem;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 22px;
    position: relative;
    z-index: 1;
  }

  .card {
    display: flex;
    flex-direction: column;
    background: var(--bg-card);
    border: 1px solid var(--border-dark);
    border-radius: 16px;
    padding: 20px;
    text-decoration: none;
    color: var(--text-primary);
    box-shadow: var(--shadow-lg);
    transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .card:hover {
    transform: translateY(-4px);
    border-color: var(--accent-blue);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
  }

  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .number {
    font-size: 0.9rem;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--accent-cyan);
    font-weight: 700;
  }

  h2 {
    margin: 4px 0 10px 0;
    font-size: 1.4rem;
    color: var(--text-primary);
    line-height: 1.3;
  }

  p {
    color: var(--text-secondary);
    line-height: 1.6;
    flex-grow: 1;
    margin: 0 0 14px 0;
  }

  .status {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.9rem;
    font-weight: 700;
    text-transform: uppercase;
  }

  .dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    box-shadow: 0 0 8px currentColor;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .tag {
    padding: 6px 10px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid var(--border-dark);
    color: var(--text-tertiary);
    font-size: 0.85rem;
    letter-spacing: 0.3px;
  }

  @media (max-width: 640px) {
    .landing {
      padding: 2.5rem 1rem 3rem;
    }

    .grid {
      grid-template-columns: 1fr;
    }
  }
</style>
