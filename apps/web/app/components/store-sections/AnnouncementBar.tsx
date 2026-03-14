import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface AnnouncementBarProps {
  text: string;
  link?: string;
  enabled?: boolean;
  bgColor?: string;
  textColor?: string;
  dismissible?: boolean;
  storeAccentColor?: string;
}

export function AnnouncementBar({
  text,
  link,
  enabled = false,
  bgColor,
  textColor = '#ffffff',
  dismissible = false,
  storeAccentColor = '#4f46e5',
}: AnnouncementBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true); // Default true until checked

  useEffect(() => {
    // Only check localStorage on client side
    if (enabled && text) {
      const dismissed = sessionStorage.getItem('announcement_dismissed');
      if (dismissed !== text) {
        setIsDismissed(false);
        // Small delay for smooth entrance animation
        setTimeout(() => setIsVisible(true), 100);
      }
    }
  }, [enabled, text]);

  if (!enabled || !text || isDismissed) {
    return null;
  }

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsVisible(false);
    // Wait for slide up animation before unmounting
    setTimeout(() => {
      setIsDismissed(true);
      sessionStorage.setItem('announcement_dismissed', text);
    }, 300);
  };

  const backgroundColor = bgColor || storeAccentColor;

  const content = (
    <div className="flex-1 flex justify-center items-center">
      <span className="text-sm font-medium px-4">{text}</span>
    </div>
  );

  return (
    <div
      className={`sticky top-0 z-[100] w-full transition-all duration-300 ease-in-out transform origin-top ${
        isVisible ? 'scale-y-100 opacity-100 h-auto' : 'scale-y-0 opacity-0 h-0 overflow-hidden'
      }`}
      style={{ backgroundColor, color: textColor }}
    >
      <div className="relative flex items-center justify-center py-2.5 px-4 min-h-[40px]">
        {link ? (
          <a
            href={link}
            className="flex-1 flex justify-center hover:opacity-90 transition-opacity"
            style={{ color: textColor }}
          >
            {content}
          </a>
        ) : (
          content
        )}

        {dismissible && (
          <button
            onClick={handleDismiss}
            className="absolute right-2 p-1 rounded-full hover:bg-black/10 transition-colors"
            aria-label="Close announcement"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
