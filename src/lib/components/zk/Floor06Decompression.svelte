<script>
  import { onMount, onDestroy } from 'svelte';
  import ZKLayout from './ZKLayout.svelte';
  import { zkFloors } from '../../content/zkFloors';

  const floor = zkFloors.find((f) => f.id === 'floor-06');
  const idx = zkFloors.indexOf(floor);
  const prevHref = idx > 0 ? `#/` + zkFloors[idx - 1].route : '#/zk';
  const nextHref = idx < zkFloors.length - 1 ? `#/` + zkFloors[idx + 1].route : '';
  const accent = floor.accent === 'secondary' ? 'var(--accent-cyan)' : 'var(--accent-blue)';

  let canvasEl;
  let ctx;
  let progress = 0;
  let frame;

  function draw() {
    if (!ctx) return;
    const w = canvasEl.width;
    const h = canvasEl.height;
    ctx.clearRect(0, 0, w, h);

    const packed = [
      { x: w * 0.2, y: h * 0.7, width: 80, height: 80, color: '#ef4444' },
      { x: w * 0.4, y: h * 0.7, width: 80, height: 80, color: '#22c55e' },
      { x: w * 0.6, y: h * 0.7, width: 80, height: 80, color: '#3b82f6' },
    ];

    const unpacked = [
      { x: w * 0.15, y: h * 0.25, width: 60, height: 60, color: '#ef4444' },
      { x: w * 0.35, y: h * 0.25, width: 60, height: 60, color: '#22c55e' },
      { x: w * 0.55, y: h * 0.25, width: 60, height: 60, color: '#3b82f6' },
      { x: w * 0.75, y: h * 0.25, width: 60, height: 60, color: '#f59e0b' },
    ];

    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.strokeRect(w * 0.12, h * 0.15, w * 0.76, h * 0.25);
    ctx.strokeRect(w * 0.12, h * 0.6, w * 0.76, h * 0.3);

    ctx.font = '16px Inter';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText('Декомпрессия', w * 0.14, h * 0.18);
    ctx.fillText('Упаковка', w * 0.14, h * 0.64);

    packed.forEach((b) => {
      ctx.fillStyle = b.color;
      ctx.fillRect(b.x, b.y, b.width, b.height);
    });

    unpacked.slice(0, Math.floor(progress * unpacked.length)).forEach((b, i) => {
      ctx.fillStyle = b.color;
      ctx.fillRect(b.x, b.y, b.width, b.height);
      ctx.fillStyle = '#0a0a0a';
      ctx.fillText(`f${i}`, b.x + 8, b.y + 24);
    });

    frame = requestAnimationFrame(draw);
  }

  function decompress() {
    progress = 0;
    const step = () => {
      progress = Math.min(1, progress + 0.1);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
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
  <div slot="visual" class="viz">
    <canvas bind:this={canvasEl} class="canvas"></canvas>
    <div class="controls">
      <button on:click={decompress}>Развернуть чемодан</button>
    </div>
  </div>

  <div slot="theory">
    <h1>{floor.title}</h1>
    <p>ZK пруф — чемодан: сжатый след, коммитменты и FRI. Валидация раскрывает всё по запросу.</p>
    <h2>Как мы сжимаем</h2>
    <ul>
      <li>Коммитим много значений в один корень.</li>
      <li>Сэмплим точки, вместо полного раскрытия.</li>
      <li>Раскрываем только нужные слои.</li>
    </ul>
    <p>Нажми «Развернуть» и смотри, как части данных выходят из чемодана.</p>
  </div>
</ZKLayout>

<style>
  .viz {
    width: 100%;
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .canvas {
    width: 100%;
    height: 420px;
    background: #0f0f12;
    border-radius: 12px;
    border: 1px solid var(--border-dark);
    box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.45);
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
</style>
