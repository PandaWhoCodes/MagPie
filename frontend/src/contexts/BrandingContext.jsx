import React, { createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { brandingApi } from '../services/api';

const BrandingContext = createContext(null);

export function BrandingProvider({ children }) {
  // Prefetch branding data immediately at app level
  const { data: branding, isLoading } = useQuery({
    queryKey: ['branding'],
    queryFn: async () => {
      const response = await brandingApi.get();
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    cacheTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    retry: 2,
    refetchOnMount: false, // Don't refetch if data exists
    refetchOnWindowFocus: false,
  });

  // Show loading state until branding is loaded to prevent theme flash
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-white/60 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrandingContext.Provider value={branding}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  return context || { theme: 'default', site_title: 'MagPie', site_headline: 'Where Innovation Meets Community' };
}
