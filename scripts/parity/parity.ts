/**
 * Behaviour/SEO parity between two deployments of the site.
 *
 *   pnpm parity snapshot --base http://localhost:3100 --urls sample --out /tmp/a.json
 *   pnpm parity compare /tmp/a.json /tmp/b.json [--ignore cacheControl,setCookie] [--report diff.json]
 *   pnpm parity run --a https://localedb.org --b https://localedb.example.workers.dev --urls sitemap --out /tmp/parity
 *
 * Every URL is fetched twice without following redirects. A page whose text differs
 * between the two fetches is marked volatile (per-request randomness), and a body
 * difference on a volatile page is reported but does not fail the comparison.
 *
 * Options: --urls sample|sitemap (default sample), --concurrency N (default 6),
 * --ua "<user agent>", --text (keep page text so body diffs show the changed words).
 * `compare` exits 1 when a non-ignored field differs.
 */
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { extractPage, sha256, type PageFacts } from './extract';
import { sampleTargets, sitemapTargets, targetKey, type Target } from './targets';

interface Entry {
    path: string;
    headers?: Record<string, string>;
    status: number;
    location: string | null;
    contentType: string | null;
    cacheControl: string | null;
    /** Names of the cookies set, not their values. */
    setCookie: string[];
    /** The `rel=alternate` (hreflang) entries of the `Link` header, with the base's origin removed. */
    link: string | null;
    page?: PageFacts;
    bodyHash: string;
    volatile: boolean;
    error?: string;
}

interface Snapshot {
    base: string;
    urls: string;
    takenAt: string;
    entries: Record<string, Entry>;
}

const FIELDS = [
    'status',
    'location',
    'contentType',
    'cacheControl',
    'setCookie',
    'link',
    'lang',
    'dir',
    'title',
    'description',
    'robots',
    'canonical',
    'hreflang',
    'og',
    'twitter',
    'body',
] as const;
type Field = (typeof FIELDS)[number];

const BOOLEAN_FLAGS = new Set(['text']);

function parseArgs(argv: string[]) {
    const positional: string[] = [];
    const flags: Record<string, string> = {};
    for (let i = 0; i < argv.length; i++) {
        if (!argv[i].startsWith('--')) positional.push(argv[i]);
        else if (BOOLEAN_FLAGS.has(argv[i].slice(2))) flags[argv[i].slice(2)] = 'true';
        else flags[argv[i].slice(2)] = argv[++i] ?? '';
    }
    return { positional, flags };
}

function required(flags: Record<string, string>, name: string): string {
    if (!flags[name]) throw new Error(`--${name} is required`);
    return flags[name];
}

/** Absolute URLs pointing at the base itself become relative, so two hosts compare equal. */
function normalizeLocation(location: string | null, base: string): string | null {
    if (!location) return null;
    const origin = new URL(base).origin;
    return location.startsWith(origin) ? location.slice(origin.length) || '/' : location;
}

/** Preload hints (fonts, CSS) only appear on dynamically rendered responses, so only alternates are compared. */
function normalizeLink(link: string | null, base: string): string | null {
    if (!link) return null;
    const alternates = link
        .split(/,\s*(?=<)/)
        .filter((entry) => /rel="?alternate/.test(entry))
        .map((entry) => entry.replace(`<${new URL(base).origin}`, '<'));
    return alternates.length ? alternates.join(', ') : null;
}

async function fetchOnce(base: string, target: Target, ua: string) {
    const res = await fetch(new URL(target.path, base), {
        redirect: 'manual',
        headers: { 'user-agent': ua, 'accept-language': 'en', ...target.headers },
        signal: AbortSignal.timeout(30_000),
    });
    const bytes = new Uint8Array(await res.arrayBuffer());
    return { res, bytes };
}

interface SnapshotOptions {
    concurrency: number;
    ua: string;
    keepText: boolean;
}

async function snapshotTarget(base: string, target: Target, { ua, keepText }: SnapshotOptions): Promise<Entry> {
    const first = await fetchOnce(base, target, ua);
    const second = await fetchOnce(base, target, ua);
    const { res } = first;
    const contentType = res.headers.get('content-type');
    const isHtml = contentType?.includes('text/html') ?? false;

    const entry: Entry = {
        path: target.path,
        ...(target.headers && { headers: target.headers }),
        status: res.status,
        location: normalizeLocation(res.headers.get('location'), base),
        contentType,
        cacheControl: res.headers.get('cache-control'),
        setCookie: res.headers
            .getSetCookie()
            .map((c) => c.split('=')[0])
            .sort(),
        link: normalizeLink(res.headers.get('link'), base),
        bodyHash: '',
        volatile: false,
    };

    if (isHtml) {
        entry.page = extractPage(new TextDecoder().decode(first.bytes), keepText);
        entry.bodyHash = entry.page.textHash;
        entry.volatile = extractPage(new TextDecoder().decode(second.bytes)).textHash !== entry.bodyHash;
    } else {
        entry.bodyHash = sha256(first.bytes);
        entry.volatile = sha256(second.bytes) !== entry.bodyHash;
    }
    return entry;
}

async function pool<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
    const results: R[] = new Array(items.length);
    let next = 0;
    await Promise.all(
        Array.from({ length: Math.min(limit, items.length) }, async () => {
            while (next < items.length) {
                const i = next++;
                results[i] = await fn(items[i]);
            }
        }),
    );
    return results;
}

async function snapshot(base: string, urls: string, options: SnapshotOptions): Promise<Snapshot> {
    const targets = urls === 'sitemap' ? await sitemapTargets(base) : sampleTargets();
    let done = 0;
    const entries = await pool(targets, options.concurrency, async (target) => {
        let entry: Entry;
        try {
            entry = await snapshotTarget(base, target, options);
        } catch (error) {
            entry = {
                path: target.path,
                status: 0,
                location: null,
                contentType: null,
                cacheControl: null,
                setCookie: [],
                link: null,
                bodyHash: '',
                volatile: false,
                error: String(error),
            };
        }
        if (++done % 50 === 0 || done === targets.length) process.stderr.write(`  ${base}: ${done}/${targets.length}\n`);
        return [targetKey(target), entry] as const;
    });
    return { base, urls, takenAt: new Date().toISOString(), entries: Object.fromEntries(entries) };
}

function fieldValue(entry: Entry, field: Field): unknown {
    switch (field) {
        case 'status':
        case 'location':
        case 'contentType':
        case 'cacheControl':
        case 'setCookie':
        case 'link':
            return entry[field];
        case 'body':
            return entry.bodyHash;
        default:
            return entry.page?.[field] ?? null;
    }
}

/** The first stretch of words where two page texts part ways. */
function textDiff(a: string, b: string): { a: string; b: string } {
    const wa = a.split(' ');
    const wb = b.split(' ');
    let start = 0;
    while (start < wa.length && wa[start] === wb[start]) start++;
    let end = 0;
    while (end < wa.length - start && end < wb.length - start && wa[wa.length - 1 - end] === wb[wb.length - 1 - end]) end++;
    const from = Math.max(0, start - 5);
    return {
        a: `…${wa.slice(from, Math.min(wa.length - end + 5, from + 40)).join(' ')}…`,
        b: `…${wb.slice(from, Math.min(wb.length - end + 5, from + 40)).join(' ')}…`,
    };
}

interface Diff {
    key: string;
    field: Field | 'missing' | 'error';
    a: unknown;
    b: unknown;
    /** Soft diffs are reported but do not fail the comparison. */
    kind: 'hard' | 'volatile' | 'reordered';
}

function compare(a: Snapshot, b: Snapshot, ignore: Set<string>): Diff[] {
    const diffs: Diff[] = [];
    const keys = [...new Set([...Object.keys(a.entries), ...Object.keys(b.entries)])];
    for (const key of keys) {
        const ea = a.entries[key];
        const eb = b.entries[key];
        if (!ea || !eb) {
            diffs.push({ key, field: 'missing', a: !!ea, b: !!eb, kind: 'hard' });
            continue;
        }
        if (ea.error || eb.error) {
            diffs.push({ key, field: 'error', a: ea.error ?? null, b: eb.error ?? null, kind: 'hard' });
            continue;
        }
        for (const field of FIELDS) {
            if (ignore.has(field)) continue;
            const va = fieldValue(ea, field);
            const vb = fieldValue(eb, field);
            if (JSON.stringify(va) === JSON.stringify(vb)) continue;
            let kind: Diff['kind'] = 'hard';
            let shown = { a: va, b: vb };
            if (field === 'body') {
                if (ea.volatile || eb.volatile) kind = 'volatile';
                else if (ea.page && eb.page && ea.page.bagHash === eb.page.bagHash) kind = 'reordered';
                if (ea.page?.text !== undefined && eb.page?.text !== undefined) shown = textDiff(ea.page.text, eb.page.text);
            }
            diffs.push({ key, field, ...shown, kind });
        }
    }
    return diffs;
}

function show(value: unknown): string {
    const text = typeof value === 'string' ? value : JSON.stringify(value);
    return text.length > 300 ? `${text.slice(0, 300)}…` : text;
}

function printDiffs(a: Snapshot, b: Snapshot, diffs: Diff[]) {
    const total = new Set([...Object.keys(a.entries), ...Object.keys(b.entries)]).size;
    console.log(`A: ${a.base} (${a.takenAt})\nB: ${b.base} (${b.takenAt})\n`);
    for (const d of diffs) {
        const tag = d.kind === 'hard' ? 'DIFF' : d.kind.toUpperCase();
        console.log(`${tag}  ${d.key}  ${d.field}\n   A: ${show(d.a)}\n   B: ${show(d.b)}`);
    }
    const hard = diffs.filter((d) => d.kind === 'hard');
    const byField: Record<string, number> = {};
    for (const d of hard) byField[d.field] = (byField[d.field] ?? 0) + 1;
    console.log(
        `\n${total} URLs · ${new Set(hard.map((d) => d.key)).size} with hard diffs (${hard.length} fields) · ` +
            `${diffs.length - hard.length} soft (volatile/reordered body)` +
            (hard.length ? `\nhard diffs by field: ${JSON.stringify(byField)}` : ''),
    );
    return hard.length;
}

async function readSnapshot(file: string): Promise<Snapshot> {
    return JSON.parse(await readFile(file, 'utf-8'));
}

async function main() {
    const [command, ...rest] = process.argv.slice(2);
    const { positional, flags } = parseArgs(rest);
    const urls = flags.urls ?? 'sample';
    const options: SnapshotOptions = {
        concurrency: Number(flags.concurrency ?? 6),
        ua: flags.ua ?? 'localedb-parity/1.0',
        keepText: 'text' in flags,
    };
    const ignore = new Set((flags.ignore ?? '').split(',').filter(Boolean));

    if (command === 'snapshot') {
        const snap = await snapshot(required(flags, 'base'), urls, options);
        await writeFile(required(flags, 'out'), JSON.stringify(snap, null, 2));
        console.log(`${Object.keys(snap.entries).length} URLs → ${flags.out}`);
    } else if (command === 'compare') {
        if (positional.length !== 2) throw new Error('compare needs two snapshot files');
        const [a, b] = await Promise.all(positional.map(readSnapshot));
        const diffs = compare(a, b, ignore);
        if (flags.report) await writeFile(flags.report, JSON.stringify(diffs, null, 2));
        process.exitCode = printDiffs(a, b, diffs) ? 1 : 0;
    } else if (command === 'run') {
        const out = required(flags, 'out');
        await mkdir(out, { recursive: true });
        const [a, b] = await Promise.all(
            [required(flags, 'a'), required(flags, 'b')].map((base) => snapshot(base, urls, options)),
        );
        await writeFile(path.join(out, 'a.json'), JSON.stringify(a, null, 2));
        await writeFile(path.join(out, 'b.json'), JSON.stringify(b, null, 2));
        const diffs = compare(a, b, ignore);
        await writeFile(path.join(out, 'diff.json'), JSON.stringify(diffs, null, 2));
        process.exitCode = printDiffs(a, b, diffs) ? 1 : 0;
    } else {
        console.error('usage: parity snapshot|compare|run (see scripts/parity/parity.ts)');
        process.exitCode = 2;
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 2;
});
