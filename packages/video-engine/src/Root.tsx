import React from 'react';
import { Composition } from 'remotion';
import { OzzylHero } from './OzzylHero';
import { OzzylShowcase } from './OzzylShowcase';
import { OzzylMasterpiece } from './OzzylMasterpiece';

// This is the entry point for your Remotion video
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="OzzylMarketing"
        component={OzzylHero as any}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        // Explicitly cast defaultProps to satisfy the strict type check if needed,
        // or ensure the component type matches. 
        // Remotion 4.0 sometimes needs explicit generics or looser component typing.
        defaultProps={{
          title: "Revolutionize Your Store with AI",
          stats: [
            { label: "Sales Growth", value: "+120%" },
            { label: "Response Time", value: "< 2s" },
            { label: "AI Accuracy", value: "99.9%" }
          ]
        } as any}
      />

      <Composition
        id="OzzylShowcase"
        component={OzzylShowcase}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* 🏆 AWARD WINNING MASTERPIECE */}
      <Composition
        id="OzzylMasterpiece"
        component={OzzylMasterpiece}
        durationInFrames={450} // 15 seconds
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
