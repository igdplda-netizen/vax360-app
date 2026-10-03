'use strict';

process.env.DB_PATH = ':memory:';
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'global-limit-test-secret';

const request = require('supertest');
const crypto = require('crypto');
const { ipKeyGenerator } = require('express-rate-limit');
const { app, db } = require('../server');
const { LoginLimitStore } = require('../lib/login-limit-store');
const keyFor = ip => crypto.createHmac('sha256', process.env.JWT_SECRET)
  .update(ipKeyGenerator(ip)).digest('hex');
const run = (sql, params = []) => new Promise((resolve, reject) =>
  db.run(sql, params, err => err ? reject(err) : resolve()));
const get = (sql, params = []) => new Promise((resolve, reject) =>
  db.get(sql, params, (err, row) => err ? reject(err) : resolve(row)));
const send = (ip, path = '/api/health') =>
  request(app).get(path).set('X-Forwarded-For', ip);

beforeAll(async () => {
  // Wait for schema initialization and the asynchronous superadmin seed.
  for (let i = 0; i < 100; i++) {
    try {
      if (await get("SELECT 1 FROM users WHERE whatsapp = '9999'")) return;
    } catch (_) { /* constructor is still initializing */ }
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  throw new Error('Database initialization timed out');
});

afterAll(async () => {
  await new Promise((resolve, reject) => db.close(err => err ? reject(err) : resolve()));
});

test('preserves the window, test quota, headers and blocked response across routes', async () => {
  const ip = '10.43.0.1';
  const first = await send(ip);
  expect(first.status).toBe(200);
  expect(first.headers['ratelimit-limit']).toBe('1000');
  expect(first.headers['ratelimit-remaining']).toBe('999');
  expect(first.headers['ratelimit-policy']).toBe('1000;w=900');
  expect(first.headers['x-ratelimit-limit']).toBeUndefined();
  await run('UPDATE login_rate_limits SET hits = 999 WHERE key = ?', ['global:' + keyFor(ip)]);
  const last = await send(ip, '/api/sync/example');
  expect(last.status).toBe(401);
  expect(last.headers['ratelimit-remaining']).toBe('0');
  const blocked = await send(ip);
  expect(blocked.status).toBe(429);
  expect(blocked.body).toEqual({ error: 'Too many requests from this IP, please try again later' });
  expect(Number(blocked.headers['retry-after'])).toBeGreaterThan(0);
  expect((await send('10.43.0.2')).status).toBe(200);
  await run('UPDATE login_rate_limits SET reset_at = ? WHERE key = ?',
    [Date.now() - 1, 'global:' + keyFor(ip)]);
  expect((await send(ip)).headers['ratelimit-remaining']).toBe('999');
});

test('concurrent HTTP requests cannot overspend the last ten requests', async () => {
  const ip = '10.43.0.3';
  await send(ip);
  await run('UPDATE login_rate_limits SET hits = 990 WHERE key = ?', ['global:' + keyFor(ip)]);
  const responses = await Promise.all(Array.from({ length: 20 }, () => send(ip, '/api/sync/example')));
  expect(responses.filter(res => res.status === 401)).toHaveLength(10);
  expect(responses.filter(res => res.status === 429)).toHaveLength(10);
  expect((await get('SELECT hits FROM login_rate_limits WHERE key = ?', ['global:' + keyFor(ip)])).hits)
    .toBe(1010);
});

test('a recreated global store and server use the same opaque IP-only budget, without auth collisions', async () => {
  const ip = '10.43.0.4';
  const key = keyFor(ip);
  const stores = ['', 'register', 'reset-password', 'global'].map(namespace => new LoginLimitStore(db, namespace));
  stores.forEach(store => store.init({ windowMs: 900000 }));
  try {
    for (const store of stores) await store.increment(key);
    expect((await send(ip)).status).toBe(200);
    expect((await stores[3].get(key)).totalHits).toBe(2);
    for (const store of stores.slice(0, 3)) expect((await store.get(key)).totalHits).toBe(1);
    // Successful health and failed authentication both spend this IP budget;
    // switching accounts or routes does not create another general budget.
    for (const whatsapp of ['missing-one', 'missing-two']) {
      expect((await request(app).post('/api/login').set('X-Forwarded-For', ip)
        .send({ whatsapp, password: 'WrongPass9' })).status).toBe(401);
    }
    stores[3].shutdown();
    const recreated = new LoginLimitStore(db, 'global');
    recreated.init({ windowMs: 900000 });
    try {
      expect((await recreated.get(key)).totalHits).toBe(4);
      expect((await recreated.increment(key)).totalHits).toBe(5);
      expect((await send(ip)).headers['ratelimit-remaining']).toBe('994');
    } finally {
      recreated.shutdown();
    }
    const row = await get('SELECT key FROM login_rate_limits WHERE key = ?', ['global:' + key]);
    expect(row.key).toMatch(/^global:[a-f0-9]{64}$/);
    expect(row.key).not.toContain(ip);
  } finally {
    stores.forEach(store => store.shutdown());
  }
});

test('IPv6 addresses in the same normalized subnet share a budget', async () => {
  const first = await send('2001:db8:43:1::1');
  const second = await send('2001:db8:43:1::2');
  expect(first.headers['ratelimit-remaining']).toBe('999');
  expect(second.headers['ratelimit-remaining']).toBe('998');
});

test('storage outage fails closed except exact health GET/HEAD, and recovery retains the budget', async () => {
  const ip = '10.43.0.5';
  await send(ip);
  await run('ALTER TABLE login_rate_limits RENAME TO unavailable_rate_limits');
  const log = jest.spyOn(console, 'error').mockImplementation(() => {});
  try {
    expect((await send(ip)).status).toBe(200);
    expect((await request(app).head('/api/health').set('X-Forwarded-For', ip)).status).toBe(200);
    for (const [method, path] of [
      ['get', '/api/sync/example'], ['post', '/api/login'], ['post', '/api/register'],
      ['post', '/api/auth/reset-password'], ['get', '/'], ['get', '/api/health/extra'],
      ['post', '/api/health'],
    ]) {
      const res = await request(app)[method](path).set('X-Forwarded-For', ip);
      expect(res.status).toBe(503);
      expect(res.body).toEqual({ error: 'Service temporarily unavailable, please try again later' });
    }
  } finally {
    await run('ALTER TABLE unavailable_rate_limits RENAME TO login_rate_limits');
    log.mockRestore();
  }
  expect((await send(ip)).headers['ratelimit-remaining']).toBe('998');
});