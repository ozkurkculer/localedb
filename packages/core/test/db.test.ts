import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { packData } from "../scripts/pack-data";
import { createLocaleDB, pickFields, toCsv, type LocaleDB } from "../src";

const source = join(__dirname, "fixtures/source");
let outDir: string;
let db: LocaleDB;

beforeAll(() => {
  outDir = mkdtempSync(join(tmpdir(), "localedb-core-"));
  packData(source, outDir, "9.9.9");
  db = createLocaleDB(outDir);
});

afterAll(() => rmSync(outDir, { recursive: true, force: true }));

describe("packData", () => {
  it("writes minified JSON and stamps the package version into meta", () => {
    const raw = readFileSync(join(outDir, "countries/TR.json"), "utf-8");
    expect(raw).not.toContain("\n");
    expect(db.getMeta().version).toBe("9.9.9");
  });

  it("fails with a helpful message when the source dataset is missing", () => {
    expect(() => packData(join(source, "nope"), join(outDir, "x"), "1.0.0")).toThrow(/build:data/);
  });
});

describe("createLocaleDB", () => {
  it("finds countries by alpha-2 or alpha-3 code, case-insensitively", () => {
    expect(db.getCountry("TR")?.currency.symbol).toBe("₺");
    expect(db.getCountry("tr")?.codes.iso3166Alpha3).toBe("TUR");
    expect(db.getCountry("deu")?.codes.iso3166Alpha2).toBe("DE");
    expect(db.getCountry("XX")).toBeUndefined();
  });

  it("rejects codes that could escape the data directory", () => {
    expect(db.getCountry("../meta")).toBeUndefined();
    expect(db.getCurrency("../../x")).toBeUndefined();
    expect(db.getLanguage("tr/..")).toBeUndefined();
  });

  it("unwraps currencies and languages", () => {
    expect(db.getCurrency("eur")).toMatchObject({ code: "EUR", symbol: "€", countries: ["DE"] });
    expect(db.getLanguage("TR")).toMatchObject({ code: "tr", nativeName: "Türkçe" });
  });

  it("finds airports by IATA or ICAO", () => {
    expect(db.getAirport("ist")?.name).toBe("Istanbul Airport");
    expect(db.getAirport("EDDF")?.iata).toBe("FRA");
    expect(db.getAirport("ZZZ")).toBeUndefined();
  });

  it("lists and searches", () => {
    expect(db.listCountries().map((c) => c.code)).toEqual(["DE", "TR"]);
    expect(db.listCurrencies()).toHaveLength(2);
    expect(db.listLanguages()).toHaveLength(2);
    expect(db.listAirports()).toHaveLength(2);
    expect(db.searchCountries("türk").map((c) => c.code)).toEqual(["TR"]);
    expect(db.searchCountries("deu").map((c) => c.code)).toEqual(["DE"]);
    expect(db.searchCountries("  ")).toEqual([]);
  });

  it("throws when a required index is missing", () => {
    expect(() => createLocaleDB(join(outDir, "missing")).listCountries()).toThrow(/missing/);
  });
});

describe("export helpers", () => {
  it("picks nested fields and serialises them to CSV", () => {
    const country = db.getCountry("TR")!;
    const picked = pickFields(country as unknown as Record<string, unknown>, ["codes.bcp47", "currency.symbol", "nope.x"]);
    expect(picked).toEqual({ codes: { bcp47: ["tr-TR"] }, currency: { symbol: "₺" } });
    expect(toCsv([picked])).toBe("codes.bcp47,currency.symbol\r\ntr-TR,₺");
  });
});
