const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
const wwwDir = path.join(__dirname, 'www');

console.log('Preparing static web directory...');

// Check if dist/ exists. If it doesn't, check if www/ is already populated.
if (!fs.existsSync(distDir)) {
  if (fs.existsSync(path.join(wwwDir, 'index.html'))) {
    console.log('Static directory www/ already populated, skipping preparation.');
    process.exit(0);
  } else {
    console.error('Error: dist/ directory not found. Please run "npx expo export --platform web" first.');
    process.exit(1);
  }
}

// Clean www directory if we are going to overwrite it
if (fs.existsSync(wwwDir)) {
  fs.rmSync(wwwDir, { recursive: true, force: true });
}

// Move/Copy dist/ to www/
console.log('Moving build from dist/ to www/ for backend serving...');
try {
  fs.renameSync(distDir, wwwDir);
} catch (err) {
  fs.mkdirSync(wwwDir, { recursive: true });
  copyDirRecursive(distDir, wwwDir);
  fs.rmSync(distDir, { recursive: true, force: true });
}
console.log('Build completed! Files are in www/');

function copyDirRecursive(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
