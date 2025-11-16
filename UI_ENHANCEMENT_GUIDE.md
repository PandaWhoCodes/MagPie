# UI Enhancement Guide - Modern Animation & Component Libraries

> **Last Updated**: January 2025
> **Purpose**: Comprehensive guide for building creative, interactive UIs with animations
> **Use Case**: Reference for any React project requiring modern UI/UX enhancements

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Animation Libraries](#animation-libraries)
3. [UI Component Libraries](#ui-component-libraries)
4. [Decision Matrix](#decision-matrix)
5. [Installation & Setup](#installation--setup)
6. [Project Structure](#project-structure)
7. [Code Patterns](#code-patterns)
8. [Best Practices](#best-practices)
9. [Resources](#resources)
10. [Quick Start Recipes](#quick-start-recipes)

---

## Executive Summary

### TL;DR - Recommended Stack

**For Most Projects:**
```bash
# Core Foundation (Always Install)
# Note: Tailwind v4 requires @tailwindcss/postcss plugin
npm install -D tailwindcss@^4 postcss autoprefixer @tailwindcss/postcss
npx shadcn@latest init
npm install gsap @gsap/react framer-motion

# Optional Enhancements
npm install lottie-react react-spring lucide-react
```

> **⚠️ Tailwind v4 Breaking Change**: If using Tailwind CSS v4.x, you must:
> 1. Install `@tailwindcss/postcss` package
> 2. Use `'@tailwindcss/postcss'` in postcss.config.js (not `'tailwindcss'`)
> 3. Replace `@tailwind` directives with `@import "tailwindcss"` in CSS files
> 4. Use plain CSS instead of `@apply` in `@layer base`

**Why This Stack?**
- ✅ **GSAP**: 100% FREE (as of April 2025) - complex animations, scroll effects
- ✅ **Framer Motion**: Best for React UI micro-interactions
- ✅ **shadcn/ui**: Components you own (not dependencies)
- ✅ **Tailwind CSS**: Utility-first styling
- ✅ All have excellent docs and large communities

### Key Insight: GSAP is Now FREE! 🎉

As of April 30, 2025, GSAP (including ALL premium plugins) became 100% free thanks to Webflow's sponsorship. This includes:
- ScrollTrigger (scroll-based animations)
- SplitText (text animations)
- MorphSVG (SVG morphing)
- Draggable (drag interactions)
- MotionPath, Physics2D, and more!

---

## Animation Libraries

### 1. GSAP (GreenSock Animation Platform)

**Status**: 🟢 FREE (all features)
**Best For**: Complex animations, scroll effects, SVG manipulation, timeline sequencing
**Bundle Size**: 23 KB (core, gzipped)
**Performance**: 60 FPS with thousands of simultaneous animations

#### When to Use GSAP

✅ Scroll-triggered animations (parallax, pin sections, scrub)
✅ Complex timeline sequences
✅ SVG morphing and path animations
✅ Text animations (split by character/word/line)
✅ High-performance animations across frameworks
✅ Physics-based motion

#### Installation

```bash
npm install gsap @gsap/react
```

#### Basic Setup

**Create `src/lib/gsap.js`:**
```javascript
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

// Register plugins
gsap.registerPlugin(ScrollTrigger, SplitText);

export { gsap, ScrollTrigger, SplitText };
```

#### Example Usage

```javascript
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

function ScrollAnimation() {
  const containerRef = useRef();

  useGSAP(() => {
    // Fade in on scroll
    gsap.from('.fade-in', {
      scrollTrigger: {
        trigger: '.fade-in',
        start: 'top 80%',
        end: 'top 20%',
        scrub: 1,
        markers: false // set true for debugging
      },
      opacity: 0,
      y: 100,
    });

    // Staggered animation
    gsap.from('.stagger-item', {
      opacity: 0,
      y: 50,
      stagger: 0.1,
      duration: 0.8,
      ease: 'power2.out'
    });
  }, { scope: containerRef }); // scope for cleanup

  return (
    <div ref={containerRef}>
      <div className="fade-in">Scroll to reveal</div>
      <div className="stagger-item">Item 1</div>
      <div className="stagger-item">Item 2</div>
      <div className="stagger-item">Item 3</div>
    </div>
  );
}
```

#### Pro Tips

- Use `useGSAP` hook for automatic cleanup
- Set `scope` to prevent memory leaks
- Use `markers: true` for debugging scroll triggers
- `contextSafe()` for event handlers

#### Documentation

- Official: https://gsap.com/docs/
- ScrollTrigger: https://gsap.com/docs/v3/Plugins/ScrollTrigger/
- Examples: https://codepen.io/GreenSock/

---

### 2. Framer Motion

**Best For**: React UI micro-interactions, layout animations, gesture-based interactions
**Bundle Size**: 32 KB (gzipped)
**Performance**: 60 FPS, optimized for React

#### When to Use Framer Motion

✅ React component micro-interactions
✅ Layout animations (automatic FLIP technique)
✅ Page/route transitions
✅ Modal/drawer animations
✅ Drag and drop interfaces
✅ Declarative API (feels like React)

#### Installation

```bash
npm install framer-motion
```

#### Example Usage

```javascript
import { motion, AnimatePresence } from 'framer-motion';

// Simple fade in
function FadeIn({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
}

// Hover effects
function HoverCard({ children }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      {children}
    </motion.div>
  );
}

// Page transitions
function PageTransition({ children, location }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Staggered list
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

function StaggeredList({ items }) {
  return (
    <motion.ul
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {items.map((item, i) => (
        <motion.li key={i} variants={itemVariants}>
          {item}
        </motion.li>
      ))}
    </motion.ul>
  );
}
```

#### Pro Tips

- Use `AnimatePresence` for exit animations
- `mode="wait"` prevents overlapping animations
- `variants` for complex multi-step animations
- `whileInView` for scroll-triggered animations
- `layout` prop for automatic layout transitions

#### Documentation

- Official: https://www.framer.com/motion/
- Examples: https://www.framer.com/motion/examples/

---

### 3. React Spring

**Best For**: Physics-based animations, natural motion, 3D scenes
**Bundle Size**: Similar to Framer Motion
**Key Advantage**: Spring physics instead of duration curves

#### When to Use React Spring

✅ Natural, physics-based motion
✅ Spring dynamics (no duration, more natural)
✅ 3D animations (with React Three Fiber)
✅ Fluid, responsive interactions

#### Installation

```bash
npm install @react-spring/web
```

#### Example Usage

```javascript
import { useSpring, animated, useTrail } from '@react-spring/web';

// Simple spring animation
function SpringFade() {
  const springs = useSpring({
    from: { opacity: 0, y: 100 },
    to: { opacity: 1, y: 0 },
    config: { tension: 280, friction: 60 }
  });

  return <animated.div style={springs}>Content</animated.div>;
}

// Trail (staggered) animation
function Trail({ items }) {
  const trail = useTrail(items.length, {
    from: { opacity: 0, x: -20 },
    to: { opacity: 1, x: 0 },
    config: { mass: 5, tension: 2000, friction: 200 }
  });

  return (
    <>
      {trail.map((style, index) => (
        <animated.div key={index} style={style}>
          {items[index]}
        </animated.div>
      ))}
    </>
  );
}
```

#### Configuration Presets

- `gentle`: Smooth, slow motion
- `wobbly`: Bouncy, playful
- `stiff`: Quick, responsive
- `slow`: Very gradual
- `molasses`: Ultra slow
- Custom: `{ tension: 280, friction: 60, mass: 1 }`

#### Documentation

- Official: https://www.react-spring.dev/
- Examples: https://www.react-spring.dev/examples

---

### 4. Lottie

**Best For**: Complex After Effects animations, designer-created animations
**File Format**: JSON (scalable, lightweight)

#### When to Use Lottie

✅ Complex animations designed in After Effects
✅ Consistent cross-platform animations
✅ Small file sizes (vs GIFs/videos)
✅ Fully customizable via JSON

#### Installation

```bash
npm install lottie-react
```

#### Example Usage

```javascript
import Lottie from 'lottie-react';
import animationData from './animation.json';

function LottieAnimation() {
  return (
    <Lottie
      animationData={animationData}
      loop={true}
      autoplay={true}
      style={{ width: 300, height: 300 }}
    />
  );
}
```

#### Resources

- **LottieFiles**: https://lottiefiles.com/ (free animation library)
- **After Effects Plugin**: https://lottiefiles.com/plugins/after-effects

#### Documentation

- Official: https://airbnb.io/lottie/
- React: https://www.npmjs.com/package/lottie-react

---

### 5. CSS-Only Animation Libraries

**Best For**: Simple transitions, hover effects, minimal JavaScript overhead

#### Animate.css

```bash
npm install animate.css
```

```javascript
import 'animate.css';

<div className="animate__animated animate__fadeIn">
  Fade in!
</div>
```

#### {css}animation

500+ high-performance animations, zero dependencies.

```html
<link rel="stylesheet" href="https://unpkg.com/css-animation-library@latest/css/animation.min.css">

<div class="cssanimation fadeInBottom">Content</div>
```

#### Animista

Visual animation generator: https://animista.net/
Choose animations visually, copy CSS code.

---

## UI Component Libraries

### 1. shadcn/ui + Tailwind CSS (RECOMMENDED)

**Philosophy**: Copy-paste components YOU own (not package dependencies)
**Style**: Tailwind CSS + Radix UI primitives
**Customization**: Complete control

#### Why shadcn/ui?

✅ Not a package - you own the code
✅ Built on Radix UI (WAI-ARIA compliant)
✅ Beautiful, accessible components
✅ TypeScript support
✅ Dark mode included
✅ Active ecosystem
✅ Highly customizable

#### Installation

```bash
# Install Tailwind
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Initialize shadcn/ui
npx shadcn@latest init

# Add components (copy-pasted into your project)
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add form
```

#### Configuration

> **⚠️ IMPORTANT: Tailwind CSS v4 Breaking Changes**
>
> If you're using **Tailwind CSS v4.x** (like 4.1.17 in this project), the configuration syntax has changed significantly:
>
> 1. **PostCSS Plugin**: Use `@tailwindcss/postcss` instead of `tailwindcss` directly
> 2. **CSS Import Syntax**: Use `@import "tailwindcss"` instead of `@tailwind` directives
> 3. **No `@apply` in `@layer base`**: Write plain CSS or use Tailwind classes directly

**For Tailwind CSS v4.x:**

**package.json:**
```json
{
  "devDependencies": {
    "@tailwindcss/postcss": "^4.1.17",
    "autoprefixer": "^10.4.22",
    "postcss": "^8.5.6",
    "tailwindcss": "^4.1.17"
  }
}
```

**postcss.config.js:**
```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},  // Note: NOT 'tailwindcss' directly!
    autoprefixer: {},
  },
}
```

**tailwind.config.js:**
```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**src/index.css:**
```css
@import "tailwindcss";  /* v4 syntax - NOT @tailwind directives! */

@layer base {
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    /* Use plain CSS, not @apply in v4 */
    background: linear-gradient(to bottom right, #f9fafb, #e5e7eb);
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1.25rem;
  }
}
```

**For Tailwind CSS v3.x (Legacy):**

**postcss.config.js:**
```javascript
export default {
  plugins: {
    tailwindcss: {},  // v3 uses 'tailwindcss' directly
    autoprefixer: {},
  },
}
```

**src/index.css:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* v3 allows @apply in @layer base */
@layer base {
  body {
    @apply bg-gradient-to-br from-gray-50 to-gray-200 min-h-screen;
  }
}
```

> **Migration Note**: If you see errors like "Cannot apply unknown utility class" or "[postcss] tailwindcss requires @tailwindcss/postcss", you need to:
> 1. Install `@tailwindcss/postcss`: `npm install --save-dev @tailwindcss/postcss`
> 2. Update `postcss.config.js` to use `'@tailwindcss/postcss'` plugin
> 3. Replace `@tailwind` directives with `@import "tailwindcss"` in CSS files
> 4. Convert `@apply` usage in `@layer base` to plain CSS

#### Available Components

- Buttons, Cards, Dialogs, Dropdowns
- Forms with validation
- Data tables
- Navigation menus
- Tabs, Accordions, Tooltips
- Toasts/alerts
- Progress bars
- And 50+ more

#### Animation Extensions

- **Animate UI**: shadcn + Framer Motion animations
- **Indie UI**: 20+ animated shadcn components
- **Text animations**: Blur, flip, typing effects

#### Documentation

- Official: https://ui.shadcn.com/
- Examples: https://ui.shadcn.com/examples

---

### 2. DaisyUI

**Approach**: Tailwind plugin that adds component classes
**Components**: 40+ interactive components
**Themes**: 35+ built-in themes

#### Installation

```bash
npm install -D daisyui
```

**tailwind.config.js:**
```javascript
module.exports = {
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["light", "dark", "cupcake"],
  },
}
```

#### Example Usage

```jsx
// Clean, semantic class names
<button className="btn btn-primary">Click me</button>
<div className="card">
  <div className="card-body">
    <h2 className="card-title">Card Title</h2>
    <p>Card content</p>
  </div>
</div>
```

#### Documentation

- Official: https://daisyui.com/

---

### 3. Chakra UI

**Focus**: Accessibility, simplicity, developer experience
**Components**: Highly composable
**Theme**: Easy customization

#### Installation

```bash
npm install @chakra-ui/react @emotion/react @emotion/styled framer-motion
```

#### Example Usage

```javascript
import { ChakraProvider, Button, Box } from '@chakra-ui/react';

function App() {
  return (
    <ChakraProvider>
      <Box p={4}>
        <Button colorScheme="blue">Click me</Button>
      </Box>
    </ChakraProvider>
  );
}
```

#### Documentation

- Official: https://chakra-ui.com/

---

### 4. Material UI (MUI)

**Best For**: Enterprise apps, comprehensive component needs
**Components**: 100+ components
**Customization**: Powerful theming system

#### Installation

```bash
npm install @mui/material @emotion/react @emotion/styled
```

#### When to Use

✅ Enterprise projects
✅ Need for advanced components (data grid, date pickers)
✅ Material Design aesthetic

#### Documentation

- Official: https://mui.com/

---

### 5. Mantine

**Features**: 100+ components, hooks, utilities
**Style**: Modern, clean, highly customizable

#### Installation

```bash
npm install @mantine/core @mantine/hooks
```

#### Unique Features

- Comprehensive hooks library
- Form management built-in
- Rich text editor
- Notifications system
- Date/time components

#### Documentation

- Official: https://mantine.dev/

---

## Decision Matrix

### When to Use What?

| Need | Best Choice | Alternative |
|------|-------------|-------------|
| Complex scroll animations | GSAP + ScrollTrigger | Framer Motion |
| React UI micro-interactions | Framer Motion | React Spring |
| Physics-based motion | React Spring | GSAP + Physics2D |
| SVG morphing | GSAP MorphSVG | Framer Motion |
| Simple hover effects | CSS + Framer Motion | GSAP |
| Timeline sequences | GSAP Timeline | Framer Motion + useAnimation |
| Layout animations | Framer Motion | React Spring |
| Designer-created animations | Lottie | GSAP recreation |
| 3D scenes | React Three Fiber | raw Three.js |
| Clean UI components | shadcn/ui + Tailwind | Chakra UI |
| Enterprise components | Material UI | Ant Design |
| Drag & drop | GSAP Draggable | Framer Motion drag |
| Page transitions | Framer Motion | React Spring |
| Loading states | Framer Motion | CSS animations |
| Form animations | Framer Motion | React Spring |

### Stack Combinations

#### Recommended Combo #1: GSAP + Framer Motion + shadcn/ui
- **Use GSAP for**: Scroll animations, complex timelines, SVG
- **Use Framer Motion for**: UI micro-interactions, page transitions
- **Use shadcn/ui for**: Component library
- **Best for**: Most projects requiring both complex and simple animations

#### Recommended Combo #2: Framer Motion + shadcn/ui
- **Use Framer Motion for**: All animations
- **Use shadcn/ui for**: Component library
- **Best for**: React-focused projects with simpler animation needs

#### Recommended Combo #3: GSAP + DaisyUI
- **Use GSAP for**: All animations
- **Use DaisyUI for**: Quick, themed components
- **Best for**: Rapid prototyping with complex animations

---

## Installation & Setup

### Complete Setup for New Project

#### Step 1: Install Tailwind CSS

**For Tailwind CSS v4.x (Recommended):**

```bash
# Install Tailwind v4 and required PostCSS plugin
npm install -D tailwindcss@^4 postcss autoprefixer @tailwindcss/postcss
npx tailwindcss init -p
```

**postcss.config.js:**
```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},  // v4 requires this plugin
    autoprefixer: {},
  },
}
```

**tailwind.config.js:**
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**src/index.css:**
```css
@import "tailwindcss";  /* v4 uses @import instead of @tailwind */

/* Your custom styles */
@layer base {
  /* Use plain CSS, not @apply */
  body {
    margin: 0;
    padding: 0;
  }
}
```

**For Tailwind CSS v3.x (Legacy):**

```bash
npm install -D tailwindcss@^3 postcss autoprefixer
npx tailwindcss init -p
```

**postcss.config.js:**
```javascript
export default {
  plugins: {
    tailwindcss: {},  // v3 uses 'tailwindcss' directly
    autoprefixer: {},
  },
}
```

**src/index.css:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* v3 allows @apply */
@layer base {
  body {
    @apply m-0 p-0;
  }
}
```

#### Step 2: Initialize shadcn/ui

```bash
npx shadcn@latest init
```

This creates:
- `components.json` - Configuration
- `src/lib/utils.ts` - Utility functions
- `src/components/ui/` - Component folder

Add your first components:
```bash
npx shadcn@latest add button card dialog input
```

#### Step 3: Install Animation Libraries

```bash
# GSAP
npm install gsap @gsap/react

# Framer Motion
npm install framer-motion

# Optional: React Spring
npm install @react-spring/web

# Optional: Lottie
npm install lottie-react
```

#### Step 4: Configure GSAP

**Create `src/lib/gsap.js`:**
```javascript
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { Draggable } from 'gsap/Draggable';

// Register all plugins you'll use
gsap.registerPlugin(ScrollTrigger, SplitText, Draggable);

// Optional: Set global defaults
gsap.defaults({
  ease: 'power2.out',
  duration: 0.8
});

export { gsap, ScrollTrigger, SplitText, Draggable };
export default gsap;
```

#### Step 5: Install Icon Library (Optional)

```bash
# Lucide React (recommended)
npm install lucide-react

# Or React Icons
npm install react-icons
```

#### Step 6: Setup Complete!

Your project now has:
- ✅ Tailwind CSS for styling
- ✅ shadcn/ui for components
- ✅ GSAP for complex animations
- ✅ Framer Motion for UI interactions
- ✅ Icons library

---

### Adding to Existing Project

If you already have a React project:

1. **Check existing dependencies**: Don't duplicate styling systems
2. **Install Tailwind** if not present
3. **Add shadcn/ui** (won't conflict with existing components)
4. **Install GSAP + Framer Motion**
5. **Gradually migrate** components to use new tools

---

## Project Structure

### Recommended Folder Structure

```
your-project/
├── src/
│   ├── components/
│   │   ├── ui/                    # shadcn components
│   │   │   ├── button.jsx
│   │   │   ├── card.jsx
│   │   │   ├── dialog.jsx
│   │   │   └── ...
│   │   ├── animations/            # Reusable animation wrappers
│   │   │   ├── FadeIn.jsx
│   │   │   ├── SlideIn.jsx
│   │   │   ├── ScrollReveal.jsx
│   │   │   ├── StaggeredList.jsx
│   │   │   └── PageTransition.jsx
│   │   ├── common/                # Common app components
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Navigation.jsx
│   │   │   └── ...
│   │   └── features/              # Feature-specific components
│   │       ├── search/
│   │       ├── profile/
│   │       └── ...
│   ├── hooks/                     # Custom React hooks
│   │   ├── useAnimation.js
│   │   ├── useScrollPosition.js
│   │   ├── useDebounce.js
│   │   └── useMediaQuery.js
│   ├── lib/                       # Third-party configurations
│   │   ├── gsap.js               # GSAP setup & plugin registration
│   │   └── utils.js              # shadcn utils
│   ├── styles/                    # Global styles
│   │   ├── globals.css
│   │   └── animations.css
│   ├── utils/                     # Utility functions
│   │   ├── animations.js
│   │   └── helpers.js
│   └── App.jsx
├── components.json                # shadcn config
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

### Key Principles

1. **Feature-Based Organization**: Group by feature, not just file type
2. **Component Co-location**: Keep related files together
3. **Atomic Design**: Build from atoms → molecules → organisms
4. **Reusable Animations**: Extract common patterns
5. **Consistent Naming**: Clear conventions throughout

---

## Code Patterns

### Pattern 1: Reusable Fade In Component

**File: `src/components/animations/FadeIn.jsx`**

```javascript
import { motion } from 'framer-motion';

export function FadeIn({
  children,
  delay = 0,
  direction = 'up',
  duration = 0.6,
  once = true
}) {
  const directions = {
    up: { y: 40 },
    down: { y: -40 },
    left: { x: 40 },
    right: { x: -40 }
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        ...directions[direction]
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0
      }}
      viewport={{ once }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1] // Custom easing
      }}
    >
      {children}
    </motion.div>
  );
}
```

**Usage:**
```javascript
<FadeIn direction="up" delay={0.2}>
  <h1>Welcome</h1>
</FadeIn>
```

---

### Pattern 2: GSAP Scroll Reveal

**File: `src/components/animations/ScrollReveal.jsx`**

```javascript
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

export function ScrollReveal({ children, trigger = 'top 80%', scrub = false }) {
  const ref = useRef();

  useGSAP(() => {
    gsap.from(ref.current, {
      scrollTrigger: {
        trigger: ref.current,
        start: trigger,
        end: 'top 20%',
        scrub: scrub ? 1 : false,
        markers: false, // set true for debugging
      },
      opacity: 0,
      y: 100,
      duration: 1,
    });
  }, [trigger, scrub]);

  return <div ref={ref}>{children}</div>;
}
```

**Usage:**
```javascript
<ScrollReveal>
  <div>Appears on scroll</div>
</ScrollReveal>
```

---

### Pattern 3: Staggered List Animation

**File: `src/components/animations/StaggeredList.jsx`**

```javascript
import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export function StaggeredList({ items, className = '' }) {
  return (
    <motion.ul
      variants={container}
      initial="hidden"
      animate="show"
      className={className}
    >
      {items.map((item, i) => (
        <motion.li key={i} variants={item}>
          {item}
        </motion.li>
      ))}
    </motion.ul>
  );
}
```

**Usage:**
```javascript
<StaggeredList items={['Item 1', 'Item 2', 'Item 3']} />
```

---

### Pattern 4: Page Transitions

**File: `src/components/animations/PageTransition.jsx`**

```javascript
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const pageVariants = {
  initial: {
    opacity: 0,
    x: -20
  },
  animate: {
    opacity: 1,
    x: 0
  },
  exit: {
    opacity: 0,
    x: 20
  }
};

export function PageTransition({ children }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{
          duration: 0.3,
          ease: 'easeInOut'
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

**Usage:**
```javascript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PageTransition } from './components/animations/PageTransition';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={
          <PageTransition>
            <YourRoutes />
          </PageTransition>
        } />
      </Routes>
    </BrowserRouter>
  );
}
```

---

### Pattern 5: Animated Button

**File: `src/components/ui/AnimatedButton.jsx`**

```javascript
import { motion } from 'framer-motion';
import { Button } from './button'; // shadcn button

export function AnimatedButton({ children, variant = 'default', ...props }) {
  return (
    <Button asChild variant={variant} {...props}>
      <motion.button
        whileHover={{
          scale: 1.05,
          transition: { duration: 0.2 }
        }}
        whileTap={{
          scale: 0.95,
          transition: { duration: 0.1 }
        }}
      >
        {children}
      </motion.button>
    </Button>
  );
}
```

**Usage:**
```javascript
<AnimatedButton variant="primary" onClick={handleClick}>
  Click me
</AnimatedButton>
```

---

### Pattern 6: Hover Card with GSAP

**File: `src/components/animations/HoverCard.jsx`**

```javascript
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';

export function HoverCard({ children, className = '' }) {
  const cardRef = useRef();
  const { contextSafe } = useGSAP({ scope: cardRef });

  const handleMouseEnter = contextSafe(() => {
    gsap.to(cardRef.current, {
      scale: 1.05,
      boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
      duration: 0.3,
      ease: 'power2.out'
    });
  });

  const handleMouseLeave = contextSafe(() => {
    gsap.to(cardRef.current, {
      scale: 1,
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      duration: 0.3,
      ease: 'power2.out'
    });
  });

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`bg-white rounded-lg p-6 ${className}`}
    >
      {children}
    </div>
  );
}
```

---

### Pattern 7: Loading Skeleton

**File: `src/components/ui/Skeleton.jsx`**

```javascript
import { motion } from 'framer-motion';

export function Skeleton({ className = '', variant = 'pulse' }) {
  const variants = {
    pulse: {
      opacity: [0.5, 1, 0.5],
    },
    wave: {
      backgroundPosition: ['200% 0', '-200% 0'],
    }
  };

  const animation = variant === 'pulse'
    ? { opacity: [0.5, 1, 0.5] }
    : { backgroundPosition: ['200% 0', '-200% 0'] };

  return (
    <motion.div
      className={`bg-gray-200 rounded ${className}`}
      animate={animation}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
      style={
        variant === 'wave'
          ? {
              backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
              backgroundSize: '200% 100%'
            }
          : {}
      }
    />
  );
}
```

**Usage:**
```javascript
<Skeleton className="h-8 w-48 mb-4" />
<Skeleton className="h-4 w-full" variant="wave" />
```

---

### Pattern 8: Loading Spinner

**File: `src/components/ui/Spinner.jsx`**

```javascript
import { motion } from 'framer-motion';

export function Spinner({ size = 'md', color = 'blue' }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-4',
    lg: 'w-12 h-12 border-4'
  };

  const colors = {
    blue: 'border-blue-500 border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-500 border-t-transparent'
  };

  return (
    <motion.div
      className={`${sizes[size]} ${colors[color]} rounded-full`}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear'
      }}
    />
  );
}
```

---

### Pattern 9: Modal/Dialog Animation

```javascript
import { motion, AnimatePresence } from 'framer-motion';

const backdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

const modal = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: -50
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30
    }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 50
  }
};

export function AnimatedModal({ isOpen, onClose, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          variants={backdrop}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-lg p-6 max-w-md w-full"
            variants={modal}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

---

### Pattern 10: Parallax Scroll Effect

```javascript
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

export function ParallaxSection({ children, speed = 0.5, className = '' }) {
  const ref = useRef();

  useGSAP(() => {
    gsap.to(ref.current, {
      y: () => window.innerHeight * speed,
      scrollTrigger: {
        trigger: ref.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      }
    });
  }, [speed]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
```

---

## Best Practices

### Performance

1. **Use `will-change` CSS property sparingly**
   ```css
   .animated-element {
     will-change: transform, opacity;
   }
   ```
   Only apply to elements that will animate soon, remove after animation.

2. **Animate transform and opacity only** (GPU-accelerated)
   - ✅ Good: `transform`, `opacity`, `filter`
   - ❌ Avoid: `width`, `height`, `top`, `left`, `margin`

3. **Use CSS containment**
   ```css
   .animated-container {
     contain: layout style paint;
   }
   ```

4. **Debounce scroll events** when not using ScrollTrigger
   ```javascript
   import { useEffect, useState } from 'react';
   import { debounce } from 'lodash';

   function useScrollPosition() {
     const [scrollY, setScrollY] = useState(0);

     useEffect(() => {
       const handleScroll = debounce(() => {
         setScrollY(window.scrollY);
       }, 100);

       window.addEventListener('scroll', handleScroll);
       return () => window.removeEventListener('scroll', handleScroll);
     }, []);

     return scrollY;
   }
   ```

5. **Lazy load animation libraries**
   ```javascript
   // Load GSAP plugins only when needed
   const loadMorphSVG = async () => {
     const { MorphSVG } = await import('gsap/MorphSVG');
     gsap.registerPlugin(MorphSVG);
   };
   ```

### Accessibility

1. **Respect prefers-reduced-motion**
   ```css
   @media (prefers-reduced-motion: reduce) {
     * {
       animation-duration: 0.01ms !important;
       animation-iteration-count: 1 !important;
       transition-duration: 0.01ms !important;
     }
   }
   ```

   Or in React:
   ```javascript
   import { useReducedMotion } from 'framer-motion';

   function Component() {
     const shouldReduceMotion = useReducedMotion();

     return (
       <motion.div
         animate={{ x: shouldReduceMotion ? 0 : 100 }}
       />
     );
   }
   ```

2. **Ensure keyboard navigation works** with animations

3. **Don't animate critical content** on page load (blocks interaction)

4. **Add ARIA labels** to animated loading states
   ```jsx
   <div role="status" aria-live="polite" aria-label="Loading">
     <Spinner />
   </div>
   ```

### UX Guidelines

1. **Animation Duration Rules**
   - Micro-interactions: 100-300ms
   - UI transitions: 300-500ms
   - Page transitions: 300-600ms
   - Scroll animations: 800-1200ms
   - Complex sequences: 1-2 seconds max

2. **Easing Functions**
   - **Ease-out**: Use for elements entering (starts fast, ends slow)
   - **Ease-in**: Use for elements exiting (starts slow, ends fast)
   - **Ease-in-out**: Use for elements that move position
   - **Spring**: Use for natural, physics-based motion

3. **Purpose-Driven Animation**
   - Every animation should have a purpose (feedback, guidance, delight)
   - Don't animate just because you can
   - Subtle is usually better than flashy

4. **Consistency**
   - Use consistent timing and easing across similar interactions
   - Establish a motion design system

5. **Progressive Enhancement**
   - Ensure core functionality works without animations
   - Animations should enhance, not be required

### Code Organization

1. **Extract reusable animation components**
   - Don't repeat animation logic
   - Create wrappers for common patterns

2. **Use variants for complex animations**
   ```javascript
   const variants = {
     initial: { opacity: 0, y: 20 },
     animate: { opacity: 1, y: 0 },
     exit: { opacity: 0, y: -20 }
   };

   <motion.div variants={variants} />
   ```

3. **Centralize animation configuration**
   ```javascript
   // src/lib/animations.js
   export const easings = {
     smooth: [0.22, 1, 0.36, 1],
     bounce: [0.68, -0.55, 0.27, 1.55],
   };

   export const durations = {
     fast: 0.2,
     normal: 0.3,
     slow: 0.5,
   };
   ```

4. **Use TypeScript for better DX**
   ```typescript
   interface FadeInProps {
     children: React.ReactNode;
     delay?: number;
     direction?: 'up' | 'down' | 'left' | 'right';
     duration?: number;
     once?: boolean;
   }

   export function FadeIn({ ... }: FadeInProps) { ... }
   ```

### Debugging

1. **Enable GSAP markers** during development
   ```javascript
   ScrollTrigger.create({
     trigger: '.element',
     markers: true, // Shows trigger points
   });
   ```

2. **Use React DevTools** to inspect motion components

3. **Log animation states**
   ```javascript
   <motion.div
     onAnimationStart={() => console.log('Animation started')}
     onAnimationComplete={() => console.log('Animation completed')}
   />
   ```

---

## Resources

### Official Documentation

- **GSAP**: https://gsap.com/docs/
- **Framer Motion**: https://www.framer.com/motion/
- **React Spring**: https://www.react-spring.dev/
- **shadcn/ui**: https://ui.shadcn.com/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Lottie**: https://airbnb.io/lottie/

### Inspiration & Examples

- **Awwwards** (Award-winning designs): https://www.awwwards.com/websites/gsap/
- **Codrops** (Tutorials & demos): https://tympanus.net/codrops/
- **CodeMyUI** (47 GSAP examples): https://codemyui.com/tag/gsap/
- **Made With GSAP** (Premium effects): https://madewithgsap.com/
- **Dribbble** (Design inspiration): https://dribbble.com/tags/animation
- **Behance** (Motion design): https://www.behance.net/search/projects?field=animation

### Component Libraries & Examples

- **Animate UI**: https://animate-ui.com/ (shadcn + animations)
- **Indie UI**: https://ui.indie-starter.dev/ (Animated shadcn components)
- **LottieFiles**: https://lottiefiles.com/ (Free animations)
- **Hero UI**: https://www.heroui.com/ (Modern components)
- **Animista**: https://animista.net/ (CSS animation generator)

### Learning Resources

- **GSAP ScrollTrigger Guide**: https://gsapify.com/gsap-scrolltrigger
- **Framer Motion Examples**: https://www.framer.com/motion/examples/
- **React Spring Basics**: https://www.react-spring.dev/docs/guides/basics
- **CSS Tricks** (Animation articles): https://css-tricks.com/tag/animation/
- **Web.dev Motion Guidelines**: https://web.dev/animations/

### Tools

- **Easings.net**: https://easings.net/ (Easing function visualizer)
- **Cubic-bezier.com**: https://cubic-bezier.com/ (Custom easing editor)
- **Keyframes.app**: https://keyframes.app/ (Animation tools)
- **LottieFiles After Effects Plugin**: https://lottiefiles.com/plugins/after-effects

### Icons

- **Lucide**: https://lucide.dev/ (Modern icon set)
- **Heroicons**: https://heroicons.com/ (Tailwind icons)
- **React Icons**: https://react-icons.github.io/react-icons/ (Popular icon packs)

---

## Quick Start Recipes

### Recipe 1: Simple Landing Page

**Stack**: Framer Motion + shadcn/ui + Tailwind

```bash
# Install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npx shadcn@latest init
npm install framer-motion

# Add components
npx shadcn@latest add button card
```

**Use for**: Marketing sites, portfolios, simple apps

---

### Recipe 2: Complex Scroll-Driven Experience

**Stack**: GSAP + ScrollTrigger + Tailwind

```bash
# Install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install gsap @gsap/react
```

**Use for**: Storytelling sites, product showcases, creative portfolios

---

### Recipe 3: Interactive Dashboard

**Stack**: Framer Motion + Chakra UI

```bash
# Install
npm install @chakra-ui/react @emotion/react @emotion/styled framer-motion
```

**Use for**: Admin panels, dashboards, data visualization

---

### Recipe 4: Full-Featured Web App

**Stack**: GSAP + Framer Motion + shadcn/ui + Tailwind

```bash
# Install everything
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npx shadcn@latest init
npm install gsap @gsap/react framer-motion lucide-react

# Add components
npx shadcn@latest add button card dialog form input select
```

**Use for**: Complex apps with both simple and advanced animations

---

### Recipe 5: 3D Experience

**Stack**: React Three Fiber + React Spring + GSAP

```bash
# Install
npm install three @react-three/fiber @react-three/drei
npm install @react-spring/three
npm install gsap @gsap/react
```

**Use for**: 3D product showcases, games, immersive experiences

---

## Conclusion

This guide provides everything needed to build modern, animated UIs for any React project. The recommended stack (GSAP + Framer Motion + shadcn/ui + Tailwind) covers 95% of use cases and is:

- ✅ **Free** - No licensing costs
- ✅ **Production-ready** - Used by major companies
- ✅ **Well-documented** - Excellent official docs
- ✅ **Actively maintained** - Regular updates
- ✅ **Community-supported** - Large ecosystems
- ✅ **Performant** - 60 FPS capable
- ✅ **Accessible** - Built-in accessibility support
- ✅ **TypeScript-ready** - Full type support

### Next Steps

1. **Install the core stack** in your project
2. **Create reusable animation components** from this guide
3. **Build a demo page** with various patterns
4. **Iterate and refine** based on your needs
5. **Share patterns** across projects

---

**Last Updated**: January 2025
**Maintained By**: [Your Name/Team]
**Questions?** Refer to official documentation or community forums

**Happy Animating! ✨**
