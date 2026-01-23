---
name: remotion-development
description: "Expertise in Remotion framework for creating videos programmatically using React and TypeScript. Covers project setup, compositions, sequences, series, animation helpers (interpolate, spring), audio/video integration, and rendering (CLI/SSR)."
---

# Remotion Development Skill

Remotion allows you to create videos programmatically using React. It leverages web technologies to build complex animations and video effects that can be rendered to MP4, WebM, or even frame-by-frame.

## Core Concepts

### 1. Composition
A composition is the basic unit of a Remotion video. It defines the dimensions, duration, and frame rate.

```tsx
import { Composition } from 'remotion';
import { MyVideo } from './MyVideo';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MyVideo"
        component={MyVideo}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
```

### 2. Sequence & Series
- **Sequence**: Allows you to shift the time for its children.
- **Series**: Allows you to play multiple sequences one after another.

```tsx
import { Sequence, Series } from 'remotion';

export const MyVideo = () => {
  return (
    <Series>
      <Series.Sequence durationInFrames={30}>
        <Scene1 />
      </Series.Sequence>
      <Series.Sequence durationInFrames={60}>
        <Scene2 />
      </Series.Sequence>
    </Series>
  );
};
```

### 3. Animation Helpers
- `useCurrentFrame()`: Returns the current frame of the composition.
- `useVideoConfig()`: Returns dimensions, duration, and FPS.
- `interpolate()`: Map a range of values to another.
- `spring()`: Create natural-looking animations based on physics.

```tsx
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

const Scene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const opacity = interpolate(frame, [0, 20], [0, 1]);
  const scale = spring({
    frame,
    fps,
    config: { stiffness: 100 },
  });

  return <div style={{ opacity, transform: `scale(${scale})` }}>Hello!</div>;
};
```

## Best Practices

### 1. Assets Handling
Use `staticFile()` for local assets in the `public/` folder to ensure they are correctly resolved during preview and rendering.

```tsx
import { staticFile, Video } from 'remotion';

const MyVideo = () => {
  return <Video src={staticFile('my-video.mp4')} />;
};
```

### 2. Performance
- Avoid heavy computations inside the render loop.
- Use `useVideoConfig()` to make your components responsive to composition changes.
- Prefer `interpolate` and `spring` for animations instead of `useEffect` or `useState`.

### 3. Audio
Use the `<Audio />` component to add sound. You can also use `Series` to sync audio with visual transitions.

## Rendering

### CLI Rendering
```bash
# Preview
npx remotion preview

# Render to MP4
npx remotion render src/index.ts MyVideo out.mp4
```

### SSR (Server-Side Rendering)
Use `@remotion/renderer` to render videos on a server (e.g., Node.js, Cloudflare Workers - though D1/Workers might have limitations with browser-based rendering).

## When to Use This Skill
- Creating dynamic video content (e.g., personalized ads, data visualizations).
- Automating video production workflows.
- Building motion graphics that need to be updated programmatically.
- Integrating video generation into a SaaS product.
