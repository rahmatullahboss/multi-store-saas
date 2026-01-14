import { useState, useEffect, useCallback } from 'react';

interface FetchState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
}

/**
 * useFetchData
 * 
 * Best Practices:
 * 1. strict typing for response Data (Generics).
 * 2. cleanup function (abortController) to prevent race conditions.
 * 3. useCallback for refetch to maintain referential identity.
 * 4. Error boundaries safe.
 */
export function useFetchData<T>(url: string, options?: RequestInit) {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    error: null,
    isLoading: true,
  });

  const fetchData = useCallback(async (signal?: AbortSignal) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const res = await fetch(url, { ...options, signal });
      if (!res.ok) {
        throw new Error(`HTTP Error: ${res.status}`);
      }
      const jsonData = await res.json();
      setState({ data: jsonData, error: null, isLoading: false });
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      
      setState({ 
        data: null, 
        error: err instanceof Error ? err : new Error('Unknown Error'), 
        isLoading: false 
      });
    }
  }, [url, options]); // Careful with options object dependency!

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, [fetchData]);

  return { ...state, refetch: () => fetchData() };
}
