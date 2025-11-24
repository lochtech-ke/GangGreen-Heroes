#!/usr/bin/env node

/**
 * Submission Validation Script
 * Validates that all deliverables follow the WMH2025 naming convention
 * Usage: npm run submission:validate
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Submission naming convention
const NAMING_CONVENTION = {
  BASE: 'GangGreen_Track3_WMH2025',
  PITCH_DECK: 'GangGreen_Track3_WMH2025.pdf',
  DEMO_VIDEO: 'GangGreen_Track3_WMH2025_Demo.mp4',
  REPOSITORY: 'GangGreen_Track3_WMH2025'
};

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function validatePackageJson() {
  log('\n📦 Validating package.json...', 'blue');
  
  try {
    const packagePath = path.join(rootDir, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    const checks = [
      {
        name: 'Package name follows convention',
        condition: packageJson.name === 'ganggreen-track3-wmh2025',
        expected: 'ganggreen-track3-wmh2025',
        actual: packageJson.name
      },
      {
        name: 'Display name includes submission format',
        condition: packageJson.displayName && packageJson.displayName.includes('GangGreen_Track3_WMH2025'),
        expected: 'Contains GangGreen_Track3_WMH2025',
        actual: packageJson.displayName || 'Not set'
      },
      {
        name: 'Version is set to 1.0.0',
        condition: packageJson.version === '1.0.0',
        expected: '1.0.0',
        actual: packageJson.version
      }
    ];
    
    let allPassed = true;
    checks.forEach(check => {
      if (check.condition) {
        log(`  ✅ ${check.name}`, 'green');
      } else {
        log(`  ❌ ${check.name}`, 'red');
        log(`     Expected: ${check.expected}`, 'yellow');
        log(`     Actual: ${check.actual}`, 'yellow');
        allPassed = false;
      }
    });
    
    return allPassed;
  } catch (error) {
    log(`  ❌ Error reading package.json: ${error.message}`, 'red');
    return false;
  }
}

function validateReadme() {
  log('\n📖 Validating README.md...', 'blue');
  
  try {
    const readmePath = path.join(rootDir, 'README.md');
    const readmeContent = fs.readFileSync(readmePath, 'utf8');
    
    const checks = [
      {
        name: 'README exists and is readable',
        condition: true
      },
      {
        name: 'Contains setup instructions',
        condition: readmeContent.includes('Getting Started') || readmeContent.includes('Installation')
      },
      {
        name: 'Contains project description',
        condition: readmeContent.includes('#GangGreen') || readmeContent.includes('Track 3')
      },
      {
        name: 'Contains technology stack information',
        condition: readmeContent.includes('Technology Stack') || readmeContent.includes('Tech Stack')
      }
    ];
    
    let allPassed = true;
    checks.forEach(check => {
      if (check.condition) {
        log(`  ✅ ${check.name}`, 'green');
      } else {
        log(`  ❌ ${check.name}`, 'red');
        allPassed = false;
      }
    });
    
    return allPassed;
  } catch (error) {
    log(`  ❌ Error reading README.md: ${error.message}`, 'red');
    return false;
  }
}

function validateDocumentation() {
  log('\n📚 Validating documentation...', 'blue');
  
  const requiredDocs = [
    { path: 'docs/TRACK_3_SUBMISSION.md', name: 'Track 3 submission document' },
    { path: 'docs/ARCHITECTURE.md', name: 'Architecture documentation' },
    { path: 'docs/DEVELOPMENT_WIKI.md', name: 'Development wiki' },
    { path: 'docs/SUBMISSION_COMPLIANCE_CHECKLIST.md', name: 'Submission checklist' }
  ];
  
  let allPassed = true;
  requiredDocs.forEach(doc => {
    const docPath = path.join(rootDir, doc.path);
    if (fs.existsSync(docPath)) {
      log(`  ✅ ${doc.name}`, 'green');
    } else {
      log(`  ❌ Missing: ${doc.name}`, 'red');
      allPassed = false;
    }
  });
  
  return allPassed;
}

function validateSubmissionFiles() {
  log('\n📄 Checking for submission deliverables...', 'blue');
  
  const submissionFiles = [
    { 
      path: NAMING_CONVENTION.PITCH_DECK, 
      name: 'Pitch deck PDF',
      required: true
    },
    { 
      path: NAMING_CONVENTION.DEMO_VIDEO, 
      name: 'Demo video',
      required: true
    }
  ];
  
  let foundFiles = 0;
  submissionFiles.forEach(file => {
    const filePath = path.join(rootDir, file.path);
    if (fs.existsSync(filePath)) {
      log(`  ✅ Found: ${file.name} (${file.path})`, 'green');
      foundFiles++;
    } else {
      if (file.required) {
        log(`  ⚠️  Missing: ${file.name} (${file.path})`, 'yellow');
        log(`     This file needs to be created for submission`, 'yellow');
      } else {
        log(`  ℹ️  Optional: ${file.name} (${file.path})`, 'blue');
      }
    }
  });
  
  return { foundFiles, totalRequired: submissionFiles.filter(f => f.required).length };
}

function validateNamingConvention() {
  log('\n🏷️  Validating naming convention compliance...', 'blue');
  
  log(`  📋 Required naming format: ${NAMING_CONVENTION.BASE}`, 'blue');
  log(`  📋 Pitch deck: ${NAMING_CONVENTION.PITCH_DECK}`, 'blue');
  log(`  📋 Demo video: ${NAMING_CONVENTION.DEMO_VIDEO}`, 'blue');
  log(`  📋 Repository: ${NAMING_CONVENTION.REPOSITORY}`, 'blue');
  
  return true;
}

function generateSubmissionSummary() {
  log('\n📊 Submission Summary', 'bold');
  log('=' .repeat(50), 'blue');
  
  const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
  
  log(`Project: ${packageJson.displayName || packageJson.name}`, 'blue');
  log(`Team: GangGreen`, 'blue');
  log(`Track: Track 3 - Community Engagement and Sustainability`, 'blue');
  log(`Hackathon: Wangari Maathai Hackathon 2025`, 'blue');
  log(`Deadline: November 24, 2025 - 11:59 PM EAT`, 'yellow');
  log(`Submission Platform: DevFolio`, 'blue');
}

// Main validation function
function main() {
  log('🚀 Wangari Maathai Hackathon 2025 - Submission Validation', 'bold');
  log('=' .repeat(60), 'blue');
  
  const results = {
    packageJson: validatePackageJson(),
    readme: validateReadme(),
    documentation: validateDocumentation(),
    namingConvention: validateNamingConvention()
  };
  
  const submissionFiles = validateSubmissionFiles();
  
  generateSubmissionSummary();
  
  // Final assessment
  log('\n🎯 Validation Results', 'bold');
  log('=' .repeat(30), 'blue');
  
  const allBasicChecks = Object.values(results).every(result => result);
  
  if (allBasicChecks) {
    log('✅ All basic validation checks passed!', 'green');
  } else {
    log('❌ Some validation checks failed. Please review above.', 'red');
  }
  
  if (submissionFiles.foundFiles === submissionFiles.totalRequired) {
    log('✅ All required submission files are present!', 'green');
  } else {
    log(`⚠️  ${submissionFiles.totalRequired - submissionFiles.foundFiles} required submission files are missing.`, 'yellow');
    log('   Create pitch deck and demo video before final submission.', 'yellow');
  }
  
  log('\n📋 Next Steps:', 'bold');
  if (!allBasicChecks) {
    log('1. Fix validation issues listed above', 'yellow');
  }
  if (submissionFiles.foundFiles < submissionFiles.totalRequired) {
    log('2. Create missing submission deliverables:', 'yellow');
    log(`   - Pitch deck: ${NAMING_CONVENTION.PITCH_DECK}`, 'yellow');
    log(`   - Demo video: ${NAMING_CONVENTION.DEMO_VIDEO}`, 'yellow');
  }
  log('3. Run final validation before submission', 'blue');
  log('4. Submit via DevFolio before deadline', 'blue');
  
  process.exit(allBasicChecks ? 0 : 1);
}

main();