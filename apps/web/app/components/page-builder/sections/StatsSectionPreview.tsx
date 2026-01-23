/**
 * Stats Counter Section Preview
 * 
 * Displays animated statistics counters for social proof.
 * Supports multiple variants: simple, cards, highlight, minimal.
 */

import { useState, useEffect, useRef } from 'react';
import type { StatsProps } from '~/lib/page-builder/schemas';

interface StatsSectionPreviewProps {
  props: Record<string, unknown>;
}

// Custom hook for animated counter
function useCountUp(end: number, duration: number = 2000, start: boolean = true) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (!start) return;
    
    let startValue = 0;
    const increment = end / (duration / 16);
    
    const timer = setInterval(() => {
      startValue += increment;
      if (startValue >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(startValue));
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [end, duration, start]);
  
  return count;
}

// Individual stat component with animation
function StatItem({ 
  value, 
  prefix = '', 
  suffix = '', 
  label, 
  icon = '', 
  showIcon = true,
  textColor,
  accentColor,
  valueFontSize,
  variant,
  animate = true,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  icon?: string;
  showIcon?: boolean;
  textColor: string;
  accentColor: string;
  valueFontSize: string;
  variant: string;
  animate?: boolean;
}) {
  const animatedValue = useCountUp(value, 2000, animate);
  
  const fontSizeClasses = {
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
    '2xl': 'text-5xl',
  };

  // Format number with commas
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return num.toLocaleString('en-US');
    }
    return num.toString();
  };

  // Cards variant
  if (variant === 'cards') {
    return (
      <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
        {showIcon && icon && (
          <div className="text-3xl mb-3">{icon}</div>
        )}
        <div 
          className={`font-bold ${fontSizeClasses[valueFontSize as keyof typeof fontSizeClasses]}`}
          style={{ color: accentColor }}
        >
          {prefix}{formatNumber(animatedValue)}{suffix}
        </div>
        <div 
          className="text-sm mt-2 opacity-80"
          style={{ color: textColor }}
        >
          {label}
        </div>
      </div>
    );
  }

  // Highlight variant
  if (variant === 'highlight') {
    return (
      <div className="text-center p-4">
        {showIcon && icon && (
          <div 
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl"
            style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
          >
            {icon}
          </div>
        )}
        <div 
          className={`font-extrabold ${fontSizeClasses[valueFontSize as keyof typeof fontSizeClasses]}`}
          style={{ color: accentColor }}
        >
          {prefix}{formatNumber(animatedValue)}{suffix}
        </div>
        <div 
          className="text-sm mt-2 font-medium"
          style={{ color: textColor }}
        >
          {label}
        </div>
      </div>
    );
  }

  // Minimal variant
  if (variant === 'minimal') {
    return (
      <div className="flex items-center gap-3">
        {showIcon && icon && (
          <span className="text-xl">{icon}</span>
        )}
        <div>
          <span 
            className="font-bold text-lg"
            style={{ color: accentColor }}
          >
            {prefix}{formatNumber(animatedValue)}{suffix}
          </span>
          <span 
            className="ml-2 text-sm"
            style={{ color: textColor }}
          >
            {label}
          </span>
        </div>
      </div>
    );
  }

  // Simple variant (default)
  return (
    <div className="text-center">
      {showIcon && icon && (
        <div className="text-3xl mb-2">{icon}</div>
      )}
      <div 
        className={`font-bold ${fontSizeClasses[valueFontSize as keyof typeof fontSizeClasses]}`}
        style={{ color: accentColor }}
      >
        {prefix}{formatNumber(animatedValue)}{suffix}
      </div>
      <div 
        className="text-sm mt-1 opacity-75"
        style={{ color: textColor }}
      >
        {label}
      </div>
    </div>
  );
}

export function StatsSectionPreview({ props }: StatsSectionPreviewProps) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const {
    title = '',
    subtitle = '',
    stats = [],
    columns = '4',
    animateOnScroll = true,
    showIcons = true,
    variant = 'simple',
    bgColor = '#F9FAFB',
    textColor = '#111827',
    accentColor = '#6366F1',
    valueFontSize = 'xl',
  } = props as StatsProps;

  // Intersection observer for scroll animation
  useEffect(() => {
    if (!animateOnScroll) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [animateOnScroll]);

  const columnClasses = {
    '2': 'grid-cols-2',
    '3': 'grid-cols-3',
    '4': 'grid-cols-2 md:grid-cols-4',
  };

  return (
    <section 
      ref={sectionRef}
      className="w-full py-12 px-4"
      style={{ backgroundColor: bgColor }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Title */}
        {(title || subtitle) && (
          <div className="text-center mb-10">
            {title && (
              <h2 
                className="text-2xl md:text-3xl font-bold mb-2"
                style={{ color: textColor }}
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p 
                className="text-base opacity-80"
                style={{ color: textColor }}
              >
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Stats Grid */}
        <div className={`grid ${columnClasses[columns as keyof typeof columnClasses]} gap-6 md:gap-8`}>
          {stats.map((stat, index) => (
            <StatItem
              key={index}
              value={stat.value}
              prefix={stat.prefix}
              suffix={stat.suffix}
              label={stat.label}
              icon={stat.icon}
              showIcon={showIcons}
              textColor={textColor}
              accentColor={accentColor}
              valueFontSize={valueFontSize}
              variant={variant}
              animate={isVisible}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
