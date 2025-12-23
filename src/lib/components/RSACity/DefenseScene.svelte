<script>
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';
  import { setupLighting, setupCamera, createGround } from '../../utils/three-helpers.js';
  import { cityConfig } from '../../utils/city-config.js';
  import { PlayerController } from './PlayerController.js';
  import { RSATower } from './RSATower.js';
  import { EnemyManager } from './game/EnemyManager.js';
  import { WeaponSystem } from './game/WeaponSystem.js';
  import { GameManager } from './game/GameManager.js';
  import { ParticleSystem } from './game/ParticleSystem.js';
  import GameUI from './game/GameUI.svelte';
  
  let container;
  let scene, camera, renderer;
  let playerController;
  let rsaTower;
  let enemyManager;
  let weaponSystem;
  let gameManager;
  let particleSystem;
  
  let animationFrameId;
  let lastTime = 0;
  
  // UI состояние
  let selectedEnemy = null;
  let towerHealth = 100;
  let maxTowerHealth = 100;
  let gameState = 'menu'; // 'menu', 'playing', 'paused', 'gameover'
  
  // Функция для начала игры (доступна в шаблоне)
  function startGame() {
    console.log('🎮 Начало игры...');
    console.log('GameManager:', gameManager);
    console.log('EnemyManager:', enemyManager);
    
    if (!gameManager) {
      console.error('GameManager не инициализирован!');
      return;
    }
    
    if (!enemyManager) {
      console.error('EnemyManager не инициализирован!');
      return;
    }
    
    // Сбрасываем состояние игры
    gameState = 'playing';
    
    // Очищаем предыдущих врагов, если есть
    enemyManager.clear();
    
    // Начинаем игру
    gameManager.startGame(); // Это вызовет onWaveStart, который запустит спавн
    console.log('✅ Игра начата, состояние:', gameState);
  }
  
  onMount(() => {
    if (!container) return;
    
    console.log('🎮 Crypto Defense: Инициализация...');
    
    // Сцена
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    scene.fog = new THREE.Fog(0x1a1a2e, 50, 200);
    
    // Камера
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera = setupCamera(width, height);
    // @ts-ignore
    camera.position.set(0, 15, 25);
    camera.lookAt(0, 0, 0);
    
    // Рендерер
    const existingCanvas = container.querySelector('canvas');
    renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      canvas: existingCanvas || undefined
    });
    
    if (!existingCanvas) {
      container.appendChild(renderer.domElement);
    }
    
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // @ts-ignore
    renderer.shadowMap.enabled = true;
    // @ts-ignore
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Освещение
    const { directionalLight } = setupLighting(scene);
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    // @ts-ignore
    directionalLight.shadow.camera.near = 0.5;
    // @ts-ignore
    directionalLight.shadow.camera.far = 200;
    // @ts-ignore
    directionalLight.shadow.camera.left = -100;
    // @ts-ignore
    directionalLight.shadow.camera.right = 100;
    // @ts-ignore
    directionalLight.shadow.camera.top = 100;
    // @ts-ignore
    directionalLight.shadow.camera.bottom = -100;
    
    // Земля
    const { ground, gridHelper } = createGround(
      cityConfig.size,
      cityConfig.groundColor,
      cityConfig.gridDivisions
    );
    // @ts-ignore
    scene.add(ground);
    // @ts-ignore
    scene.add(gridHelper);
    
    // RSA Tower в центре
    const towerPosition = new THREE.Vector3(0, 0, 0);
    rsaTower = new RSATower({
      position: towerPosition,
      onFloorClick: (floorNumber) => {
        console.log(`Этаж ${floorNumber} кликнут`);
      }
    });
    scene.add(rsaTower.getGroup());
    
    // Player Controller
    playerController = new PlayerController(camera, scene);
    
    // Game Manager
    gameManager = new GameManager();
    let waveSpawnInProgress = false; // Флаг для предотвращения дублирования
    
    gameManager.onWaveStart = (wave) => {
      if (waveSpawnInProgress) {
        console.log(`⚠️ Спавн волны ${wave} уже идет, пропускаем...`);
        return;
      }
      
      console.log(`🌊 Волна ${wave} началась!`);
      waveSpawnInProgress = true;
      
      // Запускаем спавн врагов для этой волны
      if (enemyManager) {
        enemyManager.spawnWave(wave, () => {
          console.log(`✅ Все враги волны ${wave} заспавнены`);
          waveSpawnInProgress = false;
        });
      } else {
        waveSpawnInProgress = false;
      }
    };
    gameManager.onWaveComplete = (wave) => {
      console.log(`✅ Волна ${wave} завершена!`);
      waveSpawnInProgress = false;
    };
    gameManager.onGameOver = (stats) => {
      console.log('💀 Игра окончена!', stats);
      gameState = 'gameover';
    };
    gameManager.onHealthChange = (health, maxHealth) => {
      towerHealth = health;
      maxTowerHealth = maxHealth;
    };
    
    // Enemy Manager
    enemyManager = new EnemyManager(scene, towerPosition);
    
    // Weapon System
    weaponSystem = new WeaponSystem(scene, camera);
    
    // Particle System
    particleSystem = new ParticleSystem(scene);
    
    // Обработка мыши для выбора врага
    // @ts-ignore
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(0, 0);
    
    const handleMouseMove = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    
    const handleClick = (event) => {
      // Игнорируем клики если меню открыто
      if (gameState !== 'playing') {
        // Разрешаем клики по меню
        return;
      }
      
      // Стрельба в направлении взгляда камеры (FPS стиль)
      const selectedKey = weaponSystem.getSelectedKey();
      if (!selectedKey) return;
      
      // Получаем направление камеры
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);
      
      // Вычисляем точку выстрела (на расстоянии 50 единиц от камеры)
      const shootDistance = 50;
      const shootTarget = new THREE.Vector3();
      // @ts-ignore
      shootTarget.copy(camera.position);
      shootTarget.addScaledVector(direction, shootDistance);
      
      // Выстрел
      weaponSystem.shoot(shootTarget);
      
      // Проверяем попадание во врага через raycasting
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);
      
      // Ищем врага в направлении выстрела
      let hitEnemy = null;
      for (const intersect of intersects) {
        // @ts-ignore
        if (intersect.object && intersect.object.userData && intersect.object.userData.enemy) {
          // @ts-ignore
          hitEnemy = intersect.object.userData.enemy;
          selectedEnemy = hitEnemy.getUIData();
          break;
        }
      }
      
      // Если попали во врага, проверяем ключ (проверка произойдет при столкновении пули с врагом)
      // Основная логика проверки ключа в цикле анимации при столкновении пули с врагом
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);
    
    // Клавиши для выбора ключей
    const handleKeyPress = (event) => {
      if (gameState !== 'playing') return;
      
      const keyNum = parseInt(event.key);
      if (keyNum >= 1 && keyNum <= 3) {
        weaponSystem.selectKey(keyNum - 1);
      }
      
      if (event.code === 'Space') {
        event.preventDefault();
        gameManager.startGame();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    
    // Обработка изменения размера
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Цикл анимации
    const animate = (currentTime) => {
      animationFrameId = requestAnimationFrame(animate);
      
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      
      // Обновление только если игра идет
      if (gameState === 'playing') {
        // Player
        if (playerController) {
          playerController.update(deltaTime);
        }
        
        // Enemies
        if (enemyManager) {
          // Обновляем врагов с камерой для billboard эффекта health bar
          // Callback вызывается автоматически когда враг умирает
          enemyManager.update(deltaTime, camera, (correct) => {
            // Callback когда враг умирает - считаем его
            gameManager.enemyKilled(correct);
          });
          
          // Проверка попаданий пуль во врагов
          const bulletsToRemove = [];
          weaponSystem.bullets.forEach(bullet => {
            enemyManager.getEnemies().forEach(enemy => {
              if (weaponSystem.checkHit(bullet, enemy)) {
                const key = bullet.userData.key;
                const correct = enemy.tryDecrypt(key);
                
                // Создаем эффект частиц
                if (particleSystem) {
                  // @ts-ignore
                  particleSystem.createHitEffect(enemy.mesh.position, correct ? 0x4a90e2 : 0xff6b6b, correct);
                }
                
                // enemyKilled будет вызван в callback EnemyManager при смерти врага
                // Здесь только помечаем пулю для удаления
                
                // Помечаем пулю для удаления
                bulletsToRemove.push(bullet);
              }
            });
          });
          
          // Удаляем попавшие пули
          bulletsToRemove.forEach(bullet => {
            weaponSystem.bulletGroup.remove(bullet);
            // @ts-ignore
            if (bullet.geometry) bullet.geometry.dispose();
            // @ts-ignore
            if (bullet.material) bullet.material.dispose();
          });
          // @ts-ignore
          weaponSystem.bullets = weaponSystem.bullets.filter(b => !bulletsToRemove.includes(b));
          
          // Обновление количества врагов
          const enemies = enemyManager.getEnemies();
          gameManager.updateEnemiesRemaining(enemies.length);
          
          // Проверка достижения башни врагами
          enemies.forEach(enemy => {
            const distance = enemy.getDistanceToTarget();
            if (distance < 2 && !enemy.isDead) {
              // Враг достиг башни - урон и смерть
              gameManager.damageTower(5);
              enemy.die();
              // Не считаем как убитого игроком, т.к. враг достиг башни
            }
          });
        }
        
        // Weapons
        if (weaponSystem) {
          weaponSystem.update(deltaTime);
        }
      }
      
      renderer.render(scene, camera);
    };
    
    lastTime = performance.now();
    animate(lastTime);
    
    // Начало игры - не автоматически, ждем клика
    // gameManager.startGame() будет вызван при клике на кнопку
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleKeyPress);
    };
  });
  
  onDestroy(() => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    
    if (playerController) playerController.dispose();
    if (enemyManager) enemyManager.dispose();
    if (weaponSystem) weaponSystem.dispose();
    if (particleSystem) particleSystem.dispose();
    if (rsaTower) rsaTower.dispose();
    
    if (renderer) renderer.dispose();
    
    if (scene) {
      scene.traverse((object) => {
        // @ts-ignore
        if (object.geometry) object.geometry.dispose();
        // @ts-ignore
        if (object.material) {
          // @ts-ignore
          if (Array.isArray(object.material)) {
            // @ts-ignore
            object.material.forEach(m => m.dispose());
          } else {
            // @ts-ignore
            object.material.dispose();
          }
        }
      });
    }
  });
</script>

<div class="defense-scene" bind:this={container}>
  <canvas class="game-canvas" class:menu-active={gameState === 'menu' || gameState === 'gameover'}></canvas>
  
  {#if gameState === 'playing' && gameManager && weaponSystem}
    {@const _gm = gameManager}
    {@const _ws = weaponSystem}
    {@const _se = selectedEnemy}
    {@const _th = towerHealth}
    {@const _mth = maxTowerHealth}
    <!-- @ts-ignore -->
    <GameUI 
      gameManager={_gm}
      weaponSystem={_ws}
      selectedEnemy={_se}
      towerHealth={_th}
      maxTowerHealth={_mth}
    />
  {/if}
  
  {#if gameState === 'menu'}
    <div class="menu-overlay">
      <div class="menu-content">
        <h1>🎮 Crypto Defense</h1>
        <p>Защитите RSA Tower от зашифрованных врагов!</p>
        <p class="instructions">
          Используйте правильные публичные ключи для расшифровки врагов.<br>
          Кликните на врага, чтобы выстрелить выбранным ключом.
        </p>
        <button class="start-button" on:click={startGame}>
          Начать игру
        </button>
      </div>
    </div>
  {/if}
  
  {#if gameState === 'gameover'}
    <div class="menu-overlay">
      <div class="menu-content">
        <h1>💀 Игра окончена!</h1>
        <p>Башня разрушена...</p>
        <button class="start-button" on:click={startGame}>
          Попробовать снова
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .defense-scene {
    width: 100%;
    height: 100vh;
    position: relative;
    overflow: hidden;
  }
  
  .game-canvas {
    display: block;
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    pointer-events: auto;
  }
  
  .game-canvas.menu-active {
    pointer-events: none;
  }
  
  .menu-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    pointer-events: auto;
  }
  
  .menu-content {
    text-align: center;
    color: white;
    max-width: 500px;
    padding: 40px;
    background: rgba(0, 0, 0, 0.9);
    border-radius: 16px;
    border: 2px solid #4a90e2;
    position: relative;
    z-index: 1001;
    pointer-events: auto;
  }
  
  .menu-content h1 {
    font-size: 2.5rem;
    margin: 0 0 20px 0;
    color: #4a90e2;
  }
  
  .menu-content p {
    font-size: 1.1rem;
    margin: 15px 0;
    color: #ccc;
  }
  
  .instructions {
    font-size: 0.95rem;
    color: #999;
    line-height: 1.6;
  }
  
  .start-button {
    margin-top: 30px;
    padding: 15px 40px;
    background: #4a90e2;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1.2rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s;
    position: relative;
    z-index: 1002;
    pointer-events: auto;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  }
  
  .start-button:hover {
    background: #60a5fa;
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(74, 144, 226, 0.5);
  }
  
  .start-button:active {
    transform: translateY(0);
  }
</style>

