<script>
  import ZKLayout from './ZKLayout.svelte';
  import { zkFloors } from '../../content/zkFloors';

  const floor = zkFloors.find((f) => f.id === 'floor-04');
  const idx = zkFloors.indexOf(floor);
  const prevHref = idx > 0 ? `#/` + zkFloors[idx - 1].route : '#/zk';
  const nextHref = idx < zkFloors.length - 1 ? `#/` + zkFloors[idx + 1].route : '';
  const accent = floor.accent === 'secondary' ? 'var(--accent-cyan)' : 'var(--accent-blue)';

  let trace = [
    { step: '1', text: 'a0 = 3' },
    { step: '2', text: 'a1 = 3 * 7 mod p' },
    { step: '3', text: 'a2 = a1 + 5 mod p' },
  ];
  let interpolated = '';

  function interpolate() {
    const values = trace.map((t, i) => ({ x: i, y: i * 2 + 1 }));
    interpolated = values
      .map((p, i) => {
        const coef = (p.y % 97 + 97) % 97;
        return `${coef}·L${i}(x)`;
      })
      .join(' + ');
  }

  function addStep() {
    const step = trace.length + 1;
    trace = [...trace, { step: String(step), text: `a${step} = f(a${step - 1})` }];
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
  <div slot="visual" class="trace">
    <div class="log">
      {#each trace as row}
        <div class="log-row">
          <span class="badge">{row.step}</span>
          <span>{row.text}</span>
        </div>
      {/each}
    </div>
    <div class="actions">
      <button on:click={addStep}>Добавить шаг</button>
      <button class="ghost" on:click={interpolate}>Интерполировать</button>
    </div>
    {#if interpolated}
      <div class="poly">
        P(x) = {interpolated}
      </div>
    {/if}
  </div>

  <div slot="theory">
    <h1>{floor.title}</h1>
    <p>Журнал прораба — это след вычисления. Его превращают в полином, чтобы проверить всё сразу.</p>
    <h2>Трасса</h2>
    <ul>
      <li>Каждая строка — состояние машины.</li>
      <li>Мы нумеруем строки и получаем пары (i, value).</li>
    </ul>
    <h2>Полином из трассы</h2>
    <p>Интерполируем пары в P(x). Проверка полинома заменяет проверку каждой строки.</p>
    <p>Добавь шаги и собери полином через Lagrange.</p>
  </div>
</ZKLayout>

<style>
  .trace {
    width: 100%;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .log {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid var(--border-dark);
    border-radius: 12px;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .log-row {
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 10px;
    padding: 10px 12px;
    border: 1px solid var(--border-dark);
    color: var(--text-primary);
  }

  .badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 6px;
    background: var(--accent);
    color: #0a0a0a;
    font-weight: 800;
    font-size: 0.9rem;
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

  .poly {
    background: rgba(34, 211, 238, 0.08);
    border: 1px solid var(--border-medium);
    border-radius: 10px;
    padding: 12px;
    color: var(--text-primary);
    font-family: var(--font-mono);
  }
</style>
