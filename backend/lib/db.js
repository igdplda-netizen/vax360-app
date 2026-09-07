/**
 * Vax360 – Database driver selection + Postgres adapter
 * ─────────────────────────────────────────────────────
 * The backend was written against the sqlite3 callback API
 * (db.run / db.get / db.all / db.serialize / db.close).
 *
 * In environments where DATABASE_URL is set (Replit managed PostgreSQL,
 * used in development and production deployments), we use a Postgres
 * adapter that exposes the same callback API and translates the small
 * set of SQLite-isms used by this codebase into PostgreSQL.
 *
 * SQLite remains in use when:
 *   - DB_PATH=":memory:" (the automated test suites), or
 *   - DATABASE_URL is not set (e.g. running outside Replit), or
 *   - DB_DRIVER="sqlite" is explicitly forced.
 */

const path = require('path');

function usingPostgres() {
  // Production must never fall back to an ephemeral local file, even if a
  // stale DB_PATH or DB_DRIVER override is present in deployment settings.
  if (process.env.NODE_ENV === 'production') return Boolean(process.env.DATABASE_URL);
  if (process.env.DB_PATH === ':memory:') return false;
  if (process.env.DB_DRIVER === 'sqlite') return false;
  if (process.env.DB_DRIVER === 'postgres') return Boolean(process.env.DATABASE_URL);
  // Outside production, an explicit SQLite path remains a supported override.
  if (process.env.DB_PATH) return false;
  return Boolean(process.env.DATABASE_URL);
}

// ─── SQL translation (SQLite dialect → PostgreSQL) ─────────────

function convertPlaceholders(sql) {
  // Replace `?` with $1, $2, ... skipping string literals.
  let out = '';
  let inString = false;
  let n = 0;
  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    if (ch === "'") {
      inString = !inString;
      out += ch;
    } else if (ch === '?' && !inString) {
      n += 1;
      out += '$' + n;
    } else {
      out += ch;
    }
  }
  return out;
}

function translateSql(sql) {
  let out = sql;

  // PRAGMA table_info(t) → information_schema lookup returning `name` column
  const pragma = out.match(/^\s*PRAGMA\s+table_info\(\s*(\w+)\s*\)\s*$/i);
  if (pragma) {
    return {
      sql:
        "SELECT column_name AS name, data_type AS type " +
        "FROM information_schema.columns " +
        "WHERE table_schema = 'public' AND table_name = '" + pragma[1] + "'",
      translated: true,
    };
  }

  // INSERT OR REPLACE INTO t (a, b, ...) → upsert on first column
  const orReplace = out.match(/^\s*INSERT\s+OR\s+REPLACE\s+INTO\s+(\w+)\s*\(([^)]+)\)/i);
  if (orReplace) {
    const cols = orReplace[2].split(',').map((c) => c.trim());
    const conflictCol = cols[0];
    const updates = cols
      .slice(1)
      .map((c) => `${c} = EXCLUDED.${c}`)
      .join(', ');
    out = out.replace(/INSERT\s+OR\s+REPLACE\s+INTO/i, 'INSERT INTO');
    out += updates
      ? ` ON CONFLICT (${conflictCol}) DO UPDATE SET ${updates}`
      : ` ON CONFLICT (${conflictCol}) DO NOTHING`;
  }

  // INSERT OR IGNORE INTO → INSERT ... ON CONFLICT DO NOTHING
  if (/INSERT\s+OR\s+IGNORE\s+INTO/i.test(out)) {
    out = out.replace(/INSERT\s+OR\s+IGNORE\s+INTO/i, 'INSERT INTO');
    if (!/ON\s+CONFLICT/i.test(out)) out += ' ON CONFLICT DO NOTHING';
  }

  // datetime('now') must be converted before the DATETIME type mapping below.
  out = out.replace(/datetime\(\s*'now'\s*\)/gi, 'now()');

  // DDL type mapping
  out = out.replace(/INTEGER\s+PRIMARY\s+KEY\s+AUTOINCREMENT/gi, 'BIGSERIAL PRIMARY KEY');
  out = out.replace(/\bDATETIME\b/gi, 'TIMESTAMPTZ');

  out = convertPlaceholders(out);
  return { sql: out, translated: true };
}

function normalizeError(err) {
  if (err && err.code === '23505') {
    // Match the sqlite3 message the routes check for.
    err.message = 'UNIQUE constraint failed: ' + err.message;
  }
  return err;
}

// ─── Postgres adapter with the sqlite3 callback API ────────────

class PgDatabase {
  constructor(connectionString) {
    const { Pool, types } = require('pg');
    // Return COUNT(*) etc. (int8) as JS numbers, matching sqlite3.
    types.setTypeParser(20, (v) => parseInt(v, 10));
    this.pool = new Pool({ connectionString, max: 5 });
    // Queue queries so ordering matches sqlite3's serialized behavior.
    this._chain = Promise.resolve();
  }

  _query(sql, params) {
    const { sql: pgSql } = translateSql(sql);
    const exec = () => this.pool.query(pgSql, params || []);
    const p = this._chain.then(exec, exec);
    this._chain = p.then(
      () => undefined,
      () => undefined,
    );
    return p;
  }

  static _args(params, callback) {
    if (typeof params === 'function') return { params: [], callback: params };
    return { params: params || [], callback: callback || function () {} };
  }

  run(sql, params, callback) {
    const a = PgDatabase._args(params, callback);
    this._query(sql, a.params).then(
      (res) => a.callback.call({ changes: res.rowCount, lastID: null }, null),
      (err) => a.callback.call({ changes: 0, lastID: null }, normalizeError(err)),
    );
    return this;
  }

  get(sql, params, callback) {
    const a = PgDatabase._args(params, callback);
    this._query(sql, a.params).then(
      (res) => a.callback(null, res.rows[0]),
      (err) => a.callback(normalizeError(err)),
    );
    return this;
  }

  all(sql, params, callback) {
    const a = PgDatabase._args(params, callback);
    this._query(sql, a.params).then(
      (res) => a.callback(null, res.rows),
      (err) => a.callback(normalizeError(err)),
    );
    return this;
  }

  // Queries are already executed in submission order via the internal chain.
  serialize(fn) {
    if (typeof fn === 'function') fn();
  }

  close(callback) {
    this.pool.end().then(
      () => callback && callback(null),
      (err) => callback && callback(err),
    );
  }
}

/**
 * Open the appropriate database.
 * @param {string}   dbPath   SQLite file path (used only in SQLite mode).
 * @param {function} readyCb  Called with (err) once the connection is usable.
 *                            In SQLite mode this is the sqlite3.Database
 *                            constructor callback (schema setup is done by the
 *                            caller inside it, as before).
 */
function openDatabase(dbPath, readyCb) {
  if (usingPostgres()) {
    const db = new PgDatabase(process.env.DATABASE_URL);
    // Verify connectivity before signaling ready.
    db.pool
      .query('SELECT 1')
      .then(() => readyCb && readyCb(null))
      .catch((err) => readyCb && readyCb(err));
    return db;
  }
  const sqlite3 = require('sqlite3').verbose();
  return new sqlite3.Database(
    dbPath === ':memory:' ? ':memory:' : path.resolve(dbPath),
    readyCb,
  );
}

module.exports = { openDatabase, usingPostgres, translateSql, PgDatabase };
