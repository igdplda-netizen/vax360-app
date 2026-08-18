---
name: expo export image-size crash
description: Web export fails on every PNG asset when image-size 2.x is used with Metro 0.84
---

`npx expo export --platform web` fails with `SyntaxError: <asset>.png: The "list" argument must be an instance of SharedArrayBuffer, ArrayBuffer or ArrayBufferView` when `image-size` resolves to 2.x.

**Why:** Metro 0.84 (`metro/src/Assets.js getAssetData`) passes a file *path* string to `imageSize()`, but image-size 2.x only accepts Uint8Array/Buffer (paths moved to `imageSizeFromFile`). The string hits `TextDecoder.decode` and throws the misleading ArrayBuffer error.

**How to apply:** Keep the npm override `"image-size": "1.2.1"` in package.json. Beware: JSON duplicate keys in `overrides` are silently resolved last-one-wins — a stray second `"image-size"` entry re-broke the pin once. This also breaks deployment publishes (build step runs the same export).
