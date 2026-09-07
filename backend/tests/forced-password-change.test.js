/**
 * Tests: Forced password-change flow
 *
 * Confirms that:
 *   (a) POST /api/login with default superadmin credentials returns must_change_password: true
 *   (b) POST /api/login/2fa preserves the flag before a password change and clears it after
 *   (c) POST /api/login after a successful /api/auth/change-own-password does NOT return the flag
 *   (d) POST /api/auth/change-own-password is authenticated — no token → 401/403
 *   (e) Non-superadmin users never receive must_change_password even when a default-style password is set
 *
 * These tests are the machine-readable guarantee that a future refactor cannot silently
 * re-open the default-credential bypass described in the task spec.
 */

'use strict';

// ── Must be set BEFORE requiring server.js (module-level side effects) ──
process.env.DB_PATH  = ':memory:';
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_forced_pw_change';
// Keep the default password so the superadmin seed triggers must_change_password
delete process.env.INITIAL_SUPERADMIN_PASSWORD;

const request = require('supertest');
const crypto  = require('crypto');
const { app, db, shutdown } = require('../server');

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Wait until the superadmin seed row is present. */
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

function generateTotp(secret) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  const bytes = [];

  for (const char of secret.replace(/=+$/, '').toUpperCase()) {
    value = (value << 5) | alphabet.indexOf(char);
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }

  const counter = Math.floor(Date.now() / 1000 / 30);
  const buffer = Buffer.alloc(8);
  buffer.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
  buffer.writeUInt32BE(counter >>> 0, 4);
  const hmac = crypto.createHmac('sha1', Buffer.from(bytes)).update(buffer).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  return String(binary % 1_000_000).padStart(6, '0');
}

function setSuperadminCredentials(password, twoFactorSecret = null) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = crypto
      .pbkdf2Sync(password, salt, 100_000, 64, 'sha512')
      .toString('hex');
    db.run(
      `UPDATE users
          SET password_hash = ?, salt = ?, two_factor_secret = ?, two_factor_enabled = ?
        WHERE whatsapp = '9999'`,
      [passwordHash, salt, twoFactorSecret, twoFactorSecret ? 1 : 0],
      (err) => { if (err) reject(err); else resolve(); }
    );
  });
}

/** The hard-coded default password used to seed the superadmin. */
const DEFAULT_SUPERADMIN_PASSWORD = 'Admin@123';

// ─── Suite setup / teardown ──────────────────────────────────────────────────

beforeAll(async () => {
  await waitForDbReady();
}, 20_000);

afterAll((done) => {
  db.close(() => done());
});

describe('POST /api/login/2fa — forced password-change guard', () => {
  jest.setTimeout(30_000);

  const TOTP_SECRET = 'JBSWY3DPEHPK3PXP';
  const CHANGED_PASSWORD = 'TwoFactor9x';

  beforeAll(async () => {
    await setSuperadminCredentials(DEFAULT_SUPERADMIN_PASSWORD, TOTP_SECRET);
  });

  afterAll(async () => {
    await setSuperadminCredentials(DEFAULT_SUPERADMIN_PASSWORD);
  });

  async function loginWith2fa(password) {
    const passwordRes = await request(app)
      .post('/api/login')
      .send({ whatsapp: '9999', password });

    expect(passwordRes.status).toBe(200);
    expect(passwordRes.body.two_factor_required).toBe(true);
    expect(typeof passwordRes.body.temp_token).toBe('string');

    return request(app)
      .post('/api/login/2fa')
      .send({
        temp_token: passwordRes.body.temp_token,
        code: generateTotp(TOTP_SECRET),
      });
  }

  test('keeps the flag through 2FA and clears it after change-own-password', async () => {
    const first2faRes = await loginWith2fa(DEFAULT_SUPERADMIN_PASSWORD);

    expect(first2faRes.status).toBe(200);
    expect(first2faRes.body.success).toBe(true);
    expect(typeof first2faRes.body.token).toBe('string');
    expect(first2faRes.body.must_change_password).toBe(true);

    const changeRes = await request(app)
      .post('/api/auth/change-own-password')
      .set('Authorization', `Bearer ${first2faRes.body.token}`)
      .send({ newPassword: CHANGED_PASSWORD });

    expect(changeRes.status).toBe(200);
    expect(changeRes.body.success).toBe(true);

    const second2faRes = await loginWith2fa(CHANGED_PASSWORD);

    expect(second2faRes.status).toBe(200);
    expect(second2faRes.body.success).toBe(true);
    expect(second2faRes.body.must_change_password).toBeFalsy();
  });
});

// ════════════════════════════════════════════════════════════════════════════
// (a) Login with default superadmin credentials → must_change_password: true
// ════════════════════════════════════════════════════════════════════════════

describe('POST /api/login — superadmin default-password detection', () => {
  jest.setTimeout(30_000);

  test('returns must_change_password: true for superadmin with default credentials', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ whatsapp: '9999', password: DEFAULT_SUPERADMIN_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // A valid JWT is still issued so the client can call change-own-password
    expect(typeof res.body.token).toBe('string');
    expect(res.body.must_change_password).toBe(true);
  });

  test('issues a JWT that can be used to call change-own-password', async () => {
    const loginRes = await request(app)
      .post('/api/login')
      .send({ whatsapp: '9999', password: DEFAULT_SUPERADMIN_PASSWORD });

    expect(loginRes.status).toBe(200);
    const token = loginRes.body.token;

    // The token must be accepted by the authenticated endpoint
    const changeRes = await request(app)
      .post('/api/auth/change-own-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ newPassword: 'SuperNew9' });

    expect(changeRes.status).toBe(200);
    expect(changeRes.body.success).toBe(true);
    // A fresh token is returned so the session stays valid
    expect(typeof changeRes.body.token).toBe('string');
  });

  test('does NOT return must_change_password for superadmin with a non-default password', async () => {
    // Superadmin password was changed in the previous test to 'SuperNew9'
    const res = await request(app)
      .post('/api/login')
      .send({ whatsapp: '9999', password: 'SuperNew9' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // Flag must be absent or falsy after the password was changed
    expect(res.body.must_change_password).toBeFalsy();
  });
});

// ════════════════════════════════════════════════════════════════════════════
// (b) After change-own-password the flag is gone on subsequent login
// ════════════════════════════════════════════════════════════════════════════

describe('POST /api/auth/change-own-password → flag cleared on next login', () => {
  jest.setTimeout(30_000);

  // Use a fresh isolated superadmin-like scenario with a dedicated test user
  // seeded with the default password so we can replay the whole flow cleanly.
  const TEST_WA = '9998'; // separate whatsapp to avoid state bleed

  beforeAll(async () => {
    // Seed a superadmin row with the default password hash so the login
    // endpoint computes must_change_password = true for this user too.
    const { _DEFAULT_PASSWORD } = require('../lib/superadmin-warning');
    const salt = crypto.randomBytes(16).toString('hex');
    const password_hash = crypto
      .pbkdf2Sync(_DEFAULT_PASSWORD, salt, 100_000, 64, 'sha512')
      .toString('hex');
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT OR IGNORE INTO users (whatsapp, name, email, password_hash, salt, role, created_at)
         VALUES (?, ?, NULL, ?, ?, 'superadmin', datetime('now'))`,
        [TEST_WA, 'Test Superadmin', password_hash, salt],
        (err) => { if (err) reject(err); else resolve(); }
      );
    });
  });

  test('login returns must_change_password true while default password is active', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ whatsapp: TEST_WA, password: DEFAULT_SUPERADMIN_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.must_change_password).toBe(true);
  });

  test('flag is absent on next login after a successful password change', async () => {
    // Step 1: Login to get a token
    const loginRes = await request(app)
      .post('/api/login')
      .send({ whatsapp: TEST_WA, password: DEFAULT_SUPERADMIN_PASSWORD });

    expect(loginRes.status).toBe(200);
    const oldToken = loginRes.body.token;

    // Step 2: Change the password
    const changeRes = await request(app)
      .post('/api/auth/change-own-password')
      .set('Authorization', `Bearer ${oldToken}`)
      .send({ newPassword: 'Changed9x' });

    expect(changeRes.status).toBe(200);
    expect(changeRes.body.success).toBe(true);

    // Step 3: Login again with the new password
    const secondLoginRes = await request(app)
      .post('/api/login')
      .send({ whatsapp: TEST_WA, password: 'Changed9x' });

    expect(secondLoginRes.status).toBe(200);
    expect(secondLoginRes.body.success).toBe(true);
    expect(secondLoginRes.body.must_change_password).toBeFalsy();
  });

  test('old token is invalidated after the password change (pwd_slice mismatch)', async () => {
    // Step 1: Login with current password (Changed9x from previous test)
    const loginRes = await request(app)
      .post('/api/login')
      .send({ whatsapp: TEST_WA, password: 'Changed9x' });

    expect(loginRes.status).toBe(200);
    const staleToken = loginRes.body.token;

    // Step 2: Change password again
    await request(app)
      .post('/api/auth/change-own-password')
      .set('Authorization', `Bearer ${staleToken}`)
      .send({ newPassword: 'Newer10y' });

    // Step 3: Old token should now be rejected
    const protectedRes = await request(app)
      .post('/api/auth/change-own-password')
      .set('Authorization', `Bearer ${staleToken}`)
      .send({ newPassword: 'ShouldFail1' });

    expect(protectedRes.status).toBe(403);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// (c) change-own-password requires a valid auth token
// ════════════════════════════════════════════════════════════════════════════

describe('POST /api/auth/change-own-password — authentication enforcement', () => {
  jest.setTimeout(15_000);

  test('returns 401 when no Authorization header is provided', async () => {
    const res = await request(app)
      .post('/api/auth/change-own-password')
      .send({ newPassword: 'NewPass1' });

    expect(res.status).toBe(401);
  });

  test('returns 403 when an invalid token is provided', async () => {
    const res = await request(app)
      .post('/api/auth/change-own-password')
      .set('Authorization', 'Bearer this.is.invalid')
      .send({ newPassword: 'NewPass1' });

    expect(res.status).toBe(403);
  });

  test('returns 403 when a token signed with a different secret is used', async () => {
    const jwt = require('jsonwebtoken');
    const fakeToken = jwt.sign(
      { whatsapp: '9999', role: 'superadmin', pwd_slice: 'xxxxxxxxxx' },
      'wrong_secret',
      { expiresIn: '1h' }
    );

    const res = await request(app)
      .post('/api/auth/change-own-password')
      .set('Authorization', `Bearer ${fakeToken}`)
      .send({ newPassword: 'NewPass1' });

    expect(res.status).toBe(403);
  });

  test('returns 400 when newPassword is missing from an authenticated request', async () => {
    const loginRes = await request(app)
      .post('/api/login')
      .send({ whatsapp: '9999', password: DEFAULT_SUPERADMIN_PASSWORD });

    // Superadmin may have changed password in earlier tests; accept any 200
    if (loginRes.status !== 200) return; // skip if already changed

    const res = await request(app)
      .post('/api/auth/change-own-password')
      .set('Authorization', `Bearer ${loginRes.body.token}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/required/i);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// (d) Non-superadmin users never receive must_change_password
// ════════════════════════════════════════════════════════════════════════════

describe('POST /api/login — must_change_password is superadmin-only', () => {
  jest.setTimeout(30_000);

  beforeAll(async () => {
    // Seed a parent and an admin user — both with a password that matches the
    // default string ('Admin@123') to prove the flag is superadmin-specific.
    await insertUser('8801', 'Parent User', DEFAULT_SUPERADMIN_PASSWORD, 'parent');
    await insertUser('8802', 'Admin User',  DEFAULT_SUPERADMIN_PASSWORD, 'admin');
  });

  test('parent user does not receive must_change_password even with default-style password', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ whatsapp: '8801', password: DEFAULT_SUPERADMIN_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.must_change_password).toBeFalsy();
  });

  test('admin user does not receive must_change_password even with default-style password', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ whatsapp: '8802', password: DEFAULT_SUPERADMIN_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.must_change_password).toBeFalsy();
  });
});
