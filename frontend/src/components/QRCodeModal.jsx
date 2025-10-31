import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { qrCodesApi } from '../services/api';

// Icons (inline SVG)
const DownloadIcon = ({ className = "h-4 w-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const Trash2Icon = ({ className = "h-4 w-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

export default function QRCodeModal({ event, onClose }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('create');
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      qr_type: 'message',
      message: '',
    },
  });

  // Fetch existing QR codes for this event
  const { data: qrCodes = [], isLoading } = useQuery({
    queryKey: ['qrCodes', event.id],
    queryFn: async () => {
      const response = await qrCodesApi.getByEvent(event.id);
      return response.data;
    },
  });

  // Create QR code mutation
  const createMutation = useMutation({
    mutationFn: async (data) => {
      const response = await qrCodesApi.create({
        event_id: event.id,
        message: data.message,
        qr_type: data.qr_type,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('QR Code created successfully!');
      queryClient.invalidateQueries(['qrCodes', event.id]);
      reset();
      setActiveTab('list');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to create QR code');
    },
  });

  // Delete QR code mutation
  const deleteMutation = useMutation({
    mutationFn: (qrId) => qrCodesApi.delete(qrId),
    onSuccess: () => {
      toast.success('QR Code deleted');
      queryClient.invalidateQueries(['qrCodes', event.id]);
    },
    onError: () => {
      toast.error('Failed to delete QR code');
    },
  });

  const onSubmit = (data) => {
    createMutation.mutate(data);
  };

  const downloadQRCode = (qrImage, qrId) => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${qrImage}`;
    link.download = `qr-code-${qrId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>QR Codes: {event.name}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="create" className="flex-1">Create New</TabsTrigger>
            <TabsTrigger value="list" className="flex-1">
              Existing QR Codes ({qrCodes.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="mt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="qr_type">QR Type</Label>
                <Select
                  value={watch('qr_type')}
                  onValueChange={(value) => setValue('qr_type', value)}
                >
                  <SelectTrigger id="qr_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="message">Message (WiFi Password, Instructions, etc.)</SelectItem>
                    <SelectItem value="url">URL (Link to join group, website, etc.)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message / URL *</Label>
                <Textarea
                  id="message"
                  {...register('message', { required: 'This field is required' })}
                  rows={4}
                  placeholder="Enter the message or URL that will be shown after check-in..."
                  className={errors.message ? 'border-destructive' : ''}
                />
                {errors.message && (
                  <p className="text-sm text-destructive">{errors.message.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  This will be displayed to attendees after they check in using their email.
                </p>
              </div>

              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full"
              >
                {createMutation.isPending ? 'Creating...' : 'Create QR Code'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="list" className="mt-6">
            <div className="space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-40 w-full" />
                  <Skeleton className="h-40 w-full" />
                </div>
              ) : qrCodes.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <p className="text-muted-foreground mb-4">No QR codes created yet</p>
                    <Button onClick={() => setActiveTab('create')}>
                      Create Your First QR Code
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                qrCodes.map((qr) => (
                  <Card key={qr.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">{qr.qr_type}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(qr.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="break-all mb-4">{qr.message}</p>

                          {/* Show QR Code Image if available */}
                          {qr.qr_image && (
                            <div className="mb-4">
                              <img
                                src={`data:image/png;base64,${qr.qr_image}`}
                                alt="QR Code"
                                className="w-48 h-48 border rounded"
                              />
                            </div>
                          )}

                          <p className="text-sm text-muted-foreground">
                            Check-in URL: {window.location.origin}/check-in/{event.id}/{qr.id}
                          </p>
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          {qr.qr_image && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => downloadQRCode(qr.qr_image, qr.id)}
                              title="Download QR Code"
                            >
                              <DownloadIcon className="h-5 w-5 text-blue-600" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm('Delete this QR code?')) {
                                deleteMutation.mutate(qr.id);
                              }
                            }}
                            title="Delete"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2Icon />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
