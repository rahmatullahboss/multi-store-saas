import React from 'react';
import { 
  AbsoluteFill, 
  useCurrentFrame, 
  interpolate, 
  spring, 
  useVideoConfig,
  Sequence
} from 'remotion';

interface Stat {
  label: string;
  value: string;
}

interface Props {
  title: string;
  stats: Stat[];
}

export const OzzylHero: React.FC<Props> = ({ title, stats }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Background fade-in
  const bgOpacity = interpolate(frame, [0, 20], [0, 1]);

  // Title bounce-in animation
  const titleSpring = spring({
    frame: frame - 10,
    fps,
    config: { stiffness: 100, damping: 10 },
  });
  const titleScale = interpolate(titleSpring, [0, 1], [0.8, 1]);
  const titleOpacity = interpolate(frame, [10, 25], [0, 1]);

  return (
    <AbsoluteFill style={{ 
      backgroundColor: '#0A0A0F', 
      justifyContent: 'center', 
      alignItems: 'center',
      opacity: bgOpacity,
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Dynamic Background Gradient */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at center, #006A4E22 0%, transparent 70%)',
        opacity: interpolate(frame, [0, 60], [0, 0.5])
      }} />

      {/* Main Title */}
      <div style={{
        transform: `scale(${titleScale})`,
        opacity: titleOpacity,
        textAlign: 'center',
        marginBottom: 80,
        zIndex: 10
      }}>
        <h1 style={{ 
          fontSize: 100, 
          color: 'white', 
          fontWeight: 800,
          margin: 0,
          letterSpacing: '-2px'
        }}>
          {title}
        </h1>
        <div style={{
          height: 8,
          width: interpolate(frame, [20, 50], [0, 400], { extrapolateRight: 'clamp' }),
          background: 'linear-gradient(90deg, #006A4E, #00875F)',
          margin: '20px auto',
          borderRadius: 4
        }} />
      </div>

      {/* Stats Section */}
      <div style={{ 
        display: 'flex', 
        gap: 40,
        zIndex: 10
      }}>
        {stats.map((stat, i) => (
          <Sequence key={i} from={40 + i * 15}>
            <StatCard label={stat.label} value={stat.value} />
          </Sequence>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const StatCard: React.FC<Stat> = ({ label, value }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { stiffness: 120 },
  });

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(0, 106, 78, 0.3)',
      borderRadius: 32,
      padding: '40px 60px',
      transform: `translateY(${interpolate(entrance, [0, 1], [100, 0])}px)`,
      opacity: entrance,
      width: 400,
      textAlign: 'center',
      backdropFilter: 'blur(20px)'
    }}>
      <div style={{ 
        fontSize: 80, 
        fontWeight: 800, 
        color: '#00875F',
        marginBottom: 10
      }}>
        {value}
      </div>
      <div style={{ 
        fontSize: 32, 
        color: 'rgba(255, 255, 255, 0.6)',
        fontWeight: 500
      }}>
        {label}
      </div>
    </div>
  );
};
