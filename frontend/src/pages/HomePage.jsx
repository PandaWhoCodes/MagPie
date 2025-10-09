import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { eventsApi, registrationsApi, brandingApi } from '../services/api';
import { Calendar, Clock, MapPin, ExternalLink, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import StylizedText from '../components/StylizedText';
import Footer from '../components/Footer';
import ThemeToggle from '../components/ThemeToggle';
import { AnimatedBackground } from '../components/themes/AnimatedBackground';
import { getThemeConfig } from '../config/themes';

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

  // Fetch branding settings
  const { data: branding } = useQuery({
    queryKey: ['branding'],
    queryFn: async () => {
      const response = await brandingApi.get();
      console.log('Branding API response:', response.data);
      return response.data;
    },
    staleTime: 0,
    cacheTime: 0,
    retry: false,
  });

  const theme = branding?.theme || 'default';
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
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-purple-500 dark:border-purple-400 border-t-transparent rounded-full mx-auto dark:shadow-lg dark:shadow-purple-500/30"
          />
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-gray-600 dark:text-gray-400 font-medium"
          >
            Loading event...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (!event) return null;

  const onSubmit = (data) => {
    setIsSubmitting(true);
    registrationMutation.mutate(data);
  };

  // Midnight Black Theme
  if (theme === 'midnight_black') {
    return (
      <div className={`${themeConfig.containerClass} theme-midnight-black`}>
        {/* No dark mode toggle for Midnight Black theme */}
        <AnimatedBackground theme="midnight_black" />

        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md relative z-10 pb-20"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-12 text-center"
            >
              {branding?.logo_url ? (
                <motion.div
                  animate={{
                    rotate: [0, 8, -8, 0],
                    scale: [1, 1.05, 1.05, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 4,
                    ease: "easeInOut"
                  }}
                  className="inline-block mb-6"
                >
                  <img src={branding.logo_url} alt="Logo" className="h-10 mx-auto object-contain opacity-80" />
                </motion.div>
              ) : (
                <motion.div
                  animate={{
                    rotate: [0, 8, -8, 0],
                    scale: [1, 1.05, 1.05, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 4,
                    ease: "easeInOut"
                  }}
                  className="inline-block mb-6"
                >
                  <Sparkles className="w-10 h-10 text-white/80" strokeWidth={1.5} />
                </motion.div>
              )}
              <h1 className="mb-3 text-white">
                {branding?.site_title || 'MagPie'}
              </h1>
              <p className="text-white/50">
                {branding?.site_headline || 'Where Innovation Meets Community'}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mb-8"
            >
              <h2 className="text-white mb-2">{event.name}</h2>
              {event.description && (
                <p className="text-white/50 text-sm">{event.description}</p>
              )}
              <div className="mt-4 space-y-2 text-sm">
                <p className="text-white/70">📅 {event.date} • ⏰ {event.time}</p>
                <p className="text-white/70">📍 {event.venue}</p>
                {event.venue_map_link && (
                  <a
                    href={event.venue_map_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-white/60 hover:text-white/90 transition-colors duration-300 underline underline-offset-2"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    View on Google Maps
                  </a>
                )}
              </div>
            </motion.div>

            <motion.form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <motion.div
                animate={{
                  scale: focusedField === 'email' ? 1.01 : 1,
                }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
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
                <AnimatePresence>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-2 text-sm text-red-600 font-medium"
                    >
                      {errors.email.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div
                animate={{
                  scale: focusedField === 'phone' ? 1.01 : 1,
                }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
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
                <AnimatePresence>
                  {errors.phone && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-2 text-sm text-red-600 font-medium"
                    >
                      {errors.phone.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Dynamic fields */}
              {event.fields && event.fields.length > 0 && (
                <>
                  {event.fields.map((field, index) => (
                    <motion.div
                      key={field.id}
                      animate={{
                        scale: focusedField === field.field_name ? 1.01 : 1,
                      }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
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
                            className="w-5 h-5 text-purple-600 border-white/10 rounded focus:ring-purple-500 bg-white/5"
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

                      <AnimatePresence>
                        {errors[field.field_name] && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mt-2 text-sm text-red-600 font-medium"
                          >
                            {errors[field.field_name].message}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </>
              )}

              <motion.div
                whileHover={{ scale: !isSubmitting && !successState ? 1.01 : 1 }}
                whileTap={{ scale: !isSubmitting && !successState ? 0.99 : 1 }}
              >
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={successState ? 'success-button w-full h-14 mt-8 transition-all duration-300 rounded-xl font-bold' : themeConfig.buttonClass}
                >
                  {successState ? (
                    <span className="flex items-center justify-center space-x-2">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Success!</span>
                    </span>
                  ) : isSubmitting ? (
                    <span className="flex items-center justify-center space-x-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                      />
                      <span>Registering...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <span>Continue</span>
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </button>
              </motion.div>
            </motion.form>

          </motion.div>
        </AnimatePresence>

        {/* Footer for Midnight Black theme */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="absolute bottom-8 left-0 right-0 text-center z-10"
        >
          <p className="text-sm text-white/40">
            Made with{' '}
            <span className="text-red-400 inline-block">❤️</span>{' '}
            at{' '}
            <a
              href="https://build2learn.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white/80 font-medium transition-colors duration-300 underline underline-offset-2"
            >
              Build2Learn
            </a>
          </p>
        </motion.footer>
      </div>
    );
  }

  // Default Theme
  return (
    <div className="min-h-screen relative overflow-hidden transition-colors duration-300">
      {/* Dark mode toggle only for default theme */}
      <ThemeToggle />
      {/* Animated Background */}
      <AnimatedBackground theme="default" />

      {/* Content */}
      <div className="relative z-10 min-h-screen py-12 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Hero Header */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            {/* Logo if provided */}
            {branding?.logo_url ? (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="inline-block mb-4"
              >
                <img
                  src={branding.logo_url}
                  alt="Logo"
                  className="h-20 mx-auto object-contain"
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="inline-block mb-4"
              >
                <Sparkles className="w-12 h-12 text-purple-600 dark:text-purple-400 mx-auto animate-pulse dark:drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
              </motion.div>
            )}

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-4"
            >
              <StylizedText
                text={branding?.site_title || 'MagPie'}
                style={branding?.text_style || 'gradient'}
              />
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-2xl text-gray-600 dark:text-gray-300 font-medium"
            >
              {branding?.site_headline || 'Where Innovation Meets Community'}
            </motion.p>
          </motion.div>

          {/* Event Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="backdrop-blur-lg bg-white/80 dark:bg-gray-900/60 rounded-3xl shadow-2xl dark:shadow-[0_20px_50px_rgba(139,92,246,0.2)] border border-white/20 dark:border-gray-700/30 p-8 md:p-10 mb-8 transition-all duration-300"
          >
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4 bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent"
            >
              {event.name}
            </motion.h2>
            {event.description && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed"
              >
                {event.description}
              </motion.p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { icon: Calendar, label: 'Date', value: event.date },
                { icon: Clock, label: 'Time', value: event.time },
                { icon: MapPin, label: 'Venue', value: event.venue, subvalue: event.venue_address },
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                  className="flex items-start space-x-4 p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 hover:shadow-lg dark:hover:shadow-purple-500/20 transition-all duration-300 group dark:border dark:border-purple-500/20"
                >
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 dark:from-purple-600 dark:to-blue-600 text-white shadow-lg dark:shadow-purple-500/30"
                  >
                    <item.icon className="w-6 h-6" />
                  </motion.div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-gray-100 text-lg">{item.label}</p>
                    <p className="text-gray-700 dark:text-gray-300 font-medium">{item.value}</p>
                    {item.subvalue && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.subvalue}</p>
                    )}
                  </div>
                </motion.div>
              ))}

              {event.venue_map_link && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.5 }}
                  className="flex items-start space-x-4 p-4 rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 hover:shadow-lg dark:hover:shadow-pink-500/20 transition-all duration-300 dark:border dark:border-pink-500/20"
                >
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: -10 }}
                    className="p-3 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 dark:from-pink-600 dark:to-purple-600 text-white shadow-lg dark:shadow-pink-500/30"
                  >
                    <ExternalLink className="w-6 h-6" />
                  </motion.div>
                  <div>
                    <a
                      href={event.venue_map_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 underline decoration-2 underline-offset-4 transition-colors"
                    >
                      View on Google Maps
                    </a>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Registration Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="backdrop-blur-lg bg-white/80 dark:bg-gray-900/60 rounded-3xl shadow-2xl dark:shadow-[0_20px_50px_rgba(59,130,246,0.2)] border border-white/20 dark:border-gray-700/30 p-8 md:p-10 transition-all duration-300"
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex items-center space-x-3 mb-8"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 dark:from-purple-600 dark:to-blue-600 flex items-center justify-center dark:shadow-lg dark:shadow-purple-500/30">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Register Now</h3>
            </motion.div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email and Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                >
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    {...register('email', { required: 'Email is required' })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-4 focus:ring-purple-100 dark:focus:ring-purple-900/50 transition-all duration-300 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 font-medium placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="your@email.com"
                  />
                  <AnimatePresence>
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-2 text-sm text-red-600 font-medium"
                      >
                        {errors.email.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                >
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    {...register('phone', {
                      required: 'Phone is required',
                      pattern: {
                        value: /^\d{10}$/,
                        message: 'Phone must be 10 digits',
                      },
                    })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-4 focus:ring-purple-100 dark:focus:ring-purple-900/50 transition-all duration-300 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 font-medium placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="1234567890"
                  />
                  <AnimatePresence>
                    {errors.phone && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-2 text-sm text-red-600 font-medium"
                      >
                        {errors.phone.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* Dynamic fields */}
              {event.fields && event.fields.length > 0 && (
                <div className="space-y-6">
                  {event.fields.map((field, index) => (
                    <motion.div
                      key={field.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                    >
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        {field.field_label} {field.is_required && '*'}
                      </label>

                      {field.field_type === 'textarea' ? (
                        <textarea
                          {...register(field.field_name, {
                            required: field.is_required ? `${field.field_label} is required` : false,
                          })}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-4 focus:ring-purple-100 dark:focus:ring-purple-900/50 transition-all duration-300 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 font-medium placeholder-gray-400 dark:placeholder-gray-500"
                          rows="4"
                        />
                      ) : field.field_type === 'select' ? (
                        <select
                          {...register(field.field_name, {
                            required: field.is_required ? `${field.field_label} is required` : false,
                          })}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-4 focus:ring-purple-100 dark:focus:ring-purple-900/50 transition-all duration-300 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 font-medium"
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
                            {...register(field.field_name)}
                            className="w-5 h-5 text-purple-600 dark:text-purple-400 border-gray-300 dark:border-gray-600 rounded focus:ring-purple-500 dark:focus:ring-purple-400 dark:bg-gray-800"
                          />
                        </div>
                      ) : (
                        <input
                          type={field.field_type}
                          {...register(field.field_name, {
                            required: field.is_required ? `${field.field_label} is required` : false,
                          })}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-4 focus:ring-purple-100 dark:focus:ring-purple-900/50 transition-all duration-300 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 font-medium placeholder-gray-400 dark:placeholder-gray-500"
                        />
                      )}

                      <AnimatePresence>
                        {errors[field.field_name] && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mt-2 text-sm text-red-600 font-medium"
                          >
                            {errors[field.field_name].message}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                className={`relative w-full py-4 rounded-xl text-lg font-bold text-white overflow-hidden transition-all duration-300 ${
                  successState
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-600 dark:to-emerald-600 dark:shadow-[0_10px_30px_rgba(16,185,129,0.3)]'
                    : 'bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 dark:from-purple-500 dark:via-blue-500 dark:to-pink-500 hover:shadow-2xl dark:hover:shadow-[0_10px_40px_rgba(139,92,246,0.4)]'
                } dark:border dark:border-purple-500/20`}
              >
                <AnimatePresence mode="wait">
                  {successState ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center justify-center space-x-2"
                    >
                      <CheckCircle2 className="w-6 h-6" />
                      <span>Success!</span>
                    </motion.div>
                  ) : isSubmitting ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center space-x-2"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      <span>Registering...</span>
                    </motion.div>
                  ) : (
                    <motion.span
                      key="default"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      Register for Event
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Shine effect */}
                {!isSubmitting && !successState && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
                    animate={{
                      x: ['-100%', '100%'],
                      opacity: [0, 0.3, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3,
                    }}
                  />
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
