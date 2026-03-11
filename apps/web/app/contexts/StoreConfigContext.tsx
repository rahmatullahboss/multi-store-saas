
/**
 * Store Configuration Context
 * 
 * Provides global access to store configuration (ThemeConfig) 
 * to allow deep components (like ProductCards) to access global settings
 * like Flash Sales without prop drilling.
 * 
 * Updated: Added shippingConfig for unified settings access
 */

import { createContext, useContext, ReactNode } from 'react';
import type { ThemeConfig } from '@db/types';
import { type ShippingConfig } from '~/services/storefront-settings.schema';

export interface StoreConfigContextValue {
  config: ThemeConfig | null;
  /** Shipping config from unified settings - single source of truth */
  shippingConfig: ShippingConfig | null;
}

const StoreConfigContext = createContext<StoreConfigContextValue | undefined>(undefined);

export function StoreConfigProvider({ 
  children, 
  config,
  shippingConfig = null
}: { 
  children: ReactNode; 
  config: ThemeConfig | null;
  /** Shipping config from unified settings */
  shippingConfig?: ShippingConfig | null;
}) {
  return (
    <StoreConfigContext.Provider value={{ config, shippingConfig }}>
      {children}
    </StoreConfigContext.Provider>
  );
}

export function useStoreConfig(): StoreConfigContextValue {
  const context = useContext(StoreConfigContext);
  // It's okay to be undefined if used outside, but we should probably warn or return null defaults
  // For now, if undefined, we assume no config context (optional usage)
  if (context === undefined) {
    return { config: null, shippingConfig: null };
  }
  return context;
}
