// Manual mocks for globals to allow requiring app.js in Node environment
if (typeof window === "undefined") {
  global.window = {
    addEventListener: () => {},
    location: { hash: "" },
  };
}
if (typeof localStorage === "undefined") {
  global.localStorage = {
    getItem: () => null,
    setItem: () => {},
  };
}
if (typeof document === "undefined") {
  global.document = {
    addEventListener: () => {},
    getElementById: () => ({
      addEventListener: () => {},
      classList: { add: () => {}, remove: () => {}, contains: () => false },
      appendChild: () => {},
      querySelector: () => null,
      querySelectorAll: () => [],
    }),
    querySelectorAll: () => [],
    querySelector: () => null,
    createElement: () => ({ setAttribute: () => {}, style: {} }),
    documentElement: { lang: "en" },
  };
}
if (typeof navigator === "undefined") {
  global.navigator = {
    language: "en-US",
    serviceWorker: { register: () => Promise.resolve() },
  };
}

if (typeof CryptoJS === "undefined") {
  const crypto = require("crypto");
  global.CryptoJS = {
    SHA256: (msg) => {
      const hash = crypto.createHash("sha256").update(msg).digest("hex");
      return {
        toString: () => hash,
      };
    },
  };
}

const { schedDate } = require("./app.js");

describe("schedDate", () => {
  beforeAll(() => {
    process.env.TZ = "UTC";
  });

  test("adds 0 months correctly", () => {
    expect(schedDate("2023-01-01", 0)).toBe("2023-01-01");
  });

  test("adds positive months correctly", () => {
    expect(schedDate("2023-01-01", 2)).toBe("2023-03-01");
  });

  test("crosses year boundaries", () => {
    expect(schedDate("2023-11-01", 3)).toBe("2024-02-01");
  });

  test("handles end of month (Jan 31 + 1 month)", () => {
    // JS Date behavior: Jan 31 + 1 month -> Mar 3 (2023 is not a leap year, but Feb 31 overflows to March)
    expect(schedDate("2023-01-31", 1)).toBe("2023-03-03");
  });

  test("handles leap years (Feb 29)", () => {
    expect(schedDate("2024-02-29", 12)).toBe("2025-03-01");
  });

  test("adds many months", () => {
    expect(schedDate("2023-01-01", 24)).toBe("2025-01-01");
  });
});

describe("Utility Functions", () => {
  let esc, t, S, app;

  beforeEach(() => {
    jest.resetModules();
    app = require("./app.js");
    esc = app.esc;
    t = app.t;
    S = app.S;
  });

  describe("esc()", () => {
    test("escapes HTML characters to prevent XSS", () => {
      expect(esc('<script>alert("XSS")</script>')).toBe(
        "&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;",
      );
      expect(esc('John & Doe\'s "Custom" <Vaccine>')).toBe(
        "John &amp; Doe&#039;s &quot;Custom&quot; &lt;Vaccine&gt;",
      );
    });

    test("handles null or undefined input", () => {
      expect(esc(null)).toBe("");
      expect(esc(undefined)).toBe("");
    });

    test("handles numbers and converts them to string safely", () => {
      expect(esc(123)).toBe("123");
      expect(esc(0)).toBe("0");
    });
  });

  describe("t()", () => {
    test("returns key if S or S.lang is undefined or not found", () => {
      expect(t("non_existent_key")).toBe("non_existent_key");
    });

    test("returns English localization by default", () => {
      app.currentLang = "en";
      expect(t("settings")).toBe("Settings");
    });

    test("returns other localizations correctly", () => {
      app.currentLang = "pt";
      expect(t("settings")).toBe("Configurações");

      app.currentLang = "fr";
      expect(t("settings")).toBe("Paramètres");
    });
  });
});

describe("Cache Logic (getVaccineBaseType)", () => {
  let getVaccineBaseType, app;

  beforeEach(() => {
    jest.resetModules();
    app = require("./app.js");
    getVaccineBaseType = app.getVaccineBaseType;

    // Clear the cache manually just in case
    if (app.VACCINE_BASE_TYPE_CACHE) {
      app.VACCINE_BASE_TYPE_CACHE.clear();
    }
  });

  test("should return base vaccine ID for a custom vaccine", () => {
    // Need to setup custom vaccines map first
    if (!app.CUSTOM_VACCINES_MAP) {
      app.CUSTOM_VACCINES_MAP = new Map();
    }
    app.CUSTOM_VACCINES_MAP.set("custom-123", {
      id: "custom-123",
      baseVaccineId: "bcg",
    });

    expect(getVaccineBaseType("custom-123")).toBe("custom");
  });

  test("should return base vaccine ID for standard vaccine directly", () => {
    expect(getVaccineBaseType("bcg")).toBe("bcg");
    expect(getVaccineBaseType("polio_1")).toBe("polio_1");
  });

  test("should cache the result", () => {
    if (!app.CUSTOM_VACCINES_MAP) {
      app.CUSTOM_VACCINES_MAP = new Map();
    }
    app.CUSTOM_VACCINES_MAP.set("custom-456", {
      id: "custom-456",
      baseVaccineId: "dtp_1",
    });

    expect(getVaccineBaseType("custom-456")).toBe("custom");

    // Even if we remove it from the map, it should still be in the cache
    app.CUSTOM_VACCINES_MAP.delete("custom-456");
    expect(getVaccineBaseType("custom-456")).toBe("custom");
  });
});

describe("Security (hashPassword)", () => {
  let app;

  beforeEach(() => {
    jest.resetModules();
    app = require("./app.js");
  });

  test("hashes a password correctly using SHA-256", () => {
    const hash = app.hashPassword("1234");
    expect(hash).toBe("03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4");
  });

  test("returns empty string for empty password", () => {
    expect(app.hashPassword("")).toBe("");
    expect(app.hashPassword(null)).toBe("");
  });

  test("does not double-hash a password that is already a valid SHA-256 hash", () => {
    const validHash = "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4";
    expect(app.hashPassword(validHash)).toBe(validHash);
  });
});

describe("Security (validatePasswordComplexity)", () => {
  let app;

  beforeEach(() => {
    jest.resetModules();
    app = require("./app.js");
  });

  test("rejects empty password", () => {
    const res = app.validatePasswordComplexity("");
    expect(res.valid).toBe(false);
    expect(res.msg).toBe("password_required");
  });

  test("rejects null or undefined password", () => {
    const res = app.validatePasswordComplexity(null);
    expect(res.valid).toBe(false);
    expect(res.msg).toBe("password_required");
  });

  test("rejects passwords shorter than 6 characters", () => {
    const res = app.validatePasswordComplexity("ab123"); // 5 characters
    expect(res.valid).toBe(false);
    expect(res.msg).toBe("password_length_error");
  });

  test("rejects passwords longer than 64 characters", () => {
    const longPassword = "a1" + "b2".repeat(31) + "c33"; // 67 characters
    const res = app.validatePasswordComplexity(longPassword);
    expect(res.valid).toBe(false);
    expect(res.msg).toBe("password_length_error");
  });

  test("accepts passwords within the 6-64 character limit", () => {
    const res = app.validatePasswordComplexity("a1b2c3"); // 6 characters
    expect(res.valid).toBe(true);
  });

  test("rejects repetitive characters", () => {
    const res = app.validatePasswordComplexity("aaaaaa");
    expect(res.valid).toBe(false);
    expect(res.msg).toBe("password_repetitive_error");
  });

  test("rejects sequential characters (numeric forward)", () => {
    const res = app.validatePasswordComplexity("123456");
    expect(res.valid).toBe(false);
    expect(res.msg).toBe("password_sequential_error");
  });

  test("rejects sequential characters (numeric backward)", () => {
    const res = app.validatePasswordComplexity("654321");
    expect(res.valid).toBe(false);
    expect(res.msg).toBe("password_sequential_error");
  });

  test("rejects sequential characters (alphabetical forward)", () => {
    const res = app.validatePasswordComplexity("abcdef");
    expect(res.valid).toBe(false);
    expect(res.msg).toBe("password_sequential_error");
  });

  test("rejects sequential characters (alphabetical backward)", () => {
    const res = app.validatePasswordComplexity("fedcba");
    expect(res.valid).toBe(false);
    expect(res.msg).toBe("password_sequential_error");
  });

  test("rejects passwords with only letters", () => {
    const res = app.validatePasswordComplexity("acegik");
    expect(res.valid).toBe(false);
    expect(res.msg).toBe("password_complexity_error");
  });

  test("rejects passwords with only numbers", () => {
    const res = app.validatePasswordComplexity("135791");
    expect(res.valid).toBe(false);
    expect(res.msg).toBe("password_complexity_error");
  });

  test("accepts valid complex passwords", () => {
    const res1 = app.validatePasswordComplexity("a1b2c3");
    expect(res1.valid).toBe(true);

    const res2 = app.validatePasswordComplexity("vax360");
    expect(res2.valid).toBe(true);

    const res3 = app.validatePasswordComplexity("abc123");
    expect(res3.valid).toBe(true);
  });
});

describe("loadPartnerBranding", () => {
  let originalFetch;
  let app;

  beforeAll(() => {
    app = require("./app.js");
    originalFetch = global.fetch;
    // Mock uid if not present or global window
    global.uid = () => "test-uid";
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  test("handles array responses correctly", async () => {
    const mockPartners = [
      { id: "p1", logo: "logo1", link: "link1" },
      { id: "p2", logo: "logo2", link: "link2" }
    ];
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPartners)
      })
    );

    await app.loadPartnerBranding();

    expect(app.S.partners).toBeDefined();
    expect(app.S.partners).toHaveLength(2);
    expect(app.S.partners[0].logo).toBe("logo1");
    expect(app.S.partners[1].logo).toBe("logo2");
    expect(app.S.partnerLogo).toBe("logo1");
  });

  test("handles legacy single-partner objects correctly", async () => {
    const mockLegacy = { logo: "legacy_logo", link: "legacy_link" };
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockLegacy)
      })
    );

    await app.loadPartnerBranding();

    expect(app.S.partners).toBeDefined();
    expect(app.S.partners).toHaveLength(1);
    expect(app.S.partners[0].logo).toBe("legacy_logo");
    expect(app.S.partnerLogo).toBe("legacy_logo");
  });

  test("handles empty or failed responses correctly", async () => {
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      })
    );

    await app.loadPartnerBranding();
    expect(app.S.partners).toHaveLength(0);
    expect(app.S.partnerLogo).toBe("");
  });
});
