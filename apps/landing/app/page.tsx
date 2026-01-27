import { MarketingLanding } from '@/components/MarketingLanding';
import { getLiveStats } from '@/lib/d1-stats';

// Revalidate every 5 minutes (300 seconds)
export const revalidate = 300;

export default async function Home() {
  const stats = await getLiveStats();

  return (
    <div className="flex flex-col min-h-screen">
      <MarketingLanding stats={stats} />
    </div>
  );
}
