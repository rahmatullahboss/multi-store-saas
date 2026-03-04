export const R2_BASE_URL = process.env.R2_ASSETS_URL;
if (!R2_BASE_URL) {
    console.warn('Warning: R2_ASSETS_URL is missing. Assets may not load.');
}
export const ASSETS = {
    // Brand Assets
    brand: {
        logoWhite: '/brand/ozzyl-logo-white-extracted.png',
        logoGreen: `${R2_BASE_URL}/brand/logo-green.png`,
        icon: `${R2_BASE_URL}/brand/icon.png`,
        iconWhite: `${R2_BASE_URL}/brand/icon-white.png`,
        logoWhiteSmall: `${R2_BASE_URL}/brand/logo-white-small.png`,
        logoWhiteXs: `${R2_BASE_URL}/brand/logo-white-xs.png`,
        logoSmall: `${R2_BASE_URL}/brand/ozzyl-logo-small.png`,
        logoSmallBlack: `${R2_BASE_URL}/brand/ozzyl-logo-small-black.webp`,
    },
    // Founder Assets
    founder: {
        // We upload both, can choose one. WebP is preferred for web.
        main: `${R2_BASE_URL}/images/founder.webp`,
        fallback: `${R2_BASE_URL}/images/founder.jpg`,
    },
};
