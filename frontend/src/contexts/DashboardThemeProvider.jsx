import React, { createContext, useContext, useEffect, useState } from "react";
import { applyTheme } from "@/utils/apply-theme";
import { DEFAULT_THEME, DEFAULT_MODE } from "@/config/theme-presets";

const DashboardThemeContext = createContext({
  theme: DEFAULT_THEME,
  mode: DEFAULT_MODE,
  setTheme: () => {},
  toggleMode: () => {},
});

export function useDashboardTheme() {
  const context = useContext(DashboardThemeContext);
  if (!context) {
    throw new Error("useDashboardTheme must be used within DashboardThemeProvider");
  }
  return context;
}

export function DashboardThemeProvider({ children }) {
  // Get theme from localStorage (admin preference)
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("dashboard-theme") || DEFAULT_THEME;
    }
    return DEFAULT_THEME;
  });

  // Get mode from localStorage (admin preference)
  const [mode, setMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("dashboard-theme-mode") || DEFAULT_MODE;
    }
    return DEFAULT_MODE;
  });

  // Apply theme when theme or mode changes
  useEffect(() => {
    applyTheme(theme, mode);
  }, [theme, mode]);

  // Save theme to localStorage when it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("dashboard-theme", theme);
    }
  }, [theme]);

  // Save mode to localStorage when it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("dashboard-theme-mode", mode);
    }
  }, [mode]);

  const toggleMode = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  const handleSetTheme = (newTheme) => {
    setTheme(newTheme);
  };

  const value = {
    theme,
    mode,
    setTheme: handleSetTheme,
    toggleMode,
  };

  return (
    <DashboardThemeContext.Provider value={value}>
      {children}
    </DashboardThemeContext.Provider>
  );
}
