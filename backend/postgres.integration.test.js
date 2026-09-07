/**
 * Managed PostgreSQL integration coverage.
 *
 * This suite runs only where Replit supplies DATABASE_URL. It verifies the
 * real schema initializer and the production database adapter through the
 * public register/login/sync API journey. The temporary user is always
 * removed afterward.
 */

const hasPostgres = Boolean(process.env.DATABASE_URL);
const describePostgres = hasPostgres ? describe : describe.skip;

describePostgres('managed PostgreSQL persistence', () => {
  let app;
  let db;
  const id = `pg-integration-${process.pid}`;
  const password = 'Persist123';

  const run = (sql, params = []) =>
    new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve(this);
      });
    });

  beforeAll(async () => {
    delete process.env.DB_PATH;
    process.env.DB_DRIVER = 'postgres';

    const { openDatabase } = require('./lib/db');
    const { initializeDatabase } = require('./db-init');
    const initDb = openDatabase('', () => {});

    await new Promise((resolve, reject) => {
      initializeDatabase(initDb, (err) => (err ? reject(err) : resolve()));
    });
    await new Promise((resolve, reject) => {
      initDb.close((err) => (err ? reject(err) : resolve()));
    });

    ({ app, db } = require('./server'));
    await new Promise((resolve) => setTimeout(resolve, 200));
    await run('DELETE FROM store WHERE id = ?', [id]);
    await run('DELETE FROM users WHERE whatsapp = ?', [id]);
  }, 15000);

  afterAll(async () => {
    if (!db) return;
    await run('DELETE FROM store WHERE id = ?', [id]);
    await run('DELETE FROM users WHERE whatsapp = ?', [id]);
    await new Promise((resolve, reject) => {
      db.close((err) => (err ? reject(err) : resolve()));
    });
  });

  test('persists registration and authenticated sync data', async () => {
    const request = require('supertest');

    const registration = await request(app)
      .post('/api/register')
      .send({ name: 'PostgreSQL Integration', whatsapp: id, password });
    expect(registration.statusCode).toBe(200);

    const login = await request(app)
      .post('/api/login')
      .send({ whatsapp: id, password });
    expect(login.statusCode).toBe(200);
    expect(login.body.token).toBeTruthy();

    const payload = { children: [{ id: 'persisted-child' }], vaccines: [] };
    const write = await request(app)
      .post(`/api/sync/${id}`)
      .set('Authorization', `Bearer ${login.body.token}`)
      .send(payload);
    expect(write.statusCode).toBe(200);

    const read = await request(app)
      .get(`/api/sync/${id}`)
      .set('Authorization', `Bearer ${login.body.token}`);
    expect(read.statusCode).toBe(200);
    expect(read.body.data).toEqual(payload);
  }, 15000);
});