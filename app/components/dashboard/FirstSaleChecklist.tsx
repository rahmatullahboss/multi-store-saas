import { Link } from '@remix-run/react';
import { 
  CheckCircle2, 
  Circle, 
  Package, 
  ExternalLink, 
  Share2, 
  PartyPopper,
  ArrowRight
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from '~/contexts/LanguageContext';

interface FirstSaleChecklistProps {
  productCount: number;
  storeUrl: string;
  className?: string;
}

export function FirstSaleChecklist({ productCount, storeUrl, className = '' }: FirstSaleChecklistProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  // Steps configuration
  const steps = [
    {
      id: 'product',
      title: 'Add your first product',
      description: 'Start by adding a product to sell.',
      icon: Package,
      isCompleted: productCount > 0,
      action: {
        label: 'Add Product',
        url: '/app/products/new',
        primary: true,
      }
    },
    {
      id: 'view',
      title: 'Visit your store',
      description: 'See how your store looks to customers.',
      icon: ExternalLink,
      isCompleted: false, // Cannot easily track "visited", so we keep it as an action
      // Or we can assume if products > 0, they might have visited. 
      // Let's make it always "actionable" until the first sale happens (when this widget disappears).
      action: {
        label: 'View Store',
        url: storeUrl,
        external: true,
        primary: false,
      }
    },
    {
      id: 'share',
      title: 'Share your store link',
      description: 'Share on social media to get visitors.',
      icon: Share2,
      isCompleted: false,
      action: {
        label: copied ? 'Copied!' : 'Copy Link',
        onClick: () => {
          navigator.clipboard.writeText(storeUrl);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        },
        primary: false,
      }
    }
  ];

  const completedCount = steps.filter(s => s.isCompleted).length;
  const progress = (completedCount / steps.length) * 100;

  return (
    <div className={`bg-white rounded-xl border border-indigo-100 shadow-sm overflow-hidden ${className}`}>
      <div className="p-6 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-indigo-100">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-indigo-900 flex items-center gap-2">
              <PartyPopper className="w-6 h-6 text-indigo-600" />
              Let's get your first sale!
            </h2>
            <p className="text-indigo-700 mt-1">
              Complete these steps to launch your business effectively.
            </p>
          </div>
          <div className="hidden md:block text-right">
             <span className="text-2xl font-bold text-indigo-600">{Math.round(progress)}%</span>
             <span className="text-sm text-indigo-400 block">Ready</span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-6 h-2 bg-indigo-200/50 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.max(5, progress)}%` }}
          />
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isDone = step.isCompleted;

          return (
            <div key={step.id} className={`p-4 md:p-6 flex flex-col md:flex-row gap-4 items-start md:items-center transition-colors ${isDone ? 'bg-indigo-50/30' : 'hover:bg-gray-50'}`}>
              
              {/* Icon / Status */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isDone ? 'bg-green-100 text-green-600' : 'bg-indigo-100 text-indigo-600'}`}>
                {isDone ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className={`font-semibold ${isDone ? 'text-gray-900' : 'text-gray-900'}`}>{step.title}</h3>
                <p className="text-sm text-gray-500">{step.description}</p>
              </div>

              {/* Action */}
              <div className="flex-shrink-0">
                {isDone ? (
                   <span className="inline-flex items-center gap-1 text-sm font-medium text-green-600 px-3 py-1 bg-green-50 rounded-full">
                     Done
                   </span>
                ) : (
                  step.action.onClick ? (
                    <button
                      onClick={step.action.onClick}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                        step.action.primary 
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm' 
                          : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {step.action.label}
                    </button>
                  ) : (
                    <Link
                      to={step.action.url!}
                      target={step.action.external ? "_blank" : undefined}
                      rel={step.action.external ? "noopener noreferrer" : undefined}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                        step.action.primary 
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm' 
                          : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {step.action.label}
                      {!step.action.primary && <ArrowRight className="w-4 h-4 ml-1 opacity-50" />}
                    </Link>
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
