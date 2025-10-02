const Footer = () => {
  return (
    <footer className="relative w-full py-6 text-center z-10 bg-transparent">
      <p className="text-base text-gray-800 font-medium">
        Made with{' '}
        <span className="text-red-500 animate-pulse inline-block">❤️</span>{' '}
        at{' '}
        <a
          href="https://build2learn.in"
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-600 hover:text-purple-700 font-bold transition-colors duration-200 underline decoration-2 underline-offset-2"
        >
          Build2Learn
        </a>
      </p>
    </footer>
  );
};

export default Footer;
