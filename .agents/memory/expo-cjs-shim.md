---
name: Expo CJS/ESM shim for react-native-web
description: How to fix react-native-web dist/index ESM vs CJS mismatch in Expo SSR
---

**Problem:** `expo-router` v56 SSR does `import "react-native-web/dist/index"` which resolves to `node_modules/react-native-web/dist/index.js`. That file is ESM (`export { default as ... }`), but Node SSR needs CJS. Metro throws "Unable to resolve module react-native-web/dist/index".

**Why:** `react-native-web` v0.21.2 ships:
- `main: "dist/cjs/index.js"` (CJS)
- `module: "dist/index.js"` (ESM)

Expo-router hardcodes `react-native-web/dist/index` in its SSR path, bypassing package.json resolution.

**Fix:** Copy the CJS build over the ESM dist/index.js:
```bash
cp node_modules/react-native-web/dist/cjs/index.js node_modules/react-native-web/dist/index.js
```

This is idempotent and survives `npm install` since it modifies the already-installed dist files, not package.json.
