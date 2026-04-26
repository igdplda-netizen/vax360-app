const request = require('supertest');
const { app, shutdown } = require('../server');

describe('Health Check Endpoint (/api/health)', () => {
  afterAll((done) => {
    shutdown(done);
  });

  it('should return a 200 OK status and correct JSON structure', async () => {
    const response = await request(app).get('/api/health');

    // Assert status code
    expect(response.status).toBe(200);

    // Assert response body
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('env');
    expect(typeof response.body.env).toBe('string');
    expect(response.body).toHaveProperty('uptime');
    expect(typeof response.body.uptime).toBe('number');
  });
});
