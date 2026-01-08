/**
 * Facebook Conversion API Tutorial Page
 * 
 * Route: /app/settings/tracking/tutorial
 * 
 * Step-by-step guide for merchants to set up Facebook CAPI
 */

import { Link } from '@remix-run/react';
import { 
  ArrowLeft, ExternalLink, Check, AlertCircle, Copy, 
  Facebook, Settings, Key, Shield, ChevronRight 
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from '~/contexts/LanguageContext';

export default function CAPITutorial() {
  const { lang } = useTranslation();
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  const handleCopy = (text: string, step: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(step);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const steps = [
    {
      title: lang === 'bn' ? 'Facebook Business Manager এ যান' : 'Go to Facebook Business Manager',
      titleEn: 'Go to Facebook Business Manager',
      description: lang === 'bn' 
        ? 'প্রথমে আপনার Facebook Business Manager অ্যাকাউন্টে লগইন করুন।'
        : 'First, log in to your Facebook Business Manager account.',
      link: 'https://business.facebook.com',
      linkText: 'business.facebook.com',
    },
    {
      title: lang === 'bn' ? 'Events Manager খুলুন' : 'Open Events Manager',
      titleEn: 'Open Events Manager',
      description: lang === 'bn'
        ? 'বাম পাশের মেনু থেকে "Events Manager" ক্লিক করুন অথবা নিচের লিংকে যান।'
        : 'Click "Events Manager" from the left menu or use the link below.',
      link: 'https://business.facebook.com/events_manager',
      linkText: 'Events Manager',
    },
    {
      title: lang === 'bn' ? 'আপনার Pixel সিলেক্ট করুন' : 'Select Your Pixel',
      titleEn: 'Select Your Pixel',
      description: lang === 'bn'
        ? 'Data Sources থেকে আপনার Pixel সিলেক্ট করুন। যদি Pixel না থাকে, নতুন একটি তৈরি করুন।'
        : 'Select your Pixel from Data Sources. If you don\'t have one, create a new Pixel.',
      image: '/images/tutorials/select-pixel.png',
    },
    {
      title: lang === 'bn' ? 'Settings এ যান' : 'Go to Settings',
      titleEn: 'Go to Settings',
      description: lang === 'bn'
        ? 'Pixel সিলেক্ট করার পর উপরে "Settings" ট্যাবে ক্লিক করুন।'
        : 'After selecting your Pixel, click on the "Settings" tab at the top.',
    },
    {
      title: lang === 'bn' ? 'Access Token তৈরি করুন' : 'Generate Access Token',
      titleEn: 'Generate Access Token',
      description: lang === 'bn'
        ? '"Conversions API" সেকশনে স্ক্রল করুন এবং "Generate Access Token" বাটনে ক্লিক করুন।'
        : 'Scroll to the "Conversions API" section and click "Generate Access Token" button.',
      important: true,
    },
    {
      title: lang === 'bn' ? 'Token কপি করুন' : 'Copy the Token',
      titleEn: 'Copy the Token',
      description: lang === 'bn'
        ? 'নতুন Access Token তৈরি হলে সেটি কপি করুন। এটি একবারই দেখাবে, তাই সেভ করে রাখুন!'
        : 'Copy the new Access Token. It will only be shown once, so save it!',
      warning: lang === 'bn' 
        ? '⚠️ এই Token গোপন রাখুন! কাউকে শেয়ার করবেন না।'
        : '⚠️ Keep this Token secret! Never share it with anyone.',
    },
    {
      title: lang === 'bn' ? 'আমাদের Dashboard এ সেট করুন' : 'Set in Our Dashboard',
      titleEn: 'Set in Our Dashboard',
      description: lang === 'bn'
        ? 'এখন আমাদের Dashboard → Settings → Tracking পেইজে যান এবং Access Token ফিল্ডে পেস্ট করুন।'
        : 'Now go to Dashboard → Settings → Tracking and paste the Access Token.',
      link: '/app/settings/tracking',
      linkText: lang === 'bn' ? 'Tracking Settings এ যান' : 'Go to Tracking Settings',
      internal: true,
    },
  ];

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <Link 
          to="/app/settings/tracking" 
          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          {lang === 'bn' ? 'Tracking Settings এ ফিরে যান' : 'Back to Tracking Settings'}
        </Link>
        
        <div className="flex items-start gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl text-white">
            <Facebook className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {lang === 'bn' ? 'Facebook Conversion API সেটআপ গাইড' : 'Facebook Conversion API Setup Guide'}
            </h1>
            <p className="text-gray-500 mt-1">
              {lang === 'bn' 
                ? 'ধাপে ধাপে Access Token পাওয়া এবং সেট করার পদ্ধতি'
                : 'Step-by-step guide to get and configure Access Token'}
            </p>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-5 mb-8 border border-blue-100">
        <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          {lang === 'bn' ? 'কেন Conversion API দরকার?' : 'Why do you need Conversion API?'}
        </h2>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
            <span>
              {lang === 'bn' 
                ? 'Ad Blocker ব্যবহারকারীদের ট্র্যাক করতে পারবেন' 
                : 'Track users with Ad Blockers'}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
            <span>
              {lang === 'bn' 
                ? 'iOS 14+ ডিভাইসে ভালো ট্র্যাকিং পাবেন' 
                : 'Better tracking on iOS 14+ devices'}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
            <span>
              {lang === 'bn' 
                ? 'Facebook Ads এর কর্মক্ষমতা ৩০-৫০% বাড়বে' 
                : 'Facebook Ads performance improves by 30-50%'}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
            <span>
              {lang === 'bn' 
                ? 'আরো সঠিক Audience তৈরি করতে পারবেন' 
                : 'Create more accurate Custom Audiences'}
            </span>
          </li>
        </ul>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        <h2 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          {lang === 'bn' ? 'সেটআপ স্টেপস' : 'Setup Steps'}
        </h2>

        {steps.map((step, index) => (
          <div 
            key={index}
            className={`border rounded-xl p-5 transition-all ${
              step.important 
                ? 'border-blue-300 bg-blue-50' 
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm ${
                step.important 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {index + 1}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{step.description}</p>
                
                {step.warning && (
                  <div className="flex items-start gap-2 text-amber-700 bg-amber-50 p-3 rounded-lg text-sm mb-3">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{step.warning}</span>
                  </div>
                )}

                {step.link && (
                  step.internal ? (
                    <Link
                      to={step.link}
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium bg-blue-50 px-3 py-1.5 rounded-lg"
                    >
                      <ChevronRight className="w-4 h-4" />
                      {step.linkText}
                    </Link>
                  ) : (
                    <a
                      href={step.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      {step.linkText}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Success Message */}
      <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <Check className="w-6 h-6 text-green-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-green-800">
              {lang === 'bn' ? 'সেটআপ শেষ হলে যা হবে' : 'After Setup Complete'}
            </h3>
            <p className="text-green-700 text-sm mt-1">
              {lang === 'bn'
                ? 'সেটআপ সম্পন্ন হলে, প্রতিটি অর্ডারে Purchase ইভেন্ট স্বয়ংক্রিয়ভাবে Facebook এ পাঠানো হবে। আপনি Events Manager এ Test Events ট্যাবে এটি যাচাই করতে পারবেন।'
                : 'Once setup is complete, Purchase events will be automatically sent to Facebook on every order. You can verify this in the Test Events tab in Events Manager.'}
            </p>
          </div>
        </div>
      </div>

      {/* Help */}
      <div className="mt-6 text-center text-sm text-gray-500">
        {lang === 'bn' 
          ? 'সমস্যা হলে আমাদের সাপোর্ট টিমে যোগাযোগ করুন।'
          : 'If you face any issues, contact our support team.'}
      </div>
    </div>
  );
}
