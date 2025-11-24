/**
 * Hummingbird Badge Showcase
 * Demonstrates all tier and forest combinations with different styles
 */

import { 
  HummingbirdBadgeGenerator,
  createHummingbirdBadgeGenerator,
  hummingbirdBadgeService
} from './hummingbirdBadge.service';

export interface BadgeShowcaseItem {
  tier: string;
  forest: string;
  style: string;
  config: any;
  badge?: any;
}

/**
 * Generate showcase of all tier and forest combinations
 */
export async function generateTierForestShowcase(userId: string): Promise<BadgeShowcaseItem[]> {
  const tiers = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
  const forests = ['kakamega', 'karura', 'mau'];
  
  const showcase: BadgeShowcaseItem[] = [];
  
  // Generate one badge for each tier-forest combination with vibrant style
  for (const tier of tiers) {
    for (const forest of forests) {
      const config = hummingbirdBadgeService.createDefaultHummingbirdConfig(userId, tier, forest);
      const generator = createHummingbirdBadgeGenerator(config).applyVibrantStyle();
      
      try {
        const badge = await generator.generate();
        showcase.push({
          tier,
          forest,
          style: 'vibrant',
          config: generator.getConfig(),
          badge
        });
      } catch (error) {
        console.error(`Failed to generate ${tier}-${forest} badge:`, error);
        showcase.push({
          tier,
          forest,
          style: 'vibrant',
          config: generator.getConfig(),
          badge: null
        });
      }
    }
  }
  
  return showcase;
}

/**
 * Generate style variations for a specific tier-forest combination
 */
export async function generateStyleVariations(
  userId: string, 
  tier: string = 'gold', 
  forest: string = 'kakamega'
): Promise<BadgeShowcaseItem[]> {
  const styles = [
    { name: 'vibrant', apply: (gen: HummingbirdBadgeGenerator) => gen.applyVibrantStyle() },
    { name: 'subtle', apply: (gen: HummingbirdBadgeGenerator) => gen.applySubtleStyle() },
    { name: 'forest-themed', apply: (gen: HummingbirdBadgeGenerator) => gen.applyForestTheme() }
  ];
  
  const variations: BadgeShowcaseItem[] = [];
  
  for (const style of styles) {
    const config = hummingbirdBadgeService.createDefaultHummingbirdConfig(userId, tier, forest);
    const generator = style.apply(createHummingbirdBadgeGenerator(config));
    
    try {
      const badge = await generator.generate();
      variations.push({
        tier,
        forest,
        style: style.name,
        config: generator.getConfig(),
        badge
      });
    } catch (error) {
      console.error(`Failed to generate ${style.name} variation:`, error);
      variations.push({
        tier,
        forest,
        style: style.name,
        config: generator.getConfig(),
        badge: null
      });
    }
  }
  
  return variations;
}

/**
 * Generate tier progression showcase for a specific forest
 */
export async function generateTierProgression(
  userId: string, 
  forest: string = 'kakamega'
): Promise<BadgeShowcaseItem[]> {
  const tiers = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
  const progression: BadgeShowcaseItem[] = [];
  
  for (const tier of tiers) {
    const config = hummingbirdBadgeService.createDefaultHummingbirdConfig(userId, tier, forest);
    const generator = createHummingbirdBadgeGenerator(config)
      .applyForestTheme()
      .setAnimationLevel('subtle');
    
    try {
      const badge = await generator.generate();
      progression.push({
        tier,
        forest,
        style: 'forest-themed-progression',
        config: generator.getConfig(),
        badge
      });
    } catch (error) {
      console.error(`Failed to generate ${tier} progression badge:`, error);
      progression.push({
        tier,
        forest,
        style: 'forest-themed-progression',
        config: generator.getConfig(),
        badge: null
      });
    }
  }
  
  return progression;
}

/**
 * Generate forest comparison for a specific tier
 */
export async function generateForestComparison(
  userId: string, 
  tier: string = 'gold'
): Promise<BadgeShowcaseItem[]> {
  const forests = ['kakamega', 'karura', 'mau'];
  const comparison: BadgeShowcaseItem[] = [];
  
  for (const forest of forests) {
    const config = hummingbirdBadgeService.createDefaultHummingbirdConfig(userId, tier, forest);
    const generator = createHummingbirdBadgeGenerator(config)
      .applyForestTheme()
      .setWingStyle('organic')
      .setAnimationLevel('dynamic');
    
    try {
      const badge = await generator.generate();
      comparison.push({
        tier,
        forest,
        style: 'forest-comparison',
        config: generator.getConfig(),
        badge
      });
    } catch (error) {
      console.error(`Failed to generate ${forest} comparison badge:`, error);
      comparison.push({
        tier,
        forest,
        style: 'forest-comparison',
        config: generator.getConfig(),
        badge: null
      });
    }
  }
  
  return comparison;
}

/**
 * Generate wing style variations
 */
export async function generateWingStyleShowcase(
  userId: string,
  tier: string = 'platinum',
  forest: string = 'karura'
): Promise<BadgeShowcaseItem[]> {
  const wingStyles = [
    { name: 'geometric', style: 'geometric' as const },
    { name: 'organic', style: 'organic' as const },
    { name: 'hybrid', style: 'hybrid' as const }
  ];
  
  const showcase: BadgeShowcaseItem[] = [];
  
  for (const wingStyle of wingStyles) {
    const config = hummingbirdBadgeService.createDefaultHummingbirdConfig(userId, tier, forest);
    const generator = createHummingbirdBadgeGenerator(config)
      .setWingStyle(wingStyle.style)
      .setColorPalette('vibrant')
      .setAnimationLevel('subtle');
    
    try {
      const badge = await generator.generate();
      showcase.push({
        tier,
        forest,
        style: `wing-${wingStyle.name}`,
        config: generator.getConfig(),
        badge
      });
    } catch (error) {
      console.error(`Failed to generate ${wingStyle.name} wing style:`, error);
      showcase.push({
        tier,
        forest,
        style: `wing-${wingStyle.name}`,
        config: generator.getConfig(),
        badge: null
      });
    }
  }
  
  return showcase;
}

/**
 * Generate animation level showcase
 */
export async function generateAnimationShowcase(
  userId: string,
  tier: string = 'diamond',
  forest: string = 'mau'
): Promise<BadgeShowcaseItem[]> {
  const animationLevels = [
    { name: 'none', level: 'none' as const },
    { name: 'subtle', level: 'subtle' as const },
    { name: 'dynamic', level: 'dynamic' as const }
  ];
  
  const showcase: BadgeShowcaseItem[] = [];
  
  for (const animation of animationLevels) {
    const config = hummingbirdBadgeService.createDefaultHummingbirdConfig(userId, tier, forest);
    const generator = createHummingbirdBadgeGenerator(config)
      .setAnimationLevel(animation.level)
      .setColorPalette('forest-themed')
      .setWingStyle('hybrid');
    
    try {
      const badge = await generator.generate();
      showcase.push({
        tier,
        forest,
        style: `animation-${animation.name}`,
        config: generator.getConfig(),
        badge
      });
    } catch (error) {
      console.error(`Failed to generate ${animation.name} animation:`, error);
      showcase.push({
        tier,
        forest,
        style: `animation-${animation.name}`,
        config: generator.getConfig(),
        badge: null
      });
    }
  }
  
  return showcase;
}

/**
 * Generate complete showcase with all combinations
 */
export async function generateCompleteShowcase(userId: string): Promise<{
  tierForest: BadgeShowcaseItem[];
  styleVariations: BadgeShowcaseItem[];
  tierProgression: BadgeShowcaseItem[];
  forestComparison: BadgeShowcaseItem[];
  wingStyles: BadgeShowcaseItem[];
  animations: BadgeShowcaseItem[];
}> {
  console.log('Generating complete hummingbird badge showcase...');
  
  const [
    tierForest,
    styleVariations,
    tierProgression,
    forestComparison,
    wingStyles,
    animations
  ] = await Promise.all([
    generateTierForestShowcase(userId),
    generateStyleVariations(userId),
    generateTierProgression(userId),
    generateForestComparison(userId),
    generateWingStyleShowcase(userId),
    generateAnimationShowcase(userId)
  ]);
  
  console.log('Hummingbird badge showcase generation complete!');
  
  return {
    tierForest,
    styleVariations,
    tierProgression,
    forestComparison,
    wingStyles,
    animations
  };
}