const Footer = () => {
  return (
    <footer className="relative w-full py-6 text-center z-10 bg-transparent">
      <p className="text-base text-gray-800 dark:text-gray-200 font-medium transition-colors duration-300">
        Made with{' '}
        <span className="text-red-500 dark:text-red-400 animate-pulse inline-block">❤️</span>{' '}
        by{' '}
        <span className="text-purple-600 dark:text-purple-400 font-bold">
          MagPie
        </span>
      </p>
    </footer>
  );
};

export default Footer;
