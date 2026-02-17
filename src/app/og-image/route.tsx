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

    // Load the image from the public folder
    // Note: In Edge runtime, we use fetch with a URL relative to import.meta.url or an absolute URL
    // Since public files are static, we need to correct the path.
    // For local dev/build, the safest way often involves constructing the URL.

    // Attempting to resolve the image relative to this file
    // src/app/og-image/route.tsx -> ../../../public/og_image.png
    const imagePath = new URL('../../../public/og_image.png', import.meta.url);
    const imageData = await fetch(imagePath).then((res) => res.arrayBuffer());

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
