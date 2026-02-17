import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    // Common params
    const title = searchParams.get('title') || 'LocaleDB';
    const subtitle = searchParams.get('subtitle') || 'The Localization Encyclopedia';
    const mode = searchParams.get('mode') || 'site'; // site, country, currency
    const icon = searchParams.get('icon') || '🌐'; // Emoji or text symbol

    // Font loading (optional, using system fonts for edge performance for now,
    // or default Next.og fonts which are Satori-compatible)

    return new ImageResponse(
        <div
            style={{
                height: '100%',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#09090b', // zinc-950
                color: '#fafafa', // zinc-50
                fontFamily: 'sans-serif',
                position: 'relative'
            }}
        >
            {/* Background Pattern */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage:
                        'radial-gradient(circle at 25px 25px, #27272a 2%, transparent 0%), radial-gradient(circle at 75px 75px, #27272a 2%, transparent 0%)',
                    backgroundSize: '100px 100px',
                    opacity: 0.5
                }}
            />

            {/* Content Container */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10,
                    padding: '40px',
                    textAlign: 'center'
                }}
            >
                {/* ICON SECTION */}
                {mode === 'country' && <div style={{ fontSize: 120, marginBottom: 20 }}>{icon}</div>}
                {mode === 'currency' && (
                    <div
                        style={{
                            fontSize: 120,
                            marginBottom: 20,
                            background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
                            backgroundClip: 'text',
                            color: 'transparent',
                            fontWeight: 800
                        }}
                    >
                        {icon}
                    </div>
                )}
                {mode === 'site' && (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 30
                        }}
                    >
                        {/* Simplified Logo Graphic for OG */}
                        <svg
                            width="120"
                            height="120"
                            viewBox="0 0 500 160"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                fill="#10b981"
                                d="M81.97,22.75v114.5c0,1.57,1.22,2.82,2.67,2.75c29.5-1.51,53-27.79,53-60s-23.49-58.49-53-60 C83.19,19.93,81.97,21.18,81.97,22.75z"
                            />
                            <path
                                fill="#34d399"
                                d="M75.67,137.25V22.75c0-1.57-1.22-2.82-2.67-2.75c-29.5,1.51-53,27.79-53,60s23.49,58.49,53,60 C74.45,140.07,75.67,138.82,75.67,137.25z"
                            />
                        </svg>
                    </div>
                )}

                {/* TITLE */}
                <div
                    style={{
                        fontSize: mode === 'site' ? 80 : 70,
                        fontWeight: 900,
                        letterSpacing: '-0.02em',
                        marginBottom: 10,
                        background: mode === 'site' ? 'linear-gradient(90deg, #fff 0%, #a1a1aa 100%)' : 'white',
                        backgroundClip: 'text',
                        color: mode === 'site' ? 'transparent' : 'white',
                        textShadow: '0 4px 8px rgba(0,0,0,0.3)'
                    }}
                >
                    {title}
                </div>

                {/* SUBTITLE */}
                <div
                    style={{
                        fontSize: 32,
                        color: '#a1a1aa', // zinc-400
                        fontWeight: 500,
                        maxWidth: '800px',
                        lineHeight: 1.4
                    }}
                >
                    {subtitle}
                </div>

                {/* BRAND FOOTER (for non-site modes) */}
                {mode !== 'site' && (
                    <div
                        style={{
                            position: 'absolute',
                            bottom: 40,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            fontSize: 24,
                            color: '#52525b', // zinc-600
                            fontWeight: 600
                        }}
                    >
                        <div style={{ width: 10, height: 10, background: '#10b981', borderRadius: '50%' }} />
                        LocaleDB
                    </div>
                )}
            </div>
        </div>,
        {
            width: 1200,
            height: 630
        }
    );
}
