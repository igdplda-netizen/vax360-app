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
