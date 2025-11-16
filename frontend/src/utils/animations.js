/**
 * Animation Utilities
 *
 * Centralized animation configuration for consistent motion design.
 * Use these presets throughout the app for a cohesive animation system.
 */

/**
 * Easing Functions
 *
 * Pre-defined easing curves for different animation types.
 * Based on cubic-bezier curves.
 */
export const easings = {
  // Smooth, natural easing (recommended default)
  smooth: [0.22, 1, 0.36, 1],

  // Bouncy, playful easing
  bounce: [0.68, -0.55, 0.27, 1.55],

  // Quick, responsive easing
  snappy: [0.25, 0.46, 0.45, 0.94],

  // Slow, deliberate easing
  gentle: [0.25, 0.1, 0.25, 1],

  // Standard ease-out
  easeOut: 'ease-out',

  // Standard ease-in
  easeIn: 'ease-in',

  // Standard ease-in-out
  easeInOut: 'ease-in-out',

  // Linear (no easing)
  linear: 'linear'
};

/**
 * Animation Durations
 *
 * Standardized duration values for consistent timing.
 * All values in seconds.
 */
export const durations = {
  // Instant transition (barely noticeable)
  instant: 0.1,

  // Fast micro-interactions (buttons, hovers)
  fast: 0.2,

  // Standard UI transitions
  normal: 0.3,

  // Moderate transitions (modals, drawers)
  moderate: 0.5,

  // Slow, emphasized transitions
  slow: 0.8,

  // Very slow (complex sequences)
  verySlow: 1.2
};

/**
 * Animation Distances
 *
 * Standard distances for slide/fade animations.
 * All values in pixels.
 */
export const distances = {
  // Subtle movement
  small: 20,

  // Standard movement
  medium: 40,

  // Emphasized movement
  large: 100,

  // Dramatic movement
  extraLarge: 200
};

/**
 * Stagger Delays
 *
 * Standard delays for staggered list animations.
 * All values in seconds.
 */
export const staggerDelays = {
  // Quick succession
  fast: 0.05,

  // Standard spacing
  normal: 0.1,

  // Deliberate spacing
  slow: 0.15,

  // Very deliberate spacing
  verySlow: 0.2
};

/**
 * Common Animation Presets
 *
 * Pre-configured animation objects ready to use.
 */
export const presets = {
  // Fade in from bottom
  fadeInUp: {
    initial: { opacity: 0, y: distances.medium },
    animate: { opacity: 1, y: 0 },
    transition: { duration: durations.normal, easing: easings.smooth }
  },

  // Fade in from top
  fadeInDown: {
    initial: { opacity: 0, y: -distances.medium },
    animate: { opacity: 1, y: 0 },
    transition: { duration: durations.normal, easing: easings.smooth }
  },

  // Fade in from left
  fadeInLeft: {
    initial: { opacity: 0, x: -distances.medium },
    animate: { opacity: 1, x: 0 },
    transition: { duration: durations.normal, easing: easings.smooth }
  },

  // Fade in from right
  fadeInRight: {
    initial: { opacity: 0, x: distances.medium },
    animate: { opacity: 1, x: 0 },
    transition: { duration: durations.normal, easing: easings.smooth }
  },

  // Scale up with fade
  scaleIn: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: durations.moderate, easing: easings.smooth }
  },

  // Quick button press
  buttonPress: {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
    transition: { duration: durations.fast }
  },

  // Card hover lift
  cardHover: {
    whileHover: { y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' },
    transition: { duration: durations.normal, easing: easings.easeOut }
  }
};

/**
 * Get animation preset with custom options
 *
 * @param {string} presetName - Name of preset from presets object
 * @param {Object} overrides - Properties to override in the preset
 * @returns {Object} Animation configuration
 *
 * @example
 * const customFade = getPreset('fadeInUp', { transition: { duration: 0.8 } });
 */
export function getPreset(presetName, overrides = {}) {
  const preset = presets[presetName];
  if (!preset) {
    console.warn(`Animation preset "${presetName}" not found`);
    return overrides;
  }

  return {
    ...preset,
    ...overrides,
    transition: {
      ...preset.transition,
      ...(overrides.transition || {})
    }
  };
}
