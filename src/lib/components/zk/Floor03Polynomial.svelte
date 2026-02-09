<script>
  import { onMount, onDestroy } from 'svelte';
  import ZKLayout from './ZKLayout.svelte';
  import { zkFloors } from '../../content/zkFloors';

  const floor = zkFloors.find((f) => f.id === 'floor-03');
  const idx = zkFloors.indexOf(floor);
  const prevHref = idx > 0 ? `#/` + zkFloors[idx - 1].route : '#/zk';
  const nextHref = idx < zkFloors.length - 1 ? `#/` + zkFloors[idx + 1].route : '';
  const accent = floor.accent === 'secondary' ? 'var(--accent-cyan)' : 'var(--accent-blue)';

  let canvasEl;
  let ctx;
  let points = [
    { x: -3, y: 1 },
    { x: -1, y: -1 },
    { x: 1.5, y: 2.5 },
    { x: 3, y: -0.5 },
  ];
  let frame;

  function evaluate(x) {
    return points.reduce((sum, p, i) => {
      let l = 1;
      points.forEach((q, j) => {
        if (i !== j) {
          l *= (x - q.x) / (p.x - q.x);
        }
      });
      return sum + p.y * l;
    }, 0);
  }

  function draw() {
    if (!ctx) return;
    const w = canvasEl.width;
    const h = canvasEl.height;
    ctx.clearRect(0, 0, w, h);

    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.scale(1, -1);

    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-w / 2, 0);
    ctx.lineTo(w / 2, 0);
    ctx.moveTo(0, -h / 2);
    ctx.lineTo(0, h / 2);
    ctx.stroke();

    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const step = 2 / 200;
    for (let t = -4; t <= 4; t += step) {
      const y = evaluate(t);
      const px = (t / 4) * (w / 2);
      const py = (y / 4) * (h / 2);
      if (t === -4) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    points.forEach((p) => {
      const px = (p.x / 4) * (w / 2);
      const py = (p.y / 4) * (h / 2);
      ctx.beginPath();
      ctx.fillStyle = '#3b82f6';
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
    frame = requestAnimationFrame(draw);
  }

  function addPoint() {
    points = [...points, { x: Math.random() * 6 - 3, y: Math.random() * 4 - 2 }];
  }

  onMount(() => {
    const resize = () => {
      canvasEl.width = canvasEl.clientWidth * devicePixelRatio;
      canvasEl.height = canvasEl.clientHeight * devicePixelRatio;
      ctx = canvasEl.getContext('2d');
      ctx.scale(devicePixelRatio, devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  });

  onDestroy(() => {
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
  <div slot="visual" class="blueprint">
    <canvas bind:this={canvasEl} class="canvas"></canvas>
    <div class="controls">
      <button on:click={addPoint}>Добавить точку</button>
      <div class="hint">Полином проходит через все точки — это и есть крышa из интерполяции.</div>
    </div>
  </div>

  <div slot="theory">
    <h1>{floor.title}</h1>
    <p>Мы накрываем торчащие балки значений полиномом. Лагранж строит крышу, проходящую через все точки.</p>
    <h2>Лагранж</h2>
    <ul>
      <li>Каждая точка рождает базисный полином.</li>
      <li>Сумма взвешенных базисов даёт итоговый P(x).</li>
      <li>В полях это работает так же, только числа модульные.</li>
    </ul>
    <h2>Почему это важно</h2>
    <p>Интерполяция превращает дискретные вычисления в гладкий объект, который удобно проверять в ZK.</p>
  </div>
</ZKLayout>

<style>
  .blueprint {
    width: 100%;
    height: 100%;
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .canvas {
    width: 100%;
    height: 420px;
    background: #0d1a2b;
    border: 1px solid var(--border-dark);
    border-radius: 12px;
    box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.45);
  }

  .controls {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  button {
    align-self: flex-start;
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

  .hint {
    color: var(--text-secondary);
    font-size: 0.95rem;
  }
</style>
