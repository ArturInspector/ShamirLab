import * as THREE from 'three';

/**
 * Базовый класс для интерактивных зданий
 */
export class Building {
  constructor(options = {}) {
    this.id = options.id || `building-${Date.now()}`;
    this.name = options.name || 'Building';
    this.position = options.position || new THREE.Vector3(0, 0, 0);
    this.size = options.size || { width: 5, height: 10, depth: 5 };
    this.color = options.color || 0x4a90e2;
    this.mesh = null;
    this.originalColor = this.color;
    this.hoverColor = options.hoverColor || 0x60a5fa; // Более яркий цвет при наведении
    this.isHovered = false;
    this.onEnter = options.onEnter || null; // Callback при входе
    this.onHover = options.onHover || null; // Callback при наведении
    this.metadata = options.metadata || {}; // Дополнительные данные
    
    this.createMesh();
  }
  
  createMesh() {
    const geometry = new THREE.BoxGeometry(
      this.size.width,
      this.size.height,
      this.size.depth
    );
    const material = new THREE.MeshStandardMaterial({
      color: this.color,
      emissive: this.color,
      emissiveIntensity: 0.1
    });
    
    this.mesh = new THREE.Mesh(geometry, material);
    // @ts-ignore
    this.mesh.position.copy(this.position);
    // @ts-ignore
    this.mesh.position.y = this.size.height / 2; // Поднимаем здание так, чтобы оно стояло на земле
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    
    // Сохраняем ссылку на Building в userData для raycasting
    this.mesh.userData.building = this;
  }
  
  /**
   * Подсветка при наведении
   */
  setHovered(hovered) {
    if (this.isHovered === hovered) return;
    
    this.isHovered = hovered;
    
    if (this.mesh && this.mesh.material) {
      if (hovered) {
        this.mesh.material.color.setHex(this.hoverColor);
        this.mesh.material.emissive.setHex(this.hoverColor);
        this.mesh.material.emissiveIntensity = 0.3;
        // Небольшое увеличение для эффекта
        this.mesh.scale.set(1.05, 1.05, 1.05);
      } else {
        this.mesh.material.color.setHex(this.originalColor);
        this.mesh.material.emissive.setHex(this.originalColor);
        this.mesh.material.emissiveIntensity = 0.1;
        this.mesh.scale.set(1, 1, 1);
      }
    }
    
    if (this.onHover) {
      this.onHover(hovered, this);
    }
  }
  
  /**
   * Обработка входа в здание
   */
  enter() {
    console.log(`🚪 Вход в здание: ${this.name}`);
    if (this.onEnter) {
      this.onEnter(this);
    }
  }
  
  /**
   * Получить позицию для триггера входа (зона вокруг здания)
   */
  getTriggerZone() {
    const radius = Math.max(this.size.width, this.size.depth) / 2 + 3; // +3 единицы вокруг
    return {
      center: this.position,
      radius: radius
    };
  }
  
  dispose() {
    if (this.mesh) {
      if (this.mesh.geometry) this.mesh.geometry.dispose();
      if (this.mesh.material) {
        if (Array.isArray(this.mesh.material)) {
          this.mesh.material.forEach(m => m.dispose());
        } else {
          this.mesh.material.dispose();
        }
      }
    }
  }
}

