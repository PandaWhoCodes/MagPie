import { useEffect, useRef } from 'react';
import { animate } from 'motion';

/**
 * FadeIn Animation Component
 *
 * Fades in element with optional directional movement.
 * Uses Motion One for lightweight, performant animations.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to animate
 * @param {number} props.delay - Delay before animation starts (in seconds)
 * @param {string} props.direction - Direction to slide from: 'up', 'down', 'left', 'right', 'none'
 * @param {number} props.duration - Animation duration (in seconds)
 * @param {number} props.distance - Distance to slide (in pixels)
 * @param {string} props.className - Additional CSS classes
 *
 * @example
 * <FadeIn direction="up" delay={0.2}>
 *   <h1>Welcome</h1>
 * </FadeIn>
 */
export function FadeIn({
  children,
  delay = 0,
  direction = 'up',
  duration = 0.6,
  distance = 40,
  className = ''
}) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    const directions = {
      up: { y: distance },
      down: { y: -distance },
      left: { x: distance },
      right: { x: -distance },
      none: {}
    };

    const initialState = {
      opacity: 0,
      ...directions[direction]
    };

    // Set initial state
    Object.assign(ref.current.style, {
      opacity: 0,
      ...(directions[direction].y !== undefined && { transform: `translateY(${directions[direction].y}px)` }),
      ...(directions[direction].x !== undefined && { transform: `translateX(${directions[direction].x}px)` })
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
        easing: [0.22, 1, 0.36, 1] // Custom easing curve (ease-out-expo)
      }
    );

    return () => animation.stop();
  }, [delay, direction, duration, distance]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
