/**
 * Scene 1: African Child Planting Seedling
 * Duration: 2000ms (0-2s)
 * 
 * This scene shows a simple animated character planting a seedling,
 * representing grassroots conservation efforts.
 * Enhanced with particle effects, smooth easing, and visual depth.
 */

import { Container, Graphics, BlurFilter } from 'pixi.js';
import type { SceneConfig } from '../../../types';
import { easeInOutCubic, easeOutQuad, interpolate } from './easingFunctions';

// Color palette
const COLORS = {
  brown: 0x8B4513,
  darkBrown: 0x654321,
  green: 0x228B22,
  lightGreen: 0x90EE90,
  skinTone: 0x8D5524,
  soil: 0x6B4423,
  sky: 0xE8F4F8,
  sunlight: 0xFFF8DC,
  shadow: 0x000000,
};

// Particle interface
interface Particle {
  graphics: Graphics;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

/**
 * Creates Scene 1 configuration
 */
export function createScene1(): SceneConfig {
  let child: Graphics;
  let childShadow: Graphics;
  let seedling: Graphics;
  let seedlingShadow: Graphics;
  let soilParticles: Particle[] = [];
  let background: Graphics;
  let sunGlow: Graphics;

  return {
    duration: 2000,
    startTime: 0,
    endTime: 2000,

    setup: (container: Container) => {
      const width = container.width || window.innerWidth;
      const height = container.height || window.innerHeight;
      const centerX = width / 2;
      const centerY = height / 2;

      // Create gradient background with depth
      background = new Graphics();
      // Sky gradient (top to bottom)
      const gradientSteps = 20;
      for (let i = 0; i < gradientSteps; i++) {
        const y = (height / gradientSteps) * i;
        const h = height / gradientSteps;
        const t = i / gradientSteps;
        // Interpolate from light sky blue to warm earth tone
        const r = Math.round(232 + (139 - 232) * t);
        const g = Math.round(244 + (195 - 244) * t);
        const b = Math.round(248 + (154 - 248) * t);
        const color = (r << 16) | (g << 8) | b;
        background.rect(0, y, width, h);
        background.fill({ color, alpha: 1 });
      }
      container.addChild(background);

      // Add sun glow effect
      sunGlow = new Graphics();
      sunGlow.circle(width * 0.8, height * 0.2, 60);
      sunGlow.fill({ color: COLORS.sunlight, alpha: 0.3 });
      sunGlow.filters = [new BlurFilter({ strength: 20 })];
      container.addChild(sunGlow);

      // Create child character (hand-drawn style)
      child = new Graphics();
      
      // Head (hand-drawn circle)
      const headSegments = 16;
      const headRadius = 15;
      child.moveTo(headRadius, -30);
      for (let i = 0; i <= headSegments; i++) {
        const angle = (i / headSegments) * Math.PI * 2;
        const radiusVar = headRadius + (Math.random() - 0.5) * 1.5;
        const x = Math.cos(angle) * radiusVar;
        const y = -30 + Math.sin(angle) * radiusVar;
        child.lineTo(x, y);
      }
      child.fill(COLORS.skinTone);
      child.stroke({ width: 2, color: COLORS.darkBrown, alpha: 0.5 });
      
      // Body (hand-drawn rounded rectangle)
      child.moveTo(-10, -15);
      child.lineTo(-10 + Math.random() * 2, -5);
      child.lineTo(-10 + Math.random() * 2, 5);
      child.lineTo(-10 + Math.random() * 2, 15);
      child.lineTo(-5, 15 + Math.random() * 2);
      child.lineTo(0, 15 + Math.random() * 2);
      child.lineTo(5, 15 + Math.random() * 2);
      child.lineTo(10, 15);
      child.lineTo(10 + Math.random() * 2, 5);
      child.lineTo(10 + Math.random() * 2, -5);
      child.lineTo(10 + Math.random() * 2, -15);
      child.lineTo(5, -15);
      child.lineTo(0, -15);
      child.lineTo(-5, -15);
      child.lineTo(-10, -15);
      child.fill(COLORS.brown);
      child.stroke({ width: 2, color: COLORS.darkBrown, alpha: 0.5 });
      
      // Arms (sketchy lines)
      child.moveTo(-10, -10);
      child.lineTo(-15, -2);
      child.lineTo(-20, 5);
      child.stroke({ width: 3, color: COLORS.skinTone });
      
      child.moveTo(10, -10);
      child.lineTo(15, -2);
      child.lineTo(20, 5);
      child.stroke({ width: 3, color: COLORS.skinTone });
      
      // Legs (sketchy lines)
      child.moveTo(-5, 15);
      child.lineTo(-6, 25);
      child.lineTo(-8, 35);
      child.stroke({ width: 4, color: COLORS.brown });
      
      child.moveTo(5, 15);
      child.lineTo(7, 25);
      child.lineTo(8, 35);
      child.stroke({ width: 4, color: COLORS.brown });

      // Create child shadow
      childShadow = new Graphics();
      childShadow.ellipse(0, 0, 25, 8);
      childShadow.fill({ color: COLORS.shadow, alpha: 0.2 });
      childShadow.filters = [new BlurFilter({ strength: 4 })];
      childShadow.x = centerX;
      childShadow.y = centerY + 60;
      container.addChild(childShadow);

      // Position child in center (responsive)
      child.x = centerX;
      child.y = centerY + 20;
      container.addChild(child);

      // Create seedling (hand-drawn style)
      seedling = new Graphics();
      
      // Stem (slightly wavy)
      seedling.moveTo(0, 0);
      seedling.lineTo(-0.5, -5);
      seedling.lineTo(0.5, -10);
      seedling.lineTo(0, -15);
      seedling.stroke({ width: 2, color: COLORS.green });
      
      // Leaves (hand-drawn circles)
      const leafSegments = 8;
      // Left leaf
      seedling.moveTo(-3 + 3, -10);
      for (let i = 0; i <= leafSegments; i++) {
        const angle = (i / leafSegments) * Math.PI * 2;
        const radiusVar = 3 + (Math.random() - 0.5) * 0.5;
        const x = -3 + Math.cos(angle) * radiusVar;
        const y = -10 + Math.sin(angle) * radiusVar;
        seedling.lineTo(x, y);
      }
      seedling.fill(COLORS.lightGreen);
      seedling.stroke({ width: 1, color: COLORS.green, alpha: 0.7 });
      
      // Right leaf
      seedling.moveTo(3 + 3, -12);
      for (let i = 0; i <= leafSegments; i++) {
        const angle = (i / leafSegments) * Math.PI * 2;
        const radiusVar = 3 + (Math.random() - 0.5) * 0.5;
        const x = 3 + Math.cos(angle) * radiusVar;
        const y = -12 + Math.sin(angle) * radiusVar;
        seedling.lineTo(x, y);
      }
      seedling.fill(COLORS.lightGreen);
      seedling.stroke({ width: 1, color: COLORS.green, alpha: 0.7 });

      // Create seedling shadow
      seedlingShadow = new Graphics();
      seedlingShadow.ellipse(0, 0, 8, 3);
      seedlingShadow.fill({ color: COLORS.shadow, alpha: 0.15 });
      seedlingShadow.filters = [new BlurFilter({ strength: 2 })];
      seedlingShadow.x = centerX + 40;
      seedlingShadow.y = centerY + 58;
      seedlingShadow.alpha = 0;
      container.addChild(seedlingShadow);

      // Position seedling near child (responsive)
      seedling.x = centerX + 40;
      seedling.y = centerY + 55;
      seedling.alpha = 0; // Start invisible
      container.addChild(seedling);

      // Create enhanced soil particle system
      for (let i = 0; i < 20; i++) {
        const particle = new Graphics();
        const size = 1 + Math.random() * 3;
        particle.circle(0, 0, size);
        particle.fill(COLORS.soil);
        
        const particleData: Particle = {
          graphics: particle,
          vx: (Math.random() - 0.5) * 2,
          vy: -Math.random() * 3 - 1,
          life: 0,
          maxLife: 0.5 + Math.random() * 0.5,
        };
        
        particle.x = centerX + 40 + (Math.random() - 0.5) * 15;
        particle.y = centerY + 55;
        particle.alpha = 0;
        soilParticles.push(particleData);
        container.addChild(particle);
      }
    },

    animate: (container: Container, progress: number) => {
      const width = container.width || window.innerWidth;
      const height = container.height || window.innerHeight;
      const centerX = width / 2;
      const centerY = height / 2;

      // Animation phases with smooth easing:
      // 0-0.3: Child kneels down
      // 0.3-0.5: Digging motion with particles
      // 0.5-0.7: Place seedling
      // 0.7-1.0: Cover with soil

      if (progress < 0.3) {
        // Phase 1: Kneeling down with smooth easing
        const kneeProgress = progress / 0.3;
        const easedProgress = easeInOutCubic(kneeProgress);
        child.y = interpolate(centerY + 20, centerY + 40, easedProgress);
        child.rotation = interpolate(0, 0.2, easedProgress);
        
        // Shadow grows as child kneels
        childShadow.scale.x = interpolate(1, 1.2, easedProgress);
        childShadow.alpha = interpolate(0.2, 0.25, easedProgress);
        
      } else if (progress < 0.5) {
        // Phase 2: Digging motion with enhanced particles
        const digProgress = (progress - 0.3) / 0.2;
        const wobble = Math.sin(digProgress * Math.PI * 6) * 3;
        child.x = centerX + wobble;
        
        // Animate soil particles with physics
        soilParticles.forEach((particleData, index) => {
          const particle = particleData.graphics;
          const particleProgress = Math.max(0, digProgress - (index * 0.02));
          
          if (particleProgress > 0) {
            particleData.life = Math.min(particleData.maxLife, particleData.life + 0.02);
            const lifeRatio = particleData.life / particleData.maxLife;
            
            // Apply physics
            particle.x += particleData.vx;
            particle.y += particleData.vy;
            particleData.vy += 0.2; // Gravity
            
            // Fade based on life
            particle.alpha = easeOutQuad(1 - lifeRatio) * 0.8;
          }
        });
        
      } else if (progress < 0.7) {
        // Phase 3: Place seedling with smooth scaling
        const placeProgress = (progress - 0.5) / 0.2;
        const easedProgress = easeOutQuad(placeProgress);
        seedling.alpha = easedProgress;
        seedling.scale.set(easedProgress);
        seedlingShadow.alpha = easedProgress * 0.15;
        seedlingShadow.scale.set(easedProgress);
        
        // Slight bounce effect
        const bounce = Math.sin(easedProgress * Math.PI) * 5;
        seedling.y = centerY + 55 - bounce;
        
      } else {
        // Phase 4: Cover with soil and stand up
        const coverProgress = (progress - 0.7) / 0.3;
        const easedProgress = easeInOutCubic(coverProgress);
        
        // Fade out soil particles
        soilParticles.forEach((particleData) => {
          const particle = particleData.graphics;
          particle.alpha *= 0.95; // Gradual fade
        });
        
        // Child stands up slightly with smooth easing
        child.y = interpolate(centerY + 40, centerY + 30, easedProgress);
        child.rotation = interpolate(0.2, 0.1, easedProgress);
        
        // Shadow adjusts
        childShadow.scale.x = interpolate(1.2, 1, easedProgress);
      }
      
      // Subtle sun glow pulsing
      if (sunGlow) {
        sunGlow.alpha = 0.3 + Math.sin(progress * Math.PI * 2) * 0.1;
      }
    },

    cleanup: (container: Container) => {
      // Remove all elements
      if (background) container.removeChild(background);
      if (sunGlow) container.removeChild(sunGlow);
      if (childShadow) container.removeChild(childShadow);
      if (child) container.removeChild(child);
      if (seedlingShadow) container.removeChild(seedlingShadow);
      if (seedling) container.removeChild(seedling);
      soilParticles.forEach((particleData) => container.removeChild(particleData.graphics));
      
      // Clear references
      soilParticles = [];
    },
  };
}
