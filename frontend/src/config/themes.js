export const THEMES = {
  pure_white: {
    id: 'pure_white',
    name: 'Pure White',
    description: 'Clean, minimal white theme with fast performance',
    containerClass: 'min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-white',
    cardClass: 'w-full max-w-md relative z-10 bg-white rounded-3xl border border-gray-200 p-8 md:p-10 shadow-lg',
    inputClass: 'h-14 bg-gray-50 border border-gray-200 transition-all duration-200 focus:border-blue-400 focus:bg-white hover:border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-xl w-full px-4',
    labelClass: 'block mb-3 text-sm text-gray-700 font-medium',
    buttonClass: 'w-full h-14 mt-8 bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group rounded-xl font-semibold',
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
  return THEMES[themeId] || THEMES.pure_white;
};
