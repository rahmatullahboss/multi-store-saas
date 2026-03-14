/**
 * RR7 Compatibility Shim
 *
 * React Router v7 removed the `json()` and `defer()` helpers.
 * This shim provides drop-in replacements using `Response.json()`.
 *
 * TODO: Gradually migrate call sites to return plain objects and remove this shim.
 */

type ResponseInit = {
  status?: number;
  statusText?: string;
  headers?: HeadersInit;
};

/**
 * Drop-in replacement for the removed `json()` helper.
 * Uses `Response.json()` under the hood.
 */
export function json<T>(data: T, init?: number | ResponseInit): Response {
  const responseInit: ResponseInit =
    typeof init === 'number' ? { status: init } : init || {};

  return Response.json(data, responseInit);
}

/**
 * Drop-in replacement for the removed `defer()` helper.
 * In RR7 with single-fetch, you can return promises directly from loaders.
 * This shim just returns the data as-is for compatibility.
 */
export function defer<T extends Record<string, unknown>>(
  data: T,
  init?: number | ResponseInit,
): T {
  // With single-fetch enabled, defer is a no-op — just return the data.
  // The framework handles streaming automatically.
  return data;
}
