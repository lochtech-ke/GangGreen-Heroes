/**
 * Performance validation script for hummingbird badge generation
 * Validates Requirements 4.4, 4.5, 2.5, 5.4
 */

import { hummingbirdBadgePerformanceService } from './hummingbirdBadge.performance';
import { hummingbirdBadgeService } from './hummingbirdBadge.service';

/**
 * Validate performance requirements
 */
export async function validatePerformanceRequirements(): Promise<{
  passed: boolean;
  results: {
    generationTime: { passed: boolean; value: number; requirement: number };
    svgSize: { passed: boolean; value: number; requirement: number };
    scalability: { passed: boolean; details: string };
    contrast: { passed: boolean; details: string };
  };
  errors: string[];
}> {
  const errors: string[] = [];
  
  try {
    // Create test configuration
    const testConfig = hummingbirdBadgeService.createDefaultHummingbirdConfig('performance-test-user');
    
    // Test performance optimization
    console.log('[Performance Validation] Testing badge generation performance...');
    const startTime = performance.now();
    const result = await hummingbirdBadgePerformanceService.optimizeGeneration(testConfig);
    const endTime = performance.now();
    const actualGenerationTime = endTime - startTime;
    
    // Validate generation time (Requirement 4.4)
    const generationTimePassed = actualGenerationTime <= 100;
    if (!generationTimePassed) {
      errors.push(`Generation time ${actualGenerationTime.toFixed(2)}ms exceeds 100ms requirement`);
    }
    
    // Validate SVG size (Requirement 4.5)
    const svgSize = new Blob([result.svg]).size;
    const svgSizePassed = svgSize <= 50 * 1024;
    if (!svgSizePassed) {
      errors.push(`SVG size ${(svgSize / 1024).toFixed(2)}KB exceeds 50KB requirement`);
    }
    
    // Test vector scalability (Requirement 2.5)
    console.log('[Performance Validation] Testing vector scalability...');
    const scalabilityPassed = await hummingbirdBadgePerformanceService.testVectorScalability(result.svg);
    if (!scalabilityPassed) {
      errors.push('Vector scalability test failed for 50px-1200px range');
    }
    
    // Test background contrast (Requirement 5.4)
    console.log('[Performance Validation] Testing background contrast compatibility...');
    const contrastPassed = await hummingbirdBadgePerformanceService.testBackgroundContrast(result.svg);
    if (!contrastPassed) {
      errors.push('Background contrast compatibility test failed');
    }
    
    const allPassed = generationTimePassed && svgSizePassed && scalabilityPassed && contrastPassed;
    
    console.log('[Performance Validation] Results:', {
      generationTime: `${actualGenerationTime.toFixed(2)}ms (${generationTimePassed ? 'PASS' : 'FAIL'})`,
      svgSize: `${(svgSize / 1024).toFixed(2)}KB (${svgSizePassed ? 'PASS' : 'FAIL'})`,
      scalability: scalabilityPassed ? 'PASS' : 'FAIL',
      contrast: contrastPassed ? 'PASS' : 'FAIL',
      overall: allPassed ? 'PASS' : 'FAIL',
    });
    
    return {
      passed: allPassed,
      results: {
        generationTime: {
          passed: generationTimePassed,
          value: actualGenerationTime,
          requirement: 100,
        },
        svgSize: {
          passed: svgSizePassed,
          value: svgSize,
          requirement: 50 * 1024,
        },
        scalability: {
          passed: scalabilityPassed,
          details: scalabilityPassed ? 'All sizes 50px-1200px render correctly' : 'Some sizes failed to render',
        },
        contrast: {
          passed: contrastPassed,
          details: contrastPassed ? 'All background colors show good contrast' : 'Some backgrounds have poor contrast',
        },
      },
      errors,
    };
  } catch (error) {
    const errorMessage = `Performance validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    errors.push(errorMessage);
    console.error('[Performance Validation]', errorMessage);
    
    return {
      passed: false,
      results: {
        generationTime: { passed: false, value: 0, requirement: 100 },
        svgSize: { passed: false, value: 0, requirement: 50 * 1024 },
        scalability: { passed: false, details: 'Test failed to run' },
        contrast: { passed: false, details: 'Test failed to run' },
      },
      errors,
    };
  }
}

/**
 * Validate performance across different configurations
 */
export async function validatePerformanceAcrossConfigurations(): Promise<{
  passed: boolean;
  results: Array<{
    config: string;
    passed: boolean;
    generationTime: number;
    svgSize: number;
  }>;
  errors: string[];
}> {
  const errors: string[] = [];
  const results: Array<{
    config: string;
    passed: boolean;
    generationTime: number;
    svgSize: number;
  }> = [];
  
  try {
    console.log('[Performance Validation] Testing across different configurations...');
    
    // Test different tier levels
    const tiers = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
    for (const tier of tiers) {
      const config = hummingbirdBadgeService.createDefaultHummingbirdConfig(`test-${tier}`, tier);
      
      const startTime = performance.now();
      const result = await hummingbirdBadgePerformanceService.optimizeGeneration(config);
      const endTime = performance.now();
      
      const generationTime = endTime - startTime;
      const svgSize = new Blob([result.svg]).size;
      
      const passed = generationTime <= 100 && svgSize <= 50 * 1024;
      
      results.push({
        config: `${tier} tier`,
        passed,
        generationTime,
        svgSize,
      });
      
      if (!passed) {
        errors.push(`${tier} tier failed performance requirements`);
      }
    }
    
    // Test different forest themes
    const forests = ['kakamega', 'karura', 'mau'];
    for (const forest of forests) {
      const config = hummingbirdBadgeService.createDefaultHummingbirdConfig(`test-${forest}`, 'bronze', forest);
      
      const startTime = performance.now();
      const result = await hummingbirdBadgePerformanceService.optimizeGeneration(config);
      const endTime = performance.now();
      
      const generationTime = endTime - startTime;
      const svgSize = new Blob([result.svg]).size;
      
      const passed = generationTime <= 100 && svgSize <= 50 * 1024;
      
      results.push({
        config: `${forest} forest`,
        passed,
        generationTime,
        svgSize,
      });
      
      if (!passed) {
        errors.push(`${forest} forest failed performance requirements`);
      }
    }
    
    const allPassed = results.every(r => r.passed);
    
    console.log('[Performance Validation] Configuration test results:', {
      totalConfigs: results.length,
      passed: results.filter(r => r.passed).length,
      failed: results.filter(r => !r.passed).length,
      overall: allPassed ? 'PASS' : 'FAIL',
    });
    
    return {
      passed: allPassed,
      results,
      errors,
    };
  } catch (error) {
    const errorMessage = `Configuration validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    errors.push(errorMessage);
    console.error('[Performance Validation]', errorMessage);
    
    return {
      passed: false,
      results,
      errors,
    };
  }
}

/**
 * Run comprehensive performance validation
 */
export async function runPerformanceValidation(): Promise<{
  passed: boolean;
  summary: string;
  details: {
    basicRequirements: any;
    configurationTests: any;
  };
}> {
  console.log('[Performance Validation] Starting comprehensive performance validation...');
  
  const basicRequirements = await validatePerformanceRequirements();
  const configurationTests = await validatePerformanceAcrossConfigurations();
  
  const overallPassed = basicRequirements.passed && configurationTests.passed;
  
  const summary = overallPassed 
    ? 'All performance requirements met successfully'
    : `Performance validation failed: ${[...basicRequirements.errors, ...configurationTests.errors].join(', ')}`;
  
  console.log('[Performance Validation] Comprehensive validation complete:', {
    basicRequirements: basicRequirements.passed ? 'PASS' : 'FAIL',
    configurationTests: configurationTests.passed ? 'PASS' : 'FAIL',
    overall: overallPassed ? 'PASS' : 'FAIL',
  });
  
  return {
    passed: overallPassed,
    summary,
    details: {
      basicRequirements,
      configurationTests,
    },
  };
}

// Export for use in other modules
export { hummingbirdBadgePerformanceService };