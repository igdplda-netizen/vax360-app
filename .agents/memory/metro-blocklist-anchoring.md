---
name: Metro blockList regexes must be anchored
description: Unanchored blockList patterns match inside node_modules and break native bundling with misleading "file does not exist" errors
---

Metro `resolver.blockList` patterns match anywhere in the absolute path. An unanchored regex like `/backend/` (intended to exclude the project's `backend/` dir) also matches `node_modules/react-devtools-core/dist/backend.js`, making the Android/iOS bundle fail 500 with "main module field could not be resolved / none of these files exist" — even though the file exists on disk.

**Why:** Metro reports blocked files as nonexistent, so the error points at the package instead of the config. Web bundling can still work (different module graph), making it look device-only.

**How to apply:** Always anchor project-dir exclusions to the workspace root, e.g. `new RegExp('^' + escapedDirname + '/backend/')`. When a Metro resolve error says an existing file "does not exist", check blockList before clearing caches or reinstalling.
