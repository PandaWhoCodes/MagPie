import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { eventsApi } from '../services/api';

// Icons (inline SVG)
const PlusIcon = ({ className = "h-4 w-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const Trash2Icon = ({ className = "h-4 w-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const GripVerticalIcon = ({ className = "h-4 w-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="9" cy="12" r="1" />
    <circle cx="9" cy="5" r="1" />
    <circle cx="9" cy="19" r="1" />
    <circle cx="15" cy="12" r="1" />
    <circle cx="15" cy="5" r="1" />
    <circle cx="15" cy="19" r="1" />
  </svg>
);

const ChevronUpIcon = ({ className = "h-4 w-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

const ChevronDownIcon = ({ className = "h-4 w-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const InfoIcon = ({ className = "h-4 w-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'email', label: 'Email' },
  { value: 'tel', label: 'Phone' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'select', label: 'Dropdown' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'radio', label: 'Radio' },
];

export default function EventForm({ event, onSuccess, onCancel }) {
  const isEditing = !!event;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm({
    defaultValues: event ? {
      ...event,
      registrations_open: event.registrations_open ?? true,
      fields: event.fields?.map(field => ({
        ...field,
        field_options: field.field_options ?
          (typeof field.field_options === 'string' && field.field_options.startsWith('[') ?
            JSON.parse(field.field_options).join(', ') :
            field.field_options) : ''
      })) || []
    } : {
      name: '',
      description: '',
      date: '',
      time: '',
      venue: '',
      venue_address: '',
      venue_map_link: '',
      is_active: false,
      registrations_open: true,
      fields: [],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'fields',
  });

  // Function to generate field identifier from label
  const generateFieldName = (label) => {
    if (!label) return '';
    return label
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .substring(0, 10); // Take only first 10 characters
  };

  const createMutation = useMutation({
    mutationFn: (data) => eventsApi.create(data),
    onSuccess: () => {
      toast.success('Event created successfully!');
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to create event');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => eventsApi.update(event.id, data),
    onSuccess: () => {
      toast.success('Event updated successfully!');
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to update event');
    },
  });

  const onSubmit = async (data) => {
    // Prevent double submissions
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Process field options for select/radio fields and auto-generate field names
      const processedFields = data.fields?.map((field, index) => ({
        ...field,
        field_name: generateFieldName(field.field_label), // Auto-generate from label
        field_order: index, // Set correct order based on array index
        field_options:
          field.field_type === 'select' || field.field_type === 'radio'
            ? JSON.stringify(
                field.field_options
                  ?.split(',')
                  .map((opt) => opt.trim())
                  .filter(Boolean) || []
              )
            : null,
      })) || [];

      if (isEditing) {
        // For update, send basic data and fields separately
        const { fields, ...updateData } = data;
        updateMutation.mutate(updateData);

        // Update fields separately via new API endpoint
        try {
          await eventsApi.updateFields(event.id, processedFields);
        } catch (error) {
          console.error('Failed to update fields:', error);
        }
      } else {
        // For create, send everything together
        const processedData = {
          ...data,
          fields: processedFields,
        };
        createMutation.mutate(processedData);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const addField = () => {
    append({
      field_name: '',
      field_type: 'text',
      field_label: '',
      is_required: false,
      field_options: '',
      field_order: fields.length,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Event Details</h3>

        <div className="space-y-2">
          <Label htmlFor="name">Event Name *</Label>
          <Input
            id="name"
            {...register('name', { required: 'Event name is required' })}
            placeholder="e.g., MagPie Summit 2025"
            className={errors.name ? 'border-destructive' : ''}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register('description')}
            rows={3}
            placeholder="Tell us about this event..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              {...register('date', { required: 'Date is required' })}
              className={errors.date ? 'border-destructive' : ''}
            />
            {errors.date && (
              <p className="text-sm text-destructive">{errors.date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Time *</Label>
            <Input
              id="time"
              type="time"
              {...register('time', { required: 'Time is required' })}
              className={errors.time ? 'border-destructive' : ''}
            />
            {errors.time && (
              <p className="text-sm text-destructive">{errors.time.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="venue">Venue *</Label>
          <Input
            id="venue"
            {...register('venue', { required: 'Venue is required' })}
            placeholder="e.g., IBM India Office"
            className={errors.venue ? 'border-destructive' : ''}
          />
          {errors.venue && (
            <p className="text-sm text-destructive">{errors.venue.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="venue_address">Venue Address</Label>
          <Textarea
            id="venue_address"
            {...register('venue_address')}
            rows={2}
            placeholder="Full address..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="venue_map_link">Google Maps Link</Label>
          <Input
            id="venue_map_link"
            {...register('venue_map_link')}
            placeholder="https://maps.google.com/..."
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_active"
            onCheckedChange={(checked) => setValue('is_active', checked)}
            defaultChecked={watch('is_active')}
          />
          <Label htmlFor="is_active" className="font-normal cursor-pointer">
            Set as Active Event
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="registrations_open"
            onCheckedChange={(checked) => setValue('registrations_open', checked)}
            defaultChecked={watch('registrations_open')}
          />
          <Label htmlFor="registrations_open" className="font-normal cursor-pointer">
            Allow Registrations
          </Label>
        </div>
        <p className="text-xs text-muted-foreground">
          Disable to show event details publicly but prevent new signups.
        </p>
      </div>

      {/* Custom Fields */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Registration Fields</h3>
          <Button type="button" onClick={addField} variant="outline" size="sm">
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Field
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          Email and Phone are mandatory by default. Add additional fields as needed.
        </p>

        {isEditing && (
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              Note: Changing fields will not affect existing registrations.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {fields.map((field, index) => (
            <Card key={field.id} className="p-4 bg-muted/50">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center gap-1 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => index > 0 && move(index, index - 1)}
                    disabled={index === 0}
                    className="h-6 w-6"
                  >
                    <ChevronUpIcon />
                  </Button>
                  <GripVerticalIcon className="h-5 w-5 text-muted-foreground" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => index < fields.length - 1 && move(index, index + 1)}
                    disabled={index === fields.length - 1}
                    className="h-6 w-6"
                  >
                    <ChevronDownIcon />
                  </Button>
                </div>

                <div className="flex-1 space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor={`field_label_${index}`}>Field Label (shown to user)</Label>
                    <Input
                      id={`field_label_${index}`}
                      {...register(`fields.${index}.field_label`, {
                        required: 'Field label is required',
                      })}
                      placeholder="e.g., GitHub Profile URL"
                    />
                    <p className="text-xs text-muted-foreground">
                      Identifier: {watch(`fields.${index}.field_label`) ? generateFieldName(watch(`fields.${index}.field_label`)) : 'field_name'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`field_type_${index}`}>Field Type</Label>
                      <Select
                        value={watch(`fields.${index}.field_type`)}
                        onValueChange={(value) => setValue(`fields.${index}.field_type`, value)}
                      >
                        <SelectTrigger id={`field_type_${index}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FIELD_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`field_options_${index}`}>
                        Options (for select/radio, comma-separated)
                      </Label>
                      <Input
                        id={`field_options_${index}`}
                        {...register(`fields.${index}.field_options`)}
                        placeholder="Option 1, Option 2, Option 3"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`is_required_${index}`}
                      onCheckedChange={(checked) => setValue(`fields.${index}.is_required`, checked)}
                      defaultChecked={watch(`fields.${index}.is_required`)}
                    />
                    <Label htmlFor={`is_required_${index}`} className="font-normal cursor-pointer">
                      Required Field
                    </Label>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2Icon />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t">
        <Button type="button" onClick={onCancel} variant="outline">
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
        >
          {isSubmitting || createMutation.isPending || updateMutation.isPending
            ? 'Saving...'
            : isEditing
            ? 'Update Event'
            : 'Create Event'}
        </Button>
      </div>
    </form>
  );
}
