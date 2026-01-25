/**
 * i18next-parser Configuration for Multi-Store SaaS
 * 
 * This configuration helps:
 * 1. Extract translation keys from source code
 * 2. Sync EN and BN translation files
 * 3. Detect missing translations
 * 
 * Usage:
 *   npm run i18n:extract      - Extract keys and update locale files
 *   npm run i18n:extract:dry  - Preview changes without modifying files
 */

export default {
  // Context separator used in keys
  contextSeparator: '_',

  // Create old catalog backup
  createOldCatalogs: false,

  // Default namespace
  defaultNamespace: 'common',

  // Default value for new keys
  defaultValue: (locale, namespace, key) => {
    if (locale === 'en') {
      return key; // Use key as default for English
    }
    return `[TODO: ${key}]`; // Mark Bengali as TODO
  },

  // Indentation in output files
  indentation: 2,

  // Source files to scan
  input: [
    'app/**/*.{ts,tsx}',
    '!app/**/*.test.{ts,tsx}',
    '!app/**/*.spec.{ts,tsx}',
    '!app/tests/**',
  ],

  // Keep removed keys (set to false to clean up)
  keepRemoved: true,

  // Key separator (false = flat keys)
  keySeparator: false,

  // Lexers for different file types
  lexers: {
    ts: ['JavascriptLexer'],
    tsx: ['JsxLexer'],
    default: ['JavascriptLexer'],
  },

  // Line ending
  lineEnding: 'auto',

  // Supported locales
  locales: ['en', 'bn'],

  // Namespace separator
  namespaceSeparator: ':',

  // Output path
  output: 'public/locales/$LOCALE/$NAMESPACE.json',

  // Plural separator
  pluralSeparator: '_',

  // Sort keys in output
  sort: true,

  // Skip default values
  skipDefaultValues: false,

  // Use keys as default value
  useKeysAsDefaultValue: false,

  // Verbose output
  verbose: true,

  // Fail on warnings (for CI)
  failOnWarnings: false,

  // Fail on update (for CI)
  failOnUpdate: false,

  // Reset default value locale
  resetDefaultValueLocale: null,

  // Custom transform for i18next
  i18nextOptions: {
    compatibilityJSON: 'v4',
  },

  // Functions to look for
  // These are the translation function names used in your code
  // t() from useTranslation hook
  func: {
    list: ['t', 'i18next.t', 'i18n.t'],
    extensions: ['.ts', '.tsx'],
  },

  // Trans component
  trans: {
    component: 'Trans',
    i18nKey: 'i18nKey',
    defaultsKey: 'defaults',
    extensions: ['.tsx'],
    fallbackKey: false,
    acorn: {
      ecmaVersion: 2020,
      sourceType: 'module',
      jsx: true,
    },
  },
};
