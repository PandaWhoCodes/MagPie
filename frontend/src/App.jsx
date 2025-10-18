import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { BrandingProvider } from './contexts/BrandingContext';

// HomePage - load immediately (first page user sees)
import HomePage from './pages/HomePage';

// Secondary public pages - lazy-loaded (only when user navigates to them)
const ThankYouPage = lazy(() => import('./pages/ThankYouPage'));
const CheckInPage = lazy(() => import('./pages/CheckInPage'));
const NoEventPage = lazy(() => import('./pages/NoEventPage'));

// Protected pages - lazy-loaded (only when user visits these routes)
// This ensures Clerk and Dashboard code ONLY loads when needed
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute').then(module => ({ default: module.ProtectedRoute })));
const SignInPage = lazy(() => import('./components/SignInPage').then(module => ({ default: module.SignInPage })));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600 font-medium">Loading...</p>
    </div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes by default
    },
  },
});

// Main app content
function AppContent() {

  return (
    <div className="min-h-screen transition-colors duration-300">
      {/* ThemeToggle will be conditionally rendered inside pages based on branding theme */}
      <Routes>
        {/* Public Routes - No Clerk, no auth, fast loading */}
        <Route path="/" element={<HomePage />} />
        <Route path="/thank-you" element={
          <Suspense fallback={<PageLoader />}>
            <ThankYouPage />
          </Suspense>
        } />
        <Route path="/check-in/:eventId/:qrId" element={
          <Suspense fallback={<PageLoader />}>
            <CheckInPage />
          </Suspense>
        } />
        <Route path="/no-events" element={
          <Suspense fallback={<PageLoader />}>
            <NoEventPage />
          </Suspense>
        } />

        {/* Protected Routes - Clerk lazy-loaded only when accessed */}
        <Route
          path="/sign-in"
          element={
            <Suspense fallback={<PageLoader />}>
              <SignInPage />
            </Suspense>
          }
        />

        <Route
          path="/dashboard"
          element={
            <Suspense fallback={<PageLoader />}>
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            </Suspense>
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
