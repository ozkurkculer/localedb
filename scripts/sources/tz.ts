/**
 * Country time zones from the IANA tz database (public domain), downloaded by
 * `update-data` into data/tz/zone.tab.
 */
import fs from 'fs';

/**
 * Capitals that are not tz location names, mapped to the zone they observe.
 * zone.tab lists a country's zones geographically, so without this the first
 * entry would be e.g. Lord Howe Island for Australia.
 */
const CAPITAL_ZONES: Record<string, string> = {
    AU: 'Australia/Sydney', // Canberra
    BR: 'America/Sao_Paulo', // Brasília
    CA: 'America/Toronto', // Ottawa
    US: 'America/New_York', // Washington, D.C.
    KZ: 'Asia/Almaty', // Astana
    FM: 'Pacific/Pohnpei', // Palikir
};

/** Regions zone.tab does not list separately (user-assigned ISO codes). */
const EXTRA_ZONES: Record<string, string[]> = {
    XK: ['Europe/Belgrade'], // Kosovo observes the zone of Belgrade
};

const normalize = (value: string) =>
    value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[\s-]+/g, '_');

export class TimeZones {
    private readonly byCountry = new Map<string, string[]>();

    constructor(zoneTabPath: string) {
        if (!fs.existsSync(zoneTabPath)) return;
        for (const line of fs.readFileSync(zoneTabPath, 'utf-8').split('\n')) {
            if (!line || line.startsWith('#')) continue;
            const [country, , zone] = line.split('\t');
            this.byCountry.set(country, [...(this.byCountry.get(country) ?? []), zone]);
        }
    }

    get size(): number {
        return this.byCountry.size;
    }

    zones(country: string): string[] {
        return this.byCountry.get(country) ?? (this.byCountry.size ? EXTRA_ZONES[country] ?? [] : []);
    }

    /**
     * The zone of the capital: a zone named after it, a known capital zone,
     * CLDR's representative zone for the country or the metazone, else the first.
     */
    primary(country: string, capital: string, representativeZones: string[] = []): string {
        const zones = this.zones(country);
        if (!zones.length) return '';
        const capitalKey = normalize(capital);
        return (
            zones.find((zone) => normalize(zone.split('/').pop()!) === capitalKey) ??
            (zones.includes(CAPITAL_ZONES[country]) ? CAPITAL_ZONES[country] : undefined) ??
            representativeZones.find((zone) => zones.includes(zone)) ??
            zones[0]
        );
    }
}

/** Standard-time UTC offset of a zone, e.g. "+03:00" (the lower of January and July). */
export function standardOffset(zone: string): string {
    const minutes = (month: number) => {
        const parts = new Intl.DateTimeFormat('en-US', { timeZone: zone, timeZoneName: 'longOffset' })
            .formatToParts(Date.UTC(new Date().getUTCFullYear(), month, 1));
        const match = parts.find((p) => p.type === 'timeZoneName')?.value.match(/GMT([+-])(\d{2}):(\d{2})/);
        return match ? (match[1] === '-' ? -1 : 1) * (Number(match[2]) * 60 + Number(match[3])) : 0;
    };
    try {
        const offset = Math.min(minutes(0), minutes(6));
        const sign = offset < 0 ? '-' : '+';
        const abs = Math.abs(offset);
        return `${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`;
    } catch {
        return '+00:00';
    }
}
