/**
 * Scene 3: Message Display with Kenyan Flag Colors
 * Duration: 1500ms (4-5.5s)
 * 
 * This scene displays "Chill Kiasi..." message with parallax background
 * using Kenyan flag colors, reinforcing cultural authenticity.
 */

import { Container, Graphics, Text } from 'pixi.js';
import type { SceneConfig } from '../../../types';

// Kenyan flag colors
const COLORS = {
  black: 0x000000,
  red: 0xBB0000,
  green: 0x006600,
  white: 0xFFFFFF,
};

/**
 * Creates Scene 3 configuration
 */
export function createScene3(): SceneConfig {
  let flagBox: Graphics;
  let whiteAccents: Graphics[] = [];
  let mainText: Text;
  let hashtag1: Text;
  let hashtag2: Text;

  return {
    duration: 1500,
    startTime: 4000,
    endTime: 5500,

    setup: (container: Container) => {
      const width = container.width || window.innerWidth;
      const height = container.height || window.innerHeight;
      const centerX = width / 2;
      const centerY = height / 2;

      // Create Kenyan flag bounding box (hand-drawn style)
      const boxWidth = Math.min(width, height) * 0.6;
      const boxHeight = boxWidth * 0.4; // Maintain flag proportions
      const boxX = centerX - boxWidth / 2;
      const boxY = centerY - boxHeight / 2 - Math.min(width, height) * 0.15;

      // Flag container with hand-drawn border
      flagBox = new Graphics();
      
      // Black stripe (top)
      flagBox.rect(boxX, boxY, boxWidth, boxHeight / 4);
      flagBox.fill(COLORS.black);
      
      // Red stripe (middle)
      flagBox.rect(boxX, boxY + boxHeight / 4, boxWidth, boxHeight / 4);
      flagBox.fill(COLORS.red);
      
      // White stripe (center - thinner)
      flagBox.rect(boxX, boxY + boxHeight * 0.4, boxWidth, boxHeight * 0.2);
      flagBox.fill(COLORS.white);
      
      // Green stripe (bottom)
      flagBox.rect(boxX, boxY + boxHeight * 0.6, boxWidth, boxHeight / 4);
      flagBox.fill(COLORS.green);
      
      // Hand-drawn border effect (sketchy lines)
      flagBox.moveTo(boxX, boxY);
      // Top edge with wobble
      for (let i = 0; i <= 20; i++) {
        const x = boxX + (boxWidth / 20) * i;
        const y = boxY + (Math.sin(i * 0.5) * 2);
        flagBox.lineTo(x, y);
      }
      // Right edge
      for (let i = 0; i <= 20; i++) {
        const x = boxX + boxWidth + (Math.cos(i * 0.5) * 2);
        const y = boxY + (boxHeight / 20) * i;
        flagBox.lineTo(x, y);
      }
      // Bottom edge
      for (let i = 20; i >= 0; i--) {
        const x = boxX + (boxWidth / 20) * i;
        const y = boxY + boxHeight + (Math.sin(i * 0.5) * 2);
        flagBox.lineTo(x, y);
      }
      // Left edge
      for (let i = 20; i >= 0; i--) {
        const x = boxX + (Math.cos(i * 0.5) * 2);
        const y = boxY + (boxHeight / 20) * i;
        flagBox.lineTo(x, y);
      }
      flagBox.stroke({ width: 4, color: COLORS.white, alpha: 0.8 });
      
      flagBox.alpha = 0;
      container.addChild(flagBox);

      // Scattered hand-drawn accents around the flag
      const accentSize = Math.min(width, height) * 0.02;
      for (let i = 0; i < 8; i++) {
        const accent = new Graphics();
        // Hand-drawn circle (irregular)
        const segments = 12;
        const baseRadius = accentSize + Math.random() * accentSize;
        accent.moveTo(baseRadius, 0);
        for (let j = 0; j <= segments; j++) {
          const angle = (j / segments) * Math.PI * 2;
          const radiusVariation = baseRadius + (Math.random() - 0.5) * accentSize * 0.3;
          const x = Math.cos(angle) * radiusVariation;
          const y = Math.sin(angle) * radiusVariation;
          accent.lineTo(x, y);
        }
        accent.fill({ color: 0x10B981, alpha: 0.3 });
        accent.stroke({ width: 2, color: 0x10B981, alpha: 0.5 });
        
        // Position around the flag box
        const anglePos = (i / 8) * Math.PI * 2;
        const distance = boxWidth * 0.7;
        accent.x = centerX + Math.cos(anglePos) * distance;
        accent.y = boxY + boxHeight / 2 + Math.sin(anglePos) * distance * 0.5;
        accent.alpha = 0;
        whiteAccents.push(accent);
        container.addChild(accent);
      }

      // Create main text (responsive font size)
      const mainFontSize = Math.min(width, height) * 0.08;
      mainText = new Text({
        text: 'Chill Kiasi...',
        style: {
          fontFamily: 'Arial, sans-serif',
          fontSize: mainFontSize,
          fontWeight: 'bold',
          fill: COLORS.white,
          align: 'center',
          dropShadow: {
            color: COLORS.black,
            blur: 4,
            angle: Math.PI / 4,
            distance: 4,
          },
        },
      });
      mainText.anchor.set(0.5);
      mainText.x = centerX;
      mainText.y = centerY - mainFontSize * 0.5;
      mainText.alpha = 0;
      container.addChild(mainText);

      // Create hashtag 1 (responsive)
      const hashtagFontSize = Math.min(width, height) * 0.04;
      const hashtagSpacing = Math.min(width, height) * 0.12;
      hashtag1 = new Text({
        text: '#GangGreen',
        style: {
          fontFamily: 'Arial, sans-serif',
          fontSize: hashtagFontSize,
          fontWeight: '400',
          fill: 0x10B981, // Bright green
          align: 'center',
          dropShadow: {
            color: COLORS.black,
            blur: 2,
            angle: Math.PI / 4,
            distance: 2,
          },
        },
      });
      hashtag1.anchor.set(0.5);
      hashtag1.x = centerX - hashtagSpacing;
      hashtag1.y = centerY + mainFontSize;
      hashtag1.alpha = 0;
      container.addChild(hashtag1);

      // Create hashtag 2 (responsive)
      hashtag2 = new Text({
        text: '#GreenBeltMovement',
        style: {
          fontFamily: 'Arial, sans-serif',
          fontSize: hashtagFontSize,
          fontWeight: '400',
          fill: 0x10B981, // Bright green
          align: 'center',
          dropShadow: {
            color: COLORS.black,
            blur: 2,
            angle: Math.PI / 4,
            distance: 2,
          },
        },
      });
      hashtag2.anchor.set(0.5);
      hashtag2.x = centerX + hashtagSpacing;
      hashtag2.y = centerY + mainFontSize;
      hashtag2.alpha = 0;
      container.addChild(hashtag2);
    },

    animate: (container: Container, progress: number) => {

      // Animation phases:
      // 0-0.3: Fade in background layers
      // 0.3-0.6: Parallax scroll background
      // 0.4-0.7: Fade in main text
      // 0.6-0.9: Fade in hashtags
      // 0.9-1.0: Hold

      // Fade in flag box
      if (progress < 0.3) {
        const fadeProgress = progress / 0.3;
        flagBox.alpha = fadeProgress;
        // Slight scale animation for depth
        flagBox.scale.set(0.9 + fadeProgress * 0.1);
      }

      // Fade in hand-drawn accents with stagger
      if (progress > 0.2) {
        whiteAccents.forEach((accent, i) => {
          const accentStart = 0.2 + (i / whiteAccents.length) * 0.3;
          if (progress > accentStart) {
            const accentProgress = Math.min(1, (progress - accentStart) * 3);
            accent.alpha = accentProgress * 0.4;
            // Gentle floating animation
            accent.y += Math.sin(progress * Math.PI * 2 + i) * 0.3;
            accent.rotation = Math.sin(progress * Math.PI + i) * 0.1;
          }
        });
      }

      // Fade in main text
      if (progress > 0.4 && progress < 0.7) {
        const textProgress = (progress - 0.4) / 0.3;
        mainText.alpha = textProgress;
        mainText.scale.set(0.8 + textProgress * 0.2);
      } else if (progress >= 0.7) {
        mainText.alpha = 1;
        mainText.scale.set(1);
      }

      // Fade in hashtags (responsive)
      const height = container.height || window.innerHeight;
      const centerY = height / 2;
      const mainFontSize = Math.min(container.width || window.innerWidth, height) * 0.08;
      
      if (progress > 0.6 && progress < 0.9) {
        const hashtagProgress = (progress - 0.6) / 0.3;
        hashtag1.alpha = hashtagProgress;
        hashtag2.alpha = hashtagProgress;
        
        // Slight stagger
        hashtag1.y = centerY + mainFontSize - (1 - hashtagProgress) * 20;
        hashtag2.y = centerY + mainFontSize - (1 - hashtagProgress) * 15;
      } else if (progress >= 0.9) {
        hashtag1.alpha = 1;
        hashtag2.alpha = 1;
      }

      // Gentle pulsing effect on text
      if (progress > 0.7) {
        const pulseProgress = (progress - 0.7) / 0.3;
        const pulse = 1 + Math.sin(pulseProgress * Math.PI * 4) * 0.05;
        mainText.scale.set(pulse);
      }
    },

    cleanup: (container: Container) => {
      // Remove all elements
      if (flagBox) container.removeChild(flagBox);
      if (mainText) container.removeChild(mainText);
      if (hashtag1) container.removeChild(hashtag1);
      if (hashtag2) container.removeChild(hashtag2);
      
      whiteAccents.forEach((accent) => container.removeChild(accent));
      
      // Clear references
      whiteAccents = [];
    },
  };
}
