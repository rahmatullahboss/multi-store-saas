
import { RemixI18Next } from "remix-i18next/server";
import i18n from "~/i18n"; // Your i18n configuration file
import { resolve } from "node:path";
import commonEn from "../../public/locales/en/common.json";
import commonBn from "../../public/locales/bn/common.json";

// You can create a new instance of RemixI18Next class
// and pass the configuration to the constructor
const i18next = new RemixI18Next({
  detection: {
    supportedLanguages: i18n.supportedLngs,
    fallbackLanguage: i18n.fallbackLng,
    // Order of detection: query param -> cookie -> session
    // We explicitly exclude 'header' to force Bengali as default for new users regardless of their browser settings
    order: ["searchParams", "cookie", "session"],
  },
  // This is the configuration for i18next used
  // when translating messages server-side only
  i18next: {
    ...i18n,
    resources: {
      en: { common: commonEn },
      bn: { common: commonBn },
    },
  },
  // The i18next plugins you want RemixI18next to use for
  // backend loading (locales)
  // plugins: [Backend],
});

export default i18next;
