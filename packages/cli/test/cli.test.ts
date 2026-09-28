import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createLocaleDB } from "@localedb/core";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { packData } from "../../core/scripts/pack-data";
import type { Context } from "../src/context";
import { run } from "../src/run";

let tmp: string;
let dataDir: string;

beforeAll(() => {
  tmp = mkdtempSync(join(tmpdir(), "localedb-cli-"));
  dataDir = join(tmp, "data");
  packData(join(__dirname, "../../core/test/fixtures/source"), dataDir, "1.2.3");
});

afterAll(() => rmSync(tmp, { recursive: true, force: true }));

async function cli(argv: string[], cwd = tmp) {
  let stdout = "";
  let stderr = "";
  const ctx: Context = {
    db: createLocaleDB(dataDir),
    stdout: { write: (s: string) => (stdout += s) },
    stderr: { write: (s: string) => (stderr += s) },
    cwd,
    interactive: false,
    version: "0.0.0-test",
  };
  const code = await run(argv, ctx);
  // Strip ANSI colours so assertions read naturally.
  const plain = (s: string) => s.replace(/\x1b\[[0-9;]*m/g, "");
  return { code, stdout: plain(stdout), stderr: plain(stderr) };
}

function workdir() {
  return mkdtempSync(join(tmp, "work-"));
}

describe("meta", () => {
  it("prints CLI and data versions", async () => {
    const { code, stdout } = await cli(["--version"]);
    expect(code).toBe(0);
    expect(stdout).toContain("@localedb/cli 0.0.0-test");
    expect(stdout).toContain("data 1.2.3");
  });

  it("shows help, and exits non-zero when no command is given", async () => {
    expect((await cli([])).code).toBe(1);
    const help = await cli(["--help"]);
    expect(help.code).toBe(0);
    expect(help.stdout).toContain("localedb <command>");
    expect((await cli(["export", "--help"])).stdout).toContain("--split");
  });

  it("rejects unknown commands and options with exit code 2", async () => {
    expect((await cli(["frobnicate"])).code).toBe(2);
    const bad = await cli(["get", "country", "TR", "--nope"]);
    expect(bad.code).toBe(2);
    expect(bad.stderr).toContain("error");
  });
});

describe("get", () => {
  it("prints a record picked down to the requested fields", async () => {
    const { code, stdout } = await cli(["get", "country", "tur", "--fields", "currency.symbol,codes.bcp47"]);
    expect(code).toBe(0);
    expect(JSON.parse(stdout)).toEqual({ currency: { symbol: "₺" }, codes: { bcp47: ["tr-TR"] } });
  });

  it("accepts plural datasets and ICAO codes", async () => {
    expect(JSON.parse((await cli(["get", "airports", "LTFM"])).stdout).iata).toBe("IST");
  });

  it("reports missing records and unknown fields", async () => {
    const missing = await cli(["get", "country", "XX"]);
    expect(missing.code).toBe(2);
    expect(missing.stderr).toContain("Not found in countries: XX");

    const field = await cli(["get", "country", "TR", "--fields", "currency,flavour"]);
    expect(field.code).toBe(2);
    expect(field.stderr).toContain("Unknown field for countries: flavour");
    expect(field.stderr).toContain("Top-level fields: basics, codes");
  });
});

describe("list and search", () => {
  it("lists a dataset as a table or JSON", async () => {
    const table = await cli(["list", "currencies"]);
    expect(table.stdout.split("\n")[0]).toMatch(/^CODE\s+SYMBOL\s+NAME\s+COUNTRIES$/);
    expect(table.stdout).toContain("EUR");
    const json = await cli(["list", "languages", "--json"]);
    expect(JSON.parse(json.stdout).map((l: { code: string }) => l.code)).toEqual(["de", "tr"]);
  });

  it("searches countries by native name", async () => {
    const { code, stdout } = await cli(["search", "türk"]);
    expect(code).toBe(0);
    expect(stdout).toContain("Turkey");
    expect((await cli(["search", "atlantis"])).code).toBe(1);
  });
});

describe("export", () => {
  it("prints CSV to stdout", async () => {
    const { code, stdout } = await cli(["export", "countries", "TR,DE", "--fields", "codes.iso3166Alpha2,currency.code", "--format", "csv"]);
    expect(code).toBe(0);
    expect(stdout).toBe("codes.iso3166Alpha2,currency.code\r\nTR,TRY\r\nDE,EUR\r\n");
  });

  it("writes a typed TypeScript module keyed by code", async () => {
    const dir = workdir();
    const { code } = await cli(["export", "countries", "--all", "--fields", "currency.symbol", "--format", "ts", "--out", "src/countries.ts"], dir);
    expect(code).toBe(0);
    const ts = readFileSync(join(dir, "src/countries.ts"), "utf-8");
    expect(ts).toContain("LocaleDB data v1.2.3");
    expect(ts).toContain('export const countries = {\n  "DE": {');
    expect(ts).toContain("} as const;");
    expect(ts).toContain("export type CountriesCode = keyof typeof countries;");
  });

  it("splits into one file per record and de-duplicates aliases", async () => {
    const dir = workdir();
    await cli(["export", "country", "TR", "TUR", "DE", "--split", "--out", "out"], dir);
    expect(readdirSync(join(dir, "out")).sort()).toEqual(["DE.json", "TR.json"]);
    expect(JSON.parse(readFileSync(join(dir, "out/TR.json"), "utf-8"))).toHaveLength(1);
  });

  it("fails on unknown codes, missing codes and --split without --out", async () => {
    expect((await cli(["export", "countries", "TR", "ZZ"])).stderr).toContain("Not found in countries: ZZ");
    expect((await cli(["export", "countries"])).code).toBe(2);
    expect((await cli(["export", "countries", "TR", "--split"])).stderr).toContain("--split needs --out");
    expect((await cli(["export", "countries", "TR", "--format", "xml"])).stderr).toContain('Unknown format "xml"');
  });
});

describe("sync", () => {
  it("generates files from the config and detects drift with --check", async () => {
    const dir = workdir();
    writeFileSync(
      join(dir, "localedb.config.json"),
      JSON.stringify({
        exports: [
          { dataset: "currencies", codes: "all", fields: ["code", "symbol"], format: "json", out: "gen/currencies.json" },
          { dataset: "country", codes: ["TR"], format: "ts", out: "gen/countries", split: true },
        ],
      })
    );

    expect((await cli(["sync", "--check"], dir)).code).toBe(1);
    expect((await cli(["sync"], dir)).code).toBe(0);
    expect(JSON.parse(readFileSync(join(dir, "gen/currencies.json"), "utf-8"))).toEqual([
      { code: "EUR", symbol: "€" },
      { code: "TRY", symbol: "₺" },
    ]);
    expect(readdirSync(join(dir, "gen/countries"))).toEqual(["TR.ts"]);

    const check = await cli(["sync", "--check"], dir);
    expect(check.code).toBe(0);
    expect(check.stderr).toContain("Up to date: 2 files");

    writeFileSync(join(dir, "gen/currencies.json"), "[]\n");
    const drift = await cli(["sync", "--check"], dir);
    expect(drift.code).toBe(1);
    expect(drift.stderr).toContain("gen/currencies.json");
  });

  it("explains a missing or invalid config", async () => {
    const dir = workdir();
    expect((await cli(["sync"], dir)).stderr).toContain("Run `localedb init`");
    writeFileSync(join(dir, "localedb.config.json"), JSON.stringify({ exports: [{ dataset: "countries", codes: "TR", out: "x" }] }));
    expect((await cli(["sync"], dir)).stderr).toContain('exports[0].codes must be "all" or an array');
  });

  it("refuses to run init without a terminal", async () => {
    const { code, stderr } = await cli(["init"]);
    expect(code).toBe(2);
    expect(stderr).toContain("interactive terminal");
  });
});
