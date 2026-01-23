/**
 * Morphing Gradient Blob Component
 * Animated blob that morphs shape and position for premium background effects
 */
import { motion } from 'framer-motion';

interface MorphingBlobProps {
  color: string;
  size?: string;
  position?: { top?: string; left?: string; right?: string; bottom?: string };
  delay?: number;
  className?: string;
}

export function MorphingBlob({
  color,
  size = '400px',
  position = { top: '20%', left: '10%' },
  delay = 0,
  className = '',
}: MorphingBlobProps) {
  return (
    <motion.div
      className={`absolute pointer-events-none ${className}`}
      style={{
        ...position,
        width: size,
        height: size,
        background: color,
        filter: 'blur(80px)',
        opacity: 0.5,
      }}
      animate={{
        borderRadius: [
          '60% 40% 30% 70% / 60% 30% 70% 40%',
          '30% 60% 70% 40% / 50% 60% 30% 60%',
          '50% 50% 40% 60% / 40% 50% 60% 50%',
          '60% 40% 30% 70% / 60% 30% 70% 40%',
        ],
        x: [0, 30, -20, 0],
        y: [0, -20, 30, 0],
        scale: [1, 1.1, 0.95, 1],
      }}
      transition={{
        duration: 15,
        ease: 'easeInOut',
        repeat: Infinity,
        delay,
      }}
    />
  );
}

// Animated gradient orbs for hero section
export function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <MorphingBlob
        color="rgba(16, 185, 129, 0.4)"
        size="500px"
        position={{ top: '-10%', left: '-5%' }}
        delay={0}
      />
      <MorphingBlob
        color="rgba(20, 184, 166, 0.3)"
        size="600px"
        position={{ top: '30%', right: '-10%' }}
        delay={2}
      />
      <MorphingBlob
        color="rgba(34, 197, 94, 0.25)"
        size="400px"
        position={{ bottom: '-5%', left: '40%' }}
        delay={4}
      />
    </div>
  );
}
