<script>
  import { onMount, onDestroy } from 'svelte';
  import ZKLayout from './ZKLayout.svelte';
  import { zkFloors } from '../../content/zkFloors';

  const floor = zkFloors.find((f) => f.id === 'floor-02');
  const idx = zkFloors.indexOf(floor);
  const prevHref = idx > 0 ? `#/` + zkFloors[idx - 1].route : '#/zk';
  const nextHref = idx < zkFloors.length - 1 ? `#/` + zkFloors[idx + 1].route : '';
  const accent = floor.accent === 'secondary' ? 'var(--accent-cyan)' : 'var(--accent-blue)';

  let canvasEl;
  let ctx;
  let particles = [];
  let score = 100;
  let errors = 0;
  let running = true;
  let frame;

  function spawnParticle() {
    const faulty = Math.random() < 0.25;
    particles.push({
      x: Math.random() * canvasEl.width,
      y: Math.random() * canvasEl.height * 0.4,
      vx: (Math.random() - 0.5) * 2,
      vy: Math.random() * 1.5 + 0.5,
      r: faulty ? 12 : 10,
      faulty,
    });
  }

  function tick() {
    if (!ctx || !running) {
      frame = requestAnimationFrame(tick);
      return;
    }

    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

    if (particles.length < 32 && Math.random() < 0.6) {
      spawnParticle();
    }

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < p.r || p.x > canvasEl.width - p.r) p.vx *= -1;
      if (p.y > canvasEl.height - p.r) {
        p.y = canvasEl.height - p.r;
        p.vy *= -0.8;
      } else {
        p.vy += 0.05;
      }
    });

    particles = particles.filter((p) => p.y < canvasEl.height + p.r);

    particles.forEach((p) => {
      ctx.beginPath();
      ctx.fillStyle = p.faulty ? '#ef4444' : '#22c55e';
      ctx.shadowColor = p.faulty ? '#ef4444' : '#22c55e';
      ctx.shadowBlur = 12;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    frame = requestAnimationFrame(tick);
  }

  function handleClick(event) {
    const rect = canvasEl.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    let hit = false;
    particles = particles.filter((p) => {
      const dx = p.x - x;
      const dy = p.y - y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d <= p.r + 6 && p.faulty) {
        hit = true;
        return false;
      }
      return true;
    });
    if (hit) {
      score = Math.min(100, score + 2);
    } else {
      score = Math.max(0, score - 3);
      errors += 1;
    }
  }

  function reset() {
    particles = [];
    score = 100;
    errors = 0;
  }

  onMount(() => {
    const resize = () => {
      if (!canvasEl) return;
      canvasEl.width = canvasEl.clientWidth * devicePixelRatio;
      canvasEl.height = canvasEl.clientHeight * devicePixelRatio;
      if (ctx) {
        ctx.scale(devicePixelRatio, devicePixelRatio);
      }
    };
    ctx = canvasEl.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    running = true;
    frame = requestAnimationFrame(tick);
    return () => {
      running = false;
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  });

  onDestroy(() => {
    running = false;
    cancelAnimationFrame(frame);
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
  <div slot="visual" class="viz">
    <div class="hud">
      <div>Signal Integrity: <strong>{score}%</strong></div>
      <div>Short Circuits: <strong>{errors}</strong></div>
    </div>
    <canvas bind:this={canvasEl} class="canvas" on:click={handleClick}></canvas>
    <div class="legend">
      <span class="good"></span> корректные вычисления
      <span class="bad"></span> сбои, кликай чтобы убрать
    </div>
    <div class="controls">
      <button on:click={() => (running = !running)}>{running ? 'Пауза' : 'Старт'}</button>
      <button class="ghost" on:click={reset}>Сброс</button>
    </div>
  </div>

  <div slot="theory">
    <h1>{floor.title}</h1>
    <p>Схема — это жёсткая проводка без ветвлений. Входы двигаются по проводам, гейты проверяют правильность.</p>
    <h2>Witness как электроны</h2>
    <p>Зелёные частицы — честные значения. Красные — нарушения ограничений.</p>
    <h2>Constraint стены</h2>
    <ul>
      <li>Каждый провод знает своё значение.</li>
      <li>Каждый gate проверяет равенства и умножения.</li>
      <li>Пойманные сбои повышают целостность сигнала.</li>
    </ul>
    <p>Останавливай красные сбои кликом, чтобы сохранить целостность схемы.</p>
  </div>
</ZKLayout>

<style>
  .viz {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 18px;
  }

  .hud {
    position: absolute;
    top: 14px;
    left: 14px;
    background: rgba(0, 0, 0, 0.45);
    border: 1px solid var(--border-dark);
    padding: 10px 12px;
    color: #22c55e;
    font-family: var(--font-mono);
    font-size: 0.95rem;
    border-radius: 10px;
    z-index: 2;
  }

  .canvas {
    width: 100%;
    height: 420px;
    background: #001100;
    border-radius: 12px;
    border: 1px solid var(--border-dark);
    box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.6);
  }

  .legend {
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--text-secondary);
    font-size: 0.95rem;
  }

  .good,
  .bad {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    display: inline-block;
  }

  .good {
    background: #22c55e;
    box-shadow: 0 0 10px #22c55e;
  }

  .bad {
    background: #ef4444;
    box-shadow: 0 0 10px #ef4444;
  }

  .controls {
    display: flex;
    gap: 10px;
  }

  button {
    background: {accent};
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
</style>
