/**
 * @ozzyl/sdk — StoreResource
 *
 * Provides methods to interact with the /store endpoint of the Ozzyl API.
 */

import type { HttpClient } from '../client.js';
import type { Store } from '../types.js';

/**
 * Resource for reading your Ozzyl store's public information.
 *
 * @example
 * ```ts
 * const ozzyl = new Ozzyl('sk_live_...');
 * const store = await ozzyl.store.get();
 * console.log(store.name, store.currency);
 * ```
 */
export class StoreResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Retrieve the store associated with your API key.
   *
   * Returns core store information: name, subdomain, domain, branding,
   * currency, plan type and subscription status.
   *
   * Sensitive fields (payment credentials, internal config, secrets) are
   * never included in this response.
   *
   * Required scope: none (any valid API key can call this endpoint)
   *
   * @returns The store record for the authenticated API key.
   *
   * @example
   * ```ts
   * const store = await ozzyl.store.get();
   *
   * console.log(store.name);       // "My Awesome Store"
   * console.log(store.subdomain);  // "my-awesome-store"
   * console.log(store.currency);   // "BDT"
   * console.log(store.planType);   // "starter"
   * ```
   */
  async get(): Promise<Store> {
    const envelope = await this.http.get<{ success: true; data: Store }>('/store');
    return envelope.data;
  }
}
