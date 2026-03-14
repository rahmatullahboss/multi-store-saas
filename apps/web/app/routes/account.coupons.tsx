import { json, type LoaderFunctionArgs, type SerializeFrom } from '@remix-run/cloudflare';
import { useLoaderData, Link } from '@remix-run/react';
import { resolveStore } from '~/lib/store.server';
import { getAvailableCoupons } from '~/services/customer-account.server';
import {
  Ticket,
  Copy,
  Check,
  ShoppingBag,
  Calendar
} from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/Badge';
import { useTranslation } from '~/contexts/LanguageContext';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '@db/schema';
import { toast } from 'sonner';
import { useState } from 'react';
import { format, isAfter, isBefore } from 'date-fns';
import { cn } from '~/lib/utils';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeContext = await resolveStore(context, request);
  if (!storeContext) throw new Response('Store not found', { status: 404 });

  const { storeId, store } = storeContext;
  const env = context.cloudflare.env;
  
  // Note: Coupons are public for the store, but usually we show them inside account too
  // Implementation plan puts it in account section
  const db = drizzle(env.DB, { schema });
  const coupons = await getAvailableCoupons(storeId, db);

  return json({ 
    coupons, 
    storeCurrency: store.currency 
  });
}

interface CouponCardProps {
  coupon: SerializeFrom<typeof schema.discounts.$inferSelect>;
  currency: string;
  isExpired?: boolean;
}


function CouponCard({ coupon, currency, isExpired }: CouponCardProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    toast.success(t('couponCopied'));
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn(
      "relative group flex flex-col sm:flex-row bg-card border rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-md",
      isExpired && "opacity-60 grayscale-[0.5]"
    )}>
      {/* Left Side - Discount Area */}
      <div className={cn(
        "p-6 flex flex-col items-center justify-center text-center sm:w-48 shrink-0 relative overflow-hidden",
        isExpired 
          ? "bg-muted text-muted-foreground" 
          : "bg-gradient-to-br from-primary/10 to-primary/5 text-primary"
      )}>
        <div className="relative z-10">
          <h3 className="text-3xl font-bold tracking-tight">
            {coupon.type === 'percentage' ? `${coupon.value}%` : `${currency}${coupon.value}`}
          </h3>
          <span className="text-xs font-medium uppercase tracking-wider opacity-80">{t('off')}</span>
        </div>
        
        {/* Decorative Circles for Ticket Effect */}
        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-background border border-border/50" />
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-background border border-border/50 sm:block hidden" />
        
        {/* Dashed Separator for Mobile */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] w-full border-b border-dashed border-border/50 sm:hidden" />
      </div>

      {/* Dashed Separator for Desktop */}
      <div className="hidden sm:block w-[1px] border-l border-dashed border-border/50 relative my-3"></div>

      {/* Right Side - Details */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="font-semibold text-lg">{coupon.code}</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {coupon.minOrderAmount 
                  ? `${t('minOrder')}: ${currency}${coupon.minOrderAmount}` 
                  : t('noMinOrder')}
              </p>
            </div>
            {isExpired && (
               <Badge variant="outline" className="border-red-200 text-red-700 bg-red-50">
                 {t('expired')}
               </Badge>
            )}
          </div>
          
          <div className="mt-4 flex flex-wrap gap-y-2 gap-x-4 text-xs text-muted-foreground">
            {coupon.expiresAt && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>{t('expires')}: {format(new Date(coupon.expiresAt as string), 'MMM d, yyyy')}</span>
              </div>
            )}
            {coupon.maxDiscountAmount && (
                <div className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                    <span>{t('maxDiscount') || 'Max discount'}: {currency}{coupon.maxDiscountAmount}</span>
                </div>
            )}
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-border/30 flex items-center justify-between gap-4">
          <div className="text-xs text-muted-foreground">
             {coupon.maxUses ? `${coupon.usedCount}/${coupon.maxUses} ${t('used') || 'used'}` : (t('unlimitedUsage') || 'Unlimited usage')}
          </div>
          <Button 
            size="sm" 
            variant={copied ? "default" : "outline"} 
            className={cn(
                "h-8 gap-2 transition-all",
                copied && "bg-green-600 hover:bg-green-700 text-white border-transparent"
            )}
            onClick={handleCopy}
            disabled={isExpired}
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                {t('copied')}
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                {t('copyCode')}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AccountCoupons() {
  const { coupons, storeCurrency } = useLoaderData<typeof loader>();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'available' | 'expired'>('available');

  const now = new Date();
  
  const availableCoupons = coupons.filter(c => 
    !c.expiresAt || isAfter(new Date(c.expiresAt as string), now)
  );
  
  const expiredCoupons = coupons.filter(c => 
    c.expiresAt && isBefore(new Date(c.expiresAt as string), now)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {t('couponsAndOffers')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('couponsDesc')}
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-full">
          <Link to="/products">
            <ShoppingBag className="h-4 w-4 mr-2" />
            {t('startShoppingBtn')}
          </Link>
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b">
        <button
            onClick={() => setActiveTab('available')}
            className={cn(
                "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                activeTab === 'available' 
                    ? "border-primary text-primary" 
                    : "border-transparent text-muted-foreground hover:text-foreground"
            )}
        >
            {t('available')} ({availableCoupons.length})
        </button>
        <button
            onClick={() => setActiveTab('expired')}
            className={cn(
                "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                activeTab === 'expired' 
                    ? "border-primary text-primary" 
                    : "border-transparent text-muted-foreground hover:text-foreground"
            )}
        >
            {t('expired')} ({expiredCoupons.length})
        </button>
      </div>

      <div className="min-h-[300px]">
        {activeTab === 'available' ? (
            availableCoupons.length > 0 ? (
                <div className="grid gap-6 lg:grid-cols-2">
                    {availableCoupons.map(coupon => (
                        <CouponCard key={coupon.id} coupon={coupon} currency={storeCurrency || 'USD'} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <div className="p-4 rounded-full bg-muted/50 mb-4">
                        <Ticket className="h-8 w-8 opacity-40" />
                    </div>
                    <p className="font-medium">{t('noActiveCoupons')}</p>
                    <p className="text-sm mt-1 max-w-xs">{t('checkBackLater')}</p>
                </div>
            )
        ) : (
            expiredCoupons.length > 0 ? (
                <div className="grid gap-6 lg:grid-cols-2 opacity-80">
                    {expiredCoupons.map(coupon => (
                        <CouponCard key={coupon.id} coupon={coupon} currency={storeCurrency || 'USD'} isExpired />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <p>{t('noExpiredCoupons')}</p>
                </div>
            )
        )}
      </div>
    </div>
  );
}
