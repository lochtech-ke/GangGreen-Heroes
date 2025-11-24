/**
 * Hummingbird Badge Integration Examples
 * Demonstrates how to use the enhanced hummingbird badge service
 */

import { 
  HummingbirdBadgeGenerator,
  createHummingbirdBadgeGenerator,
  generateWelcomeBadge,
  hummingbirdBadgeService
} from './hummingbirdBadge.service';

/**
 * Example 1: Basic welcome badge generation
 */
export async function generateBasicWelcomeBadge(userId: string) {
  return await generateWelcomeBadge(userId);
}

/**
 * Example 2: Custom welcome badge with options
 */
export async function generateCustomWelcomeBadge(userId: string) {
  return await generateWelcomeBadge(userId, {
    tier: 'gold',
    forest: 'mau',
    wingStyle: 'organic',
    colorPalette: 'forest-themed',
    animationLevel: 'dynamic'
  });
}

/**
 * Example 3: Using the generator class with fluent API
 */
export async function generateFluentWelcomeBadge(userId: string) {
  const config = hummingbirdBadgeService.createDefaultHummingbirdConfig(userId, 'silver', 'karura');
  
  const generator = createHummingbirdBadgeGenerator(config)
    .setWingStyle('geometric')
    .setColorPalette('vibrant')
    .setAnimationLevel('subtle');
  
  return await generator.generate();
}

/**
 * Example 4: Applying preset styles
 */
export async function generatePresetStyleBadges(userId: string) {
  const config = hummingbirdBadgeService.createDefaultHummingbirdConfig(userId);
  
  // Forest-themed badge
  const forestBadge = await createHummingbirdBadgeGenerator(config)
    .applyForestTheme()
    .generate();
  
  // Vibrant social media badge
  const vibrantBadge = await createHummingbirdBadgeGenerator(config)
    .applyVibrantStyle()
    .generate();
  
  // Subtle professional badge
  const subtleBadge = await createHummingbirdBadgeGenerator(config)
    .applySubtleStyle()
    .generate();
  
  return {
    forest: forestBadge,
    vibrant: vibrantBadge,
    subtle: subtleBadge
  };
}

/**
 * Example 5: Dynamic configuration updates
 */
export async function generateDynamicBadge(userId: string, userPreferences: any) {
  const config = hummingbirdBadgeService.createDefaultHummingbirdConfig(userId);
  const generator = new HummingbirdBadgeGenerator(config);
  
  // Apply user preferences
  if (userPreferences.preferMinimal) {
    generator.applySubtleStyle();
  } else if (userPreferences.loveNature) {
    generator.applyForestTheme();
  } else {
    generator.applyVibrantStyle();
  }
  
  // Additional customizations
  if (userPreferences.noAnimations) {
    generator.setAnimationLevel('none');
  }
  
  return await generator.generate();
}

/**
 * Example 6: Batch generation for different tiers
 */
export async function generateTierBadges(userId: string) {
  const tiers = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
  const badges = [];
  
  for (const tier of tiers) {
    const badge = await generateWelcomeBadge(userId, {
      tier,
      wingStyle: 'hybrid',
      colorPalette: 'vibrant',
      animationLevel: 'subtle'
    });
    badges.push({ tier, badge });
  }
  
  return badges;
}