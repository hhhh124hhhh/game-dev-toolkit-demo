/**
 * VisualEffects - 视觉反馈效果系统
 * 提供粒子效果、屏幕震动、闪光等视觉反馈
 */

import * as THREE from 'three';
import { UI_CONFIG } from '../config/ui.config.js';

export class VisualEffects {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];
    this.activeEffects = new Map();
  }

  /**
   * 创建收集物品的粒子效果
   * @param {Object} position - {x, y, z} 位置
   * @param {string} type - 粒子类型: 'coin', 'star', 'gem'
   */
  createCollectEffect(position, type = 'coin') {
    const configs = {
      coin: {
        color: UI_CONFIG.colors.accent,
        count: 8,
        size: 0.1,
        speed: 0.05
      },
      star: {
        color: '#ffffff',
        count: 12,
        size: 0.08,
        speed: 0.08
      },
      gem: {
        color: UI_CONFIG.colors.secondary,
        count: 6,
        size: 0.12,
        speed: 0.04
      }
    };

    const config = configs[type] || configs.coin;

    // 创建粒子
    for (let i = 0; i < config.count; i++) {
      const particle = this.createParticle(position, config);
      this.particles.push(particle);
    }

    // 播放收集音效（如果有）
    this.playCollectSound(type);
  }

  /**
   * 创建单个粒子
   */
  createParticle(position, config) {
    const geometry = new THREE.BoxGeometry(config.size, config.size, config.size);
    const material = new THREE.MeshBasicMaterial({
      color: config.color,
      transparent: true,
      opacity: 1
    });

    const particle = new THREE.Mesh(geometry, material);
    
    // 设置初始位置
    particle.position.set(
      position.x + (Math.random() - 0.5) * 0.5,
      position.y + (Math.random() - 0.5) * 0.5,
      position.z + (Math.random() - 0.5) * 0.5
    );

    // 设置速度（向外扩散）
    const angle = Math.random() * Math.PI * 2;
    const speed = config.speed * (0.5 + Math.random() * 0.5);
    particle.userData.velocity = {
      x: Math.cos(angle) * speed,
      y: Math.abs(Math.sin(angle) * speed) + 0.02, // 向上飘
      z: Math.sin(angle) * speed
    };

    // 生命周期
    particle.userData.life = 1.0;
    particle.userData.decay = 0.02 + Math.random() * 0.02;

    this.scene.third.scene.add(particle);
    
    return particle;
  }

  /**
   * 创建跳跃效果
   * @param {Object} position - 跳跃位置
   */
  createJumpEffect(position) {
    // 地面冲击波
    const ringGeometry = new THREE.RingGeometry(0.1, 0.3, 16);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: UI_CONFIG.colors.ground,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide
    });

    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.set(position.x, position.y + 0.05, position.z);
    ring.rotation.x = -Math.PI / 2;

    this.scene.third.scene.add(ring);

    // 扩散动画
    const expandTween = this.scene.tweens.add({
      targets: ring.scale,
      x: 3,
      y: 3,
      duration: 300,
      ease: 'Power2'
    });

    const fadeTween = this.scene.tweens.add({
      targets: ringMaterial,
      opacity: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        this.scene.third.scene.remove(ring);
        ring.geometry.dispose();
        ringMaterial.dispose();
      }
    });
  }

  /**
   * 创建着陆效果
   */
  createLandEffect(position) {
    // 尘土粒子
    for (let i = 0; i < 6; i++) {
      const dust = this.createDustParticle(position);
      this.particles.push(dust);
    }
  }

  /**
   * 创建尘土粒子
   */
  createDustParticle(position) {
    const geometry = new THREE.PlaneGeometry(0.15, 0.15);
    const material = new THREE.MeshBasicMaterial({
      color: 0xaaaaaa,
      transparent: true,
      opacity: 0.4
    });

    const particle = new THREE.Mesh(geometry, material);
    
    particle.position.set(
      position.x + (Math.random() - 0.5) * 0.8,
      position.y + 0.1,
      position.z + (Math.random() - 0.5) * 0.8
    );

    particle.rotation.z = Math.random() * Math.PI;

    particle.userData.velocity = {
      x: (Math.random() - 0.5) * 0.02,
      y: 0.01 + Math.random() * 0.02,
      z: (Math.random() - 0.5) * 0.02
    };

    particle.userData.life = 1.0;
    particle.userData.decay = 0.015;
    particle.userData.rotationSpeed = (Math.random() - 0.5) * 0.1;

    this.scene.third.scene.add(particle);
    
    return particle;
  }

  /**
   * 屏幕闪光效果
   * @param {string} color - 闪光颜色
   * @param {number} duration - 持续时间(ms)
   * @param {number} intensity - 强度(0-1)
   */
  screenFlash(color = '#ffffff', duration = 200, intensity = 0.3) {
    const flash = this.scene.add.rectangle(
      this.scene.cameras.main.width / 2,
      this.scene.cameras.main.height / 2,
      this.scene.cameras.main.width,
      this.scene.cameras.main.height,
      parseInt(color.replace('#', '0x')),
      intensity
    );

    flash.setScrollFactor(0);
    flash.setDepth(1000);

    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: duration,
      ease: 'Power2',
      onComplete: () => {
        flash.destroy();
      }
    });
  }

  /**
   * 播放收集音效
   */
  playCollectSound(type) {
    // 这里可以添加音效播放逻辑
    // 例如: this.scene.sound.play(`collect_${type}`);
  }

  /**
   * 更新所有粒子
   */
  update() {
    // 更新收集粒子
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      if (!particle || !particle.userData) {
        this.particles.splice(i, 1);
        continue;
      }

      // 更新位置
      particle.position.x += particle.userData.velocity.x;
      particle.position.y += particle.userData.velocity.y;
      particle.position.z += particle.userData.velocity.z;

      // 更新旋转
      if (particle.userData.rotationSpeed) {
        particle.rotation.z += particle.userData.rotationSpeed;
      }

      // 更新生命周期
      particle.userData.life -= particle.userData.decay;
      
      // 更新透明度
      if (particle.material) {
        particle.material.opacity = Math.max(0, particle.userData.life * 0.6);
      }

      // 移除死亡的粒子
      if (particle.userData.life <= 0) {
        this.scene.third.scene.remove(particle);
        if (particle.geometry) particle.geometry.dispose();
        if (particle.material) particle.material.dispose();
        this.particles.splice(i, 1);
      }
    }
  }

  /**
   * 清理所有效果
   */
  destroy() {
    // 清理所有粒子
    this.particles.forEach(particle => {
      if (particle) {
        this.scene.third.scene.remove(particle);
        if (particle.geometry) particle.geometry.dispose();
        if (particle.material) particle.material.dispose();
      }
    });
    this.particles = [];

    // 清理活跃效果
    this.activeEffects.clear();
  }
}