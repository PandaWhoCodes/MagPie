import { useState, useEffect } from 'react';

/**
 * useReducedMotion Hook
 *
 * Detects if the user has requested reduced motion via their system preferences.
 * Components should respect this preference by disabling or simplifying animations.
 *
 * This is critical for accessibility - some users experience motion sickness,
 * vestibular disorders, or find animations distracting.
 *
 * @returns {boolean} True if user prefers reduced motion, false otherwise
 *
 * @example
 * function AnimatedComponent() {
 *   const prefersReducedMotion = useReducedMotion();
 *
 *   return (
 *     <div animate={{ x: prefersReducedMotion ? 0 : 100 }}>
 *       Content
 *     </div>
 *   );
 * }
 */
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if browser supports matchMedia
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (event) => {
      setPrefersReducedMotion(event.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    // Older browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  return prefersReducedMotion;
}
