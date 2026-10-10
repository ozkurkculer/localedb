import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
    const response = intlMiddleware(request);

    // The Cloudflare Worker is also reachable on *.workers.dev (and its preview
    // URLs). Canonical already points at localedb.org; this keeps the duplicate
    // host out of search indexes. No effect on localedb.org or Vercel.
    if (request.nextUrl.hostname.endsWith('.workers.dev')) {
        response.headers.set('X-Robots-Tag', 'noindex');
    }

    return response;
}

export const config = {
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next`, `/_vercel`, or `/og-image`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    matcher: ['/((?!api|_next|_vercel|og-image|.*\\..*).*)']
};
