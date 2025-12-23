<script>
  let {
    gameManager,
    weaponSystem,
    selectedEnemy = null,
    towerHealth = 100,
    maxTowerHealth = 100
  } = $props();
  
  let stats = $derived(gameManager?.getStats() || {});
  let keys = $derived(weaponSystem?.getKeys() || []);
  let selectedKeyIndex = $derived(weaponSystem?.selectedKeyIndex || 0);
  
  function selectKey(index) {
    if (weaponSystem) {
      weaponSystem.selectKey(index);
    }
  }
</script>

<div class="game-ui">
  <!-- Прицел (Crosshair) -->
  <div class="crosshair">
    <div class="crosshair-line crosshair-h"></div>
    <div class="crosshair-line crosshair-v"></div>
    <div class="crosshair-dot"></div>
  </div>
  
  <!-- Верхняя панель -->
  <div class="top-panel">
    <div class="health-bar-container">
      <div class="health-label">Башня</div>
      <div class="health-bar">
        <div 
          class="health-fill" 
          style="width: {(towerHealth / maxTowerHealth) * 100}%"
        ></div>
        <div class="health-text">{towerHealth.toFixed(0)} / {maxTowerHealth}</div>
      </div>
    </div>
    
    <div class="wave-info">
      <div class="wave-label">Волна</div>
      <div class="wave-number">{stats.wave} / {stats.maxWaves}</div>
    </div>
    
    <div class="score-info">
      <div class="score-label">Счет</div>
      <div class="score-value">{stats.score || 0}</div>
    </div>
  </div>
  
  <!-- Информация о враге -->
  {#if selectedEnemy}
    <div class="enemy-info">
      <h3>🎯 Цель</h3>
      <div class="enemy-data">
        <div class="enemy-item">
          <span class="label">Ciphertext:</span>
          <span class="value">{selectedEnemy.ciphertext}</span>
        </div>
        <div class="enemy-item">
          <span class="label">Тип:</span>
          <span class="value">{selectedEnemy.type}</span>
        </div>
        <div class="enemy-item">
          <span class="label">Здоровье:</span>
          <span class="value">{selectedEnemy.health.toFixed(0)} / {selectedEnemy.maxHealth}</span>
        </div>
      </div>
    </div>
  {/if}
  
  <!-- Ключи для выбора -->
  <div class="keys-panel">
    <h3>🔑 Выберите ключ</h3>
    <div class="keys-grid">
      {#each keys as key, index}
        <button
          class="key-button"
          class:selected={index === selectedKeyIndex}
          on:click={() => selectKey(index)}
        >
          <div class="key-label">Ключ {index + 1}</div>
          <div class="key-data">
            <div>e = {key.e}</div>
            <div>n = {key.n}</div>
          </div>
        </button>
      {/each}
    </div>
    <div class="keys-hint">
      Используйте 1-{keys.length} для быстрого выбора
    </div>
  </div>
  
  <!-- Статистика -->
  <div class="stats-panel">
    <div class="stat-item">
      <span class="stat-label">Убито:</span>
      <span class="stat-value">{stats.enemiesKilled || 0}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Точность:</span>
      <span class="stat-value">{stats.accuracy || 0}%</span>
    </div>
  </div>
</div>

<style>
  .game-ui {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 500;
  }
  
  .top-panel {
    display: flex;
    gap: 20px;
    padding: 20px;
    pointer-events: auto;
  }
  
  .health-bar-container {
    flex: 1;
    max-width: 300px;
  }
  
  .health-label {
    color: white;
    font-size: 12px;
    margin-bottom: 5px;
    font-weight: 600;
  }
  
  .health-bar {
    position: relative;
    width: 100%;
    height: 30px;
    background: rgba(0, 0, 0, 0.7);
    border: 2px solid #4a90e2;
    border-radius: 6px;
    overflow: hidden;
  }
  
  .health-fill {
    height: 100%;
    background: linear-gradient(90deg, #10b981 0%, #4a90e2 100%);
    transition: width 0.3s ease;
  }
  
  .health-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-size: 12px;
    font-weight: bold;
    text-shadow: 0 0 4px rgba(0, 0, 0, 0.8);
  }
  
  .wave-info, .score-info {
    background: rgba(0, 0, 0, 0.7);
    padding: 10px 20px;
    border-radius: 8px;
    border: 2px solid #4a90e2;
    pointer-events: auto;
  }
  
  .wave-label, .score-label {
    color: #ccc;
    font-size: 11px;
    margin-bottom: 5px;
  }
  
  .wave-number, .score-value {
    color: white;
    font-size: 24px;
    font-weight: bold;
  }
  
  .enemy-info {
    position: absolute;
    top: 100px;
    left: 20px;
    background: rgba(0, 0, 0, 0.85);
    padding: 20px;
    border-radius: 12px;
    border: 2px solid #ff6b6b;
    min-width: 250px;
    pointer-events: auto;
  }
  
  .enemy-info h3 {
    margin: 0 0 15px 0;
    color: #ff6b6b;
    font-size: 18px;
  }
  
  .enemy-data {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .enemy-item {
    display: flex;
    justify-content: space-between;
    color: white;
    font-size: 14px;
  }
  
  .enemy-item .label {
    color: #ccc;
  }
  
  .enemy-item .value {
    color: #fff;
    font-weight: bold;
  }
  
  .keys-panel {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.9);
    padding: 20px;
    border-radius: 12px;
    border: 2px solid #4a90e2;
    min-width: 600px;
    pointer-events: auto;
  }
  
  .keys-panel h3 {
    margin: 0 0 15px 0;
    color: #4a90e2;
    text-align: center;
    font-size: 18px;
  }
  
  .keys-grid {
    display: flex;
    gap: 15px;
    justify-content: center;
  }
  
  .key-button {
    background: rgba(74, 144, 226, 0.2);
    border: 2px solid #4a90e2;
    border-radius: 8px;
    padding: 15px 20px;
    color: white;
    cursor: pointer;
    transition: all 0.2s;
    min-width: 150px;
  }
  
  .key-button:hover {
    background: rgba(74, 144, 226, 0.4);
    transform: translateY(-2px);
  }
  
  .key-button.selected {
    background: rgba(74, 144, 226, 0.6);
    border-color: #60a5fa;
    box-shadow: 0 0 20px rgba(74, 144, 226, 0.5);
  }
  
  .key-label {
    font-weight: bold;
    margin-bottom: 8px;
    color: #4a90e2;
  }
  
  .key-data {
    font-size: 12px;
    color: #ccc;
    font-family: monospace;
  }
  
  .keys-hint {
    margin-top: 15px;
    text-align: center;
    color: #999;
    font-size: 12px;
  }
  
  .stats-panel {
    position: absolute;
    top: 100px;
    right: 20px;
    background: rgba(0, 0, 0, 0.7);
    padding: 15px;
    border-radius: 8px;
    border: 2px solid #4a90e2;
    pointer-events: auto;
  }
  
  .stat-item {
    display: flex;
    justify-content: space-between;
    gap: 15px;
    color: white;
    margin-bottom: 10px;
    font-size: 14px;
  }
  
  .stat-item:last-child {
    margin-bottom: 0;
  }
  
  .stat-label {
    color: #ccc;
  }
  
  .stat-value {
    color: #4a90e2;
    font-weight: bold;
  }
  
  .crosshair {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 50;
  }
  
  .crosshair-line {
    position: absolute;
    background: rgba(255, 255, 255, 0.8);
    box-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
  }
  
  .crosshair-h {
    width: 20px;
    height: 2px;
    left: -10px;
    top: -1px;
  }
  
  .crosshair-v {
    width: 2px;
    height: 20px;
    left: -1px;
    top: -10px;
  }
  
  .crosshair-dot {
    position: absolute;
    width: 4px;
    height: 4px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 50%;
    left: -2px;
    top: -2px;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
  }
</style>

