import React, { createContext, useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { applyTheme } from "@/utils/apply-theme";
import { DEFAULT_THEME, DEFAULT_MODE } from "@/config/theme-presets";
import api from "@/services/api";

const ThemeContext = createContext({
  theme: DEFAULT_THEME,
  mode: DEFAULT_MODE,
  setTheme: () => {},
  toggleMode: () => {},
  isLoading: true,
});

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}

export function ThemeProvider({ children }) {
  // Fetch theme from database (branding settings)
  const { data: branding, isLoading } = useQuery({
    queryKey: ["branding"],
    queryFn: async () => {
      const response = await api.get("/branding/");
      return response.data;
    },
    staleTime: 1000 * 60 * 60 * 6, // 6 hours (matches backend cache)
  });

  // Get mode from localStorage (visitor preference)
  const [mode, setMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme-mode") || DEFAULT_MODE;
    }
    return DEFAULT_MODE;
  });

  const theme = branding?.theme || DEFAULT_THEME;

  // Apply theme when theme or mode changes
  useEffect(() => {
    if (!isLoading && theme) {
      applyTheme(theme, mode);
    }
  }, [theme, mode, isLoading]);

  // Save mode to localStorage when it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("theme-mode", mode);
    }
  }, [mode]);

  const toggleMode = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  const value = {
    theme,
    mode,
    setTheme: () => {
      console.warn("setTheme is not available in public pages. Theme is controlled by admin in branding settings.");
    },
    toggleMode,
    isLoading,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
