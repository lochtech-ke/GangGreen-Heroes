/**
 * Scene 2: Seedling Growth Time-lapse
 * Duration: 2000ms (2-4s)
 * 
 * This scene shows a seedling growing into a full tree,
 * representing the long-term impact of conservation efforts.
 */

import { Container, Graphics } from 'pixi.js';
import type { SceneConfig } from '../../../types';

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
};

/**
 * Creates Scene 2 configuration
 */
export function createScene2(): SceneConfig {
  let background: Graphics;
  let ground: Graphics;
  let trunk: Graphics;
  let leaves: Graphics[] = [];
  let roots: Graphics;
  let sun: Graphics;
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

      // Create green overlay background
      background = new Graphics();
      background.rect(0, 0, width, height);
      background.fill({ color: 0x10B981, alpha: 0.15 }); // Green overlay
      container.addChild(background);

      // Create ground
      ground = new Graphics();
      ground.rect(0, groundY, width, height - groundY);
      ground.fill(COLORS.ground);
      container.addChild(ground);

      // Create sun
      sun = new Graphics();
      sun.circle(0, 0, Math.min(width, height) * 0.04); // Responsive size
      sun.fill({ color: COLORS.sunYellow, alpha: 0.8 });
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
      for (let i = 0; i < 10; i++) {
        const drop = new Graphics();
        drop.circle(0, 0, 2);
        drop.fill({ color: 0x4A90E2, alpha: 0.6 });
        drop.x = Math.random() * width;
        drop.y = Math.random() * height * 0.5;
        drop.alpha = 0;
        raindrops.push(drop);
        container.addChild(drop);
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

      // Calculate tree scale based on progress
      const scale = 0.1 + (progress * 0.9);
      trunk.scale.set(scale);

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
      sun.scale.set(1 + Math.sin(progress * Math.PI * 2) * 0.1);

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
        
        leaves.forEach((leaf) => {
          leaf.x += sway * 0.5;
        });
      }
    },

    cleanup: (container: Container) => {
      // Remove all elements
      if (background) container.removeChild(background);
      if (ground) container.removeChild(ground);
      if (trunk) container.removeChild(trunk);
      if (roots) container.removeChild(roots);
      if (sun) container.removeChild(sun);
      
      leaves.forEach((leaf) => container.removeChild(leaf));
      raindrops.forEach((drop) => container.removeChild(drop));
      
      // Clear references
      leaves = [];
      raindrops = [];
    },
  };
}
