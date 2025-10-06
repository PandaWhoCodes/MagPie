import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { brandingApi } from '../services/api';
import { Save, Image } from 'lucide-react';

export default function BrandingSettings() {
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  // Fetch branding settings
  const { data: branding, isLoading } = useQuery({
    queryKey: ['branding'],
    queryFn: async () => {
      const response = await brandingApi.get();
      return response.data;
    },
  });

  // Reset form when branding data is loaded
  useEffect(() => {
    if (branding) {
      reset(branding);
    }
  }, [branding, reset]);

  // Update branding mutation
  const updateMutation = useMutation({
    mutationFn: (data) => brandingApi.update(data),
    onSuccess: () => {
      toast.success('Branding settings updated successfully!');
      queryClient.invalidateQueries(['branding']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to update branding settings');
    },
  });

  const onSubmit = (data) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="card">
        <p className="text-gray-600">Loading branding settings...</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
          <Image className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Branding Settings</h2>
          <p className="text-sm text-gray-600">Customize the appearance of your registration page</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Site Title
          </label>
          <input
            {...register('site_title', { required: 'Site title is required' })}
            className="input-field"
            placeholder="e.g., Build2Learn"
          />
          {errors.site_title && (
            <p className="mt-1 text-sm text-red-600">{errors.site_title.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            This will be displayed as the main title on the registration page
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Site Headline
          </label>
          <input
            {...register('site_headline', { required: 'Site headline is required' })}
            className="input-field"
            placeholder="e.g., Where Innovation Meets Community"
          />
          {errors.site_headline && (
            <p className="mt-1 text-sm text-red-600">{errors.site_headline.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            This will be displayed as the tagline below the title
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Logo URL (Optional)
          </label>
          <input
            {...register('logo_url')}
            className="input-field"
            placeholder="https://example.com/logo.png"
            type="url"
          />
          {errors.logo_url && (
            <p className="mt-1 text-sm text-red-600">{errors.logo_url.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Enter a URL to an image that will be displayed above the title. Leave empty to show no logo.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Theme
          </label>
          <select
            {...register('theme')}
            className="input-field"
          >
            <option value="default">Default (Colorful Gradients)</option>
            <option value="midnight_black">Midnight Black (Sleek Dark)</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Choose the overall theme for your registration page
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Text Style
          </label>
          <select
            {...register('text_style')}
            className="input-field"
          >
            <option value="gradient">Gradient (Colorful)</option>
            <option value="shimmer">Shimmer Effect</option>
            <option value="animated-gradient">Animated Gradient</option>
            <option value="shine">Shine Effect</option>
            <option value="glitch">Glitch Effect</option>
            <option value="neon">Neon Glow</option>
            <option value="wave">Wave Motion</option>
            <option value="rainbow">Rainbow Gradient</option>
            <option value="glitter">Glitter Sparkle</option>
            <option value="shadow-3d">3D Shadow</option>
            <option value="blur-focus">Blur to Focus</option>
            <option value="fire">Fire Flame</option>
            <option value="metallic">Metallic Shine</option>
            <option value="plain">Plain Text</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Choose how the site title should be styled on the registration page
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>💡 Preview:</strong> Changes will be reflected on the registration page immediately after saving.
          </p>
        </div>

        <div className="flex items-center justify-end pt-4 border-t">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="btn-primary flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{updateMutation.isPending ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
