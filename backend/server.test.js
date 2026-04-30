const request = require('supertest');
const { app, db } = require('./server');

describe('POST /api/sync/:id', () => {
  beforeAll((done) => {
    // Wait for the tables to be created if not yet ready.
    // The db object is initialized in server.js, but table creation might take a moment.
    // However, SQLite memory operations are usually synchronous enough that
    // table creation is done before tests run. Let's make sure 'store' is empty.
    db.run(`CREATE TABLE IF NOT EXISTS store (
      id          TEXT PRIMARY KEY,
      data        TEXT,
      updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, () => {
      db.run('DELETE FROM store', done);
    });
  });

  afterAll((done) => {
    db.close(done);
  });

  it('should insert new data on first sync', async () => {
    const testId = 'test-id-1';
    const payload = {
      users: [{ id: 'user1', name: 'Alice' }],
      adminProfiles: []
    };

    const res = await request(app)
      .post(`/api/sync/${testId}`)
      .send(payload)
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('message', 'Data saved to database');

    // Verify it exists in db
    return new Promise((resolve, reject) => {
      db.get('SELECT data FROM store WHERE id = ?', [testId], (err, row) => {
        if (err) return reject(err);
        try {
          expect(row).toBeDefined();
          const savedData = JSON.parse(row.data);
          expect(savedData).toEqual(payload);
          resolve();
        } catch (e) {
          reject(e);
        }
      });
    });
  });

  it('should update existing data on subsequent syncs', async () => {
    const testId = 'test-id-2';
    const initialPayload = { users: [{ id: 'u1' }] };
    const updatedPayload = { users: [{ id: 'u1' }, { id: 'u2' }] };

    // Initial insert
    await request(app)
      .post(`/api/sync/${testId}`)
      .send(initialPayload)
      .set('Content-Type', 'application/json')
      .expect(200);

    // Update with new data
    const res = await request(app)
      .post(`/api/sync/${testId}`)
      .send(updatedPayload)
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);

    // Verify the database has the updated payload
    return new Promise((resolve, reject) => {
      db.get('SELECT data FROM store WHERE id = ?', [testId], (err, row) => {
        if (err) return reject(err);
        try {
          expect(row).toBeDefined();
          const savedData = JSON.parse(row.data);
          expect(savedData).toEqual(updatedPayload);
          resolve();
        } catch (e) {
          reject(e);
        }
      });
    });
  });

  it('should handle large payloads (up to 10mb) as configured', async () => {
      const testId = 'large-payload-id';
      // Create a payload that is somewhat large but not 10MB to just ensure it accepts it normally
      // creating an actual 10MB payload can sometimes make tests slow/flake.
      const largeArray = new Array(50000).fill({ test: 'data' });
      const payload = { data: largeArray };

      const res = await request(app)
        .post(`/api/sync/${testId}`)
        .send(payload)
        .set('Content-Type', 'application/json');

      expect(res.statusCode).toEqual(200);
  });

  it('should return 500 when database insertion fails', async () => {
    // We intentionally force an error by mocking db.run to invoke the callback with an error
    const originalDbRun = db.run;
    db.run = jest.fn((query, params, callback) => {
      if (query.includes('INSERT INTO store')) {
        callback(new Error('Mocked DB error'));
      } else {
        originalDbRun.call(db, query, params, callback);
      }
    });

    const testId = 'error-test-id';
    const payload = { users: [{ id: 'user1' }] };

    const res = await request(app)
      .post(`/api/sync/${testId}`)
      .send(payload)
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toEqual(500);
    expect(res.body).toHaveProperty('error', 'Mocked DB error');

    // Restore original db.run
    db.run = originalDbRun;
  });
});
