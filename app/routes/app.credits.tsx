import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData, useFetcher, useNavigation } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { stores } from '@db/schema';
import { getSession } from '~/services/auth.server';
import { addCredits, getCreditHistory } from '~/utils/credit.server';
import { Crown, Sparkles, CreditCard, Check, Zap, Coins, History, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { useTranslation } from '~/contexts/LanguageContext';

// Pricing Packages for Credits
const CREDIT_PACKAGES = [
  { id: 'starter', credits: 500, price: 500, name: 'Starter', popular: false },
  { id: 'pro', credits: 1500, price: 1200, name: 'Pro Value', popular: true },
  { id: 'business', credits: 5000, price: 3000, name: 'Agency', popular: false },
];

export const meta = () => [
  { title: 'AI Credits - Multi-Store SaaS' },
];

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { env } = context.cloudflare;
  const session = await getSession(request, env);
  const storeId = session.get('storeId');

  if (!storeId) {
    throw new Error('Unauthorized');
  }

  const db = drizzle(env.DB);
  const store = await db
    .select({ aiCredits: stores.aiCredits })
    .from(stores)
    .where(eq(stores.id, storeId))
    .get();

  const history = await getCreditHistory(db, storeId, 30);

  return json({ 
    credits: store?.aiCredits || 0,
    packages: CREDIT_PACKAGES,
    history 
  });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const { env } = context.cloudflare;
  const session = await getSession(request, env);
  const storeId = session.get('storeId');

  if (!storeId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = drizzle(env.DB);
  const formData = await request.formData();
  const packageId = formData.get('packageId') as string;

  const selectedPackage = CREDIT_PACKAGES.find(p => p.id === packageId);
  if (!selectedPackage) {
    return json({ error: 'Invalid package' }, { status: 400 });
  }

  // MOCK PAYMENT Gateway Logic Here
  // In real app: Redirect to bKash/Stripe/SSLCommerz
  // For now: Instantly add credits
  
  const result = await addCredits(
    db, 
    storeId, 
    selectedPackage.credits, 
    'purchase',
    `Purchased ${selectedPackage.name} Package`
  );

  if (result.success) {
    return json({ success: true, newBalance: result.newBalance, added: selectedPackage.credits });
  } else {
    return json({ error: 'Failed to add credits' }, { status: 500 });
  }
}

export default function AICreditsPage() {
  const { t } = useTranslation();
  const { credits, packages, history } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const navigation = useNavigation();

  useEffect(() => {
    const data = fetcher.data as { success?: boolean; added?: number } | null | undefined;
    if (data?.success) {
      toast.success(t('addedCreditsMsg', { added: data.added }));
    }
  }, [fetcher.data]);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-purple-600" />
            {t('aiCredits')}
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
             {t('aiCreditsSubtitle')}
          </p>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl w-full md:w-auto min-w-[300px] hover:scale-105 transition-transform duration-300">
          <div className="text-violet-200 font-medium mb-1 flex items-center gap-2">
            <Coins className="w-5 h-5" />
            {t('availableBalance')}
          </div>
          <div className="text-5xl font-bold mb-2 tracking-tight">
            {credits}
          </div>
          <div className="text-violet-200 text-sm opacity-80">
            {t('creditsNeverExpire')}
          </div>
        </div>
      </div>

      {/* Packages Grid */}
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Zap className="w-5 h-5 text-yellow-500" />
        {t('topUpCredits')}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {packages.map((pkg) => (
          <div 
            key={pkg.id} 
            className={`
              relative bg-white rounded-2xl border transition-all duration-300
              ${pkg.popular 
                ? 'border-violet-500 shadow-violet-200 shadow-lg scale-105 z-10' 
                : 'border-gray-200 hover:border-violet-300 hover:shadow-lg'
              }
            `}
          >
            {pkg.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-md">
                <Crown className="w-3 h-3" />
                {t('bestValue')}
              </div>
            )}

            <div className="p-8">
              <h3 className="text-lg font-semibold text-gray-500 mb-2">{pkg.name}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-gray-900">{pkg.credits}</span>
                <span className="text-gray-500 font-medium">{t('creditsLabel')}</span>
              </div>
              
              <div className="mb-8">
                 <span className="text-3xl font-bold text-violet-600">৳{pkg.price}</span>
                 <span className="text-gray-400 text-sm ml-2">BDT</span>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-gray-600">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  {t('generateStores')}
                </li>
                 <li className="flex items-center gap-3 text-gray-600">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  {t('writeProductDescriptions')}
                </li>
                 <li className="flex items-center gap-3 text-gray-600">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  {t('designLandingPages')}
                </li>
              </ul>

              <fetcher.Form method="post">
                <input type="hidden" name="packageId" value={pkg.id} />
                <button
                  type="submit"
                  disabled={fetcher.state !== 'idle'}
                  className={`
                    w-full py-4 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2
                    ${pkg.popular 
                      ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-lg hover:shadow-violet-200' 
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-900 border border-gray-200'
                    }
                  `}
                >
                  {fetcher.state !== 'idle' ? (
                     <span className="animate-pulse">{t('processing')}</span>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      {t('buyNow')}
                    </>
                  )}
                </button>
              </fetcher.Form>
            </div>
          </div>
        ))}
      </div>
      
      {/* FAQ / Info */}
      <div className="mt-16 bg-gray-50 rounded-2xl p-8 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">{t('howMuchDoesItCost')}</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4 bg-white rounded-xl shadow-sm">
                <div className="font-semibold text-gray-800 mb-1">{t('storeSetup')}</div>
                <div className="text-violet-600 font-bold">50 Credits</div>
            </div>
             <div className="p-4 bg-white rounded-xl shadow-sm">
                <div className="font-semibold text-gray-800 mb-1">{t('fullLandingPage')}</div>
                <div className="text-violet-600 font-bold">30 Credits</div>
            </div>
             <div className="p-4 bg-white rounded-xl shadow-sm">
                <div className="font-semibold text-gray-800 mb-1">{t('pageSection')}</div>
                <div className="text-violet-600 font-bold">20 Credits</div>
            </div>
             <div className="p-4 bg-white rounded-xl shadow-sm">
                <div className="font-semibold text-gray-800 mb-1">{t('textEdit')}</div>
                <div className="text-violet-600 font-bold">5 Credits</div>
            </div>
        </div>
      </div>
      {/* Transaction History */}
      <div className="mt-16">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <History className="w-5 h-5 text-slate-500" />
          {t('transactionHistory')}
        </h2>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('type')}</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('description')}</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('amount')}</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('date')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                      {t('noTransactionHistory')}
                    </td>
                  </tr>
                ) : (
                  history.map((log: any) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                         <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                           log.type === 'purchase' || log.type === 'bonus' 
                             ? 'bg-green-100 text-green-700' 
                             : 'bg-slate-100 text-slate-600'
                         }`}>
                           {log.amount > 0 ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                           {log.type}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {log.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`font-mono font-medium ${
                          log.amount > 0 ? 'text-green-600' : 'text-slate-600'
                        }`}>
                          {log.amount > 0 ? '+' : ''}{log.amount}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-400">
                        {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
