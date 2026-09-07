# Database persistence and publishing

Vax360 uses Replit's managed PostgreSQL database whenever `DATABASE_URL` is
available. Production refuses to start without it, so an Autoscale deployment
cannot silently fall back to an ephemeral SQLite file.

## Schema lifecycle

- The `Start application` development workflow runs `backend/db-init.js`
  against managed PostgreSQL. This keeps the development database schema
  current and idempotently creates `users`, `store`, `audit_log`, and
  `app_meta`.
- Replit Publish creates a separate production database and applies the
  development schema to it during publishing.
- The production server performs a read-only schema gate at startup and exits
  if any required table is absent. It does not perform production DDL.

This follows Replit's supported development/production database lifecycle:
https://docs.replit.com/features/data-and-storage/development-and-production

After merging a schema change, run the development workflow before publishing.
Review the database schema changes shown by Publish, then publish the app.

## Local and test mode

SQLite remains supported for automated unit tests (`DB_PATH=:memory:`) and
explicit local use (`DB_DRIVER=sqlite`). Production ignores SQLite overrides
and always selects PostgreSQL.