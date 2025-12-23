import * as THREE from 'three';

/**
 * Простая система частиц для эффектов
 */
export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];
  }
  
  /**
   * Создать взрыв частиц при попадании
   */
  createHitEffect(position, color = 0x4a90e2, correct = true) {
    const particleCount = correct ? 20 : 10;
    const colors = correct ? [0x4a90e2, 0x60a5fa, 0x10b981] : [0xff6b6b, 0xff8787, 0xff0000];
    
    for (let i = 0; i < particleCount; i++) {
      const geometry = new THREE.SphereGeometry(0.1, 4, 4);
      const material = new THREE.MeshBasicMaterial({
        color: colors[Math.floor(Math.random() * colors.length)],
        transparent: true,
        opacity: 1
      });
      
      const particle = new THREE.Mesh(geometry, material);
      // @ts-ignore
      particle.position.copy(position);
      
      // Случайная скорость
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 5,
        Math.random() * 3 + 1,
        (Math.random() - 0.5) * 5
      );
      
      particle.userData.velocity = velocity;
      particle.userData.lifetime = 1000; // 1 секунда
      particle.userData.startTime = performance.now();
      
      this.particles.push(particle);
      this.scene.add(particle);
    }
  }
  
  /**
   * Обновление частиц
   */
  update(deltaTime) {
    const currentTime = performance.now();
    
    this.particles = this.particles.filter(particle => {
      const elapsed = currentTime - particle.userData.startTime;
      
      if (elapsed > particle.userData.lifetime) {
        this.scene.remove(particle);
        if (particle.geometry) particle.geometry.dispose();
        if (particle.material) particle.material.dispose();
        return false;
      }
      
      // Движение
      const velocity = particle.userData.velocity;
      // @ts-ignore
      particle.position.addScaledVector(velocity, deltaTime);
      
      // Гравитация
      velocity.y -= 9.8 * deltaTime;
      
      // Затухание
      const progress = elapsed / particle.userData.lifetime;
      particle.material.opacity = 1 - progress;
      particle.scale.setScalar(1 - progress * 0.5);
      
      return true;
    });
  }
  
  dispose() {
    this.particles.forEach(particle => {
      this.scene.remove(particle);
      if (particle.geometry) particle.geometry.dispose();
      if (particle.material) particle.material.dispose();
    });
    this.particles = [];
  }
}

