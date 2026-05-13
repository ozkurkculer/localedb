export type DatasetKey = "countries" | "currencies" | "languages" | "airports";

export interface FieldNode {
  key: string;
  path: string;
  defaultSelected: boolean;
  children?: FieldNode[];
}

export interface DatasetSchema {
  key: DatasetKey;
  rootPaths: FieldNode[];
}

const COUNTRY_FIELDS: FieldNode[] = [
  {
    key: "basics",
    path: "basics",
    defaultSelected: true,
    children: [
      { key: "name", path: "basics.name", defaultSelected: true },
      { key: "officialName", path: "basics.officialName", defaultSelected: true },
      { key: "nativeName", path: "basics.nativeName", defaultSelected: true },
      { key: "officialNativeName", path: "basics.officialNativeName", defaultSelected: false },
      { key: "capital", path: "basics.capital", defaultSelected: true },
      { key: "capitalCoordinates", path: "basics.capitalCoordinates", defaultSelected: false },
      { key: "coordinates", path: "basics.coordinates", defaultSelected: false },
      { key: "continent", path: "basics.continent", defaultSelected: true },
      { key: "region", path: "basics.region", defaultSelected: true },
      { key: "subregion", path: "basics.subregion", defaultSelected: false },
      { key: "population", path: "basics.population", defaultSelected: true },
      { key: "area", path: "basics.area", defaultSelected: false },
      { key: "flagEmoji", path: "basics.flagEmoji", defaultSelected: true },
      { key: "tld", path: "basics.tld", defaultSelected: false },
      { key: "landlocked", path: "basics.landlocked", defaultSelected: false },
      { key: "borders", path: "basics.borders", defaultSelected: false },
      { key: "languages", path: "basics.languages", defaultSelected: true },
      { key: "demonym", path: "basics.demonym", defaultSelected: false },
    ],
  },
  {
    key: "codes",
    path: "codes",
    defaultSelected: true,
    children: [
      { key: "iso3166Alpha2", path: "codes.iso3166Alpha2", defaultSelected: true },
      { key: "iso3166Alpha3", path: "codes.iso3166Alpha3", defaultSelected: true },
      { key: "iso3166Numeric", path: "codes.iso3166Numeric", defaultSelected: true },
      { key: "bcp47", path: "codes.bcp47", defaultSelected: true },
      { key: "internetTld", path: "codes.internetTld", defaultSelected: false },
      { key: "ioc", path: "codes.ioc", defaultSelected: false },
      { key: "fifa", path: "codes.fifa", defaultSelected: false },
      { key: "vehicleCode", path: "codes.vehicleCode", defaultSelected: false },
      { key: "fips10", path: "codes.fips10", defaultSelected: false },
      { key: "unLocode", path: "codes.unLocode", defaultSelected: false },
      { key: "stanag1059", path: "codes.stanag1059", defaultSelected: false },
      { key: "itu", path: "codes.itu", defaultSelected: false },
      { key: "uic", path: "codes.uic", defaultSelected: false },
      { key: "maritime", path: "codes.maritime", defaultSelected: false },
      { key: "mmc", path: "codes.mmc", defaultSelected: false },
    ],
  },
  { key: "currency", path: "currency", defaultSelected: true },
  { key: "dateTime", path: "dateTime", defaultSelected: false },
  { key: "numberFormat", path: "numberFormat", defaultSelected: false },
  { key: "phone", path: "phone", defaultSelected: true },
  { key: "addressFormat", path: "addressFormat", defaultSelected: false },
  { key: "airports", path: "airports", defaultSelected: false },
  { key: "locale", path: "locale", defaultSelected: false },
];

const CURRENCY_FIELDS: FieldNode[] = [
  { key: "code", path: "code", defaultSelected: true },
  { key: "numericCode", path: "numericCode", defaultSelected: true },
  { key: "name", path: "name", defaultSelected: true },
  { key: "nativeName", path: "nativeName", defaultSelected: false },
  { key: "symbol", path: "symbol", defaultSelected: true },
  { key: "narrowSymbol", path: "narrowSymbol", defaultSelected: false },
  { key: "symbolPosition", path: "symbolPosition", defaultSelected: true },
  { key: "decimalSeparator", path: "decimalSeparator", defaultSelected: true },
  { key: "thousandsSeparator", path: "thousandsSeparator", defaultSelected: true },
  { key: "decimalDigits", path: "decimalDigits", defaultSelected: true },
  { key: "subunitValue", path: "subunitValue", defaultSelected: false },
  { key: "subunitName", path: "subunitName", defaultSelected: false },
  { key: "pattern", path: "pattern", defaultSelected: false },
  { key: "example", path: "example", defaultSelected: true },
  { key: "countries", path: "countries", defaultSelected: false },
];

const LANGUAGE_FIELDS: FieldNode[] = [
  { key: "code", path: "code", defaultSelected: true },
  { key: "iso639_2", path: "iso639_2", defaultSelected: true },
  { key: "iso639_3", path: "iso639_3", defaultSelected: true },
  { key: "name", path: "name", defaultSelected: true },
  { key: "nativeName", path: "nativeName", defaultSelected: true },
  { key: "direction", path: "direction", defaultSelected: true },
  { key: "family", path: "family", defaultSelected: false },
  { key: "countries", path: "countries", defaultSelected: false },
];

const AIRPORT_FIELDS: FieldNode[] = [
  { key: "iata", path: "iata", defaultSelected: true },
  { key: "icao", path: "icao", defaultSelected: true },
  { key: "name", path: "name", defaultSelected: true },
  { key: "countryCode", path: "countryCode", defaultSelected: true },
  { key: "region", path: "region", defaultSelected: true },
  { key: "latitude", path: "latitude", defaultSelected: false },
  { key: "longitude", path: "longitude", defaultSelected: false },
];

export const DATASET_SCHEMAS: Record<DatasetKey, DatasetSchema> = {
  countries: { key: "countries", rootPaths: COUNTRY_FIELDS },
  currencies: { key: "currencies", rootPaths: CURRENCY_FIELDS },
  languages: { key: "languages", rootPaths: LANGUAGE_FIELDS },
  airports: { key: "airports", rootPaths: AIRPORT_FIELDS },
};

export function collectAllPaths(nodes: FieldNode[]): string[] {
  const out: string[] = [];
  for (const node of nodes) {
    if (node.children?.length) {
      out.push(...collectAllPaths(node.children));
    } else {
      out.push(node.path);
    }
  }
  return out;
}

export function collectDefaultPaths(nodes: FieldNode[]): string[] {
  const out: string[] = [];
  for (const node of nodes) {
    if (node.children?.length) {
      out.push(...collectDefaultPaths(node.children));
    } else if (node.defaultSelected) {
      out.push(node.path);
    }
  }
  return out;
}
