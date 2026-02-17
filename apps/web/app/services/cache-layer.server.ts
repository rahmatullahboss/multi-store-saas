/**
 * D1-backed Caching Layer
 *
 * Redis-like caching implementation using D1 for persistent,
 * edge-optimized storage of data objects.
 */

import { cacheStore } from '@db/schema';
import { eq, sql } from 'drizzle-orm';
import type { Database } from '~/lib/db.server';

export class D1Cache {
  private db: Database;
  private defaultTTL = 60; // 60 seconds - reduced for faster settings propagation (was 300)

  constructor(db: Database) {
    this.db = db;
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    const result = await this.db.query.cacheStore.findFirst({
      where: (cache, { eq }) => eq(cache.key, key),
    });

    if (!result) return null;

    const now = Math.floor(Date.now() / 1000);
    if (now > result.expiresAt) {
      await this.delete(key); // Cleanup expired
      return null;
    }

    try {
      return JSON.parse(result.value) as T;
    } catch (e) {
      console.error(`[CACHE] Parse error for key ${key}:`, e);
      return null;
    }
  }

  /**
   * Set value in cache with optional TTL
   */
  async set(key: string, value: any, ttl = this.defaultTTL) {
    const expiresAt = Math.floor(Date.now() / 1000) + ttl;

    await this.db
      .insert(cacheStore)
      .values({
        key,
        value: JSON.stringify(value),
        expiresAt,
      })
      .onConflictDoUpdate({
        target: cacheStore.key,
        set: {
          value: JSON.stringify(value),
          expiresAt,
        },
      });
  }

  /**
   * Delete specific key from cache
   */
  async delete(key: string) {
    await this.db.delete(cacheStore).where(eq(cacheStore.key, key));
  }

  /**
   * bulk invalidation using LIKE pattern
   */
  async invalidatePattern(pattern: string) {
    await this.db.delete(cacheStore).where(sql`${cacheStore.key} LIKE ${`%${pattern}%`}`);
  }
}
