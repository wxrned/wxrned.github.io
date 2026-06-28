const fs = require('fs');
const path = require('path');

console.log('🔨 Building production files...');

const dirs = ['assets/js/min', 'assets/css/min'];
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created ${dir}`);
  }
});

console.log('📦 Copying JavaScript files...');
const jsFiles = fs.readdirSync('assets/js')
  .filter(f => f.endsWith('.js') && !f.includes('.min.') && f !== 'chat.js');

jsFiles.forEach(file => {
  const input = path.join('assets/js', file);
  const output = path.join('assets/js/min', file.replace('.js', '.min.js'));
  console.log(`  - ${file}`);
  fs.copyFileSync(input, output);
  console.log(`    ✅ Copied`);
});

console.log('🎨 Copying CSS files...');
const cssFiles = fs.readdirSync('assets/css')
  .filter(f => f.endsWith('.css') && !f.includes('.min.'));

cssFiles.forEach(file => {
  const input = path.join('assets/css', file);
  const output = path.join('assets/css/min', file.replace('.css', '.min.css'));
  console.log(`  - ${file}`);
  fs.copyFileSync(input, output);
  console.log(`    ✅ Copied`);
});

console.log('✅ Build complete!');