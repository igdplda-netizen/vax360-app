const { translateSql, usingPostgres } = require('./db');

describe('database driver selection', () => {
  const original = { ...process.env };

  afterEach(() => {
    process.env = { ...original };
  });

  test('production uses PostgreSQL when DATABASE_URL is available', () => {
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_URL = 'postgres://example.invalid/db';
    process.env.DB_PATH = './database.sqlite';
    expect(usingPostgres()).toBe(true);
  });

  test('production cannot be overridden back to SQLite', () => {
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_URL = 'postgres://example.invalid/db';
    process.env.DB_DRIVER = 'sqlite';
    process.env.DB_PATH = ':memory:';
    expect(usingPostgres()).toBe(true);
  });

  test('in-memory tests always use SQLite', () => {
    process.env.NODE_ENV = 'test';
    process.env.DATABASE_URL = 'postgres://example.invalid/db';
    process.env.DB_PATH = ':memory:';
    expect(usingPostgres()).toBe(false);
  });

  test('development may explicitly select PostgreSQL', () => {
    process.env.NODE_ENV = 'development';
    process.env.DATABASE_URL = 'postgres://example.invalid/db';
    process.env.DB_DRIVER = 'postgres';
    process.env.DB_PATH = './database.sqlite';
    expect(usingPostgres()).toBe(true);
  });
});

describe('SQLite-to-PostgreSQL SQL translation', () => {
  test('converts placeholders without changing question marks inside strings', () => {
    expect(translateSql("SELECT '?' AS literal, value FROM app_meta WHERE key = ?").sql)
      .toBe("SELECT '?' AS literal, value FROM app_meta WHERE key = $1");
  });

  test('converts INSERT OR IGNORE to an idempotent insert', () => {
    expect(translateSql("INSERT OR IGNORE INTO store (id, data) VALUES (?, ?)").sql)
      .toBe("INSERT INTO store (id, data) VALUES ($1, $2) ON CONFLICT DO NOTHING");
  });

  test('converts INSERT OR REPLACE to an upsert', () => {
    expect(translateSql("INSERT OR REPLACE INTO app_meta (key, value) VALUES ('partner_branding', ?)").sql)
      .toBe(
        "INSERT INTO app_meta (key, value) VALUES ('partner_branding', $1) " +
        "ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value"
      );
  });

  test('converts SQLite DDL types and datetime function', () => {
    const sql = translateSql(
      "CREATE TABLE audit_log (id INTEGER PRIMARY KEY AUTOINCREMENT, created_at DATETIME DEFAULT datetime('now'))"
    ).sql;
    expect(sql).toContain('id BIGSERIAL PRIMARY KEY');
    expect(sql).toContain('created_at TIMESTAMPTZ DEFAULT now()');
  });

  test('converts PRAGMA table_info to information_schema', () => {
    const sql = translateSql('PRAGMA table_info(users)').sql;
    expect(sql).toContain('information_schema.columns');
    expect(sql).toContain("table_name = 'users'");
    expect(sql).toContain('column_name AS name');
  });
});