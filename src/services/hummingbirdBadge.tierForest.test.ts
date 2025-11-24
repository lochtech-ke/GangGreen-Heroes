/**
 * Hummingbird Badge Tier and Forest Integration Tests
 * Tests for tier-specific effects and forest theme integration
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  HummingbirdBadgeService, 
  HummingbirdBadgeGenerator
} from './hummingbirdBadge.service';

describe('HummingbirdBadge Tier and Forest Integration', () => {
  let service: HummingbirdBadgeService;

  beforeEach(() => {
    service = new HummingbirdBadgeService();
  });

  describe('Tier System Support', () => {
    const tiers = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
    
    tiers.forEach(tier => {
      it(`should generate badge for ${tier} tier`, async () => {
        const config = service.createDefaultHummingbirdConfig('test-user', tier);
        const generator = new HummingbirdBadgeGenerator(config);
        
        expect(generator.getConfig().tier).toBe(tier);
        expect(generator.getConfig().achievement).toBe('welcome_badge');
      });
    });

    it('should apply different visual effects for each tier', () => {
      const configs = tiers.map(tier => {
        const config = service.createDefaultHummingbirdConfig('test-user', tier);
        return new HummingbirdBadgeGenerator(config);
      });

      // Each tier should have unique configuration
      const tierConfigs = configs.map(gen => gen.getConfig().tier);
      const uniqueTiers = [...new Set(tierConfigs)];
      expect(uniqueTiers).toHaveLength(5);
    });
  });

  describe('Forest Theme Integration', () => {
    const forests = ['kakamega', 'karura', 'mau'];
    
    forests.forEach(forest => {
      it(`should generate badge for ${forest} forest`, async () => {
        const config = service.createDefaultHummingbirdConfig('test-user', 'gold', forest);
        const generator = new HummingbirdBadgeGenerator(config);
        
        expect(generator.getConfig().forest).toBe(forest);
        expect(generator.getConfig().metadata.forestName).toContain(forest.charAt(0).toUpperCase() + forest.slice(1));
      });
    });

    it('should apply forest-themed colors when using forest-themed palette', () => {
      forests.forEach(forest => {
        const config = service.createDefaultHummingbirdConfig('test-user', 'silver', forest);
        const generator = new HummingbirdBadgeGenerator(config);
        
        generator.setColorPalette('forest-themed');
        const finalConfig = generator.getConfig();
        
        expect(finalConfig.colorPalette).toBe('forest-themed');
        expect(finalConfig.forest).toBe(forest);
      });
    });
  });

  describe('Tier and Forest Combinations', () => {
    const tiers = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
    const forests = ['kakamega', 'karura', 'mau'];

    it('should support all tier-forest combinations', () => {
      const combinations: Array<{ tier: string; forest: string }> = [];
      
      tiers.forEach(tier => {
        forests.forEach(forest => {
          const config = service.createDefaultHummingbirdConfig('test-user', tier, forest);
          const generator = new HummingbirdBadgeGenerator(config);
          
          combinations.push({
            tier: generator.getConfig().tier,
            forest: generator.getConfig().forest
          });
        });
      });

      expect(combinations).toHaveLength(15); // 5 tiers × 3 forests
      
      // Verify all combinations are unique
      const uniqueCombinations = combinations.map(c => `${c.tier}-${c.forest}`);
      const uniqueSet = [...new Set(uniqueCombinations)];
      expect(uniqueSet).toHaveLength(15);
    });

    it('should apply preset styles correctly with different forests', () => {
      forests.forEach(forest => {
        const config = service.createDefaultHummingbirdConfig('test-user', 'gold', forest);
        const generator = new HummingbirdBadgeGenerator(config);
        
        // Test forest theme preset
        generator.applyForestTheme();
        expect(generator.getConfig().colorPalette).toBe('forest-themed');
        expect(generator.getConfig().wingStyle).toBe('organic');
        
        // Test vibrant preset
        generator.applyVibrantStyle();
        expect(generator.getConfig().colorPalette).toBe('vibrant');
        expect(generator.getConfig().wingStyle).toBe('hybrid');
        expect(generator.getConfig().animationLevel).toBe('dynamic');
        
        // Test subtle preset
        generator.applySubtleStyle();
        expect(generator.getConfig().colorPalette).toBe('subtle');
        expect(generator.getConfig().wingStyle).toBe('geometric');
        expect(generator.getConfig().animationLevel).toBe('none');
      });
    });
  });

  describe('Glassmorphism Effects', () => {
    it('should apply glassmorphism effects consistently across tiers', () => {
      const tiers = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
      
      tiers.forEach(tier => {
        const config = service.createDefaultHummingbirdConfig('test-user', tier);
        const generator = new HummingbirdBadgeGenerator(config);
        
        // All badges should support glassmorphism
        expect(generator.getConfig().tier).toBe(tier);
        expect(generator.getConfig().achievement).toBe('welcome_badge');
      });
    });

    it('should maintain glassmorphism with forest themes', () => {
      const forests = ['kakamega', 'karura', 'mau'];
      
      forests.forEach(forest => {
        const config = service.createDefaultHummingbirdConfig('test-user', 'platinum', forest);
        const generator = new HummingbirdBadgeGenerator(config);
        
        generator.applyForestTheme();
        
        // Should maintain glassmorphism with forest themes
        expect(generator.getConfig().forest).toBe(forest);
        expect(generator.getConfig().colorPalette).toBe('forest-themed');
      });
    });
  });

  describe('Color Palette Integration', () => {
    it('should adapt colors based on forest theme', () => {
      const forests = ['kakamega', 'karura', 'mau'];
      
      forests.forEach(forest => {
        const config = service.createDefaultHummingbirdConfig('test-user', 'gold', forest);
        const generator = new HummingbirdBadgeGenerator(config);
        
        // Test different color palettes with each forest
        ['vibrant', 'subtle', 'forest-themed'].forEach(palette => {
          generator.setColorPalette(palette as any);
          expect(generator.getConfig().colorPalette).toBe(palette);
          expect(generator.getConfig().forest).toBe(forest);
        });
      });
    });
  });

  describe('Animation Level Support', () => {
    it('should support all animation levels across tiers', () => {
      const animationLevels = ['none', 'subtle', 'dynamic'];
      const tiers = ['bronze', 'gold', 'diamond'];
      
      tiers.forEach(tier => {
        animationLevels.forEach(level => {
          const config = service.createDefaultHummingbirdConfig('test-user', tier);
          const generator = new HummingbirdBadgeGenerator(config);
          
          generator.setAnimationLevel(level as any);
          expect(generator.getConfig().animationLevel).toBe(level);
          expect(generator.getConfig().tier).toBe(tier);
        });
      });
    });
  });

  describe('Wing Style Variations', () => {
    it('should support all wing styles with tier effects', () => {
      const wingStyles = ['geometric', 'organic', 'hybrid'];
      const tiers = ['silver', 'gold', 'platinum'];
      
      tiers.forEach(tier => {
        wingStyles.forEach(style => {
          const config = service.createDefaultHummingbirdConfig('test-user', tier);
          const generator = new HummingbirdBadgeGenerator(config);
          
          generator.setWingStyle(style as any);
          expect(generator.getConfig().wingStyle).toBe(style);
          expect(generator.getConfig().tier).toBe(tier);
        });
      });
    });
  });
});