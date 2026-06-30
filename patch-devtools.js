const fs = require('fs');
const path = require('path');

const targetPath = path.resolve(__dirname, 'node_modules', '@react-native', 'debugger-shell', 'bin', 'react-native-devtools');

if (fs.existsSync(targetPath)) {
  console.log('Patching React Native DevTools at:', targetPath);
  const stubCode = `#!/usr/bin/env node
console.log("React Native DevTools (Stubbed for Headless/Replit environment)");
process.exit(0);
`;
  try {
    fs.writeFileSync(targetPath, stubCode, { mode: 0o755 });
    console.log('✅ Patched React Native DevTools successfully!');
  } catch (err) {
    console.error('❌ Failed to patch React Native DevTools:', err.message);
  }
} else {
  console.log('React Native DevTools not found at target path (skipping patch).');
}
