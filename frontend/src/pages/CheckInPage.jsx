import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeProvider, useTheme } from "@/contexts/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { qrCodesApi, registrationsApi } from '../services/api';
import Footer from '../components/Footer';

// Icons (inline SVG)
const CheckCircleIcon = ({ className = "h-10 w-10" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const LinkIcon = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

function CheckInPageContent() {
  const { eventId, qrId } = useParams();
  const [checkedIn, setCheckedIn] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { mode, toggleMode } = useTheme();

  // Fetch QR code details
  const { data: qrCode, isLoading } = useQuery({
    queryKey: ['qrCode', qrId],
    queryFn: async () => {
      const response = await qrCodesApi.getById(qrId);
      return response.data;
    },
  });

  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: async (email) => {
      const response = await registrationsApi.checkIn(eventId, email);
      return response.data;
    },
    onSuccess: () => {
      setCheckedIn(true);
      toast.success('Successfully checked in!', {
        icon: '🎉',
        duration: 3000,
      });
    },
    onError: (error) => {
      const message = error.response?.data?.detail || 'Failed to check in. Please try again.';
      toast.error(message);
    },
  });

  const onSubmit = (data) => {
    checkInMutation.mutate(data.email);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (checkedIn) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle mode={mode} onToggle={toggleMode} />
        </div>

        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full">
                  <CheckCircleIcon className="h-12 w-12 text-green-600 dark:text-green-500" />
                </div>
              </div>
              <CardTitle className="text-2xl">Check-in Successful!</CardTitle>
              <CardDescription>
                You've been successfully checked in to the event.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {qrCode && (
                <>
                  {qrCode.qr_type === 'text' && qrCode.message && (
                    <Alert>
                      <AlertDescription className="text-center">
                        {qrCode.message}
                      </AlertDescription>
                    </Alert>
                  )}

                  {qrCode.qr_type === 'url' && qrCode.message && (
                    <div className="text-center">
                      <Button asChild>
                        <a
                          href={qrCode.message}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2"
                        >
                          <LinkIcon className="h-4 w-4" />
                          Visit Link
                        </a>
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle mode={mode} onToggle={toggleMode} />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Event Check-in</CardTitle>
            <CardDescription>
              Enter your email address to check in to this event
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={checkInMutation.isPending}
              >
                {checkInMutation.isPending ? 'Checking in...' : 'Check In'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}

export default function CheckInPage() {
  return (
    <ThemeProvider>
      <CheckInPageContent />
    </ThemeProvider>
  );
}
