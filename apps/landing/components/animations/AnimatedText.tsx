/**
 * Animated Text Reveal Component - OPTIMIZED
 * Simplified animations with reduced motion support
 */
'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
  type?: 'words' | 'letters';
  tag?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
}

export function AnimatedText({
  text,
  className = '',
  delay = 0,
  type = 'words',
  tag = 'span',
}: AnimatedTextProps) {
  const shouldReduceMotion = useReducedMotion();

  // If reduced motion, just show the text
  if (shouldReduceMotion) {
    const Tag = tag as keyof React.JSX.IntrinsicElements;
    return <Tag className={className}>{text}</Tag>;
  }

  const items = type === 'words' ? text.split(' ') : text.split('');

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: type === 'words' ? 0.08 : 0.03,
        delayChildren: delay,
      },
    },
  };

  const child = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
      },
    },
  };

  const MotionTag = motion[tag] as typeof motion.span;

  return (
    <MotionTag
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className={`inline-flex flex-wrap ${className}`}
    >
      {items.map((item, index) => (
        <motion.span
          key={index}
          variants={child}
          className="inline-block"
          style={{ marginRight: type === 'words' ? '0.3em' : undefined }}
        >
          {item}
        </motion.span>
      ))}
    </MotionTag>
  );
}

// Gradient text with shimmer - SIMPLIFIED (CSS animation only)
interface ShimmerTextProps {
  children: ReactNode;
  className?: string;
}

export function ShimmerText({ children, className = '' }: ShimmerTextProps) {
  const shouldReduceMotion = useReducedMotion();

  // No animation for reduced motion
  if (shouldReduceMotion) {
    return (
      <span
        className={`bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent ${className}`}
      >
        {children}
      </span>
    );
  }

  return (
    <span
      className={`relative inline-block bg-gradient-to-r from-emerald-600 via-teal-400 to-emerald-600 bg-clip-text text-transparent bg-[length:200%_100%] animate-shimmer ${className}`}
    >
      {children}
    </span>
  );
}

// Typewriter effect - SIMPLIFIED
interface TypewriterProps {
  text: string;
  className?: string;
  speed?: number;
}

export function Typewriter({ text, className = '', speed = 50 }: TypewriterProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <span className={className}>{text}</span>;
  }

  return (
    <motion.span
      className={className}
      initial={{ width: 0 }}
      whileInView={{ width: 'auto' }}
      viewport={{ once: true }}
      transition={{
        duration: text.length * (speed / 1000),
        ease: 'linear',
      }}
      style={{ overflow: 'hidden', whiteSpace: 'nowrap', display: 'inline-block' }}
    >
      {text}
    </motion.span>
  );
}
