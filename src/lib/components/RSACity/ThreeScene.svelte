<script>
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';
  import { setupLighting, setupCamera, createGround } from '../../utils/three-helpers.js';
  import { cityConfig } from '../../utils/city-config.js';
  import { PlayerController } from './PlayerController.js';
  
  let container;
  let scene, camera, renderer;
  let playerController;
  let animationFrameId;
  let lastTime = 0;
  let debugInfo = {
    fps: 0,
    playerPos: { x: 0, y: 0, z: 0 },
    cameraPos: { x: 0, y: 0, z: 0 },
    objectsCount: 0
  };
  let showDebug = true;
  
  onMount(() => {
    if (!container) return;

    console.log('🏙️ RSA City: Инициализация сцены...');
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    scene.fog = new THREE.Fog(0x1a1a2e, 50, 200);
    
    // AxesHelper для отладки (красный=X, зеленый=Y, синий=Z)
    const axesHelper = new THREE.AxesHelper(20);
    // @ts-ignore - AxesHelper is Object3D
    scene.add(axesHelper);
    console.log('✅ AxesHelper добавлен (красный=X, зеленый=Y, синий=Z)');
    
    // Создание камеры
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera = setupCamera(width, height);
    console.log(`✅ Камера создана: ${width}x${height}`);
    
    // Создание рендерера
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
    // @ts-ignore - shadowMap exists on WebGLRenderer
    renderer.shadowMap.enabled = true;
    // @ts-ignore
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Освещение
    const { directionalLight } = setupLighting(scene);
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    // @ts-ignore - shadow camera is OrthographicCamera
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
    
    // Создание земли
    const { ground, gridHelper } = createGround(
      cityConfig.size,
      cityConfig.groundColor,
      cityConfig.gridDivisions
    );
    // @ts-ignore - Mesh and GridHelper are Object3D
    scene.add(ground);
    // @ts-ignore
    scene.add(gridHelper);
    console.log(`✅ Земля создана: размер ${cityConfig.size}x${cityConfig.size}`);
    
    // Создание тестовых зданий
    console.log('🏗️ Создание тестовых зданий...');
    
    // Тестовое здание 1: Простой куб в центре
    const building1Geometry = new THREE.BoxGeometry(5, 10, 5);
    const building1Material = new THREE.MeshStandardMaterial({ 
      color: 0x4a90e2,
      emissive: 0x1a3a5a,
      emissiveIntensity: 0.2
    });
    const building1 = new THREE.Mesh(building1Geometry, building1Material);
    // @ts-ignore - Mesh has position property
    building1.position.set(0, 5, 0); // Центр, высота 5 (половина высоты здания)
    building1.castShadow = true;
    building1.receiveShadow = true;
    // @ts-ignore - Mesh is Object3D
    scene.add(building1);
    console.log('✅ Здание 1 создано в центре (0, 5, 0)');
    
    // Тестовое здание 2: Справа
    const building2 = new THREE.Mesh(
      new THREE.BoxGeometry(4, 8, 4),
      new THREE.MeshStandardMaterial({ color: 0xe24a4a })
    );
    // @ts-ignore
    building2.position.set(15, 4, 0);
    building2.castShadow = true;
    building2.receiveShadow = true;
    // @ts-ignore
    scene.add(building2);
    console.log('✅ Здание 2 создано справа (15, 4, 0)');
    
    // Тестовое здание 3: Слева
    const building3 = new THREE.Mesh(
      new THREE.BoxGeometry(6, 12, 6),
      new THREE.MeshStandardMaterial({ color: 0x4ae24a })
    );
    // @ts-ignore
    building3.position.set(-15, 6, 0);
    building3.castShadow = true;
    building3.receiveShadow = true;
    // @ts-ignore
    scene.add(building3);
    console.log('✅ Здание 3 создано слева (-15, 6, 0)');
    
    // Тестовое здание 4: Впереди
    const building4 = new THREE.Mesh(
      new THREE.BoxGeometry(5, 15, 5),
      new THREE.MeshStandardMaterial({ color: 0xe2e24a })
    );
    // @ts-ignore
    building4.position.set(0, 7.5, -15);
    building4.castShadow = true;
    building4.receiveShadow = true;
    // @ts-ignore
    scene.add(building4);
    console.log('✅ Здание 4 создано впереди (0, 7.5, -15)');
    
    // Тестовое здание 5: Сзади
    const building5 = new THREE.Mesh(
      new THREE.BoxGeometry(4, 9, 4),
      new THREE.MeshStandardMaterial({ color: 0xe24ae2 })
    );
    // @ts-ignore
    building5.position.set(0, 4.5, 15);
    building5.castShadow = true;
    building5.receiveShadow = true;
    // @ts-ignore
    scene.add(building5);
    console.log('✅ Здание 5 создано сзади (0, 4.5, 15)');
    
    console.log(`📊 Всего объектов в сцене: ${scene.children.length}`);
    console.log('📋 Детали сцены:', {
      children: scene.children.map(c => c.type),
      fog: scene.fog ? 'есть' : 'нет',
      background: scene.background
    });
    
    // Создание контроллера игрока
    playerController = new PlayerController(camera, scene);
    console.log('✅ PlayerController создан');
    
    // Обработка изменения размера окна
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
      
      const deltaTime = (currentTime - lastTime) / 1000; // В секундах
      lastTime = currentTime;
      
      // Обновление контроллера игрока
      if (playerController) {
        playerController.update(deltaTime);
        
        // Обновление debug информации
        debugInfo.fps = Math.round(1 / deltaTime);
        debugInfo.playerPos = {
          x: playerController.position.x.toFixed(1),
          y: playerController.position.y.toFixed(1),
          z: playerController.position.z.toFixed(1)
        };
        debugInfo.cameraPos = {
          x: camera.position.x.toFixed(1),
          y: camera.position.y.toFixed(1),
          z: camera.position.z.toFixed(1)
        };
        debugInfo.objectsCount = scene.children.length;
        
        // Логирование позиции каждые 2 секунды (для отладки)
        if (Math.floor(currentTime / 2000) !== Math.floor((currentTime - deltaTime * 1000) / 2000)) {
          const pos = playerController.position;
          const camPos = camera.position;
          console.log(`📍 Позиция игрока: (${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)})`);
          console.log(`📷 Позиция камеры: (${camPos.x.toFixed(2)}, ${camPos.y.toFixed(2)}, ${camPos.z.toFixed(2)})`);
          console.log(`📊 FPS: ${debugInfo.fps}, Объектов в сцене: ${debugInfo.objectsCount}`);
        }
      }
      
      // Рендеринг
      renderer.render(scene, camera);
    };
    
    lastTime = performance.now();
    animate(lastTime);
    
    console.log('🎮 RSA City: Сцена готова!');
    console.log('💡 Откройте консоль браузера (F12) для логов отладки');
    console.log('🎯 Управление: WASD - движение, мышь - поворот, ESC - выход');
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });
  
  onDestroy(() => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    
    if (playerController) {
      playerController.dispose();
    }
    
    if (renderer) {
      renderer.dispose();
    }
    
    // Очистка сцены
    if (scene) {
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(m => m.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    }
  });
</script>

<div class="three-scene" bind:this={container}>
  <canvas></canvas>
  <div class="controls-hint">
    <p>WASD - движение | Мышь - поворот камеры | ESC - выход</p>
  </div>
  
  {#if showDebug}
    <div class="debug-panel">
      <div class="debug-header">
        <h3>🔧 Debug Info</h3>
        <button class="debug-toggle" on:click={() => showDebug = false}>×</button>
      </div>
      <div class="debug-content">
        <div class="debug-item">
          <span class="debug-label">FPS:</span>
          <span class="debug-value">{debugInfo.fps}</span>
        </div>
        <div class="debug-item">
          <span class="debug-label">Игрок:</span>
          <span class="debug-value">({debugInfo.playerPos.x}, {debugInfo.playerPos.y}, {debugInfo.playerPos.z})</span>
        </div>
        <div class="debug-item">
          <span class="debug-label">Камера:</span>
          <span class="debug-value">({debugInfo.cameraPos.x}, {debugInfo.cameraPos.y}, {debugInfo.cameraPos.z})</span>
        </div>
        <div class="debug-item">
          <span class="debug-label">Объектов:</span>
          <span class="debug-value">{debugInfo.objectsCount}</span>
        </div>
        <div class="debug-note">
          💡 Откройте консоль (F12) для подробных логов
        </div>
      </div>
    </div>
  {:else}
    <button class="debug-toggle-btn" on:click={() => showDebug = true}>🔧 Debug</button>
  {/if}
</div>

<style>
  .three-scene {
    width: 100%;
    height: 100vh;
    position: relative;
    overflow: hidden;
  }
  
  .three-scene canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
  
  .controls-hint {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 14px;
    pointer-events: none;
    z-index: 10;
  }
  
  .debug-panel {
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.85);
    color: #0f0;
    padding: 15px;
    border-radius: 8px;
    font-family: 'Courier New', monospace;
    font-size: 12px;
    min-width: 250px;
    border: 1px solid #0f0;
    z-index: 100;
    backdrop-filter: blur(10px);
  }
  
  .debug-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    border-bottom: 1px solid #0f0;
    padding-bottom: 5px;
  }
  
  .debug-header h3 {
    margin: 0;
    font-size: 14px;
    color: #0f0;
  }
  
  .debug-toggle {
    background: transparent;
    border: 1px solid #0f0;
    color: #0f0;
    width: 24px;
    height: 24px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    line-height: 1;
    padding: 0;
    transition: all 0.2s;
  }
  
  .debug-toggle:hover {
    background: rgba(0, 255, 0, 0.2);
  }
  
  .debug-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .debug-item {
    display: flex;
    justify-content: space-between;
    gap: 10px;
  }
  
  .debug-label {
    color: #0f0;
    font-weight: bold;
  }
  
  .debug-value {
    color: #fff;
    font-family: 'Courier New', monospace;
  }
  
  .debug-note {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid rgba(0, 255, 0, 0.3);
    font-size: 11px;
    color: #0f0;
    opacity: 0.8;
  }
  
  .debug-toggle-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.7);
    color: #0f0;
    border: 1px solid #0f0;
    padding: 8px 12px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    z-index: 100;
    transition: all 0.2s;
  }
  
  .debug-toggle-btn:hover {
    background: rgba(0, 255, 0, 0.2);
  }
</style>

