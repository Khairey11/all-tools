const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const htmlFiles = [
  'merge/index.html',
  'split/index.html',
  'compress/index.html',
  'to-jpg/index.html',
  'to-word/index.html',
  'word-to-pdf/index.html',
  'rotate/index.html',
  'watermark/index.html',
  'protect/index.html'
];

const ad1 = `
  <!-- Ad Placement 1: Top Leaderboard -->
  <div class="ad-slot-horizontal" style="min-height:90px; margin-bottom:2rem; text-align:center;">
    <ins class="adsbygoogle"
         style="display:block"
         data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
         data-ad-slot="AUTO_SLOT_1"
         data-ad-format="auto"
         data-full-width-responsive="true"></ins>
    <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
  </div>
`;

const ad2 = `
  <!-- Ad Placement 2: Rectangle -->
  <div class="ad-slot-rectangle" style="min-height:250px; text-align:center; margin: 2rem auto;">
    <ins class="adsbygoogle"
         style="display:block"
         data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
         data-ad-slot="AUTO_SLOT_2"
         data-ad-format="auto"
         data-full-width-responsive="true"></ins>
    <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
  </div>
`;

const ad3 = `
  <!-- Ad Placement 3: Bottom Leaderboard -->
  <div class="ad-slot-horizontal" style="min-height:90px; margin-top:3rem; text-align:center;">
    <ins class="adsbygoogle"
         style="display:block"
         data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
         data-ad-slot="AUTO_SLOT_3"
         data-ad-format="auto"
         data-full-width-responsive="true"></ins>
    <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
  </div>
`;

for (const file of htmlFiles) {
  const filePath = path.join(rootDir, file);
  if (!fs.existsSync(filePath)) {
    console.warn(`Skipping ${file} - not found.`);
    continue;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');

  // Prevent double injection
  if (content.includes('Ad Placement 1')) {
    console.log(`Ads already present in ${file}, skipping.`);
    continue;
  }

  // Inject Ad 1: Below the tool title / above the upload zone
  // Find the opening of <main class="tool-wrap"...
  content = content.replace(/(<main[^>]*class="[^"]*tool-wrap[^"]*"[^>]*>\s*)/i, `$1${ad1}`);

  // Inject Ad 2: Below the upload zone
  // Find the closing </div> of the drop-zone
  // Note: this regex specifically matches the drop-zone div closure
  let dropZoneRegex = /(<div\s+class="drop-zone"[^>]*>[\s\S]*?(?:<\/div>\s*<\/div>|<\/div>\s*))/i;
  // some drop zones might only have one </div>, others might have nested elements.
  // Actually, let's just use string replacement on '<div class="drop-zone"'
  const dropIdx = content.indexOf('<div class="drop-zone"');
  if (dropIdx !== -1) {
    // find the matching closing div for drop-zone.
    // simple heuristic: drop zone usually ends before "work-area", "file-strip", or "action-row"
    // Let's just insert before the next major section:
    content = content.replace(/(<\/div>\s*)(?=<!-- (?:Work Area|File Strip|File List|Controls|Options) |<div class="(?:file-strip|work-area|action-row|split-options|file-list-section)")/i, `$1${ad2}`);
  } else {
    // If no drop zone (e.g. protect/index.html), just put it before the end of main
    content = content.replace(/(<\/main>)/i, `${ad2}$1`);
  }

  // Inject Ad 3: Before footer
  content = content.replace(/(<\/main>)/i, `${ad3}$1`);

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Injected ads into ${file}`);
}
