import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { eventsApi } from '../services/api';
import { Download, Search, CheckCircle, XCircle, MessageCircle, Mail } from 'lucide-react';
import WhatsAppModal from './WhatsAppModal';
import EmailModal from './EmailModal';

export default function RegistrationsList({ eventId }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const { data: registrations = [], isLoading } = useQuery({
    queryKey: ['registrations', eventId],
    queryFn: async () => {
      const response = await eventsApi.getRegistrations(eventId);
      return response.data;
    },
  });

  const { data: event } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const response = await eventsApi.getById(eventId);
      return response.data;
    },
  });

  const filteredRegistrations = registrations.filter(
    (reg) =>
      reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.phone.includes(searchTerm)
  );

  const exportToCSV = () => {
    if (registrations.length === 0) return;

    // Get all unique fields from form_data, excluding email and phone (already in main columns)
    const allFields = new Set();
    registrations.forEach((reg) => {
      Object.keys(reg.form_data).forEach((key) => {
        // Exclude email and phone as they're already in the main columns
        if (key !== 'email' && key !== 'phone') {
          allFields.add(key);
        }
      });
    });

    // Create CSV header - convert field names to proper case
    const headers = [
      'Email',
      'Phone',
      'Checked In',
      'Registered At',
      ...Array.from(allFields).map(field =>
        field.split('_').map(word =>
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')
      )
    ];

    // Create CSV rows
    const rows = registrations.map((reg) => {
      const row = [
        reg.email,
        reg.phone,
        reg.is_checked_in ? 'Yes' : 'No',
        reg.created_at,
        ...Array.from(allFields).map((field) => {
          const value = reg.form_data[field];
          if (typeof value === 'object') return JSON.stringify(value);
          return value || '';
        }),
      ];
      return row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',');
    });

    // Combine headers and rows
    const csv = [headers.join(','), ...rows].join('\n');

    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registrations-${eventId}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading registrations...</p>
      </div>
    );
  }

  if (registrations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg">No registrations yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with search and export */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by email or phone..."
            className="input-field pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEmailModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Mail className="w-5 h-5" />
            <span>Send Email</span>
          </button>
          <button
            onClick={() => setIsWhatsAppModalOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Send WhatsApp</span>
          </button>
          <button onClick={exportToCSV} className="btn-primary flex items-center space-x-2">
            <Download className="w-5 h-5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-blue-600 mb-1">Total</p>
          <p className="text-2xl font-bold text-blue-900">{registrations.length}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-green-600 mb-1">Checked In</p>
          <p className="text-2xl font-bold text-green-900">
            {registrations.filter((r) => r.is_checked_in).length}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Pending</p>
          <p className="text-2xl font-bold text-gray-900">
            {registrations.filter((r) => !r.is_checked_in).length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Phone
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Registered At
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRegistrations.map((reg) => (
              <tr key={reg.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap">
                  {reg.is_checked_in ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-400" />
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {reg.email}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {reg.phone}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {new Date(reg.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm">
                  <details className="cursor-pointer">
                    <summary className="text-primary hover:underline">View Form Data</summary>
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      {Object.entries(reg.form_data).map(([key, value]) => (
                        <div key={key} className="mb-2">
                          <span className="font-medium text-gray-700">{key}:</span>
                          <span className="ml-2 text-gray-900">
                            {typeof value === 'object' ? JSON.stringify(value) : value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </details>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredRegistrations.length === 0 && searchTerm && (
        <div className="text-center py-8">
          <p className="text-gray-600">No registrations match your search</p>
        </div>
      )}

      {/* WhatsApp Modal */}
      <WhatsAppModal
        eventId={eventId}
        eventFields={event?.fields || []}
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        registrantsCount={registrations.length}
      />

      {/* Email Modal */}
      <EmailModal
        eventId={eventId}
        eventFields={event?.fields || []}
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        registrantsCount={registrations.length}
      />
    </div>
  );
}
