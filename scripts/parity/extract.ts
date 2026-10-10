/**
 * Pulls the SEO-relevant parts out of a rendered page with plain regexes
 * (Next's output is regular enough; no HTML parser dependency).
 */
import { createHash } from 'crypto';

export interface PageFacts {
    lang: string | null;
    dir: string | null;
    title: string | null;
    description: string | null;
    robots: string | null;
    canonical: string | null;
    /** `hreflang=href`, sorted. */
    hreflang: string[];
    /** `og:*` and `twitter:*` tags, each key's values in document order. */
    og: Record<string, string[]>;
    twitter: Record<string, string[]>;
    /** Hash of the visible text in document order. */
    textHash: string;
    /** Hash of the sorted words: equal when only the order changed (e.g. streamed Suspense content). */
    bagHash: string;
    /** The visible text itself, kept only with `--text` (to explain body diffs). */
    text?: string;
}

export function sha256(data: string | Uint8Array): string {
    return createHash('sha256').update(data).digest('hex').slice(0, 16);
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

function decode(text: string): string {
    return text.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (whole, entity: string) => {
        if (entity[0] === '#') {
            const code = entity[1].toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
            return Number.isFinite(code) ? String.fromCodePoint(code) : whole;
        }
        return ENTITIES[entity.toLowerCase()] ?? whole;
    });
}

function attributes(tag: string): Record<string, string> {
    const attrs: Record<string, string> = {};
    for (const m of tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
        attrs[m[1].toLowerCase()] = decode(m[2] ?? m[3] ?? '');
    }
    return attrs;
}

function push(map: Record<string, string[]>, key: string, value: string) {
    (map[key] ??= []).push(value);
}

export function extractPage(html: string, keepText = false): PageFacts {
    // RSC payload and styles carry no visible content; drop them before matching tags.
    const doc = html.replace(/<script\b[\s\S]*?<\/script>/gi, '').replace(/<style\b[\s\S]*?<\/style>/gi, '');

    const htmlAttrs = attributes(doc.match(/<html\b[^>]*>/i)?.[0] ?? '');
    const titles = [...doc.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)].map((m) => decode(m[1]).trim());

    const facts: PageFacts = {
        lang: htmlAttrs.lang ?? null,
        dir: htmlAttrs.dir ?? null,
        title: titles.length ? titles.join(' | ') : null,
        description: null,
        robots: null,
        canonical: null,
        hreflang: [],
        og: {},
        twitter: {},
        textHash: '',
        bagHash: '',
    };

    for (const [tag] of doc.matchAll(/<meta\b[^>]*>/gi)) {
        const a = attributes(tag);
        const key = a.property ?? a.name;
        if (!key || a.content === undefined) continue;
        if (key === 'description') facts.description = a.content;
        else if (key === 'robots') facts.robots = a.content;
        else if (key.startsWith('og:')) push(facts.og, key, a.content);
        else if (key.startsWith('twitter:')) push(facts.twitter, key, a.content);
    }

    for (const [tag] of doc.matchAll(/<link\b[^>]*>/gi)) {
        const a = attributes(tag);
        if (a.rel === 'canonical') facts.canonical = a.href ?? null;
        else if (a.rel === 'alternate' && a.hreflang) facts.hreflang.push(`${a.hreflang}=${a.href}`);
    }
    facts.hreflang.sort();

    const body = doc.match(/<body\b[\s\S]*<\/body>/i)?.[0] ?? doc;
    const text = decode(
        body
            // A pending streamed boundary (`<!--$?-->`) holds the fallback until its
            // hidden content arrives later in the stream; the fallback is never seen.
            // Client-rendered bailouts (`<!--$!-->`) are kept: their fallback is what crawlers get.
            .replace(/<!--\$\?-->[\s\S]*?<!--\/\$-->/g, '')
            .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, '')
            .replace(/<!--[\s\S]*?-->/g, '')
            .replace(/<[^>]+>/g, ' '),
    )
        .replace(/\s+/g, ' ')
        .trim();

    facts.textHash = sha256(text);
    facts.bagHash = sha256(text.split(' ').sort().join(' '));
    if (keepText) facts.text = text;
    return facts;
}
