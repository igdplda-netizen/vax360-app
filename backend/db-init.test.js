/**
 * db-init.test.js
 * ───────────────
 * Tests for the database migration logic in db-init.js.
 * Uses an in-memory SQLite database so no files are created on disk.
 *
 * Test suites:
 *   1. Fresh database   – all tables and columns created from scratch
 *   2. Idempotency      – running migrations twice is safe
 *   3. Upgrade path     – legacy schema receives all missing columns + backfill
 *   4. Legacy store     – store table without updated_at gets the column
 *   5. Fault injection  – every critical error is propagated and halts the chain
 *   6. CLI exit code    – CLI wrapper exits non-zero when db cannot be opened
 */

const sqlite3 = require('sqlite3').verbose();
const { execFile } = require('child_process');
const path = require('path');
const { initializeDatabase } = require('./db-init');

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Open a fresh in-memory SQLite database. */
function openMemoryDb() {
  return new sqlite3.Database(':memory:');
}

/** Promise wrapper: get column names from PRAGMA table_info. */
function getColumns(db, tableName) {
  return new Promise((resolve, reject) => {
    db.all(`PRAGMA table_info(${tableName})`, (err, rows) => {
      if (err) reject(err);
      else resolve((rows || []).map(r => r.name));
    });
  });
}

/** Promise wrapper: run initializeDatabase. */
function migrate(db) {
  return new Promise((resolve, reject) => {
    initializeDatabase(db, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

/** Promise wrapper: db.run */
function dbRun(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

/** Promise wrapper: db.get */
function dbGet(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

/** Promise wrapper: db.all */
function dbAll(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

/**
 * Create a proxy around a real sqlite3 db that injects an error for any SQL
 * statement whose text includes `failPattern` (case-insensitive substring).
 * All other statements are delegated to the real db unchanged.
 *
 * The proxy intercepts run / all / get / serialize so that initializeDatabase
 * always calls through our layer regardless of call order.
 */
function makeFaultyDb(realDb, failPattern) {
  const injectedError = new Error(`[injected] failure on: ${failPattern}`);

  function intercept(method) {
    return function (sql, ...args) {
      if (typeof sql === 'string' && sql.toLowerCase().includes(failPattern.toLowerCase())) {
        // Find the callback (last argument that is a function) and call it with the error.
        for (let i = args.length - 1; i >= 0; i--) {
          if (typeof args[i] === 'function') {
            process.nextTick(() => args[i](injectedError));
            return;
          }
        }
        // No callback found — nothing to do (fire-and-forget call during failure path).
        return;
      }
      // Not a failing statement — delegate to the real db.
      return realDb[method].call(realDb, sql, ...args);
    };
  }

  return new Proxy(realDb, {
    get(target, prop) {
      if (prop === 'run' || prop === 'all' || prop === 'get') {
        return intercept(prop);
      }
      if (prop === 'serialize') {
        // Delegate serialize so sqlite3 still serialises internally,
        // but calls made inside the callback flow through this proxy.
        return function (cb) {
          return target.serialize.call(target, cb);
        };
      }
      const val = target[prop];
      return typeof val === 'function' ? val.bind(target) : val;
    },
  });
}

/**
 * Run initializeDatabase through a faulty db and assert the callback receives
 * an error (i.e. the chain is halted and does not silently succeed).
 */
function expectMigrationToFail(faultyDb) {
  return new Promise((resolve, reject) => {
    initializeDatabase(faultyDb, (err) => {
      if (err) resolve(err);            // Good – error was propagated.
      else reject(new Error('Expected migration to fail but it succeeded.'));
    });
  });
}

// ─── Suite 1: Fresh database ─────────────────────────────────────────────────

describe('initializeDatabase – fresh database', () => {
  let db;

  beforeAll(async () => {
    db = openMemoryDb();
    await migrate(db);
  });

  afterAll((done) => { db.close(done); });

  it('creates the users table with all required columns', async () => {
    const cols = await getColumns(db, 'users');
    ['whatsapp', 'name', 'email', 'password_hash', 'salt',
     'role', 'two_factor_secret', 'two_factor_enabled', 'created_at']
      .forEach(c => expect(cols).toContain(c));
  });

  it('creates the store table with all required columns', async () => {
    const cols = await getColumns(db, 'store');
    ['id', 'data', 'updated_at'].forEach(c => expect(cols).toContain(c));
  });

  it('creates the audit_log table with all required columns', async () => {
    const cols = await getColumns(db, 'audit_log');
    ['id', 'action', 'entity_type', 'entity_id', 'payload', 'created_at']
      .forEach(c => expect(cols).toContain(c));
  });

  it('creates the app_meta table with all required columns', async () => {
    const cols = await getColumns(db, 'app_meta');
    ['key', 'value'].forEach(c => expect(cols).toContain(c));
  });

  it('seeds the db_version row in app_meta', async () => {
    const row = await dbGet(db, "SELECT value FROM app_meta WHERE key = 'db_version'");
    expect(row).toBeDefined();
    expect(row.value).toBe('1.0.0');
  });

  it('seeds the superadmin user (whatsapp 9999)', async () => {
    const row = await dbGet(db, "SELECT whatsapp, role FROM users WHERE whatsapp = '9999'");
    expect(row).toBeDefined();
    expect(row.role).toBe('superadmin');
  });

  it('seeds superadmin with a non-null created_at', async () => {
    const row = await dbGet(db, "SELECT created_at FROM users WHERE whatsapp = '9999'");
    expect(row).toBeDefined();
    expect(row.created_at).not.toBeNull();
  });
});

// ─── Suite 2: Idempotency ─────────────────────────────────────────────────────

describe('initializeDatabase – idempotency', () => {
  let db;

  beforeAll(async () => {
    db = openMemoryDb();
    await migrate(db);
    await migrate(db); // Second run must not throw or corrupt the schema
  });

  afterAll((done) => { db.close(done); });

  it('still has all users columns after a second migration run', async () => {
    const cols = await getColumns(db, 'users');
    ['whatsapp', 'name', 'email', 'password_hash', 'salt',
     'role', 'two_factor_secret', 'two_factor_enabled', 'created_at']
      .forEach(c => expect(cols).toContain(c));
  });

  it('still has exactly one superadmin after a second migration run', async () => {
    const rows = await dbAll(db, "SELECT whatsapp FROM users WHERE whatsapp = '9999'");
    expect(rows.length).toBe(1);
  });
});

// ─── Suite 3: Upgrade path (legacy users table) ───────────────────────────────

describe('initializeDatabase – upgrade path', () => {
  let db;

  beforeAll(async () => {
    db = openMemoryDb();

    // Simulate a legacy users table that pre-dates salt, 2FA, and created_at columns.
    await dbRun(db, `
      CREATE TABLE users (
        whatsapp      TEXT PRIMARY KEY,
        name          TEXT NOT NULL,
        email         TEXT,
        password_hash TEXT NOT NULL,
        role          TEXT NOT NULL DEFAULT 'parent'
      )
    `);

    // Insert a pre-existing user row to verify backfill behaviour.
    await dbRun(db, `
      INSERT INTO users (whatsapp, name, password_hash, role)
      VALUES ('1111', 'Legacy User', 'fakehash', 'parent')
    `);

    await migrate(db);
  });

  afterAll((done) => { db.close(done); });

  it('adds the salt column to a legacy users table', async () => {
    expect(await getColumns(db, 'users')).toContain('salt');
  });

  it('adds the two_factor_secret column to a legacy users table', async () => {
    expect(await getColumns(db, 'users')).toContain('two_factor_secret');
  });

  it('adds the two_factor_enabled column to a legacy users table', async () => {
    expect(await getColumns(db, 'users')).toContain('two_factor_enabled');
  });

  it('adds the created_at column to a legacy users table', async () => {
    expect(await getColumns(db, 'users')).toContain('created_at');
  });

  it('backfills created_at for the pre-existing legacy row', async () => {
    const row = await dbGet(db, "SELECT created_at FROM users WHERE whatsapp = '1111'");
    expect(row).toBeDefined();
    expect(row.created_at).not.toBeNull();
    expect(typeof row.created_at).toBe('string');
    expect(row.created_at.length).toBeGreaterThan(0);
  });

  it('preserves existing row data during upgrade', async () => {
    const row = await dbGet(db, "SELECT name, password_hash, role FROM users WHERE whatsapp = '1111'");
    expect(row).toBeDefined();
    expect(row.name).toBe('Legacy User');
    expect(row.password_hash).toBe('fakehash');
    expect(row.role).toBe('parent');
  });

  it('creates the store table during upgrade', async () => {
    const cols = await getColumns(db, 'store');
    ['id', 'data', 'updated_at'].forEach(c => expect(cols).toContain(c));
  });

  it('creates the audit_log table during upgrade', async () => {
    const cols = await getColumns(db, 'audit_log');
    ['id', 'action', 'created_at'].forEach(c => expect(cols).toContain(c));
  });

  it('creates the app_meta table during upgrade', async () => {
    const cols = await getColumns(db, 'app_meta');
    ['key', 'value'].forEach(c => expect(cols).toContain(c));
  });
});

// ─── Suite 4: Legacy store table without updated_at ───────────────────────────

describe('initializeDatabase – legacy store table without updated_at', () => {
  let db;

  beforeAll(async () => {
    db = openMemoryDb();
    await dbRun(db, `CREATE TABLE store (id TEXT PRIMARY KEY, data TEXT)`);
    await migrate(db);
  });

  afterAll((done) => { db.close(done); });

  it('adds the updated_at column to a legacy store table', async () => {
    expect(await getColumns(db, 'store')).toContain('updated_at');
  });
});

// ─── Suite 5: Fault injection – errors must be propagated and halt the chain ──

describe('initializeDatabase – fault injection', () => {
  // Each test opens its own in-memory db (or pre-configured legacy schema),
  // wraps it with makeFaultyDb, and asserts that the callback receives an error.

  it('propagates error when store CREATE TABLE fails', async () => {
    const db = openMemoryDb();
    try {
      const err = await expectMigrationToFail(makeFaultyDb(db, 'create table if not exists store'));
      expect(err).toBeTruthy();
      expect(err.message).toMatch(/injected/);
    } finally {
      db.close();
    }
  });

  it('propagates error when store PRAGMA table_info fails', async () => {
    const db = openMemoryDb();
    try {
      const err = await expectMigrationToFail(makeFaultyDb(db, 'pragma table_info(store)'));
      expect(err).toBeTruthy();
    } finally {
      db.close();
    }
  });

  it('propagates error when store updated_at ALTER TABLE fails', async () => {
    // Need the store table to exist WITHOUT updated_at so the ALTER is attempted.
    const db = openMemoryDb();
    await dbRun(db, `CREATE TABLE store (id TEXT PRIMARY KEY, data TEXT)`);
    try {
      const err = await expectMigrationToFail(
        makeFaultyDb(db, 'alter table store add column updated_at')
      );
      expect(err).toBeTruthy();
    } finally {
      db.close();
    }
  });

  it('propagates error when users CREATE TABLE fails', async () => {
    const db = openMemoryDb();
    try {
      const err = await expectMigrationToFail(makeFaultyDb(db, 'create table if not exists users'));
      expect(err).toBeTruthy();
    } finally {
      db.close();
    }
  });

  it('propagates error when users PRAGMA table_info fails', async () => {
    const db = openMemoryDb();
    try {
      const err = await expectMigrationToFail(makeFaultyDb(db, 'pragma table_info(users)'));
      expect(err).toBeTruthy();
    } finally {
      db.close();
    }
  });

  it('propagates error when users salt ALTER TABLE fails', async () => {
    // Legacy users table without salt so the ALTER is attempted.
    const db = openMemoryDb();
    await dbRun(db, `CREATE TABLE users (whatsapp TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT, password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'parent')`);
    try {
      const err = await expectMigrationToFail(
        makeFaultyDb(db, 'alter table users add column salt')
      );
      expect(err).toBeTruthy();
    } finally {
      db.close();
    }
  });

  it('propagates error when users two_factor_secret ALTER TABLE fails', async () => {
    const db = openMemoryDb();
    await dbRun(db, `CREATE TABLE users (whatsapp TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT, password_hash TEXT NOT NULL, salt TEXT, role TEXT NOT NULL DEFAULT 'parent')`);
    try {
      const err = await expectMigrationToFail(
        makeFaultyDb(db, 'alter table users add column two_factor_secret')
      );
      expect(err).toBeTruthy();
    } finally {
      db.close();
    }
  });

  it('propagates error when users two_factor_enabled ALTER TABLE fails', async () => {
    const db = openMemoryDb();
    await dbRun(db, `CREATE TABLE users (whatsapp TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT, password_hash TEXT NOT NULL, salt TEXT, role TEXT NOT NULL DEFAULT 'parent', two_factor_secret TEXT)`);
    try {
      const err = await expectMigrationToFail(
        makeFaultyDb(db, 'alter table users add column two_factor_enabled')
      );
      expect(err).toBeTruthy();
    } finally {
      db.close();
    }
  });

  it('propagates error when users created_at ALTER TABLE fails', async () => {
    const db = openMemoryDb();
    await dbRun(db, `CREATE TABLE users (whatsapp TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT, password_hash TEXT NOT NULL, salt TEXT, role TEXT NOT NULL DEFAULT 'parent', two_factor_secret TEXT, two_factor_enabled INTEGER DEFAULT 0)`);
    try {
      const err = await expectMigrationToFail(
        makeFaultyDb(db, 'alter table users add column created_at')
      );
      expect(err).toBeTruthy();
    } finally {
      db.close();
    }
  });

  it('propagates error when created_at backfill UPDATE fails', async () => {
    const db = openMemoryDb();
    await dbRun(db, `CREATE TABLE users (whatsapp TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT, password_hash TEXT NOT NULL, salt TEXT, role TEXT NOT NULL DEFAULT 'parent', two_factor_secret TEXT, two_factor_enabled INTEGER DEFAULT 0)`);
    try {
      const err = await expectMigrationToFail(
        makeFaultyDb(db, 'update users set created_at')
      );
      expect(err).toBeTruthy();
    } finally {
      db.close();
    }
  });

  it('propagates error when superadmin lookup db.get fails', async () => {
    const db = openMemoryDb();
    try {
      const err = await expectMigrationToFail(
        makeFaultyDb(db, "select password_hash, salt from users where whatsapp = '9999'")
      );
      expect(err).toBeTruthy();
    } finally {
      db.close();
    }
  });

  it('propagates error when superadmin INSERT fails', async () => {
    const db = openMemoryDb();
    try {
      // The superadmin insert SQL contains 'Superadmin' — target that string.
      const err = await expectMigrationToFail(
        makeFaultyDb(db, "insert into users (whatsapp, name, email, password_hash, salt, role, created_at)")
      );
      expect(err).toBeTruthy();
    } finally {
      db.close();
    }
  });

  it('propagates error when audit_log CREATE TABLE fails', async () => {
    const db = openMemoryDb();
    try {
      const err = await expectMigrationToFail(makeFaultyDb(db, 'create table if not exists audit_log'));
      expect(err).toBeTruthy();
    } finally {
      db.close();
    }
  });

  it('propagates error when app_meta CREATE TABLE fails', async () => {
    const db = openMemoryDb();
    try {
      const err = await expectMigrationToFail(makeFaultyDb(db, 'create table if not exists app_meta'));
      expect(err).toBeTruthy();
    } finally {
      db.close();
    }
  });

  it('propagates error when app_meta INSERT (seed) fails', async () => {
    const db = openMemoryDb();
    try {
      const err = await expectMigrationToFail(
        makeFaultyDb(db, 'insert or ignore into app_meta')
      );
      expect(err).toBeTruthy();
    } finally {
      db.close();
    }
  });
});

// ─── Suite 6: CLI exit code ───────────────────────────────────────────────────

describe('CLI – non-zero exit on db open failure', () => {
  it('exits with code 1 and prints no success message when DB path cannot be opened', (done) => {
    // Use a path inside a non-existent directory so sqlite3 cannot create the file.
    const impossiblePath = '/no_such_dir_vax360_test/impossible.db';
    const scriptPath = path.resolve(__dirname, 'db-init.js');

    execFile(
      process.execPath,
      [scriptPath],
      { env: { ...process.env, DB_PATH: impossiblePath } },
      (err, stdout, stderr) => {
        // execFile puts a non-zero exit into err.code
        expect(err).not.toBeNull();
        expect(err.code).toBe(1);
        // Success banner must NOT appear
        expect(stdout + stderr).not.toContain('Database initialized successfully');
        done();
      }
    );
  }, 15000);
});
