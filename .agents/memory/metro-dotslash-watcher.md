---
name: Metro dotslash watcher crash
description: Metro watcher crashes on .cache/dotslash paths with spaces
---

**Problem:** Metro's file watcher throws ENOENT on:
```
.cache/dotslash/af/.../React Native DevTools-linux-x64
```

The path contains spaces ("React Native DevTools") which breaks the fallback FSWatcher.

**Fix:** Exclude `.cache/dotslash` from Metro's watcher in `metro.config.js`:
```js
config.resolver.blockList.push(/\.cache[\/\\]dotslash/);
```
