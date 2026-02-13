<script>
  import ZKLayout from './ZKLayout.svelte';
  import { zkFloors } from '../../content/zkFloors';

  const floor = zkFloors.find((f) => f.id === 'playground');
  const idx = zkFloors.indexOf(floor);
  const prevHref = idx > 0 ? `#/` + zkFloors[idx - 1].route : '#/zk';
  const nextHref = idx < zkFloors.length - 1 ? `#/` + zkFloors[idx + 1].route : '';
  const accent = floor.accent === 'secondary' ? 'var(--accent-cyan)' : 'var(--accent-blue)';

  let secret = '';
  let salt = '';
  let hashAlgo = 'simple';
  let commitment = '';
  let revealed = false;
  let verifyStatus = '';
  let step = 'input';

  const hashFunctions = {
    simple: (s) => {
      let h = 0;
      for (let i = 0; i < s.length; i++) {
        h = (h * 31 + s.charCodeAt(i)) >>> 0;
      }
      return h.toString(16).padStart(8, '0');
    },
    fnv1a: (s) => {
      let h = 2166136261;
      for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
      }
      return (h >>> 0).toString(16).padStart(8, '0');
    },
    djb2: (s) => {
      let h = 5381;
      for (let i = 0; i < s.length; i++) {
        h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
      }
      return h.toString(16).padStart(8, '0');
    },
  };

  function generateSalt() {
    salt = Math.random().toString(36).substring(2, 10);
  }

  function commit() {
    if (!secret.trim()) {
      verifyStatus = 'Введи секрет!';
      return;
    }
    if (!salt.trim()) {
      generateSalt();
    }
    const combined = secret + '|' + salt;
    commitment = hashFunctions[hashAlgo](combined);
    step = 'committed';
    revealed = false;
    verifyStatus = '';
  }

  function reveal() {
    step = 'revealed';
    revealed = true;
  }

  function verify() {
    const combined = secret + '|' + salt;
    const recomputed = hashFunctions[hashAlgo](combined);
    if (recomputed === commitment) {
      verifyStatus = '✓ Доказательство верное! Hash совпал.';
    } else {
      verifyStatus = '✗ Обман! Hash не совпал.';
    }
  }

  function reset() {
    secret = '';
    salt = '';
    commitment = '';
    revealed = false;
    verifyStatus = '';
    step = 'input';
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
  <div slot="visual" class="playground">
    <div class="stage">
      <div class="stage-indicator">
        <div class="stage-step" class:active={step === 'input'}>1. Создание</div>
        <div class="stage-step" class:active={step === 'committed'}>2. Commit</div>
        <div class="stage-step" class:active={step === 'revealed'}>3. Reveal</div>
      </div>

      {#if step === 'input'}
        <div class="panel">
          <h3>Создай секрет</h3>
          <div class="form-group">
            <label for="secret">Твой секрет:</label>
            <input
              id="secret"
              type="text"
              bind:value={secret}
              placeholder="Введи что-нибудь секретное..."
            />
          </div>
          <div class="form-group">
            <label for="salt">Salt (случайная строка):</label>
            <div class="input-with-btn">
              <input id="salt" type="text" bind:value={salt} placeholder="Генерируется авто" />
              <button class="gen-btn" on:click={generateSalt}>🎲</button>
            </div>
          </div>
          <div class="form-group">
            <label for="algo">Hash функция:</label>
            <select id="algo" bind:value={hashAlgo}>
              <option value="simple">Simple Hash</option>
              <option value="fnv1a">FNV-1a</option>
              <option value="djb2">DJB2</option>
            </select>
          </div>
          <button class="action-btn" on:click={commit}>Commit секрет</button>
        </div>
      {/if}

      {#if step === 'committed'}
        <div class="panel">
          <h3>Commitment создан!</h3>
          <div class="commitment-box">
            <div class="label">Hash (commitment):</div>
            <div class="hash-value">{commitment}</div>
          </div>
          <p class="hint">
            Этот hash — твоё "обещание". Ты закоммитил секрет, но пока его не раскрыл.
          </p>
          <div class="actions">
            <button class="action-btn" on:click={reveal}>Reveal секрет</button>
            <button class="ghost-btn" on:click={reset}>Сброс</button>
          </div>
        </div>
      {/if}

      {#if step === 'revealed'}
        <div class="panel">
          <h3>Секрет раскрыт</h3>
          <div class="reveal-box">
            <div class="reveal-item">
              <span class="reveal-label">Секрет:</span>
              <span class="reveal-value">{secret}</span>
            </div>
            <div class="reveal-item">
              <span class="reveal-label">Salt:</span>
              <span class="reveal-value">{salt}</span>
            </div>
            <div class="reveal-item">
              <span class="reveal-label">Hash:</span>
              <span class="reveal-value">{commitment}</span>
            </div>
          </div>
          <button class="action-btn" on:click={verify}>Проверить доказательство</button>
          {#if verifyStatus}
            <div
              class="verify-status"
              class:success={verifyStatus.startsWith('✓')}
              class:error={verifyStatus.startsWith('✗')}
            >
              {verifyStatus}
            </div>
          {/if}
          <button class="ghost-btn" on:click={reset}>Новый раунд</button>
        </div>
      {/if}
    </div>
  </div>

  <div slot="theory">
    <h1>{floor.title}</h1>
    <p>Commit-reveal — базовая ZK схема. Ты commit секрет (hash), потом reveal и доказываешь.</p>

    <h2>Как это работает</h2>
    <ol>
      <li><strong>Commit:</strong> Создаешь hash от секрета + salt → публикуешь hash.</li>
      <li><strong>Wait:</strong> Hash уже опубликован, менять поздно.</li>
      <li><strong>Reveal:</strong> Раскрываешь секрет и salt → все проверяют hash.</li>
    </ol>

    <h2>Зачем salt?</h2>
    <p>
      Без salt злоумышленник может перебрать популярные значения и угадать твой секрет по hash. Salt
      делает перебор невозможным.
    </p>

    <h2>Hash функции</h2>
    <ul>
      <li><strong>Simple Hash:</strong> Быстрый, но слабый (для демо).</li>
      <li><strong>FNV-1a:</strong> Популярный non-crypto hash.</li>
      <li><strong>DJB2:</strong> Классика от Dan Bernstein.</li>
    </ul>

    <p class="note">
      В реальных ZK системах используют криптографические hash (SHA-256, Poseidon) и commitment
      схемы (Pedersen).
    </p>
  </div>
</ZKLayout>

<style>
  .playground {
    width: 100%;
    height: 100%;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .stage {
    width: 100%;
    max-width: 520px;
  }

  .stage-indicator {
    display: flex;
    justify-content: space-between;
    margin-bottom: 24px;
    gap: 8px;
  }

  .stage-step {
    flex: 1;
    padding: 10px 8px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--border-dark);
    border-radius: 8px;
    text-align: center;
    font-size: 0.9rem;
    color: var(--text-tertiary);
    transition: all 0.2s ease;
  }

  .stage-step.active {
    background: rgba(34, 211, 238, 0.1);
    border-color: var(--accent-cyan);
    color: var(--accent-cyan);
    font-weight: 700;
  }

  .panel {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid var(--border-dark);
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }

  .panel h3 {
    margin: 0 0 20px 0;
    color: var(--text-primary);
    font-size: 1.3rem;
  }

  .form-group {
    margin-bottom: 16px;
  }

  .form-group label {
    display: block;
    margin-bottom: 6px;
    color: var(--text-secondary);
    font-size: 0.95rem;
    font-weight: 600;
  }

  .form-group input,
  .form-group select {
    width: 100%;
    padding: 10px 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--border-dark);
    border-radius: 8px;
    color: var(--text-primary);
    font-family: var(--font-sans);
    font-size: 1rem;
    transition: border-color 0.2s ease;
  }

  .form-group input:focus,
  .form-group select:focus {
    outline: none;
    border-color: var(--accent-cyan);
  }

  .input-with-btn {
    display: flex;
    gap: 8px;
  }

  .gen-btn {
    padding: 10px 14px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--border-dark);
    border-radius: 8px;
    font-size: 1.2rem;
    transition: all 0.2s ease;
  }

  .gen-btn:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: scale(1.1);
  }

  .action-btn {
    width: 100%;
    padding: 14px;
    background: var(--accent);
    color: #0a0a0a;
    border: none;
    border-radius: 10px;
    font-weight: 700;
    font-size: 1rem;
    letter-spacing: 0.5px;
    margin-top: 8px;
    transition: all 0.2s ease;
  }

  .action-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
  }

  .ghost-btn {
    width: 100%;
    padding: 12px;
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-primary);
    border: 1px solid var(--border-dark);
    border-radius: 10px;
    font-weight: 600;
    margin-top: 12px;
    transition: all 0.2s ease;
  }

  .ghost-btn:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  .commitment-box,
  .reveal-box {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid var(--border-medium);
    border-radius: 10px;
    padding: 16px;
    margin: 16px 0;
  }

  .label {
    font-size: 0.85rem;
    color: var(--text-tertiary);
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .hash-value {
    font-family: var(--font-mono);
    font-size: 1.1rem;
    color: var(--accent-cyan);
    word-break: break-all;
    font-weight: 700;
  }

  .hint {
    color: var(--text-secondary);
    font-size: 0.95rem;
    line-height: 1.6;
    margin: 12px 0;
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .reveal-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid var(--border-dark);
  }

  .reveal-item:last-child {
    border-bottom: none;
  }

  .reveal-label {
    font-weight: 600;
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  .reveal-value {
    font-family: var(--font-mono);
    color: var(--text-primary);
    font-size: 0.95rem;
    word-break: break-all;
    text-align: right;
    max-width: 60%;
  }

  .verify-status {
    margin-top: 16px;
    padding: 12px;
    border-radius: 8px;
    font-weight: 600;
    text-align: center;
  }

  .verify-status.success {
    background: rgba(34, 211, 153, 0.15);
    color: #22d399;
    border: 1px solid rgba(34, 211, 153, 0.3);
  }

  .verify-status.error {
    background: rgba(239, 68, 68, 0.15);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.3);
  }

  .note {
    margin-top: 20px;
    padding: 12px;
    background: rgba(96, 165, 250, 0.08);
    border-left: 3px solid var(--accent-blue);
    border-radius: 4px;
    font-size: 0.9rem;
    color: var(--text-secondary);
    line-height: 1.6;
  }

  @media (max-width: 640px) {
    .playground {
      padding: 12px;
    }

    .stage {
      max-width: 100%;
    }

    .stage-indicator {
      flex-direction: column;
    }

    .reveal-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 6px;
    }

    .reveal-value {
      max-width: 100%;
      text-align: left;
    }
  }
</style>
