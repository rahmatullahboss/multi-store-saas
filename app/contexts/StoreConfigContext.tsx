
/**
 * Store Configuration Context
 * 
 * Provides global access to store configuration (ThemeConfig) 
 * to allow deep components (like ProductCards) to access global settings
 * like Flash Sales without prop drilling.
 */

import { createContext, useContext, ReactNode } from 'react';
import type { ThemeConfig } from '@db/types';

interface StoreConfigContextValue {
  config: ThemeConfig | null;
}

const StoreConfigContext = createContext<StoreConfigContextValue | undefined>(undefined);

export function StoreConfigProvider({ 
  children, 
  config 
}: { 
  children: ReactNode; 
  config: ThemeConfig | null;
}) {
  return (
    <StoreConfigContext.Provider value={{ config }}>
      {children}
    </StoreConfigContext.Provider>
  );
}

export function useStoreConfig(): StoreConfigContextValue {
  const context = useContext(StoreConfigContext);
  // It's okay to be undefined if used outside, but we should probably warn or return null defaults
  // For now, if undefined, we assume no config context (optional usage)
  if (context === undefined) {
    return { config: null };
  }
  return context;
}
