'use client';

/**
 * Modern CSS-based Animations (No framer-motion dependency)
 * Using native browser APIs and CSS for better performance
 */

import { ReactNode, CSSProperties } from 'react';

// Simple scroll-triggered reveal using Intersection Observer
interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function ScrollReveal({ children, className = '', delay = 0 }: ScrollRevealProps) {
  return (
    <div className={`animate-fade-in-up ${className}`} style={{ animationDelay: `${delay}ms` }}>
      {children as any}
    </div>
  );
}

// Stagger container for list animations
interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
}

export function StaggerContainer({ children, className = '' }: StaggerContainerProps) {
  return <div className={`stagger-container ${className}`}>{children as any}</div>;
}

// Stagger item
interface StaggerItemProps {
  children: ReactNode;
  index: number;
  className?: string;
}

export function StaggerItem({ children, index, className = '' }: StaggerItemProps) {
  return (
    <div
      className={`animate-fade-in-up ${className}`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {children as any}
    </div>
  );
}

// Add these animations to your globals.css
/*
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out forwards;
}
*/
