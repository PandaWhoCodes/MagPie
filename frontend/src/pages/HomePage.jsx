import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeProvider, useTheme } from "@/contexts/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { eventsApi, registrationsApi, brandingApi } from '../services/api';
import Footer from '../components/Footer';
import { FadeIn, StaggerChildren } from '@/components/animations';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// Icons (inline SVG)
const SparklesIcon = ({ className = "h-10 w-10" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
);

const CalendarIcon = ({ className = "h-4 w-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ClockIcon = ({ className = "h-4 w-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const MapPinIcon = ({ className = "h-4 w-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const ExternalLinkIcon = ({ className = "h-4 w-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" x2="21" y1="14" y2="3" />
  </svg>
);

const CheckCircleIcon = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const LoaderIcon = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${className} animate-spin`}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

function HomePageContent() {
  const navigate = useNavigate();
  const [autoFillAttempted, setAutoFillAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successState, setSuccessState] = useState(false);
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm();
  const { mode, toggleMode } = useTheme();
  const prefersReducedMotion = useReducedMotion();

  // Fetch active event
  const { data: event, isLoading, error } = useQuery({
    queryKey: ['activeEvent'],
    queryFn: async () => {
      const response = await eventsApi.getActive();
      return response.data;
    },
    retry: false,
  });

  // Fetch branding
  const { data: branding } = useQuery({
    queryKey: ['branding'],
    queryFn: async () => {
      const response = await brandingApi.get();
      return response.data;
    },
  });

  // Watch email and phone for auto-fill
  const emailValue = watch('email');
  const phoneValue = watch('phone');

  // Auto-fill mutation
  const autoFillMutation = useMutation({
    mutationFn: async ({ email, phone }) => {
      const response = await registrationsApi.getProfile(email, phone);
      return response.data;
    },
    onSuccess: (data) => {
      // Auto-fill form with profile data
      Object.keys(data.profile_data).forEach((key) => {
        setValue(key, data.profile_data[key]);
      });
      toast.success('Form auto-filled with your previous information!', {
        icon: '✨',
        duration: 3000,
      });
    },
    onError: () => {
      // Silent fail for auto-fill
    },
  });

  // Trigger auto-fill when email or phone is entered
  useEffect(() => {
    if (!autoFillAttempted && (emailValue || phoneValue)) {
      const timer = setTimeout(() => {
        if (emailValue || phoneValue) {
          autoFillMutation.mutate({ email: emailValue, phone: phoneValue });
          setAutoFillAttempted(true);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [emailValue, phoneValue]);

  // Registration mutation
  const registrationMutation = useMutation({
    mutationFn: async (data) => {
      const response = await registrationsApi.create({
        event_id: event.id,
        email: data.email,
        phone: data.phone,
        form_data: data,
      });
      return response.data;
    },
    onSuccess: (registration) => {
      setSuccessState(true);
      setTimeout(() => {
        navigate('/thank-you', {
          state: {
            event,
            registration,
          },
        });
      }, 1500);
    },
    onError: (error) => {
      const message = error.response?.data?.detail || 'Failed to register. Please try again.';
      toast.error(message);
      setIsSubmitting(false);
    },
  });

  // Redirect if no active event
  if (error && error.response?.status === 404) {
    navigate('/no-events');
    return null;
  }

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
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!event) return null;

  const onSubmit = (data) => {
    setIsSubmitting(true);
    registrationMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Theme toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle mode={mode} onToggle={toggleMode} />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl space-y-8">
          {/* Header */}
          <FadeIn
            direction={prefersReducedMotion ? 'none' : 'down'}
            delay={0.1}
            duration={prefersReducedMotion ? 0.01 : 0.6}
          >
            <div className="text-center space-y-4">
              {branding?.logo_url ? (
                <div className="flex justify-center mb-4">
                  <img src={branding.logo_url} alt="Logo" className="h-12 object-contain" />
                </div>
              ) : (
                <div className="flex justify-center mb-4">
                  <SparklesIcon className="h-12 w-12 text-primary" />
                </div>
              )}
              <div>
                <h1 className="text-4xl font-bold tracking-tight">
                  {branding?.site_title || 'MagPie'}
                </h1>
                <p className="text-muted-foreground mt-2">
                  {branding?.site_headline || 'Where Innovation Meets Community'}
                </p>
              </div>
            </div>
          </FadeIn>

          {/* Event Card */}
          <FadeIn
            direction={prefersReducedMotion ? 'none' : 'up'}
            delay={0.3}
            duration={prefersReducedMotion ? 0.01 : 0.6}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{event.name}</CardTitle>
                {event.description && (
                  <CardDescription className="text-base">{event.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span>{event.date}</span>
                  <span className="text-muted-foreground">•</span>
                  <ClockIcon className="h-4 w-4 text-muted-foreground" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <MapPinIcon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div className="flex-1">
                    <span>{event.venue}</span>
                    {event.venue_map_link && (
                      <a
                        href={event.venue_map_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-primary hover:underline inline-flex items-center gap-1"
                      >
                        View Map <ExternalLinkIcon className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Registration Form */}
          <FadeIn
            direction={prefersReducedMotion ? 'none' : 'up'}
            delay={0.5}
            duration={prefersReducedMotion ? 0.01 : 0.6}
          >
            <Card>
            <CardHeader>
              <CardTitle>Register for Event</CardTitle>
              <CardDescription>Fill in your details below to register</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    {...register('email', { required: 'Email is required' })}
                    className={errors.email ? 'border-destructive' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="1234567890"
                    {...register('phone', {
                      required: 'Phone is required',
                      pattern: {
                        value: /^\d{10}$/,
                        message: 'Phone must be 10 digits',
                      },
                    })}
                    className={errors.phone ? 'border-destructive' : ''}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone.message}</p>
                  )}
                </div>

                {/* Dynamic Fields */}
                {event.fields && event.fields.length > 0 && (
                  <>
                    {event.fields.map((field) => (
                      <div key={field.id} className="space-y-2">
                        <Label htmlFor={field.field_name}>
                          {field.field_label} {field.is_required && '*'}
                        </Label>

                        {field.field_type === 'textarea' ? (
                          <Textarea
                            id={field.field_name}
                            {...register(field.field_name, {
                              required: field.is_required ? `${field.field_label} is required` : false,
                            })}
                            rows={4}
                            className={errors[field.field_name] ? 'border-destructive' : ''}
                          />
                        ) : field.field_type === 'select' ? (
                          <Select
                            onValueChange={(value) => setValue(field.field_name, value)}
                          >
                            <SelectTrigger className={errors[field.field_name] ? 'border-destructive' : ''}>
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent>
                              {field.field_options &&
                                JSON.parse(field.field_options).map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        ) : field.field_type === 'checkbox' ? (
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={field.field_name}
                              onCheckedChange={(checked) => setValue(field.field_name, checked)}
                            />
                            <Label htmlFor={field.field_name} className="font-normal cursor-pointer">
                              {field.field_label}
                            </Label>
                          </div>
                        ) : (
                          <Input
                            type={field.field_type}
                            id={field.field_name}
                            {...register(field.field_name, {
                              required: field.is_required ? `${field.field_label} is required` : false,
                            })}
                            className={errors[field.field_name] ? 'border-destructive' : ''}
                          />
                        )}

                        {errors[field.field_name] && (
                          <p className="text-sm text-destructive">{errors[field.field_name].message}</p>
                        )}
                      </div>
                    ))}
                  </>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                  variant={successState ? "default" : "default"}
                >
                  {successState ? (
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircleIcon />
                      <span>Success!</span>
                    </span>
                  ) : isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <LoaderIcon />
                      <span>Registering...</span>
                    </span>
                  ) : (
                    <span>Register Now</span>
                  )}
                </Button>
              </form>
            </CardContent>
            </Card>
          </FadeIn>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function HomePage() {
  return (
    <ThemeProvider>
      <HomePageContent />
    </ThemeProvider>
  );
}
