/**
 * Marketing Stats API - Real-time platform statistics
 * 
 * Returns actual counts from database for marketing landing page:
 * - Total users (signups)
 * - Total stores created
 * - Recent signups (last 5 users)
 * - Uptime (hardcoded 99.9% for now)
 */

import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { count, desc } from 'drizzle-orm';
import { users, stores } from '@db/schema';

// Cache for 60 seconds
export const headers = () => ({
  'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=300',
});

// Bangladesh city names for masking user locations
const BD_CITIES = ['ঢাকা', 'চট্টগ্রাম', 'সিলেট', 'রাজশাহী', 'খুলনা', 'বরিশাল', 'রংপুর', 'ময়মনসিংহ'];

// Helper to get relative time in Bangla
function getRelativeTimeBn(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  
  if (diffMins < 1) return 'এইমাত্র';
  if (diffMins < 60) return `${diffMins} মিনিট আগে`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} ঘণ্টা আগে`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} দিন আগে`;
}

// Helper to mask name (show first letter + masked)
function maskName(name: string | null): string {
  if (!name) return 'একজন উদ্যোক্তা';
  const firstName = name.split(' ')[0];
  if (firstName.length <= 2) return firstName + '***';
  return firstName.charAt(0) + '***' + firstName.charAt(firstName.length - 1);
}

export interface MarketingStats {
  totalUsers: number;
  totalStores: number;
  uptime: number;
  recentSignups: Array<{
    name: string;
    city: string;
    timeAgo: string;
  }>;
}

export async function loader({ context }: LoaderFunctionArgs): Promise<Response> {
  const { cloudflare } = context;
  
  if (!cloudflare?.env?.DB) {
    return json({ 
      error: 'Database not available',
      totalUsers: 0,
      totalStores: 0,
      uptime: 99.9,
      recentSignups: [],
    }, { status: 503 });
  }
  
  const db = drizzle(cloudflare.env.DB);
  
  try {
    // Fetch counts in parallel
    const [userCountResult, storeCountResult, recentUsersResult] = await Promise.all([
      // Total users
      db.select({ count: count() }).from(users),
      // Total stores
      db.select({ count: count() }).from(stores),
      // Last 5 signups
      db.select({
        name: users.name,
        createdAt: users.createdAt,
      })
        .from(users)
        .orderBy(desc(users.createdAt))
        .limit(5),
    ]);
    
    const totalUsers = userCountResult[0]?.count ?? 0;
    const totalStores = storeCountResult[0]?.count ?? 0;
    
    // Format recent signups (mask names, use random cities)
    const recentSignups = recentUsersResult.map((user, index) => ({
      name: maskName(user.name),
      city: BD_CITIES[index % BD_CITIES.length],
      timeAgo: user.createdAt ? getRelativeTimeBn(user.createdAt) : 'সম্প্রতি',
    }));
    
    const stats: MarketingStats = {
      totalUsers,
      totalStores,
      uptime: 99.9, // Hardcoded for now
      recentSignups,
    };
    
    return json(stats);
    
  } catch (error) {
    console.error('[api.marketing-stats] Error:', error);
    
    // Return fallback data on error
    return json({
      totalUsers: 0,
      totalStores: 0,
      uptime: 99.9,
      recentSignups: [],
    }, { status: 500 });
  }
}


export default function() {}
