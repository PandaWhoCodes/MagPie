import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { emailApi, messageTemplatesApi } from '../services/api';

// Icons (inline SVG)
const MailIcon = ({ className = "h-6 w-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m2 7 8.97 5.7a1.94 1.94 0 0 0 2.06 0L22 7" />
  </svg>
);

const UsersIcon = ({ className = "h-4 w-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const InfoIcon = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const LoaderIcon = ({ className = "h-4 w-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${className} animate-spin`}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export default function EmailModal({ eventId, eventFields, isOpen, onClose, registrantsCount }) {
  const [messageMode, setMessageMode] = useState('direct');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [templateVariables, setTemplateVariables] = useState({});
  const [sendTo, setSendTo] = useState('all');
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
      const response = await emailApi.getFieldValues(eventId, filterField);
      setFieldValues(response.data.values || []);
    } catch (error) {
      console.error('Failed to load field values:', error);
      setFieldValues([]);
    }
  };

  const handleSend = async () => {
    if (!subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }

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
        subject: subject,
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

      const response = await emailApi.sendBulkEmails(payload);
      setSendResult(response.data);

      if (response.data.sent > 0) {
        toast.success(`Successfully sent ${response.data.sent} emails!`);
      }

      if (response.data.failed > 0) {
        toast.error(`Failed to send ${response.data.failed} emails`);
      }
    } catch (error) {
      console.error('Error sending emails:', error);
      toast.error(error.response?.data?.detail || 'Failed to send emails');
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setSubject('');
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
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <MailIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <DialogTitle>Send Email Messages</DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <UsersIcon className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {registrantsCount} {registrantsCount === 1 ? 'recipient' : 'recipients'}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Info Alert */}
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium mb-1">Email Service Information:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Emails will be sent via Resend (100 emails/day free tier)</li>
                <li>Beautiful HTML template with your event branding</li>
                <li>Use {`{{fieldname}}`} to personalize with registration data</li>
                <li>Emails include header, your message, and footer automatically</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Send To Options */}
          <div className="space-y-2">
            <Label>Send To</Label>
            <RadioGroup value={sendTo} onValueChange={setSendTo}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" disabled={isSending} />
                <Label htmlFor="all" className="font-normal cursor-pointer">All Registrants</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="subset" id="subset" disabled={isSending} />
                <Label htmlFor="subset" className="font-normal cursor-pointer">User Subset (Filter by Field)</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Subset Filter Options */}
          {sendTo === 'subset' && (
            <Card className="bg-muted/50">
              <CardContent className="pt-6 space-y-4">
                <h3 className="font-medium">Filter Options</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Select Field</Label>
                    <Select
                      value={filterField}
                      onValueChange={(value) => {
                        setFilterField(value);
                        setFilterValue('');
                      }}
                      disabled={isSending}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a field..." />
                      </SelectTrigger>
                      <SelectContent>
                        {eventFields && eventFields.map((field) => (
                          <SelectItem key={field.field_name} value={field.field_name}>
                            {field.field_label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Select Value</Label>
                    <Select
                      value={filterValue}
                      onValueChange={setFilterValue}
                      disabled={isSending || !filterField}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a value..." />
                      </SelectTrigger>
                      <SelectContent>
                        {fieldValues.map((value, idx) => (
                          <SelectItem key={idx} value={value}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Message Mode Selection */}
          <div className="space-y-2">
            <Label>Message Mode</Label>
            <RadioGroup value={messageMode} onValueChange={setMessageMode}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="direct" id="direct" disabled={isSending} />
                <Label htmlFor="direct" className="font-normal cursor-pointer">Direct Message</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="template" id="template" disabled={isSending} />
                <Label htmlFor="template" className="font-normal cursor-pointer">Use Template</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Template Selection */}
          {messageMode === 'template' && (
            <div className="space-y-2">
              <Label>Select Template</Label>
              <Select
                value={selectedTemplateId}
                onValueChange={setSelectedTemplateId}
                disabled={isSending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.template_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Template Variables */}
          {messageMode === 'template' && selectedTemplateId && getSelectedTemplate()?.variables.length > 0 && (
            <Card className="bg-muted/50">
              <CardContent className="pt-6 space-y-4">
                <h3 className="font-medium">Template Variables</h3>
                <div className="space-y-3">
                  {getSelectedTemplate().variables.map((variable) => (
                    <div key={variable} className="space-y-2">
                      <Label>{`{{${variable}}}`}</Label>
                      <Input
                        value={templateVariables[variable] || ''}
                        onChange={(e) => setTemplateVariables({
                          ...templateVariables,
                          [variable]: e.target.value
                        })}
                        placeholder={`Enter value for ${variable}`}
                        disabled={isSending}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Subject Line */}
          <div className="space-y-2">
            <Label htmlFor="subject">Email Subject *</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject..."
              disabled={isSending}
            />
          </div>

          {/* Message Preview/Input */}
          <div className="space-y-2">
            <Label htmlFor="message">
              {messageMode === 'template' ? 'Message Preview' : 'Message Content'}
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => messageMode === 'direct' && setMessage(e.target.value)}
              placeholder={messageMode === 'direct'
                ? "Enter your message here...\n\nThis content will appear between the email header and footer.\n\nExample:\nDear {{name}},\n\nWe're excited to confirm your registration for our upcoming event!"
                : "Select a template to see preview..."
              }
              rows={10}
              disabled={isSending || messageMode === 'template'}
            />
            <p className="text-xs text-muted-foreground">
              {message.length} characters
            </p>
          </div>

          {/* Send Result */}
          {sendResult && (
            <Card>
              <CardContent className="pt-6 space-y-3">
                <h3 className="font-semibold">Sending Summary</h3>
                <div className="grid grid-cols-3 gap-3">
                  <Card className="bg-blue-100 dark:bg-blue-900/20">
                    <CardContent className="p-3 text-center">
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{sendResult.total}</p>
                      <p className="text-xs text-blue-700 dark:text-blue-300">Total</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-green-100 dark:bg-green-900/20">
                    <CardContent className="p-3 text-center">
                      <p className="text-2xl font-bold text-green-900 dark:text-green-100">{sendResult.sent}</p>
                      <p className="text-xs text-green-700 dark:text-green-300">Sent</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-red-100 dark:bg-red-900/20">
                    <CardContent className="p-3 text-center">
                      <p className="text-2xl font-bold text-red-900 dark:text-red-100">{sendResult.failed}</p>
                      <p className="text-xs text-red-700 dark:text-red-300">Failed</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Show failed recipients if any */}
                {sendResult.failed > 0 && (
                  <details className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <summary className="cursor-pointer font-medium">
                      View Failed Messages ({sendResult.failed})
                    </summary>
                    <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
                      {sendResult.results
                        .filter((r) => !r.success)
                        .map((result, idx) => (
                          <div key={idx} className="text-sm bg-background rounded p-2">
                            <p className="font-medium">{result.email}</p>
                            <p className="text-xs text-destructive">{result.error}</p>
                          </div>
                        ))}
                    </div>
                  </details>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSending}
          >
            {sendResult ? 'Close' : 'Cancel'}
          </Button>
          {!sendResult && (
            <Button
              onClick={handleSend}
              disabled={isSending || !subject.trim() || (messageMode === 'direct' && !message.trim()) || (messageMode === 'template' && !selectedTemplateId)}
            >
              {isSending ? (
                <>
                  <LoaderIcon className="h-4 w-4 mr-2" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <MailIcon className="w-4 h-4 mr-2" />
                  <span>Send Emails</span>
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
