# Threat Model

## Project Overview

Vax360 is a child vaccination tracking application. The repository contains an Expo Router client under `app/` and an Express backend under `backend/` (PostgreSQL in production via `DATABASE_URL`, SQLite for tests/dev). `.replit` is the authoritative source of production scope: the autoscale deployment (`visibility: public`, `https://vax-360-app.replit.app`) builds the Expo web export into `dist/` and runs `node server.js`.

IMPORTANT SCOPE CHANGE (as of the current scan): `server.js` no longer serves only static files. It now `require`s `./backend/server` and runs the full backend Express app (`app.listen`). Therefore the **entire backend API (`backend/server.js`) is now exposed to the public internet** — authentication, 2FA, sync, and admin routes included. At the prior baseline the deployed `server.js` was a standalone static file server and the backend was not deployed. Treat `backend/server.js` as the primary production attack surface going forward.

## Assets

- **Vaccination and family data** — child names, birth dates, vaccine schedules, notes, health info. Stored server-side in the `store` table (per-user JSON) and cached in browser storage.
- **Authentication material** — PBKDF2 password hashes + salts, TOTP secrets, JWTs, roles (`parent`/`admin`/`superadmin`), and the seeded superadmin account (`whatsapp = '9999'`).
- **Admin capabilities** — list/delete users, change roles, platform stats, cross-user children data, DB backups, audit logs.
- **Application secrets** — `JWT_SECRET`, `DATABASE_URL`, `INITIAL_SUPERADMIN_PASSWORD`.
- **Deployment integrity** — the deployed server must only serve intended static export plus authorized API behavior.

## Trust Boundaries

- **Public internet → backend Express API (`backend/server.js`)** — every request is attacker-controlled. Each sensitive route must authenticate (`authenticateToken`) and authorize (role / ownership) before acting. This is now the most important boundary.
- **Public internet → static export (`dist/`)** — SPA fallback serves `index.html` for non-`/api` GETs.
- **API → database** — parameterized queries are used throughout (no SQL injection observed).
- **Public / Authenticated boundary** — public routes: `/api/health`, `/api/register`, `/api/login`, `/api/login/2fa`, `/api/auth/reset-password`, `GET /api/partner-logo`. All others require a JWT.
- **User / Admin boundary** — `admin`/`superadmin` gated routes under `/api/admin/*`, `/api/audit`, `POST /api/partner-logo`.

## Scan Anchors

- **Production entry points**: `.replit` (`run = ["node","server.js"]`), `server.js` → `backend/server.js`, `dist/**`.
- **Highest-risk code area**: `backend/server.js` auth and admin routes.
- **Known critical (current scan)**: `POST /api/auth/reset-password` is fully public and overwrites any account's password from an attacker-supplied WhatsApp number — unauthenticated account takeover (incl. superadmin `9999`). `POST /api/admin/users/:whatsapp/reset-password` lets any `admin` reset any account (privesc to superadmin).
- **Public surface**: the routes listed under the Public/Authenticated boundary above.
- **Client-side sensitive state handling**: `context/AppContext.tsx` plus tab routes under `app/(tabs)/**`, logout behavior, cached health data.
- **Dev-only / usually out of scope**: tests (`backend/tests/**`, `*.test.js`), legacy artifacts, docs.

## Threat Categories

### Spoofing / Broken Authentication

The public password-reset endpoint requires no ownership proof, OTP, or existing-password knowledge, allowing anyone to set any account's password and impersonate it. Password resets and privileged resets must be bound to verified account ownership. JWTs are HS256-signed with `JWT_SECRET` (required in production) and carry a `pwd_slice` to invalidate sessions on password change/delete.

### Elevation of Privilege

Role checks are enforced server-side on `/api/admin/*` routes. However, the admin password-reset route lets an `admin` reset a `superadmin` password, escalating privilege. Reset/role/delete actions must enforce that the actor cannot act on accounts of equal or higher privilege beyond their scope.

### Information Disclosure

Admin routes expose all users and all children's health data — correctly gated to superadmin, but that gate is only as strong as the account-takeover protection above. `verifyTOTP` logs valid TOTP codes to server logs on failed verification (low severity). Internal errors are masked in production via `handleInternalError`.

### Tampering

`/api/sync/:id` enforces owner-or-superadmin checks for read/write (no IDOR observed). `POST /api/partner-logo` (superadmin only, 10mb) stores JSON returned publicly by `GET /api/partner-logo`; verify the client renders `logo`/`link` safely to avoid stored XSS.

### Denial of Service

Rate limiters exist (global, login, register, reset). The reset limiter (3/15min/IP) does not meaningfully protect the reset flow since a single request overwrites a targeted password and IPs rotate.
