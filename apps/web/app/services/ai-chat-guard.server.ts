export type UserLanguage = 'bn' | 'en';

const METRIC_KEYWORDS_BN = [
  'সেল',
  'বিক্রি',
  'রেভিনিউ',
  'রেভেনিউ',
  'আয়',
  'লাভ',
  'অর্ডার',
  'পারফরম্যান্স',
  'স্ট্যাট',
  'স্ট্যাটস',
  'মেট্রিক',
  'গ্রোথ',
  'বিজনেস',
  'ব্যবসা',
  'অ্যাকটিভ',
  'ইউজার',
  'সাবস্ক্রাইবার',
];

const METRIC_KEYWORDS_EN = [
  'sales',
  'revenue',
  'profit',
  'orders',
  'performance',
  'stats',
  'metrics',
  'growth',
  'business',
  'active users',
  'subscribers',
  'mrr',
];

export function detectLanguage(message: string): UserLanguage {
  return /[\u0980-\u09FF]/.test(message) ? 'bn' : 'en';
}

export function isMetricsQuestion(message: string): boolean {
  const text = message.toLowerCase();
  return METRIC_KEYWORDS_BN.some((k) => text.includes(k)) || METRIC_KEYWORDS_EN.some((k) => text.includes(k));
}

export function formatBdt(amount: number, lang: UserLanguage = 'bn'): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  const locale = lang === 'bn' ? 'bn-BD' : 'en-US';
  return `৳${safe.toLocaleString(locale)}`;
}

export function buildInsightCardResponse(
  data: { totalSales: number; orderCount: number; trend: number; suggestions: string[] },
  lang: UserLanguage = 'bn'
): string {
  return JSON.stringify({
    type: 'insight_card',
    data: {
      totalSales: formatBdt(data.totalSales, lang),
      orderCount: data.orderCount,
      trend: Math.round(data.trend),
      suggestions: data.suggestions,
    },
  });
}

