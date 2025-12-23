import * as THREE from 'three';

// Настройка освещения сцены
export function setupLighting(scene) {
  // Ambient light для общего освещения
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);
  
  // Directional light для теней и глубины
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(50, 100, 50);
  directionalLight.castShadow = true;
  scene.add(directionalLight);
  
  return { ambientLight, directionalLight };
}

// Настройка камеры
export function setupCamera(width, height) {
  const camera = new THREE.PerspectiveCamera(
    75, // FOV
    width / height, // Aspect ratio
    0.1, // Near plane
    1000 // Far plane
  );
  
  // Начальная позиция камеры
  camera.position.set(0, 10, 20);
  camera.lookAt(0, 0, 0);
  
  return camera;
}

// Создание земли/плоскости города
export function createGround(size, color, gridDivisions) {
  const geometry = new THREE.PlaneGeometry(size, size);
  const material = new THREE.MeshStandardMaterial({ 
    color: color,
    roughness: 0.8,
    metalness: 0.2
  });
  const ground = new THREE.Mesh(geometry, material);
  ground.rotation.x = -Math.PI / 2; // Поворачиваем плоскость горизонтально
  ground.receiveShadow = true;
  
  // Добавляем сетку улиц
  const gridHelper = new THREE.GridHelper(size, gridDivisions, 0x444444, 0x444444);
  gridHelper.material.opacity = 0.3;
  gridHelper.material.transparent = true;
  
  return { ground, gridHelper };
}

// Создание базового здания
export function createBuilding(width, height, depth, color) {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const material = new THREE.MeshStandardMaterial({ color });
  const building = new THREE.Mesh(geometry, material);
  building.castShadow = true;
  building.receiveShadow = true;
  return building;
}

