---
name: Shared authentication limits
description: Persistence, policy isolation and failure rules for authentication throttling
---

Authentication attempt limits must use the existing shared database, with atomic increments and no process-local fallback when database operations fail.

**Why:** Publishing may run multiple servers or replace a process; independent in-memory counters weaken brute-force protection. The existing PostgreSQL service avoids adding another infrastructure dependency.

**How to apply:** Preserve shared storage and fail-closed behavior when changing authentication limits. Treat schema availability as a production startup requirement, not permission to run production DDL. Keep keys opaque. Login keys combine account and normalized IP; registration and password recovery remain IP-only.

Extending shared throttling must preserve each policy's identity and active login budgets, with separate store instances for separate limiters.

**Why:** Moving storage must not turn an IP-only policy into a per-account policy, let one endpoint spend another policy's budget, or reset existing login failures during rollout.

**How to apply:** Isolate new policies with stable namespaces, preserve existing login key compatibility, and do not silently bypass throttling on storage errors.