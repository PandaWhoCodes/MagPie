const Footer = () => {
  return (
    <footer className="w-full py-6 text-center">
      <p className="text-sm text-gray-600">
        Made with{' '}
        <span className="text-red-500 animate-pulse">❤️</span>{' '}
        at{' '}
        <a
          href="https://build2learn.in"
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-600 hover:text-purple-700 font-semibold transition-colors duration-200"
        >
          Build2Learn
        </a>
      </p>
    </footer>
  );
};

export default Footer;
