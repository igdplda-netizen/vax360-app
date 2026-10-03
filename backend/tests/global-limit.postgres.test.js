'use strict';

// General-budget coverage only; authentication PostgreSQL limits are a
// separate deliverable. Uses the existing schema without production DDL.
const { PgDatabase } = require('../lib/db');
const { LoginLimitStore } = require('../lib/login-limit-store');
const crypto = require('crypto');

const describePostgres = process.env.DATABASE_URL ? describe : describe.skip;
describePostgres('general budget across PostgreSQL servers', () => {
  let dbA, dbB, a, b;
  const key = crypto.randomBytes(32).toString('hex');
  const close = db => new Promise((resolve, reject) => db.close(err => err ? reject(err) : resolve()));
  const makeStore = db => {
    const store = new LoginLimitStore(db, 'global');
    store.init({ windowMs: 900000 });
    return store;
  };

  beforeAll(() => {
    dbA = new PgDatabase(process.env.DATABASE_URL);
    dbB = new PgDatabase(process.env.DATABASE_URL);
    a = makeStore(dbA);
    b = makeStore(dbB);
  });

  afterAll(async () => {
    a.shutdown();
    b.shutdown();
    try {
      await a.resetKey(key);
    } finally {
      await Promise.all([close(dbA), close(dbB)]);
    }
  });

  test('independent pools increment atomically and reconnect without resetting the window', async () => {
    const results = await Promise.all(Array.from({ length: 30 }, (_, i) => (i % 2 ? a : b).increment(key)));
    expect(results.map(r => r.totalHits).sort((x, y) => x - y))
      .toEqual(Array.from({ length: 30 }, (_, i) => i + 1));
    const resetAt = results[0].resetTime.getTime();
    expect(new Set(results.map(r => r.resetTime.getTime())).size).toBe(1);
    a.shutdown();
    await close(dbA);
    dbA = new PgDatabase(process.env.DATABASE_URL);
    a = makeStore(dbA);
    const resumed = await a.increment(key);
    expect(resumed.totalHits).toBe(31);
    expect(resumed.resetTime.getTime()).toBe(resetAt);
    expect((await b.get(key)).totalHits).toBe(31);
  }, 15000);
});