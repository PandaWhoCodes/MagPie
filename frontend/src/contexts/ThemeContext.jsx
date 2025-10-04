import React, { createContext, useEffect, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export const ThemeContext = createContext(undefined);

export const ThemeProvider = ({ children }) => {
  const [storedTheme, setStoredTheme] = useLocalStorage('theme', 'dark');
  const [theme, setTheme] = useState(storedTheme);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;

    // Remove both classes first
    root.classList.remove('light', 'dark');

    // Add the current theme class
    root.classList.add(theme);

    // Update stored theme
    setStoredTheme(theme);
  }, [theme, setStoredTheme]);

  const toggleTheme = () => {
    setIsAnimating(true);
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');

    // Reset animation state after transition
    setTimeout(() => setIsAnimating(false), 300);
  };

  const setLightTheme = () => {
    setIsAnimating(true);
    setTheme('light');
    setTimeout(() => setIsAnimating(false), 300);
  };

  const setDarkTheme = () => {
    setIsAnimating(true);
    setTheme('dark');
    setTimeout(() => setIsAnimating(false), 300);
  };

  const value = {
    theme,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    isAnimating,
    isDark: theme === 'dark',
    isLight: theme === 'light'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};