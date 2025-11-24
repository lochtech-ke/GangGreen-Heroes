/**
 * Hummingbird Badge Service Tests
 * Unit tests for the hummingbird badge generation service
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  HummingbirdBadgeService, 
  HummingbirdBadgeGenerator,
  hummingbirdBadgeService,
  createHummingbirdBadgeGenerator,
  generateWelcomeBadge
} from './hummingbirdBadge.service';

describe('HummingbirdBadgeService', () => {
  let service: HummingbirdBadgeService;

  beforeEach(() => {
    service = new HummingbirdBadgeService();
  });

  describe('createDefaultHummingbirdConfig', () => {
    it('should create a valid default configuration', () => {
      const userId = 'test-user-123';
      const config = service.createDefaultHummingbirdConfig(userId);

      expect(config.id).toContain('hummingbird-welcome');
      expect(config.id).toContain(userId);
      expect(config.achievement).toBe('welcome_badge');
      expect(config.tier).toBe('bronze');
      expect(config.forest).toBe('kakamega');
      expect(config.wingStyle).toBe('hybrid');
      expect(config.colorPalette).toBe('vibrant');
      expect(config.animationLevel).toBe('subtle');
      
      expect(config.metadata.badgeName).toBe('Hummingbird Welcome Badge');
      expect(config.metadata.achievementType).toBe('welcome_badge');
      expect(config.metadata.userId).toBe(userId);
      expect(config.metadata.welcomeMessage).toBe('Welcome to the #GangGreen community!');
    });

    it('should accept custom tier and forest parameters', () => {
      const userId = 'test-user-456';
      const config = service.createDefaultHummingbirdConfig(userId, 'gold', 'mau');

      expect(config.tier).toBe('gold');
      expect(config.forest).toBe('mau');
      expect(config.metadata.forestName).toBe('Mau Forest');
    });
  });

  describe('validateHummingbirdConfig', () => {
    it('should validate a correct configuration', () => {
      const config = service.createDefaultHummingbirdConfig('test-user');
      const validation = service.validateHummingbirdConfig(config);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should reject invalid achievement type', () => {
      const config = service.createDefaultHummingbirdConfig('test-user');
      config.achievement = 'tree_planter' as any;
      
      const validation = service.validateHummingbirdConfig(config);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Achievement type must be welcome_badge for hummingbird badges');
    });

    it('should reject invalid wing style', () => {
      const config = service.createDefaultHummingbirdConfig('test-user');
      config.wingStyle = 'invalid' as any;
      
      const validation = service.validateHummingbirdConfig(config);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Invalid wing style. Must be geometric, organic, or hybrid');
    });

    it('should reject invalid color palette', () => {
      const config = service.createDefaultHummingbirdConfig('test-user');
      config.colorPalette = 'invalid' as any;
      
      const validation = service.validateHummingbirdConfig(config);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Invalid color palette. Must be vibrant, subtle, or forest-themed');
    });

    it('should reject invalid animation level', () => {
      const config = service.createDefaultHummingbirdConfig('test-user');
      config.animationLevel = 'invalid' as any;
      
      const validation = service.validateHummingbirdConfig(config);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Invalid animation level. Must be none, subtle, or dynamic');
    });
  });

  describe('singleton instance', () => {
    it('should export a singleton instance', () => {
      expect(hummingbirdBadgeService).toBeInstanceOf(HummingbirdBadgeService);
    });
  });

  describe('HummingbirdBadgeGenerator', () => {
    let generator: HummingbirdBadgeGenerator;
    let baseConfig: any;

    beforeEach(() => {
      baseConfig = service.createDefaultHummingbirdConfig('test-user');
      generator = new HummingbirdBadgeGenerator(baseConfig);
    });

    it('should create generator with default configuration', () => {
      const config = generator.getConfig();
      expect(config.wingStyle).toBe('hybrid');
      expect(config.colorPalette).toBe('vibrant');
      expect(config.animationLevel).toBe('subtle');
    });

    it('should allow fluent configuration updates', () => {
      const updatedGenerator = generator
        .setWingStyle('geometric')
        .setColorPalette('forest-themed')
        .setAnimationLevel('dynamic');

      const config = updatedGenerator.getConfig();
      expect(config.wingStyle).toBe('geometric');
      expect(config.colorPalette).toBe('forest-themed');
      expect(config.animationLevel).toBe('dynamic');
    });

    it('should apply forest theme styling', () => {
      generator.applyForestTheme();
      const config = generator.getConfig();
      expect(config.colorPalette).toBe('forest-themed');
      expect(config.wingStyle).toBe('organic');
    });

    it('should apply vibrant styling', () => {
      generator.applyVibrantStyle();
      const config = generator.getConfig();
      expect(config.colorPalette).toBe('vibrant');
      expect(config.wingStyle).toBe('hybrid');
      expect(config.animationLevel).toBe('dynamic');
    });

    it('should apply subtle styling', () => {
      generator.applySubtleStyle();
      const config = generator.getConfig();
      expect(config.colorPalette).toBe('subtle');
      expect(config.wingStyle).toBe('geometric');
      expect(config.animationLevel).toBe('none');
    });

    it('should update configuration with partial updates', () => {
      generator.updateConfig({ wingStyle: 'organic', animationLevel: 'none' });
      const config = generator.getConfig();
      expect(config.wingStyle).toBe('organic');
      expect(config.animationLevel).toBe('none');
      expect(config.colorPalette).toBe('vibrant'); // Should remain unchanged
    });
  });

  describe('factory functions', () => {
    it('should create generator using factory function', () => {
      const config = service.createDefaultHummingbirdConfig('test-user');
      const generator = createHummingbirdBadgeGenerator(config);
      expect(generator).toBeInstanceOf(HummingbirdBadgeGenerator);
    });

    it('should have generateWelcomeBadge function', () => {
      expect(typeof generateWelcomeBadge).toBe('function');
    });
  });
});