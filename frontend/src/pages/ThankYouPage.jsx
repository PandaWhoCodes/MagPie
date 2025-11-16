import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ThemeProvider, useTheme } from "@/contexts/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import Footer from '../components/Footer';
import { FadeIn, Confetti, StaggerChildren } from '@/components/animations';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// Icons (inline SVG)
const CheckCircleIcon = ({ className = "h-6 w-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const CalendarIcon = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ClockIcon = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const MapPinIcon = ({ className = "h-5 w-5" }) => (
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

function ThankYouPageContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { event, registration } = location.state || {};
  const { mode, toggleMode } = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const [showConfetti, setShowConfetti] = useState(false);

  // Trigger confetti on mount (only if motion is enabled)
  useEffect(() => {
    if (!prefersReducedMotion && event && registration) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [prefersReducedMotion, event, registration]);

  if (!event || !registration) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <CardTitle>No Registration Data</CardTitle>
            <CardDescription>Please complete the registration form first.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">
              Go to Registration
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Confetti celebration */}
      <Confetti active={showConfetti} particleCount={80} />

      {/* Theme toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle mode={mode} onToggle={toggleMode} />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <FadeIn
          direction={prefersReducedMotion ? 'none' : 'up'}
          delay={0.1}
          duration={prefersReducedMotion ? 0.01 : 0.8}
        >
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center space-y-4">
              <FadeIn
                direction={prefersReducedMotion ? 'none' : 'down'}
                delay={0.3}
                duration={prefersReducedMotion ? 0.01 : 0.6}
              >
                <div className="flex justify-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full">
                    <CheckCircleIcon className="h-10 w-10 text-green-600 dark:text-green-500" />
                  </div>
                </div>
              </FadeIn>
              <FadeIn
                direction={prefersReducedMotion ? 'none' : 'up'}
                delay={0.5}
                duration={prefersReducedMotion ? 0.01 : 0.6}
              >
                <div>
                  <CardTitle className="text-3xl mb-2">Registration Successful!</CardTitle>
                  <CardDescription className="text-lg">
                    Thank you for registering. We've sent a confirmation email to{' '}
                    <span className="font-medium text-foreground">{registration.email}</span>
                  </CardDescription>
                </div>
              </FadeIn>
            </CardHeader>

          <CardContent className="space-y-6">
            <FadeIn
              direction={prefersReducedMotion ? 'none' : 'up'}
              delay={0.7}
              duration={prefersReducedMotion ? 0.01 : 0.6}
            >
              {/* Event Details */}
              <div className="space-y-4">
                <div className="flex flex-col items-center text-center space-y-2">
                  <h3 className="text-lg font-semibold">{event.event_name}</h3>
                  <Badge variant="secondary">Registered</Badge>
                </div>

                <Separator />

                <div className="space-y-3">
                  {event.event_date && (
                    <div className="flex items-start gap-3">
                      <CalendarIcon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Date</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.event_date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  )}

                  {event.event_time && (
                    <div className="flex items-start gap-3">
                      <ClockIcon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Time</p>
                        <p className="text-sm text-muted-foreground">{event.event_time}</p>
                      </div>
                    </div>
                  )}

                  {event.location && (
                    <div className="flex items-start gap-3">
                      <MapPinIcon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Location</p>
                        <p className="text-sm text-muted-foreground">{event.location}</p>
                        {event.google_maps_link && (
                          <a
                            href={event.google_maps_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline inline-flex items-center gap-1 mt-1"
                          >
                            View on Google Maps <ExternalLinkIcon />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* What's Next */}
                <div className="space-y-3">
                  <h3 className="font-semibold">What's Next?</h3>
                  <StaggerChildren
                    staggerDelay={prefersReducedMotion ? 0 : 0.1}
                    initialDelay={0}
                    duration={prefersReducedMotion ? 0.01 : 0.4}
                    direction="left"
                    distance={20}
                    className="space-y-2"
                  >
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Check your email for confirmation and event details</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Add the event to your calendar</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Join us on the event day - we can't wait to see you!</span>
                    </div>
                  </StaggerChildren>
                </div>
              </div>

              <Separator />

              {/* Social Links */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button variant="outline" asChild className="flex-1">
                  <a
                    href="https://build2learn.in"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit Our Website
                  </a>
                </Button>
                <Button variant="outline" asChild className="flex-1">
                  <a
                    href="https://www.linkedin.com/company/build2learn"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Follow on LinkedIn
                  </a>
                </Button>
              </div>

              <Button onClick={() => navigate('/')} variant="ghost" className="w-full">
                Back to Home
              </Button>
            </FadeIn>
          </CardContent>
          </Card>
        </FadeIn>
      </div>

      <Footer />
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <ThemeProvider>
      <ThankYouPageContent />
    </ThemeProvider>
  );
}
