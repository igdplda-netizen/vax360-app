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

// Load .env if dotenv is available
try { require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') }); } catch (_) { /* no dotenv */ }

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

db.serialize(() => {
  // Step 1: Create store table
  db.run(`
    CREATE TABLE IF NOT EXISTS store (
      id          TEXT PRIMARY KEY,
      data        TEXT,
      updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (errStore) => {
    if (errStore) console.error("  ❌ store creation failed:", errStore.message);
    else console.log('  ✔  Table "store" ready');

    // Step 2: Migrate store table
    db.all("PRAGMA table_info(store)", (errInfo, rows) => {
      const hasUpdatedAt = !errInfo && rows && rows.some(r => r.name === "updated_at");
      const next1 = () => {
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
            two_factor_enabled INTEGER DEFAULT 0
          )
        `, (errUsers) => {
          if (errUsers) console.error("  ❌ users creation failed:", errUsers.message);
          else console.log('  ✔  Table "users" ready');

          // Step 4: Migrate users table
          db.all("PRAGMA table_info(users)", (errUserInfo, userRows) => {
            const hasSalt = !errUserInfo && userRows && userRows.some(r => r.name === "salt");
            const next2 = () => {
              // Step 5: Seed superadmin
              const crypto = require('crypto');
              const superadminSalt = crypto.randomBytes(16).toString("hex");
              const superadminHash = crypto.pbkdf2Sync("Admin@123", superadminSalt, 100000, 64, "sha512").toString("hex");
              db.run(`
                INSERT OR IGNORE INTO users (whatsapp, name, email, password_hash, salt, role)
                VALUES ('9999', 'Superadmin', 'admin@vax360.com', ?, ?, 'superadmin')
              `, [superadminHash, superadminSalt], () => {

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
                  if (errAudit) console.error("  ❌ audit_log creation failed:", errAudit.message);
                  else console.log('  ✔  Table "audit_log" ready');

                  // Step 7: Create app_meta table
                  db.run(`
                    CREATE TABLE IF NOT EXISTS app_meta (
                      key   TEXT PRIMARY KEY,
                      value TEXT
                    )
                  `, (errMeta) => {
                    if (errMeta) console.error("  ❌ app_meta creation failed:", errMeta.message);
                    else console.log('  ✔  Table "app_meta" ready');

                    // Step 8: Insert default metadata
                    db.run(`
                      INSERT OR IGNORE INTO app_meta (key, value)
                      VALUES ('db_version', '1.0.0'),
                             ('created_at', datetime('now'))
                    `, [], () => {
                      
                      // Step 9: Close database
                      db.close((errClose) => {
                        if (errClose) {
                          console.error('❌ Error closing database:', errClose.message);
                          process.exit(1);
                        }
                        console.log('\n✅ Database initialized successfully!\n');
                      });
                    });
                  });
                });
              });
            };

            const runMigrations = (idx) => {
              if (idx === 0) {
                if (!hasSalt) {
                  db.run("ALTER TABLE users ADD COLUMN salt TEXT", (errAlter) => {
                    if (errAlter) console.error("  ❌ users migration failed (salt):", errAlter.message);
                    else console.log('  ✔  Table "users" migrated (salt column added)');
                    runMigrations(1);
                  });
                } else {
                  runMigrations(1);
                }
              } else if (idx === 1) {
                const has2FASecret = !errUserInfo && userRows && userRows.some(r => r.name === "two_factor_secret");
                if (!has2FASecret) {
                  db.run("ALTER TABLE users ADD COLUMN two_factor_secret TEXT", (errAlter) => {
                    if (errAlter) console.error("  ❌ users migration failed (two_factor_secret):", errAlter.message);
                    else console.log('  ✔  Table "users" migrated (two_factor_secret column added)');
                    runMigrations(2);
                  });
                } else {
                  runMigrations(2);
                }
              } else if (idx === 2) {
                const has2FAEnabled = !errUserInfo && userRows && userRows.some(r => r.name === "two_factor_enabled");
                if (!has2FAEnabled) {
                  db.run("ALTER TABLE users ADD COLUMN two_factor_enabled INTEGER DEFAULT 0", (errAlter) => {
                    if (errAlter) console.error("  ❌ users migration failed (two_factor_enabled):", errAlter.message);
                    else console.log('  ✔  Table "users" migrated (two_factor_enabled column added)');
                    next2();
                  });
                } else {
                  next2();
                }
              }
            };
            runMigrations(0);
          });
        });
      };

      if (!hasUpdatedAt) {
        db.run("ALTER TABLE store ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP", (errAlter) => {
          if (errAlter) console.error("  ❌ store migration failed:", errAlter.message);
          else console.log('  ✔  Table "store" migrated (updated_at column added)');
          next1();
        });
      } else {
        next1();
      }
    });
  });
});
