import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import ThemeToggle from './components/ThemeToggle';

// Pages
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import CheckInPage from './pages/CheckInPage';
import NoEventPage from './pages/NoEventPage';
import ThankYouPage from './pages/ThankYouPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Component to conditionally show ThemeToggle
function AppContent() {
  const location = useLocation();

  // Only show theme toggle on user-facing pages (not dashboard)
  const isUserFacingPage = !location.pathname.includes('dashboard');

  return (
    <div className="min-h-screen transition-colors duration-300">
      {isUserFacingPage && <ThemeToggle />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/thank-you" element={<ThankYouPage />} />
        <Route path="/dashboard_under" element={<Dashboard />} />
        <Route path="/check-in/:eventId/:qrId" element={<CheckInPage />} />
        <Route path="/no-events" element={<NoEventPage />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AppContent />
        </Router>
        <Toaster position="top-right" />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
