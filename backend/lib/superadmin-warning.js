'use strict';

/**
 * Superadmin default-password warning/enforcement helper
 * ───────────────────────────────────────────────────────
 * Shared by db-init.js and server.js so the credential-check logic lives in
 * exactly one place and is trivially testable.
 *
 * Design decision: the check for an *existing* admin's password is intentionally
 * decoupled from INITIAL_SUPERADMIN_PASSWORD.  That env var controls seeding
 * only; a previously seeded account that still carries the default hash is at
 * risk regardless of what the env var says today.
 *
 * In production (NODE_ENV === 'production') default credentials cause an
 * immediate process.exit(1) rather than a mere warning, and the log message
 * never includes the credential string itself.
 */

const crypto = require('crypto');

const DEFAULT_PASSWORD = 'Admin@123';

/**
 * Return whether an authenticated user must replace the default superadmin password.
 *
 * @param {{ role?: string, password_hash?: string, salt?: string }|null} user
 * @returns {boolean}
 */
function mustChangeDefaultPassword(user) {
  if (!user || user.role !== 'superadmin' || !user.salt || !user.password_hash) {
    return false;
  }

  const defaultHash = crypto
    .pbkdf2Sync(DEFAULT_PASSWORD, user.salt, 100000, 64, 'sha512')
    .toString('hex');
  return defaultHash === user.password_hash;
}

/**
 * Warn (development) or abort (production) if superadmin credentials are weak.
 *
 * @param {{ password_hash: string, salt: string }|null} existingRow
 *   The superadmin DB row (`SELECT password_hash, salt … WHERE whatsapp='9999'`),
 *   or null when no row exists yet (first-boot seeding path).
 *
 * @param {string} configuredPassword
 *   The value of process.env.INITIAL_SUPERADMIN_PASSWORD, or the fallback
 *   when the env var is absent/empty.
 */
function warnIfDefaultPassword(existingRow, configuredPassword) {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!existingRow) {
    // First boot: the superadmin will be seeded now.
    if (configuredPassword === DEFAULT_PASSWORD) {
      if (isProduction) {
        console.error(
          '\n❌ FATAL: Superadmin is about to be seeded with the default password.' +
          ' Set INITIAL_SUPERADMIN_PASSWORD to a strong value before running in production.\n'
        );
        process.exit(1);
      }
      console.warn(
        '\n⚠️  WARNING: Superadmin password is set to the default. Change INITIAL_SUPERADMIN_PASSWORD immediately!\n'
      );
    }
    return;
  }

  // Admin already exists: check whether the stored hash still matches the default,
  // regardless of what INITIAL_SUPERADMIN_PASSWORD is set to today.
  if (existingRow.salt) {
    const defaultHash = crypto
      .pbkdf2Sync(DEFAULT_PASSWORD, existingRow.salt, 100000, 64, 'sha512')
      .toString('hex');
    if (defaultHash === existingRow.password_hash) {
      if (isProduction) {
        console.error(
          '\n❌ FATAL: Superadmin account is using the default password.' +
          ' Update the password immediately and restart the server.\n'
        );
        process.exit(1);
      }
      console.warn(
        '\n⚠️  WARNING: Superadmin password is still set to the default. Change it immediately!\n'
      );
    }
  }
}

module.exports = {
  mustChangeDefaultPassword,
  warnIfDefaultPassword,
  _DEFAULT_PASSWORD: DEFAULT_PASSWORD,
};
