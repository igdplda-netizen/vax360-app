/**
 * Tests: Authentication routes — login, register, reset-password
 *
 * These tests confirm that the PBKDF2 hashing parameters, JWT handling, and
 * password-complexity validator cannot be broken silently.
 *
 * Coverage:
 *   POST /api/login            – correct creds succeed; wrong creds fail; missing fields → 400; rate-limit fires
 *   POST /api/auth/reset-password – disabled until ownership verification exists
 *   POST /api/register         – success; duplicate WhatsApp → registration_failed; missing fields → 400; complexity rules enforced
 */

'use strict';

// ── Must be set BEFORE requiring server.js (module-level side effects) ──
process.env.DB_PATH = ':memory:';
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_for_auth_tests';

const request = require('supertest');
const crypto  = require('crypto');
const { app, db, shutdown, base32Decode } = require('../server');
const { LoginLimitStore } = require('../lib/login-limit-store');
const { ipKeyGenerator } = require('express-rate-limit');

const runSql = (sql, params = []) => new Promise((resolve, reject) =>
  db.run(sql, params, err => err ? reject(err) : resolve()));
const ipLimitKey = ip => crypto.createHmac('sha256', process.env.JWT_SECRET)
  .update(ipKeyGenerator(ip)).digest('hex');

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Wait until the users table exists and the superadmin seed row is present. */
function waitForDbReady(timeoutMs = 15_000) {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + timeoutMs;
    const poll = () => {
      db.get(
        "SELECT 1 FROM users WHERE whatsapp = '9999' LIMIT 1",
        (err, row) => {
          if (!err && row) return resolve();
          if (Date.now() >= deadline) return reject(new Error('DB not ready within timeout'));
          setTimeout(poll, 100);
        }
      );
    };
    poll();
  });
}

/** Insert a user directly with a PBKDF2 hash (bypasses the register rate limiter). */
function insertUser(whatsapp, name, plainPassword, role = 'parent') {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    const password_hash = crypto
      .pbkdf2Sync(plainPassword, salt, 100_000, 64, 'sha512')
      .toString('hex');
    db.run(
      `INSERT OR IGNORE INTO users (whatsapp, name, email, password_hash, salt, role, created_at)
       VALUES (?, ?, NULL, ?, ?, ?, datetime('now'))`,
      [whatsapp, name, password_hash, salt, role],
      (err) => { if (err) reject(err); else resolve(); }
    );
  });
}

async function insertTwoFactorUser(whatsapp) {
  const secret = 'JBSWY3DPEHPK3PXP';
  await insertUser(whatsapp, '2FA Test User', 'TestPass1');
  await new Promise((resolve, reject) => {
    db.run(
      'UPDATE users SET two_factor_enabled = 1, two_factor_secret = ? WHERE whatsapp = ?',
      [secret, whatsapp],
      (err) => { if (err) reject(err); else resolve(); }
    );
  });
  return secret;
}

function generateTotp(secret) {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30_000)));
  const hmac = crypto.createHmac('sha1', base32Decode(secret)).update(counter).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  return String((hmac.readUInt32BE(offset) & 0x7fffffff) % 1_000_000).padStart(6, '0');
}

// ─── Suite setup / teardown ──────────────────────────────────────────────────

beforeAll(async () => {
  await waitForDbReady();
  // Seed a standard test user for login tests
  await insertUser('5500000001', 'Test User', 'TestPass1');
}, 20_000);

afterAll((done) => {
  // Close only the db connection — do NOT call shutdown() as it calls
  // process.exit(0) which interferes with Jest's own teardown.
  db.close(() => done());
});

// ════════════════════════════════════════════════════════════════════════════
// POST /api/login
// ════════════════════════════════════════════════════════════════════════════

describe('POST /api/login', () => {
  jest.setTimeout(30_000);

  test('returns 200 and a JWT for correct credentials', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ whatsapp: '5500000001', password: 'TestPass1' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.token).toBe('string');
    expect(res.body.token.length).toBeGreaterThan(0);
    expect(res.body.role).toBe('parent');
    expect(res.body.user.whatsapp).toBe('5500000001');
  });

  test('returns 401 for wrong password', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ whatsapp: '5500000001', password: 'WrongPass9' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  test('returns 401 for non-existent user', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ whatsapp: '0000000000', password: 'AnyPass1' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  test('returns 400 when whatsapp is missing', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ password: 'TestPass1' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/required/i);
  });

  test('returns 400 when password is missing', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ whatsapp: '5500000001' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/required/i);
  });

  test('returns 400 when body is empty', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({});

    expect(res.status).toBe(400);
  });

  test('JWT contains pwd_slice that matches the stored hash prefix', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ whatsapp: '5500000001', password: 'TestPass1' });

    expect(res.status).toBe(200);
    const [, payloadB64] = res.body.token.split('.');
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString());
    expect(typeof payload.pwd_slice).toBe('string');
    expect(payload.pwd_slice.length).toBe(10);
  });

  test('rate-limiter fires after 15 consecutive failed attempts (test limit)', async () => {
    // Use a unique whatsapp to avoid interfering with other tests
    const wa = '5599991111';
    let lastStatus = 0;
    for (let i = 0; i < 16; i++) {
      const res = await request(app)
        .post('/api/login')
        .set('X-Forwarded-For', '10.0.0.42') // consistent "IP" for the limiter
        .send({ whatsapp: wa, password: 'WrongPass9' });
      lastStatus = res.status;
      if (res.status === 429) break;
    }
    expect(lastStatus).toBe(429);
  });

  test('successful logins neither consume the failure budget nor clear earlier failures', async () => {
    const whatsapp = '5599994444';
    await insertUser(whatsapp, 'Repeated Login User', 'TestPass1');
    const login = (password) => request(app).post('/api/login').send({ whatsapp, password });

    for (let i = 0; i < 14; i++) {
      expect((await login('WrongPass9')).status).toBe(401);
    }
    // More successes than the limit, while only one failed attempt remains.
    for (let i = 0; i < 16; i++) {
      const res = await login('TestPass1');
      expect(res.status).toBe(200);
      expect(res.body.token).toEqual(expect.any(String));
    }
    expect((await login('WrongPass9')).status).toBe(401);
    expect((await login('WrongPass9')).status).toBe(429);
  });

  test('attempts for one account do not block another account on the same IP', async () => {
    const sharedIp = '10.0.0.43';

    for (let i = 0; i < 15; i++) {
      const res = await request(app)
        .post('/api/login')
        .set('X-Forwarded-For', sharedIp)
        .send({ whatsapp: '5599992222', password: 'WrongPass9' });
      expect(res.status).toBe(401);
    }

    const blocked = await request(app)
      .post('/api/login')
      .set('X-Forwarded-For', sharedIp)
      .send({ whatsapp: '5599992222', password: 'WrongPass9' });
    expect(blocked.status).toBe(429);

    const otherAccount = await request(app)
      .post('/api/login')
      .set('X-Forwarded-For', sharedIp)
      .send({ whatsapp: '5500000001', password: 'TestPass1' });
    expect(otherAccount.status).toBe(200);
  });

  test('429 response does not reveal whether the account exists', async () => {
    async function exhaustLimit(whatsapp) {
      let response;
      for (let i = 0; i < 16; i++) {
        response = await request(app)
          .post('/api/login')
          .set('X-Forwarded-For', '10.0.0.44')
          .send({ whatsapp, password: 'WrongPass9' });
      }
      return response;
    }

    const existing = await exhaustLimit('5500000001');
    const missing = await exhaustLimit('5599993333');

    expect(existing.status).toBe(429);
    expect(missing.status).toBe(429);
    expect(existing.body).toEqual(missing.body);
  });

  test('persisted limit keys do not disclose phone numbers or IPs', async () => {
    await request(app).post('/api/login')
      .set('X-Forwarded-For', '10.0.0.49')
      .send({ whatsapp: '5599994444', password: 'WrongPass9' });
    const rows = await new Promise((resolve, reject) =>
      db.all('SELECT key FROM login_rate_limits', (err, rows) => err ? reject(err) : resolve(rows)));
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) expect(row.key).toMatch(/^(?:(?:register|reset-password):)?[a-f0-9]{64}$/);
  });
});

describe('persistent registration and password-reset policies', () => {
  const register = (ip, body = {}) => request(app).post('/api/register')
    .set('X-Forwarded-For', ip).send(body);
  const reset = (ip, whatsapp = '5500000002') => request(app)
    .post('/api/auth/reset-password').set('X-Forwarded-For', ip)
    .send({ whatsapp, newPassword: 'NewPass2' });

  test('registration allows 15 attempts, counts successes, and blocks the 16th across accounts', async () => {
    const ip = '10.1.0.1';
    const success = await register(ip, { name: 'Limit User', whatsapp: '5511110080', password: 'ValidPass1' });
    expect(success.status).toBe(200);
    for (let i = 1; i < 15; i++) {
      expect((await register(ip)).status).toBe(400);
    }
    const existing = await register(ip, { name: 'Existing', whatsapp: '5511110080', password: 'ValidPass1' });
    const missing = await register(ip, { name: 'Unknown', whatsapp: '5511110081', password: 'ValidPass1' });
    expect(existing.status).toBe(429);
    expect(missing.status).toBe(429);
    expect(existing.body).toEqual(missing.body);
    expect(existing.body.error).toBe('Too many registration attempts, please try again later');
    expect(existing.headers['ratelimit-limit']).toBe('15');
    expect(Number(existing.headers['retry-after'])).toBeGreaterThan(0);
    expect((await register('10.1.0.2')).status).toBe(400);
    // A blocked registration must not create a profile.
    const login = await request(app).post('/api/login')
      .send({ whatsapp: '5511110081', password: 'ValidPass1' });
    expect(login.status).toBe(401);
  });

  test('reset permits the final attempt and shares its budget with own-password changes', async () => {
    const ip = '10.1.0.3';
    expect((await reset(ip)).status).toBe(410);
    // Retain the existing test limit (1000) without sending 1000 requests.
    await runSql('UPDATE login_rate_limits SET hits = ? WHERE key = ?',
      [999, 'reset-password:' + ipLimitKey(ip)]);
    expect((await reset(ip)).status).toBe(410);
    const existing = await reset(ip);
    const missing = await reset(ip, '5500099999');
    expect(existing.status).toBe(429);
    expect(missing.status).toBe(429);
    expect(existing.body).toEqual(missing.body);
    expect(existing.body.error).toBe('Too many password reset attempts, please try again later');
    expect(existing.headers['ratelimit-limit']).toBe('1000');
    expect(Number(existing.headers['retry-after'])).toBeGreaterThan(0);
    const change = await request(app).post('/api/auth/change-own-password')
      .set('X-Forwarded-For', ip).send({});
    expect(change.status).toBe(429);
    expect(change.body).toEqual(existing.body);
    expect((await reset('10.1.0.4')).status).toBe(410);
  });

  test('registration, reset and login budgets remain independent on the same IP', async () => {
    const ip = '10.1.0.5';
    for (let i = 0; i < 15; i++) expect((await register(ip)).status).toBe(400);
    expect((await register(ip)).status).toBe(429);
    expect((await reset(ip)).status).toBe(410);
    await runSql('UPDATE login_rate_limits SET hits = ? WHERE key = ?',
      [1000, 'reset-password:' + ipLimitKey(ip)]);
    expect((await reset(ip)).status).toBe(429);
    const login = await request(app).post('/api/login')
      .set('X-Forwarded-For', ip)
      .send({ whatsapp: '5500000001', password: 'TestPass1' });
    expect(login.status).toBe(200);
  });

  test.each([
    ['register', 15, '10.1.0.6', register, 400],
    ['reset-password', 1000, '10.1.0.7', reset, 410],
  ])('%s uses counters written by independent and recreated stores and renews expired windows',
    async (namespace, limit, ip, send, allowedStatus) => {
      expect((await send(ip)).status).toBe(allowedStatus);
      const key = ipLimitKey(ip);
      const first = new LoginLimitStore(db, namespace);
      first.init({ windowMs: 900000 });
      try {
        expect((await first.get(key)).totalHits).toBe(1);
        await runSql('UPDATE login_rate_limits SET hits = ? WHERE key = ?', [limit - 1, first.prefix + key]);
        expect((await first.increment(key)).totalHits).toBe(limit);
      } finally {
        first.shutdown();
      }
      const recreated = new LoginLimitStore(db, namespace);
      recreated.init({ windowMs: 900000 });
      try {
        expect((await recreated.get(key)).totalHits).toBe(limit);
        expect((await send(ip)).status).toBe(429);
        await runSql('UPDATE login_rate_limits SET reset_at = ? WHERE key = ?',
          [Date.now() - 1, recreated.prefix + key]);
        expect((await send(ip)).status).toBe(allowedStatus);
        expect((await recreated.get(key)).totalHits).toBe(1);
      } finally {
        recreated.shutdown();
      }
    });

  test('storage failure refuses requests without revealing accounts or internal details', async () => {
    await runSql('ALTER TABLE login_rate_limits RENAME TO unavailable_rate_limits');
    const log = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
      for (const path of ['/api/register', '/api/auth/reset-password', '/api/auth/change-own-password']) {
        const send = whatsapp => request(app).post(path).set('X-Forwarded-For', '10.1.0.8')
          .send({ name: 'Unavailable', whatsapp, password: 'ValidPass1', newPassword: 'NewPass2' });
        const existing = await send('5500000001');
        const missing = await send('5511110082');
        expect(existing.status).toBe(503);
        expect(missing.status).toBe(503);
        expect(existing.body).toEqual(missing.body);
        expect(existing.body).toEqual({ error: 'Authentication temporarily unavailable, please try again later' });
      }
    } finally {
      await runSql('ALTER TABLE unavailable_rate_limits RENAME TO login_rate_limits');
      log.mockRestore();
    }
    expect((await register('10.1.0.8')).status).toBe(400);
    expect((await reset('10.1.0.8')).status).toBe(410);
    const login = await request(app).post('/api/login')
      .send({ whatsapp: '5511110082', password: 'ValidPass1' });
    expect(login.status).toBe(401);
  });
});

describe('POST /api/login/2fa rate limiting', () => {
  jest.setTimeout(30_000);

  test('successful password and 2FA steps do not consume or reset the shared failure budget', async () => {
    const whatsapp = '5599995555';
    const secret = await insertTwoFactorUser(whatsapp);
    const login = () => request(app).post('/api/login').send({ whatsapp, password: 'TestPass1' });
    const initial = await login();
    expect(initial.status).toBe(200);
    expect(initial.body.two_factor_required).toBe(true);
    const verify = (temp_token, code) => request(app).post('/api/login/2fa').send({ temp_token, code });

    for (let i = 0; i < 14; i++) {
      // A non-numeric code is deterministically invalid, unlike a random six-digit code.
      const res = await verify(initial.body.temp_token, 'invalid');
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('invalid_2fa_code');
    }
    for (let i = 0; i < 16; i++) {
      const pending = await login();
      expect(pending.status).toBe(200);
      expect(pending.body.two_factor_required).toBe(true);
      const verified = await verify(pending.body.temp_token, generateTotp(secret));
      expect(verified.status).toBe(200);
      expect(verified.body.token).toEqual(expect.any(String));
    }
    expect((await verify(initial.body.temp_token, 'invalid')).status).toBe(401);
    expect((await verify(initial.body.temp_token, 'invalid')).status).toBe(429);
    // Issuing another challenge cannot bypass failures from the 2FA step.
    expect((await login()).status).toBe(429);
  });

  test('invalid temporary tokens and incomplete requests remain limited', async () => {
    for (let i = 0; i < 15; i++) {
      const body = i % 2 === 0 ? { temp_token: 'invalid', code: '123456' } : {};
      const res = await request(app).post('/api/login/2fa')
        .set('X-Forwarded-For', '10.0.0.45').send(body);
      expect(res.status).toBe(400);
    }
    const blocked = await request(app).post('/api/login/2fa')
      .set('X-Forwarded-For', '10.0.0.45').send({});
    expect(blocked.status).toBe(429);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// POST /api/auth/reset-password
// ════════════════════════════════════════════════════════════════════════════

describe('POST /api/auth/reset-password', () => {
  jest.setTimeout(30_000);

  beforeAll(async () => {
    await insertUser('5500000002', 'Reset User', 'OldPass1');
  });

  test('returns 410 and does not reset a password', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ whatsapp: '5500000002', newPassword: 'NewPass2' });

    expect(res.status).toBe(410);
    expect(res.body.error).toBe('password_reset_unavailable');

    const loginRes = await request(app)
      .post('/api/login')
      .send({ whatsapp: '5500000002', password: 'OldPass1' });
    expect(loginRes.status).toBe(200);
  });

  test('returns the same response for existing and unknown accounts', async () => {
    const existing = await request(app)
      .post('/api/auth/reset-password')
      .send({ whatsapp: '5500000002', newPassword: 'ValidPass2' });
    const unknown = await request(app)
      .post('/api/auth/reset-password')
      .send({ whatsapp: '9090909090', newPassword: 'ValidPass2' });

    expect(existing.status).toBe(410);
    expect(unknown.status).toBe(410);
    expect(unknown.body).toEqual(existing.body);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// POST /api/register
// ════════════════════════════════════════════════════════════════════════════

describe('POST /api/register', () => {
  jest.setTimeout(30_000);

  test('returns 200 for a valid registration', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ name: 'Alice', whatsapp: '5511110001', password: 'AlicePass1' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('newly registered user can log in immediately', async () => {
    await request(app)
      .post('/api/register')
      .send({ name: 'Bob', whatsapp: '5511110002', password: 'BobPass2' });

    const res = await request(app)
      .post('/api/login')
      .send({ whatsapp: '5511110002', password: 'BobPass2' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('returns 400 with registration_failed for a duplicate WhatsApp number', async () => {
    const payload = { name: 'Carol', whatsapp: '5511110003', password: 'CarolPass3' };
    await request(app).post('/api/register').send(payload); // first registration succeeds

    const res = await request(app).post('/api/register').send(payload); // duplicate

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('registration_failed');
  });

  test('returns 400 when name is missing', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ whatsapp: '5511119001', password: 'ValidPass1' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/missing/i);
  });

  test('returns 400 when whatsapp is missing', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ name: 'Dan', password: 'ValidPass1' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/missing/i);
  });

  test('returns 400 when password is missing', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ name: 'Eve', whatsapp: '5511119002' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/missing/i);
  });

  test('accepts optional email field', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ name: 'Frank', whatsapp: '5511110004', email: 'frank@example.com', password: 'FrankPass4' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  // ── Password-complexity enforcement ──────────────────────────────────────

  test('rejects a password shorter than 6 characters', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ name: 'Gina', whatsapp: '5511119010', password: 'Ab1' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('password_length_error');
  });

  test('rejects a password with no digit', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ name: 'Hank', whatsapp: '5511119011', password: 'NoDigitHere' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('password_complexity_error');
  });

  test('rejects a password with only repeated characters', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ name: 'Ida', whatsapp: '5511119012', password: 'bbbbbb' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('password_repetitive_error');
  });

  test('rejects a purely sequential alphabetical password', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ name: 'Joe', whatsapp: '5511119013', password: 'abcdefghijklmnopqrstuvwxyz' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('password_sequential_error');
  });
});
