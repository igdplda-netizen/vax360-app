const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Load environment variables from .env file (if dotenv is available)
try { require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') }); } catch (_) { /* dotenv not installed — using defaults */ }

const app = express();

// ─── Configuration (from environment) ───────────────────
const PORT       = process.env.PORT       || 5000;
const NODE_ENV   = process.env.NODE_ENV   || 'development';
const DB_PATH    = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.resolve(__dirname, 'database.sqlite');
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
const SYNC_AUTH_TOKEN = process.env.SYNC_AUTH_TOKEN;

// ─── Middleware ─────────────────────────────────────────
app.use(cors({
  origin: CORS_ORIGIN === '*' ? true : CORS_ORIGIN.split(',').map(s => s.trim()),
}));
app.use(bodyParser.json({ limit: '10mb' }));

// ─── Database Setup (SQLite) ────────────────────────────
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Error connecting to database:', err.message);
    process.exit(1);
  }
  console.log(`✅ Connected to SQLite database at ${DB_PATH}`);

  // Auto-create tables on first run
  db.run(`CREATE TABLE IF NOT EXISTS store (
    id          TEXT PRIMARY KEY,
    data        TEXT,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

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
});

// ─── Health Check ───────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', env: NODE_ENV, uptime: process.uptime() });
});

// ─── Authentication Middleware ──────────────────────────
const authenticateSync = (req, res, next) => {
  if (!SYNC_AUTH_TOKEN) {
    console.error('❌ SECURITY WARNING: SYNC_AUTH_TOKEN is not set in the environment.');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  if (token !== SYNC_AUTH_TOKEN) {
    return res.status(403).json({ error: 'Forbidden: Invalid sync token' });
  }
  next();
};

// ─── API Routes ─────────────────────────────────────────
// GET sync data by ID
app.get('/api/sync/:id', authenticateSync, (req, res) => {
  const id = req.params.id;
  db.get('SELECT data FROM store WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (row) {
      res.json({ success: true, data: JSON.parse(row.data) });
    } else {
      res.json({ success: false, message: 'No data found' });
    }
  });
});

// POST sync data by ID
app.post('/api/sync/:id', authenticateSync, (req, res) => {
  const id = req.params.id;
  const data = JSON.stringify(req.body);

  db.run(
    `INSERT INTO store (id, data, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP`,
    [id, data],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, message: 'Data saved to database' });
    }
  );
});

// ─── Graceful Shutdown ──────────────────────────────────
function shutdown() {
  console.log('\n🛑 Shutting down...');
  db.close(() => {
    console.log('🗄️  Database connection closed');
    process.exit(0);
  });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// ─── Start Server ───────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Vax360 API running on http://localhost:${PORT}`);
  console.log(`   Environment: ${NODE_ENV}`);
  console.log(`   Database:    ${DB_PATH}\n`);
});
