# Threat Model

## Project Overview

Vax360 is a child vaccination tracking application. The repository currently contains multiple implementations: an Expo Router app under `app/`, a legacy web app under the project root, and an Express/SQLite backend under `backend/`. For the current public autoscale deployment, `.replit` is the authoritative source of production scope: Replit builds the Expo web export into `dist/` and runs `node server.js` to serve that static output.

That means the production attack surface is the public web deployment plus the custom Node static file server in `server.js`. The backend API in `backend/server.js` and the legacy root web app are not directly deployed in the current production configuration, but they remain sensitive repository assets because the deployed static server runs in the same workspace.

## Assets

- **Vaccination and family data** — child names, birth dates, vaccine schedules, notes, and related health information. Exposure would leak sensitive family and health data.
- **Authentication material in repository-adjacent services** — if backend files or database contents are exposed, password hashes, TOTP secrets, roles, and audit data could be disclosed.
- **Application source and configuration** — source files, package manifests, and any adjacent configuration or secret-bearing files in the deployment workspace.
- **Deployment integrity** — the deployed web app must only serve the intended static export under `dist/`, not arbitrary workspace files.

## Trust Boundaries

- **Public internet → deployed Node static server** — all browser requests hit `server.js`; request paths are fully attacker-controlled and must be constrained to `dist/`.
- **Static server → workspace filesystem** — the server process can read any file the deployment user can read. This boundary is critical because a path handling bug turns file reads into public data disclosure.
- **Browser → Expo web bundle** — client state is untrusted and should not be treated as proof of identity or authorization.
- **Production deployment → dev-only or legacy repo content** — `backend/`, legacy root web assets, tests, and local development artifacts should not become reachable from the public deployment unless explicitly exposed.

## Scan Anchors

- **Production entry points**: `.replit` deployment config, `server.js`, `dist/**`.
- **Highest-risk code area**: custom file serving logic in `server.js` because it mediates all public requests and has direct filesystem access.
- **Public surface**: the deployed static site and any file paths accepted by `server.js`.
- **Dev-only / usually out of scope**: `backend/**`, root legacy `app.js` / `index.html`, tests, and Expo source under `app/**` unless another production deployment path is introduced or the static server exposes them.

## Threat Categories

### Information Disclosure

The primary production risk is arbitrary disclosure of workspace files through the custom static file server. The deployed service must guarantee that untrusted request paths cannot escape `dist/` and cannot be used to retrieve backend code, SQLite databases, configuration files, or other repository content. Any violation here directly exposes sensitive health data, authentication data, and implementation details to unauthenticated internet users.

### Tampering

The public deployment is intended to be a static web app. The server must treat URL paths as untrusted input and must not let attackers select unintended filesystem targets. Path normalization and strict root enforcement are required so the client can only request files that belong to the published static export.

### Elevation of Privilege

Although the current production deployment does not directly run the backend API, exposure of backend source or database contents can enable later privilege escalation by revealing account identifiers, password hashes, or authentication design details. The system must preserve separation between the public static frontend and undeployed backend assets.

### Denial of Service

The deployed server should avoid expensive or uncontrolled file access paths caused by attacker-supplied URLs. While availability is not the main issue identified in this scan, the filesystem boundary still needs to be enforced to prevent abuse and unintended reads.
