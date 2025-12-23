import * as THREE from 'three';

export class PlayerController {
  constructor(camera, scene) {
    this.camera = camera;
    this.scene = scene;
    
    // Позиция и направление
    this.position = new THREE.Vector3(0, 2, 0);
    this.direction = new THREE.Vector3(0, 0, -1);
    this.velocity = new THREE.Vector3(0, 0, 0);
    
    console.log('🎮 PlayerController: Инициализация');
    console.log(`📍 Начальная позиция: (${this.position.x}, ${this.position.y}, ${this.position.z})`);
    
    // Параметры движения
    this.speed = 5.0;
    this.rotationSpeed = 0.002;
    this.mouseSensitivity = 0.002;
    
    // Параметры прыжка
    this.jumpHeight = 5.0;
    this.gravity = -15.0;
    this.verticalVelocity = 0;
    this.isGrounded = true;
    this.groundY = 2.0; // Высота земли
    
    // Состояние клавиатуры
    this.keys = {};
    this.mouse = { x: 0, y: 0, isLocked: false };
    
    // Углы камеры
    this.yaw = 0; // Горизонтальный поворот
    this.pitch = 0; // Вертикальный поворот
    
    // Границы города
    this.cityBounds = 90; // Половина размера города
    
    // Визуализация персонажа (простой меш)
    this.createPlayerMesh();
    
    // Привязка камеры к персонажу
    this.cameraMode = 'first-person'; // 'first-person' или 'third-person'
    
    this.setupEventListeners();
  }
  
  createPlayerMesh() {
    // Простой цилиндр для визуализации (CapsuleGeometry может быть недоступен)
    const geometry = new THREE.CylinderGeometry(0.5, 0.5, 1.5, 8);
    const material = new THREE.MeshStandardMaterial({ 
      color: 0x4a90e2,
      emissive: 0x1a3a5a,
      emissiveIntensity: 0.3
    });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(this.position);
    this.scene.add(this.mesh);
    console.log('✅ PlayerController: Меш персонажа создан');
  }
  
  setupEventListeners() {
    // Клавиатура
    document.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
    });
    
    document.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
    
    // Мышь
    document.addEventListener('mousedown', (e) => {
      if (e.button === 0) { // Левая кнопка мыши
        this.lockPointer();
      }
    });
    
    document.addEventListener('mousemove', (e) => {
      if (this.mouse.isLocked) {
        const movementX = e.movementX || 0;
        const movementY = e.movementY || 0;
        
        this.yaw -= movementX * this.mouseSensitivity;
        this.pitch -= movementY * this.mouseSensitivity;
        
        // Ограничиваем вертикальный поворот
        this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
      }
    });
    
    document.addEventListener('pointerlockchange', () => {
      this.mouse.isLocked = document.pointerLockElement !== null;
    });
    
    // ESC для выхода из pointer lock
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Escape') {
        document.exitPointerLock();
      }
      
      // Прыжок на Space
      if (e.code === 'Space' && this.isGrounded) {
        this.jump();
      }
    });
  }
  
  lockPointer() {
    const canvas = this.camera.parent || document.body;
    canvas.requestPointerLock();
  }
  
  jump() {
    if (this.isGrounded) {
      this.verticalVelocity = this.jumpHeight;
      this.isGrounded = false;
    }
  }
  
  update(deltaTime) {
    // Обработка движения
    const moveVector = new THREE.Vector3();
    
    // W/S - вперед/назад
    if (this.keys['KeyW']) {
      moveVector.z -= 1;
    }
    if (this.keys['KeyS']) {
      moveVector.z += 1;
    }
    
    // A/D - влево/вправо (strafe)
    if (this.keys['KeyA']) {
      moveVector.x -= 1;
    }
    if (this.keys['KeyD']) {
      moveVector.x += 1;
    }
    
    // Нормализуем вектор движения
    if (moveVector.length() > 0) {
      moveVector.normalize();
      
      // Применяем поворот yaw к вектору движения
      const yawMatrix = new THREE.Matrix4().makeRotationY(this.yaw);
      moveVector.applyMatrix4(yawMatrix);
      
      // Обновляем скорость
      this.velocity.x = moveVector.x * this.speed;
      this.velocity.z = moveVector.z * this.speed;
    } else {
      // Плавное торможение
      this.velocity.x *= 0.8;
      this.velocity.z *= 0.8;
    }
    
    // Физика прыжка
    this.verticalVelocity += this.gravity * deltaTime;
    this.position.y += this.verticalVelocity * deltaTime;
    
    // Проверка приземления
    if (this.position.y <= this.groundY) {
      this.position.y = this.groundY;
      this.verticalVelocity = 0;
      this.isGrounded = true;
    } else {
      this.isGrounded = false;
    }
    
    // Обновляем позицию
    this.position.x += this.velocity.x * deltaTime;
    this.position.z += this.velocity.z * deltaTime;
    
    // Ограничиваем движение в пределах города
    this.position.x = Math.max(-this.cityBounds, Math.min(this.cityBounds, this.position.x));
    this.position.z = Math.max(-this.cityBounds, Math.min(this.cityBounds, this.position.z));
    
    // Обновляем визуализацию персонажа
    this.mesh.position.copy(this.position);
    
    // Обновляем камеру
    this.updateCamera();
  }
  
  updateCamera() {
    if (this.cameraMode === 'first-person') {
      // First-person: камера на уровне глаз персонажа
      this.camera.position.set(
        this.position.x,
        this.position.y + 1.6, // Высота глаз
        this.position.z
      );
      
      // Применяем повороты к камере
      const yawMatrix = new THREE.Matrix4().makeRotationY(this.yaw);
      const pitchMatrix = new THREE.Matrix4().makeRotationX(this.pitch);
      const combinedMatrix = new THREE.Matrix4().multiplyMatrices(yawMatrix, pitchMatrix);
      
      const direction = new THREE.Vector3(0, 0, -1);
      direction.applyMatrix4(combinedMatrix);
      
      this.camera.lookAt(
        this.camera.position.x + direction.x,
        this.camera.position.y + direction.y,
        this.camera.position.z + direction.z
      );
    } else {
      // Third-person: камера позади персонажа
      const distance = 5;
      const height = 3;
      
      const cameraOffset = new THREE.Vector3(0, height, distance);
      const yawMatrix = new THREE.Matrix4().makeRotationY(this.yaw);
      cameraOffset.applyMatrix4(yawMatrix);
      
      this.camera.position.set(
        this.position.x + cameraOffset.x,
        this.position.y + cameraOffset.y,
        this.position.z + cameraOffset.z
      );
      
      this.camera.lookAt(this.position);
    }
  }
  
  dispose() {
    // Очистка при размонтировании
    if (this.mesh) {
      this.scene.remove(this.mesh);
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
    }
    
    document.exitPointerLock();
  }
}

