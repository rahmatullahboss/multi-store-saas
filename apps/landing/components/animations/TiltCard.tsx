/**
 * 3D Tilt Card Effect Component - OPTIMIZED
 * Simplified tilt effect with reduced motion support
 */
import { ReactNode, useRef } from 'react';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  maxTilt?: number;
}

export function TiltCard({
  children,
  className = '',
  glowColor = 'rgba(16, 185, 129, 0.3)',
  maxTilt = 8, // Reduced from 10
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Softer spring config for less CPU usage
  const springConfig = { stiffness: 200, damping: 25 };

  const rotateX = useSpring(useTransform(y, [0, 1], [maxTilt, -maxTilt]), springConfig);
  const rotateY = useSpring(useTransform(x, [0, 1], [-maxTilt, maxTilt]), springConfig);

  // Throttled mouse handler
  let lastCall = 0;
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion) return;

    // Throttle to ~30fps for performance
    const now = Date.now();
    if (now - lastCall < 33) return;
    lastCall = now;

    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const xPos = (e.clientX - rect.left) / rect.width;
    const yPos = (e.clientY - rect.top) / rect.height;

    x.set(xPos);
    y.set(yPos);
  };

  const handleMouseLeave = () => {
    x.set(0.5);
    y.set(0.5);
  };

  // If reduced motion, just show static card
  if (shouldReduceMotion) {
    return <div className={`relative ${className}`}>{children}</div>;
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      transition={{ scale: { duration: 0.2 } }}
      className={`relative ${className}`}
    >
      {/* Simplified glow effect */}
      <div
        className="absolute -inset-1 rounded-3xl opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-50"
        style={{ background: glowColor }}
      />
      {children as any}
    </div>
  );
}
