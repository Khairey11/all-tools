const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const htmlFiles = [
  'index.html',
  '404.html',
  'pricing/index.html',
  'protect/index.html',
  'merge/index.html',
  'split/index.html',
  'compress/index.html',
  'to-jpg/index.html',
  'to-word/index.html',
  'word-to-pdf/index.html',
  'rotate/index.html',
  'watermark/index.html'
];

let issues = 0;

console.log("Starting Pre-Deployment Audit...\n");

htmlFiles.forEach(file => {
  const filePath = path.join(rootDir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`[MISSING FILE] ${file}`);
    issues++;
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check Title
  if (!content.match(/<title>.*?<\/title>/)) {
    console.log(`[SEO] Missing <title> in ${file}`);
    issues++;
  }
  
  // Check Meta Description (except 404 which might not need one, but good to have)
  if (file !== '404.html' && !content.match(/<meta\s+name=["']description["']\s+content=["'][^"']*["']/i)) {
    console.log(`[SEO] Missing <meta name="description"> in ${file}`);
    issues++;
  }
  
  // Check shared CSS
  if (!content.includes('href="/css/style.css"')) {
    console.log(`[DEV] Missing /css/style.css in ${file}`);
    issues++;
  }
  
  // Check shared JS
  if (!content.includes('src="/js/shared.js"')) {
    console.log(`[DEV] Missing /js/shared.js in ${file}`);
    issues++;
  }
  
  // Check Header/Footer tags
  if (!content.includes('<swift-header>') || !content.includes('<swift-footer>')) {
    // 404 has them too
    console.log(`[DEV] Missing Web Components <swift-header> or <swift-footer> in ${file}`);
    issues++;
  }
});

console.log(`\nAudit Complete! Found ${issues} issues.`);
