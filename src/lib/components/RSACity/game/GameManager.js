/**
 * Управление игрой: волны, здоровье, состояние
 */
export class GameManager {
  constructor() {
    this.state = 'menu'; // 'menu', 'playing', 'paused', 'gameover', 'victory'
    this.wave = 0;
    this.maxWaves = 10;
    this.towerHealth = 100;
    this.maxTowerHealth = 100;
    this.score = 0;
    this.enemiesKilled = 0;
    this.keysUsed = 0;
    this.correctKeys = 0;
    
    // Callbacks
    this.onWaveStart = null;
    this.onWaveComplete = null;
    this.onGameOver = null;
    this.onVictory = null;
    this.onHealthChange = null;
    this.onScoreChange = null;
    
    this.isWaveActive = false;
    this.enemiesRemaining = 0;
  }
  
  /**
   * Начало игры
   */
  startGame() {
    // Проверяем, не запущена ли уже игра
    if (this.state === 'playing' && this.wave > 0) {
      console.log('⚠️ Игра уже запущена, сбрасываем...');
    }
    
    this.state = 'playing';
    this.wave = 0;
    this.towerHealth = this.maxTowerHealth;
    this.score = 0;
    this.enemiesKilled = 0;
    this.keysUsed = 0;
    this.correctKeys = 0;
    this.isWaveActive = false;
    this.enemiesRemaining = 0;
    
    // Небольшая задержка перед первой волной
    setTimeout(() => {
      this.nextWave();
    }, 500);
  }
  
  /**
   * Следующая волна
   */
  nextWave() {
    if (this.wave >= this.maxWaves) {
      this.victory();
      return;
    }
    
    this.wave++;
    this.isWaveActive = true;
    
    if (this.onWaveStart) {
      this.onWaveStart(this.wave);
    }
  }
  
  /**
   * Волна завершена
   */
  completeWave() {
    this.isWaveActive = false;
    this.enemiesRemaining = 0;
    
    if (this.onWaveComplete) {
      this.onWaveComplete(this.wave);
    }
    
    // Небольшая пауза перед следующей волной
    setTimeout(() => {
      if (this.state === 'playing') {
        this.nextWave();
      }
    }, 3000);
  }
  
  /**
   * Урон башне
   */
  damageTower(amount) {
    this.towerHealth -= amount;
    
    if (this.towerHealth <= 0) {
      this.towerHealth = 0;
      this.gameOver();
    }
    
    if (this.onHealthChange) {
      this.onHealthChange(this.towerHealth, this.maxTowerHealth);
    }
  }
  
  /**
   * Враг убит
   */
  enemyKilled(correctKey = false) {
    this.enemiesKilled++;
    this.score += correctKey ? 100 : 50; // Больше очков за правильный ключ
    this.keysUsed++;
    
    if (correctKey) {
      this.correctKeys++;
    }
    
    if (this.onScoreChange) {
      this.onScoreChange(this.score);
    }
  }
  
  /**
   * Обновление количества оставшихся врагов
   */
  updateEnemiesRemaining(count) {
    this.enemiesRemaining = count;
    
    // Если все враги убиты и волна активна
    if (this.enemiesRemaining === 0 && this.isWaveActive) {
      this.completeWave();
    }
  }
  
  /**
   * Игра окончена
   */
  gameOver() {
    this.state = 'gameover';
    this.isWaveActive = false;
    
    if (this.onGameOver) {
      this.onGameOver({
        wave: this.wave,
        score: this.score,
        enemiesKilled: this.enemiesKilled,
        accuracy: this.keysUsed > 0 ? (this.correctKeys / this.keysUsed * 100).toFixed(1) : 0
      });
    }
  }
  
  /**
   * Победа
   */
  victory() {
    this.state = 'victory';
    this.isWaveActive = false;
    
    if (this.onVictory) {
      this.onVictory({
        wave: this.wave,
        score: this.score,
        enemiesKilled: this.enemiesKilled,
        accuracy: this.keysUsed > 0 ? (this.correctKeys / this.keysUsed * 100).toFixed(1) : 0
      });
    }
  }
  
  /**
   * Пауза
   */
  pause() {
    if (this.state === 'playing') {
      this.state = 'paused';
    }
  }
  
  /**
   * Продолжить
   */
  resume() {
    if (this.state === 'paused') {
      this.state = 'playing';
    }
  }
  
  /**
   * Получить статистику
   */
  getStats() {
    return {
      wave: this.wave,
      maxWaves: this.maxWaves,
      towerHealth: this.towerHealth,
      maxTowerHealth: this.maxTowerHealth,
      score: this.score,
      enemiesKilled: this.enemiesKilled,
      keysUsed: this.keysUsed,
      correctKeys: this.correctKeys,
      accuracy: this.keysUsed > 0 ? (this.correctKeys / this.keysUsed * 100).toFixed(1) : 0
    };
  }
}

