import * as THREE from 'three';
import { RSAKeyGenerator } from '../../../algorithms/rsa.js';

/**
 * Система оружия - публичные ключи
 */
export class WeaponSystem {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.keys = []; // Доступные ключи
    this.selectedKeyIndex = 0;
    this.bullets = []; // Выстреленные ключи
    this.bulletGroup = new THREE.Group();
    scene.add(this.bulletGroup);
    
    // Генерируем начальные ключи
    this.generateKeys(3);
  }
  
  /**
   * Генерация ключей для выбора
   */
  generateKeys(count = 3) {
    this.keys = [];
    
    // Генерируем разные ключи
    const primes = [
      { p: 17, q: 23 },
      { p: 19, q: 29 },
      { p: 31, q: 37 },
      { p: 41, q: 43 },
      { p: 101, q: 103 }
    ];
    
    for (let i = 0; i < count; i++) {
      const primePair = primes[i % primes.length];
      const generator = new RSAKeyGenerator(primePair.p, primePair.q);
      generator.calculateN();
      generator.calculatePhi();
      generator.chooseE(5);
      
      this.keys.push({
        e: 5,
        n: generator.n,
        p: primePair.p,
        q: primePair.q,
        id: `key-${i}`
      });
    }
  }
  
  /**
   * Выбор ключа
   */
  selectKey(index) {
    if (index >= 0 && index < this.keys.length) {
      this.selectedKeyIndex = index;
      return this.keys[index];
    }
    return null;
  }
  
  /**
   * Переключение на следующий ключ
   */
  nextKey() {
    this.selectedKeyIndex = (this.selectedKeyIndex + 1) % this.keys.length;
    return this.keys[this.selectedKeyIndex];
  }
  
  /**
   * Переключение на предыдущий ключ
   */
  prevKey() {
    this.selectedKeyIndex = (this.selectedKeyIndex - 1 + this.keys.length) % this.keys.length;
    return this.keys[this.selectedKeyIndex];
  }
  
  /**
   * Выстрел ключом в направлении цели
   */
  shoot(targetPosition) {
    if (this.keys.length === 0) return null;
    
    const key = this.keys[this.selectedKeyIndex];
    
    // Создаем визуализацию пули
    const bullet = this.createBullet(key, targetPosition);
    this.bullets.push(bullet);
    
    return {
      key: key,
      bullet: bullet
    };
  }
  
  /**
   * Выстрел в направлении камеры (FPS стиль)
   */
  shootInDirection(direction, distance = 50) {
    if (this.keys.length === 0) return null;
    
    const key = this.keys[this.selectedKeyIndex];
    
    // Вычисляем точку выстрела
    const targetPosition = new THREE.Vector3();
    // @ts-ignore
    targetPosition.copy(this.camera.position);
    targetPosition.addScaledVector(direction, distance);
    
    return this.shoot(targetPosition);
  }
  
  /**
   * Создание визуализации пули (ключа) с трейлом
   */
  createBullet(key, targetPosition) {
    const geometry = new THREE.SphereGeometry(0.2, 8, 8);
    const material = new THREE.MeshStandardMaterial({
      color: 0x4a90e2,
      emissive: 0x1a3a5a,
      emissiveIntensity: 0.8
    });
    
    const bullet = new THREE.Mesh(geometry, material);
    // @ts-ignore
    bullet.position.copy(this.camera.position);
    bullet.castShadow = true;
    
    // Создаем трейл (след) для пули
    const trailGeometry = new THREE.BufferGeometry();
    const trailMaterial = new THREE.LineBasicMaterial({
      color: 0x4a90e2,
      transparent: true,
      opacity: 0.6
    });
    
    const trailPoints = [];
    const trailCount = 5;
    // @ts-ignore
    for (let i = 0; i < trailCount; i++) {
      trailPoints.push(this.camera.position.clone());
    }
    trailGeometry.setFromPoints(trailPoints);
    
    const trail = new THREE.Line(trailGeometry, trailMaterial);
    this.bulletGroup.add(trail);
    
    // Сохраняем данные ключа
    bullet.userData.key = key;
    bullet.userData.target = targetPosition;
    bullet.userData.speed = 20.0;
    bullet.userData.lifetime = 2000; // 2 секунды
    bullet.userData.startTime = performance.now();
    bullet.userData.trail = trail;
    bullet.userData.trailPoints = trailPoints;
    bullet.userData.lastPosition = this.camera.position.clone();
    
    this.bulletGroup.add(bullet);
    
    return bullet;
  }
  
  /**
   * Обновление пуль
   */
  update(deltaTime) {
    const currentTime = performance.now();
    
    this.bullets = this.bullets.filter(bullet => {
      const elapsed = currentTime - bullet.userData.startTime;
      
      // Удаляем старые пули
      if (elapsed > bullet.userData.lifetime) {
        this.bulletGroup.remove(bullet);
        if (bullet.geometry) bullet.geometry.dispose();
        if (bullet.material) bullet.material.dispose();
        return false;
      }
      
      // Движение к цели
      if (bullet.userData.target) {
        const direction = new THREE.Vector3();
        direction.subVectors(bullet.userData.target, bullet.position);
        const distance = direction.length();
        
        if (distance > 0.5) {
          direction.normalize();
          // @ts-ignore
          bullet.position.addScaledVector(direction, bullet.userData.speed * deltaTime);
        } else {
          // Достигли цели - удаляем
          this.bulletGroup.remove(bullet);
          if (bullet.geometry) bullet.geometry.dispose();
          if (bullet.material) bullet.material.dispose();
          return false;
        }
      }
      
      // Вращение для эффекта
      bullet.rotation.x += deltaTime * 5;
      bullet.rotation.y += deltaTime * 5;
      
      // Обновление трейла
      if (bullet.userData.trail && bullet.userData.trailPoints) {
        // Добавляем текущую позицию в начало массива
        bullet.userData.trailPoints.unshift(bullet.position.clone());
        // Удаляем последнюю точку
        if (bullet.userData.trailPoints.length > 5) {
          bullet.userData.trailPoints.pop();
        }
        // Обновляем геометрию трейла
        bullet.userData.trail.geometry.setFromPoints(bullet.userData.trailPoints);
      }
      
      return true;
    });
  }
  
  /**
   * Получить текущий выбранный ключ
   */
  getSelectedKey() {
    return this.keys[this.selectedKeyIndex] || null;
  }
  
  /**
   * Получить все ключи
   */
  getKeys() {
    return this.keys;
  }
  
  /**
   * Проверка попадания пули во врага
   */
  checkHit(bullet, enemy) {
    if (!bullet || !enemy || enemy.isDead) return false;
    
    const distance = bullet.position.distanceTo(enemy.mesh.position);
    return distance < 1.0; // Радиус попадания
  }
  
  dispose() {
    this.bullets.forEach(bullet => {
      this.bulletGroup.remove(bullet);
      // @ts-ignore
      if (bullet.geometry) bullet.geometry.dispose();
      // @ts-ignore
      if (bullet.material) bullet.material.dispose();
      
      // Удаляем трейл
      if (bullet.userData.trail) {
        this.bulletGroup.remove(bullet.userData.trail);
        // @ts-ignore
        if (bullet.userData.trail.geometry) bullet.userData.trail.geometry.dispose();
        // @ts-ignore
        if (bullet.userData.trail.material) bullet.userData.trail.material.dispose();
      }
    });
    this.bullets = [];
    
    if (this.bulletGroup) {
      this.scene.remove(this.bulletGroup);
    }
  }
}

