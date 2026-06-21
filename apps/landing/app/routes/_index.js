import { jsx as _jsx } from "react/jsx-runtime";
import { useLoaderData } from '@remix-run/react';
import { MarketingLanding } from '@/components/MarketingLanding';
export const meta = () => [
    { title: 'Ozzyl - Launch Your Online Store in 5 Minutes' },
    {
        name: 'description',
        content: 'Create your professional e-commerce store with custom subdomain, payment integration, and powerful dashboard. No coding required.',
    },
    { property: 'og:url', content: 'https://ozzyl.com' },
    { name: 'robots', content: 'index, follow' },
];
export async function loader({ request }) {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const databaseId = process.env.CLOUDFLARE_DATABASE_ID;
    const apiToken = process.env.CLOUDFLARE_D1_API_TOKEN;
    const fallbackStats = { totalUsers: 0, totalStores: 0, uptime: 99.9 };
    if (!accountId || !databaseId || !apiToken) {
        return { stats: fallbackStats };
    }
    try {
        const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`;
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sql: `SELECT (SELECT COUNT(*) FROM users) as user_count, (SELECT COUNT(*) FROM stores) as store_count;`,
            }),
        });
        if (!response.ok)
            return { stats: fallbackStats };
        const data = await response.json();
        if (!data.success || !data.result?.[0]?.results?.[0]) {
            return { stats: fallbackStats };
        }
        const row = data.result[0].results[0];
        return {
            stats: {
                totalUsers: Number(row.user_count) || 0,
                totalStores: Number(row.store_count) || 0,
                uptime: 99.9,
            },
        };
    }
    catch {
        return { stats: fallbackStats };
    }
}
export default function Index() {
    const { stats } = useLoaderData();
    return (_jsx("div", { className: "flex flex-col min-h-screen", children: _jsx(MarketingLanding, { stats: stats }) }));
}
