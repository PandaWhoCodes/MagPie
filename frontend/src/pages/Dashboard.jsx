import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserButton, useUser } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DashboardThemeProvider, useDashboardTheme } from "@/contexts/DashboardThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ThemeSelector } from "@/components/ThemeSelector";
import { eventsApi } from '../services/api';
import EventForm from '../components/EventForm';
import RegistrationsList from '../components/RegistrationsList';
import QRCodeModal from '../components/QRCodeModal';
import BrandingSettings from '../components/BrandingSettings';
import MessageTemplates from '../components/MessageTemplates';
import Footer from '../components/Footer';
import { FadeIn, StaggerChildren } from '@/components/animations';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// Icons (inline SVG)
const PlusIcon = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const EditIcon = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

const CopyIcon = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const Trash2Icon = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const UsersIcon = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const QrCodeIcon = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
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

const ToggleRightIcon = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="1" y="5" width="22" height="14" rx="7" ry="7" />
    <circle cx="16" cy="12" r="3" />
  </svg>
);

const ToggleLeftIcon = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="1" y="5" width="22" height="14" rx="7" ry="7" />
    <circle cx="8" cy="12" r="3" />
  </svg>
);

function DashboardContent() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showRegistrations, setShowRegistrations] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [activeTab, setActiveTab] = useState('events');
  const { mode, toggleMode, theme, setTheme } = useDashboardTheme();
  const prefersReducedMotion = useReducedMotion();

  // Fetch all events
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const response = await eventsApi.getAll();
      return response.data;
    },
  });

  // Toggle event status mutation
  const toggleMutation = useMutation({
    mutationFn: (eventId) => eventsApi.toggle(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries(['events']);
      toast.success('Event status updated');
    },
    onError: () => {
      toast.error('Failed to toggle event status');
    },
  });

  // Clone event mutation
  const cloneMutation = useMutation({
    mutationFn: ({ eventId, newName }) => eventsApi.clone(eventId, newName),
    onSuccess: () => {
      queryClient.invalidateQueries(['events']);
      toast.success('Event cloned successfully');
    },
    onError: () => {
      toast.error('Failed to clone event');
    },
  });

  // Delete event mutation
  const deleteMutation = useMutation({
    mutationFn: (eventId) => eventsApi.delete(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries(['events']);
      toast.success('Event deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete event');
    },
  });

  const handleCloneEvent = (event) => {
    const newName = prompt(`Clone event "${event.name}" as:`, `${event.name} (Copy)`);
    if (newName) {
      cloneMutation.mutate({ eventId: event.id, newName });
    }
  };

  const handleDeleteEvent = (event) => {
    if (confirm(`Are you sure you want to delete "${event.name}"?`)) {
      deleteMutation.mutate(event.id);
    }
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setShowEventForm(true);
  };

  const handleViewRegistrations = (event) => {
    setSelectedEvent(event);
    setShowRegistrations(true);
  };

  const handleCreateQR = (event) => {
    setSelectedEvent(event);
    setShowQRModal(true);
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
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <FadeIn
            direction={prefersReducedMotion ? 'none' : 'down'}
            delay={0.1}
            duration={prefersReducedMotion ? 0.01 : 0.3}
          >
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight mb-2">
                    Admin Dashboard
                  </h1>
                  <p className="text-muted-foreground">
                    Manage your MagPie events
                    {user && <span className="ml-2">• {user.firstName || user.emailAddresses[0].emailAddress}</span>}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {activeTab === 'events' && (
                    <Button
                      onClick={() => {
                        setEditingEvent(null);
                        setShowEventForm(true);
                      }}
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Create Event
                    </Button>
                  )}
                  <div className="w-48">
                    <ThemeSelector
                      value={theme}
                      onChange={setTheme}
                      label={null}
                      showPreviewLink={false}
                    />
                  </div>
                  <ThemeToggle mode={mode} onToggle={toggleMode} />
                  <UserButton afterSignOutUrl="/" />
                </div>
              </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
              <TabsList>
                <TabsTrigger value="events">Events</TabsTrigger>
                <TabsTrigger value="templates">Message Templates</TabsTrigger>
                <TabsTrigger value="branding">Branding</TabsTrigger>
              </TabsList>

              {/* Branding Tab */}
              <TabsContent value="branding" className="mt-6">
                <BrandingSettings />
              </TabsContent>

              {/* Message Templates Tab */}
              <TabsContent value="templates" className="mt-6">
                <MessageTemplates />
              </TabsContent>

              {/* Events Tab */}
              <TabsContent value="events" className="mt-6 space-y-6">
                {/* Stats */}
                <StaggerChildren
                  staggerDelay={prefersReducedMotion ? 0 : 0.08}
                  initialDelay={0.2}
                  duration={prefersReducedMotion ? 0.01 : 0.3}
                  direction="up"
                  distance={20}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                  <Card className="hover:-translate-y-1 transition-all duration-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{events.length}</div>
                    </CardContent>
                  </Card>

                  <Card className="hover:-translate-y-1 transition-all duration-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Events</CardTitle>
                      <ToggleRightIcon className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {events.filter((e) => e.is_active).length}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:-translate-y-1 transition-all duration-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Inactive Events</CardTitle>
                      <ToggleLeftIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-muted-foreground">
                        {events.filter((e) => !e.is_active).length}
                      </div>
                    </CardContent>
                  </Card>
                </StaggerChildren>

                {/* Events List */}
                <div className="space-y-4">
                  {events.length === 0 ? (
                    <FadeIn
                      direction={prefersReducedMotion ? 'none' : 'up'}
                      delay={0.4}
                      duration={prefersReducedMotion ? 0.01 : 0.3}
                    >
                      <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                          <CalendarIcon className="h-16 w-16 text-muted-foreground mb-4" />
                          <CardTitle className="mb-2">No events yet</CardTitle>
                          <CardDescription className="mb-4">Create your first event to get started</CardDescription>
                          <Button onClick={() => setShowEventForm(true)}>
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Create Your First Event
                          </Button>
                        </CardContent>
                      </Card>
                    </FadeIn>
                  ) : (
                    <StaggerChildren
                      staggerDelay={prefersReducedMotion ? 0 : 0.1}
                      initialDelay={0.4}
                      duration={prefersReducedMotion ? 0.01 : 0.3}
                      direction="up"
                      distance={20}
                      className="space-y-4"
                    >
                      {events.map((event) => (
                        <Card key={event.id} className="hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <CardTitle className="text-2xl">{event.name}</CardTitle>
                                {event.is_active && (
                                  <Badge variant="default" className="bg-green-600">Active</Badge>
                                )}
                              </div>
                              {event.description && (
                                <CardDescription className="line-clamp-2">{event.description}</CardDescription>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleMutation.mutate(event.id)}
                                title="Toggle Status"
                              >
                                {event.is_active ? (
                                  <ToggleRightIcon className="h-4 w-4 text-green-600" />
                                ) : (
                                  <ToggleLeftIcon className="h-4 w-4 text-muted-foreground" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditEvent(event)}
                                title="Edit"
                              >
                                <EditIcon className="h-4 w-4 text-blue-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleCloneEvent(event)}
                                title="Clone"
                              >
                                <CopyIcon className="h-4 w-4 text-purple-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewRegistrations(event)}
                                title="View Registrations"
                              >
                                <UsersIcon className="h-4 w-4 text-indigo-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleCreateQR(event)}
                                title="Create QR Code"
                              >
                                <QrCodeIcon className="h-4 w-4 text-orange-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteEvent(event)}
                                title="Delete"
                              >
                                <Trash2Icon className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Date:</span>
                              <span className="ml-2 font-medium">{event.date}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Time:</span>
                              <span className="ml-2 font-medium">{event.time}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Venue:</span>
                              <span className="ml-2 font-medium">{event.venue}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    </StaggerChildren>
                  )}
                </div>
              </TabsContent>
            </Tabs>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Event Form Dialog */}
      <Dialog open={showEventForm} onOpenChange={setShowEventForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? 'Edit Event' : 'Create New Event'}
            </DialogTitle>
          </DialogHeader>
          <EventForm
            event={editingEvent}
            onSuccess={() => {
              setShowEventForm(false);
              setEditingEvent(null);
              queryClient.invalidateQueries(['events']);
            }}
            onCancel={() => {
              setShowEventForm(false);
              setEditingEvent(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Registrations Dialog */}
      <Dialog open={showRegistrations} onOpenChange={setShowRegistrations}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Registrations: {selectedEvent?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedEvent && <RegistrationsList eventId={selectedEvent.id} />}
        </DialogContent>
      </Dialog>

      {/* QR Code Modal */}
      {showQRModal && selectedEvent && (
        <QRCodeModal
          event={selectedEvent}
          onClose={() => {
            setShowQRModal(false);
            setSelectedEvent(null);
          }}
        />
      )}

      <Footer />
    </div>
  );
}

export default function Dashboard() {
  return (
    <DashboardThemeProvider>
      <DashboardContent />
    </DashboardThemeProvider>
  );
}
