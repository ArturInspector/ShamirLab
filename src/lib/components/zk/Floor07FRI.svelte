<script>
  import ZKLayout from './ZKLayout.svelte';
  import { zkFloors } from '../../content/zkFloors';

  const floor = zkFloors.find((f) => f.id === 'floor-07');
  const idx = zkFloors.indexOf(floor);
  const prevHref = idx > 0 ? `#/` + zkFloors[idx - 1].route : '#/zk';
  const nextHref = idx < zkFloors.length - 1 ? `#/` + zkFloors[idx + 1].route : '';
  const accent = floor.accent === 'secondary' ? 'var(--accent-cyan)' : 'var(--accent-blue)';

  let layers = [
    { name: 'Layer 0', size: 32 },
    { name: 'Layer 1', size: 16 },
    { name: 'Layer 2', size: 8 },
    { name: 'Layer 3', size: 4 },
  ];
  let samples = [];

  function fold() {
    layers = layers.map((l, i) => ({
      ...l,
      size: Math.max(2, Math.floor(l.size / 2)),
    }));
  }

  function randomSamples() {
    samples = layers.map((l) => ({
      name: l.name,
      position: Math.floor(Math.random() * l.size),
    }));
  }
</script>

<ZKLayout
  title={floor.title}
  accent={accent}
  backHref="#/zk"
  prevHref={prevHref}
  nextHref={nextHref}
  breadcrumb={floor.number}
>
  <div slot="visual" class="fri">
    <div class="layers">
      {#each layers as layer}
        <div class="layer">
          <div class="layer-header">
            <span>{layer.name}</span>
            <span class="pill">{layer.size} точек</span>
          </div>
          <div class="ticks">
            {#each Array(layer.size) as _, idx}
              <div class="tick"></div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
    <div class="actions">
      <button on:click={fold}>Сжать слои</button>
      <button class="ghost" on:click={randomSamples}>Случайные удары</button>
    </div>
    <div class="samples">
      {#if samples.length === 0}
        <p class="hint">Сэмплов нет — ударь случайно.</p>
      {:else}
        {#each samples as s}
          <div class="sample">
            <span>{s.name}</span>
            <strong>позиция {s.position}</strong>
          </div>
        {/each}
      {/if}
    </div>
  </div>

  <div slot="theory">
    <h1>{floor.title}</h1>
    <p>FRI сворачивает полином в несколько слоёв, пока не останется константа. Сэмплы проверяют прочность.</p>
    <h2>Процесс</h2>
    <ul>
      <li>Складываем слой, уменьшая степень.</li>
      <li>Сэмплируем точки случайно и проверяем соответствие.</li>
      <li>Продолжаем, пока не останется одна точка.</li>
    </ul>
    <p>Сжимай слои и бей случайными ударами, чтобы убедиться, что конструкция не ломается.</p>
  </div>
</ZKLayout>

<style>
  .fri {
    width: 100%;
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .layers {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .layer {
    border: 1px solid var(--border-dark);
    border-radius: 12px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.03);
  }

  .layer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .pill {
    padding: 6px 10px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid var(--border-dark);
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  .ticks {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(8px, 1fr));
    gap: 4px;
  }

  .tick {
    height: 8px;
    background: rgba(245, 158, 11, 0.6);
    border-radius: 4px;
    box-shadow: 0 0 10px rgba(245, 158, 11, 0.4);
  }

  .actions {
    display: flex;
    gap: 10px;
  }

  button {
    background: var(--accent);
    color: #0a0a0a;
    padding: 10px 16px;
    border-radius: 10px;
    border: none;
    font-weight: 700;
    letter-spacing: 0.4px;
    transition: transform 0.12s ease, box-shadow 0.12s ease;
  }

  button:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.25);
  }

  button.ghost {
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-primary);
    border: 1px solid var(--border-dark);
  }

  .samples {
    border: 1px solid var(--border-dark);
    border-radius: 12px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.02);
  }

  .sample {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    color: var(--text-secondary);
  }

  .hint {
    color: var(--text-tertiary);
  }
</style>
