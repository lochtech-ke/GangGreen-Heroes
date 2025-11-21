/**
 * Badge SVG Generation Service
 * Main service for generating NFT badge SVGs
 */

import { BadgeConfig, BadgeGenerationResult, BadgeExportOptions } from '../types/badge.types';
import { generateSVGDefs } from '../utils/svgGenerators';
import { renderIcon } from '../utils/badgeIconRenderer';
import {
  loadBaseTemplate,
  loadForestPattern,
  replacePlaceholders,
  embedMetadata,
  validateBadgeConfig,
  optimizeSVG,
  extractSVGContent,
} from '../utils/badgeTemplateLoader';
import { BADGE_VIEWBOX } from '../assets/badges';

/**
 * Badge SVG Service Class
 */
class BadgeSvgService {
  private templateCache: Map<string, string> = new Map();
  private patternCache: Map<string, string> = new Map();

  /**
   * Generate complete badge SVG
   */
  async generateBadge(config: BadgeConfig): Promise<BadgeGenerationResult> {
    try {
      // Validate configuration
      const validation = validateBadgeConfig(config);
      if (!validation.valid) {
        console.error('[BadgeSvgService] Invalid configuration:', {
          badgeId: config.id,
          errors: validation.errors,
        });
        return {
          success: false,
          error: `Invalid configuration: ${validation.errors.join(', ')}`,
        };
      }

      // Load base template with error handling
      let template: string;
      try {
        template = await this.getTemplate();
      } catch (templateError) {
        console.error('[BadgeSvgService] Template loading failed:', {
          badgeId: config.id,
          error: templateError,
        });
        // Use fallback badge generation
        return this.generateFallbackBadgeResult(config);
      }

      // Generate SVG defs (gradients and filters)
      let defs: string;
      try {
        defs = generateSVGDefs(config.tier);
      } catch (defsError) {
        console.error('[BadgeSvgService] Defs generation failed:', {
          badgeId: config.id,
          tier: config.tier,
          error: defsError,
        });
        defs = ''; // Continue without defs
      }

      // Load forest pattern with fallback
      let forestPatternContent = '';
      try {
        const forestPattern = await this.getForestPattern(config.forest);
        forestPatternContent = extractSVGContent(forestPattern);
      } catch (patternError) {
        console.warn('[BadgeSvgService] Forest pattern loading failed, using default:', {
          badgeId: config.id,
          forest: config.forest,
          error: patternError,
        });
        // Use default pattern or empty
        forestPatternContent = this.getDefaultForestPattern();
      }

      // Render achievement icon with fallback
      let iconSVG = '';
      try {
        iconSVG = await renderIcon(config.achievement, 200, 180, {
          size: 120,
          backdropOpacity: 0.3,
        });
      } catch (iconError) {
        console.warn('[BadgeSvgService] Icon rendering failed, using fallback:', {
          badgeId: config.id,
          achievement: config.achievement,
          error: iconError,
        });
        iconSVG = this.getFallbackIcon();
      }

      // Build complete SVG
      let svg = template;

      // Replace placeholders
      try {
        svg = replacePlaceholders(svg, config);
      } catch (placeholderError) {
        console.error('[BadgeSvgService] Placeholder replacement failed:', {
          badgeId: config.id,
          error: placeholderError,
        });
        return this.generateFallbackBadgeResult(config);
      }

      // Insert defs
      if (defs) {
        svg = svg.replace('<defs>', `<defs>${defs}`);
      }

      // Insert forest pattern
      if (forestPatternContent) {
        svg = svg.replace(
          '<g id="forest-theme" opacity="0.2">',
          `<g id="forest-theme" opacity="0.2">${forestPatternContent}</g><g>`
        );
      }

      // Insert achievement icon
      if (iconSVG) {
        svg = svg.replace(
          '<!-- Icon will be inserted here -->',
          iconSVG
        );
      }

      // Embed metadata
      try {
        svg = embedMetadata(svg, config.metadata);
      } catch (metadataError) {
        console.warn('[BadgeSvgService] Metadata embedding failed, continuing without:', {
          badgeId: config.id,
          error: metadataError,
        });
        // Continue without metadata
      }

      // Optimize if not animated
      if (!config.animated) {
        try {
          svg = optimizeSVG(svg);
        } catch (optimizeError) {
          console.warn('[BadgeSvgService] SVG optimization failed, using unoptimized:', {
            badgeId: config.id,
            error: optimizeError,
          });
          // Continue with unoptimized SVG
        }
      }

      console.log('[BadgeSvgService] Badge generated successfully:', {
        badgeId: config.id,
        tier: config.tier,
        forest: config.forest,
        achievement: config.achievement,
      });

      return {
        success: true,
        svg,
        metadata: config.metadata,
      };
    } catch (error) {
      console.error('[BadgeSvgService] Unexpected error generating badge:', {
        badgeId: config.id,
        tier: config.tier,
        forest: config.forest,
        achievement: config.achievement,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      
      // Return fallback badge
      return this.generateFallbackBadgeResult(config);
    }
  }

  /**
   * Export badge to PNG
   */
  async exportToPng(svgString: string, size: number = 1200): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          throw new Error('Could not get canvas context');
        }

        // Create image from SVG
        const img = new Image();
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
          // Draw image on canvas
          ctx.drawImage(img, 0, 0, size, size);

          // Convert to PNG blob
          canvas.toBlob(
            (blob) => {
              URL.revokeObjectURL(url);
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to create PNG blob'));
              }
            },
            'image/png',
            1.0
          );
        };

        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error('Failed to load SVG image'));
        };

        img.src = url;
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Export badge with options
   */
  async exportBadge(
    config: BadgeConfig,
    options: BadgeExportOptions = { format: 'svg' }
  ): Promise<Blob> {
    const result = await this.generateBadge(config);

    if (!result.success || !result.svg) {
      throw new Error(result.error || 'Failed to generate badge');
    }

    if (options.format === 'png') {
      const size = options.size || this.getSizeForPlatform(options.platform);
      return await this.exportToPng(result.svg, size);
    }

    // Return SVG as blob
    return new Blob([result.svg], { type: 'image/svg+xml;charset=utf-8' });
  }

  /**
   * Validate generated badge
   */
  validateBadge(svgString: string): boolean {
    try {
      // Check if it's valid XML
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgString, 'image/svg+xml');

      // Check for parse errors
      const parseError = doc.querySelector('parsererror');
      if (parseError) {
        console.error('SVG parse error:', parseError.textContent);
        return false;
      }

      // Check for required elements
      const svg = doc.querySelector('svg');
      if (!svg) {
        console.error('No SVG element found');
        return false;
      }

      // Check viewBox
      const viewBox = svg.getAttribute('viewBox');
      if (viewBox !== BADGE_VIEWBOX) {
        console.warn('Unexpected viewBox:', viewBox);
      }

      return true;
    } catch (error) {
      console.error('Badge validation error:', error);
      return false;
    }
  }

  /**
   * Get template (with caching)
   */
  private async getTemplate(): Promise<string> {
    const cacheKey = 'base-template';

    if (this.templateCache.has(cacheKey)) {
      return this.templateCache.get(cacheKey)!;
    }

    const template = await loadBaseTemplate();
    this.templateCache.set(cacheKey, template);
    return template;
  }

  /**
   * Get forest pattern (with caching)
   */
  private async getForestPattern(forest: string): Promise<string> {
    if (this.patternCache.has(forest)) {
      return this.patternCache.get(forest)!;
    }

    const pattern = await loadForestPattern(forest);
    this.patternCache.set(forest, pattern);
    return pattern;
  }

  /**
   * Get export size for social media platform
   */
  private getSizeForPlatform(platform?: string): number {
    const sizes: Record<string, number> = {
      twitter: 1200,
      facebook: 1200,
      instagram: 1080,
      linkedin: 1200,
    };

    return platform ? sizes[platform] || 1200 : 1200;
  }

  /**
   * Clear caches
   */
  clearCache(): void {
    this.templateCache.clear();
    this.patternCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { templates: number; patterns: number } {
    return {
      templates: this.templateCache.size,
      patterns: this.patternCache.size,
    };
  }

  /**
   * Check if templates are available
   */
  async checkTemplateAvailability(): Promise<boolean> {
    try {
      await this.getTemplate();
      return true;
    } catch (error) {
      console.error('[BadgeSvgService] Template availability check failed:', error);
      return false;
    }
  }

  /**
   * Generate fallback badge when normal generation fails
   */
  private generateFallbackBadgeResult(config: BadgeConfig): BadgeGenerationResult {
    console.log('[BadgeSvgService] Generating fallback badge:', {
      badgeId: config.id,
      tier: config.tier,
    });

    const svg = this.generateFallbackBadge(config);
    
    return {
      success: true,
      svg,
      metadata: config.metadata,
    };
  }

  /**
   * Generate simple fallback badge SVG
   */
  private generateFallbackBadge(config: BadgeConfig): string {
    const tierColors: Record<string, { primary: string; secondary: string }> = {
      bronze: { primary: '#CD7F32', secondary: '#8B4513' },
      silver: { primary: '#C0C0C0', secondary: '#808080' },
      gold: { primary: '#FFD700', secondary: '#FFA500' },
      platinum: { primary: '#E5E4E2', secondary: '#B0B0B0' },
      diamond: { primary: '#B9F2FF', secondary: '#00CED1' },
    };

    const colors = tierColors[config.tier] || tierColors.bronze;
    const badgeName = config.metadata?.badgeName || 'Badge';
    const tierName = config.tier.charAt(0).toUpperCase() + config.tier.slice(1);

    return `
      <svg viewBox="${BADGE_VIEWBOX}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="fallback-gradient-${config.id}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${colors.secondary};stop-opacity:1" />
          </linearGradient>
          <filter id="fallback-shadow-${config.id}">
            <feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.3"/>
          </filter>
        </defs>
        
        <!-- Background Circle -->
        <circle cx="250" cy="250" r="220" fill="url(#fallback-gradient-${config.id})" filter="url(#fallback-shadow-${config.id})"/>
        
        <!-- Inner Circle -->
        <circle cx="250" cy="250" r="180" fill="none" stroke="white" stroke-width="4" opacity="0.3"/>
        
        <!-- Award Icon -->
        <g transform="translate(250, 250)">
          <path d="M0,-80 L20,-40 L60,-40 L30,-10 L40,30 L0,0 L-40,30 L-30,-10 L-60,-40 L-20,-40 Z" 
                fill="white" opacity="0.9"/>
        </g>
        
        <!-- Tier Text -->
        <text x="250" y="380" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="white">
          ${tierName}
        </text>
        
        <!-- Badge Name -->
        <text x="250" y="420" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="white" opacity="0.8">
          ${badgeName}
        </text>
      </svg>
    `.trim();
  }

  /**
   * Get default forest pattern when loading fails
   */
  private getDefaultForestPattern(): string {
    return `
      <circle cx="100" cy="100" r="30" fill="#2D5016" opacity="0.3"/>
      <circle cx="400" cy="150" r="40" fill="#2D5016" opacity="0.3"/>
      <circle cx="200" cy="400" r="35" fill="#2D5016" opacity="0.3"/>
    `.trim();
  }

  /**
   * Get fallback icon when rendering fails
   */
  private getFallbackIcon(): string {
    return `
      <g transform="translate(250, 250)">
        <circle cx="0" cy="0" r="60" fill="white" opacity="0.2"/>
        <path d="M0,-40 L12,-12 L40,-12 L18,6 L24,34 L0,16 L-24,34 L-18,6 L-40,-12 L-12,-12 Z" 
              fill="white" opacity="0.8"/>
      </g>
    `.trim();
  }
}

// Export singleton instance
export const badgeSvgService = new BadgeSvgService();

// Export class for testing
export { BadgeSvgService };
