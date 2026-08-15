const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const htmlFiles = [
  'index.html',
  'merge/index.html',
  'split/index.html',
  'compress/index.html',
  'to-jpg/index.html',
  'to-word/index.html',
  'word-to-pdf/index.html',
  'rotate/index.html',
  'watermark/index.html'
];

for (const file of htmlFiles) {
  const filePath = path.join(rootDir, file);
  if (!fs.existsSync(filePath)) {
    console.warn(`Skipping ${file} - not found.`);
    continue;
  }
  
  let inContent = fs.readFileSync(filePath, 'utf8');
  let content = inContent;

  // 1. Replace inline CSS with shared CSS link
  content = content.replace(/<style>[\s\S]*?<\/style>/, '<link rel="stylesheet" href="/css/style.css" />');
  
  // 2. Inject shared.js and AdSense in <head>
  if (!content.includes('shared.js')) {
    const scripts = `
  <!-- AdSense Placeholder -->
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>
  <!-- Shared JS Components -->
  <script src="/js/shared.js" defer></script>
</head>`;
    content = content.replace('</head>', scripts);
  }

  // 3. Replace <header> to </header> with <swift-header>
  content = content.replace(/<!-- ── HEADER ─+ -->[\s\S]*?<\/header>/, '<swift-header></swift-header>');
  content = content.replace(/<!-- HEADER -->[\s\S]*?<\/header>/, '<swift-header></swift-header>');
  
  // Also clean up <nav class="mobile-nav"... (if left outside header in index.html)
  content = content.replace(/<nav class="mobile-nav"[\s\S]*?<\/nav>/, '');

  // 4. Replace <footer> with <swift-footer>
  content = content.replace(/<!-- ── FOOTER ─+ -->[\s\S]*?<\/footer>/, '<swift-footer></swift-footer>');
  content = content.replace(/<!-- FOOTER -->[\s\S]*?<\/footer>/, '<swift-footer></swift-footer>');

  // 5. Replace Freemium modal with <swift-premium-modal>
  content = content.replace(/<!-- FREEMIUM MODAL -->[\s\S]*?<div class="modal-overlay"[\s\S]*?<\/div>\s*<\/div>/, '<swift-premium-modal></swift-premium-modal>');

  // 6. Clean up JS references to removed DOM elements
  content = content.replace(/const modalOverlay[^\n]+;\n?/g, '');
  content = content.replace(/const btnMaybe[^\n]+;\n?/g, '');
  content = content.replace(/const menuToggle[^\n]+;\n?/g, '');
  content = content.replace(/const mobileNav[^\n]+;\n?/g, '');

  // 7. Remove Mobile menu logic block
  content = content.replace(/\/\/ ── Mobile menu ─+[\s\S]*?(?=\/\/ ── )/, '');

  // 8. Refactor Freemium calls
  content = content.replace(/isLimitReached\(\)/g, 'window.swiftpdf.isLimitReached(STORAGE_KEY, DAILY_LIMIT)');
  content = content.replace(/modalOverlay\.classList\.add\('open'\)/g, 'window.swiftpdf.showFreemiumModal()');
  content = content.replace(/bumpCount\(\);/g, 'window.swiftpdf.bumpCount(STORAGE_KEY);');

  // 9. Remove freemium function definitions
  content = content.replace(/function getTodayKey\(\)[\s\S]*?function isLimitReached\(\)\s*\{\s*return getCount\(\)\s*>=\s*DAILY_LIMIT;\s*\}/, '');

  // 10. Remove Modal Event Listeners
  content = content.replace(/\/\/ ── Modal ─+[\s\S]*?(?=\/\/ ── |<\/script>)/, '');

  if (content !== inContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Successfully refactored ${file}`);
  } else {
    console.log(`No changes needed for ${file}`);
  }
}
