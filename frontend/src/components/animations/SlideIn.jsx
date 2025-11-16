import { useEffect, useRef } from 'react';
import { animate } from 'motion';

/**
 * SlideIn Animation Component
 *
 * Slides in element from a specified direction with fade effect.
 * Uses Motion One for lightweight, performant animations.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to animate
 * @param {string} props.from - Direction to slide from: 'left', 'right', 'top', 'bottom'
 * @param {number} props.delay - Delay before animation starts (in seconds)
 * @param {number} props.duration - Animation duration (in seconds)
 * @param {number} props.distance - Distance to slide (in pixels)
 * @param {string} props.className - Additional CSS classes
 *
 * @example
 * <SlideIn from="left" delay={0.2}>
 *   <Sidebar />
 * </SlideIn>
 */
export function SlideIn({
  children,
  from = 'left',
  delay = 0,
  duration = 0.5,
  distance = 100,
  className = ''
}) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    const variants = {
      left: { x: -distance },
      right: { x: distance },
      top: { y: -distance },
      bottom: { y: distance }
    };

    const initialState = variants[from];

    // Set initial state
    Object.assign(ref.current.style, {
      opacity: 0,
      ...(initialState.x !== undefined && { transform: `translateX(${initialState.x}px)` }),
      ...(initialState.y !== undefined && { transform: `translateY(${initialState.y}px)` })
    });

    // Animate to final state
    const animation = animate(
      ref.current,
      {
        opacity: 1,
        x: 0,
        y: 0
      },
      {
        duration,
        delay,
        easing: 'ease-out'
      }
    );

    return () => animation.stop();
  }, [from, delay, duration, distance]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
