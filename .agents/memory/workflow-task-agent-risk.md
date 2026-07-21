---
name: Task agent workflow breakage patterns
description: Known ways task agents silently break Expo Go compatibility in this project.
---

## Known breakage patterns from task agents

1. **Removing `--localhost`** from `npx expo start` — Metro stops binding to localhost, Expo Go cannot connect.
2. **Wrong `REACT_NATIVE_PACKAGER_HOSTNAME`** — must be `$REPLIT_DEV_DOMAIN` (no `https://`, no `/`). Using `$REPLIT_EXPO_DEV_DOMAIN` breaks native bundling.
3. **Bumping SDK in `package.json` without `npm install`** — e.g. changing `expo: ~56.0.0` to `~57.0.0` while installed packages stay at SDK 56. Causes Metro to resolve mismatched modules.
4. **Dropping `exposeLocalhost = true`** — needed so the Replit proxy passes localhost requests through to Metro.
5. **Stale Metro file-map cache** after config changes — clear `/tmp/metro-file-map-*` and `/tmp/metro-cache` when bundling fails after a config change.

## Correct workflow command (SDK 56)
```
node backend/db-init.js && node backend/server.js & EXPO_NO_DEV_TOOLS=1 EXPO_PACKAGER_PROXY_URL=https://$REPLIT_EXPO_DEV_DOMAIN EXPO_PUBLIC_DOMAIN=$REPLIT_DEV_DOMAIN REACT_NATIVE_PACKAGER_HOSTNAME=$REPLIT_DEV_DOMAIN npx expo start --localhost --port 5000
```

**Why:** These are the exact env vars Replit needs to make Expo Go work through the public domain proxy. Any deviation breaks either the QR code URL or the bundle fetch.
