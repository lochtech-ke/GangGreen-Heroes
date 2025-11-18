/**
 * Scene 1: African Child Planting Seedling
 * Duration: 2000ms (0-2s)
 * 
 * This scene shows a simple animated character planting a seedling,
 * representing grassroots conservation efforts.
 */

import { Container, Graphics } from 'pixi.js';
import type { SceneConfig } from '../../../types';

// Color palette
const COLORS = {
  brown: 0x8B4513,
  darkBrown: 0x654321,
  green: 0x228B22,
  lightGreen: 0x90EE90,
  skinTone: 0x8D5524,
  soil: 0x6B4423,
  sky: 0xE8F4F8,
};

/**
 * Creates Scene 1 configuration
 */
export function createScene1(): SceneConfig {
  let child: Graphics;
  let seedling: Graphics;
  let soilParticles: Graphics[] = [];
  let background: Graphics;

  return {
    duration: 2000,
    startTime: 0,
    endTime: 2000,

    setup: (container: Container) => {
      const width = container.width || window.innerWidth;
      const height = container.height || window.innerHeight;
      const centerX = width / 2;
      const centerY = height / 2;

      // Create green overlay background
      background = new Graphics();
      background.rect(0, 0, width, height);
      background.fill({ color: 0x10B981, alpha: 0.15 }); // Green overlay
      container.addChild(background);

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

      // Position seedling near child (responsive)
      seedling.x = centerX + 40;
      seedling.y = centerY + 55;
      seedling.alpha = 0; // Start invisible
      container.addChild(seedling);

      // Create soil particles
      for (let i = 0; i < 8; i++) {
        const particle = new Graphics();
        particle.circle(0, 0, 2 + Math.random() * 2);
        particle.fill(COLORS.soil);
        particle.x = seedling.x + (Math.random() - 0.5) * 20;
        particle.y = seedling.y + (Math.random() - 0.5) * 10;
        particle.alpha = 0;
        soilParticles.push(particle);
        container.addChild(particle);
      }
    },

    animate: (container: Container, progress: number) => {
      const width = container.width || window.innerWidth;
      const height = container.height || window.innerHeight;
      const centerX = width / 2;
      const centerY = height / 2;

      // Animation phases:
      // 0-0.3: Child kneels down
      // 0.3-0.5: Digging motion
      // 0.5-0.7: Place seedling
      // 0.7-1.0: Cover with soil

      if (progress < 0.3) {
        // Phase 1: Kneeling down
        const kneeProgress = progress / 0.3;
        child.y = centerY + 20 + (kneeProgress * 20);
        child.rotation = kneeProgress * 0.2;
      } else if (progress < 0.5) {
        // Phase 2: Digging motion (arm movement)
        const digProgress = (progress - 0.3) / 0.2;
        const wobble = Math.sin(digProgress * Math.PI * 4) * 5;
        child.x = centerX + wobble;
        
        // Show soil particles
        soilParticles.forEach((particle) => {
          particle.alpha = Math.sin(digProgress * Math.PI);
          particle.y -= digProgress * 0.5;
        });
      } else if (progress < 0.7) {
        // Phase 3: Place seedling
        const placeProgress = (progress - 0.5) / 0.2;
        seedling.alpha = placeProgress;
        seedling.scale.set(placeProgress);
      } else {
        // Phase 4: Cover with soil
        const coverProgress = (progress - 0.7) / 0.3;
        
        // Fade out soil particles
        soilParticles.forEach((particle) => {
          particle.alpha = 1 - coverProgress;
        });
        
        // Child stands up slightly
        child.y = centerY + 40 - (coverProgress * 10);
        child.rotation = 0.2 - (coverProgress * 0.1);
      }
    },

    cleanup: (container: Container) => {
      // Remove all elements
      if (background) container.removeChild(background);
      if (child) container.removeChild(child);
      if (seedling) container.removeChild(seedling);
      soilParticles.forEach((particle) => container.removeChild(particle));
      
      // Clear references
      soilParticles = [];
    },
  };
}
