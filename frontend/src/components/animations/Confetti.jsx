import { useEffect, useRef } from 'react';
import { animate } from 'motion';

/**
 * Confetti Animation Component
 *
 * Creates a confetti burst effect for celebration moments.
 * Lightweight implementation without external confetti libraries.
 * Uses Motion One for performant animations.
 *
 * @param {Object} props
 * @param {boolean} props.active - Whether confetti is active
 * @param {number} props.particleCount - Number of confetti particles
 * @param {number} props.duration - How long confetti animates (in seconds)
 * @param {Array<string>} props.colors - Array of color strings for confetti
 *
 * @example
 * const [showConfetti, setShowConfetti] = useState(false);
 *
 * <Confetti active={showConfetti} particleCount={50} />
 * <button onClick={() => setShowConfetti(true)}>Celebrate!</button>
 */
export function Confetti({
  active = false,
  particleCount = 50,
  duration = 3,
  colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE']
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;
    const particles = [];

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'confetti-particle';

      const size = Math.random() * 8 + 4; // 4-12px
      const color = colors[Math.floor(Math.random() * colors.length)];
      const startX = Math.random() * 100; // Random X position (%)

      Object.assign(particle.style, {
        position: 'fixed',
        left: `${startX}%`,
        top: '50%',
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: color,
        borderRadius: Math.random() > 0.5 ? '50%' : '0', // Circle or square
        pointerEvents: 'none',
        zIndex: 9999
      });

      container.appendChild(particle);
      particles.push(particle);

      // Random animation parameters
      const angle = (Math.random() - 0.5) * 120; // -60 to 60 degrees
      const distance = Math.random() * 500 + 200; // 200-700px
      const rotation = Math.random() * 720 - 360; // -360 to 360 degrees
      const xOffset = Math.sin(angle * Math.PI / 180) * distance;
      const yOffset = Math.cos(angle * Math.PI / 180) * distance;

      // Animate particle
      animate(
        particle,
        {
          x: xOffset,
          y: yOffset,
          rotate: rotation,
          opacity: [1, 1, 0]
        },
        {
          duration,
          easing: [0.25, 0.46, 0.45, 0.94]
        }
      );
    }

    // Cleanup after animation
    const cleanup = setTimeout(() => {
      particles.forEach(particle => particle.remove());
    }, duration * 1000);

    return () => {
      clearTimeout(cleanup);
      particles.forEach(particle => particle.remove());
    };
  }, [active, particleCount, duration, colors]);

  return <div ref={containerRef} />;
}
