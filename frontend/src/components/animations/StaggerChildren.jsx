import { useEffect, useRef } from 'react';
import { animate, stagger } from 'motion';

/**
 * StaggerChildren Animation Component
 *
 * Animates children elements in sequence with a stagger effect.
 * Each child appears one after another with a delay.
 * Uses Motion One for lightweight, performant animations.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Children elements to animate
 * @param {number} props.staggerDelay - Delay between each child animation (in seconds)
 * @param {number} props.initialDelay - Delay before first child animates (in seconds)
 * @param {number} props.duration - Animation duration for each child (in seconds)
 * @param {string} props.direction - Direction to animate from: 'up', 'down', 'left', 'right'
 * @param {number} props.distance - Distance to animate from (in pixels)
 * @param {string} props.className - Additional CSS classes for container
 *
 * @example
 * <StaggerChildren staggerDelay={0.1} direction="up">
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 *   <div>Item 3</div>
 * </StaggerChildren>
 */
export function StaggerChildren({
  children,
  staggerDelay = 0.1,
  initialDelay = 0,
  duration = 0.5,
  direction = 'up',
  distance = 20,
  className = ''
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const childElements = Array.from(containerRef.current.children);
    if (childElements.length === 0) return;

    const directions = {
      up: { y: distance },
      down: { y: -distance },
      left: { x: distance },
      right: { x: -distance }
    };

    const initialState = directions[direction];

    // Set initial state for all children
    childElements.forEach((child) => {
      Object.assign(child.style, {
        opacity: 0,
        ...(initialState.y !== undefined && { transform: `translateY(${initialState.y}px)` }),
        ...(initialState.x !== undefined && { transform: `translateX(${initialState.x}px)` })
      });
    });

    // Animate all children with stagger
    const animation = animate(
      childElements,
      {
        opacity: 1,
        x: 0,
        y: 0
      },
      {
        duration,
        delay: stagger(staggerDelay, { start: initialDelay }),
        easing: [0.22, 1, 0.36, 1]
      }
    );

    return () => animation.stop();
  }, [staggerDelay, initialDelay, duration, direction, distance]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
