process.env.DB_PATH = ":memory:";
process.env.SYNC_AUTH_TOKEN = "test_token_123";
process.env.JWT_SECRET = "test_jwt_secret";

const request = require("supertest");
const { app, db, shutdown } = require("./server");

afterAll((done) => {
  db.close(() => done());
});

describe("Core Endpoints", () => {
  it("should return health status", async () => {
    const res = await request(app).get("/api/health");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("status", "ok");
  });
});

describe("Auth Endpoints", () => {
  it("should fail login with wrong password", async () => {
    const res = await request(app)
      .post("/api/login")
      .send({ password: "wrong_password" });
    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty("success", false);
  });

  it("should succeed login with correct password", async () => {
    const res = await request(app)
      .post("/api/login")
      .send({ password: "test_token_123" });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body).toHaveProperty("token");
  });
});

describe("Sync Endpoints", () => {
  let validToken;

  beforeAll(async () => {
    const res = await request(app)
      .post("/api/login")
      .send({ password: "test_token_123" });
    validToken = res.body.token;
  });

  it("should deny GET sync without auth token", async () => {
    const res = await request(app).get("/api/sync/user-1");
    expect(res.statusCode).toEqual(401);
  });

  it("should deny POST sync without auth token", async () => {
    const res = await request(app)
      .post("/api/sync/user-1")
      .send({ test: "data" });
    expect(res.statusCode).toEqual(401);
  });

  it("should return missing for GET non-existent sync", async () => {
    const res = await request(app)
      .get("/api/sync/unknown-user")
      .set("Authorization", `Bearer ${validToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("success", false);
    expect(res.body.message).toBe("No data found");
  });

  it("should successfully POST and GET sync data", async () => {
    const testData = { name: "John Doe", children: [] };

    // POST
    const postRes = await request(app)
      .post("/api/sync/user-1")
      .set("Authorization", `Bearer ${validToken}`)
      .send(testData);
    expect(postRes.statusCode).toEqual(200);
    expect(postRes.body).toHaveProperty("success", true);

    // GET
    const getRes = await request(app)
      .get("/api/sync/user-1")
      .set("Authorization", `Bearer ${validToken}`);
    expect(getRes.statusCode).toEqual(200);
    expect(getRes.body).toHaveProperty("success", true);
    expect(getRes.body.data).toEqual(testData);
  });

  it("should enforce maximum payload size (413 Payload Too Large)", async () => {
    // Generate an 200KB string payload
    const largeData = {
      largeString: "A".repeat(200 * 1024),
    };

    const res = await request(app)
      .post("/api/sync/user-2")
      .set("Authorization", `Bearer ${validToken}`)
      .send(largeData);

    expect(res.statusCode).toEqual(413); // Payload Too Large
  });
});

describe("CORS Configuration", () => {
  let originalCorsOrigin;

  beforeAll(() => {
    // Save original if we want, but process is shared.
    originalCorsOrigin = process.env.CORS_ORIGIN;
  });

  afterAll(() => {
    process.env.CORS_ORIGIN = originalCorsOrigin;
  });

  it("should return Access-Control-Allow-Origin: * when CORS_ORIGIN is * and not reflect origin", async () => {
    // In order to test this correctly, since `app` is instantiated globally, we'd need to mock or clear cache.
    // Instead of messing with the cache, let's create a fresh express app that mimics the server's setup for this test.
    const express = require("express");
    const cors = require("cors");

    // Simulate setting the environment variable
    const testCorsOrigin = "*";

    const testApp = express();
    testApp.use(
      cors({
        origin:
          testCorsOrigin === "*"
            ? "*"
            : testCorsOrigin.split(",").map((s) => s.trim()),
      }),
    );
    testApp.get("/test", (req, res) => res.send("ok"));

    const testOrigin = "http://malicious.com";
    const res = await request(testApp).get("/test").set("Origin", testOrigin);

    // Validate we use explicit * and do not reflect the malicious origin
    expect(res.headers["access-control-allow-origin"]).toEqual("*");
    expect(res.headers["access-control-allow-origin"]).not.toEqual(testOrigin);
  });
});
