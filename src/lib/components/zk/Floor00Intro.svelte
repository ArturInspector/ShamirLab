<script>
  import ZKLayout from './ZKLayout.svelte';
  import { zkFloors } from '../../content/zkFloors';

  const floor = zkFloors.find((f) => f.id === 'floor-00');
  const idx = zkFloors.indexOf(floor);
  const nextHref = idx < zkFloors.length - 1 ? `#/` + zkFloors[idx + 1].route : '';
  const accent = 'var(--accent-blue)';

  let doorOpen = false;
  let selectedCard = null;

  const whyCards = [
    {
      icon: '',
      title: 'Приватность',
      desc: 'Докажи что знаешь пароль, не раскрывая сам пароль',
    },
    {
      icon: '⚡',
      title: 'Масштабирование',
      desc: 'Проверь миллион транзакций одним доказательством',
    },
    {
      icon: '✓',
      title: 'Верификация',
      desc: 'Убедись что вычисление правильное без повтора',
    },
  ];

  const terms = [
    { word: 'Prover', meaning: 'Тот кто доказывает. Знает секрет и создаёт proof.' },
    { word: 'Verifier', meaning: 'Тот кто проверяет. Смотрит proof и решает: верить или нет.' },
    { word: 'Witness', meaning: 'Секретная информация, которую знает только prover.' },
    { word: 'Proof', meaning: 'Доказательство. Маленький файл подтверждающий правду.' },
  ];

  function openDoor() {
    doorOpen = true;
    setTimeout(() => {
      window.location.hash = nextHref;
    }, 800);
  }
</script>

<ZKLayout
  title={floor.title}
  accent={accent}
  backHref="#/zk"
  prevHref=""
  nextHref={nextHref}
  breadcrumb={floor.number}
>
  <div slot="visual" class="lobby">
    <div class="door-container">
      <div class="door" class:open={doorOpen}>
        <div class="door-left"></div>
        <div class="door-right"></div>
        <div class="glow"></div>
      </div>
      <button class="enter-btn" on:click={openDoor} disabled={doorOpen}>
        {doorOpen ? 'Открываем...' : 'Войти в Крепость Бутеринка'}
      </button>
    </div>

    <div class="analogy-box">
      <h3>🔮 Аналогия из жизни</h3>
      <div class="scenario">
        <p class="setup">
          <strong>Ситуация:</strong> Тебе 18+, но ты не хочешь показывать паспорт с датой рождения.
        </p>
        <div class="comparison">
          <div class="method classic">
            <div class="label">Классический способ</div>
            <p>Показываешь паспорт → все видят дату, адрес, фото</p>
          </div>
          <div class="method zk">
            <div class="label">Zero-Knowledge способ</div>
            <p>Доказываешь что старше 18 → никто не видит дату рождения</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div slot="theory">
    <h1>Лобби Крепости</h1>
    <p>
      Zero-Knowledge Proof (ZK) — это способ доказать что ты знаешь что-то, не раскрывая само
      знание.
    </p>

    <h2>Зачем это нужно?</h2>
    <div class="why-grid">
      {#each whyCards as card}
        <button
          class="why-card"
          class:selected={selectedCard === card.title}
          on:click={() => (selectedCard = selectedCard === card.title ? null : card.title)}
        >
          <div class="icon">{card.icon}</div>
          <div class="card-title">{card.title}</div>
          {#if selectedCard === card.title}
            <div class="card-desc">{card.desc}</div>
          {/if}
        </button>
      {/each}
    </div>

    <h2>Терминология простыми словами</h2>
    <div class="terms">
      {#each terms as term}
        <div class="term-row">
          <span class="term-word">{term.word}</span>
          <span class="term-meaning">{term.meaning}</span>
        </div>
      {/each}
    </div>

    <h2>Что дальше?</h2>
    <p>
      Сейчас ты в лобби. Пройди через дверь и начни подъём по этажам крепости — от конечных полей
      до финальной аттестации.
    </p>

    <div class="roadmap">
      <div class="step">🧱 Этаж 1-2: Фундамент и схемы</div>
      <div class="step">📐 Этаж 3-4: Полиномы и трейсы</div>
      <div class="step">🌲 Этаж 5-6: Меркл и компрессия</div>
      <div class="step">🎯 Этаж 7-8: FRI и аттестация</div>
    </div>
  </div>
</ZKLayout>

<style>
  .lobby {
    width: 100%;
    height: 100%;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    align-items: center;
    justify-content: center;
  }

  .door-container {
    position: relative;
    width: 280px;
    height: 360px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  .door {
    position: relative;
    width: 100%;
    height: 300px;
    background: rgba(255, 255, 255, 0.02);
    border: 2px solid var(--border-dark);
    border-radius: 12px;
    overflow: hidden;
  }

  .door-left,
  .door-right {
    position: absolute;
    top: 0;
    width: 50%;
    height: 100%;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(34, 211, 238, 0.1));
    border: 1px solid var(--border-medium);
    transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .door-left {
    left: 0;
    border-right: 1px solid var(--border-dark);
  }

  .door-right {
    right: 0;
    border-left: 1px solid var(--border-dark);
  }

  .door.open .door-left {
    transform: translateX(-100%);
  }

  .door.open .door-right {
    transform: translateX(100%);
  }

  .glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 60px;
    height: 60px;
    background: radial-gradient(circle, rgba(96, 165, 250, 0.6), transparent 70%);
    border-radius: 50%;
    opacity: 0;
    transition: opacity 0.8s ease;
  }

  .door.open .glow {
    opacity: 1;
  }

  .enter-btn {
    padding: 14px 24px;
    background: var(--accent-blue);
    color: #0a0a0a;
    border: none;
    border-radius: 10px;
    font-weight: 700;
    letter-spacing: 0.5px;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }

  .enter-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(96, 165, 250, 0.3);
  }

  .enter-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .analogy-box {
    width: 100%;
    max-width: 520px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--border-dark);
    border-radius: 12px;
    padding: 20px;
  }

  .analogy-box h3 {
    margin: 0 0 16px 0;
    color: var(--text-primary);
    font-size: 1.1rem;
  }

  .scenario {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .setup {
    color: var(--text-secondary);
    line-height: 1.6;
    margin: 0;
  }

  .comparison {
    display: flex;
    gap: 12px;
  }

  .method {
    flex: 1;
    padding: 12px;
    border-radius: 10px;
    border: 1px solid var(--border-dark);
  }

  .method.classic {
    background: rgba(239, 68, 68, 0.08);
    border-color: rgba(239, 68, 68, 0.3);
  }

  .method.zk {
    background: rgba(34, 211, 153, 0.08);
    border-color: rgba(34, 211, 153, 0.3);
  }

  .label {
    font-weight: 700;
    margin-bottom: 8px;
    font-size: 0.9rem;
  }

  .method.classic .label {
    color: #ef4444;
  }

  .method.zk .label {
    color: #22d399;
  }

  .method p {
    margin: 0;
    font-size: 0.9rem;
    color: var(--text-secondary);
    line-height: 1.5;
  }

  .why-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 10px;
    margin: 16px 0 24px 0;
  }

  .why-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 14px 10px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--border-dark);
    border-radius: 10px;
    transition: all 0.2s ease;
    text-align: center;
  }

  .why-card:hover {
    border-color: var(--accent-blue);
    background: rgba(96, 165, 250, 0.05);
    transform: translateY(-2px);
  }

  .why-card.selected {
    border-color: var(--accent-blue);
    background: rgba(96, 165, 250, 0.1);
  }

  .icon {
    font-size: 2rem;
  }

  .card-title {
    font-weight: 700;
    color: var(--text-primary);
    font-size: 0.95rem;
  }

  .card-desc {
    font-size: 0.85rem;
    color: var(--text-secondary);
    line-height: 1.4;
    margin-top: 4px;
  }

  .terms {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin: 16px 0 24px 0;
  }

  .term-row {
    display: flex;
    gap: 12px;
    padding: 10px 12px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--border-dark);
    border-radius: 8px;
  }

  .term-word {
    font-weight: 700;
    color: var(--accent-cyan);
    min-width: 80px;
    font-family: var(--font-mono);
    font-size: 0.9rem;
  }

  .term-meaning {
    color: var(--text-secondary);
    line-height: 1.5;
    font-size: 0.9rem;
  }

  .roadmap {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 16px;
  }

  .step {
    padding: 10px 12px;
    background: rgba(255, 255, 255, 0.02);
    border-left: 3px solid var(--accent-blue);
    border-radius: 4px;
    color: var(--text-secondary);
    font-size: 0.95rem;
  }

  @media (max-width: 640px) {
    .lobby {
      padding: 12px;
    }

    .comparison {
      flex-direction: column;
    }

    .why-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
