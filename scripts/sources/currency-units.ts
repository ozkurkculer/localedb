/**
 * Currency subunit names and ratios from ourworldincode/currency (MIT),
 * downloaded by `update-data` into data/ourworldincode/currencies.json.
 */
import fs from 'fs';

interface CurrencyUnitRecord {
    minorSingle?: string;
    minorPlural?: string;
    numToBasic?: number;
}

export class CurrencyUnits {
    private readonly records: Record<string, CurrencyUnitRecord>;

    constructor(path: string) {
        this.records = fs.existsSync(path) ? JSON.parse(fs.readFileSync(path, 'utf-8')) : {};
    }

    get size(): number {
        return Object.keys(this.records).length;
    }

    /** Singular subunit name, e.g. TRY -> "Kuruş", GBP -> "Penny". */
    subunitName(code: string): string | undefined {
        return this.records[code]?.minorSingle || undefined;
    }

    /** Subunits per unit, e.g. KWD -> 1000, MRU -> 5. */
    subunitsPerUnit(code: string): number | undefined {
        const ratio = Number(this.records[code]?.numToBasic);
        return Number.isFinite(ratio) && ratio > 0 ? ratio : undefined;
    }
}
