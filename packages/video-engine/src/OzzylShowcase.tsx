import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  interpolateColors,
  Easing,
  Sequence,
  random,
} from 'remotion';

// ============================================================================
// PARTICLE SYSTEM - Creates floating particles in the background
// ============================================================================
const Particle: React.FC<{ id: number; delay: number }> = ({ id, delay }) => {
  const frame = useCurrentFrame();
  const { height, width } = useVideoConfig();

  const startX = random(`x-${id}`) * width;
  const startY = random(`y-${id}`) * height;
  const size = 2 + random(`size-${id}`) * 6;
  const speed = 0.5 + random(`speed-${id}`) * 1.5;
  const opacity = 0.1 + random(`opacity-${id}`) * 0.4;

  const y = startY - (frame - delay) * speed;
  const x = startX + Math.sin((frame - delay) * 0.05 + id) * 30;

  if (frame < delay) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y % height,
        width: size,
        height: size,
        borderRadius: '50%',
        background: `radial-gradient(circle, rgba(0, 135, 95, ${opacity}) 0%, transparent 70%)`,
        filter: 'blur(1px)',
      }}
    />
  );
};

const ParticleField: React.FC = () => {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {Array.from({ length: 60 }, (_, i) => (
        <Particle key={i} id={i} delay={i * 2} />
      ))}
    </div>
  );
};

// ============================================================================
// ANIMATED TEXT with stagger effect
// ============================================================================
const AnimatedWord: React.FC<{ word: string; delay: number }> = ({ word, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15, stiffness: 80, mass: 0.8 },
  });

  const y = interpolate(entrance, [0, 1], [60, 0]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const blur = interpolate(entrance, [0, 1], [10, 0]);

  return (
    <span
      style={{
        display: 'inline-block',
        transform: `translateY(${y}px)`,
        opacity,
        filter: `blur(${blur}px)`,
        marginRight: 20,
      }}
    >
      {word}
    </span>
  );
};

// ============================================================================
// MORPHING GRADIENT ORB
// ============================================================================
const GradientOrb: React.FC = () => {
  const frame = useCurrentFrame();

  const scale = interpolate(frame, [0, 60, 120], [0.8, 1.2, 0.9], {
    easing: Easing.inOut(Easing.sin),
    extrapolateRight: 'extend',
  });

  const rotate = interpolate(frame, [0, 300], [0, 360]);

  const color1 = interpolateColors(frame, [0, 75, 150], ['#006A4E', '#00875F', '#004D3D']);
  const color2 = interpolateColors(frame, [0, 75, 150], ['#00875F', '#004D3D', '#006A4E']);

  return (
    <div
      style={{
        position: 'absolute',
        width: 600,
        height: 600,
        borderRadius: '50%',
        background: `radial-gradient(circle at 30% 30%, ${color1}, ${color2}, transparent 70%)`,
        transform: `scale(${scale}) rotate(${rotate}deg)`,
        filter: 'blur(80px)',
        opacity: 0.6,
      }}
    />
  );
};

// ============================================================================
// FEATURE CARD with 3D tilt
// ============================================================================
interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  index: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const delay = 60 + index * 20;

  const entrance = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 60 },
  });

  const y = interpolate(entrance, [0, 1], [100, 0]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const rotateX = interpolate(entrance, [0, 1], [30, 0]);

  // Hover-like pulse effect
  const pulse = interpolate(
    Math.sin((frame - delay) * 0.05),
    [-1, 1],
    [0.98, 1.02]
  );

  return (
    <div
      style={{
        width: 350,
        padding: 40,
        background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
        borderRadius: 32,
        border: '1px solid rgba(0, 135, 95, 0.3)',
        backdropFilter: 'blur(20px)',
        transform: `translateY(${y}px) perspective(1000px) rotateX(${rotateX}deg) scale(${pulse})`,
        opacity,
        boxShadow: '0 25px 50px -12px rgba(0, 106, 78, 0.25)',
      }}
    >
      <div
        style={{
          fontSize: 56,
          marginBottom: 20,
          filter: 'drop-shadow(0 0 20px rgba(0, 135, 95, 0.5))',
        }}
      >
        {icon}
      </div>
      <h3 style={{ fontSize: 28, fontWeight: 700, color: 'white', marginBottom: 12 }}>
        {title}
      </h3>
      <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
        {description}
      </p>
    </div>
  );
};

// ============================================================================
// STATS COUNTER with number animation
// ============================================================================
interface StatCounterProps {
  value: number;
  suffix: string;
  label: string;
  delay: number;
}

const StatCounter: React.FC<StatCounterProps> = ({ value, suffix, label, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - delay,
    fps,
    config: { damping: 20, stiffness: 100 },
  });

  const displayValue = Math.round(interpolate(entrance, [0, 1], [0, value]));
  const scale = interpolate(entrance, [0, 0.5, 1], [0.5, 1.1, 1]);
  const opacity = interpolate(entrance, [0, 0.3], [0, 1]);

  const glowIntensity = interpolate(
    Math.sin((frame - delay) * 0.1),
    [-1, 1],
    [0.3, 0.8]
  );

  return (
    <div
      style={{
        textAlign: 'center',
        transform: `scale(${scale})`,
        opacity,
      }}
    >
      <div
        style={{
          fontSize: 80,
          fontWeight: 800,
          color: '#00875F',
          textShadow: `0 0 ${30 * glowIntensity}px rgba(0, 135, 95, ${glowIntensity})`,
        }}
      >
        {displayValue}
        {suffix}
      </div>
      <div style={{ fontSize: 24, color: 'rgba(255,255,255,0.6)', marginTop: 10 }}>
        {label}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPOSITION
// ============================================================================
export const OzzylShowcase: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const words = ['Build', 'Scale', 'Dominate'];

  const bgOpacity = interpolate(frame, [0, 30], [0, 1]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0A0A0F',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
        overflow: 'hidden',
        opacity: bgOpacity,
      }}
    >
      {/* Animated Background */}
      <ParticleField />

      {/* Gradient Orb */}
      <div style={{ position: 'absolute', top: -200, right: -200 }}>
        <GradientOrb />
      </div>
      <div style={{ position: 'absolute', bottom: -300, left: -200 }}>
        <GradientOrb />
      </div>

      {/* Main Content */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        {/* SCENE 1: Hero Text */}
        <Sequence from={0} durationInFrames={90}>
          <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
            <h1
              style={{
                fontSize: 120,
                fontWeight: 900,
                color: 'white',
                textAlign: 'center',
                letterSpacing: -4,
              }}
            >
              {words.map((word, i) => (
                <AnimatedWord key={word} word={word} delay={10 + i * 15} />
              ))}
            </h1>
            <div
              style={{
                fontSize: 32,
                color: 'rgba(255,255,255,0.6)',
                marginTop: 30,
                opacity: interpolate(frame, [45, 60], [0, 1]),
              }}
            >
              The Future of E-Commerce is Here
            </div>
          </AbsoluteFill>
        </Sequence>

        {/* SCENE 2: Stats */}
        <Sequence from={90} durationInFrames={90}>
          <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 100 }}>
              <StatCounter value={10000} suffix="+" label="Active Stores" delay={0} />
              <StatCounter value={99} suffix="%" label="Uptime" delay={10} />
              <StatCounter value={50} suffix="ms" label="Response Time" delay={20} />
            </div>
          </AbsoluteFill>
        </Sequence>

        {/* SCENE 3: Features */}
        <Sequence from={180} durationInFrames={120}>
          <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 40 }}>
              <FeatureCard
                icon="🚀"
                title="AI-Powered"
                description="Smart automation that learns and adapts to your business."
                index={0}
              />
              <FeatureCard
                icon="⚡"
                title="Lightning Fast"
                description="Edge-first architecture for sub-50ms global response times."
                index={1}
              />
              <FeatureCard
                icon="🎨"
                title="Beautiful Design"
                description="Stunning templates that convert visitors into customers."
                index={2}
              />
            </div>
          </AbsoluteFill>
        </Sequence>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
