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

  // Show skeleton loading state until branding is loaded to prevent theme flash
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 animate-pulse">
        {/* Header Skeleton */}
        <div className="container mx-auto px-4 py-8">
          <div className="h-12 w-48 bg-white/10 rounded-lg mb-8"></div>

          {/* Hero Section Skeleton */}
          <div className="max-w-4xl mx-auto text-center py-20">
            <div className="h-16 w-3/4 bg-white/10 rounded-lg mx-auto mb-6"></div>
            <div className="h-8 w-1/2 bg-white/10 rounded-lg mx-auto mb-12"></div>

            {/* Form Skeleton */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto border border-white/10">
              <div className="space-y-6">
                {/* Form Fields */}
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 w-32 bg-white/10 rounded"></div>
                    <div className="h-12 w-full bg-white/10 rounded-lg"></div>
                  </div>
                ))}
                {/* Submit Button */}
                <div className="h-12 w-full bg-purple-500/20 rounded-lg mt-8"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Particles Effect */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `float ${5 + Math.random() * 10}s linear infinite`,
              }}
            />
          ))}
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
