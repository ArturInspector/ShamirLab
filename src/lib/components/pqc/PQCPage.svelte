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
      tagline: 'Module-LWE в роли ключевого обмена',
      funny:
        'Квантовый компьютер пытается решить задачу в 1024 измерениях. Ни один известный алгоритм — классический или квантовый — не справляется за разумное время. Это не маркетинг, это теорема.',
      analogy:
        'Решётка — бесконечная сетка точек в N-мерном пространстве. Kyber прячет секрет в "зашумлённом" векторе внутри этой сетки. Восстановить секрет без приватного ключа = найти нужную точку в пространстве из 2^1024 вариантов.',
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
      tagline: 'Тот же Module-LWE, другая задача',
      funny:
        'Та же математика что в Kyber, другое применение. Основной выбор NIST для подписей — не потому что самый быстрый, а потому что хорошо изучен за 8 лет конкурса.',
      analogy:
        'Подписываешь документ: добавляешь "решётчатый шум" который только ты умеешь убрать. Верификатор проверяет что шум правильный, не зная секрет. Подделать подпись = найти шум без приватного ключа.',
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
      tagline: 'NTRU + FFT = компактные подписи',
      funny:
        'Подписи вдвое меньше Dilithium — это факт. Реализовать корректно — другой разговор. Нужна точная арифметика с плавающей точкой, иначе тайминг-атаки уже ждут. Поэтому для IoT — да, для самостоятельной реализации — нет.',
      analogy:
        'NTRU-решётки придуманы в 1996. FALCON берёт их, добавляет Fast Fourier преобразование для эффективного семплирования, и получает подписи 666 байт против 2420 у Dilithium. За компактность платишь сложностью реализации.',
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
      tagline: 'Безопасность только на хэш-функциях',
      funny:
        'Единственный стандарт который не доверяет решёткам. Позиция: "SHA-256 не изменит". Если окажется что LWE сломан — SPHINCS+ единственный выживший. За это платишь подписями до 50 КБ.',
      analogy:
        'Дерево из хэшей (Merkle + XMSS + FORS). Каждая подпись — путь по дереву. Подделать = найти прообраз хэша. Алгоритм Гровера даёт квантовому компьютеру 2x ускорение на перебор — ответ: удвоить длину хэша. Математика простая, подписи большие.',
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
        RSA держится на задаче факторизации. Алгоритм Шора решает её за полиномиальное время.<br />
        Квантового компьютера нужного масштаба пока нет. Переходить на новые алгоритмы нужно уже сейчас.
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
    <h2 class="section-title">Три проблемы, разной срочности</h2>
    <div class="threat-grid">
      <div class="threat-card red">
        <div class="threat-label">БУДУЩЕЕ</div>
        <h3>Алгоритм Шора</h3>
        <p>
          Питер Шор в 1994 году показал: задача факторизации решается на квантовом компьютере
          за полиномиальное время. RSA, ECC, DSA, DH — всё что держится на факторизации или
          дискретном логарифме — уязвимо. Это примерно 95% асимметричной криптографии.
        </p>
        <div class="threat-detail">
          Нужен квантовый компьютер с ~4 млн логических кубитов. Сейчас — около 1000 физических.
        </div>
      </div>
      <div class="threat-card yellow">
        <div class="threat-label">ЧАСТИЧНО</div>
        <h3>Алгоритм Гровера</h3>
        <p>
          Квадратичное ускорение перебора. AES-128 становится эффективно AES-64.
          Решение тривиальное: удвоить длину ключа. AES-256 и SHA-256 выживают без изменений.
        </p>
        <div class="threat-detail">
          Симметричная криптография не требует замены — только увеличения длины ключей.
        </div>
      </div>
      <div class="threat-card orange">
        <div class="threat-label">УЖЕ СЕЙЧАС</div>
        <h3>Harvest Now, Decrypt Later</h3>
        <p>
          Зашифрованный трафик собирают сегодня — чтобы расшифровать потом, когда
          квантовый компьютер появится. Данные со сроком секретности 10+ лет
          <strong>уже скомпрометированы</strong>.
        </p>
        <div class="threat-detail">
          Государственные секреты, медицинские данные, долгосрочные контракты — всё это в архивах.
        </div>
      </div>
    </div>
  </section>

  <!-- Algorithms -->
  <section class="section">
    <h2 class="section-title">4 выживших алгоритма</h2>
    <p class="section-subtitle">
      NIST запустил конкурс в 2016, закрыл в 2024. Из 69 кандидатов стандартизировали четыре.
      SIKE дошёл до финала и сломался за 62 минуты на обычном ноутбуке — за три дня до объявления результатов.
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
        <h3>RIP: SIKE / SIDH</h3>
        <p>
          Алгоритм на суперсингулярных изогениях эллиптических кривых. Компактные ключи,
          красивая математика, 8 лет в NIST-конкурсе без взлома. В июле 2022 атака Castryck–Decru
          решила задачу за <strong>62 минуты</strong> на одноядерном ноутбуке. Без GPU, без квантового компьютера.
        </p>
        <p>
          "Никто не нашёл атаку" — не то же самое что "атаки не существует". SIKE прошёл через
          всю академическую экспертизу конкурса и сломался от теоремы на двух страницах.
          В этом и суть криптографического анализа.
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
    <h2 class="section-title">Learning With Errors — как это работает</h2>
    <div class="lwe-box">
      <div class="lwe-col">
        <h4>Задача LWE</h4>
        <p>
          Уравнение: <code>A · s + e = b</code>
        </p>
        <p>
          <code>A</code> — публичная матрица, <code>s</code> — секрет,
          <code>e</code> — маленький случайный шум. Задача: восстановить <code>s</code>
          зная только <code>A</code> и <code>b</code>.
        </p>
        <p>
          Без шума — задача тривиальная, первый курс линейной алгебры. С шумом —
          вычислительно сложная даже для квантового компьютера. Именно шум делает задачу трудной.
        </p>
        <p>
          Kyber и Dilithium строятся на этом. Приватный ключ — способ убрать шум.
          Без него — только перебор.
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

  <!-- Lattice Deep Dive -->
  <section class="section">
    <h2 class="section-title">Что такое решётка — без математики</h2>
    <div class="lattice-box">
      <div class="lattice-text">
        <p>
          Решётка — это бесконечная регулярная сетка точек в N-мерном пространстве.
          В двух измерениях это выглядит как клетчатая бумага в тетради. В 1024 измерениях
          человеческий мозг отказывается строить образ, и это хорошо — именно на этом строится безопасность.
        </p>
        <p>
          Ключевая задача: <strong>CVP (Closest Vector Problem)</strong> — дан произвольный вектор,
          найди ближайшую к нему точку решётки. В двух измерениях — очевидно. В 1024 —
          ни один известный алгоритм не справляется за разумное время.
        </p>
        <p>
          LWE превращает это в криптографию: секрет прячется как "почти" точка решётки,
          смещённая на маленький случайный шум. Без знания шума — задача CVP.
          Знаешь шум — находишь секрет за миллисекунды.
        </p>
        <div class="lattice-note">
          Почему квантовый компьютер не помогает: алгоритм Шора ускоряет факторизацию, но не CVP.
          Для решёточных задач квантовые алгоритмы дают в лучшем случае квадратичное ускорение — недостаточно.
        </div>
      </div>
      <div class="lattice-vis">
        <svg viewBox="0 0 160 140" class="lattice-svg" aria-hidden="true">
          <!-- Grid lines -->
          {#each [20,50,80,110,140] as x}
            <line x1={x} y1="10" x2={x} y2="130" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
          {/each}
          {#each [20,50,80,110,130] as y}
            <line x1="10" y1={y} x2="150" y2={y} stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
          {/each}
          <!-- Lattice points -->
          {#each [[20,20],[50,20],[80,20],[110,20],[140,20],[20,50],[50,50],[80,50],[110,50],[140,50],[20,80],[50,80],[80,80],[110,80],[140,80],[20,110],[50,110],[80,110],[110,110],[140,110],[20,130],[50,130],[80,130],[110,130],[140,130]] as [x,y]}
            <circle cx={x} cy={y} r="2.5" fill="#60a5fa" opacity="0.7"/>
          {/each}
          <!-- Secret vector (nearest lattice point) -->
          <circle cx="80" cy="80" r="4" fill="#60a5fa"/>
          <!-- Target (noisy) vector -->
          <circle cx="94" cy="68" r="4" fill="#f59e0b"/>
          <!-- Arrow from target to nearest -->
          <line x1="94" y1="68" x2="82" y2="78" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="3,2"/>
          <!-- Labels -->
          <text x="97" y="64" fill="#f59e0b" font-size="9" font-family="monospace">b (публ.)</text>
          <text x="55" y="96" fill="#60a5fa" font-size="9" font-family="monospace">s (секрет)</text>
        </svg>
      </div>
    </div>
  </section>

  <!-- Algorithm Evolution -->
  <section class="section">
    <h2 class="section-title">Эволюция алгоритмов</h2>
    <p class="section-subtitle">
      Каждое поколение криптографии начиналось с "это не сломают". Потом ломали.
    </p>
    <div class="evo-list">
      <div class="evo-item">
        <div class="evo-era">1970-е</div>
        <div class="evo-content">
          <strong>DES</strong> — 56-битный симметричный ключ. Казался надёжным. В 1997 году взломан
          брутфорсом за 22 часа на специальном железе. Заменён AES-128/256 (2001).
          <span class="evo-status dead">Мёртв</span>
        </div>
      </div>
      <div class="evo-item">
        <div class="evo-era">1977</div>
        <div class="evo-content">
          <strong>RSA</strong> — первая асимметричная система. Безопасность на факторизации.
          30 лет был стандартом. Уязвим к алгоритму Шора на квантовом компьютере.
          <span class="evo-status dying">Устаревает</span>
        </div>
      </div>
      <div class="evo-item">
        <div class="evo-era">1990-е</div>
        <div class="evo-content">
          <strong>ECC</strong> — те же свойства что RSA, ключи в 10 раз меньше. Ethereum, Bitcoin.
          Алгоритм Шора ломает его так же, как RSA — дискретный логарифм на эллиптических кривых.
          <span class="evo-status dying">Устаревает</span>
        </div>
      </div>
      <div class="evo-item">
        <div class="evo-era">2024</div>
        <div class="evo-content">
          <strong>ML-KEM, ML-DSA, FN-DSA, SLH-DSA</strong> — стандарты NIST. Основа: решёточные
          задачи и хэш-функции. Нет известной квантовой атаки, сопоставимой с алгоритмом Шора.
          <span class="evo-status live">Актуальны</span>
        </div>
      </div>
    </div>
  </section>

  <!-- Real Attack Vectors -->
  <section class="section">
    <h2 class="section-title">Реальные векторы атак — не квантовые</h2>
    <p class="section-subtitle">
      Пока индустрия готовится к квантовым компьютерам 2040-х, атакуют обычным кодом прямо сейчас.
    </p>
    <div class="vectors-grid">
      <div class="vector-card">
        <div class="vector-tag">РЕАЛИЗАЦИИ</div>
        <h4>Ошибки в коде, не в математике</h4>
        <p>OpenSSL, GnuTLS, LibreSSL содержали и содержат критические CVE. Heartbleed (2014) —
        не атака на RSA, обычное чтение за пределы буфера. Утекло содержимое памяти 500K+ серверов.</p>
      </div>
      <div class="vector-card">
        <div class="vector-tag">ТАЙМИНГ</div>
        <h4>Время ответа как сигнал</h4>
        <p>Если реализация работает чуть дольше на некоторых входных данных — злоумышленник
        восстанавливает ключ по времени ответа. ECDSA в Sony PS3 содержала такую ошибку.
        Через неё сломали защиту приставки.</p>
      </div>
      <div class="vector-card">
        <div class="vector-tag">NONCE</div>
        <h4>Повторный nonce = конец</h4>
        <p>ECDSA и EdDSA: если один nonce используется дважды с разными сообщениями —
        приватный ключ восстанавливается тривиально. В 2013 году так взломали Android
        Bitcoin-кошельки из-за слабого PRNG.</p>
      </div>
      <div class="vector-card">
        <div class="vector-tag">ИНФРАСТРУКТУРА</div>
        <h4>BGP и DNS как вектор</h4>
        <p>В 2018 году перехватили BGP-маршруты Amazon Route 53, подменили DNS,
        перенаправили трафик ethereum-кошельков на фишинговый сайт. Никакой криптографии —
        чистая инфраструктура. Потери: $152K ETH.</p>
      </div>
    </div>
  </section>

  <!-- Real Breaches -->
  <section class="section">
    <h2 class="section-title">Кого ломали — факты</h2>
    <div class="table-wrap">
      <table class="compare-table breaches-table">
        <thead>
          <tr>
            <th>Год</th>
            <th>Инцидент</th>
            <th>Вектор</th>
            <th>Последствия</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="b-year">2008</td>
            <td><span class="t-name">Debian OpenSSL</span></td>
            <td>Слабый PRNG — 32 768 возможных ключей вместо миллиардов</td>
            <td>Все SSH-ключи за два года скомпрометированы</td>
          </tr>
          <tr>
            <td class="b-year">2013</td>
            <td><span class="t-name">Android Bitcoin</span></td>
            <td>Повторный nonce в ECDSA из-за Java SecureRandom</td>
            <td>Прямые потери BTC у пользователей кошельков</td>
          </tr>
          <tr>
            <td class="b-year">2014</td>
            <td><span class="t-name">Heartbleed</span></td>
            <td>Чтение за пределы буфера в OpenSSL TLS-расширении</td>
            <td>Память серверов, приватные ключи, пароли пользователей</td>
          </tr>
          <tr>
            <td class="b-year">2018</td>
            <td><span class="t-name">Amazon Route 53</span></td>
            <td>BGP hijack → DNS подмена → фишинг</td>
            <td>$152K ETH, MyEtherWallet пользователи</td>
          </tr>
          <tr>
            <td class="b-year">2022</td>
            <td><span class="t-name">SIKE / SIDH</span></td>
            <td>Математическая атака Castryck–Decru на изогении</td>
            <td>Алгоритм снят с рассмотрения NIST за 62 минуты</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="table-note">Паттерн: почти ни один крупный взлом — не атака на математику алгоритма. Реализации, инфраструктура, человеческие ошибки.</p>
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

  .threat-label {
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--text-tertiary);
    margin-bottom: 8px;
    font-family: var(--font-mono);
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

  /* Lattice section */
  .lattice-box {
    display: grid;
    grid-template-columns: 1fr 200px;
    gap: 32px;
    align-items: center;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid var(--border-dark);
    border-radius: 14px;
    padding: 24px;
    margin-top: 1rem;
  }

  @media (max-width: 680px) {
    .lattice-box {
      grid-template-columns: 1fr;
    }
  }

  .lattice-text p {
    color: var(--text-secondary);
    font-size: 0.93rem;
    line-height: 1.65;
    margin: 0 0 12px 0;
  }

  .lattice-note {
    font-size: 0.85rem;
    color: var(--text-tertiary);
    border-top: 1px solid var(--border-dark);
    padding-top: 12px;
    margin-top: 4px;
    line-height: 1.55;
  }

  .lattice-vis {
    display: flex;
    justify-content: center;
  }

  .lattice-svg {
    width: 160px;
    height: 140px;
  }

  /* Evolution */
  .evo-list {
    display: flex;
    flex-direction: column;
    gap: 0;
    margin-top: 1.2rem;
    border: 1px solid var(--border-dark);
    border-radius: 12px;
    overflow: hidden;
  }

  .evo-item {
    display: flex;
    gap: 0;
    border-bottom: 1px solid var(--border-dark);
  }

  .evo-item:last-child {
    border-bottom: none;
  }

  .evo-era {
    min-width: 72px;
    padding: 16px;
    font-family: var(--font-mono);
    font-size: 0.82rem;
    font-weight: 700;
    color: var(--text-tertiary);
    background: rgba(255, 255, 255, 0.02);
    border-right: 1px solid var(--border-dark);
    display: flex;
    align-items: flex-start;
    flex-shrink: 0;
  }

  .evo-content {
    padding: 16px;
    font-size: 0.9rem;
    color: var(--text-secondary);
    line-height: 1.6;
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 8px;
  }

  .evo-content strong {
    color: var(--text-primary);
  }

  .evo-status {
    font-size: 0.72rem;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 999px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    white-space: nowrap;
    align-self: flex-start;
    margin-top: 2px;
  }

  .evo-status.dead { background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.3); }
  .evo-status.dying { background: rgba(245,158,11,0.12); color: #fbbf24; border: 1px solid rgba(245,158,11,0.3); }
  .evo-status.live { background: rgba(34,211,153,0.12); color: #34d399; border: 1px solid rgba(34,211,153,0.3); }

  /* Attack vectors */
  .vectors-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 14px;
    margin-top: 1.2rem;
  }

  .vector-card {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid var(--border-dark);
    border-radius: 12px;
    padding: 18px;
  }

  .vector-tag {
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--text-tertiary);
    font-family: var(--font-mono);
    margin-bottom: 8px;
  }

  .vector-card h4 {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 8px 0;
  }

  .vector-card p {
    font-size: 0.88rem;
    color: var(--text-secondary);
    line-height: 1.6;
    margin: 0;
  }

  /* Breaches table */
  .breaches-table .b-year {
    font-family: var(--font-mono);
    font-weight: 700;
    color: var(--text-primary);
    white-space: nowrap;
  }

  .breaches-table td {
    font-size: 0.87rem;
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
