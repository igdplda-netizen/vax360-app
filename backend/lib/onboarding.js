const DEFAULT_CONFIG = { enabled: true, steps: [] };
const languages = ["pt", "en", "fr", "af"];
const limits = { eyebrow: 100, title: 160, body: 800, note: 240 };

function validateConfig(input) {
  if (!input || typeof input.enabled !== "boolean" || !Array.isArray(input.steps) || input.steps.length > 3) {
    throw new Error("Defina a apresentação inicial e um máximo de três passos.");
  }
  const steps = input.steps.map(step => {
    if (!step || typeof step !== "object" || Array.isArray(step) || !step.pt) {
      throw new Error("Cada passo precisa de textos em português.");
    }
    const result = {};
    for (const lang of languages) {
      if (step[lang] === undefined) continue;
      const text = step[lang];
      if (!text || typeof text !== "object") throw new Error("Textos inválidos.");
      result[lang] = {};
      for (const [field, max] of Object.entries(limits)) {
        if (typeof text[field] !== "string" || text[field].trim().length > max) {
          throw new Error(`Texto inválido ou demasiado longo: ${field}.`);
        }
        result[lang][field] = text[field].trim();
      }
      if (!result[lang].title || !result[lang].body) {
        throw new Error("O título e a descrição são obrigatórios.");
      }
    }
    return result;
  });
  return { enabled: input.enabled, steps };
}

function registerOnboardingRoutes(app, db, authenticateToken) {
  app.get("/api/onboarding", (req, res) => {
    res.set("Cache-Control", "no-store");
    db.get("SELECT value FROM app_meta WHERE key = 'onboarding'", (err, row) => {
      if (err) return res.status(500).json({ error: "Não foi possível carregar a apresentação." });
      try {
        res.json(row ? validateConfig(JSON.parse(row.value)) : DEFAULT_CONFIG);
      } catch {
        res.status(500).json({ error: "A configuração da apresentação é inválida." });
      }
    });
  });
  app.put("/api/admin/onboarding", authenticateToken, (req, res) => {
    if (!["admin", "superadmin"].includes(req.user.role)) {
      return res.status(403).json({ error: "Apenas administradores podem gerir a apresentação." });
    }
    let config;
    try { config = validateConfig(req.body); }
    catch (err) { return res.status(400).json({ error: err.message }); }
    db.run("INSERT OR REPLACE INTO app_meta (key, value) VALUES ('onboarding', ?)", [JSON.stringify(config)], err => {
      if (err) return res.status(500).json({ error: "Não foi possível guardar a apresentação." });
      db.run("INSERT INTO audit_log (action, entity_type, entity_id, payload) VALUES (?, ?, ?, ?)",
        ["admin_update_onboarding", "app_meta", "onboarding", `Updated by: ${req.user.whatsapp}`],
        auditErr => { if (auditErr) console.error("Onboarding audit failed:", auditErr.message); });
      res.json(config);
    });
  });
}
module.exports = { registerOnboardingRoutes, validateConfig };
