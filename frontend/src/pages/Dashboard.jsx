import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserButton, useUser } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import { eventsApi, qrCodesApi } from '../services/api';
import {
  Plus,
  Edit,
  Trash2,
  Copy,
  ToggleLeft,
  ToggleRight,
  Users,
  QrCode,
  Calendar,
  X,
} from 'lucide-react';
import EventForm from '../components/EventForm';
import RegistrationsList from '../components/RegistrationsList';
import QRCodeModal from '../components/QRCodeModal';
import BrandingSettings from '../components/BrandingSettings';
import MessageTemplates from '../components/MessageTemplates';
import Footer from '../components/Footer';

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showRegistrations, setShowRegistrations] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [activeTab, setActiveTab] = useState('events'); // 'events', 'branding', or 'templates'

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Admin Dashboard
              </h1>
              <p className="text-gray-600">
                Manage your MagPie events
                {user && <span className="ml-2">• Logged in as {user.firstName || user.emailAddresses[0].emailAddress}</span>}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {activeTab === 'events' && (
                <button
                  onClick={() => {
                    setEditingEvent(null);
                    setShowEventForm(true);
                  }}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Event</span>
                </button>
              )}
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-4 mt-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('events')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'events'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Events
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'templates'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Message Templates
            </button>
            <button
              onClick={() => setActiveTab('branding')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'branding'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Branding
            </button>
          </div>
        </div>

        {/* Branding Tab */}
        {activeTab === 'branding' && <BrandingSettings />}

        {/* Message Templates Tab */}
        {activeTab === 'templates' && <MessageTemplates />}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Events</p>
                <p className="text-3xl font-bold text-gray-900">{events.length}</p>
              </div>
              <Calendar className="w-10 h-10 text-primary" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Events</p>
                <p className="text-3xl font-bold text-green-600">
                  {events.filter((e) => e.is_active).length}
                </p>
              </div>
              <ToggleRight className="w-10 h-10 text-green-600" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Inactive Events</p>
                <p className="text-3xl font-bold text-gray-600">
                  {events.filter((e) => !e.is_active).length}
                </p>
              </div>
              <ToggleLeft className="w-10 h-10 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Events List */}
        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="card text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-4">No events yet</p>
              <button
                onClick={() => setShowEventForm(true)}
                className="btn-primary"
              >
                Create Your First Event
              </button>
            </div>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className="card hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-2xl font-bold text-gray-900">
                        {event.name}
                      </h3>
                      {event.is_active && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                          Active
                        </span>
                      )}
                    </div>

                    {event.description && (
                      <p className="text-gray-600 mb-4">{event.description}</p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Date:</span>
                        <span className="ml-2 text-gray-900 font-medium">
                          {event.date}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Time:</span>
                        <span className="ml-2 text-gray-900 font-medium">
                          {event.time}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Venue:</span>
                        <span className="ml-2 text-gray-900 font-medium">
                          {event.venue}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    <button
                      onClick={() => toggleMutation.mutate(event.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Toggle Status"
                    >
                      {event.is_active ? (
                        <ToggleRight className="w-6 h-6 text-green-600" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-gray-400" />
                      )}
                    </button>

                    <button
                      onClick={() => handleEditEvent(event)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-5 h-5 text-blue-600" />
                    </button>

                    <button
                      onClick={() => handleCloneEvent(event)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Clone"
                    >
                      <Copy className="w-5 h-5 text-purple-600" />
                    </button>

                    <button
                      onClick={() => handleViewRegistrations(event)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="View Registrations"
                    >
                      <Users className="w-5 h-5 text-indigo-600" />
                    </button>

                    <button
                      onClick={() => handleCreateQR(event)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Create QR Code"
                    >
                      <QrCode className="w-5 h-5 text-orange-600" />
                    </button>

                    <button
                      onClick={() => handleDeleteEvent(event)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
          </>
        )}
      </div>

      {/* Event Form Modal */}
      {showEventForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingEvent ? 'Edit Event' : 'Create New Event'}
              </h2>
              <button
                onClick={() => {
                  setShowEventForm(false);
                  setEditingEvent(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
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
            </div>
          </div>
        </div>
      )}

      {/* Registrations Modal */}
      {showRegistrations && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Registrations: {selectedEvent.name}
              </h2>
              <button
                onClick={() => {
                  setShowRegistrations(false);
                  setSelectedEvent(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <RegistrationsList eventId={selectedEvent.id} />
            </div>
          </div>
        </div>
      )}

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
