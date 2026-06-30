---
name: Expo Go connectivity on Replit
description: How to make Expo Go (physical device) connect to an Expo dev server running inside a Replit container
---

Expo Go cannot connect via LAN mode (`expo start`) because the phone is never on the same network as the Replit container, and `--tunnel` (ngrok) frequently fails in-container with `CommandError: TypeError: Cannot read properties of undefined (reading 'body')` (ngrok v3 auth/API issues) — do not keep retrying tunnel mode.

**Fix:** Replit provisions a dedicated env var `REPLIT_EXPO_DEV_DOMAIN` (separate from the regular `REPLIT_DEV_DOMAIN`) specifically for proxying the Expo manifest/bundler protocol. Point Expo's packager proxy at it instead of using tunnel/ngrok:

```
EXPO_PACKAGER_PROXY_URL=https://$REPLIT_EXPO_DEV_DOMAIN EXPO_PUBLIC_DOMAIN=$REPLIT_DEV_DOMAIN REACT_NATIVE_PACKAGER_HOSTNAME=$REPLIT_DEV_DOMAIN npx expo start --localhost --port 5000
```

**Why:** This is the exact pattern Replit's own Expo artifact template (`.local/skills/artifacts/artifacts/expo/files/package.json.template`) uses. It makes the QR code / manifest URL point at the publicly-routable `*.expo.worf.replit.dev` domain rather than an internal IP, so Expo Go on a real device can reach the Metro bundler through Replit's proxy.

**How to apply:** When a user reports Expo Go can't connect/run, check `env | grep REPLIT_EXPO_DEV_DOMAIN` exists, then set the workflow's run command to use it as above (via `EXPO_PACKAGER_PROXY_URL`) rather than reaching for `--tunnel`. Verify by curling the proxy domain with `Accept: application/expo+json` — it should return a JSON manifest with `launchAsset`/`runtimeVersion`, not HTML.
