import React, { useState } from 'react';
import { X, Send, Users, AlertCircle } from 'lucide-react';
import { whatsappApi } from '../services/api';
import toast from 'react-hot-toast';

export default function WhatsAppModal({ eventId, isOpen, onClose, registrantsCount }) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setIsSending(true);
    setSendResult(null);

    try {
      const response = await whatsappApi.sendBulkMessages(eventId, message);
      setSendResult(response.data);

      if (response.data.sent > 0) {
        toast.success(`Successfully sent ${response.data.sent} messages!`);
      }

      if (response.data.failed > 0) {
        toast.error(`Failed to send ${response.data.failed} messages`);
      }
    } catch (error) {
      console.error('Error sending WhatsApp messages:', error);
      toast.error(error.response?.data?.detail || 'Failed to send messages');
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setMessage('');
    setSendResult(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Send className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Send WhatsApp Messages</h2>
              <div className="flex items-center space-x-2 mt-1">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {registrantsCount} {registrantsCount === 1 ? 'recipient' : 'recipients'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Info Alert */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Important Information:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Messages will be sent to all registered participants</li>
                <li>Phone numbers will automatically be formatted (+91 for India)</li>
                <li>Recipients must have joined the Twilio sandbox to receive messages</li>
              </ul>
            </div>
          </div>

          {/* Message Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message Content
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message here...&#10;&#10;Example:&#10;Hi! This is a reminder about our upcoming event. Looking forward to seeing you there! 🎉"
              className="input-field min-h-[200px] resize-none"
              disabled={isSending}
            />
            <p className="mt-2 text-sm text-gray-500">
              {message.length} characters
            </p>
          </div>

          {/* Send Result */}
          {sendResult && (
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-gray-900">Sending Summary</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-blue-100 rounded p-3 text-center">
                    <p className="text-2xl font-bold text-blue-900">{sendResult.total}</p>
                    <p className="text-xs text-blue-700">Total</p>
                  </div>
                  <div className="bg-green-100 rounded p-3 text-center">
                    <p className="text-2xl font-bold text-green-900">{sendResult.sent}</p>
                    <p className="text-xs text-green-700">Sent</p>
                  </div>
                  <div className="bg-red-100 rounded p-3 text-center">
                    <p className="text-2xl font-bold text-red-900">{sendResult.failed}</p>
                    <p className="text-xs text-red-700">Failed</p>
                  </div>
                </div>
              </div>

              {/* Show failed recipients if any */}
              {sendResult.failed > 0 && (
                <details className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <summary className="cursor-pointer font-medium text-red-900">
                    View Failed Messages ({sendResult.failed})
                  </summary>
                  <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
                    {sendResult.results
                      .filter((r) => !r.message_sid)
                      .map((result, idx) => (
                        <div key={idx} className="text-sm bg-white rounded p-2">
                          <p className="font-medium text-gray-900">{result.email}</p>
                          <p className="text-red-600">{result.phone}</p>
                          <p className="text-xs text-gray-600">{result.error}</p>
                        </div>
                      ))}
                  </div>
                </details>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isSending}
          >
            {sendResult ? 'Close' : 'Cancel'}
          </button>
          {!sendResult && (
            <button
              onClick={handleSend}
              disabled={isSending || !message.trim()}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send to {registrantsCount} {registrantsCount === 1 ? 'Person' : 'People'}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
