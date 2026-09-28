import { fileURLToPath } from "node:url";
import { createLocaleDB, type LocaleDB } from "./db";

export * from "./browser";
export { createLocaleDB, type Currency, type DatasetMeta, type LocaleDB } from "./db";

/** Directory holding the dataset bundled with this package (`<package>/data`). */
export const dataDir = fileURLToPath(new URL("../data", import.meta.url));

let bundled: LocaleDB | undefined;
const db = () => (bundled ??= createLocaleDB(dataDir));

export const getCountry: LocaleDB["getCountry"] = (code) => db().getCountry(code);
export const getCurrency: LocaleDB["getCurrency"] = (code) => db().getCurrency(code);
export const getLanguage: LocaleDB["getLanguage"] = (code) => db().getLanguage(code);
export const getAirport: LocaleDB["getAirport"] = (code) => db().getAirport(code);
export const listCountries: LocaleDB["listCountries"] = () => db().listCountries();
export const listCurrencies: LocaleDB["listCurrencies"] = () => db().listCurrencies();
export const listLanguages: LocaleDB["listLanguages"] = () => db().listLanguages();
export const listAirports: LocaleDB["listAirports"] = () => db().listAirports();
export const searchCountries: LocaleDB["searchCountries"] = (query) => db().searchCountries(query);
export const getMeta: LocaleDB["getMeta"] = () => db().getMeta();
