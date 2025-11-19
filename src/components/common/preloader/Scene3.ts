/**
 * Scene 3: Waving Kenyan Flag with Color-Cycling Loading Text
 * Duration: 1500ms (4-5.5s)
 * 
 * This scene displays a waving Kenyan flag with "Loading..." text
 * that cycles through the flag colors (black, red, green, white).
 */

import { Container, Graphics, Text } from 'pixi.js';
import type { SceneConfig } from '../../../types';
import { easeInOutCubic } from './easingFunctions';

// Kenyan flag colors
const KENYAN_COLORS = {
  black: 0x000000,
  red: 0xBB0000,
  green: 0x006600,
  white: 0xFFFFFF,
};

/**
 * Creates Scene 3 configuration
 */
export function createScene3(): SceneConfig {
  let background: Graphics;
  let flagStripes: Graphics[] = [];
  let loadingText: Text;

  return {
    duration: 1500,
    startTime: 4000,
    endTime: 5500,

    setup: (container: Container) => {
      const width = container.width || window.innerWidth;
      const height = container.height || window.innerHeight;
      const centerX = width / 2;
      const centerY = height / 2;

      // Create simple gradient background
      background = new Graphics();
      background.rect(0, 0, width, height);
      background.fill({ color: 0xF5F5F5, alpha: 1 });
      container.addChild(background);

      // Create waving Kenyan flag
      const flagWidth = Math.min(width, height) * 0.5;
      const flagHeight = flagWidth * 0.67; // Standard flag ratio
      const flagY = centerY - flagHeight / 2 - Math.min(width, height) * 0.1;
      
      for (let i = 0; i < 4; i++) {
        const stripe = new Graphics();
        stripe.alpha = 0;
        flagStripes.push(stripe);
        container.addChild(stripe);
      }

      // Create loading text that will cycle through colors
      const textFontSize = Math.min(width, height) * 0.06;
      loadingText = new Text({
        text: 'Loading...',
        style: {
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: textFontSize,
          fontWeight: 'bold',
          fill: KENYAN_COLORS.black,
          align: 'center',
          dropShadow: {
            color: 0xFFFFFF,
            blur: 4,
            angle: Math.PI / 4,
            distance: 2,
            alpha: 0.8,
          },
        },
      });
      loadingText.anchor.set(0.5);
      loadingText.x = centerX;
      loadingText.y = flagY + flagHeight + textFontSize * 1.5;
      loadingText.alpha = 0;
      container.addChild(loadingText);
    },

    animate: (container: Container, progress: number) => {
      const width = container.width || window.innerWidth;
      const height = container.height || window.innerHeight;
      const centerX = width / 2;
      const centerY = height / 2;

      const flagWidth = Math.min(width, height) * 0.5;
      const flagHeight = flagWidth * 0.67;
      const flagX = centerX - flagWidth / 2;
      const flagY = centerY - flagHeight / 2 - Math.min(width, height) * 0.1;
      const stripeHeight = flagHeight / 4;

      // Fade in flag stripes
      const fadeInProgress = Math.min(1, progress / 0.3);
      const stripeColors = [KENYAN_COLORS.black, KENYAN_COLORS.red, KENYAN_COLORS.white, KENYAN_COLORS.green];
      
      flagStripes.forEach((stripe, i) => {
        stripe.clear();
        stripe.alpha = easeInOutCubic(fadeInProgress);
        
        // Create waving effect using sine wave
        const waveSpeed = 2;
        const waveAmplitude = 15;
        const segments = 40;
        const segmentWidth = flagWidth / segments;
        
        for (let seg = 0; seg < segments; seg++) {
          const x = flagX + seg * segmentWidth;
          const y = flagY + i * stripeHeight;
          
          // Calculate wave offset for this segment
          const waveOffset = Math.sin((progress * Math.PI * waveSpeed) + (seg / segments) * Math.PI * 2) * waveAmplitude;
          
          // Draw segment of stripe
          stripe.rect(x, y + waveOffset, segmentWidth + 1, stripeHeight);
          stripe.fill({ color: stripeColors[i], alpha: 1 });
        }
      });

      // Fade in and animate loading text
      if (progress > 0.2) {
        const textProgress = (progress - 0.2) / 0.2;
        loadingText.alpha = Math.min(1, textProgress);
        
        // Pulse the text
        const pulseSpeed = 2.5;
        const pulseAmount = 0.1;
        const pulse = 1 + Math.sin(progress * Math.PI * pulseSpeed) * pulseAmount;
        loadingText.scale.set(pulse);
        
        // Cycle through flag colors (black, red, green, white)
        const colorCycleSpeed = 1.5; // Complete cycle every 1.5 seconds
        const colorIndex = Math.floor((progress * colorCycleSpeed * 4) % 4);
        const colors = [KENYAN_COLORS.black, KENYAN_COLORS.red, KENYAN_COLORS.green, KENYAN_COLORS.white];
        
        // Smooth color transition
        const colorProgress = (progress * colorCycleSpeed * 4) % 1;
        const currentColor = colors[colorIndex];
        const nextColor = colors[(colorIndex + 1) % 4];
        
        // Interpolate between colors
        const r1 = (currentColor >> 16) & 0xFF;
        const g1 = (currentColor >> 8) & 0xFF;
        const b1 = currentColor & 0xFF;
        
        const r2 = (nextColor >> 16) & 0xFF;
        const g2 = (nextColor >> 8) & 0xFF;
        const b2 = nextColor & 0xFF;
        
        const r = Math.round(r1 + (r2 - r1) * colorProgress);
        const g = Math.round(g1 + (g2 - g1) * colorProgress);
        const b = Math.round(b1 + (b2 - b1) * colorProgress);
        
        const interpolatedColor = (r << 16) | (g << 8) | b;
        loadingText.style.fill = interpolatedColor;
        
        // Adjust drop shadow color for contrast
        if (interpolatedColor === KENYAN_COLORS.white) {
          loadingText.style.dropShadow.color = 0x000000;
        } else {
          loadingText.style.dropShadow.color = 0xFFFFFF;
        }
      }
    },

    cleanup: (container: Container) => {
      // Remove all elements
      if (background) container.removeChild(background);
      flagStripes.forEach((stripe) => container.removeChild(stripe));
      if (loadingText) container.removeChild(loadingText);
      
      // Clear references
      flagStripes = [];
    },
  };
}
