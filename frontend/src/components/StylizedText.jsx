import React from 'react';
import { motion } from 'framer-motion';
import './StylizedText.css';

const StylizedText = ({ text, style = 'gradient', className = '' }) => {
  console.log('StylizedText rendering:', { text, style });
  const baseClasses = className || 'text-6xl md:text-7xl font-black tracking-tight';

  const styles = {
    gradient: (
      <span className={`${baseClasses} text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600`}>
        {text}
      </span>
    ),

    shimmer: (
      <span
        className={`${baseClasses} text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 shimmer-animate`}
        style={{ backgroundSize: '200% auto' }}
      >
        {text}
      </span>
    ),

    'animated-gradient': (
      <motion.span
        className={`${baseClasses} text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600`}
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          backgroundSize: '200% 200%',
        }}
      >
        {text}
      </motion.span>
    ),

    shine: (
      <span className={`${baseClasses} relative inline-block text-gray-900`}>
        <span className="relative z-10">{text}</span>
        <span
          className="absolute inset-0 top-0 left-0 right-0 bottom-0 bg-gradient-to-r from-transparent via-white to-transparent shine-animate"
          style={{ backgroundSize: '200% 100%' }}
        />
      </span>
    ),

    glitch: (
      <span className={`${baseClasses} relative inline-block text-gray-900 glitch-animate`} data-text={text}>
        {text}
      </span>
    ),

    neon: (
      <span className={`${baseClasses} text-pink-500 neon-glow-animate`}>
        {text}
      </span>
    ),

    wave: (
      <span className={`${baseClasses} inline-flex`}>
        {text.split('').map((char, index) => (
          <motion.span
            key={index}
            animate={{
              y: [0, -20, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: index * 0.1,
              ease: 'easeInOut',
            }}
            className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600"
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </span>
    ),

    rainbow: (
      <span
        className={`${baseClasses} text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 rainbow-animate`}
        style={{ backgroundSize: '200% auto' }}
      >
        {text}
      </span>
    ),

    glitter: (
      <span className={`${baseClasses} relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-400 to-purple-600 glitter-animate`}>
        {text}
      </span>
    ),

    'shadow-3d': (
      <span className={`${baseClasses} text-purple-600 shadow-3d-animate`}>
        {text}
      </span>
    ),

    'blur-focus': (
      <motion.span
        className={`${baseClasses} text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600`}
        animate={{
          filter: ['blur(4px)', 'blur(0px)', 'blur(4px)'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {text}
      </motion.span>
    ),

    fire: (
      <span
        className={`${baseClasses} text-transparent bg-clip-text bg-gradient-to-t from-yellow-600 via-orange-500 to-red-500 fire-animate`}
        style={{ backgroundSize: '100% 200%' }}
      >
        {text}
      </span>
    ),

    metallic: (
      <span className={`${baseClasses} text-transparent bg-clip-text bg-gradient-to-r from-gray-400 via-gray-100 to-gray-400 metallic-animate`}>
        {text}
      </span>
    ),

    plain: (
      <span className={`${baseClasses} text-gray-900`}>
        {text}
      </span>
    ),
  };

  return styles[style] || styles.gradient;
};

export default StylizedText;
