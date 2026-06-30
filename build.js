const fs = require('fs');
const path = require('path');

const wwwDir = path.join(__dirname, 'www');

// Clean www directory
if (fs.existsSync(wwwDir)) {
  fs.rmSync(wwwDir, { recursive: true, force: true });
}
fs.mkdirSync(wwwDir);

// Files to copy
const filesToCopy = [
  'index.html',
  'app.js',
  'style.css',
  'sw.js',
  'manifest.json'
];

filesToCopy.forEach(file => {
  const src = path.join(__dirname, file);
  const dest = path.join(wwwDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied ${file} to www/`);
  }
});

// Copy icons folder
const iconsSrc = path.join(__dirname, 'icons');
const iconsDest = path.join(wwwDir, 'icons');

function copyDirRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

if (fs.existsSync(iconsSrc)) {
  copyDirRecursive(iconsSrc, iconsDest);
  console.log('Copied icons/ to www/');
}

console.log('Build completed! Files are in www/');
