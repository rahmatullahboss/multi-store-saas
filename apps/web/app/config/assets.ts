// Use environment variable or fallback to R2 public URL
export const R2_BASE_URL =
  typeof process !== 'undefined' && process.env.R2_PUBLIC_URL
    ? process.env.R2_PUBLIC_URL
    : 'https://pub-bec31ee88a08441a8824ab94bb973c04.r2.dev';

export const ASSETS = {
  // Brand Assets
  brand: {
    logoWhite: `${R2_BASE_URL}/brand/logo-white.png`,
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
    main: `${R2_BASE_URL}/images/founder.webp`,
    fallback: `${R2_BASE_URL}/images/founder.jpg`,
  },
};
