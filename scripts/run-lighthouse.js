#!/usr/bin/env node
/**
 * Lighthouse performance testing script
 * 
 * Run this script with: node scripts/run-lighthouse.js
 * 
 * Note: You'll need to install the following dependencies:
 * npm install --save-dev lighthouse chrome-launcher
 */

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs').promises;
const path = require('path');

// URLs to test
const urls = [
  'http://localhost:3005/',
  'http://localhost:3005/login'
];

async function runLighthouseTests() {
  console.log('Starting Lighthouse performance tests...');
  
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu']
  });
  
  const options = {
    logLevel: 'info',
    output: 'html',
    port: chrome.port,
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo']
  };
  
  try {
    const results = [];
    const outputDir = path.join(process.cwd(), 'lighthouse-reports');
    await fs.mkdir(outputDir, { recursive: true });
    
    for (const url of urls) {
      console.log(`\nTesting ${url}`);
      
      try {
        const runnerResult = await lighthouse(url, options);
        
        // Save report to HTML file
        const timestamp = new Date().toISOString().replace(/:/g, '-');
        const filename = `lighthouse-${new URL(url).pathname.replace(/\//g, '-') || 'home'}-${timestamp}`;
        const reportPath = path.join(outputDir, `${filename}.html`);
        
        await fs.writeFile(reportPath, runnerResult.report);
        console.log(`Report saved to ${reportPath}`);
        
        // Output scores
        const scores = {
          url,
          performance: runnerResult.lhr.categories.performance.score * 100,
          accessibility: runnerResult.lhr.categories.accessibility.score * 100,
          bestPractices: runnerResult.lhr.categories['best-practices'].score * 100,
          seo: runnerResult.lhr.categories.seo.score * 100
        };
        
        console.log('Scores:');
        console.log(`Performance: ${scores.performance.toFixed(0)}%`);
        console.log(`Accessibility: ${scores.accessibility.toFixed(0)}%`);
        console.log(`Best Practices: ${scores.bestPractices.toFixed(0)}%`);
        console.log(`SEO: ${scores.seo.toFixed(0)}%`);
        
        results.push(scores);
        
        // Check for poor performance
        if (scores.performance < 80) {
          console.log('\n⚠️ Performance score is below 80%. Consider optimizing this page.');
        }
      } catch (error) {
        console.error(`Error testing ${url}:`, error);
      }
    }
    
    // Save summary JSON file
    const summaryPath = path.join(outputDir, `summary-${new Date().toISOString().replace(/:/g, '-')}.json`);
    await fs.writeFile(summaryPath, JSON.stringify(results, null, 2));
    console.log(`\nSummary saved to ${summaryPath}`);
    
  } finally {
    await chrome.kill();
  }
  
  console.log('\nLighthouse testing complete!');
}

runLighthouseTests().catch(error => {
  console.error('Fatal error running Lighthouse tests:', error);
  process.exit(1);
}); 