import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { SignedIn, SignedOut, SignIn, RedirectToSignIn, useAuth } from '@clerk/clerk-react';
import { ThemeProvider } from './contexts/ThemeContext';
import ThemeToggle from './components/ThemeToggle';
import { useTheme } from './hooks/useTheme';
import { setAuthTokenGetter } from './services/api';

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
  const { setLightTheme } = useTheme();
  const { getToken } = useAuth();

  // Set up auth token getter for API calls
  useEffect(() => {
    setAuthTokenGetter(getToken);
  }, [getToken]);

  // Only show theme toggle on user-facing pages (not dashboard)
  const isUserFacingPage = !location.pathname.includes('dashboard');
  const isDashboardPage = location.pathname.includes('dashboard');

  // Force light mode for dashboard
  useEffect(() => {
    if (isDashboardPage) {
      setLightTheme();
    }
  }, [isDashboardPage, setLightTheme]);

  return (
    <div className="min-h-screen transition-colors duration-300">
      {/* ThemeToggle will be conditionally rendered inside pages based on branding theme */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/thank-you" element={<ThankYouPage />} />
        <Route path="/check-in/:eventId/:qrId" element={<CheckInPage />} />
        <Route path="/no-events" element={<NoEventPage />} />

        {/* Sign In Route */}
        <Route
          path="/sign-in"
          element={
            <>
              <SignedIn>
                <Navigate to="/dashboard" replace />
              </SignedIn>
              <SignedOut>
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                  <SignIn routing="path" path="/sign-in" />
                </div>
              </SignedOut>
            </>
          }
        />

        {/* Protected Dashboard Route */}
        <Route
          path="/dashboard"
          element={
            <>
              <SignedIn>
                <Dashboard />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />
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
