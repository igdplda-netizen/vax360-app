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

function logResult(tableName) {
  return function (err) {
    if (err) {
      console.error(`  ❌ ${tableName}: ${err.message}`);
    } else {
      console.log(`  ✔  Table "${tableName}" ready`);
    }
  };
}

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

  db.serialize(() => {
    // ── Main key-value store (used by frontend sync) ──
    db.run(`
      CREATE TABLE IF NOT EXISTS store (
        id          TEXT PRIMARY KEY,
        data        TEXT,
        updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, logResult('store'));

    // ── Audit log (optional – for tracking changes) ──
    db.run(`
      CREATE TABLE IF NOT EXISTS audit_log (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        action      TEXT NOT NULL,
        entity_type TEXT,
        entity_id   TEXT,
        payload     TEXT,
        created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, logResult('audit_log'));

    // ── App metadata ──
    db.run(`
      CREATE TABLE IF NOT EXISTS app_meta (
        key   TEXT PRIMARY KEY,
        value TEXT
      )
    `, logResult('app_meta'));

    // Insert default metadata
    db.run(`
      INSERT OR IGNORE INTO app_meta (key, value)
      VALUES ('db_version', '1.0.0'),
             ('created_at', datetime('now'))
    `);
  });

  db.close((err) => {
    if (err) {
      console.error('❌ Error closing database:', err.message);
      process.exit(1);
    }
    console.log('\n✅ Database initialized successfully!\n');
  });
}

module.exports = { logResult };
