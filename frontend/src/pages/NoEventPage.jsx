import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { useTheme } from "@/contexts/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import Footer from '../components/Footer';

// Calendar icon (inline SVG)
const CalendarIcon = ({ className = "h-10 w-10" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

function NoEventPageContent() {
  const { mode, toggleMode } = useTheme();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Theme toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle mode={mode} onToggle={toggleMode} />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-muted rounded-full">
                <CalendarIcon className="h-10 w-10 text-muted-foreground" />
              </div>
            </div>
            <CardTitle className="text-3xl mb-2">No Active Events</CardTitle>
            <CardDescription className="text-lg">
              Sorry, there are no registrations open at the moment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertDescription>
                Stay tuned for our next exciting event! Follow us on social media for updates.
              </AlertDescription>
            </Alert>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <a
                  href="https://build2learn.in"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit Our Website
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a
                  href="https://www.linkedin.com/company/build2learn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Follow on LinkedIn
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}

export default function NoEventPage() {
  return (
    <ThemeProvider>
      <NoEventPageContent />
    </ThemeProvider>
  );
}
