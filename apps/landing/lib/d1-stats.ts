import { cache } from 'react';

export interface D1Stats {
  totalUsers: number;
  totalStores: number;
  uptime: number;
}

// Cache the stats fetching with React.cache() for per-request deduplication
// This prevents multiple calls to the D1 API in a single request
export const getLiveStats = cache(async (): Promise<D1Stats> => {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const databaseId = process.env.CLOUDFLARE_DATABASE_ID;
  const apiToken = process.env.CLOUDFLARE_D1_API_TOKEN;

  // Default fallback stats - these will only show if API fails
  const fallbackStats: D1Stats = {
    totalUsers: 0,
    totalStores: 0,
    uptime: 99.9,
  };

  if (!accountId || !databaseId || !apiToken) {
    console.warn('D1 API credentials missing. Using fallback stats (0).');
    return fallbackStats;
  }

  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`;

  try {
    // Set cache headers to reduce API calls
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'max-age=60', // Cache for 1 minute on CDN
      },
      body: JSON.stringify({
        sql: `
          SELECT 
            (SELECT COUNT(*) FROM users) as user_count,
            (SELECT COUNT(*) FROM stores) as store_count;
        `,
      }),
      next: { revalidate: 60 }, // Next.js ISR cache for 1 minute
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch D1 stats:', response.status, errorText);
      return fallbackStats;
    }

    const data = await response.json();

    // Cloudflare D1 API response structure validation
    if (!data.success || !data.result?.[0]?.results?.[0]) {
      console.error('Invalid D1 API response structure');
      return fallbackStats;
    }

    const row = data.result[0].results[0];

    return {
      totalUsers: Number(row.user_count) || 0,
      totalStores: Number(row.store_count) || 0,
      uptime: 99.9,
    };
  } catch (error) {
    console.error('Error fetching D1 stats:', error);
    return fallbackStats;
  }
});
