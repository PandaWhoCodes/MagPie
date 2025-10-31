import { themePresets } from "@/config/theme-presets";

/**
 * Converts hex color to HSL format
 * @param {string} hex - Hex color code (e.g., "#ff0000")
 * @returns {string} HSL color values (e.g., "0 100% 50%")
 */
function hexToHSL(hex) {
  // Remove # if present
  hex = hex.replace(/^#/, "");

  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
      default:
        h = 0;
    }
  }

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return `${h} ${s}% ${l}%`;
}

/**
 * Apply theme to the document root
 * @param {string} themeId - Theme identifier (e.g., "violet-bloom")
 * @param {string} mode - Theme mode ("light" or "dark")
 */
export function applyTheme(themeId, mode = "light") {
  const theme = themePresets[themeId];

  if (!theme) {
    console.warn(`Theme "${themeId}" not found. Available themes:`, Object.keys(themePresets));
    return;
  }

  const styles = theme.styles[mode];

  if (!styles) {
    console.warn(`Mode "${mode}" not found for theme "${themeId}"`);
    return;
  }

  const root = document.documentElement;

  // Apply all CSS variables
  Object.entries(styles).forEach(([key, value]) => {
    // Convert hex colors to HSL if needed
    const cssValue = value.startsWith("#") ? hexToHSL(value) : value;
    root.style.setProperty(`--${key}`, cssValue);
  });

  // Set data-theme attribute
  root.setAttribute("data-theme", themeId);

  // Toggle dark class
  if (mode === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

/**
 * Get current theme from data-theme attribute
 * @returns {string} Current theme ID
 */
export function getCurrentTheme() {
  return document.documentElement.getAttribute("data-theme");
}

/**
 * Get current mode from document classes
 * @returns {string} Current mode ("light" or "dark")
 */
export function getCurrentMode() {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

/**
 * Toggle between light and dark mode
 * @param {string} themeId - Current theme ID
 * @returns {string} New mode
 */
export function toggleMode(themeId) {
  const currentMode = getCurrentMode();
  const newMode = currentMode === "light" ? "dark" : "light";
  applyTheme(themeId, newMode);
  return newMode;
}
