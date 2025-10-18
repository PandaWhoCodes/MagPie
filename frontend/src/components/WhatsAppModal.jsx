import React, { useState, useEffect } from 'react';
import { X, Send, Users, AlertCircle } from './SimpleIcons';
import { whatsappApi, messageTemplatesApi } from '../services/api';
import toast from 'react-hot-toast';

export default function WhatsAppModal({ eventId, eventFields, isOpen, onClose, registrantsCount }) {
  const [messageMode, setMessageMode] = useState('direct'); // 'direct' or 'template'
  const [message, setMessage] = useState('');
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [templateVariables, setTemplateVariables] = useState({});
  const [sendTo, setSendTo] = useState('all'); // 'all' or 'subset'
  const [filterField, setFilterField] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [fieldValues, setFieldValues] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  useEffect(() => {
    if (filterField && eventId) {
      loadFieldValues();
    }
  }, [filterField, eventId]);

  useEffect(() => {
    if (selectedTemplateId && templates.length > 0) {
      const template = templates.find(t => t.id === selectedTemplateId);
      if (template) {
        setMessage(template.template_text);
        // Initialize template variables
        const vars = {};
        template.variables.forEach(v => {
          vars[v] = '';
        });
        setTemplateVariables(vars);
      }
    }
  }, [selectedTemplateId, templates]);

  const loadTemplates = async () => {
    try {
      const response = await messageTemplatesApi.getAll();
      setTemplates(response.data);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const loadFieldValues = async () => {
    try {
      const response = await whatsappApi.getFieldValues(eventId, filterField);
      setFieldValues(response.data.values || []);
    } catch (error) {
      console.error('Failed to load field values:', error);
      setFieldValues([]);
    }
  };

  const handleSend = async () => {
    if (messageMode === 'direct' && !message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    if (messageMode === 'template' && !selectedTemplateId) {
      toast.error('Please select a template');
      return;
    }

    if (sendTo === 'subset' && (!filterField || !filterValue)) {
      toast.error('Please select filter field and value');
      return;
    }

    setIsSending(true);
    setSendResult(null);

    try {
      const payload = {
        event_id: eventId,
        send_to: sendTo,
        filter_field: sendTo === 'subset' ? filterField : null,
        filter_value: sendTo === 'subset' ? filterValue : null,
      };

      if (messageMode === 'direct') {
        payload.message = message;
      } else {
        payload.template_id = selectedTemplateId;
        payload.template_variables = templateVariables;
      }

      const response = await whatsappApi.sendBulkMessages(payload);
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
    setMessageMode('direct');
    setSelectedTemplateId('');
    setTemplateVariables({});
    setSendTo('all');
    setFilterField('');
    setFilterValue('');
    setSendResult(null);
    onClose();
  };

  const getSelectedTemplate = () => {
    return templates.find(t => t.id === selectedTemplateId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
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
                <li>Phone numbers will automatically be formatted (+91 for India)</li>
                <li>Recipients must have joined the Twilio sandbox to receive messages</li>
                <li>Use {`{{fieldname}}`} to personalize with registration data</li>
              </ul>
            </div>
          </div>

          {/* Send To Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Send To
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="all"
                  checked={sendTo === 'all'}
                  onChange={(e) => setSendTo(e.target.value)}
                  className="mr-2"
                  disabled={isSending}
                />
                <span>All Registrants</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="subset"
                  checked={sendTo === 'subset'}
                  onChange={(e) => setSendTo(e.target.value)}
                  className="mr-2"
                  disabled={isSending}
                />
                <span>User Subset (Filter by Field)</span>
              </label>
            </div>
          </div>

          {/* Subset Filter Options */}
          {sendTo === 'subset' && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <h3 className="font-medium text-gray-900">Filter Options</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Field
                  </label>
                  <select
                    value={filterField}
                    onChange={(e) => {
                      setFilterField(e.target.value);
                      setFilterValue('');
                    }}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={isSending}
                  >
                    <option value="">Choose a field...</option>
                    {eventFields && eventFields.map((field) => (
                      <option key={field.field_name} value={field.field_name}>
                        {field.field_label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Value
                  </label>
                  <select
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={isSending || !filterField}
                  >
                    <option value="">Choose a value...</option>
                    {fieldValues.map((value, idx) => (
                      <option key={idx} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Message Mode Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message Mode
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="direct"
                  checked={messageMode === 'direct'}
                  onChange={(e) => setMessageMode(e.target.value)}
                  className="mr-2"
                  disabled={isSending}
                />
                <span>Direct Message</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="template"
                  checked={messageMode === 'template'}
                  onChange={(e) => setMessageMode(e.target.value)}
                  className="mr-2"
                  disabled={isSending}
                />
                <span>Use Template</span>
              </label>
            </div>
          </div>

          {/* Template Selection */}
          {messageMode === 'template' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Template
              </label>
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={isSending}
              >
                <option value="">Choose a template...</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.template_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Template Variables */}
          {messageMode === 'template' && selectedTemplateId && getSelectedTemplate()?.variables.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <h3 className="font-medium text-gray-900">Template Variables</h3>
              <div className="space-y-3">
                {getSelectedTemplate().variables.map((variable) => (
                  <div key={variable}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {`{{${variable}}}`}
                    </label>
                    <input
                      type="text"
                      value={templateVariables[variable] || ''}
                      onChange={(e) => setTemplateVariables({
                        ...templateVariables,
                        [variable]: e.target.value
                      })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder={`Enter value for ${variable}`}
                      disabled={isSending}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Message Preview/Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {messageMode === 'template' ? 'Message Preview' : 'Message Content'}
            </label>
            <textarea
              value={message}
              onChange={(e) => messageMode === 'direct' && setMessage(e.target.value)}
              placeholder={messageMode === 'direct'
                ? "Enter your message here...\n\nExample:\nHi {{name}}! This is a reminder about our upcoming event. Looking forward to seeing you there! 🎉"
                : "Select a template to see preview..."
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[150px] resize-none"
              disabled={isSending || messageMode === 'template'}
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
              disabled={isSending || (messageMode === 'direct' && !message.trim()) || (messageMode === 'template' && !selectedTemplateId)}
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
                  <span>Send Messages</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
