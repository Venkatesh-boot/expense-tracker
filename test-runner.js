#!/usr/bin/env node

/**
 * Test Runner Script for Authentication Flow
 * 
 * This script runs comprehensive tests for the authentication system
 * and provides detailed reports on test coverage and failures.
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🧪 Running Authentication Flow Tests...\n');

// Test categories to run
const testCategories = [
  {
    name: 'Redux Store Tests',
    pattern: '**/*.slice.test.ts',
    description: 'Testing Redux reducers and actions'
  },
  {
    name: 'Component Tests', 
    pattern: '**/components/*.test.tsx',
    description: 'Testing React components'
  },
  {
    name: 'Page Tests',
    pattern: '**/modules/**/*.test.tsx', 
    description: 'Testing page components'
  },
  {
    name: 'Saga Tests',
    pattern: '**/sagas/*.test.ts',
    description: 'Testing Redux-Saga async flows'
  }
];

// Function to run tests for a specific category
function runTestCategory(category) {
  console.log(`\n📂 ${category.name}`);
  console.log(`   ${category.description}`);
  console.log(`   Pattern: ${category.pattern}\n`);
  
  try {
    const command = `cd web-app && npm test -- --testPathPattern="${category.pattern}" --verbose`;
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${category.name} passed\n`);
  } catch (error) {
    console.log(`❌ ${category.name} failed\n`);
    return false;
  }
  return true;
}

// Function to run all tests with coverage
function runFullTestSuite() {
  console.log('\n🔍 Running Full Test Suite with Coverage...\n');
  
  try {
    const command = 'cd web-app && npm run test:coverage';
    execSync(command, { stdio: 'inherit' });
    console.log('\n✅ All tests passed with coverage report\n');
    return true;
  } catch (error) {
    console.log('\n❌ Some tests failed\n');
    return false;
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: node test-runner.js [options]

Options:
  --category <name>    Run tests for specific category
  --full              Run full test suite with coverage
  --watch             Run tests in watch mode
  --help, -h          Show this help message

Categories:
${testCategories.map(cat => `  - ${cat.name.toLowerCase().replace(/\s+/g, '-')}`).join('\n')}

Examples:
  node test-runner.js --full
  node test-runner.js --category redux-store-tests
  node test-runner.js --watch
    `);
    return;
  }

  if (args.includes('--watch')) {
    console.log('👀 Starting tests in watch mode...\n');
    execSync('cd web-app && npm run test:watch', { stdio: 'inherit' });
    return;
  }

  if (args.includes('--full')) {
    runFullTestSuite();
    return;
  }

  const categoryArg = args.find(arg => arg.startsWith('--category'));
  if (categoryArg) {
    const categoryName = args[args.indexOf(categoryArg) + 1];
    const category = testCategories.find(cat => 
      cat.name.toLowerCase().replace(/\s+/g, '-') === categoryName
    );
    
    if (category) {
      runTestCategory(category);
    } else {
      console.log(`❌ Unknown category: ${categoryName}`);
      console.log('Available categories:', testCategories.map(c => c.name).join(', '));
    }
    return;
  }

  // Default: run all categories
  console.log('🚀 Running all test categories...\n');
  
  let allPassed = true;
  for (const category of testCategories) {
    const passed = runTestCategory(category);
    if (!passed) allPassed = false;
  }
  
  if (allPassed) {
    console.log('🎉 All test categories passed!');
    console.log('\n💡 Run with --full flag to see coverage report');
  } else {
    console.log('💥 Some tests failed. Check the output above for details.');
    process.exit(1);
  }
}

main().catch(console.error);
