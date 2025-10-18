import { motion } from 'framer-motion';

export function AnimatedBackground({ theme = 'pure_white' }) {
  // Pure White Theme - Minimal and Fast
  if (theme === 'pure_white') {
    return (
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Subtle gradient orbs - very minimal */}
        <motion.div
          animate={{
            x: [0, 60, 0],
            y: [0, -40, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-50/30 rounded-full blur-3xl"
        />

        <motion.div
          animate={{
            x: [0, -50, 0],
            y: [0, 50, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-indigo-50/25 rounded-full blur-3xl"
        />

        {/* Minimal floating particles - only 4 */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
              opacity: 0,
            }}
            animate={{
              y: [null, Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000)],
              opacity: [0, Math.random() * 0.08, 0],
            }}
            transition={{
              duration: Math.random() * 20 + 20,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5,
            }}
            className="absolute w-0.5 h-0.5 bg-blue-300 rounded-full will-change-transform"
            style={{
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>
    );
  }

  // Midnight Black Theme
  if (theme === 'midnight_black') {
    return (
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Subtle gradient orbs */}
        <motion.div
          animate={{
            x: [0, 80, 0],
            y: [0, -80, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl"
        />

        <motion.div
          animate={{
            x: [0, -60, 0],
            y: [0, 60, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/3 right-0 w-[450px] h-[450px] bg-blue-500/8 rounded-full blur-3xl"
        />

        <motion.div
          animate={{
            x: [0, 70, 0],
            y: [0, -40, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-0 left-1/3 w-96 h-96 bg-indigo-500/8 rounded-full blur-3xl"
        />

        {/* Floating particles - reduced for performance */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
              opacity: 0,
            }}
            animate={{
              y: [null, Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000)],
              opacity: [0, Math.random() * 0.15, 0],
            }}
            transition={{
              duration: Math.random() * 15 + 15,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5,
            }}
            className="absolute w-0.5 h-0.5 bg-white rounded-full will-change-transform"
            style={{
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}

        {/* Subtle grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.01)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_at_center,transparent_30%,black)]" />

        {/* Vignette effect */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
      </div>
    );
  }

  // Fallback to pure_white for any unknown theme
  return <AnimatedBackground theme="pure_white" />;
}
