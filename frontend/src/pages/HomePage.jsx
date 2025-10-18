import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { eventsApi, registrationsApi } from '../services/api';
import { ExternalLink, Sparkles, CheckCircle2, ArrowRight } from '../components/SimpleIcons';
import { getThemeConfig } from '../config/themes';
import { useBranding } from '../contexts/BrandingContext';
import { PureWhiteBackground } from '../components/PureWhiteBackground';

// Lazy load Midnight Black theme (includes framer-motion)
const MidnightBlackTheme = lazy(() => import('../components/themes/MidnightBlackTheme'));

export default function HomePage() {
  const navigate = useNavigate();
  const [autoFillAttempted, setAutoFillAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successState, setSuccessState] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm();

  // Fetch active event
  const { data: event, isLoading, error } = useQuery({
    queryKey: ['activeEvent'],
    queryFn: async () => {
      const response = await eventsApi.getActive();
      return response.data;
    },
    retry: false,
  });

  // Get branding from context (already preloaded at app level - no theme flash!)
  const branding = useBranding();
  const theme = branding?.theme || 'pure_white';
  const themeConfig = getThemeConfig(theme);

  // Watch email and phone for auto-fill
  const emailValue = watch('email');
  const phoneValue = watch('phone');

  // Auto-fill mutation
  const autoFillMutation = useMutation({
    mutationFn: async ({ email, phone }) => {
      const response = await registrationsApi.getProfile(email, phone);
      return response.data;
    },
    onSuccess: (data) => {
      // Auto-fill form with profile data
      Object.keys(data.profile_data).forEach((key) => {
        setValue(key, data.profile_data[key]);
      });
      toast.success('✨ Form auto-filled with your previous information!', {
        icon: '🎯',
        duration: 3000,
      });
    },
    onError: () => {
      // Silent fail for auto-fill
    },
  });

  // Trigger auto-fill when email or phone is entered
  useEffect(() => {
    if (!autoFillAttempted && (emailValue || phoneValue)) {
      const timer = setTimeout(() => {
        if (emailValue || phoneValue) {
          autoFillMutation.mutate({ email: emailValue, phone: phoneValue });
          setAutoFillAttempted(true);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [emailValue, phoneValue]);

  // Registration mutation
  const registrationMutation = useMutation({
    mutationFn: async (data) => {
      const response = await registrationsApi.create({
        event_id: event.id,
        email: data.email,
        phone: data.phone,
        form_data: data,
      });
      return response.data;
    },
    onSuccess: (registration) => {
      setSuccessState(true);
      setTimeout(() => {
        navigate('/thank-you', {
          state: {
            event,
            registration,
          },
        });
      }, 1500);
    },
    onError: (error) => {
      const message = error.response?.data?.detail || 'Failed to register. Please try again.';
      toast.error(message);
      setIsSubmitting(false);
    },
  });

  // Redirect if no active event
  if (error && error.response?.status === 404) {
    navigate('/no-events');
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-purple-950 dark:via-blue-950 dark:to-pink-950 transition-colors duration-300">
        <div className="text-center fade-in">
          <div className="w-16 h-16 border-4 border-purple-500 dark:border-purple-400 border-t-transparent rounded-full mx-auto dark:shadow-lg dark:shadow-purple-500/30 animate-spin" />
          <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium fade-in-delay-100">
            Loading event...
          </p>
        </div>
      </div>
    );
  }

  if (!event) return null;

  const onSubmit = (data) => {
    setIsSubmitting(true);
    registrationMutation.mutate(data);
  };

  // Pure White Theme (Default - Fast and Clean)
  if (theme === 'pure_white' || !theme) {
    return (
      <div className={`${themeConfig.containerClass} theme-pure-white`}>
        <PureWhiteBackground />

        <div className="w-full max-w-md relative z-10 pb-20 fade-in-up">
          <div className="mb-12 text-center fade-in-delay-100">
            {branding?.logo_url ? (
              <div className="inline-block mb-6">
                <img src={branding.logo_url} alt="Logo" className="h-10 mx-auto object-contain" />
              </div>
            ) : (
              <div className="inline-block mb-6">
                <Sparkles className="w-10 h-10 text-blue-600" strokeWidth={1.5} />
              </div>
            )}
            <h1 className="mb-3 text-gray-900">
              {branding?.site_title || 'MagPie'}
            </h1>
            <p className="text-gray-600">
              {branding?.site_headline || 'Where Innovation Meets Community'}
            </p>
          </div>

          <div className="mb-8 fade-in-delay-200">
            <h2 className="text-gray-900 mb-2">{event.name}</h2>
            {event.description && (
              <p className="text-gray-600 text-sm">{event.description}</p>
            )}
            <div className="mt-4 space-y-2 text-sm">
              <p className="text-gray-700">📅 {event.date} • ⏰ {event.time}</p>
              <p className="text-gray-700">📍 {event.venue}</p>
              {event.venue_map_link && (
                <a
                  href={event.venue_map_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors duration-200 underline underline-offset-2"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  View on Google Maps
                </a>
              )}
            </div>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6 fade-in-delay-300"
          >
            <div>
              <label htmlFor="email" className={themeConfig.labelClass}>
                Email Address
              </label>
              <input
                id="email"
                type="email"
                {...register('email', { required: 'Email is required' })}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                placeholder="you@example.com"
                className={themeConfig.inputClass}
                required
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 font-medium fade-in">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className={themeConfig.labelClass}>
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                {...register('phone', {
                  required: 'Phone is required',
                  pattern: {
                    value: /^\d{10}$/,
                    message: 'Phone must be 10 digits',
                  },
                })}
                onFocus={() => setFocusedField('phone')}
                onBlur={() => setFocusedField(null)}
                placeholder="1234567890"
                className={themeConfig.inputClass}
                required
              />
              {errors.phone && (
                <p className="mt-2 text-sm text-red-600 font-medium fade-in">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Dynamic fields */}
            {event.fields && event.fields.length > 0 && (
              <>
                {event.fields.map((field, index) => (
                  <div key={field.id}>
                    <label htmlFor={field.field_name} className={themeConfig.labelClass}>
                      {field.field_label} {field.is_required && '*'}
                    </label>

                    {field.field_type === 'textarea' ? (
                      <textarea
                        id={field.field_name}
                        {...register(field.field_name, {
                          required: field.is_required ? `${field.field_label} is required` : false,
                        })}
                        onFocus={() => setFocusedField(field.field_name)}
                        onBlur={() => setFocusedField(null)}
                        className={themeConfig.inputClass}
                        rows="4"
                      />
                    ) : field.field_type === 'select' ? (
                      <select
                        id={field.field_name}
                        {...register(field.field_name, {
                          required: field.is_required ? `${field.field_label} is required` : false,
                        })}
                        onFocus={() => setFocusedField(field.field_name)}
                        onBlur={() => setFocusedField(null)}
                        className={themeConfig.inputClass}
                      >
                        <option value="">Select...</option>
                        {field.field_options &&
                          JSON.parse(field.field_options).map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                      </select>
                    ) : field.field_type === 'checkbox' ? (
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={field.field_name}
                          {...register(field.field_name)}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </div>
                    ) : (
                      <input
                        type={field.field_type}
                        id={field.field_name}
                        {...register(field.field_name, {
                          required: field.is_required ? `${field.field_label} is required` : false,
                        })}
                        onFocus={() => setFocusedField(field.field_name)}
                        onBlur={() => setFocusedField(null)}
                        className={themeConfig.inputClass}
                      />
                    )}

                    {errors[field.field_name] && (
                      <p className="mt-2 text-sm text-red-600 font-medium fade-in">
                        {errors[field.field_name].message}
                      </p>
                    )}
                  </div>
                ))}
              </>
            )}

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={successState ? 'success-button w-full h-14 mt-8 transition-all duration-200 rounded-xl font-semibold bg-green-600 text-white' : themeConfig.buttonClass}
              >
                {successState ? (
                  <span className="flex items-center justify-center space-x-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Success!</span>
                  </span>
                ) : isSubmitting ? (
                  <span className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Registering...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <span>Continue</span>
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </button>
            </div>
          </form>

        </div>

        {/* Footer for Pure White theme */}
        <footer className="absolute bottom-8 left-0 right-0 text-center z-10 fade-in-delay-300">
          <p className="text-sm text-gray-500">
            Made with{' '}
            <span className="text-red-500 inline-block">❤️</span>{' '}
            at{' '}
            <a
              href="https://build2learn.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 underline underline-offset-2"
            >
              Build2Learn
            </a>
          </p>
        </footer>
      </div>
    );
  }

  // Midnight Black Theme (Lazy-loaded to avoid loading framer-motion for Pure White theme)
  if (theme === 'midnight_black') {
    return (
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="animate-spin w-16 h-16 border-4 border-white/20 border-t-white rounded-full"></div>
        </div>
      }>
        <MidnightBlackTheme
          event={event}
          branding={branding}
          themeConfig={themeConfig}
          register={register}
          handleSubmit={handleSubmit}
          errors={errors}
          watch={watch}
          setValue={setValue}
          focusedField={focusedField}
          setFocusedField={setFocusedField}
          isSubmitting={isSubmitting}
          successState={successState}
          onSubmit={onSubmit}
        />
      </Suspense>
    );
  }

  // Fallback to Pure White for any unknown theme
  return <HomePage />;
}
