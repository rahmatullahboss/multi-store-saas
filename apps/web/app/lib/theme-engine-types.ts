// Legacy type exports - these types were previously in theme-engine
// Now archived in dev/shopify-os2/

export interface ThemeConfig {
  primaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  storeName?: string;
  logo?: string;
  tagline?: string;
  description?: string;
  storeTemplateId?: string;
  [key: string]: unknown;
}

export interface SectionInstance {
  id: string;
  type: string;
  settings: Record<string, unknown>;
  blocks?: BlockInstance[];
  disabled?: boolean;
}

export interface BlockInstance {
  id: string;
  type: string;
  settings: Record<string, unknown>;
}
