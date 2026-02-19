import { Rocket, LayoutTemplate, LayoutDashboard, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useTranslation } from '~/contexts/LanguageContext';

export function FeatureCarousel() {
  const { t } = useTranslation();

  const features = [
    {
      icon: Rocket,
      title: t('auth:featureLaunchFast'),
      description: t('auth:descLaunchFast'),
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
    },
    {
      icon: LayoutTemplate,
      title: t('auth:featureNoCoding'),
      description: t('auth:descNoCoding'),
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      icon: LayoutDashboard,
      title: t('auth:featureAllInOne'),
      description: t('auth:descAllInOne'),
      color: 'text-amber-600',
      bg: 'bg-amber-100',
    },
    {
      icon: ShieldCheck,
      title: t('auth:featureSecurePlatform'),
      description: t('auth:descSecurePlatform'),
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
    {
      icon: ShieldAlert,
      title: t('auth:featureFraudDetection'),
      description: t('auth:descFraudDetection'),
      color: 'text-rose-600',
      bg: 'bg-rose-100',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Desktop View: Grid/List */}
      <div className="grid gap-6">
        <div className="mb-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Start your business journey with <span className="text-emerald-600">Ozzyl</span>
            </h2>
            <p className="text-gray-500 text-lg">
              Creating a store is easier than you think. No coding required.
            </p>
        </div>

        <div className="grid gap-6">
            {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-emerald-100/50 hover:bg-white hover:shadow-sm transition-all duration-300">
                <div className={`shrink-0 w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{feature.title}</h3>
                    <p className="text-gray-500">{feature.description}</p>
                </div>
                </div>
            );
            })}
        </div>
      </div>
    </div>
  );
}
