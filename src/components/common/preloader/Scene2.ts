/**
 * Scene 2: Seedling Growth Time-lapse
 * Duration: 2000ms (2-4s)
 * 
 * This scene shows a seedling growing into a full tree,
 * representing the long-term impact of conservation efforts.
 * Enhanced with particle effects, glow, and smooth animations.
 */

import { Container, Graphics, BlurFilter } from 'pixi.js';
import type { SceneConfig } from '../../../types';
import { easeOutCubic, interpolate } from './easingFunctions';

// Color palette
const COLORS = {
  darkGreen: 0x228B22,
  lightGreen: 0x00FF00,
  mediumGreen: 0x32CD32,
  brown: 0x654321,
  darkBrown: 0x4A3728,
  skyBlue: 0x87CEEB,
  sunYellow: 0xFFD700,
  ground: 0x8B7355,
  shadow: 0x000000,
  glow: 0x90EE90,
};

// Particle interface for leaves
interface LeafParticle {
  graphics: Graphics;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
}

/**
 * Creates Scene 2 configuration
 */
export function createScene2(): SceneConfig {
  let background: Graphics;
  let ground: Graphics;
  let trunk: Graphics;
  let trunkShadow: Graphics;
  let treeGlow: Graphics;
  let leaves: Graphics[] = [];
  let leafParticles: LeafParticle[] = [];
  let roots: Graphics;
  let sun: Graphics;
  let sunGlow: Graphics;
  let raindrops: Graphics[] = [];

  return {
    duration: 2000,
    startTime: 2000,
    endTime: 4000,

    setup: (container: Container) => {
      const width = container.width || window.innerWidth;
      const height = container.height || window.innerHeight;
      const centerX = width / 2;
      const groundY = height * 0.65; // Centered ground position

      // Create gradient sky background
      background = new Graphics();
      const gradientSteps = 20;
      for (let i = 0; i < gradientSteps; i++) {
        const y = (height / gradientSteps) * i;
        const h = height / gradientSteps;
        const t = i / gradientSteps;
        // Sky gradient from light blue to horizon
        const r = Math.round(135 + (255 - 135) * t);
        const g = Math.round(206 + (250 - 206) * t);
        const b = Math.round(235 + (220 - 235) * t);
        const color = (r << 16) | (g << 8) | b;
        background.rect(0, y, width, h);
        background.fill({ color, alpha: 1 });
      }
      container.addChild(background);

      // Create ground with gradient
      ground = new Graphics();
      for (let i = 0; i < 10; i++) {
        const y = groundY + ((height - groundY) / 10) * i;
        const h = (height - groundY) / 10;
        const t = i / 10;
        const r = Math.round(139 - 20 * t);
        const g = Math.round(115 - 15 * t);
        const b = Math.round(85 - 10 * t);
        const color = (r << 16) | (g << 8) | b;
        ground.rect(0, y, width, h);
        ground.fill({ color, alpha: 1 });
      }
      container.addChild(ground);

      // Create sun with glow
      sunGlow = new Graphics();
      sunGlow.circle(0, 0, Math.min(width, height) * 0.08);
      sunGlow.fill({ color: COLORS.sunYellow, alpha: 0.2 });
      sunGlow.filters = [new BlurFilter({ strength: 20 })];
      sunGlow.x = width * 0.8;
      sunGlow.y = height * 0.2;
      container.addChild(sunGlow);

      sun = new Graphics();
      sun.circle(0, 0, Math.min(width, height) * 0.04);
      sun.fill({ color: COLORS.sunYellow, alpha: 0.9 });
      sun.x = width * 0.8;
      sun.y = height * 0.2;
      container.addChild(sun);

      // Create tree trunk (hand-drawn style, responsive size)
      const trunkWidth = Math.min(width, height) * 0.04;
      const trunkHeight = Math.min(width, height) * 0.15;
      trunk = new Graphics();
      
      // Hand-drawn trunk with texture
      const segments = 20;
      trunk.moveTo(-trunkWidth / 2, 0);
      for (let i = 0; i <= segments; i++) {
        const y = (i / segments) * trunkHeight;
        const xLeft = -trunkWidth / 2 + (Math.random() - 0.5) * 2;
        const xRight = trunkWidth / 2 + (Math.random() - 0.5) * 2;
        trunk.lineTo(xLeft, y);
        if (i === segments) {
          trunk.lineTo(xRight, y);
          for (let j = segments; j >= 0; j--) {
            const yBack = (j / segments) * trunkHeight;
            const xRightBack = trunkWidth / 2 + (Math.random() - 0.5) * 2;
            trunk.lineTo(xRightBack, yBack);
          }
        }
      }
      trunk.fill(COLORS.brown);
      trunk.stroke({ width: 2, color: COLORS.darkBrown, alpha: 0.6 });
      
      trunk.x = centerX;
      trunk.y = groundY;
      trunk.scale.set(0.1); // Start very small
      container.addChild(trunk);

      // Create trunk shadow
      trunkShadow = new Graphics();
      trunkShadow.ellipse(0, 0, trunkWidth * 2, trunkWidth * 0.5);
      trunkShadow.fill({ color: COLORS.shadow, alpha: 0.2 });
      trunkShadow.filters = [new BlurFilter({ strength: 6 })];
      trunkShadow.x = centerX;
      trunkShadow.y = groundY + 5;
      trunkShadow.scale.set(0.1);
      container.addChild(trunkShadow);

      // Create tree glow effect
      treeGlow = new Graphics();
      treeGlow.circle(0, 0, Math.min(width, height) * 0.15);
      treeGlow.fill({ color: COLORS.glow, alpha: 0 });
      treeGlow.filters = [new BlurFilter({ strength: 30 })];
      treeGlow.x = centerX;
      treeGlow.y = groundY - Math.min(width, height) * 0.1;
      container.addChild(treeGlow);

      // Create root system (responsive)
      const rootLength = Math.min(width, height) * 0.06;
      roots = new Graphics();
      for (let i = 0; i < 5; i++) {
        const angle = (Math.PI / 6) * (i - 2);
        const length = rootLength + Math.random() * (rootLength * 0.5);
        roots.moveTo(0, 0);
        roots.lineTo(Math.sin(angle) * length, Math.cos(angle) * length);
        roots.stroke({ width: 2, color: COLORS.darkBrown, alpha: 0.6 });
      }
      roots.x = centerX;
      roots.y = groundY;
      roots.alpha = 0;
      container.addChild(roots);

      // Create leaves (hand-drawn style, responsive size)
      const leafSize = Math.min(width, height) * 0.015;
      for (let i = 0; i < 20; i++) {
        const leaf = new Graphics();
        
        // Hand-drawn leaf shape
        const leafSegments = 8;
        const baseRadius = leafSize + Math.random() * leafSize;
        leaf.moveTo(baseRadius, 0);
        for (let j = 0; j <= leafSegments; j++) {
          const angle = (j / leafSegments) * Math.PI * 2;
          const radiusVar = baseRadius + (Math.random() - 0.5) * leafSize * 0.3;
          const x = Math.cos(angle) * radiusVar;
          const y = Math.sin(angle) * radiusVar;
          leaf.lineTo(x, y);
        }
        
        const greenShade = i % 3 === 0 ? COLORS.lightGreen : 
                          i % 3 === 1 ? COLORS.mediumGreen : COLORS.darkGreen;
        leaf.fill({ color: greenShade, alpha: 0.7 });
        leaf.stroke({ width: 1, color: COLORS.darkGreen, alpha: 0.5 });
        leaf.alpha = 0;
        leaves.push(leaf);
        container.addChild(leaf);
      }

      // Create raindrops
      for (let i = 0; i < 15; i++) {
        const drop = new Graphics();
        drop.roundRect(0, 0, 2, 8, 1);
        drop.fill({ color: 0x4A90E2, alpha: 0.6 });
        drop.x = Math.random() * width;
        drop.y = Math.random() * height * 0.5;
        drop.alpha = 0;
        raindrops.push(drop);
        container.addChild(drop);
      }

      // Create floating leaf particles
      for (let i = 0; i < 8; i++) {
        const particle = new Graphics();
        const size = 3 + Math.random() * 3;
        particle.ellipse(0, 0, size, size * 0.6);
        particle.fill({ color: COLORS.mediumGreen, alpha: 0.7 });
        
        const particleData: LeafParticle = {
          graphics: particle,
          vx: (Math.random() - 0.5) * 0.5,
          vy: Math.random() * 0.5 + 0.2,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.1,
        };
        
        particle.x = centerX + (Math.random() - 0.5) * width * 0.3;
        particle.y = groundY - Math.random() * height * 0.3;
        particle.alpha = 0;
        leafParticles.push(particleData);
        container.addChild(particle);
      }
    },

    animate: (container: Container, progress: number) => {
      const width = container.width || window.innerWidth;
      const height = container.height || window.innerHeight;
      const centerX = width / 2;
      const groundY = height * 0.65;
      const leafRadius = Math.min(width, height) * 0.08;

      // Growth phases:
      // 0-0.25: Seedling sprouts (scale 0.1 -> 0.3)
      // 0.25-0.5: Small plant (scale 0.3 -> 0.6)
      // 0.5-0.75: Sapling (scale 0.6 -> 0.9)
      // 0.75-1.0: Full tree (scale 0.9 -> 1.0)

      // Calculate tree scale with smooth easing
      const scale = interpolate(0.1, 1.0, easeOutCubic(progress));
      trunk.scale.set(scale);
      trunkShadow.scale.set(scale * 1.2);
      
      // Glow effect grows with tree
      if (progress > 0.5) {
        const glowProgress = (progress - 0.5) / 0.5;
        treeGlow.alpha = easeOutCubic(glowProgress) * 0.15;
        treeGlow.scale.set(scale);
      }

      // Show roots as tree grows
      if (progress > 0.2) {
        roots.alpha = Math.min(1, (progress - 0.2) * 2);
        roots.scale.set(scale * 0.8);
      }

      // Add leaves progressively (responsive positioning)
      leaves.forEach((leaf, index) => {
        const leafAppearTime = 0.3 + (index / leaves.length) * 0.6;
        
        if (progress > leafAppearTime) {
          leaf.alpha = Math.min(1, (progress - leafAppearTime) * 3);
          
          // Position leaves around the top of the trunk (responsive)
          const angle = (index / leaves.length) * Math.PI * 2;
          const radius = leafRadius + (index % 3) * (leafRadius * 0.5);
          const leafScale = scale * 0.8;
          const trunkHeight = Math.min(width, height) * 0.15;
          
          leaf.x = centerX + Math.cos(angle) * radius * leafScale;
          leaf.y = groundY - (trunkHeight * scale) + Math.sin(angle) * radius * leafScale * 0.5;
          leaf.scale.set(leafScale);
        }
      });

      // Animate sun (gentle pulsing)
      const sunPulse = 1 + Math.sin(progress * Math.PI * 3) * 0.08;
      sun.scale.set(sunPulse);
      sunGlow.scale.set(sunPulse * 1.2);
      sunGlow.alpha = 0.2 + Math.sin(progress * Math.PI * 3) * 0.05;

      // Show rain in middle phase
      if (progress > 0.3 && progress < 0.7) {
        const rainProgress = (progress - 0.3) / 0.4;
        raindrops.forEach((drop) => {
          drop.alpha = Math.sin(rainProgress * Math.PI) * 0.6;
          drop.y = (Math.random() * height * 0.5) + (rainProgress * height * 0.3);
        });
      } else {
        raindrops.forEach((drop) => {
          drop.alpha = 0;
        });
      }

      // Gentle swaying motion for mature tree
      if (progress > 0.7) {
        const swayAmount = (progress - 0.7) * 0.3;
        const sway = Math.sin(progress * Math.PI * 4) * 5 * swayAmount;
        
        leaves.forEach((leaf, index) => {
          leaf.x += sway * (0.3 + (index % 3) * 0.1);
          // Subtle rotation
          leaf.rotation = Math.sin(progress * Math.PI * 2 + index) * 0.1;
        });
      }

      // Animate floating leaf particles
      if (progress > 0.6) {
        const particleProgress = (progress - 0.6) / 0.4;
        leafParticles.forEach((particleData, index) => {
          const particle = particleData.graphics;
          const delay = index * 0.1;
          const adjustedProgress = Math.max(0, particleProgress - delay);
          
          if (adjustedProgress > 0) {
            particle.alpha = Math.min(0.7, adjustedProgress * 2) * (1 - adjustedProgress * 0.5);
            particle.x += particleData.vx;
            particle.y += particleData.vy;
            particleData.rotation += particleData.rotationSpeed;
            particle.rotation = particleData.rotation;
          }
        });
      }
    },

    cleanup: (container: Container) => {
      // Remove all elements
      if (background) container.removeChild(background);
      if (ground) container.removeChild(ground);
      if (sunGlow) container.removeChild(sunGlow);
      if (sun) container.removeChild(sun);
      if (trunkShadow) container.removeChild(trunkShadow);
      if (trunk) container.removeChild(trunk);
      if (treeGlow) container.removeChild(treeGlow);
      if (roots) container.removeChild(roots);
      
      leaves.forEach((leaf) => container.removeChild(leaf));
      raindrops.forEach((drop) => container.removeChild(drop));
      leafParticles.forEach((particleData) => container.removeChild(particleData.graphics));
      
      // Clear references
      leaves = [];
      raindrops = [];
      leafParticles = [];
    },
  };
}
