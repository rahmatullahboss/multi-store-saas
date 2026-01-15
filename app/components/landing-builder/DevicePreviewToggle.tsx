/**
 * Device Preview Toggle Component
 * 
 * Toggle buttons for switching between desktop, tablet, and mobile preview modes.
 */

import { Monitor, Tablet, Smartphone } from 'lucide-react';

export type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

interface DevicePreviewToggleProps {
  device: PreviewDevice;
  onDeviceChange: (device: PreviewDevice) => void;
  className?: string;
}

const DEVICES = [
  { id: 'desktop' as PreviewDevice, icon: Monitor, label: 'Desktop', width: '100%' },
  { id: 'tablet' as PreviewDevice, icon: Tablet, label: 'Tablet', width: '768px' },
  { id: 'mobile' as PreviewDevice, icon: Smartphone, label: 'Mobile', width: '375px' },
];

export function DevicePreviewToggle({
  device,
  onDeviceChange,
  className = '',
}: DevicePreviewToggleProps) {
  return (
    <div className={`flex items-center gap-1 p-1 bg-gray-100 rounded-lg ${className}`}>
      {DEVICES.map((d) => {
        const Icon = d.icon;
        const isActive = device === d.id;
        
        return (
          <button
            key={d.id}
            type="button"
            onClick={() => onDeviceChange(d.id)}
            title={d.label}
            className={`p-2 rounded-md transition-all ${
              isActive
                ? 'bg-white text-emerald-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Icon className="w-4 h-4" />
          </button>
        );
      })}
    </div>
  );
}

// Helper to get preview width based on device
export function getPreviewWidth(device: PreviewDevice): string {
  switch (device) {
    case 'mobile':
      return '375px';
    case 'tablet':
      return '768px';
    case 'desktop':
    default:
      return '100%';
  }
}

export default DevicePreviewToggle;
