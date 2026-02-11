# Lottie Animations Library

This directory contains Lottie JSON animation files used throughout the landing page.

## File Naming Convention

- Use kebab-case for file names
- Be descriptive: `icon-rocket.json`, `icon-shield.json`, etc.
- Group by category if needed: `hero/`, `features/`, `benefits/`

## Sources for Free Lottie Animations

1. **LottieFiles** - https://lottiefiles.com/free-animations
2. **IconScout** - https://iconscout.com/lottie-animations/free
3. **Lordicon** - https://lordicon.com/

## Usage

Import animations in the centralized registry at `lib/lottie-animations.ts`:

```typescript
export const LOTTIE_ANIMATIONS = {
  rocket: '/lottie/icon-rocket.json',
  shield: '/lottie/icon-shield.json',
  // ...
};
```

Then use with the `<LottieIcon>` component:

```tsx
<LottieIcon src={LOTTIE_ANIMATIONS.rocket} size={48} />
```

## Performance Tips

- Keep file sizes under 50KB when possible
- Use simple animations for icons (avoid complex gradients)
- Enable lazy loading for below-the-fold animations
