<script>
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';
  import { setupLighting, setupCamera, createGround } from '../../utils/three-helpers.js';
  import { cityConfig } from '../../utils/city-config.js';
  import { PlayerController } from './PlayerController.js';
  import { RSATower } from './RSATower.js';
  import { Building } from './Building.js';
  
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
  
  // Интерактивность
  let raycaster = null;
  let mouse = new THREE.Vector2(0, 0);
  let hoveredObject = null;
  let selectedBuilding = null;
  let rsaTower = null;
  let buildings = [];
  let showBuildingInfo = false;
  let buildingInfo = { name: '', description: '' };
  
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
    
    // Инициализация raycasting для интерактивности
    // @ts-ignore - Raycaster constructor is fine
    raycaster = new THREE.Raycaster();
    console.log('✅ Raycaster инициализирован');
    
    // Создание RSA Tower
    console.log('🏗️ Создание RSA Tower...');
    rsaTower = new RSATower({
      position: new THREE.Vector3(0, 0, 0),
      onFloorClick: (floorNumber, floorData) => {
        console.log(`🏢 Клик на этаж ${floorNumber}: ${floorData.floorName}`);
        buildingInfo = {
          name: `Этаж ${floorNumber}: ${floorData.floorName}`,
          description: `Этап ${floorNumber} процесса RSA шифрования`,
          floorNumber: floorNumber
        };
        showBuildingInfo = true;
        
        // Переход к соответствующему этапу RSA
        setTimeout(() => {
          window.location.hash = `#/rsa`;
          // Можно добавить логику для установки currentStep в RSAVisualization
        }, 500);
      }
    });
    scene.add(rsaTower.getGroup());
    console.log('✅ RSA Tower создана в центре');
    
    // Создание других зданий
    console.log('🏗️ Создание других зданий...');
    
    // Hash Factory
    const hashFactory = new Building({
      id: 'hash-factory',
      name: 'Hash Factory',
      position: new THREE.Vector3(30, 0, 30),
      size: { width: 6, height: 12, depth: 6 },
      color: 0xe24a4a,
      hoverColor: 0xff6b6b,
      metadata: { type: 'hash', route: '#/sha256' },
      onEnter: (building) => {
        console.log(`🚪 Вход в ${building.name}`);
        window.location.hash = building.metadata.route;
      }
    });
    // @ts-ignore - Mesh is Object3D
    scene.add(hashFactory.mesh);
    buildings.push(hashFactory);
    
    // Game Arena
    const gameArena = new Building({
      id: 'game-arena',
      name: 'Game Arena',
      position: new THREE.Vector3(-30, 0, 30),
      size: { width: 7, height: 10, depth: 7 },
      color: 0x4ae24a,
      hoverColor: 0x6bff6b,
      metadata: { type: 'game', route: '#/key-game' },
      onEnter: (building) => {
        window.location.hash = building.metadata.route;
      }
    });
    // @ts-ignore
    scene.add(gameArena.mesh);
    buildings.push(gameArena);
    
    // Library
    const library = new Building({
      id: 'library',
      name: 'Library',
      position: new THREE.Vector3(30, 0, -30),
      size: { width: 8, height: 14, depth: 8 },
      color: 0xe2e24a,
      hoverColor: 0xffff6b,
      metadata: { type: 'library', route: '#/faq-crypto' },
      onEnter: (building) => {
        window.location.hash = building.metadata.route;
      }
    });
    // @ts-ignore
    scene.add(library.mesh);
    buildings.push(library);
    
    // Alice & Bob Building
    const aliceBob = new Building({
      id: 'alice-bob',
      name: 'Alice & Bob',
      position: new THREE.Vector3(-30, 0, -30),
      size: { width: 6, height: 11, depth: 6 },
      color: 0xe24ae2,
      hoverColor: 0xff6bff,
      metadata: { type: 'alice-bob' },
      onEnter: (building) => {
        // Можно добавить специальную логику для Alice & Bob
        console.log('Вход в Alice & Bob Building');
      }
    });
    // @ts-ignore
    scene.add(aliceBob.mesh);
    buildings.push(aliceBob);
    
    console.log(`✅ Создано ${buildings.length} зданий`);
    
    console.log(`📊 Всего объектов в сцене: ${scene.children.length}`);
    console.log('📋 Детали сцены:', {
      children: scene.children.map(c => c.type),
      fog: scene.fog ? 'есть' : 'нет',
      background: scene.background
    });
    
    // Создание контроллера игрока
    playerController = new PlayerController(camera, scene);
    console.log('✅ PlayerController создан');
    
    // Обработка мыши для raycasting
    const handleMouseMove = (event) => {
      if (!container || !camera || !renderer) return;
      
      // Нормализуем координаты мыши (-1 до +1)
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    
    const handleClick = (event) => {
      if (!raycaster || !camera || !scene) return;
      
      // Обновляем raycasting
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);
      
      if (intersects.length > 0) {
        const intersected = intersects[0].object;
        
        // Проверяем, это этаж башни?
        if (intersected.userData.isFloor) {
          const floorNumber = intersected.userData.floorNumber;
          rsaTower.activateFloor(floorNumber);
          return;
        }
        
        // Проверяем, это здание?
        if (intersected.userData.building) {
          const building = intersected.userData.building;
          building.enter();
          return;
        }
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);
    
    // Проверка близости к зданиям для автоматического входа
    const checkBuildingProximity = () => {
      if (!playerController || buildings.length === 0) return;
      
      const playerPos = playerController.position;
      const triggerDistance = 5; // Расстояние для автоматического входа
      
      for (const building of buildings) {
        const zone = building.getTriggerZone();
        const distance = playerPos.distanceTo(zone.center);
        
        if (distance < triggerDistance) {
          // Показываем подсказку о входе
          if (!showBuildingInfo || buildingInfo.name !== building.name) {
            buildingInfo = {
              name: building.name,
              description: `Нажмите E для входа`,
              building: building
            };
            showBuildingInfo = true;
          }
        } else {
          if (showBuildingInfo && buildingInfo.building === building) {
            showBuildingInfo = false;
          }
        }
      }
    };
    
    // Обработка клавиши E для входа
    const handleKeyPress = (event) => {
      if (event.code === 'KeyE' && showBuildingInfo && buildingInfo.building) {
        buildingInfo.building.enter();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    
    // Сохраняем обработчики для очистки
    const cleanupHandlers = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleKeyPress);
    };
    
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
        
        // Raycasting для определения наведения на объекты
        if (raycaster && camera) {
          raycaster.setFromCamera(mouse, camera);
          const intersects = raycaster.intersectObjects(scene.children, true);
          
          // Сбрасываем предыдущее наведение
          if (hoveredObject) {
            if (hoveredObject.userData.isFloor && rsaTower) {
              rsaTower.setFloorHovered(hoveredObject.userData.floorNumber, false);
            } else if (hoveredObject.userData.building) {
              hoveredObject.userData.building.setHovered(false);
            }
            hoveredObject = null;
          }
          
          // Проверяем новое наведение
          if (intersects.length > 0) {
            const intersected = intersects[0].object;
            
            if (intersected.userData.isFloor && rsaTower) {
              const floorNumber = intersected.userData.floorNumber;
              rsaTower.setFloorHovered(floorNumber, true);
              hoveredObject = intersected;
            } else if (intersected.userData.building) {
              intersected.userData.building.setHovered(true);
              hoveredObject = intersected;
            }
          }
        }
        
        // Проверка близости к зданиям
        if (buildings.length > 0) {
          const playerPos = playerController.position;
          const triggerDistance = 5;
          
          let nearBuilding = null;
          for (const building of buildings) {
            const zone = building.getTriggerZone();
            const distance = playerPos.distanceTo(zone.center);
            
            if (distance < triggerDistance) {
              nearBuilding = building;
              break;
            }
          }
          
          if (nearBuilding) {
            if (!showBuildingInfo || buildingInfo.building !== nearBuilding) {
              buildingInfo = {
                name: nearBuilding.name,
                description: 'Нажмите E для входа',
                building: nearBuilding
              };
              showBuildingInfo = true;
            }
          } else {
            if (showBuildingInfo && buildingInfo.building) {
              showBuildingInfo = false;
            }
          }
        }
        
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
      cleanupHandlers();
    };
  });
  
  onDestroy(() => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    
    if (playerController) {
      playerController.dispose();
    }
    
    // Очистка зданий
    buildings.forEach(building => building.dispose());
    buildings = [];
    
    if (rsaTower) {
      rsaTower.dispose();
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
  
  {#if showBuildingInfo}
    <div class="building-info">
      <div class="building-info-content">
        <h3>{buildingInfo.name}</h3>
        <p>{buildingInfo.description}</p>
        {#if buildingInfo.building}
          <div class="building-hint">Нажмите <kbd>E</kbd> для входа</div>
        {/if}
        <button class="close-info" on:click={() => showBuildingInfo = false}>×</button>
      </div>
    </div>
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
  
  .building-info {
    position: absolute;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 200;
    animation: slideUp 0.3s ease;
  }
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }
  
  .building-info-content {
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 20px 30px;
    border-radius: 12px;
    border: 2px solid var(--accent-blue, #4a90e2);
    min-width: 300px;
    max-width: 500px;
    position: relative;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10px);
  }
  
  .building-info-content h3 {
    margin: 0 0 10px 0;
    color: var(--accent-blue, #4a90e2);
    font-size: 1.3rem;
  }
  
  .building-info-content p {
    margin: 0 0 10px 0;
    color: #ccc;
    font-size: 0.95rem;
  }
  
  .building-hint {
    margin-top: 10px;
    padding: 8px 12px;
    background: rgba(74, 144, 226, 0.2);
    border-radius: 6px;
    font-size: 0.9rem;
    color: #4a90e2;
  }
  
  .building-hint kbd {
    background: rgba(74, 144, 226, 0.3);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: monospace;
    font-weight: bold;
  }
  
  .close-info {
    position: absolute;
    top: 10px;
    right: 10px;
    background: transparent;
    border: 1px solid #666;
    color: #ccc;
    width: 24px;
    height: 24px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 18px;
    line-height: 1;
    padding: 0;
    transition: all 0.2s;
  }
  
  .close-info:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: #999;
  }
</style>

