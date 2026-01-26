'use client';

/**
 * Premium CTA Button with Advanced Effects
 * Special button for registration/signup with particle effects and glow
 */

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ReactNode, useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface PremiumCTAButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
}

export function PremiumCTAButton({
  children,
  href,
  onClick,
  className = '',
}: PremiumCTAButtonProps) {
  const ref = useRef<HTMLAnchorElement | HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Mouse position tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring animation
  const springConfig = { stiffness: 300, damping: 30 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  // Transform for tilt effect
  const rotateX = useTransform(y, [-100, 100], [5, -5]);
  const rotateY = useTransform(x, [-100, 100], [-5, 5]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  // Particle positions for sparkle effect
  const particles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    angle: (i * 360) / 8,
  }));

  const buttonContent = (
    <>
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(135deg, #00875F 0%, #006A4E 50%, #F9A825 100%)',
          backgroundSize: '200% 200%',
        }}
        animate={{
          backgroundPosition: isHovered ? ['0% 50%', '100% 50%', '0% 50%'] : '0% 50%',
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Glow effect */}
      <motion.div
        className="absolute -inset-1 rounded-xl blur-xl opacity-0 group-hover:opacity-75 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(135deg, #00875F, #F9A825)',
        }}
        animate={
          isHovered
            ? {
                scale: [1, 1.05, 1],
              }
            : {}
        }
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Sparkle particles */}
      {isHovered &&
        particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 bg-yellow-300 rounded-full"
            initial={{
              x: 0,
              y: 0,
              opacity: 0,
              scale: 0,
            }}
            animate={{
              x: Math.cos((particle.angle * Math.PI) / 180) * 40,
              y: Math.sin((particle.angle * Math.PI) / 180) * 40,
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: particle.id * 0.1,
              ease: 'easeOut',
            }}
            style={{
              left: '50%',
              top: '50%',
            }}
          />
        ))}

      {/* Button content */}
      <span className="relative z-10 flex items-center gap-2">
        <Sparkles className="w-5 h-5" />
        {children as any}
      </span>

      {/* Shine effect on hover */}
      <motion.div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
          backgroundSize: '200% 100%',
        }}
        animate={
          isHovered
            ? {
                backgroundPosition: ['-200% 0', '200% 0'],
              }
            : {}
        }
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </>
  );

  const commonProps = {
    ref: ref as any,
    onMouseMove: handleMouseMove,
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: handleMouseLeave,
    className: `group relative inline-flex items-center justify-center px-8 py-4 font-semibold text-white rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 ${className}`,
    style: {
      background: 'linear-gradient(135deg, #006A4E 0%, #00875F 100%)',
      boxShadow: '0 0 30px rgba(0, 135, 95, 0.3)',
    },
  };

  if (href) {
    return (
      <motion.a
        {...commonProps}
        href={href}
        style={{
          ...commonProps.style,
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
      >
        {buttonContent}
      </motion.a>
    );
  }

  return (
    <motion.button
      {...commonProps}
      onClick={onClick}
      style={{
        ...commonProps.style,
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
    >
      {buttonContent}
    </motion.button>
  );
}
