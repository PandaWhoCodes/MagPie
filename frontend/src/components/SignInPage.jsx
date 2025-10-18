import React from 'react';
import { ClerkProvider, SignedIn, SignedOut, SignIn } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export function SignInPage() {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} afterSignOutUrl="/">
      <SignedIn>
        <Navigate to="/dashboard" replace />
      </SignedIn>
      <SignedOut>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <SignIn routing="path" path="/sign-in" />
        </div>
      </SignedOut>
    </ClerkProvider>
  );
}
