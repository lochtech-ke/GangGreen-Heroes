/**
 * Hummingbird Badge Generation Service
 * Specialized service for generating welcome hummingbird badges
 */

import { BadgeConfig, BadgeGenerationResult, BadgeMetadata } from '../types/badge.types';
import { badgeSvgService } from './badgeSvg.service';
import { getTierStyle } from '../assets/badges/styles/tierStyles';
import { getForestTheme } from '../assets/badges/styles/forestThemes';

export interface HummingbirdBadgeConfig extends Omit<BadgeConfig, 'achievement'> {
  achievement: 'welcome_badge';
  wingStyle?: 'geometric' | 'organic' | 'hybrid';
  colorPalette?: 'vibrant' | 'subtle' | 'forest-themed';
  animationLevel?: 'none' | 'subtle' | 'dynamic';
}

export interface HummingbirdBadgeMetadata extends BadgeMetadata {
  badgeName: 'Hummingbird Welcome Badge';
  achievementType: 'welcome_badge';
  welcomeMessage: string;
  registrationDate: string;
  platformVersion: string;
}

/**
 * Hummingbird Badge Generator Class
 * Core generator for hummingbird badge creation with configuration options
 */
class HummingbirdBadgeGenerator {
  private config: HummingbirdBadgeConfig;
  
  constructor(config: HummingbirdBadgeConfig) {
    this.config = {
      wingStyle: 'hybrid',
      colorPalette: 'vibrant',
      animationLevel: 'subtle',
      ...config,
    };
  }

  /**
   * Generate the hummingbird badge SVG
   */
  async generate(): Promise<BadgeGenerationResult> {
    const service = new HummingbirdBadgeService();
    return await service.generateHummingbirdBadge(this.config);
  }

  /**
   * Update configuration options
   */
  updateConfig(updates: Partial<HummingbirdBadgeConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Get current configuration
   */
  getConfig(): HummingbirdBadgeConfig {
    return { ...this.config };
  }

  /**
   * Set wing style
   */
  setWingStyle(style: 'geometric' | 'organic' | 'hybrid'): HummingbirdBadgeGenerator {
    this.config.wingStyle = style;
    return this;
  }

  /**
   * Set color palette
   */
  setColorPalette(palette: 'vibrant' | 'subtle' | 'forest-themed'): HummingbirdBadgeGenerator {
    this.config.colorPalette = palette;
    return this;
  }

  /**
   * Set animation level
   */
  setAnimationLevel(level: 'none' | 'subtle' | 'dynamic'): HummingbirdBadgeGenerator {
    this.config.animationLevel = level;
    return this;
  }

  /**
   * Apply forest-themed styling
   */
  applyForestTheme(): HummingbirdBadgeGenerator {
    this.config.colorPalette = 'forest-themed';
    this.config.wingStyle = 'organic';
    return this;
  }

  /**
   * Apply vibrant styling for social sharing
   */
  applyVibrantStyle(): HummingbirdBadgeGenerator {
    this.config.colorPalette = 'vibrant';
    this.config.wingStyle = 'hybrid';
    this.config.animationLevel = 'dynamic';
    return this;
  }

  /**
   * Apply subtle styling for professional contexts
   */
  applySubtleStyle(): HummingbirdBadgeGenerator {
    this.config.colorPalette = 'subtle';
    this.config.wingStyle = 'geometric';
    this.config.animationLevel = 'none';
    return this;
  }
}

/**
 * Hummingbird Badge Service Class
 */
class HummingbirdBadgeService {
  /**
   * Generate hummingbird welcome badge
   */
  async generateHummingbirdBadge(config: HummingbirdBadgeConfig): Promise<BadgeGenerationResult> {
    try {
      // Load hummingbird-specific template
      const template = await this.loadHummingbirdTemplate(config);
      
      // Generate SVG defs with hummingbird-specific gradients
      const defs = this.generateHummingbirdDefs(config.tier, config);
      
      // Load forest pattern
      const forestPatternContent = await this.getForestPatternContent(config.forest);
      
      // Build complete SVG
      let svg = template;
      
      // Replace placeholders
      svg = this.replaceHummingbirdPlaceholders(svg, config);
      
      // Insert defs
      svg = svg.replace('<defs>', `<defs>${defs}`);
      
      // Insert forest pattern
      if (forestPatternContent) {
        svg = svg.replace(
          '<g id="forest-theme" opacity="0.2">',
          `<g id="forest-theme" opacity="0.2">${forestPatternContent}</g><g>`
        );
      }
      
      // Apply animation level
      if (config.animationLevel === 'none') {
        svg = this.removeAnimations(svg);
      } else if (config.animationLevel === 'dynamic') {
        svg = this.enhanceAnimations(svg);
      }
      
      // Embed metadata
      svg = this.embedHummingbirdMetadata(svg, config.metadata as HummingbirdBadgeMetadata);
      
      console.log('[HummingbirdBadgeService] Hummingbird badge generated successfully:', {
        badgeId: config.id,
        tier: config.tier,
        forest: config.forest,
        wingStyle: config.wingStyle,
        colorPalette: config.colorPalette,
      });

      return {
        success: true,
        svg,
        metadata: config.metadata,
      };
    } catch (error) {
      console.error('[HummingbirdBadgeService] Error generating hummingbird badge:', {
        badgeId: config.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      // Fallback to regular badge service
      return await badgeSvgService.generateBadge(config);
    }
  }

  /**
   * Load hummingbird-specific template
   */
  private async loadHummingbirdTemplate(config: HummingbirdBadgeConfig): Promise<string> {
    try {
      const response = await fetch('/src/assets/badges/templates/hummingbird-template.svg');
      if (!response.ok) {
        throw new Error(`Failed to load hummingbird template: ${response.statusText}`);
      }
      let template = await response.text();
      
      // Apply wing style modifications
      template = this.applyWingStyleToTemplate(template, config.wingStyle || 'hybrid');
      
      return template;
    } catch (error) {
      console.error('Error loading hummingbird template:', error);
      // Fallback to base template
      const response = await fetch('/src/assets/badges/templates/base-template.svg');
      return await response.text();
    }
  }

  /**
   * Apply wing style modifications to template
   */
  private applyWingStyleToTemplate(template: string, wingStyle: string): string {
    switch (wingStyle) {
      case 'geometric':
        // Replace curved wing paths with more angular, geometric shapes
        return template.replace(
          /d="M -6,-12 C -26,-19 -34,-8 -30,4 C -26,12 -19,15 -11,11 C -7,8 -6,0 -6,-12 Z"/g,
          'd="M -6,-12 L -26,-19 L -34,-8 L -30,4 L -26,12 L -19,15 L -11,11 L -7,8 L -6,0 Z"'
        ).replace(
          /d="M 6,-12 C 26,-19 34,-8 30,4 C 26,12 19,15 11,11 C 7,8 6,0 6,-12 Z"/g,
          'd="M 6,-12 L 26,-19 L 34,-8 L 30,4 L 26,12 L 19,15 L 11,11 L 7,8 L 6,0 Z"'
        );
      case 'organic':
        // Enhance curved paths for more organic feel
        return template.replace(
          /d="M -6,-12 C -26,-19 -34,-8 -30,4 C -26,12 -19,15 -11,11 C -7,8 -6,0 -6,-12 Z"/g,
          'd="M -6,-12 C -28,-22 -38,-10 -32,6 C -28,14 -21,17 -13,13 C -9,10 -6,2 -6,-12 Z"'
        ).replace(
          /d="M 6,-12 C 26,-19 34,-8 30,4 C 26,12 19,15 11,11 C 7,8 6,0 6,-12 Z"/g,
          'd="M 6,-12 C 28,-22 38,-10 32,6 C 28,14 21,17 13,13 C 9,10 6,2 6,-12 Z"'
        );
      case 'hybrid':
      default:
        // Keep the original hybrid design
        return template;
    }
  }

  /**
   * Generate hummingbird-specific SVG defs
   */
  private generateHummingbirdDefs(tier: string, config: HummingbirdBadgeConfig): string {
    const tierStyle = getTierStyle(tier as any);
    const colorPalette = this.getColorPalette(config.colorPalette || 'vibrant', config.forest);
    const tierEffects = this.getTierSpecificEffects(tier as any);
    
    return `
      <!-- Hummingbird-specific gradients -->
      <linearGradient id="hummingbirdBodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${colorPalette.body.start}" />
        <stop offset="50%" stop-color="${colorPalette.body.middle}" />
        <stop offset="100%" stop-color="${colorPalette.body.end}" />
      </linearGradient>
      
      <linearGradient id="hummingbirdWingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${colorPalette.wings.start}" />
        <stop offset="30%" stop-color="${colorPalette.wings.middle1}" />
        <stop offset="70%" stop-color="${colorPalette.wings.middle2}" />
        <stop offset="100%" stop-color="${colorPalette.wings.end}" />
      </linearGradient>
      
      <radialGradient id="hummingbirdShimmer" cx="50%" cy="30%">
        <stop offset="0%" stop-color="rgba(255,255,255,${colorPalette.shimmer.intensity})" />
        <stop offset="50%" stop-color="rgba(255,255,255,${colorPalette.shimmer.intensity * 0.5})" />
        <stop offset="100%" stop-color="rgba(255,255,255,0)" />
      </radialGradient>
      
      <!-- Tier-specific gradients with enhanced effects -->
      <linearGradient id="tierGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${tierStyle.gradientStart}" />
        <stop offset="50%" stop-color="${tierStyle.primaryColor}" />
        <stop offset="100%" stop-color="${tierStyle.gradientEnd}" />
      </linearGradient>
      
      <!-- Tier-specific metallic border -->
      <linearGradient id="tierBorderGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${this.lightenColor(tierStyle.primaryColor, 30)}" />
        <stop offset="25%" stop-color="${tierStyle.primaryColor}" />
        <stop offset="50%" stop-color="${this.darkenColor(tierStyle.primaryColor, 20)}" />
        <stop offset="75%" stop-color="${tierStyle.primaryColor}" />
        <stop offset="100%" stop-color="${this.darkenColor(tierStyle.primaryColor, 30)}" />
      </linearGradient>
      
      <!-- Enhanced glassmorphism filter with tier-specific intensity -->
      <filter id="glassEffect">
        <feGaussianBlur in="SourceGraphic" stdDeviation="${tierEffects.glassBlur}" result="blur"/>
        <feColorMatrix in="blur" type="matrix" 
          values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${tierEffects.glassOpacity} 0" result="glass"/>
        <feBlend in="SourceGraphic" in2="glass" mode="normal"/>
      </filter>
      
      <!-- Tier-specific glow filter -->
      <filter id="tierGlow">
        <feGaussianBlur stdDeviation="${tierEffects.glowRadius}" result="coloredBlur"/>
        <feFlood flood-color="${tierStyle.primaryColor}" flood-opacity="${tierStyle.glowIntensity}"/>
        <feComposite in2="coloredBlur" operator="in" result="glow"/>
        <feMerge>
          <feMergeNode in="glow"/>
          <feMergeNode in="glow"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      
      <filter id="dropShadow">
        <feGaussianBlur in="SourceAlpha" stdDeviation="${tierEffects.shadowBlur}"/>
        <feOffset dx="0" dy="${tierEffects.shadowOffset}" result="offsetblur"/>
        <feComponentTransfer>
          <feFuncA type="linear" slope="${tierEffects.shadowOpacity}"/>
        </feComponentTransfer>
        <feMerge>
          <feMergeNode/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      
      ${tierEffects.additionalFilters}
    `;
  }

  /**
   * Replace hummingbird-specific placeholders
   */
  private replaceHummingbirdPlaceholders(template: string, config: HummingbirdBadgeConfig): string {
    const tierStyle = getTierStyle(config.tier);
    const forestTheme = getForestTheme(config.forest);
    
    const replacements: Record<string, string> = {
      '{{gradientStart}}': tierStyle.gradientStart,
      '{{primaryColor}}': tierStyle.primaryColor,
      '{{gradientEnd}}': tierStyle.gradientEnd,
      '{{badgeName}}': config.metadata.badgeName,
      '{{tierLevel}}': config.metadata.tierLevel.toString(),
      '{{forestName}}': forestTheme.name,
      '{{achievementType}}': 'welcome_badge',
      '{{achievementName}}': 'Hummingbird Welcome',
      '{{achievementCount}}': '1',
      '{{achievementUnit}}': 'Welcome',
      '{{earnedDate}}': new Date(config.metadata.earnedDate).toLocaleDateString(),
      '{{uniqueBadgeId}}': config.metadata.uniqueBadgeId,
      '{{userId}}': config.metadata.userId,
      '{{tierName}}': config.tier.charAt(0).toUpperCase() + config.tier.slice(1),
    };
    
    let result = template;
    for (const [placeholder, value] of Object.entries(replacements)) {
      result = result.replace(new RegExp(placeholder, 'g'), value);
    }
    
    return result;
  }

  /**
   * Get forest pattern content adapted for hummingbird badge
   */
  private async getForestPatternContent(forest: string): Promise<string> {
    try {
      const response = await fetch(`/src/assets/badges/patterns/${forest}-pattern.svg`);
      if (!response.ok) {
        return this.getDefaultForestPattern();
      }
      const content = await response.text();
      
      // Extract and adapt forest-specific elements for hummingbird badge
      return this.adaptForestPatternForHummingbird(content, forest);
    } catch (error) {
      console.warn(`Error loading ${forest} pattern:`, error);
      return this.getDefaultForestPattern();
    }
  }

  /**
   * Adapt forest pattern elements specifically for hummingbird badge
   */
  private adaptForestPatternForHummingbird(svgContent: string, forest: string): string {
    const forestTheme = getForestTheme(forest as any);
    
    switch (forest) {
      case 'kakamega':
        return this.createKakamegaHummingbirdElements(forestTheme);
      case 'karura':
        return this.createKaruraHummingbirdElements(forestTheme);
      case 'mau':
        return this.createMauHummingbirdElements(forestTheme);
      default:
        return this.getDefaultForestPattern();
    }
  }

  /**
   * Create Kakamega forest elements adapted for hummingbird badge
   */
  private createKakamegaHummingbirdElements(theme: any): string {
    return `
      <!-- Kakamega tropical elements around hummingbird -->
      <g opacity="0.2">
        <!-- Tropical leaves in corners -->
        <path d="M 50 50 Q 45 65 40 85 Q 45 70 50 50 Q 55 70 60 85 Q 55 65 50 50" 
              fill="${theme.colors[0]}"/>
        <path d="M 350 60 Q 345 72 340 90 Q 345 76 350 60 Q 355 76 360 90 Q 355 72 350 60" 
              fill="${theme.colors[1]}"/>
        
        <!-- Butterfly near hummingbird -->
        <g transform="translate(120, 150)" opacity="0.3">
          <ellipse cx="-3" cy="-2" rx="4" ry="5" fill="${theme.colors[2]}" transform="rotate(-20)"/>
          <ellipse cx="3" cy="-2" rx="4" ry="5" fill="${theme.colors[2]}" transform="rotate(20)"/>
          <ellipse cx="-3" cy="2" rx="3" ry="4" fill="${theme.colors[1]}" transform="rotate(-20)"/>
          <ellipse cx="3" cy="2" rx="3" ry="4" fill="${theme.colors[1]}" transform="rotate(20)"/>
          <line x1="0" y1="-3" x2="0" y2="3" stroke="${theme.colors[0]}" stroke-width="1"/>
        </g>
        
        <!-- Rainfall effect -->
        <g opacity="0.15">
          <line x1="80" y1="0" x2="78" y2="30" stroke="${theme.colors[2]}" stroke-width="0.5"/>
          <line x1="320" y1="0" x2="318" y2="35" stroke="${theme.colors[1]}" stroke-width="0.5"/>
          <line x1="150" y1="50" x2="148" y2="80" stroke="${theme.colors[2]}" stroke-width="0.5"/>
        </g>
      </g>
    `;
  }

  /**
   * Create Karura forest elements adapted for hummingbird badge
   */
  private createKaruraHummingbirdElements(theme: any): string {
    return `
      <!-- Karura urban forest elements around hummingbird -->
      <g opacity="0.2">
        <!-- Tree silhouettes in background -->
        <circle cx="80" cy="320" r="25" fill="${theme.colors[0]}"/>
        <circle cx="70" cy="325" r="18" fill="${theme.colors[0]}" opacity="0.8"/>
        <circle cx="90" cy="325" r="18" fill="${theme.colors[0]}" opacity="0.8"/>
        
        <circle cx="320" cy="310" r="20" fill="${theme.colors[1]}"/>
        <circle cx="312" cy="315" r="14" fill="${theme.colors[1]}" opacity="0.8"/>
        <circle cx="328" cy="315" r="14" fill="${theme.colors[1]}" opacity="0.8"/>
        
        <!-- Birds in flight -->
        <g opacity="0.25">
          <path d="M 100 120 Q 95 117 90 120 Q 95 117 100 120" 
                fill="none" stroke="${theme.colors[0]}" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M 300 100 Q 295 97 290 100 Q 295 97 300 100" 
                fill="none" stroke="${theme.colors[1]}" stroke-width="1.5" stroke-linecap="round"/>
        </g>
        
        <!-- Geometric nature elements -->
        <rect x="60" y="60" width="8" height="8" fill="none" stroke="${theme.colors[0]}" stroke-width="1" opacity="0.3"/>
        <circle cx="340" cy="70" r="6" fill="none" stroke="${theme.colors[1]}" stroke-width="1" opacity="0.3"/>
        
        <!-- Subtle city skyline -->
        <g opacity="0.1">
          <rect x="50" y="350" width="15" height="50" fill="${theme.colors[1]}"/>
          <rect x="70" y="340" width="12" height="60" fill="${theme.colors[1]}"/>
          <rect x="320" y="345" width="18" height="55" fill="${theme.colors[1]}"/>
          <rect x="345" y="355" width="14" height="45" fill="${theme.colors[1]}"/>
        </g>
      </g>
    `;
  }

  /**
   * Create Mau forest elements adapted for hummingbird badge
   */
  private createMauHummingbirdElements(theme: any): string {
    return `
      <!-- Mau highland elements around hummingbird -->
      <g opacity="0.2">
        <!-- Mountain ridges -->
        <path d="M 0 350 L 60 320 L 100 340 L 150 310 L 200 330 L 250 315 L 300 335 L 350 320 L 400 340 L 400 350 Z" 
              fill="${theme.colors[0]}"/>
        
        <!-- Water stream -->
        <path d="M 80 300 Q 100 320 120 350 Q 130 370 140 400" 
              fill="none" stroke="${theme.colors[2]}" stroke-width="2" stroke-linecap="round" opacity="0.4"/>
        <path d="M 280 310 Q 260 330 240 360 Q 230 380 220 400" 
              fill="none" stroke="${theme.colors[2]}" stroke-width="1.5" stroke-linecap="round" opacity="0.4"/>
        
        <!-- Highland mist -->
        <ellipse cx="150" cy="280" rx="40" ry="12" fill="${theme.colors[2]}" opacity="0.3"/>
        <ellipse cx="280" cy="290" rx="35" ry="10" fill="${theme.colors[2]}" opacity="0.3"/>
        
        <!-- Conifer trees -->
        <g transform="translate(70, 330)" opacity="0.4">
          <path d="M 0 0 L -6 12 L 6 12 Z" fill="${theme.colors[0]}"/>
          <path d="M 0 6 L -8 18 L 8 18 Z" fill="${theme.colors[0]}"/>
          <rect x="-1.5" y="18" width="3" height="8" fill="${theme.colors[1]}"/>
        </g>
        
        <g transform="translate(330, 325)" opacity="0.4">
          <path d="M 0 0 L -5 10 L 5 10 Z" fill="${theme.colors[1]}"/>
          <path d="M 0 5 L -7 15 L 7 15 Z" fill="${theme.colors[1]}"/>
          <rect x="-1" y="15" width="2" height="6" fill="${theme.colors[0]}"/>
        </g>
        
        <!-- Snow caps on distant peaks -->
        <ellipse cx="150" cy="310" rx="12" ry="4" fill="${theme.colors[2]}" opacity="0.5"/>
        <ellipse cx="250" cy="315" rx="10" ry="3" fill="${theme.colors[2]}" opacity="0.5"/>
      </g>
    `;
  }

  /**
   * Get color palette based on configuration
   */
  private getColorPalette(palette: string, forest: string) {
    const forestTheme = getForestTheme(forest as any);
    
    switch (palette) {
      case 'vibrant':
        return {
          body: { start: '#20B2AA', middle: '#48D1CC', end: '#00CED1' },
          wings: { start: '#2E8B57', middle1: '#3CB371', middle2: '#20B2AA', end: '#48D1CC' },
          shimmer: { intensity: 0.8 },
        };
      case 'subtle':
        return {
          body: { start: '#5F9EA0', middle: '#708090', end: '#778899' },
          wings: { start: '#696969', middle1: '#708090', middle2: '#778899', end: '#87CEEB' },
          shimmer: { intensity: 0.4 },
        };
      case 'forest-themed':
        return {
          body: { start: forestTheme.colors[0], middle: forestTheme.colors[1], end: forestTheme.colors[2] },
          wings: { start: forestTheme.colors[0], middle1: forestTheme.colors[1], middle2: forestTheme.colors[2], end: forestTheme.colors[1] },
          shimmer: { intensity: 0.6 },
        };
      default:
        return this.getColorPalette('vibrant', forest);
    }
  }

  /**
   * Get tier-specific visual effects
   */
  private getTierSpecificEffects(tier: any) {
    const effects = {
      bronze: {
        glassBlur: 8,
        glassOpacity: 0.15,
        glowRadius: 2,
        shadowBlur: 3,
        shadowOffset: 1,
        shadowOpacity: 0.2,
        additionalFilters: '',
      },
      silver: {
        glassBlur: 10,
        glassOpacity: 0.2,
        glowRadius: 3,
        shadowBlur: 4,
        shadowOffset: 2,
        shadowOpacity: 0.25,
        additionalFilters: `
          <filter id="silverShine">
            <feGaussianBlur stdDeviation="2" result="shine"/>
            <feFlood flood-color="#E8E8E8" flood-opacity="0.3"/>
            <feComposite in2="shine" operator="in" result="shineEffect"/>
            <feMerge>
              <feMergeNode in="SourceGraphic"/>
              <feMergeNode in="shineEffect"/>
            </feMerge>
          </filter>
        `,
      },
      gold: {
        glassBlur: 12,
        glassOpacity: 0.25,
        glowRadius: 4,
        shadowBlur: 5,
        shadowOffset: 2,
        shadowOpacity: 0.3,
        additionalFilters: `
          <filter id="goldGlow">
            <feGaussianBlur stdDeviation="3" result="glow"/>
            <feFlood flood-color="#FFD700" flood-opacity="0.4"/>
            <feComposite in2="glow" operator="in" result="goldEffect"/>
            <feMerge>
              <feMergeNode in="goldEffect"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        `,
      },
      platinum: {
        glassBlur: 14,
        glassOpacity: 0.3,
        glowRadius: 5,
        shadowBlur: 6,
        shadowOffset: 3,
        shadowOpacity: 0.35,
        additionalFilters: `
          <filter id="platinumLuster">
            <feGaussianBlur stdDeviation="4" result="luster"/>
            <feFlood flood-color="#FFFFFF" flood-opacity="0.5"/>
            <feComposite in2="luster" operator="in" result="platinumEffect"/>
            <feMerge>
              <feMergeNode in="platinumEffect"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        `,
      },
      diamond: {
        glassBlur: 16,
        glassOpacity: 0.35,
        glowRadius: 6,
        shadowBlur: 8,
        shadowOffset: 4,
        shadowOpacity: 0.4,
        additionalFilters: `
          <filter id="diamondSparkle">
            <feGaussianBlur stdDeviation="5" result="sparkle"/>
            <feFlood flood-color="#B9F2FF" flood-opacity="0.6"/>
            <feComposite in2="sparkle" operator="in" result="sparkleEffect"/>
            <feGaussianBlur in="sparkleEffect" stdDeviation="1" result="sparkleBlur"/>
            <feMerge>
              <feMergeNode in="sparkleBlur"/>
              <feMergeNode in="sparkleEffect"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        `,
      },
    };
    
    return effects[tier] || effects.bronze;
  }

  /**
   * Lighten a hex color by percentage
   */
  private lightenColor(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, ((num >> 16) & 0xff) + amt);
    const G = Math.min(255, ((num >> 8) & 0xff) + amt);
    const B = Math.min(255, (num & 0xff) + amt);
    return `#${((R << 16) | (G << 8) | B).toString(16).padStart(6, '0')}`;
  }

  /**
   * Darken a hex color by percentage
   */
  private darkenColor(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, ((num >> 16) & 0xff) - amt);
    const G = Math.max(0, ((num >> 8) & 0xff) - amt);
    const B = Math.max(0, (num & 0xff) - amt);
    return `#${((R << 16) | (G << 8) | B).toString(16).padStart(6, '0')}`;
  }

  /**
   * Get default forest pattern
   */
  private getDefaultForestPattern(): string {
    return `
      <circle cx="100" cy="100" r="30" fill="#2D5016" opacity="0.3"/>
      <circle cx="300" cy="150" r="40" fill="#2D5016" opacity="0.3"/>
      <circle cx="200" cy="300" r="35" fill="#2D5016" opacity="0.3"/>
    `;
  }

  /**
   * Remove animations from SVG
   */
  private removeAnimations(svg: string): string {
    return svg.replace(/<animateTransform[^>]*>[\s\S]*?<\/animateTransform>/g, '');
  }

  /**
   * Enhance animations in SVG
   */
  private enhanceAnimations(svg: string): string {
    // Add more dynamic wing flapping
    return svg.replace(
      'dur="0.3s"',
      'dur="0.2s"'
    ).replace(
      'repeatCount="indefinite"',
      'repeatCount="indefinite" begin="0s;2s"'
    );
  }

  /**
   * Embed hummingbird-specific metadata
   */
  private embedHummingbirdMetadata(svg: string, metadata: HummingbirdBadgeMetadata): string {
    const metadataXML = `
    <metadata>
      <badge>
        <name>${this.escapeXML(metadata.badgeName)}</name>
        <tier>${metadata.tierLevel}</tier>
        <forest>${this.escapeXML(metadata.forestName)}</forest>
        <achievement>${metadata.achievementType}</achievement>
        <count>1</count>
        <date>${metadata.earnedDate}</date>
        <id>${metadata.uniqueBadgeId}</id>
        <user>${metadata.userId}</user>
        <welcomeMessage>${this.escapeXML(metadata.welcomeMessage)}</welcomeMessage>
        <registrationDate>${metadata.registrationDate}</registrationDate>
        <platformVersion>${metadata.platformVersion}</platformVersion>
      </badge>
    </metadata>
    `;
    
    // Insert metadata after opening svg tag
    return svg.replace(/<svg([^>]*)>/, `<svg$1>${metadataXML}`);
  }

  /**
   * Escape XML special characters
   */
  private escapeXML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Create default hummingbird badge configuration
   */
  createDefaultHummingbirdConfig(userId: string, tier: string = 'bronze', forest: string = 'kakamega'): HummingbirdBadgeConfig {
    const now = new Date().toISOString();
    
    return {
      id: `hummingbird-welcome-${userId}-${Date.now()}`,
      tier: tier as any,
      forest: forest as any,
      achievement: 'welcome_badge',
      wingStyle: 'hybrid',
      colorPalette: 'vibrant',
      animationLevel: 'subtle',
      metadata: {
        badgeName: 'Hummingbird Welcome Badge',
        tierLevel: 1,
        forestName: forest.charAt(0).toUpperCase() + forest.slice(1) + ' Forest',
        achievementType: 'welcome_badge',
        achievementCount: 1,
        earnedDate: now,
        uniqueBadgeId: `hummingbird-${userId}-${Date.now()}`,
        userId,
        welcomeMessage: 'Welcome to the #GangGreen community!',
        registrationDate: now,
        platformVersion: '1.0.0',
      } as HummingbirdBadgeMetadata,
    };
  }

  /**
   * Validate hummingbird badge configuration
   */
  validateHummingbirdConfig(config: HummingbirdBadgeConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (config.achievement !== 'welcome_badge') {
      errors.push('Achievement type must be welcome_badge for hummingbird badges');
    }
    
    if (config.wingStyle && !['geometric', 'organic', 'hybrid'].includes(config.wingStyle)) {
      errors.push('Invalid wing style. Must be geometric, organic, or hybrid');
    }
    
    if (config.colorPalette && !['vibrant', 'subtle', 'forest-themed'].includes(config.colorPalette)) {
      errors.push('Invalid color palette. Must be vibrant, subtle, or forest-themed');
    }
    
    if (config.animationLevel && !['none', 'subtle', 'dynamic'].includes(config.animationLevel)) {
      errors.push('Invalid animation level. Must be none, subtle, or dynamic');
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Export singleton instance
export const hummingbirdBadgeService = new HummingbirdBadgeService();

// Export classes for testing and usage
export { HummingbirdBadgeService, HummingbirdBadgeGenerator };

/**
 * Factory function to create a hummingbird badge generator
 */
export function createHummingbirdBadgeGenerator(config: HummingbirdBadgeConfig): HummingbirdBadgeGenerator {
  return new HummingbirdBadgeGenerator(config);
}

/**
 * Quick generation function for common use cases
 */
export async function generateWelcomeBadge(
  userId: string,
  options: {
    tier?: string;
    forest?: string;
    wingStyle?: 'geometric' | 'organic' | 'hybrid';
    colorPalette?: 'vibrant' | 'subtle' | 'forest-themed';
    animationLevel?: 'none' | 'subtle' | 'dynamic';
  } = {}
): Promise<BadgeGenerationResult> {
  const config = hummingbirdBadgeService.createDefaultHummingbirdConfig(
    userId,
    options.tier,
    options.forest
  );
  
  if (options.wingStyle) config.wingStyle = options.wingStyle;
  if (options.colorPalette) config.colorPalette = options.colorPalette;
  if (options.animationLevel) config.animationLevel = options.animationLevel;
  
  const generator = new HummingbirdBadgeGenerator(config);
  return await generator.generate();
}