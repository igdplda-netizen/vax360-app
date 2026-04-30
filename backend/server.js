const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const jwt = require('jsonwebtoken');

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
const JWT_SECRET  = process.env.JWT_SECRET || 'fallback_secret';
const SYNC_PASSWORD = process.env.SYNC_PASSWORD || '12345';

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

// ─── API Routes ─────────────────────────────────────────

// ─── Authentication Middleware ──────────────────────────
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) return res.status(401).json({ error: 'Token missing' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

// ─── Auth Route ─────────────────────────────────────────
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  if (password === SYNC_PASSWORD) {
    const token = jwt.sign({ role: 'sync_client' }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token });
  } else {
    res.status(401).json({ success: false, message: 'Invalid password' });
  }
});

// GET sync data by ID
app.get('/api/sync/:id', authenticateToken, (req, res) => {
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
app.post('/api/sync/:id', authenticateToken, (req, res) => {
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
function shutdown(cb) {
  console.log('\n🛑 Shutting down...');
  db.close(() => {
    console.log('🗄️  Database connection closed');
    if (cb && typeof cb === 'function') {
      cb();
    } else {
      process.exit(0);
    }
  });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// ─── Start Server ───────────────────────────────────────
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n🚀 Vax360 API running on http://localhost:${PORT}`);
    console.log(`   Environment: ${NODE_ENV}`);
    console.log(`   Database:    ${DB_PATH}\n`);
  });
}

module.exports = { app, shutdown };
