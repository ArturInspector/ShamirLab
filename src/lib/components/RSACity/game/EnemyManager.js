import { Enemy } from './Enemy.js';
import * as THREE from 'three';

/**
 * Управление врагами: спавн, обновление, удаление
 */
export class EnemyManager {
  constructor(scene, rsaTowerPosition) {
    this.scene = scene;
    this.rsaTowerPosition = rsaTowerPosition;
    this.enemies = [];
    this.enemyGroup = new THREE.Group();
    scene.add(this.enemyGroup);
    
    // Настройки спавна
    this.spawnRadius = 50; // Радиус спавна врагов
    this.spawnInterval = 3000; // Интервал между спавнами (мс)
    this.lastSpawnTime = 0;
    this.isSpawning = false;
  }
  
  /**
   * Спавн врага
   */
  spawnEnemy(type = 'drone', difficulty = 1) {
    // Генерируем позицию на краю карты
    const angle = Math.random() * Math.PI * 2;
    const x = Math.cos(angle) * this.spawnRadius;
    const z = Math.sin(angle) * this.spawnRadius;
    
    // Параметры в зависимости от типа и сложности
    const configs = {
      drone: {
        speed: 2.0,
        health: 50 + difficulty * 10,
        p: 17,
        q: 23
      },
      soldier: {
        speed: 1.5,
        health: 100 + difficulty * 20,
        p: 101,
        q: 103
      },
      boss: {
        speed: 1.0,
        health: 500 + difficulty * 100,
        p: 1009,
        q: 1013
      }
    };
    
    const config = configs[type] || configs.drone;
    
    const enemy = new Enemy({
      type: type,
      position: new THREE.Vector3(x, 0, z),
      target: this.rsaTowerPosition,
      speed: config.speed,
      health: config.health,
      p: config.p,
      q: config.q,
      message: Math.floor(Math.random() * 100) + 1
    });
    
    this.enemies.push(enemy);
    this.enemyGroup.add(enemy.mesh);
    if (enemy.healthBarGroup) {
      this.enemyGroup.add(enemy.healthBarGroup);
    }
    
    return enemy;
  }
  
  /**
   * Обновление всех врагов
   */
  update(deltaTime, camera = null, onEnemyKilled = null) {
    // Сначала обновляем живых врагов
    this.enemies.forEach(enemy => {
      if (!enemy.isDead) {
        enemy.update(deltaTime, camera);
      }
    });
    
    // Затем проверяем и удаляем мертвых врагов
    const enemiesToRemove = [];
    this.enemies.forEach(enemy => {
      if (enemy.isDead) {
        enemiesToRemove.push(enemy);
        
        // Вызываем callback для убитого врага
        if (onEnemyKilled) {
          // Проверяем, был ли враг убит правильным ключом (через userData)
          // Инициализируем userData если его нет
          if (!enemy.userData) {
            enemy.userData = {};
          }
          const correct = enemy.userData.killedByCorrectKey === true; // Только если явно true
          onEnemyKilled(correct);
        }
        
        // Удаляем из сцены через небольшую задержку для анимации
        setTimeout(() => {
          this.enemyGroup.remove(enemy.mesh);
          if (enemy.healthBarGroup) {
            this.enemyGroup.remove(enemy.healthBarGroup);
          }
          enemy.dispose();
        }, 300);
      }
    });
    
    // Удаляем мертвых врагов из массива
    this.enemies = this.enemies.filter(enemy => !enemy.isDead);
  }
  
  /**
   * Спавн волны врагов
   */
  spawnWave(waveNumber, onWaveComplete) {
    this.isSpawning = true;
    const enemyCount = 3 + waveNumber; // Увеличиваем количество с каждой волной
    const types = ['drone', 'drone', 'soldier']; // Типы врагов
    let spawned = 0;
    
    const spawnNext = () => {
      if (spawned >= enemyCount) {
        this.isSpawning = false;
        if (onWaveComplete) onWaveComplete();
        return;
      }
      
      // Выбираем тип (последние 2 врага - солдаты, если волна > 3)
      let type = 'drone';
      if (waveNumber > 3 && spawned >= enemyCount - 2) {
        type = 'soldier';
      }
      
      // Boss на каждой 5-й волне
      if (waveNumber % 5 === 0 && spawned === enemyCount - 1) {
        type = 'boss';
      }
      
      this.spawnEnemy(type, waveNumber);
      spawned++;
      
      // Спавним следующего через интервал
      setTimeout(spawnNext, this.spawnInterval);
    };
    
    spawnNext();
  }
  
  /**
   * Получить всех врагов
   */
  getEnemies() {
    return this.enemies.filter(e => !e.isDead);
  }
  
  /**
   * Получить ближайшего врага к позиции
   */
  getNearestEnemy(position) {
    let nearest = null;
    let minDistance = Infinity;
    
    this.enemies.forEach(enemy => {
      if (enemy.isDead) return;
      const distance = enemy.mesh.position.distanceTo(position);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = enemy;
      }
    });
    
    return nearest;
  }
  
  /**
   * Очистка всех врагов
   */
  clear() {
    this.enemies.forEach(enemy => {
      this.enemyGroup.remove(enemy.mesh);
      if (enemy.healthBarGroup) {
        this.enemyGroup.remove(enemy.healthBarGroup);
      }
      enemy.dispose();
    });
    this.enemies = [];
  }
  
  dispose() {
    this.clear();
    if (this.enemyGroup) {
      this.scene.remove(this.enemyGroup);
    }
  }
}

