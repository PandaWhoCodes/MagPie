# Animation System - Quick Start Guide

Welcome to the MagPie Event Registration Platform animation system! This guide will help you get started with adding beautiful, performant animations to your components.

## 📚 Documentation

- **[ANIMATION_PATTERNS.md](ANIMATION_PATTERNS.md)** - 35+ ready-to-use animation patterns
- **[UI_ENHANCEMENT_GUIDE.md](UI_ENHANCEMENT_GUIDE.md)** - Comprehensive animation library guide

## 🎯 What's Available

### Animation Components

Located in `frontend/src/components/animations/`:

1. **FadeIn** - Fade entrance with directional movement
2. **SlideIn** - Slide entrance from any direction
3. **StaggerChildren** - Sequential list animations
4. **Confetti** - Celebration particle effect

### Hooks

Located in `frontend/src/hooks/`:

1. **useReducedMotion** - Respect user motion preferences (accessibility)
2. **useInView** - Detect when elements enter viewport

### Utilities

Located in `frontend/src/utils/animations.js`:

- Pre-defined easing functions
- Standardized durations
- Common animation presets
- Helper functions

## 🚀 Quick Examples

### 1. Basic Fade In

```jsx
import { FadeIn } from '@/components/animations';

function MyComponent() {
  return (
    <FadeIn direction="up" delay={0.2}>
      <h1>Welcome to MagPie!</h1>
    </FadeIn>
  );
}
```

### 2. Slide In Sidebar

```jsx
import { SlideIn } from '@/components/animations';

function Sidebar() {
  return (
    <SlideIn from="left" duration={0.5}>
      <nav>
        {/* Sidebar content */}
      </nav>
    </SlideIn>
  );
}
```

### 3. Staggered List

```jsx
import { StaggerChildren } from '@/components/animations';

function EventList({ events }) {
  return (
    <StaggerChildren staggerDelay={0.1} direction="up">
      {events.map(event => (
        <div key={event.id} className="event-card">
          {event.name}
        </div>
      ))}
    </StaggerChildren>
  );
}
```

### 4. Success Celebration

```jsx
import { useState } from 'react';
import { Confetti } from '@/components/animations';

function RegistrationForm() {
  const [showConfetti, setShowConfetti] = useState(false);

  const handleSuccess = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  return (
    <>
      <Confetti active={showConfetti} particleCount={50} />
      <button onClick={handleSuccess}>Register!</button>
    </>
  );
}
```

### 5. Accessibility-First Animation

```jsx
import { FadeIn } from '@/components/animations';
import { useReducedMotion } from '@/hooks/useReducedMotion';

function AnimatedCard() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <FadeIn
      direction={prefersReducedMotion ? 'none' : 'up'}
      duration={prefersReducedMotion ? 0.1 : 0.6}
    >
      <div className="card">
        Content
      </div>
    </FadeIn>
  );
}
```

### 6. Scroll-Triggered Animation

```jsx
import { useInView } from '@/hooks/useInView';
import { animate } from 'motion';
import { useEffect } from 'react';

function ScrollReveal({ children }) {
  const [ref, isInView] = useInView({ threshold: 0.3, triggerOnce: true });

  useEffect(() => {
    if (isInView && ref.current) {
      animate(
        ref.current,
        { opacity: [0, 1], y: [50, 0] },
        { duration: 0.6, easing: [0.22, 1, 0.36, 1] }
      );
    }
  }, [isInView]);

  return (
    <div ref={ref}>
      {children}
    </div>
  );
}
```

## 🎨 Using Animation Presets

```jsx
import { easings, durations, presets } from '@/utils/animations';
import { animate } from 'motion';

// Use pre-defined values
animate(
  element,
  { opacity: 1, y: 0 },
  {
    duration: durations.normal, // 0.3s
    easing: easings.smooth      // [0.22, 1, 0.36, 1]
  }
);

// Use animation presets
const fadeInUp = presets.fadeInUp;
// { initial: { opacity: 0, y: 40 }, animate: { opacity: 1, y: 0 }, ... }
```

## ⚡ Performance Tips

1. **Use transform and opacity** - GPU-accelerated properties
   ```jsx
   // ✅ Good
   animate(el, { opacity: 1, x: 100 })

   // ❌ Avoid
   animate(el, { width: '100%', marginLeft: 100 })
   ```

2. **Keep durations short** - 200-500ms for most animations
   ```jsx
   <FadeIn duration={0.3}> {/* Good */}
   <FadeIn duration={2.0}> {/* Too slow */}
   ```

3. **Use stagger sparingly** - Limit to 10-15 items max
   ```jsx
   <StaggerChildren staggerDelay={0.05}> {/* Fast stagger for many items */}
   ```

4. **Always respect reduced motion**
   ```jsx
   const prefersReducedMotion = useReducedMotion();
   const duration = prefersReducedMotion ? 0.01 : 0.6;
   ```

## 🎯 Where to Use Animations

### Public Pages (Encouraged)
- ✅ HomePage (registration form)
- ✅ ThankYouPage (success celebration)
- ✅ CheckInPage (QR check-in)

### Dashboard (Minimal Only)
- ⚠️ Subtle hover effects only
- ⚠️ Keep animations minimal per CLAUDE.md guidelines

### Components
- ✅ Modals (entrance/exit)
- ✅ Forms (validation feedback)
- ✅ Buttons (hover/click feedback)
- ✅ Cards (hover lift effect)
- ✅ Loading states (spinners, skeletons)

## 📊 Bundle Size Impact

- **Motion One**: 5.8KB gzipped
- **Animation Components**: ~3KB
- **Total Addition**: ~9KB gzipped (~1.8% increase)
- **Performance**: Minimal impact on FCP

## 🔧 Customization

All animation components accept standard props:

```jsx
<FadeIn
  direction="up"      // 'up' | 'down' | 'left' | 'right' | 'none'
  delay={0.2}         // seconds
  duration={0.6}      // seconds
  distance={40}       // pixels
  className="my-class" // additional classes
>
  {children}
</FadeIn>
```

## 🐛 Troubleshooting

### Animation not working?
1. Check if Motion One is installed: `npm list motion`
2. Verify import path uses @ alias: `import { FadeIn } from '@/components/animations'`
3. Check browser console for errors

### Animation too fast/slow?
- Adjust `duration` prop (in seconds)
- Use duration presets: `durations.fast`, `durations.normal`, `durations.slow`

### Want different easing?
- Use easing presets: `easings.smooth`, `easings.bounce`, `easings.snappy`
- Or custom cubic-bezier: `[0.22, 1, 0.36, 1]`

## 📖 Next Steps

1. Browse [ANIMATION_PATTERNS.md](ANIMATION_PATTERNS.md) for more examples
2. Read [UI_ENHANCEMENT_GUIDE.md](UI_ENHANCEMENT_GUIDE.md) for comprehensive guide
3. Experiment with different animations on public pages
4. Share your best animation patterns with the team!

## 🎉 Examples in Production

Check out these components using animations:

- `HomePage.jsx` - Registration form entrance
- `ThankYouPage.jsx` - Success celebration
- `QRCodeModal.jsx` - Modal transitions

---

**Last Updated**: January 2025
**Animation Library**: Motion One (5.8KB)
**Total Components**: 4 animation components, 2 hooks, 1 utility file
