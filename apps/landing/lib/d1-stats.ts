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
  const fallbackStats = {
    totalUsers: 120, // Approximate starting numbers
    totalStores: 85,
    uptime: 99.9,
  };

  if (!accountId || !databaseId || !apiToken) {
    console.warn('ClickHouse D1 API credentials missing. Using fallback stats.');
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
      next: { revalidate: 300 }, // Cache for 5 minutes
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
    
    return {
      totalUsers: Number(row.user_count) || fallbackStats.totalUsers,
      totalStores: Number(row.store_count) || fallbackStats.totalStores,
      uptime: 99.9,
    };
  } catch (error) {
    console.error('Error fetching D1 stats:', error);
    return fallbackStats;
  }
}
