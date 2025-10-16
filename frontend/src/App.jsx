import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { BrandingProvider } from './contexts/BrandingContext';
import { useTheme } from './hooks/useTheme';

// Pages
import HomePage from './pages/HomePage';
import CheckInPage from './pages/CheckInPage';
import NoEventPage from './pages/NoEventPage';
import ThankYouPage from './pages/ThankYouPage';

// Lazy load dashboard and auth components (only loaded when needed)
import { DashboardLayout } from './components/DashboardLayout';
import { SignInLayout } from './components/SignInLayout';
const Dashboard = React.lazy(() => import('./pages/Dashboard'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes by default
    },
  },
});

// Component to handle theme switching based on route
function AppContent() {
  const location = useLocation();
  const { setLightTheme } = useTheme();
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
        {/* Public routes - NO Clerk loaded, fast and lightweight */}
        <Route path="/" element={<HomePage />} />
        <Route path="/thank-you" element={<ThankYouPage />} />
        <Route path="/check-in/:eventId/:qrId" element={<CheckInPage />} />
        <Route path="/no-events" element={<NoEventPage />} />

        {/* Sign In Route - Clerk loaded only when accessing this route */}
        <Route path="/sign-in" element={<SignInLayout />} />

        {/* Protected Dashboard Route - Clerk loaded only when accessing this route */}
        <Route
          path="/dashboard"
          element={
            <DashboardLayout>
              <React.Suspense fallback={
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-medium">Loading dashboard...</p>
                  </div>
                </div>
              }>
                <Dashboard />
              </React.Suspense>
            </DashboardLayout>
          }
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrandingProvider>
        <ThemeProvider>
          <Router>
            <AppContent />
          </Router>
          <Toaster position="top-right" />
        </ThemeProvider>
      </BrandingProvider>
    </QueryClientProvider>
  );
}

export default App;
