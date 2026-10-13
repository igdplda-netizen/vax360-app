# Dependency security backports

Run `npm run test:dependency-security` after changing dependency versions and
`npm run postinstall` after installations that skip lifecycle scripts.
Both the root and backend lockfiles are part of the application.
`npm run build` also applies the RSA backport before production web export.

## braces: GHSA-vfj7-8cjw-p6xm

Upstream's latest release, 3.0.3, has no depth guards. Both dependency trees
use the pinned npm alias `@dieub/braces-depth-guard@3.0.3-pn.1`. Its published
runtime retains the upstream MIT license and applies the depth-guard backport
from https://github.com/micromatch/braces/pull/72. The release has npm
provenance. Regression tests exercise regular expansion, deep string input,
and direct AST traversal through compile, expand, and stringify.

## node-forge: GHSA-86w9-cpqp-85rv

Upstream's latest release remains 1.4.0. The examined
`@andreeewill/node-forge@2.0.0` fork has the same affected verifier and is
**not** a security fix.

`scripts/patch-forge.js` backports nested AlgorithmIdentifier validation at
installation time. RSA PKCS#1 v1.5 verification accepts only an algorithm OID
and an optional empty NULL parameter, rejecting extra nested elements.
It preserves existing DigestInfo validation and all other cryptographic APIs.
The patch is idempotent and fails explicitly on an unexpected source or version.

Tests verify valid signatures, altered messages, and correctly signed malformed
DigestInfo values, including extra nested elements and invalid NULL parameters.

**Scanner limitation:** the package keeps its real upstream name/version.
Version-only dependency scanners still report this advisory despite the tested
backport. Do not suppress the advisory or rename the package to claim a clean
scan. Replace the backport with an upstream patched release when available,
then retain the regression tests.
