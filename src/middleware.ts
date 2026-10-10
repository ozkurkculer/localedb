import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
    const response = intlMiddleware(request);

    // OpenNext serves prerendered HTML and RSC with `s-maxage=31536000`. A shared cache that honours
    // it could keep a page for a year, pointing at `_next/static` chunks a later deploy no longer
    // has. Pages are revalidated on every request instead (what Vercel used to send). Redirects
    // keep their own headers.
    if (response.status < 300) {
        response.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
    }

    return response;
}

export const config = {
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next`, or `/og-image`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    matcher: ['/((?!api|_next|og-image|.*\\..*).*)']
};
