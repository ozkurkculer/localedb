/**
 * Represents an airport with IATA/ICAO codes and location data.
 * Source: ip2location-iata-icao
 */
export interface Airport {
  /** IATA airport code (e.g. "IST") */
  iata: string;
  /** ICAO airport code (e.g. "LTFM") */
  icao: string;
  /** Airport name (e.g. "Istanbul Airport") */
  name: string;
  /** Latitude */
  latitude: number;
  /** Longitude */
  longitude: number;
  /** Region/State name */
  region: string;
  /** Country code (ISO 3166-1 alpha-2) */
  countryCode: string;
}
