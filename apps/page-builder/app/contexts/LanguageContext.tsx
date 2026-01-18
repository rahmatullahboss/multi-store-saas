/**
 * Language Context Stub for Page Builder Worker
 * 
 * Simple stub that returns the key as-is for standalone deployment.
 * In production, this would be replaced with actual i18n integration.
 */

export function useTranslation() {
  return {
    t: (key: string) => key,
    language: 'en',
  };
}

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};
