import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { eventsApi } from '../services/api';
import WhatsAppModal from './WhatsAppModal';
import EmailModal from './EmailModal';
import { FadeIn, StaggerChildren } from '@/components/animations';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// Icons (inline SVG)
const DownloadIcon = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const SearchIcon = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const CheckCircleIcon = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const XCircleIcon = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

const MessageCircleIcon = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const MailIcon = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m2 7 8.97 5.7a1.94 1.94 0 0 0 2.06 0L22 7" />
  </svg>
);

export default function RegistrationsList({ eventId }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

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

    // Get all unique fields from form_data, excluding email and phone
    const allFields = new Set();
    registrations.forEach((reg) => {
      Object.keys(reg.form_data).forEach((key) => {
        if (key !== 'email' && key !== 'phone') {
          allFields.add(key);
        }
      });
    });

    // Create CSV header
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
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (registrations.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground text-lg">No registrations yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with search and export */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 relative">
          <SearchIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by email or phone..."
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsEmailModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <MailIcon className="h-4 w-4 mr-2" />
            <span>Send Email</span>
          </Button>
          <Button
            onClick={() => setIsWhatsAppModalOpen(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <MessageCircleIcon className="h-4 w-4 mr-2" />
            <span>Send WhatsApp</span>
          </Button>
          <Button onClick={exportToCSV} variant="default">
            <DownloadIcon className="h-4 w-4 mr-2" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <StaggerChildren
        staggerDelay={prefersReducedMotion ? 0 : 0.08}
        initialDelay={0.1}
        duration={prefersReducedMotion ? 0.01 : 0.3}
        direction="up"
        distance={15}
        className="grid grid-cols-3 gap-4"
      >
        <Card className="bg-blue-50 dark:bg-blue-900/20 hover:-translate-y-1 transition-all duration-200">
          <CardContent className="p-4">
            <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Total</p>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{registrations.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 dark:bg-green-900/20 hover:-translate-y-1 transition-all duration-200">
          <CardContent className="p-4">
            <p className="text-sm text-green-600 dark:text-green-400 mb-1">Checked In</p>
            <p className="text-2xl font-bold text-green-900 dark:text-green-100">
              {registrations.filter((r) => r.is_checked_in).length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-muted hover:-translate-y-1 transition-all duration-200">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Pending</p>
            <p className="text-2xl font-bold">
              {registrations.filter((r) => !r.is_checked_in).length}
            </p>
          </CardContent>
        </Card>
      </StaggerChildren>

      {/* Table */}
      <FadeIn
        direction={prefersReducedMotion ? 'none' : 'up'}
        delay={0.3}
        duration={prefersReducedMotion ? 0.01 : 0.3}
      >
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Status</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Registered At</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegistrations.map((reg, index) => (
                  <TableRow
                    key={reg.id}
                    className="hover:bg-muted/50 transition-colors duration-150"
                    style={{
                      animation: prefersReducedMotion ? 'none' : `fadeIn 0.3s ease-out ${0.4 + index * 0.05}s backwards`
                    }}
                  >
                    <TableCell>
                      {reg.is_checked_in ? (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircleIcon className="w-4 h-4" />
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <XCircleIcon className="w-4 h-4" />
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{reg.email}</TableCell>
                    <TableCell>{reg.phone}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(reg.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <details className="cursor-pointer">
                        <summary className="text-primary hover:underline">View Form Data</summary>
                        <div className="mt-2 p-3 bg-muted rounded-lg space-y-2">
                          {Object.entries(reg.form_data).map(([key, value]) => (
                            <div key={key} className="text-sm">
                              <span className="font-medium">{key}:</span>
                              <span className="ml-2">
                                {typeof value === 'object' ? JSON.stringify(value) : value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </details>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </FadeIn>

      {filteredRegistrations.length === 0 && searchTerm && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No registrations match your search</p>
          </CardContent>
        </Card>
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
