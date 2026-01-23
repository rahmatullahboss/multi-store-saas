# Ozzyl Video Engine (Remotion)

This package contains the programmatic video generation engine for Ozzyl, built with Remotion.

## Features
- **Programmatic Animations**: High-performance React-based animations.
- **Dynamic Content**: Pass any props (titles, stats, images) to generate unique videos.
- **Export Ready**: Render to MP4, WebM, or Lottie.

## How to Preview
To see the animation I just created for the landing page:

1. Open your terminal in the root of the project.
2. Navigate to this package:
   ```bash
   cd packages/video-engine
   ```
3. Install the required Remotion dependencies:
   ```bash
   npm install remotion @remotion/cli react react-dom
   ```
4. Start the Remotion Studio:
   ```bash
   npx remotion preview
   ```

## Rendering
To render the video as an MP4 file:
```bash
npx remotion render src/Root.tsx OzzylMarketing out.mp4
```

## Why Remotion?
Unlike standard CSS animations, Remotion allows us to:
1. Ensure frame-perfect timing for professional videos.
2. Automate video creation for marketing campaigns.
3. Generate personalized videos for merchants (e.g., "Your Year in Review").
