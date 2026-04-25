# ─────────────────────────────────────────────────────────
# Vax360 – Requirements / Dependencies
# ─────────────────────────────────────────────────────────
# This file lists all project dependencies for reference.
# Use `npm run setup` to install everything automatically.
# ─────────────────────────────────────────────────────────

## System Requirements
- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

## Frontend Dependencies (package.json)
- @capacitor/core        ^6.0.0   # Capacitor runtime
- @capacitor/app         ^6.0.0   # Native app events
- @capacitor/haptics     ^6.0.0   # Haptic feedback
- @capacitor/status-bar  ^6.0.0   # Status bar control
- @capacitor/splash-screen ^6.0.0 # Splash screen

## Frontend Dev Dependencies
- @capacitor/cli         ^6.0.0   # Capacitor CLI tools

## Backend Dependencies (backend/package.json)
- express                ^5.2.1   # HTTP server framework
- sqlite3               ^6.0.1   # SQLite database driver
- cors                  ^2.8.6   # Cross-origin resource sharing
- body-parser            ^2.2.2   # JSON body parsing middleware

## Backend Optional Dependencies
- dotenv                ^16.4.5   # Environment variable loader

## Quick Install
```
npm run setup
```

## Manual Install
```
npm install
cd backend && npm install
npm run db:init
```
