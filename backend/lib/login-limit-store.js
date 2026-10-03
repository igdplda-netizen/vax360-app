"use strict";

// Both database drivers support atomic UPSERT ... RETURNING. Counters live in
// the shared database, never in a process-local cache.
const LOGIN_LIMIT_SCHEMA = `
  CREATE TABLE IF NOT EXISTS login_rate_limits (
    key TEXT PRIMARY KEY,
    hits INTEGER NOT NULL,
    reset_at BIGINT NOT NULL
  )`;

class LoginLimitStore {
  constructor(db) {
    this.db = db;
    this.localKeys = false;
  }

  init(options) {
    this.windowMs = options.windowMs;
    this.cleanupTimer = setInterval(() => {
      this.db.run("DELETE FROM login_rate_limits WHERE reset_at <= ?", [Date.now()], (err) => {
        if (err) console.error("Login rate-limit cleanup failed:", err.message);
      });
    }, this.windowMs);
    this.cleanupTimer.unref?.();
  }

  query(sql, params) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => err ? reject(err) : resolve(row));
    });
  }

  async increment(key) {
    const now = Date.now();
    const row = await this.query(`
      INSERT INTO login_rate_limits (key, hits, reset_at) VALUES (?, 1, ?)
      ON CONFLICT(key) DO UPDATE SET
        hits = CASE WHEN login_rate_limits.reset_at <= ? THEN 1 ELSE login_rate_limits.hits + 1 END,
        reset_at = CASE WHEN login_rate_limits.reset_at <= ? THEN ? ELSE login_rate_limits.reset_at END
      RETURNING hits, reset_at
    `, [key, now + this.windowMs, now, now, now + this.windowMs]);
    return { totalHits: Number(row.hits), resetTime: new Date(Number(row.reset_at)) };
  }

  async get(key) {
    const row = await this.query(
      "SELECT hits, reset_at FROM login_rate_limits WHERE key = ? AND reset_at > ?",
      [key, Date.now()],
    );
    return row ? { totalHits: Number(row.hits), resetTime: new Date(Number(row.reset_at)) } : undefined;
  }

  async decrement(key) {
    // Do not remove the row: deletion would reset a concurrently incremented
    // window. Expired entries are removed independently by cleanup.
    await this.query(`
      UPDATE login_rate_limits SET hits = CASE WHEN hits > 0 THEN hits - 1 ELSE 0 END
      WHERE key = ? AND reset_at > ? RETURNING hits
    `, [key, Date.now()]);
  }

  async resetKey(key) {
    await this.query("DELETE FROM login_rate_limits WHERE key = ? RETURNING key", [key]);
  }

  shutdown() {
    clearInterval(this.cleanupTimer);
  }
}

module.exports = { LoginLimitStore, LOGIN_LIMIT_SCHEMA };