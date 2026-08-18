'use strict';

/**
 * Superadmin default-password warning helper
 * ──────────────────────────────────────────
 * Shared by db-init.js and server.js so the warning logic lives in exactly
 * one place and is trivially testable.
 *
 * Design decision: the check for an *existing* admin's password is intentionally
 * decoupled from INITIAL_SUPERADMIN_PASSWORD.  That env var controls seeding
 * only; a previously seeded account that still carries the default hash is at
 * risk regardless of what the env var says today.
 */

const crypto = require('crypto');

const DEFAULT_PASSWORD = 'Admin@123';

/**
 * Emit a console.warn if the superadmin credentials are genuinely at risk.
 *
 * @param {{ password_hash: string, salt: string }|null} existingRow
 *   The superadmin DB row (`SELECT password_hash, salt … WHERE whatsapp='9999'`),
 *   or null when no row exists yet (first-boot seeding path).
 *
 * @param {string} configuredPassword
 *   The value of process.env.INITIAL_SUPERADMIN_PASSWORD, or the fallback
 *   'Admin@123' when the env var is absent/empty.
 */
function warnIfDefaultPassword(existingRow, configuredPassword) {
  if (!existingRow) {
    // First boot: the superadmin will be seeded now.
    // Warn if the seed password is still the default.
    if (configuredPassword === DEFAULT_PASSWORD) {
      console.warn(
        "\n⚠️  WARNING: Initial superadmin password set to default 'Admin@123'. Change this password immediately in production!\n"
      );
    }
    return;
  }

  // Admin already exists: warn if the stored hash still matches the default,
  // regardless of what INITIAL_SUPERADMIN_PASSWORD is set to today.
  if (existingRow.salt) {
    const defaultHash = crypto
      .pbkdf2Sync(DEFAULT_PASSWORD, existingRow.salt, 100000, 64, 'sha512')
      .toString('hex');
    if (defaultHash === existingRow.password_hash) {
      console.warn(
        "\n⚠️  WARNING: Superadmin password is still set to default 'Admin@123'. Change this password immediately in production!\n"
      );
    }
  }
}

module.exports = { warnIfDefaultPassword };
