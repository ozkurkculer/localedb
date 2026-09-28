import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

// export const runtime = 'edge'; // Disabled due to size limits
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    // Common params
    const title = searchParams.get('title') || 'LocaleDB';
    const subtitle = searchParams.get('subtitle') || 'The Localization Encyclopedia';
    // const mode = searchParams.get('mode') || 'site'; // site, country, currency
    // const icon = searchParams.get('icon') || '🌐';

    // Background image, fetched from the site's own static files. Node's fetch
    // cannot read file:// URLs, so resolving it next to this file failed with a 500.
    const imageData = await fetch(new URL('/og_image.png', request.url)).then((res) => res.arrayBuffer());

    return new ImageResponse(
        <div
            style={{
                display: 'flex',
                height: '100%',
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                fontFamily: 'sans-serif'
            }}
        >
            {/* Background Image */}
            <img
                src={imageData as any}
                width="1200"
                height="630"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                }}
            />
        </div>,
        {
            width: 1200,
            height: 630
        }
    );
}
