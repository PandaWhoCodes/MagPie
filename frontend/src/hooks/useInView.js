import { useState, useEffect, useRef } from 'react';

/**
 * useInView Hook
 *
 * Detects when an element enters the viewport using Intersection Observer API.
 * Useful for triggering animations when elements become visible.
 *
 * @param {Object} options
 * @param {number} options.threshold - Percentage of element that must be visible (0-1)
 * @param {string} options.rootMargin - Margin around root element (e.g., '0px 0px -100px 0px')
 * @param {boolean} options.triggerOnce - If true, only trigger once when element enters view
 *
 * @returns {[React.RefObject, boolean]} Tuple of [ref, isInView]
 *   - ref: Attach this to the element you want to observe
 *   - isInView: Boolean indicating if element is in view
 *
 * @example
 * function AnimatedSection() {
 *   const [ref, isInView] = useInView({ threshold: 0.3, triggerOnce: true });
 *
 *   return (
 *     <div ref={ref} className={isInView ? 'visible' : 'hidden'}>
 *       Content appears when scrolled into view
 *     </div>
 *   );
 * }
 */
export function useInView({
  threshold = 0.1,
  rootMargin = '0px',
  triggerOnce = false
} = {}) {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);
  const hasTriggered = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Check if IntersectionObserver is supported
    if (typeof IntersectionObserver === 'undefined') {
      // Fallback: assume element is in view if API not supported
      setIsInView(true);
      return;
    }

    // If triggerOnce and already triggered, don't observe
    if (triggerOnce && hasTriggered.current) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const inView = entry.isIntersecting;
        setIsInView(inView);

        // Mark as triggered if entering view for first time
        if (inView && triggerOnce) {
          hasTriggered.current = true;
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce]);

  return [ref, isInView];
}
