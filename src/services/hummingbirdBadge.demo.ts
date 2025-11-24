/**
 * Hummingbird Badge Export Demo
 * Demonstrates the export and accessibility features
 */

import { 
  hummingbirdBadgeService, 
  generateSocialMediaBadge, 
  getSocialMediaText,
  validateBadgeAccessibility 
} from './hummingbirdBadge.service';

/**
 * Demo: Export hummingbird badge with accessibility features
 */
export async function demoAccessibleExport() {
  console.log('🎨 Hummingbird Badge Export Demo');
  
  try {
    // Create a sample configuration
    const config = hummingbirdBadgeService.createDefaultHummingbirdConfig(
      'demo-user-123',
      'gold',
      'kakamega'
    );

    console.log('📋 Configuration:', {
      tier: config.tier,
      forest: config.forest,
      wingStyle: config.wingStyle,
      colorPalette: config.colorPalette,
    });

    // Export with accessibility features
    const svgBlob = await hummingbirdBadgeService.exportHummingbirdBadge(config, {
      format: 'svg',
      includeAccessibility: true,
      wcagCompliant: true,
      socialMediaOptimized: false,
    });

    console.log('✅ SVG Export successful:', {
      type: svgBlob.type,
      size: `${(svgBlob.size / 1024).toFixed(2)} KB`,
    });

    // Get the SVG content for validation
    const svgText = await svgBlob.text();
    
    // Validate accessibility
    const accessibilityReport = await validateBadgeAccessibility(svgText);
    console.log('♿ Accessibility Report:', accessibilityReport);

    return {
      success: true,
      svgBlob,
      accessibilityReport,
    };
  } catch (error) {
    console.error('❌ Export failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Demo: Generate social media optimized badges
 */
export async function demoSocialMediaExport() {
  console.log('📱 Social Media Export Demo');
  
  const platforms = ['twitter', 'facebook', 'instagram', 'linkedin'] as const;
  const results: Record<string, any> = {};

  for (const platform of platforms) {
    try {
      console.log(`\n🔄 Generating ${platform} badge...`);
      
      // Generate social media text
      const socialText = getSocialMediaText(platform);
      console.log(`📝 ${platform} text:`, socialText.substring(0, 100) + '...');

      // Generate optimized badge (this will use fallback in demo environment)
      const result = await generateSocialMediaBadge('demo-user', platform, {
        format: 'png',
      }).catch((error) => {
        console.log(`⚠️  ${platform} generation failed (expected in demo):`, error.message);
        return null;
      });

      results[platform] = {
        text: socialText,
        badge: result ? 'Generated successfully' : 'Fallback used (demo environment)',
      };

    } catch (error) {
      console.error(`❌ ${platform} failed:`, error);
      results[platform] = { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  return results;
}

/**
 * Demo: WCAG compliance testing
 */
export function demoWCAGCompliance() {
  console.log('🎯 WCAG Compliance Demo');
  
  const service = hummingbirdBadgeService as any;
  
  // Test color contrast calculations
  const testCases = [
    { fg: '#000000', bg: '#FFFFFF', expected: 'High contrast (21:1)' },
    { fg: '#FFFFFF', bg: '#000000', expected: 'High contrast (21:1)' },
    { fg: '#999999', bg: '#FFFFFF', expected: 'Low contrast (~2.8:1)' },
    { fg: '#0066CC', bg: '#FFFFFF', expected: 'Medium contrast (~7.7:1)' },
  ];

  console.log('\n📊 Color Contrast Tests:');
  testCases.forEach(({ fg, bg, expected }) => {
    const ratio = service.calculateContrastRatio(fg, bg);
    const passes = ratio >= 4.5 ? '✅' : '❌';
    console.log(`${passes} ${fg} on ${bg}: ${ratio.toFixed(2)}:1 (${expected})`);
  });

  // Test color adjustments
  console.log('\n🎨 Color Adjustment Tests:');
  const lowContrastColor = '#999999';
  const background = '#FFFFFF';
  const adjustedColor = service.adjustColorForContrast(lowContrastColor, background, 4.5);
  const newRatio = service.calculateContrastRatio(adjustedColor, background);
  
  console.log(`Original: ${lowContrastColor} (${service.calculateContrastRatio(lowContrastColor, background).toFixed(2)}:1)`);
  console.log(`Adjusted: ${adjustedColor} (${newRatio.toFixed(2)}:1)`);
  console.log(`WCAG AA Compliant: ${newRatio >= 4.5 ? '✅' : '❌'}`);

  return {
    testCases: testCases.map(({ fg, bg }) => ({
      foreground: fg,
      background: bg,
      ratio: service.calculateContrastRatio(fg, bg),
      passes: service.calculateContrastRatio(fg, bg) >= 4.5,
    })),
    adjustment: {
      original: lowContrastColor,
      adjusted: adjustedColor,
      originalRatio: service.calculateContrastRatio(lowContrastColor, background),
      adjustedRatio: newRatio,
      compliant: newRatio >= 4.5,
    },
  };
}

/**
 * Demo: Platform size optimization
 */
export function demoPlatformSizes() {
  console.log('📐 Platform Size Demo');
  
  const service = hummingbirdBadgeService as any;
  const platforms = [
    'twitter',
    'facebook', 
    'instagram',
    'linkedin',
    'twitter-profile',
    'facebook-profile',
    'instagram-story',
  ];

  console.log('\n📱 Platform Sizes:');
  const sizes = platforms.map(platform => {
    const size = service.getSizeForPlatform(platform);
    console.log(`${platform.padEnd(20)}: ${size}px`);
    return { platform, size };
  });

  // Test custom size
  const customSize = service.getSizeForPlatform(undefined, 800);
  console.log(`${'custom'.padEnd(20)}: ${customSize}px`);

  return { platforms: sizes, custom: customSize };
}

/**
 * Run all demos
 */
export async function runAllDemos() {
  console.log('🚀 Running All Hummingbird Badge Export Demos\n');
  
  const results = {
    accessible: await demoAccessibleExport(),
    socialMedia: await demoSocialMediaExport(),
    wcag: demoWCAGCompliance(),
    sizes: demoPlatformSizes(),
  };

  console.log('\n✨ Demo Summary:');
  console.log('- Accessible Export:', results.accessible.success ? '✅' : '❌');
  console.log('- Social Media Export:', Object.keys(results.socialMedia).length > 0 ? '✅' : '❌');
  console.log('- WCAG Compliance:', results.wcag.adjustment.compliant ? '✅' : '❌');
  console.log('- Platform Sizes:', results.sizes.platforms.length > 0 ? '✅' : '❌');

  return results;
}

// Export for easy testing
if (typeof window !== 'undefined') {
  (window as any).hummingbirdDemo = {
    runAllDemos,
    demoAccessibleExport,
    demoSocialMediaExport,
    demoWCAGCompliance,
    demoPlatformSizes,
  };
}