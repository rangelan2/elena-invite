#!/usr/bin/env node
/**
 * Accessibility testing script using axe-core
 * 
 * Run this script with: node scripts/run-a11y-tests.js
 * 
 * Note: You'll need to add the following dependencies:
 * npm install --save-dev axe-core puppeteer
 */

const puppeteer = require('puppeteer');
const { AxePuppeteer } = require('@axe-core/puppeteer');
const fs = require('fs').promises;
const path = require('path');

// URLs to test
const urls = [
  'http://localhost:3005/',
  'http://localhost:3005/login'
];

async function runAccessibilityTests() {
  console.log('Starting accessibility tests...');
  
  const browser = await puppeteer.launch();
  const results = [];
  
  try {
    for (const url of urls) {
      console.log(`\nTesting ${url}`);
      const page = await browser.newPage();
      
      // Set viewport size
      await page.setViewport({ width: 1280, height: 800 });
      
      try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 10000 });
        
        // Run axe on the page
        const axeResults = await new AxePuppeteer(page).analyze();
        
        const violations = axeResults.violations;
        const passes = axeResults.passes.length;
        
        console.log(`✅ ${passes} accessibility tests passed`);
        
        if (violations.length > 0) {
          console.log(`❌ ${violations.length} accessibility violations found:`);
          
          violations.forEach((violation, index) => {
            console.log(`\n${index + 1}. ${violation.help} - ${violation.impact} impact`);
            console.log(`   ${violation.helpUrl}`);
            console.log('   Affected elements:');
            
            violation.nodes.forEach((node, nodeIndex) => {
              console.log(`   ${nodeIndex + 1}. ${node.html}`);
              console.log(`      ${node.failureSummary}`);
            });
          });
        } else {
          console.log('No accessibility violations found!');
        }
        
        results.push({
          url,
          violations,
          passes
        });
      } catch (error) {
        console.error(`Error testing ${url}:`, error);
        results.push({
          url,
          error: error.message
        });
      } finally {
        await page.close();
      }
    }
    
    // Save results to file
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const outputDir = path.join(process.cwd(), 'a11y-reports');
    
    try {
      await fs.mkdir(outputDir, { recursive: true });
      await fs.writeFile(
        path.join(outputDir, `a11y-report-${timestamp}.json`),
        JSON.stringify(results, null, 2)
      );
      console.log(`\nReport saved to a11y-reports/a11y-report-${timestamp}.json`);
    } catch (error) {
      console.error('Error saving report:', error);
    }
    
  } finally {
    await browser.close();
  }
  
  // Check if there are any violations
  const hasViolations = results.some(result => result.violations && result.violations.length > 0);
  
  console.log('\nAccessibility testing complete!');
  
  if (hasViolations) {
    console.log('❌ Accessibility issues were found. Please review the report.');
    process.exit(1);
  } else {
    console.log('✅ No accessibility issues found!');
    process.exit(0);
  }
}

runAccessibilityTests().catch(error => {
  console.error('Fatal error running accessibility tests:', error);
  process.exit(1);
}); 