#!/usr/bin/env node
/**
 * Vax360 – Database Initialization Script
 * ────────────────────────────────────────
 * Run this script to create / reset the SQLite database.
 *
 *   node backend/db-init.js
 *
 * Environment variables (optional):
 *   DB_PATH  – Path to the SQLite file (default: ./database.sqlite)
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');
const { warnIfDefaultPassword } = require('./lib/superadmin-warning');
const { validateAdminPassword } = require('./lib/validate-admin-password');

// Load .env if dotenv is available
try { require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') }); } catch (_) { /* no dotenv */ }

/**
 * Run all table creation and migration steps against the given open db handle.
 * Does NOT close the database — the caller is responsible for closing it.
 *
 * Every database error is propagated immediately via callback(err); the migration
 * chain is halted so the caller can detect partial failures before serving traffic.
 *
 * @param {sqlite3.Database} db       An already-open sqlite3 Database instance.
 * @param {function}         callback Called with (err) when done. err is null on success.
 */
function initializeDatabase(db, callback) {
  // Reject weak or missing INITIAL_SUPERADMIN_PASSWORD in production before
  // touching the database.  This mirrors the same check in server.js so that
  // running db-init.js standalone (e.g. a migration step) also refuses weak
  // credentials.
  if (process.env.NODE_ENV === "production") {
    const _adminPassCheck = validateAdminPassword(process.env.INITIAL_SUPERADMIN_PASSWORD || "");
    if (!_adminPassCheck.valid) {
      const err = new Error(
        "FATAL: INITIAL_SUPERADMIN_PASSWORD does not meet strength requirements. " + _adminPassCheck.reason
      );
      console.error("❌ " + err.message);
      return callback(err);
    }
  }

  db.serialize(() => {
    // Step 1: Create store table
    db.run(`
      CREATE TABLE IF NOT EXISTS store (
        id          TEXT PRIMARY KEY,
        data        TEXT,
        updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (errStore) => {
      if (errStore) {
        console.error("  ❌ store creation failed:", errStore.message);
        return callback(errStore);
      }
      console.log('  ✔  Table "store" ready');

      // Step 2: Migrate store table
      db.all("PRAGMA table_info(store)", (errInfo, rows) => {
        if (errInfo) {
          console.error("  ❌ store PRAGMA failed:", errInfo.message);
          return callback(errInfo);
        }
        const hasUpdatedAt = rows && rows.some(r => r.name === "updated_at");
        const afterStoreMigration = () => {
          // Step 3: Create users table
          db.run(`
            CREATE TABLE IF NOT EXISTS users (
              whatsapp       TEXT PRIMARY KEY,
              name           TEXT NOT NULL,
              email          TEXT,
              password_hash  TEXT NOT NULL,
              salt           TEXT,
              role           TEXT NOT NULL DEFAULT 'parent',
              two_factor_secret  TEXT,
              two_factor_enabled INTEGER DEFAULT 0,
              created_at     DATETIME DEFAULT CURRENT_TIMESTAMP
            )
          `, (errUsers) => {
            if (errUsers) {
              console.error("  ❌ users creation failed:", errUsers.message);
              return callback(errUsers);
            }
            console.log('  ✔  Table "users" ready');

            // Step 4: Migrate users table
            db.all("PRAGMA table_info(users)", (errUserInfo, userRows) => {
              if (errUserInfo) {
                console.error("  ❌ users PRAGMA failed:", errUserInfo.message);
                return callback(errUserInfo);
              }

              const hasSalt             = userRows && userRows.some(r => r.name === "salt");
              const has2FASecret        = userRows && userRows.some(r => r.name === "two_factor_secret");
              const has2FAEnabled       = userRows && userRows.some(r => r.name === "two_factor_enabled");
              const hasCreatedAt        = userRows && userRows.some(r => r.name === "created_at");

              const afterUserMigrations = () => {
                // Step 5: Seed superadmin
                const superadminPassword = process.env.INITIAL_SUPERADMIN_PASSWORD || "Admin@123";

                db.get("SELECT password_hash, salt FROM users WHERE whatsapp = '9999'", (errAdmin, existingAdmin) => {
                  if (errAdmin) {
                    console.error("  ❌ superadmin lookup failed:", errAdmin.message);
                    return callback(errAdmin);
                  }

                  const afterSeed = () => {
                    // Step 6: Create audit_log table
                    db.run(`
                      CREATE TABLE IF NOT EXISTS audit_log (
                        id          INTEGER PRIMARY KEY AUTOINCREMENT,
                        action      TEXT NOT NULL,
                        entity_type TEXT,
                        entity_id   TEXT,
                        payload     TEXT,
                        created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
                      )
                    `, (errAudit) => {
                      if (errAudit) {
                        console.error("  ❌ audit_log creation failed:", errAudit.message);
                        return callback(errAudit);
                      }
                      console.log('  ✔  Table "audit_log" ready');

                      // Step 7: Create app_meta table
                      db.run(`
                        CREATE TABLE IF NOT EXISTS app_meta (
                          key   TEXT PRIMARY KEY,
                          value TEXT
                        )
                      `, (errMeta) => {
                        if (errMeta) {
                          console.error("  ❌ app_meta creation failed:", errMeta.message);
                          return callback(errMeta);
                        }
                        console.log('  ✔  Table "app_meta" ready');

                        // Step 8: Insert default metadata
                        db.run(`
                          INSERT OR IGNORE INTO app_meta (key, value)
                          VALUES ('db_version', '1.0.0'),
                                 ('created_at', datetime('now'))
                        `, [], (errMeta2) => {
                          if (errMeta2) {
                            console.error("  ❌ app_meta seed failed:", errMeta2.message);
                            return callback(errMeta2);
                          }
                          callback(null);
                        });
                      });
                    });
                  };

                  if (existingAdmin) {
                    // Warn if the stored hash still matches the default password.
                    // Note: warnIfDefaultPassword checks the stored hash directly,
                    // independent of INITIAL_SUPERADMIN_PASSWORD, so a custom env
                    // value cannot suppress a genuine alert on an unchanged account.
                    warnIfDefaultPassword(existingAdmin, superadminPassword);
                    afterSeed();
                  } else {
                    // Superadmin doesn't exist yet — seed with the configured password.
                    warnIfDefaultPassword(null, superadminPassword);
                    const superadminSalt = crypto.randomBytes(16).toString("hex");
                    const superadminHash = crypto
                      .pbkdf2Sync(superadminPassword, superadminSalt, 100000, 64, "sha512")
                      .toString("hex");
                    db.run(`
                      INSERT INTO users (whatsapp, name, email, password_hash, salt, role, created_at)
                      VALUES ('9999', 'Superadmin', 'admin@vax360.com', ?, ?, 'superadmin', datetime('now'))
                    `, [superadminHash, superadminSalt], (insertErr) => {
                      if (insertErr) {
                        console.error("  ❌ superadmin seed failed:", insertErr.message);
                        return callback(insertErr);
                      }
                      console.log('  ✔  Superadmin seeded');
                      afterSeed();
                    });
                  }
                });
              };

              // Run users migrations sequentially; halt chain on any error.
              const runUserMigrations = (idx) => {
                if (idx === 0) {
                  if (!hasSalt) {
                    db.run("ALTER TABLE users ADD COLUMN salt TEXT", (errAlter) => {
                      if (errAlter) {
                        console.error("  ❌ users migration failed (salt):", errAlter.message);
                        return callback(errAlter);
                      }
                      console.log('  ✔  Table "users" migrated (salt column added)');
                      runUserMigrations(1);
                    });
                  } else {
                    runUserMigrations(1);
                  }
                } else if (idx === 1) {
                  if (!has2FASecret) {
                    db.run("ALTER TABLE users ADD COLUMN two_factor_secret TEXT", (errAlter) => {
                      if (errAlter) {
                        console.error("  ❌ users migration failed (two_factor_secret):", errAlter.message);
                        return callback(errAlter);
                      }
                      console.log('  ✔  Table "users" migrated (two_factor_secret column added)');
                      runUserMigrations(2);
                    });
                  } else {
                    runUserMigrations(2);
                  }
                } else if (idx === 2) {
                  if (!has2FAEnabled) {
                    db.run("ALTER TABLE users ADD COLUMN two_factor_enabled INTEGER DEFAULT 0", (errAlter) => {
                      if (errAlter) {
                        console.error("  ❌ users migration failed (two_factor_enabled):", errAlter.message);
                        return callback(errAlter);
                      }
                      console.log('  ✔  Table "users" migrated (two_factor_enabled column added)');
                      runUserMigrations(3);
                    });
                  } else {
                    runUserMigrations(3);
                  }
                } else if (idx === 3) {
                  if (!hasCreatedAt) {
                    db.run("ALTER TABLE users ADD COLUMN created_at DATETIME DEFAULT NULL", (errAlter) => {
                      if (errAlter) {
                        console.error("  ❌ users migration failed (created_at):", errAlter.message);
                        return callback(errAlter);
                      }
                      // Backfill existing rows with the current timestamp
                      db.run("UPDATE users SET created_at = datetime('now') WHERE created_at IS NULL", (errBackfill) => {
                        if (errBackfill) {
                          console.error("  ❌ users backfill failed (created_at):", errBackfill.message);
                          return callback(errBackfill);
                        }
                        console.log('  ✔  Table "users" migrated (created_at column added and backfilled)');
                        afterUserMigrations();
                      });
                    });
                  } else {
                    afterUserMigrations();
                  }
                }
              };
              runUserMigrations(0);
            });
          });
        };

        if (!hasUpdatedAt) {
          db.run("ALTER TABLE store ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP", (errAlter) => {
            if (errAlter) {
              console.error("  ❌ store migration failed:", errAlter.message);
              return callback(errAlter);
            }
            console.log('  ✔  Table "store" migrated (updated_at column added)');
            afterStoreMigration();
          });
        } else {
          afterStoreMigration();
        }
      });
    });
  });
}

// ─── CLI entry point ─────────────────────────────────────
if (require.main === module) {
  const DB_PATH = process.env.DB_PATH
    ? path.resolve(process.env.DB_PATH)
    : path.resolve(__dirname, 'database.sqlite');

  console.log(`\n🗄️  Initializing database at: ${DB_PATH}\n`);

  const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('❌ Failed to open database:', err.message);
      process.exit(1);
    }
  });

  initializeDatabase(db, (err) => {
    db.close((errClose) => {
      if (errClose) {
        console.error('❌ Error closing database:', errClose.message);
        process.exit(1);
      }
      if (err) {
        console.error('❌ Database initialization failed:', err.message);
        process.exit(1);
      }
      console.log('\n✅ Database initialized successfully!\n');
    });
  });
}

module.exports = { initializeDatabase };
