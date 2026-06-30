---
name: SSR context import ordering trap
description: app/index.tsx importing context hooks before providers mount breaks static export
---

**Problem:** Adding `app/index.tsx` with `import { useApp } from '../context/AppContext'` causes static export (`expo export`) to fail. The SSR render tries to evaluate the hook before the AppProvider is mounted in the layout.

**Why:** During SSR, the entry point is evaluated top-down. If `app/index.tsx` calls `useApp()` (which requires AppContext), but the context provider is in `app/_layout.tsx` (a parent), the hook throws "useApp must be used within AppProvider".

**Fix:** Remove `app/index.tsx` entirely. Let Expo Router fall through to `(tabs)/index.tsx` as the default route. Or use a pure `Redirect` without hooks.
