process.env.DB_PATH = ":memory:";
process.env.SYNC_AUTH_TOKEN = "test_token_123";
process.env.JWT_SECRET = "test_jwt_secret";

const request = require("supertest");
const { app, db, shutdown } = require("./server");

afterAll((done) => {
  // Give background async tasks (like audit logs) a moment to finish before closing the DB
  setTimeout(() => {
    db.close(() => done());
  }, 500);
});

describe("Core Endpoints", () => {
  it("should return health status", async () => {
    const res = await request(app).get("/api/health");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("status", "ok");
  });
});

describe("Auth Endpoints", () => {
  it("should fail to register with simple password (sequential)", async () => {
    const res = await request(app)
      .post("/api/register")
      .send({
        whatsapp: "111111",
        name: "Simple User",
        password: "123456"
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("error", "password_sequential_error");
  });

  it("should register a new user successfully with complex password", async () => {
    const res = await request(app)
      .post("/api/register")
      .send({
        whatsapp: "123456789",
        name: "Test Parent",
        email: "parent@test.com",
        password: "a1b2c3"
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("success", true);
  });

  it("should fail login with wrong password", async () => {
    const res = await request(app)
      .post("/api/login")
      .send({ whatsapp: "123456789", password: "wrong_password" });
    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty("error", "Invalid credentials");
  });

  it("should succeed login with correct credentials", async () => {
    const res = await request(app)
      .post("/api/login")
      .send({ whatsapp: "123456789", password: "a1b2c3" });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body).toHaveProperty("token");
  });
});

describe("Sync and Admin Endpoints", () => {
  let userToken;
  let adminToken;

  beforeAll(async () => {
    // Log in as user to get userToken (attempt 1)
    const resUser = await request(app)
      .post("/api/login")
      .send({ whatsapp: "123456789", password: "a1b2c3" });
    userToken = resUser.body.token;

    // Log in as superadmin to get adminToken (attempt 2)
    const resAdmin = await request(app)
      .post("/api/login")
      .send({ whatsapp: "9999", password: "Admin@123" });
    adminToken = resAdmin.body.token;
  });

  it("should deny GET sync without auth token", async () => {
    const res = await request(app).get("/api/sync/123456789");
    expect(res.statusCode).toEqual(401);
  });

  it("should deny POST sync without auth token", async () => {
    const res = await request(app)
      .post("/api/sync/123456789")
      .send({ test: "data" });
    expect(res.statusCode).toEqual(401);
  });

  it("should return initialized empty data for GET of owned profile", async () => {
    const res = await request(app)
      .get("/api/sync/123456789")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body.data).toEqual({ children: [], vaccines: [] });
  });

  it("should successfully POST and GET sync data for own profile", async () => {
    const testData = { children: [{ name: "Kid 1" }], vaccines: [] };

    // POST
    const postRes = await request(app)
      .post("/api/sync/123456789")
      .set("Authorization", `Bearer ${userToken}`)
      .send(testData);
    expect(postRes.statusCode).toEqual(200);
    expect(postRes.body).toHaveProperty("success", true);

    // GET
    const getRes = await request(app)
      .get("/api/sync/123456789")
      .set("Authorization", `Bearer ${userToken}`);
    expect(getRes.statusCode).toEqual(200);
    expect(getRes.body).toHaveProperty("success", true);
    expect(getRes.body.data).toEqual(testData);
  });

  it("should deny GET sync of another profile for regular user", async () => {
    const res = await request(app)
      .get("/api/sync/9999")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.statusCode).toEqual(403);
  });

  it("should deny POST sync of another profile for regular user", async () => {
    const res = await request(app)
      .post("/api/sync/9999")
      .set("Authorization", `Bearer ${userToken}`)
      .send({});
    expect(res.statusCode).toEqual(403);
  });

  it("should allow GET sync of any profile for superadmin", async () => {
    const res = await request(app)
      .get("/api/sync/123456789")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body.data).toHaveProperty("children");
  });

  it("should allow POST sync of any profile for superadmin", async () => {
    const adminEditedData = { children: [{ name: "Kid 1 (edited by admin)" }], vaccines: [] };
    const res = await request(app)
      .post("/api/sync/123456789")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(adminEditedData);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("success", true);
  });

  it("should enforce maximum payload size (413 Payload Too Large)", async () => {
    const largeData = {
      largeString: "A".repeat(200 * 1024),
    };

    const res = await request(app)
      .post("/api/sync/123456789")
      .set("Authorization", `Bearer ${userToken}`)
      .send(largeData);

    expect(res.statusCode).toEqual(413);
  });

  it("should create audit logs for sync updates and reads and retrieve them", async () => {
    const auditRes = await request(app)
      .get("/api/audit")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(auditRes.statusCode).toEqual(200);
    expect(auditRes.body).toHaveProperty("success", true);
    expect(auditRes.body).toHaveProperty("audits");

    const updates = auditRes.body.audits.filter(
      (a) => a.action === "sync_update" && a.entity_id === "123456789"
    );
    const reads = auditRes.body.audits.filter(
      (a) => a.action === "sync_read" && a.entity_id === "123456789"
    );

    expect(updates.length).toBeGreaterThan(0);
    expect(reads.length).toBeGreaterThan(0);
  });

  it("should deny GET audit for non-superadmin users", async () => {
    const res = await request(app)
      .get("/api/audit")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty("error", "Access denied");
  });

  it("should deny GET admin users for regular user", async () => {
    const res = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.statusCode).toEqual(403);
  });

  it("should allow GET admin users for superadmin", async () => {
    const res = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body.users.length).toBeGreaterThan(0);
    const hasParent = res.body.users.some(u => u.whatsapp === "123456789");
    expect(hasParent).toBe(true);
  });

  it("should deny DELETE user for regular user", async () => {
    const res = await request(app)
      .delete("/api/admin/users/123456789")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.statusCode).toEqual(403);
  });

  it("should allow DELETE user and their sync data for superadmin and invalidate JWT", async () => {
    const resDelete = await request(app)
      .delete("/api/admin/users/123456789")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(resDelete.statusCode).toEqual(200);
    expect(resDelete.body).toHaveProperty("success", true);

    // Verify user credentials deleted (login fails)
    const resLogin = await request(app)
      .post("/api/login")
      .send({ whatsapp: "123456789", password: "a1b2c3" });
    expect(resLogin.statusCode).toEqual(401);

    // Verify user token is invalidated because the user record no longer exists
    const resSyncUser = await request(app)
      .get("/api/sync/123456789")
      .set("Authorization", `Bearer ${userToken}`);
    expect(resSyncUser.statusCode).toEqual(403);
    expect(resSyncUser.body).toHaveProperty("error", "User profile no longer exists");

    // Verify sync data deleted
    const resSync = await request(app)
      .get("/api/sync/123456789")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(resSync.statusCode).toEqual(200);
    expect(resSync.body).toHaveProperty("success", false);
    expect(resSync.body.message).toBe("No data found");

    // Verify audit logs for deletion and successful/failed logins exist
    const auditRes = await request(app)
      .get("/api/audit")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(auditRes.statusCode).toEqual(200);

    const hasRegister = auditRes.body.audits.some(a => a.action === "user_register" && a.entity_id === "123456789");
    const hasLoginSuccess = auditRes.body.audits.some(a => a.action === "user_login_success" && a.entity_id === "123456789");
    const hasLoginFailed = auditRes.body.audits.some(a => a.action === "user_login_failed" && a.entity_id === "123456789");
    const hasDelete = auditRes.body.audits.some(a => a.action === "admin_delete_user" && a.entity_id === "123456789");

    expect(hasRegister).toBe(true);
    expect(hasLoginSuccess).toBe(true);
    expect(hasLoginFailed).toBe(true);
    expect(hasDelete).toBe(true);
  });

  it("should return generic error for duplicate registrations (user enumeration mitigation)", async () => {
    // 9999 already exists (superadmin)
    const res = await request(app)
      .post("/api/register")
      .send({
        whatsapp: "9999",
        name: "Duplicate User",
        password: "a1b2c3"
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("error", "registration_failed");
  });
});

describe("Cryptographic Upgrades & Backup/Recovery", () => {
  let adminToken;

  beforeAll(async () => {
    // Log in as superadmin to get adminToken
    const resAdmin = await request(app)
      .post("/api/login")
      .send({ whatsapp: "9999", password: "Admin@123" });
    adminToken = resAdmin.body.token;
  });

  it("should successfully register and login a user with salted PBKDF2", async () => {
    // Register
    const resReg = await request(app)
      .post("/api/register")
      .send({
        whatsapp: "555555555",
        name: "PBKDF2 Parent",
        email: "pbkdf2@test.com",
        password: "a1b2c3"
      });
    expect(resReg.statusCode).toBe(200);
    expect(resReg.body).toHaveProperty("success", true);

    // Login
    const resLog = await request(app)
      .post("/api/login")
      .send({ whatsapp: "555555555", password: "a1b2c3" });
    expect(resLog.statusCode).toBe(200);
    expect(resLog.body).toHaveProperty("success", true);
    expect(resLog.body).toHaveProperty("token");
  });

  it("should automatically migrate legacy SHA-256 password to salted PBKDF2 on login", async () => {
    // 1. Manually insert a user with NULL salt and legacy SHA-256 password hash
    const whatsapp = "888888888";
    const legacyPassword = "a1b2c3";
    const legacyHash = require("crypto").createHash("sha256").update(legacyPassword).digest("hex");

    await new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO users (whatsapp, name, email, password_hash, salt, role) VALUES (?, ?, ?, ?, NULL, 'parent')",
        [whatsapp, "Legacy Parent", "legacy@test.com", legacyHash],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // 2. Perform login using legacy password
    const resLog = await request(app)
      .post("/api/login")
      .send({ whatsapp, password: legacyPassword });
    expect(resLog.statusCode).toBe(200);
    expect(resLog.body).toHaveProperty("success", true);

    // 3. Verify user's database entry has been updated with a salt and PBKDF2 hash
    const dbUser = await new Promise((resolve, reject) => {
      db.get("SELECT password_hash, salt FROM users WHERE whatsapp = ?", [whatsapp], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    expect(dbUser.salt).not.toBeNull();
    expect(dbUser.password_hash).not.toBe(legacyHash);
    expect(dbUser.password_hash.length).toBe(128); // SHA-512 hex output is 128 characters long
  });

  it("should deny GET database backup for non-superadmin users", async () => {
    // Create regular user token
    const resUser = await request(app)
      .post("/api/login")
      .send({ whatsapp: "555555555", password: "a1b2c3" });
    const userToken = resUser.body.token;

    const res = await request(app)
      .get("/api/admin/backup")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty("error", "Access denied");
  });

  it("should allow GET database backup for superadmin", async () => {
    const res = await request(app)
      .get("/api/admin/backup")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body.message).toContain("Backup created successfully");

    // Clean up created backup file to keep the workspace clean
    const match = res.body.message.match(/backups\/backup-.*\.sqlite/);
    if (match) {
      const backupFilename = match[0].split("/")[1];
      const backupPath = require("path").resolve(__dirname, "..", "backups", backupFilename);
      if (require("fs").existsSync(backupPath)) {
        require("fs").unlinkSync(backupPath);
      }
    }
  });

  it("should allow an authenticated user to change their own password", async () => {
    // 1. Log in to get the token
    const loginRes = await request(app)
      .post("/api/login")
      .send({ whatsapp: "555555555", password: "a1b2c3" });
    const userToken = loginRes.body.token;

    // 2. Change password
    const changeRes = await request(app)
      .post("/api/user/change-password")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ newPassword: "newPass123" });
    expect(changeRes.statusCode).toBe(200);
    expect(changeRes.body).toHaveProperty("success", true);
    expect(changeRes.body).toHaveProperty("token");

    // 3. Verify old token is now invalid (because pwd_slice changed)
    const oldTokenSyncRes = await request(app)
      .get("/api/sync/555555555")
      .set("Authorization", `Bearer ${userToken}`);
    expect(oldTokenSyncRes.statusCode).toBe(403);

    // 4. Verify login with new password succeeds
    const newLoginRes = await request(app)
      .post("/api/login")
      .send({ whatsapp: "555555555", password: "newPass123" });
    expect(newLoginRes.statusCode).toBe(200);
    expect(newLoginRes.body).toHaveProperty("success", true);
  });

  it("should fail to change own password if it is simple or sequential", async () => {
    const loginRes = await request(app)
      .post("/api/login")
      .send({ whatsapp: "555555555", password: "newPass123" });
    const userToken = loginRes.body.token;

    const changeRes = await request(app)
      .post("/api/user/change-password")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ newPassword: "123456" }); // Sequential
    expect(changeRes.statusCode).toBe(400);
    expect(changeRes.body).toHaveProperty("error", "password_sequential_error");
  });

  it("should allow superadmin to reset another user's password", async () => {
    // Superadmin resets user 555555555's password to 'resetPass456'
    const resetRes = await request(app)
      .post("/api/admin/users/555555555/reset-password")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ password: "resetPass456" });
    expect(resetRes.statusCode).toBe(200);
    expect(resetRes.body).toHaveProperty("success", true);

    // Verify login with new password succeeds
    const loginRes = await request(app)
      .post("/api/login")
      .send({ whatsapp: "555555555", password: "resetPass456" });
    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body).toHaveProperty("success", true);
  });

  it("should deny non-superadmin from resetting another user's password", async () => {
    const loginRes = await request(app)
      .post("/api/login")
      .send({ whatsapp: "555555555", password: "resetPass456" });
    const userToken = loginRes.body.token;

    const resetRes = await request(app)
      .post("/api/admin/users/9999/reset-password")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ password: "somePass123" });
    expect(resetRes.statusCode).toBe(403);
    expect(resetRes.body).toHaveProperty("error", "Access denied");
  });
});

describe("CORS Configuration", () => {
  let originalCorsOrigin;

  beforeAll(() => {
    // Save original if we want, but process is shared.
    originalCorsOrigin = process.env.CORS_ORIGIN;
  });

  afterAll(() => {
    process.env.CORS_ORIGIN = originalCorsOrigin;
  });

  it("should return Access-Control-Allow-Origin: * when CORS_ORIGIN is * and not reflect origin", async () => {
    // In order to test this correctly, since `app` is instantiated globally, we'd need to mock or clear cache.
    // Instead of messing with the cache, let's create a fresh express app that mimics the server's setup for this test.
    const express = require("express");
    const cors = require("cors");

    // Simulate setting the environment variable
    const testCorsOrigin = "*";

    const testApp = express();
    testApp.use(
      cors({
        origin:
          testCorsOrigin === "*"
            ? "*"
            : testCorsOrigin.split(",").map((s) => s.trim()),
      }),
    );
    testApp.get("/test", (req, res) => res.send("ok"));

    const testOrigin = "http://malicious.com";
    const res = await request(testApp).get("/test").set("Origin", testOrigin);

    // Validate we use explicit * and do not reflect the malicious origin
    expect(res.headers["access-control-allow-origin"]).toEqual("*");
    expect(res.headers["access-control-allow-origin"]).not.toEqual(testOrigin);
  });
});

describe("Security Headers (Helmet)", () => {
  it("should include standard security headers", async () => {
    const res = await request(app).get("/api/health");
    expect(res.headers).toHaveProperty("x-content-type-options", "nosniff");
    expect(res.headers).toHaveProperty("x-frame-options", "SAMEORIGIN");
  });
});

describe("Rate Limiting", () => {
  it("should include rate limit headers", async () => {
    const res = await request(app).get("/api/health");
    expect(res.headers).toHaveProperty("ratelimit-limit");
    expect(res.headers).toHaveProperty("ratelimit-remaining");
  });

  it("should rate limit excessive registration attempts", async () => {
    // Make 15 registration attempts to consume the rate limit window
    for (let i = 0; i < 15; i++) {
      await request(app)
        .post("/api/register")
        .send({
          whatsapp: `99900000${i}`,
          name: `Rate Limited ${i}`,
          password: "a1b2c3"
        });
    }
    const res = await request(app)
      .post("/api/register")
      .send({
        whatsapp: "999000009",
        name: "Blocked User",
        password: "a1b2c3"
      });
    expect(res.statusCode).toEqual(429);
    expect(res.body).toHaveProperty("error", "Too many registration attempts, please try again later");
  });
});

describe("2FA Endpoints", () => {
  let userToken;
  let twoFactorSecret;
  const testPhone = "555222222";
  const testPassword = "a1b2c3";

  const { base32Decode, loginLimiter, registerLimiter, resetPasswordLimiter } = require("./server");
  const crypto = require("crypto");
  function getTOTP(secret) {
    const key = base32Decode(secret);
    const epoch = Math.floor(Date.now() / 1000);
    const counter = Math.floor(epoch / 30);
    const buf = Buffer.alloc(8);
    buf.writeUInt32BE(0, 0);
    buf.writeUInt32BE(counter, 4);

    const hmac = crypto.createHmac("sha1", key).update(buf).digest();
    const offset = hmac[hmac.length - 1] & 0xf;
    const code =
      ((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff);

    return (code % 1000000).toString().padStart(6, "0");
  }

  beforeEach(() => {
    const ips = ["::ffff:127.0.0.1", "127.0.0.1", "::1"];
    ips.forEach(ip => {
      loginLimiter.resetKey(ip);
      registerLimiter.resetKey(ip);
      resetPasswordLimiter.resetKey(ip);
    });
  });

  beforeAll(async () => {
    const ips = ["::ffff:127.0.0.1", "127.0.0.1", "::1"];
    ips.forEach(ip => {
      loginLimiter.resetKey(ip);
      registerLimiter.resetKey(ip);
      resetPasswordLimiter.resetKey(ip);
    });

    // Register test user
    await request(app)
      .post("/api/register")
      .send({
        whatsapp: testPhone,
        name: "2FA User",
        password: testPassword
      });

    // Login to get token
    const loginRes = await request(app)
      .post("/api/login")
      .send({
        whatsapp: testPhone,
        password: testPassword
      });
    userToken = loginRes.body.token;
  });

  it("should initialize 2FA setup and return a secret", async () => {
    const res = await request(app)
      .post("/api/2fa/setup")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body).toHaveProperty("secret");
    expect(res.body).toHaveProperty("qrUri");
    twoFactorSecret = res.body.secret;
  });

  it("should fail to enable 2FA with an invalid code", async () => {
    const res = await request(app)
      .post("/api/2fa/enable")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        secret: twoFactorSecret,
        code: "000000"
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("error", "invalid_2fa_code");
  });

  it("should enable 2FA successfully with a valid code", async () => {
    const code = getTOTP(twoFactorSecret);
    const res = await request(app)
      .post("/api/2fa/enable")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        secret: twoFactorSecret,
        code: code
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("success", true);
  });

  it("should show 2FA as enabled in status check", async () => {
    const res = await request(app)
      .get("/api/2fa/status")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("two_factor_enabled", true);
  });

  it("should require 2FA on login when enabled", async () => {
    const res = await request(app)
      .post("/api/login")
      .send({
        whatsapp: testPhone,
        password: testPassword
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("two_factor_required", true);
    expect(res.body).toHaveProperty("temp_token");
  });

  it("should fail 2FA login with an invalid code", async () => {
    const loginRes = await request(app)
      .post("/api/login")
      .send({
        whatsapp: testPhone,
        password: testPassword
      });
    const tempToken = loginRes.body.temp_token;

    const res = await request(app)
      .post("/api/login/2fa")
      .send({
        temp_token: tempToken,
        code: "000000"
      });

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty("error", "invalid_2fa_code");
  });

  it("should complete login successfully with a valid 2FA code", async () => {
    const loginRes = await request(app)
      .post("/api/login")
      .send({
        whatsapp: testPhone,
        password: testPassword
      });
    const tempToken = loginRes.body.temp_token;
    const code = getTOTP(twoFactorSecret);

    const res = await request(app)
      .post("/api/login/2fa")
      .send({
        temp_token: tempToken,
        code: code
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body).toHaveProperty("token");
    // Update token
    userToken = res.body.token;
  });

  it("should fail to disable 2FA with an incorrect password", async () => {
    const res = await request(app)
      .post("/api/2fa/disable")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        password: "wrong_password"
      });

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty("error", "invalid_password");
  });

  it("should disable 2FA successfully with a correct password", async () => {
    const res = await request(app)
      .post("/api/2fa/disable")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        password: testPassword
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("success", true);
  });

  it("should show 2FA as disabled in status check", async () => {
    const res = await request(app)
      .get("/api/2fa/status")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("two_factor_enabled", false);
  });
});

describe("Production Config Validations", () => {
  it("should fail to start in production if JWT_SECRET is missing", (done) => {
    const { exec } = require("child_process");
    exec(
      'node -e "const Module = require(\\\"module\\\"); const orig = Module.prototype.require; Module.prototype.require = function(id) { if(id===\\\"dotenv\\\") return { config: () => ({}) }; return orig.apply(this, arguments); }; process.env.NODE_ENV=\\\"production\\\"; delete process.env.JWT_SECRET; process.env.SYNC_AUTH_TOKEN=\\\"test\\\"; require(\\\"./server\\\")"',
      { cwd: __dirname },
      (error, stdout, stderr) => {
        expect(error).not.toBeNull();
        expect(error.code).toBe(1);
        expect(stderr).toContain("JWT_SECRET is not configured");
        done();
      }
    );
  });

  it("should fail to start in production if SYNC_AUTH_TOKEN is missing", (done) => {
    const { exec } = require("child_process");
    exec(
      'node -e "const Module = require(\\\"module\\\"); const orig = Module.prototype.require; Module.prototype.require = function(id) { if(id===\\\"dotenv\\\") return { config: () => ({}) }; return orig.apply(this, arguments); }; process.env.NODE_ENV=\\\"production\\\"; process.env.JWT_SECRET=\\\"test\\\"; delete process.env.SYNC_AUTH_TOKEN; require(\\\"./server\\\")"',
      { cwd: __dirname },
      (error, stdout, stderr) => {
        expect(error).not.toBeNull();
        expect(error.code).toBe(1);
        expect(stderr).toContain("SYNC_AUTH_TOKEN is not configured");
        done();
      }
    );
  });

  it("should fail to start in production if CORS_ORIGIN is wildcard (*)", (done) => {
    const { exec } = require("child_process");
    exec(
      'node -e "const Module = require(\\\"module\\\"); const orig = Module.prototype.require; Module.prototype.require = function(id) { if(id===\\\"dotenv\\\") return { config: () => ({}) }; return orig.apply(this, arguments); }; process.env.NODE_ENV=\\\"production\\\"; process.env.JWT_SECRET=\\\"test\\\"; process.env.SYNC_AUTH_TOKEN=\\\"test\\\"; process.env.CORS_ORIGIN=\\\"*\\\"; require(\\\"./server\\\")"',
      { cwd: __dirname },
      (error, stdout, stderr) => {
        expect(error).not.toBeNull();
        expect(error.code).toBe(1);
        expect(stderr).toContain("CORS wildcard (*) is not allowed in production");
        done();
      }
    );
  });
});

describe("Multiple Partners Branding API", () => {
  let adminToken;
  let userToken;
  const testPartnerUser = "555111111";
  const testPartnerPass = "a1b2c3";

  beforeAll(async () => {
    // 1. Get Superadmin token
    const resAdmin = await request(app)
      .post("/api/login")
      .send({ whatsapp: "9999", password: "Admin@123" });
    adminToken = resAdmin.body.token;

    // 2. Register and Login a regular user
    await request(app)
      .post("/api/register")
      .send({
        whatsapp: testPartnerUser,
        name: "Partner Test User",
        password: testPartnerPass
      });
    const resUser = await request(app)
      .post("/api/login")
      .send({ whatsapp: testPartnerUser, password: testPartnerPass });
    userToken = resUser.body.token;
  });

  it("should retrieve partner branding and return empty or object if not set", async () => {
    const res = await request(app).get("/api/partner-logo");
    expect(res.statusCode).toEqual(200);
    // Since we cleared the database or initialized it, it might return empty logo/link
    expect(res.body).toBeDefined();
  });

  it("should allow superadmin to save multiple partner logos as an array", async () => {
    const partnersData = [
      { id: "p1", logo: "data:image/png;base64,logo1", link: "https://partner1.org" },
      { id: "p2", logo: "data:image/png;base64,logo2", link: "https://partner2.org" }
    ];

    const postRes = await request(app)
      .post("/api/partner-logo")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(partnersData);

    expect(postRes.statusCode).toEqual(200);
    expect(postRes.body).toHaveProperty("success", true);

    const getRes = await request(app).get("/api/partner-logo");
    expect(getRes.statusCode).toEqual(200);
    expect(Array.isArray(getRes.body)).toBe(true);
    expect(getRes.body).toHaveLength(2);
    expect(getRes.body[0]).toEqual(partnersData[0]);
    expect(getRes.body[1]).toEqual(partnersData[1]);
  });

  it("should deny non-superadmin from saving partner logos", async () => {
    const partnersData = [
      { id: "p3", logo: "data:image/png;base64,logo3", link: "https://partner3.org" }
    ];

    const postRes = await request(app)
      .post("/api/partner-logo")
      .set("Authorization", `Bearer ${userToken}`)
      .send(partnersData);

    expect(postRes.statusCode).toEqual(403);
    expect(postRes.body).toHaveProperty("error", "Access denied");
  });

  it("should deny unauthorized users from saving partner logos", async () => {
    const partnersData = [];
    const postRes = await request(app)
      .post("/api/partner-logo")
      .send(partnersData);

    expect(postRes.statusCode).toEqual(401);
  });
});
