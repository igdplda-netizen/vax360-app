const express = require("express");
const request = require("supertest");
const sqlite3 = require("sqlite3");
const { registerOnboardingRoutes, validateConfig } = require("./onboarding");

const text = { eyebrow: "Bem-vindo", title: "Conheça as vacinas", body: "Explore sem conta.", note: "Comece agora." };
const config = { enabled: true, steps: [{ pt: text }] };
let db;
let app;
beforeAll(done => {
  db = new sqlite3.Database(":memory:");
  db.exec("CREATE TABLE app_meta (key TEXT PRIMARY KEY, value TEXT); CREATE TABLE audit_log (action TEXT, entity_type TEXT, entity_id TEXT, payload TEXT);", done);
  app = express();
  app.use(express.json());
  // Controlled authenticated identity; production uses the existing database-verified JWT middleware.
  registerOnboardingRoutes(app, db, (req, res, next) => {
    const role = req.headers["x-test-role"];
    if (!role) return res.sendStatus(401);
    req.user = { role, whatsapp: "test-admin" };
    next();
  });
});
afterAll(done => { db.close(done); });

test("public visitors receive built-in defaults without authentication", async () => {
  const res = await request(app).get("/api/onboarding");
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ enabled: true, steps: [] });
  expect(res.headers["cache-control"]).toBe("no-store");
});
test.each([undefined, "parent"])("blocks onboarding writes for %s", async role => {
  let req = request(app).put("/api/admin/onboarding").send(config);
  if (role) req = req.set("x-test-role", role);
  expect((await req).status).toBe(role ? 403 : 401);
});
test.each(["admin", "superadmin"])("%s can save and public visitors see persisted content", async role => {
  const saved = await request(app).put("/api/admin/onboarding").set("x-test-role", role).send(config);
  expect(saved.status).toBe(200);
  expect((await request(app).get("/api/onboarding")).body).toEqual(config);
});
test("disabling and restoring defaults persist", async () => {
  const disabled = { enabled: false, steps: [] };
  expect((await request(app).put("/api/admin/onboarding").set("x-test-role", "admin").send(disabled)).status).toBe(200);
  expect((await request(app).get("/api/onboarding")).body).toEqual(disabled);
});
test("rejects more than three steps, missing Portuguese and incomplete text", () => {
  expect(() => validateConfig({ ...config, steps: Array(4).fill(config.steps[0]) })).toThrow();
  expect(() => validateConfig({ ...config, steps: [{ en: text }] })).toThrow();
  expect(() => validateConfig({ ...config, steps: [{ pt: { ...text, title: " " } }] })).toThrow();
  expect(() => validateConfig({ ...config, enabled: "yes" })).toThrow();
});
test("rejects oversized fields and accepts multilingual content", () => {
  expect(() => validateConfig({ ...config, steps: [{ pt: { ...text, body: "a".repeat(801) } }] })).toThrow();
  expect(validateConfig({ ...config, steps: [{ pt: text, en: text }] }).steps[0].en).toEqual(text);
});
test("normalizes whitespace and strips unknown fields", () => {
  expect(validateConfig({ ...config, unexpected: true, steps: [{ pt: { ...text, title: "  Saúde  ", extra: "discard" } }] }))
    .toEqual({ enabled: true, steps: [{ pt: { ...text, title: "Saúde" } }] });
});
test("invalid saves do not overwrite published content", async () => {
  const bad = await request(app).put("/api/admin/onboarding").set("x-test-role", "admin").send({ ...config, steps: Array(4).fill(config.steps[0]) });
  expect(bad.status).toBe(400);
  expect((await request(app).get("/api/onboarding")).body).toEqual({ enabled: false, steps: [] });
});
