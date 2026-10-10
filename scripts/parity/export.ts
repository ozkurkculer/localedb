/**
 * Parity of POST /api/export between two deployments (or two builds of the same commit range).
 *
 *   pnpm parity:export snapshot --base http://localhost:3100 --out /tmp/export-a.json
 *   pnpm parity:export compare /tmp/export-a.json /tmp/export-b.json
 *   pnpm parity:export run --a http://localhost:3100 --b http://localhost:3200 --out /tmp/export-parity
 *
 * Covers the 4 formats × 4 datasets with the export builder's default fields, every field for
 * one large record per dataset, the preview call per dataset, and the validation/error paths.
 * Zip bodies are compared by entry names and entry contents, not bytes (zip headers carry timestamps).
 * `compare` exits 1 when anything differs.
 */
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import AdmZip from 'adm-zip';
import { DATASET_SCHEMAS, collectAllPaths, collectDefaultPaths, type DatasetKey } from '@localedb/core/browser';
import { sha256 } from './extract';

interface Case {
    name: string;
    /** Raw request body; a string is sent as-is (for the invalid-JSON case). */
    body: unknown;
}

interface Entry {
    status: number;
    contentType: string | null;
    contentDisposition: string | null;
    cacheControl: string | null;
    /** sha256 of the body, or of the sorted zip entries for zip responses. */
    bodyHash: string;
    bytes: number;
    /** Zip entry names with the hash of each entry's content. */
    zipEntries?: { name: string; hash: string }[];
    /** Short bodies (errors, previews) are kept verbatim so diffs are readable. */
    text?: string;
    error?: string;
}

interface Snapshot {
    base: string;
    takenAt: string;
    entries: Record<string, Entry>;
}

const SAMPLE_ENTITIES: Record<DatasetKey, string[]> = {
    countries: ['US', 'TR', 'JP', 'BR', 'DE', 'SA'],
    currencies: ['USD', 'EUR', 'TRY', 'JPY', 'BHD'],
    languages: ['en', 'tr', 'ar', 'ja', 'zh'],
    airports: ['IST', 'JFK', 'LHR', 'NRT', 'GRU'],
};
const FORMATS = ['json', 'json-min', 'csv', 'zip'] as const;
const DATASETS = Object.keys(SAMPLE_ENTITIES) as DatasetKey[];

function cases(): Case[] {
    const out: Case[] = [];
    for (const dataset of DATASETS) {
        const schema = DATASET_SCHEMAS[dataset];
        const defaults = collectDefaultPaths(schema.rootPaths);
        const all = collectAllPaths(schema.rootPaths);
        const entities = SAMPLE_ENTITIES[dataset];
        for (const format of FORMATS) {
            out.push({ name: `${dataset}/${format}/default`, body: { dataset, entities, fields: defaults, format } });
        }
        out.push({ name: `${dataset}/json/all-fields`, body: { dataset, entities: entities.slice(0, 2), fields: all, format: 'json' } });
        out.push({ name: `${dataset}/preview`, body: { dataset, entities, fields: defaults, format: 'json', preview: true } });
        out.push({
            name: `${dataset}/json/some-unknown`,
            body: { dataset, entities: [...entities.slice(0, 2), 'NOPE'], fields: defaults, format: 'json' },
        });
    }
    const fields = collectDefaultPaths(DATASET_SCHEMAS.countries.rootPaths);
    const many = Array.from({ length: 501 }, (_, i) => `X${i}`);
    out.push(
        { name: 'error/invalid-json', body: '{not json' },
        { name: 'error/invalid-dataset', body: { dataset: 'planets', entities: ['US'], fields, format: 'json' } },
        { name: 'error/missing-dataset', body: { entities: ['US'], fields, format: 'json' } },
        { name: 'error/0-entities', body: { dataset: 'countries', entities: [], fields, format: 'json' } },
        { name: 'error/entities-not-array', body: { dataset: 'countries', entities: 'US', fields, format: 'json' } },
        { name: 'error/501-entities', body: { dataset: 'countries', entities: many, fields, format: 'json' } },
        { name: 'ok/500-entities-none-match', body: { dataset: 'countries', entities: many.slice(0, 500), fields, format: 'json' } },
        { name: 'error/0-fields', body: { dataset: 'countries', entities: ['US'], fields: [], format: 'json' } },
        { name: 'error/invalid-format', body: { dataset: 'countries', entities: ['US'], fields, format: 'xml' } },
        { name: 'error/no-matching-records', body: { dataset: 'currencies', entities: ['ZZZ'], fields, format: 'csv' } },
        { name: 'error/no-matching-airport', body: { dataset: 'airports', entities: ['ZZZ'], fields, format: 'json' } },
        {
            name: 'error/path-traversal',
            body: { dataset: 'countries', entities: ['../../package'], fields: ['name', 'version'], format: 'json' },
        },
    );
    return out;
}

async function snapshotCase(base: string, c: Case): Promise<Entry> {
    const res = await fetch(new URL('/api/export', base), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: typeof c.body === 'string' ? c.body : JSON.stringify(c.body),
        redirect: 'manual',
        signal: AbortSignal.timeout(60_000),
    });
    const bytes = new Uint8Array(await res.arrayBuffer());
    const contentType = res.headers.get('content-type');
    const entry: Entry = {
        status: res.status,
        contentType,
        contentDisposition: res.headers.get('content-disposition'),
        cacheControl: res.headers.get('cache-control'),
        bodyHash: sha256(bytes),
        bytes: bytes.length,
    };
    if (contentType?.includes('application/zip')) {
        const zip = new AdmZip(Buffer.from(bytes));
        entry.zipEntries = zip
            .getEntries()
            .map((e) => ({ name: e.entryName, hash: sha256(e.getData()) }))
            .sort((a, b) => a.name.localeCompare(b.name));
        entry.bodyHash = sha256(JSON.stringify(entry.zipEntries));
    } else if (bytes.length <= 4000) {
        entry.text = new TextDecoder().decode(bytes);
    }
    return entry;
}

async function snapshot(base: string): Promise<Snapshot> {
    const entries: Record<string, Entry> = {};
    for (const c of cases()) {
        try {
            entries[c.name] = await snapshotCase(base, c);
        } catch (error) {
            entries[c.name] = {
                status: 0,
                contentType: null,
                contentDisposition: null,
                cacheControl: null,
                bodyHash: '',
                bytes: 0,
                error: String(error),
            };
        }
    }
    return { base, takenAt: new Date().toISOString(), entries };
}

const FIELDS = ['status', 'contentType', 'contentDisposition', 'cacheControl', 'bodyHash', 'zipEntries', 'error'] as const;

function compare(a: Snapshot, b: Snapshot) {
    const diffs: { key: string; field: string; a: unknown; b: unknown }[] = [];
    const keys = [...new Set([...Object.keys(a.entries), ...Object.keys(b.entries)])];
    for (const key of keys) {
        const ea = a.entries[key];
        const eb = b.entries[key];
        if (!ea || !eb) {
            diffs.push({ key, field: 'missing', a: !!ea, b: !!eb });
            continue;
        }
        for (const field of FIELDS) {
            if (JSON.stringify(ea[field] ?? null) === JSON.stringify(eb[field] ?? null)) continue;
            const shown = field === 'bodyHash' && (ea.text || eb.text) ? { a: ea.text, b: eb.text } : { a: ea[field], b: eb[field] };
            diffs.push({ key, field, ...shown });
        }
    }
    console.log(`A: ${a.base} (${a.takenAt})\nB: ${b.base} (${b.takenAt})\n`);
    for (const key of keys) {
        const e = a.entries[key] ?? b.entries[key];
        const mark = diffs.some((d) => d.key === key) ? 'DIFF' : 'same';
        console.log(`${mark}  ${key.padEnd(34)} ${e.status}  ${e.contentType ?? ''}  ${e.bytes} B`);
    }
    for (const d of diffs) {
        const show = (v: unknown) => {
            const t = typeof v === 'string' ? v : JSON.stringify(v);
            return t && t.length > 300 ? `${t.slice(0, 300)}…` : t;
        };
        console.log(`\nDIFF  ${d.key}  ${d.field}\n   A: ${show(d.a)}\n   B: ${show(d.b)}`);
    }
    console.log(`\n${keys.length} cases · ${new Set(diffs.map((d) => d.key)).size} with diffs`);
    return diffs;
}

async function main() {
    const [command, ...rest] = process.argv.slice(2);
    const positional: string[] = [];
    const flags: Record<string, string> = {};
    for (let i = 0; i < rest.length; i++) {
        if (rest[i].startsWith('--')) flags[rest[i].slice(2)] = rest[++i] ?? '';
        else positional.push(rest[i]);
    }
    const need = (name: string) => {
        if (!flags[name]) throw new Error(`--${name} is required`);
        return flags[name];
    };

    if (command === 'snapshot') {
        const snap = await snapshot(need('base'));
        await writeFile(need('out'), JSON.stringify(snap, null, 2));
        console.log(`${Object.keys(snap.entries).length} cases → ${flags.out}`);
    } else if (command === 'compare') {
        if (positional.length !== 2) throw new Error('compare needs two snapshot files');
        const [a, b] = await Promise.all(positional.map(async (f) => JSON.parse(await readFile(f, 'utf-8')) as Snapshot));
        const diffs = compare(a, b);
        if (flags.report) await writeFile(flags.report, JSON.stringify(diffs, null, 2));
        process.exitCode = diffs.length ? 1 : 0;
    } else if (command === 'run') {
        const out = need('out');
        await mkdir(out, { recursive: true });
        const a = await snapshot(need('a'));
        const b = await snapshot(need('b'));
        await writeFile(path.join(out, 'a.json'), JSON.stringify(a, null, 2));
        await writeFile(path.join(out, 'b.json'), JSON.stringify(b, null, 2));
        const diffs = compare(a, b);
        await writeFile(path.join(out, 'diff.json'), JSON.stringify(diffs, null, 2));
        process.exitCode = diffs.length ? 1 : 0;
    } else {
        console.error('usage: parity:export snapshot|compare|run (see scripts/parity/export.ts)');
        process.exitCode = 2;
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 2;
});
