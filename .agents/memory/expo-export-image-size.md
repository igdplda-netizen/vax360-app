---
name: expo export image-size crash
description: Web export fails on every PNG asset when image-size 2.x is used with Metro 0.84
---

`npx expo export --platform web` fails with `SyntaxError: <asset>.png: The "list" argument must be an instance of SharedArrayBuffer, ArrayBuffer or ArrayBufferView` when `image-size` resolves to 2.x.

**Why:** Metro 0.84 (`metro/src/Assets.js getAssetData`) passes a file *path* string to `imageSize()`, but image-size 2.x only accepts Uint8Array/Buffer (paths moved to `imageSizeFromFile`). The string hits `TextDecoder.decode` and throws the misleading ArrayBuffer error.

**How to apply:** Replace the abandoned dependency with a maintained, security-fixed fork that preserves the 1.x path-string API Metro expects. Verify both the dependency audit and an Expo web export; a fix that passes only one is incomplete.
