/**
 * Animated Text Reveal Component
 * Word-by-word or letter-by-letter reveal with stagger effect
 */
import { motion } from 'framer-motion';
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
      filter: 'blur(10px)',
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
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

// Gradient text with shimmer animation
interface ShimmerTextProps {
  children: ReactNode;
  className?: string;
}

export function ShimmerText({ children, className = '' }: ShimmerTextProps) {
  return (
    <motion.span
      className={`relative inline-block bg-gradient-to-r from-emerald-600 via-teal-400 to-emerald-600 bg-clip-text text-transparent bg-[length:200%_100%] ${className}`}
      animate={{
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
      }}
      transition={{
        duration: 5,
        ease: 'linear',
        repeat: Infinity,
      }}
    >
      {children as any}
    </motion.span>
  );
}

// Typewriter effect
interface TypewriterProps {
  text: string;
  className?: string;
  speed?: number;
}

export function Typewriter({ text, className = '', speed = 50 }: TypewriterProps) {
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
