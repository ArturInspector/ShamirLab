import * as THREE from 'three';
import { RSAKeyGenerator, rsaEncrypt } from '../../../algorithms/rsa.js';

/**
 * Враг = зашифрованное сообщение
 * Нужно подобрать правильный ключ для расшифровки
 */
export class Enemy {
  constructor(options = {}) {
    this.id = `enemy-${Date.now()}-${Math.random()}`;
    this.type = options.type || 'drone'; // 'drone', 'soldier', 'boss'
    this.position = options.position || new THREE.Vector3(0, 0, 0);
    this.target = options.target || null; // RSA Tower
    this.speed = options.speed || 2.0;
    this.health = options.health || 100;
    this.maxHealth = this.health;
    
    // Криптографические данные
    this.p = options.p || 17;
    this.q = options.q || 23;
    this.message = options.message || Math.floor(Math.random() * 100) + 1;
    
    // Генерируем ключи для этого врага
    const generator = new RSAKeyGenerator(this.p, this.q);
    generator.calculateN();
    generator.calculatePhi();
    generator.chooseE(5); // Используем e=5 по умолчанию
    const dResult = generator.calculateD();
    
    this.publicKey = { e: 5, n: generator.n };
    this.privateKey = { d: dResult.d, n: generator.n };
    
    // Шифруем сообщение
    const encryptResult = rsaEncrypt(this.message, this.publicKey);
    this.ciphertext = encryptResult.ciphertext;
    
    // Визуализация
    this.mesh = null;
    this.healthBar = null;
    this.createMesh();
    
    // Состояние
    this.isDead = false;
    this.damageTaken = 0;
  }
  
  createMesh() {
    // Размер зависит от типа
    const sizes = {
      drone: { width: 1, height: 1.5, depth: 1 },
      soldier: { width: 1.5, height: 2, depth: 1.5 },
      boss: { width: 2.5, height: 3, depth: 2.5 }
    };
    
    const size = sizes[this.type] || sizes.drone;
    const colors = {
      drone: 0xff6b6b,
      soldier: 0xff8787,
      boss: 0xff0000
    };
    
    const geometry = new THREE.BoxGeometry(size.width, size.height, size.depth);
    const material = new THREE.MeshStandardMaterial({
      color: colors[this.type],
      emissive: colors[this.type],
      emissiveIntensity: 0.3
    });
    
    this.mesh = new THREE.Mesh(geometry, material);
    // @ts-ignore
    this.mesh.position.copy(this.position);
    // @ts-ignore
    this.mesh.position.y = size.height / 2;
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    
    // Сохраняем ссылку на Enemy
    this.mesh.userData.enemy = this;
    
    // Инициализируем userData для врага
    if (!this.userData) {
      this.userData = {};
    }
    this.userData.killedByCorrectKey = undefined; // Пока не определено
    
    // Создаем health bar
    this.createHealthBar();
  }
  
  createHealthBar() {
    const barWidth = 2;
    const barHeight = 0.2;
    
    // Фон (черный)
    const bgGeometry = new THREE.PlaneGeometry(barWidth, barHeight);
    const bgMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x000000,
      transparent: true,
      opacity: 0.8
    });
    const bg = new THREE.Mesh(bgGeometry, bgMaterial);
    
    // Здоровье (зеленый)
    const healthGeometry = new THREE.PlaneGeometry(barWidth, barHeight);
    const healthMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x00ff00,
      transparent: true,
      opacity: 0.9
    });
    this.healthBar = new THREE.Mesh(healthGeometry, healthMaterial);
    this.healthBar.position.set(0, 0, 0.01); // Небольшое смещение вперед
    
    // Группа для health bar
    this.healthBarGroup = new THREE.Group();
    this.healthBarGroup.add(bg);
    this.healthBarGroup.add(this.healthBar);
    // @ts-ignore
    this.healthBarGroup.position.copy(this.mesh.position);
    // @ts-ignore
    this.healthBarGroup.position.y += 1.5;
  }
  
  /**
   * Обновление позиции - движение к цели
   */
  update(deltaTime, camera = null) {
    if (this.isDead || !this.target) return;
    
    // Движение к цели
    const direction = new THREE.Vector3();
    direction.subVectors(this.target, this.mesh.position);
    direction.normalize();
    
    const moveDistance = this.speed * deltaTime;
    // @ts-ignore
    this.mesh.position.addScaledVector(direction, moveDistance);
    
    // Обновляем health bar
    if (this.healthBarGroup) {
      // @ts-ignore
      this.healthBarGroup.position.copy(this.mesh.position);
      // @ts-ignore
      this.healthBarGroup.position.y += 1.5;
      
      // Billboard эффект - health bar всегда смотрит на камеру
      if (camera) {
        // @ts-ignore
        this.healthBarGroup.lookAt(camera.position);
      }
      
      // Обновляем размер health bar
      const healthPercent = this.health / this.maxHealth;
      this.healthBar.scale.x = healthPercent;
      this.healthBar.position.x = -(1 - healthPercent); // Смещаем влево при уменьшении
      
      // Меняем цвет при низком здоровье
      if (healthPercent < 0.3) {
        this.healthBar.material.color.setHex(0xff0000);
      } else if (healthPercent < 0.6) {
        this.healthBar.material.color.setHex(0xffff00);
      } else {
        this.healthBar.material.color.setHex(0x00ff00);
      }
    }
    
    // Поворот к цели
    if (direction.length() > 0) {
      this.mesh.lookAt(this.target);
    }
  }
  
  /**
   * Попытка расшифровки ключом
   * @param {Object} publicKey - {e, n}
   * @returns {boolean} - true если ключ правильный
   */
  tryDecrypt(publicKey) {
    // Проверяем, подходит ли ключ
    if (publicKey.n === this.publicKey.n && publicKey.e === this.publicKey.e) {
      // Правильный ключ - враг умирает
      this.userData.killedByCorrectKey = true; // Отмечаем, что убит правильным ключом
      this.takeDamage(this.health); // Убиваем сразу
      return true;
    }
    
    // Неправильный ключ - небольшой урон
    this.userData.killedByCorrectKey = false; // Отмечаем, что не правильным ключом
    this.takeDamage(10);
    return false;
  }
  
  /**
   * Получить урон
   */
  takeDamage(amount) {
    this.health -= amount;
    this.damageTaken += amount;
    
    if (this.health <= 0) {
      this.die();
    }
  }
  
  /**
   * Смерть врага
   */
  die() {
    if (this.isDead) return; // Уже мертв
    
    // Инициализируем userData если его нет
    if (!this.userData) {
      this.userData = {};
    }
    
    // Если не было установлено, считаем что не правильным ключом (достиг башни и т.д.)
    if (this.userData.killedByCorrectKey === undefined) {
      this.userData.killedByCorrectKey = false;
    }
    
    this.isDead = true;
    // Анимация смерти (можно добавить позже)
    if (this.mesh) {
      // Простое исчезновение
      const startTime = performance.now();
      const duration = 300;
      
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        this.mesh.scale.set(1 - progress, 1 - progress, 1 - progress);
        this.mesh.material.opacity = 1 - progress;
        this.mesh.material.transparent = true;
        
        if (this.healthBarGroup) {
          this.healthBarGroup.scale.set(1 - progress, 1 - progress, 1 - progress);
        }
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }
  
  /**
   * Получить данные для UI
   */
  getUIData() {
    return {
      ciphertext: this.ciphertext,
      publicKey: this.publicKey,
      type: this.type,
      health: this.health,
      maxHealth: this.maxHealth
    };
  }
  
  /**
   * Расстояние до цели
   */
  getDistanceToTarget() {
    if (!this.target) return Infinity;
    return this.mesh.position.distanceTo(this.target);
  }
  
  dispose() {
    if (this.mesh) {
      if (this.mesh.geometry) this.mesh.geometry.dispose();
      if (this.mesh.material) this.mesh.material.dispose();
    }
    if (this.healthBarGroup) {
      this.healthBarGroup.children.forEach(child => {
        // @ts-ignore
        if (child.geometry) child.geometry.dispose();
        // @ts-ignore
        if (child.material) child.material.dispose();
      });
    }
  }
}

