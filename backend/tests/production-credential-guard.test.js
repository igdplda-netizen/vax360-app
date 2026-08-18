'use strict';

/**
 * Tests: production credential strength enforcement
 *
 * Covers two layers:
 *   A) validateAdminPassword — the shared strength-check helper used at startup
 *   B) initializeDatabase — confirms the production gate propagates errors correctly
 */

const sqlite3 = require('sqlite3').verbose();
const { validateAdminPassword } = require('../lib/validate-admin-password');
const { initializeDatabase } = require('../db-init');

// ─────────────────────────────────────────────────────────
// Part A: validateAdminPassword unit tests
// ─────────────────────────────────────────────────────────

describe('validateAdminPassword', () => {
  // ── Rejection cases ──────────────────────────────────────

  test('rejects empty string', () => {
    expect(validateAdminPassword('').valid).toBe(false);
  });

  test('rejects undefined / falsy', () => {
    expect(validateAdminPassword(undefined).valid).toBe(false);
    expect(validateAdminPassword(null).valid).toBe(false);
  });

  test('rejects the legacy default "Admin@123"', () => {
    expect(validateAdminPassword('Admin@123').valid).toBe(false);
  });

  test('rejects "1234" (too short and sequential)', () => {
    expect(validateAdminPassword('1234').valid).toBe(false);
  });

  test('rejects "12345678" (sequential digits, even though long enough)', () => {
    expect(validateAdminPassword('12345678').valid).toBe(false);
  });

  test('rejects "abcdefgh" (sequential letters)', () => {
    expect(validateAdminPassword('abcdefgh').valid).toBe(false);
  });

  test('rejects a 7-character password (below minimum length)', () => {
    expect(validateAdminPassword('Abc1234').valid).toBe(false);
  });

  test('rejects "aaaaaaaa" (single repeated character)', () => {
    expect(validateAdminPassword('aaaaaaaa').valid).toBe(false);
  });

  test('rejects a password with no digit', () => {
    expect(validateAdminPassword('AbcdEfghij').valid).toBe(false);
  });

  test('rejects a password with no letter', () => {
    expect(validateAdminPassword('87654321').valid).toBe(false);
  });

  // ── Acceptance cases ─────────────────────────────────────

  test('accepts a strong password with letter + digit, ≥ 8 chars', () => {
    expect(validateAdminPassword('MyStr0ngPwd!').valid).toBe(true);
  });

  test('accepts exactly 8 characters when it meets all rules', () => {
    expect(validateAdminPassword('Abc1defg').valid).toBe(true);
  });

  test('accepts a long passphrase', () => {
    expect(validateAdminPassword('correct-horse-battery-staple-4!').valid).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────
// Part B: initializeDatabase production gate
// ─────────────────────────────────────────────────────────

/** Open a fresh in-memory SQLite database. */
function openMemoryDb() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(':memory:', (err) => {
      if (err) reject(err);
      else resolve(db);
    });
  });
}

/**
 * Run initializeDatabase with NODE_ENV=production and a given password,
 * then restore the original env.
 * Resolves with the error passed to the callback (null on success).
 */
function runInitInProduction(db, password) {
  return new Promise((resolve) => {
    const savedEnv = process.env.NODE_ENV;
    const savedPwd = process.env.INITIAL_SUPERADMIN_PASSWORD;

    process.env.NODE_ENV = 'production';
    if (password === undefined) {
      delete process.env.INITIAL_SUPERADMIN_PASSWORD;
    } else {
      process.env.INITIAL_SUPERADMIN_PASSWORD = password;
    }

    initializeDatabase(db, (err) => {
      // Restore env before resolving
      process.env.NODE_ENV = savedEnv;
      if (savedPwd === undefined) delete process.env.INITIAL_SUPERADMIN_PASSWORD;
      else process.env.INITIAL_SUPERADMIN_PASSWORD = savedPwd;

      resolve(err);
    });
  });
}

describe('initializeDatabase — production credential gate', () => {
  jest.setTimeout(15_000);

  test('fails when INITIAL_SUPERADMIN_PASSWORD is not set', async () => {
    const db = await openMemoryDb();
    const err = await runInitInProduction(db, undefined);
    db.close();
    expect(err).not.toBeNull();
    expect(err.message).toMatch(/INITIAL_SUPERADMIN_PASSWORD/);
  });

  test('fails when INITIAL_SUPERADMIN_PASSWORD is the default "Admin@123"', async () => {
    const db = await openMemoryDb();
    const err = await runInitInProduction(db, 'Admin@123');
    db.close();
    expect(err).not.toBeNull();
  });

  test('fails when INITIAL_SUPERADMIN_PASSWORD is the weak "1234"', async () => {
    const db = await openMemoryDb();
    const err = await runInitInProduction(db, '1234');
    db.close();
    expect(err).not.toBeNull();
  });

  test('fails when INITIAL_SUPERADMIN_PASSWORD is too short (7 chars)', async () => {
    const db = await openMemoryDb();
    const err = await runInitInProduction(db, 'Abc1234');
    db.close();
    expect(err).not.toBeNull();
  });

  test('succeeds when INITIAL_SUPERADMIN_PASSWORD is strong', async () => {
    const db = await openMemoryDb();
    const err = await runInitInProduction(db, 'MyStr0ngPwd!');
    db.close();
    expect(err).toBeNull();
  });
});
