'use strict';

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const os = require('os');
const path = require('path');
const { LoginLimitStore, LOGIN_LIMIT_SCHEMA } = require('./login-limit-store');

describe.each(['', 'register', 'reset-password'])('shared limiter store (%s)', namespace => {
  let dir, file, dbA, dbB, a, b;
  const run = (db, sql, params = []) => new Promise((resolve, reject) =>
    db.run(sql, params, err => err ? reject(err) : resolve()));
  const close = db => new Promise((resolve, reject) =>
    db.close(err => err ? reject(err) : resolve()));
  const open = () => new Promise((resolve, reject) => {
    const db = new sqlite3.Database(file, err => err ? reject(err) : resolve(db));
    db.configure('busyTimeout', 5000);
  });

  beforeEach(async () => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vax-login-limit-'));
    file = path.join(dir, 'shared.sqlite');
    dbA = await open();
    await run(dbA, LOGIN_LIMIT_SCHEMA);
    dbB = await open();
    a = new LoginLimitStore(dbA, namespace);
    b = new LoginLimitStore(dbB, namespace);
    a.init({ windowMs: 900000 });
    b.init({ windowMs: 900000 });
  });

  afterEach(async () => {
    a.shutdown();
    b.shutdown();
    await Promise.all([close(dbA), close(dbB)]);
    fs.rmSync(dir, { recursive: true, force: true });
  });

  test('atomic increments across independent connections share a window', async () => {
    const results = await Promise.all(
      Array.from({ length: 30 }, (_, i) => (i % 2 ? a : b).increment('opaque-key')),
    );
    expect(results.map(r => r.totalHits).sort((x, y) => x - y))
      .toEqual(Array.from({ length: 30 }, (_, i) => i + 1));
    expect(new Set(results.map(r => r.resetTime.getTime())).size).toBe(1);
    expect((await b.get('opaque-key')).totalHits).toBe(30);
  });

  test('reopening the process connection preserves active counters', async () => {
    await a.increment('persisted-key');
    await a.increment('persisted-key');
    a.shutdown();
    await close(dbA);
    dbA = await open();
    a = new LoginLimitStore(dbA, namespace);
    a.init({ windowMs: 900000 });
    expect((await a.increment('persisted-key')).totalHits).toBe(3);
  });

  test('an expired window starts again at one', async () => {
    await a.increment('expired-key');
    await run(dbA, 'UPDATE login_rate_limits SET reset_at = ? WHERE key = ?', [Date.now() - 1, a.prefix + 'expired-key']);
    expect(await b.get('expired-key')).toBeUndefined();
    const result = await b.increment('expired-key');
    expect(result.totalHits).toBe(1);
    expect(result.resetTime.getTime()).toBeGreaterThan(Date.now());
  });

  test('decrements share the count, do not go negative, and reset removes it', async () => {
    await a.increment('key');
    await b.increment('key');
    await b.decrement('key');
    expect((await a.get('key')).totalHits).toBe(1);
    await Promise.all([a.decrement('key'), b.decrement('key')]);
    expect((await a.get('key')).totalHits).toBe(0);
    await a.resetKey('key');
    expect(await b.get('key')).toBeUndefined();
  });

  test('database failures propagate rather than using an in-memory fallback', async () => {
    await run(dbA, 'DROP TABLE login_rate_limits');
    await expect(a.increment('key')).rejects.toThrow();
  });

  test('other namespaces cannot read, decrement or reset this policy', async () => {
    const other = new LoginLimitStore(dbB, namespace === 'register' ? 'reset-password' : 'register');
    other.init({ windowMs: 900000 });
    try {
      await a.increment('same-key');
      expect(await other.get('same-key')).toBeUndefined();
      expect((await other.increment('same-key')).totalHits).toBe(1);
      await other.decrement('same-key');
      expect((await a.get('same-key')).totalHits).toBe(1);
      await other.resetKey('same-key');
      expect((await a.get('same-key')).totalHits).toBe(1);
    } finally {
      other.shutdown();
    }
  });
});