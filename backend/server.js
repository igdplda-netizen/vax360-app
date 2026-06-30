const express = require("express");
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const crypto = require("crypto");
const helmet = require("helmet");

// Load environment variables from .env file (if dotenv is available)
try {
  require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });
} catch (_) {
  /* dotenv not installed — using defaults */
}

const app = express();
app.set('trust proxy', 1); // Required for Replit proxy

// ─── Configuration (from environment) ───────────────────
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";
const DB_PATH = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.resolve(__dirname, "database.sqlite");
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

// Enforce environment validation for production
if (NODE_ENV === "production") {
  if (!process.env.JWT_SECRET) {
    console.error("❌ FATAL ERROR: JWT_SECRET is not configured for production!");
    process.exit(1);
  }
  if (!process.env.SYNC_AUTH_TOKEN) {
    console.error("❌ FATAL ERROR: SYNC_AUTH_TOKEN is not configured for production!");
    process.exit(1);
  }
  if (CORS_ORIGIN === "*" || CORS_ORIGIN.split(",").map(s => s.trim()).includes("*")) {
    console.error("❌ FATAL ERROR: CORS wildcard (*) is not allowed in production!");
    process.exit(1);
  }
}

const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret_temp";
const SYNC_AUTH_TOKEN = process.env.SYNC_AUTH_TOKEN || "dev_sync_token_temp";

if (NODE_ENV !== "production" && (!process.env.JWT_SECRET || !process.env.SYNC_AUTH_TOKEN)) {
  console.warn(
    "\n⚠️  WARNING: JWT_SECRET or SYNC_AUTH_TOKEN not set. Using insecure default development secrets.\n"
  );
}

// Helper to handle internal server errors without leaking database details in production
function handleInternalError(res, err, logMessage) {
  console.error(logMessage, err);
  if (NODE_ENV === "production") {
    res.status(500).json({ error: "Internal server error" });
  } else {
    res.status(500).json({ error: err.message });
  }
}

// ─── Middleware ─────────────────────────────────────────
// Helmet disabled for Replit to allow CDN scripts
// app.use(helmet());
app.use(
  cors({
    origin: "*",
  }),
);
app.use((req, res, next) => {
  if (req.path === "/api/partner-logo" && req.method === "POST") {
    bodyParser.json({ limit: "10mb" })(req, res, next);
  } else {
    bodyParser.json({ limit: "100kb" })(req, res, next);
  }
});

// General Rate Limiter to prevent DoS attacks on sync and health endpoints
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per 15 minutes
  message: {
    error: "Too many requests from this IP, please try again later"
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// ─── Database Setup (SQLite) ────────────────────────────
const db = new sqlite3.Database(
  process.env.DB_PATH === ":memory:" ? ":memory:" : DB_PATH,
  (err) => {
    if (err) {
      console.error("❌ Error connecting to database:", err.message);
      process.exit(1);
    }
    console.log(`✅ Connected to SQLite database at ${DB_PATH}`);

    // Auto-create tables on first run
    db.run(`CREATE TABLE IF NOT EXISTS store (
      id          TEXT PRIMARY KEY,
      data        TEXT,
      updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, () => {
      db.all("PRAGMA table_info(store)", (err, rows) => {
        if (!err && rows) {
          const hasUpdatedAt = rows.some(r => r.name === "updated_at");
          if (!hasUpdatedAt) {
            db.run("ALTER TABLE store ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP", (alterErr) => {
              if (alterErr) console.error("❌ Error altering store table:", alterErr.message);
            });
          }
        }
      });
    });

    db.run(`CREATE TABLE IF NOT EXISTS users (
      whatsapp       TEXT PRIMARY KEY,
      name           TEXT NOT NULL,
      email          TEXT,
      password_hash  TEXT NOT NULL,
      salt           TEXT,
      role           TEXT NOT NULL DEFAULT 'parent',
      two_factor_secret  TEXT,
      two_factor_enabled INTEGER DEFAULT 0
    )`, (err) => {
      if (err) {
        console.error("❌ Error creating users table:", err.message);
        return;
      }
      // Auto-migration: Alter table to add columns if table already existed without them
      db.all("PRAGMA table_info(users)", (errInfo, rows) => {
        const seedSuperadmin = () => {
          // Seed default Superadmin user if not exists (using PBKDF2)
          db.get("SELECT whatsapp FROM users WHERE whatsapp = '9999'", (errAdmin, rowAdmin) => {
            if (!errAdmin && !rowAdmin) {
              const superadminSalt = crypto.randomBytes(16).toString("hex");
              const superadminHash = crypto.pbkdf2Sync("Admin@123", superadminSalt, 100000, 64, "sha512").toString("hex");
              db.run(`INSERT INTO users (whatsapp, name, email, password_hash, salt, role)
                      VALUES ('9999', 'Superadmin', 'admin@vax360.com', ?, ?, 'superadmin')`, [superadminHash, superadminSalt], (insertErr) => {
                        if (insertErr) console.error("❌ Error seeding superadmin:", insertErr.message);
                      });
            }
          });
        };

        if (!errInfo && rows) {
          const hasSalt = rows.some(r => r.name === "salt");
          const has2FASecret = rows.some(r => r.name === "two_factor_secret");
          const has2FAEnabled = rows.some(r => r.name === "two_factor_enabled");

          const runMigrations = (idx) => {
            if (idx === 0) {
              if (!hasSalt) {
                db.run("ALTER TABLE users ADD COLUMN salt TEXT", (alterErr) => {
                  if (alterErr) console.error("❌ Error altering users table (salt):", alterErr.message);
                  runMigrations(1);
                });
              } else {
                runMigrations(1);
              }
            } else if (idx === 1) {
              if (!has2FASecret) {
                db.run("ALTER TABLE users ADD COLUMN two_factor_secret TEXT", (alterErr) => {
                  if (alterErr) console.error("❌ Error altering users table (two_factor_secret):", alterErr.message);
                  runMigrations(2);
                });
              } else {
                runMigrations(2);
              }
            } else if (idx === 2) {
              if (!has2FAEnabled) {
                db.run("ALTER TABLE users ADD COLUMN two_factor_enabled INTEGER DEFAULT 0", (alterErr) => {
                  if (alterErr) console.error("❌ Error altering users table (two_factor_enabled):", alterErr.message);
                  seedSuperadmin();
                });
              } else {
                seedSuperadmin();
              }
            }
          };
          runMigrations(0);
        } else {
          seedSuperadmin();
        }
      });
    });

    db.run(`CREATE TABLE IF NOT EXISTS audit_log (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    action      TEXT NOT NULL,
    entity_type TEXT,
    entity_id   TEXT,
    payload     TEXT,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

    db.run(`CREATE TABLE IF NOT EXISTS app_meta (
    key   TEXT PRIMARY KEY,
    value TEXT
  )`);
  },
);

// ─── Health Check ───────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", env: NODE_ENV, uptime: process.uptime() });
});

// ─── API Routes ─────────────────────────────────────────

// PBKDF2 password hashing helper
function hashPassword(password, salt) {
  if (!salt) {
    salt = crypto.randomBytes(16).toString("hex");
  }
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return { salt, hash };
}

// Password Complexity Validator
function validatePasswordComplexity(pwd) {
  if (!pwd) return { valid: false, msg: "password_required" };
  if (pwd.length < 6 || pwd.length > 64) {
    return { valid: false, msg: "password_length_error" };
  }
  if (/^(.)\1+$/.test(pwd)) {
    return { valid: false, msg: "password_repetitive_error" };
  }
  const lower = pwd.toLowerCase();
  if ("0123456789".includes(lower) || "9876543210".includes(lower) || "abcdefghijklmnopqrstuvwxyz".includes(lower) || "zyxwvutsrqponmlkjihgfedcba".includes(lower)) {
    return { valid: false, msg: "password_sequential_error" };
  }
  const hasLetter = /[a-zA-Z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  if (!hasLetter || !hasNumber) {
    return { valid: false, msg: "password_complexity_error" };
  }
  return { valid: true };
}

// Base32 Decoder for TOTP secrets
function base32Decode(str) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let cleaned = str.toUpperCase().replace(/=+$/, "");
  let len = cleaned.length;
  let bits = 0;
  let val = 0;
  let bytes = [];
  for (let i = 0; i < len; i++) {
    const idx = alphabet.indexOf(cleaned[i]);
    if (idx === -1) throw new Error("Invalid base32 character");
    val = (val << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((val >> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

// Generate random Base32 TOTP secret
function generateSecret(length = 16) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const bytes = crypto.randomBytes(length);
  let secret = "";
  for (let i = 0; i < bytes.length; i++) {
    secret += alphabet[bytes[i] % alphabet.length];
  }
  return secret;
}

// Verify TOTP token with tolerance window
function verifyTOTP(secret, token, window = 4) {
  try {
    if (!secret || !token) return false;
    const cleanToken = String(token).replace(/\s+/g, "");
    const key = base32Decode(secret);
    const epoch = Math.floor(Date.now() / 1000);
    const currentCounter = Math.floor(epoch / 30);
    const allowedCodes = [];

    for (let i = -window; i <= window; i++) {
      const counter = currentCounter + i;
      const buf = Buffer.alloc(8);
      buf.writeUInt32BE(0, 0);
      buf.writeUInt32BE(counter, 4);

      const hmac = crypto.createHmac("sha1", key).update(buf).digest();
      const offset = hmac[hmac.length - 1] & 0xf;
      const codeVal =
        ((hmac[offset] & 0x7f) << 24) |
        ((hmac[offset + 1] & 0xff) << 16) |
        ((hmac[offset + 2] & 0xff) << 8) |
        (hmac[offset + 3] & 0xff);

      const checkToken = (codeVal % 1000000).toString().padStart(6, "0");
      allowedCodes.push({ offsetSec: i * 30, code: checkToken });
      if (checkToken === cleanToken) {
        return true;
      }
    }
    console.log(`[2FA Debug] Verification failed. Input: "${cleanToken}". Allowed codes in window:`, allowedCodes);
  } catch (err) {
    console.error("❌ TOTP verification error:", err.message);
  }
  return false;
}


// ─── Authentication Middleware ──────────────────────────
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.status(401).json({ error: "Token missing" });

  jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] }, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token" });

    // Verify user still exists and password hash matches (session termination on delete/reset)
    db.get("SELECT role, password_hash FROM users WHERE whatsapp = ?", [decoded.whatsapp], (dbErr, row) => {
      if (dbErr || !row) {
        return res.status(403).json({ error: "User profile no longer exists" });
      }

      const current_slice = row.password_hash.substring(0, 10);
      if (decoded.pwd_slice !== current_slice) {
        return res.status(403).json({ error: "Session expired or password changed" });
      }

      req.user = { whatsapp: decoded.whatsapp, role: row.role };
      next();
    });
  });
}

// ─── Rate Limiting ──────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "test" ? 15 : 5, // Limit each IP to 15 in tests, 5 in production
  message: {
    success: false,
    message: "Too many login attempts, please try again later",
  },
});

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "test" ? 15 : 5, // Limit each IP to 15 in tests, 5 in production
  message: {
    error: "Too many registration attempts, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "test" ? 15 : 3, // Very strict: 3 attempts per 15 min in production
  message: {
    error: "Too many password reset attempts, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Self-Service Password Reset (Public) ────────────────
app.post("/api/auth/reset-password", resetPasswordLimiter, (req, res) => {
  const { whatsapp, newPassword } = req.body;
  if (!whatsapp || !newPassword) {
    return res.status(400).json({ error: "WhatsApp number and new password are required" });
  }

  const complexity = validatePasswordComplexity(newPassword);
  if (!complexity.valid) {
    return res.status(400).json({ error: complexity.msg });
  }

  // Check user exists
  db.get(
    "SELECT whatsapp, role FROM users WHERE whatsapp = ?",
    [whatsapp],
    (err, user) => {
      if (err) {
        return handleInternalError(res, err, "❌ Error querying user for reset:");
      }
      if (!user) {
        // Return generic message to prevent user enumeration
        return res.status(404).json({ error: "user_not_found" });
      }

      const { salt, hash: password_hash } = hashPassword(newPassword);

      db.run(
        "UPDATE users SET password_hash = ?, salt = ? WHERE whatsapp = ?",
        [password_hash, salt, whatsapp],
        function (updateErr) {
          if (updateErr) {
            return handleInternalError(res, updateErr, "❌ Error resetting password:");
          }

          // Audit log
          db.run(
            "INSERT INTO audit_log (action, entity_type, entity_id, payload) VALUES (?, ?, ?, ?)",
            ["self_reset_password", "user", whatsapp, "Self-service reset from login screen"],
            (auditErr) => {
              if (auditErr) console.error("❌ Audit self-reset password error:", auditErr.message);
              res.json({ success: true, message: "Password reset successfully" });
            }
          );
        }
      );
    }
  );
});

// ─── Register Route ──────────────────────────────────────
app.post("/api/register", registerLimiter, (req, res) => {
  const { name, whatsapp, email, password } = req.body;
  if (!name || !whatsapp || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Validate complexity
  const complexity = validatePasswordComplexity(password);
  if (!complexity.valid) {
    return res.status(400).json({ error: complexity.msg });
  }

  const { salt, hash: password_hash } = hashPassword(password);

  db.serialize(() => {
    db.run(
      "INSERT INTO users (whatsapp, name, email, password_hash, salt, role) VALUES (?, ?, ?, ?, ?, 'parent')",
      [whatsapp, name, email || null, password_hash, salt],
      function (err) {
          if (err) {
            if (err.message.includes("UNIQUE constraint")) {
              return res.status(400).json({ error: "registration_failed" });
            }
            return handleInternalError(res, err, "❌ Error inserting user:");
          }

          // Log registration audit log
          db.run(
            "INSERT INTO audit_log (action, entity_type, entity_id, payload) VALUES (?, ?, ?, ?)",
            ["user_register", "user", whatsapp, "Success: true"],
            (auditErr) => {
              if (auditErr) console.error("❌ Audit register error:", auditErr.message);

              // Initialize empty sync block in store
              const initialData = JSON.stringify({ children: [], vaccines: [] });
              db.run(
                "INSERT OR IGNORE INTO store (id, data) VALUES (?, ?)",
                [whatsapp, initialData],
                function (errStore) {
                  if (errStore) {
                    return handleInternalError(res, errStore, "❌ Error initializing store data:");
                  }
                  res.json({ success: true, message: "Profile registered successfully" });
                }
              );
            }
          );
        }
    );
  });
});

// ─── Auth Route ─────────────────────────────────────────
app.post("/api/login", loginLimiter, (req, res) => {
  const { whatsapp, password } = req.body;
  if (!whatsapp || !password) {
    return res.status(400).json({ error: "WhatsApp and Password are required" });
  }

  db.get(
    "SELECT whatsapp, name, email, role, password_hash, salt, two_factor_enabled, two_factor_secret FROM users WHERE whatsapp = ?",
    [whatsapp],
    (err, user) => {
      if (err) {
        return handleInternalError(res, err, "❌ Error querying user:");
      }
      if (!user) {
        db.run(
          "INSERT INTO audit_log (action, entity_type, entity_id, payload) VALUES (?, ?, ?, ?)",
          ["user_login_failed", "user", whatsapp, "Reason: User not found"],
          (auditErr) => {
            if (auditErr) console.error("❌ Audit login failed error:", auditErr.message);
            return res.status(401).json({ error: "Invalid credentials" });
          }
        );
        return;
      }

      let passwordMatches = false;
      
      // Enforce PBKDF2 if salt exists, otherwise fallback to SHA-256 and migrate
      if (user.salt) {
        const computedHash = crypto.pbkdf2Sync(password, user.salt, 100000, 64, "sha512").toString("hex");
        passwordMatches = (computedHash === user.password_hash);
      } else {
        const legacyHash = crypto.createHash("sha256").update(password).digest("hex");
        if (legacyHash === user.password_hash) {
          passwordMatches = true;
          // Auto-migrate to secure PBKDF2
          const { salt: newSalt, hash: newHash } = hashPassword(password);
          db.run(
            "UPDATE users SET password_hash = ?, salt = ? WHERE whatsapp = ?",
            [newHash, newSalt, whatsapp],
            (updateErr) => {
              if (updateErr) console.error("❌ Error during password hash auto-migration:", updateErr.message);
            }
          );
          user.password_hash = newHash;
          user.salt = newSalt;
        }
      }

      if (!passwordMatches) {
        db.run(
          "INSERT INTO audit_log (action, entity_type, entity_id, payload) VALUES (?, ?, ?, ?)",
          ["user_login_failed", "user", whatsapp, "Reason: Invalid credentials"],
          (auditErr) => {
            if (auditErr) console.error("❌ Audit login failed error:", auditErr.message);
            return res.status(401).json({ error: "Invalid credentials" });
          }
        );
        return;
      }

      // Check if 2FA is enabled
      if (user.two_factor_enabled === 1 && user.two_factor_secret) {
        db.run(
          "INSERT INTO audit_log (action, entity_type, entity_id, payload) VALUES (?, ?, ?, ?)",
          ["two_factor_login_pending", "user", user.whatsapp, ""],
          (auditErr) => {
            if (auditErr) console.error("❌ Audit login 2fa pending error:", auditErr.message);
            // Sign a short-lived temp token
            const temp_token = jwt.sign(
              { whatsapp: user.whatsapp, role: user.role, step: "2fa_pending" },
              JWT_SECRET,
              { expiresIn: "5m" }
            );
            return res.json({
              success: true,
              two_factor_required: true,
              temp_token
            });
          }
        );
        return;
      }

      // Log successful login
      db.run(
        "INSERT INTO audit_log (action, entity_type, entity_id, payload) VALUES (?, ?, ?, ?)",
        ["user_login_success", "user", user.whatsapp, `Role: ${user.role}`],
        (auditErr) => {
          if (auditErr) console.error("❌ Audit login success error:", auditErr.message);

          // Generate JWT with pwd_slice to invalidate sessions on delete/password reset
          const pwd_slice = user.password_hash.substring(0, 10);
          const token = jwt.sign(
            { whatsapp: user.whatsapp, role: user.role, pwd_slice },
            JWT_SECRET,
            { expiresIn: "7d" }
          );

          res.json({
            success: true,
            token,
            role: user.role,
            user: {
              name: user.name,
              whatsapp: user.whatsapp,
              email: user.email,
            },
          });
        }
      );
    }
  );
});

// ─── 2FA Login Route ────────────────────────────────────
app.post("/api/login/2fa", loginLimiter, (req, res) => {
  const { temp_token, code } = req.body;
  if (!temp_token || !code) {
    return res.status(400).json({ error: "Temporary token and Code are required" });
  }

  jwt.verify(temp_token, JWT_SECRET, { algorithms: ["HS256"] }, (err, decoded) => {
    if (err || !decoded || decoded.step !== "2fa_pending") {
      return res.status(400).json({ error: "invalid_temp_token" });
    }

    const whatsapp = decoded.whatsapp;
    db.get(
      "SELECT whatsapp, name, email, role, password_hash, two_factor_secret, two_factor_enabled FROM users WHERE whatsapp = ?",
      [whatsapp],
      (dbErr, user) => {
        if (dbErr) {
          return handleInternalError(res, dbErr, "❌ Error querying user during 2FA login:");
        }
        if (!user || user.two_factor_enabled !== 1 || !user.two_factor_secret) {
          return res.status(400).json({ error: "2FA not configured or invalid user" });
        }

        const verified = verifyTOTP(user.two_factor_secret, code);
        if (!verified) {
          db.run(
            "INSERT INTO audit_log (action, entity_type, entity_id, payload) VALUES (?, ?, ?, ?)",
            ["two_factor_login_failed", "user", whatsapp, "Reason: Invalid code"],
            (auditErr) => {
              if (auditErr) console.error("❌ Audit 2FA login failed error:", auditErr.message);
              return res.status(401).json({ error: "invalid_2fa_code" });
            }
          );
          return;
        }

        // Log successful 2FA login
        db.run(
          "INSERT INTO audit_log (action, entity_type, entity_id, payload) VALUES (?, ?, ?, ?)",
          ["two_factor_login_success", "user", whatsapp, `Role: ${user.role}`],
          (auditErr) => {
            if (auditErr) console.error("❌ Audit 2FA login success error:", auditErr.message);

            const pwd_slice = user.password_hash.substring(0, 10);
            const token = jwt.sign(
              { whatsapp: user.whatsapp, role: user.role, pwd_slice },
              JWT_SECRET,
              { expiresIn: "7d" }
            );

            res.json({
              success: true,
              token,
              role: user.role,
              user: {
                name: user.name,
                whatsapp: user.whatsapp,
                email: user.email,
              },
            });
          }
        );
      }
    );
  });
});

// ─── 2FA Management Routes ──────────────────────────────
app.post("/api/2fa/setup", authenticateToken, (req, res) => {
  const secret = generateSecret();
  const whatsapp = req.user.whatsapp;
  const otpauthUrl = `otpauth://totp/Vax360:${whatsapp}?secret=${secret}&issuer=Vax360`;
  
  db.run(
    "INSERT INTO audit_log (action, entity_type, entity_id, payload) VALUES (?, ?, ?, ?)",
    ["two_factor_setup_initiated", "user", whatsapp, ""],
    (auditErr) => {
      if (auditErr) console.error("❌ Audit 2FA setup error:", auditErr.message);
      res.json({
        success: true,
        secret,
        qrUri: otpauthUrl
      });
    }
  );
});

app.post("/api/2fa/enable", authenticateToken, (req, res) => {
  const { secret, code } = req.body;
  const whatsapp = req.user.whatsapp;
  if (!secret || !code) {
    return res.status(400).json({ error: "Secret and Code are required" });
  }

  const verified = verifyTOTP(secret, code);
  if (!verified) {
    return res.status(400).json({ error: "invalid_2fa_code" });
  }

  db.run(
    "UPDATE users SET two_factor_secret = ?, two_factor_enabled = 1 WHERE whatsapp = ?",
    [secret, whatsapp],
    (err) => {
      if (err) {
        return handleInternalError(res, err, "❌ Error enabling 2FA:");
      }
      db.run(
        "INSERT INTO audit_log (action, entity_type, entity_id, payload) VALUES (?, ?, ?, ?)",
        ["two_factor_enabled", "user", whatsapp, "Success: true"],
        (auditErr) => {
          if (auditErr) console.error("❌ Audit 2FA enable error:", auditErr.message);
          res.json({ success: true, message: "Two-Factor Authentication enabled successfully" });
        }
      );
    }
  );
});

app.post("/api/2fa/disable", authenticateToken, (req, res) => {
  const { password } = req.body;
  const whatsapp = req.user.whatsapp;
  if (!password) {
    return res.status(400).json({ error: "Password is required" });
  }

  db.get("SELECT password_hash, salt FROM users WHERE whatsapp = ?", [whatsapp], (err, user) => {
    if (err) {
      return handleInternalError(res, err, "❌ Error querying user during 2FA disable:");
    }
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let passwordMatches = false;
    if (user.salt) {
      const computedHash = crypto.pbkdf2Sync(password, user.salt, 100000, 64, "sha512").toString("hex");
      passwordMatches = (computedHash === user.password_hash);
    } else {
      const legacyHash = crypto.createHash("sha256").update(password).digest("hex");
      passwordMatches = (legacyHash === user.password_hash);
    }

    if (!passwordMatches) {
      return res.status(401).json({ error: "invalid_password" });
    }

    db.run(
      "UPDATE users SET two_factor_secret = NULL, two_factor_enabled = 0 WHERE whatsapp = ?",
      [whatsapp],
      (updateErr) => {
        if (updateErr) {
          return handleInternalError(res, updateErr, "❌ Error disabling 2FA:");
        }
        db.run(
          "INSERT INTO audit_log (action, entity_type, entity_id, payload) VALUES (?, ?, ?, ?)",
          ["two_factor_disabled", "user", whatsapp, "Success: true"],
          (auditErr) => {
            if (auditErr) console.error("❌ Audit 2FA disable error:", auditErr.message);
            res.json({ success: true, message: "Two-Factor Authentication disabled successfully" });
          }
        );
      }
    );
  });
});

app.get("/api/2fa/status", authenticateToken, (req, res) => {
  db.get("SELECT two_factor_enabled FROM users WHERE whatsapp = ?", [req.user.whatsapp], (err, row) => {
    if (err) {
      return handleInternalError(res, err, "❌ Error getting 2FA status:");
    }
    if (!row) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ two_factor_enabled: row.two_factor_enabled === 1 });
  });
});


// GET sync data by ID
app.get("/api/sync/:id", authenticateToken, (req, res) => {
  const id = req.params.id;
  // Privacy check: only the owner or superadmin can read
  if (req.user.role !== "superadmin" && req.user.whatsapp !== id) {
    return res.status(403).json({ error: "Access denied" });
  }

  db.get("SELECT data FROM store WHERE id = ?", [id], (err, row) => {
    if (err) {
      return handleInternalError(res, err, "❌ Error retrieving data from SQLite:");
    }
    if (row) {
      try {
        const parsed = JSON.parse(row.data);
        // Log the read action to audit_log
        db.run(
          `INSERT INTO audit_log (action, entity_type, entity_id, payload) VALUES (?, ?, ?, ?)`,
          ["sync_read", "user_data", id, `Success: true`],
          (auditErr) => {
            if (auditErr) {
              console.error("❌ Error writing to audit log:", auditErr.message);
            }
            res.json({ success: true, data: parsed });
          }
        );
      } catch (jsonErr) {
        res.status(500).json({ error: "Corrupted sync data in database" });
      }
    } else {
      res.json({ success: false, message: "No data found" });
    }
  });
});

// POST sync data by ID
app.post("/api/sync/:id", authenticateToken, (req, res) => {
  const id = req.params.id;
  // Privacy check: only the owner or superadmin can write
  if (req.user.role !== "superadmin" && req.user.whatsapp !== id) {
    return res.status(403).json({ error: "Access denied" });
  }

  let data;
  try {
    data = JSON.stringify(req.body);
  } catch (err) {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  db.serialize(() => {
    db.run(
      `INSERT INTO store (id, data, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP`,
      [id, data],
      function (err) {
        if (err) {
          return handleInternalError(res, err, "❌ Error writing data to SQLite:");
        }

        // Log the write action to audit_log
        db.run(
          `INSERT INTO audit_log (action, entity_type, entity_id, payload) VALUES (?, ?, ?, ?)`,
          ["sync_update", "user_data", id, `Size: ${data.length} bytes`],
          (auditErr) => {
            if (auditErr) {
              console.error("❌ Error writing to audit log:", auditErr.message);
            }
            res.json({ success: true, message: "Data saved to database" });
          }
        );
      },
    );
  });
});

// POST change password (any authenticated user)
app.post("/api/user/change-password", authenticateToken, (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword) {
    return res.status(400).json({ error: "New password is required" });
  }

  const complexity = validatePasswordComplexity(newPassword);
  if (!complexity.valid) {
    return res.status(400).json({ error: complexity.msg });
  }

  const { salt, hash: password_hash } = hashPassword(newPassword);

  db.run(
    "UPDATE users SET password_hash = ?, salt = ? WHERE whatsapp = ?",
    [password_hash, salt, req.user.whatsapp],
    function (err) {
      if (err) {
        return handleInternalError(res, err, "❌ Error changing password:");
      }

      // Log change password audit log
      db.run(
        "INSERT INTO audit_log (action, entity_type, entity_id, payload) VALUES (?, ?, ?, ?)",
        ["user_change_password", "user", req.user.whatsapp, `Success: true`],
        (auditErr) => {
          if (auditErr) console.error("❌ Audit change password error:", auditErr.message);

          // Generate new token with updated password slice so user stays logged in
          const pwd_slice = password_hash.substring(0, 10);
          const token = jwt.sign(
            { whatsapp: req.user.whatsapp, role: req.user.role, pwd_slice },
            JWT_SECRET,
            { expiresIn: "7d" }
          );

          res.json({ success: true, message: "Password updated successfully", token });
        }
      );
    }
  );
});

// POST reset password of a user (Admin/Superadmin only)
app.post("/api/admin/users/:whatsapp/reset-password", authenticateToken, (req, res) => {
  const whatsapp = req.params.whatsapp;
  if (req.user.role !== "superadmin" && req.user.role !== "admin" && req.user.whatsapp !== whatsapp) {
    return res.status(403).json({ error: "Access denied" });
  }
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ error: "Password is required" });
  }

  const complexity = validatePasswordComplexity(password);
  if (!complexity.valid) {
    return res.status(400).json({ error: complexity.msg });
  }

  const { salt, hash: password_hash } = hashPassword(password);

  db.run(
    "UPDATE users SET password_hash = ?, salt = ? WHERE whatsapp = ?",
    [password_hash, salt, whatsapp],
    function (err) {
      if (err) {
        return handleInternalError(res, err, "❌ Error resetting password:");
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      // Log reset password audit log
      db.run(
        "INSERT INTO audit_log (action, entity_type, entity_id, payload) VALUES (?, ?, ?, ?)",
        ["admin_reset_password", "user", whatsapp, `Reset by: ${req.user.whatsapp}`],
        (auditErr) => {
          if (auditErr) console.error("❌ Audit reset password error:", auditErr.message);
          res.json({ success: true, message: "Password reset successfully" });
        }
      );
    }
  );
});

// GET all users (Superadmin only)
app.get("/api/admin/users", authenticateToken, (req, res) => {
  if (req.user.role !== "superadmin") {
    return res.status(403).json({ error: "Access denied" });
  }
  db.all(
    "SELECT whatsapp, name, email, role FROM users WHERE role = 'parent'",
    [],
    (err, rows) => {
      if (err) {
        return handleInternalError(res, err, "❌ Error retrieving users from SQLite:");
      }
      res.json({ success: true, users: rows });
    }
  );
});

// DELETE a user and their data (Superadmin only)
app.delete("/api/admin/users/:whatsapp", authenticateToken, (req, res) => {
  if (req.user.role !== "superadmin") {
    return res.status(403).json({ error: "Access denied" });
  }
  const whatsapp = req.params.whatsapp;
  
  db.serialize(() => {
    db.run("DELETE FROM users WHERE whatsapp = ?", [whatsapp], function(err) {
        if (err) {
          return handleInternalError(res, err, "❌ Error deleting user:");
        }
        db.run("DELETE FROM store WHERE id = ?", [whatsapp], function(err2) {
          if (err2) {
            return handleInternalError(res, err2, "❌ Error deleting user data:");
          }

          // Log user deletion audit log
          db.run(
            "INSERT INTO audit_log (action, entity_type, entity_id, payload) VALUES (?, ?, ?, ?)",
            ["admin_delete_user", "user", whatsapp, `Deleted by: ${req.user.whatsapp}`],
            (auditErr) => {
              if (auditErr) console.error("❌ Audit delete user error:", auditErr.message);
              res.json({ success: true, message: "User profile and data deleted successfully" });
            }
          );
        });
    });
  });
});

// GET audit logs
app.get("/api/audit", authenticateToken, (req, res) => {
  if (req.user.role !== "superadmin") {
    return res.status(403).json({ error: "Access denied" });
  }
  db.all(
    "SELECT id, action, entity_type, entity_id, payload, created_at FROM audit_log ORDER BY created_at DESC LIMIT 100",
    [],
    (err, rows) => {
      if (err) {
        return handleInternalError(res, err, "❌ Error retrieving audits from SQLite:");
      }
      res.json({ success: true, audits: rows });
    }
  );
});

// GET admin database backup (Superadmin only)
app.get("/api/admin/backup", authenticateToken, (req, res) => {
  if (req.user.role !== "superadmin") {
    return res.status(403).json({ error: "Access denied" });
  }

  const backupDir = path.resolve(__dirname, "..", "backups");
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.join(backupDir, `backup-${timestamp}.sqlite`);

  if (process.env.DB_PATH === ":memory:" || DB_PATH.endsWith(":memory:")) {
    fs.writeFile(backupPath, "in-memory database backup placeholder", (writeErr) => {
      if (writeErr) {
        return handleInternalError(res, writeErr, "❌ Database backup failed:");
      }

      // Log backup to audit_log
      db.run(
        "INSERT INTO audit_log (action, entity_type, entity_id, payload) VALUES (?, ?, ?, ?)",
        ["admin_backup_db", "database", "sqlite", `Path: backups/backup-${timestamp}.sqlite`],
        (auditErr) => {
          if (auditErr) console.error("❌ Audit backup error:", auditErr.message);
          res.json({ success: true, message: `Backup created successfully at backups/backup-${timestamp}.sqlite` });
        }
      );
    });
  } else {
    fs.copyFile(DB_PATH, backupPath, (err) => {
      if (err) {
        return handleInternalError(res, err, "❌ Database backup failed:");
      }

      // Log backup to audit_log
      db.run(
        "INSERT INTO audit_log (action, entity_type, entity_id, payload) VALUES (?, ?, ?, ?)",
        ["admin_backup_db", "database", "sqlite", `Path: backups/backup-${timestamp}.sqlite`],
        (auditErr) => {
          if (auditErr) console.error("❌ Audit backup error:", auditErr.message);
          res.json({ success: true, message: `Backup created successfully at backups/backup-${timestamp}.sqlite` });
        }
      );
    });
  }
});

// GET partner branding info (Public)
app.get("/api/partner-logo", (req, res) => {
  db.get("SELECT value FROM app_meta WHERE key = 'partner_branding'", (err, row) => {
    if (err) {
      return res.status(500).json({ error: "Failed to retrieve partner branding" });
    }
    if (!row) {
      return res.json({ logo: "", link: "" });
    }
    try {
      const data = JSON.parse(row.value);
      res.json(data);
    } catch (e) {
      res.json({ logo: "", link: "" });
    }
  });
});

// POST update partner branding info (Superadmin only)
app.post("/api/partner-logo", authenticateToken, (req, res) => {
  if (req.user.role !== "superadmin") {
    return res.status(403).json({ error: "Access denied" });
  }
  const valueStr = JSON.stringify(req.body);

  db.run(
    `INSERT OR REPLACE INTO app_meta (key, value) VALUES ('partner_branding', ?)`,
    [valueStr],
    (err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to save partner branding" });
      }
      res.json({ success: true });
    }
  );
});
// Serve static files from the project root (Replit compatibility)
app.use(express.static(path.resolve(__dirname, "..")));

// Fallback all non-API GET requests to index.html for SPA routing (Replit compatibility)
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.resolve(__dirname, "..", "index.html"));
});

// ─── Graceful Shutdown ──────────────────────────────────
let httpServer;

function shutdown() {
  console.log("\n🛑 Shutting down...");
  if (httpServer) {
    httpServer.close(() => {
      console.log("⚡ HTTP server closed");
      db.close(() => {
        console.log("🗄️  Database connection closed");
        process.exit(0);
      });
    });
  } else {
    db.close(() => {
      console.log("🗄️  Database connection closed");
      process.exit(0);
    });
  }
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// ─── Start Server ───────────────────────────────────────
if (require.main === module) {
  httpServer = app.listen(PORT, () => {
    console.log(`\n🚀 Vax360 API running on http://localhost:${PORT}`);
    console.log(`   Environment: ${NODE_ENV}`);
    console.log(`   Database:    ${DB_PATH}\n`);
  });
}

module.exports = { app, db, shutdown, verifyTOTP, generateSecret, base32Decode, loginLimiter, registerLimiter, resetPasswordLimiter };
