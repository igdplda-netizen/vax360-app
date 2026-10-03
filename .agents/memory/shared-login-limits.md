---
name: Shared login limits
description: Persistence and failure policy for multi-instance authentication throttling
---

Authentication attempt limits must use the existing shared database, with atomic increments and no process-local fallback when database operations fail.

**Why:** Publishing may run multiple servers or replace a process; independent in-memory counters weaken brute-force protection. The existing PostgreSQL service avoids adding another infrastructure dependency.

**How to apply:** Preserve shared storage and fail-closed behavior when changing authentication limits. Treat schema availability as a production startup requirement, not permission to run production DDL. Keep keys opaque and derived from both account and normalized IP.