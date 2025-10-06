export const THEMES = {
  default: {
    id: 'default',
    name: 'Default',
    description: 'Colorful gradients with purple, blue, and pink orbs',
    containerClass: 'min-h-screen relative overflow-hidden transition-colors duration-300',
    cardClass: 'backdrop-blur-lg bg-white/80 dark:bg-gray-900/60 rounded-3xl shadow-2xl dark:shadow-[0_20px_50px_rgba(139,92,246,0.2)] border border-white/20 dark:border-gray-700/30 p-8 md:p-10 transition-all duration-300',
    inputClass: 'w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-4 focus:ring-purple-100 dark:focus:ring-purple-900/50 transition-all duration-300 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 font-medium placeholder-gray-400 dark:placeholder-gray-500',
    labelClass: 'block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2',
    buttonClass: 'relative w-full py-4 rounded-xl text-lg font-bold text-white overflow-hidden transition-all duration-300 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 dark:from-purple-500 dark:via-blue-500 dark:to-pink-500 hover:shadow-2xl dark:hover:shadow-[0_10px_40px_rgba(139,92,246,0.4)] dark:border dark:border-purple-500/20',
  },
  midnight_black: {
    id: 'midnight_black',
    name: 'Midnight Black',
    description: 'Sleek dark theme with subtle purple and blue accents',
    containerClass: 'min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-black',
    cardClass: 'w-full max-w-md relative z-10 backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10 p-8 md:p-10 shadow-2xl',
    inputClass: 'h-14 bg-white/5 backdrop-blur-xl border border-white/10 transition-all duration-300 focus:border-white/30 focus:bg-white/8 hover:border-white/20 text-white placeholder:text-white/30 rounded-xl w-full px-4',
    labelClass: 'block mb-3 text-sm text-white/60',
    buttonClass: 'w-full h-14 mt-8 bg-white text-black hover:bg-white/90 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed group rounded-xl font-bold',
  },
};

export const getThemeConfig = (themeId) => {
  return THEMES[themeId] || THEMES.default;
};
