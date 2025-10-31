import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeSelector } from "@/components/ThemeSelector";
import { brandingApi } from '../services/api';

// Icons (inline SVG)
const ImageIcon = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const SaveIcon = ({ className = "h-4 w-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

const InfoIcon = ({ className = "h-4 w-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

export default function BrandingSettings() {
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm();

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
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
            <ImageIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <CardTitle>Branding Settings</CardTitle>
            <CardDescription>Customize the appearance of your registration page</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Site Title */}
          <div className="space-y-2">
            <Label htmlFor="site_title">Site Title *</Label>
            <Input
              id="site_title"
              {...register('site_title', { required: 'Site title is required' })}
              placeholder="e.g., MagPie"
              className={errors.site_title ? 'border-destructive' : ''}
            />
            {errors.site_title && (
              <p className="text-sm text-destructive">{errors.site_title.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              This will be displayed as the main title on the registration page
            </p>
          </div>

          {/* Site Headline */}
          <div className="space-y-2">
            <Label htmlFor="site_headline">Site Headline *</Label>
            <Input
              id="site_headline"
              {...register('site_headline', { required: 'Site headline is required' })}
              placeholder="e.g., Where Innovation Meets Community"
              className={errors.site_headline ? 'border-destructive' : ''}
            />
            {errors.site_headline && (
              <p className="text-sm text-destructive">{errors.site_headline.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              This will be displayed as the tagline below the title
            </p>
          </div>

          {/* Logo URL */}
          <div className="space-y-2">
            <Label htmlFor="logo_url">Logo URL (Optional)</Label>
            <Input
              id="logo_url"
              type="url"
              {...register('logo_url')}
              placeholder="https://example.com/logo.png"
              className={errors.logo_url ? 'border-destructive' : ''}
            />
            {errors.logo_url && (
              <p className="text-sm text-destructive">{errors.logo_url.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Enter a URL to an image that will be displayed above the title. Leave empty to show no logo.
            </p>
          </div>

          {/* Theme Selector */}
          <ThemeSelector
            value={watch('theme')}
            onChange={(value) => setValue('theme', value)}
            label="Theme *"
          />
          <p className="text-xs text-muted-foreground -mt-4">
            Choose the overall theme for your registration page. Visitors can toggle between light and dark modes.
          </p>

          {/* Info Alert */}
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              <strong>Preview:</strong> Changes will be reflected on the registration page immediately after saving.
            </AlertDescription>
          </Alert>

          {/* Submit Button */}
          <div className="flex items-center justify-end pt-4 border-t">
            <Button
              type="submit"
              disabled={updateMutation.isPending}
            >
              <SaveIcon className="h-4 w-4 mr-2" />
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
