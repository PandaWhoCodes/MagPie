# Animation Patterns - Ready-to-Use Components

> **Quick Reference**: Copy-paste animation components for common UI patterns
> **Works With**: React + Framer Motion / GSAP
> **Last Updated**: January 2025

---

## Table of Contents

1. [Fade Animations](#fade-animations)
2. [Slide Animations](#slide-animations)
3. [Scroll-Triggered Animations](#scroll-triggered-animations)
4. [List & Stagger Animations](#list--stagger-animations)
5. [Button & Hover Effects](#button--hover-effects)
6. [Loading States](#loading-states)
7. [Page Transitions](#page-transitions)
8. [Modal & Dialog Animations](#modal--dialog-animations)
9. [Text Animations](#text-animations)
10. [Advanced Patterns](#advanced-patterns)

---

## Fade Animations

### 1. Basic Fade In (Framer Motion)

```javascript
// src/components/animations/FadeIn.jsx
import { motion } from 'framer-motion';

export function FadeIn({ children, delay = 0, duration = 0.6 }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration, delay }}
    >
      {children}
    </motion.div>
  );
}
```

**Usage:**
```jsx
<FadeIn delay={0.2}>
  <h1>Welcome</h1>
</FadeIn>
```

---

### 2. Fade In with Direction

```javascript
// src/components/animations/FadeInDirection.jsx
import { motion } from 'framer-motion';

export function FadeInDirection({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  distance = 40
}) {
  const directions = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance }
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
```

**Usage:**
```jsx
<FadeInDirection direction="up" delay={0.1}>
  <Card />
</FadeInDirection>
```

---

### 3. Fade In On Scroll (Viewport)

```javascript
// src/components/animations/FadeInScroll.jsx
import { motion } from 'framer-motion';

export function FadeInScroll({
  children,
  delay = 0,
  once = true,
  amount = 0.3
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
```

**Usage:**
```jsx
<FadeInScroll once={true} amount={0.3}>
  <Section />
</FadeInScroll>
```

---

## Slide Animations

### 4. Slide In from Side

```javascript
// src/components/animations/SlideIn.jsx
import { motion } from 'framer-motion';

export function SlideIn({
  children,
  from = 'left',
  delay = 0,
  duration = 0.5
}) {
  const variants = {
    left: { x: -100 },
    right: { x: 100 },
    top: { y: -100 },
    bottom: { y: 100 }
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...variants[from] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
```

**Usage:**
```jsx
<SlideIn from="left" delay={0.2}>
  <Sidebar />
</SlideIn>
```

---

### 5. Slide & Scale

```javascript
// src/components/animations/SlideScale.jsx
import { motion } from 'framer-motion';

export function SlideScale({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.22, 1, 0.36, 1]
      }}
    >
      {children}
    </motion.div>
  );
}
```

---

## Scroll-Triggered Animations

### 6. GSAP Scroll Reveal

```javascript
// src/components/animations/ScrollReveal.jsx
import { useRef, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

export function ScrollReveal({
  children,
  trigger = 'top 80%',
  start = 'top 80%',
  end = 'top 20%',
  scrub = false,
  markers = false
}) {
  const ref = useRef();

  useGSAP(() => {
    gsap.from(ref.current, {
      scrollTrigger: {
        trigger: ref.current,
        start,
        end,
        scrub: scrub ? 1 : false,
        markers, // set true for debugging
      },
      opacity: 0,
      y: 100,
      duration: 1,
      ease: 'power2.out'
    });
  }, [start, end, scrub, markers]);

  return <div ref={ref}>{children}</div>;
}
```

**Usage:**
```jsx
<ScrollReveal>
  <div>Appears on scroll</div>
</ScrollReveal>
```

---

### 7. Parallax Scroll Effect

```javascript
// src/components/animations/Parallax.jsx
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

export function Parallax({
  children,
  speed = 0.5,
  className = ''
}) {
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

**Usage:**
```jsx
<Parallax speed={0.5}>
  <img src="background.jpg" alt="" />
</Parallax>
```

---

### 8. Pin Section on Scroll

```javascript
// src/components/animations/PinSection.jsx
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

export function PinSection({ children, duration = 1 }) {
  const ref = useRef();

  useGSAP(() => {
    ScrollTrigger.create({
      trigger: ref.current,
      start: 'top top',
      end: `+=${window.innerHeight * duration}`,
      pin: true,
      pinSpacing: true,
      markers: false
    });
  }, [duration]);

  return <div ref={ref}>{children}</div>;
}
```

---

## List & Stagger Animations

### 9. Staggered List (Framer Motion)

```javascript
// src/components/animations/StaggeredList.jsx
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

export function StaggeredList({ children, className = '' }) {
  return (
    <motion.ul
      variants={container}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children}
    </motion.ul>
  );
}

export function StaggeredItem({ children, className = '' }) {
  return (
    <motion.li variants={item} className={className}>
      {children}
    </motion.li>
  );
}
```

**Usage:**
```jsx
<StaggeredList>
  <StaggeredItem>Item 1</StaggeredItem>
  <StaggeredItem>Item 2</StaggeredItem>
  <StaggeredItem>Item 3</StaggeredItem>
</StaggeredList>
```

---

### 10. GSAP Stagger Animation

```javascript
// src/components/animations/GSAPStagger.jsx
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';

export function GSAPStagger({ children, stagger = 0.1, className = '' }) {
  const containerRef = useRef();

  useGSAP(() => {
    gsap.from(containerRef.current.children, {
      opacity: 0,
      y: 50,
      stagger,
      duration: 0.8,
      ease: 'power2.out'
    });
  }, [stagger]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
```

---

### 11. Animated Grid

```javascript
// src/components/animations/AnimatedGrid.jsx
import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const item = {
  hidden: { opacity: 0, scale: 0.8 },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export function AnimatedGrid({ children, className = '' }) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function GridItem({ children, className = '' }) {
  return (
    <motion.div variants={item} className={className}>
      {children}
    </motion.div>
  );
}
```

**Usage:**
```jsx
<AnimatedGrid className="grid grid-cols-3 gap-4">
  <GridItem><Card /></GridItem>
  <GridItem><Card /></GridItem>
  <GridItem><Card /></GridItem>
</AnimatedGrid>
```

---

## Button & Hover Effects

### 12. Animated Button

```javascript
// src/components/ui/AnimatedButton.jsx
import { motion } from 'framer-motion';
import { Button } from './button'; // shadcn button

export function AnimatedButton({ children, variant = 'default', ...props }) {
  return (
    <Button asChild variant={variant} {...props}>
      <motion.button
        whileHover={{
          scale: 1.05,
          transition: { duration: 0.2, ease: 'easeOut' }
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

---

### 13. Hover Card

```javascript
// src/components/animations/HoverCard.jsx
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
      className={`rounded-lg transition-shadow ${className}`}
    >
      {children}
    </div>
  );
}
```

---

### 14. Hover Lift Effect

```javascript
// src/components/animations/HoverLift.jsx
import { motion } from 'framer-motion';

export function HoverLift({ children, className = '' }) {
  return (
    <motion.div
      className={className}
      whileHover={{
        y: -8,
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        transition: { duration: 0.3, ease: 'easeOut' }
      }}
    >
      {children}
    </motion.div>
  );
}
```

---

### 15. Magnetic Button

```javascript
// src/components/animations/MagneticButton.jsx
import { useRef, useState } from 'react';
import { motion } from 'framer-motion';

export function MagneticButton({ children, strength = 0.3 }) {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * strength;
    const y = (e.clientY - rect.top - rect.height / 2) * strength;
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15 }}
      className="px-6 py-3 bg-blue-500 text-white rounded-lg"
    >
      {children}
    </motion.button>
  );
}
```

---

## Loading States

### 16. Spinner (Framer Motion)

```javascript
// src/components/ui/Spinner.jsx
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

### 17. Pulse Skeleton

```javascript
// src/components/ui/Skeleton.jsx
import { motion } from 'framer-motion';

export function Skeleton({ className = '', variant = 'pulse' }) {
  const pulse = {
    opacity: [0.5, 1, 0.5]
  };

  return (
    <motion.div
      className={`bg-gray-200 rounded ${className}`}
      animate={pulse}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    />
  );
}
```

**Usage:**
```jsx
<Skeleton className="h-8 w-48 mb-4" />
<Skeleton className="h-4 w-full mb-2" />
<Skeleton className="h-4 w-3/4" />
```

---

### 18. Wave Skeleton

```javascript
// src/components/ui/WaveSkeleton.jsx
import { motion } from 'framer-motion';

export function WaveSkeleton({ className = '' }) {
  return (
    <motion.div
      className={`bg-gray-200 rounded overflow-hidden relative ${className}`}
      style={{
        backgroundImage:
          'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
        backgroundSize: '200% 100%'
      }}
      animate={{
        backgroundPosition: ['200% 0', '-200% 0']
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear'
      }}
    />
  );
}
```

---

### 19. Dots Loader

```javascript
// src/components/ui/DotsLoader.jsx
import { motion } from 'framer-motion';

const dotVariants = {
  initial: { y: 0 },
  animate: { y: -10 }
};

export function DotsLoader({ color = 'bg-blue-500' }) {
  return (
    <div className="flex space-x-2">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={`w-2 h-2 rounded-full ${color}`}
          variants={dotVariants}
          initial="initial"
          animate="animate"
          transition={{
            duration: 0.6,
            repeat: Infinity,
            repeatType: 'reverse',
            delay: index * 0.2
          }}
        />
      ))}
    </div>
  );
}
```

---

### 20. Progress Bar

```javascript
// src/components/ui/ProgressBar.jsx
import { motion } from 'framer-motion';

export function ProgressBar({ progress, className = '' }) {
  return (
    <div className={`w-full h-2 bg-gray-200 rounded-full overflow-hidden ${className}`}>
      <motion.div
        className="h-full bg-blue-500"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
    </div>
  );
}
```

---

## Page Transitions

### 21. Page Transition (React Router)

```javascript
// src/components/animations/PageTransition.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const pageVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 }
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
```jsx
import { Routes, Route } from 'react-router-dom';
import { PageTransition } from './components/animations/PageTransition';

function App() {
  return (
    <Routes>
      <Route path="*" element={
        <PageTransition>
          <YourRoutes />
        </PageTransition>
      } />
    </Routes>
  );
}
```

---

### 22. Fade Through Page Transition

```javascript
// src/components/animations/FadeThrough.jsx
import { motion, AnimatePresence } from 'framer-motion';

export function FadeThrough({ children, pageKey }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pageKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

---

### 23. Scale Transition

```javascript
// src/components/animations/ScaleTransition.jsx
import { motion, AnimatePresence } from 'framer-motion';

export function ScaleTransition({ children, pageKey }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pageKey}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

---

## Modal & Dialog Animations

### 24. Animated Modal

```javascript
// src/components/animations/AnimatedModal.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

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
    y: 50,
    transition: {
      duration: 0.2
    }
  }
};

export function AnimatedModal({ isOpen, onClose, children }) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
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

### 25. Slide-In Drawer

```javascript
// src/components/animations/Drawer.jsx
import { motion, AnimatePresence } from 'framer-motion';

const backdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

export function Drawer({ isOpen, onClose, children, side = 'right' }) {
  const slideVariants = {
    left: {
      hidden: { x: '-100%' },
      visible: { x: 0 },
      exit: { x: '-100%' }
    },
    right: {
      hidden: { x: '100%' },
      visible: { x: 0 },
      exit: { x: '100%' }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            variants={backdrop}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
          />
          <motion.div
            className={`fixed top-0 ${side === 'left' ? 'left-0' : 'right-0'} h-full w-80 bg-white shadow-xl z-50 p-6`}
            variants={slideVariants[side]}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

---

### 26. Toast Notification

```javascript
// src/components/animations/Toast.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export function Toast({ isVisible, onClose, children, type = 'info' }) {
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`fixed top-4 right-4 ${colors[type]} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-4 z-50`}
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <div>{children}</div>
          <button onClick={onClose} className="hover:opacity-75">
            <X size={18} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

---

## Text Animations

### 27. Typewriter Effect

```javascript
// src/components/animations/Typewriter.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Typewriter({ text, speed = 50, delay = 0 }) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (currentIndex < text.length) {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }
    }, currentIndex === 0 ? delay : speed);

    return () => clearTimeout(timeout);
  }, [currentIndex, text, speed, delay]);

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity }}
      >
        |
      </motion.span>
    </motion.span>
  );
}
```

---

### 28. Character Reveal

```javascript
// src/components/animations/CharacterReveal.jsx
import { motion } from 'framer-motion';

const sentence = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.2
    }
  }
};

const letter = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24
    }
  }
};

export function CharacterReveal({ text, className = '' }) {
  return (
    <motion.h1
      variants={sentence}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {text.split('').map((char, index) => (
        <motion.span key={`${char}-${index}`} variants={letter}>
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </motion.h1>
  );
}
```

---

### 29. Blur In Text

```javascript
// src/components/animations/BlurInText.jsx
import { motion } from 'framer-motion';

export function BlurInText({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      className={className}
      initial={{ filter: 'blur(10px)', opacity: 0 }}
      animate={{ filter: 'blur(0px)', opacity: 1 }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
```

---

### 30. Gradient Text Animation

```javascript
// src/components/animations/GradientText.jsx
import { motion } from 'framer-motion';

export function GradientText({ children, className = '' }) {
  return (
    <motion.span
      className={`bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent ${className}`}
      style={{ backgroundSize: '200% 100%' }}
      animate={{
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: 'linear'
      }}
    >
      {children}
    </motion.span>
  );
}
```

---

## Advanced Patterns

### 31. 3D Card Tilt Effect

```javascript
// src/components/animations/TiltCard.jsx
import { useRef, useState } from 'react';
import { motion } from 'framer-motion';

export function TiltCard({ children, className = '' }) {
  const ref = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    setRotateX(rotateX);
    setRotateY(rotateY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px'
      }}
      animate={{
        rotateX,
        rotateY
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  );
}
```

---

### 32. Cursor Follow Effect

```javascript
// src/components/animations/CursorFollow.jsx
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';

export function CursorFollow({ children, className = '' }) {
  const ref = useRef();

  useGSAP(() => {
    const handleMouseMove = (e) => {
      const rect = ref.current.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(ref.current, {
        x: x * 0.1,
        y: y * 0.1,
        duration: 0.3,
        ease: 'power2.out'
      });
    };

    const handleMouseLeave = () => {
      gsap.to(ref.current, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'power2.out'
      });
    };

    const parent = ref.current?.parentElement;
    parent?.addEventListener('mousemove', handleMouseMove);
    parent?.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      parent?.removeEventListener('mousemove', handleMouseMove);
      parent?.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
```

---

### 33. Morphing Shape

```javascript
// src/components/animations/MorphingShape.jsx
import { motion } from 'framer-motion';

export function MorphingShape() {
  return (
    <svg width="200" height="200" viewBox="0 0 200 200">
      <motion.path
        fill="currentColor"
        d="M100,100 L150,50 L150,150 Z"
        animate={{
          d: [
            'M100,100 L150,50 L150,150 Z',
            'M100,50 L150,100 L100,150 Z',
            'M50,100 L100,50 L150,100 L100,150 Z',
            'M100,100 L150,50 L150,150 Z'
          ]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
    </svg>
  );
}
```

---

### 34. Number Counter

```javascript
// src/components/animations/Counter.jsx
import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

export function Counter({ end, duration = 2, suffix = '', className = '' }) {
  const ref = useRef();
  const counterRef = useRef({ value: 0 });

  useEffect(() => {
    gsap.to(counterRef.current, {
      value: end,
      duration,
      ease: 'power2.out',
      onUpdate: () => {
        if (ref.current) {
          ref.current.textContent =
            Math.floor(counterRef.current.value) + suffix;
        }
      }
    });
  }, [end, duration, suffix]);

  return <span ref={ref} className={className}>0{suffix}</span>;
}
```

**Usage:**
```jsx
<Counter end={1000} suffix="+" duration={2} />
```

---

### 35. Infinite Scroll Marquee

```javascript
// src/components/animations/Marquee.jsx
import { motion } from 'framer-motion';

export function Marquee({ children, speed = 50, direction = 'left' }) {
  const directionValue = direction === 'left' ? ['0%', '-100%'] : ['-100%', '0%'];

  return (
    <div className="overflow-hidden whitespace-nowrap">
      <motion.div
        className="inline-block"
        animate={{
          x: directionValue
        }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: 'linear'
        }}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}
```

---

## Usage Tips

### 1. Combining Patterns

You can nest and combine patterns:

```jsx
<FadeInScroll>
  <StaggeredList>
    <StaggeredItem>
      <HoverCard>
        <AnimatedButton>Click me</AnimatedButton>
      </HoverCard>
    </StaggeredItem>
  </StaggeredList>
</FadeInScroll>
```

### 2. Custom Variants

Create custom variants for reusability:

```javascript
// src/lib/animationVariants.js
export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 }
};

// Usage
<motion.div variants={fadeInUp} initial="hidden" animate="visible" />
```

### 3. Reduced Motion

Always respect user preferences:

```javascript
import { useReducedMotion } from 'framer-motion';

function MyComponent() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={{ x: shouldReduceMotion ? 0 : 100 }}
    />
  );
}
```

---

## Performance Notes

1. **Use `transform` and `opacity`** - GPU-accelerated properties
2. **Avoid animating** `width`, `height`, `top`, `left`, `margin`
3. **Use `will-change`** sparingly and remove after animation
4. **Limit concurrent animations** - Too many can cause jank
5. **Test on lower-end devices** - Not everyone has a gaming PC

---

## Next Steps

1. Copy patterns into your project's `src/components/animations/`
2. Customize colors, timing, and easing to match your brand
3. Create a Storybook to showcase all patterns
4. Document component props for team reference

---

**Last Updated**: January 2025
**Related**: See [UI_ENHANCEMENT_GUIDE.md](./UI_ENHANCEMENT_GUIDE.md) for full context
