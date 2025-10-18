import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from './SimpleIcons';
import { useTheme } from '../hooks/useTheme';

const ThemeToggle = () => {
  const { theme, toggleTheme, isAnimating } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className="fixed top-4 right-4 z-50 p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg dark:shadow-xl border border-gray-200 dark:border-gray-700 hover:scale-110 transition-all duration-300"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      animate={{
        rotate: isAnimating ? 360 : 0,
        backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff'
      }}
      transition={{
        rotate: { duration: 0.5, ease: "easeInOut" },
        backgroundColor: { duration: 0.3 }
      }}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="relative w-6 h-6">
        <AnimatePresence mode="wait">
          {theme === 'light' ? (
            <motion.div
              key="sun"
              initial={{ scale: 0, rotate: -180, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0, rotate: 180, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Sun className="w-6 h-6 text-yellow-500" />
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-50"
              />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ scale: 0, rotate: 180, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0, rotate: -180, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Moon className="w-6 h-6 text-blue-400" />
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-30"
              />
              {/* Stars around moon */}
              <motion.div
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.8, 1, 0.8]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.2
                }}
                className="absolute -top-1 -right-1 w-1 h-1 bg-white rounded-full"
              />
              <motion.div
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.8, 1, 0.8]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
                className="absolute -bottom-1 -left-1 w-1 h-1 bg-white rounded-full"
              />
              <motion.div
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.8, 1, 0.8]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.8
                }}
                className="absolute top-3 -left-2 w-0.5 h-0.5 bg-white rounded-full"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.button>
  );
};

export default ThemeToggle;