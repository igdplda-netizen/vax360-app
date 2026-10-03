---
name: Login failure budget
description: Security rationale for excluding successful authentication steps without resetting failures.
---

Successful authentication steps should refund only their own attempt, never reset prior failures. A correct password that issues a 2FA challenge counts as a successful password step, not a completed authentication.

**Why:** Resetting failures when issuing a challenge would let someone with the password repeatedly obtain new challenges and bypass the limit on incorrect 2FA codes.

**How to apply:** Preserve the accumulated failure budget across successful password and 2FA steps whenever changing login throttling.