---
name: Security backport verification
description: How to judge replacement packages when upstream has no patched release.
---

A fork's newer version or different package name is not evidence of a security
fix. Inspect the actual vulnerable logic and test the exploit condition before
adopting a replacement.

**Why:** a node-forge fork advertised a newer upstream baseline but retained the
same nested RSA DigestAlgorithm validation flaw. Switching to it would clear
the package-name scan without fixing the vulnerability.

**How to apply:** prefer real upstream fixes. For unavailable fixes, verify
published backports behaviorally. If applying a local patch, keep upstream
identity and disclose that version-only scanners cannot recognize the patch.
