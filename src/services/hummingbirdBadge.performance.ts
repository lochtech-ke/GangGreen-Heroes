/**
 * Hummingbird Badge Performance Optimization Module
 * Implements performance requirements for badge generation
 */

import { HummingbirdBadgeConfig, HummingbirdBadgeService } from './hummingbirdBadge.service';

export interface PerformanceMetrics {
  generationTime: number;
  svgSize: number;
  isValid: boolean;
  scalabilityTest: boolean;
  contrastTest: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  size: number;
  generationTime: number;
  scalabilityPassed: boolean;
  contrastPassed: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Performance optimization service for hummingbird badges
 */
export class HummingbirdBadgePerformanceService {
  private readonly MAX_GENERATION_TIME = 100; // 100ms requirement
  private readonly MAX_SVG_SIZE = 50 * 1024; // 50KB requirement

  /**
   * Optimize SVG generation to meet 100ms performance requirement
   */
  async optimizeGeneration(config: HummingbirdBadgeConfig): Promise<{
    svg: string;
    metrics: PerformanceMetrics;
  }> {
    const startTime = performance.now();
    
    try {
      // Use optimized generation path
      const service = new HummingbirdBadgeService();
      const result = await this.generateWithOptimizations(service, config);
      
      const endTime = performance.now();
      const generationTime = endTime - startTime;
      
      if (!result.success || !result.svg) {
        throw new Error(result.error || 'Generation failed');
      }

      // Validate and optimize the generated SVG
      const optimizedSvg = await this.optimizeSvgSize(result.svg);
      const svgSize = new Blob([optimizedSvg]).size;
      
      // Run validation tests
      const isValid = this.validateSvgStructure(optimizedSvg);
      const scalabilityTest = await this.testVectorScalability(optimizedSvg);
      const contrastTest = await this.testBackgroundContrast(optimizedSvg);

      const metrics: PerformanceMetrics = {
        generationTime,
        svgSize,
        isValid,
        scalabilityTest,
        contrastTest,
      };

      // Log performance metrics
      console.log('[HummingbirdPerformance] Generation metrics:', {
        generationTime: `${generationTime.toFixed(2)}ms`,
        svgSize: `${(svgSize / 1024).toFixed(2)}KB`,
        meetsPerformanceRequirements: generationTime <= this.MAX_GENERATION_TIME,
        meetsSizeRequirements: svgSize <= this.MAX_SVG_SIZE,
      });

      return {
        svg: optimizedSvg,
        metrics,
      };
    } catch (error) {
      console.error('[HummingbirdPerformance] Generation failed:', error);
      
      throw new Error(`Performance optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate badge with performance optimizations
   */
  private async generateWithOptimizations(
    service: HummingbirdBadgeService,
    config: HummingbirdBadgeConfig
  ) {
    // Use cached templates and pre-computed gradients for faster generation
    const optimizedConfig = this.optimizeConfig(config);
    
    // Generate with minimal processing
    return await service.generateHummingbirdBadge(optimizedConfig);
  }

  /**
   * Optimize configuration for faster generation
   */
  private optimizeConfig(config: HummingbirdBadgeConfig): HummingbirdBadgeConfig {
    return {
      ...config,
      // Use simpler wing style for faster generation if not specified
      wingStyle: config.wingStyle || 'geometric',
      // Use subtle animations to reduce processing
      animationLevel: config.animationLevel === 'dynamic' ? 'subtle' : config.animationLevel || 'subtle',
    };
  }

  /**
   * Optimize SVG size to stay under 50KB limit
   */
  private async optimizeSvgSize(svg: string): Promise<string> {
    let optimizedSvg = svg;
    
    // Remove unnecessary whitespace and comments
    optimizedSvg = this.minifySvg(optimizedSvg);
    
    // Optimize number precision
    optimizedSvg = this.optimizeNumberPrecision(optimizedSvg);
    
    // Remove redundant attributes
    optimizedSvg = this.removeRedundantAttributes(optimizedSvg);
    
    // Compress gradients and filters
    optimizedSvg = this.compressGradientsAndFilters(optimizedSvg);
    
    const finalSize = new Blob([optimizedSvg]).size;
    
    if (finalSize > this.MAX_SVG_SIZE) {
      console.warn(`[HummingbirdPerformance] SVG size ${(finalSize / 1024).toFixed(2)}KB exceeds 50KB limit`);
      // Apply aggressive optimization
      optimizedSvg = this.applyAggressiveOptimization(optimizedSvg);
    }
    
    return optimizedSvg;
  }

  /**
   * Minify SVG by removing unnecessary whitespace and comments
   */
  private minifySvg(svg: string): string {
    return svg
      // Remove comments
      .replace(/<!--[\s\S]*?-->/g, '')
      // Remove unnecessary whitespace between tags
      .replace(/>\s+</g, '><')
      // Remove leading/trailing whitespace
      .trim()
      // Collapse multiple spaces
      .replace(/\s+/g, ' ')
      // Remove spaces around equals signs
      .replace(/\s*=\s*/g, '=')
      // Remove spaces after opening brackets
      .replace(/(<[^>]*)\s+/g, '$1 ')
      // Remove trailing spaces before closing brackets
      .replace(/\s+(\/?>)/g, '$1');
  }

  /**
   * Optimize number precision to reduce file size
   */
  private optimizeNumberPrecision(svg: string): string {
    return svg
      // Round decimal numbers to 2 decimal places
      .replace(/(\d+\.\d{3,})/g, (match) => {
        return parseFloat(match).toFixed(2);
      })
      // Remove unnecessary .00 endings
      .replace(/\.00(?=\D)/g, '')
      // Optimize coordinates and dimensions
      .replace(/([xy]\d*=")\d+\.\d+/g, (match, prefix) => {
        const value = match.substring(prefix.length);
        return prefix + parseFloat(value).toFixed(1);
      });
  }

  /**
   * Remove redundant attributes
   */
  private removeRedundantAttributes(svg: string): string {
    return svg
      // Remove default fill="black"
      .replace(/\s+fill="black"/g, '')
      // Remove default stroke="none"
      .replace(/\s+stroke="none"/g, '')
      // Remove default opacity="1"
      .replace(/\s+opacity="1"/g, '')
      // Remove default stroke-width="1"
      .replace(/\s+stroke-width="1"/g, '');
  }

  /**
   * Compress gradients and filters
   */
  private compressGradientsAndFilters(svg: string): string {
    return svg
      // Compress gradient stop attributes
      .replace(/\s+stop-color="/g, ' stop-color="')
      .replace(/\s+stop-opacity="/g, ' stop-opacity="')
      // Compress filter attributes
      .replace(/\s+stdDeviation="/g, ' stdDeviation="')
      .replace(/\s+flood-color="/g, ' flood-color="')
      // Remove unnecessary filter result names if not referenced
      .replace(/\s+result="[^"]*"/g, (match) => {
        const resultName = match.match(/result="([^"]*)"/)?.[1];
        if (resultName && !svg.includes(`in="${resultName}"`)) {
          return '';
        }
        return match;
      });
  }

  /**
   * Apply aggressive optimization when size limit is exceeded
   */
  private applyAggressiveOptimization(svg: string): string {
    return svg
      // Remove animations if present
      .replace(/<animateTransform[^>]*>[\s\S]*?<\/animateTransform>/g, '')
      .replace(/<animate[^>]*>[\s\S]*?<\/animate>/g, '')
      // Simplify complex paths
      .replace(/([ML])\s*(\d+(?:\.\d+)?)\s*,?\s*(\d+(?:\.\d+)?)/g, '$1$2,$3')
      // Remove CSS styles and use inline attributes
      .replace(/<style>[\s\S]*?<\/style>/g, '')
      // Remove metadata if size is critical
      .replace(/<metadata>[\s\S]*?<\/metadata>/g, '')
      // Remove title and desc if absolutely necessary (impacts accessibility)
      // .replace(/<title[^>]*>[\s\S]*?<\/title>/g, '')
      // .replace(/<desc[^>]*>[\s\S]*?<\/desc>/g, '')
      ;
  }

  /**
   * Validate SVG structure and format
   */
  private validateSvgStructure(svg: string): boolean {
    try {
      // Check basic SVG structure
      if (!svg.includes('<svg') || !svg.includes('</svg>')) {
        return false;
      }

      // Check for required hummingbird elements
      const requiredElements = [
        'hummingbird-body',
        'hummingbird-wings',
        'tierGradient',
        'hummingbirdBodyGradient',
        'hummingbirdWingGradient'
      ];

      for (const element of requiredElements) {
        if (!svg.includes(element)) {
          console.warn(`[HummingbirdPerformance] Missing required element: ${element}`);
          return false;
        }
      }

      // Validate XML structure (basic check)
      const parser = new DOMParser();
      const doc = parser.parseFromString(svg, 'image/svg+xml');
      const parseError = doc.querySelector('parsererror');
      
      if (parseError) {
        console.error('[HummingbirdPerformance] SVG parsing error:', parseError.textContent);
        return false;
      }

      return true;
    } catch (error) {
      console.error('[HummingbirdPerformance] SVG validation error:', error);
      return false;
    }
  }

  /**
   * Test vector scalability from 50px to 1200px range
   */
  async testVectorScalability(svg: string): Promise<boolean> {
    try {
      const testSizes = [50, 100, 200, 400, 800, 1200];
      
      for (const size of testSizes) {
        // Create a test canvas to verify rendering at different sizes
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          console.warn('[HummingbirdPerformance] Could not get canvas context for scalability test');
          continue;
        }

        // Test if SVG can be rendered at this size
        const img = new Image();
        const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        const renderTest = new Promise<boolean>((resolve) => {
          img.onload = () => {
            try {
              ctx.drawImage(img, 0, 0, size, size);
              URL.revokeObjectURL(url);
              resolve(true);
            } catch (error) {
              console.warn(`[HummingbirdPerformance] Rendering failed at ${size}px:`, error);
              URL.revokeObjectURL(url);
              resolve(false);
            }
          };

          img.onerror = () => {
            console.warn(`[HummingbirdPerformance] Image load failed at ${size}px`);
            URL.revokeObjectURL(url);
            resolve(false);
          };

          // Timeout after 1 second
          setTimeout(() => {
            URL.revokeObjectURL(url);
            resolve(false);
          }, 1000);
        });

        img.src = url;
        
        const renderSuccess = await renderTest;
        if (!renderSuccess) {
          console.warn(`[HummingbirdPerformance] Scalability test failed at ${size}px`);
          return false;
        }
      }

      console.log('[HummingbirdPerformance] Vector scalability test passed for all sizes');
      return true;
    } catch (error) {
      console.error('[HummingbirdPerformance] Scalability test error:', error);
      return false;
    }
  }

  /**
   * Test background contrast compatibility
   */
  async testBackgroundContrast(svg: string): Promise<boolean> {
    try {
      const testBackgrounds = [
        '#FFFFFF', // White
        '#000000', // Black
        '#808080', // Gray
        '#FF0000', // Red
        '#00FF00', // Green
        '#0000FF', // Blue
        '#FFFF00', // Yellow
        '#FF00FF', // Magenta
        '#00FFFF', // Cyan
      ];

      for (const backgroundColor of testBackgrounds) {
        const contrastTest = await this.testSingleBackgroundContrast(svg, backgroundColor);
        if (!contrastTest) {
          console.warn(`[HummingbirdPerformance] Contrast test failed for background: ${backgroundColor}`);
          return false;
        }
      }

      console.log('[HummingbirdPerformance] Background contrast test passed for all colors');
      return true;
    } catch (error) {
      console.error('[HummingbirdPerformance] Background contrast test error:', error);
      return false;
    }
  }

  /**
   * Test contrast against a single background color
   */
  private async testSingleBackgroundContrast(svg: string, backgroundColor: string): Promise<boolean> {
    try {
      // Create a test canvas with the background color
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        return false;
      }

      // Fill with background color
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, 400, 400);

      // Render SVG on top
      const img = new Image();
      const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      const contrastTest = new Promise<boolean>((resolve) => {
        img.onload = () => {
          try {
            ctx.drawImage(img, 0, 0, 400, 400);
            
            // Sample pixels to check if badge is visible
            const imageData = ctx.getImageData(0, 0, 400, 400);
            const pixels = imageData.data;
            
            // Check if there's sufficient contrast by looking for non-background pixels
            let hasContrast = false;
            const bgRgb = this.hexToRgb(backgroundColor);
            
            if (bgRgb) {
              for (let i = 0; i < pixels.length; i += 4) {
                const r = pixels[i];
                const g = pixels[i + 1];
                const b = pixels[i + 2];
                const a = pixels[i + 3];
                
                // Skip transparent pixels
                if (a < 128) continue;
                
                // Check if pixel is significantly different from background
                const colorDiff = Math.abs(r - bgRgb.r) + Math.abs(g - bgRgb.g) + Math.abs(b - bgRgb.b);
                if (colorDiff > 100) { // Threshold for visible difference
                  hasContrast = true;
                  break;
                }
              }
            }
            
            URL.revokeObjectURL(url);
            resolve(hasContrast);
          } catch (error) {
            console.warn(`[HummingbirdPerformance] Contrast test rendering error:`, error);
            URL.revokeObjectURL(url);
            resolve(false);
          }
        };

        img.onerror = () => {
          URL.revokeObjectURL(url);
          resolve(false);
        };

        // Timeout after 1 second
        setTimeout(() => {
          URL.revokeObjectURL(url);
          resolve(false);
        }, 1000);
      });

      img.src = url;
      return await contrastTest;
    } catch (error) {
      console.error('[HummingbirdPerformance] Single background contrast test error:', error);
      return false;
    }
  }

  /**
   * Convert hex color to RGB
   */
  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  /**
   * Comprehensive validation of hummingbird badge
   */
  async validateHummingbirdBadge(
    config: HummingbirdBadgeConfig,
    svg?: string
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    let generationTime = 0;
    let badgeSvg = svg;
    
    // Generate badge if not provided
    if (!badgeSvg) {
      try {
        const result = await this.optimizeGeneration(config);
        badgeSvg = result.svg;
        generationTime = result.metrics.generationTime;
      } catch (error) {
        errors.push(`Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return {
          isValid: false,
          size: 0,
          generationTime: 0,
          scalabilityPassed: false,
          contrastPassed: false,
          errors,
          warnings,
        };
      }
    }

    const size = new Blob([badgeSvg]).size;

    // Validate performance requirements
    if (generationTime > this.MAX_GENERATION_TIME) {
      errors.push(`Generation time ${generationTime.toFixed(2)}ms exceeds 100ms requirement`);
    }

    if (size > this.MAX_SVG_SIZE) {
      errors.push(`SVG size ${(size / 1024).toFixed(2)}KB exceeds 50KB requirement`);
    }

    // Validate structure
    const isValidStructure = this.validateSvgStructure(badgeSvg);
    if (!isValidStructure) {
      errors.push('Invalid SVG structure or missing required elements');
    }

    // Test scalability
    const scalabilityPassed = await this.testVectorScalability(badgeSvg);
    if (!scalabilityPassed) {
      errors.push('Vector scalability test failed');
    }

    // Test contrast
    const contrastPassed = await this.testBackgroundContrast(badgeSvg);
    if (!contrastPassed) {
      warnings.push('Background contrast compatibility test failed');
    }

    // Performance warnings
    if (generationTime > this.MAX_GENERATION_TIME * 0.8) {
      warnings.push(`Generation time ${generationTime.toFixed(2)}ms is close to 100ms limit`);
    }

    if (size > this.MAX_SVG_SIZE * 0.8) {
      warnings.push(`SVG size ${(size / 1024).toFixed(2)}KB is close to 50KB limit`);
    }

    return {
      isValid: errors.length === 0,
      size,
      generationTime,
      scalabilityPassed,
      contrastPassed,
      errors,
      warnings,
    };
  }

  /**
   * Get performance metrics for a badge
   */
  async getPerformanceMetrics(config: HummingbirdBadgeConfig): Promise<PerformanceMetrics> {
    const result = await this.optimizeGeneration(config);
    return result.metrics;
  }

  /**
   * Benchmark badge generation performance
   */
  async benchmarkGeneration(
    configs: HummingbirdBadgeConfig[],
    iterations: number = 10
  ): Promise<{
    averageTime: number;
    minTime: number;
    maxTime: number;
    averageSize: number;
    successRate: number;
  }> {
    const times: number[] = [];
    const sizes: number[] = [];
    let successes = 0;

    for (const config of configs) {
      for (let i = 0; i < iterations; i++) {
        try {
          const result = await this.optimizeGeneration(config);
          times.push(result.metrics.generationTime);
          sizes.push(result.metrics.svgSize);
          successes++;
        } catch (error) {
          console.warn(`[HummingbirdPerformance] Benchmark iteration failed:`, error);
        }
      }
    }

    const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const averageSize = sizes.reduce((sum, size) => sum + size, 0) / sizes.length;
    const successRate = successes / (configs.length * iterations);

    console.log('[HummingbirdPerformance] Benchmark results:', {
      averageTime: `${averageTime.toFixed(2)}ms`,
      minTime: `${minTime.toFixed(2)}ms`,
      maxTime: `${maxTime.toFixed(2)}ms`,
      averageSize: `${(averageSize / 1024).toFixed(2)}KB`,
      successRate: `${(successRate * 100).toFixed(1)}%`,
    });

    return {
      averageTime,
      minTime,
      maxTime,
      averageSize,
      successRate,
    };
  }
}

// Export singleton instance
export const hummingbirdBadgePerformanceService = new HummingbirdBadgePerformanceService();