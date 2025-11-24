import { describe, it, expect } from 'vitest';
import { hummingbirdBadgeService } from './hummingbirdBadge.service';

describe('Hummingbird Badge Generation', () => {
  it('should generate a hummingbird badge successfully', async () => {
    const config = hummingbirdBadgeService.createDefaultHummingbirdConfig(
      'test-user-123',
      'bronze',
      'kakamega'
    );

    const result = await hummingbirdBadgeService.generateHummingbirdBadge(config);
    
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.svg).toBeDefined();
    expect(result.metadata).toBeDefined();
    
    if (result.svg) {
      expect(result.svg).toContain('<svg');
      expect(result.svg).toContain('Hummingbird Welcome Badge');
      expect(result.svg).toContain('Bronze');
      expect(result.svg).toContain('Kakamega');
    }
  });
});