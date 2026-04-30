const request = require('supertest');
const path = require('path');
const os = require('os');
const fs = require('fs');

// Set an in-memory database path BEFORE requiring server.js
process.env.DB_PATH = ':memory:';

const { app, db } = require('./server');

describe('GET /api/sync/:id', () => {
  beforeAll(async () => {
    // Wait for the table to be created by pinging it until it exists
    for (let i = 0; i < 20; i++) {
      try {
        const result = await new Promise((resolve, reject) => {
          db.get('SELECT name FROM sqlite_master WHERE type="table" AND name="store"', (err, row) => {
            if (err) return reject(err);
            resolve(row);
          });
        });
        if (result) return;
      } catch (err) {
        // Ignore and retry
      }
      await new Promise(r => setTimeout(r, 50));
    }
  });

  afterAll((done) => {
    // Close the database connection
    db.close((err) => {
      if (err) console.error(err);
      done();
    });
  });

  beforeEach((done) => {
    // Clear out the store table before each test
    db.run('DELETE FROM store', done);
  });

  it('should return data successfully if ID exists', async () => {
    const testId = 'user123';
    const testData = { name: 'Test User', vaccines: [] };

    // Insert test data
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO store (id, data) VALUES (?, ?)',
        [testId, JSON.stringify(testData)],
        function(err) {
          if (err) return reject(err);
          resolve();
        }
      );
    });

    const response = await request(app).get(`/api/sync/${testId}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: testData,
    });
  });

  it('should return no data found if ID does not exist', async () => {
    const response = await request(app).get('/api/sync/nonexistent');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: false,
      message: 'No data found',
    });
  });

  it('should return 500 if there is a database error', async () => {
    // Mock the db.get method to simulate an error
    const originalGet = db.get.bind(db);
    db.get = jest.fn((sql, params, callback) => {
      callback(new Error('Simulated database error'), null);
    });

    const response = await request(app).get('/api/sync/error123');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: 'Simulated database error',
    });

    // Restore the original method
    db.get = originalGet;
  });
});
