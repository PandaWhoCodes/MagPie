import React, { useEffect } from 'react';
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn, useAuth } from '@clerk/clerk-react';
import { useTheme } from '../hooks/useTheme';
import { setAuthTokenGetter } from '../services/api';

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Component that uses Clerk hooks - only rendered inside ClerkProvider
function ClerkAuthWrapper({ children }) {
  const { getToken } = useAuth();
  const { setLightTheme } = useTheme();

  // Set up auth token getter for API calls on protected routes
  useEffect(() => {
    setAuthTokenGetter(getToken);
  }, [getToken]);

  // Force light mode for dashboard
  useEffect(() => {
    setLightTheme();
  }, [setLightTheme]);

  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

// Protected route wrapper that loads Clerk
export function ProtectedRoute({ children }) {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} afterSignOutUrl="/">
      <ClerkAuthWrapper>{children}</ClerkAuthWrapper>
    </ClerkProvider>
  );
}
