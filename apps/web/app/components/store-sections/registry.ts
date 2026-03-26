/**
 * store-sections/registry — Compatibility Shim
 * 
 * The full store-sections system has been removed as part of the
 * headless theme architecture transition. This file provides minimal
 * type exports so that existing templates can compile without changes.
 * 
 * Templates should be migrated to use their own inline section components
 * instead of the dynamic SECTION_REGISTRY pattern.
 * 
 * @deprecated Will be removed in a future cleanup pass
 */

import type { ComponentType } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SectionSettings = Record<string, any>;

export interface StoreSection {
  type: string;
  title: string;
  enabled: boolean;
  settings: SectionSettings;
}

// Empty registry — no dynamic sections available
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SECTION_REGISTRY: Record<string, ComponentType<any>> = {};

// Empty defaults — templates should render their own built-in sections
export const DEFAULT_SECTIONS: StoreSection[] = [];
