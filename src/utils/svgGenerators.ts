/**
 * SVG Gradient and Filter Generators
 * Utilities for creating SVG defs, gradients, and filters
 */

import { SVGGradient, SVGFilter, BadgeTier } from '../types/badge.types';
import { getTierStyle } from '../assets/badges/styles/tierStyles';

/**
 * Generate SVG linear gradient element
 */
export function generateLinearGradient(gradient: SVGGradient): string {
  const { id, x1 = '0%', y1 = '0%', x2 = '100%', y2 = '100%', stops } = gradient;
  
  const stopElements = stops
    .map(
      (stop) =>
        `<stop offset="${stop.offset}" stop-color="${stop.color}"${
          stop.opacity !== undefined ? ` stop-opacity="${stop.opacity}"` : ''
        } />`
    )
    .join('\n      ');
  
  return `
    <linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">
      ${stopElements}
    </linearGradient>
  `;
}

/**
 * Generate SVG radial gradient element
 */
export function generateRadialGradient(gradient: SVGGradient): string {
  const { id, cx = '50%', cy = '50%', r = '50%', stops } = gradient;
  
  const stopElements = stops
    .map(
      (stop) =>
        `<stop offset="${stop.offset}" stop-color="${stop.color}"${
          stop.opacity !== undefined ? ` stop-opacity="${stop.opacity}"` : ''
        } />`
    )
    .join('\n      ');
  
  return `
    <radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">
      ${stopElements}
    </radialGradient>
  `;
}

/**
 * Generate glassmorphism filter
 */
export function generateGlassmorphismFilter(id: string = 'glassEffect'): string {
  return `
    <filter id="${id}">
      <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur"/>
      <feColorMatrix in="blur" type="matrix" 
        values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.2 0" result="glass"/>
      <feBlend in="SourceGraphic" in2="glass" mode="normal"/>
    </filter>
  `;
}

/**
 * Generate drop shadow filter
 */
export function generateDropShadowFilter(
  id: string = 'dropShadow',
  dx: number = 0,
  dy: number = 2,
  blur: number = 4,
  opacity: number = 0.3
): string {
  return `
    <filter id="${id}">
      <feGaussianBlur in="SourceAlpha" stdDeviation="${blur}"/>
      <feOffset dx="${dx}" dy="${dy}" result="offsetblur"/>
      <feComponentTransfer>
        <feFuncA type="linear" slope="${opacity}"/>
      </feComponentTransfer>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  `;
}

/**
 * Generate glow filter for tier
 */
export function generateGlowFilter(
  id: string = 'glowEffect',
  color: string = '#FFFFFF',
  intensity: number = 0.5
): string {
  return `
    <filter id="${id}">
      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
      <feFlood flood-color="${color}" flood-opacity="${intensity}"/>
      <feComposite in2="coloredBlur" operator="in" result="glow"/>
      <feMerge>
        <feMergeNode in="glow"/>
        <feMergeNode in="glow"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  `;
}

/**
 * Generate tier-specific gradient
 */
export function generateTierGradient(tier: BadgeTier, id: string = 'tierGradient'): SVGGradient {
  const style = getTierStyle(tier);
  
  return {
    id,
    type: 'linear',
    x1: '0%',
    y1: '0%',
    x2: '100%',
    y2: '100%',
    stops: [
      { offset: '0%', color: style.gradientStart },
      { offset: '50%', color: style.primaryColor },
      { offset: '100%', color: style.gradientEnd },
    ],
  };
}

/**
 * Generate shine gradient for tier
 */
export function generateTierShineGradient(tier: BadgeTier, id: string = 'shineGradient'): SVGGradient {
  const style = getTierStyle(tier);
  const intensity = style.glowIntensity;
  
  return {
    id,
    type: 'radial',
    cx: '30%',
    cy: '30%',
    r: '50%',
    stops: [
      { offset: '0%', color: '#FFFFFF', opacity: intensity * 0.8 },
      { offset: '50%', color: '#FFFFFF', opacity: intensity * 0.4 },
      { offset: '100%', color: '#FFFFFF', opacity: 0 },
    ],
  };
}

/**
 * Generate metallic border gradient
 */
export function generateMetallicBorderGradient(
  tier: BadgeTier,
  id: string = 'borderGradient'
): SVGGradient {
  const style = getTierStyle(tier);
  
  return {
    id,
    type: 'linear',
    x1: '0%',
    y1: '0%',
    x2: '0%',
    y2: '100%',
    stops: [
      { offset: '0%', color: lightenColor(style.primaryColor, 30) },
      { offset: '25%', color: style.primaryColor },
      { offset: '50%', color: darkenColor(style.primaryColor, 20) },
      { offset: '75%', color: style.primaryColor },
      { offset: '100%', color: darkenColor(style.primaryColor, 30) },
    ],
  };
}

/**
 * Generate all gradients for a tier
 */
export function generateAllTierGradients(tier: BadgeTier): string {
  const tierGradient = generateTierGradient(tier);
  const shineGradient = generateTierShineGradient(tier);
  const borderGradient = generateMetallicBorderGradient(tier);
  
  return [
    generateLinearGradient(tierGradient),
    generateRadialGradient(shineGradient),
    generateLinearGradient(borderGradient),
  ].join('\n');
}

/**
 * Generate all filters for badge
 */
export function generateAllBadgeFilters(): string {
  return [
    generateGlassmorphismFilter('glassEffect'),
    generateDropShadowFilter('dropShadow'),
    generateGlowFilter('glowEffect'),
  ].join('\n');
}

/**
 * Generate complete SVG defs section
 */
export function generateSVGDefs(tier: BadgeTier): string {
  return `
  <defs>
    ${generateAllTierGradients(tier)}
    ${generateAllBadgeFilters()}
  </defs>
  `;
}

/**
 * Lighten a hex color by percentage
 */
function lightenColor(hex: string, percent: number): string {
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
function darkenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, ((num >> 16) & 0xff) - amt);
  const G = Math.max(0, ((num >> 8) & 0xff) - amt);
  const B = Math.max(0, (num & 0xff) - amt);
  return `#${((R << 16) | (G << 8) | B).toString(16).padStart(6, '0')}`;
}

/**
 * Convert RGB to hex color
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

/**
 * Convert hex to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Create gradient with custom stops
 */
export function createCustomGradient(
  id: string,
  type: 'linear' | 'radial',
  stops: Array<{ offset: string; color: string; opacity?: number }>,
  options?: {
    x1?: string;
    y1?: string;
    x2?: string;
    y2?: string;
    cx?: string;
    cy?: string;
    r?: string;
  }
): SVGGradient {
  return {
    id,
    type,
    stops,
    ...options,
  };
}

/**
 * Validate gradient configuration
 */
export function validateGradient(gradient: SVGGradient): boolean {
  if (!gradient.id || gradient.id.trim() === '') {
    console.error('Gradient must have an id');
    return false;
  }
  
  if (!gradient.stops || gradient.stops.length < 2) {
    console.error('Gradient must have at least 2 stops');
    return false;
  }
  
  return true;
}

/**
 * Validate filter configuration
 */
export function validateFilter(filter: SVGFilter): boolean {
  if (!filter.id || filter.id.trim() === '') {
    console.error('Filter must have an id');
    return false;
  }
  
  if (!filter.elements || filter.elements.length === 0) {
    console.error('Filter must have at least one element');
    return false;
  }
  
  return true;
}
