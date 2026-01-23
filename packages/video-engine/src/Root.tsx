import React from 'react';
import { Composition } from 'remotion';
import { OzzylHero } from './OzzylHero';

// This is the entry point for your Remotion video
// You can define multiple compositions here
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="OzzylMarketing"
        component={OzzylHero}
        durationInFrames={150} // 5 seconds at 30fps
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: "Revolutionize Your Store with AI",
          stats: [
            { label: "Sales Growth", value: "+120%" },
            { label: "Response Time", value: "< 2s" },
            { label: "AI Accuracy", value: "99.9%" }
          ]
        }}
      />
    </>
  );
};
