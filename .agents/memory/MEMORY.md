# Vax360 Expo App Memory

- [Expo CJS/ESM shim](expo-cjs-shim.md) — react-native-web v0.21 ships ESM at dist/index.js but expo-router SSR needs CJS. Fix: copy CJS index to dist/index.js.
- [Expo dev tools on Replit](expo-dev-tools-replit.md) — React Native DevTools binary needs libglib-2.0.so.0 which is missing. Must set `EXPO_NO_DEV_TOOLS=1`.
- [Metro watcher dotslash](metro-dotslash-watcher.md) — `.cache/dotslash/af/.../React Native DevTools-linux-x64` path with spaces causes Metro ENOENT watcher crash. Exclude in metro.config.js.
- [SSR context import trap](ssr-context-import.md) — `app/index.tsx` importing `useApp` before providers mount causes static export failure. Route directly to `(tabs)` instead.
- [Expo Go on Replit](expo-go-replit-public-domain.md) — `--tunnel`/ngrok fails in-container; use `REPLIT_EXPO_DEV_DOMAIN` via `EXPO_PACKAGER_PROXY_URL` instead.
- [Replit dev: single public port only](replit-dev-single-port.md) — browser/canvas cannot reach a second app port via `:PORT` suffix on the dev domain; proxy same-origin instead.
- [Replit workflow: backend as background process](replit-workflow-backend.md) — port 5011 is not a supported workflow port; start backend with `&` inside the same workflow command so it runs in background alongside Metro on port 5000.
- [Workflow command broken by task agent](workflow-task-agent-risk.md) — task agents may silently break Expo Go by removing `--localhost`, changing PACKAGER_HOSTNAME, bumping SDK in package.json without npm install, or dropping `exposeLocalhost`.
