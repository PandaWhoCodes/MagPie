// Lightweight background for Pure White theme - NO framer-motion dependency
// This eliminates 381KB framer-motion bundle from initial page load

export function PureWhiteBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Subtle gradient orbs with CSS animations */}
      <div
        className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-50/30 rounded-full blur-3xl animate-float-slow"
        style={{
          animation: 'float-slow 25s ease-in-out infinite'
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-50/20 rounded-full blur-3xl animate-float-slower"
        style={{
          animation: 'float-slower 30s ease-in-out infinite'
        }}
      />

      {/* Minimal floating particles */}
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-gray-300/40 rounded-full animate-float-particle"
          style={{
            left: `${20 + i * 25}%`,
            top: `${30 + i * 15}%`,
            animationDelay: `${i * 2}s`,
            animationDuration: `${15 + i * 3}s`
          }}
        />
      ))}
    </div>
  );
}
