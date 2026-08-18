# Forced Password-Change Screen — Bypass Analysis & Test Coverage

## Summary

When the superadmin logs in with the default `Admin@123` password the backend
returns `must_change_password: true` alongside a valid JWT, and the client
immediately redirects the user to `/change-password`. This document describes
the bypass vectors that were analysed and the controls in place for each.

---

## Backend guarantees (automated)

See `backend/tests/forced-password-change.test.js` for the machine-executable
test suite. It covers:

| # | Scenario | Expected result |
|---|----------|-----------------|
| a | `POST /api/login` with `Admin@123` for superadmin | `must_change_password: true` |
| b | `POST /api/login` after `POST /api/auth/change-own-password` | flag absent / falsy |
| c | `POST /api/auth/change-own-password` without a token | `401` |
| c | `POST /api/auth/change-own-password` with an invalid token | `403` |
| c | `POST /api/auth/change-own-password` with a wrong-secret token | `403` |
| d | `POST /api/login` for a parent/admin with the same default password | flag absent |

Run with:

```sh
cd backend && NODE_ENV=test npx jest tests/forced-password-change.test.js
```

---

## App-side bypass analysis

### Bypass 1 — Navigate directly to `/(tabs)` after receiving a mustChangePassword token

**Attack**: The attacker completes `POST /api/login`, receives a JWT + the
`must_change_password: true` flag, dismisses the `/change-password` redirect
via hardware back (Android) or programmatic `router.replace('/(tabs)')`.

**Control** (added in this task): `app/(tabs)/_layout.tsx` now contains a
`useEffect` guard that fires on every render when `state.mustChangePassword` is
`true` and immediately calls `router.replace('/change-password')`. The guard
fires even if the user arrived at `/(tabs)` via direct navigation.

### Bypass 2 — App restart with a saved token (mustChangePassword not persisted)

**Attack**: The app restarts with a saved JWT (from a previous default-password
session). Because `mustChangePassword` was not stored, the app went straight to
`/(tabs)` on the next boot.

**Control** (added in this task): `mustChangePassword` is now a first-class
field in `AppState` and is persisted to AsyncStorage via `saveState()`. When
the `login()` / `login2FA()` context functions receive `must_change_password:
true` from the server, they write `mustChangePassword: true` into the saved
state. On the next boot the tabs guard (Bypass 1 control) catches the flag and
re-redirects.

When `changeOwnPassword()` succeeds, it explicitly sets
`mustChangePassword: false` in the saved state so no future boot is redirected.

### Bypass 3 — Token replay after password change

**Attack**: The attacker holds a JWT obtained before the password change and
tries to call authenticated endpoints post-change.

**Control** (pre-existing): JWTs embed a `pwd_slice` (first 10 chars of the
stored password hash). The `authenticateToken` middleware re-reads the hash
from the DB on every request and rejects any token whose `pwd_slice` no longer
matches. After a successful password change the hash changes, all old tokens
become invalid immediately.

### Bypass 4 — `change-own-password` endpoint called without prior login

**Attack**: An unauthenticated caller sends `POST /api/auth/change-own-password`.

**Control** (pre-existing): The endpoint uses the `authenticateToken` middleware
and returns `401` with no token, `403` with an invalid/expired token.

### Bypass 5 — `change-password` screen skipped by logout

**Attack**: The user taps **Logout** on the change-password screen instead of
completing the flow.

**Behaviour**: Logout clears the token and `mustChangePassword` from state and
redirects to `/login`. The superadmin must log in again, which re-triggers the
`must_change_password: true` response and re-shows the screen. This is the
intended recovery path.

---

## How to manually verify the app-side guard (Bypass 1 & 2)

1. Start the backend in development mode.
2. Ensure the superadmin (whatsapp `9999`) has not yet changed the default password.
3. Log in as the superadmin — you should be redirected to `/change-password`.
4. While on `/change-password`, use the OS back gesture or `router.push('/(tabs)')` from the JS console — you should be immediately redirected back to `/change-password` by the tab guard.
5. Kill and restart the app without changing the password — on next boot you should land on `/change-password` again (flag is persisted).
6. Complete the password change — you should be taken to `/(tabs)` and stay there after a subsequent restart.
