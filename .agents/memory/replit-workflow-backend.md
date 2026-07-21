---
name: Replit workflow backend on port 5011
description: Backend must run as background process inside the expo workflow because port 5011 is not a supported Replit workflow port.
---

## Rule
Port 5011 is NOT in the Replit-supported workflow port list (3000, 3001, 3002, 3003, 4200, 5000, 5173, 6000, 6800, 8000, 8008, 8080, 8099, 9000). Creating a separate workflow with `waitForPort: 5011` will fail.

## How to apply
Start the backend as a background shell process inside the single "Start application" workflow command:

```
node backend/db-init.js && node backend/server.js & EXPO_NO_DEV_TOOLS=1 ... npx expo start --localhost --port 5000
```

The `&` puts `server.js` in the background so expo can continue in the foreground. The workflow `waitForPort` stays at 5000.

**Why:** Replit only exposes specific ports for workflow monitoring. The Metro proxy in `metro.config.js` forwards `/api/*` to `localhost:5011` internally, so the backend does not need to be publicly exposed.
