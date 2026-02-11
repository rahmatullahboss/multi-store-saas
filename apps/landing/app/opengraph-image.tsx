import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Ozzyl - Launch Your Online Store in 5 Minutes';
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: 'linear-gradient(to bottom right, #0A0A0F, #1A1A2E)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontFamily: 'sans-serif',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 40,
                    }}
                >
                    {/* Logo container if needed, or just text */}
                    <div
                        style={{
                            fontSize: 60,
                            fontWeight: 'bold',
                            background: 'linear-gradient(to right, #4CAF50, #2E7D32)',
                            backgroundClip: 'text',
                            color: 'transparent',
                            display: 'flex',
                        }}
                    >
                        Ozzyl
                    </div>
                </div>
                <div
                    style={{
                        fontSize: 64,
                        fontWeight: 'bold',
                        textAlign: 'center',
                        marginBottom: 20,
                        backgroundImage: 'linear-gradient(90deg, #fff, #aaa)',
                        backgroundClip: 'text',
                        color: 'transparent',
                        maxWidth: 1000,
                        lineHeight: 1.1,
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    Launch Your Online Store
                    <br /> in 5 Minutes
                </div>
                <div
                    style={{
                        fontSize: 32,
                        color: '#888',
                        textAlign: 'center',
                        maxWidth: 900,
                        marginTop: 10,
                        display: 'flex',
                    }}
                >
                    Professional E-commerce Platform | No Coding Required
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
