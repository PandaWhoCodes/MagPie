import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { qrCodesApi } from '../services/api';
import { X, Download, Trash2 } from 'lucide-react';

export default function QRCodeModal({ event, onClose }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('create');
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

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
    onSuccess: (data) => {
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            QR Codes: {event.name}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'create'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Create New
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'list'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Existing QR Codes ({qrCodes.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'create' ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  QR Type
                </label>
                <select {...register('qr_type')} className="input-field">
                  <option value="message">Message (WiFi Password, Instructions, etc.)</option>
                  <option value="url">URL (Link to join group, website, etc.)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message / URL *
                </label>
                <textarea
                  {...register('message', { required: 'This field is required' })}
                  className="input-field"
                  rows="4"
                  placeholder="Enter the message or URL that will be shown after check-in..."
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                )}
                <p className="mt-2 text-sm text-gray-600">
                  This will be displayed to attendees after they check in using their email.
                </p>
              </div>

              <button
                type="submit"
                disabled={createMutation.isPending}
                className="btn-primary w-full"
              >
                {createMutation.isPending ? 'Creating...' : 'Create QR Code'}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : qrCodes.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">No QR codes created yet</p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="mt-4 btn-primary"
                  >
                    Create Your First QR Code
                  </button>
                </div>
              ) : (
                qrCodes.map((qr) => (
                  <div key={qr.id} className="card border-2 border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                            {qr.qr_type}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(qr.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-900 break-all mb-4">{qr.message}</p>

                        {/* Show QR Code Image if available */}
                        {qr.qr_image && (
                          <div className="mb-4">
                            <img
                              src={`data:image/png;base64,${qr.qr_image}`}
                              alt="QR Code"
                              className="w-48 h-48 border border-gray-300 rounded"
                            />
                          </div>
                        )}

                        <p className="text-sm text-gray-600">
                          Check-in URL: {window.location.origin}/check-in/{event.id}/{qr.id}
                        </p>
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        {qr.qr_image && (
                          <button
                            onClick={() => downloadQRCode(qr.qr_image, qr.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                            title="Download QR Code"
                          >
                            <Download className="w-5 h-5 text-blue-600" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (confirm('Delete this QR code?')) {
                              deleteMutation.mutate(qr.id);
                            }
                          }}
                          className="p-2 hover:bg-red-100 rounded-lg"
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
          )}
        </div>
      </div>
    </div>
  );
}
