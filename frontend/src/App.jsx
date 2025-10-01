import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/thank-you" element={<ThankYouPage />} />
            <Route path="/dashboard_under" element={<Dashboard />} />
            <Route path="/check-in/:eventId/:qrId" element={<CheckInPage />} />
            <Route path="/no-events" element={<NoEventPage />} />
          </Routes>
        </div>
      </Router>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

export default App;
