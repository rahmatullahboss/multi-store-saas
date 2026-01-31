export interface D1Stats {
  totalUsers: number;
  totalStores: number;
  uptime: number;
}

export async function getLiveStats(): Promise<D1Stats> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const databaseId = process.env.CLOUDFLARE_DATABASE_ID;
  const apiToken = process.env.CLOUDFLARE_D1_API_TOKEN;

  // Default fallback stats if config is missing (prevents build fail)
  // IMPORTANT: These should be 0 or very low to avoid showing inflated numbers
  // when the API fails. Real data is always preferred.
  const fallbackStats = {
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
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sql: `
          SELECT 
            (SELECT COUNT(*) FROM users) as user_count,
            (SELECT COUNT(*) FROM stores) as store_count;
        `,
      }),
      next: { revalidate: 60 }, // Cache for 1 minute (was 5 minutes - too long)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch D1 stats:', response.status, errorText);
      return fallbackStats;
    }

    const data = await response.json();

    // Cloudflare D1 API response structure:
    // { result: [{ results: [{ user_count: 10, store_count: 5 }], meta: ... }], ... }
    
    // Check if the query was successful
    if (!data.success || !data.result || !data.result[0] || !data.result[0].results) {
      console.error('Invalid D1 API response:', JSON.stringify(data));
      return fallbackStats;
    }

    const row = data.result[0].results[0];
    
    // Log actual values for debugging
    console.log('[getLiveStats] Fetched from D1:', {
      user_count: row.user_count,
      store_count: row.store_count,
    });
    
    return {
      totalUsers: Number(row.user_count) || 0,
      totalStores: Number(row.store_count) || 0,
      uptime: 99.9,
    };
  } catch (error) {
    console.error('Error fetching D1 stats:', error);
    return fallbackStats;
  }
}
