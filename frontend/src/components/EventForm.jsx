import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { eventsApi } from '../services/api';
import { Plus, Trash2, GripVertical } from 'lucide-react';

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
  const { register, handleSubmit, control, watch, formState: { errors } } = useForm({
    defaultValues: event ? {
      ...event,
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
        <h3 className="text-lg font-semibold text-gray-900">Event Details</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event Name *
          </label>
          <input
            {...register('name', { required: 'Event name is required' })}
            className="input-field"
            placeholder="e.g., Build2Learn Hackathon 2025"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            {...register('description')}
            className="input-field"
            rows="3"
            placeholder="Tell us about this event..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              {...register('date', { required: 'Date is required' })}
              className="input-field"
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time *
            </label>
            <input
              type="time"
              {...register('time', { required: 'Time is required' })}
              className="input-field"
            />
            {errors.time && (
              <p className="mt-1 text-sm text-red-600">{errors.time.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Venue *
          </label>
          <input
            {...register('venue', { required: 'Venue is required' })}
            className="input-field"
            placeholder="e.g., IBM India Office"
          />
          {errors.venue && (
            <p className="mt-1 text-sm text-red-600">{errors.venue.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Venue Address
          </label>
          <textarea
            {...register('venue_address')}
            className="input-field"
            rows="2"
            placeholder="Full address..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Google Maps Link
          </label>
          <input
            {...register('venue_map_link')}
            className="input-field"
            placeholder="https://maps.google.com/..."
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            {...register('is_active')}
            className="w-4 h-4 text-primary"
          />
          <label className="ml-2 text-sm font-medium text-gray-700">
            Set as Active Event
          </label>
        </div>
      </div>

      {/* Custom Fields - Show for both create and edit */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Registration Fields
          </h3>
          <button
            type="button"
            onClick={addField}
            className="btn-secondary text-sm flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>Add Field</span>
          </button>
        </div>

        <p className="text-sm text-gray-600">
          Email and Phone are mandatory by default. Add additional fields as needed.
          {isEditing && (
            <span className="block text-amber-600 mt-1">
              ⚠️ Note: Changing fields will not affect existing registrations.
            </span>
          )}
        </p>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="card bg-gray-50 border-2 border-gray-200">
                <div className="flex items-start space-x-4">
                  <div className="flex flex-col items-center space-y-1 pt-2">
                    <button
                      type="button"
                      onClick={() => index > 0 && move(index, index - 1)}
                      disabled={index === 0}
                      className={`p-1 rounded ${index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200'}`}
                      title="Move up"
                    >
                      ▲
                    </button>
                    <GripVertical className="w-5 h-5 text-gray-400" />
                    <button
                      type="button"
                      onClick={() => index < fields.length - 1 && move(index, index + 1)}
                      disabled={index === fields.length - 1}
                      className={`p-1 rounded ${index === fields.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200'}`}
                      title="Move down"
                    >
                      ▼
                    </button>
                  </div>

                  <div className="flex-1 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Field Label (shown to user)
                      </label>
                      <input
                        {...register(`fields.${index}.field_label`, {
                          required: 'Field label is required',
                        })}
                        className="input-field"
                        placeholder="e.g., GitHub Profile URL"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Identifier will be auto-generated: {watch(`fields.${index}.field_label`) ? generateFieldName(watch(`fields.${index}.field_label`)) : 'field_name'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Field Type
                        </label>
                        <select
                          {...register(`fields.${index}.field_type`)}
                          className="input-field"
                        >
                          {FIELD_TYPES.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Options (for select/radio, comma-separated)
                        </label>
                        <input
                          {...register(`fields.${index}.field_options`)}
                          className="input-field"
                          placeholder="Option 1, Option 2, Option 3"
                        />
                      </div>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        {...register(`fields.${index}.is_required`)}
                        className="w-4 h-4 text-primary"
                      />
                      <label className="ml-2 text-sm font-medium text-gray-700">
                        Required Field
                      </label>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="p-2 hover:bg-red-100 rounded-lg text-red-600"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-4 pt-4 border-t">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button
          type="submit"
          disabled={createMutation.isPending || updateMutation.isPending}
          className="btn-primary"
        >
          {createMutation.isPending || updateMutation.isPending
            ? 'Saving...'
            : isEditing
            ? 'Update Event'
            : 'Create Event'}
        </button>
      </div>
    </form>
  );
}
