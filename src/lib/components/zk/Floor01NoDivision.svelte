<script>
  import { onDestroy } from 'svelte';
  import ZKLayout from './ZKLayout.svelte';
  import { zkFloors } from '../../content/zkFloors';

  const floor = zkFloors.find((f) => f.id === 'floor-01');
  const idx = zkFloors.indexOf(floor);
  const prevHref = idx > 0 ? `#/` + zkFloors[idx - 1].route : '#/zk';
  const nextHref = idx < zkFloors.length - 1 ? `#/` + zkFloors[idx + 1].route : '';
  const accent = floor.accent === 'secondary' ? 'var(--accent-cyan)' : 'var(--accent-blue)';

  let affine = 0;
  let projective = 0;
  let status = 'Нажми Старт';
  let timer;

  function reset() {
    affine = 0;
    projective = 0;
    status = 'Нажми Старт';
  }

  function startRace() {
    reset();
    status = 'Соревнование идёт';
    clearInterval(timer);
    timer = setInterval(() => {
      affine = Math.min(100, affine + Math.random() * 3 + 0.5);
      projective = Math.min(100, projective + Math.random() * 5 + 1.5);
      if (projective >= 100 || affine >= 100) {
        status = projective > affine ? 'Проективные победили' : 'Афинные застряли';
        clearInterval(timer);
      }
    }, 60);
  }

  onDestroy(() => {
    clearInterval(timer);
  });
</script>

<ZKLayout
  title={floor.title}
  accent={accent}
  backHref="#/zk"
  prevHref={prevHref}
  nextHref={nextHref}
  breadcrumb={floor.number}
>
  <div slot="visual" class="race">
    <div class="track">
      <div class="label">Афинные координаты</div>
      <div class="bar">
        <div class="fill slow" style={`width:${affine}%`}></div>
      </div>
      <div class="marker" style={`left:${affine}%`}>λ</div>
    </div>
    <div class="track">
      <div class="label">Проективные координаты</div>
      <div class="bar">
        <div class="fill fast" style={`width:${projective}%`}></div>
      </div>
      <div class="marker" style={`left:${projective}%`}>Π</div>
    </div>
    <div class="cta">
      <div class="status" style={`color:${accent}`}>{status}</div>
      <button on:click={startRace}>Старт</button>
      <button class="ghost" on:click={reset}>Сброс</button>
    </div>
  </div>

  <div slot="theory">
    <h1>{floor.title}</h1>
    <p>Фундамент ZK строится на конечных полях. Делить здесь дорого, умножать дешево.</p>
    <h2>Зачем избегать деления</h2>
    <ul>
      <li>Афинные координаты требуют деления и тормозят прувер.</li>
      <li>Проективные заменяют деление дополнительной координатой.</li>
      <li>Скорость выше, когда делений нет.</li>
    </ul>
    <h2>Наблюдение</h2>
    <p>Запусти гонку и смотри, как проектive обгоняют affine за счёт отсутствия деления.</p>
  </div>
</ZKLayout>

<style>
  .race {
    width: min(860px, 100%);
    padding: 32px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .track {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--border-dark);
    border-radius: 14px;
    padding: 16px;
    position: relative;
  }

  .label {
    color: var(--text-secondary);
    margin-bottom: 10px;
    font-weight: 700;
    letter-spacing: 0.3px;
  }

  .bar {
    width: 100%;
    height: 18px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.07);
    overflow: hidden;
    position: relative;
  }

  .fill {
    height: 100%;
    transition: width 0.1s linear;
  }

  .fill.slow {
    background: linear-gradient(90deg, #ef4444, #f97316);
  }

  .fill.fast {
    background: linear-gradient(90deg, #22c55e, #16a34a);
  }

  .marker {
    position: absolute;
    top: 40px;
    transform: translateX(-50%);
    padding: 6px 10px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid var(--border-dark);
    color: var(--text-primary);
    font-weight: 700;
  }

  .cta {
    margin-top: 12px;
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .status {
    font-weight: 700;
  }

  button {
    background: {accent};
    color: #0a0a0a;
    padding: 12px 18px;
    border-radius: 10px;
    border: none;
    font-weight: 700;
    letter-spacing: 0.5px;
    transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
  }

  button:hover {
    transform: translateY(-1px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.25);
  }

  button.ghost {
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-primary);
    border: 1px solid var(--border-dark);
  }

  @media (max-width: 640px) {
    .race {
      padding: 20px 12px;
    }
  }
</style>
