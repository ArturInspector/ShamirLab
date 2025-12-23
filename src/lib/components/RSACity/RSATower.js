import * as THREE from 'three';
import { Building } from './Building.js';

/**
 * RSA Tower - башня из 7 этажей, каждый этаж = этап RSA
 */
export class RSATower {
  constructor(options = {}) {
    this.position = options.position || new THREE.Vector3(0, 0, 0);
    this.onFloorClick = options.onFloorClick || null;
    
    // Цвета этажей согласно three.js.md
    this.floorColors = {
      1: 0x4F46E5, // Индиго - простые числа
      2: 0x7C3AED, // Фиолетовый - модуль
      3: 0xA855F7, // Пурпурный - функция Эйлера
      4: 0xEC4899, // Розовый - публичный ключ
      5: 0xF43F5E, // Красный - приватный ключ
      6: 0xEF4444, // Алый - шифрование
      7: 0x10B981  // Зеленый - расшифровка (успех!)
    };
    
    this.floorNames = {
      1: 'Простые числа',
      2: 'Модуль n',
      3: 'Функция Эйлера',
      4: 'Публичный ключ',
      5: 'Приватный ключ',
      6: 'Шифрование',
      7: 'Расшифровка'
    };
    
    this.floors = [];
    this.towerGroup = new THREE.Group();
    this.activeFloor = null;
    
    this.createTower();
  }
  
  createTower() {
    const floorWidth = 8;
    const floorDepth = 8;
    const floorHeight = 3;
    const spacing = 0.2; // Расстояние между этажами
    
    // Создаем 7 этажей снизу вверх
    for (let i = 1; i <= 7; i++) {
      const floorY = (i - 1) * (floorHeight + spacing) + floorHeight / 2;
      
      const geometry = new THREE.BoxGeometry(floorWidth, floorHeight, floorDepth);
      const material = new THREE.MeshStandardMaterial({
        color: this.floorColors[i],
        emissive: this.floorColors[i],
        emissiveIntensity: 0.2,
        metalness: 0.3,
        roughness: 0.7
      });
      
      const floor = new THREE.Mesh(geometry, material);
      // @ts-ignore
      floor.position.set(
        this.position.x,
        this.position.y + floorY,
        this.position.z
      );
      
      floor.castShadow = true;
      floor.receiveShadow = true;
      
      // Сохраняем данные этажа
      floor.userData.floorNumber = i;
      floor.userData.floorName = this.floorNames[i];
      floor.userData.floorColor = this.floorColors[i];
      floor.userData.isFloor = true;
      floor.userData.tower = this;
      
      // Добавляем небольшую анимацию появления
      floor.scale.set(0, 0, 0);
      
      this.floors.push(floor);
      this.towerGroup.add(floor);
      
      // Анимация появления с задержкой
      setTimeout(() => {
        this.animateFloorAppearance(floor);
      }, i * 100);
    }
    
    // Позиционируем группу
    // @ts-ignore
    this.towerGroup.position.copy(this.position);
  }
  
  animateFloorAppearance(floor) {
    const startTime = performance.now();
    const duration = 500; // 500ms
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const eased = 1 - Math.pow(1 - progress, 3);
      
      floor.scale.set(eased, eased, eased);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }
  
  /**
   * Подсветка этажа при наведении
   */
  setFloorHovered(floorNumber, hovered) {
    const floor = this.floors[floorNumber - 1];
    if (!floor) return;
    
    if (hovered) {
      floor.material.emissiveIntensity = 0.5;
      floor.material.emissive.setHex(floor.userData.floorColor);
      floor.scale.set(1.1, 1.1, 1.1);
    } else {
      floor.material.emissiveIntensity = 0.2;
      floor.scale.set(1, 1, 1);
    }
  }
  
  /**
   * Активация этажа (клик)
   */
  activateFloor(floorNumber) {
    // Сбрасываем предыдущий активный этаж
    if (this.activeFloor !== null && this.activeFloor !== floorNumber) {
      const prevFloor = this.floors[this.activeFloor - 1];
      if (prevFloor) {
        prevFloor.material.emissiveIntensity = 0.2;
      }
    }
    
    this.activeFloor = floorNumber;
    const floor = this.floors[floorNumber - 1];
    
    if (floor) {
      // Яркая подсветка активного этажа
      floor.material.emissiveIntensity = 0.8;
      
      // Небольшая анимация пульсации
      this.animateFloorPulse(floor);
      
      if (this.onFloorClick) {
        this.onFloorClick(floorNumber, floor.userData);
      }
    }
  }
  
  animateFloorPulse(floor) {
    const startScale = 1;
    const pulseScale = 1.15;
    const duration = 300;
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Sinusoidal pulse
      const pulse = Math.sin(progress * Math.PI * 2) * 0.1;
      const scale = startScale + pulse;
      
      floor.scale.set(scale, scale, scale);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        floor.scale.set(1, 1, 1);
      }
    };
    
    requestAnimationFrame(animate);
  }
  
  /**
   * Получить группу для добавления в сцену
   */
  getGroup() {
    return this.towerGroup;
  }
  
  dispose() {
    this.floors.forEach(floor => {
      if (floor.geometry) floor.geometry.dispose();
      if (floor.material) floor.material.dispose();
    });
    this.floors = [];
  }
}

