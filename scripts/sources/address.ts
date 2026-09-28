/**
 * Address formats and postal codes from Google libaddressinput (Apache 2.0),
 * downloaded by `update-data` into data/libaddressinput/countryinfo.txt.
 * Each line is `data/<REGION>=<json>`; `data/ZZ` holds the defaults.
 */
import fs from 'fs';
import type { AddressFormatInfo } from '@localedb/core/browser';

interface AddressRecord {
    fmt?: string;
    zip?: string;
    zipex?: string;
    state_name_type?: string;
}

const FIELDS: Record<string, string> = {
    N: 'name',
    O: 'organization',
    A: 'address',
    D: 'dependentLocality',
    C: 'city',
    S: 'state',
    Z: 'postalCode',
    X: 'sortingCode',
};

const titleCase = (value: string) => value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

/**
 * The first listed example that matches the regex (upstream lists are not always
 * consistent, e.g. Belarus), or the regex itself when it is a single literal code.
 */
function postalExample(regex: string, examples = ''): string {
    const pattern = regex && new RegExp(`^(?:${regex})$`);
    const valid = examples.split(',').map((e) => e.trim()).filter((e) => e && (!pattern || pattern.test(e)));
    if (valid.length) return valid[0];
    return /^[A-Z0-9 -]+$/.test(regex) ? regex : '';
}

/** "SW1A 1AA" -> "AANA NAA"; without an example, "\d{5}" -> "NNNNN". */
function postalPattern(regex: string, example: string): string {
    if (example) return example.replace(/[A-Za-z]/g, 'A').replace(/\d/g, 'N');
    const digits = regex.match(/^\\d\{(\d+)\}$/);
    return digits ? 'N'.repeat(Number(digits[1])) : '';
}

export class AddressFormats {
    private readonly records = new Map<string, AddressRecord>();

    constructor(countryInfoPath: string) {
        if (!fs.existsSync(countryInfoPath)) return;
        for (const line of fs.readFileSync(countryInfoPath, 'utf-8').split('\n')) {
            const match = line.match(/^data\/([A-Z]{2})=(.*)$/);
            if (match) this.records.set(match[1], JSON.parse(match[2]));
        }
    }

    get size(): number {
        return this.records.size;
    }

    has(region: string): boolean {
        return this.records.has(region);
    }

    get(region: string): AddressFormatInfo {
        const defaults = this.records.get('ZZ') ?? {};
        const record = this.records.get(region) ?? {};
        const format = record.fmt ?? defaults.fmt ?? '%N%n%O%n%A%n%C';
        const regex = record.zip ?? '';
        const example = postalExample(regex, record.zipex);
        const division = titleCase(record.state_name_type ?? defaults.state_name_type ?? 'province');
        return {
            format,
            lineOrder: [...format.matchAll(/%([A-Z])/g)].map(([, token]) => FIELDS[token]).filter(Boolean),
            postalCodeFormat: postalPattern(regex, example),
            postalCodeRegex: regex,
            postalCodeExample: example,
            administrativeDivisionName: division,
            administrativeDivisionType: division,
        };
    }
}
