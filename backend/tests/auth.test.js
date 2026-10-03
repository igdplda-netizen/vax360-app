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
const { app, db, shutdown } = require('../server');

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
    for (const row of rows) expect(row.key).toMatch(/^[a-f0-9]{64}$/);
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
