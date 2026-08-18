/**
 * Tests: superadmin default-password startup warnings
 *
 * The warning logic lives in backend/lib/superadmin-warning.js and is used
 * by both db-init.js and server.js.  We test it at two levels:
 *
 * Part A — Unit tests on warnIfDefaultPassword (the shared pure function).
 *   These cover all credential-risk / safe combinations without touching a DB
 *   and therefore apply equally to the db-init.js and server.js callers.
 *
 * Part B — Integration tests via initializeDatabase (db-init.js path).
 *   These confirm the wiring: that the correct row/env values are passed into
 *   the helper during the actual migration + seed sequence.
 *
 * Scenarios:
 *   1. First boot (no row) + default password          → warn
 *   2. First boot (no row) + custom password           → no warn
 *   3. Existing row with default password hash + default env   → warn
 *   4. Existing row with default password hash + CUSTOM env    → warn  ← regression case
 *   5. Existing row with changed password hash + default env   → no warn
 *   6. Existing row with changed password hash + custom env    → no warn
 */

'use strict';

const crypto = require('crypto');
const sqlite3 = require('sqlite3').verbose();
const { warnIfDefaultPassword } = require('../lib/superadmin-warning');
const { initializeDatabase } = require('../db-init');

// ─── Shared helpers ──────────────────────────────────────

const DEFAULT_PASSWORD = 'Admin@123';

/** Build a real PBKDF2 row with the given plain-text password. */
function buildRow(plainPassword) {
  const salt = crypto.randomBytes(16).toString('hex');
  const password_hash = crypto
    .pbkdf2Sync(plainPassword, salt, 100000, 64, 'sha512')
    .toString('hex');
  return { password_hash, salt };
}

/**
 * Spy on console.warn for the duration of `fn`, restore afterward.
 * Returns an array of all warning strings that were emitted.
 */
async function captureWarnings(fn) {
  const warnings = [];
  const real = console.warn;
  console.warn = (...args) => warnings.push(args.join(' '));
  try {
    await fn();
  } finally {
    console.warn = real;
  }
  return warnings;
}

/**
 * True if any captured warning indicates a default-credential risk.
 * Does NOT look for the credential string itself — messages no longer include it.
 */
const hasDefaultWarning = (ws) => ws.some((w) => /default/i.test(w));

// ─────────────────────────────────────────────────────────
// Part A: unit tests — warnIfDefaultPassword
// ─────────────────────────────────────────────────────────

describe('warnIfDefaultPassword (shared helper)', () => {
  jest.setTimeout(30_000);

  // ── Scenario 1 ──────────────────────────────────────
  test('warns on first boot when the default password will be used', async () => {
    const warnings = await captureWarnings(async () => {
      warnIfDefaultPassword(null, DEFAULT_PASSWORD);
    });
    expect(hasDefaultWarning(warnings)).toBe(true);
  });

  // ── Scenario 2 ──────────────────────────────────────
  test('does NOT warn on first boot when a custom password is configured', async () => {
    const warnings = await captureWarnings(async () => {
      warnIfDefaultPassword(null, 'MyStr0ngP@ssword!');
    });
    expect(hasDefaultWarning(warnings)).toBe(false);
  });

  // ── Scenario 3 ──────────────────────────────────────
  test('warns when the stored hash still matches the default (env also default)', async () => {
    const row = buildRow(DEFAULT_PASSWORD);
    const warnings = await captureWarnings(async () => {
      warnIfDefaultPassword(row, DEFAULT_PASSWORD);
    });
    expect(hasDefaultWarning(warnings)).toBe(true);
  });

  // ── Scenario 4 — regression ──────────────────────────
  // Even when INITIAL_SUPERADMIN_PASSWORD is set to a custom value, the
  // warning must still fire if the stored hash matches the default.  The env
  // var is for seeding only; an unchanged account is at risk regardless.
  test('warns when the stored hash matches the default even though env has a custom password', async () => {
    const row = buildRow(DEFAULT_PASSWORD); // account was never changed
    const warnings = await captureWarnings(async () => {
      warnIfDefaultPassword(row, 'MyStr0ngP@ssword!'); // custom env value
    });
    expect(hasDefaultWarning(warnings)).toBe(true);
  });

  // ── Scenario 5 ──────────────────────────────────────
  test('does NOT warn when the stored hash reflects a changed password (env default)', async () => {
    const row = buildRow('MyStr0ngP@ssword!');
    const warnings = await captureWarnings(async () => {
      warnIfDefaultPassword(row, DEFAULT_PASSWORD);
    });
    expect(hasDefaultWarning(warnings)).toBe(false);
  });

  // ── Scenario 6 ──────────────────────────────────────
  test('does NOT warn when the stored hash reflects a changed password (env also custom)', async () => {
    const row = buildRow('MyStr0ngP@ssword!');
    const warnings = await captureWarnings(async () => {
      warnIfDefaultPassword(row, 'AnotherP@ss99');
    });
    expect(hasDefaultWarning(warnings)).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────
// Part B: integration tests — initializeDatabase (db-init.js)
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

/** Create the users table so we can pre-insert rows before calling init. */
function createUsersTable(db) {
  return new Promise((resolve, reject) => {
    db.run(
      `CREATE TABLE IF NOT EXISTS users (
        whatsapp       TEXT PRIMARY KEY,
        name           TEXT NOT NULL,
        email          TEXT,
        password_hash  TEXT NOT NULL,
        salt           TEXT,
        role           TEXT NOT NULL DEFAULT 'parent',
        two_factor_secret  TEXT,
        two_factor_enabled INTEGER DEFAULT 0,
        created_at     DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      (err) => { if (err) reject(err); else resolve(); }
    );
  });
}

/** Insert a superadmin row hashed with the given plain-text password. */
function insertSuperadmin(db, plainPassword) {
  return new Promise((resolve, reject) => {
    const { password_hash, salt } = buildRow(plainPassword);
    db.run(
      `INSERT INTO users (whatsapp, name, email, password_hash, salt, role, created_at)
       VALUES ('9999', 'Superadmin', 'admin@vax360.com', ?, ?, 'superadmin', datetime('now'))`,
      [password_hash, salt],
      (err) => { if (err) reject(err); else resolve(); }
    );
  });
}

/**
 * Run initializeDatabase against `db`, temporarily overriding env vars,
 * and return any console.warn calls that fired.
 */
function runInitAndCaptureWarnings(db, env = {}) {
  return new Promise((resolve, reject) => {
    const saved = {};
    for (const [k, v] of Object.entries(env)) {
      saved[k] = process.env[k];
      if (v === undefined || v === '') delete process.env[k];
      else process.env[k] = v;
    }

    const warnings = [];
    const real = console.warn;
    console.warn = (...args) => warnings.push(args.join(' '));

    initializeDatabase(db, (err) => {
      console.warn = real;
      for (const [k] of Object.entries(env)) {
        if (saved[k] === undefined) delete process.env[k];
        else process.env[k] = saved[k];
      }
      if (err) return reject(err);
      resolve(warnings);
    });
  });
}

describe('initializeDatabase — superadmin warning (db-init.js integration)', () => {
  jest.setTimeout(30_000);

  // ── Scenario 1 ──────────────────────────────────────
  test('warns on first boot when using the default password', async () => {
    const db = await openMemoryDb();
    const warnings = await runInitAndCaptureWarnings(db, {
      INITIAL_SUPERADMIN_PASSWORD: undefined,
    });
    db.close();
    expect(hasDefaultWarning(warnings)).toBe(true);
  });

  // ── Scenario 2 ──────────────────────────────────────
  test('does NOT warn on first boot when a custom password is configured', async () => {
    const db = await openMemoryDb();
    const warnings = await runInitAndCaptureWarnings(db, {
      INITIAL_SUPERADMIN_PASSWORD: 'MyStr0ngP@ssword!',
    });
    db.close();
    expect(hasDefaultWarning(warnings)).toBe(false);
  });

  // ── Scenario 3 ──────────────────────────────────────
  test('warns when superadmin exists and password is still the default', async () => {
    const db = await openMemoryDb();
    await createUsersTable(db);
    await insertSuperadmin(db, DEFAULT_PASSWORD);

    const warnings = await runInitAndCaptureWarnings(db, {
      INITIAL_SUPERADMIN_PASSWORD: undefined,
    });
    db.close();
    expect(hasDefaultWarning(warnings)).toBe(true);
  });

  // ── Scenario 4 — regression ──────────────────────────
  test('warns when superadmin has default password even if env has a custom password', async () => {
    const db = await openMemoryDb();
    await createUsersTable(db);
    await insertSuperadmin(db, DEFAULT_PASSWORD); // account never changed

    const warnings = await runInitAndCaptureWarnings(db, {
      INITIAL_SUPERADMIN_PASSWORD: 'MyStr0ngP@ssword!', // custom env value
    });
    db.close();
    expect(hasDefaultWarning(warnings)).toBe(true);
  });

  // ── Scenario 5 ──────────────────────────────────────
  test('does NOT warn when superadmin exists and password has been changed', async () => {
    const db = await openMemoryDb();
    await createUsersTable(db);
    await insertSuperadmin(db, 'MyStr0ngP@ssword!');

    const warnings = await runInitAndCaptureWarnings(db, {
      INITIAL_SUPERADMIN_PASSWORD: undefined,
    });
    db.close();
    expect(hasDefaultWarning(warnings)).toBe(false);
  });
});
