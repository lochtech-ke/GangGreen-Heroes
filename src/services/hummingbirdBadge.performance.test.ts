/**
 * Performance optimization tests for hummingbird badge generation
 * Tests Requirements 4.4, 4.5, 2.5, 5.4
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  HummingbirdBadgePerformanceService,
  hummingbirdBadgePerformanceService 
} from './hummingbirdBadge.performance';
import { hummingbirdBadgeService, HummingbirdBadgeConfig } from './hummingbirdBadge.service';

describe('HummingbirdBadgePerformanceService', () => {
  let performanceService: HummingbirdBadgePerformanceService;
  let testConfig: HummingbirdBadgeConfig;

  beforeEach(() => {
    performanceService = hummingbirdBadgePerformanceService;
    testConfig = hummingbirdBadgeService.createDefaultHummingbirdConfig('test-user-123');
  });

  describe('Performance Requirements (Requirements 4.4, 4.5)', () => {
    it('should generate badge in under 100ms', async () => {
      const startTime = performance.now();
      const result = await performanceService.optimizeGeneration(testConfig);
      const endTime = performance.now();
      const generationTime = endTime - startTime;

      expect(generationTime).toBeLessThan(100);
      expect(result.metrics.generationTime).toBeLessThan(100);
      expect(result.svg).toBeDefined();
      expect(result.svg.length).toBeGreaterThan(0);
    });

    it('should produce SVG under 50KB', async () => {
      const result = await performanceService.optimizeGeneration(testConfig);
      const svgSize = new Blob([result.svg]).size;
      const maxSize = 50 * 1024; // 50KB

      expect(svgSize).toBeLessThan(maxSize);
      expect(result.metrics.svgSize).toBeLessThan(maxSize);
    });

    it('should validate performance metrics correctly', async () => {
      const result = await performanceService.optimizeGeneration(testConfig);
      
      expect(result.metrics.generationTime).toBeGreaterThan(0);
      expect(result.metrics.svgSize).toBeGreaterThan(0);
      expect(result.metrics.isValid).toBe(true);
    });
  });

  describe('Vector Scalability (Requirement 2.5)', () => {
    it('should maintain quality at 50px minimum size', async () => {
      const result = await performanceService.optimizeGeneration(testConfig);
      const scalabilityTest = await performanceService.testVectorScalability(result.svg);
      
      expect(scalabilityTest).toBe(true);
      expect(result.metrics.scalabilityTest).toBe(true);
    });

    it('should maintain quality at 1200px maximum size', async () => {
      const result = await performanceService.optimizeGeneration(testConfig);
      
      // Test specifically at maximum size
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 1200;
      const ctx = canvas.getContext('2d');
      
      expect(ctx).toBeDefined();
      
      if (ctx) {
        const img = new Image();
        const svgBlob = new Blob([result.svg], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        const renderTest = new Promise<boolean>((resolve) => {
          img.onload = () => {
            try {
              ctx.drawImage(img, 0, 0, 1200, 1200);
              URL.revokeObjectURL(url);
              resolve(true);
            } catch (error) {
              URL.revokeObjectURL(url);
              resolve(false);
            }
          };

          img.onerror = () => {
            URL.revokeObjectURL(url);
            resolve(false);
          };
        });

        img.src = url;
        const renderSuccess = await renderTest;
        expect(renderSuccess).toBe(true);
      }
    });

    it('should scale properly across all required sizes', async () => {
      const result = await performanceService.optimizeGeneration(testConfig);
      const testSizes = [50, 100, 200, 400, 800, 1200];
      
      for (const size of testSizes) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          const img = new Image();
          const svgBlob = new Blob([result.svg], { type: 'image/svg+xml;charset=utf-8' });
          const url = URL.createObjectURL(svgBlob);

          const renderTest = new Promise<boolean>((resolve) => {
            img.onload = () => {
              try {
                ctx.drawImage(img, 0, 0, size, size);
                URL.revokeObjectURL(url);
                resolve(true);
              } catch (error) {
                URL.revokeObjectURL(url);
                resolve(false);
              }
            };

            img.onerror = () => {
              URL.revokeObjectURL(url);
              resolve(false);
            };

            setTimeout(() => {
              URL.revokeObjectURL(url);
              resolve(false);
            }, 1000);
          });

          img.src = url;
          const renderSuccess = await renderTest;
          expect(renderSuccess).toBe(true);
        }
      }
    });
  });

  describe('Background Contrast Compatibility (Requirement 5.4)', () => {
    it('should maintain readability on white background', async () => {
      const result = await performanceService.optimizeGeneration(testConfig);
      const contrastTest = await performanceService.testBackgroundContrast(result.svg);
      
      expect(contrastTest).toBe(true);
      expect(result.metrics.contrastTest).toBe(true);
    });

    it('should maintain readability on black background', async () => {
      const result = await performanceService.optimizeGeneration(testConfig);
      
      // Test specifically on black background
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 400, 400);

        const img = new Image();
        const svgBlob = new Blob([result.svg], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        const contrastTest = new Promise<boolean>((resolve) => {
          img.onload = () => {
            try {
              ctx.drawImage(img, 0, 0, 400, 400);
              
              const imageData = ctx.getImageData(0, 0, 400, 400);
              const pixels = imageData.data;
              
              let hasContrast = false;
              for (let i = 0; i < pixels.length; i += 4) {
                const r = pixels[i];
                const g = pixels[i + 1];
                const b = pixels[i + 2];
                const a = pixels[i + 3];
                
                if (a < 128) continue;
                
                // Check if pixel is significantly different from black background
                const colorSum = r + g + b;
                if (colorSum > 100) {
                  hasContrast = true;
                  break;
                }
              }
              
              URL.revokeObjectURL(url);
              resolve(hasContrast);
            } catch (error) {
              URL.revokeObjectURL(url);
              resolve(false);
            }
          };

          img.onerror = () => {
            URL.revokeObjectURL(url);
            resolve(false);
          };
        });

        img.src = url;
        const hasContrast = await contrastTest;
        expect(hasContrast).toBe(true);
      }
    });

    it('should maintain readability on various colored backgrounds', async () => {
      const result = await performanceService.optimizeGeneration(testConfig);
      const testBackgrounds = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#808080'];
      
      for (const backgroundColor of testBackgrounds) {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(0, 0, 400, 400);

          const img = new Image();
          const svgBlob = new Blob([result.svg], { type: 'image/svg+xml;charset=utf-8' });
          const url = URL.createObjectURL(svgBlob);

          const contrastTest = new Promise<boolean>((resolve) => {
            img.onload = () => {
              try {
                ctx.drawImage(img, 0, 0, 400, 400);
                
                const imageData = ctx.getImageData(0, 0, 400, 400);
                const pixels = imageData.data;
                
                // Parse background color
                const bgMatch = backgroundColor.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
                const bgRgb = bgMatch ? {
                  r: parseInt(bgMatch[1], 16),
                  g: parseInt(bgMatch[2], 16),
                  b: parseInt(bgMatch[3], 16)
                } : null;
                
                let hasContrast = false;
                if (bgRgb) {
                  for (let i = 0; i < pixels.length; i += 4) {
                    const r = pixels[i];
                    const g = pixels[i + 1];
                    const b = pixels[i + 2];
                    const a = pixels[i + 3];
                    
                    if (a < 128) continue;
                    
                    const colorDiff = Math.abs(r - bgRgb.r) + Math.abs(g - bgRgb.g) + Math.abs(b - bgRgb.b);
                    if (colorDiff > 100) {
                      hasContrast = true;
                      break;
                    }
                  }
                }
                
                URL.revokeObjectURL(url);
                resolve(hasContrast);
              } catch (error) {
                URL.revokeObjectURL(url);
                resolve(false);
              }
            };

            img.onerror = () => {
              URL.revokeObjectURL(url);
              resolve(false);
            };
          });

          img.src = url;
          const hasContrast = await contrastTest;
          expect(hasContrast).toBe(true);
        }
      }
    });
  });

  describe('SVG Size Validation', () => {
    it('should optimize SVG to reduce file size', async () => {
      // Generate unoptimized badge first
      const unoptimizedResult = await hummingbirdBadgeService.generateHummingbirdBadge(testConfig);
      const unoptimizedSize = new Blob([unoptimizedResult.svg || '']).size;
      
      // Generate optimized badge
      const optimizedResult = await performanceService.optimizeGeneration(testConfig);
      const optimizedSize = new Blob([optimizedResult.svg]).size;
      
      // Optimized should be smaller or equal (in case it was already optimal)
      expect(optimizedSize).toBeLessThanOrEqual(unoptimizedSize);
      expect(optimizedSize).toBeLessThan(50 * 1024); // Still under 50KB
    });

    it('should maintain SVG validity after optimization', async () => {
      const result = await performanceService.optimizeGeneration(testConfig);
      
      // Check basic SVG structure
      expect(result.svg).toContain('<svg');
      expect(result.svg).toContain('</svg>');
      expect(result.svg).toContain('hummingbird-body');
      expect(result.svg).toContain('hummingbird-wings');
      
      // Validate XML structure
      const parser = new DOMParser();
      const doc = parser.parseFromString(result.svg, 'image/svg+xml');
      const parseError = doc.querySelector('parsererror');
      
      expect(parseError).toBeNull();
    });
  });

  describe('Comprehensive Validation', () => {
    it('should pass all validation requirements', async () => {
      const validation = await performanceService.validateHummingbirdBadge(testConfig);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(validation.generationTime).toBeLessThan(100);
      expect(validation.size).toBeLessThan(50 * 1024);
      expect(validation.scalabilityPassed).toBe(true);
      expect(validation.contrastPassed).toBe(true);
    });

    it('should provide detailed validation results', async () => {
      const validation = await performanceService.validateHummingbirdBadge(testConfig);
      
      expect(validation.generationTime).toBeGreaterThan(0);
      expect(validation.size).toBeGreaterThan(0);
      expect(typeof validation.scalabilityPassed).toBe('boolean');
      expect(typeof validation.contrastPassed).toBe('boolean');
      expect(Array.isArray(validation.errors)).toBe(true);
      expect(Array.isArray(validation.warnings)).toBe(true);
    });
  });

  describe('Performance Benchmarking', () => {
    it('should benchmark generation across multiple configurations', async () => {
      const configs = [
        hummingbirdBadgeService.createDefaultHummingbirdConfig('user1', 'bronze', 'kakamega'),
        hummingbirdBadgeService.createDefaultHummingbirdConfig('user2', 'silver', 'karura'),
        hummingbirdBadgeService.createDefaultHummingbirdConfig('user3', 'gold', 'mau'),
      ];

      const benchmark = await performanceService.benchmarkGeneration(configs, 3);
      
      expect(benchmark.averageTime).toBeLessThan(100);
      expect(benchmark.minTime).toBeGreaterThan(0);
      expect(benchmark.maxTime).toBeLessThan(200); // Allow some variance
      expect(benchmark.averageSize).toBeLessThan(50 * 1024);
      expect(benchmark.successRate).toBeGreaterThan(0.8); // At least 80% success rate
    });
  });

  describe('Different Configuration Performance', () => {
    it('should meet performance requirements for all tier levels', async () => {
      const tiers = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
      
      for (const tier of tiers) {
        const config = hummingbirdBadgeService.createDefaultHummingbirdConfig('test-user', tier);
        const result = await performanceService.optimizeGeneration(config);
        
        expect(result.metrics.generationTime).toBeLessThan(100);
        expect(result.metrics.svgSize).toBeLessThan(50 * 1024);
        expect(result.metrics.isValid).toBe(true);
      }
    });

    it('should meet performance requirements for all forest themes', async () => {
      const forests = ['kakamega', 'karura', 'mau'];
      
      for (const forest of forests) {
        const config = hummingbirdBadgeService.createDefaultHummingbirdConfig('test-user', 'bronze', forest);
        const result = await performanceService.optimizeGeneration(config);
        
        expect(result.metrics.generationTime).toBeLessThan(100);
        expect(result.metrics.svgSize).toBeLessThan(50 * 1024);
        expect(result.metrics.isValid).toBe(true);
      }
    });

    it('should meet performance requirements for all wing styles', async () => {
      const wingStyles: Array<'geometric' | 'organic' | 'hybrid'> = ['geometric', 'organic', 'hybrid'];
      
      for (const wingStyle of wingStyles) {
        const config = hummingbirdBadgeService.createDefaultHummingbirdConfig('test-user');
        config.wingStyle = wingStyle;
        
        const result = await performanceService.optimizeGeneration(config);
        
        expect(result.metrics.generationTime).toBeLessThan(100);
        expect(result.metrics.svgSize).toBeLessThan(50 * 1024);
        expect(result.metrics.isValid).toBe(true);
      }
    });
  });
});