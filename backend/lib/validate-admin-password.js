'use strict';

/**
 * Admin-password strength validator
 * ──────────────────────────────────
 * Used by db-init.js and server.js to enforce a minimum password policy on
 * INITIAL_SUPERADMIN_PASSWORD before any database work is attempted.
 *
 * Rules (matches the user-facing validatePasswordComplexity policy but stricter):
 *   - Required (non-empty)
 *   - Must NOT equal the well-known default credential
 *   - Length: 8–128 characters
 *   - Not entirely one repeated character (e.g. "aaaaaaaa")
 *   - Not a simple ascending/descending sequence (e.g. "12345678", "abcdefgh")
 *   - Must contain at least one letter AND at least one digit
 */

const DEFAULT_PASSWORD = 'Admin@123';

// Sequential runs that are trivially guessable
const SEQUENTIAL_RUNS = [
  '0123456789',
  '9876543210',
  'abcdefghijklmnopqrstuvwxyz',
  'zyxwvutsrqponmlkjihgfedcba',
];

/**
 * @param {string|undefined|null} pwd
 * @returns {{ valid: true } | { valid: false, reason: string }}
 */
function validateAdminPassword(pwd) {
  if (!pwd) {
    return { valid: false, reason: 'Password is required.' };
  }
  if (pwd === DEFAULT_PASSWORD) {
    return { valid: false, reason: 'Password must not be the built-in default value.' };
  }
  if (pwd.length < 8 || pwd.length > 128) {
    return { valid: false, reason: 'Password must be between 8 and 128 characters.' };
  }
  // Entirely one repeated character: "aaaaaaaa", "11111111"
  if (/^(.)\1+$/.test(pwd)) {
    return { valid: false, reason: 'Password must not consist of a single repeated character.' };
  }
  // Substring of a known sequential run: "1234", "abcde", "98765" …
  const lower = pwd.toLowerCase();
  if (SEQUENTIAL_RUNS.some((run) => run.includes(lower))) {
    return { valid: false, reason: 'Password must not be a simple sequential pattern (e.g. "1234", "abcdef").' };
  }
  // Must have at least one letter and one digit
  if (!/[a-zA-Z]/.test(pwd) || !/[0-9]/.test(pwd)) {
    return { valid: false, reason: 'Password must contain at least one letter and one digit.' };
  }
  return { valid: true };
}

module.exports = { validateAdminPassword, _DEFAULT_PASSWORD: DEFAULT_PASSWORD };
