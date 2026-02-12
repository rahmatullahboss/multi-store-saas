import { useState } from 'react';
import { CreditCard, Banknote, ShieldCheck, Copy } from 'lucide-react';
import { ManualPaymentConfig } from '@db/types';

interface PaymentMethodSelectorProps {
  config: ManualPaymentConfig | null;
  selectedMethod: string;
  onMethodChange: (method: string) => void;
  onTransactionIdChange: (id: string) => void;
  onSenderNumberChange: (number: string) => void;
  lang?: 'bn' | 'en';
  allowedMethods?: string[];
}

export function PaymentMethodSelector({
  config,
  selectedMethod,
  onMethodChange,
  onTransactionIdChange,
  onSenderNumberChange,
  lang = 'bn',
  allowedMethods = ['cod', 'bkash', 'nagad', 'rocket', 'stripe', 'sslcommerz']
}: PaymentMethodSelectorProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const methods = [
    {
      id: 'cod',
      title: lang === 'bn' ? 'ক্যাশ অন ডেলিভারি' : 'Cash on Delivery',
      icon: Banknote,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 'bkash',
      title: lang === 'bn' ? 'বিকাশ পেমেন্ট' : 'bKash Payment',
      icon: CreditCard,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      enabled: !!(config?.bkashPersonal || config?.bkashMerchant)
    },
    {
      id: 'nagad',
      title: lang === 'bn' ? 'নগদ পেমেন্ট' : 'Nagad Payment',
      icon: CreditCard,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      enabled: !!(config?.nagadPersonal || config?.nagadMerchant)
    },
    {
      id: 'rocket',
      title: lang === 'bn' ? 'রকেট পেমেন্ট' : 'Rocket Payment',
      icon: CreditCard,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      enabled: !!(config?.rocketPersonal || config?.rocketMerchant)
    },
    {
      id: 'sslcommerz',
      title: lang === 'bn' ? 'অনলাইন পেমেন্ট (SSLCommerz)' : 'Online Payment (SSLCommerz)',
      icon: ShieldCheck,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      enabled: true
    }
  ]
    .filter((m) => allowedMethods.includes(m.id))
    .filter((m) => m.id === 'cod' || m.enabled);

  const renderPaymentDetails = () => {
    if (selectedMethod === 'cod') return null;

    let number = '';
    let type = '';
    
    if (selectedMethod === 'bkash') {
      number = config?.bkashMerchant || config?.bkashPersonal || '';
      type = config?.bkashMerchant ? (lang === 'bn' ? 'মার্চেন্ট' : 'Merchant') : (lang === 'bn' ? 'পার্সোনাল' : 'Personal');
    } else if (selectedMethod === 'nagad') {
      number = config?.nagadMerchant || config?.nagadPersonal || '';
      type = config?.nagadMerchant ? (lang === 'bn' ? 'মার্চেন্ট' : 'Merchant') : (lang === 'bn' ? 'পার্সোনাল' : 'Personal');
    } else if (selectedMethod === 'rocket') {
      number = config?.rocketMerchant || config?.rocketPersonal || '';
      type = config?.rocketMerchant ? (lang === 'bn' ? 'মার্চেন্ট' : 'Merchant') : (lang === 'bn' ? 'পার্সোনাল' : 'Personal');
    }

    if (!number) return null;

    return (
      <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50 animate-fadeIn">
        <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-green-600" />
          {lang === 'bn' ? 'পেমেন্ট নির্দেশাবলী:' : 'Payment Instructions:'}
        </h4>
        
        <div className="bg-white p-3 rounded border border-gray-200 mb-4">
          <p className="text-sm text-gray-600 mb-1">
            {lang === 'bn' ? `নিচের ${selectedMethod} নম্বরে সেন্ড মানি করুন:` : `Send Money to this ${selectedMethod} number:`}
          </p>
          <div className="flex items-center justify-between bg-gray-100 p-2 rounded">
            <div>
              <span className="font-mono font-bold text-lg text-gray-800">{number}</span>
              <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded uppercase">{type}</span>
            </div>
            <button 
              type="button"
              onClick={() => handleCopy(number, 'number')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
            >
              <Copy className="w-3 h-3" />
              {copied === 'number' ? (lang === 'bn' ? 'কপি হয়েছে' : 'Copied') : (lang === 'bn' ? 'কপি করুন' : 'Copy')}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {lang === 'bn' ? 'যে নম্বর থেকে টাকা পাঠিয়েছেন' : 'Sender Number'}
            </label>
            <input
              type="tel"
              placeholder="01XXXXXXXXX"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              onChange={(e) => onSenderNumberChange(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {lang === 'bn' ? 'Transaction ID (TrxID)' : 'Transaction ID'}
            </label>
            <input
              type="text"
              placeholder="e.g. 9G7SH..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono uppercase text-base"
              onChange={(e) => onTransactionIdChange(e.target.value)}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {lang === 'bn' ? 'টাকা পাঠানোর পর মেসেজে পাওয়া TrxID টি দিন' : 'Enter the TrxID received in the confirmation SMS'}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {lang === 'bn' ? 'পেমেন্ট মেথড নির্বাচন করুন' : 'Select Payment Method'}
      </label>
      
      <div className="grid grid-cols-1 gap-2">
        {methods.map((method) => {
          const Icon = method.icon;
          const isSelected = selectedMethod === method.id;
          
          return (
            <div 
              key={method.id}
              onClick={() => onMethodChange(method.id)}
              className={`
                relative flex items-center p-3 cursor-pointer rounded-lg border transition-all
                ${isSelected 
                  ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/50' 
                  : 'border-gray-200 hover:border-gray-300 bg-white'}
              `}
            >
              <div className={`p-2 rounded-full ${method.bgColor} mr-3`}>
                <Icon className={`w-5 h-5 ${method.color}`} />
              </div>
              <div className="flex-1">
                <span className={`block font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                  {method.title}
                </span>
              </div>
              <div className={`
                w-4 h-4 rounded-full border flex items-center justify-center
                ${isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300'}
              `}>
                {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
              </div>
            </div>
          );
        })}
      </div>

      {renderPaymentDetails()}
    </div>
  );
}
