import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  interpolateColors,
  Sequence,
  Audio,
  staticFile,
  random,
  Img
} from 'remotion';

// ============================================================================
// ASSETS & CONFIG
// ============================================================================
const THEME = {
  bg: '#0A0A0F',
  primary: '#006A4E',
  accent: '#00875F',
  text: '#FFFFFF',
  textMuted: 'rgba(255, 255, 255, 0.7)',
};

const FONT_FAMILY = 'Inter, system-ui, sans-serif';

// ============================================================================
// REUSABLE COMPONENTS
// ============================================================================

const LiquidGradient: React.FC<{ speed?: number }> = ({ speed = 1 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  
  const moveX = interpolate(frame * speed, [0, 300], [0, width]);
  const moveY = interpolate(frame * speed, [0, 300], [0, height / 2]);
  
  const gradientStops = [
    interpolateColors(frame, [0, 150], ['#006A4E22', '#004D3D22']),
    interpolateColors(frame, [0, 150], ['#00875F22', '#006A4E22']),
  ];

  return (
    <AbsoluteFill style={{ overflow: 'hidden', zIndex: 0 }}>
      <div style={{
        position: 'absolute',
        top: -height/2,
        left: -width/2,
        right: -width/2,
        bottom: -height/2,
        background: `radial-gradient(circle at ${width/2 + moveX}px ${height/2 + moveY}px, ${gradientStops[0]} 0%, transparent 60%)`,
        opacity: 0.6,
        filter: 'blur(80px)',
      }} />
      <div style={{
        position: 'absolute',
        top: -height/2,
        left: -width/2,
        right: -width/2,
        bottom: -height/2,
        background: `radial-gradient(circle at ${width/2 - moveX}px ${height/2 - moveY}px, ${gradientStops[1]} 0%, transparent 60%)`,
        opacity: 0.4,
        filter: 'blur(100px)',
      }} />
    </AbsoluteFill>
  );
};

const KineticText: React.FC<{ text: string; size?: number; delay?: number }> = ({ text, size = 100, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const words = text.split(' ');
  
  return (
    <div style={{ 
      display: 'flex', 
      flexWrap: 'wrap', 
      gap: size * 0.25, 
      justifyContent: 'center',
      perspective: 1000 
    }}>
      {words.map((word, i) => {
        const wordDelay = delay + (i * 5);
        const progress = spring({
          frame: frame - wordDelay,
          fps,
          config: { damping: 12, stiffness: 100 }
        });
        
        const translateY = interpolate(progress, [0, 1], [100, 0]);
        const opacity = interpolate(progress, [0, 1], [0, 1]);
        const rotateX = interpolate(progress, [0, 1], [45, 0]);
        const blur = interpolate(progress, [0, 1], [20, 0]);

        return (
          <span key={i} style={{
            fontFamily: FONT_FAMILY,
            fontWeight: 800,
            fontSize: size,
            color: 'white',
            display: 'inline-block',
            transform: `translateY(${translateY}px) rotateX(${rotateX}deg)`,
            opacity,
            filter: `blur(${blur}px)`,
            textShadow: '0 10px 30px rgba(0,0,0,0.5)',
            letterSpacing: '-0.02em',
            background: i === words.length - 1 // Highlight last word
              ? `linear-gradient(135deg, #FFF 0%, ${THEME.accent} 100%)` 
              : 'white',
            backgroundClip: i === words.length - 1 ? 'text' : undefined,
            WebkitBackgroundClip: i === words.length - 1 ? 'text' : undefined,
            WebkitTextFillColor: i === words.length - 1 ? 'transparent' : 'white',
          }}>
            {word}
          </span>
        );
      })}
    </div>
  );
};

// ============================================================================
// SCENES
// ============================================================================

const HeroScene: React.FC = () => {
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <KineticText text="Revolutionize Your Store" size={120} />
      <div style={{ height: 40 }} />
      <KineticText text="With AI-Powered Speed" size={80} delay={20} />
    </AbsoluteFill>
  );
};

const FeaturesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  const features = [
    { title: "AI Marketing", sub: "Automated Growth", icon: "🚀" },
    { title: "Logistics", sub: "Smart Operations", icon: "📦" },
    { title: "Analytics", sub: "Real-time Insights", icon: "📊" },
    { title: "Global CDN", sub: "< 50ms Latency", icon: "⚡" },
  ];

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', display: 'flex', flexDirection: 'row', gap: 60 }}>
      {features.map((f, i) => {
        const delay = 5 * i;
        const progress = spring({ frame: frame - delay, fps, config: { damping: 15 } });
        const scale = interpolate(progress, [0, 1], [0.5, 1]);
        const opacity = interpolate(progress, [0, 1], [0, 1]);
        const y = interpolate(progress, [0, 1], [100, 0]);

        return (
          <div key={i} style={{
            width: 380,
            height: 500,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
            borderRadius: 32,
            border: `1px solid ${THEME.primary}44`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 40,
            transform: `scale(${scale}) translateY(${y}px)`,
            opacity,
            backdropFilter: 'blur(20px)',
            boxShadow: `0 20px 50px -10px ${THEME.primary}22`
          }}>
            <div style={{ fontSize: 100, marginBottom: 20 }}>{f.icon}</div>
            <h3 style={{ fontFamily: FONT_FAMILY, color: 'white', fontSize: 32, fontWeight: 700, textAlign: 'center', marginBottom: 10 }}>{f.title}</h3>
            <p style={{ fontFamily: FONT_FAMILY, color: THEME.textMuted, fontSize: 20, textAlign: 'center' }}>{f.sub}</p>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const ImpactScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Emulate data flowing
  const dataLines = useMemo(() => new Array(20).fill(0).map(() => ({
    width: 100 + Math.random() * 400,
    top: Math.random() * 1080,
    speed: 10 + Math.random() * 30,
    opacity: 0.1 + Math.random() * 0.3
  })), []);

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {dataLines.map((line, i) => {
        const x = (frame * line.speed) % (1920 + line.width) - line.width;
        return (
          <div key={i} style={{
            position: 'absolute',
            left: x,
            top: line.top,
            width: line.width,
            height: 2,
            background: `linear-gradient(90deg, transparent, ${THEME.accent}, transparent)`,
            opacity: line.opacity,
          }} />
        );
      })}
      
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
           <KineticText text="10,000+ Active Stores" size={140} />
           <div style={{ height: 30 }} />
           <KineticText text="Trust Ozzyl for Growth" size={60} delay={30} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const EndScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const scale = spring({ frame, fps, config: { damping: 100, stiffness: 50 } });

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
       <div style={{
         width: 300,
         height: 300,
         background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.accent})`,
         borderRadius: 60,
         display: 'flex',
         justifyContent: 'center',
         alignItems: 'center',
         fontSize: 150,
         color: 'white',
         marginBottom: 60,
         boxShadow: `0 0 100px ${THEME.primary}66`,
         transform: `scale(${scale})`
       }}>
         🚀
       </div>
       <KineticText text="Start For Free Today" size={90} delay={10} />
    </AbsoluteFill>
  );
};

// ============================================================================
// MASTER COMPOSITION
// ============================================================================

export const OzzylMasterpiece: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: THEME.bg }}>
      <LiquidGradient speed={2} />
      
      <Sequence durationInFrames={100}>
        <HeroScene />
      </Sequence>

      <Sequence from={100} durationInFrames={120}>
        <FeaturesScene />
      </Sequence>

      <Sequence from={220} durationInFrames={100}>
        <ImpactScene />
      </Sequence>

      <Sequence from={320} durationInFrames={130}>
        <EndScene />
      </Sequence>
      
      {/* Cinematic Vignette */}
      <AbsoluteFill style={{
        background: 'radial-gradient(circle, transparent 50%, #000 120%)',
        pointerEvents: 'none'
      }} />
    </AbsoluteFill>
  );
};
