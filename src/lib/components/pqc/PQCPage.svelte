<script>
  let expandedAlgo = null;
  let showThreatAnim = false;
  let qubitCount = 4000;

  const algorithms = [
    {
      id: 'kyber',
      stdName: 'ML-KEM',
      oldName: 'CRYSTALS-Kyber',
      fips: 'FIPS 203',
      type: 'KEM',
      basis: 'Module-LWE',
      emoji: '🔮',
      accent: '#60a5fa',
      badge: 'Стандарт',
      badgeColor: '#22d3ee',
      tagline: 'Сумасшедший лабиринт из решёток',
      funny:
        'Квантовый компьютер пытается найти выход из N-мерного лабиринта. Спойлер: не может. Даже обычный компьютер застревает на этом часами, а квантовый просто стоит и смотрит в пустоту.',
      analogy:
        'Представь решётку — бесконечную сетку точек в пространстве. Задача: найти самый короткий вектор в этой сетке. Звучит просто? Добавь 1024 измерения и "случайный шум". Получай ключ.',
      useCase: 'Обмен ключами (TLS, SSH, VPN)',
      stats: [
        { label: 'Публичный ключ', value: '1184 байт' },
        { label: 'Приватный ключ', value: '2400 байт' },
        { label: 'Шифртекст', value: '1088 байт' },
        { label: 'Безопасность', value: '128-bit (уровень 1)' },
      ],
      pro: 'Маленькие ключи. Быстро работает.',
      con: 'Ключи всё равно больше RSA (но кого волнует RSA, оно умерло).',
    },
    {
      id: 'dilithium',
      stdName: 'ML-DSA',
      oldName: 'CRYSTALS-Dilithium',
      fips: 'FIPS 204',
      type: 'Подпись',
      basis: 'Module-LWE',
      emoji: '✍️',
      accent: '#a78bfa',
      badge: 'Стандарт',
      badgeColor: '#22d3ee',
      tagline: 'Решётчатый нотариус',
      funny:
        'Дилитий — это как нотариус, который живёт в 1024-мерном офисе. Подпись поставит, проверит. Квантовому хакеру придётся объехать все 1024 измерения, чтобы подделать подпись. Удачи.',
      analogy:
        'Основан на той же математике что и Kyber. Подписываешь документ — добавляешь "решётчатый шум" который только ты умеешь убрать. Проверяешь подпись — убеждаешься что шум правильный.',
      useCase: 'Цифровые подписи (документы, сертификаты, блокчейн)',
      stats: [
        { label: 'Публичный ключ', value: '1312 байт' },
        { label: 'Приватный ключ', value: '2528 байт' },
        { label: 'Подпись', value: '2420 байт' },
        { label: 'Безопасность', value: '128-bit (уровень 2)' },
      ],
      pro: 'Практичный, хорошо изучен, рекомендован NIST как основной.',
      con: 'Подписи довольно жирные (~2.4 КБ). Спасибо, решётки.',
    },
    {
      id: 'falcon',
      stdName: 'FN-DSA',
      oldName: 'FALCON',
      fips: 'FIPS 206',
      type: 'Подпись',
      basis: 'NTRU решётки',
      emoji: '🦅',
      accent: '#34d399',
      badge: 'Стандарт',
      badgeColor: '#22d3ee',
      tagline: 'Быстрый Сокол из NTRU-лабиринта',
      funny:
        'FALCON — это Дилитий, который решил сесть на диету. Подписи вдвое меньше. Но реализовать его корректно — это как собрать IKEA-шкаф без инструкции на Raspberry Pi во время землетрясения. Один неверный байт — и GG.',
      analogy:
        'NTRU-решётки — особый вид решёток, придуманный ещё в 90-х. FALCON использует NTRU + Fast Fourier Lattice-based Compact Signatures over NTRU (FALCONN). Название придумывали 40 минут.',
      useCase: 'Подписи где критичен размер (IoT, блокчейн, встраиваемые системы)',
      stats: [
        { label: 'Публичный ключ', value: '897 байт' },
        { label: 'Приватный ключ', value: '1281 байт' },
        { label: 'Подпись', value: '666 байт' },
        { label: 'Безопасность', value: '128-bit' },
      ],
      pro: 'Компактные подписи. Быстрая верификация.',
      con: 'Сложен в реализации — нужна точная арифметика с плавающей точкой. Тайминг-атаки ждут тебя за углом.',
    },
    {
      id: 'sphincs',
      stdName: 'SLH-DSA',
      oldName: 'SPHINCS+',
      fips: 'FIPS 205',
      type: 'Подпись',
      basis: 'Хэш-функции',
      emoji: '🌲',
      accent: '#f59e0b',
      badge: 'Стандарт',
      badgeColor: '#22d3ee',
      tagline: 'Консервативный дедушка криптографии',
      funny:
        'SPHINCS+ говорит: "Я не доверяю вашим решёткам, ваш LWE, вашему NTRU. У меня есть SHA-256. SHA-256 мне не изменит. SHA-256 — это хорошо." И он прав. Хэши квантовый компьютер ломает лишь вдвое быстрее — просто удвой длину хэша и живи спокойно.',
      analogy:
        'Огромное дерево из хэшей (Merkle + XMSS + FORS). Каждая подпись — путь по этому дереву. Подделать подпись = найти прообраз хэша. Квантовому компьютеру это даст примерно 2x ускорение. Мы просто берём в два раза длиннее хэш. Конец.',
      useCase: 'Когда не доверяешь математике решёток. Долгосрочные подписи (PKI, прошивки, CA).',
      stats: [
        { label: 'Публичный ключ', value: '32 байт' },
        { label: 'Приватный ключ', value: '64 байт' },
        { label: 'Подпись', value: '7856–49856 байт' },
        { label: 'Безопасность', value: '128–256-bit' },
      ],
      pro: 'Минимальные предположения безопасности (только хэши). Простота доказательства.',
      con: 'Подписи ОГРОМНЫЕ (до 50 КБ). Медленная генерация подписи. Зато надёжен как дедушкин сейф.',
    },
  ];

  const threats = [
    { year: '1994', event: "Алгоритм Шора изобретён. Факторизует RSA за O((log N)³) на квантовом компе.", level: 'theory' },
    { year: '2016', event: 'NIST запускает конкурс PQC. "Мужики, нам нужны новые алгоритмы."', level: 'action' },
    { year: '2019', event: 'Google достиг "квантового превосходства" на 53 кубитах (только для одной задачи).', level: 'milestone' },
    { year: '2022', event: 'SIKE — красивый алгоритм на изогениях — сломан за 62 минуты на обычном ноуте. F.', level: 'rip' },
    { year: '2024', event: 'NIST публикует FIPS 203/204/205/206. PQC официально стандартизировано.', level: 'win' },
    { year: '203X', event: '"Криптографически релевантный квантовый компьютер" (CRQC). RSA мертва. Надеемся что к этому моменту уже перешли на PQC.', level: 'doom' },
  ];

  const levelColors = {
    theory: '#60a5fa',
    action: '#a78bfa',
    milestone: '#34d399',
    rip: '#ef4444',
    win: '#22d3ee',
    doom: '#f59e0b',
  };

  function toggleAlgo(id) {
    expandedAlgo = expandedAlgo === id ? null : id;
  }
</script>

<div class="pqc-page">
  <!-- Hero -->
  <div class="hero">
    <div class="hero-glow glow-1"></div>
    <div class="hero-glow glow-2"></div>
    <div class="hero-inner">
      <p class="eyebrow">POST-QUANTUM CRYPTOGRAPHY</p>
      <h1>Бункер Шора</h1>
      <p class="subtitle">
        Квантовые компьютеры придут и сломают RSA. Мы готовимся.<br />
        Всё что тебе нужно знать о пост-квантовой криптографии — с юмором и без воды.
      </p>
      <div class="hero-tags">
        <span class="htag">NIST 2024</span>
        <span class="htag">Lattice</span>
        <span class="htag">Hash-based</span>
        <span class="htag">4 стандарта</span>
      </div>
    </div>
  </div>

  <!-- Why section -->
  <section class="section">
    <h2 class="section-title">Почему RSA умрёт?</h2>
    <div class="threat-grid">
      <div class="threat-card red">
        <div class="threat-icon">⚡</div>
        <h3>Алгоритм Шора</h3>
        <p>
          В 1994 году Питер Шор написал алгоритм, который факторизует числа за полиномиальное время
          на квантовом компьютере. RSA-2048? Задача на пару часов. Всё что защищено факторизацией
          или дискретным логарифмом — <strong>умирает</strong>.
        </p>
        <div class="threat-detail">
          Ломает: RSA, DSA, DH, ECC, ECDSA — т.е. примерно 95% современной криптографии с открытым ключом
        </div>
      </div>
      <div class="threat-card yellow">
        <div class="threat-icon">🔍</div>
        <h3>Алгоритм Гровера</h3>
        <p>
          Квадратичное ускорение перебора. AES-128 становится эффективно AES-64. Решение:
          просто удвоить длину симметричных ключей. <strong>Не страшно</strong> — AES-256 и SHA-256 выживут.
        </p>
        <div class="threat-detail">
          Ломает: симметрику только частично. AES-256 достаточно. Спим спокойно.
        </div>
      </div>
      <div class="threat-card orange">
        <div class="threat-icon">🕵️</div>
        <h3>"Harvest Now, Decrypt Later"</h3>
        <p>
          Это уже происходит. Спецслужбы собирают зашифрованный трафик <em>сегодня</em>, чтобы
          расшифровать его когда появятся нужные квантовые компьютеры. Если данные должны быть
          тайными 10+ лет — <strong>проблема уже сейчас</strong>.
        </p>
        <div class="threat-detail">
          Особо уязвимы: государственные секреты, медицинские данные, долгосрочные договора
        </div>
      </div>
    </div>
  </section>

  <!-- Algorithms -->
  <section class="section">
    <h2 class="section-title">4 выживших алгоритма</h2>
    <p class="section-subtitle">
      NIST провёл 8-летний конкурс. Из десятков кандидатов выжили четверо.
      Один красавец (SIKE) сломали за 62 минуты до финала. Вечная память.
    </p>

    <div class="algo-list">
      {#each algorithms as algo}
        <div class="algo-card" class:expanded={expandedAlgo === algo.id} style={`--accent:${algo.accent}`}>
          <button class="algo-header" on:click={() => toggleAlgo(algo.id)}>
            <div class="algo-left">
              <span class="algo-emoji">{algo.emoji}</span>
              <div class="algo-names">
                <span class="algo-std">{algo.stdName}</span>
                <span class="algo-old">{algo.oldName} · {algo.fips}</span>
              </div>
            </div>
            <div class="algo-right">
              <span class="algo-type">{algo.type}</span>
              <span class="algo-basis-label">{algo.basis}</span>
              <span class="algo-badge" style={`color:${algo.badgeColor}`}>{algo.badge}</span>
              <span class="algo-chevron" class:rotated={expandedAlgo === algo.id}>▼</span>
            </div>
          </button>

          {#if expandedAlgo === algo.id}
            <div class="algo-body">
              <div class="algo-tagline">{algo.tagline}</div>

              <div class="algo-two-col">
                <div class="algo-text-col">
                  <div class="algo-block">
                    <h4>Как это работает (без боли)</h4>
                    <p>{algo.analogy}</p>
                  </div>
                  <div class="algo-block funny-block">
                    <h4>Если честно...</h4>
                    <p>{algo.funny}</p>
                  </div>
                  <div class="algo-block">
                    <h4>Применяется для</h4>
                    <p class="use-case">{algo.useCase}</p>
                  </div>
                  <div class="pro-con">
                    <div class="pro">✓ {algo.pro}</div>
                    <div class="con">✗ {algo.con}</div>
                  </div>
                </div>

                <div class="algo-stats-col">
                  <h4>Размеры (level 1, 128-bit security)</h4>
                  <div class="stats-list">
                    {#each algo.stats as stat}
                      <div class="stat-row">
                        <span class="stat-label">{stat.label}</span>
                        <span class="stat-value">{stat.value}</span>
                      </div>
                    {/each}
                  </div>
                </div>
              </div>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </section>

  <!-- RIP SIKE -->
  <section class="section">
    <div class="rip-card">
      <div class="rip-icon">💀</div>
      <div class="rip-text">
        <h3>Минута молчания: SIKE (SIDH)</h3>
        <p>
          SIKE — алгоритм на суперсингулярных изогениях эллиптических кривых — был красив,
          компактен и почти прошёл в финал NIST. В июле 2022 года его сломали за
          <strong>62 минуты</strong> на одноядерном ноутбуке. Обычном ноутбуке. Без GPU.
          Без квантового компьютера. Просто математика.
        </p>
        <p>
          Урок: "никто не нашёл атаку" ≠ "атаки не существует". Сопротивляться 8 годам академической
          атаки и пасть от однострочной теоремы — это по-своему элегантно.
        </p>
      </div>
    </div>
  </section>

  <!-- Comparison table -->
  <section class="section">
    <h2 class="section-title">Чёрная метка сравнения</h2>
    <div class="table-wrap">
      <table class="compare-table">
        <thead>
          <tr>
            <th>Алгоритм</th>
            <th>Тип</th>
            <th>Основа</th>
            <th>Паблик ключ</th>
            <th>Подпись/КЕМ</th>
            <th>Скорость</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="t-name">ML-KEM</span> <span class="t-old">(Kyber)</span></td>
            <td><span class="tag-kem">KEM</span></td>
            <td>Module-LWE</td>
            <td class="num">1 184 Б</td>
            <td class="num">1 088 Б</td>
            <td class="speed fast">Быстро</td>
          </tr>
          <tr>
            <td><span class="t-name">ML-DSA</span> <span class="t-old">(Dilithium)</span></td>
            <td><span class="tag-sig">Подпись</span></td>
            <td>Module-LWE</td>
            <td class="num">1 312 Б</td>
            <td class="num">2 420 Б</td>
            <td class="speed fast">Быстро</td>
          </tr>
          <tr>
            <td><span class="t-name">FN-DSA</span> <span class="t-old">(FALCON)</span></td>
            <td><span class="tag-sig">Подпись</span></td>
            <td>NTRU решётки</td>
            <td class="num">897 Б</td>
            <td class="num">666 Б</td>
            <td class="speed medium">Средне</td>
          </tr>
          <tr>
            <td><span class="t-name">SLH-DSA</span> <span class="t-old">(SPHINCS+)</span></td>
            <td><span class="tag-sig">Подпись</span></td>
            <td>Хэш-функции</td>
            <td class="num">32 Б</td>
            <td class="num">7 856–49 856 Б</td>
            <td class="speed slow">Медленно</td>
          </tr>
          <tr class="rip-row">
            <td><span class="t-name">SIKE</span> <span class="t-old">💀 RIP</span></td>
            <td><span class="tag-kem">KEM</span></td>
            <td>Изогении EC</td>
            <td class="num">330 Б</td>
            <td class="num">346 Б</td>
            <td class="speed" style="color:#ef4444">Взломан</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="table-note">* Данные для уровня безопасности 1 (128-bit эквивалент)</p>
  </section>

  <!-- Timeline -->
  <section class="section">
    <h2 class="section-title">Хроника апокалипсиса</h2>
    <div class="timeline">
      {#each threats as t}
        <div class="tl-item">
          <div class="tl-dot" style={`background:${levelColors[t.level]};box-shadow:0 0 10px ${levelColors[t.level]}`}></div>
          <div class="tl-year" style={`color:${levelColors[t.level]}`}>{t.year}</div>
          <div class="tl-text">{t.event}</div>
        </div>
      {/each}
    </div>
  </section>

  <!-- LWE Explainer -->
  <section class="section">
    <h2 class="section-title">Learning With Errors — в двух словах</h2>
    <div class="lwe-box">
      <div class="lwe-col">
        <h4>Идея LWE</h4>
        <p>
          Возьми уравнение: <code>A · s + e = b</code>
        </p>
        <p>
          Где <code>A</code> — большая публичная матрица, <code>s</code> — твой секрет,
          <code>e</code> — маленький случайный "шум". Задача: восстановить <code>s</code>
          зная только <code>A</code> и <code>b</code>.
        </p>
        <p>
          Без шума — это просто решение системы уравнений (линейная алгебра, первый курс).
          С шумом — NP-hard, и квантовые компьютеры тут не помогают.
        </p>
        <p>
          Весь смысл Kyber и Dilithium — в этом шуме. Шум — твой друг. Шум — это безопасность.
        </p>
      </div>
      <div class="lwe-vis">
        <div class="lwe-equation">
          <span class="lwe-matrix">A</span>
          <span class="lwe-op">·</span>
          <span class="lwe-secret">s</span>
          <span class="lwe-op">+</span>
          <span class="lwe-noise">e</span>
          <span class="lwe-op">=</span>
          <span class="lwe-pub">b</span>
        </div>
        <div class="lwe-labels">
          <span class="lwe-lbl">публ.<br/>матрица</span>
          <span class="lwe-lbl"></span>
          <span class="lwe-lbl lbl-secret">секрет</span>
          <span class="lwe-lbl"></span>
          <span class="lwe-lbl lbl-noise">шум</span>
          <span class="lwe-lbl"></span>
          <span class="lwe-lbl">публ.<br/>вектор</span>
        </div>
        <div class="lwe-note">Восстановить s зная A и b = ☠️</div>
      </div>
    </div>
  </section>

  <!-- Bottom CTA -->
  <section class="section bottom-nav">
    <a href="#/" class="back-btn">← На главную</a>
    <a href="#/zk" class="next-btn">Крепость Бутеринка (ZK) →</a>
  </section>
</div>

<style>
  .pqc-page {
    max-width: 1100px;
    margin: 0 auto;
    padding: 2rem 1.5rem 5rem;
    color: var(--text-primary);
  }

  /* Hero */
  .hero {
    position: relative;
    text-align: center;
    padding: 4rem 2rem 3rem;
    border-radius: 20px;
    border: 1px solid var(--border-dark);
    background: rgba(10, 10, 10, 0.6);
    overflow: hidden;
    margin-bottom: 3rem;
  }

  .hero-glow {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.35;
    pointer-events: none;
  }

  .glow-1 {
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(245, 158, 11, 0.5), transparent 70%);
    top: -150px;
    left: -100px;
  }

  .glow-2 {
    width: 350px;
    height: 350px;
    background: radial-gradient(circle, rgba(96, 165, 250, 0.5), transparent 70%);
    bottom: -120px;
    right: -80px;
  }

  .hero-inner {
    position: relative;
    z-index: 1;
  }

  .eyebrow {
    letter-spacing: 6px;
    text-transform: uppercase;
    color: var(--text-tertiary);
    font-weight: 700;
    font-size: 0.8rem;
    margin: 0 0 1rem 0;
  }

  h1 {
    font-size: clamp(2.5rem, 5vw, 4rem);
    margin: 0 0 1rem 0;
    background: linear-gradient(135deg, #f59e0b, #60a5fa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -1px;
  }

  .subtitle {
    color: var(--text-secondary);
    font-size: 1.05rem;
    line-height: 1.7;
    max-width: 620px;
    margin: 0 auto 1.5rem;
  }

  .hero-tags {
    display: flex;
    gap: 10px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .htag {
    padding: 5px 14px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.07);
    border: 1px solid var(--border-dark);
    font-size: 0.85rem;
    color: var(--text-tertiary);
    letter-spacing: 0.5px;
  }

  /* Sections */
  .section {
    margin-bottom: 3.5rem;
  }

  .section-title {
    font-size: 1.6rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
    color: var(--text-primary);
    letter-spacing: -0.3px;
  }

  .section-subtitle {
    color: var(--text-secondary);
    line-height: 1.6;
    margin: 0 0 1.5rem 0;
    font-size: 0.97rem;
  }

  /* Threat cards */
  .threat-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
    margin-top: 1.2rem;
  }

  .threat-card {
    border-radius: 14px;
    padding: 20px;
    border: 1px solid transparent;
  }

  .threat-card.red {
    background: rgba(239, 68, 68, 0.07);
    border-color: rgba(239, 68, 68, 0.25);
  }

  .threat-card.yellow {
    background: rgba(245, 158, 11, 0.07);
    border-color: rgba(245, 158, 11, 0.25);
  }

  .threat-card.orange {
    background: rgba(249, 115, 22, 0.07);
    border-color: rgba(249, 115, 22, 0.25);
  }

  .threat-icon {
    font-size: 2rem;
    margin-bottom: 12px;
  }

  .threat-card h3 {
    margin: 0 0 10px 0;
    font-size: 1.1rem;
    color: var(--text-primary);
  }

  .threat-card p {
    color: var(--text-secondary);
    line-height: 1.6;
    font-size: 0.93rem;
    margin: 0 0 12px 0;
  }

  .threat-detail {
    font-size: 0.82rem;
    color: var(--text-tertiary);
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    padding-top: 10px;
    line-height: 1.5;
  }

  /* Algorithm cards */
  .algo-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .algo-card {
    border-radius: 14px;
    border: 1px solid var(--border-dark);
    background: rgba(255, 255, 255, 0.02);
    overflow: hidden;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .algo-card.expanded {
    border-color: var(--accent);
    box-shadow: 0 0 0 1px var(--accent), 0 8px 32px rgba(0, 0, 0, 0.4);
  }

  .algo-header {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 20px;
    background: transparent;
    border: none;
    color: var(--text-primary);
    cursor: pointer;
    text-align: left;
    gap: 12px;
    transition: background 0.15s ease;
  }

  .algo-header:hover {
    background: rgba(255, 255, 255, 0.03);
  }

  .algo-left {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .algo-emoji {
    font-size: 2rem;
    line-height: 1;
  }

  .algo-names {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .algo-std {
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--accent);
  }

  .algo-old {
    font-size: 0.82rem;
    color: var(--text-tertiary);
    letter-spacing: 0.3px;
  }

  .algo-right {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }

  .algo-type {
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 0.8rem;
    font-weight: 700;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid var(--border-dark);
    color: var(--text-secondary);
  }

  .algo-basis-label {
    font-size: 0.82rem;
    color: var(--text-tertiary);
    display: none;
  }

  @media (min-width: 640px) {
    .algo-basis-label {
      display: inline;
    }
  }

  .algo-badge {
    font-size: 0.82rem;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }

  .algo-chevron {
    font-size: 0.8rem;
    color: var(--text-tertiary);
    transition: transform 0.25s ease;
  }

  .algo-chevron.rotated {
    transform: rotate(180deg);
  }

  .algo-body {
    padding: 0 20px 24px;
    border-top: 1px solid var(--border-dark);
  }

  .algo-tagline {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--accent);
    margin: 16px 0 16px 0;
    letter-spacing: -0.2px;
  }

  .algo-two-col {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 24px;
  }

  @media (max-width: 780px) {
    .algo-two-col {
      grid-template-columns: 1fr;
    }
  }

  .algo-block {
    margin-bottom: 16px;
  }

  .algo-block h4 {
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--text-tertiary);
    font-weight: 700;
    margin: 0 0 8px 0;
  }

  .algo-block p {
    color: var(--text-secondary);
    line-height: 1.65;
    font-size: 0.93rem;
    margin: 0;
  }

  .funny-block {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid var(--border-dark);
    border-left: 3px solid var(--accent);
    border-radius: 8px;
    padding: 12px 14px;
  }

  .use-case {
    color: var(--accent) !important;
    font-weight: 600;
    font-size: 0.95rem !important;
  }

  .pro-con {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .pro {
    font-size: 0.9rem;
    color: #22d399;
    line-height: 1.5;
  }

  .con {
    font-size: 0.9rem;
    color: #f87171;
    line-height: 1.5;
  }

  .algo-stats-col h4 {
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--text-tertiary);
    font-weight: 700;
    margin: 0 0 12px 0;
  }

  .stats-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .stat-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
    border: 1px solid var(--border-dark);
    gap: 8px;
  }

  .stat-label {
    font-size: 0.85rem;
    color: var(--text-tertiary);
  }

  .stat-value {
    font-size: 0.85rem;
    color: var(--accent);
    font-weight: 700;
    font-family: var(--font-mono);
    text-align: right;
  }

  /* RIP SIKE */
  .rip-card {
    display: flex;
    gap: 20px;
    align-items: flex-start;
    background: rgba(239, 68, 68, 0.06);
    border: 1px solid rgba(239, 68, 68, 0.25);
    border-radius: 14px;
    padding: 24px;
  }

  .rip-icon {
    font-size: 3rem;
    flex-shrink: 0;
  }

  .rip-text h3 {
    margin: 0 0 10px 0;
    color: #f87171;
    font-size: 1.1rem;
  }

  .rip-text p {
    color: var(--text-secondary);
    line-height: 1.65;
    font-size: 0.93rem;
    margin: 0 0 8px 0;
  }

  /* Comparison table */
  .table-wrap {
    overflow-x: auto;
    border-radius: 12px;
    border: 1px solid var(--border-dark);
    margin-top: 1rem;
  }

  .compare-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
  }

  .compare-table th {
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.04);
    color: var(--text-tertiary);
    font-weight: 700;
    text-transform: uppercase;
    font-size: 0.78rem;
    letter-spacing: 1px;
    text-align: left;
    border-bottom: 1px solid var(--border-dark);
  }

  .compare-table td {
    padding: 12px 16px;
    color: var(--text-secondary);
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    vertical-align: middle;
  }

  .compare-table tr:last-child td {
    border-bottom: none;
  }

  .compare-table tr:hover td {
    background: rgba(255, 255, 255, 0.02);
  }

  .t-name {
    font-weight: 700;
    color: var(--text-primary);
    font-family: var(--font-mono);
  }

  .t-old {
    font-size: 0.8rem;
    color: var(--text-tertiary);
    margin-left: 6px;
  }

  .tag-kem {
    padding: 2px 8px;
    border-radius: 999px;
    background: rgba(96, 165, 250, 0.15);
    border: 1px solid rgba(96, 165, 250, 0.3);
    color: #60a5fa;
    font-size: 0.78rem;
    font-weight: 700;
  }

  .tag-sig {
    padding: 2px 8px;
    border-radius: 999px;
    background: rgba(167, 139, 250, 0.15);
    border: 1px solid rgba(167, 139, 250, 0.3);
    color: #a78bfa;
    font-size: 0.78rem;
    font-weight: 700;
  }

  .num {
    font-family: var(--font-mono);
    font-size: 0.85rem;
    color: var(--text-primary);
  }

  .speed.fast { color: #22d399; font-weight: 700; }
  .speed.medium { color: #f59e0b; font-weight: 700; }
  .speed.slow { color: #f87171; font-weight: 700; }

  .rip-row td {
    opacity: 0.5;
  }

  .table-note {
    font-size: 0.82rem;
    color: var(--text-tertiary);
    margin-top: 8px;
  }

  /* Timeline */
  .timeline {
    display: flex;
    flex-direction: column;
    gap: 0;
    margin-top: 1.5rem;
    position: relative;
    padding-left: 28px;
  }

  .timeline::before {
    content: '';
    position: absolute;
    left: 7px;
    top: 10px;
    bottom: 10px;
    width: 2px;
    background: var(--border-dark);
  }

  .tl-item {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 12px 0;
    position: relative;
  }

  .tl-dot {
    position: absolute;
    left: -24px;
    top: 17px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .tl-year {
    font-weight: 700;
    font-family: var(--font-mono);
    font-size: 0.9rem;
    min-width: 44px;
    flex-shrink: 0;
    padding-top: 2px;
  }

  .tl-text {
    color: var(--text-secondary);
    font-size: 0.93rem;
    line-height: 1.55;
  }

  /* LWE explainer */
  .lwe-box {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 32px;
    align-items: center;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid var(--border-dark);
    border-radius: 14px;
    padding: 24px;
    margin-top: 1rem;
  }

  @media (max-width: 680px) {
    .lwe-box {
      grid-template-columns: 1fr;
    }
  }

  .lwe-col h4 {
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--text-tertiary);
    font-weight: 700;
    margin: 0 0 12px 0;
  }

  .lwe-col p {
    color: var(--text-secondary);
    font-size: 0.93rem;
    line-height: 1.65;
    margin: 0 0 10px 0;
  }

  code {
    font-family: var(--font-mono);
    background: rgba(255, 255, 255, 0.08);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.9em;
    color: var(--text-primary);
  }

  .lwe-vis {
    text-align: center;
    flex-shrink: 0;
  }

  .lwe-equation {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 2rem;
    font-weight: 900;
    font-family: var(--font-mono);
    justify-content: center;
  }

  .lwe-matrix { color: #60a5fa; }
  .lwe-secret { color: #ef4444; }
  .lwe-noise  { color: #22d399; }
  .lwe-pub    { color: #a78bfa; }
  .lwe-op     { color: var(--text-tertiary); }

  .lwe-labels {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-top: 8px;
    font-size: 0.72rem;
    color: var(--text-tertiary);
    justify-content: center;
    line-height: 1.3;
  }

  .lwe-lbl {
    min-width: 36px;
    text-align: center;
  }

  .lbl-secret { color: #ef4444; }
  .lbl-noise  { color: #22d399; }

  .lwe-note {
    margin-top: 16px;
    font-size: 0.85rem;
    color: var(--text-tertiary);
    font-style: italic;
  }

  /* Bottom nav */
  .bottom-nav {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  .back-btn,
  .next-btn {
    padding: 12px 22px;
    border-radius: 10px;
    text-decoration: none;
    font-weight: 700;
    font-size: 0.95rem;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }

  .back-btn {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--border-dark);
    color: var(--text-secondary);
  }

  .next-btn {
    background: #60a5fa;
    color: #0a0a0a;
  }

  .back-btn:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-1px);
  }

  .next-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(96, 165, 250, 0.35);
  }
</style>
