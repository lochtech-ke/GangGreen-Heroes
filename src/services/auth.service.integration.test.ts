import { describe, it, expect } from 'vitest';
import { hummingbirdBadgeService } from './hummingbirdBadge.service';

describe('AuthService Integration - Hummingbird Badge', () => {
  it('should create default hummingbird config', () => {
    const config = hummingbirdBadgeService.createDefaultHummingbirdConfig(
      'test-user-123',
      'bronze',
      'kakamega'
    );

    expect(config).toBeDefined();
    expect(config.id).toContain('hummingbird-welcome-test-user-123');
    expect(config.tier).toBe('bronze');
    expect(config.forest).toBe('kakamega');
    expect(config.achievement).toBe('welcome_badge');
    expect(config.metadata.badgeName).toBe('Hummingbird Welcome Badge');
    expect(config.metadata.userId).toBe('test-user-123');
  });

  it('should validate hummingbird config', () => {
    const config = hummingbirdBadgeService.createDefaultHummingbirdConfig(
      'test-user-123',
      'bronze',
      'kakamega'
    );

    const validation = hummingbirdBadgeService.validateHummingbirdConfig(config);
    
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });
});