<script>
  import { onMount, onDestroy } from 'svelte';
  import ZKLayout from './ZKLayout.svelte';
  import { zkFloors } from '../../content/zkFloors';

  const floor = zkFloors.find((f) => f.id === 'floor-08');
  const idx = zkFloors.indexOf(floor);
  const prevHref = idx > 0 ? `#/` + zkFloors[idx - 1].route : '#/zk';
  const nextHref = '';
  const accent = floor.accent === 'secondary' ? 'var(--accent-cyan)' : 'var(--accent-blue)';

  let canvasEl;
  let ctx;
  let stars = [];
  let frame;

  function initStars() {
    const count = 120;
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * canvasEl.width,
      y: Math.random() * canvasEl.height,
      z: Math.random() * 0.8 + 0.2,
    }));
  }

  function draw() {
    if (!ctx) return;
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);
    stars.forEach((s) => {
      s.y += s.z * 0.6;
      if (s.y > canvasEl.height) s.y = 0;
      ctx.fillStyle = `rgba(255,215,0,${s.z})`;
      ctx.fillRect(s.x, s.y, 2 + s.z * 2, 2 + s.z * 2);
    });
    frame = requestAnimationFrame(draw);
  }

  function claim() {
    alert('Ключ от Цитадели получен. Добро пожаловать в Ethereum.');
  }

  onMount(() => {
    const resize = () => {
      canvasEl.width = canvasEl.clientWidth * devicePixelRatio;
      canvasEl.height = canvasEl.clientHeight * devicePixelRatio;
      ctx = canvasEl.getContext('2d');
      ctx.scale(devicePixelRatio, devicePixelRatio);
      initStars();
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
  <div slot="visual" class="sky">
    <canvas bind:this={canvasEl} class="canvas"></canvas>
    <div class="badge">Attestation Ready</div>
  </div>

  <div slot="theory">
    <h1>{floor.title}</h1>
    <p>Пентхаус — финальный чек. Если весь пруф прошёл, получаем ключ от города.</p>
    <h2>Аттестация</h2>
    <ul>
      <li>Проверяем корень коммитментов.</li>
      <li>Проверяем FRI-наблюдения.</li>
      <li>Проверяем публичный вывод.</li>
    </ul>
    <p>Нажми кнопку, чтобы завершить путь и забрать ключ.</p>
    <button on:click={claim}>Получить ключ</button>
  </div>
</ZKLayout>

<style>
  .sky {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .canvas {
    width: 100%;
    height: 100%;
    border-radius: 12px;
    border: 1px solid var(--border-dark);
    box-shadow: inset 0 0 40px rgba(0, 0, 0, 0.6);
  }

  .badge {
    position: absolute;
    top: 16px;
    left: 16px;
    padding: 10px 14px;
    border-radius: 10px;
    background: rgba(255, 215, 0, 0.1);
    color: #ffd700;
    border: 1px solid rgba(255, 215, 0, 0.5);
    font-weight: 700;
    letter-spacing: 0.6px;
  }

  button {
    margin-top: 12px;
    background: var(--accent);
    color: #0a0a0a;
    padding: 12px 18px;
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
