---
name: Expo dev tools on Replit
description: Why EXPO_NO_DEV_TOOLS=1 is required in the Replit Nix environment
---

**Problem:** Expo start tries to install React Native DevTools automatically. The binary at `node_modules/@react-native/debugger-shell/bin/react-native-devtools` fails with:
```
error while loading shared libraries: libglib-2.0.so.0: cannot open shared object file
```

**Why:** Replit's NixOS container doesn't include GTK/glib libraries that the DevTools Electron-like binary needs.

**Fix:** Always set `EXPO_NO_DEV_TOOLS=1` in environment variables before running Expo commands.
